import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import InstagramAccount from '@/models/InstagramAccount';
import InstagramConversation from '@/models/InstagramConversation';
import { InstagramService } from '@/lib/instagram';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { conversationId, message, instagramBusinessId } = await req.json();

    if (!conversationId || !message || !instagramBusinessId) {
      return NextResponse.json({
        error: 'Missing required fields: conversationId, message, instagramBusinessId'
      }, { status: 400 });
    }

    // Find Instagram account
    const instagramAccount = await InstagramAccount.findOne({
      instagramBusinessId,
      userId: decoded.id
    });

    if (!instagramAccount) {
      return NextResponse.json({ error: 'Instagram account not found' }, { status: 404 });
    }

    // Find conversation
    const conversation = await InstagramConversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Check if within 24-hour window
    if (!conversation.isWithin24Hours) {
      return NextResponse.json({
        error: 'Cannot send message outside 24-hour window',
        message: 'You can only send messages within 24 hours of the customer\'s last message'
      }, { status: 400 });
    }

    // Send message via Instagram API
    const sendResult = await InstagramService.sendMessage(
      instagramBusinessId,
      conversation.instagramUserId,
      message,
      instagramAccount.accessToken
    );

    if (!sendResult.success) {
      return NextResponse.json({
        error: 'Failed to send Instagram message',
        details: sendResult.error
      }, { status: 400 });
    }

    // Create message record
    const newMessage = {
      id: uuidv4(),
      senderId: 'agent' as const,
      content: message,
      messageType: 'text' as const,
      timestamp: new Date(),
      status: 'sent' as const,
      instagramMessageId: sendResult.messageId,
      senderName: user.name || 'Agent'
    };

    // Update conversation
    conversation.messages.push(newMessage);
    conversation.lastMessage = message;
    conversation.lastMessageType = 'text';
    conversation.lastMessageAt = new Date();

    await conversation.save();

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        content: newMessage.content,
        timestamp: newMessage.timestamp,
        status: newMessage.status,
        instagramMessageId: newMessage.instagramMessageId,
        senderName: newMessage.senderName
      },
      conversationId: conversation._id
    });

  } catch (error) {
    console.error('Instagram message sending error:', error);
    return NextResponse.json({
      error: 'Failed to send Instagram message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const url = new URL(req.url);
    const instagramBusinessId = url.searchParams.get('instagramBusinessId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (!instagramBusinessId) {
      return NextResponse.json({
        error: 'Missing required parameter: instagramBusinessId'
      }, { status: 400 });
    }

    // Find conversations
    const conversations = await InstagramConversation.find({
      instagramAccountId: instagramBusinessId,
      userId: decoded.id
    })
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await InstagramConversation.countDocuments({
      instagramAccountId: instagramBusinessId,
      userId: decoded.id
    });

    return NextResponse.json({
      success: true,
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching Instagram conversations:', error);
    return NextResponse.json({
      error: 'Failed to fetch conversations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}