"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
  AlertCircle
} from 'lucide-react';
import Layout from '@/components/layout/Layout';

export default function CrmIntegrationDashboard() {
  const [selectedWabaId, setSelectedWabaId] = useState('');
  const [wabaAccounts, setWabaAccounts] = useState<any[]>([]);
  const [integration, setIntegration] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    totalLeads: 0,
    recentLeads: [],
    pipelines: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWabas, setIsLoadingWabas] = useState(true);
  const [isLoadingPipelines, setIsLoadingPipelines] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWabaAccounts();
  }, []);

  useEffect(() => {
    if (selectedWabaId) {
      fetchDashboardData();
    }
  }, [selectedWabaId]);

  const fetchWabaAccounts = async () => {
    try {
      const response = await fetch('/api/waba-accounts');
      const data = await response.json();
      
      console.log('WABA accounts response:', data); // Debug log
      
      if (data.success && data.accounts && data.accounts.length > 0) {
        setWabaAccounts(data.accounts);
        // Auto-select the first account if only one exists
        if (data.accounts.length === 1) {
          setSelectedWabaId(data.accounts[0].wabaId);
        }
      } else {
        console.log('No WABA accounts found'); // Debug log
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

  const fetchDashboardData = async () => {
    if (!selectedWabaId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch integration status
      const integrationResponse = await fetch(`/api/crm-integration?wabaId=${selectedWabaId}`);
      const integrationData = await integrationResponse.json();
      
      console.log('Integration data:', integrationData); // Debug log
      
      if (integrationData.success && integrationData.integration) {
        setIntegration(integrationData.integration);
        
        // Fetch pipelines if integration is active
        if (integrationData.integration.isActive) {
          setIsLoadingPipelines(true);
          try {
            const pipelinesResponse = await fetch(`/api/crm-integration/pipelines?wabaId=${selectedWabaId}`);
            const pipelinesData = await pipelinesResponse.json();
            
            console.log('Pipelines data:', pipelinesData); // Debug log
            
            if (pipelinesData.success) {
              setStats(prev => ({ ...prev, pipelines: pipelinesData.pipelines }));
            }
          } catch (pipelineError) {
            console.error('Error fetching pipelines:', pipelineError);
            toast({
              title: "Warning",
              description: "Failed to load pipelines from CRM",
              variant: "destructive"
            });
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

  const refreshIntegration = async () => {
    if (!selectedWabaId) {
      toast({
        title: "No Account Selected",
        description: "Please select a WhatsApp account first",
        variant: "destructive"
      });
      return;
    }
    
    await fetchDashboardData();
    toast({
      title: "Refreshed",
      description: "Integration data has been refreshed"
    });
  };

  const handleWabaChange = (wabaId: string) => {
    setSelectedWabaId(wabaId);
    setIntegration(null);
    setStats({ totalLeads: 0, recentLeads: [], pipelines: [] });
  };

  if (isLoadingWabas) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading WhatsApp accounts...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // If no WABA accounts, show setup message
  if (wabaAccounts.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business Account Required</CardTitle>
              <CardDescription>
                You need to set up a WhatsApp Business Account before using CRM integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No WhatsApp Accounts Found</h3>
                <p className="text-muted-foreground mb-6">
                  Please set up your WhatsApp Business Account integration first.
                </p>
                <Button onClick={() => window.location.href = '/waba-setup'}>
                  Set Up WhatsApp Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Show WABA selection if multiple accounts and none selected
  if (wabaAccounts.length > 1 && !selectedWabaId) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Select WhatsApp Business Account</CardTitle>
              <CardDescription>
                Choose which WhatsApp Business Account to manage CRM integration for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="waba-select">WhatsApp Business Account</Label>
                <Select value={selectedWabaId} onValueChange={handleWabaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select WhatsApp account" />
                  </SelectTrigger>
                  <SelectContent>
                    {wabaAccounts.map((waba) => (
                      <SelectItem key={waba.wabaId} value={waba.wabaId}>
                        {waba.businessName || waba.name || waba.wabaId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading integration data...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!integration || !integration.isActive) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>CRM Integration Not Active</CardTitle>
              <CardDescription>
                Please set up your CRM integration for the selected WhatsApp account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {wabaAccounts.length > 1 && (
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Account:</span>
                    <span className="text-sm">
                      {wabaAccounts.find(w => w.wabaId === selectedWabaId)?.businessName || 
                       wabaAccounts.find(w => w.wabaId === selectedWabaId)?.name || 
                       selectedWabaId}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => window.location.href = '/crm-integration/setup'}>
                  Set Up Integration
                </Button>
                {wabaAccounts.length > 1 && (
                  <Button variant="outline" onClick={() => setSelectedWabaId('')}>
                    Change Account
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const selectedWabaAccount = wabaAccounts.find(w => w.wabaId === selectedWabaId);

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CRM Integration</h1>
            <p className="text-muted-foreground">
              Manage your Zapllo CRM integration and convert WhatsApp contacts to leads
            </p>
            {selectedWabaAccount && (
              <p className="text-sm text-muted-foreground mt-1">
                Account: {selectedWabaAccount.businessName || selectedWabaAccount.name || selectedWabaId}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {wabaAccounts.length > 1 && (
              <Select value={selectedWabaId} onValueChange={handleWabaChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Switch account" />
                </SelectTrigger>
                <SelectContent>
                  {wabaAccounts.map((waba) => (
                    <SelectItem key={waba.wabaId} value={waba.wabaId}>
                      {waba.businessName || waba.name || waba.wabaId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" onClick={refreshIntegration} disabled={!selectedWabaId}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://crm.zapllo.com', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open CRM
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Integration Status</CardTitle>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                Active
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Connected</div>
              <p className="text-xs text-muted-foreground">
                Last sync: {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString() : 'Never'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Pipelines</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingPipelines ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats.pipelines?.length || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready for lead creation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                WhatsApp contacts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Created</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pipelines" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
            <TabsTrigger value="recent-leads">Recent Leads</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="pipelines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Pipelines</CardTitle>
                <CardDescription>
                  These pipelines are available for creating leads from your WhatsApp contacts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPipelines ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Loading pipelines from CRM...</span>
                  </div>
                ) : stats.pipelines?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.pipelines.map((pipeline: any) => (
                      <div key={pipeline.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">{pipeline.name}</h3>
                          <Badge variant="outline">
                            {(pipeline.openStages?.length || 0) + (pipeline.closeStages?.length || 0)} stages
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {pipeline.openStages && pipeline.openStages.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Open Stages</h4>
                              <div className="flex gap-2 flex-wrap">
                                {pipeline.openStages.map((stage: any, index: number) => (
                                  <div key={index} className="flex items-center gap-1">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: stage.color }}
                                    />
                                    <span className="text-sm">{stage.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {pipeline.closeStages && pipeline.closeStages.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Close Stages</h4>
                              <div className="flex gap-2 flex-wrap">
                                {pipeline.closeStages.map((stage: any, index: number) => (
                                  <div key={index} className="flex items-center gap-1">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: stage.color }}
                                    />
                                    <span className="text-sm">{stage.name}</span>
                                    {stage.won && <Badge variant="outline" className="text-xs bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">Won</Badge>}
                                    {stage.lost && <Badge variant="outline" className="text-xs bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">Lost</Badge>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Pipelines Available</h3>
                    <p className="text-muted-foreground mb-4">
                      Create pipelines in your CRM to start converting contacts to leads
                    </p>
                    <Button 
                      onClick={() => window.open('https://crm.zapllo.com/pipelines', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Create Pipeline in CRM
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent-leads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>
                  Leads recently created from Zaptick contacts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Recent Leads</h3>
                  <p className="text-muted-foreground">
                    Start creating leads from your WhatsApp contacts to see them here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>
                  Manage your CRM integration configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">API Connection</h4>
                    <p className="text-sm text-muted-foreground">
                      Connected to Zapllo CRM
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                    Active
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">WhatsApp Account</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedWabaAccount?.businessName || selectedWabaAccount?.name || selectedWabaId}
                    </p>
                  </div>
                  <Badge variant="outline">Connected</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-sync</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync data with CRM
                    </p>
                  </div>
                  <Badge variant="outline">Enabled</Badge>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" onClick={() => window.location.href = '/crm-integration/setup'}>
                    <Settings className="h-4 w-4 mr-2" />
                    Reconfigure Integration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Debug section - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Debug Info</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              <div>Selected WABA: {selectedWabaId || 'None'}</div>
              <div>WABA Accounts: {wabaAccounts.length}</div>
              <div>Integration Active: {integration?.isActive?.toString() || 'false'}</div>
              <div>Pipelines Count: {stats.pipelines?.length || 0}</div>
              <div>Loading Pipelines: {isLoadingPipelines.toString()}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}