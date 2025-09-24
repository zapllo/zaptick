import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN!;

export async function POST(request: NextRequest) {
  console.log('\n🔧 ===== WABA CREDENTIAL RECOVERY API =====');

  try {
    const { userId, accessToken, source = 'manual_recovery' } = await request.json();

    console.log('📋 Recovery request details:');
    console.log('   - User ID:', userId);
    console.log('   - Access Token provided:', !!accessToken);
    console.log('   - Source:', source);

    if (!userId) {
      console.error('❌ No user ID provided');
      return NextResponse.json({
        error: 'User ID required',
        details: 'Please provide user ID'
      }, { status: 400 });
    }

    if (!accessToken) {
      console.error('❌ No access token provided');
      return NextResponse.json({
        error: 'Access token required',
        details: 'Facebook access token is required for credential recovery'
      }, { status: 400 });
    }

    console.log('🔌 Connecting to MongoDB...');
    await dbConnect();
    console.log('✅ MongoDB connected');

    console.log('👤 Looking up user:', userId);
    const user = await User.findById(userId);

    if (!user) {
      console.error('❌ User not found:', userId);
      return NextResponse.json({
        error: 'User not found',
        details: `No user found with ID: ${userId}`
      }, { status: 404 });
    }

    console.log('✅ User found:', user.email);
    console.log('📱 Current WABA accounts:', user.wabaAccounts?.length || 0);

    // Log existing accounts for comparison
    if (user.wabaAccounts?.length > 0) {
      console.log('📋 Existing WABA accounts:');
      user.wabaAccounts.forEach((account, index) => {
        console.log(`   ${index + 1}. WABA ID: ${account.wabaId}`);
        console.log(`      Phone Number ID: ${account.phoneNumberId}`);
        console.log(`      Business Name: ${account.businessName}`);
        console.log(`      Status: ${account.status}`);
      });
    }

    console.log('🌐 Calling Facebook Graph API to get WABA details...');

    // Try multiple Graph API endpoints
    const graphEndpoints = [
      // Main businesses endpoint
      `https://graph.facebook.com/v19.0/me/businesses?fields=whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name}}&access_token=${accessToken}`,

      // Direct WABA endpoint
      `https://graph.facebook.com/v19.0/me/whatsapp_business_accounts?fields=id,name,phone_numbers{id,display_phone_number,verified_name}&access_token=${accessToken}`,

      // Accounts endpoint
      `https://graph.facebook.com/v19.0/me/accounts?fields=whatsapp_business_account{id,name,phone_numbers{id,display_phone_number}}&access_token=${accessToken}`
    ];

    let allFoundCredentials = [];
    let successfulEndpoints = [];

    for (let i = 0; i < graphEndpoints.length; i++) {
      const endpoint = graphEndpoints[i];
      console.log(`🔍 Trying Graph API endpoint ${i + 1}/3...`);

      try {
        const wabaResponse = await fetch(endpoint, {
          headers: {
            'Accept': 'application/json',
          }
        });

        console.log(`📡 Graph API ${i + 1} response status:`, wabaResponse.status);

        if (wabaResponse.ok) {
          const responseText = await wabaResponse.text();
          console.log(`📥 Graph API ${i + 1} raw response:`, responseText);

          const wabaData = JSON.parse(responseText);
          console.log(`📋 Graph API ${i + 1} parsed response:`, JSON.stringify(wabaData, null, 2));

          // Extract credentials from this endpoint
          const credentialsFromEndpoint = await extractCredentialsFromResponse(wabaData, i + 1);

          if (credentialsFromEndpoint.length > 0) {
            allFoundCredentials.push(...credentialsFromEndpoint);
            successfulEndpoints.push(i + 1);
            console.log(`✅ Endpoint ${i + 1} found ${credentialsFromEndpoint.length} credential(s)`);
          } else {
            console.log(`⚠️ Endpoint ${i + 1} returned no credentials`);
          }
        } else {
          const errorText = await wabaResponse.text();
          console.warn(`⚠️ Graph API ${i + 1} failed (${wabaResponse.status}):`, errorText);
        }
      } catch (endpointError) {
        console.error(`❌ Error with Graph API endpoint ${i + 1}:`, endpointError);
      }
    }

    // Remove duplicates based on WABA ID
    const uniqueCredentials = [];
    const seenWabaIds = new Set();

    for (const cred of allFoundCredentials) {
      if (!seenWabaIds.has(cred.wabaId)) {
        seenWabaIds.add(cred.wabaId);
        uniqueCredentials.push(cred);
      }
    }

    console.log(`📊 Recovery results:`);
    console.log(`   - Total endpoints tried: 3`);
    console.log(`   - Successful endpoints: ${successfulEndpoints.join(', ')}`);
    console.log(`   - Total credentials found: ${allFoundCredentials.length}`);
    console.log(`   - Unique credentials: ${uniqueCredentials.length}`);

    if (uniqueCredentials.length === 0) {
      console.log('❌ No WABA credentials found in any Graph API endpoint');
      return NextResponse.json({
        success: false,
        message: 'No WhatsApp Business Accounts found',
        details: 'Either you have no WhatsApp Business Accounts connected to this Facebook account, or the access token does not have the required permissions.',
        suggestion: 'Please ensure you have connected WhatsApp Business Accounts and try connecting again.',
        debugInfo: {
          endpointsTried: 3,
          successfulEndpoints,
          accessTokenLength: accessToken.length
        }
      });
    }

    // Save/update credentials in database
    console.log('💾 Updating user database with recovered credentials...');
    let newCredentialsAdded = 0;
    let existingCredentialsUpdated = 0;

    for (const cred of uniqueCredentials) {
      console.log(`🔍 Processing credential: ${cred.wabaId}`);

      // Check if this WABA already exists
      const existingIndex = user.wabaAccounts.findIndex(
        (account: any) => account.wabaId === cred.wabaId
      );

      const credentialData = {
        wabaId: cred.wabaId,
        phoneNumberId: cred.phoneNumberId,
        businessName: cred.businessName,
        phoneNumber: cred.phoneNumber,
        connectedAt: new Date(),
        status: 'active',
        isvNameToken: '', // Will be filled by webhook later
        templateCount: 0,
        recoveredAt: new Date(),
        recoverySource: source
      };

      if (existingIndex >= 0) {
        console.log(`🔄 Updating existing WABA account: ${cred.wabaId}`);
        user.wabaAccounts[existingIndex] = {
          ...user.wabaAccounts[existingIndex].toObject?.() ?? user.wabaAccounts[existingIndex],
          ...credentialData
        };
        existingCredentialsUpdated++;
      } else {
        console.log(`➕ Adding new WABA account: ${cred.wabaId}`);
        user.wabaAccounts.push(credentialData);
        newCredentialsAdded++;
      }
    }

    console.log('💾 Saving user to database...');
    const savedUser = await user.save();
    console.log('✅ User database updated successfully');

    console.log('📊 Database update summary:');
    console.log(`   - New credentials added: ${newCredentialsAdded}`);
    console.log(`   - Existing credentials updated: ${existingCredentialsUpdated}`);
    console.log(`   - Total WABA accounts now: ${savedUser.wabaAccounts.length}`);

    // Log the final state
    console.log('📱 Final WABA accounts in database:');
    savedUser.wabaAccounts.forEach((account, index) => {
      console.log(`   ${index + 1}. WABA ID: ${account.wabaId}`);
      console.log(`      Phone Number ID: ${account.phoneNumberId}`);
      console.log(`      Business Name: ${account.businessName}`);
      console.log(`      Status: ${account.status}`);
      console.log(`      Recovery Source: ${account.recoverySource || 'N/A'}`);
    });

    const response = {
      success: true,
      message: `Successfully recovered ${uniqueCredentials.length} WhatsApp Business Account(s)`,
      credentials: uniqueCredentials,
      summary: {
        total: uniqueCredentials.length,
        newAdded: newCredentialsAdded,
        updated: existingCredentialsUpdated,
        finalCount: savedUser.wabaAccounts.length
      },
      debugInfo: {
        endpointsTried: 3,
        successfulEndpoints,
        source
      }
    };

    console.log('📤 Sending response:', JSON.stringify(response, null, 2));
    console.log('🏁 ===== CREDENTIAL RECOVERY COMPLETED =====\n');

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ CRITICAL ERROR in credential recovery:', error);
    console.error('   - Stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json({
      error: 'Recovery failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      suggestion: 'Please try again or contact support if the issue persists'
    }, { status: 500 });
  }
}

