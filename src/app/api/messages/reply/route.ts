import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import Contact from '@/models/Contact';
import User from '@/models/User';
import Conversation from '@/models/Conversation';
import { v4 as uuidv4 } from 'uuid';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '') as { id: string };

    if (!decoded?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const {
      contactId,
      conversationId,
      message,
      replyToMessageId,
    } = await req.json();

    if (!contactId || !message || !replyToMessageId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await User.findById(decoded.id);
    const contact = await Contact.findById(contactId);
    const conversation = await Conversation.findById(conversationId);

    if (!user || !contact || !conversation) {
      return NextResponse.json({ error: 'User, contact, or conversation not found' }, { status: 404 });
    }

    const phone = contact.phone.startsWith('+') ? contact.phone : `+${contact.phone}`;

    const interaktPayload = {
      messaging_product: 'whatsapp',
      context: {
        message_id: replyToMessageId
      },
      to: phone,
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    };

    const interaktRes = await fetch(`https://amped-express.interakt.ai/api/v17.0/${contact.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'x-access-token': INT_TOKEN || '',
        'x-waba-id': contact.wabaId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(interaktPayload)
    });

    const responseText = await interaktRes.text();
    const interaktData = JSON.parse(responseText);

    if (!interaktRes.ok) {
      return NextResponse.json({
        error: 'Failed to send reply',
        details: interaktData
      }, { status: 400 });
    }

    const newMessage = {
      id: uuidv4(),
      senderId: 'agent',
      content: message,
      messageType: 'text',
      timestamp: new Date(),
      status: 'sent',
      senderName: user.name,
      whatsappMessageId: interaktData.messages?.[0]?.id,
      replyTo: replyToMessageId
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = message;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return NextResponse.json({
      success: true,
      message: newMessage
    });
  } catch (err) {
    console.error('Reply send error:', err);
    return NextResponse.json({
      error: 'Internal server error',
      details: err instanceof Error ? err.message : err
    }, { status: 500 });
  }
}
