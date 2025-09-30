// app/api/interakt/tp-signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Interakt Tech Partner signup endpoint per Partner API
const TP_SIGNUP_URL = 'https://api.interakt.ai/v1/organizations/tp-signup/';
const INT_API_TOKEN = process.env.INTERAKT_API_TOKEN!;

export async function POST(request: NextRequest) {
  console.log('\n🚀 ===== INTERAKT TP SIGNUP API CALL STARTED =====');

  try {
    // ──────────────────────────────────────────────────────────────────────────
    // Parse + log request
    // ──────────────────────────────────────────────────────────────────────────
    const requestBody = await request.json();
    console.log('📥 Request body received:', JSON.stringify(requestBody, null, 2));

    // Client should send: userId, wabaId, solutionId, (optional) phoneNumber, (optional) businessName
    const {
      userId,
      wabaId,
      solutionId,
      phoneNumber, // MSISDN like "+91999..."
      businessName,
      // NOTE: phoneNumberId is NOT required/used in TP signup; included here only to warn/log if provided
      phoneNumberId: clientPhoneNumberId,
    } = requestBody;

    console.log('📋 Parsed values:');
    console.log('   - User ID:', userId);
    console.log('   - WABA ID:', wabaId);
    console.log('   - Solution ID:', solutionId);
    console.log('   - Business Name:', businessName);
    console.log('   - Phone (MSISDN):', phoneNumber);
    console.log('   - Client sent phoneNumberId (ignored for signup):', !!clientPhoneNumberId);

    // ──────────────────────────────────────────────────────────────────────────
    // Validate inputs
    // ──────────────────────────────────────────────────────────────────────────
    if (!userId) {
      console.error('❌ VALIDATION FAILED: Missing userId');
      return NextResponse.json(
        { error: 'Missing userId', details: 'User ID is required to save WABA details' },
        { status: 400 }
      );
    }
    if (!wabaId) {
      console.error('❌ VALIDATION FAILED: Missing wabaId');
      return NextResponse.json(
        { error: 'Missing wabaId', details: 'wabaId is required' },
        { status: 400 }
      );
    }
    if (!solutionId) {
      console.error('❌ VALIDATION FAILED: Missing solutionId');
      return NextResponse.json(
        { error: 'Missing solutionId', details: 'Interakt requires waba_info.solution_id' },
        { status: 400 }
      );
    }
    if (!INT_API_TOKEN) {
      console.error('❌ CONFIGURATION ERROR: Missing INTERAKT_API_TOKEN');
      return NextResponse.json(
        { error: 'Server configuration error', details: 'Missing Interakt API token' },
        { status: 500 }
      );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // DB connect + user lookup
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🔌 Connecting to MongoDB…');
    try {
      await dbConnect();
      console.log('✅ MongoDB connection successful');
    } catch (dbErr) {
      console.error('❌ MongoDB connection failed:', dbErr);
      return NextResponse.json(
        { error: 'Database connection failed', details: 'Unable to connect to database' },
        { status: 500 }
      );
    }

    console.log('👤 Looking up user…', userId);
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ USER NOT FOUND:', userId);
      return NextResponse.json(
        { error: 'User not found', details: 'Cannot update WABA details for non-existent user' },
        { status: 404 }
      );
    }
    console.log('✅ User found:', user.email);

    // ──────────────────────────────────────────────────────────────────────────
    // Build spec-aligned TP signup payload
    // (NO phone_number_id here; optional phone_number MSISDN allowed)
    // ──────────────────────────────────────────────────────────────────────────
    const waba_info: Record<string, any> = {
      waba_id: wabaId,
      solution_id: solutionId,
    };
    if (phoneNumber) {
      waba_info.phone_number = phoneNumber; // optional disambiguation if multiple numbers on WABA
    }

    const tpSignupPayload = {
      entry: [
        {
          changes: [
            {
              value: {
                event: 'PARTNER_ADDED',
                waba_info,
              },
            },
          ],
        },
      ],
      object: 'tech_partner',
    };

    console.log('📦 TP Signup payload (spec-aligned):');
    console.log(JSON.stringify(tpSignupPayload, null, 2));

    // ──────────────────────────────────────────────────────────────────────────
    // Call Interakt TP Signup API
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🌐 Calling Interakt TP Signup API…');
    console.log('   - URL:', TP_SIGNUP_URL);
    console.log('   - Auth Header present:', !!INT_API_TOKEN);

    let response: Response;
    let responseText = '';
    let responseData: any;

    try {
      response = await fetch(TP_SIGNUP_URL, {
        method: 'POST',
        headers: {
          Authorization: INT_API_TOKEN, // keep as in your original integration
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tpSignupPayload),
      });

      console.log('📡 Interakt API status:', response.status);
      responseText = await response.text();
      console.log('📥 Raw Interakt response:', responseText);

      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.warn('⚠️ Could not parse Interakt response JSON:', e);
        responseData = responseText;
      }
    } catch (fetchError: any) {
      console.error('❌ Error calling Interakt API:', fetchError);
      return NextResponse.json(
        {
          error: 'Failed to call Interakt API',
          details: fetchError?.message || 'Network error',
        },
        { status: 500 }
      );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Handle Interakt response
    // ──────────────────────────────────────────────────────────────────────────
    if (!response.ok) {
      console.error('❌ Interakt TP Signup failed');
      console.error('   - Status:', response.status);
      let details =
        (typeof responseData === 'object' && (responseData?.error?.message || responseData?.error)) ||
        (typeof responseData === 'string' ? responseData : 'TP Signup failed');

      return NextResponse.json(
        {
          error: 'TP Signup failed',
          details,
          status: response.status,
          interaktResponse: responseData,
          sentPayload: tpSignupPayload,
        },
        { status: response.status >= 400 && response.status < 500 ? response.status : 500 }
      );
    }

    console.log('✅ Interakt TP Signup call succeeded');

    // ──────────────────────────────────────────────────────────────────────────
    // Save WABA immediately with pending status (webhook will finalize)
    // ──────────────────────────────────────────────────────────────────────────
    try {
      const existingIdx = (user.wabaAccounts || []).findIndex(
        (acc: any) => acc.wabaId === wabaId
      );

      const now = new Date();
      const wabaAccountData = {
        wabaId,
        // phoneNumberId will arrive via WABA_ONBOARDED webhook later:
        phoneNumberId: '', // placeholder until webhook
        businessName: businessName || 'WhatsApp Business',
        phoneNumber: phoneNumber || '',
        connectedAt: now,
        status: 'pending', // will be set to 'active' by webhook
        isvNameToken: '',  // will be filled by webhook
        templateCount: 0,
      };

      if (existingIdx >= 0) {
        console.log('🔄 Updating existing WABA account (pending)…');
        user.wabaAccounts[existingIdx] = {
          ...(user.wabaAccounts[existingIdx].toObject?.() ?? user.wabaAccounts[existingIdx]),
          ...wabaAccountData,
        };
      } else {
        console.log('➕ Adding new WABA account (pending)…');
        user.wabaAccounts = user.wabaAccounts || [];
        user.wabaAccounts.push(wabaAccountData);
      }

      const saved = await user.save();
      console.log('💾 User updated with pending WABA. Count =', saved.wabaAccounts.length);
    } catch (dbSaveError: any) {
      console.error('❌ Failed to save pending WABA to DB:', dbSaveError);
      // Even if DB save fails, return Interakt response so caller knows signup call itself worked
      return NextResponse.json(
        {
          error: 'Database save failed',
          details: 'TP signup call succeeded but failed to save pending WABA to database',
          interaktResponse: responseData,
        },
        { status: 500 }
      );
    }

    console.log('🎉 TP SIGNUP COMPLETED (pending). Awaiting WABA_ONBOARDED webhook for final credentials.');
    return NextResponse.json({
      success: true,
      message: 'TP Signup accepted by Interakt. WABA saved as pending; will activate on WABA_ONBOARDED.',
      wabaId,
      solutionId,
      userId,
      phoneNumber: phoneNumber || undefined,
      databaseUpdated: true,
      interaktResponse: responseData,
    });
  } catch (error: any) {
    console.error('❌ CRITICAL ERROR in TP Signup:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error?.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  } finally {
    console.log('🏁 ===== INTERAKT TP SIGNUP API CALL ENDED =====\n');
  }
}
