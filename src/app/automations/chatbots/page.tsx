"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Bot,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Power,
  PowerOff,
  Copy,
  MessageSquare,
  Zap,
  DollarSign,
  Clock,
  Users,
  Settings,
  Sparkles,
  Brain,
  Cpu,
  Activity,
  TrendingUp,
  RefreshCw,
  Download,
  BarChart3,
  Layers,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Target,
  ArrowRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AutomationsLayout from '@/components/layout/automation-layout';
import { FaRupeeSign } from 'react-icons/fa';

interface Chatbot {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  aiModel: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo';
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  triggers: string[];
  matchType: 'exact' | 'contains' | 'starts_with' | 'ends_with';
  priority: number;
  usageCount: number;
  totalTokensUsed: number;
  totalCostINR: number;
  lastTriggered?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ChatbotsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Get selected WABA ID (you'll need to implement this based on your context)
  const [selectedWabaId, setSelectedWabaId] = useState<string>('');

  // Load chatbots
  const fetchChatbots = async () => {
    if (!selectedWabaId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/chatbots?wabaId=${selectedWabaId}`);
      const data = await response.json();

      if (data.success) {
        setChatbots(data.chatbots);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch chatbots",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching chatbots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch chatbots",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get WABA ID from your context or local storage
    const wabaId = localStorage.getItem('selectedWabaId') || '';
    setSelectedWabaId(wabaId);
  }, []);

  useEffect(() => {
    if (selectedWabaId) {
      fetchChatbots();
    }
  }, [selectedWabaId]);

  // Toggle chatbot status
  const handleToggleStatus = async (chatbot: Chatbot) => {
    try {
      const response = await fetch(`/api/chatbots/${chatbot._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !chatbot.isActive
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: `Chatbot ${!chatbot.isActive ? 'activated' : 'deactivated'} successfully`,
        });
        fetchChatbots();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update chatbot status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error toggling chatbot status:', error);
      toast({
        title: "Error",
        description: "Failed to update chatbot status",
        variant: "destructive",
      });
    }
  };

