import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import AutoReply from '@/models/AutoReply';
import User from '@/models/User';
import { sampleAutoReplies } from '@/lib/autoReplyUtils';

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

    const { wabaId } = await req.json();

    if (!wabaId) {
      return NextResponse.json({ error: 'WABA ID is required' }, { status: 400 });
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

    // Check if samples already exist
    const existingCount = await AutoReply.countDocuments({
      userId: decoded.id,
      wabaId
    });

    if (existingCount > 0) {
      return NextResponse.json({
        error: 'Auto replies already exist for this account'
      }, { status: 400 });
    }

    // Create sample auto replies
    const autoReplies = await Promise.all(
      sampleAutoReplies.map(sample =>
        AutoReply.create({
          userId: decoded.id,
          wabaId,
          name: sample.name,
          triggers: sample.triggers,
          replyMessage: sample.replyMessage,
          replyType: 'text',
          matchType: sample.matchType,
          caseSensitive: false,
          priority: sample.priority,
          isActive: true
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Created ${autoReplies.length} sample auto replies`,
      autoReplies
    });

  } catch (error) {
    console.error('Error creating sample auto replies:', error);
    return NextResponse.json({
      error: 'Failed to create sample auto replies'
    }, { status: 500 });
  }
}
