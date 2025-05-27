/* app/api/interakt/route.ts */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/** 1️⃣  Use Web-Crypto when "edge" runtime is selected */
import crypto from 'crypto';              //  remove if runtime='edge'

/** 2️⃣  Small helpers */
const TP_SIGNUP_URL = 'https://api.interakt.ai/v1/organizations/tp-signup/';
const INT_API_TOKEN = process.env.INTERAKT_API_TOKEN!;

/* ---------- GET (Meta health-ping) ---------- */
export async function GET(req: NextRequest) {
  const challenge = new URL(req.url).searchParams.get('hub.challenge');
  return new Response(challenge ?? 'OK', { status: 200 });
}

/* ---------- POST (all Interakt events) ---------- */
export async function POST(req: NextRequest) {
  await dbConnect();
  const raw = await req.text();
  const sig = req.headers.get('interakt-signature') ?? '';

  const body = JSON.parse(raw);
  const value = body?.entry?.[0]?.changes?.[0]?.value ?? {};
  const event = value.event;
  const waba = value.waba_info;

  /* ①  Partner just finished embedded-signup → ask Interakt to attach credit line */
  if (event === 'PARTNER_ADDED' && waba?.waba_id) {
    await fetch(TP_SIGNUP_URL, {
      method: 'POST',
      headers: {
        Authorization: INT_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object: 'tech_partner',
        entry: [{ changes: [{ value: { event, waba_info: waba } }] }],
      }),
    });
  }

  /* ②  Interakt confirms everything is ready → persist for later API calls */
  if (event === 'WABA_ONBOARDED') {
    try {
      // Try to get userId from different possible locations in the webhook
      const userId = value.userId ||
                     value.user_id ||
                     value.setup?.userId ||
                     waba?.setup?.userId ||
                     body.userId;

      if (userId) {
        // Update the user with the new WABA account
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            $push: {
              wabaAccounts: {
                wabaId: value.waba_id || waba?.waba_id,
                phoneNumberId: value.phone_number_id || waba?.phone_number_id,
                businessName: value.business_name || waba?.business_name || 'New Business',
                phoneNumber: value.phone_number || waba?.phone_number || '',
                connectedAt: new Date(),
                status: 'active',
                isvNameToken: value.isv_name_token || waba?.isv_name_token || '',
              }
            }
          },
          { new: true }
        );

        if (updatedUser) {
          console.log(`WABA onboarded and saved to user: ${userId}`, {
            wabaId: value.waba_id || waba?.waba_id,
            phoneNumberId: value.phone_number_id || waba?.phone_number_id
          });
        } else {
          console.error(`User not found: ${userId}`);
        }
      } else {
        console.log('No user ID found in WABA onboarding event. Available data:', JSON.stringify(value, null, 2));
      }
    } catch (error) {
      console.error('Error updating user with WABA:', error);
    }
  }

  /* ③  (Optional)  Handle delivery / inbound message events for analytics */
  // message_api_sent / delivered / read / failed / message_received …

  return NextResponse.json({ received: true });
}
