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
  CreditCard,
  ArrowRight,
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

// Add this interface after the Campaign interface
interface UserSubscription {
  plan: string;
  status: 'active' | 'expired' | 'cancelled';
  endDate?: string;
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
  // Add these state variables after the existing state variables
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);

  // Add this function to fetch user subscription status
  const fetchUserSubscription = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.user) {
        setUserSubscription(data.user.subscription);
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  // Add this useEffect to fetch subscription status on component mount
  useEffect(() => {
    fetchUserSubscription();
  }, []);


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

  // Add the subscription loading check
  if (isCheckingSubscription) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking subscription status...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Add the subscription expiration check
  if (userSubscription?.status === 'expired') {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-red-50/20 to-background p-4">
          <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-red-50/30 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-red-200 max-w-lg w-full">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg transition-all duration-300 group-hover:scale-110">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Subscription Expired
                  </h1>
                  <p className="text-sm text-red-600 font-medium">
                    Access Restricted
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Expired
              </span>
            </div>

            {/* Description Section */}
            <div className="space-y-4 mb-8">
              <p className="text-gray-700 leading-relaxed">
                Your subscription has expired and you&apos;ve been moved to the Free plan.
                Please renew your subscription to continue accessing WhatsApp campaign features.
              </p>

              {userSubscription?.endDate && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-1">
                        Subscription expired on
                      </p>
                      <p className="text-sm text-red-700">
                        {format(new Date(userSubscription.endDate), 'PPP')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <Rocket className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>WhatsApp campaign creation & management</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Bulk messaging to your audiences</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                    <BarChart className="h-4 w-4 text-purple-600" />
                  </div>
                  <span>Campaign analytics & performance tracking</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                    <Calendar className="h-4 w-4 text-amber-600" />
                  </div>
                  <span>Schedule campaigns & automation</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-4">
              <Button
                onClick={() => window.location.href = '/wallet/plans'}
                className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Renew Subscription
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <AlertCircle className="h-3 w-3" />
                <span>Choose from flexible pricing plans</span>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-red-500/10 transition-all duration-300 group-hover:scale-110" />
            <div className="absolute -left-4 -bottom-4 h-12 w-12 rounded-full bg-red-400/20 transition-all duration-300 group-hover:scale-125" />

            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 wark:from-slate-900 wark:via-slate-800 wark:to-slate-900/50">
          <div className="mx-auto p-6 space-y-8">
            {/* Modern Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 shadow-sm">
                      <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent wark:from-white wark:to-slate-200">
                      WhatsApp Campaigns
                    </h1>
                    <p className="text-slate-600 wark:text-slate-300 font-medium">
                      Create and manage your WhatsApp message campaigns
                    </p>
                  </div>
                </div>

                {/* Campaign Stats Pills */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                      {totalCampaigns} Total
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                      {activeCampaigns} Active
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                      {totalAudience.toLocaleString()} Reach
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                      {avgDeliveryRate}% Avg Delivery
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-slate-200 wark:border-slate-700 hover:border-green-300 wark:hover:border-green-600 hover:bg-green-50 wark:hover:bg-green-900/20"
                  onClick={exportCampaigns}
                  disabled={filteredCampaigns.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>

                <Button
                  onClick={() => router.push("/campaigns/create")}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </Button>
              </div>
            </div>
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
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 wark:to-slate-900/10">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Rocket className="w-8 h-8 text-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold text-slate-900 wark:text-white">Loading Campaigns</h3>
                      <p className="text-sm text-slate-600 wark:text-slate-300">Fetching your campaign data...</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500 wark:text-slate-400">
                        <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                        <span>This may take a few seconds</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredCampaigns.length === 0 ? (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 wark:to-slate-900/10">
                <CardContent className="p-12">
                  <div className="text-center space-y-8">
                    <div className="relative mx-auto w-32 h-32">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                        <Rocket className="h-16 w-16 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center animate-bounce">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-3 w-3 text-white" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-slate-900 wark:text-white">
                        {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                          ? "No campaigns match your filters"
                          : "Ready to launch your first campaign?"
                        }
                      </h3>
                      <p className="text-slate-600 wark:text-slate-300 max-w-md mx-auto leading-relaxed">
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
                          className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                          size="lg"
                        >
                          <Plus className="h-5 w-5" />
                          Create Your First Campaign
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="gap-2 border-2 hover:border-primary/50 hover:bg-primary/5"
                          onClick={() => {
                            toast.success("Campaign templates will be available soon");
                          }}
                        >
                          <Lightbulb className="h-5 w-5" />
                          Browse Templates
                        </Button>
                      </div>
                    )}

                    {/* Feature highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-200 wark:border-slate-700">
                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800/50">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 wark:bg-blue-900/30 flex items-center justify-center">
                          <Target className="h-5 w-5 text-blue-600 wark:text-blue-400" />
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm text-slate-900 wark:text-white">Smart Targeting</div>
                          <div className="text-xs text-slate-500 wark:text-slate-400">Audience filtering</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800/50">
                        <div className="h-10 w-10 rounded-xl bg-green-100 wark:bg-green-900/30 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-green-600 wark:text-green-400" />
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm text-slate-900 wark:text-white">Schedule Campaigns</div>
                          <div className="text-xs text-slate-500 wark:text-slate-400">Perfect timing</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800/50">
                        <div className="h-10 w-10 rounded-xl bg-purple-100 wark:bg-purple-900/30 flex items-center justify-center">
                          <BarChart className="h-5 w-5 text-purple-600 wark:text-purple-400" />
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm text-slate-900 wark:text-white">Real-time Analytics</div>
                          <div className="text-xs text-slate-500 wark:text-slate-400">Track performance</div>
                        </div>
                      </div>
                    </div>
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
                        className="group relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 wark:from-muted/40 wark:to-slate-900/10"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <CardHeader className="pb-3 relative">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg transition-all duration-300 group-hover:scale-110">
                                {getTypeIcon(campaign.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle
                                  className="text-lg font-semibold text-slate-900 wark:text-white group-hover:text-primary transition-colors cursor-pointer line-clamp-1"
                                  onClick={() => {
                                    setSelectedCampaign(campaign);
                                    setIsViewDetailsOpen(true);
                                  }}
                                >
                                  {campaign.name}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {getStatusBadge(campaign.status, campaign)}
                                  <Badge variant="outline" className="text-xs capitalize bg-slate-50 wark:bg-slate-800">
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
                                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 wark:hover:bg-slate-800"
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

                        <CardContent className="space-y-4 pb-4 relative">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 wark:bg-slate-800/50 rounded-lg border border-slate-200 wark:border-slate-700">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-slate-500 wark:text-slate-400" />
                                <span className="text-sm font-medium text-slate-700 wark:text-slate-300">Audience</span>
                              </div>
                              <span className="text-sm font-bold text-slate-900 wark:text-white">
                                {campaign.audience.count.toLocaleString()}
                              </span>
                            </div>

                            {campaign.scheduleTime && (
                              <div className="flex items-center justify-between p-3 bg-blue-50 wark:bg-blue-900/20 rounded-lg border border-blue-200 wark:border-blue-700">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm font-medium text-blue-700 wark:text-blue-300">Scheduled</span>
                                </div>
                                <span className="text-sm font-medium text-blue-900 wark:text-blue-100">
                                  {format(new Date(campaign.scheduleTime), "MMM dd, HH:mm")}
                                </span>
                              </div>
                            )}

                            {campaign.metrics && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600 wark:text-slate-400">Delivery Rate</span>
                                  <span className="font-bold text-slate-900 wark:text-white">
                                    {calculateProgress(campaign.metrics.delivered, campaign.audience.count)}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 wark:bg-slate-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${calculateProgress(campaign.metrics.delivered, campaign.audience.count)}%`
                                    }}
                                  />
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-sm pt-2 border-t border-slate-200 wark:border-slate-700">
                                  <div className="text-center">
                                    <p className="text-slate-500 wark:text-slate-400 text-xs">Delivered</p>
                                    <p className="font-bold text-slate-900 wark:text-white">{campaign.metrics.delivered.toLocaleString()}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-slate-500 wark:text-slate-400 text-xs">Read</p>
                                    <p className="font-bold text-slate-900 wark:text-white">{campaign.metrics.read.toLocaleString()}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-slate-500 wark:text-slate-400 text-xs">Replied</p>
                                    <p className="font-bold text-slate-900 wark:text-white">{campaign.metrics.replied.toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>

                        <CardFooter className="pt-0">
                          <div className="flex items-center justify-between text-xs text-slate-500 wark:text-slate-400 w-full">
                            <span>Created {format(new Date(campaign.createdAt), "MMM dd, yyyy")}</span>
                            <div className="flex items-center gap-1">
                              {campaign.status === "active" && (
                                <>
                                  {isInGracePeriod(campaign) ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => cancelCampaign(campaign)}
                                      className="text-red-600 border-red-200 hover:bg-red-50 h-7 px-2 text-xs"
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Cancel
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCampaignStatusChange(campaign.id, "paused")}
                                      className="h-7 px-2 text-xs hover:bg-amber-50 text-amber-600"
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
                                  className="h-7 px-2 text-xs hover:bg-green-50 text-green-600"
                                >
                                  <PlayCircle className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardFooter>

                        {/* Decorative hover effect */}
                        <div className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110" />
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 p-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 wark:to-slate-900/10">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto p-0">
                        <Table>
                          <TableHeader className="bg-[#D9E6DE]  wark:from-slate-800/50 wark:to-slate-900/30">
                            <TableRow className="border-b border-slate-200 wark:border-slate-700">
                              <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <Rocket className="h-4 w-4" />
                                  Campaign Name
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <Tag className="h-4 w-4" />
                                  Type
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <Activity className="h-4 w-4" />
                                  Status
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Audience Size
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  Schedule
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  Performance
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Created
                                </div>
                              </TableHead>
                              <TableHead className="text-right font-semibold text-slate-700 wark:text-slate-300">
                                <div className="flex items-center justify-end gap-2">
                                  <Settings className="h-4 w-4" />
                                  Actions
                                </div>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredCampaigns.map((campaign, index) => (
                              <TableRow
                                key={campaign.id}
                                className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent wark:hover:from-slate-800/30 wark:hover:to-transparent transition-all duration-200 group border-b border-slate-100 wark:border-slate-800"
                              >
                                <TableCell className="py-3">
                                  <div className="space-y-1">
                                    <div
                                      className="font-medium text-slate-900 wark:text-white hover:text-primary cursor-pointer transition-colors"
                                      onClick={() => {
                                        setSelectedCampaign(campaign);
                                        setIsViewDetailsOpen(true);
                                      }}
                                    >
                                      {campaign.name}
                                    </div>
                                    <div className="text-xs text-slate-500 wark:text-slate-400">
                                      Campaign #{index + 1} • Updated {format(new Date(campaign.updatedAt), "MMM dd")}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 p-2 bg-slate-50 wark:bg-slate-800/30 rounded-lg border border-slate-200 wark:border-slate-700">
                                    {getTypeIcon(campaign.type)}
                                    <Badge variant="outline" className="capitalize bg-white wark:bg-slate-800">
                                      {campaign.type.replace('-', ' ')}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(campaign.status, campaign)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 p-2 bg-slate-50 wark:bg-slate-800/30 rounded-lg border border-slate-200 wark:border-slate-700">
                                    <div className="h-6 w-6 rounded bg-blue-100 wark:bg-blue-900/30 flex items-center justify-center">
                                      <Users className="h-3 w-3 text-blue-600 wark:text-blue-400" />
                                    </div>
                                    <span className="font-medium text-slate-900 wark:text-white">{campaign.audience.count.toLocaleString()}</span>
                                    <span className="text-xs text-slate-500 wark:text-slate-400">contacts</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {campaign.scheduleTime ? (
                                    <div className="text-sm p-2 bg-blue-50 wark:bg-blue-900/20 rounded-lg border border-blue-200 wark:border-blue-700">
                                      <div className="font-medium text-blue-900 wark:text-blue-100">
                                        {format(new Date(campaign.scheduleTime), "MMM dd, yyyy")}
                                      </div>
                                      <div className="text-blue-600 wark:text-blue-300 text-xs">
                                        {format(new Date(campaign.scheduleTime), "HH:mm")}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 wark:text-slate-500 italic">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {campaign.metrics ? (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-slate-900 wark:text-white">
                                          {calculateProgress(campaign.metrics.delivered, campaign.audience.count)}%
                                        </span>
                                        <span className="text-xs text-slate-500 wark:text-slate-400">delivered</span>
                                      </div>
                                      <div className="w-20 h-2 bg-slate-200 wark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                                          style={{
                                            width: `${calculateProgress(campaign.metrics.delivered, campaign.audience.count)}%`
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 wark:text-slate-500 text-sm italic">No data</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="font-medium text-slate-900 wark:text-white">
                                      {format(new Date(campaign.createdAt), "MMM dd, yyyy")}
                                    </div>
                                    <div className="text-slate-500 wark:text-slate-400 text-xs">
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
                                            className="h-8 w-8 p-0 hover:bg-blue-100 wark:hover:bg-blue-900/30"
                                          >
                                            <Settings className="h-3.5 w-3.5 text-blue-600 wark:text-blue-400" />
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
                                            className="h-8 w-8 p-0 hover:bg-amber-100 wark:hover:bg-amber-900/30"
                                          >
                                            <PauseCircle className="h-3.5 w-3.5 text-amber-600 wark:text-amber-400" />
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
                                            className="h-8 w-8 p-0 hover:bg-green-100 wark:hover:bg-green-900/30"
                                          >
                                            <PlayCircle className="h-3.5 w-3.5 text-green-600 wark:text-green-400" />
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
                                          className="h-8 w-8 p-0 hover:bg-slate-100 wark:hover:bg-slate-800"
                                        >
                                          <MoreVertical className="h-4 w-4 text-slate-600 wark:text-slate-400" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel className="font-semibold">Actions</DropdownMenuLabel>
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
