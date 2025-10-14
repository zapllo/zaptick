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
import Campaign from '@/models/Campaign';
import Template from '@/models/Template';
import { WebhookService } from '@/lib/webhookService';
import Chatbot from '@/models/Chatbot';
import { generateChatbotResponse } from '@/lib/openai';
import { WalletService } from '@/lib/wallet-service';
import { KnowledgeBaseService } from '@/lib/knowledge-base';
import InteraktPartnerEvent from '@/models/InteraktPartnerEvent';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;

/* ---------- hub challenge ------------------------------------------------ */

export async function GET(req: NextRequest) {
  const challenge = new URL(req.url).searchParams.get('hub.challenge');
  return new Response(challenge ?? 'OK', { status: 200 });
}



// ---------- Interakt Partner Events (WABA_ONBOARDED etc.) -------------------

// Add this at the top of the processPartnerEvent function
async function processPartnerEvent(value: any) {
  console.log('\n🔔 ===== PROCESSING PARTNER EVENT =====');
  console.log('📥 Raw partner event value:', JSON.stringify(value, null, 2));

  try {
    const event = value?.event;
    if (!event) {
      console.log('⚠️ No event type found in partner event');
      return;
    }

    // Normalize identifiers from either flat payload or nested waba_info
    const wabaId =
      value?.waba_id ??
      value?.waba_info?.waba_id ??
      null;

    const phoneNumberId =
      value?.phone_number_id ??
      value?.waba_info?.phone_number_id ??
      null;

    const isvNameToken =
      value?.isv_name_token ??
      value?.waba_info?.isv_name_token ??
      '';

    // Try to link to a user by known credentials
    const user = (wabaId || phoneNumberId)
      ? await User.findOne({
        $or: [
          { 'wabaAccounts.wabaId': wabaId },
          { 'wabaAccounts.phoneNumberId': phoneNumberId }
        ]
      }).select('_id email wabaAccounts')
      : null;

    // ✅ Always persist the partner event first
    await InteraktPartnerEvent.create({
      eventType: event,
      wabaId,
      phoneNumberId,
      userId: user?._id,
      raw: value
    });

    // ─────────────────────────────────────────────────────────────
    // Event-specific handling
    // ─────────────────────────────────────────────────────────────

    if (event === 'WABA_ONBOARDED') {
      console.log('🎉 Processing WABA_ONBOARDED');

      if (!wabaId || !phoneNumberId) {
        console.warn('❌ Missing wabaId / phoneNumberId in WABA_ONBOARDED');
        return;
      }

      if (!user) {
        console.warn('❌ No user found to attach WABA_ONBOARDED creds');
        return;
      }

      const idx = user.wabaAccounts.findIndex(
        (acc: any) => acc.wabaId === wabaId || acc.phoneNumberId === phoneNumberId
      );

      const updateData = {
        wabaId,
        phoneNumberId,
        isvNameToken: isvNameToken || '',
        status: 'active',
        connectedAt: new Date()
      };

      if (idx >= 0) {
        user.wabaAccounts[idx] = {
          ...user.wabaAccounts[idx].toObject?.() ?? user.wabaAccounts[idx],
          ...updateData
        };
      } else {
        user.wabaAccounts.push({
          ...updateData,
          businessName: 'WhatsApp Business',
          phoneNumber: '',
          templateCount: 0
        });
      }

      try {
        const saved = await user.save();
        console.log('✅ WABA_ONBOARDED: user updated; accounts:', saved.wabaAccounts.length);
      } catch (err) {
        console.error('❌ Failed to save WABA_ONBOARDED update:', err);
      }
    }

    if (event === 'WABA_ONBOARDING_FAILED') {
      console.log('🚫 Processing WABA_ONBOARDING_FAILED');
      // Optionally mark pending WABA as failed
      if (user && wabaId) {
        const idx = user.wabaAccounts.findIndex((a: any) => a.wabaId === wabaId);
        if (idx >= 0) {
          user.wabaAccounts[idx].status = 'failed';
          await user.save().catch(e => console.error('Failed to mark WABA failed:', e));
        }
      }
    }

    if (event === 'WABA_DISCONNECTED') {
      console.log('🔌 Processing WABA_DISCONNECTED');

      if (user && wabaId && phoneNumberId) {
        const idx = user.wabaAccounts.findIndex(
          (a: any) => a.wabaId === wabaId && a.phoneNumberId === phoneNumberId
        );
        if (idx >= 0) {
          user.wabaAccounts[idx].status = 'disconnected';
          await user.save().catch(e => console.error('Failed to save disconnect:', e));
        }
      }
    }

    // If Interakt ever echoes PARTNER_ADDED back, it's already persisted above.

  } catch (e) {
    console.error('❌ CRITICAL ERROR in processPartnerEvent:', e);
  } finally {
    console.log('🏁 ===== PARTNER EVENT PROCESSING ENDED =====\n');
  }
}


/* ---------- webhook ------------------------------------------------------ */

export async function POST(req: NextRequest) {
  await dbConnect();

  const raw = await req.text();
  console.log('Interakt webhook received:', raw);

  let body: any = {};
  try { body = JSON.parse(raw); } catch { }

  // 👇 NEW: accept both flat and entry/changes shapes
  const nested = body?.entry?.[0]?.changes?.[0]?.value;
  const value = body?.event ? body : (nested ?? {});

  // Partner/onboarding events
  if (value?.event) {
    await processPartnerEvent(value);   // value now always has .event
  }

  if (value.messaging_product === 'whatsapp' && value.messages) {
    await processIncomingMessages(value);
  }

  if (value.messaging_product === 'whatsapp' && value.statuses) {
    await processStatusUpdates(value);
  }

  return NextResponse.json({ received: true });
}


