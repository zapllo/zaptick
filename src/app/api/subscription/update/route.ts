import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Company from "@/models/Company";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { 
      plan_id, 
      billing_cycle, 
      payment_id, 
      order_id, 
      base_amount, 
      gst_amount, 
      total_amount 
    } = await request.json();

    await dbConnect();

    // Get user and company
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const company = await Company.findById(user.companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();

    if (billing_cycle === 'quarterly') {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (billing_cycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Update company subscription
    await Company.findByIdAndUpdate(company._id, {
      subscriptionPlan: plan_id,
      subscriptionStatus: 'active',
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      billingCycle: billing_cycle,
      lastPaymentId: payment_id,
      lastPaymentAmount: total_amount,
      lastPaymentDate: new Date(),
      updatedAt: new Date()
    });

    // You can also create a payment record here if you have a Payment model
    // const paymentRecord = new Payment({
    //   companyId: company._id,
    //   userId: user._id,
    //   planId: plan_id,
    //   orderId: order_id,
    //   paymentId: payment_id,
    //   baseAmount: base_amount,
    //   gstAmount: gst_amount,
    //   totalAmount: total_amount,
    //   billingCycle: billing_cycle,
    //   status: 'completed',
    //   paymentDate: new Date()
    // });
    // await paymentRecord.save();

    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully",
      subscription: {
        plan: plan_id,
        status: 'active',
        startDate,
        endDate,
        billingCycle: billing_cycle,
        amount: total_amount
      }
    });

  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json({
      error: "Failed to update subscription"
    }, { status: 500 });
  }
}