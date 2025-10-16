"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Bot,
  Sparkles,
  Workflow,
  AlertCircle,
  CreditCard,
  ArrowRight,
  MessageSquare,
  BarChart,
  Calendar,
  Filter,
  Zap,
  Settings,
  Activity,
  ChevronRight,
  X,
  Crown,
  Star,
  TrendingUp,
  Rocket,
  Lock,
  Lightbulb,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

interface AutomationsLayoutProps {
  children: React.ReactNode;
}

interface UserSubscription {
  plan: string;
  planName: string;
  status: 'active' | 'expired' | 'cancelled';
  endDate?: string;
}

const navigationItems = [
  {
    title: "Auto Replies",
    href: "/automations",
    icon: Bot,
    description: "Automated responses to messages",
    exact: true,
    color: "bg-blue-100 wark:bg-blue-900/30 text-blue-600 wark:text-blue-400",
    activeColor: "bg-blue-500/20 text-blue-700 wark:text-blue-300"
  },
  {
    title: "Workflows",
    href: "/automations/workflows",
    icon: Workflow,
    description: "Multi-step automation sequences",
    badge: "New",
    badgeColor: "bg-green-100 text-green-700 border-green-300",
    color: "bg-green-100 wark:bg-green-900/30 text-green-600 wark:text-green-400",
    activeColor: "bg-green-500/20 text-green-700 wark:text-green-300"
  },
  {
    title: "AI Chatbots",
    href: "/automations/chatbots",
    icon: Sparkles,
    description: "Intelligent AI-powered conversations",
    badge: "AI",
    badgeColor: "bg-purple-100 text-purple-700 border-purple-300",
    color: "bg-purple-100 wark:bg-purple-900/30 text-purple-600 wark:text-purple-400",
    activeColor: "bg-purple-500/20 text-purple-700 wark:text-purple-300"
  }
];

const RESTRICTED_PLANS = ['starter', 'free'];

