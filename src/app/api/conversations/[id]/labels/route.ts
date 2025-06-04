import { NextRequest, NextResponse } from 'next/server';
import Conversation from '@/models/Conversation';
import Label from '@/models/Label';
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

    const { labelId } = await req.json();
    if (!labelId) {
      return NextResponse.json(
        { success: false, message: 'Label ID is required' },
        { status: 400 }
      );
    }

    // Find the label to get its name
    const label = await Label.findById(labelId);
    if (!label) {
      return NextResponse.json(
        { success: false, message: 'Label not found' },
        { status: 404 }
      );
    }

    // Update the conversation
    const conversation = await Conversation.findById(params.id);
    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Only add the label if it's not already present
    if (!conversation.labels || !conversation.labels.includes(labelId)) {
      conversation.labels = [...(conversation.labels || []), labelId];
      await conversation.save();

      // Add a system message about the label addition
      const systemMessage = {
        id: uuidv4(),
        senderId: 'system',
        content: `Label added: ${label.name}`,
        messageType: 'system',
        timestamp: new Date(),
        status: 'sent'
      };

      await Conversation.findByIdAndUpdate(
        params.id,
        { $push: { messages: systemMessage } }
      );
    }

    return NextResponse.json({ success: true, conversation });
  } catch (error) {
    console.error('Error adding label to conversation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add label to conversation' },
      { status: 500 }
    );
  }
}
