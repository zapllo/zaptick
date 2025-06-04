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

    const { note } = await req.json();
    if (!note || !note.trim()) {
      return NextResponse.json(
        { success: false, message: 'Note content is required' },
        { status: 400 }
      );
    }

    // Find the conversation
    const conversation = await Conversation.findById(params.id);
    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Add the note as a special message type
    const noteMessage = {
      id: uuidv4(),
      senderId: 'agent',
      content: `📝 Note: ${note.trim()}`,
      messageType: 'note',
      timestamp: new Date(),
      status: 'sent'
    };

    await Conversation.findByIdAndUpdate(
      params.id,
      { $push: { messages: noteMessage } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding note to conversation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add note to conversation' },
      { status: 500 }
    );
  }
}
