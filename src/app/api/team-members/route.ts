import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';

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

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // In a real team scenario, you'd have team membership info
    // For now, just return all users (simplified)
    const users = await User.find({}, 'name email createdAt updatedAt');

    const teamMembers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'Team Member', // In a real app, this would come from a role field
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    return NextResponse.json({ success: true, teamMembers });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}
