import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Chatbot from '@/models/Chatbot';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const wabaId = searchParams.get('wabaId');

    if (!wabaId) {
      return NextResponse.json({ error: 'WABA ID is required' }, { status: 400 });
    }

    const chatbots = await Chatbot.find({
      userId: decoded.id,
      wabaId
    }).sort({ priority: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      chatbots
    });

  } catch (error) {
    console.error('Error fetching chatbots:', error);
    return NextResponse.json({
      error: 'Failed to fetch chatbots'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const {
      wabaId,
      name,
      description,
      aiModel,
      systemPrompt,
      temperature,
      maxTokens,
      triggers,
      matchType,
      caseSensitive,
      priority,
      fallbackMessage,
      enableFallback,
      maxResponseLength,
      conversationMemory,
      memoryDuration,
      contextWindow,
      tags,
      knowledgeBase,
      isActive
    } = await req.json();

    // Validate required fields
    if (!wabaId || !name || !triggers?.length || !systemPrompt) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Verify user has access to this WABA
    const user = await User.findById(decoded.id).populate('companyId');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasWabaAccess = user.wabaAccounts?.some((account: any) => account.wabaId === wabaId);
    if (!hasWabaAccess) {
      return NextResponse.json({ error: 'Access denied to this WABA' }, { status: 403 });
    }

    // Check subscription and limits
    const company = user.companyId as any;
    const subscriptionPlan = company?.subscriptionPlan || 'free';
    const subscriptionStatus = company?.subscriptionStatus || 'expired';

    if (subscriptionStatus !== 'active') {
      return NextResponse.json({
        error: 'Your subscription is not active. Please upgrade to create chatbots.',
        code: 'SUBSCRIPTION_INACTIVE'
      }, { status: 403 });
    }

    // Define chatbot limits based on subscription plan
    const planLimits = {
      free: 1,
      starter: 1,
      explore: 1,
      growth: 5,
      advanced: 25,
      enterprise: Infinity
    };

    const currentLimit = planLimits[subscriptionPlan as keyof typeof planLimits] || planLimits.free;
    const existingChatbotsCount = await Chatbot.countDocuments({
      userId: decoded.id,
      wabaId
    });

    if (existingChatbotsCount >= currentLimit) {
      return NextResponse.json({
        error: `You've reached the chatbot limit for your ${subscriptionPlan} plan.`,
        code: 'CHATBOT_LIMIT_REACHED',
        currentCount: existingChatbotsCount,
        limit: currentLimit,
        plan: subscriptionPlan
      }, { status: 403 });
    }

    // Create chatbot
    const chatbot = await Chatbot.create({
      userId: decoded.id,
      wabaId,
      name,
      description,
      aiModel: aiModel || 'gpt-3.5-turbo',
      systemPrompt,
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens || 500,
      triggers: triggers.map((trigger: string) => trigger.trim()).filter(Boolean),
      matchType: matchType || 'contains',
      caseSensitive: caseSensitive || false,
      priority: priority || 0,
      fallbackMessage: fallbackMessage || 'I apologize, but I\'m having trouble understanding your request.',
      enableFallback: enableFallback !== false,
      maxResponseLength: maxResponseLength || 1000,
      conversationMemory: conversationMemory !== false,
      memoryDuration: memoryDuration || 30,
      contextWindow: contextWindow || 5,
      tags: tags || [],
      isActive: isActive !== false
    });
    // Handle knowledge base if provided
    if (knowledgeBase && knowledgeBase.enabled) {
      await Chatbot.findByIdAndUpdate(chatbot._id, {
        $set: {
          'knowledgeBase.enabled': true,
          'knowledgeBase.settings': knowledgeBase.settings
        }
      });
    }
    return NextResponse.json({
      success: true,
      chatbot,
      chatbotCount: existingChatbotsCount + 1,
      chatbotLimit: currentLimit
    });

  } catch (error) {
    console.error('Error creating chatbot:', error);
    return NextResponse.json({
      error: 'Failed to create chatbot'
    }, { status: 500 });
  }
}
