import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import { v4 as uuidv4 } from 'uuid';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { contactId, message, messageType = 'text' } = await req.json();

    if (!contactId || !message) {
      return NextResponse.json({
        error: 'Missing required fields: contactId, message'
      }, { status: 400 });
    }

    // Find the contact
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Ensure wabaAccounts exists and find the WABA account
    const wabaAccounts = user.wabaAccounts || [];
    const wabaAccount = wabaAccounts.find(account => account.wabaId === contact.wabaId);
    if (!wabaAccount) {
      return NextResponse.json({ error: 'WABA account not found' }, { status: 404 });
    }

    // Validate phone number format
    let phoneNumber = contact.phone;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    // Prepare WhatsApp message payload
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

    console.log('Sending message to WhatsApp:');
    console.log('Phone Number ID:', wabaAccount.phoneNumberId);
    console.log('WABA ID:', contact.wabaId);
    console.log('Payload:', JSON.stringify(whatsappPayload, null, 2));

    // Validate required environment variables
    if (!INT_TOKEN) {
      console.error('INTERAKT_API_TOKEN is not set');
      return NextResponse.json({
        error: 'Server configuration error: Missing API token'
      }, { status: 500 });
    }

    // Send message via Interakt API
    const interaktResponse = await fetch(
      `https://amped-express.interakt.ai/api/v17.0/${wabaAccount.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'x-access-token': INT_TOKEN,
          'x-waba-id': contact.wabaId,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(whatsappPayload)
      }
    );

    console.log('Interakt response status:', interaktResponse.status);
    console.log('Interakt response headers:', Object.fromEntries(interaktResponse.headers.entries()));

    const responseText = await interaktResponse.text();
    console.log('WhatsApp API response text:', responseText);

    let interaktData;

    // Handle non-JSON responses
    if (!responseText || responseText === 'Invalid request' || responseText.startsWith('<!DOCTYPE')) {
      console.error('Invalid response from WhatsApp API:', responseText);
      return NextResponse.json({
        error: 'Invalid response from WhatsApp API',
        details: `Status: ${interaktResponse.status}, Response: ${responseText}`,
        phoneNumberId: wabaAccount.phoneNumberId,
        wabaId: contact.wabaId
      }, { status: 400 });
    }

    try {
      interaktData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse WhatsApp response:', parseError);
      return NextResponse.json({
        error: 'Invalid JSON response from WhatsApp API',
        details: responseText,
        status: interaktResponse.status
      }, { status: 400 });
    }

    if (!interaktResponse.ok) {
      console.error('WhatsApp API error:', interaktData);

      // Handle specific error cases
      let errorMessage = 'Failed to send message';
      if (interaktData.error?.message) {
        errorMessage = interaktData.error.message;
      } else if (interaktData.error?.error_data?.details) {
        errorMessage = interaktData.error.error_data.details;
      } else if (typeof interaktData.error === 'string') {
        errorMessage = interaktData.error;
      }

      return NextResponse.json({
        error: errorMessage,
        details: interaktData,
        status: interaktResponse.status
      }, { status: 400 });
    }

    // Create or update conversation
    let conversation = await Conversation.findOne({ contactId: contact._id });

    const newMessage = {
      id: uuidv4(),
      senderId: 'agent' as const,
      content: message,
      messageType: 'text',
      timestamp: new Date(),
      status: 'sent' as const,
      whatsappMessageId: interaktData.messages?.[0]?.id
    };

    if (conversation) {
      conversation.messages.push(newMessage);
      conversation.lastMessage = message;
      conversation.lastMessageType = 'text';
      conversation.lastMessageAt = new Date();
      conversation.status = 'active';

      // Check if still within 24 hours
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      conversation.isWithin24Hours = conversation.lastMessageAt > last24Hours;
    } else {
      conversation = new Conversation({
        contactId: contact._id,
        wabaId: contact.wabaId,
        phoneNumberId: contact.phoneNumberId,
        userId: decoded.id,
        messages: [newMessage],
        lastMessage: message,
        lastMessageType: 'text',
        lastMessageAt: new Date(),
        isWithin24Hours: true
      });
    }

    await conversation.save();

    // Update contact's last message time
    contact.lastMessageAt = new Date();
    await contact.save();

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        content: newMessage.content,
        timestamp: newMessage.timestamp,
        status: newMessage.status,
        whatsappMessageId: newMessage.whatsappMessageId
      },
      conversationId: conversation._id
    });

  } catch (error) {
    console.error('Message sending error:', error);
    return NextResponse.json({
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
