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
    // Message listener for WhatsApp Embedded Signup events
    const handleMessage = async (event: MessageEvent) => {
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
        if (typeof event.data === 'string') {
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
            console.log('✅ Signup finished via message event!');

            const data = messageData.data || {};
            const wabaId = data.waba_id;
            const phoneNumberId = data.phone_number_id;
            const businessName = data.business_name || data.display_name || 'New Business';
            const phoneNumber = data.phone_number || data.display_phone_number || '';

            console.log('🏢 WABA info from message:', {
              wabaId, phoneNumberId, businessName, phoneNumber
            });

            if (wabaId && phoneNumberId) {
              await callTPSignupAPI({
                wabaId,
                phoneNumberId,
                businessName,
                phoneNumber,
                userId: user?.id
              });

              if (user?.id) {
                localStorage.setItem(`waba_recent_signup_${user.id}`, Date.now().toString());
              }

              window.dispatchEvent(new CustomEvent('wabaSignupCompleted', {
                detail: { wabaId, phoneNumberId, businessName }
              }));

              setIsConnecting(false);
              console.log('⏳ TP Signup called via message event');
              return; // Important: exit here so we don't use code exchange
            }
          } else if (messageData.event === 'CANCEL') {
            console.warn('⚠️ User cancelled WhatsApp signup');
            setIsConnecting(false);
            clearPendingState();
          } else if (messageData.event === 'ERROR') {
            console.error('❌ WhatsApp signup error:', messageData.data);
            setIsConnecting(false);
            clearPendingState();
          }
        }
      } catch (error) {
        // Most messages won't be JSON, ignore parsing errors
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

    // Facebook SDK initialization check
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

  const exchangeCodeForWABA = async (authCode: string) => {
    try {
      console.log('🔄 Attempting code exchange for WABA data...');

      const response = await fetch('/api/facebook/exchange-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: authCode,
          userId: user?.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Code exchange successful:', result);

        if (result.waba) {
          console.log('🚀 Calling TP Signup with exchanged WABA data...');

          await callTPSignupAPI(result.waba);

          if (user?.id) {
            localStorage.setItem(`waba_recent_signup_${user.id}`, Date.now().toString());
          }

          window.dispatchEvent(new CustomEvent('wabaSignupCompleted', {
            detail: result.waba
          }));

          setIsConnecting(false);
          return true;
        }
      } else {
        const error = await response.json();
        console.error('❌ Code exchange failed:', error);
        throw new Error(error.details || 'Code exchange failed');
      }
    } catch (error) {
      console.error('❌ Error during code exchange:', error);
      return false;
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

    // Launch Facebook login with WhatsApp embedded signup
    window.FB.login(
      async (response: any) => {
        console.log('=== Facebook Login Response ===');
        console.log('Status:', response.status);
        console.log('Auth Response:', response.authResponse);

        if (response.authResponse && response.status === 'connected') {
          console.log('✅ Facebook authentication successful');
          console.log('🔑 Auth Code:', response.authResponse.code);

          // Wait a bit for potential message events, then use code exchange as fallback
          console.log('⏳ Waiting 3 seconds for WA_EMBEDDED_SIGNUP message event...');

          setTimeout(async () => {
            if (isConnecting) { // Still connecting means no message event was received
              console.log('🔄 No message event received, using code exchange fallback...');

              const success = await exchangeCodeForWABA(response.authResponse.code);

              if (!success) {
                console.error('❌ Both message event and code exchange failed');
                setIsConnecting(false);
                alert('Failed to get WhatsApp Business Account data. Please try again or contact support.');
              }
            }
          }, 3000);

        } else {
          console.log('❌ Facebook authentication failed');
          console.log('Status:', response.status);
          console.log('Error:', response.error);

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
