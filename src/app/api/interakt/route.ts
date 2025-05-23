import { NextRequest, NextResponse } from 'next/server';

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN!;
const INTERAKT_API_TOKEN = process.env.INTERAKT_API_TOKEN!;
const INTERAKT_ONBOARDING_URL = 'https://api.interakt.ai/v1/organizations/tp-signup/';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Verification failed', { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Webhook Payload:', JSON.stringify(body, null, 2));

    const event = body?.entry?.[0]?.changes?.[0]?.value?.event;
    const waba_info = body?.entry?.[0]?.changes?.[0]?.value?.waba_info;

    if (event === 'PARTNER_ADDED' && waba_info?.waba_id && waba_info?.solution_id) {
      const response = await fetch(INTERAKT_ONBOARDING_URL, {
        method: 'POST',
        headers: {
          Authorization: INTERAKT_API_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entry: [
            {
              changes: [
                {
                  value: {
                    event: 'PARTNER_ADDED',
                    waba_info: {
                      waba_id: waba_info.waba_id,
                      solution_id: waba_info.solution_id,
                    },
                  },
                },
              ],
            },
          ],
          object: 'tech_partner',
        }),
      });

      console.log('Triggered Interakt Onboarding:', await response.json());
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Webhook Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
