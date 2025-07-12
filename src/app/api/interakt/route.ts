/* ----------------------------------------------------------------
   Interakt webhook – v2  (media download + S3 upload working)
   ---------------------------------------------------------------- */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import { v4 as uuidv4 } from 'uuid';

import { uploadToS3 } from '@/lib/s3';
import { fetchWaAsset } from '@/lib/interakt';
import AutoReply from '@/models/AutoReply';
import Workflow from '@/models/Workflow';
import WorkflowEngine from '@/lib/workflowEngine';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;

/* ---------- hub challenge ------------------------------------------------ */

export async function GET(req: NextRequest) {
  const challenge = new URL(req.url).searchParams.get('hub.challenge');
  return new Response(challenge ?? 'OK', { status: 200 });
}

/* ---------- webhook ------------------------------------------------------ */

export async function POST(req: NextRequest) {
  await dbConnect();

  const raw = await req.text();
  console.log('Interakt webhook received:', raw);

  const body = JSON.parse(raw);
  const value = body?.entry?.[0]?.changes?.[0]?.value ?? {};

  if (value.messaging_product === 'whatsapp' && value.messages) {
    await processIncomingMessages(value);
  }

  // Add this block to process status updates
  if (value.messaging_product === 'whatsapp' && value.statuses) {
    await processStatusUpdates(value);
  }

  /* status-callbacks, onboarding events … (unchanged / optional) */

  return NextResponse.json({ received: true });
}

/* ---------- helpers ----------------------------------------------------- */

async function processIncomingMessages(v: any) {
  const phoneNumberId = v.metadata?.phone_number_id;
  if (!phoneNumberId) return;

  const user = await User.findOne({ 'wabaAccounts.phoneNumberId': phoneNumberId });
  if (!user) return;

  const wabaAcc = user.wabaAccounts.find((a: any) => a.phoneNumberId === phoneNumberId);
  if (!wabaAcc) return;

  for (const m of v.messages) {
    try {
      await processMessage(m, v.contacts ?? [], user._id, wabaAcc);
    } catch (err) {
      console.error('processMessage error', err);
    }
  }
}


// Add this new function to process status updates
async function processStatusUpdates(v: any) {
  if (!v.statuses || !v.statuses.length) return;

  const phoneNumberId = v.metadata?.phone_number_id;
  if (!phoneNumberId) return;

  // Process each status update
  for (const status of v.statuses) {
    try {
      const whatsappMessageId = status.id;
      const statusValue = status.status; // 'sent', 'delivered', 'read', etc.
      const timestamp = new Date(parseInt(status.timestamp) * 1000);

      console.log(`Processing status update: ${whatsappMessageId} => ${statusValue}`);

      // Find the conversation with this message
      const conversation = await Conversation.findOne({
        "messages.whatsappMessageId": whatsappMessageId
      });

      if (conversation) {
        // Update the message status in the conversation
        const updatedConversation = await Conversation.findOneAndUpdate(
          {
            _id: conversation._id,
            "messages.whatsappMessageId": whatsappMessageId
          },
          {
            $set: {
              "messages.$.status": statusValue,
              "messages.$.timestamp": timestamp // Update the timestamp if needed
            }
          },
          { new: true }
        );

        console.log(`Updated message status to ${statusValue} for message ${whatsappMessageId}`);
      } else {
        console.log(`Could not find conversation with message ID: ${whatsappMessageId}`);
      }
    } catch (err) {
      console.error('Error processing status update:', err);
    }
  }
}

