"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash,
  Clock,
  Copy,
  CheckCircle,
  XCircle,
  FileText,
  RefreshCw,
  MessageSquare,
  BarChart2,
  Image,
  ExternalLink,
  ArrowRight,
  AlertCircle,
  Filter,
  Tag,
  SlidersHorizontal,
  ListFilter
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { format } from "date-fns";

// Mock data for message templates
const templates = [
  {
    id: 1,
    name: "Newsletter - May 2023",
    category: "Marketing",
    status: "approved",
    language: "English",
    type: "text",
    content: "Hello {{1}}, check out our latest products and offers in our May newsletter!",
    variables: ["first_name"],
    createdAt: new Date(2023, 4, 10),
    lastUsed: new Date(2023, 4, 15),
    useCount: 1245,
    approvedAt: new Date(2023, 4, 12),
  },
  {
    id: 2,
    name: "Special Discount",
    category: "Marketing",
    status: "approved",
    language: "English",
    type: "media",
    content: "Hello {{1}}, enjoy a special 20% discount with code: {{2}}. Offer valid until {{3}}.",
    variables: ["first_name", "discount_code", "expiry_date"],
    createdAt: new Date(2023, 5, 2),
    lastUsed: new Date(2023, 5, 8),
    useCount: 867,
    approvedAt: new Date(2023, 5, 3),
    media: {
      type: "image",
      url: "/images/discount-banner.jpg"
    }
  },
  {
    id: 3,
    name: "Product Update",
    category: "Utility",
    status: "approved",
    language: "English",
    type: "text",
    content: "Hello {{1}}, we've updated our app with exciting new features! Check them out now.",
    variables: ["first_name"],
    createdAt: new Date(2023, 5, 5),
    lastUsed: new Date(2023, 5, 14),
    useCount: 2184,
    approvedAt: new Date(2023, 5, 6),
  },
  {
    id: 4,
    name: "Feedback Request",
    category: "Marketing",
    status: "pending",
    language: "English",
    type: "interactive",
    content: "Hello {{1}}, we'd love to hear your feedback about your recent purchase. How would you rate it?",
    variables: ["first_name"],
    createdAt: new Date(2023, 5, 10),
    buttons: ["Excellent", "Good", "Could be better"],
  },
  {
    id: 5,
    name: "Order Confirmation",
    category: "Transactional",
    status: "approved",
    language: "English",
    type: "text",
    content: "Hello {{1}}, your order #{{2}} has been confirmed. Expected delivery date: {{3}}. Thank you for your purchase!",
    variables: ["first_name", "order_number", "delivery_date"],
    createdAt: new Date(2023, 4, 20),
    lastUsed: new Date(2023, 5, 16),
    useCount: 3568,
    approvedAt: new Date(2023, 4, 21),
  },
  {
    id: 6,
    name: "Appointment Reminder",
    category: "Utility",
    status: "rejected",
    language: "English",
    type: "text",
    content: "Hello {{1}}, this is a reminder that you have an appointment scheduled for {{2}} at {{3}}. Please confirm your attendance.",
    variables: ["first_name", "date", "time"],
    createdAt: new Date(2023, 5, 7),
    rejectionReason: "Template violates policy regarding soliciting confirmations. Resubmit with clearer service message focus."
  },
  {
    id: 7,
    name: "Shipping Update",
    category: "Transactional",
    status: "approved",
    language: "English",
    type: "text",
    content: "Hello {{1}}, your order #{{2}} has been shipped! Track it here: {{3}}",
    variables: ["first_name", "order_number", "tracking_link"],
    createdAt: new Date(2023, 4, 25),
    lastUsed: new Date(2023, 5, 12),
    useCount: 2175,
    approvedAt: new Date(2023, 4, 26),
  },
];

type TemplateStatus = "approved" | "pending" | "rejected";

