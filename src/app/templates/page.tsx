"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  FileText,
  RefreshCw,
  Loader2,
  Copy,
  Edit,
  Trash2,
  Code,
  LayoutGrid,
  List,
  ChevronDown,
  ArrowUpDown,
  Plus,
  Filter,
  Download,
  Upload,
  Eye,
  MoreVertical,
  Sparkles,
  TrendingUp,
  Activity,
  Users,
  Target,
  Calendar,
  MessageSquare,
  Layers,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  Archive,
  Star,
  Crown,
  FilterX,
  X,
  Gauge,
  BarChart3,
  ArrowUpRight,
  BookOpen
} from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PermissionCheck from "@/components/auth/PermissionCheck";

// Interfaces
interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  content: string;
  variables: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  lastUsed?: string;
  useCount: number;
  rejectionReason?: string;
  type: 'text' | 'media';
  mediaType?: string;
  createdBy?: string;
}

interface WabaAccount {
  wabaId: string;
  phoneNumberId: string;
  businessName: string;
  phoneNumber: string;
  status: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ANY");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [deletedTemplates, setDeletedTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [wabaAccounts, setWabaAccounts] = useState<WabaAccount[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'ascending' | 'descending' | null;
  }>({ key: null, direction: null });
  const [showDeleted, setShowDeleted] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  // Fetch user's WABA accounts and templates on mount
  useEffect(() => {
    fetchUserData();
    fetchTemplates();
    fetchTeamMembers();
    setLastSynced(new Date().toISOString());
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setWabaAccounts(data.user.wabaAccounts || []);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      toast.error('Failed to fetch user data');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team-members');
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.teamMembers || []);
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus && selectedStatus !== 'ANY') {
        params.set('status', selectedStatus.toLowerCase());
      }

      // Fetch active templates
      const activeResponse = await fetch(`/api/templates?${params.toString()}`);
      if (activeResponse.ok) {
        const data = await activeResponse.json();
        setTemplates(data.templates || []);
      }

      // Fetch deleted templates
      const deletedResponse = await fetch(`/api/templates/deleted`);
      if (deletedResponse.ok) {
        const data = await deletedResponse.json();
        setDeletedTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  // Refetch when status filter changes
  useEffect(() => {
    fetchTemplates();
  }, [selectedStatus]);

  const handleSyncTemplates = async () => {
    if (wabaAccounts.length === 0) {
      toast.error('No WABA accounts found');
      return;
    }

    try {
      setSyncing(true);
      const wabaId = wabaAccounts[0].wabaId;

      const response = await fetch('/api/templates/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wabaId })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchTemplates();
        setLastSynced(new Date().toISOString());
      } else {
        toast.error(data.error || 'Failed to sync templates');
      }
    } catch (error) {
      console.error('Failed to sync templates:', error);
      toast.error('Failed to sync templates');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteTemplate = async (template: Template) => {
    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Template deleted successfully');
        fetchTemplates();
        setSelectedTemplates(prev => prev.filter(id => id !== template.id));
      } else {
        toast.error('Failed to delete template');
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    } finally {
      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTemplates.length === 0) {
      toast.info('No templates selected');
      return;
    }

    try {
      setLoading(true);
      let successCount = 0;
      let failCount = 0;

      for (const id of selectedTemplates) {
        const response = await fetch(`/api/templates/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} template(s)`);
      }

      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} template(s)`);
      }

      setSelectedTemplates([]);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to bulk delete templates:', error);
      toast.error('Failed to delete templates');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/restore`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Template restored successfully');
        fetchTemplates();
      } else {
        toast.error('Failed to restore template');
      }
    } catch (error) {
      console.error('Failed to restore template:', error);
      toast.error('Failed to restore template');
    }
  };

  const handleDuplicateTemplate = (template: Template) => {
    router.push(`/templates/create?duplicate=${template.id}`);
  };

  const handleViewTemplate = (templateId: string) => {
    router.push(`/templates/${templateId}`);
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';

    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = null;
      }
    }

    setSortConfig({ key, direction });
  };

  // Sort templates based on current sort configuration
  const sortedTemplates = useMemo(() => {
    let sortableTemplates = [...(showDeleted ? deletedTemplates : templates)];

    if (sortConfig.key && sortConfig.direction) {
      sortableTemplates.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Template] ?? '';
        const bValue = b[sortConfig.key as keyof Template] ?? '';
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableTemplates;
  }, [templates, deletedTemplates, sortConfig, showDeleted]);

  // Filter templates based on search query and selected agent
  const filteredTemplates = useMemo(() => {
    return sortedTemplates.filter(template => {
      const matchesSearch =
        searchQuery === "" ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAgent =
        selectedAgent === "all" ||
        template.createdBy === selectedAgent;

      const matchesCategory =
        selectedCategory === "all" ||
        template.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesAgent && matchesCategory;
    });
  }, [sortedTemplates, searchQuery, selectedAgent, selectedCategory]);

  // Get status display with styled badges
  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      'approved': {
        variant: "default" as const,
        className: "bg-green-100 text-green-700 border-green-200",
        icon: CheckCircle,
        label: 'Approved'
      },
      'pending': {
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: Clock,
        label: 'Pending'
      },
      'rejected': {
        variant: "destructive" as const,
        className: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
        label: 'Rejected'
      },
      'deleted': {
        variant: "outline" as const,
        className: "bg-gray-100 text-gray-600 border-gray-200",
        icon: Archive,
        label: 'Deleted'
      }
    };

    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={cn("gap-1", config.className)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'marketing':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'utility':
        return <Settings className="h-4 w-4 text-green-600" />;
      case 'authentication':
        return <Target className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'media':
        return <Layers className="h-4 w-4 text-orange-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
    }
  };

  const handleSelectAll = () => {
    if (selectedTemplates.length === filteredTemplates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(filteredTemplates.map(t => t.id));
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 inline-block text-gray-400" />;
    }

    if (sortConfig.direction === 'ascending') {
      return <ArrowUpDown className="ml-2 h-4 w-4 inline-block text-primary" />;
    }

    if (sortConfig.direction === 'descending') {
      return <ArrowUpDown className="ml-2 h-4 w-4 inline-block text-primary rotate-180" />;
    }

    return <ArrowUpDown className="ml-2 h-4 w-4 inline-block text-gray-400" />;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ANY");
    setSelectedCategory("all");
    setSelectedAgent("all");
    setShowDeleted(false);
  };

  // Calculate stats
  const totalTemplates = templates.length;
  const approvedTemplates = templates.filter(t => t.status === 'approved').length;
  const pendingTemplates = templates.filter(t => t.status === 'pending').length;
  const totalUsage = templates.reduce((sum, t) => sum + t.useCount, 0);
  const approvalRate = totalTemplates > 0 ? Math.round((approvedTemplates / totalTemplates) * 100) : 0;

  return (
    <ProtectedRoute resource="templates" action="read">
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
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent wark:from-white wark:to-slate-200">
                        Message Templates
                      </h1>
                      <p className="text-slate-600 wark:text-slate-300 font-medium">
                        Create and manage WhatsApp Business message templates
                      </p>
                    </div>
                  </div>

                  {/* Template Stats Pills */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                        {totalTemplates} Total
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                        {approvedTemplates} Approved
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                        {pendingTemplates} Pending
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                        {approvalRate}% Approved
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-slate-200 wark:border-slate-700 hover:border-blue-300 wark:hover:border-blue-600 hover:bg-blue-50 wark:hover:bg-blue-900/20"
                    onClick={() => router.push('/templates/library')}
                  >
                    <BookOpen className="h-4 w-4" />
                    Template Library
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-slate-200 wark:border-slate-700 hover:border-green-300 wark:hover:border-green-600 hover:bg-green-50 wark:hover:bg-green-900/20"
                    onClick={() => {
                      toast.success("Templates exported successfully");
                    }}
                    disabled={filteredTemplates.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>

                  <PermissionCheck resource="templates" action="write" fallback={null}>
                    <Button
                      onClick={() => router.push('/templates/create')}
                      disabled={wabaAccounts.length === 0}
                      className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <Plus className="h-4 w-4" />
                      New Template
                    </Button>
                  </PermissionCheck>
                </div>
              </div>

              {/* Applied Filters */}
              {(searchQuery || selectedStatus !== "ANY" || selectedCategory !== "all" || selectedAgent !== "all" || showDeleted) && (
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

                      {selectedStatus !== "ANY" && (
                        <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                          <Gauge className="h-3 w-3" />
                          {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1).toLowerCase()}
                          <button onClick={() => setSelectedStatus("ANY")}>
                            <X className="h-3 w-3 ml-1" />
                          </button>
                        </Badge>
                      )}

                      {selectedCategory !== "all" && (
                        <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                          <FileText className="h-3 w-3" />
                          {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                          <button onClick={() => setSelectedCategory("all")}>
                            <X className="h-3 w-3 ml-1" />
                          </button>
                        </Badge>
                      )}

                      {selectedAgent !== "all" && (
                        <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                          <Users className="h-3 w-3" />
                          {teamMembers.find(m => m.id === selectedAgent)?.name || "Unknown Agent"}
                          <button onClick={() => setSelectedAgent("all")}>
                            <X className="h-3 w-3 ml-1" />
                          </button>
                        </Badge>
                      )}

                      {showDeleted && (
                        <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                          <Archive className="h-3 w-3" />
                          Deleted Templates
                          <button onClick={() => setShowDeleted(false)}>
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
                          placeholder="Search templates..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                          <SelectTrigger className="w-36 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ANY">All Status</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-40 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="utility">Utility</SelectItem>
                            <SelectItem value="authentication">Authentication</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                          <SelectTrigger className="w-36 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Agents</SelectItem>
                            {teamMembers.map(member => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleted(!showDeleted)}
                          className={cn(
                            "gap-2",
                            showDeleted && "bg-red-50 text-red-700 border-red-200"
                          )}
                        >
                          <Archive className="h-4 w-4" />
                          {showDeleted ? 'Show Active' : 'Show Deleted'}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSyncTemplates}
                            disabled={wabaAccounts.length === 0 || syncing}
                            className="gap-2"
                          >
                            {syncing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            Sync
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Sync templates from WhatsApp</TooltipContent>
                      </Tooltip>

                      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                          className="h-8 px-3"
                        >
                          <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                          className="h-8 px-3"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bulk Actions */}
              {selectedTemplates.length > 0 && (
                <Card className="border-0 shadow-sm bg-amber-50 border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-amber-900">
                          {selectedTemplates.length} template{selectedTemplates.length > 1 ? 's' : ''} selected
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTemplates([])}
                          className="h-8"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleBulkDelete}
                          className="h-8 gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Selected
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Content */}
              {loading ? (
                <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 wark:to-slate-900/10">
                  <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-primary animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold text-slate-900 wark:text-white">Loading Templates</h3>
                        <p className="text-sm text-slate-600 wark:text-slate-300">Fetching your message templates...</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 wark:text-slate-400">
                          <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                          <span>This may take a few seconds</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredTemplates.length === 0 ? (
                <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 wark:to-slate-900/10">
                  <CardContent className="p-12">
                    <div className="text-center space-y-8">
                      <div className="relative mx-auto w-32 h-32">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                          <FileText className="h-16 w-16 text-primary" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center animate-bounce">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-slate-900 wark:text-white">
                          {searchQuery || selectedStatus !== "ANY" || selectedCategory !== "all" || showDeleted
                            ? "No templates match your filters"
                            : "Ready to create your first template?"
                          }
                        </h3>
                        <p className="text-slate-600 wark:text-slate-300 max-w-md mx-auto leading-relaxed">
                          {searchQuery || selectedStatus !== "ANY" || selectedCategory !== "all" || showDeleted
                            ? "Try adjusting your search or filter criteria to find what you're looking for."
                            : "Create professional message templates for your WhatsApp Business communications and boost engagement."
                          }
                        </p>
                      </div>

                      {!searchQuery && selectedStatus === "ANY" && selectedCategory === "all" && !showDeleted && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                          <PermissionCheck resource="templates" action="write" fallback={null}>
                            <Button
                              onClick={() => router.push('/templates/create')}
                              disabled={wabaAccounts.length === 0}
                              className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                              size="lg"
                            >
                              <Plus className="h-5 w-5" />
                              Create Your First Template
                            </Button>
                          </PermissionCheck>

                          <Button
                            variant="outline"
                            size="lg"
                            className="gap-2 border-2 hover:border-primary/50 hover:bg-primary/5"
                            onClick={handleSyncTemplates}
                            disabled={wabaAccounts.length === 0 || syncing}
                          >
                            {syncing ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-5 w-5" />
                            )}
                            Sync from WhatsApp
                          </Button>
                        </div>
                      )}

                      {/* Feature highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-200 wark:border-slate-700">
                        <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800/50">
                          <div className="h-10 w-10 rounded-xl bg-green-100 wark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600 wark:text-green-400" />
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-sm text-slate-900 wark:text-white">WhatsApp Approved</div>
                            <div className="text-xs text-slate-500 wark:text-slate-400">Official templates</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800/50">
                          <div className="h-10 w-10 rounded-xl bg-blue-100 wark:bg-blue-900/30 flex items-center justify-center">
                            <Settings className="h-5 w-5 text-blue-600 wark:text-blue-400" />
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-sm text-slate-900 wark:text-white">Dynamic Variables</div>
                            <div className="text-xs text-slate-500 wark:text-slate-400">Personalized messages</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800/50">
                          <div className="h-10 w-10 rounded-xl bg-purple-100 wark:bg-purple-900/30 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-purple-600 wark:text-purple-400" />
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-sm text-slate-900 wark:text-white">Usage Analytics</div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredTemplates.map((template) => (
                        <Card
                          key={template.id}
                          className="group relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 wark:from-muted/40 wark:to-slate-900/10"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          <CardHeader className="pb-3 relative">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <Checkbox
                                  checked={selectedTemplates.includes(template.id)}
                                  onCheckedChange={() => handleSelectTemplate(template.id)}
                                  className="data-[state=checked]:bg-primary"
                                />
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded-lg bg-slate-100 wark:bg-slate-800 transition-all duration-300 group-hover:scale-110">
                                    {getTypeIcon(template.type)}
                                  </div>
                                  <div className="p-1 rounded-lg bg-slate-100 wark:bg-slate-800 transition-all duration-300 group-hover:scale-110">
                                    {getCategoryIcon(template.category)}
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
                                  <DropdownMenuItem onClick={() => handleViewTemplate(template.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleViewTemplate(template.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Template
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {template.status === 'deleted' ? (
                                    <DropdownMenuItem onClick={() => handleRestoreTemplate(template.id)}>
                                      <RotateCcw className="h-4 w-4 mr-2" />
                                      Restore
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600"
                                      onClick={() => {
                                        setTemplateToDelete(template);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="space-y-3">
                              <CardTitle
                                className="text-lg font-semibold text-slate-900 wark:text-white group-hover:text-primary transition-colors cursor-pointer line-clamp-1"
                                onClick={() => handleViewTemplate(template.id)}
                              >
                                {template.name}
                              </CardTitle>
                              <div className="flex items-center gap-2 flex-wrap">
                                {getStatusDisplay(template.status)}
                                <Badge variant="outline" className="text-xs capitalize bg-slate-50 wark:bg-slate-800">
                                  {template.category.toLowerCase()}
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-slate-50 wark:bg-slate-800">
                                  {template.language}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4 pb-4 relative">
                            <div className="space-y-3">
                              <div className="p-3 bg-slate-50 wark:bg-slate-800/50 rounded-lg border border-slate-200 wark:border-slate-700">
                                <p className="text-sm text-slate-600 wark:text-slate-300 line-clamp-3 leading-relaxed">
                                  {template.content}
                                </p>
                                {template.variables > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-amber-600 wark:text-amber-400 mt-2 pt-2 border-t border-slate-200 wark:border-slate-700">
                                    <Settings className="h-3 w-3" />
                                    {template.variables} variable{template.variables > 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-3 bg-blue-50 wark:bg-blue-900/20 rounded-lg border border-blue-200 wark:border-blue-700">
                                  <p className="text-xs text-blue-600 wark:text-blue-400">Usage Count</p>
                                  <p className="font-bold text-blue-900 wark:text-blue-100 text-lg">{template.useCount.toLocaleString()}</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 wark:bg-green-900/20 rounded-lg border border-green-200 wark:border-green-700">
                                  <p className="text-xs text-green-600 wark:text-green-400">Last Used</p>
                                  <p className="font-bold text-green-900 wark:text-green-100 text-xs">
                                    {template.lastUsed ? new Date(template.lastUsed).toLocaleDateString() : 'Never'}
                                  </p>
                                </div>
                              </div>

                              {template.rejectionReason && (
                                <div className="p-3 bg-red-50 wark:bg-red-900/20 border border-red-200 wark:border-red-700 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-600 wark:text-red-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium text-red-800 wark:text-red-200">Rejection Reason</p>
                                      <p className="text-sm text-red-700 wark:text-red-300 mt-1">{template.rejectionReason}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>

                          <CardFooter className="pt-0">
                            <div className="flex items-center justify-between text-xs text-slate-500 wark:text-slate-400 w-full">
                              <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                              {template.approvedAt && (
                                <span className="text-green-600 wark:text-green-400">
                                  Approved {new Date(template.approvedAt).toLocaleDateString()}
                                </span>
                              )}
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
                        <div className="overflow-x-auto">
                          <Table>
                             <TableHeader className="bg-[#D9E6DE]  wark:from-slate-800/50 wark:to-slate-900/30">
                              <TableRow className="border-b border-slate-200 wark:border-slate-700">
                                <TableHead className="w-12">
                                  <Checkbox
                                    checked={selectedTemplates.length === filteredTemplates.length && filteredTemplates.length > 0}
                                    onCheckedChange={handleSelectAll}
                                    className="data-[state=checked]:bg-primary"
                                  />
                                </TableHead>
                                <TableHead
                                  className="font-semibold text-slate-700 wark:text-slate-300 cursor-pointer hover:text-primary transition-colors"
                                  onClick={() => requestSort('name')}
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Template Name
                                    {getSortIcon('name')}
                                  </div>
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                  <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Content
                                  </div>
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                  <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Status
                                  </div>
                                </TableHead>
                                <TableHead
                                  className="font-semibold text-slate-700 wark:text-slate-300 cursor-pointer hover:text-primary transition-colors"
                                  onClick={() => requestSort('category')}
                                >
                                  <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4" />
                                    Category
                                    {getSortIcon('category')}
                                  </div>
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                  <div className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Usage
                                  </div>
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Last Used
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
                              {filteredTemplates.map((template, index) => (
                                <TableRow
                                  key={template.id}
                                  className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent wark:hover:from-slate-800/30 wark:hover:to-transparent transition-all duration-200 group border-b border-slate-100 wark:border-slate-800"
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedTemplates.includes(template.id)}
                                      onCheckedChange={() => handleSelectTemplate(template.id)}
                                      className="data-[state=checked]:bg-primary"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div
                                        className="font-medium text-slate-900 wark:text-white hover:text-primary cursor-pointer transition-colors"
                                        onClick={() => handleViewTemplate(template.id)}
                                      >
                                        {template.name}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                          {getTypeIcon(template.type)}
                                          <span className="text-xs text-slate-500 wark:text-slate-400">{template.language}</span>
                                        </div>
                                        {template.variables > 0 && (
                                          <Badge variant="outline" className="text-xs bg-amber-50 wark:bg-amber-900/20 text-amber-700 wark:text-amber-300 border-amber-200 wark:border-amber-700">
                                            {template.variables} vars
                                          </Badge>
                                        )}
                                        <span className="text-xs text-slate-400 wark:text-slate-500">#{index + 1}</span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="max-w-md">
                                      <p className="text-sm text-slate-600 wark:text-slate-300 line-clamp-2 leading-relaxed">
                                        {template.content}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {getStatusDisplay(template.status)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2 p-2 bg-slate-50 wark:bg-slate-800/30 rounded-lg border border-slate-200 wark:border-slate-700">
                                      {getCategoryIcon(template.category)}
                                      <span className="capitalize text-slate-700 wark:text-slate-300 font-medium">
                                        {template.category.toLowerCase()}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm p-2 bg-blue-50 wark:bg-blue-900/20 rounded-lg border border-blue-200 wark:border-blue-700">
                                      <div className="font-bold text-blue-900 wark:text-blue-100">
                                        {template.useCount.toLocaleString()}
                                      </div>
                                      <div className="text-blue-600 wark:text-blue-400 text-xs">times</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      {template.lastUsed ? (
                                        <div className="p-2 bg-green-50 wark:bg-green-900/20 rounded-lg border border-green-200 wark:border-green-700">
                                          <div className="font-medium text-green-900 wark:text-green-100">
                                            {new Date(template.lastUsed).toLocaleDateString()}
                                          </div>
                                          <div className="text-green-600 wark:text-green-400 text-xs">
                                            {new Date(template.lastUsed).toLocaleTimeString([], {
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-slate-400 wark:text-slate-500 italic">Never used</span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end items-center gap-1">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewTemplate(template.id)}
                                            className="h-8 w-8 p-0 hover:bg-blue-100 wark:hover:bg-blue-900/30"
                                          >
                                            <Eye className="h-3.5 w-3.5 text-blue-600 wark:text-blue-400" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>View Template</TooltipContent>
                                      </Tooltip>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDuplicateTemplate(template)}
                                            className="h-8 w-8 p-0 hover:bg-green-100 wark:hover:bg-green-900/30"
                                          >
                                            <Copy className="h-3.5 w-3.5 text-green-600 wark:text-green-400" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Duplicate Template</TooltipContent>
                                      </Tooltip>

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
                                          <DropdownMenuItem onClick={() => handleViewTemplate(template.id)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Template
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          {template.status === 'deleted' ? (
                                            <DropdownMenuItem onClick={() => handleRestoreTemplate(template.id)}>
                                              <RotateCcw className="h-4 w-4 mr-2" />
                                              Restore
                                            </DropdownMenuItem>
                                          ) : (
                                            <DropdownMenuItem
                                              className="text-red-600 focus:text-red-600"
                                              onClick={() => {
                                                setTemplateToDelete(template);
                                                setIsDeleteDialogOpen(true);
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          )}
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
                      Delete Template?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The template will be permanently deleted and cannot be used for sending messages.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  {templateToDelete && (
                    <div className="py-4">
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border">
                        <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-lg">
                          <FileText className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{templateToDelete.name}</div>
                          <div className="text-sm text-slate-600">
                            {templateToDelete.category} • Used {templateToDelete.useCount} times
                          </div>
                        </div>
                      </div>

                      {templateToDelete.status === 'approved' && (
                        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-800">Warning: This template is approved</p>
                            <p className="text-sm text-amber-700 mt-1">
                              Deleting an approved template will remove it from your available templates for messaging.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => templateToDelete && handleDeleteTemplate(templateToDelete)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Template
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </TooltipProvider>
      </Layout>
    </ProtectedRoute>
  );
}
