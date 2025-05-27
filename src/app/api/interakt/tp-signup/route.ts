import { NextRequest, NextResponse } from 'next/server';

const TP_SIGNUP_URL = 'https://api.interakt.ai/v1/organizations/tp-signup/';
const INT_API_TOKEN = process.env.INTERAKT_API_TOKEN!;

export async function POST(request: NextRequest) {
  try {
    const { facebookResponse, userId } = await request.json();

    console.log('=== CALLING INTERAKT TP SIGNUP ===');
    console.log('User ID:', userId);
    console.log('Facebook response:', facebookResponse);

    // Extract WABA info from Facebook response if available
    // This might be in facebookResponse.authResponse or elsewhere
    const wabaInfo = {
      // You might need to extract this from the Facebook response
      // or it might come from the WA_EMBEDDED_SIGNUP message event
    };

    // Call Interakt's TP Signup API as per their docs
    const response = await fetch(TP_SIGNUP_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${INT_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object: 'tech_partner',
        entry: [{
          changes: [{
            value: {
              event: 'PARTNER_ADDED',
              waba_info: {
                // Fill this with actual WABA data from embedded signup
                waba_id: '', // You'll get this from embedded signup completion
                phone_number_id: '',
                business_name: '',
                // Add userId for tracking
                userId: userId,
              }
            }
          }]
        }]
      }),
    });

    const result = await response.text();
    console.log('Interakt TP Signup response:', result);

    if (response.ok) {
      return NextResponse.json({ success: true, response: result });
    } else {
      console.error('Interakt TP Signup failed:', result);
      return NextResponse.json({ error: 'TP Signup failed', details: result }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in TP Signup:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
