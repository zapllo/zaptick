import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { subDays, format } from 'date-fns';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Get user details
    const user = await User.findById(params.userId).populate('companyId', 'name industry location walletBalance aiCredits');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    if (from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
    } else {
      switch (timeframe) {
        case '7d':
          startDate = subDays(now, 7);
          break;
        case '30d':
          startDate = subDays(now, 30);
          break;
        case '90d':
          startDate = subDays(now, 90);
          break;
        case '1y':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          startDate = subDays(now, 30);
      }
    }

    // Base query for user's company transactions
    const baseQuery = {
      companyId: user.companyId._id,
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    };

    // Get transaction data for user's company
    const [expenses, monthlyExpenses, categoryBreakdown] = await Promise.all([
      WalletTransaction.aggregate([
        { $match: { ...baseQuery, type: 'debit' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      WalletTransaction.aggregate([
        { $match: { ...baseQuery, type: 'debit' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            amount: { $sum: '$amount' },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      WalletTransaction.aggregate([
        { $match: { ...baseQuery, type: 'debit' } },
        {
          $group: {
            _id: '$referenceType',
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { amount: -1 } }
      ])
    ]);

    const totalExpenses = expenses[0]?.total || 0;
    const totalTransactions = expenses[0]?.count || 0;

    // Get user activity summary
    const userLoginData = {
      lastLoginAt: user.lastLoginAt,
      loginAttempts: user.loginAttempts,
      isActive: user.isActive,
      role: user.role,
      isOwner: user.isOwner
    };

    // Calculate user's contribution to company expenses (approximation)
    const avgExpensePerTransaction = totalExpenses / Math.max(totalTransactions, 1);

    const analytics = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOwner: user.isOwner,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      },
      company: {
        _id: user.companyId._id,
        name: (user.companyId as any).name,
        industry: (user.companyId as any).industry,
        walletBalance: (user.companyId as any).walletBalance,
        aiCredits: (user.companyId as any).aiCredits
      },
      overview: {
        companyExpenses: totalExpenses,
        companyTransactions: totalTransactions,
        avgExpensePerTransaction,
        userContributionEstimate: avgExpensePerTransaction * 0.1 // Rough estimate
      },
      expenses: {
        categoryBreakdown: categoryBreakdown.map(cat => ({
          name: formatCategoryName(cat._id || 'other'),
          value: cat.amount,
          count: cat.count
        })),
        monthlyExpenses: monthlyExpenses.map(month => ({
          name: format(new Date(month._id.year, month._id.month - 1, 1), 'MMM yyyy'),
          amount: month.amount,
          transactions: month.transactions
        }))
      },
      userActivity: userLoginData,
      connectedAccounts: {
        whatsappAccounts: user.wabaAccounts?.length || 0,
        instagramAccounts: user.instagramAccounts?.length || 0
      }
    };

    return NextResponse.json({
      success: true,
      analytics,
      filters: {
        timeframe,
        dateRange: { from: startDate, to: endDate }
      }
    });

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user analytics' },
      { status: 500 }
    );
  }
}

function formatCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    campaign: 'Campaign Messages',
    message: 'WhatsApp API',
    subscription: 'Subscription',
    manual: 'Manual Adjustment',
    template: 'Template Messages',
    refund: 'Refunds',
    other: 'Other Services'
  };

  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
}
