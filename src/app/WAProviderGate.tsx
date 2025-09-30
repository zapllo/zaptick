"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import WhatsAppSignupProvider from "@/providers/WhatsAppSignupProvider";

export default function WAProviderGate({ children }: { children: ReactNode }) {
  const { user } = useAuth(); // available because this gate will be rendered inside <AuthProvider>
  return (
    <WhatsAppSignupProvider getUserId={() => user?.id}>
      {children}
    </WhatsAppSignupProvider>
  );
}
