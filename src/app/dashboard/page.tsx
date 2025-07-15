"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  Copy,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Phone,
  PieChart,
  Plus,
  Rocket,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  CheckCircle2 as CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ArrowDownRight,
  LucideIcon,
  GitBranch,
  Workflow,
  Building,
  Users2Icon,
} from "lucide-react";
import { format, subDays, differenceInDays, isToday, isYesterday, formatDistance } from "date-fns";
import Layout from "@/components/layout/Layout";
import ConnectWabaButton from "@/components/connectWABA";
import ManualWabaConnect from "@/components/ManualWabaConnect";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { FaBuilding, FaWhatsapp } from "react-icons/fa";

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

const StatCard = ({ title, value, description, icon: Icon, trend, loading }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
        <Icon className="h-4 w-4 text-foreground/70" />
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
      <div className="flex items-center mt-1">
        {trend && (
          <Badge
            variant="outline"
            className={cn(
              "font-normal mr-2",
              trend.isPositive
                ? " text-primary bg-primary/10"
                : "bg-red-500/10 text-red-500 dark:bg-red-500/20"
            )}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {trend.value}%
          </Badge>
        )}
        <p className="text-xs text-muted-foreground">
          {description || "No data available yet"}
        </p>
      </div>
    </CardContent>
  </Card>
);

// Empty state component
const EmptyState = () => (
  <div className="rounded-lg border border-dashed p-8 flex flex-col items-center justify-center bg-background">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <MessageSquare className="h-8 w-8 text-primary" />
    </div>
    <h3 className="text-xl font-medium mb-2">No WhatsApp Accounts Connected</h3>
    <p className="text-center text-muted-foreground mb-6 max-w-md">
      Connect your WhatsApp Business Account to start sending messages and managing your templates.
    </p>
    <Button size="lg" className="gap-2" asChild>
      <a href="#waba-section">
        Connect Your Account <ArrowRight className="h-4 w-4" />
      </a>
    </Button>
  </div>
);

// Pending connection state
const PendingConnectionCard = ({ onRefresh }: { onRefresh: () => void }) => (
  <Card className="flex flex-col justify-center items-center bg-muted/30 border border-dashed h-full">
    <CardHeader className="text-center">
      <CardDescription>
        WhatsApp Business Account Setup
      </CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
        <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400 animate-pulse" />
      </div>
      <div className="text-center">
        <h3 className="font-medium mb-2">
          Connection in Progress
        </h3>
        <p className="text-sm text-muted-foreground px-4 mb-4">
          Your WhatsApp Business Account is being processed by Interakt. This usually takes 2-5 minutes.
        </p>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" /> WABA details submitted
          </div>
          <div className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3 text-amber-500 animate-spin" /> Interakt processing your account...
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" /> Setting up credit line and verification
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Processing...
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Check Status
      </Button>
    </CardFooter>
  </Card>
);

