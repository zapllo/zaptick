import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import InstagramAccount from '@/models/InstagramAccount';
import InstagramComment from '@/models/InstagramComment';
import { InstagramService } from '@/lib/instagram';

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

    const url = new URL(req.url);
    const instagramBusinessId = url.searchParams.get('instagramBusinessId');
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (!instagramBusinessId) {
      return NextResponse.json({
        error: 'Missing required parameter: instagramBusinessId'
      }, { status: 400 });
    }

    // Build query
    const query: any = {
      instagramAccountId: instagramBusinessId,
      userId: decoded.id
    };

    if (status) {
      query.status = status;
    }

    // Find comments
    const comments = await InstagramComment.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await InstagramComment.countDocuments(query);

    return NextResponse.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching Instagram comments:', error);
    return NextResponse.json({
      error: 'Failed to fetch comments',
      details: error instanceof Error ? error.message : 'Unknown error'
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

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { commentId, replyText, action } = await req.json();

    if (!commentId) {
      return NextResponse.json({
        error: 'Missing required field: commentId'
      }, { status: 400 });
    }

    // Find comment
    const comment = await InstagramComment.findOne({
      commentId,
      userId: decoded.id
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Find Instagram account
    const instagramAccount = await InstagramAccount.findOne({
      instagramAccountId: comment.instagramAccountId,
      userId: decoded.id
    });

    if (!instagramAccount) {
      return NextResponse.json({ error: 'Instagram account not found' }, { status: 404 });
    }

    if (action === 'reply' && replyText) {
      // Reply to comment
      const replyResult = await InstagramService.replyToComment(
        commentId,
        replyText,
        instagramAccount.accessToken
      );

      if (!replyResult.success) {
        return NextResponse.json({
          error: 'Failed to reply to comment',
          details: replyResult.error
        }, { status: 400 });
      }

      // Update comment record
      comment.businessReply = {
        commentId: replyResult.replyId,
        text: replyText,
        timestamp: new Date(),
        status: 'sent',
        agentName: user.name || 'Agent'
      };
      comment.status = 'replied';

      await comment.save();

      return NextResponse.json({
        success: true,
        replyId: replyResult.replyId,
        comment: comment
      });

    } else if (action === 'hide') {
      // Hide comment
      const hideResult = await InstagramService.hideComment(
        commentId,
        true,
        instagramAccount.accessToken
      );

      if (!hideResult.success) {
        return NextResponse.json({
          error: 'Failed to hide comment',
          details: hideResult.error
        }, { status: 400 });
      }

      comment.isHidden = true;
      comment.status = 'ignored';
      await comment.save();

      return NextResponse.json({
        success: true,
        comment: comment
      });

    } else if (action === 'show') {
      // Show comment
      const showResult = await InstagramService.hideComment(
        commentId,
        false,
        instagramAccount.accessToken
      );

      if (!showResult.success) {
        return NextResponse.json({
          error: 'Failed to show comment',
          details: showResult.error
        }, { status: 400 });
      }

      comment.isHidden = false;
      await comment.save();

      return NextResponse.json({
        success: true,
        comment: comment
      });

    } else {
      return NextResponse.json({
        error: 'Invalid action or missing replyText for reply action'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Instagram comment action error:', error);
    return NextResponse.json({
      error: 'Failed to perform comment action',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}