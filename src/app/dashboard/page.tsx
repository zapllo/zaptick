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
  Shield,
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
  gradient?: string;
}

const StatCard = ({ title, value, description, icon: Icon, trend, loading, gradient = "from-blue-500 to-blue-600" }: StatCardProps) => (
  <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 wark:from-muted/40 wark:to-blue-900/10">
    <div className="flex items-center gap-3 mb-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="text-sm font-medium text-slate-700 wark:text-slate-200">{title}</span>
    </div>
    {loading ? (
      <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
    ) : (
      <div className="text-2xl font-bold text-slate-900 wark:text-white mb-2">{value}</div>
    )}
    <div className="flex items-center gap-2">
      {trend && (
        <Badge
          variant="outline"
          className={cn(
            "font-normal text-xs",
            trend.isPositive
              ? "text-green-600 bg-green-50 border-green-200 wark:bg-green-900/30 wark:text-green-400 wark:border-green-700"
              : "bg-red-50 text-red-600 border-red-200 wark:bg-red-900/30 wark:text-red-400 wark:border-red-700"
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
      <p className="text-xs text-slate-600 wark:text-slate-400">
        {description || "No data available yet"}
      </p>
    </div>
    {/* Decorative element */}
    <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-gray-50/30 p-12 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-200 wark:from-muted/40 wark:to-gray-900/10">
    <div className="flex flex-col items-center gap-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20">
        <MessageSquare className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-semibold text-slate-900 wark:text-white">No WhatsApp Accounts Connected</h3>
        <p className="text-slate-600 wark:text-slate-300 max-w-md">
          Connect your WhatsApp Business Account to start sending messages and managing your templates.
        </p>
      </div>
      <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg" asChild>
        <a href="#waba-section">
          Connect Your Account <ArrowRight className="h-4 w-4" />
        </a>
      </Button>
    </div>
    {/* Decorative element */}
    <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-gray-500/10 transition-all duration-300 group-hover:scale-110" />
  </div>
);

// Pending connection state
const PendingConnectionCard = ({ onRefresh }: { onRefresh: () => void }) => (
  <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-amber-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-200 wark:from-muted/40 wark:to-amber-900/10">
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 wark:from-amber-900/50 wark:to-amber-800/50">
        <Clock className="h-8 w-8 text-amber-600 wark:text-amber-400 animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-slate-900 wark:text-white">
          Connection in Progress
        </h3>
        <p className="text-sm text-slate-600 wark:text-slate-300 max-w-md">
          Your WhatsApp Business Account is being processed by Interakt. This usually takes 2-5 minutes.
        </p>
        <div className="text-xs text-slate-500 wark:text-slate-400 space-y-1 mt-4">
          <div className="flex items-center gap-2 justify-center">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>WABA details submitted</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <RefreshCw className="h-3 w-3 text-amber-500 animate-spin" />
            <span>Interakt processing your account...</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>Setting up credit line and verification</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 mt-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 wark:text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="bg-white wark:bg-gray-800 hover:bg-gray-50 wark:hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Check Status
        </Button>
      </div>
    </div>
    {/* Decorative element */}
    <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-amber-500/10 transition-all duration-300 group-hover:scale-110" />
  </div>
);

// Failed connection state
const FailedConnectionCard = ({ onRetry, onClearState }: {
  onRetry: () => void;
  onClearState: () => void;
}) => (
  <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-red-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-red-200 wark:from-muted/40 wark:to-red-900/10">
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 to-red-200 wark:from-red-900/50 wark:to-red-800/50">
        <AlertCircle className="h-8 w-8 text-red-600 wark:text-red-400" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-slate-900 wark:text-white">
          Setup Taking Longer Than Expected
        </h3>
        <p className="text-sm text-slate-600 wark:text-slate-300 max-w-md">
          Your WABA setup might have encountered an issue or is taking longer than usual. You can try again or contact support.
        </p>
      </div>
      <div className="flex gap-3 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onClearState}
          className="bg-white wark:bg-gray-800 hover:bg-gray-50 wark:hover:bg-gray-700"
        >
          Try Again
        </Button>
        <Button
          size="sm"
          onClick={onRetry}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
        >
          Contact Support
        </Button>
      </div>
    </div>
    {/* Decorative element */}
    <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-red-500/10 transition-all duration-300 group-hover:scale-110" />
  </div>
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
  // ... existing imports and code ...

  const renderWABASection = () => {
    if (loading && !pendingConnection) {
      return (
        <div className="py-12 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-900 wark:text-white">Loading accounts...</p>
              <p className="text-sm text-slate-500">Fetching your WhatsApp Business accounts</p>
            </div>
          </div>
        </div>
      );
    }

    if (wabaAccounts.length > 0) {
      return (
        <div className="space-y-8">
          {/* Connected Accounts Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 wark:text-white">Connected Accounts</h3>
                <p className="text-sm text-slate-600 wark:text-slate-300">
                  Your active WhatsApp Business accounts
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 wark:text-slate-400">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>{wabaAccounts.length} account{wabaAccounts.length !== 1 ? 's' : ''} active</span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {wabaAccounts.map((account, index) => (
                <div
                  key={account.wabaId || index}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all duration-300 cursor-pointer hover:shadow-md",
                    selectedWabaId === account.wabaId
                      ? "bg-gradient-to-br from-white to-primary/5 border-primary/30 shadow-md hover:border-primary/40 wark:from-muted/40 wark:to-primary/10"
                      : "bg-gradient-to-br from-white to-gray-50/30 border-gray-200 hover:border-primary/30 wark:from-muted/40 wark:to-gray-900/10"
                  )}
                  onClick={() => setSelectedWabaId(account.wabaId)}
                >
                  {/* Header with business info */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl shadow-lg transition-all duration-300",
                      selectedWabaId === account.wabaId
                        ? "bg-gradient-to-br from-primary to-primary/80"
                        : "bg-gradient-to-br from-green-500 to-green-600 group-hover:from-primary/90 group-hover:to-primary"
                    )}>
                      <Users2Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-slate-900 wark:text-white">
                        {account.businessName}
                      </h4>
                      <p className="text-sm text-slate-600 wark:text-slate-300">
                        Connected on {format(new Date(account.connectedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    {selectedWabaId === account.wabaId && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Status badges */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge className="bg-green-50 text-green-700 border-green-200 text-xs wark:bg-green-900/30 wark:text-green-400 wark:border-green-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse mr-1.5" />
                      Active
                    </Badge>
                    {account.provider === 'interakt' && (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs wark:bg-blue-900/30 wark:text-blue-400 wark:border-blue-700">
                        Interakt
                      </Badge>
                    )}
                  </div>

                  {/* Account details */}
                  <div className="space-y-3 mb-4">
                    {/* Phone number */}
                    <div className="group/item">
                      <label className="text-xs text-slate-500 wark:text-slate-400 block mb-1">Phone Number</label>
                      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 wark:bg-slate-800/50 border border-slate-200 wark:border-slate-700 hover:border-primary/30 transition-colors">
                        <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium font-mono truncate text-slate-900 wark:text-slate-100">
                          {account.phoneNumber || "No phone number"}
                        </span>
                      </div>
                    </div>

                    {/* WABA ID */}
                    <div className="group/item">
                      <label className="text-xs text-slate-500 wark:text-slate-400 block mb-1">WABA ID</label>
                      <div className="p-2.5 rounded-lg bg-slate-50 wark:bg-slate-800/50 border border-slate-200 wark:border-slate-700 hover:border-primary/30 transition-colors">
                        <p className="text-sm font-mono truncate text-slate-900 wark:text-slate-100">
                          {account.wabaId}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer buttons */}
                  <div className="flex gap-3 mt-6">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-white wark:bg-slate-800 hover:bg-slate-50 wark:hover:bg-slate-700 border-slate-300 wark:border-slate-600"
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
                        "flex-1 transition-all duration-200 shadow-sm",
                        selectedWabaId === account.wabaId
                          ? "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white"
                          : "bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white"
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
                  </div>

                  {/* Decorative element */}
                  <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-primary/10 transition-all duration-300 group-hover:scale-110" />
                </div>
              ))}
            </div>
          </div>

          {/* Add More Accounts Section */}
          {!pendingConnection && (
            <div className="space-y-4 pt-8 border-t border-slate-200 wark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 wark:text-white">Add More Accounts</h3>
                  <p className="text-sm text-slate-600 wark:text-slate-300">
                    Connect additional WhatsApp Business accounts to your workspace
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-600 wark:text-blue-400">
                  <Plus className="h-4 w-4" />
                  <span>Connect another account</span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <ConnectWabaButton />
                <ManualWabaConnect />
              </div>
            </div>
          )}
        </div>
      );
    }

    // No accounts, show appropriate state
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 mx-auto mb-4">
            <FaWhatsapp className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 wark:text-white mb-2">Get Started</h3>
          <p className="text-slate-600 wark:text-slate-300 mb-6 max-w-md mx-auto">
            Choose how you'd like to connect your WhatsApp Business Account and start messaging your customers.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {pendingConnection ? (
            connectionTimeout ? (
              <div className="md:col-span-2 flex justify-center">
                <div className="max-w-md w-full">
                  <FailedConnectionCard
                    onRetry={handleContactSupport}
                    onClearState={handleClearPendingState}
                  />
                </div>
              </div>
            ) : (
              <div className="md:col-span-2 flex justify-center">
                <div className="max-w-md w-full">
                  <PendingConnectionCard onRefresh={handleRefreshAccounts} />
                </div>
              </div>
            )
          ) : (
            <>

              <ConnectWabaButton />
              <ManualWabaConnect />
            </>
          )}
        </div>

        {/* Help section for first-time users */}
        {!pendingConnection && (
          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10 mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg">
                <Info className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-900 wark:text-white">Need Help Choosing?</h4>
                <p className="text-sm text-slate-600 wark:text-slate-300">
                  Not sure which option to use? Here's what we recommend
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border border-green-200 bg-green-50/50 wark:border-green-700 wark:bg-green-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-800 wark:text-green-300">Recommended for new users</span>
                </div>
                <p className="text-sm text-green-700 wark:text-green-400">
                  <strong>Quick Connect:</strong> If you don't have a WhatsApp Business account yet or want the easiest setup process.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 wark:border-blue-700 wark:bg-blue-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-blue-800 wark:text-blue-300">For existing accounts</span>
                </div>
                <p className="text-sm text-blue-700 wark:text-blue-400">
                  <strong>Manual Connect:</strong> If you already have a WhatsApp Business account and know your WABA ID and Phone Number ID.
                </p>
              </div>
            </div>

            <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-slate-500/10 transition-all duration-300 group-hover:scale-110" />
          </div>
        )}
      </div>
    );
  };

  // ... rest of the existing code remains the same ...
  // Format a message for display
  const formatMessagePreview = (message: string) => {
    if (!message) return "No message content";
    return message.length > 50 ? message.substring(0, 50) + "..." : message;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-900 wark:text-white">Loading dashboard...</p>
              <p className="text-sm text-slate-500">Setting up your workspace</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 p-6">
        {/* Modern Header Section */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 wark:from-muted/40 wark:to-blue-900/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 wark:text-white">Dashboard</h1>
                <p className="text-slate-600 wark:text-slate-300">
                  {user ? `Welcome back, ${user.name?.split(' ')[0]}!` : 'Welcome!'} Here&apos;s your WhatsApp Business overview.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 wark:bg-green-900/30 wark:text-green-400">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 min-w-[140px] justify-between bg-white wark:bg-slate-800">
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
          <div className="flex items-center gap-4 text-sm text-slate-600 wark:text-slate-400 mt-4">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>{wabaAccounts.length} account{wabaAccounts.length !== 1 ? 's' : ''} connected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span>Analytics enabled</span>
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Welcome Alert for first time users */}
        {wabaAccounts.length === 0 && !pendingConnection && (
          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-primary/5 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 wark:from-muted/40 wark:to-primary/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 wark:text-white">
                    Welcome to Zaptick!
                  </h3>
                  <p className="text-slate-600 wark:text-slate-300">
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
                <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg" asChild>
                  <a href="#waba-section">
                    Get Started
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 wark:text-slate-400 wark:hover:text-slate-100">
                  Learn more
                </Button>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-primary/10 transition-all duration-300 group-hover:scale-110" />
          </div>
        )}

        {/* Quick Actions */}
        {wabaAccounts.length > 0 && selectedWabaId && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 wark:text-white">Quick Actions</h2>
                <p className="text-sm text-slate-600 wark:text-slate-300">Jump into the most common tasks</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-purple-50/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-purple-200 cursor-pointer wark:from-muted/40 wark:to-purple-900/10">
                <Link href="/campaigns/create">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <Share2 className="h-5 w-5 text-white" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 wark:text-white group-hover:text-purple-600 transition-colors">New Campaign</h3>
                      <p className="text-sm text-slate-600 wark:text-slate-300 mt-1">Send messages to multiple contacts</p>
                    </div>
                  </div>
                </Link>
                <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-purple-500/10 transition-all duration-300 group-hover:scale-110" />
              </div>

              <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-blue-200 cursor-pointer wark:from-muted/40 wark:to-blue-900/10">
                <Link href="/templates">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 wark:text-white group-hover:text-blue-600 transition-colors">Create Template</h3>
                      <p className="text-sm text-slate-600 wark:text-slate-300 mt-1">Design reusable message templates</p>
                    </div>
                  </div>
                </Link>
                <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
              </div>

              <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-green-200 cursor-pointer wark:from-muted/40 wark:to-green-900/10">
                <Link href="/contacts">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 wark:text-white group-hover:text-green-600 transition-colors">Add Contact</h3>
                      <p className="text-sm text-slate-600 wark:text-slate-300 mt-1">Add new contact to your database</p>
                    </div>
                  </div>
                </Link>
                <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
              </div>

              <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-amber-50/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-amber-200 cursor-pointer wark:from-muted/40 wark:to-amber-900/10">
                <Link href="/automations/workflows">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <Workflow className="h-5 w-5 text-white" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 wark:text-white group-hover:text-amber-600 transition-colors">Create Workflows</h3>
                      <p className="text-sm text-slate-600 wark:text-slate-300 mt-1">Create automation sequences</p>
                    </div>
                  </div>
                </Link>
                <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-amber-500/10 transition-all duration-300 group-hover:scale-110" />
              </div>
            </div>
          </div>
        )}

        {/* WABA Status Card */}
        <div id="waba-section" className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:from-muted/40 wark:to-green-900/10">
          <div className="p-6 border-b border-slate-200 wark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <FaWhatsapp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 wark:text-white">WhatsApp Business Accounts</h2>
                  <p className="text-sm text-slate-600 wark:text-slate-300">
                    Connect and manage your WhatsApp Business accounts to start messaging customers.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {lastRefresh && wabaAccounts.length > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Last updated</p>
                    <p className="text-sm font-medium text-slate-700 wark:text-slate-300">{format(lastRefresh, "HH:mm:ss")}</p>
                  </div>
                )}
                {wabaAccounts.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleRefreshAccounts} className="gap-2 bg-white wark:bg-slate-800">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm mt-4">
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
          <div className="p-6">
            {renderWABASection()}
          </div>
          {wabaAccounts.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-6 p-6 bg-slate-50/50 wark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-sm text-slate-600 wark:text-slate-300">
                <Info className="h-4 w-4" />
                <span>Need help managing your accounts?</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2 bg-white wark:bg-slate-800">
                  <HelpCircle className="h-4 w-4" />
                  Get Help
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-white wark:bg-slate-800" asChild>
                  <a href="https://business.facebook.com/wa/manage/" target="_blank" rel="noopener noreferrer">
                    Meta Business Suite
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}
          {/* Decorative element */}
          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Show dashboard content based on state */}
        {wabaAccounts.length === 0 && !pendingConnection ? (
          <EmptyState />
        ) : (
          <>
            {/* Analytics Tabs Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 wark:text-white">Analytics Dashboard</h2>
                  <p className="text-sm text-slate-600 wark:text-slate-300">
                    Track your WhatsApp Business performance and engagement metrics
                  </p>
                </div>
              </div>

              <Tabs defaultValue="overview" className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <TabsList className="grid w-full max-w-md grid-cols-4 bg-slate-100 wark:bg-slate-800 p-1 rounded-xl">
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
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 bg-white wark:bg-slate-800 hover:bg-slate-50 wark:hover:bg-slate-700">
                      <FileText className="h-4 w-4" />
                      Export Report
                    </Button>
                    <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg">
                      <BarChart3 className="h-4 w-4" />
                      Full Analytics
                    </Button>
                  </div>
                </div>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      title="Delivery Rate"
                      value={`${analytics?.messageMetrics?.deliveryRate || 0}%`}
                      description="Based on all messages sent"
                      icon={CheckCircle}
                      gradient="from-green-500 to-green-600"
                      loading={analyticsLoading}
                    />
                    <StatCard
                      title="Read Rate"
                      value={`${analytics?.messageMetrics?.readRate || 0}%`}
                      description="Of delivered messages"
                      icon={MessageSquare}
                      gradient="from-blue-500 to-blue-600"
                      loading={analyticsLoading}
                    />
                    <StatCard
                      title="Response Rate"
                      value={`${analytics?.messageMetrics?.responseRate || 0}%`}
                      description="Customer replies"
                      icon={ArrowRight}
                      gradient="from-purple-500 to-purple-600"
                      loading={analyticsLoading}
                    />
                    <StatCard
                      title="Avg. Response Time"
                      value={`${analytics?.messageMetrics?.responseTime || 0}h`}
                      description="Time to first response"
                      icon={Clock}
                      gradient="from-amber-500 to-amber-600"
                      loading={analyticsLoading}
                    />
                  </div>

                  {/* Template Performance Card */}
                  <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-gray-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-200 wark:from-muted/40 wark:to-gray-800/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 wark:text-white">Template Performance</h3>
                        <p className="text-sm text-slate-600 wark:text-slate-300">
                          Overview of your most used message templates
                        </p>
                      </div>
                    </div>
                    {analyticsLoading ? (
                      <div className="h-32 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                      </div>
                    ) : analytics?.templateStats?.mostUsed?.length > 0 ? (
                      <div className="rounded-lg border bg-white wark:bg-slate-800">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-slate-50 wark:bg-slate-900">
                            <tr>
                              <th className="px-4 py-3.5 text-left text-sm font-semibold text-slate-700 wark:text-slate-300">
                                Template
                              </th>
                              <th className="px-4 py-3.5 text-left text-sm font-semibold text-slate-700 wark:text-slate-300">
                                Category
                              </th>
                              <th className="px-4 py-3.5 text-left text-sm font-semibold text-slate-700 wark:text-slate-300">
                                Usage
                              </th>
                              <th className="px-4 py-3.5 text-left text-sm font-semibold text-slate-700 wark:text-slate-300">
                                Delivery
                              </th>
                              <th className="px-4 py-3.5 text-left text-sm font-semibold text-slate-700 wark:text-slate-300">
                                Read
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border bg-white wark:bg-slate-800">
                            {analytics.templateStats.mostUsed.map((template: any, index: number) => (
                              <tr key={index} className="hover:bg-slate-50 wark:hover:bg-slate-700">
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900 wark:text-slate-100">
                                  {template.name}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 wark:text-slate-300">
                                  {template.category.toLowerCase()}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900 wark:text-slate-100">
                                  {template.useCount}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900 wark:text-slate-100">
                                  {template.deliveryRate}%
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900 wark:text-slate-100">
                                  {template.readRate}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 space-y-2">
                        <FileText className="h-8 w-8 text-slate-400 mx-auto" />
                        <h3 className="font-medium text-slate-900 wark:text-white">No template data available</h3>
                        <p className="text-sm text-slate-600 wark:text-slate-300">
                          Templates will appear here once you&apos;ve used them to send messages
                        </p>
                        <Button size="sm" className="mt-2 bg-gradient-to-r from-primary to-primary/90 shadow-sm" asChild>
                          <Link href="/templates">Create Template</Link>
                        </Button>
                      </div>
                    )}
                    {/* Decorative element */}
                    <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-slate-500/10 transition-all duration-300 group-hover:scale-110" />
                  </div>
                </TabsContent>

                <TabsContent value="messages" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 wark:from-muted/40 wark:to-blue-900/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                          <PieChart className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 wark:text-white">Message Types</h3>
                      </div>
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
                              <Progress value={24} className="h-2 bg-muted" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                  <span>Customer Service</span>
                                </div>
                                <span className="font-medium">9%</span>
                              </div>
                              <Progress value={9} className="h-2 bg-muted" />
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Decorative element */}
                      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:from-muted/40 wark:to-green-900/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 wark:text-white">Messaging Activity</h3>
                      </div>
                      {analyticsLoading ? (
                        <div className="h-[220px] flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-sm text-slate-600 wark:text-slate-400 flex justify-between">
                            <span>Last 7 days</span>
                            <span className="font-medium text-slate-900 wark:text-slate-100">{analytics?.totalMessages || 0} total</span>
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
                                  <span className="text-xs text-slate-600 wark:text-slate-400 text-center">
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
                                  <span className="text-slate-600 wark:text-slate-400">Busiest day</span>
                                  <span className="font-medium text-slate-900 wark:text-slate-100">
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
                                  <span className="text-slate-600 wark:text-slate-400">Avg. per day</span>
                                  <span className="font-medium text-slate-900 wark:text-slate-100">
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
                      {/* Decorative element */}
                      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-purple-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-purple-200 wark:from-muted/40 wark:to-purple-900/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 wark:text-white">Response Time</h3>
                      </div>
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
                              <span className="text-2xl font-bold text-slate-900 wark:text-white">
                                {analytics?.messageMetrics?.responseTime ?
                                  Math.min(100, Math.round((4 / analytics.messageMetrics.responseTime) * 100)) : 0}%
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 wark:text-slate-400">Within target (4h)</span>
                              <span className="font-medium text-slate-900 wark:text-slate-100">
                                {analytics?.messageMetrics?.responseTime ?
                                  Math.min(100, Math.round((4 / analytics.messageMetrics.responseTime) * 100)) : 0}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 wark:text-slate-400">Average time</span>
                              <span className="font-medium text-slate-900 wark:text-slate-100">{analytics?.messageMetrics?.responseTime || 0} hours</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 wark:text-slate-400">Target time</span>
                              <span className="font-medium text-slate-900 wark:text-slate-100">4 hours</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Decorative element */}
                      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-purple-500/10 transition-all duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button variant="outline" className="gap-2 bg-white wark:bg-slate-800">
                      <PieChart className="h-4 w-4" />
                      View Detailed Message Analytics
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="contacts" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 wark:from-muted/40 wark:to-blue-900/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 wark:bg-blue-900/30">
                          <Users className="h-4 w-4 text-blue-600 wark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 wark:text-slate-200">Total Contacts</span>
                      </div>
                      {analyticsLoading ? (
                        <div className="h-20 flex items-center">
                          <div className="h-6 w-16 bg-muted animate-pulse rounded-md" />
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-slate-900 wark:text-white">{analytics?.totalContacts || 0}</div>
                          <p className="text-xs text-slate-600 wark:text-slate-400 mt-1">
                            {analytics?.contactMetrics?.new > 0
                              ? `+${analytics.contactMetrics.new} in this period`
                              : 'No new contacts in this period'}
                          </p>
                          <div className="mt-4 pt-4 border-t border-slate-200 wark:border-slate-700">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 wark:text-slate-400">Opt-in Rate</span>
                              <span className="font-medium text-slate-900 wark:text-white">100%</span>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:from-muted/40 wark:to-green-900/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 wark:bg-green-900/30">
                          <CheckCircle className="h-4 w-4 text-green-600 wark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 wark:text-slate-200">Active Contacts</span>
                      </div>
                      {analyticsLoading ? (
                        <div className="h-20 flex items-center">
                          <div className="h-6 w-16 bg-muted animate-pulse rounded-md" />
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-slate-900 wark:text-white">
                            {analytics?.totalContacts ?
                              Math.round((parseFloat(analytics.contactMetrics?.engagementRate || "0") / 100) * analytics.totalContacts)
                              : 0}
                          </div>
                          <p className="text-xs text-slate-600 wark:text-slate-400 mt-1">
                            Contacts with conversations
                          </p>
                          <div className="mt-4 pt-4 border-t border-slate-200 wark:border-slate-700">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 wark:text-slate-400">Engagement Rate</span>
                              <span className="font-medium text-slate-900 wark:text-white">{analytics?.contactMetrics?.engagementRate || 0}%</span>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-purple-50/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-purple-200 wark:from-muted/40 wark:to-purple-900/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 wark:bg-purple-900/30">
                          <Plus className="h-4 w-4 text-purple-600 wark:text-purple-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 wark:text-slate-200">New Contacts</span>
                      </div>
                      {analyticsLoading ? (
                        <div className="h-20 flex items-center">
                          <div className="h-6 w-16 bg-muted animate-pulse rounded-md" />
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-slate-900 wark:text-white">{analytics?.contactMetrics?.new || 0}</div>
                          <p className="text-xs text-slate-600 wark:text-slate-400 mt-1">
                            {timeRange === 'today' ? 'Today' :
                              timeRange === 'week' ? 'This week' :
                                timeRange === 'month' ? 'This month' : 'This quarter'}
                          </p>
                          <div className="mt-4 pt-4 border-t border-slate-200 wark:border-slate-700">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 wark:text-slate-400">Growth Rate</span>
                              <span className="font-medium text-slate-900 wark:text-white">
                                {analytics?.totalContacts && analytics?.contactMetrics?.new
                                  ? `+${((analytics.contactMetrics.new / analytics.totalContacts) * 100).toFixed(1)}%`
                                  : '0%'}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-purple-500/10 transition-all duration-300 group-hover:scale-110" />
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-red-50/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-red-200 wark:from-muted/40 wark:to-red-900/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 wark:bg-red-900/30">
                          <AlertCircle className="h-4 w-4 text-red-600 wark:text-red-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 wark:text-slate-200">Unsubscribed</span>
                      </div>
                      {analyticsLoading ? (
                        <div className="h-20 flex items-center">
                          <div className="h-6 w-16 bg-muted animate-pulse rounded-md" />
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-slate-900 wark:text-white">0</div>
                          <p className="text-xs text-slate-600 wark:text-slate-400 mt-1">No unsubscribes recorded</p>
                          <div className="mt-4 pt-4 border-t border-slate-200 wark:border-slate-700">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 wark:text-slate-400">Churn Rate</span>
                              <span className="font-medium text-slate-900 wark:text-white">0%</span>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-red-500/10 transition-all duration-300 group-hover:scale-110" />
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-gray-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-200 wark:from-muted/40 wark:to-gray-800/30">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 wark:text-white">Contact Segments</h3>
                          <p className="text-sm text-slate-600 wark:text-slate-300">
                            Distribution of your contacts by activity status
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 bg-white wark:bg-slate-800" asChild>
                        <Link href="/contacts">
                          <Users className="h-4 w-4" />
                          Manage Contacts
                        </Link>
                      </Button>
                    </div>
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
                            <span className="font-medium text-slate-900 wark:text-white">
                              {analytics?.totalContacts ?
                                Math.round((parseFloat(analytics.contactMetrics?.engagementRate || "0") / 100) * analytics.totalContacts)
                                : 0} ({analytics?.contactMetrics?.engagementRate || 0}%)
                            </span>
                          </div>
                          <Progress value={parseFloat(analytics?.contactMetrics?.engagementRate || "0")} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                              <span>Inactive Contacts</span>
                            </div>
                            <span className="font-medium text-slate-900 wark:text-white">
                              {analytics?.totalContacts ?
                                analytics.totalContacts - Math.round((parseFloat(analytics.contactMetrics?.engagementRate || "0") / 100) * analytics.totalContacts)
                                : 0} ({analytics?.contactMetrics?.engagementRate ? 100 - parseFloat(analytics.contactMetrics.engagementRate) : 0}%)
                            </span>
                          </div>
                          <Progress
                            value={analytics?.contactMetrics?.engagementRate ? 100 - parseFloat(analytics.contactMetrics.engagementRate) : 0}
                            className="h-2 bg-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-green-500"></div>
                              <span>New Contacts</span>
                            </div>
                            <span className="font-medium text-slate-900 wark:text-white">
                              {analytics?.contactMetrics?.new || 0} ({analytics?.totalContacts ?
                                ((analytics?.contactMetrics?.new || 0) / analytics.totalContacts * 100).toFixed(1) : 0}%)
                            </span>
                          </div>
                          <Progress
                            value={analytics?.totalContacts ?
                              (analytics?.contactMetrics?.new || 0) / analytics.totalContacts * 100 : 0}
                            className="h-2 bg-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-red-500"></div>
                              <span>Unsubscribed</span>
                            </div>
                            <span className="font-medium text-slate-900 wark:text-white">0 (0%)</span>
                          </div>
                          <Progress value={0} className="h-2 bg-muted" />
                        </div>
                      </div>
                    )}
                    <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-slate-500/10 transition-all duration-300 group-hover:scale-110" />
                  </div>
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:from-muted/40 wark:to-green-900/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 wark:text-white">Template Status</h3>
                      </div>
                      {analyticsLoading ? (
                        <div className="h-32 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                        </div>
                      ) : (
                        <>
                          <div className="pt-2 grid grid-cols-3 gap-4 text-center">
                            <div className="space-y-1">
                              <div className="text-xl font-bold text-green-600 wark:text-green-400">
                                {analytics?.templateStats?.approved || 0}
                              </div>
                              <p className="text-xs text-slate-600 wark:text-slate-400">Approved</p>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xl font-bold text-amber-600 wark:text-amber-400">
                                {analytics?.templateStats?.pending || 0}
                              </div>
                              <p className="text-xs text-slate-600 wark:text-slate-400">Pending</p>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xl font-bold text-red-600 wark:text-red-400">
                                {analytics?.templateStats?.rejected || 0}
                              </div>
                              <p className="text-xs text-slate-600 wark:text-slate-400">Rejected</p>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 wark:text-slate-400">Approval Rate</span>
                              <span className="font-medium text-slate-900 wark:text-white">
                                {analytics?.templateStats?.approved && analytics?.templateStats?.total
                                  ? Math.round((analytics.templateStats.approved / analytics.templateStats.total) * 100)
                                  : 0}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 wark:text-slate-400">Total Templates</span>
                              <span className="font-medium text-slate-900 wark:text-white">{analytics?.templateStats?.total || 0}</span>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 wark:from-muted/40 wark:to-blue-900/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 wark:text-white">Template Categories</h3>
                      </div>
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
                              <span className="font-medium text-slate-900 wark:text-white">{analytics?.templateStats?.categories?.marketing || 0}</span>
                            </div>
                            <Progress
                              value={analytics?.templateStats?.total
                                ? (analytics?.templateStats?.categories?.marketing / analytics?.templateStats?.total) * 100
                                : 0}
                              className="h-2 bg-muted"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                <span>Utility</span>
                              </div>
                              <span className="font-medium text-slate-900 wark:text-white">{analytics?.templateStats?.categories?.utility || 0}</span>
                            </div>
                            <Progress
                              value={analytics?.templateStats?.total
                                ? (analytics?.templateStats?.categories?.utility / analytics?.templateStats?.total) * 100
                                : 0}
                              className="h-2 bg-muted"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                                <span>Authentication</span>
                              </div>
                              <span className="font-medium text-slate-900 wark:text-white">{analytics?.templateStats?.categories?.authentication || 0}</span>
                            </div>
                            <Progress
                              value={analytics?.templateStats?.total
                                ? (analytics?.templateStats?.categories?.authentication / analytics?.templateStats?.total) * 100
                                : 0}
                              className="h-2 bg-muted"
                            />
                          </div>
                        </div>
                      )}
                      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-purple-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-purple-200 wark:from-muted/40 wark:to-purple-900/10 flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 wark:text-white">Template Performance</h3>
                      </div>
                      {analyticsLoading ? (
                        <div className="h-32 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                        </div>
                      ) : analytics?.templateStats?.mostUsed?.length > 0 ? (
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="rounded-lg border overflow-hidden bg-white wark:bg-slate-800">
                            <table className="min-w-full">
                              <thead className="bg-slate-50 wark:bg-slate-900">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-700 wark:text-slate-300">
                                    Name
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-slate-700 wark:text-slate-300">
                                    Sent
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-slate-700 wark:text-slate-300">
                                    Delivered
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-slate-700 wark:text-slate-300">
                                    Read
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {analytics.templateStats.mostUsed.map((template: any, index: number) => (
                                  <tr key={index} className="hover:bg-slate-50 wark:hover:bg-slate-700">
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-900 wark:text-slate-100">
                                      {template.name}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-slate-900 wark:text-slate-100">
                                      {template.useCount}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-slate-900 wark:text-slate-100">
                                      {Math.round((template.deliveryRate / 100) * template.useCount)} ({template.deliveryRate}%)
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-slate-900 wark:text-slate-100">
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
                            <FileText className="h-8 w-8 text-slate-400 mx-auto" />
                            <p className="text-sm text-slate-600 wark:text-slate-300">No template data available</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-purple-500/10 transition-all duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button className="gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg" asChild>
                      <Link href="/templates">
                        <FileText className="h-4 w-4" />
                        Create New Template
                      </Link>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Help and Tips Card */}
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 wark:from-muted/40 wark:to-blue-900/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 wark:text-white">Tips & Best Practices</h2>
                    <p className="text-sm text-slate-600 wark:text-slate-300">
                      Expert recommendations to optimize your WhatsApp Business
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-blue-50 wark:hover:bg-blue-900/20">
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="group/card relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 wark:from-muted/40 wark:to-green-900/10">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover/card:scale-110 transition-transform duration-300">
                      <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 wark:text-white mb-2">
                        Comply with WhatsApp Policies
                      </h3>
                      <p className="text-sm text-slate-600 wark:text-slate-300 leading-relaxed">
                        Ensure your messages adhere to WhatsApp Business Policies for better delivery rates
                      </p>
                      <Link href='/help/whatsapp-policies'>
                        <Button variant="ghost" size="sm" className="mt-3 h-8 px-3 text-xs text-green-600 hover:bg-green-50 wark:text-green-400 wark:hover:bg-green-900/20">
                          Learn more →
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover/card:scale-110" />
                </div>

                <div className="group/card relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 wark:from-muted/40 wark:to-blue-900/10">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover/card:scale-110 transition-transform duration-300">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 wark:text-white mb-2">
                        Template Best Practices
                      </h3>
                      <p className="text-sm text-slate-600 wark:text-slate-300 leading-relaxed">
                        Tips for creating templates that get approved quickly and perform well
                      </p>
                      <Link href='/help/template-best-practices'>
                        <Button variant="ghost" size="sm" className="mt-3 h-8 px-3 text-xs text-blue-600 hover:bg-blue-50 wark:text-blue-400 wark:hover:bg-blue-900/20">
                          Learn more →
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover/card:scale-110" />
                </div>

                <div className="group/card relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-purple-50/30 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 wark:from-muted/40 wark:to-purple-900/10">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover/card:scale-110 transition-transform duration-300">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 wark:text-white mb-2">
                        Increase Engagement
                      </h3>
                      <p className="text-sm text-slate-600 wark:text-slate-300 leading-relaxed">
                        Strategies to boost customer interaction and response rates
                      </p>
                      <Link href='/help/increase-engagement'>
                        <Button variant="ghost" size="sm" className="mt-3 h-8 px-3 text-xs text-purple-600 hover:bg-purple-50 wark:text-purple-400 wark:hover:bg-purple-900/20">
                          Learn more →
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-purple-500/10 transition-all duration-300 group-hover/card:scale-110" />
                </div>
              </div>

              {/* Decorative element */}
              <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
            </div>


          </>
        )}
      </div>
    </Layout>
  );
}
