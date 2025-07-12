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
  PowerOff
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

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

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
        // Navigate to workflow builder
        router.push(`/automations/workflows/${data.workflow._id}/builder`);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create workflow",
          variant: "destructive",
        });
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

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (workflow.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
                         (statusFilter === "active" && workflow.isActive) ||
                         (statusFilter === "inactive" && !workflow.isActive);

    return matchesSearch && matchesStatus;
  });

  const getSuccessRate = (workflow: Workflow) => {
    if (workflow.executionCount === 0) return 0;
    return Math.round((workflow.successCount / workflow.executionCount) * 100);
  };

  return (
    <AutomationsLayout>
    <div className="h-full overflow-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Workflows</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage multi-step automation sequences
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>

        {/* WABA Account Selector */}
        <div className="mb-6">
          <Label htmlFor="waba-select" className="text-sm font-medium mb-2 block">
            WhatsApp Business Account
          </Label>
          <Select value={selectedWabaId} onValueChange={setSelectedWabaId}>
            <SelectTrigger id="waba-select" className="w-full max-w-md">
              <SelectValue placeholder="Select WhatsApp Business Account" />
            </SelectTrigger>
            <SelectContent>
              {wabaAccounts.map((account) => (
                <SelectItem key={account.wabaId} value={account.wabaId}>
                  {account.businessName} ({account.phoneNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
                  <p className="text-2xl font-bold">{workflows.length}</p>
                </div>
                <Workflow className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{workflows.filter(w => w.isActive).length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Executions</p>
                  <p className="text-2xl font-bold">
                    {workflows.reduce((sum, w) => sum + w.executionCount, 0)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Success Rate</p>
                  <p className="text-2xl font-bold">
                    {workflows.length > 0
                      ? Math.round(workflows.reduce((sum, w) => sum + getSuccessRate(w), 0) / workflows.length)
                      : 0}%
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchWorkflows}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Workflows Table */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="bg-white border rounded-lg p-12 text-center">
            <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No workflows found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No workflows match your current filters. Try adjusting your search or filter criteria."
                : "Get started by creating your first workflow to automate complex customer interactions."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Workflow
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#E4EAE8]">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Nodes</TableHead>
                  <TableHead className="font-semibold">Executions</TableHead>
                  <TableHead className="font-semibold">Success Rate</TableHead>
                  <TableHead className="font-semibold">Last Triggered</TableHead>
                  <TableHead className="font-semibold">Updated</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkflows.map((workflow) => (
                  <TableRow key={workflow._id} className="group">
                    <TableCell className="font-medium">
                      <div
                        className="hover:text-primary cursor-pointer"
                        onClick={() => router.push(`/automations/workflows/${workflow._id}/builder`)}
                      >
                        {workflow.name}
                      </div>
                      {workflow.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {workflow.description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        v{workflow.version}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={workflow.isActive ? "default" : "secondary"}
                        className={workflow.isActive ? "bg-green-100 text-green-700 border-green-200" : ""}
                      >
                        {workflow.isActive ? (
                          <>
                            <Power className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <PowerOff className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
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
                        <div className={`h-2 w-8 rounded-full ${
                          getSuccessRate(workflow) >= 80 ? 'bg-green-200' :
                          getSuccessRate(workflow) >= 60 ? 'bg-yellow-200' : 'bg-red-200'
                        }`}>
                          <div
                            className={`h-full rounded-full ${
                              getSuccessRate(workflow) >= 80 ? 'bg-green-500' :
                              getSuccessRate(workflow) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${getSuccessRate(workflow)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {workflow.lastTriggered ? (
                        <div className="text-sm">
                          {format(new Date(workflow.lastTriggered), "MMM dd, yyyy")}
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
                        {format(new Date(workflow.updatedAt), "MMM dd, yyyy")}
                        <div className="text-muted-foreground">
                          {format(new Date(workflow.updatedAt), "HH:mm")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(workflow)}
                          className="h-8"
                        >
                          {workflow.isActive ? (
                            <PowerOff className="h-3.5 w-3.5" />
                          ) : (
                            <Power className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">More</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/automations/workflows/${workflow._id}/builder`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Workflow
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                // Duplicate logic would go here
                                toast({
                                  title: "Feature Coming Soon",
                                  description: "Duplicate functionality will be available soon",
                                });
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
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
        )}

        {/* Create Workflow Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>
                Create a new workflow to automate customer interactions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workflow Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Welcome Series"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
          <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this workflow does..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateWorkflow}>
                Create & Open Builder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Workflow?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. The workflow will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            {selectedWorkflow && (
              <div className="py-4">
                <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                  <Workflow className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{selectedWorkflow.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedWorkflow.nodes.length} nodes • v{selectedWorkflow.version}
                      {selectedWorkflow.executionCount > 0 && ` • ${selectedWorkflow.executionCount} executions`}
                    </div>
                  </div>
                </div>
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
                onClick={handleDeleteWorkflow}
              >
                Delete Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </AutomationsLayout>
  );
}
