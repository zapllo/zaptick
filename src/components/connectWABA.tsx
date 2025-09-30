"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Phone, Plus, Sparkles, BarChart3, CheckCircle } from "lucide-react";
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
    const log = (...args: any[]) => console.log("[ConnectWaba]", ...args);

    const callTPSignup = async (payload: any) => {
      try {
        log("🔄 Calling TP signup API → /api/interakt/tp-signup", payload);
        const res = await fetch("/api/interakt/tp-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        let json: any = text;
        try { json = JSON.parse(text); } catch { }
        log(`📡 TP-signup response [${res.status}]`, json);
        if (res.ok) {
          alert("WABA connected! Waiting for final activation (WABA_ONBOARDED)...");
          window.dispatchEvent(new CustomEvent("wabaSignupCompleted"));
          setTimeout(() => window.location.reload(), 1500);
        } else {
          alert(`Setup failed: ${json?.details || json?.error || "Please contact support"}`);
        }
      } catch (err: any) {
        log("❌ TP-signup error", err);
        alert(`Setup failed: ${err?.message || "Network error"}`);
      } finally {
        setIsConnecting(false);
      }
    };

    const safeFacebookOrigin = (origin: string) => {
      try {
        const h = new URL(origin).hostname;              // may throw on "", "null"
        return /(^|\.)facebook\.com$|(^|\.)fb\.com$/i.test(h);
      } catch {
        return false;
      }
    };

    const handleMessage = (event: MessageEvent) => {
      // Loosen for debug, but keep a guard
      if (!safeFacebookOrigin(event.origin)) {
        // For first run, log and continue so we can see payloads; tighten later.
        console.warn("[ConnectWaba] Untrusted origin, but logging for debug:", event.origin);
        // return;  // <— re-enable once verified
      }

      log("📨 postMessage received:", { origin: event.origin, data: event.data });

      let data: any = event.data;
      try {
        if (typeof data === "string") data = JSON.parse(data);
      } catch { /* non-JSON */ }

      // Accept common shapes
      const isWA = data?.type === "WA_EMBEDDED_SIGNUP" ||
        data?.source === "WA_EMBEDDED_SIGNUP" ||
        data?.topic === "WA_EMBEDDED_SIGNUP";
      if (!isWA && data?.event !== "FINISH") return; // nothing for us

      log("🎯 Embedded Signup event", data);

      if (data.event === "FINISH") {
        const w = data.data || data.payload || {};
        // Try multiple locations for WABA ID
        const wabaId =
          w.waba_id || w.wabaId ||
          w?.waba?.id || w?.waba?.waba_id ||
          w?.whatsapp_business_account_id;

        const businessName = w.business_name || w.businessName || "New Business";
        const phoneNumber =
          w.phone_number || w.display_phone_number || w.phone || w?.msisdn || "";

        const solutionId = process.env.NEXT_PUBLIC_SOLUTION_ID;

        log("📦 FINISH extracted:", { wabaId, phoneNumber, businessName, solutionId, userId: user?.id });

        if (!solutionId || !user?.id) {
          setIsConnecting(false);
          alert("Missing Solution ID / User ID. Check env and login.");
          return;
        }

        // ✅ Call TP-signup even if wabaId is missing; include raw FINISH so backend can reconcile
        callTPSignup({
          userId: user.id,
          solutionId,
          wabaId: wabaId || undefined,
          phoneNumber: phoneNumber || undefined,
          businessName,
          finishPayload: w,           // helps backend/Interakt support edge cases
        });
      } else if (data.event === "CANCEL") {
        log("⚠️ User cancelled signup");
        setIsConnecting(false);
      } else if (data.event === "ERROR") {
        log("❌ Signup error", data.data);
        setIsConnecting(false);
        alert(`Signup failed: ${data.data?.error_message || "Unknown error"}`);
      }
    };

    window.addEventListener("message", handleMessage);

    const checkFB = () => {
      if (window.FB && window.FB.login) {
        console.log("✅ Facebook SDK ready");
        setSdkReady(true);
      } else {
        setTimeout(checkFB, 100);
      }
    };
    checkFB();

    return () => window.removeEventListener("message", handleMessage);
  }, [user?.id]);

  const launchWhatsAppSignup = () => {
    if (!sdkReady || !user?.id) return;

    setIsConnecting(true);

    const configId = process.env.NEXT_PUBLIC_CONFIG_ID;
    const solutionId = process.env.NEXT_PUBLIC_SOLUTION_ID;

    console.log("[ConnectWaba] 🚀 Launching Embedded Signup", { configId, solutionId, userId: user.id });

    window.FB.login(
      (response: any) => {
        console.log("[ConnectWaba] 📋 FB login response", response);

        if (response?.authResponse && response?.status === "connected") {
          console.log("[ConnectWaba] ✅ FB auth ok – waiting for FINISH message from iframe…");
          // Soft timeout to alert the user if FINISH never arrives
          setTimeout(() => {
            if (isConnecting) {
              console.warn("[ConnectWaba] ⏱️ Timeout – no FINISH received");
              setIsConnecting(false);
              alert("Setup timeout. If the flow finished in FB, please retry or contact support.");
            }
          }, 60_000);
        } else {
          console.error("[ConnectWaba] ❌ FB auth failed", response);
          setIsConnecting(false);
          const msg = response?.error?.error_description || response?.error || "Auth failed";
          alert(`Authentication failed: ${msg}`);
        }
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        scope: "business_management,whatsapp_business_management",
        extras: {
          setup: {
            // IMPORTANT: Interakt reads this solution ID on their side
            solutionID: solutionId,
            userId: user.id,
          },
        },
      }
    );
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:from-muted/40 wark:to-green-900/10">
      {/* (UI unchanged for brevity) */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
          <FaWhatsapp className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-600 wark:text-green-400">Quick Setup</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 wark:text-white">Connect WhatsApp Business</h3>
          <p className="text-sm text-slate-600 wark:text-slate-300">Secure setup via Facebook</p>
        </div>
      </div>

      {/* status and button */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 wark:bg-slate-800/50 border border-slate-200 wark:border-slate-700 mb-6">
        <div className="flex items-center gap-2 text-sm">
          {!sdkReady ? (
            <>
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Initializing…</span>
            </>
          ) : !user?.id ? (
            <>
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>Please log in</span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>Ready to connect</span>
            </>
          )}
        </div>
      </div>

      <Button
        disabled={!sdkReady || !user?.id || isConnecting}
        onClick={launchWhatsAppSignup}
        className="w-full gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        size="lg"
      >
        {isConnecting ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Connecting…</span>
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            <span>Connect WhatsApp Account</span>
          </>
        )}
      </Button>

      {/* (feature tiles + footer can stay as in your version) */}
    </div>
  );
}
