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
  }
}

export default function ConnectWabaButton() {
  const [sdkReady, setSdkReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Poll until window.FB appears
    const t = setInterval(() => {
      if (window.FB?.init) {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_META_APP_ID,
          xfbml: false,
          version: "v19.0",
        });
        setSdkReady(true);
        clearInterval(t);
      }
    }, 300);
    return () => clearInterval(t);
  }, []);

  // Listen for embedded signup completion events
  useEffect(() => {
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
            // Optionally show success message or refresh the page
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
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const openSignup = () => {
    if (!sdkReady || !user?.id) return;

    setIsConnecting(true);

    // Launch Facebook login with embedded signup
    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          console.log('Facebook login successful');
          // The embedded signup flow will continue automatically
        } else {
          console.log('Facebook login failed or cancelled');
          setIsConnecting(false);
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_CONFIG_ID, // Your WhatsApp embedded signup config ID
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {
            userId: user.id, // This will be passed to your Interakt webhook
          },
        },
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
          onClick={openSignup}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect WABA"}
        </Button>
      </CardFooter>
    </Card>
  );
}