  // Delete chatbot
  const handleDeleteChatbot = async () => {
    if (!selectedChatbot) return;

    try {
      const response = await fetch(`/api/chatbots/${selectedChatbot._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Chatbot deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        setSelectedChatbot(null);
        fetchChatbots();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete chatbot",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      toast({
        title: "Error",
        description: "Failed to delete chatbot",
        variant: "destructive",
      });
    }
  };

  // Filter chatbots
  const filteredChatbots = chatbots.filter(chatbot => {
    const matchesSearch = chatbot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chatbot.triggers.some(trigger =>
        trigger.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && chatbot.isActive) ||
      (statusFilter === "inactive" && !chatbot.isActive);

    const matchesModel = modelFilter === "all" || chatbot.aiModel === modelFilter;

    return matchesSearch && matchesStatus && matchesModel;
  });

  // Calculate stats
  const totalChatbots = chatbots.length;
  const activeChatbots = chatbots.filter(cb => cb.isActive).length;
  const totalInteractions = chatbots.reduce((sum, cb) => sum + (cb.usageCount || 0), 0);
  const totalCost = chatbots.reduce((sum, cb) => sum + (cb.totalCostINR || 0), 0);

  const getModelIcon = (model: string) => {
    switch (model) {
      case 'gpt-4':
      case 'gpt-4-turbo':
        return <Brain className="h-4 w-4 text-purple-600" />;
      default:
        return <Cpu className="h-4 w-4 text-blue-600" />;
    }
  };

  const getModelColor = (model: string) => {
    switch (model) {
      case 'gpt-4':
      case 'gpt-4-turbo':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <AutomationsLayout>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
          <div className="mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      AI Chatbots
                    </h1>
                    <p className="text-muted-foreground font-medium">
                      Intelligent AI-powered customer service automation
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
                    toast({
                      title: "Coming Soon",
                      description: "Export functionality will be available soon",
                    });
                  }}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  onClick={() => router.push('/automations/chatbots/create')}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Chatbot
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Total Chatbots</p>
                      <p className="text-3xl font-bold text-blue-900">{totalChatbots}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-full">
                      <Bot className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Active Chatbots</p>
                      <p className="text-3xl font-bold text-green-900">{activeChatbots}</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-full">
                      <Power className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">Total Interactions</p>
                      <p className="text-3xl font-bold text-purple-900">{totalInteractions.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-full">
                      <MessageSquare className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700">Total Cost</p>
                      <p className="text-3xl font-bold text-orange-900">₹{totalCost.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-full">
                      <FaRupeeSign className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Filters and Search */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search chatbots..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 bg-white border-slate-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={modelFilter} onValueChange={setModelFilter}>
                      <SelectTrigger className="w-48 bg-white border-slate-200">
                        <SelectValue placeholder="AI Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Models</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                          className="border-slate-200 hover:bg-slate-50"
                        >
                          {viewMode === 'grid' ? <Layers className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Switch to {viewMode === 'grid' ? 'table' : 'grid'} view
                      </TooltipContent>
                    </Tooltip>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchChatbots}
                      className="border-slate-200 hover:bg-slate-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <Bot className="h-16 w-16 animate-pulse mx-auto mb-4 text-primary" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Loading Chatbots</h3>
                  <p className="text-slate-600">Fetching your AI assistants...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && chatbots.length === 0 && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-2xl" />
                      <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-2xl">
                        <Bot className="h-16 w-16 text-primary mx-auto" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-slate-900">Create Your First AI Chatbot</h3>
                      <p className="text-slate-600 max-w-md mx-auto">
                        Get started with intelligent customer service automation powered by OpenAI
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200">
                        <Sparkles className="h-6 w-6 text-blue-600 mb-2" />
                        <h4 className="font-semibold text-blue-900">AI-Powered</h4>
                        <p className="text-sm text-blue-700">Advanced OpenAI models for natural conversations</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg border border-green-200">
                        <Target className="h-6 w-6 text-green-600 mb-2" />
                        <h4 className="font-semibold text-green-900">Smart Triggers</h4>
                        <p className="text-sm text-green-700">Contextual responses based on customer messages</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border border-purple-200">
                        <Activity className="h-6 w-6 text-purple-600 mb-2" />
                        <h4 className="font-semibold text-purple-900">Analytics</h4>
                        <p className="text-sm text-purple-700">Track usage, costs, and performance metrics</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push('/automations/chatbots/create')}
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Chatbot
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chatbots List */}
            {!isLoading && filteredChatbots.length > 0 && (
              <div className="space-y-6">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredChatbots.map((chatbot) => (
                      <Card key={chatbot._id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200 group">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors cursor-pointer"
                                  onClick={() => {
                                    setSelectedChatbot(chatbot);
                                    setIsViewDialogOpen(true);
                                  }}>
                                  {chatbot.name}
                                </h3>
                                <Badge
                                  variant={chatbot.isActive ? "default" : "secondary"}
                                  className={cn(
                                    "text-xs",
                                    chatbot.isActive
                                      ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                                      : "bg-slate-100 text-slate-600 border-slate-200"
                                  )}
                                >
                                  {chatbot.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {chatbot.description || "No description provided"}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedChatbot(chatbot);
                                    setIsViewDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/automations/chatbots/${chatbot._id}/edit`)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(chatbot)}>
                                  {chatbot.isActive ? (
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
                                    setSelectedChatbot(chatbot);
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
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-2">AI Model</p>
                            <Badge variant="outline" className={cn("text-xs", getModelColor(chatbot.aiModel))}>
                              {getModelIcon(chatbot.aiModel)}
                              <span className="ml-1">{chatbot.aiModel}</span>
                            </Badge>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-2">Triggers</p>
                            <div className="flex flex-wrap gap-1">
                              {chatbot.triggers.slice(0, 3).map((trigger, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs bg-slate-100 text-slate-700 border-slate-200"
                                >
                                  {trigger}
                                </Badge>
                              ))}
                              {chatbot.triggers.length > 3 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-slate-100 text-slate-700 border-slate-200"
                                >
                                  +{chatbot.triggers.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Interactions</p>
                              <p className="font-medium">{chatbot.usageCount || 0}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Cost</p>
                              <p className="font-medium">₹{(chatbot.totalCostINR || 0).toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {chatbot.lastTriggered ? (
                                  <>Last used {format(new Date(chatbot.lastTriggered), "MMM dd")}</>
                                ) : (
                                  "Never used"
                                )}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(chatbot)}
                                className="h-8 px-3"
                              >
                                {chatbot.isActive ? (
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
                          <TableHeader className='bg-[#DAE9E0] -50/80 hover:bg-[#DAE9E0] p-0 border'>
                            <TableRow className="">
                              <TableHead className="font-semibold text-slate-700">Name</TableHead>
                              <TableHead className="font-semibold text-slate-700">Model</TableHead>
                              <TableHead className="font-semibold text-slate-700">Triggers</TableHead>
                              <TableHead className="font-semibold text-slate-700">Status</TableHead>
                              <TableHead className="font-semibold text-slate-700">Usage</TableHead>
                              <TableHead className="font-semibold text-slate-700">Cost</TableHead>
                              <TableHead className="font-semibold text-slate-700">Last Used</TableHead>
                              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredChatbots.map((chatbot) => (
                              <TableRow key={chatbot._id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell>
                                  <div className="space-y-1">
                                    <div
                                      className="font-medium text-slate-900 hover:text-primary cursor-pointer transition-colors"
                                      onClick={() => {
                                        setSelectedChatbot(chatbot);
                                        setIsViewDialogOpen(true);
                                      }}
                                    >
                                      {chatbot.name}
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate max-w-48">
                                      {chatbot.description || "No description"}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={cn("text-xs", getModelColor(chatbot.aiModel))}>
                                    {getModelIcon(chatbot.aiModel)}
                                    <span className="ml-1">{chatbot.aiModel}</span>
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1 max-w-48">
                                    {chatbot.triggers.slice(0, 2).map((trigger, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs bg-slate-100 text-slate-700"
                                      >
                                        {trigger}
                                      </Badge>
                                    ))}
                                    {chatbot.triggers.length > 2 && (
                                      <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                                        +{chatbot.triggers.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={chatbot.isActive ? "default" : "secondary"}
                                      className={cn(
                                        "text-xs",
                                        chatbot.isActive
                                          ? "bg-green-100 text-green-700 border-green-200"
                                          : "bg-slate-100 text-slate-600 border-slate-200"
                                      )}
                                    >
                                      {chatbot.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <p className="font-medium">{chatbot.usageCount || 0}</p>
                                    <p className="text-muted-foreground">{(chatbot.totalTokensUsed || 0).toLocaleString()} tokens</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <p className="text-sm font-medium">${(chatbot.totalCostINR || 0).toFixed(4)}</p>
                                </TableCell>
                                <TableCell>
                                  <p className="text-sm text-muted-foreground">
                                    {chatbot.lastTriggered ? format(new Date(chatbot.lastTriggered), "MMM dd, yyyy") : "Never"}
                                  </p>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedChatbot(chatbot);
                                          setIsViewDialogOpen(true);
                                        }}
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => router.push(`/automations/chatbots/${chatbot._id}/edit`)}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleToggleStatus(chatbot)}>
                                        {chatbot.isActive ? (
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
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onClick={() => {
                                          setSelectedChatbot(chatbot);
                                          setIsDeleteDialogOpen(true);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
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

            {/* No Results */}
            {!isLoading && chatbots.length > 0 && filteredChatbots.length === 0 && (
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto">
                      <Search className="h-8 w-8 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">No chatbots found</h3>
                      <p className="text-slate-600">Try adjusting your search or filters</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setModelFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* View Chatbot Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0">
                {selectedChatbot && (
                  <>
                    <DialogHeader className="px-6 py-4 border-b border-slate-200 flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                          <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <DialogTitle className="text-xl font-semibold text-slate-900">
                            {selectedChatbot.name}
                          </DialogTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={selectedChatbot.isActive ? "default" : "secondary"}
                              className={cn(
                                selectedChatbot.isActive
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              )}
                            >
                              {selectedChatbot.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline" className={cn("text-xs", getModelColor(selectedChatbot.aiModel))}>
                              {getModelIcon(selectedChatbot.aiModel)}
                              <span className="ml-1">{selectedChatbot.aiModel}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                      {/* Description */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          Description
                        </h4>
                        <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">
                          {selectedChatbot.description || "No description provided"}
                        </p>
                      </div>

                      {/* System Prompt */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                          System Prompt
                        </h4>
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 p-4 rounded-lg border border-purple-200">
                          <p className="text-sm text-purple-900 whitespace-pre-wrap">
                            {selectedChatbot.systemPrompt}
                          </p>
                        </div>
                      </div>

                      {/* Triggers */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Trigger Keywords
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedChatbot.triggers.map((trigger, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-green-100 text-green-700 border-green-200"
                            >
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Configuration */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                            AI Configuration
                          </h4>
                          <div className="space-y-3 bg-orange-50/50 p-4 rounded-lg border border-orange-200">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-orange-700">Temperature:</span>
                              <span className="text-sm text-orange-900">{selectedChatbot.temperature}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-orange-700">Max Tokens:</span>
                              <span className="text-sm text-orange-900">{selectedChatbot.maxTokens}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-orange-700">Match Type:</span>
                              <span className="text-sm text-orange-900 capitalize">{selectedChatbot.matchType.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            Usage Statistics
                          </h4>
                          <div className="space-y-3 bg-indigo-50/50 p-4 rounded-lg border border-indigo-200">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-indigo-700">Total Interactions:</span>
                              <span className="text-sm text-indigo-900">{selectedChatbot.usageCount || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-indigo-700">Tokens Used:</span>
                              <span className="text-sm text-indigo-900">{(selectedChatbot.totalTokensUsed || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-indigo-700">Total Cost:</span>
                              <span className="text-sm text-indigo-900">${(selectedChatbot.totalCostINR || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-indigo-700">Priority:</span>
                              <span className="text-sm text-indigo-900">{selectedChatbot.priority}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {selectedChatbot.tags && selectedChatbot.tags.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                            Tags
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedChatbot.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-pink-50 text-pink-700 border-pink-200"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Created</p>
                          <p className="text-sm text-slate-600">
                            {format(new Date(selectedChatbot.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">Last Updated</p>
                          <p className="text-sm text-slate-600">
                            {format(new Date(selectedChatbot.updatedAt), "MMM dd, yyyy 'at' HH:mm")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-200 flex-shrink-0 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setIsViewDialogOpen(false)}
                          className="hover:bg-white"
                        >
                          Close
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/automations/chatbots/${selectedChatbot._id}/test`)}
                            className="gap-2 hover:bg-white"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Test Chatbot
                          </Button>
                          <Button
                            onClick={() => {
                              setIsViewDialogOpen(false);
                              router.push(`/automations/chatbots/${selectedChatbot._id}/edit`);
                            }}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit Chatbot
                          </Button>
                        </div>
                      </div>
                    </div>
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
                    Delete Chatbot?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the chatbot and all its configuration.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {selectedChatbot && (
                  <div className="py-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border">
                      <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-lg">
                        <Bot className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{selectedChatbot.name}</div>
                        <div className="text-sm text-slate-600">
                          {selectedChatbot.triggers.length} trigger{selectedChatbot.triggers.length !== 1 ? 's' : ''}
                          {selectedChatbot.usageCount > 0 && ` • ${selectedChatbot.usageCount} interactions`}
                        </div>
                      </div>
                    </div>

                    {selectedChatbot.isActive && (
                      <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">Warning: This chatbot is currently active</p>
                          <p className="text-sm text-amber-700 mt-1">
                            Deleting an active chatbot will stop automatic AI responses to customer messages.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteChatbot}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Chatbot
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