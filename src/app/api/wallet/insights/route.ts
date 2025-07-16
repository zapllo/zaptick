import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Company from "@/models/Company";
import WalletTransaction from "@/models/WalletTransaction";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const company = await Company.findById(user.companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "year";

    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (period) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
    }

    // Get all transactions for analysis
    const allTransactions = await WalletTransaction.find({
      companyId: company._id,
      status: "completed"
    }).sort({ createdAt: 1 });

    // Get current period transactions
    const currentPeriodTransactions = allTransactions.filter(tx => {
      const txDate = new Date(tx.createdAt);
      return txDate >= startDate && txDate <= endDate;
    });

    // Get previous period for comparison
    const periodDuration = endDate.getTime() - startDate.getTime();
    const prevPeriodEnd = new Date(startDate.getTime() - 1);
    const prevPeriodStart = new Date(prevPeriodEnd.getTime() - periodDuration);

    const previousPeriodTransactions = allTransactions.filter(tx => {
      const txDate = new Date(tx.createdAt);
      return txDate >= prevPeriodStart && txDate <= prevPeriodEnd;
    });

    // Calculate usage analytics data (monthly breakdown)
    const usageData = [];
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(now.getFullYear(), i, 1);
      const monthEnd = new Date(now.getFullYear(), i + 1, 0);
      
      const monthTransactions = allTransactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate >= monthStart && txDate <= monthEnd;
      });

      // Count different types of usage
      const messageCount = monthTransactions.filter(tx => 
        tx.referenceType === "message" || tx.referenceType === "campaign"
      ).length;
      
      const apiCalls = monthTransactions.filter(tx => 
        tx.referenceType === "message"
      ).reduce((sum, tx) => sum + (tx.metadata?.apiCalls || 1), 0);
      
      const templateUsage = monthTransactions.filter(tx => 
        tx.referenceType === "campaign"
      ).length;

      usageData.push({
        name: monthStart.toLocaleDateString("en-US", { month: "short" }),
        messages: messageCount,
        api: apiCalls,
        templates: templateUsage
      });
    }

    // Calculate year-over-year comparison
    const compareData = [];
    const currentYear = now.getFullYear();
    const previousYear = currentYear - 1;

    for (let i = 0; i < 12; i++) {
      const currentYearMonth = allTransactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate.getFullYear() === currentYear && 
               txDate.getMonth() === i && 
               tx.type === "debit";
      }).reduce((sum, tx) => sum + tx.amount, 0);

      const previousYearMonth = allTransactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate.getFullYear() === previousYear && 
               txDate.getMonth() === i && 
               tx.type === "debit";
      }).reduce((sum, tx) => sum + tx.amount, 0);

      compareData.push({
        name: new Date(currentYear, i, 1).toLocaleDateString("en-US", { month: "short" }),
        current: currentYearMonth,
        previous: previousYearMonth
      });
    }

    // Calculate metrics
    const currentSpend = currentPeriodTransactions
      .filter(tx => tx.type === "debit")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const previousSpend = previousPeriodTransactions
      .filter(tx => tx.type === "debit")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const spendChange = previousSpend > 0 
      ? ((currentSpend - previousSpend) / previousSpend * 100)
      : 0;

    // Calculate average monthly spend
    const monthlySpends = [];
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(now.getFullYear(), i, 1);
      const monthEnd = new Date(now.getFullYear(), i + 1, 0);
      
      const monthSpend = allTransactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate >= monthStart && txDate <= monthEnd && 
               tx.type === "debit" && 
               txDate.getFullYear() === now.getFullYear();
      }).reduce((sum, tx) => sum + tx.amount, 0);

      if (monthSpend > 0) monthlySpends.push(monthSpend);
    }

    const avgMonthlySpend = monthlySpends.length > 0 
      ? monthlySpends.reduce((sum, spend) => sum + spend, 0) / monthlySpends.length
      : 0;

    // Project annual cost
    const projectedAnnualCost = avgMonthlySpend * 12;

    // Calculate category analysis for recommendations
    const categorySpending = currentPeriodTransactions
      .filter(tx => tx.type === "debit")
      .reduce((acc, tx) => {
        const category = tx.referenceType || "other";
        acc[category] = (acc[category] || 0) + tx.amount;
        return acc;
      }, {} as Record<string, number>);

    // Generate recommendations based on usage patterns
    const recommendations = generateRecommendations(
      categorySpending,
      avgMonthlySpend,
      currentPeriodTransactions
    );

    // Calculate potential savings
    const potentialSavings = recommendations.reduce((sum, rec) => sum + rec.savings, 0);

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          avgMonthlySpend,
          projectedAnnualCost,
          potentialSavings,
          spendChange,
          currentSpend,
          previousSpend
        },
        usageData,
        compareData,
        recommendations,
        period,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });

  } catch (error) {
    console.error("Insights fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights data" },
      { status: 500 }
    );
  }
}

function generateRecommendations(
  categorySpending: Record<string, number>,
  avgMonthlySpend: number,
  transactions: any[]
): Array<{
  id: string;
  title: string;
  description: string;
  savings: number;
  type: "subscription" | "usage" | "optimization";
  action: string;
  actionLabel: string;
}> {
  const recommendations = [];

  // Subscription optimization
  if (avgMonthlySpend > 500) {
    recommendations.push({
      id: "annual-plan",
      title: "Switch to annual billing",
      description: `Switching to our annual plan would save you approximately ₹${Math.round(avgMonthlySpend * 2.4)} per year based on your current usage.`,
      savings: Math.round(avgMonthlySpend * 2.4),
      type: "subscription" as const,
      action: "/pricing",
      actionLabel: "Upgrade Plan"
    });
  }

  // Template optimization
  const campaignSpending = categorySpending.campaign || 0;
  if (campaignSpending > 200) {
    recommendations.push({
      id: "template-optimization",
      title: "Optimize template usage",
      description: `You're spending heavily on campaigns. Creating reusable templates could save you approximately ₹${Math.round(campaignSpending * 0.3)} per month.`,
      savings: Math.round(campaignSpending * 0.3),
      type: "usage" as const,
      action: "/templates",
      actionLabel: "Create Templates"
    });
  }

  // API optimization
  const messageSpending = categorySpending.message || 0;
  if (messageSpending > 300) {
    recommendations.push({
      id: "api-optimization",
      title: "Optimize API calls",
      description: `Consider batching your API calls to reduce the total number of requests. This could save you approximately ₹${Math.round(messageSpending * 0.2)} per month.`,
      savings: Math.round(messageSpending * 0.2),
      type: "optimization" as const,
      action: "/docs/api",
      actionLabel: "View API Documentation"
    });
  }

  // Usage pattern optimization
  const totalTransactions = transactions.filter(tx => tx.type === "debit").length;
  if (totalTransactions > 100) {
    recommendations.push({
      id: "usage-pattern",
      title: "Optimize usage patterns",
      description: `Your high transaction volume suggests potential for bulk operations. This could save you approximately ₹${Math.round(avgMonthlySpend * 0.15)} per month.`,
      savings: Math.round(avgMonthlySpend * 0.15),
      type: "optimization" as const,
      action: "/settings/usage",
      actionLabel: "Optimize Usage"
    });
  }

  return recommendations;
}