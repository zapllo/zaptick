"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Zap,
  MessageSquare,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Bot,
  Workflow,
  Reply,
  Copy,
  Eye,
  Power,
  PowerOff,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Users,
  Target,
  ChevronRight,
  Filter as FilterIcon,
  X,
  Download,
  Upload,
  Play,
  Pause,
  Calendar,
  SlidersHorizontal,
  Layers,
  Lightbulb,
  Rocket,
  Crown,
  Star
} from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import AutomationsLayout from "@/components/layout/automation-layout";

interface AutoReply {
  _id: string;
  name: string;
  isActive: boolean;
  triggers: string[];
  replyMessage: string;
  replyType: 'text' | 'template' | 'workflow';
  templateName?: string;
  templateLanguage?: string;
  matchType: 'exact' | 'contains' | 'starts_with' | 'ends_with';
  caseSensitive: boolean;
  priority: number;
  usageCount: number;
  workflowId?: string;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
}

interface WabaAccount {
  wabaId: string;
  businessName: string;
  phoneNumber: string;
  phoneNumberId: string;
}

interface WorkflowOption {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export default function AutomationsPage() {
  const [autoReplies, setAutoReplies] = useState<AutoReply[]>([]);
  const [wabaAccounts, setWabaAccounts] = useState<WabaAccount[]>([]);
  const [selectedWabaId, setSelectedWabaId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [workflows, setWorkflows] = useState<WorkflowOption[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAutoReply, setSelectedAutoReply] = useState<AutoReply | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    triggers: [""],
    replyMessage: "",
    replyType: "text" as 'text' | 'template' | 'workflow',
    templateName: "",
    templateLanguage: "en",
    workflowId: "",
    matchType: "contains" as 'exact' | 'contains' | 'starts_with' | 'ends_with',
    caseSensitive: false,
    priority: 0,
    isActive: true
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchWabaAccounts();
  }, []);

  useEffect(() => {
    if (selectedWabaId) {
      fetchAutoReplies();
      fetchWorkflows();
    }
  }, [selectedWabaId]);

