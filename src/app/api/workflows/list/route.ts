import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
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



    // Get only active workflows with basic info for dropdown
    const workflows = await Workflow.find({
      userId: decoded.id,
      isActive: true
    }).select('name description isActive').sort({ name: 1 });

    return NextResponse.json({
      success: true,
      workflows
    });

  } catch (error) {
    console.error('Error fetching workflows list:', error);
    return NextResponse.json({
      error: 'Failed to fetch workflows list'
    }, { status: 500 });
  }
}