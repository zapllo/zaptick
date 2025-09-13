"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Pause,
  Copy,
  Eye,
  Workflow,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  Power,
  PowerOff,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Target,
  ChevronRight,
  Filter as FilterIcon,
  X,
  Download,
  Upload,
  Calendar,
  SlidersHorizontal,
  Layers,
  Lightbulb,
  Rocket,
  Crown,
  Star,
  Zap,
  GitBranch,
  Settings,
  AlertCircle,
  MessageSquare,
  Bot,
  Gauge,
  Timer,
  Network,
  ArrowRight,
} from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AutomationsLayout from "@/components/layout/automation-layout";

interface Workflow {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  nodes: any[];
  edges: any[];
  triggers: string[];
  version: number;
  executionCount: number;
  successCount: number;
  failureCount: number;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
}


interface WorkflowLimitInfo {
  currentCount: number;
  limit: number;
  canCreateMore: boolean;
  plan: string;
  planName: string;
  subscriptionStatus: string;
  remainingSlots: number;
}

interface WabaAccount {
  wabaId: string;
  businessName: string;
  phoneNumber: string;
  phoneNumberId: string;
}

export default function WorkflowsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [wabaAccounts, setWabaAccounts] = useState<WabaAccount[]>([]);
  const [selectedWabaId, setSelectedWabaId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [complexityFilter, setComplexityFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  // ... existing state ...
  const [workflowLimitInfo, setWorkflowLimitInfo] = useState<WorkflowLimitInfo | null>(null);
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    fetchWabaAccounts();
  }, []);

  useEffect(() => {
    if (selectedWabaId) {
      fetchWorkflows();
      fetchWorkflowLimitInfo();
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

  const fetchWorkflows = async () => {
    if (!selectedWabaId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/workflows?wabaId=${selectedWabaId}`);
      const data = await response.json();

      if (data.success) {
        setWorkflows(data.workflows);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch workflows",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast({
        title: "Error",
        description: "Failed to fetch workflows",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const fetchWorkflowLimitInfo = async () => {
    if (!selectedWabaId) return;

    try {
      const response = await fetch(`/api/workflows/limit?wabaId=${selectedWabaId}`);
      const data = await response.json();

      if (data.success) {
        setWorkflowLimitInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching workflow limit info:', error);
    }
  };

  const handleCreateWorkflow = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workflow name",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          wabaId: selectedWabaId
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Workflow created successfully",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        fetchWorkflowLimitInfo(); // Refresh limit info
        router.push(`/automations/workflows/${data.workflow._id}/builder`);
      } else {
        // Handle specific error codes
        if (data.code === 'WORKFLOW_LIMIT_REACHED') {
          toast({
            title: "Workflow Limit Reached",
            description: `You've reached the ${data.limit} workflow limit for your ${data.plan} plan. Upgrade to create more workflows.`,
            variant: "destructive",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/settings/billing'}
                className="ml-2"
              >
                Upgrade Plan
              </Button>
            ),
          });
        } else if (data.code === 'SUBSCRIPTION_INACTIVE') {
          toast({
            title: "Subscription Required",
            description: "Your subscription is not active. Please upgrade or renew your plan to create workflows.",
            variant: "destructive",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/settings/billing'}
                className="ml-2"
              >
                View Billing
              </Button>
            ),
          });
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to create workflow",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: "Error",
        description: "Failed to create workflow",
        variant: "destructive",
      });
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'growth': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'advanced': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'enterprise': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'starter': return <Zap className="h-4 w-4" />;
      case 'growth': return <TrendingUp className="h-4 w-4" />;
      case 'advanced': return <Sparkles className="h-4 w-4" />;
      case 'enterprise': return <Crown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };


  const handleDeleteWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      const response = await fetch(`/api/workflows/${selectedWorkflow._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Workflow deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        setSelectedWorkflow(null);
        fetchWorkflows();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete workflow",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (workflow: Workflow) => {
    try {
      const response = await fetch(`/api/workflows/${workflow._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !workflow.isActive
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: `Workflow ${!workflow.isActive ? 'activated' : 'deactivated'} successfully`,
        });
        fetchWorkflows();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update workflow status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error toggling workflow status:', error);
      toast({
        title: "Error",
        description: "Failed to update workflow status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: ""
    });
  };

  const getComplexityLevel = (workflow: Workflow) => {
    const nodeCount = workflow.nodes.length;
    if (nodeCount <= 3) return 'simple';
    if (nodeCount <= 8) return 'moderate';
    return 'complex';
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'complex':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (workflow.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && workflow.isActive) ||
      (statusFilter === "inactive" && !workflow.isActive);

    const complexity = getComplexityLevel(workflow);
    const matchesComplexity = complexityFilter === "all" || complexity === complexityFilter;

    return matchesSearch && matchesStatus && matchesComplexity;
  });

  const getSuccessRate = (workflow: Workflow) => {
    if (workflow.executionCount === 0) return 0;
    return Math.round((workflow.successCount / workflow.executionCount) * 100);
  };

  // Calculate stats
  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.isActive).length;
  const totalExecutions = workflows.reduce((sum, w) => sum + w.executionCount, 0);
  const avgSuccessRate = totalWorkflows > 0
    ? Math.round(workflows.reduce((sum, w) => sum + getSuccessRate(w), 0) / totalWorkflows)
    : 0;

  const getStatusIcon = (workflow: Workflow) => {
    if (workflow.isActive) {
      return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>;
    }
    return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
  };

  return (
    <AutomationsLayout>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 wark:from-slate-900 wark:via-slate-800 wark:to-slate-900/50">
          <div className="mx-auto p-6 space-y-8">
            {/* Modern Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 shadow-sm">
                      <Workflow className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent wark:from-white wark:to-slate-200">
                      Workflows
                    </h1>
                    <p className="text-slate-600 wark:text-slate-300 font-medium">
                      Create and manage multi-step automation sequences
                    </p>
                  </div>
                </div>

                {/* Workflow Stats Pills */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                      {totalWorkflows} Total
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                      {activeWorkflows} Active
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                      {totalExecutions.toLocaleString()} Runs
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                      {avgSuccessRate}% Success
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-slate-200 wark:border-slate-700 hover:border-purple-300 wark:hover:border-purple-600 hover:bg-purple-50 wark:hover:bg-purple-900/20"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Workflow templates will be available soon",
                    });
                  }}
                >
                  <Lightbulb className="h-4 w-4" />
                  Templates
                </Button>
                <Button
                  onClick={() => {
                    if (workflowLimitInfo && !workflowLimitInfo.canCreateMore) {
                      if (workflowLimitInfo.subscriptionStatus !== 'active') {
                        toast({
                          title: "Subscription Required",
                          description: "Your subscription is not active. Please upgrade or renew your plan to create workflows.",
                          variant: "destructive",
                          action: (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = '/settings/billing'}
                              className="ml-2"
                            >
                              View Billing
                            </Button>
                          ),
                        });
                      } else {
                        toast({
                          title: "Workflow Limit Reached",
                          description: `You've reached the ${workflowLimitInfo.limit} workflow limit for your ${workflowLimitInfo.planName} plan. Upgrade to create more workflows.`,
                          variant: "destructive",
                          action: (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = '/settings/billing'}
                              className="ml-2"
                            >
                              Upgrade Plan
                            </Button>
                          ),
                        });
                      }
                      return;
                    }
                    setIsCreateDialogOpen(true);
                  }}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                  disabled={workflowLimitInfo && !workflowLimitInfo.canCreateMore}
                >
                  <Plus className="h-4 w-4" />
                  Create Workflow
                </Button>
              </div>
            </div>

            {/* Workflow Limit Info Card */}
            {workflowLimitInfo && (
              <Card className="border-0 shadow-sm p-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${getPlanColor(workflowLimitInfo.plan)}`}>
                        {getPlanIcon(workflowLimitInfo.plan)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {workflowLimitInfo.planName} Plan - Workflows
                        </h3>
                        <p className="text-sm text-slate-600">
                          {workflowLimitInfo.limit === Infinity
                            ? `${workflowLimitInfo.currentCount} workflows created (Unlimited)`
                            : `${workflowLimitInfo.currentCount} of ${workflowLimitInfo.limit} workflows used`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* {workflowLimitInfo.limit !== Infinity && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-700">
                            {workflowLimitInfo.remainingSlots} slots remaining
                          </div>
                          <div className="w-32 bg-slate-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${(workflowLimitInfo.currentCount / workflowLimitInfo.limit) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      )} */}
                      {!workflowLimitInfo.canCreateMore && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = '/settings/billing'}
                          className="border-blue-500/20 text-blue-600 hover:bg-blue-500/5"
                        >
                          Upgrade Plan
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters & Controls */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search workflows..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20"
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

                      <Select value={complexityFilter} onValueChange={setComplexityFilter}>
                        <SelectTrigger className="w-40 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Complexity</SelectItem>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="complex">Complex</SelectItem>
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
                          onClick={fetchWorkflows}
                          className="gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Refresh
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Refresh workflows</TooltipContent>
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
                      <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Workflow className="w-6 h-6 text-blue-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900">Loading Workflows</h3>
                      <p className="text-sm text-muted-foreground">Fetching your automation sequences...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredWorkflows.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto">
                        <Workflow className="h-12 w-12 text-blue-600" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {searchQuery || statusFilter !== "all" || complexityFilter !== "all"
                          ? "No matching workflows found"
                          : "Ready to automate your customer journey?"
                        }
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                        {searchQuery || statusFilter !== "all" || complexityFilter !== "all"
                          ? "Try adjusting your search or filter criteria to find what you're looking for."
                          : "Create intelligent workflow sequences to guide customers through complex interactions and boost engagement."
                        }
                      </p>
                    </div>

                    {!searchQuery && statusFilter === "all" && complexityFilter === "all" && (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                          onClick={() => setIsCreateDialogOpen(true)}
                          className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                          size="lg"
                        >
                          <Plus className="h-5 w-5" />
                          Create Your First Workflow
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="gap-2"
                          onClick={() => {
                            toast({
                              title: "Coming Soon",
                              description: "Workflow templates will be available soon",
                            });
                          }}
                        >
                          <Lightbulb className="h-5 w-5" />
                          Browse Templates
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
                    {filteredWorkflows.map((workflow) => (
                      <Card
                        key={workflow._id}
                        className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200 group"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-lg">
                                <Workflow className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer"
                                  onClick={() => router.push(`/automations/workflows/${workflow._id}/builder`)}
                                >
                                  {workflow.name}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  {getStatusIcon(workflow)}
                                  <Badge
                                    variant={workflow.isActive ? "default" : "secondary"}
                                    className={cn(
                                      "text-xs",
                                      workflow.isActive
                                        ? "bg-green-100 text-green-700 border-green-200"
                                        : "bg-slate-100 text-slate-600 border-slate-200"
                                    )}
                                  >
                                    {workflow.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={cn("text-xs capitalize", getComplexityColor(getComplexityLevel(workflow)))}
                                  >
                                    {getComplexityLevel(workflow)}
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
                                    setSelectedWorkflow(workflow);
                                    setIsViewDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/automations/workflows/${workflow._id}/builder`)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Workflow
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(workflow)}>
                                  {workflow.isActive ? (
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
                                    setSelectedWorkflow(workflow);
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
                          {workflow.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {workflow.description}
                            </p>
                          )}

                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Structure</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {workflow.nodes.length} nodes
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {workflow.edges.length} connections
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Performance</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{getSuccessRate(workflow)}%</span>
                                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full transition-all duration-500",
                                      getSuccessRate(workflow) >= 80 ? "bg-green-500" :
                                        getSuccessRate(workflow) >= 60 ? "bg-yellow-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${getSuccessRate(workflow)}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Executions</p>
                                <p className="font-medium">{workflow.executionCount}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Version</p>
                                <p className="font-medium">v{workflow.version}</p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {workflow.lastTriggered ? (
                                  <>Last run {format(new Date(workflow.lastTriggered), "MMM dd")}</>
                                ) : (
                                  "Never executed"
                                )}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(workflow)}
                                className="h-8 px-3"
                              >
                                {workflow.isActive ? (
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
                  <Card className="border-0 p-0 shadow-sm bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className='bg-[#DAE9E0] -50/80 hover:bg-[#DAE9E0]  p-0 border '>
                            <TableRow className="">
                              <TableHead className="font-semibold text-slate-700">Name</TableHead>
                              <TableHead className="font-semibold text-slate-700">Status</TableHead>
                              <TableHead className="font-semibold text-slate-700">Complexity</TableHead>
                              <TableHead className="font-semibold text-slate-700">Structure</TableHead>
                              <TableHead className="font-semibold text-slate-700">Executions</TableHead>
                              <TableHead className="font-semibold text-slate-700">Success Rate</TableHead>
                              <TableHead className="font-semibold text-slate-700">Last Run</TableHead>
                              <TableHead className="font-semibold text-slate-700">Updated</TableHead>
                              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredWorkflows.map((workflow) => (
                              <TableRow key={workflow._id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell>
                                  <div className="space-y-1">
                                    <div
                                      className="font-medium text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                                      onClick={() => router.push(`/automations/workflows/${workflow._id}/builder`)}
                                    >
                                      {workflow.name}
                                    </div>
                                    {workflow.description && (
                                      <div className="text-xs text-muted-foreground line-clamp-1">
                                        {workflow.description}
                                      </div>
                                    )}
                                    <div className="text-xs text-muted-foreground">
                                      v{workflow.version}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(workflow)}
                                    <Badge
                                      variant={workflow.isActive ? "default" : "secondary"}
                                      className={cn(
                                        "gap-1",
                                        workflow.isActive
                                          ? "bg-green-100 text-green-700 border-green-200"
                                          : "bg-slate-100 text-slate-600 border-slate-200"
                                      )}
                                    >
                                      {workflow.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={cn("capitalize text-xs", getComplexityColor(getComplexityLevel(workflow)))}
                                  >
                                    {getComplexityLevel(workflow)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="font-medium">{workflow.nodes.length} nodes</div>
                                    <div className="text-muted-foreground">{workflow.edges.length} connections</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="font-medium">{workflow.executionCount}</div>
                                    <div className="text-muted-foreground">
                                      {workflow.successCount}✓ {workflow.failureCount}✗
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium">
                                      {getSuccessRate(workflow)}%
                                    </div>
                                    <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className={cn(
                                          "h-full transition-all duration-500",
                                          getSuccessRate(workflow) >= 80 ? "bg-green-500" :
                                            getSuccessRate(workflow) >= 60 ? "bg-yellow-500" : "bg-red-500"
                                        )}
                                        style={{ width: `${getSuccessRate(workflow)}%` }}
                                      />
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {workflow.lastTriggered ? (
                                    <div className="text-sm">
                                      <div className="font-medium">
                                        {format(new Date(workflow.lastTriggered), "MMM dd, yyyy")}
                                      </div>
                                      <div className="text-muted-foreground">
                                        {format(new Date(workflow.lastTriggered), "HH:mm")}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">Never</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="font-medium">
                                      {format(new Date(workflow.updatedAt), "MMM dd, yyyy")}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {format(new Date(workflow.updatedAt), "HH:mm")}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end items-center gap-1">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleToggleStatus(workflow)}
                                          className="h-8 w-8 p-0"
                                        >
                                          {workflow.isActive ? (
                                            <Pause className="h-3.5 w-3.5" />
                                          ) : (
                                            <Play className="h-3.5 w-3.5" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {workflow.isActive ? 'Deactivate' : 'Activate'}
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
                                            setSelectedWorkflow(workflow);
                                            setIsViewDialogOpen(true);
                                          }}
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => router.push(`/automations/workflows/${workflow._id}/builder`)}
                                        >
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit Workflow
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Copy className="h-4 w-4 mr-2" />
                                          Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-red-600 focus:text-red-600"
                                          onClick={() => {
                                            setSelectedWorkflow(workflow);
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

            {/* Create Workflow Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-lg">
                      <Workflow className="h-5 w-5 text-blue-600" />
                    </div>
                    Create New Workflow
                  </DialogTitle>
                  <DialogDescription>
                    Create a new workflow to automate complex customer interactions and sequences.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Workflow Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Customer Onboarding Flow"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this workflow does and its purpose..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="bg-white"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Getting Started</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          After creation, you&apos;ll be taken to the visual workflow builder where you can drag and drop nodes to create your automation sequence.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="bg-slate-50 -mx-6 -mb-6 px-6 py-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateWorkflow}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    Create & Open Builder
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* View Workflow Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                {selectedWorkflow && (
                  <>
                    <DialogHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-lg">
                              <Workflow className="h-5 w-5 text-blue-600" />
                            </div>
                            {selectedWorkflow.name}
                          </DialogTitle>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(selectedWorkflow)}
                            <Badge
                              variant={selectedWorkflow.isActive ? "default" : "secondary"}
                              className={cn(
                                selectedWorkflow.isActive
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              )}
                            >
                              {selectedWorkflow.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn("capitalize", getComplexityColor(getComplexityLevel(selectedWorkflow)))}
                            >
                              {getComplexityLevel(selectedWorkflow)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              v{selectedWorkflow.version}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </DialogHeader>

                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="structure" className="gap-2">
                          <Network className="h-4 w-4" />
                          Structure
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Analytics
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-6 pt-6">
                        <div className="space-y-4">
                          {selectedWorkflow.description && (
                            <div>
                              <h4 className="font-medium text-slate-900 mb-2">Description</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {selectedWorkflow.description}
                              </p>
                            </div>
                          )}

                          <Separator />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <span className="text-sm font-medium text-slate-600">Created</span>
                                <div className="font-medium mt-1">
                                  {format(new Date(selectedWorkflow.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                                </div>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-slate-600">Last Updated</span>
                                <div className="font-medium mt-1">
                                  {format(new Date(selectedWorkflow.updatedAt), "MMM dd, yyyy 'at' HH:mm")}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <span className="text-sm font-medium text-slate-600">Version</span>
                                <div className="font-medium mt-1">v{selectedWorkflow.version}</div>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-slate-600">Last Triggered</span>
                                <div className="font-medium mt-1">
                                  {selectedWorkflow.lastTriggered
                                    ? format(new Date(selectedWorkflow.lastTriggered), "MMM dd, yyyy 'at' HH:mm")
                                    : "Never executed"
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="structure" className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-200/50 rounded-lg">
                                  <GitBranch className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-blue-900">{selectedWorkflow.nodes.length}</div>
                                  <div className="text-sm text-blue-700">Workflow Nodes</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="border-purple-200 bg-purple-50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-200/50 rounded-lg">
                                  <Network className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-purple-900">{selectedWorkflow.edges.length}</div>
                                  <div className="text-sm text-purple-700">Connections</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="text-center py-8">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <GitBranch className="h-10 w-10 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">Visual Structure Coming Soon</h3>
                          <p className="text-muted-foreground max-w-md mx-auto">
                            A visual representation of your workflow structure will be available in a future update.
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="analytics" className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-blue-900">{selectedWorkflow.executionCount}</div>
                              <div className="text-sm text-blue-700">Total Executions</div>
                            </CardContent>
                          </Card>
                          <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-green-900">{selectedWorkflow.successCount}</div>
                              <div className="text-sm text-green-700">Successful Runs</div>
                            </CardContent>
                          </Card>
                          <Card className="border-red-200 bg-red-50">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-red-900">{selectedWorkflow.failureCount}</div>
                              <div className="text-sm text-red-700">Failed Runs</div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card className="border-amber-200 bg-amber-50">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-amber-900">Success Rate</h4>
                              <span className="text-2xl font-bold text-amber-900">{getSuccessRate(selectedWorkflow)}%</span>
                            </div>
                            <div className="w-full bg-amber-200/50 rounded-full h-3">
                              <div
                                className="bg-amber-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${getSuccessRate(selectedWorkflow)}%` }}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        <div className="text-center py-8">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="h-10 w-10 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">Detailed Analytics Coming Soon</h3>
                          <p className="text-muted-foreground max-w-md mx-auto">
                            Advanced analytics with charts, trends, and performance insights will be available in a future update.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <DialogFooter className="bg-slate-50 -mx-6 -mb-6 px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/automations/workflows/${selectedWorkflow._id}/builder`)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Workflow
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
                    Delete Workflow?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The workflow will be permanently deleted and will stop processing any triggers.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {selectedWorkflow && (
                  <div className="py-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border">
                      <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-lg">
                        <Workflow className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{selectedWorkflow.name}</div>
                        <div className="text-sm text-slate-600">
                          {selectedWorkflow.nodes.length} nodes • v{selectedWorkflow.version}
                          {selectedWorkflow.executionCount > 0 && ` • ${selectedWorkflow.executionCount} executions`}
                        </div>
                      </div>
                    </div>

                    {selectedWorkflow.isActive && (
                      <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">Warning: This workflow is currently active</p>
                          <p className="text-sm text-amber-700 mt-1">
                            Deleting an active workflow will stop all automated sequences and may affect customer interactions.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteWorkflow}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Workflow
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
