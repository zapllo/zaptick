"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import {
  BellIcon,
  HelpCircleIcon,
  SearchIcon,
  MessageSquareIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // This would come from your auth service
  const user = {
    name: "John Doe",
    email: "john@example.com",
    image: "/avatars/man1.jpg",
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        user={user}
        isCollapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center border-b bg-background px-4 lg:px-6">
          <div className="flex flex-1 items-center gap-4">
            {searchOpen ? (
              <div className="flex w-full max-w-sm items-center">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="h-9 rounded-r-none border-r-0 focus-visible:ring-0"
                  autoFocus
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-l-none"
                  onClick={() => setSearchOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 lg:hidden"
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            )}
            <div className={`${searchOpen ? 'hidden' : ''} relative hidden lg:flex items-center`}>
              <SearchIcon className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-64 pl-8 h-9"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquareIcon className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">2</Badge>
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">4</Badge>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                asChild
              >
                <a href="/support">
                  <HelpCircleIcon className="h-5 w-5" />
                </a>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p">
          {children}
        </main>
      </div>
    </div>
  );
}
