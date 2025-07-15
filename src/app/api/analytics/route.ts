import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import Template from '@/models/Template';
import Campaign from '@/models/Campaign';
import AutoReply from '@/models/AutoReply';
import Workflow from '@/models/Workflow';

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

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || 'week';
    const wabaId = searchParams.get('wabaId');

    if (!wabaId) {
      return NextResponse.json({ error: 'WABA ID is required' }, { status: 400 });
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));

    // Base query for filtering by user and WABA
    const baseQuery = {
      userId: decoded.id,
      wabaId: wabaId
    };

    // Get conversations with populated contact data
    const conversations = await Conversation.find(baseQuery)
      .populate('contactId', 'name phone email')
      .sort({ lastMessageAt: -1 });

    // Safely calculate total messages
    const totalMessages = conversations.reduce((sum, conv) => {
      return sum + (conv.messages?.length || 0);
    }, 0);

    // Get messages in time range
    const messagesInRange = conversations.reduce((sum, conv) => {
      if (!conv.messages || !Array.isArray(conv.messages)) return sum;
      
      const messagesInTimeRange = conv.messages.filter(msg => {
        try {
          return msg.timestamp && new Date(msg.timestamp) >= startDate;
        } catch (error) {
          console.error('Error parsing message timestamp:', error);
          return false;
        }
      });
      return sum + messagesInTimeRange.length;
    }, 0);

    // Get previous period messages for comparison
    const messagesInPrevious = conversations.reduce((sum, conv) => {
      if (!conv.messages || !Array.isArray(conv.messages)) return sum;
      
      const messagesInTimeRange = conv.messages.filter(msg => {
        try {
          if (!msg.timestamp) return false;
          const msgDate = new Date(msg.timestamp);
          return msgDate >= previousStartDate && msgDate < startDate;
        } catch (error) {
          console.error('Error parsing message timestamp:', error);
          return false;
        }
      });
      return sum + messagesInTimeRange.length;
    }, 0);

    // Get active conversations (conversations with messages in last 24 hours)
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const activeConversations = await Conversation.countDocuments({
      ...baseQuery,
      lastMessageAt: { $gte: last24Hours }
    });

    // Get previous period active conversations
    const previous24Hours = new Date(previousStartDate.getTime() - 24 * 60 * 60 * 1000);
    const previousActiveConversations = await Conversation.countDocuments({
      ...baseQuery,
      lastMessageAt: { $gte: previous24Hours, $lt: last24Hours }
    });

    // Get total contacts
    const totalContacts = await Contact.countDocuments(baseQuery);
    const contactsInRange = await Contact.countDocuments({
      ...baseQuery,
      createdAt: { $gte: startDate }
    });
    const contactsInPrevious = await Contact.countDocuments({
      ...baseQuery,
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });

    // Get template statistics
    const templates = await Template.find({
      userId: decoded.id,
      wabaId: wabaId
    });

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
        utility: templates.filter(t => t.category === 'UTILITY').length,
      },
      mostUsed: templates
        .sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
        .slice(0, 5)
        .map(t => ({
          name: t.name,
          category: t.category.toLowerCase(),
          useCount: t.useCount || 0,
          deliveryRate: calculateDeliveryRate(t.name, conversations),
          readRate: calculateReadRate(t.name, conversations)
        }))
    };

    // Generate message trend data
    const messageTrend = generateMessageTrend(conversations, startDate, timeRange);

    // Calculate message metrics
    const messageMetrics = calculateMessageMetrics(conversations, startDate);

    // Get recent messages
    const recentMessages = getRecentMessages(conversations, 10);

    // Get contact metrics
    const contactMetrics = {
      total: totalContacts,
      new: contactsInRange,
      engagementRate: calculateEngagementRate(conversations, totalContacts).toFixed(1)
    };

    // Get campaigns data
    const campaigns = await Campaign.find({
      userId: decoded.id,
      createdAt: { $gte: startDate }
    });

    const campaignMetrics = {
      active: campaigns.filter(c => c.status === 'active').length,
      totalSent: campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0),
      conversionRate: calculateCampaignConversionRate(campaigns)
    };

    // Get workflows data
    const workflows = await Workflow.find({
      userId: decoded.id,
      wabaId: wabaId
    });

    const workflowMetrics = {
      active: workflows.filter(w => w.isActive).length,
      totalExecutions: workflows.reduce((sum, w) => sum + (w.executionCount || 0), 0),
      timeSaved: calculateTimeSaved(workflows)
    };

    // Get auto-replies data
    const autoReplies = await AutoReply.find({
      userId: decoded.id,
      wabaId: wabaId
    });

    const autoReplyMetrics = {
      active: autoReplies.filter(ar => ar.isActive).length,
      totalUsage: autoReplies.reduce((sum, ar) => sum + (ar.usageCount || 0), 0)
    };

    // Calculate cost metrics
    const costMetrics = calculateCostMetrics(messagesInRange, templates.length);

    // Get geographic distribution
    const geographicData = await getGeographicDistribution(baseQuery);

    // Get peak hours data
    const peakHoursData = getPeakHours(conversations, startDate);

    // Get message types distribution
    const messageTypesData = getMessageTypesDistribution(conversations, startDate);

    // Generate insights
    const insights = generateInsights(messageMetrics, templateStats, contactMetrics);

    const analytics = {
      totalMessages: messagesInRange,
      previousMessages: messagesInPrevious,
      activeConversations,
      previousActiveConversations,
      totalContacts,
      contactsInRange,
      contactsInPrevious,
      templateStats,
      messageTrend,
      contactMetrics,
      recentMessages,
      messageMetrics,
      campaignMetrics,
      workflowMetrics,
      autoReplyMetrics,
      costMetrics,
      geographicData,
      peakHoursData,
      messageTypesData,
      insights
    };

    return NextResponse.json({
      success: true,
      analytics,
      timeRange,
      wabaId
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch analytics data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper functions with improved error handling
function calculateDeliveryRate(templateName: string, conversations: any[]): number {
  try {
    const templateMessages = conversations.flatMap(conv => 
      (conv.messages || []).filter((msg: any) => msg.templateName === templateName)
    );
    
    if (templateMessages.length === 0) return 0;
    
    const deliveredMessages = templateMessages.filter(msg => 
      msg.status === 'delivered' || msg.status === 'read'
    );
    
    return Math.round((deliveredMessages.length / templateMessages.length) * 100);
  } catch (error) {
    console.error('Error calculating delivery rate:', error);
    return 0;
  }
}

function calculateReadRate(templateName: string, conversations: any[]): number {
  try {
    const templateMessages = conversations.flatMap(conv => 
      (conv.messages || []).filter((msg: any) => msg.templateName === templateName)
    );
    
    if (templateMessages.length === 0) return 0;
    
    const readMessages = templateMessages.filter(msg => msg.status === 'read');
    
    return Math.round((readMessages.length / templateMessages.length) * 100);
  } catch (error) {
    console.error('Error calculating read rate:', error);
    return 0;
  }
}

function generateMessageTrend(conversations: any[], startDate: Date, timeRange: string) {
  try {
    const days = timeRange === 'today' ? 1 : timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const trend = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const dayMessages = conversations.reduce((sum, conv) => {
        if (!conv.messages || !Array.isArray(conv.messages)) return sum;
        
        const dayMsgs = conv.messages.filter((msg: any) => {
          try {
            if (!msg.timestamp) return false;
            const msgDate = new Date(msg.timestamp);
            return msgDate >= date && msgDate < nextDate;
          } catch (error) {
            return false;
          }
        });
        return sum + dayMsgs.length;
      }, 0);
      
      trend.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayMessages
      });
    }
    
    return trend;
  } catch (error) {
    console.error('Error generating message trend:', error);
    return [];
  }
}

