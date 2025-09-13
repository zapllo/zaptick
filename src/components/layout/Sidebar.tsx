"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageCircle,
  UsersRound,
  BarChart4,
  Settings,
  BrainCircuit,
  Zap,
  FileText,
  Tag,
  KeySquare,
  LifeBuoy,
  ChevronRight,
  Search,
  LogOut,
  CircleUserRound,
  CreditCard,
  Sparkles,
  Menu,
  Megaphone,
  Bot,
  HomeIcon,
  ChevronLeft,
  Wallet,
  Shield,
  Crown,
  Users,
  Star,
  Workflow,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { FaWhatsapp } from "react-icons/fa";

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'agent' | 'owner';
    wabaAccounts?: any[];
    image?: string;
  };
  userPermissions?: {
    role: 'admin' | 'agent' | 'owner';
    permissions: {
      resource: string;
      actions: string[];
    }[];
  } | null;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  submenu?: Array<{
    title: string;
    href: string;
  }>;
  badge?: string;
  isPro?: boolean;
  wabaRequired?: boolean;
  description?: string;
}

export default function Sidebar({ user, userPermissions, isCollapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(isCollapsed || true);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const hasWaba = user.wabaAccounts && user.wabaAccounts.length > 0;

  // Initialize open state based on current path
  useEffect(() => {
    if (pathname) {
      const menuToOpen = sidebarItems.find(item =>
        item.submenu?.some(subItem => subItem.href === pathname) ||
        (pathname.startsWith(item.href) && item.href !== "/dashboard")
      );

      if (menuToOpen?.submenu) {
        setOpenMenus(prev => ({
          ...prev,
          [menuToOpen.title]: true
        }));
      }
    }
  }, [pathname]);

  // Sync with parent component
  useEffect(() => {
    if (isCollapsed !== undefined && collapsed !== isCollapsed) {
      setCollapsed(isCollapsed);
    }
  }, [isCollapsed]);

  // Notify parent component when collapsed state changes
  const handleCollapsedChange = (newCollapsed: boolean) => {
    setCollapsed(newCollapsed);
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed);
    }
  };

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

  const sidebarItems: SidebarItem[] = [
    {
      title: "Home",
      href: "/home",
      icon: <HomeIcon size={20} strokeWidth={1.5} />,
      description: "Your personal dashboard"
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} strokeWidth={1.5} />,
      description: "Analytics and overview"
    },
    {
      title: "Conversations",
      href: "/conversations",
      icon: <MessageCircle size={20} strokeWidth={1.5} />,
      // badge: "5",
      wabaRequired: true,
      description: "Chat with your customers"
    },
    {
      title: "Contacts",
      href: "/contacts",
      icon: <UsersRound size={20} strokeWidth={1.5} />,
      wabaRequired: true,
      description: "Manage your contacts"
    },
    {
      title: "Broadcast Groups",
      href: "/contact-groups",
      icon: <Megaphone size={20} strokeWidth={1.5} />,
      wabaRequired: true,
      description: "Manage your broadcast groups"
    },
    {
      title: "Campaigns",
      href: "/campaigns",
      icon: <Target size={20} strokeWidth={1.5} />,
      wabaRequired: true,
      description: "Broadcast campaigns"
    },
    {
      title: "Templates",
      href: "/templates",
      icon: <FileText size={20} strokeWidth={1.5} />,
      wabaRequired: true,
      description: "Message templates"
    },
    {
      title: "Automations",
      href: "/automations",
      icon: <Zap size={20} strokeWidth={1.5} />,
      isPro: true,
      wabaRequired: true,
      description: "Automated workflows"
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart4 size={20} strokeWidth={1.5} />,
      wabaRequired: true,
      description: "Performance insights"
    },
    // {
    //   title: "API Keys",
    //   href: "/api-keys",
    //   icon: <KeySquare size={20} strokeWidth={1.5} />,
    //   description: "Developer access"
    // },
    {
      title: "Integrations",
      href: "/integrations",
      icon: <Workflow size={20} strokeWidth={1.5} />,
      description: "Explore all the integrations"
    },
    {
      title: "Help & Support",
      href: "/support",
      icon: <LifeBuoy size={20} strokeWidth={1.5} />,
      description: "Get help and support"
    },
  ];

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Filter sidebar items based on search query and WABA status
  const filteredItems = sidebarItems
    .filter(item => !item.wabaRequired || hasWaba)
    .filter(item =>
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submenu?.some(subItem =>
        subItem.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

  const handleItemClick = (item: SidebarItem) => {
    if (item.wabaRequired && !hasWaba) {
      router.push('/settings/waba');
      toast({
        title: "WhatsApp Business Account Required",
        description: "Please set up your WhatsApp Business account first.",
        variant: "default"
      });
      return false;
    }
    return true;
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-screen flex-col bg-background/95 backdrop-blur-xl border-r transition-all duration-300 ease-in-out",
          collapsed ? "w-[75px]" : "w-[280px]",
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center h-[65px] border- px-4 relative",
          collapsed && "justify-center px-2"
        )}>
          {collapsed ? (
            <div className="flex mt-2 items-center justify-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20">
                <img
                  src="/tick.png"
                  alt="ZapTick"
                  className="h-16  w-16  object-contain"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="">
                  <img
                    src="/zaptick.png"
                    alt="ZapTick"
                    className="object-contain -ml-2 w-fit p-6"
                  />
                </div>
                <div>
                  {/* <h1 className="font-bold text-xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                    ZapTick
                  </h1> */}
                  {/* <p className="text-xs text-muted-foreground">WhatsApp Business</p> */}
                </div>
              </div>
              {onCollapsedChange && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="border-2 border-primary ed-500 top-[68px] h-8 w-8 rounded-full shadow-lg  bg-background hover:bg-muted/50 transition-colors z-50"
                  onClick={() => handleCollapsedChange(true)}
                >
                  <ChevronLeft size={16} />
                </Button>
              )}
            </>
          )}
        </div>

        {/* Expand button */}
        {collapsed && onCollapsedChange && (
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-4  border-2 border-primary ed-500 top-[68px] h-7 w-7 rounded-full shadow-lg  bg-background hover:bg-muted/50 transition-colors z-50"
            onClick={() => handleCollapsedChange(false)}
          >
            <ChevronRight size={14} />
          </Button>
        )}

        {/* Search
        {!collapsed && (
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search menu..."
                className="h-10 pl-9 bg-muted/50 border-muted/50 focus:border-primary/50 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )} */}

        {/* Menu items */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className={cn(
            "space-y-2",
            collapsed && "flex flex-col items-center space-y-3"
          )}>
            {!hasWaba && !collapsed && (
              <div className="mb-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 border border-primary/20">
                <div className="flex items-center gap-2 font-semibold text-primary mb-2">
                  <Sparkles size={16} />
                  <span>Get Started</span>
                </div>
                <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                  Connect your WhatsApp Business account to unlock all features and start engaging with customers.
                </p>
                <Button
                  size="sm"
                  className="w-full h-9 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-200"
                  onClick={() => router.push('/dashboard#waba-section')}
                >
                  <FaWhatsapp className="m h-4 w-4" />
                  Connect WhatsApp
                </Button>
              </div>
            )}

            {filteredItems.map((item) => (
              <div key={item.title} className="relative">
                {item.submenu ? (
                  <Collapsible
                    open={openMenus[item.title]}
                    onOpenChange={() => !collapsed && toggleMenu(item.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "group flex w-full items-center transition-all duration-200",
                          collapsed
                            ? "justify-center h-12 w-12 rounded-xl mx-auto"
                            : "rounded-xl px-4 py-3 text-sm font-medium",
                          (pathname === item.href || pathname?.startsWith(item.href + "/"))
                            ? collapsed
                              ? "bg-gradient-to-br from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
                              : "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20"
                            : collapsed
                              ? "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                          item.wabaRequired && !hasWaba && "opacity-60",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        )}
                        onClick={() => handleItemClick(item)}
                      >
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <div className={cn(
                              "flex items-center",
                              !collapsed && "w-full gap-3"
                            )}>
                              <span className="flex items-center justify-center">
                                {item.icon}
                              </span>

                              {!collapsed && (
                                <>
                                  <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2">
                                      <span>{item.title}</span>
                                      {item.isPro && (
                                        <Badge
                                          variant="outline"
                                          className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 border-amber-500/30 text-[10px] px-2 py-0 font-semibold"
                                        >
                                          <Crown className="mr-1 h-3 w-3" />
                                          PRO
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {item.badge && (
                                    <Badge className="bg-primary/10 text-primary border-primary/20 px-2 py-0">
                                      {item.badge}
                                    </Badge>
                                  )}
                                  <ChevronRight
                                    size={16}
                                    className={cn(
                                      "text-muted-foreground transition-transform duration-200",
                                      openMenus[item.title] && "rotate-90"
                                    )}
                                  />
                                </>
                              )}
                            </div>
                          </TooltipTrigger>
                          {collapsed && (
                            <TooltipContent side="right" sideOffset={15} className="max-w-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 font-medium">
                                  {item.title}
                                  {item.isPro && (
                                    <Badge variant="outline" className="bg-amber-500/20 text-amber-700 border-amber-500/30 text-[10px] px-1 py-0">
                                      <Crown className="mr-1 h-3 w-3" />
                                      PRO
                                    </Badge>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                )}
                                {item.wabaRequired && !hasWaba && (
                                  <p className="text-xs text-orange-500">Requires WhatsApp connection</p>
                                )}
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </button>
                    </CollapsibleTrigger>

                    {!collapsed && (
                      <CollapsibleContent className="mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "flex items-center rounded-lg py-2.5 pl-12 pr-4 text-sm transition-colors",
                              pathname === subItem.href
                                ? "bg-muted/50 text-foreground font-medium"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center transition-all duration-200",
                      collapsed
                        ? "justify-center h-12 w-12 rounded-xl mx-auto"
                        : "rounded-xl px-4 py-3 text-sm font-medium",
                      pathname === item.href
                        ? collapsed
                          ? "bg-gradient-to-br from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
                          : "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20"
                        : collapsed
                          ? "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      item.wabaRequired && !hasWaba && "opacity-60"
                    )}
                    onClick={(e) => {
                      if (!handleItemClick(item)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          "flex items-center",
                          !collapsed && "w-full gap-3"
                        )}>
                          <span className="flex items-center justify-center">
                            {item.icon}
                          </span>

                          {!collapsed && (
                            <>
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2">
                                  <span>{item.title}</span>
                                  {item.isPro && (
                                    <Badge
                                      variant="outline"
                                      className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 border-amber-500/30 text-[10px] px-2 py-0 font-semibold"
                                    >
                                      <Crown className="mr-1 h-3 w-3" />
                                      PRO
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {item.badge && (
                                <Badge className="bg-primary/10 text-primary border-primary/20 px-2 py-0">
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right" sideOffset={15} className="max-w-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 font-medium">
                              {item.title}
                              {item.isPro && (
                                <Badge variant="outline" className="bg-amber-500/20 text-white -700 border-amber-500/30 text-[10px] px-1 py-0">
                                  <Crown className="mr-1 h-3 w-3" />
                                  PRO
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-gray-200 -foreground">{item.description}</p>
                            )}
                            {item.wabaRequired && !hasWaba && (
                              <p className="text-xs text-orange-500">Requires WhatsApp connection</p>
                            )}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* User section */}
        <div className={cn(
          "border-t p-4",
          collapsed && "px-2"
        )}>
          {user && (
            <div className="space-y-3">
              <div className={cn(
                "flex items-center transition-colors rounded-xl",
                collapsed ? "justify-center" : "gap-3 p-3 bg-muted/30"
              )}>
                <div className="relative">
                  <Avatar className={cn(
                    "border-2 border-background shadow-sm",
                    collapsed ? "h-10 w-10" : "h-9 w-9"
                  )}>
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                      {user.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                    user.role === 'admin'
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : "bg-gradient-to-r from-green-500 to-emerald-500"
                  )} />
                </div>

                {!collapsed && (
                  <>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="truncate font-semibold leading-none text-sm">{user.name}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0 h-5",
                            user.role === 'admin'
                              ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 border-amber-500/30"
                              : "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 border-green-500/30"
                          )}
                        >
                          {user.role === 'owner' ? (
                            <>
                              <Crown className="mr-1 h-3 w-3" />
                              Owner
                            </>
                          ) : user.role === 'admin' ? (
                            <>
                              <Star className="mr-1 h-3 w-3" />
                              Admin
                            </>
                          ) : (
                            <>
                              <Star className="mr-1 h-3 w-3" />
                              Agent
                            </>
                          )}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>

                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-background/80"
                            onClick={() => router.push('/settings/account')}
                          >
                            <Settings size={14} className="text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Settings</TooltipContent>
                      </Tooltip>
                    </div>
                  </>
                )}
              </div>

              {!collapsed && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 h-9 text-muted-foreground hover:text-red-600 hover:border-red-200 hover:bg-red-50 wark:hover:bg-red-950/50 transition-colors"
                  onClick={handleSignOut}
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </Button>
              )}

              {collapsed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-10 h-10 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50 wark:hover:bg-red-950/50 transition-colors mx-auto"
                      onClick={handleSignOut}
                    >
                      <LogOut size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Sign out</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}