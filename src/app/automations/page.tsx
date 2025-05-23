"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Trash,
  Copy,
  Edit,
  MessageSquare,
  ArrowRight,
  Check,
  Clock,
  Calendar,
  Filter,
  Activity,
  ShoppingCart,
  Tag,
  CalendarClock,
  User,
  AlarmClock,
  Zap,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { format, subDays } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

// Mock data for automations
const automations = [
  {
    id: 1,
    name: "Welcome Message",
    description: "Send a welcome message to new subscribers",
    status: "active",
    trigger: "subscription",
    action: "send_message",
    template: "welcome_message",
    createdAt: new Date(2023, 3, 15),
    lastTriggered: new Date(2023, 5, 16, 14, 35),
    totalExecutions: 248,
    successRate: 98.4,
    stats: {
      delivered: 244,
      read: 215,
      replied: 87,
      failed: 4
    },
    icon: "user"
  },
  {
    id: 2,
    name: "Abandoned Cart Reminder",
    description: "Remind customers about items left in their cart",
    status: "active",
    trigger: "abandoned_cart",
    action: "send_message",
    template: "cart_reminder",
    createdAt: new Date(2023, 4, 20),
    lastTriggered: new Date(2023, 5, 16, 9, 42),
    totalExecutions: 156,
    successRate: 95.5,
    stats: {
      delivered: 149,
      read: 132,
      replied: 53,
      failed: 7
    },
    icon: "cart"
  },
  {
    id: 3,
    name: "Order Confirmation",
    description: "Send order confirmation after purchase",
    status: "active",
    trigger: "new_order",
    action: "send_message",
    template: "order_confirmation",
    createdAt: new Date(2023, 2, 10),
    lastTriggered: new Date(2023, 5, 16, 15, 12),
    totalExecutions: 892,
    successRate: 99.2,
    stats: {
      delivered: 885,
      read: 872,
      replied: 134,
      failed: 7
    },
    icon: "cart"
  },
  {
    id: 4,
    name: "Appointment Reminder",
    description: "Remind customers about upcoming appointments",
    status: "paused",
    trigger: "scheduled_event",
    action: "send_message",
    template: "appointment_reminder",
    createdAt: new Date(2023, 5, 1),
    lastTriggered: new Date(2023, 5, 12, 10, 0),
    totalExecutions: 87,
    successRate: 100,
    stats: {
      delivered: 87,
      read: 85,
      replied: 67,
      failed: 0
    },
    icon: "calendar"
  },
  {
    id: 5,
    name: "Re-engagement Campaign",
    description: "Reach out to inactive customers",
    status: "draft",
    trigger: "inactivity",
    action: "send_message",
    template: "re_engagement",
    createdAt: new Date(2023, 5, 10),
    lastTriggered: null,
    totalExecutions: 0,
    successRate: 0,
    stats: {
      delivered: 0,
      read: 0,
      replied: 0,
      failed: 0
    },
    icon: "activity"
  },
  {
    id: 6,
    name: "Product Feedback Request",
    description: "Ask for feedback after product delivery",
    status: "active",
    trigger: "time_after_event",
    action: "send_message",
    template: "feedback_request",
    createdAt: new Date(2023, 4, 5),
    lastTriggered: new Date(2023, 5, 15, 16, 25),
    totalExecutions: 243,
    successRate: 97.1,
    stats: {
      delivered: 236,
      read: 198,
      replied: 121,
      failed: 7
    },
    icon: "tag"
  },
];

type AutomationStatus = "active" | "paused" | "draft";

