// /app/api/interakt/tp-signup/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

const TP_SIGNUP_URL = 'https://api.interakt.ai/v1/organizations/tp-signup/';
const INT_API_TOKEN = process.env.INTERAKT_API_TOKEN!;
const SOLUTION_ID = process.env.NEXT_PUBLIC_SOLUTION_ID!;

export async function POST(request: NextRequest) {
  try {
    const { wabaId, phoneNumberId, businessName, phoneNumber, userId } = await request.json();

    // Basic validations
    if (!wabaId || !phoneNumberId) {
      return NextResponse.json(
        { error: 'Missing required data', details: 'wabaId and phoneNumberId are required' },
        { status: 400 }
      );
    }
    if (!INT_API_TOKEN) {
      return NextResponse.json(
        { error: 'Server misconfigured', details: 'Missing INTERAKT_API_TOKEN' },
        { status: 500 }
      );
    }
    if (!SOLUTION_ID) {
      return NextResponse.json(
        { error: 'Server misconfigured', details: 'Missing NEXT_PUBLIC_SOLUTION_ID' },
        { status: 500 }
      );
    }

    // IMPORTANT: Interakt expects solution_id inside waba_info
    // event must be PARTNER_ADDED
    // Authorization header is the raw token (no "Bearer ")
    const payload = {
      object: 'tech_partner',
      entry: [
        {
          changes: [
            {
              value: {
                event: 'PARTNER_ADDED',
                waba_info: {
                  waba_id: wabaId,
                  solution_id: SOLUTION_ID,
                  ...(phoneNumber ? { phone_number: phoneNumber } : {}),
                  // we can pass setup metadata; Interakt echoes this in webhook
                  setup: {
                    userId: userId ?? null,
                    businessName: businessName ?? null,
                  },
                },
              },
            },
          ],
        },
      ],
    };

    const res = await fetch(TP_SIGNUP_URL, {
      method: 'POST',
      headers: {
        Authorization: INT_API_TOKEN, // token only, no Bearer
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: any = text;
    try {
      data = JSON.parse(text);
    } catch {
      /* Interakt sometimes returns plain text on errors; keep as-is */
    }

    if (!res.ok) {
      // Try to surface useful error
      const details =
        (typeof data === 'object' && (data.error?.message || data.error)) || data || 'TP signup failed';
      return NextResponse.json(
        { error: 'TP signup failed', status: res.status, details, echo: { wabaId, phoneNumberId } },
        { status: res.status >= 400 && res.status < 600 ? res.status : 500 }
      );
    }

    // Success: Interakt will later ping your webhook with WABA_ONBOARDED
    return NextResponse.json({
      success: true,
      message: 'TP signup initiated. Await WABA_ONBOARDED webhook.',
      echo: { wabaId, phoneNumberId, userId, businessName, phoneNumber },
      interakt: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal error', details: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
