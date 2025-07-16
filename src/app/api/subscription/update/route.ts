import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Company from "@/models/Company";
import WalletTransaction from "@/models/WalletTransaction";

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

    const company = await Company.findById(user.companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const {
      plan_id,
      billing_cycle,
      payment_id,
      order_id,
      amount
    } = await req.json();

    // Calculate subscription end date
    const now = new Date();
    let subscriptionEndDate = new Date(now);
    
    switch (billing_cycle) {
      case "monthly":
        subscriptionEndDate.setMonth(now.getMonth() + 1);
        break;
      case "quarterly":
        subscriptionEndDate.setMonth(now.getMonth() + 3);
        break;
      case "yearly":
        subscriptionEndDate.setFullYear(now.getFullYear() + 1);
        break;
    }

    // Update company subscription
    const updatedCompany = await Company.findByIdAndUpdate(
      company._id,
      {
        $set: {
          subscriptionPlan: plan_id,
          subscriptionStatus: "active",
          subscriptionStartDate: now,
          subscriptionEndDate: subscriptionEndDate,
          billingCycle: billing_cycle,
          lastPaymentId: payment_id,
          lastPaymentAmount: amount,
          lastPaymentDate: now
        }
      },
      { new: true }
    );

    // Create wallet transaction record
    const walletTransaction = new WalletTransaction({
      companyId: company._id,
      userId: user._id,
      type: "debit",
      amount: amount,
      description: `Subscription payment for ${plan_id} plan (${billing_cycle})`,
      referenceId: payment_id,
      referenceType: "subscription",
      status: "completed",
      metadata: {
        plan_id,
        billing_cycle,
        order_id,
        payment_id,
        subscription_start: now,
        subscription_end: subscriptionEndDate
      }
    });

    await walletTransaction.save();

    // Add subscription credits based on plan
    let creditsToAdd = 0;
    switch (plan_id) {
      case "starter":
        creditsToAdd = 1000;
        break;
      case "growth":
        creditsToAdd = 2500;
        break;
      case "advanced":
        creditsToAdd = 5000;
        break;
      case "enterprise":
        creditsToAdd = 25000;
        break;
    }

    if (creditsToAdd > 0) {
      // Add credits to wallet
      const creditTransaction = new WalletTransaction({
        companyId: company._id,
        userId: user._id,
        type: "credit",
        amount: creditsToAdd,
        description: `Subscription credits for ${plan_id} plan`,
        referenceId: payment_id,
        referenceType: "subscription_credit",
        status: "completed",
        metadata: {
          plan_id,
          billing_cycle,
          credit_type: "subscription_bonus"
        }
      });

      await creditTransaction.save();

      // Update company wallet balance
      await Company.findByIdAndUpdate(
        company._id,
        {
          $inc: { walletBalance: creditsToAdd }
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully",
      data: {
        subscription: {
          plan: plan_id,
          status: "active",
          billing_cycle,
          start_date: now,
          end_date: subscriptionEndDate,
          credits_added: creditsToAdd
        }
      }
    });

  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}