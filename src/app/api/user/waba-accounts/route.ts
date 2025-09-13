import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching WABA accounts for user:', userId);

    const user = await User.findById(userId).select('wabaAccounts');

    if (!user) {
      console.log('User not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Found user with WABA accounts:', user.wabaAccounts?.length || 0);

    return NextResponse.json({
      wabaAccounts: user.wabaAccounts || [],
      count: user.wabaAccounts?.length || 0,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching WABA accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
