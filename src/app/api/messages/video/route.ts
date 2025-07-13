import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import User from '@/models/User';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import { v4 as uuidv4 } from 'uuid';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;

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

    const { contactId, videoUrl, caption } = await req.json();

    if (!contactId || !videoUrl) {
      return NextResponse.json({
        success: false,
        message: 'Contact ID and video URL are required'
      }, { status: 400 });
    }

    // Find the contact
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return NextResponse.json({ success: false, message: 'Contact not found' }, { status: 404 });
    }

    // Find user and WABA account
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const wabaAccount = user.wabaAccounts?.find((account: any) => account.wabaId === contact.wabaId);
    if (!wabaAccount) {
      return NextResponse.json({ success: false, message: 'WABA account not found' }, { status: 404 });
    }

    // Validate phone number format
    let phoneNumber = contact.phone;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    // Check if videoUrl is a handle or URL
    const isMediaHandle = /^[a-zA-Z0-9]+$/.test(videoUrl);

    const messageData = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneNumber,
      type: 'video',
      video: isMediaHandle ? {
        id: videoUrl,
        caption: caption || ''
      } : {
        link: videoUrl,
        caption: caption || ''
      }
    };

    console.log('Sending video message:', JSON.stringify(messageData, null, 2));

    // Send message via Interakt API
    const interaktResponse = await fetch(
      `https://amped-express.interakt.ai/api/v17.0/${wabaAccount.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'x-access-token': INT_TOKEN!,
          'x-waba-id': contact.wabaId,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(messageData)
      }
    );

    const responseText = await interaktResponse.text();
    
    if (!interaktResponse.ok) {
      console.error('Failed to send video message:', responseText);
      return NextResponse.json({
        success: false,
        message: 'Failed to send video message',
        details: responseText
      }, { status: 400 });
    }

    let interaktData;
    try {
      interaktData = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid response from WhatsApp API'
      }, { status: 400 });
    }

    // Save message to conversation
    let conversation = await Conversation.findOne({ contactId: contact._id });

    const newMessage = {
      id: uuidv4(),
      senderId: 'agent' as const,
      content: caption || 'Video message',
      messageType: 'video',
      timestamp: new Date(),
      status: 'sent' as const,
      whatsappMessageId: interaktData.messages?.[0]?.id,
      senderName: user.name || 'Agent',
      media: {
        url: videoUrl,
        caption,
        type: 'video'
      }
    };

    if (conversation) {
      conversation.messages.push(newMessage);
      conversation.lastMessage = caption || 'Video message';
      conversation.lastMessageType = 'video';
      conversation.lastMessageAt = new Date();
      conversation.status = 'active';

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
        lastMessage: caption || 'Video message',
        lastMessageType: 'video',
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
        media: newMessage.media
      },
      conversationId: conversation._id
    });

  } catch (error) {
    console.error('Error sending video message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send video message' },
      { status: 500 }
    );
  }
}