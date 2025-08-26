"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  ExternalLink, 
  TrendingUp, 
  Users, 
  Target, 
  Calendar,
  Settings,
  RefreshCw,
  Loader2,
  AlertCircle,
  Search,
  Phone,
  Mail,
  MessageCircle,
  Plus,
  Filter,
  BarChart3,
  Activity,
  CheckCircle,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Crown,
  Zap,
  Shield,
  Globe,
  Clock,
  TrendingDown,
  Eye,
  Database,
  PieChart
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import CreateLeadModal from '@/components/crm-integration/CreateLeadModal';
import { FaWhatsapp } from 'react-icons/fa';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function CrmIntegrationDashboard() {
  const [selectedWabaId, setSelectedWabaId] = useState('');
  const [wabaAccounts, setWabaAccounts] = useState<any[]>([]);
  const [integration, setIntegration] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [stats, setStats] = useState<any>({
    totalLeads: 0,
    recentLeads: [],
    pipelines: [],
    totalContacts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWabas, setIsLoadingWabas] = useState(true);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingPipelines, setIsLoadingPipelines] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWabaAccounts();
  }, []);

  useEffect(() => {
    if (selectedWabaId) {
      fetchDashboardData();
      fetchContacts();
    }
  }, [selectedWabaId]);

  useEffect(() => {
    // Filter contacts based on search term
    if (searchTerm.trim()) {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchTerm, contacts]);

  const fetchWabaAccounts = async () => {
    try {
      const response = await fetch('/api/waba-accounts');
      const data = await response.json();
      
      if (data.success && data.accounts && data.accounts.length > 0) {
        setWabaAccounts(data.accounts);
        if (data.accounts.length === 1) {
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
    } finally {
      setIsLoadingWabas(false);
    }
  };

  const fetchContacts = async () => {
    if (!selectedWabaId) return;
    
    try {
      setIsLoadingContacts(true);
      const response = await fetch(`/api/contacts?wabaId=${selectedWabaId}`);
      const data = await response.json();
      
      if (data.success && data.contacts) {
        setContacts(data.contacts);
        setStats(prev => ({ ...prev, totalContacts: data.contacts.length }));
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive"
      });
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!selectedWabaId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch integration status
      const integrationResponse = await fetch(`/api/crm-integration?wabaId=${selectedWabaId}`);
      const integrationData = await integrationResponse.json();
      
      if (integrationData.success && integrationData.integration) {
        setIntegration(integrationData.integration);
        
        // Fetch pipelines if integration is active
        if (integrationData.integration.isActive) {
          setIsLoadingPipelines(true);
          try {
            const pipelinesResponse = await fetch(`/api/crm-integration/pipelines?wabaId=${selectedWabaId}`);
            const pipelinesData = await pipelinesResponse.json();
            
            if (pipelinesData.success) {
              setStats(prev => ({ ...prev, pipelines: pipelinesData.pipelines }));
            }
          } catch (pipelineError) {
            console.error('Error fetching pipelines:', pipelineError);
          } finally {
            setIsLoadingPipelines(false);
          }
        }
      } else {
        setIntegration(null);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    if (!selectedWabaId) {
      toast({
        title: "No Account Selected",
        description: "Please select a WhatsApp account first",
        variant: "destructive"
      });
      return;
    }
    
    await Promise.all([fetchDashboardData(), fetchContacts()]);
    toast({
      title: "Refreshed",
      description: "Data has been refreshed"
    });
  };

  const handleWabaChange = (wabaId: string) => {
    setSelectedWabaId(wabaId);
    setIntegration(null);
    setContacts([]);
    setFilteredContacts([]);
    setStats({ totalLeads: 0, recentLeads: [], pipelines: [], totalContacts: 0 });
  };

  const handleCreateLead = (contact: any) => {
    if (!integration || !integration.isActive) {
      toast({
        title: "Integration Required",
        description: "Please set up CRM integration first",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedContact(contact);
    setIsLeadModalOpen(true);
  };

  const onLeadCreated = () => {
    toast({
      title: "Lead Created",
      description: "Contact has been successfully converted to a lead",
    });
    // Refresh data to update stats
    fetchDashboardData();
  };

  if (isLoadingWabas) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
          <div className="max-w- mx-auto p-6">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Database className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2 mt-6">
                <h3 className="text-lg font-semibold text-slate-900">Loading CRM Dashboard</h3>
                <p className="text-sm text-muted-foreground">Checking your WhatsApp accounts...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (wabaAccounts.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
          <div className="max-w-4xl mx-auto p-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-500/10 to-amber-600/20 rounded-2xl flex items-center justify-center mx-auto">
                      <AlertCircle className="h-12 w-12 text-amber-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-slate-900">WhatsApp Business Account Required</h3>
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                      You need to set up a WhatsApp Business Account before using CRM integration features.
                    </p>
                  </div>

                  <Button
                    onClick={() => window.location.href = '/waba-setup'}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    <Settings className="h-5 w-5" />
                    Set Up WhatsApp Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (wabaAccounts.length > 1 && !selectedWabaId) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
          <div className="max-w-2xl mx-auto p-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <FaWhatsapp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">Select WhatsApp Business Account</CardTitle>
                    <CardDescription className="text-slate-600">
                      Choose which WhatsApp Business Account to manage CRM integration for
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="waba-select" className="text-sm font-medium text-slate-700">WhatsApp Business Account</Label>
                  <Select value={selectedWabaId} onValueChange={handleWabaChange}>
                    <SelectTrigger className="bg-white border-slate-200 h-12">
                      <SelectValue placeholder="Select WhatsApp account" />
                    </SelectTrigger>
                    <SelectContent>
                      {wabaAccounts.map((waba) => (
                        <SelectItem key={waba.wabaId} value={waba.wabaId}>
                          <div className="flex items-center gap-3 py-2">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <FaWhatsapp className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {waba.businessName || waba.name || waba.wabaId}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {waba.phoneNumber}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Database className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2 mt-6">
                <h3 className="text-lg font-semibold text-slate-900">Loading Integration Data</h3>
                <p className="text-sm text-muted-foreground">Setting up your CRM dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!integration || !integration.isActive) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
          <div className="max-w-4xl mx-auto p-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-500/10 to-red-600/20 rounded-2xl flex items-center justify-center mx-auto">
                      <AlertCircle className="h-12 w-12 text-red-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-slate-900">CRM Integration Not Active</h3>
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Please set up your CRM integration for the selected WhatsApp account to access lead management features.
                    </p>
                  </div>

                  {wabaAccounts.length > 1 && (
                    <div className="bg-muted/50 p-4 rounded-lg border border-slate-200 max-w-md mx-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Current Account:</span>
                        <span className="text-sm text-slate-600">
                          {wabaAccounts.find(w => w.wabaId === selectedWabaId)?.businessName || 
                           wabaAccounts.find(w => w.wabaId === selectedWabaId)?.name || 
                           selectedWabaId}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <Button
                      onClick={() => window.location.href = '/crm-integration/setup'}
                      className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      <Zap className="h-5 w-5" />
                      Set Up Integration
                    </Button>
                    {wabaAccounts.length > 1 && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedWabaId('')}
                        size="lg"
                        className="gap-2"
                      >
                        <RefreshCw className="h-5 w-5" />
                        Change Account
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const selectedWabaAccount = wabaAccounts.find(w => w.wabaId === selectedWabaId);

  return (
    <Layout>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
          <div className="max-w- mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2  rounded-xl">
                    <img src='/logoonly.png' className='h-8'/>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      CRM Lead Management
                    </h1>
                    <p className="text-muted-foreground font-medium">
                      Convert your WhatsApp contacts into qualified leads
                    </p>
                    {selectedWabaAccount && (
                      <p className="text-sm text-slate-500 mt-1">
                        Connected to: {selectedWabaAccount.businessName || selectedWabaAccount.name || selectedWabaId}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {wabaAccounts.length > 1 && (
                  <Select value={selectedWabaId} onValueChange={handleWabaChange}>
                    <SelectTrigger className="w-48 bg-white border-slate-200">
                      <SelectValue placeholder="Switch account" />
                    </SelectTrigger>
                    <SelectContent>
                      {wabaAccounts.map((waba) => (
                        <SelectItem key={waba.wabaId} value={waba.wabaId}>
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                              <FaWhatsapp className="h-3 w-3 text-green-600" />
                            </div>
                            <span>{waba.businessName || waba.name || waba.wabaId}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <Button
                  variant="outline"
                  onClick={refreshData}
                  disabled={!selectedWabaId}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.open('https://crm.zapllo.com', '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open CRM
                </Button>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-sm font-medium text-slate-600">Integration Status</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-slate-900 group-hover:text-green-900 transition-colors duration-300">
                          Connected
                        </p>
                        <p className="text-xs text-slate-500">
                          Last sync: {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 group-hover:scale-110 transition-all duration-300">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <p className="text-sm font-medium text-slate-600">WhatsApp Contacts</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors duration-300">
                          {isLoadingContacts ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            stats.totalContacts.toLocaleString()
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          Ready to convert to leads
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
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
                        <p className="text-sm font-medium text-slate-600">Available Pipelines</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-slate-900 group-hover:text-purple-900 transition-colors duration-300">
                          {isLoadingPipelines ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            stats.pipelines?.length || 0
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          CRM pipelines available
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300">
                        <Target className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* <Card className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <p className="text-sm font-medium text-slate-600">Leads Created</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-slate-900 group-hover:text-amber-900 transition-colors duration-300">
                          {stats.totalLeads.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          This month
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:scale-110 transition-all duration-300">
                        <TrendingUp className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="contacts" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="grid gap-4 w grid-cols-4 bg-white/80 backdrop-blur-sm border h-full p-2 border-slate-200">
                  <TabsTrigger value="contacts" className="gap-2">
                    <Users className="h-4 w-4" />
                    Contacts
                  </TabsTrigger>
                  <TabsTrigger value="pipelines" className="gap-2">
                    <Target className="h-4 w-4" />
                    Pipelines
                  </TabsTrigger>
                  <TabsTrigger value="recent-leads" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Recent Leads
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="contacts" className="space-y-6">
                <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900">WhatsApp Contacts</CardTitle>
                      <CardDescription className="text-slate-600">
                        Convert your WhatsApp contacts into CRM leads with advanced pipeline management
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search contacts..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64 bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                        />
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchContacts}
                            className="gap-2"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Refresh contacts list</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingContacts ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center space-y-2 mt-6">
                        <h3 className="text-lg font-semibold text-slate-900">Loading Contacts</h3>
                        <p className="text-sm text-muted-foreground">Fetching your WhatsApp contacts...</p>
                      </div>
                    </div>
                  ) : filteredContacts.length > 0 ? (
                    <div className="space-y-4">
                      {filteredContacts.map((contact) => (
                        <Card key={contact._id} className="group border-0 shadow-sm bg-white/60 backdrop-blur-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-semibold">
                                    {contact.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-lg text-slate-900 group-hover:text-primary transition-colors">
                                      {contact.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                      {contact.tags?.length > 0 && (
                                        <div className="flex gap-1">
                                          {contact.tags.slice(0, 2).map((tag: string, index: number) => (
                                            <Badge key={index} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                              {tag}
                                            </Badge>
                                          ))}
                                          {contact.tags.length > 2 && (
                                            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                                              +{contact.tags.length - 2}
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                      <Badge variant={contact.isActive ? "default" : "secondary"} className={
                                        contact.isActive 
                                          ? "bg-green-100 text-green-700 border-green-200" 
                                          : "bg-slate-100 text-slate-600 border-slate-200"
                                      }>
                                        {contact.isActive ? "Active" : "Inactive"}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-6 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4" />
                                      <span>{contact.phone}</span>
                                    </div>
                                    {contact.email && (
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <span>{contact.email}</span>
                                      </div>
                                    )}
                                    {contact.lastMessageAt && (
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>Last message: {new Date(contact.lastMessageAt).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {contact.notes && (
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mt-3">
                                      <p className="text-sm text-slate-700">
                                        {contact.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 ml-6">
                            
                                
                                <Button 
                                  size="sm"
                                  onClick={() => handleCreateLead(contact)}
                                  disabled={!integration?.isActive}
                                  className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                  <Plus className="h-4 w-4" />
                                  <span className="hidden sm:inline">Create Lead</span>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto">
                          <Users className="h-12 w-12 text-blue-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                          <Search className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      
                      <div className="space-y-3 mt-6">
                        <h3 className="text-xl font-semibold text-slate-900">
                          {searchTerm ? 'No matching contacts found' : 'No contacts available'}
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                          {searchTerm 
                            ? 'Try adjusting your search terms to find the contacts you\'re looking for.' 
                            : 'Start conversations on WhatsApp to see contacts here that can be converted to leads.'
                          }
                        </p>
                      </div>
                      
                      {searchTerm && (
                        <Button
                          variant="outline"
                          onClick={() => setSearchTerm('')}
                          className="mt-4 gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Clear Search
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pipelines" className="space-y-6">
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900">Available Pipelines</CardTitle>
                      <CardDescription className="text-slate-600">
                        These pipelines are available for creating leads from your WhatsApp contacts
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://crm.zapllo.com/pipelines', '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Manage in CRM
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingPipelines ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Target className="w-6 h-6 text-primary animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center space-y-2 mt-6">
                        <h3 className="text-lg font-semibold text-slate-900">Loading Pipelines</h3>
                        <p className="text-sm text-muted-foreground">Fetching pipeline data from CRM...</p>
                      </div>
                    </div>
                  ) : stats.pipelines?.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {stats.pipelines.map((pipeline: any) => (
                        <Card key={pipeline.id} className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/50 hover:shadow-md transition-all duration-200">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg text-slate-900">{pipeline.name}</h3>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {(pipeline.openStages?.length || 0) + (pipeline.closeStages?.length || 0)} stages
                                </Badge>
                              </div>
                              
                              <Separator />
                              
                              {pipeline.openStages && pipeline.openStages.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Open Stages
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    {pipeline.openStages.map((stage: any, index: number) => (
                                      <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                                        <div 
                                          className="w-3 h-3 rounded-full flex-shrink-0" 
                                          style={{ backgroundColor: stage.color }}
                                        />
                                        <span className="text-sm font-medium truncate">{stage.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {pipeline.closeStages && pipeline.closeStages.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Close Stages
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    {pipeline.closeStages.map((stage: any, index: number) => (
                                      <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                                        <div 
                                          className="w-3 h-3 rounded-full flex-shrink-0" 
                                          style={{ backgroundColor: stage.color }}
                                        />
                                        <div className="flex items-center gap-1 flex-1">
                                          <span className="text-sm font-medium truncate">{stage.name}</span>
                                          {stage.won && <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">Won</Badge>}
                                          {stage.lost && <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">Lost</Badge>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto">
                          <Target className="h-12 w-12 text-purple-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                          <Plus className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      
                      <div className="space-y-3 mt-6">
                        <h3 className="text-xl font-semibold text-slate-900">No Pipelines Available</h3>
                        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                          Create pipelines in your CRM to start converting contacts to leads with organized sales processes.
                        </p>
                      </div>
                      
                      <Button 
                        onClick={() => window.open('https://crm.zapllo.com/pipelines', '_blank')}
                        className="mt-6 gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                      >
                        <ExternalLink className="h-5 w-5" />
                        Create Pipeline in CRM
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recent-leads" className="space-y-6">
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900">Recent Leads</CardTitle>
                      <CardDescription className="text-slate-600">
                        Leads recently created from Zaptick WhatsApp contacts
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://crm.zapllo.com/leads', '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View All in CRM
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-amber-500/10 to-amber-600/20 rounded-2xl flex items-center justify-center mx-auto">
                        <Calendar className="h-12 w-12 text-amber-600" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-3 mt-6">
                      <h3 className="text-xl font-semibold text-slate-900">No Recent Leads</h3>
                      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Start creating leads from your WhatsApp contacts to see them here. Your conversion history will appear in this section.
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://crm.zapllo.com/leads', '_blank')}
                      className="mt-6 gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View All Leads in CRM
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-900">Integration Settings</CardTitle>
                  <CardDescription className="text-slate-600">
                    Manage your CRM integration configuration and connection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-green-900">CRM Connection</h4>
                            <p className="text-sm text-green-700">Connected to Zapllo CRM</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                          Active
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaWhatsapp className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">WhatsApp Account</h4>
                            <p className="text-sm text-blue-700">
                              {selectedWabaAccount?.businessName || selectedWabaAccount?.name || selectedWabaId}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                          Linked
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Sync Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Last Sync:</span>
                            <span className="font-medium">
                              {integration.lastSyncAt 
                                ? new Date(integration.lastSyncAt).toLocaleString()
                                : 'Never'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total Contacts:</span>
                            <span className="font-medium">{stats.totalContacts.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Available Pipelines:</span>
                            <span className="font-medium">{stats.pipelines?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Management Actions
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={refreshData}
                        className="justify-start gap-2 h-auto py-4 hover:bg-blue-50"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">Refresh Data</div>
                          <div className="text-xs text-muted-foreground">Sync latest information</div>
                        </div>
                      </Button>

                      {/* <Button
                        variant="outline"
                        onClick={() => window.location.href = '/crm-integration/setup'}
                        className="justify-start gap-2 h-auto py-4 hover:bg-amber-50"
                      >
                        <Settings className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">Reconfigure</div>
                          <div className="text-xs text-muted-foreground">Update integration settings</div>
                        </div>
                      </Button> */}

                      <Button
                        variant="outline"
                        onClick={() => window.open('https://crm.zapllo.com', '_blank')}
                        className="justify-start gap-2 h-auto py-4 hover:bg-green-50"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">Open CRM</div>
                          <div className="text-xs text-muted-foreground">Access full CRM features</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Create Lead Modal */}
          <CreateLeadModal
            open={isLeadModalOpen}
            onOpenChange={setIsLeadModalOpen}
            contact={selectedContact}
            wabaId={selectedWabaId}
            onLeadCreated={onLeadCreated}
          />
        </div>
      </div>
    </TooltipProvider>
  </Layout>
);
}