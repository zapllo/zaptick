import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import AutoReply from '@/models/AutoReply';
import Workflow from '@/models/Workflow';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const autoReply = await AutoReply.findOne({
      _id: params.id,
      userId: decoded.id
    });

    if (!autoReply) {
      return NextResponse.json({ error: 'Auto reply not found' }, { status: 404 });
    }

    const updateData = await req.json();

    // Validate workflow if replyType is workflow
    if (updateData.replyType === 'workflow' && updateData.workflowId) {
      const workflow = await Workflow.findOne({
        _id: updateData.workflowId,
        userId: decoded.id,
        wabaId: autoReply.wabaId
      });

      if (!workflow) {
        return NextResponse.json({
          error: 'Workflow not found or access denied'
        }, { status: 404 });
      }
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key === 'triggers' && Array.isArray(updateData[key])) {
        autoReply[key] = updateData[key].map((trigger: string) => trigger.trim()).filter(Boolean);
      } else if (updateData[key] !== undefined) {
        autoReply[key] = updateData[key];
      }
    });

    // Clear workflow-specific fields if not workflow type
    if (updateData.replyType && updateData.replyType !== 'workflow') {
      autoReply.workflowId = undefined;
    }

    // Clear template-specific fields if not template type
    if (updateData.replyType && updateData.replyType !== 'template') {
      autoReply.templateName = undefined;
      autoReply.templateLanguage = undefined;
      autoReply.templateComponents = undefined;
    }

    await autoReply.save();

    return NextResponse.json({
      success: true,
      autoReply
    });

  } catch (error) {
    console.error('Error updating auto reply:', error);
    return NextResponse.json({
      error: 'Failed to update auto reply'
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const autoReply = await AutoReply.findOneAndDelete({
      _id: params.id,
      userId: decoded.id
    });

    if (!autoReply) {
      return NextResponse.json({ error: 'Auto reply not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Auto reply deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting auto reply:', error);
    return NextResponse.json({
      error: 'Failed to delete auto reply'
    }, { status: 500 });
  }
}