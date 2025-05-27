import { NextRequest, NextResponse } from 'next/server';

const TP_SIGNUP_URL = 'https://api.interakt.ai/v1/organizations/tp-signup/';
const INT_API_TOKEN = process.env.INTERAKT_API_TOKEN!;

export async function POST(request: NextRequest) {
  try {
    const { wabaId, phoneNumberId, businessName, userId } = await request.json();

    console.log('=== CALLING INTERAKT TP SIGNUP ===');
    console.log('User ID:', userId);
    console.log('WABA ID:', wabaId);
    console.log('Phone Number ID:', phoneNumberId);
    console.log('Business Name:', businessName);

    if (!wabaId || !phoneNumberId) {
      console.error('❌ Missing required WABA data');
      return NextResponse.json({ error: 'Missing WABA ID or Phone Number ID' }, { status: 400 });
    }

    // Call Interakt's TP Signup API with the actual WABA data
    const tpSignupPayload = {
      object: 'tech_partner',
      entry: [{
        changes: [{
          value: {
            event: 'PARTNER_ADDED',
            waba_info: {
              waba_id: wabaId,
              phone_number_id: phoneNumberId,
              business_name: businessName || 'New Business',
              // Include user ID for tracking in the webhook
              userId: userId,
            }
          }
        }]
      }]
    };

    console.log('📤 Sending to Interakt:', JSON.stringify(tpSignupPayload, null, 2));

    const response = await fetch(TP_SIGNUP_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${INT_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tpSignupPayload),
    });

    const result = await response.text();
    console.log('📥 Interakt TP Signup response status:', response.status);
    console.log('📥 Interakt TP Signup response:', result);

    if (response.ok) {
      console.log('✅ Successfully called Interakt TP Signup API');
      console.log('⏳ Now waiting for WABA_ONBOARDED webhook from Interakt...');

      return NextResponse.json({
        success: true,
        message: 'TP Signup initiated successfully',
        wabaId,
        phoneNumberId,
        response: result
      });
    } else {
      console.error('❌ Interakt TP Signup failed');
      return NextResponse.json({
        error: 'TP Signup failed',
        details: result,
        status: response.status
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in TP Signup:', error);
    return NextResponse.json({
      error: 'Internal error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
