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

    const { assignedTo } = await req.json();
    if (!assignedTo) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find the user to get their name
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return NextResponse.json(
        { success: false, message: 'Assigned user not found' },
        { status: 404 }
      );
    }

    // Update the conversation
    const conversation = await Conversation.findByIdAndUpdate(
      params.id,
      { assignedTo },
      { new: true }
    );

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Add a system message about the assignment
    const systemMessage = {
      id: uuidv4(),
      senderId: 'system',
      content: `Conversation assigned to ${assignedUser.name}`,
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
    console.error('Error assigning conversation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to assign conversation' },
      { status: 500 }
    );
  }
}
