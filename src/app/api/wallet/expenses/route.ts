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
    const category = searchParams.get("category") || "all";

    // Calculate date range based on period
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

    // Build query for debit transactions (expenses)
    const query: any = {
      companyId: company._id,
      type: "debit",
      status: "completed",
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (category !== "all") {
      query.referenceType = category;
    }

    // Get all expense transactions
    const expenseTransactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 });

    // Calculate total expenses
    const totalExpenses = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate category breakdown
    const categoryBreakdown = expenseTransactions.reduce((acc, tx) => {
      const category = tx.referenceType || "other";
      acc[category] = (acc[category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array for charts
    const categoryData = Object.entries(categoryBreakdown).map(([name, value]) => ({
      name: formatCategoryName(name),
      value
    }));

    // Calculate monthly expenses for the chart
    const monthlyExpenses = [];
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(now.getFullYear(), i, 1);
      const monthEnd = new Date(now.getFullYear(), i + 1, 0);
      
      const monthlyTotal = expenseTransactions
        .filter(tx => {
          const txDate = new Date(tx.createdAt);
          return txDate >= monthStart && txDate <= monthEnd;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

      monthlyExpenses.push({
        name: monthStart.toLocaleDateString("en-US", { month: "short" }),
        amount: monthlyTotal
      });
    }

    // Calculate previous period for comparison
    const prevPeriodStart = new Date(startDate);
    const prevPeriodEnd = new Date(endDate);
    
    if (period === "month") {
      prevPeriodStart.setMonth(prevPeriodStart.getMonth() - 1);
      prevPeriodEnd.setMonth(prevPeriodEnd.getMonth() - 1);
    } else if (period === "quarter") {
      prevPeriodStart.setMonth(prevPeriodStart.getMonth() - 3);
      prevPeriodEnd.setMonth(prevPeriodEnd.getMonth() - 3);
    } else {
      prevPeriodStart.setFullYear(prevPeriodStart.getFullYear() - 1);
      prevPeriodEnd.setFullYear(prevPeriodEnd.getFullYear() - 1);
    }

    const prevPeriodExpenses = await WalletTransaction.find({
      companyId: company._id,
      type: "debit",
      status: "completed",
      createdAt: { $gte: prevPeriodStart, $lte: prevPeriodEnd }
    });

    const prevPeriodTotal = prevPeriodExpenses.reduce((sum, tx) => sum + tx.amount, 0);
    const changePercentage = prevPeriodTotal > 0 
      ? ((totalExpenses - prevPeriodTotal) / prevPeriodTotal * 100).toFixed(1)
      : "0";

    // Get detailed transactions for the table
    const detailedTransactions = expenseTransactions.slice(0, 50).map(tx => ({
      id: tx._id,
      category: formatCategoryName(tx.referenceType || "other"),
      description: tx.description,
      date: tx.createdAt,
      amount: tx.amount,
      referenceType: tx.referenceType
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalExpenses,
        changePercentage: parseFloat(changePercentage),
        categoryBreakdown: categoryData,
        monthlyExpenses,
        transactions: detailedTransactions,
        period,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });

  } catch (error) {
    console.error("Expenses fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses data" },
      { status: 500 }
    );
  }
}

// Helper function to format category names
function formatCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    "campaign": "Campaign Messages",
    "message": "WhatsApp API",
    "subscription": "Subscription",
    "manual": "Manual Adjustment",
    "other": "Other Services"
  };
  
  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
}