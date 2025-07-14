import { NextRequest, NextResponse } from 'next/server';
import { getUserPermissions } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const userPermissions = await getUserPermissions(token);

    if (!userPermissions) {
      return NextResponse.json({ success: false, message: 'Invalid token or user not found' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      permissions: userPermissions
    });

  } catch (error) {
    console.error('Error getting permissions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get permissions' },
      { status: 500 }
    );
  }
}