/* ---------- helpers ----------------------------------------------------- */
// Add this function near the top with other helper functions
async function deductTemplateMessageCost(
  templateName: string,
  templateType: 'marketing' | 'authentication' | 'utility',
  recipientPhone: string,
  companyId: string,
  campaignId?: string,
  messageId?: string
): Promise<{ success: boolean; cost: number; error?: string }> {
  try {
    if (!companyId) {
      console.log('⚠️ No company ID provided, skipping template cost deduction');
      return { success: true, cost: 0 };
    }

    console.log(`💰 Deducting template cost: ${templateName} (${templateType}) to ${recipientPhone}`);

    const result = await WalletService.deductForTemplateMessage(
      companyId,
      templateType,
      recipientPhone,
      templateName,
      campaignId,
      messageId
    );

    if (!result.success) {
      console.error(`❌ Failed to deduct template cost: ${result.error}`);
      return result;
    }

    console.log(`✅ Template cost deducted: ₹${result.cost} (${result.countryCode})`);
    console.log(`💰 Remaining balance: ₹${result.balance?.toFixed(4)}`);

    return result;

  } catch (error) {
    console.error('❌ Error in deductTemplateMessageCost:', error);
    return { success: false, cost: 0, error: 'Failed to deduct template cost' };
  }
}





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

