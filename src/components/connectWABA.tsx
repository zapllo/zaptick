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
            console.log("Phone number ID", phone_number_id, "WhatsApp business account ID", waba_id);
            setIsConnecting(false);
            // TODO: Send this data to your backend along with user ID
          } else if (data.event === 'CANCEL') {
            const { current_step } = data.data;
            console.warn("Cancel at", current_step);
            setIsConnecting(false);
          } else if (data.event === 'ERROR') {
            const { error_message } = data.data;
            console.error("error", error_message);
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

  const fbLoginCallback = (response: any) => {
    console.log('FB Login Response:', response);
    if (response.authResponse) {
      const code = response.authResponse.code;
      console.log('Authorization code:', code);
      // The returned code must be transmitted to your backend first and then
      // perform a server-to-server call from there to our servers for an access token.
      // TODO: Send code and user ID to your backend
    }
    setIsConnecting(false);
  };

  const launchWhatsAppSignup = () => {
    if (!sdkReady || !user?.id) return;

    setIsConnecting(true);

    // Launch Facebook login - exactly as per documentation
    window.FB.login(fbLoginCallback, {
      config_id: process.env.NEXT_PUBLIC_CONFIG_ID, // Your configuration ID
      response_type: 'code', // must be set to 'code' for System User access token
      override_default_response_type: true, // when true, any response types passed in the "response_type" will take precedence over the default types
      extras: {
        setup: {
          userId: user.id, // Pass user ID for your webhook
        },
      }
    });
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
