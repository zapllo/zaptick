"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function ConnectWabaButton() {
  const [sdkReady, setSdkReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkFB = () => {
      if (window.FB && window.FB.login) setSdkReady(true);
      else setTimeout(checkFB, 100);
    };
    checkFB();
  }, []);

  const launchWhatsAppSignup = () => {
    if (!sdkReady || !user?.id) return;
    setIsConnecting(true);

    const configId = process.env.NEXT_PUBLIC_CONFIG_ID;
    const solutionId = process.env.NEXT_PUBLIC_SOLUTION_ID;

    // keep page alive while popup is open
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);

    window.FB.login(
      (response: any) => {
        if (response?.authResponse && response?.status === "connected") {
          // Wait for FINISH message handled by global provider
          setTimeout(() => {
            if (isConnecting) {
              setIsConnecting(false);
              window.removeEventListener("beforeunload", beforeUnload);
              alert("Setup timeout. If FB finished, click ‘I finished’ below to retry.");
            }
          }, 60_000);
        } else {
          setIsConnecting(false);
          window.removeEventListener("beforeunload", beforeUnload);
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
          setup: { solutionID: solutionId, userId: user.id },
        },
      }
    );
  };

  const manualRetry = async () => {
    const cached = localStorage.getItem("waSignupFinish");
    if (!cached) {
      alert("We didn’t receive the FINISH signal yet. Keep this tab open and complete the FB step.");
      return;
    }
    try {
      const payload = JSON.parse(cached);
      await fetch("/api/interakt/tp-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e: any) {
      alert(e?.message || "Retry failed");
    }
  };

  return (
    <div className="rounded-xl border p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600">
          <FaWhatsapp className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Connect WhatsApp Business</h3>
          <p className="text-sm text-slate-600">Secure setup via Facebook</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border mb-6">
        <div className="text-sm">
          {!sdkReady ? "Initializing…" : !user?.id ? "Please log in" : "Ready to connect"}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          disabled={!sdkReady || !user?.id || isConnecting}
          onClick={launchWhatsAppSignup}
          className="w-full gap-2"
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

        {/* small manual retry button */}
        <Button variant="outline" onClick={manualRetry} title="Use if FB finished but we missed the message">
          I finished
        </Button>
      </div>
    </div>
  );
}
