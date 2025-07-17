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

    const { contactId, mediaUrl, caption, mediaType = 'image' } = await req.json();

    if (!contactId || !mediaUrl) {
      return NextResponse.json({
        success: false,
        message: 'Contact ID and media URL are required'
      }, { status: 400 });
    }

    // Validate media type
    const validMediaTypes = ['image', 'video', 'document', 'audio'];
    if (!validMediaTypes.includes(mediaType)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid media type'
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

    // Check if mediaUrl is a handle or URL
    const isMediaHandle = /^[a-zA-Z0-9]+$/.test(mediaUrl);

    // Build message data based on media type
    const messageData = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneNumber,
      type: mediaType,
      [mediaType]: isMediaHandle ? {
        id: mediaUrl,
        ...(caption && { caption })
      } : {
        link: mediaUrl,
        ...(caption && { caption })
      }
    };

    // For documents, add filename if available
    if (mediaType === 'document' && !isMediaHandle) {
      const filename = mediaUrl.split('/').pop() || 'document';
      messageData[mediaType].filename = filename;
    }

    console.log('Sending media message:', JSON.stringify(messageData, null, 2));

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
      console.error('Failed to send media message:', responseText);
      return NextResponse.json({
        success: false,
        message: 'Failed to send media message',
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
      content: caption || `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} message`,
      messageType: mediaType,
      timestamp: new Date(),
      status: 'sent' as const,
      whatsappMessageId: interaktData.messages?.[0]?.id,
      senderName: user.name || 'Agent',
      mediaUrl,
      mediaCaption: caption
    };

    if (conversation) {
      conversation.messages.push(newMessage);
      conversation.lastMessage = caption || `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} message`;
      conversation.lastMessageType = mediaType;
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
        lastMessage: caption || `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} message`,
        lastMessageType: mediaType,
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
        mediaUrl: newMessage.mediaUrl,
        mediaCaption: newMessage.mediaCaption
      },
      conversationId: conversation._id
    });

  } catch (error) {
    console.error('Error sending media message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send media message' },
      { status: 500 }
    );
  }
}