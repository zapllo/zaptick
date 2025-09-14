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
  File,
  ImageIcon,
  Video,
  FileText,
  Bot,
  Zap,
  BarChart3,
  Calendar,
  Clock,
  Globe,
  Hash,
  History,
  Inbox,
  Mail,
  Phone,
  PlayCircle,
  Send,
  Star,
  Target,
  Trash2,
  Upload,
  Workflow,
  BookOpen,
  FileSpreadsheet,
  Headphones,
  Building,
  ChevronRight,
  Command,
  Filter
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
import { format } from "date-fns";

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
  subscription?: {
    plan: string;
    status: 'active' | 'expired' | 'cancelled';
    endDate?: string;
  };
}

interface UserPermissions {
  role: 'admin' | 'agent';
  permissions: {
    resource: string;
    actions: string[];
  }[];
}

interface UnreadMessage {
  id: string;
  conversationId: string;
  contactName: string;
  content: string;
  timestamp: string;
  messageType: string;
  contactId: string;
}

// Update the command items to only include existing pages
const commandItems = [
  // Quick Actions
  {
    group: 'Quick Actions',
    items: [
      {
        icon: MessageSquare,
        label: 'New Conversation',
        description: 'Start a new WhatsApp conversation',
        path: '/conversations',
        shortcut: 'C',
        keywords: ['chat', 'message', 'talk', 'conversation', 'whatsapp', 'new chat']
      },
      {
        icon: User,
        label: 'Add Contact',
        description: 'Create a new contact',
        path: '/contacts',
        shortcut: 'N',
        keywords: ['contact', 'person', 'customer', 'client', 'add', 'new contact']
      },
      {
        icon: FileText,
        label: 'Create Template',
        description: 'Design a new message template',
        path: '/templates',
        shortcut: 'T',
        keywords: ['template', 'message', 'create', 'design', 'new template', 'message template', 'whatsapp template']
      },
      {
        icon: Bot,
        label: 'New Workflow',
        description: 'Build an automation workflow',
        path: '/automations/workflows',
        shortcut: 'W',
        keywords: ['workflow', 'automation', 'bot', 'flow', 'new workflow']
      },
      {
        icon: Upload,
        label: 'Broadcast Message',
        description: 'Send message to multiple contacts',
        path: '/broadcast',
        shortcut: 'B',
        keywords: ['broadcast', 'bulk', 'mass', 'multiple', 'send', 'campaign']
      }
    ]
  },
  // Navigation
  {
    group: 'Navigation',
    items: [
      {
        icon: LayoutDashboard,
        label: 'Dashboard',
        description: 'Analytics and overview',
        path: '/dashboard',
        keywords: ['dashboard', 'home', 'overview', 'analytics', 'stats', 'main']
      },
      {
        icon: MessageSquare,
        label: 'Conversations',
        description: 'WhatsApp conversations',
        path: '/conversations',
        keywords: ['conversations', 'chats', 'messages', 'inbox', 'whatsapp']
      },
      {
        icon: Users,
        label: 'Contacts',
        description: 'Manage your contacts',
        path: '/contacts',
        keywords: ['contacts', 'customers', 'people', 'directory', 'clients']
      },
      {
        icon: FileText,
        label: 'Templates',
        description: 'Message templates library',
        path: '/templates',
        keywords: ['templates', 'messages', 'saved', 'library', 'message templates', 'whatsapp templates', 'template manager']
      },
      {
        icon: Upload,
        label: 'Broadcast',
        description: 'Bulk messaging campaigns',
        path: '/broadcast',
        keywords: ['broadcast', 'bulk', 'campaigns', 'mass messaging', 'bulk send']
      },
      {
        icon: BarChart3,
        label: 'Analytics',
        description: 'Performance metrics and reports',
        path: '/analytics',
        keywords: ['analytics', 'metrics', 'reports', 'statistics', 'performance', 'insights']
      }
    ]
  },
  // Automations
  {
    group: 'Automations',
    items: [
      {
        icon: Bot,
        label: 'Workflows',
        description: 'Automation workflows',
        path: '/automations/workflows',
        keywords: ['workflows', 'automation', 'bots', 'flows', 'automated responses']
      },
      {
        icon: Zap,
        label: 'Chatbots',
        description: 'AI-powered chatbots',
        path: '/automations/chatbots',
        keywords: ['chatbots', 'ai', 'automation', 'bots', 'artificial intelligence']
      }
    ]
  },
  // Settings & Management
  {
    group: 'Settings & Management',
    items: [
      {
        icon: User,
        label: 'Account Settings',
        description: 'Personal account settings',
        path: '/settings/account',
        keywords: ['account', 'profile', 'personal', 'settings', 'user settings']
      },
      {
        icon: MessageCircle,
        label: 'WhatsApp Profile',
        description: 'Business profile settings',
        path: '/settings/whatsapp-profile',
        keywords: ['whatsapp', 'profile', 'business', 'settings', 'business profile']
      },
      {
        icon: Users,
        label: 'Team Management',
        description: 'Manage team members',
        path: '/settings/agents',
        keywords: ['team', 'agents', 'members', 'users', 'staff', 'employees']
      },
      {
        icon: Shield,
        label: 'Roles & Permissions',
        description: 'Access control settings',
        path: '/settings/roles',
        keywords: ['roles', 'permissions', 'access', 'security', 'user roles']
      },
      {
        icon: Code2,
        label: 'Developer Settings',
        description: 'API and webhook settings',
        path: '/settings/developer',
        keywords: ['developer', 'api', 'webhook', 'integration', 'dev settings']
      },
      {
        icon: Tags,
        label: 'Contact Fields',
        description: 'Custom contact fields',
        path: '/settings/contacts',
        keywords: ['custom fields', 'contacts', 'fields', 'tags', 'contact fields']
      }
    ]
  },
  // Billing & Account
  {
    group: 'Billing & Account',
    items: [
      {
        icon: Wallet,
        label: 'Wallet',
        description: 'Account balance and credits',
        path: '/wallet',
        keywords: ['wallet', 'balance', 'credits', 'money', 'funds']
      },
      {
        icon: CreditCard,
        label: 'Billing Plans',
        description: 'Subscription and pricing',
        path: '/wallet/plans',
        keywords: ['billing', 'plans', 'subscription', 'pricing', 'upgrade', 'payment']
      },
      {
        icon: History,
        label: 'Transaction History',
        description: 'Payment history',
        path: '/wallet/transactions',
        keywords: ['transactions', 'history', 'payments', 'billing', 'payment history']
      }
    ]
  }
];

