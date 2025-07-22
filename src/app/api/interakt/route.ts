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
      const statusValue = status.status;
      const timestamp = new Date(parseInt(status.timestamp) * 1000);

      console.log(`Processing status update: ${whatsappMessageId} => ${statusValue}`);

      // Find the conversation with this message
      const conversation = await Conversation.findOne({
        "messages.whatsappMessageId": whatsappMessageId
      });

      if (conversation) {
        // Find the specific message in the conversation
const messageIndex = conversation.messages.findIndex(
  (msg: any) => msg.whatsappMessageId === whatsappMessageId
);

        if (messageIndex !== -1) {
          // Update the message status
          conversation.messages[messageIndex].status = statusValue;

          // Handle failed messages - add comprehensive error information
          if (statusValue === 'failed') {
            console.log(`❌ Message failed: ${whatsappMessageId}`, status);

            let errorMessage = 'Message delivery failed';
            let errorCode = 'unknown';

            // Check multiple possible error locations in the status object
            if (status.errors && status.errors.length > 0) {
              const error = status.errors[0];
              errorMessage = error.title || error.message || error.details || errorMessage;
              errorCode = error.code?.toString() || error.error_code?.toString() || 'api_error';
            } else if (status.error) {
              // Sometimes error is at root level
              errorMessage = status.error.message || status.error.title || errorMessage;
              errorCode = status.error.code?.toString() || 'api_error';
            } else if (status.error_code) {
              // Direct error code
              errorCode = status.error_code.toString();
              errorMessage = getErrorMessageFromCode(status.error_code);
            }

            conversation.messages[messageIndex].errorMessage = errorMessage;
            conversation.messages[messageIndex].errorCode = errorCode;

            // Increment retry count
            conversation.messages[messageIndex].retryCount =
              (conversation.messages[messageIndex].retryCount || 0) + 1;

            console.log(`Error details saved: ${errorMessage} (${errorCode})`);
          }

          await conversation.save();
          console.log(`Updated message status to ${statusValue} for message ${whatsappMessageId}`);
        } else {
          console.log(`Message not found in conversation: ${whatsappMessageId}`);
        }
      } else {
        console.log(`Could not find conversation with message ID: ${whatsappMessageId}`);

        // For failed messages that we can't find in existing conversations
        if (statusValue === 'failed') {
          await handleOrphanedFailedMessage(status, phoneNumberId);
        }
      }
    } catch (err) {
      console.error('Error processing status update:', err);
    }
  }
}


// Helper function to get user-friendly error messages from error codes
function getErrorMessageFromCode(errorCode: number | string): string {
  const errorMap: { [key: string]: string } = {
    '1': 'Invalid phone number',
    '2': 'Phone number not on WhatsApp',
    '3': 'Message limit exceeded',
    '4': 'Message not delivered',
    '100': 'Invalid parameter',
    '131000': 'Message undeliverable',
    '131005': 'Message not sent - phone number blocked',
    '131014': 'Message not sent - invalid template',
    '131021': 'Message not sent - recipient not available',
    '131026': 'Message not sent - rate limit exceeded',
    '131047': 'Message not sent - re-engagement required',
    '131051': 'Message not sent - unsupported message type',
    '470': 'Message failed due to unknown error',
    '471': 'Message failed due to rate limiting',
    '472': 'Message failed due to policy violation'
  };

  return errorMap[errorCode.toString()] || `Message delivery failed (Error: ${errorCode})`;
}


