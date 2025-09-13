"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Wallet,
  Receipt,
  BarChart2,
  CreditCard,
  Package,
  ChevronRight
} from "lucide-react";
import Layout from "@/components/layout/Layout";

interface WalletLayoutProps {
  children: React.ReactNode;
}

export default function WalletLayout({ children }: WalletLayoutProps) {
  const pathname = usePathname();

  const routes = [
    {
      label: "Wallet Overview",
      icon: <Wallet className="h-4 w-4 mr-2" />,
      href: "/wallet",
      active: pathname === "/wallet",
    },
    {
      label: "Track Expenses",
      icon: <Receipt className="h-4 w-4 mr-2" />,
      href: "/wallet/expenses",
      active: pathname === "/wallet/expenses",
    },
    {
      label: "View Insights",
      icon: <BarChart2 className="h-4 w-4 mr-2" />,
      href: "/wallet/insights",
      active: pathname === "/wallet/insights",
    },
    {
      label: "Subscription Plans",
      icon: <CreditCard className="h-4 w-4 mr-2" />,
      href: "/wallet/plans",
      active: pathname === "/wallet/plans",
    },

  ];

  return (
    <Layout>
      <div className="flex flex-col  lg:flex-row h-full">
        {/* Wallet Sidebar */}
        <aside className="w-full lg:w-64 border-r  bg-background">
          <div className="px-4 py-6 border-b">
            <h2 className="text-xl font-semibold">Billing</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage your wallet and billing</p>
          </div>
          <nav className="p-4 space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md text-sm group",
                  route.active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                )}
              >
                <div className="flex items-center">
                  {route.icon}
                  {route.label}
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all",
                  route.active && "opacity-100 translate-x-0"
                )} />
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </div>
    </Layout>
  );
}
