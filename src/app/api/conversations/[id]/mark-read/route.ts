import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const conversationId = params.id;

    // Update conversation to mark as read
    const conversation = await Conversation.findOneAndUpdate(
      { 
        _id: conversationId, 
        userId: decoded.id 
      },
      { 
        $set: { unreadCount: 0 }
      },
      { new: true }
    );

    if (!conversation) {
      return NextResponse.json({
        error: 'Conversation not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json({
      error: 'Failed to mark conversation as read'
    }, { status: 500 });
  }
}