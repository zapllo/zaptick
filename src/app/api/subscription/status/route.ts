import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Company from "@/models/Company";

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

    // Check if subscription is still active
    const now = new Date();
    const isActive = company.subscriptionEndDate && 
                    new Date(company.subscriptionEndDate) > now &&
                    company.subscriptionStatus === "active";

    return NextResponse.json({
      success: true,
      data: {
        subscription: {
          plan: company.subscriptionPlan || "free",
          status: isActive ? "active" : "expired",
          billing_cycle: company.billingCycle,
          start_date: company.subscriptionStartDate,
          end_date: company.subscriptionEndDate,
          days_remaining: isActive ? 
            Math.ceil((new Date(company.subscriptionEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 
            0,
          last_payment: {
            amount: company.lastPaymentAmount,
            date: company.lastPaymentDate,
            payment_id: company.lastPaymentId
          }
        },
        wallet_balance: company.walletBalance || 0
      }
    });

  } catch (error) {
    console.error("Subscription status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}