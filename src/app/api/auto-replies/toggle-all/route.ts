import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import AutoReply from '@/models/AutoReply';

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

    const { wabaId, isActive } = await req.json();

    if (!wabaId || typeof isActive !== 'boolean') {
      return NextResponse.json({
        error: 'WABA ID and isActive status are required'
      }, { status: 400 });
    }

    // Update all auto replies for this user and WABA
    const result = await AutoReply.updateMany(
      {
        userId: decoded.id,
        wabaId
      },
      {
        $set: { isActive }
      }
    );

    return NextResponse.json({
      success: true,
      message: `${isActive ? 'Activated' : 'Deactivated'} ${result.modifiedCount} auto replies`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error toggling auto replies:', error);
    return NextResponse.json({
      error: 'Failed to toggle auto replies'
    }, { status: 500 });
  }
}
