"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Bot,
  MessageSquare,
  Code,
  Trash,
  Copy,
  Edit,
  ArrowRight,
  ZapIcon,
  BarChart,
  RotateCcw,
  Play,
  Pause,
  Settings,
  Cpu,
  BrainCircuit,
  Sparkles,
  FileJson,
  Users,
  Calendar,
  Activity,
  CopyCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ShoppingBag,
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
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Mock data for chatbots
const chatbots = [
  {
    id: 1,
    name: "Customer Support Bot",
    description: "Handles common customer service inquiries and routes complex issues to agents",
    status: "active",
    type: "ai",
    model: "gpt-4",
    integrations: ["zendesk", "shopify"],
    createdAt: new Date(2023, 3, 15),
    lastModified: new Date(2023, 5, 10),
    stats: {
      conversations: 876,
      messagesHandled: 5432,
      handoffRate: 28,
      avgResponseTime: 1.2, // seconds
      satisfaction: 92,
      resolutionRate: 72
    },
    aiCapabilities: ["product_questions", "order_status", "returns", "general_faqs"]
  },
  {
    id: 2,
    name: "Appointment Scheduler",
    description: "Books and manages customer appointments with calendar integration",
    status: "active",
    type: "rule_based",
    integrations: ["google_calendar"],
    createdAt: new Date(2023, 4, 5),
    lastModified: new Date(2023, 5, 12),
    stats: {
      conversations: 541,
      messagesHandled: 2845,
      handoffRate: 15,
      avgResponseTime: 0.8, // seconds
      satisfaction: 88,
      resolutionRate: 95
    }
  },
  {
    id: 3,
    name: "Product Recommender",
    description: "AI-powered product suggestions based on customer preferences",
    status: "paused",
    type: "ai",
    model: "gpt-3.5-turbo",
    integrations: ["shopify", "woocommerce"],
    createdAt: new Date(2023, 2, 20),
    lastModified: new Date(2023, 5, 5),
    stats: {
      conversations: 328,
      messagesHandled: 1876,
      handoffRate: 22,
      avgResponseTime: 1.5, // seconds
      satisfaction: 85,
      resolutionRate: 68
    },
    aiCapabilities: ["product_recommendations", "product_comparison", "inventory_check"]
  },
  {
    id: 4,
    name: "Order Bot",
    description: "Handles the entire ordering process from selection to payment",
    status: "draft",
    type: "hybrid",
    model: "gpt-4",
    integrations: ["stripe", "shopify"],
    createdAt: new Date(2023, 5, 1),
    lastModified: new Date(2023, 5, 15),
    stats: {
      conversations: 0,
      messagesHandled: 0,
      handoffRate: 0,
      avgResponseTime: 0,
      satisfaction: 0,
      resolutionRate: 0
    },
    aiCapabilities: ["product_ordering", "payment_processing", "order_tracking"]
  },
  {
    id: 5,
    name: "Lead Qualification Bot",
    description: "Qualifies sales leads before routing to sales representatives",
    status: "active",
    type: "rule_based",
    integrations: ["salesforce", "hubspot"],
    createdAt: new Date(2023, 1, 10),
    lastModified: new Date(2023, 4, 25),
    stats: {
      conversations: 452,
      messagesHandled: 2134,
      handoffRate: 58,
      avgResponseTime: 0.9, // seconds
      satisfaction: 79,
      resolutionRate: 65
    }
  }
];

type ChatbotStatus = "active" | "paused" | "draft";
type ChatbotType = "ai" | "rule_based" | "hybrid";

