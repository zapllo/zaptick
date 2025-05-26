// app/api/interakt/route.ts (Edge or Node runtime)

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';                    // works in Node; in Edge use globalThis.crypto

const HMAC_SECRET = process.env.INTERAKT_WEBHOOK_SECRET!;   // the “Secret Key” in Interakt
const INTERAKT_ONBOARDING_URL = 'https://api.interakt.ai/v1/organizations/tp-signup/';

/* ---------- Optional GET helper ---------- */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get('hub.challenge');

  // Interakt never calls this, but it’s convenient for health-checks
  if (challenge) {
    return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
  return new Response('OK', { status: 200 });
}

/* ---------- Main webhook handler ---------- */
function validSignature(raw: string, received: string) {
  const expected =
    'sha256=' +
    crypto.createHmac('sha256', HMAC_SECRET).update(raw).digest('hex');
  // constant-time compare to avoid timing attacks
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export async function POST(req: NextRequest) {
  // Grab the raw body BEFORE parsing!
  const rawBody = await req.text();
  const signature = req.headers.get('interakt-signature') || '';

  if (!validSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const event = body?.entry?.[0]?.changes?.[0]?.value?.event;
  const waba = body?.entry?.[0]?.changes?.[0]?.value?.waba_info;

  if (event === 'PARTNER_ADDED' && waba?.waba_id && waba?.solution_id) {
    await fetch(INTERAKT_ONBOARDING_URL, {
      method: 'POST',
      headers: {
        Authorization: process.env.INTERAKT_API_TOKEN!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object: 'tech_partner',
        entry: [
          {
            changes: [
              {
                value: {
                  event,
                  waba_info: {
                    waba_id: waba.waba_id,
                    solution_id: waba.solution_id,
                  },
                },
              },
            ],
          },
        ],
      }),
    });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
