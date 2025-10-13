// /app/api/admin/interakt/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import InteraktPartnerEvent from '@/models/InteraktPartnerEvent';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.nextUrl.searchParams.get('userId') || undefined;
    const wabaId = req.nextUrl.searchParams.get('wabaId') || undefined;

    const q: any = {};
    if (userId) q.userId = userId;
    if (wabaId) q.wabaId = wabaId;

    const events = await InteraktPartnerEvent
      .find(q)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ events });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to load events' }, { status: 500 });
  }
}
