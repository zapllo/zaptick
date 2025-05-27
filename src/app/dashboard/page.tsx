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
  ArrowUpRight,
  BarChart,
  ChevronDown,
  MessageSquare,
  MoreHorizontal,
  Phone,
  User,
  Users,
  Info,
  FileText,
  ArrowRight,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import ConnectWabaButton from "@/components/connectWABA";
import { useAuth } from "@/contexts/AuthContext";

// This would use a chart library like recharts in a real app
const DummyChart = ({ height = 200 }: { height?: number }) => (
  <div
    className="w-full rounded-md bg-gradient-to-r from-muted/70 to-muted"
    style={{ height: `${height}px` }}
  >
    <div className="h-full w-full flex items-center justify-center">
      <BarChart className="text-muted-foreground/30 h-12 w-12" />
    </div>
  </div>
);

// Empty state component
const EmptyState = () => (
  <Card className="p-8 flex flex-col items-center justify-center">
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
  </Card>
);

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "quarter">("week");
  const [loading, setLoading] = useState(true);
  const [wabaAccounts, setWabaAccounts] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // In a real app, you would fetch this data from your API
        const response = await fetch('/api/user/waba-accounts');
        if (response.ok) {
          const data = await response.json();
          setWabaAccounts(data.wabaAccounts || []);
        }
      } catch (error) {
        console.error("Error fetching WABA accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    // Simulate API call for demo
    setTimeout(() => {
      if (user?.id) {
        setWabaAccounts([]);
        setLoading(false);
      }
    }, 1000);

  }, [user?.id]);

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
              {wabaAccounts.length > 0 && (
                <Button variant="ghost" size="sm">View All</Button>
              )}
            </div>
            <CardDescription>
              Manage your connected WhatsApp Business Accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading your accounts...</span>
              </div>
            ) : wabaAccounts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {wabaAccounts.map((account, index) => (
                  <Card key={account.wabaId || index}>
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Official</Badge>
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
                      <p className="text-sm text-muted-foreground">Connected on {format(new Date(account.connectedAt), "MMM d, yyyy")}</p>
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
                          <span className="text-sm">1 team member</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button size="sm" variant="outline" className="w-full" asChild>
                        <a href="/settings/waba">Manage Account</a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                <ConnectWabaButton />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ConnectWabaButton />
              </div>
            )}
          </CardContent>
        </Card>

        {wabaAccounts.length === 0 ? (
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
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Create templates to start messaging
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
                  <h3 className="text-xl font-medium mb-2">No Data to Display Yet</h3>
                  <p className="text-center text-muted-foreground mb-6 max-w-md">
                    Start sending messages to see analytics data. Connect your WhatsApp Business Account and create templates to get started.
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
                  <h3 className="text-xl font-medium mb-2">No Messages Sent Yet</h3>
                  <p className="text-center text-muted-foreground mb-6 max-w-md">
                    Start sending messages to view your message analytics. Create and send your first template message to get started.
                  </p>
                  <Button size="sm" className="gap-2">
                    Send Your First Message <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              </TabsContent>

              <TabsContent value="contacts" className="space-y-4">
                <Card className="flex flex-col items-center justify-center p-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Contacts Added Yet</h3>
                  <p className="text-center text-muted-foreground mb-6 max-w-md">
                    Import or add contacts to start messaging. You can upload a CSV file or add contacts manually.
                  </p>
                  <Button size="sm" className="gap-2">
                    Add Your First Contact <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              </TabsContent>

              <TabsContent value="templates" className="space-y-4">
                <Card className="flex flex-col items-center justify-center p-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Templates Created Yet</h3>
                  <p className="text-center text-muted-foreground mb-6 max-w-md">
                    Create message templates to send to your contacts. Templates need to be approved before they can be used.
                  </p>
                  <Button size="sm" className="gap-2">
                    Create Your First Template <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest conversations and events
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Info className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
                  <p className="text-center text-muted-foreground max-w-sm">
                    Your recent WhatsApp activity will appear here once you start sending and receiving messages.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
