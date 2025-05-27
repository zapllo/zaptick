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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowRight,
  BarChart,
  ChevronDown,
  MessageSquare,
  MoreHorizontal,
  Phone,
  User,
  Users,
  Info,
  FileText,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import ConnectWabaButton from "@/components/connectWABA";
import ManualWabaConnect from "@/components/ManualWabaConnect";
import { useAuth } from "@/contexts/AuthContext";

// Empty state component
const EmptyState = () => (
  <Card className="p-8 flex flex-col items-center justify-center">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <MessageSquare className="h-8 w-8 text-primary" />
    </div>
    <h3 className="text-xl font-medium mb-2">No WhatsApp Accounts Connected</h3>
    <p className="text-center text-muted-foreground mb-6 max-w-md">
      Connect your WhatsApp Business Account to start sending messages and managing your templates.
      Choose to create a new account or connect an existing one.
    </p>
    <Button size="lg" className="gap-2" asChild>
      <a href="#waba-section">
        Connect Your Account <ArrowRight className="h-4 w-4" />
      </a>
    </Button>
  </Card>
);

// Pending connection state
const PendingConnectionCard = ({ onRefresh }: { onRefresh: () => void }) => (
  <Card className="flex flex-col justify-center items-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-dashed border-2 border-yellow-200 dark:border-yellow-800 h-full">
    <CardHeader className="text-center">
      <CardDescription className="text-yellow-700 dark:text-yellow-300">
        WhatsApp Business Account Setup
      </CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
        <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400 animate-pulse" />
      </div>
      <div className="text-center">
        <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
          Connection in Progress
        </h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-300 px-4 mb-4">
          Your WhatsApp Business Account is being processed by Interakt. This usually takes 2-5 minutes.
        </p>
        <div className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
          <div>✅ WABA details submitted</div>
          <div>🔄 Interakt processing your account...</div>
          <div>⏳ Setting up credit line and verification</div>
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Processing...
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
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
  <Card className="flex flex-col justify-center items-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-dashed border-2 border-red-200 dark:border-red-800 h-full">
    <CardHeader className="text-center">
      <CardDescription className="text-red-700 dark:text-red-300">
        Connection Issue
      </CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <div className="text-center">
        <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">
          Setup Taking Longer Than Expected
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 px-4">
          Your WABA setup might have encountered an issue or is taking longer than usual. You can try again or contact support.
        </p>
      </div>
    </CardContent>
    <CardFooter className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onClearState}
        className="text-red-700 border-red-300 hover:bg-red-50"
      >
        Try Again
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="text-red-700 border-red-300 hover:bg-red-50"
      >
        Contact Support
      </Button>
    </CardFooter>
  </Card>
);

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "quarter">("week");
  const [loading, setLoading] = useState(true);
  const [wabaAccounts, setWabaAccounts] = useState<any[]>([]);
  const [pendingConnection, setPendingConnection] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
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

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

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

  const handleClearPendingState = () => {
    clearPendingState();
  };

  const handleContactSupport = () => {
    // You can implement this to open a support ticket or contact form
    window.open('mailto:support@zaptick.io?subject=WABA Connection Issue', '_blank');
  };

  const renderWABASection = () => {
    if (loading && !pendingConnection) {
      return (
        <div className="py-12 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading your accounts...</span>
        </div>
      );
    }

    if (wabaAccounts.length > 0) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wabaAccounts.map((account, index) => (
            <Card key={account.wabaId || index}>
              <CardHeader className="pb-2 pt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                    {account.provider === 'interakt' && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        Interakt
                      </Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Refresh Connection</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Disconnect</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <h3 className="font-semibold">{account.businessName}</h3>
                <p className="text-sm text-muted-foreground">
                  Connected on {format(new Date(account.connectedAt), "MMM d, yyyy")}
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{account.phoneNumber || "No phone number"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{account.templateCount || 0} templates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">WABA: {account.wabaId}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button size="sm" variant="outline" className="w-full">
                  Manage Account
                </Button>
              </CardFooter>
            </Card>
          ))}

          {/* Show connection options only if no pending connection */}
          {!pendingConnection && (
            <>
              <ConnectWabaButton />
              <ManualWabaConnect />
            </>
          )}
        </div>
      );
    }

    // No accounts, show appropriate state
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              {user ? `Welcome back, ${user.name}!` : 'Welcome!'} Here&apos;s an overview of your WhatsApp Business account.
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {timeRange === "today" && "Today"}
                  {timeRange === "week" && "This Week"}
                  {timeRange === "month" && "This Month"}
                  {timeRange === "quarter" && "This Quarter"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTimeRange("today")}>Today</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("week")}>This Week</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("month")}>This Month</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("quarter")}>This Quarter</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* WABA Status Card */}
        <Card id="waba-section">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">WhatsApp Business Accounts</CardTitle>
              <div className="flex items-center gap-2">
                {lastRefresh && (
                  <span className="text-xs text-muted-foreground">
                    Last updated: {format(lastRefresh, "HH:mm:ss")}
                  </span>
                )}
                {wabaAccounts.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleRefreshAccounts}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                )}
              </div>
            </div>
            <CardDescription>
              Connect a new WhatsApp Business Account or manage existing ones.
              You can create a new account through Facebook or connect an existing one directly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderWABASection()}
          </CardContent>
        </Card>

        {/* Show dashboard content based on state */}
        {wabaAccounts.length === 0 && !pendingConnection ? (
          <EmptyState />
        ) : (
          <>
            {/* Stats row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Start sending messages to see stats
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    No active conversations yet
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Import contacts to get started
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Message Templates</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{wabaAccounts.reduce((acc, account) => acc + (account.templateCount || 0), 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {wabaAccounts.length > 0 ? 'Templates available' : 'Create templates to start messaging'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Overview */}
            <Tabs defaultValue="overview" className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="contacts">Contacts</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>
                <div className="hidden md:flex gap-2">
                  <Button variant="outline" size="sm">Export</Button>
                  <Button size="sm">View Full Analytics</Button>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-4">
                <Card className="flex flex-col items-center justify-center p-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Analytics Coming Soon</h3>
                  <p className="text-center text-muted-foreground mb-6 max-w-md">
                    Start sending messages to see detailed analytics and insights about your WhatsApp Business performance.
                  </p>
                  <Button size="sm" className="gap-2">
                    Create Your First Template <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="space-y-4">
                <Card className="flex flex-col items-center justify-center p-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Messages Yet</h3>
                  <p className="text-center text-muted-foreground mb-6 max-w-md">
                    Connect your WhatsApp Business Account to start sending and receiving messages.
                  </p>
                </Card>
              </TabsContent>

              <TabsContent value="contacts" className="space-y-4">
                <Card className="flex flex-col items-center justify-center p-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Contacts Yet</h3>
                  <p className="text-center text-muted-foreground mb-6 max-w-md">
                    Import your contacts to start managing your customer relationships.
                  </p>
                </Card>
              </TabsContent>

              <TabsContent value="templates" className="space-y-4">
                <Card className="flex flex-col items-center justify-center p-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Templates Yet</h3>
                  <p className="text-center text-muted-foreground mb-6 max-w-md">
                    Create message templates to streamline your WhatsApp communications.
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
}
