"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Phone, Plus } from "lucide-react";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export default function ConnectWabaButton() {
  const [sdkReady, setSdkReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Comprehensive message listener for WhatsApp Embedded Signup
    const handleMessage = async (event: MessageEvent) => {
      // Log all messages for debugging
      console.log('📨 Message received:', {
        origin: event.origin,
        data: event.data,
        dataType: typeof event.data,
        timestamp: new Date().toISOString()
      });

      // Accept messages from Facebook/Meta domains
      const allowedOrigins = [
        "https://www.facebook.com",
        "https://web.facebook.com",
        "https://business.facebook.com",
        "https://developers.facebook.com"
      ];

      if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) {
        return;
      }

      let messageData;

      try {
        // Handle different data formats
        if (typeof event.data === 'string') {
          // Try parsing JSON string
          messageData = JSON.parse(event.data);
        } else if (typeof event.data === 'object' && event.data !== null) {
          messageData = event.data;
        } else {
          return;
        }

        console.log('📋 Parsed message:', JSON.stringify(messageData, null, 2));

        // Check for WhatsApp Embedded Signup completion
        if (messageData.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('🎯 WhatsApp Embedded Signup Event:', messageData);

          if (messageData.event === 'FINISH') {
            console.log('✅ Signup finished successfully!');

            const data = messageData.data || {};
            console.log('📦 Event data:', data);

            // Extract WABA information from the event
            const wabaId = data.waba_id;
            const phoneNumberId = data.phone_number_id;
            const businessName = data.business_name || data.display_name || 'New Business';
            const phoneNumber = data.phone_number || data.display_phone_number || '';

            console.log('🏢 Extracted WABA info:', {
              wabaId,
              phoneNumberId,
              businessName,
              phoneNumber
            });

            if (wabaId && phoneNumberId) {
              console.log('🚀 Calling TP Signup API...');

              await callTPSignupAPI({
                wabaId,
                phoneNumberId,
                businessName,
                phoneNumber,
                userId: user?.id
              });

              // Mark signup as completed
              if (user?.id) {
                localStorage.setItem(`waba_recent_signup_${user.id}`, Date.now().toString());
              }

              // Notify dashboard
              window.dispatchEvent(new CustomEvent('wabaSignupCompleted', {
                detail: { wabaId, phoneNumberId, businessName }
              }));

              setIsConnecting(false);
              console.log('⏳ TP Signup called, waiting for WABA_ONBOARDED webhook...');
            } else {
              console.error('❌ Missing WABA ID or Phone Number ID:', { wabaId, phoneNumberId });
              setIsConnecting(false);
              alert('Setup incomplete: Missing WABA information. Please try again.');
            }

          } else if (messageData.event === 'CANCEL') {
            console.warn('⚠️ User cancelled WhatsApp signup');
            setIsConnecting(false);
            clearPendingState();

          } else if (messageData.event === 'ERROR') {
            console.error('❌ WhatsApp signup error:', messageData.data);
            setIsConnecting(false);
            clearPendingState();
            alert(`Setup failed: ${messageData.data?.error_message || 'Unknown error'}`);

          } else {
            console.log('ℹ️ Other WhatsApp event:', messageData.event, messageData.data);
          }
        }
        // Check for other events that might contain WABA data
        else if (messageData.type === 'platform/plugins/login_status') {
          console.log('🔐 Facebook login status:', messageData);
        }
        // Log any message containing WABA-related data
        else {
          const messageStr = JSON.stringify(messageData);
          if (messageStr.includes('waba_id') || messageStr.includes('phone_number_id')) {
            console.log('🔍 Message contains WABA data:', messageData);
          }
        }

      } catch (error) {
        // Most messages won't be JSON, so this is normal
        if (typeof event.data === 'string' && event.data.includes('waba')) {
          console.log('🔍 Non-JSON message contains "waba":', event.data);
        }
      }
    };

    const clearPendingState = () => {
      if (user?.id) {
        localStorage.removeItem(`waba_pending_${user.id}`);
        localStorage.removeItem(`waba_pending_timestamp_${user.id}`);
        localStorage.removeItem(`waba_recent_signup_${user.id}`);
      }
    };

    const callTPSignupAPI = async (wabaData: {
      wabaId: string;
      phoneNumberId: string;
      businessName: string;
      phoneNumber?: string;
      userId?: string;
    }) => {
      try {
        console.log('🔄 Calling Interakt TP Signup API:', wabaData);

        const response = await fetch('/api/interakt/tp-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wabaData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ TP Signup API success:', result);
        } else {
          const error = await response.json();
          console.error('❌ TP Signup API failed:', error);
          alert(`Failed to setup WhatsApp integration: ${error.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('❌ Error calling TP Signup API:', error);
        alert('Failed to setup WhatsApp integration. Please contact support.');
      }
    };

    // Add message listener
    window.addEventListener('message', handleMessage, false);

    // Enhanced Facebook SDK initialization check
    const checkFB = () => {
      if (window.FB && window.FB.login) {
        console.log('✅ Facebook SDK ready');
        setSdkReady(true);
      } else {
        setTimeout(checkFB, 100);
      }
    };

    checkFB();

    return () => {
      window.removeEventListener('message', handleMessage, false);
    };
  }, [user?.id]);

  const launchWhatsAppSignup = () => {
    if (!sdkReady || !user?.id) {
      console.error('❌ SDK not ready or user not found');
      return;
    }

    setIsConnecting(true);

    // Clear any previous state
    if (user?.id) {
      localStorage.removeItem(`waba_pending_${user.id}`);
      localStorage.removeItem(`waba_pending_timestamp_${user.id}`);
      localStorage.removeItem(`waba_recent_signup_${user.id}`);
    }

    // Notify dashboard that signup started
    window.dispatchEvent(new CustomEvent('wabaSignupStarted'));

    const configId = process.env.NEXT_PUBLIC_CONFIG_ID;
    const solutionId = process.env.NEXT_PUBLIC_SOLUTION_ID;

    console.log('🚀 Launching WhatsApp Embedded Signup...');
    console.log('🔧 Config:', {
      configId,
      solutionId,
      userId: user.id,
      appId: process.env.NEXT_PUBLIC_META_APP_ID
    });

    if (!configId) {
      console.error('❌ Missing NEXT_PUBLIC_CONFIG_ID');
      setIsConnecting(false);
      alert('Configuration error: Missing CONFIG_ID. Please contact support.');
      return;
    }

    // Set a timeout for the signup process
    const signupTimeout = setTimeout(() => {
      if (isConnecting) {
        console.warn('⏰ Signup timeout - no completion event received');
        setIsConnecting(false);
        alert('Signup process timed out. Please try again.');
      }
    }, 120000); // 2 minute timeout

    // Launch Facebook login with WhatsApp embedded signup
    window.FB.login(
      (response: any) => {
        console.log('=== Facebook Login Response ===');
        console.log('Status:', response.status);
        console.log('Auth Response:', response.authResponse);
        console.log('Full Response:', JSON.stringify(response, null, 2));

        if (response.authResponse && response.status === 'connected') {
          console.log('✅ Facebook authentication successful');
          console.log('🔑 Auth Code:', response.authResponse.code);
          console.log('⏳ Waiting for WA_EMBEDDED_SIGNUP completion event...');

          // Keep the timeout running, will be cleared when we get the FINISH event

        } else {
          console.log('❌ Facebook authentication failed');
          console.log('Status:', response.status);
          console.log('Error:', response.error);

          clearTimeout(signupTimeout);
          setIsConnecting(false);

          if (response.status === 'not_authorized') {
            alert('Please authorize the application to continue.');
          } else if (response.status === 'unknown') {
            alert('Authentication failed. Please try again.');
          }
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
          },
        }
      }
    );
  };

  return (
    <Card className="flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-dashed border-2 h-full">
      <CardHeader className="text-center">
        <CardDescription>
          Connect a new WhatsApp Business Account
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Phone className="h-8 w-8 text-primary" />
        </div>
        <p className="text-center text-sm text-muted-foreground px-4">
          Connect your WhatsApp Business account to start sending messages
        </p>
      </CardContent>
      <CardFooter>
        <Button
          disabled={!sdkReady || !user?.id || isConnecting}
          onClick={launchWhatsAppSignup}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect WABA"}
        </Button>
      </CardFooter>
    </Card>
  );
}