function calculateMessageMetrics(conversations: any[], startDate: Date) {
  try {
    const allMessages = conversations.flatMap(conv => 
      (conv.messages || []).filter((msg: any) => {
        try {
          return msg.timestamp && new Date(msg.timestamp) >= startDate;
        } catch (error) {
          return false;
        }
      })
    );
    
    if (allMessages.length === 0) {
      return {
        deliveryRate: 0,
        readRate: 0,
        responseRate: 0,
        responseTime: 0
      };
    }
    
    const deliveredMessages = allMessages.filter(msg => 
      msg.status === 'delivered' || msg.status === 'read'
    );
    const readMessages = allMessages.filter(msg => msg.status === 'read');
    
    // Calculate response rate and time
    const customerMessages = allMessages.filter(msg => msg.senderId === 'customer');
    const agentMessages = allMessages.filter(msg => msg.senderId === 'agent');
    
    let totalResponseTime = 0;
    let responseCount = 0;
    
    customerMessages.forEach(customerMsg => {
      try {
        const laterAgentMsg = agentMessages.find(agentMsg => 
          agentMsg.timestamp && customerMsg.timestamp &&
          new Date(agentMsg.timestamp) > new Date(customerMsg.timestamp)
        );
        
        if (laterAgentMsg) {
          responseCount++;
          totalResponseTime += new Date(laterAgentMsg.timestamp).getTime() - new Date(customerMsg.timestamp).getTime();
        }
      } catch (error) {
        // Skip this message if timestamp parsing fails
      }
    });
    
    const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;
    
    return {
      deliveryRate: Math.round((deliveredMessages.length / allMessages.length) * 100),
      readRate: Math.round((readMessages.length / allMessages.length) * 100),
      responseRate: customerMessages.length > 0 ? Math.round((responseCount / customerMessages.length) * 100) : 0,
      responseTime: Math.round(avgResponseTime / (1000 * 60 * 60)) // Convert to hours
    };
  } catch (error) {
    console.error('Error calculating message metrics:', error);
    return {
      deliveryRate: 0,
      readRate: 0,
      responseRate: 0,
      responseTime: 0
    };
  }
}

