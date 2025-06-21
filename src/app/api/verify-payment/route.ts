// src/app/api/verify-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(body)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully"
      });
    } else {
      return NextResponse.json({
        error: "Payment verification failed"
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({
      error: "Failed to verify payment"
    }, { status: 500 });
  }
}