// Failed connection state
const FailedConnectionCard = ({ onRetry, onClearState }: {
  onRetry: () => void;
  onClearState: () => void;
}) => (
  <Card className="flex flex-col justify-center items-center bg-destructive/5 border border-dashed h-full">
    <CardHeader className="text-center">
      <CardDescription className="text-destructive dark:text-destructive">
        Connection Issue
      </CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-medium mb-2">
          Setup Taking Longer Than Expected
        </h3>
        <p className="text-sm text-muted-foreground px-4">
          Your WABA setup might have encountered an issue or is taking longer than usual. You can try again or contact support.
        </p>
      </div>
    </CardContent>
    <CardFooter className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onClearState}
      >
        Try Again
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={onRetry}
      >
        Contact Support
      </Button>
    </CardFooter>
  </Card>
);

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "quarter">("week");
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [wabaAccounts, setWabaAccounts] = useState<any[]>([]);
  const [pendingConnection, setPendingConnection] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedWabaId, setSelectedWabaId] = useState<string | null>(null);
  const { user } = useAuth();

  // Check for pending connection in localStorage
  useEffect(() => {
    if (!user?.id) return;

    const pending = localStorage.getItem(`waba_pending_${user.id}`);
    const pendingTimestamp = localStorage.getItem(`waba_pending_timestamp_${user.id}`);

    if (pending && pendingTimestamp) {
      const timeDiff = Date.now() - parseInt(pendingTimestamp);
      const fiveMinutes = 5 * 60 * 1000;

      if (timeDiff > fiveMinutes) {
        // Connection has been pending for more than 5 minutes
        setConnectionTimeout(true);
        setPendingConnection(true);
      } else {
        setPendingConnection(true);
      }

      console.log('Found pending WABA connection, time elapsed:', Math.round(timeDiff / 1000), 'seconds');
    }
  }, [user?.id]);

  // Listen for WABA connection events
  useEffect(() => {
    const handleWABAConnected = () => {
      console.log('WABA connection completed, refreshing data...');
      clearPendingState();
      fetchUserData();
    };

    const handleWABASignupStarted = () => {
      console.log('WABA signup started');
      setPendingConnection(true);
      setConnectionTimeout(false);
      if (user?.id) {
        localStorage.setItem(`waba_pending_${user.id}`, 'true');
        localStorage.setItem(`waba_pending_timestamp_${user.id}`, Date.now().toString());
      }
    };

    const handleWABASignupCompleted = () => {
      console.log('WABA signup completed, refreshing...');
      setTimeout(() => {
        fetchUserData();
      }, 2000); // Small delay to ensure backend processing
    };

    window.addEventListener('wabaConnected', handleWABAConnected);
    window.addEventListener('wabaSignupStarted', handleWABASignupStarted);
    window.addEventListener('wabaSignupCompleted', handleWABASignupCompleted);

    return () => {
      window.removeEventListener('wabaConnected', handleWABAConnected);
      window.removeEventListener('wabaSignupStarted', handleWABASignupStarted);
      window.removeEventListener('wabaSignupCompleted', handleWABASignupCompleted);
    };
  }, [user?.id]);

  const clearPendingState = () => {
    setPendingConnection(false);
    setConnectionTimeout(false);
    if (user?.id) {
      localStorage.removeItem(`waba_pending_${user.id}`);
      localStorage.removeItem(`waba_pending_timestamp_${user.id}`);
    }
  };

  const fetchUserData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch('/api/user/waba-accounts', {
        headers: {
          'x-user-id': user.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched WABA accounts:', data.wabaAccounts);
        setWabaAccounts(data.wabaAccounts || []);

        // Set the first WABA account as selected by default
        if (data.wabaAccounts?.length > 0 && !selectedWabaId) {
          setSelectedWabaId(data.wabaAccounts[0].wabaId);
        }

        setLastRefresh(new Date());

        // If we found accounts and there was a pending connection, clear it
        if (data.wabaAccounts?.length > 0 && pendingConnection) {
          clearPendingState();
          // Dispatch event to notify user
          window.dispatchEvent(new CustomEvent('wabaConnected'));
        }
      } else {
        console.error('Failed to fetch WABA accounts:', response.status);
      }
    } catch (error) {
      console.error("Error fetching WABA accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!user?.id || !selectedWabaId) return;

    try {
      setAnalyticsLoading(true);
      const url = new URL('/api/analytics', window.location.origin);
      url.searchParams.append('timeRange', timeRange);
      url.searchParams.append('wabaId', selectedWabaId);

      const response = await fetch(url.toString());

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched analytics:', data.analytics);
        setAnalytics(data.analytics);
      } else {
        console.error('Failed to fetch analytics:', response.status);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  // Fetch analytics when time range or selected WABA changes
  useEffect(() => {
    if (selectedWabaId) {
      fetchAnalytics();
    }
  }, [selectedWabaId, timeRange]);

  // Auto-refresh when connection is pending
  useEffect(() => {
    if (pendingConnection && !connectionTimeout) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing WABA accounts...');
        fetchUserData();
      }, 15000); // Check every 15 seconds

      return () => clearInterval(interval);
    }
  }, [pendingConnection, connectionTimeout, user?.id]);

  // Timeout handler
  useEffect(() => {
    if (pendingConnection && !connectionTimeout) {
      const timeout = setTimeout(() => {
        setConnectionTimeout(true);
        console.log('WABA connection timeout reached');
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearTimeout(timeout);
    }
  }, [pendingConnection, connectionTimeout]);

  const handleRefreshAccounts = () => {
    fetchUserData();
  };

  const handleRefreshAnalytics = () => {
    fetchAnalytics();
  };

  const handleClearPendingState = () => {
    clearPendingState();
  };

  const handleContactSupport = () => {
    // You can implement this to open a support ticket or contact form
    window.open('mailto:support@zaptick.io?subject=WABA Connection Issue', '_blank');
  };

  const formatTimeAgo = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (differenceInDays(new Date(), date) < 7) {
      return formatDistance(date, new Date(), { addSuffix: true });
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };



  const renderWABASection = () => {
    if (loading && !pendingConnection) {
      return (
        <div className="py-12 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900 dark:text-white">Loading accounts...</p>
              <p className="text-sm text-gray-500">Fetching your WhatsApp Business accounts</p>
            </div>
          </div>
        </div>
      );
    }

    if (wabaAccounts.length > 0) {
      return (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {wabaAccounts.map((account, index) => (
              <Card
                key={account.wabaId || index}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1",
                  selectedWabaId === account.wabaId 
                    ? "border-primary shadow-lg bg-gradient-to-br from-primary/5 to-primary/10" 
                    : "border-gray-200 bg-gradient-to-br from-white to-gray-50/50 hover:border-primary/30 dark:border-gray-700 dark:from-muted/40 dark:to-gray-800/50"
                )}
                onClick={() => setSelectedWabaId(account.wabaId)}
              >
                {/* Header stripe */}
                {/* <div className={cn(
                  "h-2 w-full transition-all duration-300",
                  selectedWabaId === account.wabaId 
                    ? "bg-gradient-to-r from-primary to-primary/80" 
                    : "bg-gradient-to-r from-gray-200 to-gray-300 group-hover:from-primary/50 group-hover:to-primary/70"
                )} /> */}
                
                {/* Status badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-1" />
                    Active
                  </Badge>
                  {account.provider === 'interakt' && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                      Interakt
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6 pt-4 mt-">
                  <div className="space-y-4">
                    {/* Business info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                          <Users2Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {account.businessName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Connected on {format(new Date(account.connectedAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Account details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                          <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Phone Number</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                            {account.phoneNumber || "No phone number"}
                          </p>
                        </div>
                      </div>
                      
                      {/* <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Templates</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {account.templateCount || 0} message templates
                          </p>
                        </div>
                      </div>
                       */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 cursor-help">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">WABA ID</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 font-mono truncate">
                                  {account.wabaId}
                                </p>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-mono text-xs">{account.wabaId}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-6 pt-0 flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-800"
                    asChild
                  >
                    <Link href="/templates">
                      <FileText className="h-4 w-4 mr-2" />
                      View Templates
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className={cn(
                      "flex-1 transition-all duration-200",
                      selectedWabaId === account.wabaId 
                        ? "bg-primary hover:bg-primary/90 shadow-md" 
                        : "bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
                    )}
                    onClick={() => setSelectedWabaId(account.wabaId)}
                  >
                    {selectedWabaId === account.wabaId ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Selected
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Select
                      </>
                    )}
                  </Button>
                </CardFooter>

                {/* Selection indicator */}
                {/* {selectedWabaId === account.wabaId && (
                  <div className="absolute top-4 left-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-lg">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )} */}

                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            ))}

            {/* Show connection options only if no pending connection */}
            {!pendingConnection && (
              <ConnectWabaButton />
            )}
          </div>
          
          {/* Manual connect section */}
          <ManualWabaConnect />
        </div>
      );
    }

    // No accounts, show appropriate state
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pendingConnection ? (
            connectionTimeout ? (
              <FailedConnectionCard
                onRetry={handleContactSupport}
                onClearState={handleClearPendingState}
              />
            ) : (
              <PendingConnectionCard onRefresh={handleRefreshAccounts} />
            )
          ) : (
            <>
              <ConnectWabaButton />
              <ManualWabaConnect />
            </>
          )}
        </div>
      </div>
    );
  };


  // Format a message for display
  const formatMessagePreview = (message: string) => {
    if (!message) return "No message content";
    return message.length > 50 ? message.substring(0, 50) + "..." : message;
  };

  return (
    <Layout>
      <div className="container mx-auto space-y-6 p-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                Dashboard
              </h1>
              <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {user ? `Welcome back, ${user.name?.split(' ')[0]}!` : 'Welcome!'} Here's your WhatsApp Business overview.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span>{wabaAccounts.length} account{wabaAccounts.length !== 1 ? 's' : ''} connected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span>Analytics enabled</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 min-w-[140px] justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      {timeRange === "today" ? "Today" :
                        timeRange === "week" ? "This Week" :
                          timeRange === "month" ? "This Month" : "This Quarter"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[140px]">
                <DropdownMenuItem onClick={() => setTimeRange("today")}>
                  <div className="flex items-center justify-between w-full">
                    <span>Today</span>
                    {timeRange === "today" && <CheckCircle className="h-4 w-4 text-primary" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("week")}>
                  <div className="flex items-center justify-between w-full">
                    <span>This Week</span>
                    {timeRange === "week" && <CheckCircle className="h-4 w-4 text-primary" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("month")}>
                  <div className="flex items-center justify-between w-full">
                    <span>This Month</span>
                    {timeRange === "month" && <CheckCircle className="h-4 w-4 text-primary" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("quarter")}>
                  <div className="flex items-center justify-between w-full">
                    <span>This Quarter</span>
                    {timeRange === "quarter" && <CheckCircle className="h-4 w-4 text-primary" />}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Welcome Alert for first time users */}
        {wabaAccounts.length === 0 && !pendingConnection && (
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Welcome to Zaptick!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get started by connecting your WhatsApp Business Account to unlock all features and start engaging with your customers.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Free setup</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>5 minute process</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Instant messaging</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="lg" className="gap-2" asChild>
                  <a href="#waba-section">
                    Get Started
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  Learn more
                </Button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10" />
            <div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-primary/5" />
          </div>
        )}

        {/* Quick Actions */}
        {wabaAccounts.length > 0 && selectedWabaId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Quick Actions</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Jump into the most common tasks</p>
              </div>
              {/* <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                More Actions
              </Button> */}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="group cursor-pointer hover:shadow-md rounded-xl transition-all duration-200 hover:-translate-y-1 border-2 hover:border-purple-200 bg-gradient-to-br from-white to-purple-50/30 dark:from-muted/40 dark:to-purple-900/10">
                <a href="/campaigns/create">
                  <CardContent className="p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <Share2 className="h-6 w-6 text-white" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <h3 className="font-semibold group-hover:text-purple-600 transition-colors">New Campaign</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Send messages to multiple contacts</p>
                  </CardContent>
                </a>
              </Card>

              <Card className="group cursor-pointer hover:shadow-md rounded-xl transition-all duration-200 hover:-translate-y-1 border-2 hover:border-blue-200 bg-gradient-to-br from-white to-blue-50/30 dark:from-muted/40 dark:to-blue-900/10">
                <Link href="/templates">
                  <CardContent className="p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <h3 className="font-semibold group-hover:text-blue-600 transition-colors">Create Template</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Design reusable message templates</p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="group cursor-pointer hover:shadow-md rounded-xl transition-all duration-200 hover:-translate-y-1 border-2 hover:border-green-200 bg-gradient-to-br from-white to-green-50/30 dark:from-muted/40 dark:to-green-900/10">
                <a href="/contacts">
                  <CardContent className="p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <h3 className="font-semibold group-hover:text-green-600 transition-colors">Add Contact</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Add new contact to your database</p>
                  </CardContent>
                </a>
              </Card>

              <Card className="group cursor-pointer hover:shadow-md rounded-xl transition-all duration-200 hover:-translate-y-1 border-2 hover:border-amber-200 bg-gradient-to-br from-white to-amber-50/30 dark:from-muted/40 dark:to-amber-900/10">
                <a href="/contacts/import">
                  <CardContent className="p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <Workflow className="h-6 w-6 text-white" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <h3 className="font-semibold group-hover:text-amber-600 transition-colors">Create Workflows</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Create and manage multi-step automation sequences</p>
                  </CardContent>
                </a>
              </Card>
            </div>
          </div>
        )}

        {/* WABA Status Card */}
        <Card id="waba-section" className="overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-900/10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">WhatsApp Business Accounts</CardTitle>
                    <CardDescription className="text-sm">
                      Connect and manage your WhatsApp Business accounts to start messaging customers.
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Secure connection</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Real-time sync</span>
                  </div>
                  <div className="flex items-center gap-1 text-purple-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>24/7 monitoring</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {lastRefresh && wabaAccounts.length > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Last updated</p>
                    <p className="text-sm font-medium">{format(lastRefresh, "HH:mm:ss")}</p>
                  </div>
                )}
                {wabaAccounts.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleRefreshAccounts} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {renderWABASection()}
          </CardContent>
          {wabaAccounts.length > 0 && (
            <CardFooter className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-6 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Info className="h-4 w-4" />
                <span>Need help managing your accounts?</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Get Help
                </Button>
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href="https://business.facebook.com/wa/manage/" target="_blank" rel="noopener noreferrer">
                    Meta Business Suite
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>



        {/* Show dashboard content based on state */}
        {wabaAccounts.length === 0 && !pendingConnection ? (
          <EmptyState />
        ) : (
          <>
            {/* Stats row */}
            {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Messages"
                value={analytics?.totalMessages || 0}
                description="Messages exchanged"
                icon={MessageSquare}
                trend={analytics?.totalMessages > 0 ? { value: 12, isPositive: true } : undefined}
                loading={analyticsLoading}
              />
              <StatCard
                title="Active Conversations"
                value={analytics?.activeConversations || 0}
                description="Currently active"
                icon={MessageSquare}
                trend={analytics?.activeConversations > 0 ? { value: 5, isPositive: true } : undefined}
                loading={analyticsLoading}
              />
              <StatCard
                title="Total Contacts"
                value={analytics?.totalContacts || 0}
                description="In your database"
                icon={Users}
                trend={analytics?.contactMetrics?.new > 0 ? {
                  value: Math.round((analytics.contactMetrics.new / analytics.totalContacts) * 100),
                  isPositive: true
                } : undefined}
                loading={analyticsLoading}
              />
              <StatCard
                title="Message Templates"
                value={analytics?.templateStats?.total || wabaAccounts.reduce((acc, account) => acc + (account.templateCount || 0), 0)}
                description={analytics?.templateStats?.approved > 0 ?
                  `${analytics.templateStats.approved} approved` :
                  'Create templates to start messaging'}
                icon={FileText}
                loading={analyticsLoading}
              />
            </div> */}

            {/* Analytics and Recent Messages */}
            <div className="grid gap-4 lg:grid-cols-7">
              {/* Analytics Overview */}
              {/* <div className="lg:col-span-7 space-y-4">
                <Card className="h-full">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle>Message Analytics</CardTitle>
                      <CardDescription>
                        Track your message engagement and delivery metrics
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select defaultValue={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">Last 7 days</SelectItem>
                          <SelectItem value="month">Last 30 days</SelectItem>
                          <SelectItem value="quarter">Last 90 days</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={handleRefreshAnalytics}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {analyticsLoading ? (
                      <div className="h-[320px] w-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                      </div>
                    ) : analytics?.messageTrend?.length > 0 ? (
                      <div className="h-[320px] w-full">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Daily Message Volume</div>
                            <div className="grid grid-cols-7 gap-1 h-48">
                              {analytics.messageTrend.map((day: any, i: number) => {
                                const maxValue = Math.max(...analytics.messageTrend.map((d: any) => d.count || 0));
                                const percentage = maxValue > 0 ? (day.count / maxValue) * 100 : 0;

                                return (
                                  <div key={i} className="flex flex-col h-full justify-end space-y-1">
                                    <div
                                      className={cn(
                                        "rounded-sm w-full",
                                        percentage > 0 ? "bg-primary/90" : "bg-muted"
                                      )}
                                      style={{ height: `${percentage || 2}%` }}
                                    ></div>
                                    <span className="text-xs text-muted-foreground text-center">
                                      {day.day}
                                    </span>
                                    <span className="text-xs font-medium text-center">
                                      {day.count}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Delivery Rate</div>
                              <div className="text-lg font-medium">{analytics.messageMetrics?.deliveryRate || 0}%</div>
                              <Progress value={analytics.messageMetrics?.deliveryRate || 0} className="h-1" />
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Read Rate</div>
                              <div className="text-lg font-medium">{analytics.messageMetrics?.readRate || 0}%</div>
                              <Progress value={analytics.messageMetrics?.readRate || 0} className="h-1" />
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Response Rate</div>
                              <div className="text-lg font-medium">{analytics.messageMetrics?.responseRate || 0}%</div>
                              <Progress value={analytics.messageMetrics?.responseRate || 0} className="h-1" />
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Response Time</div>
                              <div className="text-lg font-medium">{analytics.messageMetrics?.responseTime || 0}h</div>
                              <Progress value={analytics.messageMetrics?.responseTime ?
                                (100 - (analytics.messageMetrics.responseTime / 24) * 100) : 0}
                                className="h-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[320px] w-full flex flex-col justify-center items-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                            <BarChart3 className="h-8 w-8 text-primary" />
                          </div>
                          <div className="space-y-2 text-center">
                            <h3 className="text-xl font-medium">No message data yet</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                              Start sending messages to see detailed analytics and insights about your WhatsApp Business performance.
                            </p>
                            <Button size="sm" className="mt-2 gap-2" asChild>
                              <a href="/templates">
                                <Rocket className="h-4 w-4" />
                                Create First Template
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div> */}

              {/* Recent Messages */}

            </div>


            {/* Analytics Tabs Section */}
            <Tabs defaultValue="overview" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Track your WhatsApp Business performance and engagement metrics
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <TabsList className="grid w-full max-w-md grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="messages" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Messages
                    </TabsTrigger>
                    <TabsTrigger value="contacts" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Contacts
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Templates
                    </TabsTrigger>
                  </TabsList>
                  <div className="hidden md:flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <FileText className="h-4 w-4" />
                      Export Report
                    </Button>
                    <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                      <BarChart3 className="h-4 w-4" />
                      Full Analytics
                    </Button>
                  </div>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 hover:shadow-lg transition-all duration-300 dark:from-muted/40 dark:to-green-900/10">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics?.messageMetrics?.deliveryRate || 0}%</div>
                      <p className="text-xs text-muted-foreground mt-1">Based on all messages sent</p>
                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span>Progress</span>
                          <span>{analytics?.messageMetrics?.deliveryRate || 0}%</span>
                        </div>
                        <Progress value={analytics?.messageMetrics?.deliveryRate || 0} className="h-2" />
                      </div>
                    </CardContent>
                    <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
                  </Card>

                  <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 hover:shadow-lg transition-all duration-300 dark:from-muted/40 dark:to-blue-900/10">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics?.messageMetrics?.readRate || 0}%</div>
                      <p className="text-xs text-muted-foreground mt-1">Of delivered messages</p>
                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span>Progress</span>
                          <span>{analytics?.messageMetrics?.readRate || 0}%</span>
                        </div>
                        <Progress value={analytics?.messageMetrics?.readRate || 0} className="h-2" />
                      </div>
                    </CardContent>
                    <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
                  </Card>

                  <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-purple-50/30 hover:shadow-lg transition-all duration-300 dark:from-muted/40 dark:to-purple-900/10">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <ArrowRight className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics?.messageMetrics?.responseRate || 0}%</div>
                      <p className="text-xs text-muted-foreground mt-1">Customer replies</p>
                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span>Progress</span>
                          <span>{analytics?.messageMetrics?.responseRate || 0}%</span>
                        </div>
                        <Progress value={analytics?.messageMetrics?.responseRate || 0} className="h-2" />
                      </div>
                    </CardContent>
                    <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-purple-500/10 transition-all duration-300 group-hover:scale-110" />
                  </Card>

                  <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-amber-50/30 hover:shadow-lg transition-all duration-300 dark:from-muted/40 dark:to-amber-900/10">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics?.messageMetrics?.responseTime || 0}h</div>
                      <p className="text-xs text-muted-foreground mt-1">Time to first response</p>
                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span>Target: 4h</span>
                          <span>{analytics?.messageMetrics?.responseTime ? Math.min(100, Math.round((4 / analytics.messageMetrics.responseTime) * 100)) : 0}%</span>
                        </div>
                        <Progress value={analytics?.messageMetrics?.responseTime ? Math.min(100, Math.round((4 / analytics.messageMetrics.responseTime) * 100)) : 0} className="h-2" />
                      </div>
                    </CardContent>
                    <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-amber-500/10 transition-all duration-300 group-hover:scale-110" />
                  </Card>
                </div>

                {/* Template Performance Card */}
                <Card className="rounded-xl border bg-gradient-to-br from-white to-gray-50/30 dark:from-muted/40 dark:to-gray-800/30">
                  <CardHeader>
                    <CardTitle>Template Performance</CardTitle>
                    <CardDescription>
                      Overview of your most used message templates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="h-32 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                      </div>
                    ) : analytics?.templateStats?.mostUsed?.length > 0 ? (
                      <div className="rounded-md border">
                        <table className="min-w-full divide-y divide-border">
                          <thead>
                            <tr>
                              <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                                Template
                              </th>
                              <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                                Category
                              </th>
                              <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                                Usage
                              </th>
                              <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                                Delivery
                              </th>
                              <th className="px-4 py-3.5 text-left text-sm font-semibold text-muted-foreground">
                                Read
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border bg-background">
                            {analytics.templateStats.mostUsed.map((template: any, index: number) => (
                              <tr key={index}>
                                <td className="whitespace-nowrap px-4 py-3 text-sm">
                                  {template.name}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm">
                                  {template.category.toLowerCase()}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm">
                                  {template.useCount}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm">
                                  {template.deliveryRate}%
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm">
                                  {template.readRate}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 space-y-2">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                        <h3 className="font-medium">No template data available</h3>
                        <p className="text-sm text-muted-foreground">
                          Templates will appear here once you&apos;ve used them to send messages
                        </p>
                        <Button size="sm" className="mt-2" asChild>
                          <Link href="/templates">Create Template</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="rounded-xl border bg-gradient-to-br from-white to-blue-50/30 dark:from-muted/40 dark:to-blue-900/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Message Types</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      {analyticsLoading ? (
                        <div className="h-[220px] flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                        </div>
                      ) : (
                        <div className="h-[220px] flex items-center justify-center">
                          <div className="space-y-4 w-full">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                                  <span>Template Messages</span>
                                </div>
                                <span className="font-medium">67%</span>
                              </div>
                              <Progress value={67} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                  <span>Session Messages</span>
                                </div>
                                <span className="font-medium">24%</span>
                              </div>
                              <Progress value={24} className="h-2 bg-muted" indicatorClassName="bg-blue-500" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                  <span>Customer Service</span>
                                </div>
                                <span className="font-medium">9%</span>
                              </div>
                              <Progress value={9} className="h-2 bg-muted" indicatorClassName="bg-green-500" />
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border bg-gradient-to-br from-white to-green-50/30 dark:from-muted/40 dark:to-green-900/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Messaging Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      {analyticsLoading ? (
                        <div className="h-[220px] flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-sm text-muted-foreground flex justify-between">
                            <span>Last 7 days</span>
                            <span className="font-medium text-foreground">{analytics?.totalMessages || 0} total</span>
                          </div>
                          <div className="grid grid-cols-7 gap-1 h-24">
                            {(analytics?.messageTrend || []).map((day: any, i: number) => {
                              const maxCount = Math.max(...(analytics?.messageTrend || []).map((d: any) => d.count));
                              const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;

                              return (
                                <div key={i} className="flex flex-col h-full justify-end space-y-1">
                                  <div
                                    className="bg-primary/90 rounded-sm w-full"
                                    style={{ height: `${percentage || 2}%` }}
                                  ></div>
                                  <span className="text-xs text-muted-foreground text-center">
                                    {day.day}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="pt-4 space-y-2">
                            {analytics?.messageTrend?.length > 0 && (
                              <>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">Busiest day</span>
                                  <span className="font-medium">
                                    {analytics.messageTrend.reduce(
                                      (max: any, day: any) => (day.count > max.count ? day : max),
                                      { count: 0 }
                                    ).day} ({analytics.messageTrend.reduce(
                                      (max: any, day: any) => (day.count > max.count ? day : max),
                                      { count: 0 }
                                    ).count} messages)
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">Avg. per day</span>
                                  <span className="font-medium">
                                    {analytics.messageTrend.length > 0
                                      ? (
                                        analytics.messageTrend.reduce(
                                          (sum: number, day: any) => sum + day.count,
                                          0
                                        ) / analytics.messageTrend.length
                                      ).toFixed(1)
                                      : "0"} messages
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border bg-gradient-to-br from-white to-purple-50/30 dark:from-muted/40 dark:to-purple-900/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      {analyticsLoading ? (
                        <div className="h-[220px] flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                        </div>
                      ) : (
                        <div className="flex flex-col justify-center h-[220px]">
                          <div className="flex items-center justify-center mb-4">
                            <div className="relative h-32 w-32 flex items-center justify-center">
                              <svg className="absolute" width="128" height="128" viewBox="0 0 128 128">
                                <circle
                                  cx="64"
                                  cy="64"
                                  r="56"
                                  stroke="currentColor"
                                  strokeWidth="16"
                                  fill="none"
                                  className="text-muted"
                                />
                                <circle
                                  cx="64"
                                  cy="64"
                                  r="56"
                                  stroke="currentColor"
                                  strokeWidth="16"
                                  fill="none"
                                  strokeDasharray="352"
                                  strokeDashoffset={352 - ((analytics?.messageMetrics?.responseTime ?
                                    Math.min(100, Math.round((4 / analytics.messageMetrics.responseTime) * 100)) : 0) / 100) * 352}
                                  className="text-primary"
                                />
                              </svg>
                              <span className="text-2xl font-bold">
                                {analytics?.messageMetrics?.responseTime ?
                                  Math.min(100, Math.round((4 / analytics.messageMetrics.responseTime) * 100)) : 0}%
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Within target (4h)</span>
                              <span className="font-medium">
                                {analytics?.messageMetrics?.responseTime ?
                                  Math.min(100, Math.round((4 / analytics.messageMetrics.responseTime) * 100)) : 0}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Average time</span>
                              <span className="font-medium">{analytics?.messageMetrics?.responseTime || 0} hours</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Target time</span>
                              <span className="font-medium">4 hours</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <div className="flex justify-center">
                  <Button variant="outline" className="gap-2">
                    <PieChart className="h-4 w-4" />
                    View Detailed Message Analytics
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="contacts" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="rounded-xl border bg-gradient-to-br from-white to-blue-50/30 dark:from-muted/40 dark:to-blue-900/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsLoading ? (
                        <div className="h-20 flex items-center">
                          <div className="h-6 w-16 bg-muted animate-pulse rounded-md" />
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold">{analytics?.totalContacts || 0}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {analytics?.contactMetrics?.new > 0
                              ? `+${analytics.contactMetrics.new} in this period`
                              : 'No new contacts in this period'}
                          </p>
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Opt-in Rate</span>
                              <span className="font-medium">100%</span>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border bg-gradient-to-br from-white to-green-50/30 dark:from-muted/40 dark:to-green-900/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsLoading ? (
                        <div className="h-20 flex items-center">
                          <div className="h-6 w-16 bg-muted animate-pulse rounded-md" />
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold">
                            {/* {analytics?.totalContacts ?
                              Math.round((parseFloat(analytics.contactMetrics.engagementRate) / 100) * analytics.totalContacts)
                              : 0} */}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Contacts with conversations
                          </p>
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Engagement Rate</span>
                              <span className="font-medium">{analytics?.contactMetrics?.engagementRate || 0}%</span>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border bg-gradient-to-br from-white to-purple-50/30 dark:from-muted/40 dark:to-purple-900/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">New Contacts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsLoading ? (
                        <div className="h-20 flex items-center">
                          <div className="h-6 w-16 bg-muted animate-pulse rounded-md" />
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold">{analytics?.contactMetrics?.new || 0}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {timeRange === 'today' ? 'Today' :
                              timeRange === 'week' ? 'This week' :
                                timeRange === 'month' ? 'This month' : 'This quarter'}
                          </p>
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Growth Rate</span>
                              {/* <span className="font-medium">
                                {analytics?.totalContacts && analytics?.contactMetrics?.new
                                  ? `+${((analytics.contactMetrics.new / analytics.totalContacts) * 100).toFixed(1)}%`
                                  : '0%'}
                              </span> */}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border bg-gradient-to-br from-white to-red-50/30 dark:from-muted/40 dark:to-red-900/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsLoading ? (
                        <div className="h-20 flex items-center">
                          <div className="h-6 w-16 bg-muted animate-pulse rounded-md" />
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold">0</div>
                          <p className="text-xs text-muted-foreground mt-1">No unsubscribes recorded</p>
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Churn Rate</span>
                              <span className="font-medium">0%</span>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <Card className="rounded-xl border bg-gradient-to-br from-white to-gray-50/30 dark:from-muted/40 dark:to-gray-800/30">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Contact Segments</CardTitle>
                        <CardDescription>
                          Distribution of your contacts by activity status
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href="/contacts">
                          <Users className="h-4 w-4" />
                          Manage Contacts
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="h-32 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-primary"></div>
                              <span>Active Contacts</span>
                            </div>
                            {/* <span className="font-medium">
                              {analytics?.totalContacts ?
                                Math.round((parseFloat(analytics.contactMetrics.engagementRate) / 100) * analytics.totalContacts)
                                : 0} ({analytics?.contactMetrics?.engagementRate || 0}%)
                            </span> */}
                          </div>
                          <Progress value={parseFloat(analytics?.contactMetrics?.engagementRate || "0")} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                              <span>Inactive Contacts</span>
                            </div>
                            {/* <span className="font-medium">
                              {analytics?.contactMetrics?.new || 0}{' '}
                              ({(() => {
                                if (!analytics?.totalContacts) return '0';
                                const percentage = ((analytics.contactMetrics.new / analytics.totalContacts) * 100).toFixed(1);
                                return percentage;
                              })()}%)
                            </span> */}
                          </div>
                          <Progress
                            value={analytics?.contactMetrics?.engagementRate ? 100 - parseFloat(analytics.contactMetrics.engagementRate) : 0}
                            className="h-2 bg-muted"
                            indicatorClassName="bg-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-green-500"></div>
                              <span>New Contacts</span>
                            </div>
                            {/* <span className="font-medium">
                              {analytics?.contactMetrics?.new || 0} ({analytics?.totalContacts ?
                                ((analytics?.contactMetrics?.new / analytics.totalContacts) * 100).toFixed(1) : 0}%)
                            </span> */}
                          </div>
                          {/* <Progress
                            value={analytics?.totalContacts ?
                              (analytics?.contactMetrics?.new / analytics.totalContacts) * 100 : 0}
                            className="h-2 bg-muted"
                            indicatorClassName="bg-green-500"
                          /> */}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-red-500"></div>
                              <span>Unsubscribed</span>
                            </div>
                            <span className="font-medium">0 (0%)</span>
                          </div>
                          <Progress value={0} className="h-2 bg-muted" indicatorClassName="bg-red-500" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="templates" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="rounded-xl border bg-gradient-to-br from-white to-green-50/30 dark:from-muted/40 dark:to-green-900/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Template Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsLoading ? (
                        <div className="h-32 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                        </div>
                      ) : (
                        <>
                          <div className="pt-2 grid grid-cols-3 gap-4 text-center">
                            <div className="space-y-1">
                              <div className="text-xl font-bold text-green-600">
                                {analytics?.templateStats?.approved || 0}
                              </div>
                              <p className="text-xs text-muted-foreground">Approved</p>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xl font-bold text-amber-600">
                                {analytics?.templateStats?.pending || 0}
                              </div>
                              <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xl font-bold text-red-600">
                                {analytics?.templateStats?.rejected || 0}
                              </div>
                              <p className="text-xs text-muted-foreground">Rejected</p>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Approval Rate</span>
                              <span className="font-medium">
                                {analytics?.templateStats?.approved && analytics?.templateStats?.total
                                  ? Math.round((analytics.templateStats.approved / analytics.templateStats.total) * 100)
                                  : 0}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Total Templates</span>
                              <span className="font-medium">{analytics?.templateStats?.total || 0}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border bg-gradient-to-br from-white to-blue-50/30 dark:from-muted/40 dark:to-blue-900/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Template Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      {analyticsLoading ? (
                        <div className="h-32 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                <span>Marketing</span>
                              </div>
                              <span className="font-medium">{analytics?.templateStats?.categories?.marketing || 0}</span>
                            </div>
                            <Progress
                              value={analytics?.templateStats?.total
                                ? (analytics?.templateStats?.categories?.marketing / analytics?.templateStats?.total) * 100
                                : 0}
                              className="h-2 bg-muted"
                              indicatorClassName="bg-green-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                <span>Utility</span>
                              </div>
                              <span className="font-medium">{analytics?.templateStats?.categories?.utility || 0}</span>
                            </div>
                            <Progress
                              value={analytics?.templateStats?.total
                                ? (analytics?.templateStats?.categories?.utility / analytics?.templateStats?.total) * 100
                                : 0}
                              className="h-2 bg-muted"
                              indicatorClassName="bg-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                                <span>Authentication</span>
                              </div>
                              <span className="font-medium">{analytics?.templateStats?.categories?.authentication || 0}</span>
                            </div>
                            <Progress
                              value={analytics?.templateStats?.total
                                ? (analytics?.templateStats?.categories?.authentication / analytics?.templateStats?.total) * 100
                                : 0}
                              className="h-2 bg-muted"
                              indicatorClassName="bg-amber-500"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border bg-gradient-to-br from-white to-purple-50/30 dark:from-muted/40 dark:to-purple-900/10 flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Template Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 flex-1 flex flex-col">
                      {analyticsLoading ? (
                        <div className="h-32 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                        </div>
                      ) : analytics?.templateStats?.mostUsed?.length > 0 ? (
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="rounded-md border overflow-hidden">
                            <table className="min-w-full">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                                    Name
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                                    Sent
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                                    Delivered
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                                    Read
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {analytics.templateStats.mostUsed.map((template: any, index: number) => (
                                  <tr key={index}>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                                      {template.name}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-right">
                                      {template.useCount}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-right">
                                      {Math.round((template.deliveryRate / 100) * template.useCount)} ({template.deliveryRate}%)
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-right">
                                      {Math.round((template.readRate / 100) * template.useCount)} ({template.readRate}%)
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">No template data available</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <div className="flex justify-center">
                  <Button className="gap-2" asChild>
                    <Link href="/templates">
                      <FileText className="h-4 w-4" />
                      Create New Template
                    </Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Help and Tips Card */}
            <Card className="rounded-2xl border bg-gradient-to-br from-white to-blue-50/30 dark:from-muted/40 dark:to-blue-900/10 overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold">Tips & Best Practices</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Expert recommendations to optimize your WhatsApp Business
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    View all 
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:from-muted/40 dark:to-green-900/10">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <ShieldCheck className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Comply with WhatsApp Policies
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          Ensure your messages adhere to WhatsApp Business Policies for better delivery rates
                        </p>
                        <Button variant="ghost" size="sm" className="mt-3 h-8 px-3 text-xs text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20">
                          Learn more →
                        </Button>
                      </div>
                    </div>
                    <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
                  </div>

                  <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:from-muted/40 dark:to-blue-900/10">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Template Best Practices
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          Tips for creating templates that get approved quickly and perform well
                        </p>
                        <Button variant="ghost" size="sm" className="mt-3 h-8 px-3 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20">
                          Learn more →
                        </Button>
                      </div>
                    </div>
                    <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
                  </div>

                  <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-purple-50/30 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:from-muted/40 dark:to-purple-900/10">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Increase Engagement
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          Strategies to boost customer interaction and response rates
                        </p>
                        <Button variant="ghost" size="sm" className="mt-3 h-8 px-3 text-xs text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20">
                          Learn more →
                        </Button>
                      </div>
                    </div>
                    <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-purple-500/10 transition-all duration-300 group-hover:scale-110" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
