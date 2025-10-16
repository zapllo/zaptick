"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Crown, Lock } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function ConnectWabaButton() {
  const [sdkReady, setSdkReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [userPlanName, setUserPlanName] = useState<string>('Free');
  const [hasExistingWaba, setHasExistingWaba] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Fetch user's plan and WABA status
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (data.user) {
          const plan = data.user.subscription?.plan || 'free';
          const planNames: { [key: string]: string } = {
            free: 'Free',
            starter: 'Starter',
            explore: 'Explore',
            growth: 'Growth',
            advanced: 'Advanced',
            enterprise: 'Enterprise'
          };

          setUserPlan(plan);
          setUserPlanName(planNames[plan] || 'Free');

          // Check if user has existing WABA accounts
          const hasWaba = data.user.wabaAccounts &&
                          data.user.wabaAccounts.length > 0 &&
                          data.user.wabaAccounts.some((account: any) =>
                            account.wabaId && account.phoneNumberId
                          );
          setHasExistingWaba(hasWaba);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, [user?.id]);

  useEffect(() => {
    const checkFB = () => {
      if (window.FB && window.FB.login) setSdkReady(true);
      else setTimeout(checkFB, 100);
    };
    checkFB();
  }, []);

  const handleConnectClick = () => {
    // Check if user already has WABA and is not on advanced/enterprise plan
    if (hasExistingWaba && !['advanced', 'enterprise'].includes(userPlan)) {
      setShowUpgradeDialog(true);
      return;
    }

    // Proceed with normal connection flow
    launchWhatsAppSignup();
  };

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
              alert("Setup timeout. If FB finished, click 'I finished' below to retry.");
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
      alert("We didn't receive the FINISH signal yet. Keep this tab open and complete the FB step.");
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
    <>
      <div className="rounded-xl border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600">
            <FaWhatsapp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Connect WhatsApp Business</h3>
            <p className="text-sm text-slate-600">
              {hasExistingWaba ? 'Add another WhatsApp account' : 'Secure setup via Facebook'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border mb-6">
          <div className="text-sm">
            {!sdkReady ? "Initializing…" : !user?.id ? "Please log in" : "Ready to connect"}
          </div>
          {hasExistingWaba && (
            <Badge variant="outline" className="text-xs">
              Current: {userPlanName}
            </Badge>
          )}
        </div>

        <div className="gap-2">
          <Button
            disabled={!sdkReady || !user?.id || isConnecting}
            onClick={handleConnectClick}
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
                {hasExistingWaba && !['advanced', 'enterprise'].includes(userPlan) ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>
                  {hasExistingWaba ? 'Add Another Account' : 'Connect WhatsApp Account'}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  Multiple Accounts Feature
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-600 mt-1">
                  Upgrade required for additional WhatsApp accounts
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-slate-700 text-center font-medium">
                Multiple WABA accounts feature is only available for{' '}
                <span className="font-semibold text-purple-700">Advanced</span> and{' '}
                <span className="font-semibold text-blue-700">Enterprise</span> plans.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
              <div>
                <p className="text-sm font-medium text-slate-700">Current Plan</p>
                <p className="text-xs text-slate-500">Limited to 1 WhatsApp account</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {userPlanName}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Advanced & Enterprise benefits:</p>
              <ul className="text-xs text-slate-600 space-y-1 pl-4">
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-green-500" />
                  Multiple WhatsApp Business accounts
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-green-500" />
                  Advanced automation features
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-green-500" />
                  Priority customer support
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-green-500" />
                  Enhanced analytics & reporting
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowUpgradeDialog(false);
                router.push('/wallet/plans');
              }}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
