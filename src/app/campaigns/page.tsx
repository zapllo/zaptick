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
  Gauge,
  FilterX,
  X,
  FileText
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
import { formatCurrency } from "@/lib/pricing";
import { Label } from "@/components/ui/label";

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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

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

  // Add helper function to check if campaign is in grace period
  const isInGracePeriod = (campaign: Campaign) => {
    if (campaign.status !== 'active') return false;

    const now = new Date();
    const campaignAge = now.getTime() - new Date(campaign.createdAt).getTime();
    return campaignAge < 60000 && !campaign.stats?.processStartedAt;
  };


  // Get status badge styling
  // Find the getStatusBadge function and replace it with this:
  const getStatusBadge = (status: string, campaign?: any) => {
    // Check if campaign is in grace period
    if (campaign && status === 'active') {
      const now = new Date();
      const campaignAge = now.getTime() - new Date(campaign.createdAt).getTime();
      const isInGracePeriod = campaignAge < 60000 &&
        !campaign.stats?.processStartedAt;

      if (isInGracePeriod) {
        const timeRemaining = Math.ceil((60000 - campaignAge) / 1000);
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
            <Clock className="mr-1 h-3 w-3" />
            Starting in {timeRemaining}s
          </Badge>
        );
      }
    }

    // Existing status badge logic
    const statusConfig = {
      draft: {
        color: "text-gray-600 border-gray-200 bg-gray-50",
        label: "Draft",
        icon: FileText
      },
      scheduled: {
        color: "text-blue-600 border-blue-200 bg-blue-50",
        label: "Scheduled",
        icon: Calendar
      },
      active: {
        color: "text-green-600 border-green-200 bg-green-50",
        label: "Active",
        icon: PlayCircle
      },
      paused: {
        color: "text-yellow-600 border-yellow-200 bg-yellow-50",
        label: "Paused",
        icon: PauseCircle
      },
      completed: {
        color: "text-green-600 border-green-200 bg-green-50",
        label: "Completed",
        icon: CheckCircle
      },
      failed: {
        color: "text-red-600 border-red-200 bg-red-50",
        label: "Failed",
        icon: AlertCircle
      },
      cancelled: {
        color: "text-gray-600 border-gray-200 bg-gray-50",
        label: "Cancelled",
        icon: X
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const IconComponent = config.icon;

    return (
      <Badge variant="outline" className={config.color}>
        <IconComponent className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };
  // Add cancel campaign function
  const cancelCampaign = async (campaign: Campaign) => {
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/cancel`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Campaign Cancelled",
          description: data.refund.amount > 0
            ? `Campaign cancelled successfully. ${formatCurrency(data.refund.amount)} has been refunded to your wallet.`
            : "Campaign cancelled successfully.",
        });

        // Refresh campaigns list
        fetchCampaigns();
      } else {
        throw new Error(data.error || 'Failed to cancel campaign');
      }
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel campaign",
        variant: "destructive",
      });
    }
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
  const exportCampaigns = () => {
    try {
      // Generate CSV headers
      const headers = [
        'Campaign Name',
        'Type',
        'Status',
        'Audience Size',
        'Created Date',
        'Scheduled Date',
        'Delivered',
        'Read',
        'Replied',
        'Conversions'
      ].join(',');

      // Generate CSV rows from campaigns data
      const rows = filteredCampaigns.map(campaign => {
        return [
          `"${campaign.name.replace(/"/g, '""')}"`, // Escape quotes in names
          campaign.type,
          campaign.status,
          campaign.audience.count,
          format(new Date(campaign.createdAt), "yyyy-MM-dd"),
          campaign.scheduleTime ? format(new Date(campaign.scheduleTime), "yyyy-MM-dd HH:mm") : 'N/A',
          campaign.metrics?.delivered || 0,
          campaign.metrics?.read || 0,
          campaign.metrics?.replied || 0,
          campaign.metrics?.conversions || 0
        ].join(',');
      }).join('\n');

      // Combine headers and rows
      const csvContent = `${headers}\n${rows}`;

      // Create a Blob with the CSV data
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);

      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `whatsapp-campaigns-${format(new Date(), "yyyy-MM-dd")}.csv`);
      document.body.appendChild(link);

      // Trigger the download
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Campaign data exported successfully");
    } catch (error) {
      console.error("Error exporting campaigns:", error);
      toast.error("Failed to export campaign data");
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

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
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
          <div className="mx-auto p-6 space-y-8">
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
                  onClick={exportCampaigns}
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
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <p className="text-sm font-medium text-slate-600">Total Campaigns</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors duration-300">
                          {totalCampaigns.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          {totalCampaigns > 0 ? '+12% from last month' : 'Get started'}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
                        <Rocket className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <p className="text-sm font-medium text-slate-600">Active Campaigns</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-slate-900 group-hover:text-green-900 transition-colors duration-300">
                          {activeCampaigns.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          Currently running
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 group-hover:scale-110 transition-all duration-300">
                        <PlayCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                        <p className="text-sm font-medium text-slate-600">Total Audience</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-slate-900 group-hover:text-purple-900 transition-colors duration-300">
                          {totalAudience.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          Contacts reached
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <p className="text-sm font-medium text-slate-600">Avg Delivery Rate</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-slate-900 group-hover:text-amber-900 transition-colors duration-300">
                          {avgDeliveryRate}%
                        </p>
                        <div className="w-full bg-amber-200/50 rounded-full h-2 mt-2">
                          <div 
                            className="bg-amber-600 h-2 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${avgDeliveryRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:scale-110 transition-all duration-300">
                        <Send className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div> */}

            {/* Applied Filters */}
            {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
              <Card className="border-0 shadow-sm bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">Active Filters:</span>
                    </div>

                    {searchQuery && (
                      <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                        <Search className="h-3 w-3" />
                        {searchQuery}
                        <button onClick={() => setSearchQuery("")}>
                          <X className="h-3 w-3 ml-1" />
                        </button>
                      </Badge>
                    )}

                    {statusFilter !== "all" && (
                      <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                        <Activity className="h-3 w-3" />
                        {statusFilter === "active" ? "Active" :
                          statusFilter === "paused" ? "Paused" :
                            statusFilter === "scheduled" ? "Scheduled" :
                              statusFilter === "draft" ? "Draft" :
                                statusFilter === "completed" ? "Completed" : "Failed"}
                        <button onClick={() => setStatusFilter("all")}>
                          <X className="h-3 w-3 ml-1" />
                        </button>
                      </Badge>
                    )}

                    {typeFilter !== "all" && (
                      <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                        <Rocket className="h-3 w-3" />
                        {typeFilter === "ongoing" ? "Ongoing" : "One-time"}
                        <button onClick={() => setTypeFilter("all")}>
                          <X className="h-3 w-3 ml-1" />
                        </button>
                      </Badge>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs text-amber-700 hover:bg-amber-100"
                      onClick={clearAllFilters}
                    >
                      <FilterX className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters & Controls */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="">
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
                                  {getStatusBadge(campaign.status, campaign)}
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
                                  <>


                                    <DropdownMenuItem
                                      onClick={() => handleCampaignStatusChange(campaign.id, "paused")}
                                    >
                                      <PauseCircle className="h-4 w-4 mr-2" />
                                      Pause
                                    </DropdownMenuItem>
                                  </>
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
                                <>
                                  {isInGracePeriod(campaign) ? (
                                    // Show cancel button for campaigns in grace period
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => cancelCampaign(campaign)}
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Cancel
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCampaignStatusChange(campaign.id, "paused")}
                                      className="h-7 px-2 text-xs"
                                    >
                                      <PauseCircle className="h-3 w-3" />
                                    </Button>
                                  )}
                                </>
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
                  <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm p-0">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto p-0">
                        <Table>
                          <TableHeader className='bg-[#DAE9E0] -50/80 hover:bg-[#DAE9E0]  p-0 border '>
                            <TableRow className="">
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
                                  {getStatusBadge(campaign.status, campaign)}
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
              <DialogContent className="sm:max-w-[700px] max-h-[95vh] flex flex-col p-0">
                {selectedCampaign ? (
                  <>
                    <DialogHeader className="px-6 py-4 border-b border-slate-300 flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                          <Rocket className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <DialogTitle className="text-xl font-semibold text-slate-900">
                            {selectedCampaign.name}
                          </DialogTitle>
                          <DialogDescription className="text-slate-600">
                            {selectedCampaign.type.replace('-', ' ')} campaign • Created {format(new Date(selectedCampaign.createdAt), "MMM dd, yyyy")}
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-6">
                      <div className="space-y-8">
                        {/* Campaign Status */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                              Campaign Status
                            </h3>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-slate-700" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  Current Status
                                </p>
                                <p className="text-xs text-slate-600">
                                  {selectedCampaign.status === "active" ? "Campaign is currently active and sending messages" :
                                    selectedCampaign.status === "paused" ? "Campaign is paused and not sending messages" :
                                      selectedCampaign.status === "scheduled" ? "Campaign is scheduled to run later" :
                                        selectedCampaign.status === "draft" ? "Campaign is a draft and not yet launched" :
                                          selectedCampaign.status === "completed" ? "Campaign has completed all message deliveries" :
                                            "Campaign failed to deliver some messages"}
                                </p>
                              </div>
                            </div>
                            <div>
                              {getStatusBadge(selectedCampaign.status, selectedCampaign)}
                            </div>
                          </div>
                        </div>

                        {/* Campaign Details */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                              Campaign Details
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">
                                Campaign Type
                              </Label>
                              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                                {getTypeIcon(selectedCampaign.type)}
                                <span className="font-medium capitalize">
                                  {selectedCampaign.type.replace('-', ' ')} Campaign
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">
                                Audience Size
                              </Label>
                              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">
                                  {selectedCampaign.audience.count.toLocaleString()} contacts
                                </span>
                              </div>
                            </div>

                            {selectedCampaign.scheduleTime && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">
                                  Scheduled Time
                                </Label>
                                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                                  <Clock className="h-4 w-4 text-amber-600" />
                                  <span className="font-medium">
                                    {format(new Date(selectedCampaign.scheduleTime), "MMM dd, yyyy 'at' HH:mm")}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        {selectedCampaign.metrics && (
                          <div className="space-y-6">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                Performance Metrics
                              </h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">
                                  Delivery Rate
                                </Label>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Send className="h-4 w-4 text-green-600" />
                                      <span className="text-sm font-medium">
                                        {selectedCampaign.metrics.delivered} of {selectedCampaign.audience.count} messages
                                      </span>
                                    </div>
                                    <span className="font-medium">
                                      {calculateProgress(selectedCampaign.metrics.delivered, selectedCampaign.audience.count)}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={calculateProgress(selectedCampaign.metrics.delivered, selectedCampaign.audience.count)}
                                    className="h-2 bg-slate-200"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">
                                  Read Rate
                                </Label>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm font-medium">
                                        {selectedCampaign.metrics.read} of {selectedCampaign.metrics.delivered} delivered
                                      </span>
                                    </div>
                                    <span className="font-medium">
                                      {calculateProgress(selectedCampaign.metrics.read, selectedCampaign.metrics.delivered)}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={calculateProgress(selectedCampaign.metrics.read, selectedCampaign.metrics.delivered)}
                                    className="h-2 bg-slate-200"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">
                                  Reply Rate
                                </Label>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <MessageSquare className="h-4 w-4 text-purple-600" />
                                      <span className="text-sm font-medium">
                                        {selectedCampaign.metrics.replied} of {selectedCampaign.metrics.delivered} delivered
                                      </span>
                                    </div>
                                    <span className="font-medium">
                                      {calculateProgress(selectedCampaign.metrics.replied, selectedCampaign.metrics.delivered)}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={calculateProgress(selectedCampaign.metrics.replied, selectedCampaign.metrics.delivered)}
                                    className="h-2 bg-slate-200"
                                  />
                                </div>
                              </div>

                              {selectedCampaign.metrics.conversions !== undefined && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-slate-700">
                                    Conversion Rate
                                  </Label>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-amber-600" />
                                        <span className="text-sm font-medium">
                                          {selectedCampaign.metrics.conversions} of {selectedCampaign.metrics.delivered} delivered
                                        </span>
                                      </div>
                                      <span className="font-medium">
                                        {calculateProgress(selectedCampaign.metrics.conversions, selectedCampaign.metrics.delivered)}%
                                      </span>
                                    </div>
                                    <Progress
                                      value={calculateProgress(selectedCampaign.metrics.conversions, selectedCampaign.metrics.delivered)}
                                      className="h-2 bg-slate-200"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* If no metrics available */}
                        {!selectedCampaign.metrics && (
                          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mb-4">
                              <BarChart className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No performance data available</h3>
                            <p className="text-sm text-slate-600 text-center max-w-md">
                              {selectedCampaign.status === "draft" || selectedCampaign.status === "scheduled"
                                ? "This campaign hasn't started yet. Performance metrics will be available once the campaign is active."
                                : "No performance data is available for this campaign."}
                            </p>
                          </div>
                        )}

                        {/* Campaign Actions */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                              Campaign Actions
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {selectedCampaign.status === "draft" && (
                              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                    <Settings className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-blue-800">
                                      Edit Campaign
                                    </p>
                                    <p className="text-xs text-blue-600">
                                      Modify campaign settings and content
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsViewDetailsOpen(false);
                                    router.push(`/campaigns/edit/${selectedCampaign.id}`);
                                  }}
                                  className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                  <Settings className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </div>
                            )}

                            {selectedCampaign.status === "active" && (
                              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
                                    <PauseCircle className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-amber-800">
                                      Pause Campaign
                                    </p>
                                    <p className="text-xs text-amber-600">
                                      Temporarily stop sending messages
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    handleCampaignStatusChange(selectedCampaign.id, "paused");
                                    setIsViewDetailsOpen(false);
                                  }}
                                  className="bg-white border-amber-200 text-amber-700 hover:bg-amber-50"
                                >
                                  <PauseCircle className="h-4 w-4 mr-2" />
                                  Pause
                                </Button>
                              </div>
                            )}



                            <div className="flex items-center justify-between w-96 p-4 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                                  <Trash2 className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-red-800">
                                    Delete Campaign
                                  </p>
                                  <p className="text-xs text-red-600">
                                    Permanently remove this campaign
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsViewDetailsOpen(false);
                                  setTimeout(() => {
                                    setSelectedCampaign(selectedCampaign);
                                    setIsDeleteDialogOpen(true);
                                  }, 100);
                                }}
                                className="bg-white border-red-200 text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                          {selectedCampaign.status === "paused" && (
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                  <PlayCircle className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-green-800">
                                    Resume Campaign
                                  </p>
                                  <p className="text-xs text-green-600">
                                    Continue sending paused messages
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  handleCampaignStatusChange(selectedCampaign.id, "active");
                                  setIsViewDetailsOpen(false);
                                }}
                                className="bg-white border-green-200 text-green-700 hover:bg-green-50"
                              >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Resume
                              </Button>
                            </div>
                          )}

                          {selectedCampaign.status !== "active" && selectedCampaign.status !== "completed" && (
                            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                                  <Copy className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-purple-800">
                                    Duplicate Campaign
                                  </p>
                                  <p className="text-xs text-purple-600">
                                    Create a copy with the same settings
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsViewDetailsOpen(false);
                                  setTimeout(() => {
                                    setSelectedCampaign(selectedCampaign);
                                    setIsDuplicateDialogOpen(true);
                                  }, 100);
                                }}
                                className="bg-white border-purple-200 text-purple-700 hover:bg-purple-50"
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                      <Button
                        variant="outline"
                        onClick={() => setIsViewDetailsOpen(false)}
                        className="hover:bg-slate-50"
                      >
                        Close
                      </Button>
                      {selectedCampaign.status === "active" && (
                        <Button
                          onClick={() => {
                            handleCampaignStatusChange(selectedCampaign.id, "paused");
                            setIsViewDetailsOpen(false);
                          }}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <PauseCircle className="h-4 w-4 mr-2" />
                          Pause Campaign
                        </Button>
                      )}
                      {selectedCampaign.status === "paused" && (
                        <Button
                          onClick={() => {
                            handleCampaignStatusChange(selectedCampaign.id, "active");
                            setIsViewDetailsOpen(false);
                          }}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Resume Campaign
                        </Button>
                      )}
                      {selectedCampaign.status === "draft" && (
                        <Button
                          onClick={() => {
                            setIsViewDetailsOpen(false);
                            router.push(`/campaigns/edit/${selectedCampaign.id}`);
                          }}
                          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Campaign
                        </Button>
                      )}
                    </DialogFooter>
                  </>
                ) : (
                  <div className="flex items-center justify-center p-12">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Rocket className="w-6 h-6 text-primary animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Loading campaign details...</p>
                      </div>
                    </div>
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