// Enhanced handleOrphanedFailedMessage function
async function handleOrphanedFailedMessage(status: any, phoneNumberId: string) {
  try {
    console.log(`🔍 Handling orphaned failed message: ${status.id}`);

    const recipientPhone = status.recipient_id;
    if (!recipientPhone) return;

    // Find user by phone number ID
    const user = await User.findOne({ 'wabaAccounts.phoneNumberId': phoneNumberId });
    if (!user) return;

    const wabaAcc = user.wabaAccounts.find((a: any) => a.phoneNumberId === phoneNumberId);
    if (!wabaAcc) return;

    // Try to find contact
    const senderPhone = recipientPhone.replace(/^\+?/, '');
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
      // Create contact for failed message tracking
      const contactData = {
        name: `+${senderPhone}`,
        phone: `+${senderPhone}`,
        wabaId: wabaAcc.wabaId,
        phoneNumberId: wabaAcc.phoneNumberId,
        userId: user._id,
        whatsappOptIn: false,
        lastMessageAt: new Date(),
      };

      if (user.companyId) {
        (contactData as any).companyId = user.companyId;
      }

      contact = await Contact.create(contactData);
    }

    // Extract comprehensive error information
    let errorMessage = 'Message delivery failed';
    let errorCode = 'unknown';

    if (status.errors && status.errors.length > 0) {
      const error = status.errors[0];
      errorMessage = error.title || error.message || error.details || errorMessage;
      errorCode = error.code?.toString() || 'api_error';
    } else if (status.error) {
      errorMessage = status.error.message || status.error.title || errorMessage;
      errorCode = status.error.code?.toString() || 'api_error';
    } else if (status.error_code) {
      errorCode = status.error_code.toString();
      errorMessage = getErrorMessageFromCode(status.error_code);
    }

    // Create a comprehensive failed message record
    const failedMessage = {
      id: uuidv4(),
      senderId: 'agent' as const,
      content: `❌ Failed Message: ${errorMessage}`,
      messageType: 'system' as const,
      timestamp: new Date(parseInt(status.timestamp) * 1000),
      status: 'failed' as const,
      whatsappMessageId: status.id,
      errorMessage,
      errorCode,
      retryCount: 1,
      senderName: 'System'
    };

    // Find or create conversation
    let conversation = await Conversation.findOne({ contactId: contact._id });
    if (!conversation) {
      conversation = new Conversation({
        contactId: contact._id,
        wabaId: wabaAcc.wabaId,
        phoneNumberId: wabaAcc.phoneNumberId,
        userId: user._id,
        messages: [],
        unreadCount: 0,
        status: 'active',
        isWithin24Hours: true,
      });
    }

    conversation.messages.push(failedMessage);
    conversation.lastMessage = failedMessage.content;
    conversation.lastMessageType = 'system';
    conversation.lastMessageAt = failedMessage.timestamp;

    await conversation.save();
    console.log(`✅ Recorded orphaned failed message: ${errorMessage} (${errorCode})`);

  } catch (error) {
    console.error('Error handling orphaned failed message:', error);
  }
}

