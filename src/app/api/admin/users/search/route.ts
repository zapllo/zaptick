// /app/api/admin/users/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// If you have admin auth middleware, this route should be behind it.
// DO NOT expose sensitive fields in the response.

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const q = (req.nextUrl.searchParams.get('q') || '').trim();

    const filter: any = q
      ? {
          $or: [
            { email: { $regex: q, $options: 'i' } },
            { name: { $regex: q, $options: 'i' } },
          ],
        }
      : {};

    // small page size, top 20 matches
    const users = await User.find(filter)
      .select('_id name email wabaAccounts') // only what we need
      .limit(20)
      .lean();

    // Optional: map down waba info for quick visual hints in the dropdown
    const results = users.map(u => ({
      id: u._id?.toString(),
      name: u.name,
      email: u.email,
      wabas: (u.wabaAccounts || []).map((w: any) => ({
        wabaId: w.wabaId,
        phoneNumberId: w.phoneNumberId,
        status: w.status,
      })),
    }));

    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Search failed' }, { status: 500 });
  }
}
