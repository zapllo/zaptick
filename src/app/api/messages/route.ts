import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import { v4 as uuidv4 } from 'uuid';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;

// ... existing code ...

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Read the request body ONCE and store it
    const requestData = await req.json();
    const {
      contactId,
      message,
      messageType = 'text',
      senderName,
      templateName,
      templateId,
      language = 'en',
      templateComponents
    } = requestData;

    if (!contactId) {
      return NextResponse.json({
        error: 'Missing required field: contactId'
      }, { status: 400 });
    }

    // For text messages, validate message content
    if (messageType === 'text' && !message) {
      return NextResponse.json({
        error: 'Missing required field: message for text message'
      }, { status: 400 });
    }

    // For template messages, validate required fields
    if (messageType === 'template' && !templateName) {
      return NextResponse.json({
        error: 'Missing required field: templateName for template message'
      }, { status: 400 });
    }

    // Find the contact
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Ensure wabaAccounts exists and find the WABA account
    const wabaAccounts = user.wabaAccounts || [];
    const wabaAccount = wabaAccounts.find((account: any) => account.wabaId === contact.wabaId);
    if (!wabaAccount) {
      return NextResponse.json({ error: 'WABA account not found' }, { status: 404 });
    }

    // Validate phone number format
    let phoneNumber = contact.phone;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    // Prepare WhatsApp message payload based on message type
    let whatsappPayload;

    if (messageType === 'template') {
      // Basic template structure
      whatsappPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: language
          }
        }
      };

      // Add components if provided (for templates with variables or media)
      if (templateComponents && Array.isArray(templateComponents) && templateComponents.length > 0) {
        (whatsappPayload.template as any).components = templateComponents;
      }
    } else {
      // Default text message payload
      whatsappPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "text",
        text: {
          preview_url: false,
          body: message
        }
      };
    }

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

    // Determine content for displaying in the conversation
    const messageContent = messageType === 'template'
      ? `Template: ${templateName}`
      : message;

    const newMessage = {
      id: uuidv4(),
      senderId: 'agent' as const,
      content: messageContent,
      messageType: messageType,
      timestamp: new Date(),
      status: 'sent' as const,
      whatsappMessageId: interaktData.messages?.[0]?.id,
      senderName: senderName || user.name || 'Agent',
      templateName: messageType === 'template' ? templateName : undefined
    };

    if (conversation) {
      conversation.messages.push(newMessage);
      conversation.lastMessage = messageContent;
      conversation.lastMessageType = messageType;
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
        lastMessage: messageContent,
        lastMessageType: messageType,
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
        whatsappMessageId: newMessage.whatsappMessageId,
        senderName: newMessage.senderName,
        templateName: newMessage.templateName
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