async function processMessage(
  m: any,
  contacts: any[],
  userId: string,
  wabaAcc: any,
) {
  try {
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

      // Create contact without companyId for now
      const contactData = {
        name: waContact?.profile?.name || `+${senderPhone}`,
        phone: `+${senderPhone}`,
        wabaId: wabaAcc.wabaId,
        phoneNumberId: wabaAcc.phoneNumberId,
        userId,
        whatsappOptIn: true,
        lastMessageAt: ts,
      };

      // Only add companyId if the user has one
      const user = await User.findById(userId);
      if (user && user.companyId) {
        (contactData as any).companyId = user.companyId;
      }

      contact = await Contact.create(contactData);
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
      senderName: contact.name || `+${senderPhone}`,
    };

    /* ---- content / media ---------------------------------------------- */

    try {
      switch (m.type) {
        case 'text': {
          newMsg.messageType = 'text';
          newMsg.content = m.text?.body ?? '';
          break;
        }

        // Handle interactive messages (button clicks, list selections)
        case 'interactive': {
          newMsg.messageType = 'interactive';

          if (m.interactive?.type === 'button_reply') {
            const buttonReply = m.interactive.button_reply;
            newMsg.content = buttonReply.title || 'Button clicked';
            newMsg.interactiveData = {
              type: 'button_reply',
              id: buttonReply.id,
              title: buttonReply.title
            };

            console.log(`🔘 Button clicked: ID="${buttonReply.id}", Title="${buttonReply.title}"`);

            // Check for workflow continuation based on button click
            await checkAndContinueWorkflow(
              contact,
              buttonReply.id,
              buttonReply.title,
              wabaAcc,
              userId,
              m.context?.id // The message ID this is replying to
            );

          } else if (m.interactive?.type === 'list_reply') {
            const listReply = m.interactive.list_reply;
            newMsg.content = listReply.title || 'List item selected';
            newMsg.interactiveData = {
              type: 'list_reply',
              id: listReply.id,
              title: listReply.title,
              description: listReply.description
            };

            console.log(`📝 List item selected: ID="${listReply.id}", Title="${listReply.title}"`);

            // Check for workflow continuation based on list selection
            await checkAndContinueWorkflow(
              contact,
              listReply.id,
              listReply.title,
              wabaAcc,
              userId,
              m.context?.id
            );
          }
          break;
        }

        case 'image':
        case 'video':
        case 'audio':
        case 'document': {
          try {
            const mediaId = m[m.type].id;
            const asset = await fetchWaAsset(
              wabaAcc.phoneNumberId,
              wabaAcc.wabaId,
              mediaId,
            );

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
            newMsg.content = newMsg.mediaCaption || `${m.type} file`;
          } catch (mediaError: any) {
            console.error(`Error processing ${m.type} media:`, mediaError);
            // Still record the message but mark it with error
            newMsg.messageType = m.type;
            newMsg.content = `Failed to process ${m.type} file`;
            newMsg.errorMessage = `Media processing failed: ${mediaError.message}`;
            newMsg.errorCode = 'media_processing_failed';
          }
          break;
        }

        // Handle location messages
        case 'location': {
          newMsg.messageType = 'text';
          const location = m.location;
          newMsg.content = `Location: ${location.latitude}, ${location.longitude}`;
          if (location.name) {
            newMsg.content += ` (${location.name})`;
          }
          if (location.address) {
            newMsg.content += ` - ${location.address}`;
          }
          break;
        }

        // Handle contact messages
        case 'contacts': {
          newMsg.messageType = 'text';
          const contacts = m.contacts || [];
          if (contacts.length > 0) {
            const contactInfo = contacts.map((c: any) => {
              let info = `Contact: ${c.name?.formatted_name || 'Unknown'}`;
              if (c.phones?.[0]) {
                info += ` (${c.phones[0].phone})`;
              }
              return info;
            }).join('\n');
            newMsg.content = contactInfo;
          } else {
            newMsg.content = 'Contact shared';
          }
          break;
        }

        // Handle reaction messages
        case 'reaction': {
          newMsg.messageType = 'text';
          const reaction = m.reaction;
          newMsg.content = `Reacted with ${reaction.emoji || '👍'} to a message`;
          newMsg.replyTo = reaction.message_id;
          break;
        }

        // Handle system messages
        case 'system': {
          newMsg.messageType = 'system';
          newMsg.senderId = 'system';
          newMsg.content = m.system?.body || 'System message';
          break;
        }

        // Handle unsupported message types
        default: {
          console.log(`⚠️ Unsupported message type: ${m.type}`, m);
          newMsg.messageType = 'unsupported';
          newMsg.content = `Unsupported message type: ${m.type}`;

          // Try to extract any available content
          if (m[m.type]) {
            const typeData = m[m.type];
            if (typeData.caption) {
              newMsg.content += ` - ${typeData.caption}`;
            }
            if (typeData.body) {
              newMsg.content += ` - ${typeData.body}`;
            }
          }
          break;
        }
      }
    } catch (contentProcessingError: any) {
      console.error('Error processing message content:', contentProcessingError);
      // Ensure we still record something
      newMsg.messageType = 'text';
      newMsg.content = `Error processing message of type: ${m.type}`;
      newMsg.errorMessage = `Content processing failed: ${contentProcessingError.message}`;
      newMsg.errorCode = 'content_processing_failed';
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

    // Process campaign responses first
    await processCampaignResponse(
      newMsg.content,
      newMsg.messageType,
      contact,
      wabaAcc,
      userId,
      newMsg.interactiveData
    );

    // For text messages from customers, check workflows in order of priority
    if (newMsg.messageType === 'text' && newMsg.senderId === 'customer') {
      // 1. First check if this continues a paused workflow
      const continuedWorkflow = await checkForWorkflowContinuation(newMsg.content, contact, wabaAcc, userId);

      if (!continuedWorkflow) {
        // 2. If no workflow was continued, check for auto replies
        await checkAndSendAutoReply(newMsg.content, contact, wabaAcc, userId);

        // 3. Then check for new workflow triggers
        await checkAndTriggerWorkflows(newMsg.content, contact, wabaAcc, userId);
      }
    }

    console.log(`✅ Successfully processed message: ${newMsg.messageType} - "${newMsg.content}"`);

  } catch (error: any) {
    console.error('❌ Error processing message:', error);

    // Try to save a basic error message to the conversation if possible
    try {
      const waId = m.from;
      const senderPhone = waId.replace(/^\+?/, '');

      const contact = await Contact.findOne({
        $or: [
          { phone: senderPhone },
          { phone: `+${senderPhone}` },
        ],
        wabaId: wabaAcc.wabaId,
      });

      if (contact) {
        const errorMsg = {
          id: uuidv4(),
          senderId: 'system' as const,
          content: `Failed to process incoming message of type: ${m.type}`,
          messageType: 'system' as const,
          timestamp: new Date(+m.timestamp * 1000),
          status: 'failed' as const,
          whatsappMessageId: m.id,
          errorMessage: error.message,
          errorCode: 'message_processing_failed',
          senderName: 'System'
        };

        let conv = await Conversation.findOne({ contactId: contact._id });
        if (conv) {
          conv.messages.push(errorMsg);
          conv.lastMessage = errorMsg.content;
          conv.lastMessageType = 'system';
          conv.lastMessageAt = errorMsg.timestamp;
          await conv.save();
        }
      }
    } catch (errorSaveError) {
      console.error('Failed to save error message:', errorSaveError);
    }
  }
}

