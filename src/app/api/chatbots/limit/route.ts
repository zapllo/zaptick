import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import User from '@/models/User';
import Chatbot from '@/models/Chatbot';

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

    const { searchParams } = new URL(req.url);
    const wabaId = searchParams.get('wabaId');

    if (!wabaId) {
      return NextResponse.json({ success: false, message: 'WABA ID is required' }, { status: 400 });
    }

    // Get current user with company info
    const currentUser = await User.findById(decoded.id)
      .select('companyId wabaAccounts')
      .populate('companyId', 'subscriptionPlan subscriptionStatus');

    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Verify user has access to this WABA
    const hasWabaAccess = currentUser.wabaAccounts?.some((account: any) => account.wabaId === wabaId);
    if (!hasWabaAccess) {
      return NextResponse.json({ success: false, message: 'Access denied to this WABA' }, { status: 403 });
    }

    const company = currentUser.companyId as any;
    const subscriptionPlan = company?.subscriptionPlan || 'free';
    const subscriptionStatus = company?.subscriptionStatus || 'expired';

    // Define chatbot limits based on subscription plan
    const planLimits = {
      free: 1,
      starter: 1,
      explore: 1,
      growth: 5,
      advanced: 25,
      enterprise: Infinity
    };

    const currentLimit = planLimits[subscriptionPlan as keyof typeof planLimits] || planLimits.free;

    // Count existing chatbots for this user and WABA
    const currentCount = await Chatbot.countDocuments({
      userId: decoded.id,
      wabaId
    });

    const planNames = {
      free: 'Free',
      starter: 'Starter',
      explore: 'Explore',
      growth: 'Growth',
      advanced: 'Advanced',
      enterprise: 'Enterprise'
    };

    return NextResponse.json({
      success: true,
      data: {
        currentCount,
        limit: currentLimit,
        canCreateMore: subscriptionStatus === 'active' && currentCount < currentLimit,
        plan: subscriptionPlan,
        planName: planNames[subscriptionPlan as keyof typeof planNames] || 'Free',
        subscriptionStatus,
        remainingSlots: currentLimit === Infinity ? Infinity : Math.max(0, currentLimit - currentCount)
      }
    });

  } catch (error) {
    console.error('Error checking chatbot limit:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check chatbot limit' },
      { status: 500 }
    );
  }
}
