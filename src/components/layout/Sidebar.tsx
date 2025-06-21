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
  HomeIcon
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

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    wabaAccounts?: any[];
    image?: string;
  };
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
}

export default function Sidebar({ user, isCollapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(isCollapsed || false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const hasWaba = user.wabaAccounts && user.wabaAccounts.length > 0;

  // Initialize open state based on current path
  useEffect(() => {
    // Open the menu that contains the current path
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
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} strokeWidth={1.5} />,
    },
    {
      title: "Conversations",
      href: "/conversations",
      icon: <MessageCircle size={20} strokeWidth={1.5} />,
      // badge: "5",
      wabaRequired: true,
    },
    {
      title: "Contacts",
      href: "/contacts",
      icon: <UsersRound size={20} strokeWidth={1.5} />,
      wabaRequired: true,
    },
    {
      title: "Campaigns",
      href: "/campaigns",
      icon: <Megaphone size={20} strokeWidth={1.5} />,
      wabaRequired: true,
    },
    {
      title: "Templates",
      href: "/templates",
      icon: <FileText size={20} strokeWidth={1.5} />,
      wabaRequired: true,
    },
    {
      title: "Automations",
      href: "/automations",
      icon: <Zap size={20} strokeWidth={1.5} />,
      isPro: true,
      wabaRequired: true,
    },
    {
      title: "Chatbots",
      href: "/chatbots",
      icon: <Bot size={20} strokeWidth={1.5} />,
      isPro: true,
      wabaRequired: true,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart4 size={20} strokeWidth={1.5} />,
      wabaRequired: true,
    },
    {
      title: "API Keys",
      href: "/api-keys",
      icon: <KeySquare size={20} strokeWidth={1.5} />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings size={20} strokeWidth={1.5} />,
    },
    {
      title: "Help & Support",
      href: "/support",
      icon: <LifeBuoy size={20} strokeWidth={1.5} />,
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
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col bg-background border-r border-border/30 transition-all duration-300 ease-in-out",
        collapsed ? "w-[56px]" : "w-72",
      )}
    >
      {/* Header - Redesigned for better balance */}
      <div className={cn(
        "flex items-center justify-center h-16 border-b relative border-border/30",
        !collapsed && "justify-between px-5"
      )}>
        {collapsed ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10  rounded-xl ">
              <img
                src="/tick.png"
                alt="ZapTick"
                className="h-12 mt-2"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center ">
                <img
                  src="/zaptick.png"
                  alt="ZapTick"
                  className="w-32"
                />
              </div>
            </div>
            {onCollapsedChange && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute rounded-lg right-0  text-muted-foreground hover:text-foreground"
                onClick={() => handleCollapsedChange(true)}
              >
                <Menu className="scale-125" size={25} />
              </Button>
            )}
          </>
        )}
      </div>

      {/* Expand button - Now positioned outside for cleaner look when collapsed */}
      {collapsed && onCollapsedChange && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute -right-3 top-16 h-6 w-6 rounded-full shadow-md border border-border"
          onClick={() => handleCollapsedChange(false)}
        >
          <ChevronRight size={12} />
        </Button>
      )}

      {/* {!collapsed && (
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search menu..."
              className="h-9 w-full rounded-lg pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )} */}

      {/* Menu items - Improved spacing in collapsed state */}
      <ScrollArea className={cn(
        "flex-1 px-3 py-2",
        collapsed && "px-2"
      )}>
        <div className={cn(
          "space-y-1",
          collapsed && "flex flex-col items-center space-y-3 pt-2"
        )}>
          {!hasWaba && !collapsed && (
            <div className="mb-3 rounded-lg bg-primary/10 p-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-primary mb-1">
                <Sparkles size={16} />
                <span>Get Started</span>
              </div>
              <p className="text-muted-foreground text-xs mb-2">
                Connect your WhatsApp Business account to unlock all features.
              </p>
              <Button
                size="sm"
                className="w-full h-8"
                onClick={() => router.push('/settings/waba')}
              >
                Set up WhatsApp
              </Button>
            </div>
          )}

          {filteredItems.map((item) => (
            <div key={item.title} className={cn(
              "relative",
              collapsed && "w-full mb-1"
            )}>
              {item.isPro && !collapsed && (
                <span className="absolute right-3 top-1.5 z-10">
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0 font-medium"
                  >
                    PRO
                  </Badge>
                </span>
              )}

              {item.submenu ? (
                <Collapsible
                  open={openMenus[item.title]}
                  onOpenChange={() => !collapsed && toggleMenu(item.title)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "group flex w-full items-center transition-colors",
                        collapsed ?
                          "justify-center rounded-full h-10 w-10" :
                          "rounded-lg px-3 py-2 text-sm font-medium",
                        (pathname === item.href || pathname?.startsWith(item.href + "/"))
                          ? collapsed
                            ? "bg-primary/10 text-primary"
                            : "bg-primary/10 text-primary"
                          : collapsed
                            ? "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                        item.wabaRequired && !hasWaba && "opacity-60",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      )}
                      onClick={() => handleItemClick(item)}
                    >
                      <TooltipProvider>
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <div className={cn(
                              "flex items-center",
                              !collapsed && "w-full gap-2" // Fix the gap between icon and text
                            )}>
                              <span className={cn(
                                "flex items-center justify-center",
                                collapsed ? "h-5 w-5" : "h-5 w-5" // Make icon size consistent
                              )}>
                                {item.icon}
                              </span>

                              {!collapsed && (
                                <>
                                  <span className="flex-1">{item.title}</span>
                                  {item.badge && (
                                    <Badge variant="secondary" className="mr-1 px-1.5 py-0">
                                      {item.badge}
                                    </Badge>
                                  )}
                                  <ChevronRight
                                    size={16}
                                    className={cn(
                                      "text-muted-foreground transition-transform",
                                      openMenus[item.title] && "rotate-90"
                                    )}
                                  />
                                </>
                              )}
                            </div>
                          </TooltipTrigger>
                          {collapsed && (
                            <TooltipContent side="right" sideOffset={10} className="flex items-center gap-2">
                              {item.title}
                              {item.badge && (
                                <Badge variant="secondary" className="px-1 py-0">
                                  {item.badge}
                                </Badge>
                              )}
                              {item.isPro && (
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1 py-0">PRO</Badge>
                              )}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </button>
                  </CollapsibleTrigger>

                  {!collapsed && (
                    <CollapsibleContent className="mt-1 space-y-1 animate-in slide-in-from-left-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "flex items-center rounded-lg py-2 pl-9 pr-3 text-sm transition-colors", // Reduced padding to align with icon
                            pathname === subItem.href
                              ? "bg-muted text-foreground font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                    "group flex items-center transition-colors",
                    collapsed ?
                      "justify-center rounded-full h-10 w-10" :
                      "rounded-lg px-3 py-2 text-sm font-medium",
                    pathname === item.href
                      ? collapsed
                        ? "bg-primary text-white"
                        : "bg-primary/10 text-primary"
                      : collapsed
                        ? "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                    item.wabaRequired && !hasWaba && "opacity-60"
                  )}
                  onClick={(e) => {
                    if (!handleItemClick(item)) {
                      e.preventDefault();
                    }
                  }}
                >
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          "flex items-center",
                          !collapsed && "w-full gap-2" // Fix the gap between icon and text
                        )}>
                          <span className={cn(
                            "flex items-center justify-center",
                            collapsed ? "h-5 w-5" : "h-5 w-5" // Make icon size consistent
                          )}>
                            {item.icon}
                          </span>

                          {!collapsed && (
                            <>
                              <span className="flex-1">{item.title}</span>
                              {item.badge && (
                                <Badge variant="secondary" className="px-1.5 py-0">
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right" sideOffset={10} className="flex items-center gap-2">
                          {item.title}
                          {item.badge && (
                            <Badge variant="secondary" className="px-1 py-0">
                              {item.badge}
                            </Badge>
                          )}
                          {item.isPro && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1 py-0">PRO</Badge>
                          )}
                          {item.wabaRequired && !hasWaba && (
                            <span className="text-xs text-muted-foreground">Requires WhatsApp</span>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </Link>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>


      {/* User area - Simplified for collapsed state */}
      {/* <div className={cn(
        "mt-auto py-3",
        collapsed ? "px-0" : "px-3"
      )}>
        <Separator className="mb-3" />

        {user && (
          <div className="space-y-2">
            <div className={cn(
              "flex items-center transition-colors rounded-lg",
              collapsed ? "justify-center px-0" : "gap-3 p-2 text-sm"
            )}>
              <Avatar className={cn(
                "border border-border",
                collapsed ? "h-9 w-9" : "h-8 w-8"
              )}>
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {user.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              {!collapsed && (
                <>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-medium leading-none mb-1">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => router.push('/settings/account')}
                  >
                    <Settings size={14} className="text-muted-foreground" />
                  </Button>
                </>
              )}
            </div>

            {!collapsed && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 h-8 text-muted-foreground"
                onClick={handleSignOut}
              >
                <LogOut size={14} />
                <span>Sign out</span>
              </Button>
            )}

            {collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="mt-2 w-10 h-10 rounded-full text-muted-foreground hover:text-destructive hover:bg-muted/70"
                onClick={handleSignOut}
              >
                <LogOut size={15} />
              </Button>
            )}
          </div>
        )}
      </div> */}
    </aside>
  );
}
