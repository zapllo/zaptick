import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const conversation = await Conversation.findOne({
      _id: params.id,
      userId: decoded.id
    }).populate('contactId', 'name phone email whatsappOptIn tags notes');

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Mark as read and reset unread count
    if (conversation.unreadCount > 0) {
      conversation.unreadCount = 0;
      await conversation.save();
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation._id,
        contact: conversation.contactId,
        messages: conversation.messages,
        status: conversation.status,
        assignedTo: conversation.assignedTo,
        tags: conversation.tags,
        isWithin24Hours: conversation.isWithin24Hours,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt
      }
    });

  } catch (error) {
    console.error('Conversation messages fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch conversation messages'
    }, { status: 500 });
  }
}
