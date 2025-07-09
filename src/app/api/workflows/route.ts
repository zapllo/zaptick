import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Workflow from '@/models/Workflow';
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

    const workflows = await Workflow.find({
      userId: decoded.id,
      wabaId
    }).sort({ updatedAt: -1 });

    return NextResponse.json({
      success: true,
      workflows
    });

  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json({
      error: 'Failed to fetch workflows'
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
      nodes,
      edges,
      triggers,
      viewport
    } = await req.json();

    // Validate required fields
    if (!wabaId || !name) {
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

    // Create workflow
    const workflow = await Workflow.create({
      userId: decoded.id,
      wabaId,
      name,
      description,
      nodes: nodes || [],
      edges: edges || [],
      triggers: triggers || [],
      viewport: viewport || { x: 0, y: 0, zoom: 1 },
      isActive: false
    });

    return NextResponse.json({
      success: true,
      workflow
    });

  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json({
      error: 'Failed to create workflow'
    }, { status: 500 });
  }
}
