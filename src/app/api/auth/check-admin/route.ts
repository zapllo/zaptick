import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, isSuperAdmin } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      isSuperAdmin: isSuperAdmin(user),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
      }
    });

  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
}