function getRecentMessages(conversations: any[], limit: number) {
  try {
    const allMessages = conversations.flatMap(conv => {
      if (!conv.messages || !Array.isArray(conv.messages)) return [];
      
      return conv.messages.map((msg: any) => ({
        ...msg,
        contactName: conv.contactId?.name || 'Unknown Contact',
        content: msg.content || '' // Ensure content exists
      }));
    });
    
    return allMessages
      .filter(msg => msg.timestamp) // Only include messages with timestamps
      .sort((a, b) => {
        try {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        } catch (error) {
          return 0;
        }
      })
      .slice(0, limit)
      .map(msg => ({
        id: msg.id || Math.random().toString(36).substr(2, 9),
        name: msg.contactName,
        message: msg.content ? (msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : '')) : 'No content',
        time: getRelativeTime(new Date(msg.timestamp)),
        read: msg.status === 'read'
      }));
  } catch (error) {
    console.error('Error getting recent messages:', error);
    return [];
  }
}

function calculateEngagementRate(conversations: any[], totalContacts: number): number {
  try {
    if (totalContacts === 0) return 0;
    
    const engagedContacts = conversations.filter(conv => {
      if (!conv.messages || !Array.isArray(conv.messages)) return false;
      return conv.messages.some((msg: any) => msg.senderId === 'customer');
    }).length;
    
    return (engagedContacts / totalContacts) * 100;
  } catch (error) {
    console.error('Error calculating engagement rate:', error);
    return 0;
  }
}

function calculateCampaignConversionRate(campaigns: any[]): number {
  try {
    if (campaigns.length === 0) return 0;
    
    const totalSent = campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + (c.stats?.conversions || 0), 0);
    
    return totalSent > 0 ? Math.round((totalConversions / totalSent) * 100 * 100) / 100 : 0;
  } catch (error) {
    console.error('Error calculating campaign conversion rate:', error);
    return 0;
  }
}

function calculateTimeSaved(workflows: any[]): number {
  try {
    // Estimate 2 minutes saved per workflow execution
    const totalExecutions = workflows.reduce((sum, w) => sum + (w.executionCount || 0), 0);
    return Math.round(totalExecutions * 2 / 60); // Convert to hours
  } catch (error) {
    console.error('Error calculating time saved:', error);
    return 0;
  }
}

function calculateCostMetrics(messagesCount: number, templatesCount: number) {
  try {
    const costPerMessage = 0.12; // ₹0.12 per message
    const totalCost = messagesCount * costPerMessage;
    
    return {
      thisMonth: Math.round(totalCost),
      costPerMessage: costPerMessage,
      savingsVsEmail: 68 // Estimate based on email marketing costs
    };
  } catch (error) {
    console.error('Error calculating cost metrics:', error);
    return {
      thisMonth: 0,
      costPerMessage: 0.12,
      savingsVsEmail: 68
    };
  }
}

