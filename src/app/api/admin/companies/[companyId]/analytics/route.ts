import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/models/Company';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { startOfMonth, endOfMonth, subDays, subMonths, format } from 'date-fns';

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Get company details
    const company = await Company.findById(params.companyId);
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
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

    // Base query for company transactions
    const baseQuery = {
      companyId: params.companyId,
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    };

    // Get company users
    const users = await User.find({ companyId: params.companyId }).lean();
    const activeUsers = users.filter(user => user.isActive);

    // Get expense data
    const [expenses, credits, expensesByCategory, monthlyExpenses] = await Promise.all([
      WalletTransaction.aggregate([
        { $match: { ...baseQuery, type: 'debit' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      WalletTransaction.aggregate([
        { $match: { ...baseQuery, type: 'credit' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
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
      ])
    ]);

    const totalExpenses = expenses[0]?.total || 0;
    const totalCredits = credits[0]?.total || 0;
    const totalExpenseTransactions = expenses[0]?.count || 0;

    // Calculate previous period for comparison
    const periodDuration = endDate.getTime() - startDate.getTime();
    const prevPeriodEnd = new Date(startDate.getTime() - 1);
    const prevPeriodStart = new Date(prevPeriodEnd.getTime() - periodDuration);

    const prevPeriodExpenses = await WalletTransaction.aggregate([
      {
        $match: {
          companyId: params.companyId,
          type: 'debit',
          status: 'completed',
          createdAt: { $gte: prevPeriodStart, $lte: prevPeriodEnd }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const prevTotal = prevPeriodExpenses[0]?.total || 0;
    const changePercentage = prevTotal > 0 ? ((totalExpenses - prevTotal) / prevTotal * 100) : 0;

    // Get user activity within company
    const userActivity = await WalletTransaction.aggregate([
      { $match: baseQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'companyId',
          foreignField: 'companyId',
          as: 'companyUsers'
        }
      },
      { $unwind: '$companyUsers' },
      {
        $group: {
          _id: '$companyUsers._id',
          userName: { $first: '$companyUsers.name' },
          userEmail: { $first: '$companyUsers.email' },
          transactionCount: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { transactionCount: -1 } }
    ]);

    // Calculate insights
    const avgMonthlySpend = monthlyExpenses.length > 0
      ? monthlyExpenses.reduce((sum, month) => sum + month.amount, 0) / monthlyExpenses.length
      : 0;

    const projectedAnnualCost = avgMonthlySpend * 12;

    // Generate company-specific recommendations
    const recommendations = generateCompanyRecommendations({
      totalExpenses,
      avgMonthlySpend,
      expensesByCategory,
      company,
      users: users.length,
      activeUsers: activeUsers.length
    });

    // Get recent transactions
    const recentTransactions = await WalletTransaction.find({
      companyId: params.companyId,
      status: 'completed'
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    const analytics = {
      company: {
        _id: company._id,
        name: company.name,
        industry: company.industry,
        location: company.location,
        walletBalance: company.walletBalance,
        aiCredits: company.aiCredits,
        subscriptionPlan: company.subscriptionPlan,
        subscriptionStatus: company.subscriptionStatus
      },
      overview: {
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        inactiveUsers: users.length - activeUsers.length,
        totalExpenses,
        totalCredits,
        netAmount: totalCredits - totalExpenses,
        totalTransactions: totalExpenseTransactions,
        changePercentage
      },
      expenses: {
        totalExpenses,
        changePercentage,
        categoryBreakdown: expensesByCategory.map(cat => ({
          name: formatCategoryName(cat._id || 'other'),
          value: cat.amount,
          count: cat.count
        })),
        monthlyExpenses: monthlyExpenses.map(month => ({
          name: format(new Date(month._id.year, month._id.month - 1, 1), 'MMM yyyy'),
          amount: month.amount,
          transactions: month.transactions
        })),
        avgMonthlyExpense: avgMonthlySpend
      },
      insights: {
        avgMonthlySpend,
        projectedAnnualCost,
        potentialSavings: recommendations.reduce((sum, rec) => sum + rec.savings, 0),
        spendChange: changePercentage
      },
      userActivity,
      recommendations,
      recentTransactions: recentTransactions.map(tx => ({
        _id: tx._id,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        referenceType: tx.referenceType,
        createdAt: tx.createdAt
      }))
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
    console.error('Error fetching company analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company analytics' },
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

function generateCompanyRecommendations(data: {
  totalExpenses: number;
  avgMonthlySpend: number;
  expensesByCategory: any[];
  company: any;
  users: number;
  activeUsers: number;
}): Array<{
  id: string;
  title: string;
  description: string;
  savings: number;
  type: 'subscription' | 'usage' | 'optimization';
  action: string;
  actionLabel: string;
}> {
  const recommendations = [];
  const { totalExpenses, avgMonthlySpend, expensesByCategory, company, users } = data;

  // Subscription upgrade recommendation
  if (avgMonthlySpend > 1000 && company.subscriptionPlan === 'free') {
    recommendations.push({
      id: 'upgrade-subscription',
      title: 'Consider upgrading subscription plan',
      description: `With monthly spending of ₹${avgMonthlySpend.toFixed(0)}, upgrading to a paid plan could provide better rates and save approximately ₹${Math.round(avgMonthlySpend * 0.2)} monthly.`,
      savings: Math.round(avgMonthlySpend * 0.2),
      type: 'subscription' as const,
      action: '/pricing',
      actionLabel: 'View Plans'
    });
  }

  // API optimization
  const apiExpenses = expensesByCategory.find(cat => cat._id === 'message')?.amount || 0;
  if (apiExpenses > totalExpenses * 0.5) {
    recommendations.push({
      id: 'api-optimization',
      title: 'Optimize API usage',
      description: `API costs represent ${((apiExpenses / totalExpenses) * 100).toFixed(0)}% of expenses. Implementing message batching could save ₹${Math.round(apiExpenses * 0.15)} monthly.`,
      savings: Math.round(apiExpenses * 0.15),
      type: 'optimization' as const,
      action: '/docs/api',
      actionLabel: 'View API Docs'
    });
  }

  // Template usage optimization
  const campaignExpenses = expensesByCategory.find(cat => cat._id === 'campaign')?.amount || 0;
  if (campaignExpenses > 500) {
    recommendations.push({
      id: 'template-optimization',
      title: 'Optimize template usage',
      description: `Template message costs can be reduced by creating reusable templates. Estimated savings: ₹${Math.round(campaignExpenses * 0.25)} monthly.`,
      savings: Math.round(campaignExpenses * 0.25),
      type: 'usage' as const,
      action: '/templates',
      actionLabel: 'Create Templates'
    });
  }

  return recommendations;
}