async function processMessage(
  m: any,
  contacts: any[],
  userId: string,
  wabaAcc: any,
) {
  /* ---- sender + timestamps ------------------------------------------- */

  const waId = m.from;
  const senderPhone = waId.replace(/^\+?/, '');
  const ts = new Date(+m.timestamp * 1000);

  /* ---- contact ------------------------------------------------------- */

  let contact = await Contact.findOne({
    $or: [
      { phone: senderPhone },
      { phone: `+${senderPhone}` },
      { phone: senderPhone.slice(-10) },
      { phone: `+${senderPhone.slice(-10)}` },
    ],
    wabaId: wabaAcc.wabaId,
  });

  if (!contact) {
    const waContact = contacts.find((c: any) => c.wa_id === waId);
    contact = await Contact.create({
      name: waContact?.profile?.name || `+${senderPhone}`,
      phone: `+${senderPhone}`,
      wabaId: wabaAcc.wabaId,
      phoneNumberId: wabaAcc.phoneNumberId,
      userId,
      whatsappOptIn: true,
      lastMessageAt: ts,
    });
  } else {
    contact.lastMessageAt = ts;
    contact.whatsappOptIn = true;
    await contact.save();
  }

  /* ---- new message object ------------------------------------------- */

  const newMsg: any = {
    id: uuidv4(),
    senderId: 'customer',
    timestamp: ts,
    status: 'delivered',
    whatsappMessageId: m.id,
  };

  /* ---- content / media ---------------------------------------------- */

  switch (m.type) {
    case 'text': {
      newMsg.messageType = 'text';
      newMsg.content = m.text?.body ?? '';
      break;
    }

    /* inside processMessage() switch */
    case 'image':
    case 'video':
    case 'audio':
    case 'document': {
      const mediaId = m[m.type].id;

      /* ① download via Interakt (now passes both IDs) */
      const asset = await fetchWaAsset(
        wabaAcc.phoneNumberId,   // path part
        wabaAcc.wabaId,          // header part
        mediaId,
      );

      /* ② push to S3 (no ACL) */
      const s3Url = await uploadToS3(
        asset.buf,
        asset.mime,
        `wa/${m.type}`,
        asset.name ?? `${mediaId}.${asset.mime.split('/')[1]}`,
      );

      newMsg.messageType = m.type;
      newMsg.mediaId = mediaId;
      newMsg.mediaUrl = s3Url;
      newMsg.mimeType = asset.mime;
      newMsg.fileName = asset.name;
      newMsg.mediaCaption = m[m.type]?.caption || asset.name || '';
      newMsg.content = newMsg.mediaCaption || m.type;
      break;
    }

    default:
      newMsg.messageType = 'text';
      newMsg.content = `Unsupported WA type: ${m.type}`;
  }

  /* ---- conversation upsert ------------------------------------------ */

  let conv = await Conversation.findOne({ contactId: contact._id });
  if (!conv) {
    conv = new Conversation({
      contactId: contact._id,
      wabaId: wabaAcc.wabaId,
      phoneNumberId: wabaAcc.phoneNumberId,
      userId,
      messages: [],
      unreadCount: 0,
      status: 'active',
      isWithin24Hours: true,
    });
  }

  conv.messages.push(newMsg);
  conv.lastMessage = newMsg.content;
  conv.lastMessageType = newMsg.messageType;
  conv.lastMessageAt = ts;
  conv.unreadCount = (conv.unreadCount ?? 0) + 1;
  conv.isWithin24Hours = ts.getTime() > Date.now() - 86_400_000;

  await conv.save();


  // Check for auto replies (only for text messages from customers)
  if (newMsg.messageType === 'text' && newMsg.senderId === 'customer') {
    await checkAndSendAutoReply(newMsg.content, contact, wabaAcc, userId);
  }

  // Check for workflow triggers (only for text messages from customers)
  if (newMsg.messageType === 'text' && newMsg.senderId === 'customer') {
    await checkAndTriggerWorkflows(newMsg.content, contact, wabaAcc, userId);
  }

}

// Add this function after the existing helper functions
async function checkAndTriggerWorkflows(
  messageContent: string,
  contact: any,
  wabaAcc: any,
  userId: string
) {
  try {
    // Get all active workflows for this WABA
    const workflows = await Workflow.find({
      userId,
      wabaId: wabaAcc.wabaId,
      isActive: true
    });

    if (!workflows.length) return;

    const workflowEngine = WorkflowEngine.getInstance();

    // Check each workflow for trigger conditions
    for (const workflow of workflows) {
      const triggerNode = workflow.nodes.find((node: any) => node.type === 'trigger');
      if (!triggerNode) continue;

      // Check if message matches trigger conditions
      const shouldTrigger = workflow.triggers.some((trigger: string) =>
        messageContent.toLowerCase().includes(trigger.toLowerCase())
      );

      if (shouldTrigger) {
        console.log(`Triggering workflow: ${workflow.name} for contact: ${contact.phone}`);

        await workflowEngine.triggerWorkflow(
          workflow._id.toString(),
          contact._id.toString(),
          {
            messageContent,
            contactPhone: contact.phone,
            contactName: contact.name,
            timestamp: new Date()
          }
        );

        // Only trigger first matching workflow
        break;
      }
    }
  } catch (error) {
    console.error('Error checking workflows:', error);
  }
}