// Helper function to get the status badge color
const getStatusColor = (status: ChatbotStatus) => {
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

// Helper function to get the type badge color
const getTypeColor = (type: ChatbotType) => {
  switch (type) {
    case "ai":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "rule_based":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "hybrid":
      return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function ChatbotsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [createChatbotOpen, setCreateChatbotOpen] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [activeTab, setActiveTab] = useState("basic");

  // Filter chatbots based on search, status, and type
  const filteredChatbots = chatbots.filter(chatbot => {
    const matchesSearch = searchQuery === "" ||
      chatbot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chatbot.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "" || chatbot.status === selectedStatus;
    const matchesType = selectedType === "" || chatbot.type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Chatbots</h2>
            <p className="text-muted-foreground">
              Create and manage intelligent WhatsApp chatbots to automate conversations
            </p>
          </div>
          <Button onClick={() => setCreateChatbotOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Chatbot
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between flex-wrap">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chatbots..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
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
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="ai">AI-Powered</SelectItem>
                  <SelectItem value="rule_based">Rule-Based</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
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
            {filteredChatbots.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-48 bg-muted/20 rounded-lg border">
                <p className="text-muted-foreground">No chatbots found. Try adjusting your search or create a new one.</p>
              </div>
            ) : (
              filteredChatbots.map((chatbot) => (
                <Card key={chatbot.id} className="group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {chatbot.name}
                          {chatbot.type === "ai" && <Sparkles className="h-4 w-4 text-purple-500" />}
                        </CardTitle>
                        <CardDescription className="line-clamp-1">{chatbot.description}</CardDescription>
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
                          <DropdownMenuItem onClick={() => setSelectedChatbot(chatbot.id)}>
                            <Bot className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Test Chatbot</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          {chatbot.status === "active" && (
                            <DropdownMenuItem>
                              <Pause className="mr-2 h-4 w-4" />
                              <span>Pause</span>
                            </DropdownMenuItem>
                          )}
                          {chatbot.status === "paused" && (
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
                      <Badge
                        variant="outline"
                        className={getTypeColor(chatbot.type as ChatbotType)}
                      >
                        {chatbot.type === "ai" ? "AI-Powered" :
                         chatbot.type === "rule_based" ? "Rule-Based" :
                         "Hybrid"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getStatusColor(chatbot.status as ChatbotStatus)}
                      >
                        {chatbot.status.charAt(0).toUpperCase() + chatbot.status.slice(1)}
                      </Badge>
                    </div>

                    {chatbot.status !== "draft" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-center text-sm">
                          <div className="bg-muted/30 rounded-md p-2">
                            <div className="font-medium">{chatbot.stats.conversations.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Conversations</div>
                          </div>
                          <div className="bg-muted/30 rounded-md p-2">
                            <div className="font-medium">{chatbot.stats.resolutionRate}%</div>
                            <div className="text-xs text-muted-foreground">Resolution Rate</div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Satisfaction</span>
                            <span className="font-medium">{chatbot.stats.satisfaction}%</span>
                          </div>
                          <Progress value={chatbot.stats.satisfaction} className="h-1.5" />
                        </div>
                      </div>
                    )}

                    {chatbot.type === "ai" && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {chatbot.aiCapabilities?.map((capability, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {capability.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span>{format(chatbot.createdAt, "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Modified</span>
                        <span>{format(chatbot.lastModified, "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    {chatbot.status === "draft" ? (
                      <Button size="sm" className="w-full">
                        <Play className="mr-2 h-4 w-4" />
                        Activate
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedChatbot(chatbot.id)}>
                        <Bot className="mr-2 h-4 w-4" />
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
                  <TableHead>Chatbot</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Conversations</TableHead>
                  <TableHead>Resolution Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChatbots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No chatbots found. Try adjusting your search or create a new one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredChatbots.map((chatbot) => (
                    <TableRow key={chatbot.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`rounded-md p-1.5 ${
                            chatbot.type === "ai" ? "bg-purple-500/10 text-purple-500" :
                            chatbot.type === "rule_based" ? "bg-blue-500/10 text-blue-500" :
                            "bg-indigo-500/10 text-indigo-500"
                          }`}>
                            {chatbot.type === "ai" ?
                              <BrainCircuit className="h-4 w-4" /> :
                              chatbot.type === "rule_based" ?
                              <FileJson className="h-4 w-4" /> :
                              <Cpu className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {chatbot.name}
                              {chatbot.type === "ai" && <Sparkles className="h-3 w-3 text-purple-500" />}
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{chatbot.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getTypeColor(chatbot.type as ChatbotType)}
                        >
                          {chatbot.type === "ai" ? "AI-Powered" :
                           chatbot.type === "rule_based" ? "Rule-Based" :
                           "Hybrid"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(chatbot.status as ChatbotStatus)}
                        >
                          {chatbot.status.charAt(0).toUpperCase() + chatbot.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {chatbot.status !== "draft" ?
                          chatbot.stats.conversations.toLocaleString() :
                          <span className="text-muted-foreground">—</span>
                        }
                      </TableCell>
                      <TableCell>
                        {chatbot.status !== "draft" ? (
                          <div className="flex items-center gap-2">
                            <span>{chatbot.stats.resolutionRate}%</span>
                            <Progress value={chatbot.stats.resolutionRate} className="h-1.5 w-12" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={() => setSelectedChatbot(chatbot.id)}
                          >
                            <Bot className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          {chatbot.status === "active" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : chatbot.status === "paused" ? (
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
                             <DropdownMenuItem onClick={() => setSelectedChatbot(chatbot.id)}>
                                <Bot className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span>Test Chatbot</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Duplicate</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              {chatbot.status === "active" && (
                                <DropdownMenuItem>
                                  <Pause className="mr-2 h-4 w-4" />
                                  <span>Pause</span>
                                </DropdownMenuItem>
                              )}
                              {chatbot.status === "paused" && (
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

      {/* Create Chatbot Dialog */}
      <Dialog open={createChatbotOpen} onOpenChange={setCreateChatbotOpen}>
        <DialogContent className="sm:max-w-lg h-fit max-h-screen m-auto">
          <DialogHeader>
            <DialogTitle>Create Chatbot</DialogTitle>
            <DialogDescription>
              Build an intelligent chatbot to automate customer interactions
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="chatbotName" className="text-sm font-medium">
                  Chatbot Name <span className="text-destructive">*</span>
                </label>
                <Input id="chatbotName" placeholder="e.g. Customer Support Bot" />
              </div>

              <div className="space-y-2">
                <label htmlFor="chatbotDescription" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="chatbotDescription"
                  placeholder="Describe what this chatbot will do"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Chatbot Type <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="border rounded-md p-3 cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="bg-purple-500/10 text-purple-500 p-2 rounded-md">
                        <BrainCircuit className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">AI-Powered</h4>
                        <p className="text-xs text-muted-foreground">Natural language understanding with GPT models</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-3 cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="bg-blue-500/10 text-blue-500 p-2 rounded-md">
                        <FileJson className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Rule-Based</h4>
                        <p className="text-xs text-muted-foreground">Predefined rules and decision trees</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-3 cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="bg-indigo-500/10 text-indigo-500 p-2 rounded-md">
                        <Cpu className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Hybrid</h4>
                        <p className="text-xs text-muted-foreground">Combines rules and AI capabilities</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={() => setActiveTab("capabilities")}>
                  Next: Capabilities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="capabilities" className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  AI Model <span className="text-destructive">*</span>
                </label>
                <Select defaultValue="gpt-4">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4 (Most advanced)</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Balanced)</SelectItem>
                    <SelectItem value="custom">Custom Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Knowledge Base
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a knowledge base" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kb_product">Product Information</SelectItem>
                    <SelectItem value="kb_faq">Company FAQs</SelectItem>
                    <SelectItem value="kb_support">Support Articles</SelectItem>
                    <SelectItem value="create">Create New Knowledge Base</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Optional: Connect a knowledge base to improve chatbot responses
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Capabilities
                  </label>
                  <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Custom Capability
                  </Button>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cap-faq" />
                      <label
                        htmlFor="cap-faq"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        General FAQs
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cap-product" />
                      <label
                        htmlFor="cap-product"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Product Questions
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cap-order" />
                      <label
                        htmlFor="cap-order"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Order Status Tracking
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cap-returns" />
                      <label
                        htmlFor="cap-returns"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Returns and Refunds
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cap-booking" />
                      <label
                        htmlFor="cap-booking"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Appointment Booking
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cap-handoff" />
                      <label
                        htmlFor="cap-handoff"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Human Agent Handoff
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("basic")}>
                  Back: Basic Info
                </Button>
                <Button onClick={() => setActiveTab("settings")}>
                  Next: Settings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Integrations</h3>
                <div className="border rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="int-crm" />
                      <label htmlFor="int-crm" className="text-sm">
                        CRM Integration (Salesforce, HubSpot)
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="int-ecommerce" />
                      <label htmlFor="int-ecommerce" className="text-sm">
                        E-commerce (Shopify, WooCommerce)
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="int-calendar" />
                      <label htmlFor="int-calendar" className="text-sm">
                        Calendar (Google Calendar, Outlook)
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="int-helpdesk" />
                      <label htmlFor="int-helpdesk" className="text-sm">
                        Help Desk (Zendesk, Freshdesk)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Human Handoff</h3>
                <div className="border rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Enable human handoff</div>
                      <div className="text-sm text-muted-foreground">Allow the chatbot to transfer conversations to human agents</div>
                    </div>
                    <Switch />
                  </div>

                  <div className="pt-2">
                    <label className="text-sm font-medium">
                      Handoff conditions
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="handoff-complex" />
                        <label
                          htmlFor="handoff-complex"
                          className="text-sm leading-none"
                        >
                          Complex issues detected
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="handoff-repeat" />
                        <label
                          htmlFor="handoff-repeat"
                          className="text-sm leading-none"
                        >
                          Multiple repeated questions
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="handoff-request" />
                        <label
                          htmlFor="handoff-request"
                          className="text-sm leading-none"
                        >
                          User explicitly asks for agent
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Chatbot Status</h3>
                <div className="border rounded-md p-4">
                  <RadioGroup defaultValue="draft">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="draft" id="status-draft" />
                      <Label htmlFor="status-draft">Save as Draft</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="status-active" />
                      <Label htmlFor="status-active">Activate Immediately</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("capabilities")}>
                  Back: Capabilities
                </Button>
                <Button type="submit">
                  Create Chatbot
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* View Chatbot Details Dialog */}
      <Dialog open={selectedChatbot !== null} onOpenChange={() => setSelectedChatbot(null)}>
        <DialogContent className="sm:max-w-3xl h-fit max-h-screen m-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="mr-2">Chatbot Details</span>
              {selectedChatbot !== null && (
                <Badge
                  variant="outline"
                  className={getStatusColor(chatbots.find(c => c.id === selectedChatbot)?.status as ChatbotStatus)}
                >
                  {/* {selectedChatbot !== null &&
                    chatbots.find(c => c.id === selectedChatbot)?.status.charAt(0).toUpperCase() +
                    chatbots.find(c => c.id === selectedChatbot)?.status.slice(1)
                  } */}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedChatbot !== null && chatbots.find(c => c.id === selectedChatbot)?.name}
            </DialogDescription>
          </DialogHeader>

          {(() => {
            if (selectedChatbot === null) return null;
            const chatbot = chatbots.find(c => c.id === selectedChatbot);
            if (!chatbot) return null;

            return (
              <div className="py-4">
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Chatbot Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Type</dt>
                              <dd>
                                <Badge
                                  variant="outline"
                                  className={getTypeColor(chatbot.type as ChatbotType)}
                                >
                                  {chatbot.type === "ai" ? "AI-Powered" :
                                   chatbot.type === "rule_based" ? "Rule-Based" :
                                   "Hybrid"}
                                </Badge>
                              </dd>
                            </div>
                            {chatbot.type === "ai" && (
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">AI Model</dt>
                                <dd>{chatbot.model}</dd>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Created</dt>
                              <dd>{format(chatbot.createdAt, "MMM d, yyyy")}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Last Modified</dt>
                              <dd>{format(chatbot.lastModified, "MMM d, yyyy")}</dd>
                            </div>
                            <div className="pt-2">
                              <dt className="text-muted-foreground">Description</dt>
                              <dd className="mt-1">{chatbot.description}</dd>
                            </div>
                          </dl>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Performance Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {chatbot.status !== "draft" ? (
                            <div className="space-y-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Resolution Rate</span>
                                  <span className="font-medium">{chatbot.stats.resolutionRate}%</span>
                                </div>
                                <Progress value={chatbot.stats.resolutionRate} className="h-2" />
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Customer Satisfaction</span>
                                  <span className="font-medium">{chatbot.stats.satisfaction}%</span>
                                </div>
                                <Progress value={chatbot.stats.satisfaction} className="h-2" />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="border rounded-md p-3">
                                  <div className="text-sm text-muted-foreground">Total Conversations</div>
                                  <div className="text-2xl font-bold mt-1">{chatbot.stats.conversations.toLocaleString()}</div>
                                </div>
                                <div className="border rounded-md p-3">
                                  <div className="text-sm text-muted-foreground">Messages Handled</div>
                                  <div className="text-2xl font-bold mt-1">{chatbot.stats.messagesHandled.toLocaleString()}</div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="border rounded-md p-3">
                                  <div className="text-sm text-muted-foreground">Handoff Rate</div>
                                  <div className="text-2xl font-bold mt-1">{chatbot.stats.handoffRate}%</div>
                                </div>
                                <div className="border rounded-md p-3">
                                  <div className="text-sm text-muted-foreground">Avg. Response Time</div>
                                  <div className="text-2xl font-bold mt-1">{chatbot.stats.avgResponseTime}s</div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-48 bg-muted/20 rounded-lg border">
                              <p className="text-muted-foreground">No data available for draft chatbots</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Integrations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {chatbot.integrations && chatbot.integrations.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {chatbot.integrations.map((integration, idx) => (
                              <div key={idx} className="border rounded-md p-3 flex items-center gap-2">
                                <div className={`rounded-md p-1.5 ${
                                  integration === "zendesk" ? "bg-blue-500/10 text-blue-500" :
                                  integration === "shopify" ? "bg-green-500/10 text-green-500" :
                                  integration === "google_calendar" ? "bg-yellow-500/10 text-yellow-500" :
                                  integration === "woocommerce" ? "bg-purple-500/10 text-purple-500" :
                                  integration === "salesforce" ? "bg-blue-700/10 text-blue-700" :
                                  integration === "hubspot" ? "bg-orange-500/10 text-orange-500" :
                                  integration === "stripe" ? "bg-indigo-500/10 text-indigo-500" :
                                  "bg-gray-500/10 text-gray-500"
                                }`}>
                                  {integration === "zendesk" ? <MessageSquare className="h-4 w-4" /> :
                                   integration === "shopify" || integration === "woocommerce" ? <ShoppingBag className="h-4 w-4" /> :
                                   integration === "google_calendar" ? <Calendar className="h-4 w-4" /> :
                                   integration === "salesforce" || integration === "hubspot" ? <Users className="h-4 w-4" /> :
                                   integration === "stripe" ? <CopyCheck className="h-4 w-4" /> :
                                   <Code className="h-4 w-4" />}
                                </div>
                                <span className="text-sm capitalize">
                                  {integration.replace(/_/g, ' ')}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">No integrations configured</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="capabilities" className="mt-4 space-y-4">
                    {chatbot.type === "ai" && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">AI Capabilities</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {chatbot.aiCapabilities?.map((capability, idx) => (
                              <div key={idx} className="border rounded-md p-3 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm capitalize">
                                  {capability.replace(/_/g, ' ')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Test Conversation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-md p-3 bg-muted/30 h-64 flex flex-col">
                          <div className="flex-1 overflow-y-auto space-y-3 p-2">
                            <div className="bg-muted/50 rounded-lg p-3 max-w-[80%]">
                              <p className="text-sm">Hello! I&apos;m the {chatbot.name}. How can I help you today?</p>
                            </div>

                            <div className="bg-[#dcf8c6] wark:bg-[#005c4b] p-3 rounded-lg max-w-[80%] ml-auto">
                              <p className="text-sm">I need help with my recent order</p>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-3 max-w-[80%]">
                              <p className="text-sm">I&apos;d be happy to help you with your order. Could you please provide your order number so I can look up the details?</p>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <Input placeholder="Type a test message..." className="flex-1" />
                            <Button size="sm">Send</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-4 space-y-4">
                    {chatbot.status !== "draft" ? (
                      <>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Usage Metrics</CardTitle>
                          </CardHeader>
                          <CardContent className="h-52 flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Chart visualization would appear here</p>
                              <p className="text-sm">Showing metrics over time</p>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Top User Intents</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Order Status</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">38%</span>
                                    <div className="w-20 h-2 bg-muted overflow-hidden rounded-full">
                                      <div className="h-full bg-primary" style={{ width: "38%" }}></div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Product Information</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">24%</span>
                                    <div className="w-20 h-2 bg-muted overflow-hidden rounded-full">
                                      <div className="h-full bg-primary" style={{ width: "24%" }}></div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Return Process</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">18%</span>
                                    <div className="w-20 h-2 bg-muted overflow-hidden rounded-full">
                                      <div className="h-full bg-primary" style={{ width: "18%" }}></div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Pricing</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">12%</span>
                                    <div className="w-20 h-2 bg-muted overflow-hidden rounded-full">
                                      <div className="h-full bg-primary" style={{ width: "12%" }}></div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Other</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">8%</span>
                                   <div className="w-20 h-2 bg-muted overflow-hidden rounded-full">
                                      <div className="h-full bg-primary" style={{ width: "8%" }}></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Handoff Reasons</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Complex Inquiry</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">42%</span>
                                    <div className="w-20 h-2 bg-muted overflow-hidden rounded-full">
                                      <div className="h-full bg-primary" style={{ width: "42%" }}></div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-sm">User Requested Agent</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">31%</span>
                                    <div className="w-20 h-2 bg-muted overflow-hidden rounded-full">
                                      <div className="h-full bg-primary" style={{ width: "31%" }}></div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Multiple Attempts</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">16%</span>
                                    <div className="w-20 h-2 bg-muted overflow-hidden rounded-full">
                                      <div className="h-full bg-primary" style={{ width: "16%" }}></div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Sensitive Issue</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">7%</span>
                                    <div className="w-20 h-2 bg-muted overflow-hidden rounded-full">
                                      <div className="h-full bg-primary" style={{ width: "7%" }}></div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Other</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">4%</span>
                                    <div className="w-20 h-2 bg-muted overflow-hidden rounded-full">
                                      <div className="h-full bg-primary" style={{ width: "4%" }}></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base">Recent Conversations</CardTitle>
                              <Button variant="outline" size="sm">
                                View All
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date & Time</TableHead>
                                  <TableHead>User</TableHead>
                                  <TableHead>Duration</TableHead>
                                  <TableHead>Resolution</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {[...Array(5)].map((_, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>
                                      {format(new Date(new Date().getTime() - (idx * 3600000)), "MMM d, h:mm a")}
                                    </TableCell>
                                    <TableCell>+1 (555) 123-{4567 + idx}</TableCell>
                                    <TableCell>{Math.floor(Math.random() * 8) + 2}m {Math.floor(Math.random() * 60)}s</TableCell>
                                    <TableCell>
                                      {idx % 4 === 0 ? (
                                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                          Handed Off
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                          Resolved
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-48 bg-muted/20 rounded-lg border">
                        <div className="text-center text-muted-foreground">
                          <BarChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No analytics available for draft chatbots</p>
                          <p className="text-sm">Activate the chatbot to start collecting data</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            );
          })()}

          <DialogFooter>
            <div className="flex w-full justify-between">
              {selectedChatbot !== null && (
                <div>
                  {chatbots.find(c => c.id === selectedChatbot)?.status === "active" ? (
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : chatbots.find(c => c.id === selectedChatbot)?.status === "paused" ? (
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Activate
                    </Button>
                  ) : null}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedChatbot(null)}>
                  Close
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Chatbot
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