async function getGeographicDistribution(baseQuery: any) {
  try {
    // This would require country code data in contacts
    // For now, return mock data based on typical Indian business distribution
    return [
      { country: 'India', percentage: 78, flag: '🇮🇳' },
      { country: 'United States', percentage: 12, flag: '🇺🇸' },
      { country: 'United Kingdom', percentage: 6, flag: '🇬🇧' },
      { country: 'Canada', percentage: 4, flag: '🇨🇦' },
    ];
  } catch (error) {
    console.error('Error getting geographic distribution:', error);
    return [];
  }
}

function getPeakHours(conversations: any[], startDate: Date) {
  try {
    const hourCounts = new Array(24).fill(0);
    
    conversations.forEach(conv => {
      if (!conv.messages || !Array.isArray(conv.messages)) return;
      
      conv.messages.forEach((msg: any) => {
        try {
          if (!msg.timestamp) return;
          const msgDate = new Date(msg.timestamp);
          if (msgDate >= startDate) {
            const hour = msgDate.getHours();
            hourCounts[hour]++;
          }
        } catch (error) {
          // Skip messages with invalid timestamps
        }
      });
    });
    
    return [
      { hour: '9 AM', messages: hourCounts[9] || 0 },
      { hour: '10 AM', messages: hourCounts[10] || 0 },
      { hour: '11 AM', messages: hourCounts[11] || 0 },
      { hour: '12 PM', messages: hourCounts[12] || 0 },
      { hour: '1 PM', messages: hourCounts[13] || 0 },
      { hour: '2 PM', messages: hourCounts[14] || 0 },
      { hour: '3 PM', messages: hourCounts[15] || 0 },
      { hour: '4 PM', messages: hourCounts[16] || 0 },
    ];
  } catch (error) {
    console.error('Error getting peak hours:', error);
    return [];
  }
}

function getMessageTypesDistribution(conversations: any[], startDate: Date) {
  try {
    const typeCounts = {
      text: 0,
      template: 0,
      media: 0
    };
    
    conversations.forEach(conv => {
      if (!conv.messages || !Array.isArray(conv.messages)) return;
      
      conv.messages.forEach((msg: any) => {
        try {
          if (!msg.timestamp) return;
          const msgDate = new Date(msg.timestamp);
          if (msgDate >= startDate) {
            if (msg.messageType === 'template') {
              typeCounts.template++;
            } else if (['image', 'video', 'audio', 'document'].includes(msg.messageType)) {
              typeCounts.media++;
            } else {
              typeCounts.text++;
            }
          }
        } catch (error) {
          // Skip messages with invalid timestamps
        }
      });
    });
    
    const total = typeCounts.text + typeCounts.template + typeCounts.media;
    
    return {
      text: total > 0 ? Math.round((typeCounts.text / total) * 100) : 0,
      template: total > 0 ? Math.round((typeCounts.template / total) * 100) : 0,
      media: total > 0 ? Math.round((typeCounts.media / total) * 100) : 0
    };
  } catch (error) {
    console.error('Error getting message types distribution:', error);
    return {
      text: 0,
      template: 0,
      media: 0
    };
  }
}

function generateInsights(messageMetrics: any, templateStats: any, contactMetrics: any) {
  try {
    const insights = [];
    
    // Performance insight
    if (messageMetrics.deliveryRate > 90) {
      insights.push({
        type: 'success',
        title: 'Excellent Delivery Rate',
        content: `Your message delivery rate of ${messageMetrics.deliveryRate}% is excellent. Keep up the good work!`,
        icon: 'trending-up'
      });
    } else if (messageMetrics.deliveryRate < 70) {
      insights.push({
        type: 'warning',
        title: 'Delivery Rate Needs Improvement',
        content: `Your delivery rate of ${messageMetrics.deliveryRate}% could be improved. Check your templates and sending practices.`,
        icon: 'alert-circle'
      });
    }
    
    // Template insight
    if (templateStats.approved > 0) {
      insights.push({
        type: 'info',
        title: 'Template Performance',
        content: `You have ${templateStats.approved} approved templates. Consider creating more templates for better automation.`,
        icon: 'file-text'
      });
    }
    
    // Engagement insight
    const engagementRate = parseFloat(contactMetrics.engagementRate || '0');
    if (engagementRate > 60) {
      insights.push({
        type: 'success',
        title: 'High Engagement',
        content: `Your contact engagement rate of ${engagementRate}% is above average. Your audience is highly engaged!`,
        icon: 'users'
      });
    }
    
    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

function getRelativeTime(date: Date): string {
  try {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error getting relative time:', error);
    return 'Unknown time';
  }
}