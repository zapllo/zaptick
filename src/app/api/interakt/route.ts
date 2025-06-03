/* app/api/interakt/route.ts */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import { v4 as uuidv4 } from 'uuid';

const TP_SIGNUP_URL = 'https://api.interakt.ai/v1/organizations/tp-signup/';
const INT_API_TOKEN = process.env.INTERAKT_API_TOKEN!;

export async function GET(req: NextRequest) {
  const challenge = new URL(req.url).searchParams.get('hub.challenge');
  return new Response(challenge ?? 'OK', { status: 200 });
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const raw = await req.text();

  console.log('Interakt webhook received:', raw);

  const body = JSON.parse(raw);
  const value = body?.entry?.[0]?.changes?.[0]?.value ?? {};
  const event = value.event;
  const waba = value.waba_info;

  /* Handle incoming messages */
  if (value.messaging_product === 'whatsapp' && value.messages) {
    console.log('Processing incoming WhatsApp messages:', value.messages);

    try {
      await processIncomingMessages(value);
    } catch (error) {
      console.error('Error processing incoming messages:', error);
    }
  }

  /* ①  Partner just finished embedded-signup → ask Interakt to attach credit line */
  if (event === 'PARTNER_ADDED' && waba?.waba_id) {
    console.log('PARTNER_ADDED event:', waba);

    await fetch(TP_SIGNUP_URL, {
      method: 'POST',
      headers: {
        Authorization: INT_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object: 'tech_partner',
        entry: [{ changes: [{ value: { event, waba_info: waba } }] }],
      }),
    });
  }

  /* ②  Interakt confirms everything is ready → persist for later API calls */
  if (event === 'WABA_ONBOARDED') {
    console.log('WABA_ONBOARDED event:', value);

    try {
      // Try multiple ways to get user ID
      const userId = value.userId ||
                     value.user_id ||
                     value.setup?.userId ||
                     waba?.setup?.userId ||
                     body.userId;

      if (userId) {
        const wabaAccount = {
          wabaId: value.waba_id || waba?.waba_id,
          phoneNumberId: value.phone_number_id || waba?.phone_number_id,
          businessName: value.business_name || waba?.business_name || 'New Business',
          phoneNumber: value.phone_number || waba?.phone_number || '',
          connectedAt: new Date(),
          status: 'active',
          isvNameToken: value.isv_name_token || waba?.isv_name_token || '',
          provider: 'interakt', // Mark as Interakt-managed
        };

        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $push: { wabaAccounts: wabaAccount } },
          { new: true }
        );

        if (updatedUser) {
          console.log(`✅ WABA saved to user ${userId}:`, wabaAccount);
        } else {
          console.error(`❌ User not found: ${userId}`);
        }
      } else {
        console.log('⚠️ No user ID in webhook. Full payload:', JSON.stringify(body, null, 2));
      }
    } catch (error) {
      console.error('❌ Error updating user with WABA:', error);
    }
  }

  return NextResponse.json({ received: true });
}

async function processIncomingMessages(value: any) {
  const phoneNumberId = value.metadata?.phone_number_id;
  const messages = value.messages || [];
  const contacts = value.contacts || [];

  if (!phoneNumberId) {
    console.error('No phone_number_id in webhook');
    return;
  }

  // Find the user who owns this phone number ID
  const user = await User.findOne({
    'wabaAccounts.phoneNumberId': phoneNumberId
  });

  if (!user) {
    console.error(`No user found for phone_number_id: ${phoneNumberId}`);
    return;
  }

  const wabaAccount = user.wabaAccounts.find(
    account => account.phoneNumberId === phoneNumberId
  );

  if (!wabaAccount) {
    console.error(`No WABA account found for phone_number_id: ${phoneNumberId}`);
    return;
  }

  // Process each message
  for (const message of messages) {
    try {
      await processMessage(message, contacts, user._id, wabaAccount);
    } catch (error) {
      console.error('Error processing individual message:', error);
    }
  }
}

async function processMessage(message: any, contacts: any[], userId: string, wabaAccount: any) {
  const senderPhone = message.from;
  const messageId = message.id;
  const timestamp = new Date(parseInt(message.timestamp) * 1000);

  let messageContent = '';
  let messageType = 'text';

  // Extract message content based on type
  if (message.type === 'text') {
    messageContent = message.text?.body || '';
    messageType = 'text';
  } else if (message.type === 'image') {
    messageContent = message.image?.caption || 'Image';
    messageType = 'image';
  } else if (message.type === 'document') {
    messageContent = message.document?.filename || 'Document';
    messageType = 'document';
  } else if (message.type === 'audio') {
    messageContent = 'Voice message';
    messageType = 'audio';
  } else if (message.type === 'video') {
    messageContent = message.video?.caption || 'Video';
    messageType = 'video';
  } else {
    messageContent = `Unsupported message type: ${message.type}`;
    messageType = message.type;
  }

  console.log(`Processing ${messageType} message from ${senderPhone}: ${messageContent}`);

  // Find or create contact
  let contact = await Contact.findOne({
    phone: senderPhone,
    wabaId: wabaAccount.wabaId
  });

  if (!contact) {
    // Get contact name from webhook contacts array
    const contactInfo = contacts.find(c => c.wa_id === senderPhone);
    const contactName = contactInfo?.profile?.name || `Contact ${senderPhone}`;

    contact = new Contact({
      name: contactName,
      phone: senderPhone,
      wabaId: wabaAccount.wabaId,
      phoneNumberId: wabaAccount.phoneNumberId,
      userId: userId,
      whatsappOptIn: true, // User messaged us, so they're opted in
      lastMessageAt: timestamp
    });

    await contact.save();
    console.log(`Created new contact: ${contactName} (${senderPhone})`);
  } else {
    // Update existing contact
    contact.lastMessageAt = timestamp;
    contact.whatsappOptIn = true; // Update opt-in status
    await contact.save();
  }

  // Create message object
  const newMessage = {
    id: uuidv4(),
    senderId: 'customer' as const,
    content: messageContent,
    messageType: messageType,
    timestamp: timestamp,
    status: 'delivered' as const,
    whatsappMessageId: messageId
  };

  // Find or create conversation
  let conversation = await Conversation.findOne({
    contactId: contact._id
  });

  if (conversation) {
    // Add message to existing conversation
    conversation.messages.push(newMessage);
    conversation.lastMessage = messageContent;
    conversation.lastMessageType = messageType;
    conversation.lastMessageAt = timestamp;
    conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    conversation.status = 'active';

    // Update 24-hour window status
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    conversation.isWithin24Hours = timestamp > last24Hours;
  } else {
    // Create new conversation
    conversation = new Conversation({
      contactId: contact._id,
      wabaId: wabaAccount.wabaId,
      phoneNumberId: wabaAccount.phoneNumberId,
      userId: userId,
      messages: [newMessage],
      lastMessage: messageContent,
      lastMessageType: messageType,
      lastMessageAt: timestamp,
      unreadCount: 1,
      status: 'active',
      isWithin24Hours: true
    });
  }

  await conversation.save();
  console.log(`Message saved to conversation: ${conversation._id}`);
}