// New function to handle auto replies
async function checkAndSendAutoReply(
  messageContent: string,
  contact: any,
  wabaAcc: any,
  userId: string
) {
  try {
    // Get all active auto replies for this WABA, sorted by priority
    const autoReplies = await AutoReply.find({
      userId,
      wabaId: wabaAcc.wabaId,
      isActive: true
    }).sort({ priority: -1, createdAt: 1 });

    if (!autoReplies.length) return;

    // Check each auto reply for matches
    for (const autoReply of autoReplies) {
      const isMatch = checkTriggerMatch(messageContent, autoReply);

      if (isMatch) {
        console.log(`Auto reply triggered: ${autoReply.name} for message: "${messageContent}"`);

        // Send the auto reply
        await sendAutoReplyMessage(contact, autoReply, wabaAcc);

        // Update usage statistics
        autoReply.usageCount = (autoReply.usageCount || 0) + 1;
        autoReply.lastTriggered = new Date();
        await autoReply.save();

        // Only send one auto reply per message (first match wins)
        break;
      }
    }
  } catch (error) {
    console.error('Error processing auto reply:', error);
  }
}

function checkTriggerMatch(messageContent: string, autoReply: any): boolean {
  const content = autoReply.caseSensitive ? messageContent : messageContent.toLowerCase();

  return autoReply.triggers.some((trigger: string) => {
    const triggerText = autoReply.caseSensitive ? trigger : trigger.toLowerCase();

    switch (autoReply.matchType) {
      case 'exact':
        return content === triggerText;
      case 'starts_with':
        return content.startsWith(triggerText);
      case 'ends_with':
        return content.endsWith(triggerText);
      case 'contains':
      default:
        return content.includes(triggerText);
    }
  });
}

async function sendAutoReplyMessage(contact: any, autoReply: any, wabaAcc: any) {
  try {
    let phoneNumber = contact.phone;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    let whatsappPayload;

    if (autoReply.replyType === 'template') {
      whatsappPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "template",
        template: {
          name: autoReply.templateName,
          language: {
            code: autoReply.templateLanguage || 'en'
          }
        }
      };

      if (autoReply.templateComponents?.length) {
        (whatsappPayload.template as any).components = autoReply.templateComponents;
      }
    } else {
      whatsappPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "text",
        text: {
          preview_url: false,
          body: autoReply.replyMessage
        }
      };
    }

    console.log('Sending auto reply:', JSON.stringify(whatsappPayload, null, 2));

    const response = await fetch(
      `https://amped-express.interakt.ai/api/v17.0/${wabaAcc.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'x-access-token': INT_TOKEN!,
          'x-waba-id': wabaAcc.wabaId,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(whatsappPayload)
      }
    );

    const responseText = await response.text();
    console.log('Auto reply response:', responseText);

    if (response.ok) {
      // Record the auto reply in the conversation
      const responseData = JSON.parse(responseText);
      await recordAutoReplyInConversation(
        contact,
        autoReply,
        responseData.messages?.[0]?.id
      );
    } else {
      console.error('Failed to send auto reply:', responseText);
    }

  } catch (error) {
    console.error('Error sending auto reply message:', error);
  }
}

async function recordAutoReplyInConversation(
  contact: any,
  autoReply: any,
  whatsappMessageId?: string
) {
  try {
    const conversation = await Conversation.findOne({ contactId: contact._id });
    if (!conversation) return;

    const messageContent = autoReply.replyType === 'template'
      ? `Template: ${autoReply.templateName}`
      : autoReply.replyMessage;

    const autoReplyMessage = {
      id: uuidv4(),
      senderId: 'agent' as const,
      content: messageContent,
      messageType: autoReply.replyType,
      timestamp: new Date(),
      status: 'sent' as const,
      whatsappMessageId,
      senderName: 'Auto Reply',
      templateName: autoReply.replyType === 'template' ? autoReply.templateName : undefined
    };

    conversation.messages.push(autoReplyMessage);
    conversation.lastMessage = messageContent;
    conversation.lastMessageType = autoReply.replyType;
    conversation.lastMessageAt = new Date();

    await conversation.save();
    console.log('Auto reply recorded in conversation');

  } catch (error) {
    console.error('Error recording auto reply in conversation:', error);
  }

}
