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

  const openSignup = () => {
    if (!sdkReady) return;

    // Make sure the user is logged-in to Meta first
    window.FB.login(
      () => {
        window.FB.CustomerChat.showDialog({
          chat_plugin: "wa_embedded_signup",
          extras: {
            setup: {
              solutionID: process.env.NEXT_PUBLIC_SOLUTION_ID,
              userId: user?.id, // Pass user ID to webhook
            },
          },
        });
      },
      {
        scope: "business_management,whatsapp_business_management",
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
          disabled={!sdkReady}
          onClick={openSignup}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Connect WABA
        </Button>
      </CardFooter>
    </Card>
  );
}
