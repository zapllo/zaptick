import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Company from '@/models/Company';

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

    const user = await User.findById(decoded.id)
      .populate('companyId', 'name address website industry size logo')
      .select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isOwner: user.isOwner || user.role === 'owner',
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt
        },
        company: user.companyId
      }
    });

  } catch (error) {
    console.error('Get account error:', error);
    return NextResponse.json({ error: 'Failed to fetch account information' }, { status: 500 });
  }
}