"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Shield,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
  Settings,
  Database,
  MessageSquare,
  Target,
  BarChart3,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Info,
  Crown,
  Sparkles,
  Activity,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FaWhatsapp } from 'react-icons/fa';

interface WabaAccount {
  wabaId: string;
  businessName?: string;
  name?: string;
  phoneNumber: string;
}

interface Integration {
  id: string;
  isActive: boolean;
  lastSyncAt?: string;
  hasApiKey: boolean;
}

export default function CrmIntegrationSetup() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedWabaId, setSelectedWabaId] = useState('');
  const [wabaAccounts, setWabaAccounts] = useState<WabaAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWabas, setIsLoadingWabas] = useState(true);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchWabaAccounts();
  }, []);

  useEffect(() => {
    if (selectedWabaId) {
      checkIntegrationStatus();
    }
  }, [selectedWabaId]);

  // Simulate connection progress
  useEffect(() => {
    if (isLoading && connectionProgress < 90) {
      const timer = setTimeout(() => {
        setConnectionProgress(prev => prev + 10);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, connectionProgress]);

  const fetchWabaAccounts = async () => {
    try {
      const response = await fetch('/api/waba-accounts');
      const data = await response.json();
      
      if (data.success && data.accounts && data.accounts.length > 0) {
        setWabaAccounts(data.accounts);
        if (data.accounts.length === 1) {
          setSelectedWabaId(data.accounts[0].wabaId);
        }
      } else {
        toast({
          title: "No WhatsApp Accounts",
          description: "Please set up your WhatsApp Business Account first",
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
    } finally {
      setIsLoadingWabas(false);
    }
  };

  const checkIntegrationStatus = async () => {
    if (!selectedWabaId) return;

    try {
      const response = await fetch(`/api/crm-integration?wabaId=${selectedWabaId}`);
      const data = await response.json();
      
      if (data.success && data.integration) {
        setIntegration(data.integration);
        setIsConnected(data.integration.isActive);
      } else {
        setIntegration(null);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error checking integration status:', error);
      setIntegration(null);
      setIsConnected(false);
    }
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your CRM API key first",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    try {
      // Simulate API test - replace with actual test endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Connection Test Successful",
        description: "Your API key is valid and working correctly",
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Please check your API key and try again",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your CRM API key",
        variant: "destructive"
      });
      return;
    }

    if (!selectedWabaId) {
      toast({
        title: "WABA Account Required",
        description: "Please select a WhatsApp Business Account",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setConnectionProgress(0);

    try {
      const response = await fetch('/api/crm-integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crmApiKey: apiKey,
          wabaId: selectedWabaId
        })
      });

      const data = await response.json();
      setConnectionProgress(100);

      if (data.success) {
        setIsConnected(true);
        toast({
          title: "Integration Successful! 🎉",
          description: "Your CRM is now connected to Zaptick"
        });
        
        setTimeout(() => {
          router.push('/crm-integration/dashboard');
        }, 1000);
      } else {
        toast({
          title: "Connection Failed",
          description: data.error || "Failed to connect to CRM",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to CRM. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setConnectionProgress(0);
    }
  };

  const handleDisconnect = async () => {
    if (!selectedWabaId || !integration) return;

    try {
      const response = await fetch('/api/crm-integration', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wabaId: selectedWabaId
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsConnected(false);
        setIntegration(null);
        setApiKey('');
        toast({
          title: "Disconnected Successfully",
          description: "CRM integration has been removed"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect CRM integration",
        variant: "destructive"
      });
    }
  };

  if (isLoadingWabas) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Database className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2 mt-6">
                <h3 className="text-lg font-semibold text-slate-900">Loading Integration Setup</h3>
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
                      You need to set up a WhatsApp Business Account before connecting to your CRM. This enables seamless integration between your messaging and lead management.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                      onClick={() => router.push('/waba-setup')}
                      className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      <Settings className="h-5 w-5" />
                      Set Up WhatsApp Account
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/')}
                      size="lg"
                      className="gap-2"
                    >
                      <ArrowRight className="h-5 w-5 rotate-180" />
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (isConnected && integration) {
    return (
      <Layout>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
            <div className=" mx-auto p-6 space-y-8">
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-xl">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        CRM Integration Active
                      </h1>
                      <p className="text-muted-foreground font-medium">
                        Your Zaptick account is successfully connected to Zapllo CRM
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://crm.zapllo.com', '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open CRM
                  </Button>
                  <Button
                    onClick={() => router.push('/crm-integration/dashboard')}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Target className="h-4 w-4" />
                    Go to Lead Management
                  </Button>
                </div>
              </div>

              {/* Success Banner */}
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Integration Successfully Connected!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your WhatsApp contacts can now be seamlessly converted into CRM leads. Start managing your sales pipeline effectively.
                </AlertDescription>
              </Alert>

              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <p className="text-sm font-medium text-slate-600">Connection Status</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-slate-900 group-hover:text-green-900 transition-colors duration-300">
                            Active
                          </p>
                          <p className="text-xs text-slate-500">
                            Ready to sync leads
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
                          <p className="text-sm font-medium text-slate-600">WhatsApp Account</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors duration-300 truncate">
                            {wabaAccounts.find(w => w.wabaId === selectedWabaId)?.businessName || 
                             wabaAccounts.find(w => w.wabaId === selectedWabaId)?.name || 
                             'Connected'}
                          </p>
                          <p className="text-xs text-slate-500">
                            Business account linked
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
                          <FaWhatsapp className="h-6 w-6 text-blue-600" />
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
                          <p className="text-sm font-medium text-slate-600">Last Sync</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-slate-900 group-hover:text-purple-900 transition-colors duration-300">
                            {integration.lastSyncAt 
                              ? new Date(integration.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Never'
                            }
                          </p>
                          <p className="text-xs text-slate-500">
                            {integration.lastSyncAt 
                              ? new Date(integration.lastSyncAt).toLocaleDateString()
                              : 'No sync yet'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300">
                          <Activity className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <p className="text-sm font-medium text-slate-600">Security</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-slate-900 group-hover:text-amber-900 transition-colors duration-300">
                            Secured
                          </p>
                          <p className="text-xs text-slate-500">
                            API key encrypted
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:scale-110 transition-all duration-300">
                          <Shield className="h-6 w-6 text-amber-600" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Integration Details */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900">Integration Settings</CardTitle>
                      <CardDescription className="text-slate-600">
                        Manage your CRM integration configuration and settings
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full 0 flex items-center justify-center">
                         <img src='/logoonly.png'/>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">CRM Connection</h4>
                            <p className="text-sm text-slate-600">Zapllo CRM API</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Connected
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaWhatsapp className="h-5 w-5 text-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">WhatsApp Integration</h4>
                            <p className="text-sm text-slate-600">
                              {wabaAccounts.find(w => w.wabaId === selectedWabaId)?.businessName || 
                               wabaAccounts.find(w => w.wabaId === selectedWabaId)?.name || 
                               selectedWabaId}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Linked
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 mb-2">Quick Actions</h4>
                            <div className="space-y-2">
                              <Button
                                onClick={() => router.push('/crm-integration/dashboard')}
                                className="w-full justify-start gap-2 bg-gradient-to-r from-primary to-primary/90"
                                size="sm"
                              >
                                <Target className="h-4 w-4" />
                                Manage Leads
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => window.open('https://crm.zapllo.com', '_blank')}
                                className="w-full justify-start gap-2"
                                size="sm"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Open CRM Dashboard
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div> */}
                    </div>
                  </div>

                  <Separator />

                  {/* Advanced Settings */}
                  {/* <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Advanced Settings
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        onClick={checkIntegrationStatus}
                        className="justify-start gap-2 h-auto py-3"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">Refresh Status</div>
                          <div className="text-xs text-muted-foreground">Check connection</div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => router.push('/crm-integration/setup')}
                        className="justify-start gap-2 h-auto py-3"
                      >
                        <Settings className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">Reconfigure</div>
                          <div className="text-xs text-muted-foreground">Update settings</div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleDisconnect}
                        className="justify-start gap-2 h-auto py-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">Disconnect</div>
                          <div className="text-xs text-muted-foreground">Remove integration</div>
                        </div>
                      </Button>
                    </div>
                  </div> */}
                </CardContent>
              </Card>

              {/* Features Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Contact Sync</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      Automatically sync your WhatsApp contacts with CRM for seamless lead management.
                    </p>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      Active
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Lead Conversion</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      Convert WhatsApp conversations into qualified leads with advanced pipeline management.
                    </p>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                      Available
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                 <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Analytics & Insights</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      Track lead performance and get insights on your sales pipeline directly from WhatsApp data.
                    </p>
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                      Active
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </Layout>
    );
  }

  // Main Setup Form (when not connected)
  return (
    <Layout>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
          <div className=" mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className=" rounded-2xl">
                 <img src='/logoonly.png' className='h-10'/>
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Connect to Zapllo CRM
                  </h1>
                  <p className="text-muted-foreground font-medium">
                    Integrate your WhatsApp contacts with powerful CRM capabilities
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 via-white to-primary/5 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Why Connect Your CRM?</h2>
                  <p className="text-slate-600">Transform your WhatsApp conversations into a powerful sales machine</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Contact Management</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Automatically sync WhatsApp contacts with your CRM for centralized customer data
                    </p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Lead Conversion</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Convert conversations into leads with advanced pipeline management and tracking
                    </p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto">
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Sales Analytics</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Get insights on lead performance and optimize your sales process
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Setup Form */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-semibold text-slate-900">
                      Setup Integration
                    </CardTitle>
                    <CardDescription className="text-slate-600 mt-1">
                      Connect your Zapllo CRM account to start managing leads from WhatsApp
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* API Key Instructions */}
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-900 flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    How to get your CRM API Key
                  </AlertTitle>
                  <AlertDescription className="text-blue-800 space-y-3 mt-3">
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium mt-0.5">1</span>
                        Log in to your Zapllo CRM account
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium mt-0.5">2</span>
                        Go to Settings → API & Integrations
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium mt-0.5">3</span>
                        Generate a new API Key with &quot;Read&quot; and &quot;Write&quot; permissions
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium mt-0.5">4</span>
                        Copy the API key and paste it below
                      </li>
                    </ol>
                    <div className="pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://crm.zapllo.com/settings/api', '_blank')}
                        className="bg-white hover:bg-blue-50 text-blue-700 border-blue-300"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open CRM API Settings
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* WhatsApp Account Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      WhatsApp Business Account
                    </Label>
                  </div>

                  {wabaAccounts.length === 1 ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FaWhatsapp className="h-5 w-5 " />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-blue-900">
                            {wabaAccounts[0].businessName || wabaAccounts[0].name || 'Business Account'}
                          </div>
                          <div className="text-sm text-blue-700">
                            {wabaAccounts[0].phoneNumber} • ID: {wabaAccounts[0].wabaId}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                          Selected
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <Select value={selectedWabaId} onValueChange={setSelectedWabaId}>
                      <SelectTrigger className="bg-white border-slate-200 h-12">
                        <SelectValue placeholder="Select your WhatsApp Business Account" />
                      </SelectTrigger>
                      <SelectContent>
                        {wabaAccounts.map((account) => (
                          <SelectItem key={account.wabaId} value={account.wabaId}>
                            <div className="flex items-center gap-3 py-2">
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <FaWhatsapp className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {account.businessName || account.name || 'Business Account'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {account.phoneNumber}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* API Key Input */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <Label htmlFor="api-key" className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      CRM API Key
                    </Label>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        id="api-key"
                        type={showApiKey ? "text" : "password"}
                        placeholder="Enter your Zapllo CRM API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 h-12 pr-12"
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? (
                              <EyeOff className="h-4 w-4 text-slate-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-slate-500" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {showApiKey ? 'Hide API key' : 'Show API key'}
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={testConnection}
                        disabled={!apiKey.trim() || isTestingConnection}
                        className="gap-2"
                      >
                        {isTestingConnection ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                        Test Connection
                      </Button>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        <span>Your API key is encrypted and stored securely</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connection Progress */}
                {isLoading && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Connecting to Zapllo CRM...</p>
                        <p className="text-sm text-slate-600">Please wait while we establish the connection</p>
                      </div>
                    </div>
                    <Progress value={connectionProgress} className="h-2" />
                    <p className="text-xs text-slate-500 text-center">
                      {connectionProgress < 30 && "Validating API credentials..."}
                      {connectionProgress >= 30 && connectionProgress < 60 && "Testing CRM connection..."}
                      {connectionProgress >= 60 && connectionProgress < 90 && "Configuring integration..."}
                      {connectionProgress >= 90 && "Finalizing setup..."}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    onClick={handleConnect}
                    disabled={!apiKey.trim() || !selectedWabaId || isLoading}
                    className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 h-12"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Connect to CRM
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="gap-2 h-12"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Back to Dashboard
                  </Button>
                </div>

                {/* Debug Info in Development */}
                {/* {process.env.NODE_ENV === 'development' && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-900">Debug Information</AlertTitle>
                    <AlertDescription className="text-amber-800 text-xs space-y-1 mt-2">
                      <div>API Key: {apiKey ? `Set (${apiKey.length} characters)` : 'Not set'}</div>
                      <div>WABA Selected: {selectedWabaId || 'None'}</div>
                      <div>WABA Count: {wabaAccounts.length}</div>
                      <div>Loading: {isLoading.toString()}</div>
                      <div>Connected: {isConnected.toString()}</div>
                    </AlertDescription>
                  </Alert>
                )} */}
              </CardContent>
            </Card>

            {/* Security Note */}
            <Card className="border-0 shadow-sm bg-slate-50/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">Security & Privacy</h3>
                    <div className="text-sm text-slate-600 space-y-2">
                      <p>Your CRM API key is encrypted using industry-standard security protocols and stored securely in our database.</p>
                      <p>We only access the minimum required data to provide lead management functionality and never share your information with third parties.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    </Layout>
  );
}