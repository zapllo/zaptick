"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Plus,
  MoreHorizontal,
  RefreshCw,
  Loader2,
  Filter,
  Copy
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
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function TemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ANY");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [deletedTemplates, setDeletedTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("template-library");
  const [wabaAccounts, setWabaAccounts] = useState<WabaAccount[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Fetch user's WABA accounts and templates on mount
  useEffect(() => {
    fetchUserData();
    fetchTemplates();
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
      } else {
        toast.error('Failed to delete template');
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
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

  // Filter templates based on search query
  const filteredTemplates = templates.filter(template => {
    return searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredDeletedTemplates = deletedTemplates.filter(template => {
    return searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Templates</h2>
          <Button
            onClick={() => router.push('/templates/create')}
            disabled={wabaAccounts.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </div>

        <div>
          <h3 className="text-md font-medium">Managing WhatsApp Templates</h3>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="border-b w-full rounded-none justify-start bg-transparent p-0">
            <TabsTrigger
              value="template-library"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-2 px-4 data-[state=active]:shadow-none"
            >
              Template Library
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-2 px-4 data-[state=active]:shadow-none"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="deleted"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-2 px-4 data-[state=active]:shadow-none"
            >
              Deleted
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search a template by name"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Status is:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="ANY">ANY</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {
                activeTab === "deleted"
                  ? `${filteredDeletedTemplates.length} of ${deletedTemplates.length}`
                  : `${filteredTemplates.length} of ${templates.length}`
              } templates
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Last synced on: {lastSynced ? format(new Date(lastSynced), "HH:mm, dd/MM/yy") : 'Never'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncTemplates}
                disabled={wabaAccounts.length === 0 || syncing}
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Sync</span>
              </Button>
            </div>
          </div>

          <TabsContent value="template-library" className="m-0">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <TemplateTable
                templates={filteredTemplates}
                onDelete={handleDeleteTemplate}
                onDuplicate={handleDuplicateTemplate}
                onView={handleViewTemplate}
                getStatusDisplay={getStatusDisplay}
              />
            )}
          </TabsContent>

          <TabsContent value="active" className="m-0">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <TemplateTable
                templates={filteredTemplates.filter(t => t.status !== 'deleted')}
                onDelete={handleDeleteTemplate}
                onDuplicate={handleDuplicateTemplate}
                onView={handleViewTemplate}
                getStatusDisplay={getStatusDisplay}
              />
            )}
          </TabsContent>

          <TabsContent value="deleted" className="m-0">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <DeletedTemplateTable
                templates={filteredDeletedTemplates}
                onRestore={handleRestoreTemplate}
                getStatusDisplay={getStatusDisplay}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

// Component for template table
function TemplateTable({
  templates,
  onDelete,
  onDuplicate,
  onView,
  getStatusDisplay
}: {
  templates: Template[],
  onDelete: (id: string) => void,
  onDuplicate: (template: Template) => void,
  onView: (id: string) => void,
  getStatusDisplay: (status: string) => React.ReactNode
}) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Template Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Language(s)</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                No templates found. Try adjusting your search or create a new one.
              </TableCell>
            </TableRow>
          ) : (
            templates.map((template) => (
              <TableRow key={template.id} className="group">
                <TableCell>
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[280px]">
                      {template.name}_{template.id.substring(0, 8)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusDisplay(template.status)}
                </TableCell>
                <TableCell className="capitalize">
                  {template.category}
                </TableCell>
                <TableCell>
                  {template.language}
                </TableCell>
                <TableCell>
                  {template.createdBy || "Unknown"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDuplicate(template)}>
                          <Copy className="mr-2 h-4 w-4" />
                          <span>Duplicate</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(template.id)} className="text-destructive focus:text-destructive">
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
  );
}

// Component for deleted template table
function DeletedTemplateTable({
  templates,
  onRestore,
  getStatusDisplay
}: {
  templates: Template[],
  onRestore: (id: string) => void,
  getStatusDisplay: (status: string) => React.ReactNode
}) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Template Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Language(s)</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                No deleted templates found.
              </TableCell>
            </TableRow>
          ) : (
            templates.map((template) => (
              <TableRow key={template.id} className="group">
                <TableCell>
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[280px]">
                      {template.name}_{template.id.substring(0, 8)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusDisplay('deleted')}
                </TableCell>
                <TableCell className="capitalize">
                  {template.category}
                </TableCell>
                <TableCell>
                  {template.language}
                </TableCell>
                <TableCell>
                  {template.createdBy || "Unknown"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRestore(template.id)}
                  >
                    Restore
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
