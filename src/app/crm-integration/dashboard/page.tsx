"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  ExternalLink, 
  TrendingUp, 
  Users, 
  Target, 
  Calendar,
  Settings,
  RefreshCw
} from 'lucide-react';

export default function CrmIntegrationDashboard() {
  const [integration, setIntegration] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    totalLeads: 0,
    recentLeads: [],
    pipelines: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // You'll need to get the current WABA ID from your context/state
  const wabaId = "your-current-waba-id"; // Replace with actual wabaId

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch integration status
      const integrationResponse = await fetch(`/api/crm-integration?wabaId=${wabaId}`);
      const integrationData = await integrationResponse.json();
      
      if (integrationData.success && integrationData.integration) {
        setIntegration(integrationData.integration);
        
        // Fetch pipelines if integration is active
        if (integrationData.integration.isActive) {
          const pipelinesResponse = await fetch(`/api/crm-integration/pipelines?wabaId=${wabaId}`);
          const pipelinesData = await pipelinesResponse.json();
          
          if (pipelinesData.success) {
            setStats(prev => ({ ...prev, pipelines: pipelinesData.pipelines }));
          }
        }
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
    await fetchDashboardData();
    toast({
      title: "Refreshed",
      description: "Integration data has been refreshed"
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!integration || !integration.isActive) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>CRM Integration Not Active</CardTitle>
            <CardDescription>
              Please set up your CRM integration to start creating leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/crm-integration/setup'}>
              Set Up Integration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Integration</h1>
          <p className="text-muted-foreground">
            Manage your Zapllo CRM integration and convert WhatsApp contacts to leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshIntegration}>
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
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
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
            <div className="text-2xl font-bold">{stats.pipelines?.length || 0}</div>
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
              {stats.pipelines?.length > 0 ? (
                <div className="space-y-4">
                  {stats.pipelines.map((pipeline: any) => (
                    <div key={pipeline.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{pipeline.name}</h3>
                        <Badge variant="outline">
                          {pipeline.openStages?.length + pipeline.closeStages?.length} stages
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Open Stages</h4>
                          <div className="flex gap-2 flex-wrap">
                            {pipeline.openStages?.map((stage: any, index: number) => (
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
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Close Stages</h4>
                          <div className="flex gap-2 flex-wrap">
                            {pipeline.closeStages?.map((stage: any, index: number) => (
                              <div key={index} className="flex items-center gap-1">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: stage.color }}
                                />
                                <span className="text-sm">{stage.name}</span>
                                {stage.won && <Badge variant="outline" className="text-xs bg-green-50 text-green-600">Won</Badge>}
                                {stage.lost && <Badge variant="outline" className="text-xs bg-red-50 text-red-600">Lost</Badge>}
                              </div>
                            ))}
                          </div>
                        </div>
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
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
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
                <Button variant="outline" onClick={() => window.location.href = '/crm-integration'}>
                  <Settings className="h-4 w-4 mr-2" />
                  Reconfigure Integration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}