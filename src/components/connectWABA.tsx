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
    // This is the OFFICIAL way Facebook sends WABA data after embedded signup
    const handleMessage = (event: MessageEvent) => {
      // Facebook sends messages from these origins
      if (event.origin !== "https://www.facebook.com" &&
          event.origin !== "https://web.facebook.com") {
        return;
      }

      console.log('📨 Message from Facebook:', event.data);

      try {
        let data = event.data;

        // Parse if it's a string
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }

        // This is the key event Facebook sends after WhatsApp signup completion
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('🎯 WhatsApp Embedded Signup Event:', data);

          if (data.event === 'FINISH') {
            console.log('✅ WhatsApp signup completed!');
            console.log('📦 WABA Data:', data.data);

            const { waba_id, phone_number_id, business_name } = data.data;

            if (waba_id && phone_number_id) {
              console.log('🚀 Got WABA data, calling TP signup...');

              // Call your TP signup API
              callTPSignupAPI({
                wabaId: waba_id,
                phoneNumberId: phone_number_id,
                businessName: business_name || 'New Business',
                userId: user?.id
              });

              setIsConnecting(false);
            } else {
              console.error('❌ Missing WABA data in response');
              setIsConnecting(false);
            }
          }

          if (data.event === 'CANCEL') {
            console.log('⚠️ User cancelled signup');
            setIsConnecting(false);
          }

          if (data.event === 'ERROR') {
            console.error('❌ Signup error:', data.data);
            setIsConnecting(false);
          }
        }
      } catch (e) {
        // Ignore non-JSON messages (normal for Facebook)
      }
    };

    // Add the message listener
    window.addEventListener('message', handleMessage);

    // Check if Facebook SDK is ready
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
      window.removeEventListener('message', handleMessage);
    };
  }, [user?.id]);

  const callTPSignupAPI = async (wabaData: any) => {
    try {
      console.log('🔄 Calling TP Signup API with:', wabaData);

      const response = await fetch('/api/interakt/tp-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wabaData),
      });

      if (response.ok) {
        console.log('✅ TP Signup successful');
        window.dispatchEvent(new CustomEvent('wabaSignupCompleted'));
      } else {
        const error = await response.json();
        console.error('❌ TP Signup failed:', error);
      }
    } catch (error) {
      console.error('❌ TP Signup error:', error);
    }
  };

  const launchWhatsAppSignup = () => {
    if (!sdkReady || !user?.id) return;

    setIsConnecting(true);

    const configId = process.env.NEXT_PUBLIC_CONFIG_ID;
    const solutionId = process.env.NEXT_PUBLIC_SOLUTION_ID;

    console.log('🚀 Launching WhatsApp embedded signup...');
    console.log('Config ID:', configId);
    console.log('Solution ID:', solutionId);

    // This is the standard Facebook embedded signup flow
    window.FB.login(
      (response: any) => {
        console.log('Facebook login response:', response);

        if (response.authResponse && response.status === 'connected') {
          console.log('✅ Facebook auth successful');
          console.log('⏳ Waiting for WhatsApp signup completion message...');
          // The message listener above will handle the WABA data
        } else {
          console.log('❌ Facebook auth failed');
          setIsConnecting(false);
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