// Update the processStatusUpdates function to include webhook calls
async function processStatusUpdates(v: any) {
  if (!v.statuses || !v.statuses.length) return;

  const phoneNumberId = v.metadata?.phone_number_id;
  if (!phoneNumberId) return;

  // Get user for webhook
  const user = await User.findOne({ 'wabaAccounts.phoneNumberId': phoneNumberId });
  if (!user) return;

  const wabaAcc = user.wabaAccounts.find((a: any) => a.phoneNumberId === phoneNumberId);
  if (!wabaAcc) return;

  // Process each status update
  for (const status of v.statuses) {
    try {
      const whatsappMessageId = status.id;
      const statusValue = status.status;
      const timestamp = new Date(parseInt(status.timestamp) * 1000); // This is the event timestamp

      console.log(`Processing status update: ${whatsappMessageId} => ${statusValue} at ${timestamp}`);

      const conversation = await Conversation.findOne({
        "messages.whatsappMessageId": whatsappMessageId
      });

      if (conversation) {
        const messageIndex = conversation.messages.findIndex(
          (msg: any) => msg.whatsappMessageId === whatsappMessageId
        );

        if (messageIndex !== -1) {
          // Update the message status
          conversation.messages[messageIndex].status = statusValue;

          // ** NEW: Store specific timestamps based on status **
          switch (statusValue) {
            case 'sent':
              conversation.messages[messageIndex].sentAt = timestamp;
              break;
            case 'delivered':
              conversation.messages[messageIndex].deliveredAt = timestamp;
              break;
            case 'read':
              conversation.messages[messageIndex].readAt = timestamp;
              break;
            case 'failed':
              // Handle failed messages as before
              let errorMessage = 'Message delivery failed';
              let errorCode = 'unknown';

              if (status.errors && status.errors.length > 0) {
                const error = status.errors[0];
                errorMessage = error.title || error.message || error.details || errorMessage;
                errorCode = error.code?.toString() || error.error_code?.toString() || 'api_error';
              }

              conversation.messages[messageIndex].errorMessage = errorMessage;
              conversation.messages[messageIndex].errorCode = errorCode;
              conversation.messages[messageIndex].retryCount =
                (conversation.messages[messageIndex].retryCount || 0) + 1;
              break;
          }

          await conversation.save();
          console.log(`Updated message status to ${statusValue} at ${timestamp} for message ${whatsappMessageId}`);

          // Send webhook with timestamp information
          const contact = await Contact.findById(conversation.contactId);
          if (contact) {
            await sendWebhookForMessage(
              {
                whatsappMessageId,
                timestamp,
                sentAt: conversation.messages[messageIndex].sentAt,
                deliveredAt: conversation.messages[messageIndex].deliveredAt,
                readAt: conversation.messages[messageIndex].readAt,
                errorMessage: conversation.messages[messageIndex].errorMessage,
                errorCode: conversation.messages[messageIndex].errorCode
              },
              contact, user, wabaAcc, statusValue as 'sent' | 'delivered' | 'read' | 'failed'
            );
          }

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


        // Add button message handling (this was missing!)
        case 'button': {
          newMsg.messageType = 'interactive';
          const buttonData = m.button;
          newMsg.content = buttonData?.text || 'Button clicked';
          newMsg.interactiveData = {
            type: 'button_reply',
            id: buttonData?.payload || buttonData?.text, // Use payload first, then text
            title: buttonData?.text
          };

          console.log(`🔘 Button clicked: Payload="${buttonData?.payload}", Text="${buttonData?.text}"`);

          // Check for workflow continuation based on button click
          await checkAndContinueWorkflow(
            contact,
            buttonData?.payload || buttonData?.text,
            buttonData?.text,
            wabaAcc,
            userId,
            m.context?.id,
            'button'                    // <- ADD THIS
          );
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
              m.context?.id,
              'button'                  // <- ADD THIS
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
              m.context?.id,
              'list'                    // <- ADD THIS
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

    // Send webhook for customer message
    await WebhookService.sendCustomerMessage(
      userId,
      wabaAcc.wabaId,
      {
        id: newMsg.id,
        whatsappMessageId: newMsg.whatsappMessageId,
        type: newMsg.messageType,
        content: newMsg.content,
        timestamp: newMsg.timestamp,
        contact: {
          id: contact._id,
          name: contact.name,
          phone: contact.phone
        },
        conversation: {
          id: conv._id
        }
      }
    );

    // Process campaign responses first
    await processCampaignResponse(
      newMsg.content,
      newMsg.messageType,
      contact,
      wabaAcc,
      userId,
      newMsg.interactiveData
    );

    // UPDATED: Process automations for text messages only (not interactive)
    if (newMsg.messageType === 'text' && newMsg.senderId === 'customer') {
      console.log(`🤖 Processing text message: "${newMsg.content}"`);

      // 1. First check if this continues a paused workflow
      const continuedWorkflow = await checkForWorkflowContinuation(newMsg.content, contact, wabaAcc, userId);

      if (!continuedWorkflow) {
        console.log('🤖 No workflow continuation, checking other automations...');

        // 2. Check for chatbot responses FIRST (highest priority for AI responses)
        const chatbotTriggered = await checkAndSendChatbotResponse(newMsg.content, contact, wabaAcc, userId);

        if (!chatbotTriggered) {
          console.log('🤖 No chatbot triggered, checking auto replies...');

          // 3. If no chatbot was triggered, check for auto replies
          await checkAndSendAutoReply(newMsg.content, contact, wabaAcc, userId);

          // 4. Then check for new workflow triggers
          await checkAndTriggerWorkflows(newMsg.content, contact, wabaAcc, userId);
        } else {
          console.log('✅ Chatbot response sent, skipping other automations');
        }
      } else {
        console.log('✅ Workflow continued, skipping other automations');
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
  idOrPayload: string | undefined,
  title: string | undefined,
  wabaAcc: any,
  userId: string,
  contextMsgId: string | undefined,
  kind: 'button' | 'list'
) {
  const buttonId = (idOrPayload || title || '').trim();
  const buttonTitle = (title || idOrPayload || '').trim();

  await WorkflowEngine.getInstance().continueWorkflow(
    '', // empty: allow cold-start
    contact._id.toString(),
    {
      messageType: kind === 'button' ? 'button_click' : 'list_selection',
      buttonId,
      buttonTitle,
      contextMessageId: contextMsgId,
      timestamp: new Date(),
      // 🔴 CRITICAL: pass all three IDs so cold-start trigger can run
      wabaId: wabaAcc.wabaId,               // e.g. "678587558311219"
      phoneNumberId: wabaAcc.phoneNumberId, // e.g. "824268904098903"
      userId: userId?.toString?.() ?? userId
    }
  );
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

// Update the sendAutoReplyMessage function to include template cost deduction
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

      // ** NEW: Deduct template cost before sending **
      const user = await User.findOne({ 'wabaAccounts.wabaId': wabaAcc.wabaId });
      if (user && user.companyId) {
        const companyId = typeof user.companyId === 'object' ? user.companyId._id.toString() : user.companyId.toString();

        // Determine template type (you may need to store this in autoReply or infer it)
        const templateType = autoReply.templateType || 'utility'; // Default to utility

        const costResult = await deductTemplateMessageCost(
          autoReply.templateName,
          templateType,
          phoneNumber,
          companyId,
          undefined,
          messageId
        );

        if (!costResult.success) {
          console.error(`❌ Template cost deduction failed: ${costResult.error}`);

          // Send low balance message instead
          const lowBalanceMessage = `⚠️ Unable to send template message due to insufficient wallet balance. Please recharge your account.`;

          await recordAutoReplyInConversation(
            contact,
            { ...autoReply, replyMessage: lowBalanceMessage },
            undefined,
            messageId,
            lowBalanceMessage
          );

          return;
        }

        console.log(`✅ Template cost deducted: ₹${costResult.cost}`);
      }

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

    // Rest of the function remains the same...
  } catch (error: any) {
    console.error('Error sending auto reply message:', error);
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

  console.log(`🔍 Processing campaign response for campaign: ${campaign.name}`);
  console.log(`   Message content: "${messageContent}"`);
  console.log(`   Message type: ${messageType}`);
  console.log(`   Interactive data:`, interactiveData);
  console.log(`   Response handling config:`, responseHandling);

  // Handle opt-out responses - check both button_reply types and direct button messages
  // ── OPT‑OUT HANDLING ─────────────────────────────────────────
  if (responseHandling.optOut?.enabled && interactiveData) {
    // normalise helper
    const norm = (s: string) => s.trim().toLowerCase();

    // Pull both fields from WhatsApp payload
    const btnId = interactiveData.id ? norm(interactiveData.id) : '';
    const btnTitle = interactiveData.title ? norm(interactiveData.title) : '';

    // Normalise triggers stored in DB (now payloads)
    const triggers = (responseHandling.optOut.triggerButtons || []).map(norm);

    console.log('🔍 Checking opt‑out – id:', btnId, 'title:', btnTitle);
    console.log('   Configured triggers :', triggers);

    const isOptOut =
      (btnId && triggers.includes(btnId)) ||
      (btnTitle && triggers.includes(btnTitle));

    if (isOptOut) {
      console.log(`🚫 Processing opt‑out request for contact ${contact.phone}`);
      await handleOptOutRequest(campaign, contact, wabaAcc, userId);
      return;                                   // stop further handlers
    }

    console.log('❌ No match – opt‑out not triggered');
  }


  // Handle auto-reply
  if (responseHandling.autoReply?.enabled) {
    console.log(`📬 Processing auto-reply for campaign ${campaign._id}`);
    await handleAutoReply(campaign, contact, wabaAcc, userId, messageContent);
  }

  // Handle workflow trigger
  if (responseHandling.workflow?.enabled && responseHandling.workflow.workflowId) {
    console.log(`🔄 Processing workflow trigger for campaign ${campaign._id}`);
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
    console.log(`   Campaign: ${campaign.name}`);
    console.log(`   Update contact setting: ${campaign.responseHandling.optOut.updateContact}`);

    // Update contact opt-in status if enabled
    if (campaign.responseHandling.optOut.updateContact) {
      const updateResult = await Contact.findByIdAndUpdate(
        contact._id,
        {
          whatsappOptIn: false,
          optOutDate: new Date(),
          optOutReason: `Campaign response - ${campaign.name}`,
          tags: [...(contact.tags || []).filter(tag => tag !== 'opted-out'), 'opted-out']
        },
        { new: true }
      );

      console.log(`✅ Updated contact ${contact.phone} opt-in status to false`);
      console.log(`   Contact update result:`, updateResult ? 'Success' : 'Failed');
    }

    // Send acknowledgment message
    const acknowledgmentMessage = campaign.responseHandling.optOut.acknowledgmentMessage ||
      'Thank you. You have been unsubscribed from our messages.';

    console.log(`📤 Sending acknowledgment message: "${acknowledgmentMessage}"`);
    await sendOptOutAcknowledgment(contact, acknowledgmentMessage, wabaAcc);

    // Record the opt-out in campaign stats
    const campaignUpdateResult = await Campaign.findByIdAndUpdate(campaign._id, {
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
    console.log(`   Campaign stats updated:`, campaignUpdateResult ? 'Success' : 'Failed');

  } catch (error) {
    console.error('❌ Error processing opt-out request:', error);
  }
}

// Update with better error handling and logging:

async function sendOptOutAcknowledgment(
  contact: any,
  message: string,
  wabaAcc: any
) {
  try {
    console.log(`📤 Sending opt-out acknowledgment to ${contact.phone}`);

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

    console.log(`🚀 Sending acknowledgment payload:`, JSON.stringify(whatsappPayload, null, 2));

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
    console.log(`📡 Opt-out acknowledgment response (${response.status}):`, responseText);

    if (response.ok) {
      // Record in conversation
      await recordOptOutMessage(contact, message);
      console.log('✅ Opt-out acknowledgment sent successfully');
      return true;
    } else {
      console.error('❌ Failed to send opt-out acknowledgment:', responseText);
      return false;
    }

  } catch (error) {
    console.error('❌ Error sending opt-out acknowledgment:', error);
    return false;
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

// Update handleAutoReply function in campaign responses
async function handleAutoReply(
  campaign: any,
  contact: any,
  wabaAcc: any,
  userId: string,
  messageContent: string
) {
  try {
    const autoReply = campaign.responseHandling.autoReply;
    const delay = (autoReply.delay || 0) * 60 * 1000;

    const sendAutoReply = async () => {
      try {
        let phoneNumber = contact.phone;
        if (!phoneNumber.startsWith('+')) {
          phoneNumber = '+' + phoneNumber;
        }

        let whatsappPayload;
        let messageContent = '';

        if (autoReply.templateId) {
          const template = await Template.findById(autoReply.templateId);
          if (!template) {
            console.error('Template not found for auto reply:', autoReply.templateId);
            return;
          }
          // ** NEW: Deduct template cost **
          const user = await User.findById(userId);
          if (user && user.companyId) {
            const companyId = typeof user.companyId === 'object' ? user.companyId._id.toString() : user.companyId.toString();

            // Determine template type from template or campaign
            const templateType = template.category || autoReply.templateType || 'marketing';

            const costResult = await deductTemplateMessageCost(
              template.name,
              templateType,
              phoneNumber,
              companyId,
              campaign._id.toString()
            );

            if (!costResult.success) {
              console.error(`❌ Template cost deduction failed: ${costResult.error}`);
              return; // Don't send if insufficient balance
            }

            console.log(`✅ Campaign template cost deducted: ₹${costResult.cost}`);
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
          // Text-based auto reply (no cost)
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

        // Rest of the function remains the same...
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

async function sendWebhookForMessage(
  messageData: any,
  contact: any,
  user: any,
  wabaAcc: any,
  eventType: 'sent' | 'delivered' | 'read' | 'failed'
) {
  try {
    await WebhookService.sendMessageEvent(
      user._id.toString(),
      wabaAcc.wabaId,
      eventType,
      {
        id: messageData.whatsappMessageId,
        status: eventType,
        contact: {
          id: contact._id,
          name: contact.name,
          phone: contact.phone
        },
        timestamp: messageData.timestamp || new Date(),
        ...(eventType === 'failed' && {
          error: {
            message: messageData.errorMessage,
            code: messageData.errorCode
          }
        })
      }
    );
  } catch (error) {
    console.error('Error sending webhook for message event:', error);
  }
}

// Update the checkAndSendChatbotResponse function to handle initial trigger + continuous mode
async function checkAndSendChatbotResponse(
  messageContent: string,
  contact: any,
  wabaAcc: any,
  userId: string
): Promise<boolean> {
  try {
    console.log(`🤖 Checking for chatbot responses to: "${messageContent}"`);
    const chatbots = await Chatbot.find({
      userId,
      wabaId: wabaAcc.wabaId,
      isActive: true
    }).sort({ priority: -1, createdAt: 1 });

    if (!chatbots.length) {
      console.log('❌ No active chatbots found');
      return false;
    }

    // 🔥 NEW LOGIC: Check if chatbot is already in continuous mode for this contact
    let matchedChatbot = null;
    let isContinuousMode = false;

    // First, check if any chatbot is already in continuous conversation with this contact
    for (const chatbot of chatbots) {
      const isAlreadyActive = await isChatbotActiveForContact(chatbot._id, contact._id);
      if (isAlreadyActive) {
        matchedChatbot = chatbot;
        isContinuousMode = true;
        console.log(`🔄 Chatbot "${chatbot.name}" is in CONTINUOUS mode for contact ${contact.phone}`);
        break;
      }
    }

    // If no chatbot is in continuous mode, check for trigger matches
    if (!matchedChatbot) {
      for (const chatbot of chatbots) {
        const isTriggered = checkChatbotTriggerMatch(messageContent, chatbot);
        if (isTriggered) {
          matchedChatbot = chatbot;
          isContinuousMode = false; // This is the initial trigger
          console.log(`🚀 Chatbot "${chatbot.name}" TRIGGERED by: "${messageContent}"`);

          // Mark this chatbot as active for this contact
          await setChatbotActiveForContact(chatbot._id, contact._id);
          break;
        }
      }
    }

    if (!matchedChatbot) {
      console.log('❌ No chatbot triggers matched and none in continuous mode');
      return false;
    }

    // Check for pause keywords
    if (matchedChatbot.pauseKeywords && matchedChatbot.pauseKeywords.length > 0) {
      const isPauseKeyword = matchedChatbot.pauseKeywords.some(keyword =>
        messageContent.toLowerCase().includes(keyword.toLowerCase())
      );

      if (isPauseKeyword) {
        console.log(`🛑 Chatbot paused by keyword: "${messageContent}"`);

        // Remove continuous mode for this contact
        await removeChatbotActiveForContact(matchedChatbot._id, contact._id);

        await sendChatbotMessage(
          contact,
          "I'll pause our conversation now. Send a trigger word again to restart our chat!",
          wabaAcc,
          matchedChatbot
        );

        return true;
      }
    }

    console.log(`🤖 Using chatbot: ${matchedChatbot.name} (${isContinuousMode ? 'CONTINUOUS' : 'INITIAL TRIGGER'} mode)`);

    try {
      // Get user with populated companyId
      const user = await User.findById(userId).populate('companyId');
      if (!user) {
        console.error('❌ User not found:', userId);
        return false;
      }

      // Extract company ID
      let companyId = null;
      if (user.companyId) {
        companyId = typeof user.companyId === 'object' ? user.companyId._id.toString() : user.companyId.toString();
      }

      if (!companyId) {
        console.error('❌ No company ID found for user:', userId);
        return false;
      }

      console.log(`🏢 Using company ID: ${companyId}`);

      // Check wallet balance
      const balanceResult = await WalletService.getWalletBalance(companyId);
      if (!balanceResult.success) {
        console.error('❌ Failed to get wallet balance:', balanceResult.error);
        return false;
      }

      const currentBalance = balanceResult.balance || 0;
      console.log(`💰 Current wallet balance: ₹${currentBalance.toFixed(4)}`);

      // Estimate cost
      const estimatedTokens = Math.min(matchedChatbot.maxTokens || 150, messageContent.length * 2 + 100);
      const estimatedCost = WalletService.calculateCost(estimatedTokens, matchedChatbot.aiModel || 'gpt-3.5-turbo');

      console.log(`📊 Estimated cost: ₹${estimatedCost.toFixed(6)} for ~${estimatedTokens} tokens`);

      if (currentBalance < estimatedCost) {
        console.log(`❌ Insufficient balance: ₹${currentBalance.toFixed(4)} < ₹${estimatedCost.toFixed(6)}`);

        // Remove continuous mode due to insufficient balance
        await removeChatbotActiveForContact(matchedChatbot._id, contact._id);

        const lowBalanceMessage = `⚠️ Unable to process AI request due to insufficient wallet balance. Please recharge your account to continue using AI features.\n\nCurrent balance: ₹${currentBalance.toFixed(2)}\nRequired: ₹${estimatedCost.toFixed(4)}`;

        await sendChatbotMessage(contact, lowBalanceMessage, wabaAcc, {
          ...matchedChatbot,
          name: 'System Notification'
        });

        return true;
      }

      // Get conversation context if memory is enabled
      let conversationContext: any[] = [];
      if (matchedChatbot.conversationMemory) {
        const conversation = await Conversation.findOne({ contactId: contact._id });
        if (conversation && conversation.messages.length > 0) {
          const memoryDurationMs = matchedChatbot.memoryDuration * 60 * 1000;
          const cutoffTime = new Date(Date.now() - memoryDurationMs);

          const recentMessages = conversation.messages
            .filter(msg =>
              new Date(msg.timestamp) > cutoffTime &&
              msg.senderId !== 'system' &&
              msg.messageType !== 'system' &&
              msg.content &&
              msg.content.trim().length > 0 &&
              !msg.content.startsWith('⚠️') &&
              !msg.content.startsWith('❌') &&
              !msg.senderName?.includes('System')
            )
            .slice(-matchedChatbot.contextWindow * 2)
            .map(msg => ({
              role: msg.senderId === 'customer' ? 'user' as const : 'assistant' as const,
              content: msg.content.substring(0, 500)
            }));

          conversationContext = recentMessages.slice(-matchedChatbot.contextWindow);
          console.log(`📝 Using ${conversationContext.length} messages for context`);
        }
      }

      let enhancedSystemPrompt = matchedChatbot.systemPrompt;
      if (matchedChatbot.knowledgeBase?.enabled && matchedChatbot.knowledgeBase.documents?.length > 0) {
        console.log(`🔍 Searching knowledge base for: "${messageContent}"`);
        console.log(`📚 Knowledge base has ${matchedChatbot.knowledgeBase.documents.length} documents`);

        // 🔥 DEBUG: Log all documents and their status
        matchedChatbot.knowledgeBase.documents.forEach((doc: any, index: number) => {
          console.log(`📄 Document ${index + 1}:`);
          console.log(`   Name: ${doc.originalName || doc.filename}`);
          console.log(`   Status: ${doc.status}`);
          console.log(`   Chunks (count): ${doc.chunks || 'undefined'}`);
          console.log(`   ProcessedChunks (array): ${doc.processedChunks ? doc.processedChunks.length : 'undefined'}`);
          console.log(`   ProcessedAt: ${doc.processedAt || 'not processed'}`);
        });

        // 🔥 FIXED: Check for processed status and either processedChunks OR chunks count
        const processedDocs = matchedChatbot.knowledgeBase.documents.filter((doc: any) => {
          const isProcessed = doc.status === 'processed';
          const hasChunks = (doc.processedChunks && doc.processedChunks.length > 0) || (doc.chunks && doc.chunks > 0);

          console.log(`📋 Document "${doc.originalName}": processed=${isProcessed}, hasChunks=${hasChunks}`);

          return isProcessed && hasChunks;
        });

        console.log(`📋 ${processedDocs.length} documents are processed and ready for search`);

        if (processedDocs.length > 0) {
          try {
            console.log(`🔍 Calling KnowledgeBaseService.searchKnowledgeBase with ${processedDocs.length} documents`);

            // 🔥 CRITICAL FIX: If processedChunks don't exist, we need to re-process or use fallback
            const documentsWithChunks = await Promise.all(
              processedDocs.map(async (doc: any) => {
                if (doc.processedChunks && doc.processedChunks.length > 0) {
                  console.log(`✅ Document ${doc.originalName} has processedChunks: ${doc.processedChunks.length}`);
                  return doc;
                } else if (doc.chunks > 0 && doc.s3Url) {
                  console.log(`⚠️ Document ${doc.originalName} missing processedChunks, attempting to re-process...`);
                  // Try to re-download and re-process the document
                  try {
                    const reprocessedDoc = await reprocessDocumentFromS3(doc);
                    if (reprocessedDoc && reprocessedDoc.processedChunks) {
                      console.log(`✅ Re-processed ${doc.originalName}: ${reprocessedDoc.processedChunks.length} chunks`);

                      // Update the database with the re-processed chunks
                      await Chatbot.findOneAndUpdate(
                        { _id: chatbotId, 'knowledgeBase.documents.id': doc.id },
                        {
                          $set: {
                            'knowledgeBase.documents.$.processedChunks': reprocessedDoc.processedChunks,
                            'knowledgeBase.documents.$.textPreview': reprocessedDoc.textPreview
                          }
                        }
                      );

                      return { ...doc, processedChunks: reprocessedDoc.processedChunks };
                    }
                  } catch (reprocessError) {
                    console.error(`❌ Failed to re-process ${doc.originalName}:`, reprocessError);
                  }
                }

                console.log(`❌ Document ${doc.originalName} has no usable chunks`);
                return null;
              })
            );

            const validDocs = documentsWithChunks.filter(doc => doc !== null);

            if (validDocs.length === 0) {
              console.log(`❌ No documents with valid chunks available for search`);
            } else {
              const relevantContent = await KnowledgeBaseService.searchKnowledgeBase(
                messageContent,
                validDocs,
                matchedChatbot.knowledgeBase.settings?.maxRelevantChunks || 3
              );

              if (relevantContent.length > 0) {
                console.log(`📚 Found ${relevantContent.length} relevant knowledge base entries`);
                enhancedSystemPrompt = KnowledgeBaseService.generateEnhancedSystemPrompt(
                  matchedChatbot.systemPrompt,
                  relevantContent
                );
                console.log(`🧠 Enhanced system prompt length: ${enhancedSystemPrompt.length} characters`);
              } else {
                console.log(`📚 No relevant knowledge base content found for query: "${messageContent}"`);
              }
            }
          } catch (kbError) {
            console.error('❌ Error searching knowledge base:', kbError);
            console.error('❌ KB Error stack:', kbError.stack);
          }
        } else {
          console.log(`⚠️ No processed documents available in knowledge base`);
        }
      } else {
        console.log(`📚 Knowledge base not enabled or no documents available`);
      }

      // Add this helper function at the top of the file
      async function reprocessDocumentFromS3(doc: any) {
        try {
          if (!doc.s3Url) {
            throw new Error('No S3 URL available');
          }

          console.log(`📥 Re-downloading document from S3: ${doc.s3Url}`);

          // Download file from S3
          const response = await fetch(doc.s3Url);
          if (!response.ok) {
            throw new Error(`Failed to download from S3: ${response.status}`);
          }

          const fileBuffer = Buffer.from(await response.arrayBuffer());

          // Re-process the document
          const reprocessed = await KnowledgeBaseService.processDocument(
            fileBuffer,
            doc.originalName,
            doc.fileType,
            doc.fileSize,
            {
              chunkSize: 1000,
              chunkOverlap: 200
            }
          );

          return reprocessed;
        } catch (error) {
          console.error('Error re-processing document from S3:', error);
          return null;
        }
      }

      // Create context-aware system prompt
      const contextPrompt = isContinuousMode
        ? `${enhancedSystemPrompt}

CONTINUOUS CONVERSATION MODE:
- You are currently in an ongoing conversation with this customer
- Continue the conversation naturally based on the context
- Be helpful, engaging, and professional
- Ask follow-up questions when appropriate
- Keep responses under ${matchedChatbot.maxResponseLength || 1000} characters
- Remember previous context and build upon it`
        : `${enhancedSystemPrompt}

INITIAL CONVERSATION:
- This customer has just triggered our chatbot with their message
- Start a helpful conversation based on their query
- Be welcoming, professional, and informative
- Ask relevant questions to better assist them
- Keep responses under ${matchedChatbot.maxResponseLength || 1000} characters`;

      // Prepare messages for AI
      const messages = [
        { role: 'system' as const, content: contextPrompt },
        ...conversationContext,
        { role: 'user' as const, content: messageContent }
      ];

      console.log(`🤖 Generating AI response (${isContinuousMode ? 'continuous' : 'initial'}) with ${messages.length} context messages`);

      // Generate AI response
      const aiResponse = await generateChatbotResponse(
        messages,
        matchedChatbot.aiModel,
        matchedChatbot.temperature,
        matchedChatbot.maxTokens
      );

      console.log(`🤖 AI Response generated - Tokens: ${aiResponse.tokensUsed}, Cost: ₹${aiResponse.cost.toFixed(6)}`);

      // Final balance check
      const latestBalanceResult = await WalletService.getWalletBalance(companyId);
      const latestBalance = latestBalanceResult.success ? latestBalanceResult.balance : 0;

      if (latestBalance < aiResponse.cost) {
        console.log(`❌ Insufficient balance at deduction: ₹${latestBalance.toFixed(4)} < ₹${aiResponse.cost.toFixed(6)}`);

        // Remove continuous mode due to insufficient balance
        await removeChatbotActiveForContact(matchedChatbot._id, contact._id);

        const lowBalanceMessage = `⚠️ Unable to complete AI request due to insufficient wallet balance.\n\nCurrent balance: ₹${latestBalance.toFixed(2)}\nRequired: ₹${aiResponse.cost.toFixed(4)}`;

        await sendChatbotMessage(contact, lowBalanceMessage, wabaAcc, {
          ...matchedChatbot,
          name: 'System Notification'
        });

        return true;
      }

      // Deduct from wallet
      const walletResult = await WalletService.deductFromWallet(
        companyId,
        aiResponse.cost,
        `AI Chatbot: ${matchedChatbot.name} - ${aiResponse.tokensUsed} tokens - "${messageContent.substring(0, 50)}..."`,
        'other',
        matchedChatbot._id,
        {
          chatbotId: matchedChatbot._id,
          chatbotName: matchedChatbot.name,
          contactId: contact._id,
          contactPhone: contact.phone,
          tokensUsed: aiResponse.tokensUsed,
          aiModel: matchedChatbot.aiModel,
          messageContent: messageContent.substring(0, 100),
          knowledgeBaseUsed: enhancedSystemPrompt !== matchedChatbot.systemPrompt,
          conversationMode: isContinuousMode ? 'continuous' : 'initial'
        }
      );

      if (!walletResult.success) {
        console.error(`❌ Wallet deduction failed: ${walletResult.error}`);
        // Remove continuous mode on wallet failure
        await removeChatbotActiveForContact(matchedChatbot._id, contact._id);
        return false;
      }

      console.log(`💰 Wallet deduction successful. New balance: ₹${walletResult.balance?.toFixed(4)}`);

      // Truncate response if needed
      let responseContent = aiResponse.content;
      if (matchedChatbot.maxResponseLength && responseContent.length > matchedChatbot.maxResponseLength) {
        responseContent = responseContent.substring(0, matchedChatbot.maxResponseLength - 3) + '...';
      }

      // Send the AI response
      await sendChatbotMessage(contact, responseContent, wabaAcc, matchedChatbot);

      // Update chatbot statistics
      await Chatbot.findByIdAndUpdate(matchedChatbot._id, {
        $inc: {
          usageCount: 1,
          totalTokensUsed: aiResponse.tokensUsed,
          totalCostINR: aiResponse.cost
        },
        lastTriggered: new Date()
      });

      console.log(`✅ Chatbot response sent successfully!`);
      console.log(`   Mode: ${isContinuousMode ? 'CONTINUOUS' : 'INITIAL TRIGGER'}`);
      console.log(`   Chatbot: ${matchedChatbot.name}`);
      console.log(`   Response: "${responseContent.substring(0, 100)}..."`);

      return true;

    } catch (aiError) {
      console.error(`❌ Error generating AI response:`, aiError);

      // Send fallback message if enabled
      if (matchedChatbot.enableFallback && matchedChatbot.fallbackMessage) {
        await sendChatbotMessage(contact, matchedChatbot.fallbackMessage, wabaAcc, matchedChatbot);

        await Chatbot.findByIdAndUpdate(matchedChatbot._id, {
          $inc: { usageCount: 1 },
          lastTriggered: new Date()
        });

        return true;
      }

      return false;
    }

  } catch (error) {
    console.error('❌ Error in checkAndSendChatbotResponse:', error);
    return false;
  }
}

// Keep the existing checkChatbotTriggerMatch function
function checkChatbotTriggerMatch(messageContent: string, chatbot: any): boolean {
  if (!chatbot.triggers || chatbot.triggers.length === 0) {
    return false;
  }

  const content = chatbot.caseSensitive ? messageContent : messageContent.toLowerCase();

  return chatbot.triggers.some((trigger: string) => {
    if (!trigger.trim()) return false;

    const triggerText = chatbot.caseSensitive ? trigger : trigger.toLowerCase();

    switch (chatbot.matchType) {
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

// NEW: Helper functions to manage continuous conversation state
async function isChatbotActiveForContact(chatbotId: string, contactId: string): Promise<boolean> {
  try {
    // Check if there's an active conversation session in the last 30 minutes
    const conversation = await Conversation.findOne({ contactId });
    if (!conversation) return false;

    // Look for recent chatbot messages (within last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const recentChatbotMessage = conversation.messages.find(msg =>
      msg.senderName?.startsWith('AI:') &&
      new Date(msg.timestamp) > thirtyMinutesAgo
    );

    const hasRecentActivity = !!recentChatbotMessage;

    console.log(`🔍 Checking continuous mode for contact ${contactId}: ${hasRecentActivity ? 'ACTIVE' : 'INACTIVE'}`);

    return hasRecentActivity;
  } catch (error) {
    console.error('Error checking chatbot active status:', error);
    return false;
  }
}

async function setChatbotActiveForContact(chatbotId: string, contactId: string): Promise<void> {
  // This is automatically handled when we send a chatbot message
  // The presence of recent AI messages indicates active conversation
  console.log(`🔄 Chatbot ${chatbotId} is now active for contact ${contactId}`);
}

async function removeChatbotActiveForContact(chatbotId: string, contactId: string): Promise<void> {
  try {
    // Add a system message to indicate conversation end
    const conversation = await Conversation.findOne({ contactId });
    if (conversation) {
      const endMessage = {
        id: uuidv4(),
        senderId: 'system' as const,
        content: `🛑 Chatbot conversation ended`,
        messageType: 'system' as const,
        timestamp: new Date(),
        status: 'sent' as const,
        senderName: 'System'
      };

      conversation.messages.push(endMessage);
      await conversation.save();
    }

    console.log(`🛑 Chatbot ${chatbotId} is no longer active for contact ${contactId}`);
  } catch (error) {
    console.error('Error removing chatbot active status:', error);
  }
}

async function sendChatbotMessage(contact: any, message: string, wabaAcc: any, chatbot: any) {
  const messageId = uuidv4();

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

    // Pre-record the message
    await recordChatbotMessageInConversation(
      contact,
      message,
      messageId,
      chatbot.name
    );

    console.log('🤖 Sending chatbot response:', JSON.stringify(whatsappPayload, null, 2));

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
    console.log('🤖 Chatbot response result:', responseText);

    if (response.ok) {
      const responseData = JSON.parse(responseText);
      if (responseData.messages?.[0]?.id) {
        await updateMessageWithWhatsAppId(
          contact._id,
          messageId,
          responseData.messages[0].id
        );
      }
      console.log('✅ Chatbot message sent successfully');
    } else {
      console.error('❌ Failed to send chatbot message:', responseText);
      await updateMessageAsFailed(
        contact._id,
        messageId,
        `Chatbot message failed: ${response.status}`,
        response.status.toString()
      );
    }

  } catch (error: any) {
    console.error('❌ Error sending chatbot message:', error);
    await updateMessageAsFailed(
      contact._id,
      messageId,
      `Chatbot error: ${error.message}`,
      'send_error'
    );
  }
}

async function recordChatbotMessageInConversation(
  contact: any,
  messageContent: string,
  messageId: string,
  chatbotName: string
) {
  try {
    const conversation = await Conversation.findOne({ contactId: contact._id });
    if (!conversation) return;

    const chatbotMessage = {
      id: messageId,
      senderId: 'agent' as const,
      content: messageContent,
      messageType: 'text',
      timestamp: new Date(),
      status: 'sent' as const,
      senderName: `AI: ${chatbotName}`,
      whatsappMessageId: undefined,
      errorMessage: undefined,
      errorCode: undefined,
      retryCount: 0
    };

    conversation.messages.push(chatbotMessage);
    conversation.lastMessage = messageContent;
    conversation.lastMessageType = 'text';
    conversation.lastMessageAt = new Date();

    await conversation.save();
    console.log('🤖 Chatbot message recorded in conversation');

  } catch (error) {
    console.error('❌ Error recording chatbot message:', error);
  }
}

