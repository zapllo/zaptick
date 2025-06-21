"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Search,
  MessageSquare,
  User,
  LogOut,
  Settings,
  CreditCard,
  HelpCircle,
  X,
  MenuIcon,
  ChevronDown,
  Loader2,
  UsersRound,
  Shield,
  Tags,
  UserCog,
  Code2,
  MessageCircle,
  Wallet,
  ArrowUpRight
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

interface LayoutProps {
  children: React.ReactNode;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  wabaAccounts?: any[];
  image?: string; // Added for avatar display
}

export default function Layout({ children }: LayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  const [walletData, setWalletData] = useState({
    balance: 0,
    formattedBalance: "₹ 0.00",
    recentChange: 0,
    isLoading: true
  });

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
          // If there's an error, just set isLoading to false
          setWalletData(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        setWalletData(prev => ({ ...prev, isLoading: false }));
      }
    };

    // Only fetch if user is authenticated
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
            // Redirect to login if not authenticated
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        // Add a placeholder image if not provided from the backend
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

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Router will redirect to login
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          user={user}
          isCollapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[72px]">
          <Sidebar user={user} />
        </SheetContent>
      </Sheet>

      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        sidebarCollapsed ? "md:ml-20" : "md:ml-72"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-border/40 bg-background/95 backdrop-blur-sm px-4">
          <div className="flex flex-1 items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>

            {/* Command palette button */}
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex items-center ml-2 w-[30%] h-9 gap-2 pl-3 pr-2 text-muted-foreground"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Search...</span>
              <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            {/* Mobile search toggle */}
            {searchOpen ? (
              <div className="flex w-full items-center md:hidden">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="h-9 rounded-r-none border-r-0 focus-visible:ring-0"
                  autoFocus
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-l-none border-l-0"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 md:hidden"
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
              <span className="font-semibold text-lg">ZapTick</span>
            </div>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-1 md:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-auto rounded-full px-3 hidden md:flex items-center gap-2"
                onClick={() => router.push('/wallet')}
              >
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1.5 rounded-full">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs text-muted-foreground">Balance</span>
                    {walletData.isLoading ? (
                      <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <span className="text-sm font-medium">{walletData.formattedBalance}</span>
                    )}
                  </div>
                  {walletData.recentChange > 0 && (
                    <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +₹{walletData.recentChange.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                    <MessageSquare className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-medium">2</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Messages</span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      Mark all as read
                    </Button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {[1, 2].map((i) => (
                      <DropdownMenuItem key={i} className="p-0 focus:bg-transparent">
                        <button className="flex w-full items-start gap-3 p-3 text-left hover:bg-muted/50 rounded-md">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={`/avatars/user${i}.jpg`} />
                            <AvatarFallback>U{i}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">New message</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              You have a new message from User {i}.
                            </p>
                            <p className="text-xs text-muted-foreground">2 min ago</p>
                          </div>
                        </button>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center font-medium">
                    View all messages
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-medium">4</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      Mark all as read
                    </Button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {[1, 2, 3, 4].map((i) => (
                      <DropdownMenuItem key={i} className="p-0 focus:bg-transparent">
                        <button className="flex w-full items-start gap-3 p-3 text-left hover:bg-muted/50 rounded-md">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <Bell className="h-4 w-4 text-primary" />
                          </span>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">System Update</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              A new system update is available. Please review.
                            </p>
                            <p className="text-xs text-muted-foreground">{i}h ago</p>
                          </div>
                        </button>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center font-medium">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hidden md:flex"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>System Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="grid grid-cols-2 gap-2 p-2">
                    <DropdownMenuItem
                      className="flex flex-col h-24 items-center justify-center gap-2 rounded-md p-3 cursor-pointer"
                      onClick={() => router.push('/settings/whatsapp-profile')}
                    >
                      <div className="bg-primary/10 p-2 rounded-md">
                        <MessageCircle className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-center">WhatsApp Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex flex-col h-24 items-center justify-center gap-2 rounded-md p-3 cursor-pointer"
                      onClick={() => router.push('/settings/developer')}
                    >
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Code2 className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-center">Developer Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex flex-col h-24 items-center justify-center gap-2 rounded-md p-3 cursor-pointer"
                      onClick={() => router.push('/settings/contacts')}
                    >
                      <div className="bg-primary/10 p-2 rounded-md">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-center">Contact Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex flex-col h-24 items-center justify-center gap-2 rounded-md p-3 cursor-pointer"
                      onClick={() => router.push('/settings/agents')}
                    >
                      <div className="bg-primary/10 p-2 rounded-md">
                        <UserCog className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-center">Agent Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex flex-col h-24 items-center justify-center gap-2 rounded-md p-3 cursor-pointer"
                      onClick={() => router.push('/settings/permissions')}
                    >
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-center">Role Permissions</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex flex-col h-24 items-center justify-center gap-2 rounded-md p-3 cursor-pointer"
                      onClick={() => router.push('/settings/teams')}
                    >
                      <div className="bg-primary/10 p-2 rounded-md">
                        <UsersRound className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-center">Manage Teams</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex flex-col h-24 items-center justify-center gap-2 rounded-md p-3 cursor-pointer"
                      onClick={() => router.push('/settings/tags')}
                    >
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Tags className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-center">Manage Tags</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex flex-col h-24 items-center justify-center gap-2 rounded-md p-3 cursor-pointer"
                      onClick={() => router.push('/settings/subscription')}
                    >
                      <div className="bg-primary/10 p-2 rounded-md">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-center">Manage Subscription</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 rounded-full px-2 md:flex md:items-center md:gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">{user.email}</p>
                    </div>
                    <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/settings/account')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings/billing')}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0">
          {children}
        </main>
      </div>

      {/* Command palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => router.push('/conversations/new')}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>New conversation</span>
            </CommandItem>
            <CommandItem onSelect={() => router.push('/contacts/new')}>
              <User className="mr-2 h-4 w-4" />
              <span>Add contact</span>
            </CommandItem>
            <CommandItem>
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => router.push('/dashboard')}>
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => router.push('/conversations')}>
              <span>Conversations</span>
            </CommandItem>
            <CommandItem onSelect={() => router.push('/contacts')}>
              <span>Contacts</span>
            </CommandItem>
            <CommandItem onSelect={() => router.push('/settings')}>
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
          {Array.isArray(user.wabaAccounts) && user.wabaAccounts.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="WhatsApp Business Accounts">
                {user.wabaAccounts.map((account, i) => (
                  <CommandItem key={i} onSelect={() => router.push(`/settings/waba/${account.id}`)}>
                    <span>{account.name || `Account ${i + 1}`}</span>
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
