"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';

export default function CrmIntegrationSetup() {
  const [apiKey, setApiKey] = useState('');
  const [selectedWabaId, setSelectedWabaId] = useState('');
  const [wabaAccounts, setWabaAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWabas, setIsLoadingWabas] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [integration, setIntegration] = useState<any>(null);
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

  const fetchWabaAccounts = async () => {
    try {
      // Replace with your actual API to get user's WABA accounts
      const response = await fetch('/api/user/waba-accounts');
      const data = await response.json();
      
      if (data.success) {
        setWabaAccounts(data.wabaAccounts || []);
        if (data.wabaAccounts?.length === 1) {
          setSelectedWabaId(data.wabaAccounts[0].wabaId);
        }
      }
    } catch (error) {
      console.error('Error fetching WABA accounts:', error);
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

      if (data.success) {
        setIsConnected(true);
        toast({
          title: "Integration Successful",
          description: "Your CRM is now connected to Zaptick"
        });
        router.push('/crm-integration/dashboard');
      } else {
        toast({
          title: "Connection Failed",
          description: data.error || "Failed to connect to CRM",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to CRM. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingWabas) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading your WhatsApp accounts...</span>
        </div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
       <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle>CRM Integration Active</CardTitle>
            </div>
            <CardDescription>
              Your Zaptick account is successfully connected to Zapllo CRM
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>WhatsApp Account</span>
              <span className="text-sm text-muted-foreground">
                {wabaAccounts.find(w => w.wabaId === selectedWabaId)?.businessName || selectedWabaId}
              </span>
            </div>
            {integration?.lastSyncAt && (
              <div className="flex items-center justify-between">
                <span>Last Sync</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(integration.lastSyncAt).toLocaleString()}
                </span>
              </div>
            )}
            <div className="pt-4">
              <Button onClick={() => router.push('/crm-integration/dashboard')} className="w-full">
                Go to Lead Management
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Layout>
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Connect to Zapllo CRM</CardTitle>
          <CardDescription>
            Integrate your Zaptick WhatsApp contacts with Zapllo CRM to convert conversations into leads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">How to get your CRM API Key</h3>
                <ol className="mt-2 text-sm text-blue-800 space-y-1">
                  <li>1. Log in to your Zapllo CRM account</li>
                  <li>2. Go to Settings → API & Integrations</li>
                  <li>3. Generate a new API Key with &quot;Read&quot; and &quot;Write&quot; permissions</li>
                  <li>4. Copy the API key and paste it below</li>
                </ol>
                <Button 
                  variant="link" 
                  className="h-auto p-0 mt-2 text-blue-700"
                  onClick={() => window.open('https://crm.zapllo.com/settings/api', '_blank')}
                >
                  Open CRM API Settings
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* WABA Selection */}
          {wabaAccounts.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="waba-select">WhatsApp Business Account</Label>
              <Select value={selectedWabaId} onValueChange={setSelectedWabaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select WhatsApp account" />
                </SelectTrigger>
                <SelectContent>
                  {wabaAccounts.map((waba) => (
                    <SelectItem key={waba.wabaId} value={waba.wabaId}>
                      {waba.businessName || waba.wabaId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="api-key">CRM API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your Zapllo CRM API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleConnect} 
            disabled={isLoading || !apiKey.trim() || !selectedWabaId}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect to CRM'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
    </Layout>
  );
}