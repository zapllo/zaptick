"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Bot,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";

interface AutomationsLayoutProps {
  children: React.ReactNode;
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

  const isActiveRoute = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

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
