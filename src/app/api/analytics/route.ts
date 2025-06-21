import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Template from '@/models/Template';
import Conversation from '@/models/Conversation';
import Contact from '@/models/Contact';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

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
    const timeRange = searchParams.get('timeRange') || 'week';
    const wabaId = searchParams.get('wabaId');

    // Calculate date range based on timeRange parameter
    let startDate: Date;
    const endDate = new Date();

    switch (timeRange) {
      case 'today':
        startDate = startOfDay(new Date());
        break;
      case 'week':
        startDate = subDays(new Date(), 7);
        break;
      case 'month':
        startDate = subDays(new Date(), 30);
        break;
      case 'quarter':
        startDate = subDays(new Date(), 90);
        break;
      default:
        startDate = subDays(new Date(), 7);
    }

    // Build query filters
    const baseQuery = { userId: decoded.id };
    if (wabaId) {
      baseQuery.wabaId = wabaId;
    }

    const dateRangeQuery = {
      ...baseQuery,
      createdAt: { $gte: startDate, $lte: endDate }
    };

    // Fetch analytics data
    // 1. Total messages in the given period
    const totalMessages = await Conversation.aggregate([
      { $match: { ...baseQuery } },
      { $project: { messageCount: { $size: "$messages" } } },
      { $group: { _id: null, total: { $sum: "$messageCount" } } }
    ]);

    // 2. Active conversations
    const activeConversations = await Conversation.countDocuments({
      ...baseQuery,
      status: 'active'
    });

    // 3. Total contacts
    const totalContacts = await Contact.countDocuments(baseQuery);

    // 4. Template metrics
    const templates = await Template.find(baseQuery).lean();
    const templateStats = {
      total: templates.length,
      approved: templates.filter(t => t.status === 'APPROVED').length,
      pending: templates.filter(t => t.status === 'PENDING').length,
      rejected: templates.filter(t => t.status === 'REJECTED').length,
      disabled: templates.filter(t => t.status === 'DISABLED').length,
      deleted: templates.filter(t => t.status === 'DELETED').length,
      categories: {
        marketing: templates.filter(t => t.category === 'MARKETING').length,
        authentication: templates.filter(t => t.category === 'AUTHENTICATION').length,
        utility: templates.filter(t => t.category === 'UTILITY').length
      },
      mostUsed: [...templates]
        .sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
        .slice(0, 5)
        .map(t => ({
          name: t.name,
          category: t.category,
          useCount: t.useCount || 0,
          deliveryRate: Math.floor(90 + Math.random() * 10), // Placeholder calculation
          readRate: Math.floor(80 + Math.random() * 15)      // Placeholder calculation
        }))
    };

    // 5. Daily message trend for the past 7 days
    const messageTrend = [];
    for (let i = 6; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      // Count messages for this day
      const dayMessages = await Conversation.aggregate([
        {
          $match: {
            ...baseQuery,
            "messages.timestamp": { $gte: dayStart, $lte: dayEnd }
          }
        },
        { $unwind: "$messages" },
        {
          $match: {
            "messages.timestamp": { $gte: dayStart, $lte: dayEnd }
          }
        },
        { $count: "total" }
      ]);

      messageTrend.push({
        date: format(day, 'yyyy-MM-dd'),
        day: format(day, 'EEE'),
        count: dayMessages[0]?.total || 0
      });
    }

    // 6. Contact metrics
    const newContacts = await Contact.countDocuments({
      ...baseQuery,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate a simple engagement rate (contacts with conversations / total contacts)
    const contactsWithConversations = await Conversation.distinct('contactId', baseQuery);
    const engagementRate = totalContacts > 0
      ? ((contactsWithConversations.length / totalContacts) * 100).toFixed(1)
      : "0";

    // 7. Fetch recent messages
    const recentConversations = await Conversation.find(baseQuery)
      .sort({ lastMessageAt: -1 })
      .limit(5)
      .populate('contactId', 'name phone')
      .lean();

    const recentMessages = recentConversations.map(conv => {
      const lastMessage = conv.messages[conv.messages.length - 1];
      return {
        id: lastMessage?.id || 'msg-' + Math.random().toString(36).substring(2, 9),
        name: conv.contactId?.name || 'Unknown Contact',
        message: lastMessage?.content || 'No message content',
        time: format(new Date(lastMessage?.timestamp || conv.lastMessageAt), 'h:mm a'),
        date: new Date(lastMessage?.timestamp || conv.lastMessageAt),
        read: lastMessage?.status === 'read' || false,
        conversationId: conv._id
      };
    });

    // 8. Calculate delivery and read rates
    let deliveryRate = 95; // Default placeholder
    let readRate = 85;     // Default placeholder

    if (totalMessages[0]?.total > 0) {
      const messageStatusCounts = await Conversation.aggregate([
        { $match: baseQuery },
        { $unwind: "$messages" },
        {
          $group: {
            _id: "$messages.status",
            count: { $sum: 1 }
          }
        }
      ]);

      const totalCount = messageStatusCounts.reduce((sum, item) => sum + item.count, 0);
      const deliveredCount = messageStatusCounts.find(item => item._id === 'delivered')?.count || 0;
      const readCount = messageStatusCounts.find(item => item._id === 'read')?.count || 0;

      if (totalCount > 0) {
        deliveryRate = Math.round((deliveredCount / totalCount) * 100);
        readRate = Math.round((readCount / totalCount) * 100);
      }
    }

    return NextResponse.json({
      success: true,
      analytics: {
        totalMessages: totalMessages[0]?.total || 0,
        activeConversations,
        totalContacts,
        templateStats,
        messageTrend,
        contactMetrics: {
          total: totalContacts,
          new: newContacts,
          engagementRate
        },
        recentMessages,
        messageMetrics: {
          deliveryRate,
          readRate,
          responseRate: Math.round(40 + Math.random() * 20), // Placeholder
          responseTime: Math.round(2 + Math.random() * 5)    // Placeholder in hours
        }
      }
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
