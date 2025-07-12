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
  PowerOff
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
import AutomationsLayout from "@/components/layout/automation-layout";

interface AutoReply {
  _id: string;
  name: string;
  isActive: boolean;
  triggers: string[];
  replyMessage: string;
  replyType: 'text' | 'template';
  templateName?: string;
  templateLanguage?: string;
  matchType: 'exact' | 'contains' | 'starts_with' | 'ends_with';
  caseSensitive: boolean;
  priority: number;
  usageCount: number;
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

export default function AutomationsPage() {
  const [autoReplies, setAutoReplies] = useState<AutoReply[]>([]);
  const [wabaAccounts, setWabaAccounts] = useState<WabaAccount[]>([]);
  const [selectedWabaId, setSelectedWabaId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
    replyType: "text" as 'text' | 'template',
    templateName: "",
    templateLanguage: "en",
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

  const handleCreateAutoReply = async () => {
    if (!formData.name || !formData.triggers.filter(Boolean).length || !formData.replyMessage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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

    return matchesSearch && matchesStatus;
  });

  return (
    <AutomationsLayout>
      <div className="container mx-auto p-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Auto Replies</h1>
            <p className="text-muted-foreground mt-1">
              Set up automated responses for your WhatsApp Business
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Auto Reply
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
                  <p className="text-sm font-medium text-muted-foreground">Total Auto Replies</p>
                  <p className="text-2xl font-bold">{autoReplies.length}</p>
                </div>
                <Bot className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{autoReplies.filter(ar => ar.isActive).length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Triggers</p>
                  <p className="text-2xl font-bold">
                    {autoReplies.reduce((sum, ar) => sum + (ar.usageCount || 0), 0)}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold">
                    {autoReplies.length > 0 ? Math.round((autoReplies.filter(ar => ar.usageCount > 0).length / autoReplies.length) * 100) : 0}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search auto replies or triggers..."
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
            <Button variant="outline" onClick={fetchAutoReplies}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Auto Replies Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Loading auto replies...</p>
            </div>
          </div>
        ) : filteredAutoReplies.length === 0 ? (
          <div className="bg-white border rounded-lg p-12 text-center">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No auto replies found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No auto replies match your current filters. Try adjusting your search or filter criteria."
                : "Get started by creating your first auto reply to automatically respond to customer messages."}
            </p>
           {/* // In the empty state section, replace the existing content with: */}
            {!searchQuery && statusFilter === "all" && (
              <div className="space-y-4">
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Auto Reply
                </Button>
                <Button
                  variant="outline"
                  className='ml-2'
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
                  <Bot className="h-4 w-4 mr-2" />
                  Create Sample Auto Replies
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#E4EAE8]">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Triggers</TableHead>
                  <TableHead className="font-semibold">Reply Type</TableHead>
                  <TableHead className="font-semibold">Match Type</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  {/* <TableHead className="font-semibold">Usage</TableHead> */}
                  <TableHead className="font-semibold">Last Triggered</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAutoReplies.map((autoReply) => (
                  <TableRow key={autoReply._id} className="group">
                    <TableCell className="font-medium">
                      <div
                        className="hover:text-primary cursor-pointer"
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
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {autoReply.triggers.slice(0, 2).map((trigger, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                        {autoReply.triggers.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{autoReply.triggers.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {autoReply.replyType === 'template' ? 'Template' : 'Text'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {autoReply.matchType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={autoReply.isActive ? "default" : "secondary"}
                          className={autoReply.isActive ? "bg-green-100 text-green-700 border-green-200" : ""}
                        >
                          {autoReply.isActive ? (
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
                      </div>
                    </TableCell>
                    {/* <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{autoReply.usageCount || 0}</div>
                        <div className="text-muted-foreground">triggers</div>
                      </div>
                    </TableCell> */}
                    <TableCell>
                      {autoReply.lastTriggered ? (
                        <div className="text-sm">
                          {format(new Date(autoReply.lastTriggered), "MMM dd, yyyy")}
                          <div className="text-muted-foreground">
                            {format(new Date(autoReply.lastTriggered), "HH:mm")}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(autoReply)}
                          className="h-8"
                        >
                          {autoReply.isActive ? (
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
        )}

        {/* Create/Edit Auto Reply Dialog */}
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
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isCreateDialogOpen ? "Create Auto Reply" : "Edit Auto Reply"}
              </DialogTitle>
              <DialogDescription>
                Set up automatic responses to specific customer messages or keywords.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">BASIC SETTINGS</h3>

                <div className="grid grid-cols-2 space-y-2 gap-4">
                  <div className='space-y-2'>
                    <Label htmlFor="name">Auto Reply Name *</Label>
                    <Input
                      id="name"

                      placeholder="e.g., Welcome Message"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      placeholder="0"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Higher numbers = higher priority</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              {/* Trigger Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">TRIGGER SETTINGS</h3>

                <div>
                  <Label>Trigger Keywords/Phrases *</Label>
                  <div className="space-y-2 mt-2">
                    {formData.triggers.map((trigger, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Trigger ${index + 1} (e.g., hello, hi, start)`}
                          value={trigger}
                          onChange={(e) => updateTrigger(index, e.target.value)}
                        />
                        {formData.triggers.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeTrigger(index)}
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
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Trigger
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className='space-y-2'>
                    <Label htmlFor="matchType">Match Type</Label>
                    <Select
                      value={formData.matchType}
                      onValueChange={(value: any) => setFormData({ ...formData, matchType: value })}
                    >
                      <SelectTrigger>
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
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="caseSensitive"
                      checked={formData.caseSensitive}
                      onCheckedChange={(checked) => setFormData({ ...formData, caseSensitive: checked })}
                    />
                    <Label htmlFor="caseSensitive">Case Sensitive</Label>
                  </div>
                </div>
              </div>

              {/* Reply Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">REPLY SETTINGS</h3>

                <div className='space-y-2'>
                  <Label htmlFor="replyType">Reply Type</Label>
                  <Select
                    value={formData.replyType}
                    onValueChange={(value: any) => setFormData({ ...formData, replyType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Message</SelectItem>
                      <SelectItem value="template">Template Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.replyType === 'text' ? (
                  <div className='space-y-2'>
                    <Label htmlFor="replyMessage">Reply Message *</Label>
                    <Textarea
                      id="replyMessage"
                      placeholder="Enter your auto reply message..."
                      value={formData.replyMessage}
                      onChange={(e) => setFormData({ ...formData, replyMessage: e.target.value })}
                      rows={4}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateName">Template Name *</Label>
                      <Input
                        id="templateName"
                        placeholder="Template name"
                        value={formData.templateName}
                        onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="templateLanguage">Language</Label>
                      <Select
                        value={formData.templateLanguage}
                        onValueChange={(value) => setFormData({ ...formData, templateLanguage: value })}
                      >
                        <SelectTrigger>
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
              </div>
            </div>

            <DialogFooter>
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
              >
                {isCreateDialogOpen ? "Create Auto Reply" : "Update Auto Reply"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Auto Reply Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            {selectedAutoReply && (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle>{selectedAutoReply.name}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={selectedAutoReply.isActive ? "default" : "secondary"}
                          className={selectedAutoReply.isActive ? "bg-green-100 text-green-700 border-green-200" : ""}
                        >
                          {selectedAutoReply.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {selectedAutoReply.replyType}
                        </Badge>
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <Tabs defaultValue="settings" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="settings" className="space-y-4 pt-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Trigger Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedAutoReply.triggers.map((trigger, index) => (
                            <Badge key={index} variant="secondary">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Match Type:</span>
                          <div className="font-medium capitalize">
                            {selectedAutoReply.matchType.replace('_', ' ')}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Case Sensitive:</span>
                          <div className="font-medium">
                            {selectedAutoReply.caseSensitive ? "Yes" : "No"}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Priority:</span>
                          <div className="font-medium">{selectedAutoReply.priority}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Reply Type:</span>
                          <div className="font-medium capitalize">{selectedAutoReply.replyType}</div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-sm mb-2">Reply Content</h4>
                        {selectedAutoReply.replyType === 'template' ? (
                          <div className="bg-muted/40 p-3 rounded-md text-sm">
                            <div className="font-medium">Template: {selectedAutoReply.templateName}</div>
                            <div className="text-muted-foreground">
                              Language: {selectedAutoReply.templateLanguage}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-muted/40 p-3 rounded-md text-sm">
                            {selectedAutoReply.replyMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{selectedAutoReply.usageCount || 0}</div>
                            <div className="text-sm text-muted-foreground">Total Triggers</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {selectedAutoReply.lastTriggered ?
                                format(new Date(selectedAutoReply.lastTriggered), "MMM dd") :
                                "Never"
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">Last Triggered</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">Detailed Analytics Coming Soon</p>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Detailed analytics with charts and insights will be available in a future update.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="pt-4 border-t">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setTimeout(() => openEditDialog(selectedAutoReply), 100);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Auto Reply
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setTimeout(() => setIsDeleteDialogOpen(true), 100);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Auto Reply?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. The auto reply will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            {selectedAutoReply && (
              <div className="py-4">
                <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{selectedAutoReply.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedAutoReply.triggers.length} trigger{selectedAutoReply.triggers.length !== 1 ? 's' : ''}
                      {selectedAutoReply.usageCount > 0 && ` • ${selectedAutoReply.usageCount} uses`}
                    </div>
                  </div>
                </div>
                {selectedAutoReply.isActive && (
                  <div className="mt-4 flex items-start gap-2 p-3 rounded-md bg-amber-50 text-amber-800">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Warning: This auto reply is currently active</p>
                      <p className="text-sm">
                        Deleting an active auto reply will stop automatic responses to the configured triggers.
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
                onClick={handleDeleteAutoReply}
              >
                Delete Auto Reply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AutomationsLayout>
  );
}
