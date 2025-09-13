import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Company from "@/models/Company";
import WalletTransaction from "@/models/WalletTransaction";

// Get wallet balance and transactions
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

    // Get company data including wallet balance
    const company = await Company.findById(user.companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get query parameters for filtering transactions
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { companyId: company._id };
    if (type && type !== "all") {
      query.type = type;
    }

    // Get transactions
    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalCount = await WalletTransaction.countDocuments(query);
    // Calculate summary statistics
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all transactions for calculations
    const allTransactions = await WalletTransaction.find({ companyId: company._id });

    // Calculate totals
    const totalCredits = allTransactions
      .filter(tx => tx.type === 'credit' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalDebits = allTransactions
      .filter(tx => tx.type === 'debit' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const pendingAmount = allTransactions
      .filter(tx => tx.status === 'pending')
      .reduce((sum, tx) => sum + (tx.type === 'credit' ? tx.amount : -tx.amount), 0);

    // Calculate this month's stats
    const thisMonthTransactions = allTransactions.filter(
      tx => new Date(tx.createdAt) >= firstDayOfMonth && tx.status === 'completed'
    );

    const thisMonthCredits = thisMonthTransactions
      .filter(tx => tx.type === 'credit')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const thisMonthDebits = thisMonthTransactions
      .filter(tx => tx.type === 'debit')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return NextResponse.json({
      success: true,
      balance: company.walletBalance,
      aiCredits: company.aiCredits, // Add AI credits to response
      formattedBalance: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(company.walletBalance),
      totalCredits,
      totalDebits,
      pendingAmount,
      thisMonth: {
        credits: thisMonthCredits,
        debits: thisMonthDebits
      },
      transactions: transactions.map(tx => ({
        id: tx._id,
        amount: tx.amount,
        type: tx.type,
        status: tx.status,
        description: tx.description,
        createdAt: tx.createdAt,
        metadata: tx.metadata,
        referenceType: tx.referenceType
      })),
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error("Wallet fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet data" },
      { status: 500 }
    );
  }
}

// Add funds to wallet
export async function POST(req: NextRequest) {
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

    // Get company data
    const company = await Company.findById(user.companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const { amount, paymentMethod } = await req.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // In a real implementation, you would process payment here
    // For now, we'll just add the amount directly

    // Add amount to company's wallet
    company.walletBalance += amount;
    await company.save();

    // Record the transaction
    const transaction = new WalletTransaction({
      companyId: company._id,
      amount: amount,
      type: "credit",
      status: "completed",
      description: "Wallet top-up",
      referenceType: "manual",
      metadata: {
        paymentMethod,
        addedBy: user._id
      }
    });
    await transaction.save();

    return NextResponse.json({
      success: true,
      balance: company.walletBalance,
      formattedBalance: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(company.walletBalance),
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        description: transaction.description,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    console.error("Wallet add funds error:", error);
    return NextResponse.json(
      { error: "Failed to add funds to wallet" },
      { status: 500 }
    );
  }
}


// Purchase AI credits with Razorpay payment
export async function PATCH(req: NextRequest) {
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

    const { creditsAmount, paymentId, totalPaid, gst } = await req.json();

    // Validate credits amount
    if (!creditsAmount || creditsAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid credits amount" },
        { status: 400 }
      );
    }

    // Calculate expected cost (₹2 per credit)
    const costPerCredit = 2;
    const expectedCost = creditsAmount * costPerCredit;

    // If payment details are provided, it means payment was successful
    if (paymentId && totalPaid) {
      // Add AI credits to company
      company.aiCredits += creditsAmount;
      await company.save();

      // Record the transaction
      const transaction = new WalletTransaction({
        companyId: company._id,
        amount: expectedCost,
        type: "credit", // This is a credit transaction for AI credits purchase
        status: "completed",
        description: `AI Credits Purchase - ${creditsAmount} credits`,
        referenceType: "ai_credits_purchase",
        metadata: {
          creditsAmount,
          costPerCredit,
          paymentId,
          totalPaid,
          gst,
          purchasedBy: user._id
        }
      });
      await transaction.save();

      return NextResponse.json({
        success: true,
        message: `Successfully purchased ${creditsAmount} AI credits`,
        newAiCredits: company.aiCredits,
        amountPaid: totalPaid,
        creditsAdded: creditsAmount
      });
    } else {
      // This is just for validation/cost calculation before payment
      return NextResponse.json({
        success: true,
        creditsAmount,
        costPerCredit,
        totalCost: expectedCost,
        message: "Credits purchase validated. Proceed with payment."
      });
    }

  } catch (error) {
    console.error("AI credits purchase error:", error);
    return NextResponse.json(
      { error: "Failed to purchase AI credits" },
      { status: 500 }
    );
  }
}