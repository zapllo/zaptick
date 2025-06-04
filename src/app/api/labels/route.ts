import { NextRequest, NextResponse } from 'next/server';
import Label from '@/models/Label';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }


    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const labels = await Label.find({ userId: user._id }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, labels });
  } catch (error) {
    console.error('Error fetching labels:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch labels' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const { name, color } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Label name is required' },
        { status: 400 }
      );
    }

    const newLabel = await Label.create({
      name,
      color: color || 'blue',
      userId: user._id
    });

    return NextResponse.json({ success: true, label: newLabel });
  } catch (error) {
    console.error('Error creating label:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create label' },
      { status: 500 }
    );
  }
}
