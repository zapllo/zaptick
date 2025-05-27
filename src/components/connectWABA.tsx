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

    // Check if we have all required environment variables
    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const configId = process.env.NEXT_PUBLIC_CONFIG_ID;
    const solutionId = process.env.NEXT_PUBLIC_SOLUTION_ID;

    console.log('Environment check:', { appId, configId, solutionId });

    if (!configId) {
      console.error('Missing NEXT_PUBLIC_CONFIG_ID');
      setIsConnecting(false);
      return;
    }

    // Launch Facebook login with all required parameters
    window.FB.login(
      (response: any) => {
        console.log('FB Login Response:', response);
        if (!response.authResponse) {
          setIsConnecting(false);
        }
      },
      {
        config_id: configId, // Required: WhatsApp embedded signup configuration ID
        response_type: 'code', // Required: Must be 'code' for System User access token
        override_default_response_type: true, // Required: Use response_type over defaults
        extras: {
          setup: {
            ...(solutionId && { solutionID: solutionId }), // Include solution ID if available
            userId: user.id, // Your user identification
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
