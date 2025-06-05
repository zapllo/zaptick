"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  Users,
  BarChart2,
  Settings,
  Megaphone,
  Bot,
  Zap,
  FileText,
  Tag,
  Key,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  ChevronRight
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

interface SidebarProps {
  user?: {
    name: string;
    email: string;
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
}

export default function Sidebar({ user, isCollapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(isCollapsed || false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

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

  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home size={20} />,
    },
    {
      title: "Conversations",
      href: "/conversations",
      icon: <MessageSquare size={20} />,
      badge: "5",
    },
    {
      title: "Contacts",
      href: "/contacts",
      icon: <Users size={20} />,
      submenu: [
        { title: "All Contacts", href: "/contacts" },
        { title: "Groups", href: "/contacts/groups" },
        { title: "Labels", href: "/contacts/labels" },
      ],
    },
    {
      title: "Broadcasts",
      href: "/broadcasts",
      icon: <Megaphone size={20} />,
    },
    {
      title: "Templates",
      href: "/templates",
      icon: <FileText size={20} />,
    },
    {
      title: "Automations",
      href: "/automations",
      icon: <Zap size={20} />,
    },
    {
      title: "Chatbots",
      href: "/chatbots",
      icon: <Bot size={20} />,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart2 size={20} />,
    },
    {
      title: "API Keys",
      href: "/api-keys",
      icon: <Key size={20} />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings size={20} />,
      submenu: [
        { title: "Account", href: "/settings/account" },
        { title: "Team", href: "/settings/team" },
        { title: "WhatsApp Business", href: "/settings/waba" },
        { title: "Billing", href: "/settings/billing" },
      ],
    },
    {
      title: "Help & Support",
      href: "/support",
      icon: <HelpCircle size={20} />,
    },
  ];

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <div className="relative">
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-background transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-14 items-center border-b px-3 py-4">
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <img src='/zaptick.png' className="h-32" />
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <img src='/tick.png' className="scale-150" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("ml-auto", collapsed && "hidden")}
            onClick={() => handleCollapsedChange(true)}
          >
            <Menu size={16} />
          </Button>
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-9 top-3 h-7 w-7 rounded-full border bg-background"
              onClick={() => handleCollapsedChange(false)}
            >
              <ChevronRight size={14} />
            </Button>
          )}
        </div>

        {/* Rest of the sidebar code remains unchanged */}
        <div className="flex-1 overflow-auto py-2">
          <nav className="space-y-1 px-2">
            {sidebarItems.map((item) => (
              <div key={item.title}>
                {item.submenu ? (
                  <Collapsible
                    open={openMenus[item.title]}
                    onOpenChange={() => !collapsed && toggleMenu(item.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <div
                        className={cn(
                          "group flex cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-secondary text-secondary-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                        )}
                      >
                        <TooltipProvider disableHoverableContent={!collapsed}>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <div className="flex flex-1 items-center">
                                <span className="mr-3">{item.icon}</span>
                                {!collapsed && (
                                  <>
                                    <span className="flex-1">{item.title}</span>
                                    {item.badge && (
                                      <Badge variant="secondary" className="ml-auto">
                                        {item.badge}
                                      </Badge>
                                    )}
                                    <ChevronDown
                                      size={16}
                                      className={cn(
                                        "ml-auto transition-transform",
                                        openMenus[item.title] && "rotate-180"
                                      )}
                                    />
                                  </>
                                )}
                              </div>
                            </TooltipTrigger>
                            {collapsed && (
                              <TooltipContent side="right" className="flex items-center gap-4">
                                {item.title}
                                {item.badge && (
                                  <Badge variant="secondary">{item.badge}</Badge>
                                )}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CollapsibleTrigger>
                    {!collapsed && (
                      <CollapsibleContent className="ml-9 space-y-1 pt-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "block rounded-md px-3 py-2 text-sm transition-colors",
                              pathname === subItem.href
                                ? "bg-secondary/50 font-medium text-secondary-foreground"
                                : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground"
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
                      "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                    )}
                  >
                    <TooltipProvider disableHoverableContent={!collapsed}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <div className="flex flex-1 items-center">
                            <span className="mr-3">{item.icon}</span>
                            {!collapsed && (
                              <>
                                <span>{item.title}</span>
                                {item.badge && (
                                  <Badge variant="secondary" className="ml-auto">
                                    {item.badge}
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                        </TooltipTrigger>
                        {collapsed && (
                          <TooltipContent side="right" className="flex items-center gap-4">
                            {item.title}
                            {item.badge && (
                              <Badge variant="secondary">{item.badge}</Badge>
                            )}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t p-3">
          {user && (
            <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>
                  {user.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="overflow-hidden">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
