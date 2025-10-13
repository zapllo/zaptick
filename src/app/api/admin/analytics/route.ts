import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/models/Company';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import Analytics from '@/models/Analytics';
import { startOfMonth, endOfMonth, subDays, subMonths, subYears, format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const companyId = searchParams.get('companyId');
    const userId = searchParams.get('userId');

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
          startDate = subYears(now, 1);
          break;
        default:
          startDate = subDays(now, 30);
      }
    }

    // Build base query for filtering
    const baseQuery: any = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    // Filter by company or user if specified
    let companyIds: string[] = [];
    if (companyId) {
      companyIds = [companyId];
      baseQuery.companyId = companyId;
    } else if (userId) {
      const user = await User.findById(userId);
      if (user) {
        companyIds = [user.companyId.toString()];
        baseQuery.companyId = user.companyId;
      }
    } else {
      // Get all company IDs for platform-wide analytics
      const allCompanies = await Company.find({}, '_id').lean();
      companyIds = allCompanies.map(c => c._id.toString());
    }

    // Get overview metrics
    const [totalCompanies, totalUsers, activeCompanies, activeUsers] = await Promise.all([
      Company.countDocuments(companyId ? { _id: companyId } : {}),
      User.countDocuments(userId ? { _id: userId } : companyId ? { companyId } : {}),
      Company.countDocuments(companyId ? { _id: companyId, isActive: true } : { isActive: true }),
      User.countDocuments(userId ? { _id: userId, isActive: true } : companyId ? { companyId, isActive: true } : { isActive: true })
    ]);

    // Calculate previous period for growth metrics
    const periodDuration = endDate.getTime() - startDate.getTime();
    const prevPeriodEnd = new Date(startDate.getTime() - 1);
    const prevPeriodStart = new Date(prevPeriodEnd.getTime() - periodDuration);

    const prevPeriodQuery = {
      ...baseQuery,
      createdAt: { $gte: prevPeriodStart, $lte: prevPeriodEnd }
    };

    // Get wallet and transaction data (User expenses/insights)
    const [currentExpenseData, prevExpenseData, walletData] = await Promise.all([
      WalletTransaction.aggregate([
        { $match: { ...baseQuery, type: 'debit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      WalletTransaction.aggregate([
        { $match: { ...prevPeriodQuery, type: 'debit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Company.aggregate([
        ...(companyId ? [{ $match: { _id: companyId } }] : []),
        {
          $group: {
            _id: null,
            totalWalletBalance: { $sum: '$walletBalance' },
            avgWalletBalance: { $avg: '$walletBalance' },
            totalAiCredits: { $sum: '$aiCredits' },
            avgAiCredits: { $avg: '$aiCredits' },
            companiesWithPositiveBalance: {
              $sum: { $cond: [{ $gt: ['$walletBalance', 0] }, 1, 0] }
            },
            companiesWithCredits: {
              $sum: { $cond: [{ $gt: ['$aiCredits', 0] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const currentExpenses = currentExpenseData[0]?.total || 0;
    const currentTransactionCount = currentExpenseData[0]?.count || 0;
    const prevExpenses = prevExpenseData[0]?.total || 0;
    const wallet = walletData[0] || {
      totalWalletBalance: 0,
      avgWalletBalance: 0,
      totalAiCredits: 0,
      avgAiCredits: 0,
      companiesWithPositiveBalance: 0,
      companiesWithCredits: 0
    };

    // Calculate growth percentages
    const expenseGrowthPercentage = prevExpenses > 0
      ? ((currentExpenses - prevExpenses) / prevExpenses) * 100
      : 0;

    // Get subscription distribution
    const subscriptions = await Company.aggregate([
      ...(companyId ? [{ $match: { _id: companyId } }] : []),
      {
        $group: {
          _id: '$subscriptionPlan',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get expense analytics by category
    const expenseAnalytics = await WalletTransaction.aggregate([
      { $match: { ...baseQuery, type: 'debit', status: 'completed' } },
      {
        $group: {
          _id: '$referenceType',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Get monthly expense data
    const monthlyExpenses = await WalletTransaction.aggregate([
      { $match: { ...baseQuery, type: 'debit', status: 'completed' } },
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
    ]);

    // Get credit transactions (wallet recharges)
    const creditAnalytics = await WalletTransaction.aggregate([
      { $match: { ...baseQuery, type: 'credit', status: 'completed' } },
      {
        $group: {
          _id: '$referenceType',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Get monthly credit data
    const monthlyCredits = await WalletTransaction.aggregate([
      { $match: { ...baseQuery, type: 'credit', status: 'completed' } },
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
    ]);

    // Get top spending companies (if not filtered by company)
    const topSpendingCompanies = companyId ? [] : await WalletTransaction.aggregate([
      { $match: { ...baseQuery, type: 'debit', status: 'completed' } },
      {
        $group: {
          _id: '$companyId',
          totalSpent: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $project: {
          companyName: '$company.name',
          industry: '$company.industry',
          totalSpent: 1,
          transactionCount: 1
        }
      }
    ]);

    // Get top spending users by aggregating their company's transactions
    const topSpendingUsers = userId ? [] : await User.aggregate([
      { $match: companyId ? { companyId } : {} },
      {
        $lookup: {
          from: 'wallettransactions',
          localField: 'companyId',
          foreignField: 'companyId',
          as: 'transactions'
        }
      },
      {
        $addFields: {
          userTransactions: {
            $filter: {
              input: '$transactions',
              cond: {
                $and: [
                  { $eq: ['$$this.type', 'debit'] },
                  { $eq: ['$$this.status', 'completed'] },
                  { $gte: ['$$this.createdAt', startDate] },
                  { $lte: ['$$this.createdAt', endDate] }
                ]
              }
            }
          }
        }
      },
      {
        $addFields: {
          totalSpent: { $sum: '$userTransactions.amount' },
          transactionCount: { $size: '$userTransactions' }
        }
      },
      { $match: { totalSpent: { $gt: 0 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $project: {
          userName: '$name',
          userEmail: '$email',
          companyName: '$company.name',
          totalSpent: 1,
          transactionCount: 1
        }
      }
    ]);

    // Get recent activity
    const recentActivity = await WalletTransaction.aggregate([
      { $match: { ...baseQuery, status: 'completed' } },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $project: {
          type: 1,
          amount: 1,
          description: 1,
          referenceType: 1,
          createdAt: 1,
          companyName: '$company.name',
          companyId: '$company._id'
        }
      }
    ]);

    // Calculate insights for optimization
    const totalExpenses = expenseAnalytics.reduce((sum, exp) => sum + exp.totalAmount, 0);
    const totalCredits = creditAnalytics.reduce((sum, cred) => sum + cred.totalAmount, 0);
    const avgMonthlyExpense = monthlyExpenses.reduce((sum, month) => sum + month.amount, 0) / Math.max(1, monthlyExpenses.length);
    const avgMonthlyCredits = monthlyCredits.reduce((sum, month) => sum + month.amount, 0) / Math.max(1, monthlyCredits.length);

    // Generate platform-wide recommendations
    const recommendations = generatePlatformRecommendations({
      totalExpenses,
      avgMonthlyExpense,
      expenseAnalytics,
      totalCompanies,
      totalUsers,
      walletData: wallet,
      totalCredits,
      avgMonthlyCredits
    });

    // Get usage data for insights (combining expenses with usage patterns)
    const usageData = monthlyExpenses.map((expense, index) => {
      const credit = monthlyCredits[index] || { amount: 0, transactions: 0 };
      return {
        name: format(new Date(expense._id.year, expense._id.month - 1, 1), 'MMM yyyy'),
        messages: expense.transactions, // Using transaction count as proxy for messages
        api: Math.round(expense.transactions * 0.7), // Estimate API calls
        templates: Math.round(expense.transactions * 0.3), // Estimate template usage
        expenses: expense.amount,
        credits: credit.amount
      };
    });

    // Generate comparison data (current vs previous year)
    const currentYear = new Date().getFullYear();
    const compareData = await WalletTransaction.aggregate([
      {
        $match: {
          ...(companyId ? { companyId } : {}),
          status: 'completed',
          createdAt: {
            $gte: new Date(currentYear - 1, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            type: '$type'
          },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const formattedCompareData = [];
    for (let month = 1; month <= 12; month++) {
      const monthName = format(new Date(currentYear, month - 1, 1), 'MMM');
      const currentYearData = compareData.find(
        d => d._id.year === currentYear && d._id.month === month && d._id.type === 'debit'
      );
      const previousYearData = compareData.find(
        d => d._id.year === currentYear - 1 && d._id.month === month && d._id.type === 'debit'
      );

      formattedCompareData.push({
        name: monthName,
        current: currentYearData?.amount || 0,
        previous: previousYearData?.amount || 0
      });
    }

    const analytics = {
      overview: {
        totalCompanies,
        totalUsers,
        activeCompanies,
        activeUsers,
        inactiveCompanies: totalCompanies - activeCompanies,
        inactiveUsers: totalUsers - activeUsers
      },
      growth: {
        expenses: {
          current: currentExpenses,
          previous: prevExpenses,
          percentage: expenseGrowthPercentage
        },
        transactions: {
          current: currentTransactionCount,
          change: expenseGrowthPercentage
        }
      },
      subscriptions,
      wallet: {
        totalWalletBalance: wallet.totalWalletBalance,
        avgWalletBalance: wallet.avgWalletBalance,
        companiesWithPositiveBalance: wallet.companiesWithPositiveBalance
      },
      aiCredits: {
        totalAiCredits: wallet.totalAiCredits,
        avgAiCredits: wallet.avgAiCredits,
        companiesWithCredits: wallet.companiesWithCredits
      },
      expenses: {
        totalExpenses,
        totalCredits,
        netExpenses: totalExpenses - totalCredits,
        categoryBreakdown: expenseAnalytics.map(exp => ({
          name: formatCategoryName(exp._id || 'other'),
          value: exp.totalAmount,
          count: exp.count
        })),
        monthlyExpenses: monthlyExpenses.map(month => ({
          name: format(new Date(month._id.year, month._id.month - 1, 1), 'MMM yyyy'),
          amount: month.amount,
          transactions: month.transactions
        })),
        avgMonthlyExpense,
        expenseGrowthPercentage
      },
      credits: {
        totalCredits,
        categoryBreakdown: creditAnalytics.map(cred => ({
          name: formatCategoryName(cred._id || 'wallet_recharge'),
          value: cred.totalAmount,
          count: cred.count
        })),
        monthlyCredits: monthlyCredits.map(month => ({
          name: format(new Date(month._id.year, month._id.month - 1, 1), 'MMM yyyy'),
          amount: month.amount,
          transactions: month.transactions
        })),
        avgMonthlyCredits
      },
      insights: {
        avgMonthlySpend: avgMonthlyExpense,
        projectedAnnualCost: avgMonthlyExpense * 12,
        potentialSavings: recommendations.reduce((sum, rec) => sum + rec.savings, 0),
        spendChange: expenseGrowthPercentage,
        netCashFlow: avgMonthlyCredits - avgMonthlyExpense,
        burnRate: totalExpenses / Math.max(totalCredits, 1) * 100 // Percentage of credits being spent
      },
      usageData,
      compareData: formattedCompareData,
      topSpendingCompanies,
      topSpendingUsers,
      recommendations,
      recentActivity: recentActivity.slice(0, 20).map(activity => ({
        _id: activity._id,
        type: activity.type === 'debit' ? 'expense' : 'credit',
        companyName: activity.companyName,
        companyId: activity.companyId,
        amount: activity.amount,
        description: activity.description,
        timestamp: activity.createdAt,
        details: `${activity.companyName} - ${activity.description}`,
        category: formatCategoryName(activity.referenceType || 'other')
      }))
    };

    return NextResponse.json({
      success: true,
      analytics,
      filters: {
        timeframe,
        dateRange: { from: startDate, to: endDate },
        companyId,
        userId
      }
    });

  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
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
    wallet_recharge: 'Wallet Recharge',
    payment: 'Payment',
    other: 'Other Services'
  };

  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

function generatePlatformRecommendations(data: {
  totalExpenses: number;
  avgMonthlyExpense: number;
  expenseAnalytics: any[];
  totalCompanies: number;
  totalUsers: number;
  walletData: any;
  totalCredits: number;
  avgMonthlyCredits: number;
}): Array<{
  id: string;
  title: string;
  description: string;
  savings: number;
  type: 'platform' | 'optimization' | 'cost-reduction' | 'revenue';
  action: string;
  actionLabel: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const recommendations = [];
  const { totalExpenses, avgMonthlyExpense, expenseAnalytics, totalCompanies, totalCredits, avgMonthlyCredits } = data;

  // High expense vs credit ratio
  const expenseCreditRatio = totalCredits > 0 ? totalExpenses / totalCredits : 0;
  if (expenseCreditRatio > 0.8) {
    recommendations.push({
      id: 'expense-management',
      title: 'High Expense to Credit Ratio Detected',
      description: `Users are spending ${(expenseCreditRatio * 100).toFixed(0)}% of their credits. Consider implementing spend alerts and usage optimization features to help users manage costs better.`,
      savings: Math.round(totalExpenses * 0.15),
      type: 'optimization' as const,
      action: '/admin/settings/spend-management',
      actionLabel: 'Configure Spend Alerts',
      priority: 'high' as const
    });
  }

  // Low credit balance warning
  const avgWalletBalance = data.walletData.avgWalletBalance;
  if (avgWalletBalance < avgMonthlyExpense * 0.5) {
    recommendations.push({
      id: 'low-balance-warning',
      title: 'Low Average Wallet Balance Detected',
      description: `Average wallet balance (₹${avgWalletBalance.toFixed(0)}) is below half of monthly spend. Consider implementing auto-recharge features to prevent service interruptions.`,
      savings: Math.round(avgMonthlyExpense * 0.1),
      type: 'platform' as const,
      action: '/admin/settings/auto-recharge',
      actionLabel: 'Setup Auto-Recharge',
      priority: 'high' as const
    });
  }

  // High API usage recommendation
  const apiExpenses = expenseAnalytics.find(exp => exp._id === 'message')?.totalAmount || 0;
  if (apiExpenses > totalExpenses * 0.6) {
    recommendations.push({
      id: 'api-optimization',
      title: 'Optimize WhatsApp API Usage Costs',
      description: `WhatsApp API calls represent ${((apiExpenses / totalExpenses) * 100).toFixed(0)}% of total platform expenses. Implementing bulk messaging and rate limiting could save approximately ₹${Math.round(apiExpenses * 0.25)} monthly.`,
      savings: Math.round(apiExpenses * 0.25),
      type: 'optimization' as const,
      action: '/admin/settings/api-optimization',
      actionLabel: 'Configure API Limits',
      priority: 'high' as const
    });
  }

  // Template usage optimization
  const templateExpenses = expenseAnalytics.find(exp => exp._id === 'campaign')?.totalAmount || 0;
  if (templateExpenses > 5000) {
    recommendations.push({
      id: 'template-rates',
      title: 'Review Template Message Pricing',
      description: `Template message costs are significant (₹${templateExpenses}). Reviewing pricing tiers and encouraging bulk template usage could save approximately ₹${Math.round(templateExpenses * 0.15)} monthly.`,
      savings: Math.round(templateExpenses * 0.15),
      type: 'cost-reduction' as const,
      action: '/admin/pricing/templates',
      actionLabel: 'Review Template Pricing',
      priority: 'medium' as const
    });
  }

  // Revenue optimization
  if (totalCredits < totalExpenses && avgMonthlyCredits < avgMonthlyExpense * 1.2) {
    recommendations.push({
      id: 'revenue-optimization',
      title: 'Increase Revenue Through Better Monetization',
      description: `Monthly credits (₹${avgMonthlyCredits.toFixed(0)}) are barely covering expenses (₹${avgMonthlyExpense.toFixed(0)}). Consider implementing premium features or subscription tiers to increase revenue per user.`,
      savings: Math.round(avgMonthlyExpense * 0.3),
      type: 'revenue' as const,
      action: '/admin/monetization',
      actionLabel: 'Explore Monetization',
      priority: 'high' as const
    });
  }

  // Bulk pricing for large customers
  if (totalCompanies > 50 && avgMonthlyExpense > 10000) {
    recommendations.push({
      id: 'enterprise-pricing',
      title: 'Implement Enterprise Pricing Tiers',
      description: `With ${totalCompanies} companies spending ₹${avgMonthlyExpense.toFixed(0)} monthly on average, implementing volume-based enterprise pricing could improve retention and increase revenue by 15-20%.`,
      savings: Math.round(avgMonthlyExpense * 0.15),
      type: 'platform' as const,
      action: '/admin/pricing/enterprise',
      actionLabel: 'Setup Enterprise Tiers',
      priority: 'medium' as const
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}
