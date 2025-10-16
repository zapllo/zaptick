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
  ArrowRight,
  Network,
  FileText,
  Calendar,
  Gauge,
  Crown,
  Lock
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KnowledgeBaseManager from '@/components/chatbots/KnowledgeBaseManager';

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
  knowledgeBase?: {
    enabled: boolean;
    documents: any[];
    settings: {
      maxDocuments: number;
      maxFileSize: number;
      allowedFileTypes: string[];
      chunkSize: number;
      chunkOverlap: number;
      searchMode: 'semantic' | 'keyword' | 'hybrid';
      maxRelevantChunks: number;
    };
  };
}
interface LimitInfo {
  currentCount: number;
  limit: number;
  canCreateMore: boolean;
  plan: string;
  planName: string;
  subscriptionStatus: string;
  remainingSlots: number;
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Get selected WABA ID (you'll need to implement this based on your context)
  const [selectedWabaId, setSelectedWabaId] = useState<string>('');
  const [wabaAccounts, setWabaAccounts] = useState<any[]>([]);

  const fetchWabaAccounts = async () => {
    try {
      console.log('Fetching WABA accounts...');
      const response = await fetch('/api/waba-accounts');
      const data = await response.json();

      console.log('WABA accounts response:', data);

      if (data.success) {
        setWabaAccounts(data.accounts);

        // Try to get saved WABA ID or use first one
        const savedWabaId = localStorage.getItem('selectedWabaId');
        if (savedWabaId && data.accounts.find((a: any) => a.wabaId === savedWabaId)) {
          setSelectedWabaId(savedWabaId);
          console.log('Using saved WABA ID:', savedWabaId);
        } else if (data.accounts.length > 0) {
          const firstWaba = data.accounts[0];
          setSelectedWabaId(firstWaba.wabaId);
          localStorage.setItem('selectedWabaId', firstWaba.wabaId);
          console.log('Using first WABA ID:', firstWaba.wabaId);
        } else {
          console.log('No WABA accounts found');
        }
      } else {
        console.error('Failed to fetch WABA accounts:', data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to fetch WhatsApp accounts",
          variant: "destructive",
        });
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

  // Load chatbots
  const fetchChatbots = async () => {
    if (!selectedWabaId) {
      console.log('No WABA ID selected, skipping chatbot fetch');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching chatbots for WABA ID:', selectedWabaId);

      const response = await fetch(`/api/chatbots?wabaId=${selectedWabaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Chatbots response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Chatbots response data:', data);

      if (data.success) {
        setChatbots(data.chatbots || []);
        console.log('Chatbots set:', data.chatbots?.length || 0);
      } else {
        console.error('API error:', data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to fetch chatbots",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching chatbots:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chatbots';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load - fetch WABA accounts first
  useEffect(() => {
    fetchWabaAccounts();
  }, []);
  const [limitInfo, setLimitInfo] = useState<LimitInfo | null>(null);
  const [isLoadingLimits, setIsLoadingLimits] = useState(false);
  // When WABA ID changes, fetch chatbots
  const fetchLimits = async () => {
    if (!selectedWabaId) return;

    setIsLoadingLimits(true);
    try {
      const response = await fetch(`/api/chatbots/limit?wabaId=${selectedWabaId}`);
      const data = await response.json();

      if (data.success) {
        setLimitInfo(data.data);
      } else {
        console.error('Failed to fetch limits:', data.message);
      }
    } catch (error) {
      console.error('Error fetching limits:', error);
    } finally {
      setIsLoadingLimits(false);
    }
  };

  // Update useEffect to fetch limits
  useEffect(() => {
    if (selectedWabaId) {
      fetchChatbots();
      fetchLimits(); // Add this line
    }
  }, [selectedWabaId]);

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

  // Add helper function to get model display names
  const getModelDisplayName = (modelValue: string) => {
    const modelMap: { [key: string]: string } = {
      'gpt-3.5-turbo': 'Zaptick Smart',
      'gpt-4': 'Zaptick Pro',
      'gpt-4-turbo': 'Zaptick Ultra'
    };
    return modelMap[modelValue] || modelValue;
  };

  return (
    <AutomationsLayout>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 wark:from-slate-900 wark:via-slate-800 wark:to-slate-900/50">
          <div className="mx-auto p-6 space-y-8">
            {/* Modern Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 shadow-sm">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent wark:from-white wark:to-slate-200">
                      AI Chatbots
                    </h1>
                    <p className="text-slate-600 wark:text-slate-300 font-medium">
                      Intelligent AI-powered customer service automation
                    </p>
                  </div>
                </div>

                {/* Chatbot Stats Pills */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                      {totalChatbots} Total
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                      {activeChatbots} Active
                    </span>
                  </div>

                  {/* Limit Information */}
                  {limitInfo && (
                    <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 wark:from-purple-900/20 wark:to-blue-900/20 border border-purple-200 wark:border-purple-700 px-3 py-1.5 shadow-sm">
                      <Gauge className="h-3 w-3 text-purple-600 wark:text-purple-400" />
                      <span className="text-xs font-medium text-purple-700 wark:text-purple-300">
                        {limitInfo.currentCount}/{limitInfo.limit === Infinity ? '∞' : limitInfo.limit} Used
                      </span>
                    </div>
                  )}

                  {limitInfo && limitInfo.planName && (
                    <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 wark:from-amber-900/20 wark:to-orange-900/20 border border-amber-200 wark:border-amber-700 px-3 py-1.5 shadow-sm">
                      <Crown className="h-3 w-3 text-amber-600 wark:text-amber-400" />
                      <span className="text-xs font-medium text-amber-700 wark:text-amber-300">
                        {limitInfo.planName} Plan
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                      {totalInteractions.toLocaleString()} Interactions
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                      ₹{totalCost.toFixed(2)} Cost
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-slate-200 wark:border-slate-700 hover:border-green-300 wark:hover:border-green-600 hover:bg-green-50 wark:hover:bg-green-900/20"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Export functionality will be available soon",
                    });
                  }}
                  disabled={filteredChatbots.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                {limitInfo && !limitInfo.canCreateMore ? (
                  <div className="relative group">
                    <Button
                      disabled
                      className="bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-lg opacity-60 cursor-not-allowed"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Create Chatbot
                    </Button>
                    <div className="absolute top-full mt-2 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                      <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                        {limitInfo.subscriptionStatus !== 'active' ? (
                          <>Subscription required to create chatbots</>
                        ) : (
                          <>You've reached the limit for {limitInfo.planName} plan ({limitInfo.limit} chatbots)</>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => router.push('/automations/chatbots/create')}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Chatbot
                    {limitInfo && limitInfo.limit !== Infinity && (
                      <span className="ml-2 text-xs opacity-75">
                        ({limitInfo.remainingSlots} left)
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Limit Warning Card */}
            {limitInfo && limitInfo.currentCount >= limitInfo.limit * 0.8 && limitInfo.limit !== Infinity && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 wark:from-amber-900/20 wark:to-orange-900/20 border border-amber-200 wark:border-amber-700 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 wark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 wark:text-amber-200 mb-1">
                      Approaching Chatbot Limit
                    </h3>
                    <p className="text-sm text-amber-700 wark:text-amber-300 mb-3">
                      You're using {limitInfo.currentCount} of {limitInfo.limit} chatbots in your {limitInfo.planName} plan.
                      {limitInfo.remainingSlots === 0 ? (
                        ' Upgrade to create more chatbots.'
                      ) : (
                        ` You have ${limitInfo.remainingSlots} chatbot${limitInfo.remainingSlots !== 1 ? 's' : ''} remaining.`
                      )}
                    </p>
                    {limitInfo.remainingSlots <= 2 && (
                      <Button
                        size="sm"
                        onClick={() => router.push('/wallet/plans')}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Enhanced Filters and Search */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 p-2 wark:to-slate-900/10">
              <CardContent className="p-2">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 wark:text-slate-500" />
                      <Input
                        placeholder="Search chatbots by name or triggers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white wark:bg-slate-800 border-slate-200 wark:border-slate-700 focus:border-primary/50 focus:ring-primary/20 text-slate-900 wark:text-white placeholder:text-slate-500 wark:placeholder:text-slate-400"
                      />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 bg-white wark:bg-slate-800 border-slate-200 wark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <Power className="h-4 w-4 text-slate-500" />
                          <SelectValue placeholder="Status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-slate-400" />
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={modelFilter} onValueChange={setModelFilter}>
                      <SelectTrigger className="w-48 bg-white wark:bg-slate-800 border-slate-200 wark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-slate-500" />
                          <SelectValue placeholder="AI Model" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Models</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">
                          <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-blue-600" />
                            Zaptick Smart
                          </div>
                        </SelectItem>
                        <SelectItem value="gpt-4">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-purple-600" />
                            Zaptick Pro
                          </div>
                        </SelectItem>
                        <SelectItem value="gpt-4-turbo">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-purple-600" />
                            Zaptick Ultra
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchChatbots}
                          className="gap-2 hover:bg-blue-50 wark:hover:bg-blue-900/20 border-slate-200 wark:border-slate-700"
                          disabled={isLoading}
                        >
                          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                          Refresh
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Refresh chatbots list</TooltipContent>
                    </Tooltip>

                    <div className="flex items-center gap-1 p-1 bg-slate-100 wark:bg-slate-800 rounded-lg border border-slate-200 wark:border-slate-700">
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

            {/* Enhanced Content */}
            {isLoading ? (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 wark:to-slate-900/10">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Bot className="w-8 h-8 text-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold text-slate-900 wark:text-white">Loading AI Chatbots</h3>
                      <p className="text-sm text-slate-600 wark:text-slate-300">Fetching your AI assistants...</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500 wark:text-slate-400">
                        <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                        <span>Analyzing AI configurations</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredChatbots.length === 0 ? (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 wark:to-slate-900/10">
                <CardContent className="p-12">
                  <div className="text-center space-y-8">
                    <div className="relative mx-auto w-32 h-32">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                        <Bot className="h-16 w-16 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center animat">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      {/* <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                        <Brain className="h-3 w-3 text-white" />
                      </div> */}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-slate-900 wark:text-white">
                        {searchQuery || statusFilter !== "all" || modelFilter !== "all"
                          ? "No matching chatbots found"
                          : "Create Your First AI Chatbot"
                        }
                      </h3>
                      <p className="text-slate-600 wark:text-slate-300 max-w-md mx-auto leading-relaxed">
                        {searchQuery || statusFilter !== "all" || modelFilter !== "all"
                          ? "Try adjusting your search or filter criteria to find what you're looking for."
                          : "Get started with intelligent customer service automation powered by advanced AI models 24/7."
                        }
                      </p>
                    </div>

                    {!searchQuery && statusFilter === "all" && modelFilter === "all" && (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                          onClick={() => router.push('/automations/chatbots/create')}
                          className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                          size="lg"
                        >
                          <Plus className="h-5 w-5" />
                          Create Your First Chatbot
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="gap-2 border-2 hover:border-primary/50 hover:bg-primary/5"
                          onClick={() => {
                            toast({
                              title: "Coming Soon",
                              description: "Chatbot templates will be available soon",
                            });
                          }}
                        >
                          <Lightbulb className="h-5 w-5" />
                          Browse Templates
                        </Button>
                      </div>
                    )}

                    {/* AI Chatbot features highlight */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-200 wark:border-slate-700">
                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800/50">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 wark:bg-blue-900/30 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-blue-600 wark:text-blue-400" />
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm text-slate-900 wark:text-white">AI-Powered</div>
                          <div className="text-xs text-slate-500 wark:text-slate-400">Natural conversations</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800/50">
                        <div className="h-10 w-10 rounded-xl bg-green-100 wark:bg-green-900/30 flex items-center justify-center">
                          <Target className="h-5 w-5 text-green-600 wark:text-green-400" />
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm text-slate-900 wark:text-white">Smart Triggers</div>
                          <div className="text-xs text-slate-500 wark:text-slate-400">Contextual responses</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800/50">
                        <div className="h-10 w-10 rounded-xl bg-purple-100 wark:bg-purple-900/30 flex items-center justify-center">
                          <Activity className="h-5 w-5 text-purple-600 wark:text-purple-400" />
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm text-slate-900 wark:text-white">Analytics</div>
                          <div className="text-xs text-slate-500 wark:text-slate-400">Performance tracking</div>
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
                    {filteredChatbots.map((chatbot) => (
                      <Card
                        key={chatbot._id}
                        className="group relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 wark:from-muted/40 wark:to-slate-900/10"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <CardHeader className="pb-3 relative">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <h3
                                  className="font-semibold text-slate-900 wark:text-white group-hover:text-primary transition-colors cursor-pointer"
                                  onClick={() => {
                                    setSelectedChatbot(chatbot);
                                    setIsViewDialogOpen(true);
                                  }}
                                >
                                  {chatbot.name}
                                </h3>
                                <Badge
                                  variant={chatbot.isActive ? "default" : "secondary"}
                                  className={cn(
                                    "text-xs",
                                    chatbot.isActive
                                      ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100 wark:bg-green-900/30 wark:text-green-300"
                                      : "bg-slate-100 text-slate-600 border-slate-200 wark:bg-slate-800 wark:text-slate-400"
                                  )}
                                >
                                  {chatbot.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 wark:text-slate-300 line-clamp-2">
                                {chatbot.description || "No description provided"}
                              </p>
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
                                    setSelectedChatbot(chatbot);
                                    setIsViewDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
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

                        <CardContent className="space-y-4 relative">
                          <div className="p-3 bg-slate-50 wark:bg-slate-800/50 rounded-lg border border-slate-200 wark:border-slate-700">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="h-4 w-4 text-slate-500 wark:text-slate-400" />
                              <p className="text-sm font-medium text-slate-700 wark:text-slate-300">AI Model</p>
                            </div>
                            <Badge variant="outline" className={cn("text-xs", getModelColor(chatbot.aiModel))}>
                              {getModelIcon(chatbot.aiModel)}
                              <span className="ml-1">{getModelDisplayName(chatbot.aiModel)}</span>
                            </Badge>
                          </div>

                          <div className="p-3 bg-blue-50 wark:bg-blue-900/20 rounded-lg border border-blue-200 wark:border-blue-700">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-blue-600 wark:text-blue-400" />
                              <p className="text-sm font-medium text-blue-700 wark:text-blue-300">Triggers</p>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {chatbot.triggers.slice(0, 3).map((trigger, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs bg-white wark:bg-slate-700 text-slate-700 wark:text-slate-300 border-slate-300 wark:border-slate-600"
                                >
                                  {trigger}
                                </Badge>
                              ))}
                              {chatbot.triggers.length > 3 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-white wark:bg-slate-700 text-slate-700 wark:text-slate-300 border-slate-300 wark:border-slate-600"
                                >
                                  +{chatbot.triggers.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-purple-50 wark:bg-purple-900/20 rounded-lg border border-purple-200 wark:border-purple-700">
                              <div className="flex items-center gap-2 justify-center mb-1">
                                <MessageSquare className="h-4 w-4 text-purple-600 wark:text-purple-400" />
                                <span className="text-xs text-purple-600 wark:text-purple-400">Interactions</span>
                              </div>
                              <p className="font-bold text-purple-900 wark:text-purple-100 text-lg">{chatbot.usageCount || 0}</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 wark:bg-green-900/20 rounded-lg border border-green-200 wark:border-green-700">
                              <div className="flex items-center gap-2 justify-center mb-1">
                                <FaRupeeSign className="h-4 w-4 text-green-600 wark:text-green-400" />
                                <span className="text-xs text-green-600 wark:text-green-400">Cost</span>
                              </div>
                              <p className="font-bold text-green-900 wark:text-green-100 text-lg">₹{(chatbot.totalCostINR || 0).toFixed(2)}</p>
                            </div>
                          </div>

                          {/* Knowledge Base Indicator */}
                          {chatbot.knowledgeBase?.enabled && (
                            <div className="p-3 bg-indigo-50 wark:bg-indigo-900/20 rounded-lg border border-indigo-200 wark:border-indigo-700">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-600 wark:text-indigo-400" />
                                <span className="text-sm font-medium text-indigo-700 wark:text-indigo-300">Knowledge Base</span>
                                <Badge variant="outline" className="text-xs bg-indigo-100 wark:bg-indigo-800 text-indigo-700 wark:text-indigo-300 border-indigo-300 wark:border-indigo-600">
                                  {chatbot.knowledgeBase.documents?.length || 0} docs
                                </Badge>
                              </div>
                            </div>
                          )}

                          <div className="p-3 bg-amber-50 wark:bg-amber-900/20 rounded-lg border border-amber-200 wark:border-amber-700">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-amber-600 wark:text-amber-400" />
                                <span className="text-amber-700 wark:text-amber-300 font-medium">
                                  {chatbot.lastTriggered ? (
                                    <>Last used {format(new Date(chatbot.lastTriggered), "MMM dd")}</>
                                  ) : (
                                    "Never used"
                                  )}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(chatbot)}
                                className="h-8 px-3 hover:bg-amber-100 wark:hover:bg-amber-800/30"
                              >
                                {chatbot.isActive ? (
                                  <Pause className="h-3 w-3 text-amber-600 wark:text-amber-400" />
                                ) : (
                                  <Play className="h-3 w-3 text-amber-600 wark:text-amber-400" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>

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
                          <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 wark:from-slate-800/50 wark:to-slate-900/30">
                            <TableRow className="border-b border-slate-200 wark:border-slate-700">
                              <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <Bot className="h-4 w-4" />
                                  Name
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <Brain className="h-4 w-4" />
                                  Model
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  Triggers
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <Power className="h-4 w-4" />
                                  Status
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  Usage
                                </div>
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <FaRupeeSign className="h-4 w-4" />
                                  Cost
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
                            {filteredChatbots.map((chatbot, index) => (
                              <TableRow
                                key={chatbot._id}
                                className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent wark:hover:from-slate-800/30 wark:hover:to-transparent transition-all duration-200 group border-b border-slate-100 wark:border-slate-800"
                              >
                                <TableCell>
                                  <div className="space-y-1">
                                    <div
                                      className="font-medium text-slate-900 wark:text-white hover:text-primary cursor-pointer transition-colors"
                                      onClick={() => {
                                        setSelectedChatbot(chatbot);
                                        setIsViewDialogOpen(true);
                                      }}
                                    >
                                      {chatbot.name}
                                    </div>
                                    <p className="text-xs text-slate-500 wark:text-slate-400 truncate max-w-48">
                                      {chatbot.description || "No description"}
                                    </p>
                                    <div className="text-xs text-slate-500 wark:text-slate-400">
                                      Chatbot #{index + 1} • Priority: {chatbot.priority}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={cn("text-xs bg-white wark:bg-slate-800", getModelColor(chatbot.aiModel))}>
                                    {getModelIcon(chatbot.aiModel)}
                                    <span className="ml-1">{getModelDisplayName(chatbot.aiModel)}</span>
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1 max-w-48">
                                    {chatbot.triggers.slice(0, 2).map((trigger, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs bg-slate-100 wark:bg-slate-800 text-slate-700 wark:text-slate-300 border border-slate-200 wark:border-slate-700"
                                      >
                                        {trigger}
                                      </Badge>
                                    ))}
                                    {chatbot.triggers.length > 2 && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs bg-slate-100 wark:bg-slate-800 text-slate-700 wark:text-slate-300 border border-slate-200 wark:border-slate-700"
                                      >
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
                                          ? "bg-green-100 text-green-700 border-green-200 wark:bg-green-900/30 wark:text-green-300"
                                          : "bg-slate-100 text-slate-600 border-slate-200 wark:bg-slate-800 wark:text-slate-400"
                                      )}
                                    >
                                      {chatbot.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="p-2 bg-purple-50 wark:bg-purple-900/20 rounded-lg border border-purple-200 wark:border-purple-700">
                                    <div className="font-medium text-purple-900 wark:text-purple-100 text-sm">
                                      {chatbot.usageCount || 0}
                                    </div>
                                    <div className="text-purple-600 wark:text-purple-400 text-xs">
                                      {(chatbot.totalTokensUsed || 0).toLocaleString()} tokens
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="p-2 bg-green-50 wark:bg-green-900/20 rounded-lg border border-green-200 wark:border-green-700">
                                    <p className="font-medium text-green-900 wark:text-green-100 text-sm">
                                      ₹{(chatbot.totalCostINR || 0).toFixed(4)}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {chatbot.lastTriggered ? (
                                    <div className="p-2 bg-amber-50 wark:bg-amber-900/20 rounded-lg border border-amber-200 wark:border-amber-700">
                                      <div className="font-medium text-amber-900 wark:text-amber-100 text-sm">
                                        {format(new Date(chatbot.lastTriggered), "MMM dd, yyyy")}
                                      </div>
                                      <div className="text-amber-600 wark:text-amber-400 text-xs">
                                        {format(new Date(chatbot.lastTriggered), "HH:mm")}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 wark:text-slate-500 italic text-sm">Never used</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end items-center gap-1">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleToggleStatus(chatbot)}
                                          className={cn(
                                            "h-8 w-8 p-0",
                                            chatbot.isActive
                                              ? "hover:bg-amber-100 wark:hover:bg-amber-900/30"
                                              : "hover:bg-green-100 wark:hover:bg-green-900/30"
                                          )}
                                        >
                                          {chatbot.isActive ? (
                                            <Pause className="h-3.5 w-3.5 text-amber-600 wark:text-amber-400" />
                                          ) : (
                                            <Play className="h-3.5 w-3.5 text-green-600 wark:text-green-400" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {chatbot.isActive ? 'Deactivate chatbot' : 'Activate chatbot'}
                                      </TooltipContent>
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
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedChatbot(chatbot);
                                            setIsViewDialogOpen(true);
                                          }}
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
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

            {/* No Results */}
            {!isLoading && chatbots.length > 0 && filteredChatbots.length === 0 && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 wark:to-slate-900/10">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-100 wark:bg-slate-800 rounded-full w-fit mx-auto">
                      <Search className="h-8 w-8 text-slate-600 wark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 wark:text-white">No chatbots found</h3>
                      <p className="text-slate-600 wark:text-slate-300">Try adjusting your search or filters</p>
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
              <DialogContent className="h-fit w-full max-w-4xl max-h-screen overflow-y-scroll flex flex-col p-0">
                {selectedChatbot && (
                  <>
                    <DialogHeader className="px-6 py-4 border-b border-slate-200 wark:border-slate-700 flex-shrink-0 bg-white wark:bg-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                          <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <DialogTitle className="text-xl font-semibold text-slate-900 wark:text-white">
                            {selectedChatbot.name}
                          </DialogTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={selectedChatbot.isActive ? "default" : "secondary"}
                              className={cn(
                                selectedChatbot.isActive
                                  ? "bg-green-100 text-green-700 border-green-200 wark:bg-green-900/30 wark:text-green-300"
                                  : "bg-slate-100 text-slate-600 border-slate-200 wark:bg-slate-800 wark:text-slate-400"
                              )}
                            >
                              {selectedChatbot.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline" className={cn("text-xs", getModelColor(selectedChatbot.aiModel))}>
                              {getModelIcon(selectedChatbot.aiModel)}
                              <span className="ml-1">{getModelDisplayName(selectedChatbot.aiModel)}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </DialogHeader>

                    {/* Add Tabs here */}
                    <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                      <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="knowledge-base">Knowledge Base</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                      </TabsList>

                      <div className="flex-1 overflow-y-auto px-6 py-6">
                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6 mt-0">
                          {/* Description */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-slate-900 wark:text-white flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                              Description
                            </h4>
                            <p className="text-slate-700 wark:text-slate-300 bg-slate-50 wark:bg-slate-800/50 p-3 rounded-lg">
                              {selectedChatbot.description || "No description provided"}
                            </p>
                          </div>

                          {/* System Prompt */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-slate-900 wark:text-white flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                              System Prompt
                            </h4>
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 wark:from-purple-900/20 wark:to-purple-800/10 p-4 rounded-lg border border-purple-200 wark:border-purple-700">
                              <p className="text-sm text-purple-900 wark:text-purple-100 whitespace-pre-wrap">
                                {selectedChatbot.systemPrompt}
                              </p>
                            </div>
                          </div>

                          {/* Triggers */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-slate-900 wark:text-white flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              Trigger Keywords
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedChatbot.triggers.map((trigger, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-green-100 text-green-700 border-green-200 wark:bg-green-900/30 wark:text-green-300"
                                >
                                  {trigger}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Knowledge Base Section */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-slate-900 wark:text-white flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                              Knowledge Base
                            </h4>
                            {selectedChatbot.knowledgeBase?.enabled ? (
                              <div className="bg-indigo-50/50 wark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 wark:border-indigo-700">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-indigo-700 wark:text-indigo-300 font-medium">Documents</p>
                                    <p className="text-indigo-900 wark:text-indigo-100">
                                      {selectedChatbot.knowledgeBase.documents?.length || 0}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-indigo-700 wark:text-indigo-300 font-medium">Total Chunks</p>
                                    <p className="text-indigo-900 wark:text-indigo-100">
                                      {selectedChatbot.knowledgeBase.documents?.reduce((sum: number, doc: any) => sum + (doc.chunks || 0), 0) || 0}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-indigo-700 wark:text-indigo-300 font-medium">Search Mode</p>
                                    <p className="text-indigo-900 wark:text-indigo-100 capitalize">
                                      {selectedChatbot.knowledgeBase.settings?.searchMode?.replace('_', ' ') || 'Semantic'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-indigo-700 wark:text-indigo-300 font-medium">Max Results</p>
                                    <p className="text-indigo-900 wark:text-indigo-100">
                                      {selectedChatbot.knowledgeBase.settings?.maxRelevantChunks || 3}
                                    </p>
                                  </div>
                                </div>

                                {selectedChatbot.knowledgeBase.documents && selectedChatbot.knowledgeBase.documents.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-indigo-200 wark:border-indigo-700">
                                    <p className="text-xs text-indigo-600 wark:text-indigo-400 font-medium mb-2">Recent Documents:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {selectedChatbot.knowledgeBase.documents.slice(0, 3).map((doc: any, index: number) => (
                                        <Badge key={index} variant="outline" className="text-xs bg-indigo-100 wark:bg-indigo-800 text-indigo-700 wark:text-indigo-300 border-indigo-300 wark:border-indigo-600">
                                          {doc.originalName}
                                        </Badge>
                                      ))}
                                      {selectedChatbot.knowledgeBase.documents.length > 3 && (
                                        <Badge variant="outline" className="text-xs bg-indigo-100 wark:bg-indigo-800 text-indigo-700 wark:text-indigo-300 border-indigo-300 wark:border-indigo-600">
                                          +{selectedChatbot.knowledgeBase.documents.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-slate-50 wark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 wark:border-slate-700">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                                  <p className="text-slate-600 wark:text-slate-400 text-sm">Knowledge base is disabled</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Configuration */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-slate-900 wark:text-white flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                AI Configuration
                              </h4>
                              <div className="space-y-3 bg-orange-50/50 wark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 wark:border-orange-700">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-orange-700 wark:text-orange-300">Temperature:</span>
                                  <span className="text-sm text-orange-900 wark:text-orange-100">{selectedChatbot.temperature}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-orange-700 wark:text-orange-300">Max Tokens:</span>
                                  <span className="text-sm text-orange-900 wark:text-orange-100">{selectedChatbot.maxTokens}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-orange-700 wark:text-orange-300">Match Type:</span>
                                  <span className="text-sm text-orange-900 wark:text-orange-100 capitalize">{selectedChatbot.matchType.replace('_', ' ')}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="font-semibold text-slate-900 wark:text-white flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                Usage Statistics
                              </h4>
                              <div className="space-y-3 bg-indigo-50/50 wark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 wark:border-indigo-700">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-indigo-700 wark:text-indigo-300">Total Interactions:</span>
                                  <span className="text-sm text-indigo-900 wark:text-indigo-100">{selectedChatbot.usageCount || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-indigo-700 wark:text-indigo-300">Tokens Used:</span>
                                  <span className="text-sm text-indigo-900 wark:text-indigo-100">{(selectedChatbot.totalTokensUsed || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-indigo-700 wark:text-indigo-300">Total Cost:</span>
                                  <span className="text-sm text-indigo-900 wark:text-indigo-100">₹{(selectedChatbot.totalCostINR || 0).toFixed(4)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-indigo-700 wark:text-indigo-300">Priority:</span>
                                  <span className="text-sm text-indigo-900 wark:text-indigo-100">{selectedChatbot.priority}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          {selectedChatbot.tags && selectedChatbot.tags.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-slate-900 wark:text-white flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                                Tags
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedChatbot.tags.map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-pink-50 wark:bg-pink-900/20 text-pink-700 wark:text-pink-300 border-pink-200 wark:border-pink-700"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Timestamps */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 wark:border-slate-700">
                            <div>
                              <p className="text-sm font-medium text-slate-700 wark:text-slate-300">Created</p>
                              <p className="text-sm text-slate-600 wark:text-slate-400">
                                {format(new Date(selectedChatbot.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700 wark:text-slate-300">Last Updated</p>
                              <p className="text-sm text-slate-600 wark:text-slate-400">
                                {format(new Date(selectedChatbot.updatedAt), "MMM dd, yyyy 'at' HH:mm")}
                              </p>
                            </div>
                          </div>
                        </TabsContent>

                        {/* Analytics Tab */}
                        <TabsContent value="analytics" className="space-y-6 mt-0">
                          <div className="text-center py-12">
                            <div className="space-y-4">
                              <div className="mx-auto w-16 h-16 bg-slate-100 wark:bg-slate-800 rounded-full flex items-center justify-center">
                                <BarChart3 className="h-8 w-8 text-slate-400 wark:text-slate-500" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 wark:text-white">Analytics Coming Soon</h3>
                                <p className="text-slate-600 wark:text-slate-400">
                                  Detailed analytics and performance metrics will be available here
                                </p>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        {/* Knowledge Base Tab */}
                        <TabsContent value="knowledge-base" className="space-y-6 mt-0">
                          <KnowledgeBaseManager
                            chatbotId={selectedChatbot._id}
                            knowledgeBase={selectedChatbot.knowledgeBase || {
                              enabled: false,
                              documents: [],
                              settings: {
                                maxDocuments: 10,
                                maxFileSize: 10,
                                allowedFileTypes: ['pdf', 'txt', 'doc', 'docx', 'csv', 'json', 'md'],
                                chunkSize: 1000,
                                chunkOverlap: 200,
                                searchMode: 'semantic',
                                maxRelevantChunks: 3
                              }
                            }}
                            onUpdate={(updatedKnowledgeBase) => {
                              // Update the local chatbots state
                              setChatbots(prev => prev.map(bot =>
                                bot._id === selectedChatbot._id
                                  ? { ...bot, knowledgeBase: updatedKnowledgeBase }
                                  : bot
                              ));

                              // Update selected chatbot state
                              setSelectedChatbot(prev => prev ? { ...prev, knowledgeBase: updatedKnowledgeBase } : null);
                            }}
                          />
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings" className="space-y-6 mt-0">
                          <div className="text-center py-12">
                            <div className="space-y-4">
                              <div className="mx-auto w-16 h-16 bg-slate-100 wark:bg-slate-800 rounded-full flex items-center justify-center">
                                <Settings className="h-8 w-8 text-slate-400 wark:text-slate-500" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 wark:text-white">Settings</h3>
                                <p className="text-slate-600 wark:text-slate-400">
                                  Chatbot configuration settings will be available here
                                </p>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>

                    <div className="px-6 py-4 border-t border-slate-200 wark:border-slate-700 flex-shrink-0 bg-slate-50/50 wark:bg-slate-800/50">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setIsViewDialogOpen(false)}
                          className="hover:bg-white wark:hover:bg-slate-800"
                        >
                          Close
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/automations/chatbots/${selectedChatbot._id}/test`)}
                            className="gap-2 hover:bg-white wark:hover:bg-slate-800"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Test Chatbot
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
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 wark:bg-slate-800 border border-slate-200 wark:border-slate-700">
                      <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 wark:from-red-900/20 wark:to-red-800/10 rounded-lg">
                        <Bot className="h-5 w-5 text-red-600 wark:text-red-400" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 wark:text-white">{selectedChatbot.name}</div>
                        <div className="text-sm text-slate-600 wark:text-slate-400">
                          {selectedChatbot.triggers.length} trigger{selectedChatbot.triggers.length !== 1 ? 's' : ''}
                          {selectedChatbot.usageCount > 0 && ` • ${selectedChatbot.usageCount} interactions`}
                        </div>
                      </div>
                    </div>

                    {selectedChatbot.isActive && (
                      <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 wark:bg-amber-900/20 border border-amber-200 wark:border-amber-700">
                        <AlertCircle className="h-5 w-5 text-amber-600 wark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800 wark:text-amber-200">Warning: This chatbot is currently active</p>
                          <p className="text-sm text-amber-700 wark:text-amber-300 mt-1">
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