  const fetchWabaAccounts = async () => {
    try {
      const response = await fetch('/api/waba-accounts');
      const data = await response.json();
      if (data.success) {
        setWabaAccounts(data.accounts);
        if (data.accounts.length > 0) {
          setSelectedWabaId(data.accounts[0].wabaId);
        }
      }
    } catch (error) {
      console.error('Error fetching WABA accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch WhatsApp accounts",
        variant: "destructive",
      });
    }
  };

  const fetchAutoReplies = async () => {
    if (!selectedWabaId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/auto-replies?wabaId=${selectedWabaId}`);
      const data = await response.json();

      if (data.success) {
        setAutoReplies(data.autoReplies);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch auto replies",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching auto replies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch auto replies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkflows = async () => {
    if (!selectedWabaId) return;

    try {
      const response = await fetch(`/api/workflows?wabaId=${selectedWabaId}`);
      const data = await response.json();

      if (data.success) {
        setWorkflows(data.workflows);
      } else {
        console.error('Failed to fetch workflows:', data.error);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  };

  const handleCreateAutoReply = async () => {
    if (!formData.name || !formData.triggers.filter(Boolean).length) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.replyType === 'text' && !formData.replyMessage) {
      toast({
        title: "Error",
        description: "Reply message is required for text type",
        variant: "destructive",
      });
      return;
    }

    if (formData.replyType === 'template' && !formData.templateName) {
      toast({
        title: "Error",
        description: "Template name is required for template type",
        variant: "destructive",
      });
      return;
    }

    if (formData.replyType === 'workflow' && !formData.workflowId) {
      toast({
        title: "Error",
        description: "Please select a workflow",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/auto-replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          wabaId: selectedWabaId,
          triggers: formData.triggers.filter(Boolean)
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Auto reply created successfully",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        fetchAutoReplies();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create auto reply",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating auto reply:', error);
      toast({
        title: "Error",
        description: "Failed to create auto reply",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAutoReply = async () => {
    if (!selectedAutoReply) return;

    if (formData.replyType === 'text' && !formData.replyMessage) {
      toast({
        title: "Error",
        description: "Reply message is required for text type",
        variant: "destructive",
      });
      return;
    }

    if (formData.replyType === 'template' && !formData.templateName) {
      toast({
        title: "Error",
        description: "Template name is required for template type",
        variant: "destructive",
      });
      return;
    }

    if (formData.replyType === 'workflow' && !formData.workflowId) {
      toast({
        title: "Error",
        description: "Please select a workflow",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/auto-replies/${selectedAutoReply._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          triggers: formData.triggers.filter(Boolean)
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Auto reply updated successfully",
        });
        setIsEditDialogOpen(false);
        resetForm();
        fetchAutoReplies();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update auto reply",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating auto reply:', error);
      toast({
        title: "Error",
        description: "Failed to update auto reply",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAutoReply = async () => {
    if (!selectedAutoReply) return;

    try {
      const response = await fetch(`/api/auto-replies/${selectedAutoReply._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Auto reply deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        setSelectedAutoReply(null);
        fetchAutoReplies();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete auto reply",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting auto reply:', error);
      toast({
        title: "Error",
        description: "Failed to delete auto reply",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (autoReply: AutoReply) => {
    try {
      const response = await fetch(`/api/auto-replies/${autoReply._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !autoReply.isActive
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: `Auto reply ${!autoReply.isActive ? 'activated' : 'deactivated'} successfully`,
        });
        fetchAutoReplies();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update auto reply status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error toggling auto reply status:', error);
      toast({
        title: "Error",
        description: "Failed to update auto reply status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      triggers: [""],
      replyMessage: "",
      replyType: "text",
      templateName: "",
      templateLanguage: "en",
      workflowId: "",
      matchType: "contains",
      caseSensitive: false,
      priority: 0,
      isActive: true
    });
  };

  const openEditDialog = (autoReply: AutoReply) => {
    setSelectedAutoReply(autoReply);
    setFormData({
      name: autoReply.name,
      triggers: autoReply.triggers.length ? autoReply.triggers : [""],
      replyMessage: autoReply.replyMessage,
      replyType: autoReply.replyType,
      templateName: autoReply.templateName || "",
      templateLanguage: autoReply.templateLanguage || "en",
      workflowId: autoReply.workflowId || "",
      matchType: autoReply.matchType,
      caseSensitive: autoReply.caseSensitive,
      priority: autoReply.priority,
      isActive: autoReply.isActive
    });
    setIsEditDialogOpen(true);
  };

  const addTrigger = () => {
    setFormData({
      ...formData,
      triggers: [...formData.triggers, ""]
    });
  };

  const removeTrigger = (index: number) => {
    const newTriggers = formData.triggers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      triggers: newTriggers.length ? newTriggers : [""]
    });
  };

  const updateTrigger = (index: number, value: string) => {
    const newTriggers = [...formData.triggers];
    newTriggers[index] = value;
    setFormData({
      ...formData,
      triggers: newTriggers
    });
  };

  const filteredAutoReplies = autoReplies.filter(autoReply => {
    const matchesSearch = autoReply.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      autoReply.triggers.some(trigger =>
        trigger.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && autoReply.isActive) ||
      (statusFilter === "inactive" && !autoReply.isActive);

    const matchesType = typeFilter === "all" || autoReply.replyType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const totalReplies = autoReplies.length;
  const activeReplies = autoReplies.filter(ar => ar.isActive).length;
  const totalTriggers = autoReplies.reduce((sum, ar) => sum + (ar.usageCount || 0), 0);
  const responseRate = totalReplies > 0 ? Math.round((autoReplies.filter(ar => ar.usageCount > 0).length / totalReplies) * 100) : 0;

  const getReplyTypeIcon = (type: string) => {
    switch (type) {
      case 'workflow':
        return <Workflow className="h-4 w-4 text-blue-600" />;
      case 'template':
        return <Layers className="h-4 w-4 text-purple-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-green-600" />;
    }
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'exact':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'starts_with':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ends_with':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <AutomationsLayout>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
          <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Auto Replies
                    </h1>
                    <p className="text-muted-foreground font-medium">
                      Intelligent automated responses for your WhatsApp Business
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    // Export functionality
                    toast({
                      title: "Coming Soon",
                      description: "Export functionality will be available soon",
                    });
                  }}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Create Auto Reply
                </Button>
              </div>
            </div>

            {/* WABA Account Selector */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="waba-select" className="text-sm font-semibold text-slate-700 mb-2 block">
                      WhatsApp Business Account
                    </Label>
                    <Select value={selectedWabaId} onValueChange={setSelectedWabaId}>
                      <SelectTrigger className="w-full max-w-md bg-white">
                        <SelectValue placeholder="Select WhatsApp Business Account" />
                      </SelectTrigger>
                      <SelectContent>
                        {wabaAccounts.map((account) => (
                          <SelectItem key={account.wabaId} value={account.wabaId}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <MessageSquare className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium">{account.businessName}</div>
                                {/* <div className="text-sm text-muted-foreground">{account.phoneNumber}</div> */}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedWabaId && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 font-medium">Connected</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-600">Total Auto Replies</p>
                      <p className="text-3xl font-bold text-blue-900">{totalReplies}</p>
                      <p className="text-xs text-blue-600/80">
                        {totalReplies > 0 ? '+12% from last month' : 'Get started'}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-200/50 rounded-xl">
                      <Bot className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-green-600">Active Replies</p>
                      <p className="text-3xl font-bold text-green-900">{activeReplies}</p>
                      <p className="text-xs text-green-600/80">
                        {((activeReplies / totalReplies) * 100 || 0).toFixed(0)}% of total
                      </p>
                    </div>
                    <div className="p-3 bg-green-200/50 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-amber-600">Total Triggers</p>
                      <p className="text-3xl font-bold text-amber-900">{totalTriggers}</p>
                      <p className="text-xs text-amber-600/80">
                        {totalTriggers > 0 ? '+24% this week' : 'No triggers yet'}
                      </p>
                    </div>
                    <div className="p-3 bg-amber-200/50 rounded-xl">
                      <Zap className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-purple-600">Response Rate</p>
                      <p className="text-3xl font-bold text-purple-900">{responseRate}%</p>
                      <div className="w-full bg-purple-200/50 rounded-full h-2 mt-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${responseRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-purple-200/50 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters & Controls */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search auto replies, triggers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-36 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-36 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="template">Template</SelectItem>
                          <SelectItem value="workflow">Workflow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={fetchAutoReplies}
                          className="gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Refresh
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Refresh auto replies</TooltipContent>
                    </Tooltip>
                    
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-8 px-3"
                      >
                        <Layers className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                        className="h-8 px-3"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* Content */}
            {isLoading ? (
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900">Loading Auto Replies</h3>
                      <p className="text-sm text-muted-foreground">Fetching your automation rules...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredAutoReplies.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mx-auto">
                        <Bot className="h-12 w-12 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                          ? "No matching auto replies found"
                          : "Ready to automate your responses?"
                        }
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                        {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                          ? "Try adjusting your search or filter criteria to find what you're looking for."
                          : "Create intelligent auto replies to provide instant responses to your customers and boost engagement."
                        }
                      </p>
                    </div>

                    {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button 
                          onClick={() => setIsCreateDialogOpen(true)}
                          className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                          size="lg"
                        >
                          <Plus className="h-5 w-5" />
                          Create Your First Auto Reply
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="gap-2"
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/auto-replies/samples', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ wabaId: selectedWabaId }),
                              });

                              const data = await response.json();

                              if (data.success) {
                                toast({
                                  title: "Success",
                                  description: data.message,
                                });
                                fetchAutoReplies();
                              } else {
                                toast({
                                  title: "Error",
                                  description: data.error || "Failed to create samples",
                                  variant: "destructive",
                                });
                              }
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to create sample auto replies",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Lightbulb className="h-5 w-5" />
                          Use Sample Templates
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAutoReplies.map((autoReply) => (
                      <Card 
                        key={autoReply._id} 
                        className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200 group"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                                {getReplyTypeIcon(autoReply.replyType)}
                              </div>
                              <div>
                                <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors cursor-pointer"
                                  onClick={() => {
                                    setSelectedAutoReply(autoReply);
                                    setIsViewDialogOpen(true);
                                  }}
                                >
                                  {autoReply.name}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant={autoReply.isActive ? "default" : "secondary"}
                                    className={cn(
                                      "text-xs",
                                      autoReply.isActive 
                                        ? "bg-green-100 text-green-700 border-green-200" 
                                        : "bg-slate-100 text-slate-600 border-slate-200"
                                    )}
                                  >
                                    {autoReply.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={cn("text-xs capitalize", getMatchTypeColor(autoReply.matchType))}
                                  >
                                    {autoReply.matchType.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAutoReply(autoReply);
                                    setIsViewDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(autoReply)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(autoReply)}>
                                  {autoReply.isActive ? (
                                    <>
                                      <Pause className="h-4 w-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4 w-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => {
                                    setSelectedAutoReply(autoReply);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-2">Triggers</p>
                            <div className="flex flex-wrap gap-1">
                              {autoReply.triggers.slice(0, 3).map((trigger, index) => (
                                <Badge 
                                  key={index} 
                                  variant="secondary" 
                                  className="text-xs bg-slate-100 text-slate-700 border-slate-200"
                                >
                                  {trigger}
                                </Badge>
                              ))}
                              {autoReply.triggers.length > 3 && (
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs bg-slate-100 text-slate-700 border-slate-200"
                                >
                                  +{autoReply.triggers.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Priority</p>
                              <p className="font-medium">{autoReply.priority}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Usage Count</p>
                              <p className="font-medium">{autoReply.usageCount || 0}</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {autoReply.lastTriggered ? (
                                  <>Last used {format(new Date(autoReply.lastTriggered), "MMM dd")}</>
                                ) : (
                                  "Never used"
                                )}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(autoReply)}
                                className="h-8 px-3"
                              >
                                {autoReply.isActive ? (
                                  <Pause className="h-3 w-3" />
                                ) : (
                                  <Play className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/80 hover:bg-slate-50">
                              <TableHead className="font-semibold text-slate-700">Name</TableHead>
                              <TableHead className="font-semibold text-slate-700">Triggers</TableHead>
                              <TableHead className="font-semibold text-slate-700">Type</TableHead>
                              <TableHead className="font-semibold text-slate-700">Match</TableHead>
                              <TableHead className="font-semibold text-slate-700">Status</TableHead>
                              <TableHead className="font-semibold text-slate-700">Usage</TableHead>
                              <TableHead className="font-semibold text-slate-700">Last Used</TableHead>
                              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAutoReplies.map((autoReply) => (
                              <TableRow key={autoReply._id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell>
                                  <div className="space-y-1">
                                    <div 
                                      className="font-medium text-slate-900 hover:text-primary cursor-pointer transition-colors"
                                      onClick={() => {
                                        setSelectedAutoReply(autoReply);
                                        setIsViewDialogOpen(true);
                                      }}
                                    >
                                      {autoReply.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Priority: {autoReply.priority}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {autoReply.triggers.slice(0, 2).map((trigger, index) => (
                                      <Badge 
                                        key={index} 
                                        variant="secondary" 
                                        className="text-xs bg-slate-100 text-slate-700"
                                      >
                                        {trigger}
                                      </Badge>
                                    ))}
                                    {autoReply.triggers.length > 2 && (
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs bg-slate-100 text-slate-700"
                                      >
                                        +{autoReply.triggers.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize gap-1">
                                    {getReplyTypeIcon(autoReply.replyType)}
                                    {autoReply.replyType}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant="outline" 
                                    className={cn("capitalize text-xs", getMatchTypeColor(autoReply.matchType))}
                                  >
                                    {autoReply.matchType.replace('_', ' ')}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={autoReply.isActive ? "default" : "secondary"}
                                    className={cn(
                                      "gap-1",
                                      autoReply.isActive 
                                        ? "bg-green-100 text-green-700 border-green-200" 
                                        : "bg-slate-100 text-slate-600 border-slate-200"
                                    )}
                                  >
                                    {autoReply.isActive ? (
                                      <><Power className="h-3 w-3" />Active</>
                                    ) : (
                                      <><PowerOff className="h-3 w-3" />Inactive</>
                                    )}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="font-medium">{autoReply.usageCount || 0}</div>
                                    <div className="text-muted-foreground">triggers</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {autoReply.lastTriggered ? (
                                    <div className="text-sm">
                                      <div className="font-medium">
                                        {format(new Date(autoReply.lastTriggered), "MMM dd, yyyy")}
                                      </div>
                                      <div className="text-muted-foreground">
                                        {format(new Date(autoReply.lastTriggered), "HH:mm")}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">Never</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end items-center gap-1">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleToggleStatus(autoReply)}
                                          className="h-8 w-8 p-0"
                                        >
                                          {autoReply.isActive ? (
                                            <Pause className="h-3.5 w-3.5" />
                                          ) : (
                                            <Play className="h-3.5 w-3.5" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {autoReply.isActive ? 'Deactivate' : 'Activate'}
                                      </TooltipContent>
                                    </Tooltip>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedAutoReply(autoReply);
                                            setIsViewDialogOpen(true);
                                          }}
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => openEditDialog(autoReply)}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Copy className="h-4 w-4 mr-2" />
                                          Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-red-600 focus:text-red-600"
                                          onClick={() => {
                                            setSelectedAutoReply(autoReply);
                                            setIsDeleteDialogOpen(true);
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog
              open={isCreateDialogOpen || isEditDialogOpen}
              onOpenChange={(open) => {
                if (!open) {
                  setIsCreateDialogOpen(false);
                  setIsEditDialogOpen(false);
                  resetForm();
                  setSelectedAutoReply(null);
                }
              }}
            >
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    {isCreateDialogOpen ? "Create Auto Reply" : "Edit Auto Reply"}
                  </DialogTitle>
                  <DialogDescription>
                    Set up intelligent automatic responses to specific customer messages or keywords.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 py-6">
                  {/* Basic Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Settings className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Basic Settings</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Auto Reply Name *</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Welcome Message"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
                        <Input
                          id="priority"
                          type="number"
                          placeholder="0"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                          className="bg-white"
                        />
                        <p className="text-xs text-muted-foreground">Higher numbers = higher priority</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <Label htmlFor="isActive" className="text-sm font-medium">Active</Label>
                    </div>
                  </div>

                  <Separator />

                  {/* Trigger Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Target className="h-4 w-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Trigger Settings</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Trigger Keywords/Phrases *</Label>
                        <div className="space-y-3">
                          {formData.triggers.map((trigger, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder={`Trigger ${index + 1} (e.g., hello, hi, start)`}
                                value={trigger}
                                onChange={(e) => updateTrigger(index, e.target.value)}
                                className="bg-white"
                              />
                              {formData.triggers.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeTrigger(index)}
                                  className="shrink-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addTrigger}
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add Another Trigger
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="matchType" className="text-sm font-medium">Match Type</Label>
                          <Select
                            value={formData.matchType}
                            onValueChange={(value: any) => setFormData({ ...formData, matchType: value })}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="exact">Exact Match</SelectItem>
                              <SelectItem value="starts_with">Starts With</SelectItem>
                              <SelectItem value="ends_with">Ends With</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-3 pt-6">
                          <Switch
                            id="caseSensitive"
                            checked={formData.caseSensitive}
                            onCheckedChange={(checked) => setFormData({ ...formData, caseSensitive: checked })}
                          />
                          <Label htmlFor="caseSensitive" className="text-sm font-medium">Case Sensitive</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Reply Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Reply className="h-4 w-4 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Reply Settings</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="replyType" className="text-sm font-medium">Reply Type</Label>
                        <Select
                          value={formData.replyType}
                          onValueChange={(value: any) => setFormData({ ...formData, replyType: value })}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Text Message
                              </div>
                            </SelectItem>
                            <SelectItem value="template">
                              <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4" />
                                Template Message
                              </div>
                            </SelectItem>
                            <SelectItem value="workflow">
                              <div className="flex items-center gap-2">
                                <Workflow className="h-4 w-4" />
                                Workflow
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.replyType === 'text' && (
                        <div className="space-y-2">
                          <Label htmlFor="replyMessage" className="text-sm font-medium">Reply Message *</Label>
                          <Textarea
                            id="replyMessage"
                            placeholder="Enter your auto reply message..."
                            value={formData.replyMessage}
                            onChange={(e) => setFormData({ ...formData, replyMessage: e.target.value })}
                            rows={4}
                            className="bg-white"
                          />
                        </div>
                      )}

                      {formData.replyType === 'template' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="templateName" className="text-sm font-medium">Template Name *</Label>
                            <Input
                              id="templateName"
                              placeholder="Template name"
                              value={formData.templateName}
                              onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="templateLanguage" className="text-sm font-medium">Language</Label>
                            <Select
                              value={formData.templateLanguage}
                              onValueChange={(value) => setFormData({ ...formData, templateLanguage: value })}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="hi">Hindi</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {formData.replyType === 'workflow' && (
                        <div className="space-y-2">
                          <Label htmlFor="workflowId" className="text-sm font-medium">Select Workflow *</Label>
                          <Select
                            value={formData.workflowId}
                            onValueChange={(value) => setFormData({ ...formData, workflowId: value })}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Choose a workflow to trigger" />
                            </SelectTrigger>
                            <SelectContent>
                          {workflows.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  No workflows available. Create a workflow first.
                                </div>
                              ) : (
                                workflows.map((workflow) => (
                                  <SelectItem
                                    key={workflow._id}
                                    value={workflow._id}
                                    disabled={!workflow.isActive}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Workflow className={`h-4 w-4 ${workflow.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                      <div>
                                        <div className={`font-medium ${!workflow.isActive ? 'text-muted-foreground' : ''}`}>
                                          {workflow.name}
                                          {!workflow.isActive && ' (Inactive)'}
                                        </div>
                                        {workflow.description && (
                                          <div className="text-xs text-muted-foreground">
                                            {workflow.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {workflows.length === 0 && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-amber-800">No workflows available</p>
                                  <p className="text-sm text-amber-700 mt-1">
                                    You need to create at least one workflow before using this option.{' '}
                                    <Button
                                      variant="link"
                                      className="p-0 h-auto text-sm text-amber-800 underline"
                                      onClick={() => window.open('/automations/workflows', '_blank')}
                                    >
                                      Create a workflow
                                    </Button>
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {formData.workflowId && workflows.find(w => w._id === formData.workflowId && !w.isActive) && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-amber-800">Workflow is inactive</p>
                                  <p className="text-sm text-amber-700 mt-1">
                                    Selected workflow is inactive. Please activate it before using this auto reply.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter className="bg-slate-50 -mx-6 -mb-6 px-6 py-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setIsEditDialogOpen(false);
                      resetForm();
                      setSelectedAutoReply(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={isCreateDialogOpen ? handleCreateAutoReply : handleUpdateAutoReply}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                  >
                    {isCreateDialogOpen ? "Create Auto Reply" : "Update Auto Reply"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* View Auto Reply Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                {selectedAutoReply && (
                  <>
                    <DialogHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                              {getReplyTypeIcon(selectedAutoReply.replyType)}
                            </div>
                            {selectedAutoReply.name}
                          </DialogTitle>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={selectedAutoReply.isActive ? "default" : "secondary"}
                              className={cn(
                                selectedAutoReply.isActive 
                                  ? "bg-green-100 text-green-700 border-green-200" 
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              )}
                            >
                              {selectedAutoReply.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {selectedAutoReply.replyType}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={cn("capitalize", getMatchTypeColor(selectedAutoReply.matchType))}
                            >
                              {selectedAutoReply.matchType.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </DialogHeader>

                    <Tabs defaultValue="settings" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="settings" className="gap-2">
                          <Settings className="h-4 w-4" />
                          Settings
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Analytics
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="settings" className="space-y-6 pt-6">
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                              <Target className="h-4 w-4 text-green-600" />
                              Trigger Keywords
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedAutoReply.triggers.map((trigger, index) => (
                                <Badge 
                                  key={index} 
                                  variant="secondary"
                                  className="bg-slate-100 text-slate-700 border-slate-200"
                                >
                                  {trigger}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <span className="text-sm font-medium text-slate-600">Match Type</span>
                                <div className="font-medium capitalize mt-1">
                                  {selectedAutoReply.matchType.replace('_', ' ')}
                                </div>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-slate-600">Case Sensitive</span>
                                <div className="font-medium mt-1">
                                  {selectedAutoReply.caseSensitive ? "Yes" : "No"}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <span className="text-sm font-medium text-slate-600">Priority</span>
                                <div className="font-medium mt-1">{selectedAutoReply.priority}</div>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-slate-600">Reply Type</span>
                                <div className="font-medium capitalize mt-1">{selectedAutoReply.replyType}</div>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                              <Reply className="h-4 w-4 text-purple-600" />
                              Reply Content
                            </h4>
                            {selectedAutoReply.replyType === 'template' ? (
                              <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 p-4 rounded-lg border border-purple-200">
                                <div className="font-medium text-purple-900 mb-1">
                                  Template: {selectedAutoReply.templateName}
                                </div>
                                <div className="text-sm text-purple-700">
                                  Language: {selectedAutoReply.templateLanguage}
                                </div>
                              </div>
                            ) : selectedAutoReply.replyType === 'workflow' ? (
                              <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Workflow className="h-4 w-4 text-blue-600" />
                                  <div className="font-medium text-blue-900">Workflow Trigger</div>
                                </div>
                                {selectedAutoReply.workflowId && (
                                  <div className="text-sm text-blue-700 mb-2">
                                    Workflow: {workflows.find(w => w._id === selectedAutoReply.workflowId)?.name || 'Unknown Workflow'}
                                  </div>
                                )}
                                <div className="text-xs text-blue-600">
                                  When triggered, this will start the selected workflow for the customer.
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gradient-to-r from-green-50 to-green-100/50 p-4 rounded-lg border border-green-200">
                                <div className="text-sm text-green-800 whitespace-pre-wrap">
                                  {selectedAutoReply.replyMessage}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="analytics" className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-blue-900">{selectedAutoReply.usageCount || 0}</div>
                              <div className="text-sm text-blue-700">Total Triggers</div>
                            </CardContent>
                          </Card>
                          <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-green-900">
                                {selectedAutoReply.lastTriggered ?
                                  format(new Date(selectedAutoReply.lastTriggered), "MMM dd") :
                                  "Never"
                                }
                              </div>
                              <div className="text-sm text-green-700">Last Triggered</div>
                            </CardContent>
                          </Card>
                          <Card className="border-purple-200 bg-purple-50">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-purple-900">{selectedAutoReply.priority}</div>
                              <div className="text-sm text-purple-700">Priority Level</div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="h-10 w-10 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">Detailed Analytics Coming Soon</h3>
                          <p className="text-muted-foreground max-w-md mx-auto">
                            Advanced analytics with charts, trends, and insights will be available in a future update.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <DialogFooter className="bg-slate-50 -mx-6 -mb-6 px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsViewDialogOpen(false);
                            setTimeout(() => openEditDialog(selectedAutoReply), 100);
                          }}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Auto Reply
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setIsViewDialogOpen(false);
                            setTimeout(() => setIsDeleteDialogOpen(true), 100);
                          }}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Delete Auto Reply?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The auto reply will be permanently deleted and will stop responding to triggers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                {selectedAutoReply && (
                  <div className="py-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border">
                      <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-lg">
                        <Bot className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{selectedAutoReply.name}</div>
                        <div className="text-sm text-slate-600">
                          {selectedAutoReply.triggers.length} trigger{selectedAutoReply.triggers.length !== 1 ? 's' : ''}
                          {selectedAutoReply.usageCount > 0 && ` • ${selectedAutoReply.usageCount} uses`}
                        </div>
                      </div>
                    </div>
                    
                    {selectedAutoReply.isActive && (
                      <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">Warning: This auto reply is currently active</p>
                          <p className="text-sm text-amber-700 mt-1">
                            Deleting an active auto reply will stop automatic responses to the configured triggers.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAutoReply}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Auto Reply
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </TooltipProvider>
    </AutomationsLayout>
  );
}