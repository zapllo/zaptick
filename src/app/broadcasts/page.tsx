"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Users,
  MessageSquare,
  Calendar,
  Check,
  Clock,
  BarChart,
  ArrowRight,
  Trash,
  Edit,
  Tag,
  Copy,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  SendHorizonal,
  Filter,
  FileText,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { format, isBefore, addHours } from "date-fns";

// Mock data for broadcasts
const broadcasts = [
  {
    id: 1,
    name: "May Newsletter",
    status: "completed",
    recipients: 1245,
    delivered: 1198,
    read: 876,
    replied: 134,
    failed: 47,
    createdAt: new Date(2023, 4, 15, 9, 30),
    sentAt: new Date(2023, 4, 15, 10, 0),
    completedAt: new Date(2023, 4, 15, 10, 23),
    templateName: "newsletter_may_2023",
    template: {
      type: "text",
      variables: ["first_name"],
      content: "Hello {{1}}, check out our latest products and offers in our May newsletter!",
    },
    targeting: ["Newsletter Subscribers"],
    createdBy: "John Doe",
  },
  {
    id: 2,
    name: "Special Discount Promo",
    status: "scheduled",
    recipients: 867,
    delivered: 0,
    read: 0,
    replied: 0,
    failed: 0,
    createdAt: new Date(2023, 5, 12, 14, 15),
    scheduledFor: addHours(new Date(), 2), // 2 hours from now
    templateName: "special_discount_june",
    template: {
      type: "media",
      variables: ["first_name", "discount_code"],
      content: "Hello {{1}}, enjoy a special 20% discount with code: {{2}}. Offer valid until June 30.",
      media: "/images/discount-banner.jpg",
    },
    targeting: ["Premium Customers"],
    createdBy: "Jane Smith",
  },
  {
    id: 3,
    name: "Product Update Announcement",
    status: "in_progress",
    recipients: 2184,
    delivered: 1087,
    read: 532,
    replied: 45,
    failed: 23,
    createdAt: new Date(2023, 5, 14, 11, 0),
    sentAt: new Date(2023, 5, 14, 11, 15),
    templateName: "product_update_v2",
    template: {
      type: "text",
      variables: ["first_name"],
      content: "Hello {{1}}, we've updated our app with exciting new features! Check them out now.",
    },
    targeting: ["Active", "Product Updates"],
    createdBy: "John Doe",
  },
  {
    id: 4,
    name: "Customer Feedback Request",
    status: "draft",
    recipients: 0,
    delivered: 0,
    read: 0,
    replied: 0,
    failed: 0,
    createdAt: new Date(2023, 5, 10, 16, 45),
    templateName: "feedback_request",
    template: {
      type: "interactive",
      variables: ["first_name"],
      content: "Hello {{1}}, we'd love to hear your feedback about your recent purchase. How would you rate it?",
      buttons: ["Excellent", "Good", "Could be better"],
    },
    targeting: [],
    createdBy: "Jane Smith",
  },
  {
    id: 5,
    name: "Order Confirmation Follow-up",
    status: "failed",
    recipients: 36,
    delivered: 27,
    read: 15,
    replied: 4,
    failed: 9,
    createdAt: new Date(2023, 5, 8, 13, 20),
    sentAt: new Date(2023, 5, 8, 13, 30),
    failedAt: new Date(2023, 5, 8, 13, 45),
    templateName: "order_follow_up",
    template: {
      type: "text",
      variables: ["first_name", "order_number"],
      content: "Hello {{1}}, we just wanted to check if you're happy with your order #{{2}}? Let us know if you have any questions.",
    },
    targeting: ["Recent Customers"],
    createdBy: "John Doe",
    errorMessage: "Template not approved for some target accounts",
  },
];

type BroadcastStatus = "draft" | "scheduled" | "in_progress" | "completed" | "failed" | "paused";

