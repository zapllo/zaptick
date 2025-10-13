// /app/api/admin/interakt/waba-numbers/route.ts
import { NextRequest, NextResponse } from 'next/server';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN!;

// Interakt proxies Graph: GET /v17.0/{wabaId}/phone_numbers
// If your proxy path differs, adjust URL accordingly.
export async function GET(req: NextRequest) {
  try {
    const wabaId = req.nextUrl.searchParams.get('wabaId');
    if (!wabaId) {
      return NextResponse.json({ error: 'wabaId required' }, { status: 400 });
    }
    if (!INT_TOKEN) {
      return NextResponse.json({ error: 'Missing INTERAKT_API_TOKEN' }, { status: 500 });
    }

    const url = `https://amped-express.interakt.ai/api/v17.0/${wabaId}/phone_numbers`;
    const res = await fetch(url, {
      headers: {
        'x-access-token': INT_TOKEN,
        'x-waba-id': wabaId,
        'Accept': 'application/json'
      },
      // cache: 'no-store' // uncomment if needed
    });

    const text = await res.text();
    let json: any;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch numbers', details: json }, { status: res.status });
    }
    // Expecting { data: [{ id, display_phone_number, ... }]}
    return NextResponse.json(json);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unexpected error' }, { status: 500 });
  }
}