// New function to check for paused workflows that need continuation
async function checkForWorkflowContinuation(
  messageContent: string,
  contact: any,
  wabaAcc: any,
  userId: string
): Promise<boolean> {
  try {
    console.log(`🔍 Checking for paused workflows for contact: ${contact.phone}`);

    const workflowEngine = WorkflowEngine.getInstance();

    // Find paused workflow execution waiting for this contact's input
    const pausedExecution = workflowEngine.getAllExecutions()
      .find(exec =>
        exec.contactId === contact._id.toString() &&
        exec.status === 'paused' &&
        exec.variables.waitingForCondition
      );

    if (pausedExecution) {
      console.log(`🔄 Found paused workflow waiting for input: ${pausedExecution.workflowId}`);
      console.log(`   Waiting for condition node: ${pausedExecution.variables.waitingForCondition}`);
      console.log(`   User message: "${messageContent}"`);

      // Continue workflow with text response
      await workflowEngine.continueWorkflow(
        pausedExecution.workflowId,
        contact._id.toString(),
        {
          messageType: 'text_response',
          textContent: messageContent,
          timestamp: new Date()
        }
      );

      console.log(`✅ Workflow continued with text response`);

      // Return true to indicate a workflow was continued
      return true;
    } else {
      console.log(`❌ No paused workflow found for contact: ${contact.phone}`);
    }

    return false;
  } catch (error) {
    console.error('❌ Error checking for workflow continuation:', error);
    return false;
  }
}

// New function to handle workflow continuation based on button/list interactions
async function checkAndContinueWorkflow(
  contact: any,
  buttonId: string,
  buttonTitle: string,
  wabaAcc: any,
  userId: string,
  contextMessageId?: string
) {
  try {
    console.log(`🔄 Checking for workflow continuation: buttonId="${buttonId}", title="${buttonTitle}"`);

    const workflowEngine = WorkflowEngine.getInstance();

    // Find any running workflow execution for this contact
    const runningExecution = workflowEngine.getAllExecutions()
      .find(exec =>
        exec.contactId === contact._id.toString() &&
        exec.status === 'running'
      );

    if (!runningExecution) {
      console.log('❌ No running workflow execution found for this contact');
      return;
    }

    console.log(`✅ Found running workflow execution: ${runningExecution.workflowId}`);

    // Continue the workflow with the button response
    await workflowEngine.continueWorkflow(
      runningExecution.workflowId,
      contact._id.toString(),
      {
        buttonId,
        buttonTitle,
        contextMessageId,
        messageType: 'button_click',
        timestamp: new Date()
      }
    );

    console.log(`✅ Workflow continued with button click: ${buttonId}`);

  } catch (error) {
    console.error('❌ Error continuing workflow:', error);
  }
}