// Helper function to extract credentials from different Graph API response formats
async function extractCredentialsFromResponse(wabaData: any, endpointNumber: number): Promise<any[]> {
  console.log(`🔍 Extracting credentials from endpoint ${endpointNumber} response...`);

  const credentials = [];

  try {
    // Format 1: Businesses with whatsapp_business_accounts
    if (wabaData.data && Array.isArray(wabaData.data)) {
      console.log(`📋 Format 1: Processing ${wabaData.data.length} business(es)...`);

      for (const business of wabaData.data) {
        console.log(`🏢 Processing business:`, business.id);

        // Check if this business has WhatsApp Business Accounts
        if (business.whatsapp_business_accounts?.data) {
          const wabas = business.whatsapp_business_accounts.data;
          console.log(`📱 Found ${wabas.length} WABA(s) in business`);

          for (const waba of wabas) {
            console.log(`🔍 Processing WABA: ${waba.id}`);

            if (waba.phone_numbers?.data) {
              for (const phoneNumber of waba.phone_numbers.data) {
                console.log(`📞 Processing phone number: ${phoneNumber.id}`);

                credentials.push({
                  wabaId: waba.id,
                  phoneNumberId: phoneNumber.id,
                  businessName: waba.name || phoneNumber.verified_name || 'Recovered Business',
                  phoneNumber: phoneNumber.display_phone_number || '',
                  source: `graph_api_endpoint_${endpointNumber}`
                });

                console.log(`✅ Added credential: WABA ${waba.id}, Phone ${phoneNumber.id}`);
              }
            } else if (waba.id) {
              // WABA exists but no phone numbers - still add it
              console.log(`⚠️ WABA ${waba.id} has no phone numbers, adding anyway`);

              credentials.push({
                wabaId: waba.id,
                phoneNumberId: 'unknown',
                businessName: waba.name || 'Recovered Business',
                phoneNumber: '',
                source: `graph_api_endpoint_${endpointNumber}_no_phone`
              });
            }
          }
        }

        // Check if business itself has whatsapp_business_account (singular)
        if (business.whatsapp_business_account) {
          console.log(`📱 Found singular WABA in business`);
          const waba = business.whatsapp_business_account;

          if (waba.phone_numbers?.data) {
            for (const phoneNumber of waba.phone_numbers.data) {
              credentials.push({
                wabaId: waba.id,
                phoneNumberId: phoneNumber.id,
                businessName: waba.name || phoneNumber.verified_name || 'Recovered Business',
                phoneNumber: phoneNumber.display_phone_number || '',
                source: `graph_api_endpoint_${endpointNumber}_singular`
              });
            }
          }
        }
      }
    }

    // Format 2: Direct WhatsApp Business Accounts (for endpoint 2)
    if (wabaData.data && endpointNumber === 2) {
      console.log(`📋 Format 2: Direct WABA format with ${wabaData.data.length} account(s)`);

      for (const waba of wabaData.data) {
        if (waba.phone_numbers?.data) {
          for (const phoneNumber of waba.phone_numbers.data) {
            credentials.push({
              wabaId: waba.id,
              phoneNumberId: phoneNumber.id,
              businessName: waba.name || phoneNumber.verified_name || 'Recovered Business',
              phoneNumber: phoneNumber.display_phone_number || '',
              source: `graph_api_endpoint_${endpointNumber}_direct`
            });
          }
        }
      }
    }

    console.log(`📊 Endpoint ${endpointNumber} extracted ${credentials.length} credential(s)`);

  } catch (extractError) {
    console.error(`❌ Error extracting from endpoint ${endpointNumber}:`, extractError);
  }

  return credentials;
}