// Helper function to get the status badge color
const getStatusColor = (status: TemplateStatus) => {
  switch (status) {
    case "approved":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "pending":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "rejected":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

// Helper function to get the category badge color
const getCategoryColor = (category: string) => {
  switch (category) {
    case "Marketing":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "Transactional":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "Utility":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [viewTemplate, setViewTemplate] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filter templates based on search, category, and status
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "" || template.category === selectedCategory;

    const matchesStatus = selectedStatus === "" || template.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Message Templates</h2>
            <p className="text-muted-foreground">
              Create and manage WhatsApp message templates for your business
            </p>
          </div>
          <Button onClick={() => setCreateTemplateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between flex-wrap">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Transactional">Transactional</SelectItem>
                  <SelectItem value="Utility">Utility</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            {filteredTemplates.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-48 bg-muted/20 rounded-lg border">
                <p className="text-muted-foreground">No templates found. Try adjusting your search or create a new one.</p>
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <Card key={template.id} className="group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>
                          {template.language} • {template.type === "media" ? "Media" : template.type === "interactive" ? "Interactive" : "Text"}
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
                          <DropdownMenuItem onClick={() => setViewTemplate(template.id)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>View Template</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                          {template.status !== "approved" && (
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Template</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete Template</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex justify-between items-center mb-3">
                      <Badge
                        variant="outline"
                        className={getCategoryColor(template.category)}
                      >
                        {template.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getStatusColor(template.status as TemplateStatus)}
                      >
                        {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-md mb-3 text-sm h-20 overflow-y-auto">
                      <p>{template.content}</p>
                      {template.type === "media" && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Image className="h-3 w-3" />
                          <span>Includes media attachment</span>
                        </div>
                      )}
                      {template.type === "interactive" && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          <span>Includes interactive buttons</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Variables</span>
                        <span className="font-medium">{template.variables.length}</span>
                      </div>
                      {template.status === "approved" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Usage</span>
                            {/* <span className="font-medium">{template.useCount.toLocaleString()} times</span> */}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Used</span>
                            <span className="font-medium">{format(template.lastUsed!, "MMM d, yyyy")}</span>
                          </div>
                        </>
                      )}
                      {template.status === "rejected" && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded">
                          <AlertCircle className="h-3 w-3 inline-block mr-1" />
                          Rejected: {template.rejectionReason!.substring(0, 50)}...
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setViewTemplate(template.id)}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View Template
                    </Button>
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
                  <TableHead>Template Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No templates found. Try adjusting your search or create a new one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template) => (
                    <TableRow key={template.id} className="group">
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">{template.language}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getCategoryColor(template.category)}
                        >
                          {template.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {template.type === "text" && "Text"}
                        {template.type === "media" && "Media"}
                        {template.type === "interactive" && "Interactive"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(template.status as TemplateStatus)}
                        >
                          {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(template.createdAt, "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={() => setViewTemplate(template.id)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          {template.status !== "approved" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
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
                              <DropdownMenuItem onClick={() => setViewTemplate(template.id)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span>View Template</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Duplicate</span>
                              </DropdownMenuItem>
                              {template.status !== "approved" && (
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit Template</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete Template</span>
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

      {/* Create Template Dialog */}
      <Dialog open={createTemplateOpen} onOpenChange={setCreateTemplateOpen}>
        <DialogContent className="sm:max-w-lg h-fit max-h-screen m-auto">
          <DialogHeader>
            <DialogTitle>Create Message Template</DialogTitle>
            <DialogDescription>
              Create a reusable template for WhatsApp messaging
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="templateName" className="text-sm font-medium">
                Template Name <span className="text-destructive">*</span>
              </label>
              <Input id="templateName" placeholder="e.g. Special Discount" />
              <p className="text-xs text-muted-foreground">
                Use only letters, numbers, and underscores. No spaces.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category <span className="text-destructive">*</span>
                </label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="language" className="text-sm font-medium">
                  Language <span className="text-destructive">*</span>
                </label>
                <Select defaultValue="english">
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="portuguese">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="templateType" className="text-sm font-medium">
                Template Type <span className="text-destructive">*</span>
              </label>
              <Select>
                <SelectTrigger id="templateType">
                  <SelectValue placeholder="Select a template type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Only</SelectItem>
                  <SelectItem value="media">Media (Image, Video, Document)</SelectItem>
                  <SelectItem value="interactive">Interactive (Buttons)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="templateContent" className="text-sm font-medium">
                Content <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="templateContent"
                placeholder="e.g. Hello {{1}}, enjoy a special 20% discount with code: {{2}}. Offer valid until {{3}}."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Use , etc. for variables. You&apos;ll define these in the next step.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Variables
                </label>
                <Button type="button" variant="outline" size="sm" className="h-7">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Variable
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium w-10 text-center">
                    {/* {{1}} */}
                  </div>
                  <Input placeholder="Variable name (e.g. first_name)" />
                  <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium w-10 text-center">
                    {/* {{2}} */}
                  </div>
                  <Input placeholder="Variable name" />
                  <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>Templates must be approved by WhatsApp before use</span>
              </div>
              <a
                href="https://developers.facebook.com/docs/whatsapp/message-templates/guidelines/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary flex items-center mt-2"
              >
                View WhatsApp template guidelines
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTemplateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Template Dialog */}
      <Dialog open={viewTemplate !== null} onOpenChange={() => setViewTemplate(null)}>
        <DialogContent className="sm:max-w-lg h-fit max-h-screen m-auto  overflow-y-scroll">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="mr-2">Template Details</span>
              {viewTemplate !== null && (
                <Badge
                  variant="outline"
                  className={getStatusColor(templates.find(t => t.id === viewTemplate)?.status as TemplateStatus)}
                >
                  {/* {viewTemplate !== null &&
                    templates.find(t => t.id === viewTemplate)?.status.charAt(0).toUpperCase() +
                    templates.find(t => t.id === viewTemplate)?.status.slice(1)
                  } */}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {viewTemplate !== null && templates.find(t => t.id === viewTemplate)?.name}
            </DialogDescription>
          </DialogHeader>

          {(() => {
            if (viewTemplate === null) return null;
            const template = templates.find(t => t.id === viewTemplate);
            if (!template) return null;

            return (
              <div className="py-4">
                <div className="border rounded-md overflow-hidden">
                  <div className="p-4 border-b bg-muted/30">
                    <h3 className="font-medium mb-1">Preview</h3>
                    <div className="bg-[#dcf8c6] dark:bg-[#005c4b] p-3 rounded-lg max-w-[90%] ml-auto">
                      <p className="text-sm">{template.content.replace(/\{\{1\}\}/g, "John").replace(/\{\{2\}\}/g, "XYZ123").replace(/\{\{3\}\}/g, "June 30")}</p>
                      {template.type === "media" && template.media && (
                        <div className="mt-2 bg-background/20 rounded p-2 flex items-center gap-2">
                          {template.media.type === "image" && <Image className="h-5 w-5" />}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">Media attachment</div>
                            <div className="text-xs opacity-80">{template.media.type.charAt(0).toUpperCase() + template.media.type.slice(1)}</div>
                          </div>
                          <Button size="icon" variant="ghost" className="h-6 w-6">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {template.type === "interactive" && template.buttons && (
                        <div className="mt-2 flex flex-col gap-2">
                          {template.buttons.map((button, idx) => (
                            <div key={idx} className="bg-background/20 rounded p-2 text-center text-sm font-medium">
                              {button}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-end mt-1 text-xs opacity-70">
                        Now • Delivered
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div className="col-span-2">
                        <dt className="font-medium">Content</dt>
                        <dd className="mt-1 text-muted-foreground whitespace-pre-wrap">
                          {template.content}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium">Category</dt>
                        <dd className="mt-1">
                          <Badge
                            variant="outline"
                            className={getCategoryColor(template.category)}
                          >
                            {template.category}
                          </Badge>
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium">Type</dt>
                        <dd className="mt-1 text-muted-foreground">
                          {template.type === "text" ? "Text Only" :
                           template.type === "media" ? "Media" :
                           "Interactive"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium">Language</dt>
                        <dd className="mt-1 text-muted-foreground">{template.language}</dd>
                      </div>
                      <div>
                        <dt className="font-medium">Created</dt>
                        <dd className="mt-1 text-muted-foreground">{format(template.createdAt, "MMM d, yyyy")}</dd>
                      </div>

                      {template.status === "approved" && (
                        <>
                          <div>
                            <dt className="font-medium">Approved On</dt>
                            <dd className="mt-1 text-muted-foreground">{format(template.approvedAt!, "MMM d, yyyy")}</dd>
                          </div>
                          <div>
                            <dt className="font-medium">Used</dt>
                            {/* <dd className="mt-1 text-muted-foreground">{template.useCount.toLocaleString()} times</dd> */}
                          </div>
                          <div>
                            <dt className="font-medium">Last Used</dt>
                            <dd className="mt-1 text-muted-foreground">{format(template.lastUsed!, "MMM d, yyyy")}</dd>
                          </div>
                        </>
                      )}

                      {template.status === "rejected" && (
                        <div className="col-span-2">
                          <dt className="font-medium text-red-500">Rejection Reason</dt>
                          <dd className="mt-1 text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs">
                            {template.rejectionReason}
                          </dd>
                        </div>
                      )}

                      <div className="col-span-2 border-t pt-3 mt-1">
                        <dt className="font-medium">Variables</dt>
                        <dd className="mt-2 grid grid-cols-2 gap-2">
                          {template.variables.map((variable, idx) => (
                            <div key={idx} className="flex items-center">
                              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium mr-2">
                                {`{{${idx + 1}}}`}
                              </div>
                              <span className="text-muted-foreground">{variable}</span>
                            </div>
                          ))}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <div className="flex w-full justify-between">
              {viewTemplate !== null && templates.find(t => t.id === viewTemplate)?.status !== "approved" && (
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Template
                </Button>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setViewTemplate(null)}>
                  Close
                </Button>
                <Button>
                  Use Template
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
