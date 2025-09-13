import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import AutoReply from '@/models/AutoReply';
import User from '@/models/User';
import Workflow from '@/models/Workflow';

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

    // Populate workflow details for workflow-type auto replies
    const autoReplies = await AutoReply.find({
      userId: decoded.id,
      wabaId
    }).populate({
      path: 'workflowId',
      select: 'name description isActive'
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
      workflowId, // Added workflow ID
      matchType,
      caseSensitive,
      priority,
      isActive
    } = await req.json();

    // Validate required fields
    if (!wabaId || !name || !triggers?.length) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Validate reply type specific fields
    if (replyType === 'text' && !replyMessage) {
      return NextResponse.json({
        error: 'Reply message is required for text type'
      }, { status: 400 });
    }

    if (replyType === 'template' && !templateName) {
      return NextResponse.json({
        error: 'Template name is required for template type'
      }, { status: 400 });
    }

    if (replyType === 'workflow' && !workflowId) {
      return NextResponse.json({
        error: 'Workflow ID is required for workflow type'
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

    // If workflow type, verify the workflow exists and belongs to the user
    if (replyType === 'workflow' && workflowId) {
      const workflow = await Workflow.findOne({
        _id: workflowId,
        userId: decoded.id,
        wabaId
      });

      if (!workflow) {
        return NextResponse.json({
          error: 'Workflow not found or access denied'
        }, { status: 404 });
      }
    }

    // Create auto reply
    const autoReply = await AutoReply.create({
      userId: decoded.id,
      wabaId,
      name,
      triggers: triggers.map((trigger: string) => trigger.trim()).filter(Boolean),
      replyMessage: replyMessage || `Workflow: ${name}`, // Default message for workflow type
      replyType: replyType || 'text',
      templateName,
      templateLanguage: templateLanguage || 'en',
      templateComponents,
      workflowId: replyType === 'workflow' ? workflowId : undefined,
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