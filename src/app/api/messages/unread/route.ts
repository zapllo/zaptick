import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

export async function GET(req: NextRequest) {
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

    // Find conversations with unread messages
    const conversations = await Conversation.find({
      userId: decoded.id,
      unreadCount: { $gt: 0 }
    })
    .populate('contactId', 'name phone')
    .sort({ lastMessageAt: -1 })
    .limit(50) // Limit to prevent performance issues
    .lean();

    // Extract unread messages from conversations
    const unreadMessages = conversations.flatMap(conversation => {
      if (!conversation.messages || conversation.messages.length === 0) return [];
      
      // Get the last few messages that are unread (customer messages only)
      const customerMessages = conversation.messages
        .filter(msg => msg.senderId === 'customer')
        .slice(-conversation.unreadCount) // Get the last unread messages
        .map(message => ({
          id: message.id,
          conversationId: conversation._id.toString(),
          contactName: conversation.contactId?.name || 'Unknown Contact',
          contactId: conversation.contactId?._id?.toString() || conversation.contactId?.toString(),
          content: message.content,
          timestamp: message.timestamp,
          messageType: message.messageType
        }));

      return customerMessages;
    });

    // Sort by timestamp (most recent first)
    unreadMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Calculate total unread count
    const totalUnreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

    return NextResponse.json({
      success: true,
      messages: unreadMessages.slice(0, 20), // Limit to 20 most recent
      totalCount: totalUnreadCount
    });

  } catch (error) {
    console.error('Unread messages fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch unread messages'
    }, { status: 500 });
  }
}