"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  CheckCircle2 as CheckCircle,
  RefreshCw,
  AlertTriangle,
  Phone,
  Building2,
  Zap,
  Shield,
  Clock,
  Sparkles
} from "lucide-react";

export default function ConnectWabaButton() {
  const [sdkReady, setSdkReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const { user } = useAuth();

  // Enhanced logging function
  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(`${type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'} ${logMessage}`);
    setDebugLogs(prev => [...prev.slice(-50), logMessage]); // Keep last 50 logs
  };

  useEffect(() => {
    addLog('🔧 ConnectWabaButton component mounted');
    addLog(`👤 User ID: ${user?.id || 'Not available'}`);
    addLog(`📧 User email: ${user?.email || 'Not available'}`);

    // Ultra-comprehensive message listener
    const handleMessage = (event: MessageEvent) => {
      addLog('🔔 ===== MESSAGE EVENT RECEIVED =====');
      addLog(`📍 Origin: ${event.origin}`);
      addLog(`📦 Raw data type: ${typeof event.data}`);
      addLog(`🔍 Data constructor: ${event.data?.constructor?.name || 'unknown'}`);

      // Log the raw data in multiple ways
      try {
        addLog(`📋 Data as string: ${String(event.data)}`);
      } catch (e) {
        addLog('❌ Could not convert data to string', 'error');
      }

      try {
        addLog(`📋 JSON stringified: ${JSON.stringify(event.data, null, 2)}`);
      } catch (e) {
        addLog('⚠️ Could not JSON stringify data', 'warning');
      }

      // Check for specific properties
      addLog(`🔍 Checking data properties:`);
      addLog(`   - event.data.type: ${event.data?.type}`);
      addLog(`   - event.data.event: ${event.data?.event}`);
      addLog(`   - event.data.data: ${JSON.stringify(event.data?.data)}`);
      addLog(`   - event.data.status: ${event.data?.status}`);
      addLog(`   - event.data.authResponse: ${!!event.data?.authResponse}`);

      // Accept messages from Facebook domains
      const allowedOrigins = [
        "https://www.facebook.com",
        "https://web.facebook.com",
        "https://business.facebook.com",
        "https://connect.facebook.net"
      ];

      if (!allowedOrigins.includes(event.origin)) {
        addLog(`⚠️ Message from non-Facebook origin: ${event.origin}`, 'warning');
        // Don't return - let's still process it for debugging
      }

      let data = event.data;

      // Handle different message formats
      try {
        if (typeof data === 'string') {
          addLog('🔄 Attempting to parse string data as JSON...');
          data = JSON.parse(data);
          addLog('✅ Successfully parsed string data as JSON', 'success');
        }
      } catch (e) {
        addLog('⚠️ Could not parse string as JSON, keeping as-is', 'warning');
      }

      addLog(`📋 Final processed data: ${JSON.stringify(data, null, 2)}`);

      // Check for WhatsApp embedded signup events
      if (data?.type === 'WA_EMBEDDED_SIGNUP') {
        addLog('🎯 WhatsApp Embedded Signup Event FOUND!', 'success');
        addLog(`📋 Event type: ${data.event}`);
        addLog(`📦 Event data: ${JSON.stringify(data.data, null, 2)}`);

        if (data.event === 'FINISH') {
          addLog('🎉 WhatsApp signup FINISHED successfully!', 'success');

          const wabaData = data.data;
          addLog(`📱 Raw WABA data: ${JSON.stringify(wabaData, null, 2)}`);

          // Try multiple extraction methods
          const extractionAttempts = [
            {
              name: 'Direct properties',
              wabaId: wabaData?.waba_id,
              phoneNumberId: wabaData?.phone_number_id,
              businessName: wabaData?.business_name,
              phoneNumber: wabaData?.phone_number || wabaData?.display_phone_number
            },
            {
              name: 'Nested in waba object',
              wabaId: wabaData?.waba?.id,
              phoneNumberId: wabaData?.phone_number?.id,
              businessName: wabaData?.business?.name,
              phoneNumber: wabaData?.phone_number?.display_phone_number
            },
            {
              name: 'CamelCase properties',
              wabaId: wabaData?.wabaId,
              phoneNumberId: wabaData?.phoneNumberId,
              businessName: wabaData?.businessName,
              phoneNumber: wabaData?.phoneNumber
            }
          ];

          let extractedData = null;
          for (const attempt of extractionAttempts) {
            addLog(`🔍 Trying extraction method: ${attempt.name}`);
            addLog(`   - WABA ID: ${attempt.wabaId}`);
            addLog(`   - Phone Number ID: ${attempt.phoneNumberId}`);
            addLog(`   - Business Name: ${attempt.businessName}`);
            addLog(`   - Phone Number: ${attempt.phoneNumber}`);

            if (attempt.wabaId && attempt.phoneNumberId) {
              extractedData = {
                wabaId: attempt.wabaId,
                phoneNumberId: attempt.phoneNumberId,
                businessName: attempt.businessName || 'New Business',
                phoneNumber: attempt.phoneNumber || '',
                userId: user?.id
              };
              addLog(`✅ Successfully extracted data using: ${attempt.name}`, 'success');
              break;
            }
          }

          if (extractedData && user?.id) {
            addLog('🚀 All required data extracted, calling TP signup...', 'success');
            callTPSignup(extractedData);
          } else {
            addLog('❌ Failed to extract required WABA data', 'error');
            addLog(`Missing: ${!extractedData?.wabaId ? 'WABA ID ' : ''}${!extractedData?.phoneNumberId ? 'Phone Number ID ' : ''}${!user?.id ? 'User ID' : ''}`);
            setIsConnecting(false);
            alert('❌ Could not extract WABA credentials from signup. Please try again.');
          }

        } else if (data.event === 'CANCEL') {
          addLog('⚠️ User cancelled WhatsApp signup', 'warning');
          setIsConnecting(false);
          alert('WhatsApp signup was cancelled.');

        } else if (data.event === 'ERROR') {
          addLog(`❌ WhatsApp signup error: ${JSON.stringify(data.data)}`, 'error');
          setIsConnecting(false);
          const errorMsg = data.data?.error_message || 'Unknown signup error';
          alert(`❌ Signup failed: ${errorMsg}`);

        } else {
          addLog(`ℹ️ Unknown WhatsApp embedded signup event: ${data.event}`);
        }

      } else if (data?.type === 'platform_browser_close') {
        addLog('🔄 Facebook popup closed');

      } else if (data?.authResponse) {
        addLog('🔑 Facebook auth response received');
        addLog(`📋 Auth response: ${JSON.stringify(data.authResponse, null, 2)}`);

        // Try to extract WABA data from auth response
        if (data.authResponse.accessToken) {
          addLog('🔍 Access token found, attempting Graph API recovery...', 'success');
          handleGraphAPIRecovery(data.authResponse.accessToken);
        }

      } else {
        addLog(`ℹ️ Other message type: ${data?.type || 'unknown'}`);
      }

      addLog('🏁 ===== MESSAGE PROCESSING COMPLETE =====');
    };

    // Enhanced TP Signup function
    const callTPSignup = async (wabaData: any) => {
      addLog('\n🚀 ===== STARTING TP SIGNUP PROCESS =====', 'info');
      addLog(`📤 WABA data for TP signup: ${JSON.stringify(wabaData, null, 2)}`);

      try {
        addLog('🌐 Making POST request to /api/interakt/tp-signup');

        const requestBody = {
          ...wabaData,
          timestamp: Date.now(),
          source: 'embedded_signup'
        };

        const response = await fetch('/api/interakt/tp-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': wabaData.userId,
            'x-request-source': 'connect_waba_button'
          },
          body: JSON.stringify(requestBody),
        });

        addLog(`📡 TP Signup response received:`);
        addLog(`   - Status: ${response.status}`);
        addLog(`   - Status Text: ${response.statusText}`);
        addLog(`   - OK: ${response.ok}`);

        const responseText = await response.text();
        addLog(`📥 Raw response body: ${responseText}`);

        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          addLog(`❌ Failed to parse response as JSON: ${parseError}`, 'error');
          result = { error: 'Invalid JSON response', details: responseText };
        }

        addLog(`📋 Parsed response: ${JSON.stringify(result, null, 2)}`);

        if (response.ok && result.success) {
          addLog('🎉 TP SIGNUP SUCCESSFUL!', 'success');
          addLog(`✅ Database updated: ${result.databaseUpdated}`);
          addLog(`📱 WABA ID saved: ${result.wabaId}`);
          addLog(`📞 Phone Number ID saved: ${result.phoneNumberId}`);

          // Dispatch success events
          addLog('📢 Dispatching success events...');

          window.dispatchEvent(new CustomEvent('wabaSignupCompleted', {
            detail: {
              wabaId: wabaData.wabaId,
              phoneNumberId: wabaData.phoneNumberId,
              businessName: wabaData.businessName,
              databaseUpdated: result.databaseUpdated
            }
          }));

          window.dispatchEvent(new CustomEvent('wabaConnected'));

          setIsConnecting(false);

          alert(`🎉 WhatsApp Business Account connected successfully!\n\n` +
            `✅ Business: ${wabaData.businessName}\n` +
            `📱 WABA ID: ${wabaData.wabaId}\n` +
            `📞 Phone ID: ${wabaData.phoneNumberId}\n` +
            `💾 Database: ${result.databaseUpdated ? 'Updated' : 'Update pending'}`
          );

        } else {
          addLog('❌ TP SIGNUP FAILED', 'error');
          addLog(`   - Response OK: ${response.ok}`);
          addLog(`   - Result success: ${result.success}`);
          addLog(`   - Error: ${result.error}`);
          addLog(`   - Details: ${result.details}`);

          setIsConnecting(false);

          let errorMessage = result.error || 'Unknown error occurred';
          if (result.details) {
            errorMessage += `\n\nDetails: ${result.details}`;
          }

          alert(`❌ Setup failed: ${errorMessage}\n\nPlease try the recovery option below.`);
        }

      } catch (error) {
        addLog(`❌ CRITICAL ERROR in TP signup: ${error}`, 'error');
        setIsConnecting(false);
        alert(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try the recovery option.`);

      } finally {
        addLog('🏁 ===== TP SIGNUP PROCESS ENDED =====\n');
      }
    };

    // Graph API recovery function
    const handleGraphAPIRecovery = async (accessToken: string) => {
      addLog('🔧 Starting Graph API recovery...', 'info');

      try {
        const graphUrl = `https://graph.facebook.com/v19.0/me/businesses?fields=whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number}}&access_token=${accessToken}`;
        addLog(`🌐 Calling Graph API: ${graphUrl.replace(accessToken, '[REDACTED]')}`);

        const wabaResponse = await fetch(graphUrl);

        if (wabaResponse.ok) {
          const wabaData = await wabaResponse.json();
          addLog(`📱 Graph API response: ${JSON.stringify(wabaData, null, 2)}`);

          const businesses = wabaData.data || [];
          let foundCredentials = null;

          for (const business of businesses) {
            const wabas = business.whatsapp_business_accounts?.data || [];
            for (const waba of wabas) {
              const phoneNumbers = waba.phone_numbers?.data || [];
              for (const phoneNumber of phoneNumbers) {
                foundCredentials = {
                  wabaId: waba.id,
                  phoneNumberId: phoneNumber.id,
                  businessName: waba.name,
                  phoneNumber: phoneNumber.display_phone_number,
                  userId: user?.id
                };

                addLog('✅ Found WABA credentials via Graph API:', 'success');
                addLog(`   - WABA ID: ${waba.id}`);
                addLog(`   - Phone Number ID: ${phoneNumber.id}`);
                addLog(`   - Business Name: ${waba.name}`);

                // Call TP signup with recovered credentials
                callTPSignup(foundCredentials);
                return;
              }
            }
          }

          if (!foundCredentials) {
            addLog('❌ No WABA credentials found in Graph API response', 'error');
          }
        } else {
          addLog(`❌ Graph API call failed: ${wabaResponse.status}`, 'error');
        }
      } catch (graphError) {
        addLog(`❌ Error in Graph API recovery: ${graphError}`, 'error');
      }
    };

    // Add message listener
    addLog('👂 Adding comprehensive message event listener...');
    window.addEventListener('message', handleMessage);

    // Check Facebook SDK
    const checkFB = () => {
      addLog('🔍 Checking for Facebook SDK...');
      if (window.FB && window.FB.login) {
        addLog('✅ Facebook SDK is ready', 'success');
        addLog(`📱 App ID: ${window.FB.getAppId?.() || 'Not available'}`);
        setSdkReady(true);
      } else {
        addLog('⏳ Facebook SDK not ready yet, checking again...');
        setTimeout(checkFB, 100);
      }
    };
    checkFB();

    return () => {
      addLog('🧹 Cleaning up message event listener');
      window.removeEventListener('message', handleMessage);
    };
  }, [user?.id]);

  // Launch WhatsApp Signup
  const launchWhatsAppSignup = () => {
    addLog('\n🚀 ===== LAUNCHING WHATSAPP SIGNUP =====', 'info');

    if (!sdkReady) {
      addLog('❌ Facebook SDK not ready', 'error');
      alert('Facebook SDK not ready. Please wait and try again.');
      return;
    }

    if (!user?.id) {
      addLog('❌ No user ID available', 'error');
      alert('Please log in to connect your WhatsApp account.');
      return;
    }

    setIsConnecting(true);

    const configId = process.env.NEXT_PUBLIC_CONFIG_ID;
    const solutionId = process.env.NEXT_PUBLIC_SOLUTION_ID;

    addLog('🔧 Facebook Configuration:');
    addLog(`   - Config ID: ${configId}`);
    addLog(`   - Solution ID: ${solutionId}`);
    addLog(`   - User ID: ${user.id}`);

    // Dispatch startup event
    addLog('📢 Dispatching wabaSignupStarted event...');
    window.dispatchEvent(new CustomEvent('wabaSignupStarted'));

    addLog('🚀 Calling FB.login with embedded signup...');

    try {
      window.FB.login(
        (response: any) => {
          addLog(`📋 Facebook login response: ${JSON.stringify(response, null, 2)}`);

          if (response.authResponse) {
            addLog('✅ Facebook authentication successful', 'success');
            addLog(`   - User ID: ${response.authResponse.userID}`);
            addLog(`   - Access Token length: ${response.authResponse.accessToken?.length || 0}`);
            addLog(`   - Status: ${response.status}`);

            addLog('⏳ Waiting for WhatsApp embedded signup completion...');

            // Try immediate Graph API recovery as backup
            setTimeout(() => {
              if (response.authResponse.accessToken) {
                addLog('🔄 Attempting immediate Graph API recovery as backup...');
                handleGraphAPIRecovery(response.authResponse.accessToken);
              }
            }, 3000);

            // Set timeout for incomplete signups
            setTimeout(() => {
              if (isConnecting) {
                addLog('⚠️ No completion message received within 60 seconds', 'warning');
                setIsConnecting(false);
                alert('⚠️ Setup may be incomplete. Try the "Recover Credentials" button below.');
              }
            }, 60000);

          } else {
            addLog(`❌ Facebook authentication failed: ${JSON.stringify(response)}`, 'error');
            setIsConnecting(false);

            let errorMessage = 'Authentication failed';
            if (response.error) {
              errorMessage = response.error.error_description || response.error.message || response.error;
            }

            alert(`❌ ${errorMessage}\n\nPlease try again.`);
          }
        },
        {
          config_id: configId,
          response_type: 'code',
          override_default_response_type: true,
          scope: 'business_management,whatsapp_business_management',
          extras: {
            setup: {
              solutionID: solutionId,
              userId: user.id,
              timestamp: Date.now()
            },
          }
        }
      );
    } catch (fbError) {
      addLog(`❌ Error calling FB.login: ${fbError}`, 'error');
      setIsConnecting(false);
      alert(`❌ Error starting signup: ${fbError}\n\nPlease refresh and try again.`);
    }

    addLog('🏁 ===== SIGNUP LAUNCH COMPLETED =====\n');
  };

  // Recovery function for already onboarded accounts
  const recoverCredentials = async () => {
    addLog('\n🔧 ===== STARTING CREDENTIAL RECOVERY =====', 'info');

    if (!user?.id) {
      alert('Please log in to recover credentials.');
      return;
    }

    setIsRecovering(true);

    try {
      // Method 1: Try to get fresh Facebook access token
      if (window.FB && window.FB.getAccessToken) {
        const accessToken = window.FB.getAccessToken();
        addLog(`🔑 Existing access token: ${accessToken ? 'Available' : 'Not available'}`);

        if (accessToken) {
          addLog('🔄 Using existing access token for recovery...');
          await attemptRecoveryWithToken(accessToken);
          return;
        }
      }

      // Method 2: Get fresh access token via FB.login
      addLog('🔑 Getting fresh access token...');

      window.FB.login(
        async (response: any) => {
          addLog(`📋 Fresh login response: ${JSON.stringify(response, null, 2)}`);

          if (response.authResponse && response.authResponse.accessToken) {
            addLog('✅ Fresh access token obtained', 'success');
            await attemptRecoveryWithToken(response.authResponse.accessToken);
          } else {
            addLog('❌ Failed to get fresh access token', 'error');
            setIsRecovering(false);
            alert('❌ Could not authenticate with Facebook for recovery.');
          }
        },
        {
          scope: 'business_management,whatsapp_business_management'
        }
      );

    } catch (error) {
      addLog(`❌ Error in credential recovery: ${error}`, 'error');
      setIsRecovering(false);
      alert(`❌ Recovery failed: ${error}`);
    }
  };

  const attemptRecoveryWithToken = async (accessToken: string) => {
    try {
      addLog('🌐 Calling recovery API...');

      const response = await fetch('/api/waba/recover-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          accessToken,
          source: 'manual_recovery'
        })
      });

      const result = await response.json();
      addLog(`📥 Recovery API response: ${JSON.stringify(result, null, 2)}`);

      setIsRecovering(false);

      if (result.success) {
        addLog(`✅ Successfully recovered ${result.credentials?.length || 0} credential(s)`, 'success');

        // Also try TP signup for each recovered credential
        if (result.credentials && result.credentials.length > 0) {
          for (const cred of result.credentials) {
            addLog(`🚀 Attempting TP signup for recovered credential: ${cred.wabaId}`);
            await callTPSignup({
              ...cred,
              userId: user?.id,
              source: 'credential_recovery'
            });
          }
        }

        // Dispatch events
        window.dispatchEvent(new CustomEvent('wabaSignupCompleted', {
          detail: { recovered: true, credentials: result.credentials }
        }));

        window.dispatchEvent(new CustomEvent('wabaConnected'));

        alert(`✅ Successfully recovered ${result.credentials?.length || 0} WhatsApp Business Account(s)!`);

      } else {
        addLog(`❌ Recovery failed: ${result.message}`, 'error');
        alert(`❌ Recovery failed: ${result.message || 'Unknown error'}\n\n${result.suggestion || 'Please contact support.'}`);
      }

    } catch (error) {
      addLog(`❌ Recovery API error: ${error}`, 'error');
      setIsRecovering(false);
      alert(`❌ Recovery API failed: ${error}`);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:from-muted/40 wark:to-green-900/10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
          <Plus className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900 wark:text-white">Quick Connect</h3>
          <p className="text-sm text-slate-600 wark:text-slate-300">
            Connect your WhatsApp Business Account in under 2 minutes
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-600 wark:text-slate-300">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-100 wark:bg-green-900/30">
            <Zap className="h-3 w-3 text-green-600 wark:text-green-400" />
          </div>
          <span>Instant setup</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 wark:text-slate-300">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 wark:bg-blue-900/30">
            <Shield className="h-3 w-3 text-blue-600 wark:text-blue-400" />
          </div>
          <span>Secure OAuth</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 wark:text-slate-300">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 wark:bg-purple-900/30">
            <Building2 className="h-3 w-3 text-purple-600 wark:text-purple-400" />
          </div>
          <span>Business verified</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 wark:text-slate-300">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 wark:bg-amber-900/30">
            <Phone className="h-3 w-3 text-amber-600 wark:text-amber-400" />
          </div>
          <span>Multi-number support</span>
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-xs text-slate-500 wark:text-slate-400 mb-6 p-3 rounded-lg bg-slate-50 wark:bg-slate-800/50">
        <div className={`h-2 w-2 rounded-full ${sdkReady ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
        <span>
          {sdkReady
            ? `Ready to connect • User: ${user?.email || 'Not logged in'}`
            : 'Loading Facebook SDK...'
          }
        </span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Primary Connect Button */}
        <Button
          disabled={!sdkReady || !user?.id || isConnecting}
          onClick={launchWhatsAppSignup}
          className="w-full gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          {isConnecting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Connect WhatsApp Account</span>
            </>
          )}
        </Button>

        {/* Recovery Button for Already Onboarded Accounts */}
        <Button
          disabled={!sdkReady || !user?.id || isRecovering}
          onClick={recoverCredentials}
          variant="outline"
          className="w-full gap-2 bg-white wark:bg-slate-800 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 wark:hover:bg-blue-900/20 transition-all duration-200"
          size="sm"
        >
          {isRecovering ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <span>Recovering...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Recover Already Connected Account</span>
            </>
          )}
        </Button>

        {/* Help text for recovery */}
        <div className="text-xs text-center text-slate-600 wark:text-slate-400 mt-2 p-2 bg-blue-50 wark:bg-blue-900/20 rounded-lg border border-blue-200 wark:border-blue-700">
          <AlertTriangle className="h-3 w-3 inline mr-1" />
          If you already connected your WhatsApp but don't see it here, use "Recover" button above
        </div>
      </div>

      {/* Benefits Footer */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-600 wark:text-slate-400 mt-4 pt-4 border-t border-slate-200 wark:border-slate-700">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>No setup fees</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-blue-500" />
          <span>Instant activation</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-purple-500" />
          <span>24/7 support</span>
        </div>
      </div>

     {/* Debug Logs (only in development) */}
      {process.env.NODE_ENV === 'development' && debugLogs.length > 0 && (
        <details className="mt-4 text-xs">
          <summary className="cursor-pointer text-slate-500 hover:text-slate-700">
            Debug Logs ({debugLogs.length})
          </summary>
          <div className="mt-2 max-h-40 overflow-y-auto bg-slate-100 wark:bg-slate-800 p-2 rounded font-mono text-xs">
            {debugLogs.map((log, i) => (
              <div key={i} className="mb-1 text-slate-700 wark:text-slate-300">
                {log}
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Decorative element */}
      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
    </div>
  );
}
