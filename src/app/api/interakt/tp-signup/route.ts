import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

const TP_SIGNUP_URL = 'https://api.interakt.ai/v1/organizations/tp-signup/';
const INT_API_TOKEN = process.env.INTERAKT_API_TOKEN!;

export async function POST(request: NextRequest) {
  console.log('\n🚀 ===== INTERAKT TP SIGNUP API CALL STARTED =====');

  try {
    // Parse request body
    const requestBody = await request.json();
    console.log('📥 Request body received:', JSON.stringify(requestBody, null, 2));

    const { wabaId, phoneNumberId, businessName, phoneNumber, userId } = requestBody;

    // Log all parsed values
    console.log('📋 Parsed values:');
    console.log('   - User ID:', userId);
    console.log('   - WABA ID:', wabaId);
    console.log('   - Phone Number ID:', phoneNumberId);
    console.log('   - Business Name:', businessName);
    console.log('   - Phone Number:', phoneNumber);

    // Validation with detailed logging
    if (!wabaId || !phoneNumberId) {
      console.error('❌ VALIDATION FAILED: Missing required WABA data');
      console.error('   - WABA ID provided:', !!wabaId);
      console.error('   - Phone Number ID provided:', !!phoneNumberId);

      return NextResponse.json({
        error: 'Missing required WABA data',
        details: 'WABA ID and Phone Number ID are required'
      }, { status: 400 });
    }

    if (!userId) {
      console.error('❌ VALIDATION FAILED: Missing user ID');
      return NextResponse.json({
        error: 'Missing user ID',
        details: 'User ID is required to save WABA details'
      }, { status: 400 });
    }

    if (!INT_API_TOKEN) {
      console.error('❌ CONFIGURATION ERROR: Missing Interakt API token');
      return NextResponse.json({
        error: 'Server configuration error',
        details: 'Missing Interakt API token'
      }, { status: 500 });
    }

    console.log('✅ All validations passed');

    // Connect to database with logging
    console.log('🔌 Attempting to connect to MongoDB...');
    try {
      await dbConnect();
      console.log('✅ MongoDB connection successful');
    } catch (dbError) {
      console.error('❌ MongoDB connection failed:', dbError);
      return NextResponse.json({
        error: 'Database connection failed',
        details: 'Unable to connect to database'
      }, { status: 500 });
    }

    // Find and validate user
    console.log('👤 Looking up user in database...');
    console.log('   - Searching for user ID:', userId);

    let user;
    try {
      user = await User.findById(userId);
      console.log('📋 User lookup result:', user ? 'FOUND' : 'NOT FOUND');

      if (user) {
        console.log('👤 User details:');
        console.log('   - Name:', user.name);
        console.log('   - Email:', user.email);
        console.log('   - Company ID:', user.companyId);
        console.log('   - Current WABA accounts count:', user.wabaAccounts?.length || 0);

        if (user.wabaAccounts?.length > 0) {
          console.log('📱 Existing WABA accounts:');
          user.wabaAccounts.forEach((waba, index) => {
            console.log(`     ${index + 1}. WABA: ${waba.wabaId}, Phone: ${waba.phoneNumberId}, Status: ${waba.status}`);
          });
        }
      }
    } catch (userLookupError) {
      console.error('❌ Error looking up user:', userLookupError);
      return NextResponse.json({
        error: 'User lookup failed',
        details: 'Error finding user in database'
      }, { status: 500 });
    }

    if (!user) {
      console.error('❌ USER NOT FOUND in database');
      console.error('   - Searched for user ID:', userId);
      return NextResponse.json({
        error: 'User not found',
        details: 'Cannot update WABA details for non-existent user'
      }, { status: 404 });
    }

    console.log('✅ User found successfully');

    // Prepare TP signup payload
    console.log('📦 Preparing TP signup payload...');
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
              setup: {
                userId: userId,
              }
            }
          }
        }]
      }]
    };

    console.log('📤 TP Signup payload prepared:');
    console.log(JSON.stringify(tpSignupPayload, null, 2));

    // Call Interakt TP Signup API
    console.log('🌐 Calling Interakt TP Signup API...');
    console.log('   - URL:', TP_SIGNUP_URL);
    console.log('   - Method: POST');
    console.log('   - Headers: Authorization present:', !!INT_API_TOKEN);

    let response;
    let responseText;
    let responseData;

    try {
      response = await fetch(TP_SIGNUP_URL, {
        method: 'POST',
        headers: {
          'Authorization': INT_API_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tpSignupPayload),
      });

      console.log('📡 Interakt API response status:', response.status);
      console.log('📡 Interakt API response headers:', Object.fromEntries(response.headers.entries()));

      responseText = await response.text();
      console.log('📥 Raw Interakt response:', responseText);

      try {
        responseData = JSON.parse(responseText);
        console.log('📋 Parsed Interakt response:', JSON.stringify(responseData, null, 2));
      } catch (parseError) {
        console.warn('⚠️ Could not parse Interakt response as JSON:', parseError);
        responseData = responseText;
      }

    } catch (fetchError) {
      console.error('❌ Error calling Interakt API:', fetchError);
      return NextResponse.json({
        error: 'Failed to call Interakt API',
        details: fetchError instanceof Error ? fetchError.message : 'Network error'
      }, { status: 500 });
    }

    // Process Interakt response
    if (response.ok) {
      console.log('✅ Interakt TP Signup API call successful');

      // Save WABA details to database IMMEDIATELY (don't wait for webhook)
      console.log('💾 Saving WABA details to user database...');

      try {
        // Check if WABA already exists
        const existingWabaIndex = user.wabaAccounts.findIndex(
          (waba) => waba.wabaId === wabaId || waba.phoneNumberId === phoneNumberId
        );

        console.log('🔍 Checking for existing WABA...');
        console.log('   - Existing WABA index:', existingWabaIndex);

        const wabaAccountData = {
          wabaId,
          phoneNumberId,
          businessName: businessName || 'New Business',
          phoneNumber: phoneNumber || '',
          connectedAt: new Date(),
          status: 'active',
          isvNameToken: responseData?.isvNameToken || responseData?.isv_name_token || '',
          templateCount: 0
        };

        console.log('📱 WABA account data to save:');
        console.log(JSON.stringify(wabaAccountData, null, 2));

        if (existingWabaIndex >= 0) {
          console.log('🔄 Updating existing WABA account at index:', existingWabaIndex);
          user.wabaAccounts[existingWabaIndex] = wabaAccountData;
        } else {
          console.log('➕ Adding new WABA account');
          user.wabaAccounts.push(wabaAccountData);
        }

        console.log('💾 Attempting to save user to database...');
        console.log('   - User ID:', user._id);
        console.log('   - Total WABA accounts after update:', user.wabaAccounts.length);

        const savedUser = await user.save();
        console.log('✅ User saved successfully to database!');
        console.log('📱 Final WABA accounts count:', savedUser.wabaAccounts.length);

        // Log the saved WABA account details
        const savedWaba = savedUser.wabaAccounts[savedUser.wabaAccounts.length - 1];
        console.log('📋 Saved WABA account details:');
        console.log('   - WABA ID:', savedWaba.wabaId);
        console.log('   - Phone Number ID:', savedWaba.phoneNumberId);
        console.log('   - Business Name:', savedWaba.businessName);
        console.log('   - Status:', savedWaba.status);
        console.log('   - Connected At:', savedWaba.connectedAt);

      } catch (dbSaveError) {
        console.error('❌ CRITICAL ERROR: Failed to save WABA details to database');
        console.error('   - Error:', dbSaveError);
        console.error('   - Stack:', dbSaveError instanceof Error ? dbSaveError.stack : 'No stack trace');

        // Return error since database save failed
        return NextResponse.json({
          error: 'Database save failed',
          details: 'TP signup successful but failed to save WABA details to database',
          interaktResponse: responseData
        }, { status: 500 });
      }

      console.log('🎉 TP SIGNUP COMPLETED SUCCESSFULLY!');
      console.log('⏳ Waiting for WABA_ONBOARDED webhook from Interakt...');

      return NextResponse.json({
        success: true,
        message: 'TP Signup completed successfully and WABA details saved to database',
        wabaId,
        phoneNumberId,
        businessName,
        userId,
        databaseUpdated: true,
        interaktResponse: responseData
      });

    } else {
      console.error('❌ Interakt TP Signup API call failed');
      console.error('   - Status:', response.status);
      console.error('   - Response:', responseText);

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
        phoneNumberId,
        interaktResponse: responseData
      }, { status: response.status >= 400 && response.status < 500 ? response.status : 500 });
    }

  } catch (error) {
    console.error('❌ CRITICAL ERROR in TP Signup:', error);
    console.error('   - Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('   - Stack trace:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  } finally {
    console.log('🏁 ===== INTERAKT TP SIGNUP API CALL ENDED =====\n');
  }
}