export default function AutomationsLayout({ children }: AutomationsLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.user) {
        setUserSubscription(data.user.subscription);
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  useEffect(() => {
    fetchUserSubscription();
  }, []);

  const isActiveRoute = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isRestrictedPlan = userSubscription?.plan && RESTRICTED_PLANS.includes(userSubscription.plan);

  // Show loading screen while checking subscription
  if (isCheckingSubscription) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background wark:from-slate-900 wark:via-slate-800 wark:to-slate-900/50 p-4">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 wark:text-white">Checking Subscription</h3>
              <p className="text-muted-foreground">Verifying your automation access...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show subscription expired screen
  if (userSubscription?.status === 'expired') {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-red-50/20 to-background wark:from-slate-900 wark:via-red-900/10 wark:to-slate-900/50 p-4">
          <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-red-50/30 wark:from-slate-800 wark:to-red-900/10 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-red-200 wark:hover:border-red-700 max-w-lg w-full">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg transition-all duration-300 group-hover:scale-110">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 wark:text-white mb-1">
                    Subscription Expired
                  </h1>
                  <p className="text-sm text-red-600 wark:text-red-400 font-medium">
                    Automation Access Restricted
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 wark:bg-red-900/30 px-3 py-1.5 text-xs font-medium text-red-700 wark:text-red-300 shadow-sm border border-red-200 wark:border-red-700">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Expired
              </span>
            </div>

            {/* Description Section */}
            <div className="space-y-4 mb-8">
              <p className="text-gray-700 wark:text-gray-300 leading-relaxed">
                Your subscription has expired and you&apos;ve been moved to the Free plan.
                Please renew your subscription to continue accessing automation features.
              </p>

              {userSubscription?.endDate && (
                <div className="bg-red-50 wark:bg-red-900/20 rounded-lg p-4 border border-red-200 wark:border-red-700">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 wark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 wark:text-red-200 mb-1">
                        Subscription expired on
                      </p>
                      <p className="text-sm text-red-700 wark:text-red-300">
                        {format(new Date(userSubscription.endDate), 'PPP')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 wark:text-gray-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 wark:bg-blue-900/30">
                    <Bot className="h-4 w-4 text-blue-600 wark:text-blue-400" />
                  </div>
                  <span>Auto replies & intelligent responses</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 wark:text-gray-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 wark:bg-green-900/30">
                    <Workflow className="h-4 w-4 text-green-600 wark:text-green-400" />
                  </div>
                  <span>Multi-step workflow automation</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 wark:text-gray-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 wark:bg-purple-900/30">
                    <Sparkles className="h-4 w-4 text-purple-600 wark:text-purple-400" />
                  </div>
                  <span>AI-powered chatbot conversations</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 wark:text-gray-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 wark:bg-amber-900/30">
                    <BarChart className="h-4 w-4 text-amber-600 wark:text-amber-400" />
                  </div>
                  <span>Analytics & performance tracking</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-4">
              <Button
                onClick={() => window.location.href = '/wallet/plans'}
                className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Renew Subscription
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 wark:text-gray-400">
                <AlertCircle className="h-3 w-3" />
                <span>Choose from flexible pricing plans</span>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-red-500/10 wark:bg-red-400/20 transition-all duration-300 group-hover:scale-110" />
            <div className="absolute -left-4 -bottom-4 h-12 w-12 rounded-full bg-red-400/20 wark:bg-red-300/30 transition-all duration-300 group-hover:scale-125" />

            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </Layout>
    );
  }

  // Show upgrade screen for starter/free plans
  if (isRestrictedPlan) {
    return (
      <Layout>
        <div className="h-screen mt-36 flex items-center justify-center bg-gradient-to-br from-background via-purple-50/20 to-background wark:from-slate-900 wark:via-purple-900/10 wark:to-slate-900/50 p-4">
          <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-purple-50/30 wark:from-slate-800 wark:to-purple-900/10 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-purple-200 wark:hover:border-purple-700 max-w-2xl w-full">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg transition-all duration-300 group-hover:scale-110">
                  <Rocket className="h-10 w-10 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold text-gray-900 wark:text-white mb-2">
                    Unlock Automation Power
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 wark:bg-orange-900/30 px-3 py-1.5 text-sm font-medium text-orange-700 wark:text-orange-300 shadow-sm border border-orange-200 wark:border-orange-700">
                      <Crown className="h-4 w-4" />
                      {userSubscription?.planName || 'Starter'} Plan
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-purple-600 wark:text-purple-400 font-medium">Growth+ Required</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 rounded-xl bg-blue-50/50 wark:bg-blue-900/20 border border-blue-100 wark:border-blue-800 transition-all duration-300 hover:scale-105">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mx-auto mb-4">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900 wark:text-blue-100 mb-2">Smart Auto Replies</h3>
                <p className="text-sm text-blue-700 wark:text-blue-300">Intelligent keyword-based responses that handle customer inquiries 24/7</p>
              </div>

              <div className="text-center p-6 rounded-xl bg-green-50/50 wark:bg-green-900/20 border border-green-100 wark:border-green-800 transition-all duration-300 hover:scale-105">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg mx-auto mb-4">
                  <Workflow className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-green-900 wark:text-green-100 mb-2">Advanced Workflows</h3>
                <p className="text-sm text-green-700 wark:text-green-300">Multi-step sequences that guide customers through complex interactions</p>
              </div>

              <div className="text-center p-6 rounded-xl bg-purple-50/50 wark:bg-purple-900/20 border border-purple-100 wark:border-purple-800 transition-all duration-300 hover:scale-105">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg mx-auto mb-4">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-purple-900 wark:text-purple-100 mb-2">AI Chatbots</h3>
                <p className="text-sm text-purple-700 wark:text-purple-300">Conversational AI that understands context and provides human-like responses</p>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 wark:from-slate-800/50 wark:to-slate-700/30 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Lightbulb className="h-6 w-6 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 wark:text-white mb-2">Why upgrade to Growth plan?</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-gray-700 wark:text-gray-300">Save time with automated responses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-gray-700 wark:text-gray-300">24/7 customer support automation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-gray-700 wark:text-gray-300">Increase customer satisfaction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-gray-700 wark:text-gray-300">Scale your business efficiently</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Locked Features List */}
            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 wark:text-white mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-gray-500" />
                Currently Locked Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Unlimited auto replies",
                  "Advanced trigger matching",
                  "Multi-step workflows",
                  "AI-powered chatbots",
                  "Template message support",
                  "Priority customer support",
                  "Advanced analytics",
                  "Team collaboration"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600 wark:text-gray-400">
                    <Lock className="h-3 w-3 text-gray-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4" style={{ position: 'relative', zIndex: 9999 }}>
              <Button
                onClick={() => router.push('/wallet/plans')}
                className="w-full cursor-pointer h-14 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-lg"
                size="lg"
              >
                <TrendingUp className="h-6 w-6 mr-3" />
                Upgrade to Growth Plan
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>

              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 wark:text-gray-400">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Instant activation</span>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-purple-500/10 wark:bg-purple-400/20 transition-all duration-300 group-hover:scale-110" />
            <div className="absolute -left-8 -bottom-8 h-20 w-20 rounded-full bg-blue-400/20 wark:bg-blue-300/30 transition-all duration-300 group-hover:scale-125" />

            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </Layout>
    );
  }

  // Render normal layout with sidebar if subscription allows automation
  return (
    <Layout>
      <div className="flex h-full bg-gradient-to-br from-slate-50 via-white to-slate-100/50 wark:from-slate-900 wark:via-slate-800 wark:to-slate-900/50">
        {/* Sidebar */}
        <div className={cn(
          "border-r bg-gradient-to-b from-white to-slate-50/50 wark:from-slate-800 wark:to-slate-900/50 border-slate-200 wark:border-slate-700 transition-all duration-300",
          sidebarCollapsed ? "w-20" : "w-80"
        )}>
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b border-slate-200 wark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div className={cn("space-y-1 transition-all duration-300", sidebarCollapsed && "opacity-0 w-0 overflow-hidden")}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 wark:from-white wark:to-slate-200 bg-clip-text text-transparent">
                      Automations
                    </h2>
                  </div>
                  <p className="text-sm text-slate-600 wark:text-slate-300">
                    Automate your WhatsApp workflows
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navigationItems.map((item, index) => {
                const isActive = isActiveRoute(item.href, item.exact);

                return (
                  <div key={index} className="relative">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start  h-auto p-3  rounded-xl transition-all duration-300 hover:scale-[1.02] border",
                        isActive
                          ? "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-sm"
                          : "border-transparent hover:bg-slate-50 wark:hover:bg-slate-800/50 hover:border-slate-200 wark:hover:border-slate-700",
                        sidebarCollapsed && "justify-center px-0"
                      )}
                      onClick={() => router.push(item.href)}
                    >
                      <div className={cn(
                        "flex items-center gap-3 w-full",
                        sidebarCollapsed && "justify-center"
                      )}>
                        <div className={cn(
                          "flex-shrink-0 p-2 rounded-lg transition-all duration-300",
                          isActive ? item.activeColor : item.color
                        )}>
                          <item.icon className="h-4 w-4" />
                        </div>

                        {!sidebarCollapsed && (
                          <div className="flex-1 text-left">
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "font-semibold text-sm transition-colors",
                                isActive ? "text-slate-900 wark:text-white" : "text-slate-700 wark:text-slate-300"
                              )}>
                                {item.title}
                              </span>
                              {item.badge && (
                                <Badge
                                  variant="outline"
                                  className={cn("text-xs font-medium", item.badgeColor)}
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 wark:text-slate-400 mt-1">
                              {item.description}
                            </p>
                          </div>
                        )}

                      
                      </div>
                    </Button>

                    {/* Active indicator for collapsed sidebar */}
                    {sidebarCollapsed && isActive && (
                      <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary rounded-full" />
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Footer (when expanded) */}
            {!sidebarCollapsed && (
              <div className="p-4 border-t border-slate-200 wark:border-slate-700">
                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 wark:from-blue-900/20 wark:to-purple-900/20 rounded-lg border border-blue-200 wark:border-blue-700">
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-blue-600 wark:text-blue-400" />
                    <span className="text-blue-900 wark:text-blue-100 font-medium">Status: All systems operational</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </Layout>
  );
}
