import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Contact from '@/models/Contact';

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

    const { searchParams } = new URL(req.url);
    const wabaId = searchParams.get('wabaId');
    const status = searchParams.get('status');
    const contactId = searchParams.get('contactId');

    // Build query
    const query: any = { userId: decoded.id };
    if (wabaId) query.wabaId = wabaId;
    if (status && status !== 'all') query.status = status;
    if (contactId) query.contactId = contactId;

    const conversations = await Conversation.find(query)
      .populate('contactId', 'name phone email whatsappOptIn tags')
      .sort({ lastMessageAt: -1 })
      .lean();

    // Update 24-hour status for all conversations
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const conversationsToUpdate = conversations.filter(conv => {
      const shouldBeWithin24Hours = conv.lastMessageAt > last24Hours;
      return conv.isWithin24Hours !== shouldBeWithin24Hours;
    });

    if (conversationsToUpdate.length > 0) {
      await Promise.all(
        conversationsToUpdate.map(conv =>
          Conversation.findByIdAndUpdate(conv._id, {
            isWithin24Hours: conv.lastMessageAt > last24Hours
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      conversations: conversations.map(conversation => ({
        id: conversation._id,
        contact: conversation.contactId,
        lastMessage: conversation.lastMessage,
        lastMessageType: conversation.lastMessageType,
        lastMessageAt: conversation.lastMessageAt,
        status: conversation.status,
        assignedTo: conversation.assignedTo,
        unreadCount: conversation.unreadCount,
        tags: conversation.tags,
        isWithin24Hours: conversation.lastMessageAt > last24Hours,
        messageCount: conversation.messages?.length || 0
      }))
    });

  } catch (error) {
    console.error('Conversations fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch conversations'
    }, { status: 500 });
  }
}
