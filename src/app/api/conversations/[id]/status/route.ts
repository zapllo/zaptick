import { NextRequest, NextResponse } from 'next/server';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const { status } = await req.json();
    if (!status || !['active', 'closed', 'resolved', 'pending'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Valid status is required' },
        { status: 400 }
      );
    }

    // Update the conversation
    const conversation = await Conversation.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Add a system message about the status change
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    const systemMessage = {
      id: uuidv4(),
      senderId: 'system',
      content: `Conversation marked as ${statusText}`,
      messageType: 'system',
      timestamp: new Date(),
      status: 'sent'
    };

    await Conversation.findByIdAndUpdate(
      params.id,
      { $push: { messages: systemMessage } }
    );

    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error('Error updating conversation status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update conversation status' },
      { status: 500 }
    );
  }
}
