import { NextRequest, NextResponse } from 'next/server';

const TP_SIGNUP_URL = 'https://api.interakt.ai/v1/organizations/tp-signup/';
const INT_API_TOKEN = process.env.INTERAKT_API_TOKEN!;

export async function POST(request: NextRequest) {
  try {
    const { wabaId, phoneNumberId, businessName, phoneNumber, userId } = await request.json();

    console.log('=== INTERAKT TP SIGNUP API CALL ===');
    console.log('User ID:', userId);
    console.log('WABA ID:', wabaId);
    console.log('Phone Number ID:', phoneNumberId);
    console.log('Business Name:', businessName);
    console.log('Phone Number:', phoneNumber);

    if (!wabaId || !phoneNumberId) {
      console.error('❌ Missing required WABA data');
      return NextResponse.json({
        error: 'Missing required WABA data',
        details: 'WABA ID and Phone Number ID are required'
      }, { status: 400 });
    }

    if (!INT_API_TOKEN) {
      console.error('❌ Missing Interakt API token');
      return NextResponse.json({
        error: 'Server configuration error',
        details: 'Missing Interakt API token'
      }, { status: 500 });
    }

    // Prepare the payload according to Interakt's TP Signup API specification
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
              phone_number: phoneNumber || '',
              // Include user ID in the setup for tracking
              setup: {
                userId: userId,
              }
            }
          }
        }]
      }]
    };

    console.log('📤 Sending to Interakt TP Signup:', JSON.stringify(tpSignupPayload, null, 2));

    const response = await fetch(TP_SIGNUP_URL, {
      method: 'POST',
      headers: {
        // According to Interakt docs, use just the token value, not "Bearer {token}"
        'Authorization': INT_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tpSignupPayload),
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    console.log('📥 Interakt response status:', response.status);
    console.log('📥 Interakt response:', responseData);

    if (response.ok) {
      console.log('✅ Interakt TP Signup successful');
      console.log('⏳ Waiting for WABA_ONBOARDED webhook from Interakt...');

      return NextResponse.json({
        success: true,
        message: 'TP Signup initiated successfully',
        wabaId,
        phoneNumberId,
        businessName,
        response: responseData
      });
    } else {
      console.error('❌ Interakt TP Signup failed');

      let errorMessage = 'TP Signup failed';
      if (typeof responseData === 'object' && responseData.error) {
        errorMessage = responseData.error.message || responseData.error;
      } else if (typeof responseData === 'string') {
        errorMessage = responseData;
      }

      return NextResponse.json({
        error: 'TP Signup failed',
        details: errorMessage,
        status: response.status,
        wabaId,
        phoneNumberId
      }, { status: response.status >= 400 && response.status < 500 ? response.status : 500 });
    }

  } catch (error) {
    console.error('❌ Error in TP Signup:', error);

    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
