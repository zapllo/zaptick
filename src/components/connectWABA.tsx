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
    // Proper message listener for WhatsApp embedded signup
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Facebook
      if (event.origin !== "https://www.facebook.com" &&
          event.origin !== "https://web.facebook.com") {
        return;
      }

      console.log('📨 Raw message received:', event.data);

      let data = event.data;

      // Handle different message formats
      try {
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
      } catch (e) {
        // If it's not JSON, ignore it
        return;
      }

      console.log('📋 Parsed message data:', data);

      // Check for WhatsApp embedded signup events
      if (data.type === 'WA_EMBEDDED_SIGNUP') {
        console.log('🎯 WhatsApp Embedded Signup Event!', data);

        if (data.event === 'FINISH') {
          console.log('✅ WhatsApp signup finished!');

          const wabaData = data.data;
          console.log('📦 WABA Data received:', wabaData);

          const { waba_id, phone_number_id, business_name } = wabaData;

          if (waba_id && phone_number_id) {
            console.log('🚀 Calling TP signup with WABA data...');

            // Call TP signup immediately
            callTPSignup({
              wabaId: waba_id,
              phoneNumberId: phone_number_id,
              businessName: business_name || 'New Business',
              userId: user?.id
            });

            setIsConnecting(false);
          } else {
            console.error('❌ Missing WABA data:', wabaData);
            setIsConnecting(false);
            alert('Incomplete signup data received. Please try again.');
          }
        } else if (data.event === 'CANCEL') {
          console.log('⚠️ User cancelled signup');
          setIsConnecting(false);
        } else if (data.event === 'ERROR') {
          console.error('❌ Signup error:', data.data);
          setIsConnecting(false);
          alert(`Signup failed: ${data.data?.error_message || 'Unknown error'}`);
        }
      }
    };

    const callTPSignup = async (wabaData: any) => {
      try {
        console.log('🔄 Calling Interakt TP signup:', wabaData);

        const response = await fetch('/api/interakt/tp-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wabaData),
        });

        if (response.ok) {
          console.log('✅ TP signup successful');
          alert('WhatsApp Business Account connected successfully!');
          window.dispatchEvent(new CustomEvent('wabaSignupCompleted'));
        } else {
          const error = await response.json();
          console.error('❌ TP signup failed:', error);
          alert(`Setup failed: ${error.error || 'Please contact support'}`);
        }
      } catch (error) {
        console.error('❌ TP signup error:', error);
        alert('Setup failed. Please contact support.');
      }
    };

    // Add the message listener
    window.addEventListener('message', handleMessage);

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

  const launchWhatsAppSignup = () => {
    if (!sdkReady || !user?.id) return;

    setIsConnecting(true);

    const configId = process.env.NEXT_PUBLIC_CONFIG_ID;
    const solutionId = process.env.NEXT_PUBLIC_SOLUTION_ID;

    console.log('🚀 Launching WhatsApp embedded signup...');
    console.log('🔧 Config:', { configId, solutionId, userId: user.id });

    // Launch the embedded signup
    window.FB.login(
      (response: any) => {
        console.log('📋 Facebook response:', response);

        if (response.authResponse && response.status === 'connected') {
          console.log('✅ Facebook auth successful');
          console.log('⏳ Waiting for WA_EMBEDDED_SIGNUP message event...');

          // Set timeout in case message never comes
          setTimeout(() => {
            if (isConnecting) {
              console.warn('⚠️ No completion message received within 30 seconds');
              setIsConnecting(false);
              alert('Setup appears incomplete. Please contact support if your WhatsApp account is not connected.');
            }
          }, 30000);

        } else {
          console.log('❌ Facebook auth failed:', response);
          setIsConnecting(false);
          if (response.error) {
            alert(`Authentication failed: ${response.error.error_description || response.error}`);
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
