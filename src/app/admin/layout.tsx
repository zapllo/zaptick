'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    Building2,
    Globe,
    Settings,
    Menu,
    DollarSign,
    Target,
    Users,
    BarChart3,
    Shield,
    CreditCard,
    IndianRupee,
    LogOut,
    User,
    Brain,
    Activity,
    Home,
    Database
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navigation = [
    {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: Home,
        description: 'Platform overview and analytics'
    },
    {
        name: 'Companies',
        href: '/admin/companies',
        icon: Building2,
        description: 'Manage all registered companies'
    },
    {
        name: 'Users',
        href: '/admin/users',
        icon: Users,
        description: 'Manage all platform users'
    },
    {
        title: 'TP-Signup',
        href: '/admin/tp-signup',
        icon: Users,
        description: 'WABA Onboarding Management'
    },
    {
        name: 'Template Rates',
        href: '/admin/template-rates',
        icon: Globe,
        description: 'Manage company-specific template rates'
    },
    {
        name: 'Default Rates',
        href: '/admin/default-template-rates',
        icon: Target,
        description: 'Configure global default template rates'
    },
    {
        name: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        description: 'Advanced platform analytics'
    },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // Call logout API to clear server-side cookie
            await fetch('/api/auth/logout', {
                method: 'POST',
            });

            // Redirect to login page
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Still redirect to login even if API call fails
            router.push('/login');
        }
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center border-b px-6">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center rounded-lg">
                        <img src='/tick.png' className='h-12' alt="Logo" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">Admin Panel</h1>
                        <p className="text-xs text-muted-foreground">System Management</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-4 py-4">
                <div className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon className="h-4 w-4 shrink-0" />
                                <div className="flex flex-col">
                                    <span>{item.name}</span>
                                    <span className={cn(
                                        'text-xs',
                                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                    )}>
                                        {item.description}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-4 border-t">
                    <div className="space-y-2 px-3">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Quick Stats
                        </h3>
                        <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">System Status</span>
                                <span className="text-green-600 font-medium">Operational</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Database</span>
                                <span className="text-green-600 font-medium">Connected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* User Profile & Logout */}
            <div className="border-t p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Database className="h-4 w-4" />
                        <span>Admin Console</span>
                    </div>
                </div>

                <div className="mt-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start gap-2 h-auto p-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                        SA
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start text-xs">
                                    <span className="font-medium">Super Admin</span>
                                    <span className="text-muted-foreground">System Administrator</span>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                Profile Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                System Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-80 lg:flex-col lg:border-r">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="w-80 p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Mobile Header */}
                <div className="flex h-16 items-center gap-4 border-b px-6 lg:hidden">
                    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                    </Sheet>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Admin Panel</span>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
