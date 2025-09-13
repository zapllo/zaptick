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
import { Phone, Plus, Sparkles, Zap, BarChart3, CheckCircle } from "lucide-react";
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
    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:from-muted/40 wark:to-green-900/10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
          <FaWhatsapp className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-600 wark:text-green-400">Quick Setup</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 wark:text-white">
            Connect WhatsApp Business
          </h3>
          <p className="text-sm text-slate-600 wark:text-slate-300">
            Quick setup with Facebook integration
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="group/feature relative overflow-hidden rounded-lg border bg-gradient-to-br from-white to-green-50/20 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 wark:from-slate-800/50 wark:to-green-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 wark:bg-green-900/30 group-hover/feature:scale-110 transition-transform duration-200">
              <Phone className="h-4 w-4 text-green-600 wark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-slate-900 wark:text-white text-sm">Business Messaging</p>
              <p className="text-xs text-slate-600 wark:text-slate-300">Send messages to customers worldwide</p>
            </div>
          </div>
          <div className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-green-500/10 transition-all duration-300 group-hover/feature:scale-110" />
        </div>

        <div className="group/feature relative overflow-hidden rounded-lg border bg-gradient-to-br from-white to-blue-50/20 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 wark:from-slate-800/50 wark:to-blue-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 wark:bg-blue-900/30 group-hover/feature:scale-110 transition-transform duration-200">
              <Sparkles className="h-4 w-4 text-blue-600 wark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-slate-900 wark:text-white text-sm">Template Management</p>
              <p className="text-xs text-slate-600 wark:text-slate-300">Create and manage message templates</p>
            </div>
          </div>
          <div className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-blue-500/10 transition-all duration-300 group-hover/feature:scale-110" />
        </div>

        <div className="group/feature relative overflow-hidden rounded-lg border bg-gradient-to-br from-white to-purple-50/20 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 wark:from-slate-800/50 wark:to-purple-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 wark:bg-purple-900/30 group-hover/feature:scale-110 transition-transform duration-200">
              <BarChart3 className="h-4 w-4 text-purple-600 wark:text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-slate-900 wark:text-white text-sm">Real-time Analytics</p>
              <p className="text-xs text-slate-600 wark:text-slate-300">Track message performance metrics</p>
            </div>
          </div>
          <div className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-purple-500/10 transition-all duration-300 group-hover/feature:scale-110" />
        </div>
      </div>

      {/* Status Section */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 wark:bg-slate-800/50 border border-slate-200 wark:border-slate-700 mb-6">
        <div className="flex items-center gap-2 text-sm">
          {!sdkReady ? (
            <>
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-slate-600 wark:text-slate-300">Initializing Facebook SDK...</span>
            </>
          ) : !user?.id ? (
            <>
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-slate-600 wark:text-slate-300">Please log in to continue</span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-slate-600 wark:text-slate-300">Ready to connect</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 wark:text-slate-400">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>5 min setup</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <span>Free</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <Button
        disabled={!sdkReady || !user?.id || isConnecting}
        onClick={launchWhatsAppSignup}
        className="w-full gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Benefits Footer */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-600 wark:text-slate-400 mt-4 pt-4 border-t border-slate-200 wark:border-slate-700">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>No setup fees</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-blue-500" />
          <span>Instant activation</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-purple-500" />
          <span>24/7 support</span>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
    </div>
  );
}
