import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Workflow from '@/models/Workflow';

export async function GET(
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

    const workflow = await Workflow.findOne({
      _id: params.id,
      userId: decoded.id
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      workflow
    });

  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json({
      error: 'Failed to fetch workflow'
    }, { status: 500 });
  }
}

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

    const workflow = await Workflow.findOne({
      _id: params.id,
      userId: decoded.id
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const updateData = await req.json();

    // Update workflow
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        workflow[key] = updateData[key];
      }
    });

    // Increment version on structure changes
    if (updateData.nodes || updateData.edges) {
      workflow.version += 1;
    }

    await workflow.save();

    return NextResponse.json({
      success: true,
      workflow
    });

  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json({
      error: 'Failed to update workflow'
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

    const workflow = await Workflow.findOneAndDelete({
      _id: params.id,
      userId: decoded.id
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json({
      error: 'Failed to delete workflow'
    }, { status: 500 });
  }
}