export default function Layout({ children }: LayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [commandQuery, setCommandQuery] = useState('');
  const [recentCommands, setRecentCommands] = useState<string[]>([]);

  const pathname = usePathname();
  const router = useRouter();

  const [unreadMessages, setUnreadMessages] = useState<UnreadMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [walletData, setWalletData] = useState({
    balance: 0,
    formattedBalance: "₹ 0.00",
    recentChange: 0,
    isLoading: true
  });

  // Helper function to check if user has permission
  const hasPermission = (resource: string, action: string = 'read') => {
    if (!userPermissions) return false;
    if (userPermissions.role === 'admin') return true;
    const permission = userPermissions.permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action) : false;
  };

  // Filter command items based on permissions and search query
  const getFilteredCommands = () => {
    return commandItems.map(group => ({
      ...group,
      items: group.items.filter(item => {
        // Check permissions
        if (item.resource && item.action) {
          return false;
        }

        // Check search query
        if (commandQuery.trim()) {
          const query = commandQuery.toLowerCase();
          const matchesLabel = item.label.toLowerCase().includes(query);
          const matchesDescription = item.description?.toLowerCase().includes(query);
          const matchesKeywords = item.keywords?.some(keyword =>
            keyword.toLowerCase().includes(query)
          );
          return matchesLabel || matchesDescription || matchesKeywords;
        }

        return true;
      })
    })).filter(group => group.items.length > 0);
  };



  // Handle command selection
  const handleCommandSelect = (item: any) => {
    if (item.path) {
      router.push(item.path);

      // Add to recent commands
      const newRecent = [item.label, ...recentCommands.filter(cmd => cmd !== item.label)].slice(0, 5);
      setRecentCommands(newRecent);
      localStorage.setItem('recentCommands', JSON.stringify(newRecent));
    }
    setCommandOpen(false);
    setCommandQuery('');
  };

  // Load recent commands from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentCommands');
    if (saved) {
      try {
        setRecentCommands(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent commands:', error);
      }
    }
  }, []);

  // Add this temporarily to debug the search
  useEffect(() => {
    if (commandQuery.trim()) {
      console.log('Search query:', commandQuery);
      const filtered = getFilteredCommands();
      console.log('Filtered results:', filtered);

      // Check specifically for template matches
      const templateMatches = commandItems.flatMap(group =>
        group.items.filter(item => {
          const query = commandQuery.toLowerCase().trim();
          const matchesLabel = item.label.toLowerCase().includes(query);
          const matchesDescription = item.description?.toLowerCase().includes(query);
          const matchesKeywords = item.keywords?.some(keyword =>
            keyword.toLowerCase().includes(query)
          );
          return matchesLabel || matchesDescription || matchesKeywords;
        })
      );
      console.log('Template matches:', templateMatches);
    }
  }, [commandQuery]);

  // Get recent command items
  const getRecentCommandItems = () => {
    return recentCommands.map(label => {
      for (const group of commandItems) {
        const item = group.items.find(i => i.label === label);
        if (item) return item;
      }
      return null;
    }).filter(Boolean);
  };



  // Add function to fetch unread messages
  const fetchUnreadMessages = async () => {
    try {
      const response = await fetch('/api/messages/unread');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadMessages(data.messages);
          setUnreadCount(data.totalCount);
        }
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  // Fetch unread messages when user is loaded
  useEffect(() => {
    if (user) {
      fetchUnreadMessages();
      // Set up polling for real-time updates
      const interval = setInterval(fetchUnreadMessages, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  // Function to mark message as read
  const markMessageAsRead = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/mark-read`, {
        method: 'POST'
      });

      if (response.ok) {
        // Remove read messages from unread list
        setUnreadMessages(prev => prev.filter(msg => msg.conversationId !== conversationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Function to navigate to conversation
  const goToConversation = (conversationId: string, contactId: string) => {
    markMessageAsRead(conversationId);
    router.push(`/conversations?contactId=${contactId}`);
  };

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

            {/* Enhanced Command palette button */}
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex items-center w-[380px] h-11 gap-3 pl-4 pr-3 text-muted-foreground border-muted/40 hover:border-primary/30 transition-all duration-200 bg-gradient-to-r from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 backdrop-blur-sm shadow-sm hover:shadow-md"
              onClick={() => setCommandOpen(true)}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Search className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium">Search commands, pages & features...</span>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-background/80 px-2 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
                  <Command className="h-3 w-3" />K
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
              <Button
                variant="ghost"
                className="relative h-10 rounded-xl hover:bg-transparent  hidden lg:flex items-center  "
                onClick={() => router.push('/wallet')}
              >
                <div className="flex items-center gap-3 rounded-xl hover:bg-muted/90 p-2 border">
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


              {/* Updated Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-muted/50 transition-colors">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-[11px] animate-pulse text-white flex items-center justify-center font-semibold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0 border-0 shadow-lg">
                  <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-base">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2 hover:bg-background"
                          onClick={() => {
                            // Mark all as read
                            setUnreadMessages([]);
                            setUnreadCount(0);
                            // You might want to call an API endpoint to mark all as read
                          }}
                        >
                          Mark all read
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {unreadMessages.length > 0 ? (
                      <div className="divide-y divide-border/30">
                        {unreadMessages.slice(0, 10).map((message) => (
                          <div
                            key={message.id}
                            className="p-4 hover:bg-muted/50 cursor-pointer transition-colors group"
                            onClick={() => goToConversation(message.conversationId, message.contactId)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                  {message.messageType === 'text' ? (
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                  ) : message.messageType === 'image' ? (
                                    <ImageIcon className="h-5 w-5 text-blue-600" />
                                  ) : message.messageType === 'video' ? (
                                    <Video className="h-5 w-5 text-purple-600" />
                                  ) : message.messageType === 'document' ? (
                                    <FileText className="h-5 w-5 text-orange-600" />
                                  ) : (
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-medium text-sm text-foreground truncate">
                                    {message.contactName}
                                  </p>
                                  <span className="text-xs text-muted-foreground flex-shrink-0">
                                    {format(new Date(message.timestamp), "h:mm a")}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {message.messageType === 'text' ? message.content :
                                    message.messageType === 'image' ? '📷 Photo' :
                                      message.messageType === 'video' ? '🎥 Video' :
                                        message.messageType === 'document' ? '📄 Document' :
                                          message.messageType === 'audio' ? '🎵 Audio' :
                                            message.content}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                <div className="w-2 h-2 rounded-full bg-primary group-hover:bg-primary/80 transition-colors"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {unreadMessages.length > 10 && (
                          <div className="p-3 text-center border-t bg-muted/30">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-sm font-medium hover:bg-background"
                              onClick={() => router.push('/conversations')}
                            >
                              View {unreadMessages.length - 10} more messages
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                          <Bell className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">All caught up!</p>
                        <p className="text-xs text-muted-foreground">No new messages</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t bg-muted/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-8 text-sm font-medium hover:bg-background"
                      onClick={() => router.push('/conversations')}
                    >
                      View all conversations
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Settings Dropdown */}
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

                      <button
                        className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                        onClick={() => router.push('/settings/developer')}
                      >
                        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-3 rounded-xl group-hover:from-blue-500/30 group-hover:to-blue-600/20 transition-colors">
                          <Code2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-center">Developer</span>
                      </button>

                      <button
                        className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                        onClick={() => router.push('/settings/agents')}
                      >
                        <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 p-3 rounded-xl group-hover:from-indigo-500/30 group-hover:to-indigo-600/20 transition-colors">
                          <Users className="h-5 w-5 text-indigo-600" />
                        </div>
                        <span className="text-xs font-medium text-center">Team</span>
                      </button>


                      <button
                        className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                        onClick={() => router.push('/contacts')}
                      >
                        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-3 rounded-xl group-hover:from-purple-500/30 group-hover:to-purple-600/20 transition-colors">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-xs font-medium text-center">Contacts</span>
                      </button>

                      <button
                        className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                        onClick={() => router.push('/settings/roles')}
                      >
                        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 p-3 rounded-xl group-hover:from-red-500/30 group-hover:to-red-600/20 transition-colors">
                          <Shield className="h-5 w-5 text-red-600" />
                        </div>
                        <span className="text-xs font-medium text-center">Roles</span>
                      </button>

                      <button
                        className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                        onClick={() => router.push('/settings/contacts')}
                      >
                        <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/10 p-3 rounded-xl group-hover:from-teal-500/30 group-hover:to-teal-600/20 transition-colors">
                          <Tags className="h-5 w-5 text-teal-600" />
                        </div>
                        <span className="text-xs font-medium text-center">Custom Fields</span>
                      </button>

                      <button
                        className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                        onClick={() => router.push('/wallet/plans')}
                      >
                        <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 p-3 rounded-xl group-hover:from-pink-500/30 group-hover:to-pink-600/20 transition-colors">
                          <CreditCard className="h-5 w-5 text-pink-600" />
                        </div>
                        <span className="text-xs font-medium text-center">Billing</span>
                      </button>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>


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
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold leading-none">{user.name}</p>
                        {/* {user.subscription && user.subscription.plan !== 'free' && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-medium",
                              user.subscription.status === 'active'
                                ? user.subscription.plan === 'starter'
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : user.subscription.plan === 'pro'
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-gray-50 text-gray-600 border-gray-200"
                            )}
                          >
                            {user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)}
                          </Badge>
                        )} */}
                      </div>
                      {user.subscription && user.subscription.status !== 'active' && (
                        <p className="text-xs text-orange-600">Plan Expired</p>
                      )}
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
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        {user.subscription && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                user.subscription.status === 'active'
                                  ? user.subscription.plan === 'starter'
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : user.subscription.plan === 'pro'
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-gray-50 text-gray-600 border-gray-200"
                              )}
                            >
                              {user.subscription.plan === 'free' ? 'Free Plan' :
                               `${user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)} Plan`}
                            </Badge>
                            {user.subscription.status !== 'active' && (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                                Expired
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* <div className="p-3 border-b bg-muted/30">
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
                  </div> */}
                  <div className="p-2">
                    <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => router.push('/settings/account')}>
                      <User className="mr-3 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => router.push('/settings/whatsapp-profile')}>
                      <Settings className="mr-3 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => router.push('/wallet/plans')}>
                      <CreditCard className="mr-3 h-4 w-4" />
                      <span>Billing</span>
                    </DropdownMenuItem>

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

      {/* Enhanced Command palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <div className="border-b px-4 py-4 bg-gradient-to-r from-background to-muted/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Command className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Command Palette</h3>
              <p className="text-sm text-muted-foreground">Navigate anywhere, execute any action</p>
            </div>
          </div>
          <CommandInput
            placeholder="Type a command, search pages, or find features..."
            className="border-none shadow-none focus:ring-0 bg-background/50 text-base h-12 rounded-xl"
            value={commandQuery}
            onValueChange={setCommandQuery}
          />
        </div>

        <CommandList className="max-h-[70vh] overflow-y-auto">
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No results found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Try searching for pages, features, or actions. Use keywords like &quot;template&quot;, &quot;chat&quot;, &quot;analytics&quot;, etc.
              </p>
            </div>
          </CommandEmpty>

          {/* Recent Commands (only show when no search query) */}
          {!commandQuery.trim() && recentCommands.length > 0 && (
            <>
              <CommandGroup heading="Recent">
                {getRecentCommandItems().slice(0, 5).map((item, index) => (
                  <CommandItem
                    key={`recent-${index}`}
                    onSelect={() => handleCommandSelect(item)}
                    className="cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-muted/50 rounded-lg mx-2 mb-1"
                  >
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {item.shortcut && (
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                          {item.shortcut}
                        </kbd>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator className="mx-4" />
            </>
          )}

          {/* Filtered Command Groups */}
          {getFilteredCommands().map((group, groupIndex) => (
            <div key={group.group}>
              <CommandGroup
                heading={
                  <div className="flex items-center gap-2 py-2">
                    <Filter className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{group.group}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {group.items.length}
                    </Badge>
                  </div>
                }
              >
                {group.items.map((item, itemIndex) => (
                  <CommandItem
                    key={`${group.group}-${itemIndex}`}
                    onSelect={() => handleCommandSelect(item)}
                    className="cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-muted/50 rounded-lg mx-2 mb-1 transition-colors"
                  >
                    <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/10 to-primary/5">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {item.label}
                        {item.resource && !hasPermission(item.resource, item.action) && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            Limited Access
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {item.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.shortcut && (
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                          {item.shortcut}
                        </kbd>
                      )}
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              {groupIndex < getFilteredCommands().length - 1 && (
                <CommandSeparator className="mx-4 my-2" />
              )}
            </div>
          ))}

          {/* WhatsApp Business Accounts */}
          {Array.isArray(user.wabaAccounts) && user.wabaAccounts.length > 0 && !commandQuery.trim() && (
            <>
              <CommandSeparator className="mx-4 my-2" />
              <CommandGroup
                heading={
                  <div className="flex items-center gap-2 py-2">
                    <FaWhatsapp className="h-3 w-3 text-green-600" />
                    <span className="font-medium">WhatsApp Business Accounts</span>
                    <Badge variant="outline" className="ml-auto text-xs bg-green-50 text-green-700 border-green-200">
                      {user.wabaAccounts.length}
                    </Badge>
                  </div>
                }
              >
                {user.wabaAccounts.map((account, i) => (
                  <CommandItem
                    key={i}
                    onSelect={() => router.push(`/settings/whatsapp-profile`)}
                    className="cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-muted/50 rounded-lg mx-2 mb-1"
                  >
                    <div className="p-1.5 rounded-md bg-green-100">
                      <FaWhatsapp className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {account.name || `WhatsApp Profile ${i + 1}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Business account settings
                      </div>
                    </div>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>

        {/* Command Palette Footer */}
        <div className="border-t bg-muted/30 px-4 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
                  ↑↓
                </kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
                  ↵
                </kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
                  esc
                </kbd>
                <span>Close</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              <span>ZapTick Command Palette</span>
            </div>
          </div>
        </div>
      </CommandDialog>
    </div>
  );
}
