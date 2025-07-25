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

    // Get current user with company info
    const currentUser = await User.findById(decoded.id)
      .select('companyId role isOwner')
      .populate('companyId', 'subscriptionPlan subscriptionStatus');
    
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Only allow owners and admins to check limits
    const isOwnerOrAdmin = currentUser.isOwner || currentUser.role === 'owner' || currentUser.role === 'admin';
    if (!isOwnerOrAdmin) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    }

    const company = currentUser.companyId as any;
    const subscriptionPlan = company?.subscriptionPlan || 'free';
    const subscriptionStatus = company?.subscriptionStatus || 'expired';

    // Define team member limits based on subscription plan
    const planLimits = {
      free: 1,
      starter: 5,
      growth: 10,
      advanced: 25,
      enterprise: Infinity
    };

    const currentLimit = planLimits[subscriptionPlan as keyof typeof planLimits] || planLimits.free;

    // Count existing users in the company
    const currentCount = await User.countDocuments({ companyId: currentUser.companyId });

    const planNames = {
      free: 'Free',
      starter: 'Starter',
      growth: 'Growth', 
      advanced: 'Advanced',
      enterprise: 'Enterprise'
    };

    return NextResponse.json({
      success: true,
      data: {
        currentCount,
        limit: currentLimit,
        canAddMore: subscriptionStatus === 'active' && currentCount < currentLimit,
        plan: subscriptionPlan,
        planName: planNames[subscriptionPlan as keyof typeof planNames] || 'Free',
        subscriptionStatus,
        remainingSlots: currentLimit === Infinity ? Infinity : Math.max(0, currentLimit - currentCount)
      }
    });

  } catch (error) {
    console.error('Error checking team limit:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check team limit' },
      { status: 500 }
    );
  }
}