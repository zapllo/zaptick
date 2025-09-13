// src/app/api/auth/me/route.ts
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
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch company data to get subscription information
    let company = null;
    if (user.companyId) {
      company = await Company.findById(user.companyId).select('subscriptionPlan subscriptionStatus subscriptionEndDate walletBalance');
    }

    // Check if subscription is expired
    let actualSubscriptionStatus = company?.subscriptionStatus || 'expired';
    let actualSubscriptionPlan = company?.subscriptionPlan || 'free';

    if (company?.subscriptionEndDate && company?.subscriptionStatus === 'active') {
      const now = new Date();
      const endDate = new Date(company.subscriptionEndDate);
      
      if (now > endDate) {
        // Subscription has expired
        actualSubscriptionStatus = 'expired';
        actualSubscriptionPlan = 'free'; // Revert to free plan
        
        // Optionally update the database to reflect expired status
        try {
          await Company.findByIdAndUpdate(user.companyId, {
            subscriptionStatus: 'expired',
            subscriptionPlan: 'free'
          });
        } catch (updateError) {
          console.error('Error updating expired subscription:', updateError);
        }
      }
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOwner: user.isOwner,
        walletBalance: company?.walletBalance || 0,
        wabaAccounts: user.wabaAccounts,
        subscription: {
          plan: actualSubscriptionPlan,
          status: actualSubscriptionStatus,
          endDate: company?.subscriptionEndDate
        }
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}