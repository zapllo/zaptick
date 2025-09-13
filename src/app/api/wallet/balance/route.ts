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

    // Get company data including wallet balance
    const company = await Company.findById(user.companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Calculate recent change from last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentCredits = await WalletTransaction.aggregate([
      {
        $match: {
          companyId: company._id,
          type: "credit",
          createdAt: { $gte: oneDayAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const recentChange = recentCredits.length > 0 ? recentCredits[0].total : 0;

    return NextResponse.json({
      success: true,
      walletBalance: company.walletBalance,
      formattedBalance: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(company.walletBalance),
      recentChange: recentChange
    });
  } catch (error) {
    console.error("Wallet balance fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet balance" },
      { status: 500 }
    );
  }
}
