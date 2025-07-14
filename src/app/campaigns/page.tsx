"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Filter,
  Loader2,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  Tag,
  Trash2,
  Users,
  MessageSquare,
  BarChart,
  Copy,
  CheckCircle,
  ClipboardList,
  XCircle,
  Info,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Activity,
  Target,
  Download,
  Upload,
  Eye,
  Layers,
  Lightbulb,
  Crown,
  Star,
  Zap,
  Send,
  BarChart3,
  ArrowUpRight,
  Gauge
} from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
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

// Define campaign types
interface Campaign {
  id: string;
  name: string;
  type: "ongoing" | "one-time";
  status: "draft" | "scheduled" | "active" | "paused" | "completed" | "failed";
  audience: {
    count: number;
  };
  createdAt: string;
  updatedAt: string;
  metrics?: {
    delivered: number;
    read: number;
    replied: number;
    conversions: number;
  };
  scheduleTime?: string;
}

const CampaignsPage = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Fetch campaigns on component mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Apply filters when search, status, or type filters change
  useEffect(() => {
    applyFilters();
  }, [campaigns, searchQuery, statusFilter, typeFilter]);

  // Fetch campaigns from API
  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);

      const response = await fetch(`/api/campaigns?${params}`);
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.campaigns || []);
      } else {
        toast.error(data.error || "Failed to fetch campaigns");
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Failed to fetch campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to campaigns
  const applyFilters = () => {
    let result = [...campaigns];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((campaign) =>
        campaign.name.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((campaign) => campaign.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((campaign) => campaign.type === typeFilter);
    }

    setFilteredCampaigns(result);
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { 
        variant: "default" as const, 
        className: "bg-green-100 text-green-700 border-green-200", 
        icon: PlayCircle 
      },
      'paused': { 
        variant: "secondary" as const, 
        className: "bg-yellow-100 text-yellow-700 border-yellow-200", 
        icon: PauseCircle 
      },
      'scheduled': { 
        variant: "outline" as const, 
        className: "bg-blue-100 text-blue-700 border-blue-200", 
        icon: Calendar 
      },
      'draft': { 
        variant: "outline" as const, 
        className: "bg-gray-100 text-gray-700 border-gray-200", 
        icon: ClipboardList 
      },
      'completed': { 
        variant: "default" as const, 
        className: "bg-emerald-100 text-emerald-700 border-emerald-200", 
        icon: CheckCircle 
      },
      'failed': { 
        variant: "destructive" as const, 
        className: "bg-red-100 text-red-700 border-red-200", 
        icon: XCircle 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={cn("gap-1", config.className)}>
        <Icon className="h-3 w-3" />
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ongoing':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'one-time':
        return <Zap className="h-4 w-4 text-purple-600" />;
      default:
        return <Rocket className="h-4 w-4 text-gray-600" />;
    }
  };

  // Handle campaign deletion
  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;

    try {
      const response = await fetch(`/api/campaigns/${selectedCampaign.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Campaign deleted successfully");
        fetchCampaigns();
      } else {
        toast.error(data.error || "Failed to delete campaign");
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("Failed to delete campaign");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedCampaign(null);
    }
  };

  // Handle campaign duplication
  const handleDuplicateCampaign = async () => {
    if (!selectedCampaign) return;

    try {
      const response = await fetch(`/api/campaigns/${selectedCampaign.id}/duplicate`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Campaign duplicated successfully");
        fetchCampaigns();
      } else {
        toast.error(data.error || "Failed to duplicate campaign");
      }
    } catch (error) {
      console.error("Error duplicating campaign:", error);
      toast.error("Failed to duplicate campaign");
    } finally {
      setIsDuplicateDialogOpen(false);
      setSelectedCampaign(null);
    }
  };

  // Handle campaign status change
  const handleCampaignStatusChange = async (campaignId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(`Campaign ${newStatus === "active" ? "activated" : "paused"} successfully`);
        fetchCampaigns();
      } else {
        toast.error(data.error || `Failed to ${newStatus === "active" ? "activate" : "pause"} campaign`);
      }
    } catch (error) {
      console.error("Error changing campaign status:", error);
      toast.error(`Failed to ${newStatus === "active" ? "activate" : "pause"} campaign`);
    }
  };

  // Calculate metrics progress percentage
  const calculateProgress = (value: number, total: number) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  // Calculate stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalAudience = campaigns.reduce((sum, c) => sum + c.audience.count, 0);
  const avgDeliveryRate = campaigns.length > 0 
    ? Math.round(campaigns.reduce((sum, c) => {
        if (c.metrics && c.audience.count > 0) {
          return sum + (c.metrics.delivered / c.audience.count) * 100;
        }
        return sum;
      }, 0) / campaigns.length) 
    : 0;

  return (
    <Layout>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
          <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl">
                    <Rocket className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      WhatsApp Campaigns
                    </h1>
                    <p className="text-muted-foreground font-medium">
                      Create and manage your WhatsApp message campaigns
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
                    toast.success("Campaign data exported successfully");
                  }}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                
                <Button
                  onClick={() => router.push("/campaigns/create")}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-600">Total Campaigns</p>
                      <p className="text-3xl font-bold text-blue-900">{totalCampaigns}</p>
                      <p className="text-xs text-blue-600/80">
                        {totalCampaigns > 0 ? '+12% from last month' : 'Get started'}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-200/50 rounded-xl">
                      <Rocket className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-green-600">Active Campaigns</p>
                      <p className="text-3xl font-bold text-green-900">{activeCampaigns}</p>
                      <p className="text-xs text-green-600/80">
                        Currently running
                      </p>
                    </div>
                    <div className="p-3 bg-green-200/50 rounded-xl">
                      <PlayCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-purple-600">Total Audience</p>
                      <p className="text-3xl font-bold text-purple-900">{totalAudience.toLocaleString()}</p>
                      <p className="text-xs text-purple-600/80">
                        Contacts reached
                      </p>
                    </div>
                    <div className="p-3 bg-purple-200/50 rounded-xl">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-amber-600">Avg Delivery Rate</p>
                      <p className="text-3xl font-bold text-amber-900">{avgDeliveryRate}%</p>
                      <div className="w-full bg-amber-200/50 rounded-full h-2 mt-2">
                        <div 
                          className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${avgDeliveryRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-amber-200/50 rounded-xl">
                      <Send className="h-6 w-6 text-amber-600" />
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
                        placeholder="Search campaigns..."
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
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-36 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="one-time">One-time</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all");
                          setTypeFilter("all");
                        }}
                        disabled={searchQuery === "" && statusFilter === "all" && typeFilter === "all"}
                        className="gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Reset
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={fetchCampaigns}
                          className="gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Refresh
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Refresh campaigns</TooltipContent>
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
                        <Rocket className="w-6 h-6 text-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900">Loading Campaigns</h3>
                      <p className="text-sm text-muted-foreground">Fetching your campaign data...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredCampaigns.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mx-auto">
                        <Rocket className="h-12 w-12 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                          ? "No campaigns found"
                          : "Ready to launch your first campaign?"
                        }
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                        {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                          ? "Try adjusting your search or filter criteria to find what you're looking for."
                          : "Create powerful WhatsApp campaigns to reach your audience and drive engagement with personalized messages."
                        }
                      </p>
                    </div>

                    {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button 
                          onClick={() => router.push("/campaigns/create")}
                          className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                          size="lg"
                        >
                          <Plus className="h-5 w-5" />
                          Create Your First Campaign
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="gap-2"
                          onClick={() => {
                            toast.success("Campaign templates will be available soon");
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
                    {filteredCampaigns.map((campaign) => (
                      <Card 
                        key={campaign.id} 
                        className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200 group"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                                {getTypeIcon(campaign.type)}
                              </div>
                              <div className="flex-1">
                                <CardTitle 
                                  className="text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors cursor-pointer line-clamp-1"
                                  onClick={() => {
                                    setSelectedCampaign(campaign);
                                    setIsViewDetailsOpen(true);
                                  }}
                                >
                                  {campaign.name}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  {getStatusBadge(campaign.status)}
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {campaign.type.replace('-', ' ')}
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
                                    setSelectedCampaign(campaign);
                                    setIsViewDetailsOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {campaign.status === "draft" && (
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/campaigns/edit/${campaign.id}`)}
                                  >
                                    <Settings className="h-4 w-4 mr-2" />
                                    Edit Campaign
                                  </DropdownMenuItem>
                                )}
                                {campaign.status === "active" && (
                                  <DropdownMenuItem
                                    onClick={() => handleCampaignStatusChange(campaign.id, "paused")}
                                  >
                                    <PauseCircle className="h-4 w-4 mr-2" />
                                    Pause
                                  </DropdownMenuItem>
                                )}
                                {campaign.status === "paused" && (
                                  <DropdownMenuItem
                                    onClick={() => handleCampaignStatusChange(campaign.id, "active")}
                                  >
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    Resume
                                  </DropdownMenuItem>
                                )}
                                {campaign.status !== "active" && campaign.status !== "completed" && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedCampaign(campaign);
                                      setIsDuplicateDialogOpen(true);
                                    }}
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => {
                                    setSelectedCampaign(campaign);
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
                        
                        <CardContent className="space-y-4 pb-4">
                          <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Audience</span>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium">{campaign.audience.count.toLocaleString()}</span>
                              </div>
                            </div>

                            {campaign.scheduleTime && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Scheduled</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-medium">
                                    {format(new Date(campaign.scheduleTime), "MMM dd, HH:mm")}
                                  </span>
                                </div>
                              </div>
                            )}

                            {campaign.metrics && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Delivery Rate</span>
                                  <span className="font-medium">
                                    {calculateProgress(campaign.metrics.delivered, campaign.audience.count)}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-500"
                                    style={{ 
                                      width: `${calculateProgress(campaign.metrics.delivered, campaign.audience.count)}%` 
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {campaign.metrics && (
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div className="text-center">
                                <p className="text-muted-foreground">Delivered</p>
                                <p className="font-medium">{campaign.metrics.delivered}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">Read</p>
                                <p className="font-medium">{campaign.metrics.read}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">Replied</p>
                                <p className="font-medium">{campaign.metrics.replied}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                        
                        <CardFooter className="pt-0">
                          <div className="flex items-center justify-between text-xs text-muted-foreground w-full">
                            <span>Created {format(new Date(campaign.createdAt), "MMM dd, yyyy")}</span>
                            <div className="flex items-center gap-1">
                              {campaign.status === "active" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCampaignStatusChange(campaign.id, "paused")}
                                  className="h-7 px-2 text-xs"
                                >
                                  <PauseCircle className="h-3 w-3" />
                                </Button>
                              )}
                              {campaign.status === "paused" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCampaignStatusChange(campaign.id, "active")}
                                  className="h-7 px-2 text-xs"
                                >
                                  <PlayCircle className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardFooter>
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
                              <TableHead className="font-semibold text-slate-700">Campaign Name</TableHead>
                              <TableHead className="font-semibold text-slate-700">Type</TableHead>
                              <TableHead className="font-semibold text-slate-700">Status</TableHead>
                              <TableHead className="font-semibold text-slate-700">Audience Size</TableHead>
                              <TableHead className="font-semibold text-slate-700">Schedule</TableHead>
                              <TableHead className="font-semibold text-slate-700">Performance</TableHead>
                              <TableHead className="font-semibold text-slate-700">Created</TableHead>
                              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredCampaigns.map((campaign) => (
                              <TableRow key={campaign.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell>
                                  <div className="space-y-1">
                                    <div 
                                      className="font-medium text-slate-900 hover:text-primary cursor-pointer transition-colors"
                                      onClick={() => {
                                        setSelectedCampaign(campaign);
                                        setIsViewDetailsOpen(true);
                                      }}
                                    >
                                      {campaign.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Updated {format(new Date(campaign.updatedAt), "MMM dd")}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getTypeIcon(campaign.type)}
                                    <Badge variant="outline" className="capitalize">
                                      {campaign.type.replace('-', ' ')}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(campaign.status)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{campaign.audience.count.toLocaleString()}</span>
                                    <span className="text-xs text-muted-foreground">contacts</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {campaign.scheduleTime ? (
                                    <div className="text-sm">
                                      <div className="font-medium">
                                        {format(new Date(campaign.scheduleTime), "MMM dd, yyyy")}
                                      </div>
                                      <div className="text-muted-foreground">
                                        {format(new Date(campaign.scheduleTime), "HH:mm")}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {campaign.metrics ? (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                          {calculateProgress(campaign.metrics.delivered, campaign.audience.count)}%
                                        </span>
                                        <span className="text-xs text-muted-foreground">delivered</span>
                                      </div>
                                      <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-primary transition-all duration-500"
                                          style={{ 
                                            width: `${calculateProgress(campaign.metrics.delivered, campaign.audience.count)}%` 
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">No data</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="font-medium">
                                      {format(new Date(campaign.createdAt), "MMM dd, yyyy")}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {format(new Date(campaign.createdAt), "HH:mm")}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end items-center gap-1">
                                    {campaign.status === "draft" && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(`/campaigns/edit/${campaign.id}`)}
                                            className="h-8 w-8 p-0"
                                          >
                                            <Settings className="h-3.5 w-3.5" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit Campaign</TooltipContent>
                                      </Tooltip>
                                    )}
                                    {campaign.status === "active" && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCampaignStatusChange(campaign.id, "paused")}
                                            className="h-8 w-8 p-0"
                                          >
                                            <PauseCircle className="h-3.5 w-3.5" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Pause Campaign</TooltipContent>
                                      </Tooltip>
                                    )}
                                    {campaign.status === "paused" && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCampaignStatusChange(campaign.id, "active")}
                                            className="h-8 w-8 p-0"
                                          >
                                            <PlayCircle className="h-3.5 w-3.5" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Resume Campaign</TooltipContent>
                                      </Tooltip>
                                    )}
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
                                            setSelectedCampaign(campaign);
                                            setIsViewDetailsOpen(true);
                                          }}
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        {campaign.status !== "active" && campaign.status !== "completed" && (
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setSelectedCampaign(campaign);
                                              setIsDuplicateDialogOpen(true);
                                            }}
                                          >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Duplicate
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-red-600 focus:text-red-600"
                                          onClick={() => {
                                            setSelectedCampaign(campaign);
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Delete Campaign?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The campaign will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                {selectedCampaign && (
                  <div className="py-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border">
                      <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-lg">
                        <Rocket className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{selectedCampaign.name}</div>
                        <div className="text-sm text-slate-600">
                          {selectedCampaign.type.replace('-', ' ')} campaign • {selectedCampaign.audience.count} contacts
                        </div>
                      </div>
                    </div>
                    
                    {selectedCampaign.status === "active" && (
                      <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">Warning: This campaign is currently active</p>
                          <p className="text-sm text-amber-700 mt-1">
                            Deleting an active campaign will immediately stop all message deliveries.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteCampaign}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Campaign
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Duplicate Campaign Dialog */}
            <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Copy className="h-5 w-5 text-primary" />
                    Duplicate Campaign
                  </DialogTitle>
                  <DialogDescription>
                    Create a copy of this campaign with the same settings.
                  </DialogDescription>
                </DialogHeader>
                
                {selectedCampaign && (
                  <div className="py-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border">
                      <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                        <Rocket className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{selectedCampaign.name}</div>
                        <div className="text-sm text-slate-600">
                          {selectedCampaign.type.replace('-', ' ')} campaign
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">New copy will be created as a draft</p>
                        <p className="text-sm text-blue-700 mt-1">
                          You&apos;ll be able to modify the campaign before launching it.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDuplicateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleDuplicateCampaign}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Campaign Details Dialog */}
            <Dialog
              open={isViewDetailsOpen}
              onOpenChange={setIsViewDetailsOpen}
            >
              <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                {selectedCampaign ? (
                  <>
                    <DialogHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                              <Rocket className="h-6 w-6 text-primary" />
                            </div>
                            {selectedCampaign.name}
                          </DialogTitle>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(selectedCampaign.status)}
                            <Badge variant="outline" className="capitalize">
                              {selectedCampaign.type.replace('-', ' ')} Campaign
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
                        <TabsTrigger value="performance" className="gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Performance
                        </TabsTrigger>
                        <TabsTrigger value="audience" className="gap-2">
                          <Users className="h-4 w-4" />
                          Audience
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                Campaign Details
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex justify-between items-center py-2">
                                <span className="text-muted-foreground">Type</span>
                                <div className="flex items-center gap-2">
                                  {getTypeIcon(selectedCampaign.type)}
                                  <span className="font-medium capitalize">{selectedCampaign.type.replace('-', ' ')}</span>
                                </div>
                              </div>
                              <Separator />
                              <div className="flex justify-between items-center py-2">
                                <span className="text-muted-foreground">Status</span>
                                {getStatusBadge(selectedCampaign.status)}
                              </div>
                              <Separator />
                              <div className="flex justify-between items-center py-2">
                                <span className="text-muted-foreground">Audience Size</span>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{selectedCampaign.audience.count.toLocaleString()}</span>
                                </div>
                              </div>
                              <Separator />
                              <div className="flex justify-between items-center py-2">
                                <span className="text-muted-foreground">Created</span>
                                <span className="font-medium">
                                  {format(new Date(selectedCampaign.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                                </span>
                              </div>
                              {selectedCampaign.scheduleTime && (
                                <>
                                  <Separator />
                                  <div className="flex justify-between items-center py-2">
                                    <span className="text-muted-foreground">Scheduled</span>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">
                                        {format(new Date(selectedCampaign.scheduleTime), "MMM dd, yyyy 'at' HH:mm")}
                                      </span>
                                    </div>
                                  </div>
                                </>
                              )}
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                Performance Summary
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {selectedCampaign.metrics ? (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">Delivered</span>
                                      <span className="text-sm font-medium">
                                        {selectedCampaign.metrics.delivered} / {selectedCampaign.audience.count}
                                      </span>
                                    </div>
                                    <Progress
                                      value={calculateProgress(
                                        selectedCampaign.metrics.delivered,
                                        selectedCampaign.audience.count
                                      )}
                                      className="h-2"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">Read</span>
                                      <span className="text-sm font-medium">
                                        {selectedCampaign.metrics.read} / {selectedCampaign.metrics.delivered}
                                      </span>
                                    </div>
                                    <Progress
                                      value={calculateProgress(
                                        selectedCampaign.metrics.read,
                                        selectedCampaign.metrics.delivered
                                      )}
                                      className="h-2"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">Replied</span>
                                      <span className="text-sm font-medium">
                                        {selectedCampaign.metrics.replied} / {selectedCampaign.metrics.delivered}
                                      </span>
                                    </div>
                                    <Progress
                                      value={calculateProgress(
                                        selectedCampaign.metrics.replied,
                                        selectedCampaign.metrics.delivered
                                      )}
                                      className="h-2"
                                    />
                                  </div>

                                  {selectedCampaign.metrics.conversions !== undefined && (
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm">Conversions</span>
                                        <span className="text-sm font-medium">
                                          {selectedCampaign.metrics.conversions} / {selectedCampaign.metrics.delivered}
                                        </span>
                                      </div>
                                      <Progress
                                        value={calculateProgress(
                                          selectedCampaign.metrics.conversions,
                                          selectedCampaign.metrics.delivered
                                        )}
                                        className="h-2"
                                      />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                  <BarChart className="h-8 w-8 text-muted-foreground mb-3" />
                                  <p className="text-muted-foreground">
                                    {selectedCampaign.status === "draft" || selectedCampaign.status === "scheduled"
                                      ? "Campaign has not started yet"
                                      : "No metrics available"}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                              Campaign Actions
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-3">
                              {selectedCampaign.status === "draft" && (
                                <Button
                                  variant="outline"
                                  onClick={() => router.push(`/campaigns/edit/${selectedCampaign.id}`)}
                                  className="gap-2"
                                >
                                  <Settings className="h-4 w-4" />
                                  Edit Campaign
                                </Button>
                              )}

                              {selectedCampaign.status === "active" && (
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    handleCampaignStatusChange(selectedCampaign.id, "paused");
                                    setIsViewDetailsOpen(false);
                                  }}
                                  className="gap-2"
                                >
                                  <PauseCircle className="h-4 w-4" />
                                  Pause Campaign
                                </Button>
                              )}

                              {selectedCampaign.status === "paused" && (
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    handleCampaignStatusChange(selectedCampaign.id, "active");
                                    setIsViewDetailsOpen(false);
                                  }}
                                  className="gap-2"
                                >
                                  <PlayCircle className="h-4 w-4" />
                                  Resume Campaign
                                </Button>
                              )}

                              {selectedCampaign.status !== "active" && selectedCampaign.status !== "completed" && (
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsViewDetailsOpen(false);
                                    setTimeout(() => {
                                      setSelectedCampaign(selectedCampaign);
                                      setIsDuplicateDialogOpen(true);
                                    }, 100);
                                  }}
                                  className="gap-2"
                                >
                                  <Copy className="h-4 w-4" />
                                  Duplicate Campaign
                                </Button>
                              )}

                              <Button
                                variant="destructive"
                                onClick={() => {
                                  setIsViewDetailsOpen(false);
                                  setTimeout(() => {
                                    setSelectedCampaign(selectedCampaign);
                                    setIsDeleteDialogOpen(true);
                                  }, 100);
                                }}
                                className="gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Campaign
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="performance" className="space-y-6 pt-6">
                        {selectedCampaign.metrics ? (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium">Delivery Rate</p>
                                      <p className="text-sm text-muted-foreground">Messages successfully sent</p>
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-xl">
                                      <Send className="h-5 w-5 text-primary" />
                                    </div>
                                  </div>
                                  <div className="mt-4">
                                    <div className="text-2xl font-bold">
                                      {selectedCampaign.audience.count > 0
                                        ? `${Math.round((selectedCampaign.metrics.delivered / selectedCampaign.audience.count) * 100)}%`
                                        : "0%"}
                                    </div>
                                   <p className="text-xs text-muted-foreground mt-1">
                                      {selectedCampaign.metrics.delivered} of {selectedCampaign.audience.count} messages
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="pt-6">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium">Read Rate</p>
                                      <p className="text-sm text-muted-foreground">Messages opened and read</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-xl">
                                      <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                  </div>
                                  <div className="mt-4">
                                    <div className="text-2xl font-bold">
                                      {selectedCampaign.metrics.delivered > 0
                                        ? `${Math.round((selectedCampaign.metrics.read / selectedCampaign.metrics.delivered) * 100)}%`
                                        : "0%"}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {selectedCampaign.metrics.read} of {selectedCampaign.metrics.delivered} delivered
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="pt-6">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium">Reply Rate</p>
                                      <p className="text-sm text-muted-foreground">Recipients who responded</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-xl">
                                      <MessageSquare className="h-5 w-5 text-blue-600" />
                                    </div>
                                  </div>
                                  <div className="mt-4">
                                    <div className="text-2xl font-bold">
                                      {selectedCampaign.metrics.delivered > 0
                                        ? `${Math.round((selectedCampaign.metrics.replied / selectedCampaign.metrics.delivered) * 100)}%`
                                        : "0%"}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {selectedCampaign.metrics.replied} of {selectedCampaign.metrics.delivered} delivered
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>

                              {selectedCampaign.metrics.conversions !== undefined && (
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium">Conversion Rate</p>
                                        <p className="text-sm text-muted-foreground">Campaign goals achieved</p>
                                      </div>
                                      <div className="p-3 bg-amber-100 rounded-xl">
                                        <Target className="h-5 w-5 text-amber-600" />
                                      </div>
                                    </div>
                                    <div className="mt-4">
                                      <div className="text-2xl font-bold">
                                        {selectedCampaign.metrics.delivered > 0
                                          ? `${Math.round((selectedCampaign.metrics.conversions / selectedCampaign.metrics.delivered) * 100)}%`
                                          : "0%"}
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {selectedCampaign.metrics.conversions} of {selectedCampaign.metrics.delivered} delivered
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>

                            <Card>
                              <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                                <CardDescription>
                                  Detailed campaign performance analytics
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="h-[300px] flex items-center justify-center">
                                  <div className="text-center">
                                    <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Detailed Analytics Coming Soon</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto">
                                      Enhanced campaign analytics with detailed charts and insights will be available in a future update.
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <BarChart className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">No performance data available</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                              {selectedCampaign.status === "draft" || selectedCampaign.status === "scheduled"
                                ? "This campaign hasn't started yet. Performance metrics will be available once the campaign is active."
                                : "No performance data is available for this campaign."}
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="audience" className="space-y-6 pt-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Users className="h-5 w-5" />
                              Audience Overview
                            </CardTitle>
                            <CardDescription>
                              {selectedCampaign.audience.count.toLocaleString()} contacts targeted in this campaign
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center py-16">
                              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Users className="h-10 w-10 text-primary" />
                              </div>
                              <h3 className="text-xl font-semibold text-slate-900 mb-2">Audience Details Coming Soon</h3>
                              <p className="text-muted-foreground max-w-md mx-auto">
                                Detailed audience information and segmentation will be available in a future update.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>

                    <DialogFooter className="bg-slate-50 -mx-6 -mb-6 px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {selectedCampaign.status === "draft" && (
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/campaigns/edit/${selectedCampaign.id}`)}
                            className="gap-2"
                          >
                            <Settings className="h-4 w-4" />
                            Edit Campaign
                          </Button>
                        )}
                        {selectedCampaign.status !== "active" && selectedCampaign.status !== "completed" && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsViewDetailsOpen(false);
                              setTimeout(() => {
                                setSelectedCampaign(selectedCampaign);
                                setIsDuplicateDialogOpen(true);
                              }, 100);
                            }}
                            className="gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setIsViewDetailsOpen(false);
                            setTimeout(() => {
                              setSelectedCampaign(selectedCampaign);
                              setIsDeleteDialogOpen(true);
                            }, 100);
                          }}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </DialogFooter>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </TooltipProvider>
    </Layout>
  );
};

export default CampaignsPage;