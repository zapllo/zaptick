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
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";

interface AutomationsLayoutProps {
  children: React.ReactNode;
}

interface UserSubscription {
  plan: string;
  status: 'active' | 'expired' | 'cancelled';
  endDate?: string;
}

const navigationItems = [
  {
    title: "Auto Replies",
    href: "/automations",
    icon: Bot,
    description: "Automated responses to messages",
    exact: true
  },
  {
    title: "Workflows",
    href: "/automations/workflows",
    icon: Workflow,
    description: "Multi-step automation sequences",
    badge: "New",
  },
  {
    title: "AI Chatbots",
    href: "/automations/chatbots",
    icon: Sparkles,
    description: "Intelligent AI-powered conversations",
    badge: "AI",
  }
];

export default function AutomationsLayout({ children }: AutomationsLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);

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

  // Show loading screen while checking subscription
  if (isCheckingSubscription) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking subscription status...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show subscription expired screen
  if (userSubscription?.status === 'expired') {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-red-50/20 to-background p-4">
          <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-red-50/30 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-red-200 max-w-lg w-full">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg transition-all duration-300 group-hover:scale-110">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Subscription Expired
                  </h1>
                  <p className="text-sm text-red-600 font-medium">
                    Access Restricted
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Expired
              </span>
            </div>

            {/* Description Section */}
            <div className="space-y-4 mb-8">
              <p className="text-gray-700 leading-relaxed">
                Your subscription has expired and you&apos;ve been moved to the Free plan. 
                Please renew your subscription to continue accessing automation features.
              </p>

              {userSubscription?.endDate && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-1">
                        Subscription expired on
                      </p>
                      <p className="text-sm text-red-700">
                        {format(new Date(userSubscription.endDate), 'PPP')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>Auto replies & intelligent responses</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <Workflow className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Multi-step workflow automation</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </div>
                  <span>AI-powered chatbot conversations</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                    <BarChart className="h-4 w-4 text-amber-600" />
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

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <AlertCircle className="h-3 w-3" />
                <span>Choose from flexible pricing plans</span>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-red-500/10 transition-all duration-300 group-hover:scale-110" />
            <div className="absolute -left-4 -bottom-4 h-12 w-12 rounded-full bg-red-400/20 transition-all duration-300 group-hover:scale-125" />

            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </Layout>
    );
  }

  // Render normal layout with sidebar if subscription is active
  return (
    <Layout>
      <div className="flex h-full bg-background">
        {/* Sidebar */}
        <div className="w-72 border-r bg-background">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b p-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight">
                  Automations
                </h2>
                <p className="text-sm text-muted-foreground">
                  Automate your WhatsApp workflows
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map((item, index) => {
                const isActive = isActiveRoute(item.href, item.exact);

                return (
                  <Button
                    key={index}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-auto p-3",
                      isActive && "bg-primary/10 border border-primary/20",
                      item.disabled && "opacity-60 cursor-not-allowed"
                    )}
                    onClick={() => {
                      if (!item.disabled) {
                        router.push(item.href);
                      }
                    }}
                    disabled={item.disabled}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={cn(
                        "flex-shrink-0 p-1.5 rounded-md",
                        isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{item.title}</span>
                          {item.badge && (
                            <Badge variant="outline" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </nav>
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