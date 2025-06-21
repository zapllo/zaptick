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
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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

  // Fetch user's WABA accounts and templates on mount
  useEffect(() => {
    fetchUserData();
    fetchTemplates();
    fetchTeamMembers();
    // Set a mock last synced time - in real app this would come from the API
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

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Template deleted successfully');
        fetchTemplates();
        setSelectedTemplates(prev => prev.filter(id => id !== templateId));
      } else {
        toast.error('Failed to delete template');
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTemplates.length === 0) {
      toast.info('No templates selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedTemplates.length} template(s)?`)) {
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
        if (a[sortConfig.key as keyof Template] < b[sortConfig.key as keyof Template]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof Template] > b[sortConfig.key as keyof Template]) {
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

      return matchesSearch && matchesAgent;
    });
  }, [sortedTemplates, searchQuery, selectedAgent]);

  // Get status display with colored dot
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      'approved': { color: 'bg-green-500', label: 'Approved' },
      'pending': { color: 'bg-yellow-500', label: 'Pending' },
      'rejected': { color: 'bg-red-500', label: 'Rejected' },
      'deleted': { color: 'bg-gray-500', label: 'Deleted' }
    };

    const statusInfo = statusMap[status.toLowerCase()] || { color: 'bg-gray-300', label: status };

    return (
      <div className="flex items-center gap-2">
        <div className={`${statusInfo.color} h-2.5 w-2.5 rounded-full`}></div>
        <span>{statusInfo.label}</span>
      </div>
    );
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
      return <ArrowUpDown className="ml-2 h-4 w-4 inline-block text-green-600" />;
    }

    if (sortConfig.direction === 'descending') {
      return <ArrowUpDown className="ml-2 h-4 w-4 inline-block text-green-600 rotate-180" />;
    }

    return <ArrowUpDown className="ml-2 h-4 w-4 inline-block text-gray-400" />;
  };

  return (
    <Layout>
      <div className="h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-medium text-gray-900">Templates</h1>
              <span className="bg- rounded-full shadow px-4 bg-primary/20 text-green-700 font-medium">
                {showDeleted ? deletedTemplates.length : templates.length} total
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push('/templates/create')}
                disabled={wabaAccounts.length === 0}
                className="bg-primary -600 hover:bg-primary/80 cursor-pointer text-white px-4 py-2"
              >
                <FileText className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search template..."
                  className="pl-10 bg-gray-50 border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Dropdowns */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-primary/20 -50 text-green-700 border-green-200 hover:bg-green-100">
                    All WABAs
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>All WABAs</DropdownMenuItem>
                  {wabaAccounts.map(account => (
                    <DropdownMenuItem key={account.wabaId}>
                      {account.businessName}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                 <Button className="bg-primary/20 -50 text-green-700 border-green-200 hover:bg-green-100">
                    {showDeleted ? 'Deleted' : (selectedStatus === 'ANY' ? 'All Status' : selectedStatus)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => {
                    setSelectedStatus('ANY');
                    setShowDeleted(false);
                  }}>All Status</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSelectedStatus('APPROVED');
                    setShowDeleted(false);
                  }}>Approved</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSelectedStatus('PENDING');
                    setShowDeleted(false);
                  }}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSelectedStatus('REJECTED');
                    setShowDeleted(false);
                  }}>Rejected</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setShowDeleted(true);
                  }}>Deleted</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-primary/20 -50 text-green-700 border-green-200 hover:bg-green-100">
                    All categories
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>All categories</DropdownMenuItem>
                  <DropdownMenuItem>MARKETING</DropdownMenuItem>
                  <DropdownMenuItem>UTILITY</DropdownMenuItem>
                  <DropdownMenuItem>AUTHENTICATION</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                 <Button className="bg-primary/20 -50 text-green-700 border-green-200 hover:bg-green-100">
                    {selectedAgent === "all" ? "All agents" :
                      teamMembers.find(m => m.id === selectedAgent)?.name || "All agents"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedAgent("all")}>
                    All agents
                  </DropdownMenuItem>
                  {teamMembers.map(member => (
                    <DropdownMenuItem
                      key={member.id}
                      onClick={() => setSelectedAgent(member.id)}
                    >
                      {member.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSyncTemplates}
                      disabled={wabaAccounts.length === 0 || syncing}
                      className="text-gray-500"
                    >
                      {syncing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sync Templates</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`text-gray-500 ${viewMode === 'grid' ? 'bg-primary text-white -100' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Grid View</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`text-gray-500 ${viewMode === 'list' ? 'bg-primary text-white' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>List View</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {selectedTemplates.length > 0 && (
                <div className="p-2 mb-4 bg-white rounded-lg border flex items-center justify-between">
                  <div className="text-sm text-gray-500 pl-4">
                    {selectedTemplates.length} template(s) selected
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkDelete}
                      className="h-8"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Bulk Delete
                    </Button>
                  </div>
                </div>
              )}

              {viewMode === 'list' ? (
                <div className="bg-white rounded-lg border">
                  <Table>
                    <TableHeader className="bg-accent font-bold">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedTemplates.length === filteredTemplates.length && filteredTemplates.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead
                          className="text-gray-600 font-semibold cursor-pointer"
                          onClick={() => requestSort('name')}
                        >
                          Template name
                          {getSortIcon('name')}
                        </TableHead>
                        <TableHead className="text-gray-600 font-semibold">Content</TableHead>
                        <TableHead
                          className="text-gray-600 font-semibold cursor-pointer"
                          onClick={() => requestSort('wabaId')}
                        >
                          WABA
                          {getSortIcon('wabaId')}
                        </TableHead>
                        <TableHead
                          className="text-gray-600 font-semibold cursor-pointer"
                          onClick={() => requestSort('category')}
                        >
                          Category
                          {getSortIcon('category')}
                        </TableHead>
                        <TableHead className="text-gray-600 font-semibold text-center">Action</TableHead>
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
                          <TableRow key={template.id} className="border-b hover:bg-gray-50">
                            <TableCell>
                              <Checkbox
                                checked={selectedTemplates.includes(template.id)}
                                onCheckedChange={() => handleSelectTemplate(template.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-gray-900">{template.name}</div>
                              <div className="text-xs text-gray-400">{getStatusDisplay(template.status)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-gray-600 max-w-xs">
                                <div className="truncate">{template.content}</div>
                                <div className="text-gray-400 text-sm">...</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-gray-700">
                                {wabaAccounts[0]?.businessName || 'DoubleTick'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-gray-700 uppercase">
                                {template.category}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                        onClick={() => handleDuplicateTemplate(template)}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Duplicate Template</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                        onClick={() => handleViewTemplate(template.id)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit Template</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                        onClick={() =>
                                          template.status === 'deleted'
                                            ? handleRestoreTemplate(template.id)
                                            : handleDeleteTemplate(template.id)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {template.status === 'deleted' ? 'Restore Template' : 'Delete Template'}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                {/* <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                      >
                                        <Code className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>API Integration</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider> */}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredTemplates.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      No templates found. Try adjusting your search or create a new one.
                    </div>
                  ) : (
                    filteredTemplates.map((template) => (
                      <Card key={template.id} className="overflow-hidden h-fit">
                        <div className="p-4 border-b flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedTemplates.includes(template.id)}
                              onCheckedChange={() => handleSelectTemplate(template.id)}
                            />
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-[180px]">
                                {template.name}
                              </div>
                              <div className="text-xs">
                                {getStatusDisplay(template.status)}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 uppercase">
                            {template.category}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="text-gray-600 h-20 overflow-hidden text-sm">
                            {template.content}
                          </div>
                        </CardContent>
                        <CardFooter className="p-2 bg-gray-50 border-t -mt-16 flex justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                  onClick={() => handleDuplicateTemplate(template)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Duplicate Template</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                              onClick={() => handleViewTemplate(template.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Template</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                  onClick={() =>
                                    template.status === 'deleted'
                                      ? handleRestoreTemplate(template.id)
                                      : handleDeleteTemplate(template.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {template.status === 'deleted' ? 'Restore Template' : 'Delete Template'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                >
                                  <Code className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>API Integration</TooltipContent>
                            </Tooltip>
                          </TooltipProvider> */}
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
