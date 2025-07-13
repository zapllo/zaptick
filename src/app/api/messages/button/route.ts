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

    const { to, text, buttons, conversationId } = await req.json();

    if (!to || !text || !buttons || !Array.isArray(buttons)) {
      return NextResponse.json({
        success: false,
        message: 'Phone number, text, and buttons are required'
      }, { status: 400 });
    }

    // Format buttons for WhatsApp API
    const formattedButtons = buttons.map((button: { id: string; title: string }) => ({
      type: 'reply',
      reply: {
        id: button.id,
        title: button.title
      }
    }));

    const messageData = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text
        },
        action: {
          buttons: formattedButtons
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
          type: 'button',
          buttons: formattedButtons
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
    console.error('Error sending button message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send button message' },
      { status: 500 }
    );
  }
}