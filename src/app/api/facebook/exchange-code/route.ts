import { NextRequest, NextResponse } from 'next/server';

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID!;
const META_APP_SECRET = process.env.META_APP_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();

    console.log('=== EXCHANGING FACEBOOK CODE FOR WABA DATA ===');
    console.log('Code:', code);
    console.log('User ID:', userId);

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    if (!META_APP_ID || !META_APP_SECRET) {
      console.error('❌ Missing Meta app credentials');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Step 1: Exchange authorization code for access token
    console.log('🔄 Step 1: Exchanging code for access token...');
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token`;
    const tokenParams = new URLSearchParams({
      client_id: META_APP_ID,
      client_secret: META_APP_SECRET,
      code: code,
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response status:', tokenResponse.status);
    console.log('Token response:', tokenData);

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('❌ Failed to get access token:', tokenData);
      return NextResponse.json({
        error: 'Failed to exchange code for token',
        details: tokenData
      }, { status: 400 });
    }

    const accessToken = tokenData.access_token;
    console.log('✅ Got access token');

    // Step 2: Get user's businesses
    console.log('🔄 Step 2: Getting user businesses...');
    const businessesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/businesses?access_token=${accessToken}`
    );
    const businessesData = await businessesResponse.json();

    console.log('Businesses response:', businessesData);

    if (!businessesResponse.ok) {
      console.error('❌ Failed to get businesses:', businessesData);
      return NextResponse.json({
        error: 'Failed to get user businesses',
        details: businessesData
      }, { status: 400 });
    }

    const businesses = businessesData.data || [];
    console.log(`Found ${businesses.length} businesses`);

    // Step 3: Look for WhatsApp Business Accounts in each business
    for (const business of businesses) {
      console.log(`🔄 Checking business: ${business.name} (${business.id})`);

      try {
        const wabaResponse = await fetch(
          `https://graph.facebook.com/v18.0/${business.id}/whatsapp_business_accounts?access_token=${accessToken}`
        );
        const wabaData = await wabaResponse.json();

        console.log(`WABA response for ${business.id}:`, wabaData);

        if (wabaData.data && wabaData.data.length > 0) {
          for (const waba of wabaData.data) {
            console.log(`🔄 Checking WABA: ${waba.name} (${waba.id})`);

            // Get phone numbers for this WABA
            const phoneResponse = await fetch(
              `https://graph.facebook.com/v18.0/${waba.id}/phone_numbers?access_token=${accessToken}`
            );
            const phoneData = await phoneResponse.json();

            console.log(`Phone numbers for WABA ${waba.id}:`, phoneData);

            if (phoneData.data && phoneData.data.length > 0) {
              const phoneNumber = phoneData.data[0]; // Use the first phone number

              console.log('✅ Found WABA with phone number!');
              console.log('WABA ID:', waba.id);
              console.log('Phone Number ID:', phoneNumber.id);
              console.log('Business Name:', business.name);
              console.log('Phone Number:', phoneNumber.display_phone_number);

              return NextResponse.json({
                success: true,
                waba: {
                  wabaId: waba.id,
                  phoneNumberId: phoneNumber.id,
                  businessName: business.name || waba.name || 'New Business',
                  phoneNumber: phoneNumber.display_phone_number || '',
                  userId: userId
                }
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error checking business ${business.id}:`, error);
        continue; // Try next business
      }
    }

    // If we get here, no WABA was found
    console.log('❌ No WhatsApp Business Accounts found');
    return NextResponse.json({
      error: 'No WhatsApp Business Accounts found',
      details: 'Make sure you have completed the WhatsApp Business setup'
    }, { status: 404 });

  } catch (error) {
    console.error('❌ Error in code exchange:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