// Helper function to get the status badge color
const getStatusColor = (status: AutomationStatus) => {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "paused":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "draft":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

// Helper function to get the trigger name
const getTriggerName = (trigger: string) => {
  switch (trigger) {
    case "subscription":
      return "New Subscription";
    case "abandoned_cart":
      return "Abandoned Cart";
    case "new_order":
      return "New Order";
    case "scheduled_event":
      return "Scheduled Event";
    case "inactivity":
      return "Customer Inactivity";
    case "time_after_event":
      return "Time After Event";
    default:
      return trigger.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

// Helper function to get trigger icon
const getTriggerIcon = (icon: string) => {
  switch (icon) {
    case "user":
      return <User className="h-5 w-5" />;
    case "cart":
      return <ShoppingCart className="h-5 w-5" />;
    case "calendar":
      return <Calendar className="h-5 w-5" />;
    case "activity":
      return <Activity className="h-5 w-5" />;
    case "tag":
      return <Tag className="h-5 w-5" />;
    default:
      return <Zap className="h-5 w-5" />;
  }
};

export default function AutomationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [createAutomationOpen, setCreateAutomationOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filter automations based on search and status
  const filteredAutomations = automations.filter(automation => {
    // Search filter
    const matchesSearch = searchQuery === "" ||
      automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = selectedStatus === "" || automation.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Automations</h2>
            <p className="text-muted-foreground">
              Create automated workflows to engage with your contacts
            </p>
          </div>
          <Button onClick={() => setCreateAutomationOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Automation
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search automations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("grid")}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path d="M2 2.5C2 2.22386 2.22386 2 2.5 2H5.5C5.77614 2 6 2.22386 6 2.5V5.5C6 5.77614 5.77614 6 5.5 6H2.5C2.22386 6 2 5.77614 2 5.5V2.5ZM9 2.5C9 2.22386 9.22386 2 9.5 2H12.5C12.7761 2 13 2.22386 13 2.5V5.5C13 5.77614 12.7761 6 12.5 6H9.5C9.22386 6 9 5.77614 9 5.5V2.5ZM2 9.5C2 9.22386 2.22386 9 2.5 9H5.5C5.77614 9 6 9.22386 6 9.5V12.5C6 12.7761 5.77614 13 5.5 13H2.5C2.22386 13 2 12.7761 2 12.5V9.5ZM9 9.5C9 9.22386 9.22386 9 9.5 9H12.5C12.7761 9 13 9.22386 13 9.5V12.5C13 12.7761 12.7761 13 12.5 13H9.5C9.22386 13 9 12.7761 9 12.5V9.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("table")}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path d="M1.5 2C1.22386 2 1 2.22386 1 2.5V12.5C1 12.7761 1.22386 13 1.5 13H13.5C13.7761 13 14 12.7761 14 12.5V2.5C14 2.22386 13.7761 2 13.5 2H1.5ZM2 3H13V7H2V3ZM2 8H7V12H2V8ZM8 8H13V12H8V8Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </Button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAutomations.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-48 bg-muted/20 rounded-lg border">
                <p className="text-muted-foreground">No automations found. Try adjusting your search or create a new one.</p>
              </div>
            ) : (
              filteredAutomations.map((automation) => (
                <Card key={automation.id} className="group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3 items-start">
                        <div className={`rounded-md p-2 ${
                          automation.icon === "user" ? "bg-blue-500/10 text-blue-500" :
                          automation.icon === "cart" ? "bg-green-500/10 text-green-500" :
                          automation.icon === "calendar" ? "bg-purple-500/10 text-purple-500" :
                          automation.icon === "activity" ? "bg-orange-500/10 text-orange-500" :
                          automation.icon === "tag" ? "bg-indigo-500/10 text-indigo-500" :
                          "bg-primary/10 text-primary"
                        }`}>
                          {getTriggerIcon(automation.icon)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{automation.name}</CardTitle>
                          <CardDescription className="line-clamp-1">{automation.description}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedAutomation(automation.id)}>
                            <Info className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          {automation.status === "active" && (
                            <DropdownMenuItem>
                              <Pause className="mr-2 h-4 w-4" />
                              <span>Pause</span>
                            </DropdownMenuItem>
                          )}
                          {automation.status === "paused" && (
                            <DropdownMenuItem>
                              <Play className="mr-2 h-4 w-4" />
                              <span>Activate</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Trigger: {getTriggerName(automation.trigger)}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusColor(automation.status as AutomationStatus)}
                      >
                        {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                      </Badge>
                    </div>

                    {automation.status !== "draft" && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Success Rate</span>
                            <span className="font-medium">{automation.successRate}%</span>
                          </div>
                          <Progress value={automation.successRate} className="h-1.5" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center text-sm">
                          <div className="bg-muted/30 rounded-md p-2">
                            <div className="font-medium">{automation.totalExecutions}</div>
                            <div className="text-xs text-muted-foreground">Total Executions</div>
                          </div>
                          <div className="bg-muted/30 rounded-md p-2">
                            <div className="font-medium">{automation.stats.replied}</div>
                            <div className="text-xs text-muted-foreground">Replies</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span>{format(automation.createdAt, "MMM d, yyyy")}</span>
                      </div>
                      {automation.lastTriggered && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Triggered</span>
                          <span>{format(automation.lastTriggered, "MMM d, h:mm a")}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    {automation.status === "draft" ? (
                      <Button size="sm" className="w-full">
                        <Play className="mr-2 h-4 w-4" />
                        Activate
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedAutomation(automation.id)}>
                        <Info className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Automation</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Last Triggered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAutomations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No automations found. Try adjusting your search or create a new one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAutomations.map((automation) => (
                    <TableRow key={automation.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`rounded-md p-1.5 ${
                            automation.icon === "user" ? "bg-blue-500/10 text-blue-500" :
                            automation.icon === "cart" ? "bg-green-500/10 text-green-500" :
                            automation.icon === "calendar" ? "bg-purple-500/10 text-purple-500" :
                            automation.icon === "activity" ? "bg-orange-500/10 text-orange-500" :
                            automation.icon === "tag" ? "bg-indigo-500/10 text-indigo-500" :
                            "bg-primary/10 text-primary"
                          }`}>
                            {getTriggerIcon(automation.icon)}
                          </div>
                          <div>
                            <div className="font-medium">{automation.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{automation.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTriggerName(automation.trigger)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(automation.status as AutomationStatus)}
                        >
                          {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {automation.status !== "draft" ? (
                       <div className="flex items-center gap-2">
                            <span>{automation.successRate}%</span>
                            <Progress value={automation.successRate} className="h-1.5 w-12" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {automation.lastTriggered ?
                          format(automation.lastTriggered, "MMM d, h:mm a") :
                          <span className="text-muted-foreground">Never</span>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={() => setSelectedAutomation(automation.id)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {automation.status === "active" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : automation.status === "paused" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          ) : null}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedAutomation(automation.id)}>
                                <Info className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Duplicate</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              {automation.status === "active" && (
                                <DropdownMenuItem>
                                  <Pause className="mr-2 h-4 w-4" />
                                  <span>Pause</span>
                                </DropdownMenuItem>
                              )}
                              {automation.status === "paused" && (
                                <DropdownMenuItem>
                                  <Play className="mr-2 h-4 w-4" />
                                  <span>Activate</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create Automation Dialog */}
      <Dialog open={createAutomationOpen} onOpenChange={setCreateAutomationOpen}>
        <DialogContent className="sm:max-w-xl h-fit max-h-screen m-auto overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Automation</DialogTitle>
            <DialogDescription>
              Set up an automated message workflow triggered by specific events
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="trigger" className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trigger">Trigger</TabsTrigger>
              <TabsTrigger value="message">Message</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="trigger" className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="automationName" className="text-sm font-medium">
                  Automation Name <span className="text-destructive">*</span>
                </label>
                <Input id="automationName" placeholder="e.g. Welcome Message" />
              </div>

              <div className="space-y-2">
                <label htmlFor="automationDescription" className="text-sm font-medium">
                  Description
                </label>
                <Input id="automationDescription" placeholder="Briefly describe what this automation does" />
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-sm font-medium">
                  Trigger Type <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border rounded-md p-3 cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/10 text-blue-500 p-2 rounded-md">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">New Subscription</h4>
                        <p className="text-sm text-muted-foreground">When a user opts in to your WhatsApp business</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-3 cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/10 text-green-500 p-2 rounded-md">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">New Order</h4>
                        <p className="text-sm text-muted-foreground">When a customer places a new order</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-3 cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-500/10 text-purple-500 p-2 rounded-md">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Scheduled Event</h4>
                        <p className="text-sm text-muted-foreground">Send messages based on upcoming events</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-3 cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500/10 text-orange-500 p-2 rounded-md">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Customer Inactivity</h4>
                        <p className="text-sm text-muted-foreground">When a customer hasn&apos;t engaged for a period</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-3 cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/10 text-green-500 p-2 rounded-md">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Abandoned Cart</h4>
                        <p className="text-sm text-muted-foreground">When items are left in shopping cart</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-3 cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-500/10 text-indigo-500 p-2 rounded-md">
                        <AlarmClock className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Time After Event</h4>
                        <p className="text-sm text-muted-foreground">Send follow-up after a specific event</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button>
                  Next: Message
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="message" className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Message Template <span className="text-destructive">*</span>
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome_message">Welcome Message</SelectItem>
                    <SelectItem value="order_confirmation">Order Confirmation</SelectItem>
                    <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                    <SelectItem value="cart_reminder">Cart Reminder</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose from your approved message templates
                </p>
              </div>

              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium">Preview</label>
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="bg-[#dcf8c6] dark:bg-[#005c4b] p-3 rounded-lg max-w-[85%] ml-auto mb-3">
                    <p className="text-sm">Hello , welcome to our business! We&apos;re excited to have you here. Feel free to reach out if you have any questions.</p>
                    <div className="flex justify-end mt-1 text-xs opacity-70">
                      Now • Delivered
                    </div>
                  </div>

                  <div className="mx-auto text-center text-xs text-muted-foreground">
                    <p>This is a preview of how your message will appear to recipients</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Variable Mappings
                  </label>
                  <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
                    <Settings className="h-3.5 w-3.5 mr-1" />
                    Advanced Settings
                  </Button>
                </div>

                <div className="border rounded-md p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium w-12 text-center">
                      {/* {{first_name}} */}
                    </div>
                    <Select defaultValue="contact.first_name">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contact.first_name">Contact First Name</SelectItem>
                        <SelectItem value="contact.last_name">Contact Last Name</SelectItem>
                        <SelectItem value="custom">Custom Value</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline">
                  Back: Trigger
                </Button>
                <Button>
                  Next: Settings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Audience Targeting</h3>
                <div className="border rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="allContacts" defaultChecked />
                      <label htmlFor="allContacts" className="text-sm">
                        Send to all eligible contacts
                      </label>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-3.5 w-3.5 mr-1" />
                      Add Filters
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Timing</h3>
                <div className="border rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="sendImmediately" defaultChecked />
                      <label htmlFor="sendImmediately" className="text-sm">
                        Send immediately when triggered
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="respectTimeZone" />
                      <label htmlFor="respectTimeZone" className="text-sm">
                        Respect recipient&apos;s time zone
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="businessHours" />
                      <label htmlFor="businessHours" className="text-sm">
                        Only send during business hours (9 AM - 5 PM)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Automation Status</h3>
                <div className="border rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Activate immediately</div>
                      <div className="text-sm text-muted-foreground">Turn on this automation as soon as it&apos;s created</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline">
                  Back: Message
                </Button>
                <Button>
                  Create Automation
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* View Automation Details Dialog */}
      <Dialog open={selectedAutomation !== null} onOpenChange={() => setSelectedAutomation(null)}>
        <DialogContent className="sm:max-w-3xl h-fit max-h-screen m-auto overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="mr-2">Automation Details</span>
              {selectedAutomation !== null && (
                <Badge
                  variant="outline"
                  className={getStatusColor(automations.find(a => a.id === selectedAutomation)?.status as AutomationStatus)}
                >
                  {/* {selectedAutomation !== null &&
                    automations.find(a => a.id === selectedAutomation)?.status.charAt(0).toUpperCase() +
                    automations.find(a => a.id === selectedAutomation)?.status.slice(1)
                  } */}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedAutomation !== null && automations.find(a => a.id === selectedAutomation)?.name}
            </DialogDescription>
          </DialogHeader>

          {(() => {
            if (selectedAutomation === null) return null;
            const automation = automations.find(a => a.id === selectedAutomation);
            if (!automation) return null;

            return (
              <div className="py-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Automation Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Status</dt>
                            <dd>
                              <Badge
                                variant="outline"
                                className={getStatusColor(automation.status as AutomationStatus)}
                              >
                                {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Trigger</dt>
                            <dd>{getTriggerName(automation.trigger)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Message Template</dt>
                            <dd>{automation.template}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Created</dt>
                            <dd>{format(automation.createdAt, "MMM d, yyyy")}</dd>
                          </div>
                          {automation.lastTriggered && (
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Last Triggered</dt>
                              <dd>{format(automation.lastTriggered, "MMM d, yyyy 'at' h:mm a")}</dd>
                            </div>
                          )}
                        </dl>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Execution Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Success Rate</span>
                              <span className="font-medium">{automation.successRate}%</span>
                            </div>
                            <Progress value={automation.successRate} className="h-2" />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="border rounded-md p-3">
                              <div className="text-sm text-muted-foreground">Total Executions</div>
                              <div className="text-2xl font-bold mt-1">{automation.totalExecutions.toLocaleString()}</div>
                            </div>
                            <div className="border rounded-md p-3">
                              <div className="text-sm text-muted-foreground">Replies Received</div>
                              <div className="text-2xl font-bold mt-1">{automation.stats.replied.toLocaleString()}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-muted/30 rounded-md p-2">
                              <div className="text-xs text-muted-foreground">Delivered</div>
                              <div className="font-medium">{automation.stats.delivered.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round((automation.stats.delivered / automation.totalExecutions) * 100)}%
                              </div>
                            </div>
                            <div className="bg-muted/30 rounded-md p-2">
                              <div className="text-xs text-muted-foreground">Read</div>
                              <div className="font-medium">{automation.stats.read.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round((automation.stats.read / automation.stats.delivered) * 100)}%
                              </div>
                            </div>
                            <div className="bg-muted/30 rounded-md p-2">
                              <div className="text-xs text-muted-foreground">Failed</div>
                              <div className="font-medium">{automation.stats.failed.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round((automation.stats.failed / automation.totalExecutions) * 100)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex-1 space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Message Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-md p-3 bg-muted/30">
                          <div className="bg-[#dcf8c6] dark:bg-[#005c4b] p-3 rounded-lg max-w-[90%] ml-auto">
                            <p className="text-sm">
                              {automation.template === "welcome_message"
                                ? "Hello John, welcome to our business! We're excited to have you here. Feel free to reach out if you have any questions."
                                : automation.template === "cart_reminder"
                                ? "Hello John, you still have items in your cart! Complete your purchase now to get free shipping."
                                : automation.template === "order_confirmation"
                                ? "Hello John, your order #12345 has been confirmed. Thank you for your purchase!"
                                : automation.template === "appointment_reminder"
                                ? "Hello John, this is a reminder that you have an appointment scheduled for tomorrow at 2:00 PM."
                                : automation.template === "feedback_request"
                                ? "Hello John, we'd love to hear your feedback about your recent purchase. How would you rate it?"
                                : "Hello John, we noticed you haven't visited us in a while. Come back and check out our latest offers!"}
                            </p>
                            <div className="flex justify-end mt-1 text-xs opacity-70">
                              {format(new Date(), "h:mm a")} • Delivered
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[...Array(5)].map((_, idx) => (
                            <div key={idx} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                              <div className={`rounded-full p-1.5 h-6 w-6 flex items-center justify-center ${
                                idx % 3 === 0 ? "bg-green-500/10 text-green-500" :
                                idx % 3 === 1 ? "bg-blue-500/10 text-blue-500" :
                                "bg-yellow-500/10 text-yellow-500"
                              }`}>
                                {idx % 3 === 0 ? <CheckCircle className="h-3 w-3" /> :
                                 idx % 3 === 1 ? <MessageSquare className="h-3 w-3" /> :
                                 <Clock className="h-3 w-3" />}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm">
                                  {idx % 3 === 0 ? "Message delivered to +1 (555) 123-4567" :
                                   idx % 3 === 1 ? "Reply received from +1 (555) 987-6543" :
                                   "Automation triggered for new subscriber"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(subDays(new Date(), idx), "MMM d, yyyy 'at' h:mm a")}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <div className="flex w-full justify-between">
              {selectedAutomation !== null && (
                <div>
                  {automations.find(a => a.id === selectedAutomation)?.status === "active" ? (
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : automations.find(a => a.id === selectedAutomation)?.status === "paused" ? (
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Activate
                    </Button>
                  ) : null}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedAutomation(null)}>
                  Close
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Automation
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