// Helper function to get the status badge color
const getStatusColor = (status: BroadcastStatus) => {
  switch (status) {
    case "draft":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    case "scheduled":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "in_progress":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "completed":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "failed":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "paused":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusIcon = (status: BroadcastStatus) => {
  switch (status) {
    case "draft":
      return <Edit className="h-4 w-4 mr-2" />;
    case "scheduled":
      return <Calendar className="h-4 w-4 mr-2" />;
    case "in_progress":
      return <RefreshCw className="h-4 w-4 mr-2 animate-spin" />;
    case "completed":
      return <CheckCircle className="h-4 w-4 mr-2" />;
    case "failed":
      return <AlertCircle className="h-4 w-4 mr-2" />;
    case "paused":
      return <PauseCircle className="h-4 w-4 mr-2" />;
    default:
      return null;
  }
};

export default function BroadcastsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [createBroadcastOpen, setCreateBroadcastOpen] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedTab, setSelectedTab] = useState("audience");

  // Filter broadcasts based on search and status filter
  const filteredBroadcasts = broadcasts.filter(broadcast => {
    // Search filter
    const matchesSearch = searchQuery === "" ||
      broadcast.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      broadcast.templateName.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = selectedStatus === "" || broadcast.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Broadcasts</h2>
            <p className="text-muted-foreground">
              Create and send bulk messages to targeted groups of contacts
            </p>
          </div>
          <Button onClick={() => setCreateBroadcastOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Broadcast
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search broadcasts..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
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
            {filteredBroadcasts.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-48 bg-muted/20 rounded-lg border">
                <p className="text-muted-foreground">No broadcasts found. Try adjusting your search or create a new one.</p>
              </div>
            ) : (
              filteredBroadcasts.map((broadcast) => (
                <Card key={broadcast.id} className="group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          {broadcast.name}
                          <Badge
                            variant="outline"
                            className={`ml-2 text-xs ${getStatusColor(broadcast.status as BroadcastStatus)}`}
                          >
                            {broadcast.status === "in_progress" ? "In Progress" :
                             broadcast.status.charAt(0).toUpperCase() + broadcast.status.slice(1)}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {broadcast.templateName}
                        </CardDescription>
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
                          <DropdownMenuItem onClick={() => setSelectedBroadcast(broadcast.id)}>
                            <BarChart className="mr-2 h-4 w-4" />
                            <span>View Results</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                          {(broadcast.status === "draft" || broadcast.status === "scheduled") && (
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                          )}
                          {broadcast.status === "in_progress" && (
                            <DropdownMenuItem>
                              <PauseCircle className="mr-2 h-4 w-4" />
                              <span>Pause</span>
                            </DropdownMenuItem>
                          )}
                          {broadcast.status === "paused" && (
                            <DropdownMenuItem>
                              <PlayCircle className="mr-2 h-4 w-4" />
                              <span>Resume</span>
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
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">
                          {broadcast.status === "draft" ? "Target Recipients" :
                           broadcast.status === "scheduled" ? "Scheduled Delivery" :
                           "Delivery Rate"}
                        </span>
                        <span className="text-sm font-medium">
                          {broadcast.status === "draft" ?
                            (broadcast.targeting.length > 0 ? broadcast.targeting.join(", ") : "Not set") :
                           broadcast.status === "scheduled" ?
                            format(broadcast.scheduledFor!, "MMM d, yyyy 'at' h:mm a") :
                           `${broadcast.delivered} / ${broadcast.recipients}`}
                        </span>
                      </div>

                      {broadcast.status !== "draft" && broadcast.status !== "scheduled" && (
                        <Progress
                          value={(broadcast.delivered / broadcast.recipients) * 100}
                          className="h-2"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      {(broadcast.status === "in_progress" || broadcast.status === "completed" || broadcast.status === "failed") && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Sent</span>
                            <span>{format(broadcast.sentAt!, "MMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Created</span>
                        <span>{format(broadcast.createdAt, "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Created By</span>
                        <span>{broadcast.createdBy}</span>
                      </div>

                      {broadcast.status === "failed" && (
                        <div className="mt-2 p-2 bg-red-50 wark:bg-red-900/20 text-red-600 wark:text-red-400 text-xs rounded">
                          <AlertCircle className="h-3 w-3 inline-block mr-1" />
                          {broadcast.errorMessage}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    {broadcast.status === "draft" && (
                      <Button size="sm" className="w-full">
                        <SendHorizonal className="mr-2 h-4 w-4" />
                        Send or Schedule
                      </Button>
                    )}
                    {broadcast.status === "scheduled" && (
                      <Button size="sm" className="w-full" variant="outline">
                        <Calendar className="mr-2 h-4 w-4" />
                        Edit Schedule
                      </Button>
                    )}
                    {(broadcast.status === "in_progress" || broadcast.status === "completed" || broadcast.status === "failed" || broadcast.status === "paused") && (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedBroadcast(broadcast.id)}>
                        <BarChart className="mr-2 h-4 w-4" />
                        View Results
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
                  <TableHead>Broadcast</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBroadcasts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No broadcasts found. Try adjusting your search or create a new one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBroadcasts.map((broadcast) => (
                    <TableRow key={broadcast.id} className="group">
                      <TableCell>
                        <div>
                          <div className="font-medium">{broadcast.name}</div>
                          <div className="text-sm text-muted-foreground">{broadcast.templateName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(broadcast.status as BroadcastStatus)}
                        >
                          {broadcast.status === "in_progress" ? "In Progress" :
                           broadcast.status.charAt(0).toUpperCase() + broadcast.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {broadcast.status === "draft" ?
                          (broadcast.targeting.length > 0 ? broadcast.targeting.join(", ") : "Not set") :
                          `${broadcast.delivered}/${broadcast.recipients} (${Math.round((broadcast.delivered / (broadcast.recipients || 1)) * 100)}%)`
                        }
                      </TableCell>
                      <TableCell>{format(broadcast.createdAt, "MMM d, yyyy")}</TableCell>
                      <TableCell>{broadcast.createdBy}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          {broadcast.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {broadcast.status === "scheduled" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={() => setSelectedBroadcast(broadcast.id)}
                          >
                            <BarChart className="h-4 w-4" />
                          </Button>
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
                              <DropdownMenuItem onClick={() => setSelectedBroadcast(broadcast.id)}>
                                <BarChart className="mr-2 h-4 w-4" />
                                <span>View Results</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Duplicate</span>
                              </DropdownMenuItem>
                              {(broadcast.status === "draft" || broadcast.status === "scheduled") && (
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                              )}
                              {broadcast.status === "in_progress" && (
                                <DropdownMenuItem>
                                  <PauseCircle className="mr-2 h-4 w-4" />
                                  <span>Pause</span>
                                </DropdownMenuItem>
                              )}
                              {broadcast.status === "paused" && (
                                <DropdownMenuItem>
                                  <PlayCircle className="mr-2 h-4 w-4" />
                                  <span>Resume</span>
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

      {/* Create Broadcast Dialog */}
      <Dialog open={createBroadcastOpen} onOpenChange={setCreateBroadcastOpen}>
        <DialogContent className="sm:max-w-lg h-fit max-h-screen m-auto">
          <DialogHeader>
            <DialogTitle>Create New Broadcast</DialogTitle>
            <DialogDescription>
              Send a message to multiple contacts at once
            </DialogDescription>
          </DialogHeader>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="message">Message</TabsTrigger>
              <TabsTrigger value="schedule" disabled={selectedTab !== "message"}>
                Schedule
              </TabsTrigger>
            </TabsList>

            <TabsContent value="audience" className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="broadcastName" className="text-sm font-medium">
                  Broadcast Name <span className="text-destructive">*</span>
                </label>
                <Input id="broadcastName" placeholder="e.g. June Newsletter" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Target Recipients <span className="text-destructive">*</span>
                </label>
                <div className="border rounded-md p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Groups</label>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter groups" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Show All</SelectItem>
                          <SelectItem value="active">Active Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-2 border rounded-md p-2">
                      {["Newsletter Subscribers", "Premium Customers", "Active Users", "New Leads"].map((group, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Checkbox id={`group-${i}`} />
                          <label
                            htmlFor={`group-${i}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {group}
                          </label>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {Math.floor(Math.random() * 1000) + 100}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Labels</label>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter labels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Show All</SelectItem>
                          <SelectItem value="high_value">High Value</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-2 border rounded-md p-2">
                      {["Customer", "Premium", "Active", "Lead", "Support", "New"].map((label, i) => (
                        <div key={i} className="flex items-center space-x-2">
                        <Checkbox id={`label-${i}`} />
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: ["#25D366", "#9C27B0", "#4CAF50", "#FF9800", "#2196F3", "#673AB7"][i % 6] }}
                            ></div>
                            <label
                              htmlFor={`label-${i}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {label}
                            </label>
                          </div>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {Math.floor(Math.random() * 800) + 100}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm">Estimated audience: 1,245 contacts</span>
                </div>
                <Button onClick={() => setSelectedTab("message")}>
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
                    <SelectItem value="newsletter_june">Newsletter - June 2023</SelectItem>
                    <SelectItem value="promo_summer">Summer Promotion</SelectItem>
                    <SelectItem value="product_update">Product Update</SelectItem>
                    <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Templates must be pre-approved before sending
                </p>
              </div>

              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium">Preview</label>
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="bg-[#dcf8c6] wark:bg-[#005c4b] p-3 rounded-lg max-w-[85%] ml-auto mb-3">
                    <p className="text-sm">Hello , check out our latest products and offers in our June newsletter!</p>
                    <div className="mt-2 bg-background/20 rounded p-2 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">June_Newsletter.pdf</div>
                        <div className="text-xs opacity-80">PDF Document</div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-6 w-6">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
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
                <label className="text-sm font-medium">Personalization Variables</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground"></label>
                    <Input placeholder="Test value" defaultValue="John" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  These variables will be replaced with actual contact data when sent
                </p>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setSelectedTab("audience")}>
                  Back: Audience
                </Button>
                <Button onClick={() => setSelectedTab("schedule")}>
                  Next: Schedule
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">When to send this broadcast?</label>
                <RadioGroup defaultValue="now" className="space-y-3">
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="now" id="send-now" />
                    <Label htmlFor="send-now" className="flex-1 cursor-pointer">
                      <div className="font-medium">Send immediately</div>
                      <div className="text-sm text-muted-foreground">Your message will be sent right away</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="schedule" id="send-schedule" />
                    <Label htmlFor="send-schedule" className="flex-1 cursor-pointer">
                      <div className="font-medium">Schedule for later</div>
                      <div className="text-sm text-muted-foreground">Choose a date and time to send</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="border rounded-md p-4 space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Broadcast Summary</h4>
                  <Badge variant="outline">Draft</Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span>June Newsletter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Template</span>
                    <span>Newsletter - June 2023</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Audience</span>
                    <span>1,245 contacts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Send time</span>
                    <span>Immediately</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setSelectedTab("message")}>
                  Back: Message
                </Button>
                <Button>
                  Create Broadcast
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Broadcast Results Dialog */}
      <Dialog open={selectedBroadcast !== null} onOpenChange={() => setSelectedBroadcast(null)}>
        <DialogContent className="sm:max-w-3xl h-fit max-h-screen m-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="mr-2">Broadcast Results</span>
              {selectedBroadcast !== null && (
                <Badge
                  variant="outline"
                  className={getStatusColor(broadcasts.find(b => b.id === selectedBroadcast)?.status as BroadcastStatus)}
                >
                  {/* {selectedBroadcast !== null && (
                    broadcasts.find(b => b.id === selectedBroadcast)?.status === "in_progress" ? "In Progress" :
                    broadcasts.find(b => b.id === selectedBroadcast)?.status.charAt(0).toUpperCase() +
                    broadcasts.find(b => b.id === selectedBroadcast)?.status.slice(1)
                  )} */}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedBroadcast !== null && broadcasts.find(b => b.id === selectedBroadcast)?.name}
            </DialogDescription>
          </DialogHeader>

          {(() => {
            if (selectedBroadcast === null) return null;
            const broadcast = broadcasts.find(b => b.id === selectedBroadcast);
            if (!broadcast) return null;

            return (
              <div className="py-4">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {broadcast.delivered.toLocaleString()}
                        <span className="text-xs text-muted-foreground ml-1">/ {broadcast.recipients.toLocaleString()}</span>
                      </div>
                      <Progress value={(broadcast.delivered / broadcast.recipients) * 100} className="h-2 mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Read</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {broadcast.read.toLocaleString()}
                        <span className="text-xs text-muted-foreground ml-1">/ {broadcast.delivered.toLocaleString()}</span>
                      </div>
                      <Progress value={(broadcast.read / broadcast.delivered) * 100} className="h-2 mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Replied</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {broadcast.replied.toLocaleString()}
                        <span className="text-xs text-muted-foreground ml-1">/ {broadcast.read.toLocaleString()}</span>
                      </div>
                      <Progress value={(broadcast.replied / broadcast.read) * 100} className="h-2 mt-2" />
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-md">
                    <div className="p-4 border-b">
                      <h3 className="font-medium">Broadcast Details</h3>
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Status</div>
                          <div className="font-medium">
                            {broadcast.status.charAt(0).toUpperCase() + broadcast.status.slice(1)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Created</div>
                          <div className="font-medium">
                            {format(broadcast.createdAt, "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                        {broadcast.sentAt && (
                          <div>
                            <div className="text-sm text-muted-foreground">Sent</div>
                            <div className="font-medium">
                              {format(broadcast.sentAt, "MMM d, yyyy 'at' h:mm a")}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Template</div>
                          <div className="font-medium">{broadcast.templateName}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Targeting</div>
                          <div className="font-medium">
                            {broadcast.targeting.length > 0
                              ? broadcast.targeting.join(", ")
                              : "No targeting specified"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Created By</div>
                          <div className="font-medium">{broadcast.createdBy}</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Failed</div>
                          <div className="font-medium">
                            {broadcast.failed.toLocaleString()} messages
                          </div>
                        </div>
                        {broadcast.completedAt && (
                          <div>
                            <div className="text-sm text-muted-foreground">Completed</div>
                            <div className="font-medium">
                              {format(broadcast.completedAt, "MMM d, yyyy 'at' h:mm a")}
                            </div>
                          </div>
                        )}
                        {broadcast.errorMessage && (
                          <div>
                            <div className="text-sm text-muted-foreground">Error</div>
                            <div className="text-red-500 text-sm">{broadcast.errorMessage}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="font-medium">Message Preview</h3>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Export Results
                      </Button>
                    </div>
                    <div className="p-4">
                      <div className="border rounded-md p-4 bg-muted/30">
                        <div className="bg-[#dcf8c6] wark:bg-[#005c4b] p-3 rounded-lg max-w-[85%] ml-auto">
                          <p className="text-sm">{broadcast.template.content.replace("{{1}}", "John")}</p>
                          {broadcast.template.type === "media" && (
                            <div className="mt-2 bg-background/20 rounded p-2 flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate">Media attachment</div>
                                <div className="text-xs opacity-80">Image</div>
                              </div>
                              <Button size="icon" variant="ghost" className="h-6 w-6">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          <div className="flex justify-end mt-1 text-xs opacity-70">
                            {broadcast.sentAt ? format(broadcast.sentAt, "h:mm a") : "Now"} • Delivered
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <div className="flex w-full justify-between">
              {selectedBroadcast !== null && broadcasts.find(b => b.id === selectedBroadcast)?.status === "completed" && (
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
              )}
              <Button onClick={() => setSelectedBroadcast(null)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
