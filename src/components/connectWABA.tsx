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
import { FaWhatsapp } from "react-icons/fa";

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
    <Card className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-white to-green-50/30  transition-all duration-300 hover:border-green-300 hover:shadow-lg wark:border-gray-700 wark:from-muted/40 wark:to-green-900/10">
      {/* Header */}
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <FaWhatsapp className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Ready to connect
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 wark:text-white">
          Connect WhatsApp Business
        </h3>
        <p className="text-sm text-gray-600 wark:text-gray-300">
          Add your WhatsApp Business account to unlock powerful messaging features
        </p>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex flex-col items-center gap-4 px-6">
        {/* Features */}
        <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 wark:bg-green-900/30">
              <Phone className="h-4 w-4 text-green-600 wark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 wark:text-white">Business Messaging</p>
              <p className="text-xs text-gray-500">Send messages to customers</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 wark:bg-blue-900/30">
              <Phone className="h-4 w-4 text-blue-600 wark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 wark:text-white">Template Management</p>
              <p className="text-xs text-gray-500">Create and manage templates</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 wark:bg-purple-900/30">
              <Phone className="h-4 w-4 text-purple-600 wark:text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 wark:text-white">Real-time Analytics</p>
              <p className="text-xs text-gray-500">Track message performance</p>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {!sdkReady ? (
            <>
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Initializing Facebook SDK...</span>
            </>
          ) : !user?.id ? (
            <>
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>Please log in to continue</span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Ready to connect</span>
            </>
          )}
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="pt-2">
        <div className="w-full space-y-3">
          <Button
            disabled={!sdkReady || !user?.id || isConnecting}
            onClick={launchWhatsAppSignup}
            className="w-full gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            size="lg"
          >
            {isConnecting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Connect WhatsApp Account</span>
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-500/20 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              </div>
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-blue-500/20 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              </div>
              <span>5 min setup</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-purple-500/20 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              </div>
              <span>Free</span>
            </div>
          </div>
        </div>
      </CardFooter>

      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
      <div className="absolute -left-4 -bottom-4 h-12 w-12 rounded-full bg-green-500/5" />

      {/* Hover overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  );
}
