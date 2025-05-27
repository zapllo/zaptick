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
  // Enhanced message listener to capture WABA data
  const handleMessage = async (event: MessageEvent) => {
    console.log('📨 Received message event:', {
      origin: event.origin,
      data: event.data,
      type: typeof event.data
    });

    if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") {
      console.log('❌ Message from unexpected origin:', event.origin);
      return;
    }

    try {
      let data;

      // Handle both string and object data
      if (typeof event.data === 'string') {
        data = JSON.parse(event.data);
      } else {
        data = event.data;
      }

      console.log('📋 Parsed message data:', data);

      if (data.type === 'WA_EMBEDDED_SIGNUP') {
        console.log('🎯 WhatsApp embedded signup event:', data);

        if (data.event === 'FINISH') {
          const { phone_number_id, waba_id, business_name } = data.data || {};
          console.log("✅ WhatsApp embedded signup completed:", {
            phone_number_id,
            waba_id,
            business_name,
            fullData: data.data
          });

          if (!waba_id || !phone_number_id) {
            console.error('❌ Missing WABA data in FINISH event:', data.data);
            setIsConnecting(false);
            return;
          }

          // Now we have the WABA data - call TP signup API
          await callTPSignupAPI({
            wabaId: waba_id,
            phoneNumberId: phone_number_id,
            businessName: business_name || 'New Business',
            userId: user?.id
          });

          // Mark that embedded signup completed
          if (user?.id) {
            localStorage.setItem(`waba_recent_signup_${user.id}`, Date.now().toString());
          }

          // Dispatch event to dashboard
          window.dispatchEvent(new CustomEvent('wabaSignupCompleted'));

          setIsConnecting(false);
          console.log("⏳ Called TP signup API, waiting for WABA_ONBOARDED webhook...");

        } else if (data.event === 'CANCEL') {
          console.warn("⚠️ User cancelled signup");
          setIsConnecting(false);
          clearPendingState();
        } else if (data.event === 'ERROR') {
          console.error("❌ Signup error:", data.data?.error_message || data.data);
          setIsConnecting(false);
          clearPendingState();
        } else {
          console.log('ℹ️ Other WA_EMBEDDED_SIGNUP event:', data.event, data.data);
        }
      } else {
        console.log('ℹ️ Non-WhatsApp message type:', data.type || 'unknown');
      }
    } catch (error) {
      // Log parsing errors for debugging, but don't throw
      console.log('⚠️ Could not parse message data (this is often normal):', error);
      console.log('Raw message data:', event.data);
    }
  };


    const callTPSignupAPI = async (wabaData: {
      wabaId: string;
      phoneNumberId: string;
      businessName: string;
      userId?: string;
    }) => {
      try {
        console.log('🔄 Calling Interakt TP Signup API with WABA data:', wabaData);

        const response = await fetch('/api/interakt/tp-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wabaData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ TP Signup API called successfully:', result);
        } else {
          const error = await response.json();
          console.error('❌ TP Signup API call failed:', error);
        }
      } catch (error) {
        console.error('❌ Error calling TP Signup API:', error);
      }
    };

    window.addEventListener('message', handleMessage);

    // Wait for Facebook SDK to be ready
    const checkFB = () => {
      if (window.FB) {
        console.log('✅ Facebook SDK loaded');
        setSdkReady(true);
      } else {
        setTimeout(checkFB, 100);
      }
    };
    checkFB();

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [user?.id]);

   const clearPendingState = () => {
      if (user?.id) {
        localStorage.removeItem(`waba_pending_${user.id}`);
        localStorage.removeItem(`waba_pending_timestamp_${user.id}`);
        localStorage.removeItem(`waba_recent_signup_${user.id}`);
      }
    };

// ... existing code ...

const launchWhatsAppSignup = () => {
  if (!sdkReady || !user?.id) return;

  setIsConnecting(true);

  // Notify dashboard that signup started
  window.dispatchEvent(new CustomEvent('wabaSignupStarted'));

  // Debug environment variables
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const configId = process.env.NEXT_PUBLIC_CONFIG_ID;
  const solutionId = process.env.NEXT_PUBLIC_SOLUTION_ID;

  console.log('🚀 Launching WhatsApp embedded signup...');
  console.log('Environment:', { appId, configId, solutionId, userId: user.id });

  if (!configId) {
    console.error('❌ Missing NEXT_PUBLIC_CONFIG_ID');
    setIsConnecting(false);
    return;
  }

  // Launch embedded signup
  window.FB.login(
    (response: any) => {
      console.log('=== FB LOGIN CALLBACK ===');
      console.log('Full response:', JSON.stringify(response, null, 2));
      console.log('Response type:', typeof response);
      console.log('Auth response present:', !!response.authResponse);
      console.log('Status:', response.status);

      if (response.authResponse && response.status === 'connected') {
        console.log('✅ Facebook authentication successful');
        console.log('Authorization code:', response.authResponse.code);
        console.log('User ID (may be null):', response.authResponse.userID);
        console.log('⏳ Waiting for WA_EMBEDDED_SIGNUP message event with WABA data...');
        console.log('🔍 Make sure to check the browser console for message events');

        // Don't set isConnecting to false here
        // Wait for the WA_EMBEDDED_SIGNUP message event
      } else {
        console.log('❌ Facebook authentication failed or cancelled');
        console.log('Response status:', response.status);
        console.log('Error:', response.error);
        setIsConnecting(false);
        clearPendingState();
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

// ... existing code ...

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
