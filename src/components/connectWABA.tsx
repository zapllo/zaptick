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
    // Set up the message listener for embedded signup completion
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") {
        return;
      }

      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.event === 'FINISH') {
            const { phone_number_id, waba_id } = data.data;
            console.log("WABA connected successfully:", { phone_number_id, waba_id });
            setIsConnecting(false);

            // Optionally refresh to show new WABA
            setTimeout(() => {
              window.location.reload();
            }, 2000);

          } else if (data.event === 'CANCEL') {
            console.warn("User cancelled signup");
            setIsConnecting(false);
          } else if (data.event === 'ERROR') {
            console.error("Signup error:", data.data.error_message);
            setIsConnecting(false);
          }
        }
      } catch (error) {
        console.log('Non JSON Responses', event.data);
      }
    };

    window.addEventListener('message', handleMessage);

    // Wait for Facebook SDK to be ready
    const checkFB = () => {
      if (window.FB) {
        setSdkReady(true);
      } else {
        setTimeout(checkFB, 100);
      }
    };
    checkFB();

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const launchWhatsAppSignup = () => {
    if (!sdkReady || !user?.id) return;

    setIsConnecting(true);

    window.FB.login(
      async (response: any) => {
        console.log('=== FB LOGIN CALLBACK ===');
        console.log('Full response:', response);

        if (response.authResponse && response.status === 'connected') {
          console.log('✅ Facebook embedded signup completed');

          // Now we need to call Interakt's TP Signup API
          await callInteraktTPSignup(response);
        } else {
          console.log('❌ Facebook embedded signup failed');
          setIsConnecting(false);
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        scope: 'business_management,whatsapp_business_management',
        extras: {
          setup: {
            solutionID: process.env.NEXT_PUBLIC_SOLUTION_ID,
            userId: user.id,
          },
        }
      }
    );
  };

  const callInteraktTPSignup = async (facebookResponse: any) => {
    try {
      console.log('🔄 Calling Interakt TP Signup API...');

      // Call your backend to handle the TP signup
      const response = await fetch('/api/interakt/tp-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facebookResponse,
          userId: user?.id,
        }),
      });

      if (response.ok) {
        console.log('✅ TP Signup API called successfully');
        console.log('⏳ Waiting for WABA_ONBOARDED webhook...');
      } else {
        console.error('❌ TP Signup API call failed');
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('❌ Error calling TP Signup API:', error);
      setIsConnecting(false);
    }
  };
  return (
    <Card className="flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-dashed border-2 h-full">
      <CardHeader className="text-center">
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
