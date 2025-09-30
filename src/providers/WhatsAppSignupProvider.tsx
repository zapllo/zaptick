"use client";

import { useEffect, useRef } from "react";

type GetUserId = () => string | undefined;

async function callTPSignup(payload: any) {
  // persist in case page reloads during the call
  localStorage.setItem("waSignupFinish", JSON.stringify(payload));
  const res = await fetch("/api/interakt/tp-signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json: any = text;
  try { json = JSON.parse(text); } catch {}

  console.log("[WA-Embedded] TP-signup →", res.status, json);

  if (res.ok) {
    localStorage.removeItem("waSignupFinish");
    window.dispatchEvent(new CustomEvent("wabaSignupCompleted"));
    alert("WABA connected! Waiting for WABA_ONBOARDED…");
    setTimeout(() => window.location.reload(), 1200);
  } else {
    alert(`Setup failed: ${json?.details || json?.error || "Contact support"}`);
  }
}

function safeFacebookOrigin(origin: string) {
  try {
    const h = new URL(origin).hostname;
    return /(^|\.)facebook\.com$|(^|\.)fb\.com$/i.test(h);
  } catch {
    return false;
  }
}

export default function WhatsAppSignupProvider({
  getUserId,
  children,
}: {
  getUserId: GetUserId;
  children: React.ReactNode;
}) {
  const installedRef = useRef(false);

  useEffect(() => {
    if (installedRef.current) return;
    installedRef.current = true;

    const log = (...a: any[]) => console.log("[WA-Embedded]", ...a);

    // 1) If we crashed/reloaded after FINISH, auto-retry
    try {
      const cached = localStorage.getItem("waSignupFinish");
      if (cached) {
        log("Found cached FINISH → retrying TP-signup");
        callTPSignup(JSON.parse(cached));
      }
    } catch {}

    // 2) Global postMessage listener
    const onMessage = (event: MessageEvent) => {
      if (!safeFacebookOrigin(event.origin)) {
        // keep logging during integration; re-enable the return later
        console.warn("[WA-Embedded] Untrusted origin:", event.origin);
        // return;
      }

      let data: any = event.data;
      try { if (typeof data === "string") data = JSON.parse(data); } catch {}

      const type = (data?.type || data?.source || data?.topic || "").toString().toLowerCase();
      const isWA = type === "wa_embedded_signup" || type === "wa_embedded_sign_up";
      if (!isWA && data?.event !== "FINISH") return;

      log("postMessage:", data);

      if (data.event === "FINISH") {
        const w = data.data || data.payload || {};
        const wabaId =
          w.waba_id || w.wabaId || w?.waba?.id || w?.waba?.waba_id || w?.whatsapp_business_account_id;
        const businessName = w.business_name || w.businessName || "New Business";
        const phoneNumber = w.phone_number || w.display_phone_number || w.phone || w.msisdn || "";
        const solutionId = process.env.NEXT_PUBLIC_SOLUTION_ID!;
        const userId = getUserId?.();

        if (!solutionId || !userId) {
          alert("Missing Solution ID / User ID. Please log in and check env.");
          return;
        }

        // Call even if wabaId is missing; backend can reconcile with finishPayload
        callTPSignup({
          userId,
          solutionId,
          wabaId: wabaId || undefined,
          phoneNumber: phoneNumber || undefined,
          businessName,
          finishPayload: w,
        });
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [getUserId]);

  return <>{children}</>;
}
