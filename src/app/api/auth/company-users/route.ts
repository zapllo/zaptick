import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import User from '@/models/User';

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

    // Find the current user to get their company ID
    const currentUser = await User.findById(decoded.id).select('companyId');
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Find all users from the same company
    const companyUsers = await User.find({ 
      companyId: currentUser.companyId 
    }).select('_id name email role').sort({ name: 1 });

    return NextResponse.json({
      success: true,
      users: companyUsers
    });

  } catch (error) {
    console.error('Error fetching company users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch company users' },
      { status: 500 }
    );
  }
}