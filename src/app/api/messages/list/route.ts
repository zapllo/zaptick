import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import dbConnect from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import Conversation from '@/models/Conversation';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const { to, text, buttonText, sections, conversationId } = await req.json();

    if (!to || !text || !buttonText || !sections || !Array.isArray(sections)) {
      return NextResponse.json({
        success: false,
        message: 'Phone number, text, button text, and sections are required'
      }, { status: 400 });
    }

    const messageData = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: {
          text
        },
        action: {
          button: buttonText,
          sections
        }
      }
    };

    const result = await sendWhatsAppMessage(messageData);

    // Save message to conversation if conversationId provided
    if (conversationId) {
      const message = {
        id: uuidv4(),
        senderId: 'bot',
        content: text,
        messageType: 'interactive',
        timestamp: new Date(),
        status: 'sent',
        interactive: {
          type: 'list',
          buttonText,
          sections
        }
      };

      await Conversation.findByIdAndUpdate(
        conversationId,
        { 
          $push: { messages: message },
          lastMessage: text,
          lastMessageTime: new Date(),
          status: 'active'
        }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error sending list message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send list message' },
      { status: 500 }
    );
  }
}