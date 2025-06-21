// /app/api/create-order/route.ts
import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { amount, currency, receipt, notes } = await request.json();

  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const response = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      notes,
    });
    return NextResponse.json({ orderId: response.id });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating Razorpay order' }, { status: 500 });
  }
}
