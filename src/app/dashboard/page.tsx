"use client";

import { useState } from "react";
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
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";

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

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "quarter">("week");

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s an overview of your WhatsApp Business account.
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
            <Button>
              Connect New WABA
            </Button>
          </div>
        </div>

        {/* WABA Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">WhatsApp Business Accounts</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <CardDescription>
              Manage your connected WhatsApp Business Accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
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
                  <h3 className="font-semibold">Acme Inc.</h3>
                  <p className="text-sm text-muted-foreground">Connected on {format(new Date(), "MMM d, yyyy")}</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">85 templates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">5 team members</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <a href="/settings/waba">Manage Account</a>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-dashed">
                <CardContent className="flex h-full flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-3">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-1 font-semibold">Add a new WhatsApp Business Account</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Connect to Meta Business Manager to add a new account
                  </p>
                  <Button>Connect Now</Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Stats row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15,231</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">423</div>
              <p className="text-xs text-muted-foreground">
                +4.5% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,782</div>
              <p className="text-xs text-muted-foreground">
                +12.2% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Message Read Rate</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">
                +1.2% from last period
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
            <Card>
              <CardHeader>
                <CardTitle>Message Activity</CardTitle>
                <CardDescription>
                  Message volume and engagement across your WhatsApp accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DummyChart height={250} />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Top Templates</CardTitle>
                  <CardDescription>
                    Your most used message templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-full">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">order_confirmation</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.floor(Math.random() * 98 + 1)}% delivery rate
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${Math.floor(Math.random() * 98 + 1)}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Message Status</CardTitle>
                  <CardDescription>
                    Distribution of message status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="h-40 w-40 rounded-full border-8 border-primary border-r-muted relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-2xl font-bold">84%</div>
                        <div className="text-xs text-muted-foreground">delivered</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <span className="text-sm">Delivered</span>
                      </div>
                      <span className="text-sm font-medium">12,544</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-muted" />
                        <span className="text-sm">Failed</span>
                      </div>
                      <span className="text-sm font-medium">2,389</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

       <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Message Volume</CardTitle>
                <CardDescription>
                  Total messages sent and received over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DummyChart height={250} />
              </CardContent>
              <CardFooter className="border-t px-6">
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-sm">Outbound</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-muted" />
                    <span className="text-sm">Inbound</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Total: 24,389</span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Message Types</CardTitle>
                  <CardDescription>
                    Distribution by message type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Text", value: 68, total: 10452 },
                      { name: "Template", value: 22, total: 3384 },
                      { name: "Media", value: 7, total: 1078 },
                      { name: "Interactive", value: 3, total: 462 },
                    ].map((type) => (
                      <div key={type.name} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{type.name}</span>
                          <span className="text-sm text-muted-foreground">{type.total} messages</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${type.value}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{type.value}% of total</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Performance</CardTitle>
                  <CardDescription>
                    Message delivery and read rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Delivery Rate</span>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: "94%" }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">14,455 of 15,377 messages delivered</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Read Rate</span>
                        <span className="text-sm font-medium">86%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: "86%" }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">12,431 of 14,455 messages read</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Response Rate</span>
                        <span className="text-sm font-medium">42%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-purple-500"
                          style={{ width: "42%" }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">6,071 of 14,455 messages received responses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Growth</CardTitle>
                <CardDescription>
                  New contacts added over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DummyChart height={250} />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Segments</CardTitle>
                  <CardDescription>
                    Distribution by contact attributes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Active", value: 76, count: 2874 },
                      { name: "Inactive (30+ days)", value: 24, count: 908 },
                    ].map((segment) => (
                      <div key={segment.name} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{segment.name}</span>
                          <span className="text-sm text-muted-foreground">{segment.count} contacts</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${segment.value}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{segment.value}% of total</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 space-y-4">
                    <h4 className="text-sm font-medium">Top Contact Groups</h4>
                    <div className="space-y-4">
                      {[
                        { name: "Newsletter Subscribers", count: 1245 },
                        { name: "Recent Customers", count: 867 },
                        { name: "Product Updates", count: 532 },
                      ].map((group) => (
                        <div key={group.name} className="flex items-center justify-between">
                          <span className="text-sm">{group.name}</span>
                          <span className="text-sm font-medium">{group.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="/contacts">View All Contacts</a>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Opt-In Status</CardTitle>
                  <CardDescription>
                    Contact subscription status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-4">
                    <div className="relative h-40 w-40">
                      {/* This would be a real chart in production */}
                      <div className="absolute h-40 w-40 rounded-full border-8 border-green-500 border-r-transparent rotate-[45deg]" />
                      <div className="absolute h-40 w-40 rounded-full border-8 border-yellow-500 border-l-transparent border-b-transparent rotate-[180deg]" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-2xl font-bold">3,782</div>
                        <div className="text-xs text-muted-foreground">total contacts</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-sm">Opted In</span>
                      </div>
                      <span className="text-sm font-medium">3,324 (88%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <span className="text-sm">Opted Out</span>
                      </div>
                      <span className="text-sm font-medium">458 (12%)</span>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <h4 className="text-sm font-medium">Recent Activity</h4>
                    <div className="space-y-2">
                      {[
                        { action: "Opted In", count: 24, time: "Today" },
                        { action: "Opted Out", count: 8, time: "Today" },
                        { action: "Opted In", count: 156, time: "This Week" },
                      ].map((activity, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${activity.action === "Opted In" ? "bg-green-500" : "bg-yellow-500"}`} />
                            <span className="text-sm">{activity.action}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{activity.count} ({activity.time})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Performance</CardTitle>
                <CardDescription>
                  Delivery and response metrics for message templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DummyChart height={250} />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Template Status</CardTitle>
                  <CardDescription>
                    Status of your message templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { status: "Approved", count: 54, color: "bg-green-500" },
                      { status: "Pending", count: 12, color: "bg-yellow-500" },
                      { status: "Rejected", count: 3, color: "bg-red-500" },
                    ].map((status) => (
                      <div key={status.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${status.color}`} />
                          <span className="text-sm">{status.status}</span>
                        </div>
                        <span className="text-sm font-medium">{status.count}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <h4 className="text-sm font-medium mb-4">Template Categories</h4>
                    <div className="h-40">
                      <div className="flex h-full">
                        <div className="bg-purple-500 h-full w-1/2" style={{ width: "60%" }}></div>
                        <div className="bg-blue-500 h-full" style={{ width: "25%" }}></div>
                        <div className="bg-green-500 h-full" style={{ width: "15%" }}></div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-purple-500" />
                          <span className="text-sm">Marketing</span>
                        </div>
                        <span className="text-sm">60% (41 templates)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-blue-500" />
                          <span className="text-sm">Utility</span>
                        </div>
                        <span className="text-sm">25% (17 templates)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                          <span className="text-sm">Authentication</span>
                        </div>
                        <span className="text-sm">15% (11 templates)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="/templates">Manage Templates</a>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Top Performing Templates</CardTitle>
                      <CardDescription>
                        Templates with highest delivery and response rates
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View All</DropdownMenuItem>
                        <DropdownMenuItem>Sort by Delivery Rate</DropdownMenuItem>
                        <DropdownMenuItem>Sort by Response Rate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { name: "order_confirmation", category: "UTILITY", deliveryRate: 98, responseRate: 42 },
                      { name: "appointment_reminder", category: "UTILITY", deliveryRate: 97, responseRate: 38 },
                      { name: "shipping_update", category: "UTILITY", deliveryRate: 96, responseRate: 21 },
                      { name: "special_offer", category: "MARKETING", deliveryRate: 93, responseRate: 15 },
                    ].map((template, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{template.name}</span>
                            <Badge variant="outline" className="h-5 text-xs">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Delivery</span>
                              <span className="text-xs font-medium">{template.deliveryRate}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted">
                              <div
                                className="h-1.5 rounded-full bg-green-500"
                                style={{ width: `${template.deliveryRate}%` }}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Response</span>
                              <span className="text-xs font-medium">{template.responseRate}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted">
                              <div
                                className="h-1.5 rounded-full bg-blue-500"
                                style={{ width: `${template.responseRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button size="sm" className="w-full" asChild>
                    <a href="/templates/create">Create New Template</a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
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
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: "message", name: "Sarah Johnson", action: "sent a message", time: "10 minutes ago", content: "I'd like to know more about your product..." },
                { type: "template", name: "Order Confirmation", action: "was sent to 37 contacts", time: "1 hour ago" },
                { type: "contact", name: "John Smith", action: "was added to group", time: "2 hours ago", group: "Premium Customers" },
                { type: "status", name: "Marketing Campaign", action: "completed", time: "5 hours ago", result: "152 messages delivered" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`mt-0.5 rounded-full p-2 ${
                    activity.type === "message" ? "bg-blue-100 text-blue-600" :
                    activity.type === "template" ? "bg-purple-100 text-purple-600" :
                    activity.type === "contact" ? "bg-green-100 text-green-600" :
                    "bg-orange-100 text-orange-600"
                  }`}>
                    {activity.type === "message" && <MessageSquare className="h-4 w-4" />}
                    {activity.type === "template" && <FileText className="h-4 w-4" />}
                    {activity.type === "contact" && <User className="h-4 w-4" />}
                    {activity.type === "status" && <Info className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        <span className="font-semibold">{activity.name}</span> {activity.action}
                        {activity.group && <span className="font-medium"> {activity.group}</span>}
                      </p>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                    {activity.content && (
                      <p className="text-sm text-muted-foreground">{activity.content}</p>
                    )}
                    {activity.result && (
                      <p className="text-sm text-muted-foreground">{activity.result}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
