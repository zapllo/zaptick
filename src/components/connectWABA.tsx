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
    const handleMessage = async (event: MessageEvent) => {
      const allowedOrigins = [
        "https://www.facebook.com",
        "https://web.facebook.com",
        "https://business.facebook.com",
        "https://developers.facebook.com"
      ];

      if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) return;

      let messageData;

      try {
        if (typeof event.data === 'string') {
          messageData = JSON.parse(event.data);
        } else if (typeof event.data === 'object' && event.data !== null) {
          messageData = event.data;
        } else {
          return;
        }

        if (messageData.type === 'WA_EMBEDDED_SIGNUP') {
          if (messageData.event === 'FINISH') {
            const data = messageData.data || {};
            const wabaId = data.waba_id;
            const phoneNumberId = data.phone_number_id;
            const businessName = data.business_name || data.display_name || 'New Business';
            const phoneNumber = data.phone_number || data.display_phone_number || '';

            if (wabaId && phoneNumberId) {
              await callTPSignupAPI({
                wabaId,
                phoneNumberId,
                businessName,
                phoneNumber,
                userId: user?.id
              });

              setIsConnecting(false);
              window.dispatchEvent(new CustomEvent('wabaSignupCompleted', {
                detail: { wabaId, phoneNumberId, businessName }
              }));
            } else {
              console.error('Missing WABA info');
              setIsConnecting(false);
              alert('Setup incomplete: Missing WABA information.');
            }
          } else if (messageData.event === 'CANCEL') {
            console.warn('Signup cancelled');
            setIsConnecting(false);
          } else if (messageData.event === 'ERROR') {
            console.error('Signup error:', messageData.data);
            setIsConnecting(false);
            alert(`Signup error: ${messageData.data?.error_message || 'Unknown error'}`);
          }
        }
      } catch (error) {
        console.warn('Non-JSON message:', event.data);
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
        const response = await fetch('/api/interakt/tp-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wabaData),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('TP Signup failed:', error);
          alert(`TP Signup failed: ${error.error || 'Unknown error'}`);
        } else {
          const result = await response.json();
          console.log('TP Signup success:', result);
        }
      } catch (err) {
        console.error('TP Signup error:', err);
        alert('Failed to send WABA data. Please try again.');
      }
    };

    window.addEventListener('message', handleMessage);

    const checkFB = () => {
      if (window.FB && window.FB.XFBML) {
        console.log('✅ Facebook SDK ready');
        setSdkReady(true);
      } else {
        setTimeout(checkFB, 100);
      }
    };

    checkFB();

    return () => window.removeEventListener('message', handleMessage);
  }, [user?.id]);

  // Trigger embedded signup parse
  useEffect(() => {
    if (sdkReady && user?.id && document.getElementById('wa-signup-container')) {
      window.FB.XFBML.parse(document.getElementById('wa-signup-container'));
    }
  }, [sdkReady, user?.id]);

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
        {sdkReady && user?.id && (
          <div id="wa-signup-container" className="w-full">
            <div
              className="fb-embedded-signup"
              data-setup={JSON.stringify({
                config_id: process.env.NEXT_PUBLIC_CONFIG_ID,
                solution_id: process.env.NEXT_PUBLIC_SOLUTION_ID,
                setup: {
                  userId: user.id
                }
              })}
            ></div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button disabled className="gap-2">
          <Plus className="h-4 w-4" />
          Use the embedded box above
        </Button>
      </CardFooter>
    </Card>
  );
}
