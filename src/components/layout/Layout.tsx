"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import PermissionCheck from "@/components/auth/PermissionCheck";
import {
  Bell, Search, MessageSquare, User, LogOut, Settings, CreditCard, HelpCircle, X,
  MenuIcon, ChevronDown, Loader2, UsersRound,
  Shield,
  Tags,
  UserCog,
  Code2,
  MessageCircle,
  Wallet,
  ArrowUpRight,
  Sparkles,
  Plus,
  LayoutDashboard,
  Users,
  File
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { FaWhatsapp } from "react-icons/fa";

interface LayoutProps {
  children: React.ReactNode;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'owner';
  wabaAccounts?: any[];
  image?: string;
}

interface UserPermissions {
  role: 'admin' | 'agent';
  permissions: {
    resource: string;
    actions: string[];
  }[];
}

export default function Layout({ children }: LayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  const [walletData, setWalletData] = useState({
    balance: 0,
    formattedBalance: "₹ 0.00",
    recentChange: 0,
    isLoading: true
  });

  // Fetch user permissions
  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const response = await fetch('/api/auth/permissions');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserPermissions(data.permissions);
          }
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };

    if (user) {
      fetchUserPermissions();
    }
  }, [user]);

  // Add this useEffect to fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await fetch('/api/wallet/balance');

        if (response.ok) {
          const data = await response.json();

          if (data.success) {
            setWalletData({
              balance: data.walletBalance,
              formattedBalance: data.formattedBalance,
              recentChange: data.recentChange,
              isLoading: false
            });
          }
        } else {
          setWalletData(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        setWalletData(prev => ({ ...prev, isLoading: false }));
      }
    };

    if (user) {
      fetchWalletBalance();
    }
  }, [user]);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUser({
          ...data.user,
          image: data.user.image || '/avatars/default.png'
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Authentication Error",
          description: "Please sign in again to continue.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });

      if (response.ok) {
        router.push('/login');
        toast({
          title: "Signed out successfully",
          description: "You have been logged out of your account."
        });
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  // Close search on navigation
  useEffect(() => {
    setSearchOpen(false);
    setCommandOpen(false);
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Handle keyboard shortcut for command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Helper function to check if user has permission
  const hasPermission = (resource: string, action: string = 'read') => {
    if (!userPermissions) return false;

    if (userPermissions.role === 'admin') return true;

    const permission = userPermissions.permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action) : false;
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Loading ZapTick
            </h3>
            <p className="text-sm text-muted-foreground">Setting up your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          user={user}
          userPermissions={userPermissions}
          isCollapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[280px] border-r-0">
          <Sidebar user={user} userPermissions={userPermissions} />
        </SheetContent>
      </Sheet>

      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "md:ml-[70px]" : "md:ml-[280px]"
      )}>
        {/* Header */}
        <header className={`sticky top-0 z-50 flex h-[65px] items-center border-b bg-background/80 backdrop-blur-xl px-4 lg:px-6 ${sidebarCollapsed ? "ml-2" : ""}`}>
          <div className="flex flex-1 items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-muted/50 transition-colors"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>

            {/* Command palette button */}
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex items-center w-[320px] h-10 gap-3 pl-4 pr-3 text-muted-foreground border-muted/50 hover:border-muted transition-colors bg-muted/30"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">Search anything...</span>
              <div className="ml-auto flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-background px-2 font-mono text-[11px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </Button>

            {/* Mobile search */}
            {searchOpen ? (
              <div className="flex w-full items-center md:hidden">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="h-10 rounded-r-none border-r-0 focus-visible:ring-1 bg-muted/30"
                  autoFocus
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-l-none border-l-0 bg-muted/30"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0 md:hidden bg-muted/30 hover:bg-muted/50"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            )}

            {/* App title on mobile */}
            <div className={cn(
              "flex items-center md:hidden",
              searchOpen && "hidden"
            )}>
              <h1 className="font-bold text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                ZapTick
              </h1>
            </div>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2">
              {/* Wallet Balance */}
              <PermissionCheck resource="settings" action="read" fallback={null}>
                <Button
                  variant="ghost"
                  className="relative h-10 rounded-xl px-4 hidden lg:flex items-center gap-3 hover:bg-muted/50 transition-colors"
                  onClick={() => router.push('/wallet')}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-2 rounded-lg">
                      <Wallet className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs text-muted-foreground font-medium">Balance</span>
                      {walletData.isLoading ? (
                        <div className="h-4 w-20 bg-muted animate-pulse rounded-md"></div>
                      ) : (
                        <span className="text-sm font-semibold">{walletData.formattedBalance}</span>
                      )}
                    </div>
                    {walletData.recentChange > 0 && (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 wark:bg-emerald-900/30 wark:text-emerald-400 border-emerald-200 wark:border-emerald-800">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +₹{walletData.recentChange.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </Button>
              </PermissionCheck>

              {/* Quick Actions
              <PermissionCheck resource="conversations" action="write" fallback={null}>
                <Button
                  size="sm"
                  className="hidden sm:flex items-center gap-2 h-10 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-200"
                  onClick={() => router.push('/conversations')}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden lg:inline">New Chat</span>
                </Button>
              </PermissionCheck> */}


              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-muted/50 transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-[11px] text-white flex items-center justify-center font-semibold">4</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0 border-0 shadow-lg">
                  <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-base">Notifications</h3>
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2 hover:bg-background">
                        Mark all read
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <h1 className="flex justify-center p-4">Notifications Coming Soon</h1>
                  </div>
                  <div className="p-3 border-t bg-muted/30">
                    <Button variant="ghost" size="sm" className="w-full h-8 text-sm font-medium hover:bg-background">
                      View all notifications
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Settings Dropdown */}
              <PermissionCheck resource="settings" action="read" fallback={null}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl hidden md:flex hover:bg-muted/50 transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                      <span className="sr-only">Settings</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-96 p-0 border-0 shadow-lg">
                    <div className="p-4 border-b bg-muted/30">
                      <h3 className="font-semibold text-base">System Settings</h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                          onClick={() => router.push('/settings/whatsapp-profile')}
                        >
                          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 p-3 rounded-xl group-hover:from-green-500/30 group-hover:to-green-600/20 transition-colors">
                            <MessageCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <span className="text-xs font-medium text-center">WhatsApp Profile</span>
                        </button>

                        <PermissionCheck resource="settings" action="manage" fallback={null}>
                          <button
                            className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                            onClick={() => router.push('/settings/developer')}
                          >
                            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-3 rounded-xl group-hover:from-blue-500/30 group-hover:to-blue-600/20 transition-colors">
                              <Code2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-xs font-medium text-center">Developer</span>
                          </button>
                        </PermissionCheck>

                        <PermissionCheck resource="settings" action="manage" fallback={null}>
                          <button
                            className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                            onClick={() => router.push('/settings/agents')}
                          >
                            <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 p-3 rounded-xl group-hover:from-indigo-500/30 group-hover:to-indigo-600/20 transition-colors">
                              <Users className="h-5 w-5 text-indigo-600" />
                            </div>
                            <span className="text-xs font-medium text-center">Team</span>
                          </button>
                        </PermissionCheck>

                        <button
                          className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                          onClick={() => router.push('/contacts')}
                        >
                          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-3 rounded-xl group-hover:from-purple-500/30 group-hover:to-purple-600/20 transition-colors">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                          <span className="text-xs font-medium text-center">Contacts</span>
                        </button>

                        <PermissionCheck resource="settings" action="manage" fallback={null}>
                          <button
                            className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                            onClick={() => router.push('/settings/roles')}
                          >
                            <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 p-3 rounded-xl group-hover:from-red-500/30 group-hover:to-red-600/20 transition-colors">
                              <Shield className="h-5 w-5 text-red-600" />
                            </div>
                            <span className="text-xs font-medium text-center">Roles</span>
                          </button>
                        </PermissionCheck>

                        <button
                          className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                          onClick={() => router.push('/settings/contacts')}
                        >
                          <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/10 p-3 rounded-xl group-hover:from-teal-500/30 group-hover:to-teal-600/20 transition-colors">
                            <Tags className="h-5 w-5 text-teal-600" />
                          </div>
                          <span className="text-xs font-medium text-center">Tags</span>
                        </button>

                        <PermissionCheck resource="settings" action="manage" fallback={null}>
                          <button
                            className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                            onClick={() => router.push('/wallet/plans')}
                          >
                            <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 p-3 rounded-xl group-hover:from-pink-500/30 group-hover:to-pink-600/20 transition-colors">
                              <CreditCard className="h-5 w-5 text-pink-600" />
                            </div>
                            <span className="text-xs font-medium text-center">Billing</span>
                          </button>
                        </PermissionCheck>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </PermissionCheck>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 rounded-xl px-3 md:flex md:items-center md:gap-3 hover:bg-muted/50 transition-colors">
                    <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                        {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold leading-none">{user.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                          {user.role === 'owner' ? 'Owner' : user.role === 'admin' ? 'Admin' : 'Agent'}
                        </Badge>
                      </div>
                    </div>
                    <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-0 border-0 shadow-lg">
                  <div className="p-3 border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                          {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => router.push('/settings/account')}>
                      <User className="mr-3 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <PermissionCheck resource="settings" action="read" fallback={null}>
                      <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => router.push('/settings/whatsapp-profile')}>
                        <Settings className="mr-3 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </PermissionCheck>
                    <PermissionCheck resource="settings" action="read" fallback={null}>
                      <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => router.push('/wallet/plans')}>
                        <CreditCard className="mr-3 h-4 w-4" />
                        <span>Billing</span>
                      </DropdownMenuItem>
                    </PermissionCheck>
                  </div>
                  <div className="p-2 border-t">
                    <DropdownMenuItem
                      className="rounded-lg cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 wark:hover:bg-red-950/50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Command palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <div className="border-b px-4 py-3">
          <CommandInput placeholder="Type a command or search..." className="border-none shadow-none focus:ring-0" />
        </div>
        <CommandList className="max-h-96">
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center py-8">
              <Search className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No results found</p>
            </div>
          </CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <PermissionCheck resource="conversations" action="write" fallback={null}>
              <CommandItem onSelect={() => router.push('/conversations')} className="cursor-pointer">
                <MessageSquare className="mr-3 h-4 w-4" />
                <span>New conversation</span>
              </CommandItem>
            </PermissionCheck>
            <PermissionCheck resource="contacts" action="write" fallback={null}>
              <CommandItem onSelect={() => router.push('/contacts')} className="cursor-pointer">
                <User className="mr-3 h-4 w-4" />
                <span>Add contact</span>
              </CommandItem>
            </PermissionCheck>
            <CommandItem className="cursor-pointer">
              <File className="mr-3 h-4 w-4" />
              <span>New Template</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            <PermissionCheck resource="dashboard" action="read" fallback={null}>
              <CommandItem onSelect={() => router.push('/dashboard')} className="cursor-pointer">
                <LayoutDashboard className="mr-3 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
            </PermissionCheck>
            <PermissionCheck resource="conversations" action="read" fallback={null}>
              <CommandItem onSelect={() => router.push('/conversations')} className="cursor-pointer">
                <MessageSquare className="mr-3 h-4 w-4" />
                <span>Conversations</span>
              </CommandItem>
            </PermissionCheck>
            <PermissionCheck resource="contacts" action="read" fallback={null}>
              <CommandItem onSelect={() => router.push('/contacts')} className="cursor-pointer">
                <User className="mr-3 h-4 w-4" />
                <span>Contacts</span>
              </CommandItem>
            </PermissionCheck>
            <PermissionCheck resource="settings" action="read" fallback={null}>
              <CommandItem onSelect={() => router.push('/settings/account')} className="cursor-pointer">
                <Settings className="mr-3 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            </PermissionCheck>
          </CommandGroup>
          {Array.isArray(user.wabaAccounts) && user.wabaAccounts.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="WhatsApp Business Accounts">
                {user.wabaAccounts.map((account, i) => (
                  <CommandItem key={i} onSelect={() => router.push(`/settings/whatsapp-profile`)} className="cursor-pointer">
                    <FaWhatsapp className="mr-3 h-4 w-4" />
                    <span>{account.name || `WhatsApp Profile ${i + 1}`}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}