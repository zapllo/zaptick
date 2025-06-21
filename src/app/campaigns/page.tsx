// src/app/campaigns/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Filter,
  Loader2,
  MoreHorizontal,
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
        toast({
          title: "Error",
          description: data.error || "Failed to fetch campaigns",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      });
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

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "paused":
        return "warning";
      case "scheduled":
        return "info";
      case "draft":
        return "secondary";
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Get status badge icon
  const getStatusBadgeIcon = (status: string) => {
    switch (status) {
      case "active":
        return <PlayCircle className="h-3 w-3 mr-1" />;
      case "paused":
        return <PauseCircle className="h-3 w-3 mr-1" />;
      case "scheduled":
        return <Calendar className="h-3 w-3 mr-1" />;
      case "draft":
        return <ClipboardList className="h-3 w-3 mr-1" />;
      case "completed":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "failed":
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
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
        toast({
          title: "Success",
          description: "Campaign deleted successfully",
        });
        fetchCampaigns();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete campaign",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: "Campaign duplicated successfully",
        });
        fetchCampaigns();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to duplicate campaign",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error duplicating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate campaign",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: `Campaign ${newStatus === "active" ? "activated" : "paused"} successfully`,
        });
        fetchCampaigns();
      } else {
        toast({
          title: "Error",
          description: data.error || `Failed to ${newStatus === "active" ? "activate" : "pause"} campaign`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error changing campaign status:", error);
      toast({
        title: "Error",
        description: `Failed to ${newStatus === "active" ? "activate" : "pause"} campaign`,
        variant: "destructive",
      });
    }
  };

  // Calculate metrics progress percentage
  const calculateProgress = (value: number, total: number) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">WhatsApp Campaigns</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your WhatsApp message campaigns
            </p>
          </div>
          <Button onClick={() => router.push("/campaigns/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg border p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    <span>Type</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                disabled={searchQuery === "" && statusFilter === "all" && typeFilter === "all"}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Campaigns Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Loading campaigns...</p>
            </div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="bg-white border rounded-lg p-12 text-center">
            <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "No campaigns match your current filters. Try adjusting your search or filter criteria."
                : "Get started by creating your first WhatsApp campaign."}
            </p>
            {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
              <Button onClick={() => router.push("/campaigns/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#E4EAE8]">
                  <TableHead className="font-semibold">Campaign Name</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Audience Size</TableHead>
                  <TableHead className="font-semibold">Schedule</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow
                    key={campaign.id}
                    className="group"
                  >
                    <TableCell className="font-medium">
                      <div
                        className="hover:text-primary cursor-pointer"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setIsViewDetailsOpen(true);
                        }}
                      >
                        {campaign.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {campaign.type === "one-time" ? "One-time" : "Ongoing"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(campaign.status) as any}
                        className="flex w-fit items-center gap-1"
                      >
                        {getStatusBadgeIcon(campaign.status)}
                        <span className="capitalize">{campaign.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{campaign.audience.count} contacts</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {campaign.scheduleTime ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{format(new Date(campaign.scheduleTime), "MMM dd, yyyy HH:mm")}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{format(new Date(campaign.createdAt), "MMM dd, yyyy")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {campaign.status === "draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/campaigns/edit/${campaign.id}`)}
                            className="h-8"
                          >
                            <Settings className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                        )}
                        {campaign.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCampaignStatusChange(campaign.id, "paused")}
                            className="h-8"
                          >
                            <PauseCircle className="h-3.5 w-3.5 mr-1" />
                            Pause
                          </Button>
                        )}
                        {campaign.status === "paused" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCampaignStatusChange(campaign.id, "active")}
                            className="h-8"
                          >
                            <PlayCircle className="h-3.5 w-3.5 mr-1" />
                            Resume
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCampaign(campaign);
                                setIsViewDetailsOpen(true);
                              }}
                            >
                              <Info className="h-4 w-4 mr-2" />
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
                              className="text-red-600"
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
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Campaign?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. The campaign will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            {selectedCampaign && (
              <div className="py-4">
                <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                  <Rocket className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{selectedCampaign.name}</div>
                    <div className="text-sm text-muted-foreground capitalize">{selectedCampaign.type} campaign</div>
                  </div>
                </div>
                {selectedCampaign.status === "active" && (
                  <div className="mt-4 flex items-start gap-2 p-3 rounded-md bg-amber-50 text-amber-800">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Warning: This campaign is currently active</p>
                      <p className="text-sm">
                        Deleting an active campaign will immediately stop all message deliveries.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCampaign}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Duplicate Campaign Dialog */}
        <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Duplicate Campaign</DialogTitle>
              <DialogDescription>
                Create a copy of this campaign with the same settings.
              </DialogDescription>
            </DialogHeader>
            {selectedCampaign && (
              <div className="py-4">
                <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                  <Rocket className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{selectedCampaign.name}</div>
                    <div className="text-sm text-muted-foreground capitalize">{selectedCampaign.type} campaign</div>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 p-3 rounded-md bg-blue-50 text-blue-800">
                  <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">New copy will be created as a draft</p>
                    <p className="text-sm">
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
              <Button
                onClick={handleDuplicateCampaign}
              >
                Duplicate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Campaign Details Dialog */}
        <Dialog
          open={isViewDetailsOpen}
          onOpenChange={setIsViewDetailsOpen}
          className="max-w-4xl"
        >
          <DialogContent className="h-fit max-h-screen m-auto overflow-y-scroll scrollbar-hidden">
            {selectedCampaign ? (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle className="text-xl">{selectedCampaign.name}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="capitalize">
                          {selectedCampaign.type} Campaign
                        </Badge>
                        <Badge
                          variant={getStatusBadgeVariant(selectedCampaign.status) as any}
                          className="flex items-center gap-1"
                        >
                          {getStatusBadgeIcon(selectedCampaign.status)}
                          <span className="capitalize">{selectedCampaign.status}</span>
                        </Badge>
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="audience">Audience</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            CAMPAIGN DETAILS
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium capitalize">{selectedCampaign.type}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge
                              variant={getStatusBadgeVariant(selectedCampaign.status) as any}
                              className="flex items-center gap-1"
                            >
                              {getStatusBadgeIcon(selectedCampaign.status)}
                              <span className="capitalize">{selectedCampaign.status}</span>
                            </Badge>
                          </div>
                          <Separator />
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Audience Size:</span>
                            <span className="font-medium">{selectedCampaign.audience.count} contacts</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Created:</span>
                            <span className="font-medium">{format(new Date(selectedCampaign.createdAt), "MMM dd, yyyy")}</span>
                          </div>
                          {selectedCampaign.scheduleTime && (
                            <>
                              <Separator />
                              <div className="flex justify-between py-1">
                                <span className="text-muted-foreground">Scheduled:</span>
                                <span className="font-medium">{format(new Date(selectedCampaign.scheduleTime), "MMM dd, yyyy HH:mm")}</span>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            PERFORMANCE SUMMARY
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
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          CAMPAIGN ACTIONS
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-3">
                          {selectedCampaign.status === "draft" && (
                            <Button
                              variant="outline"
                              onClick={() => router.push(`/campaigns/edit/${selectedCampaign.id}`)}
                              className="flex items-center gap-2"
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
                              className="flex items-center gap-2"
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
                              className="flex items-center gap-2"
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
                              className="flex items-center gap-2"
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
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Campaign
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="performance" className="space-y-4 pt-4">
                    {selectedCampaign.metrics ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between space-y-1">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium leading-none">
                                    Delivered Rate
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Messages successfully sent
                                  </p>
                                </div>
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                                  <MessageSquare className="h-5 w-5 text-primary" />
                                </div>
                              </div>
                              <div className="mt-6">
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
                              <div className="flex items-center justify-between space-y-1">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium leading-none">
                                    Read Rate
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Messages opened and read
                                  </p>
                                </div>
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                              </div>
                              <div className="mt-6">
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
                              <div className="flex items-center justify-between space-y-1">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium leading-none">
                                    Reply Rate
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Recipients who responded
                                  </p>
                                </div>
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                                  <MessageSquare className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="mt-6">
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
                                <div className="flex items-center justify-between space-y-1">
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                      Conversion Rate
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Campaign goals achieved
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-100">
                                    <BarChart className="h-5 w-5 text-amber-600" />
                                  </div>
                                </div>
                                <div className="mt-6">
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
                              Detailed campaign performance metrics
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[300px] flex items-center justify-center">
                              <div className="text-center">
                                <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium mb-2">Detailed charts coming soon</p>
                                <p className="text-muted-foreground max-w-md">
                                  Enhanced campaign analytics with detailed charts and insights will be available in a future update.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No performance data available</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          {selectedCampaign.status === "draft" || selectedCampaign.status === "scheduled"
                            ? "This campaign hasn't started yet. Performance metrics will be available once the campaign is active."
                            : "No performance data is available for this campaign."}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="audience" className="space-y-4 pt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Audience Overview</CardTitle>
                        <CardDescription>
                          {selectedCampaign.audience.count} contacts targeted in this campaign
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] overflow-auto">
                          {/* Placeholder for audience data - would be replaced with actual audience table */}
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium mb-2">Audience details coming soon</p>
                            <p className="text-muted-foreground max-w-md mx-auto">
                              Detailed audience information will be available in a future update.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CampaignsPage;
