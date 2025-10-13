'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Building2,
  Users,
  BarChart3,
  Settings,
  Shield,
  Activity,
  Brain,
  Wallet,
  MessageSquare,
  TrendingUp
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Overview',
    href: '/admin',
    icon: Activity,
    description: 'Platform overview and quick stats'
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Comprehensive platform analytics'
  },
  {
    title: 'Companies',
    href: '/admin/companies',
    icon: Building2,
    description: 'Manage organizations'
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'User management and analytics'
  },
  {
    title: 'TP-Signup',
    href: '/admin/tp-signup',
    icon: Users,
    description: 'WABA Onboarding Management'
  },
  {
    title: 'Financial',
    href: '/admin/financial',
    icon: Wallet,
    description: 'Revenue and expense tracking'
  },
  {
    title: 'AI Management',
    href: '/admin/ai',
    icon: Brain,
    description: 'AI credits and usage'
  },
  {
    title: 'Templates',
    href: '/admin/templates',
    icon: MessageSquare,
    description: 'Message template management'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Platform configuration'
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-semibold">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
                isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">System Status</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            All systems operational
          </div>
        </div>
      </div>
    </div>
  );
}