// Update the checkAndTriggerWorkflows function
async function checkAndTriggerWorkflows(
  messageContent: string,
  contact: any,
  wabaAcc: any,
  userId: string
) {
  try {
    console.log(`🔍 Checking workflows for message: "${messageContent}" from contact: ${contact.phone}`);

    // Get all active workflows for this user
    const workflows = await Workflow.find({
      userId,
      isActive: true
    });

    console.log(`📋 Found ${workflows.length} active workflows for user: ${userId}`);

    if (!workflows.length) {
      console.log('❌ No active workflows found');
      return;
    }

    const workflowEngine = WorkflowEngine.getInstance();

    // Check each workflow for trigger conditions
    for (const workflow of workflows) {
      console.log(`\n🔎 Checking workflow: "${workflow.name}" (ID: ${workflow._id})`);
      console.log(`   - Workflow WABA ID: ${workflow.wabaId}`);
      console.log(`   - Contact WABA ID: ${wabaAcc.wabaId}`);

      // Check if workflow is for this WABA
      if (workflow.wabaId !== wabaAcc.wabaId) {
        console.log(`   ❌ WABA ID mismatch, skipping workflow`);
        continue;
      }

      const triggerNode = workflow.nodes.find((node: any) => node.type === 'trigger');
      if (!triggerNode) {
        console.log(`   ❌ No trigger node found in workflow: ${workflow.name}`);
        continue;
      }

      console.log(`   ✅ Trigger node found:`, {
        id: triggerNode.id,
        keywords: triggerNode.data.config?.keywords,
        workflowTriggers: workflow.triggers
      });

      // Check if message matches trigger conditions
      let shouldTrigger = false;
      const messageText = messageContent.toLowerCase().trim();

      // Method 1: Check workflow.triggers array (if it exists)
      if (workflow.triggers && workflow.triggers.length > 0) {
        console.log(`   📝 Checking workflow triggers: ${workflow.triggers}`);
        shouldTrigger = workflow.triggers.some((trigger: string) => {
          const triggerText = trigger.toLowerCase().trim();
          const match = messageText.includes(triggerText);
          console.log(`      "${triggerText}" in "${messageText}": ${match}`);
          return match;
        });
      }

      // Method 2: Check trigger node configuration keywords
      if (!shouldTrigger && triggerNode.data.config?.keywords) {
        console.log(`   📝 Checking trigger node keywords: "${triggerNode.data.config.keywords}"`);
        const keywords = triggerNode.data.config.keywords
          .split(',')
          .map((k: string) => k.trim().toLowerCase())
          .filter((k: string) => k.length > 0);

        console.log(`   🔑 Parsed keywords:`, keywords);

        shouldTrigger = keywords.some((keyword: string) => {
          const match = messageText.includes(keyword);
          console.log(`      "${keyword}" in "${messageText}": ${match}`);
          return match;
        });
      }

      if (shouldTrigger) {
        console.log(`\n🚀 TRIGGERING WORKFLOW: "${workflow.name}" for contact: ${contact.phone}`);
        console.log(`   📞 Contact ID: ${contact._id}`);
        console.log(`   🔗 Workflow ID: ${workflow._id}`);

        try {
          const executionId = await workflowEngine.triggerWorkflow(
            workflow._id.toString(),
            contact._id.toString(),
            {
              messageContent,
              contactPhone: contact.phone,
              contactName: contact.name,
              wabaId: wabaAcc.wabaId,
              timestamp: new Date()
            }
          );

          console.log(`✅ Workflow triggered successfully with execution ID: ${executionId}`);

          // Update workflow statistics
          await Workflow.findByIdAndUpdate(workflow._id, {
            $inc: { executionCount: 1 },
            lastTriggered: new Date()
          });

        } catch (triggerError) {
          console.error(`❌ Error triggering workflow ${workflow.name}:`, triggerError);

          // Update failure count
          await Workflow.findByIdAndUpdate(workflow._id, {
            $inc: { executionCount: 1, failureCount: 1 },
            lastTriggered: new Date()
          });
        }

        // Only trigger first matching workflow
        break;
      } else {
        console.log(`   ❌ No trigger match for workflow: ${workflow.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Error checking workflows:', error);
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

// Enhanced sendAutoReplyMessage with better error tracking
async function sendAutoReplyMessage(contact: any, autoReply: any, wabaAcc: any) {
  let messageId = uuidv4();
  let messageContent = '';

  try {
    let phoneNumber = contact.phone;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    let whatsappPayload;

    if (autoReply.replyType === 'workflow') {
      // Workflow handling remains the same
      console.log(`🔄 Triggering workflow for auto reply: ${autoReply.name}`);

      try {
        const workflowEngine = WorkflowEngine.getInstance();
        const executionId = await workflowEngine.triggerWorkflow(
          autoReply.workflowId.toString(),
          contact._id.toString(),
          {
            messageContent: 'Auto reply triggered',
            contactPhone: contact.phone,
            contactName: contact.name,
            wabaId: wabaAcc.wabaId,
            timestamp: new Date(),
            triggeredBy: 'auto_reply',
            autoReplyId: autoReply._id
          }
        );

        console.log(`✅ Workflow triggered successfully with execution ID: ${executionId}`);
        return;
      } catch (workflowError) {
        console.error('❌ Error triggering workflow:', workflowError);
        messageContent = `Sorry, there was an issue processing your request. Please try again later.`;
        whatsappPayload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phoneNumber,
          type: "text",
          text: {
            preview_url: false,
            body: messageContent
          }
        };
      }
    } else if (autoReply.replyType === 'template') {
      messageContent = `Template: ${autoReply.templateName}`;
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
      messageContent = autoReply.replyMessage;
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

    // Pre-record the message as 'sent' - it will be updated by status webhook
    if (whatsappPayload) {
      await recordAutoReplyInConversation(
        contact,
        autoReply,
        undefined, // No WhatsApp message ID yet
        messageId,
        messageContent
      );

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
        // Update with WhatsApp message ID
        const responseData = JSON.parse(responseText);
        if (responseData.messages?.[0]?.id) {
          await updateMessageWithWhatsAppId(
            contact._id,
            messageId,
            responseData.messages[0].id
          );
        }
      } else {
        console.error('Failed to send auto reply:', responseText);

        // Update message as failed
        await updateMessageAsFailed(
          contact._id,
          messageId,
          `Auto reply failed: ${response.status}`,
          response.status.toString()
        );
      }
    }

  } catch (error:any) {
    console.error('Error sending auto reply message:', error);

    // Update message as failed
    await updateMessageAsFailed(
      contact._id,
      messageId,
      `Auto reply error: ${error.message}`,
      'send_error'
    );
  }
}


// Enhanced recordAutoReplyInConversation
async function recordAutoReplyInConversation(
  contact: any,
  autoReply: any,
  whatsappMessageId?: string,
  messageId?: string,
  messageContent?: string
) {
  try {
    const conversation = await Conversation.findOne({ contactId: contact._id });
    if (!conversation) return;

    const content = messageContent || (autoReply.replyType === 'template'
      ? `Template: ${autoReply.templateName}`
      : autoReply.replyMessage);

    const autoReplyMessage = {
      id: messageId || uuidv4(),
      senderId: 'agent' as const,
      content: content,
      messageType: autoReply.replyType,
      timestamp: new Date(),
      status: 'sent' as const,
      whatsappMessageId,
      senderName: 'Auto Reply',
      templateName: autoReply.replyType === 'template' ? autoReply.templateName : undefined,
      errorMessage: undefined,
      errorCode: undefined,
      retryCount: 0
    };

    conversation.messages.push(autoReplyMessage);
    conversation.lastMessage = content;
    conversation.lastMessageType = autoReply.replyType;
    conversation.lastMessageAt = new Date();

    await conversation.save();
    console.log('Auto reply recorded in conversation');

  } catch (error) {
    console.error('Error recording auto reply in conversation:', error);
  }
}

// Helper function to update message with WhatsApp ID
async function updateMessageWithWhatsAppId(
  contactId: string,
  messageId: string,
  whatsappMessageId: string
) {
  try {
    await Conversation.findOneAndUpdate(
      {
        contactId,
        "messages.id": messageId
      },
      {
        $set: {
          "messages.$.whatsappMessageId": whatsappMessageId
        }
      }
    );
  } catch (error) {
    console.error('Error updating message with WhatsApp ID:', error);
  }
}

// Helper function to update message as failed
async function updateMessageAsFailed(
  contactId: string,
  messageId: string,
  errorMessage: string,
  errorCode: string
) {
  try {
    await Conversation.findOneAndUpdate(
      {
        contactId,
        "messages.id": messageId
      },
      {
        $set: {
          "messages.$.status": "failed",
          "messages.$.errorMessage": errorMessage,
          "messages.$.errorCode": errorCode
        },
        $inc: {
          "messages.$.retryCount": 1
        }
      }
    );
  } catch (error) {
    console.error('Error updating message as failed:', error);
  }
}

// Add this function to handle campaign responses
async function processCampaignResponse(
  messageContent: string,
  messageType: string,
  contact: any,
  wabaAcc: any,
  userId: string,
  interactiveData?: any
) {
  try {
    // Find recent campaigns that were sent to this contact
    const recentCampaigns = await Campaign.find({
      userId,
      'audience.selectedContacts': contact._id,
      'responseHandling.enabled': true,
      'stats.messages': {
        $elemMatch: {
          contactId: contact._id.toString(),
          status: 'sent',
          sentAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }
      }
    }).sort({ 'stats.lastProcessedAt': -1 }).limit(5);

    console.log(`Found ${recentCampaigns.length} recent campaigns for response processing`);

    for (const campaign of recentCampaigns) {
      try {
        await handleCampaignResponse(campaign, messageContent, messageType, contact, wabaAcc, userId, interactiveData);
      } catch (error) {
        console.error(`Error processing response for campaign ${campaign._id}:`, error);
      }
    }

  } catch (error) {
    console.error('Error processing campaign responses:', error);
  }
}

async function handleCampaignResponse(
  campaign: any,
  messageContent: string,
  messageType: string,
  contact: any,
  wabaAcc: any,
  userId: string,
  interactiveData?: any
) {
  const responseHandling = campaign.responseHandling;

  // Handle opt-out responses
  if (responseHandling.optOut?.enabled && interactiveData?.type === 'button_reply') {
    const buttonText = interactiveData.title;
    
    if (responseHandling.optOut.triggerButtons.includes(buttonText)) {
      console.log(`Processing opt-out request for contact ${contact.phone} - button: ${buttonText}`);
      await handleOptOutRequest(campaign, contact, wabaAcc, userId);
      return; // Don't process other response handlers after opt-out
    }
  }

  // Handle auto-reply
  if (responseHandling.autoReply?.enabled) {
    console.log(`Processing auto-reply for campaign ${campaign._id}`);
    await handleAutoReply(campaign, contact, wabaAcc, userId, messageContent);
  }

  // Handle workflow trigger
  if (responseHandling.workflow?.enabled && responseHandling.workflow.workflowId) {
    console.log(`Processing workflow trigger for campaign ${campaign._id}`);
    await handleWorkflowTrigger(campaign, contact, wabaAcc, userId, messageContent, interactiveData);
  }
}

async function handleOptOutRequest(
  campaign: any,
  contact: any,
  wabaAcc: any,
  userId: string
) {
  try {
    console.log(`🚫 Processing opt-out request for contact: ${contact.phone}`);

    // Update contact opt-in status if enabled
    if (campaign.responseHandling.optOut.updateContact) {
      await Contact.findByIdAndUpdate(contact._id, {
        whatsappOptIn: false,
        optOutDate: new Date(),
        optOutReason: `Campaign response - ${campaign.name}`,
        tags: [...(contact.tags || []), 'opted-out']
      });
      
      console.log(`✅ Updated contact ${contact.phone} opt-in status to false`);
    }

    // Send acknowledgment message
    const acknowledgmentMessage = campaign.responseHandling.optOut.acknowledgmentMessage || 
      'Thank you. You have been unsubscribed from our messages.';

    await sendOptOutAcknowledgment(contact, acknowledgmentMessage, wabaAcc);

    // Record the opt-out in campaign stats
    await Campaign.findByIdAndUpdate(campaign._id, {
      $inc: { 'stats.optOuts': 1 },
      $push: {
        'stats.optOutEvents': {
          contactId: contact._id,
          contactPhone: contact.phone,
          timestamp: new Date(),
          campaignId: campaign._id
        }
      }
    });

    console.log(`✅ Opt-out processed successfully for ${contact.phone}`);

  } catch (error) {
    console.error('❌ Error processing opt-out request:', error);
  }
}

async function sendOptOutAcknowledgment(
  contact: any,
  message: string,
  wabaAcc: any
) {
  try {
    let phoneNumber = contact.phone;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    const whatsappPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "text",
      text: {
        preview_url: false,
        body: message
      }
    };

    const response = await fetch(
      `https://amped-express.interakt.ai/api/v17.0/${wabaAcc.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'x-access-token': INT_TOKEN!,
          'x-waba-id': contact.wabaId,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(whatsappPayload)
      }
    );

    const responseText = await response.text();
    console.log('Opt-out acknowledgment response:', responseText);

    if (response.ok) {
      // Record in conversation
      await recordOptOutMessage(contact, message);
      console.log('✅ Opt-out acknowledgment sent successfully');
    } else {
      console.error('❌ Failed to send opt-out acknowledgment:', responseText);
    }

  } catch (error) {
    console.error('❌ Error sending opt-out acknowledgment:', error);
  }
}

async function recordOptOutMessage(contact: any, message: string) {
  try {
    const conversation = await Conversation.findOne({ contactId: contact._id });
    if (!conversation) return;

    const optOutMessage = {
      id: uuidv4(),
      senderId: 'system' as const,
      content: `🚫 ${message}`,
      messageType: 'system' as const,
      timestamp: new Date(),
      status: 'sent' as const,
      senderName: 'System - Opt Out'
    };

    conversation.messages.push(optOutMessage);
    conversation.lastMessage = optOutMessage.content;
    conversation.lastMessageType = 'system';
    conversation.lastMessageAt = new Date();

    await conversation.save();
    console.log('✅ Opt-out message recorded in conversation');

  } catch (error) {
    console.error('❌ Error recording opt-out message:', error);
  }
}

async function handleAutoReply(
  campaign: any,
  contact: any,
  wabaAcc: any,
  userId: string,
  messageContent: string
) {
  try {
    const autoReply = campaign.responseHandling.autoReply;
    const delay = (autoReply.delay || 0) * 60 * 1000; // Convert minutes to milliseconds

    const sendAutoReply = async () => {
      try {
        let phoneNumber = contact.phone;
        if (!phoneNumber.startsWith('+')) {
          phoneNumber = '+' + phoneNumber;
        }

        let whatsappPayload;
        let messageContent = '';

        if (autoReply.templateId) {
          // Template-based auto reply
          const template = await Template.findById(autoReply.templateId);
          if (!template) {
            console.error('Template not found for auto reply:', autoReply.templateId);
            return;
          }

          whatsappPayload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phoneNumber,
            type: "template",
            template: {
              name: template.name,
              language: {
                code: template.language || 'en'
              }
            }
          };

          messageContent = `Template: ${template.name}`;
        } else {
          // Text-based auto reply
          whatsappPayload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phoneNumber,
            type: "text",
            text: {
              preview_url: false,
              body: autoReply.message
            }
          };

          messageContent = autoReply.message;
        }

        console.log('Sending campaign auto-reply:', JSON.stringify(whatsappPayload, null, 2));

        const response = await fetch(
          `https://amped-express.interakt.ai/api/v17.0/${wabaAcc.phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'x-access-token': INT_TOKEN!,
              'x-waba-id': contact.wabaId,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(whatsappPayload)
          }
        );

        const responseText = await response.text();
        console.log('Campaign auto-reply response:', responseText);

        if (response.ok) {
          const responseData = JSON.parse(responseText);
          await recordCampaignAutoReply(
            contact,
            messageContent,
            autoReply.templateId ? 'template' : 'text',
            responseData.messages?.[0]?.id,
            campaign.name
          );
          console.log('✅ Campaign auto-reply sent successfully');
        }

      } catch (error) {
        console.error('❌ Error sending campaign auto-reply:', error);
      }
    };

    if (delay > 0) {
      console.log(`⏰ Scheduling campaign auto-reply with ${autoReply.delay} minute delay`);
      setTimeout(sendAutoReply, delay);
    } else {
      await sendAutoReply();
    }

  } catch (error) {
    console.error('❌ Error processing campaign auto-reply:', error);
  }
}

async function recordCampaignAutoReply(
  contact: any,
  messageContent: string,
  messageType: string,
  whatsappMessageId?: string,
  campaignName?: string
) {
  try {
    const conversation = await Conversation.findOne({ contactId: contact._id });
    if (!conversation) return;

    const autoReplyMessage = {
      id: uuidv4(),
      senderId: 'agent' as const,
      content: messageContent,
      messageType: messageType,
      timestamp: new Date(),
      status: 'sent' as const,
      whatsappMessageId,
      senderName: `Campaign Auto Reply - ${campaignName}`,
      templateName: messageType === 'template' ? messageContent.replace('Template: ', '') : undefined
    };

    conversation.messages.push(autoReplyMessage);
    conversation.lastMessage = messageContent;
    conversation.lastMessageType = messageType;
    conversation.lastMessageAt = new Date();

    await conversation.save();
    console.log('✅ Campaign auto-reply recorded in conversation');

  } catch (error) {
    console.error('❌ Error recording campaign auto-reply:', error);
  }
}

async function handleWorkflowTrigger(
  campaign: any,
  contact: any,
  wabaAcc: any,
  userId: string,
  messageContent: string,
  interactiveData?: any
) {
  try {
    const workflowConfig = campaign.responseHandling.workflow;
    const delay = (workflowConfig.triggerDelay || 0) * 60 * 1000; // Convert minutes to milliseconds

    const triggerWorkflow = async () => {
      try {
        const workflowEngine = WorkflowEngine.getInstance();

        const triggerData = {
          campaignId: campaign._id,
          campaignName: campaign.name,
          messageContent,
          contactPhone: contact.phone,
          contactName: contact.name,
          wabaId: wabaAcc.wabaId,
          timestamp: new Date(),
          triggeredBy: 'campaign_response',
          interactiveData
        };

        console.log(`🔄 Triggering workflow ${workflowConfig.workflowId} for campaign response`);

        const executionId = await workflowEngine.triggerWorkflow(
          workflowConfig.workflowId,
          contact._id.toString(),
          triggerData
        );

        console.log(`✅ Campaign response workflow triggered with execution ID: ${executionId}`);

        // Update workflow statistics
        await Workflow.findByIdAndUpdate(workflowConfig.workflowId, {
          $inc: { executionCount: 1 },
          lastTriggered: new Date()
        });

      } catch (error) {
        console.error('❌ Error triggering campaign response workflow:', error);
      }
    };

    if (delay > 0) {
      console.log(`⏰ Scheduling campaign workflow trigger with ${workflowConfig.triggerDelay} minute delay`);
      setTimeout(triggerWorkflow, delay);
    } else {
      await triggerWorkflow();
    }

  } catch (error) {
    console.error('❌ Error processing campaign workflow trigger:', error);
  }
}

