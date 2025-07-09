import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import AutoReply from '@/models/AutoReply';
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

    const autoReplies = await AutoReply.find({
      userId: decoded.id,
      wabaId
    }).sort({ priority: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      autoReplies
    });

  } catch (error) {
    console.error('Error fetching auto replies:', error);
    return NextResponse.json({
      error: 'Failed to fetch auto replies'
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
      triggers,
      replyMessage,
      replyType,
      templateName,
      templateLanguage,
      templateComponents,
      matchType,
      caseSensitive,
      priority,
      isActive
    } = await req.json();

    // Validate required fields
    if (!wabaId || !name || !triggers?.length || !replyMessage) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Verify user has access to this WABA
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasWabaAccess = user.wabaAccounts?.some((account: any) => account.wabaId === wabaId);
    if (!hasWabaAccess) {
      return NextResponse.json({ error: 'Access denied to this WABA' }, { status: 403 });
    }

    // Create auto reply
    const autoReply = await AutoReply.create({
      userId: decoded.id,
      wabaId,
      name,
      triggers: triggers.map((trigger: string) => trigger.trim()).filter(Boolean),
      replyMessage,
      replyType: replyType || 'text',
      templateName,
      templateLanguage: templateLanguage || 'en',
      templateComponents,
      matchType: matchType || 'contains',
      caseSensitive: caseSensitive || false,
      priority: priority || 0,
      isActive: isActive !== false
    });

    return NextResponse.json({
      success: true,
      autoReply
    });

  } catch (error) {
    console.error('Error creating auto reply:', error);
    return NextResponse.json({
      error: 'Failed to create auto reply'
    }, { status: 500 });
  }
}
