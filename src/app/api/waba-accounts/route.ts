import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }


    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure wabaAccounts exists and is an array
    const wabaAccounts = user.wabaAccounts || [];

    return NextResponse.json({
      success: true,
      accounts: wabaAccounts.map((account: any) => ({
        wabaId: account.wabaId,
        businessName: account.businessName || 'Unknown Business',
        phoneNumber: account.phoneNumber || 'Unknown Number',
        phoneNumberId: account.phoneNumberId,
        status: account.status || 'active'
      }))
    });

  } catch (error) {
    console.error('WABA accounts fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch WABA accounts'
    }, { status: 500 });
  }
}
