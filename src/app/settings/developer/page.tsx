'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Webhook,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Bell,
  ShoppingCart,
  CreditCard,
  Users,
  Activity,
  BookOpen,
  Key,
  FileText,
  Zap,
  Clock,
  CheckCircle,
  Mail,
  Code,
  Database,
  Play,
  ArrowRight,
  Check,
  AlertCircle,
  Info,
  Star,
  TrendingUp,
  Shield,
  Sparkles,
  Lightbulb,
  Target,
  Globe
} from 'lucide-react';
import { generateSecretKey } from '@/lib/webhookUtils';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { FaWhatsapp } from 'react-icons/fa';

interface WebhookConfig {
  _id?: string;
  webhookUrl: string;
  secretKey: string;
  isActive: boolean;
  events: {
    // Account Alerts & Events
    accountAlerts: boolean;
    accountUpdate: boolean;
    accountReviewUpdate: boolean;
    businessCapabilityUpdate: boolean;
    phoneNumberQualityUpdate: boolean;

    // Template Alerts & Events
    templatePerformanceMetrics: boolean;
    templateStatusUpdate: boolean;
    messages: boolean;

    // Template Messages Sent via API
    messagesSent: boolean;
    messagesDelivered: boolean;
    messagesRead: boolean;
    messagesFailed: boolean;
    messagesButtonClick: boolean;
    messagesCompletedFlow: boolean;

    // Template Messages sent via Zaptick Campaigns
    campaignsSent: boolean;
    campaignsDelivered: boolean;
    campaignsRead: boolean;
    campaignsFailed: boolean;
    campaignsCompletedFlow: boolean;

    // WhatsApp Carts & Orders
    cartsAndOrders: boolean;

    // Payment Confirmations
    paymentConfirmations: boolean;
    paymentFailures: boolean;

    // Others
    customerMessages: boolean;
    workflowResponses: boolean;
  };
  totalEvents?: number;
  lastTriggered?: string;
}

interface WABAAccount {
  wabaId: string;
  businessName: string;
  phoneNumberId: string;
  phoneNumber: string;
}

const eventCategories = [
  {
    id: 'account',
    title: 'Account Alerts & Events',
    icon: Bell,
    description: 'Get notified about account status changes and business updates',
    events: [
      { key: 'accountAlerts', label: 'Account alerts', description: 'Critical account notifications and warnings' },
      { key: 'accountUpdate', label: 'Account update', description: 'Changes to account settings and configuration' },
      { key: 'accountReviewUpdate', label: 'Account review update', description: 'Business verification status updates' },
      { key: 'businessCapabilityUpdate', label: 'Business capability update', description: 'New features and capability changes' },
      { key: 'phoneNumberQualityUpdate', label: 'Phone number quality update', description: 'Phone number health and quality metrics' },
    ]
  },
  {
    id: 'template',
    title: 'Template Alerts & Events',
    icon: Activity,
    description: 'Monitor template performance and approval status',
    events: [
      { key: 'templatePerformanceMetrics', label: 'Template performance metrics', description: 'Template usage statistics and performance data' },
      { key: 'templateStatusUpdate', label: 'Message template status update', description: 'Template approval and rejection notifications' },
      { key: 'messages', label: 'Messages', description: 'General message-related events and updates' },
    ]
  },
  {
    id: 'api',
    title: 'Template Messages Sent via API',
    icon: FaWhatsapp,
    description: 'Real-time status updates for API-sent messages',
    popular: true,
    events: [
      { key: 'messagesSent', label: "'Sent' status", default: true, description: 'Message successfully sent to WhatsApp' },
      { key: 'messagesDelivered', label: "'Delivered' status", default: true, description: 'Message delivered to recipient device' },
      { key: 'messagesRead', label: "'Read' status", default: true, description: 'Message read by recipient' },
      { key: 'messagesFailed', label: "'Failed' status", default: true, description: 'Message delivery failed with error details' },
      { key: 'messagesButtonClick', label: "'Button Click' status (CTA & Quick Reply Buttons)", default: true, description: 'User clicked on message buttons' },
      { key: 'messagesCompletedFlow', label: "'Completed Flow' status", description: 'User completed the message flow' },
    ]
  },
  {
    id: 'campaigns',
    title: 'Template Messages sent via Zaptick Campaigns',
    icon: Users,
    description: 'Track campaign performance and engagement',
    popular: true,
    events: [
      { key: 'campaignsSent', label: "'Sent' status", default: true, description: 'Campaign message sent successfully' },
      { key: 'campaignsDelivered', label: "'Delivered' status", default: true, description: 'Campaign message delivered' },
      { key: 'campaignsRead', label: "'Read' status", default: true, description: 'Campaign message read by recipient' },
      { key: 'campaignsFailed', label: "'Failed' status", default: true, description: 'Campaign message failed to deliver' },
      { key: 'campaignsCompletedFlow', label: "'Completed Flow' status", description: 'Campaign flow completed by user' },
    ]
  },

  {
    id: 'others',
    title: 'Customer Interactions',
    icon: MessageSquare,
    description: 'Customer-initiated events and responses',
    events: [
      { key: 'customerMessages', label: 'Message received from customers',  description: 'Incoming messages from customers' },
      { key: 'workflowResponses', label: 'Responses received from customers in workflows', description: 'Customer responses in automated workflows' },
    ]
  }
];

const integrationGuides = [
  {
    name: 'Zapier',
    description: 'Connect with 5000+ apps and automate your workflows',
    icon: Zap,
    color: 'orange',
    steps: [
      'Create new Zap in Zapier',
      'Choose "Webhooks by Zapier" as trigger',
      'Select "Catch Hook" and copy webhook URL',
      'Paste URL in Zaptick webhook configuration',
      'Test the connection and configure actions'
    ],
    useCase: 'Automatically create tickets in your CRM when customers send messages'
  },
  {
    name: 'Pabbly Connect',
    description: 'Powerful workflow automation without monthly limits',
    icon: Settings,
    color: 'blue',
    steps: [
      'Create new workflow in Pabbly Connect',
      'Select "Webhook" as trigger application',
      'Choose "Webhook Received" trigger event',
      'Copy the generated webhook URL',
      'Configure webhook in Zaptick with copied URL'
    ],
    useCase: 'Update Google Sheets with message delivery status in real-time'
  },
  {
    name: 'Custom Integration',
    description: 'Build your own integration using our webhook API',
    icon: Code,
    color: 'green',
    steps: [
      'Create webhook endpoint in your application',
      'Implement signature verification for security',
      'Handle different event types in your code',
      'Configure webhook URL in Zaptick',
      'Test and deploy your integration'
    ],
    useCase: 'Integrate directly with your existing systems and databases'
  }
];

const webhookExamples = [
  {
    title: 'Customer Support Automation',
    description: 'Automatically create support tickets when customers send messages',
    events: ['customerMessages', 'messagesFailed'],
    workflow: 'Customer Message → Filter Keywords → Create Zendesk Ticket → Notify Team',
    benefit: 'Reduce response time by 80%'
  },
  {
    title: 'Marketing Analytics',
    description: 'Track campaign performance and update your analytics dashboard',
    events: ['campaignsSent', 'campaignsDelivered', 'campaignsRead'],
    workflow: 'Campaign Event → Update Analytics → Send Slack Report → Optimize Campaign',
    benefit: 'Real-time campaign insights'
  },
  {
    title: 'E-commerce Integration',
    description: 'Sync order status and inventory across platforms',
    events: ['cartsAndOrders', 'paymentConfirmations'],
    workflow: 'Order Event → Update Inventory → Send Confirmation → Create Invoice',
    benefit: 'Automated order processing'
  },
  {
    title: 'Lead Management',
    description: 'Capture and nurture leads automatically',
    events: ['customerMessages', 'messagesButtonClick'],
    workflow: 'Customer Message → Extract Info → Add to CRM → Trigger Email Sequence',
    benefit: 'Never miss a lead'
  }
];

export default function DeveloperPage() {
  const [wabaAccounts, setWabaAccounts] = useState<WABAAccount[]>([]);
  const [selectedWabaId, setSelectedWabaId] = useState<string>('');
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    webhookUrl: '',
    secretKey: '',
    isActive: true,
    events: {
      accountAlerts: false,
      accountUpdate: false,
      accountReviewUpdate: false,
      businessCapabilityUpdate: false,
      phoneNumberQualityUpdate: false,
      templatePerformanceMetrics: false,
      templateStatusUpdate: false,
      messages: false,
      messagesSent: true,
      messagesDelivered: true,
      messagesRead: true,
      messagesFailed: true,
      messagesButtonClick: true,
      messagesCompletedFlow: false,
      campaignsSent: true,
      campaignsDelivered: true,
      campaignsRead: true,
      campaignsFailed: true,
      campaignsCompletedFlow: false,
      cartsAndOrders: false,
      paymentConfirmations: false,
      paymentFailures: false,
      customerMessages: false,
      workflowResponses: false,
    }
  });

  const [activeTab, setActiveTab] = useState('webhooks');
  const [loading, setLoading] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['api', 'campaigns']);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [setupStep, setSetupStep] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchWabaAccounts();
  }, []);

  useEffect(() => {
    if (selectedWabaId) {
      fetchWebhookConfig();
    }
  }, [selectedWabaId]);

  const fetchWabaAccounts = async () => {
    try {
      const response = await fetch('/api/waba-accounts');
      if (response.ok) {
        const data = await response.json();
        setWabaAccounts(data.accounts || []);
        if (data.accounts?.length > 0) {
          setSelectedWabaId(data.accounts[0].wabaId);
        }
      }
    } catch (error) {
      console.error('Error fetching WABA accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load WABA accounts",
        variant: "destructive",
      });
    }
  };

  const fetchWebhookConfig = async () => {
    if (!selectedWabaId) return;

    try {
      const response = await fetch(`/api/webhook-config?wabaId=${selectedWabaId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setWebhookConfig(data.config);
        }
      }
    } catch (error) {
      console.error('Error fetching webhook config:', error);
    }
  };

  const generateNewSecretKey = () => {
    const newKey = generateSecretKey();
    setWebhookConfig(prev => ({
      ...prev,
      secretKey: newKey
    }));
    toast({
      title: "Success",
      description: "New secret key generated",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const updateEventConfig = (eventKey: string, checked: boolean) => {
    setWebhookConfig(prev => ({
      ...prev,
      events: {
        ...prev.events,
        [eventKey]: checked
      }
    }));
  };

  const saveWebhookConfig = async () => {
    if (!selectedWabaId) {
      toast({
        title: "Error",
        description: "Please select a WABA account",
        variant: "destructive",
      });
      return;
    }

    if (!webhookConfig.webhookUrl) {
      toast({
        title: "Error",
        description: "Webhook URL is required",
        variant: "destructive",
      });
      return;
    }

    if (!webhookConfig.secretKey) {
      toast({
        title: "Error",
        description: "Secret key is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/webhook-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wabaId: selectedWabaId,
          ...webhookConfig
        })
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Webhook configuration saved successfully",
        });
        setIsConfigDialogOpen(false);
        fetchWebhookConfig();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || 'Failed to save webhook configuration',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving webhook config:', error);
      toast({
        title: "Error",
        description: "Failed to save webhook configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async (eventType: string) => {
    if (!selectedWabaId) {
      toast({
        title: "Error",
        description: "Please select a WABA account",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/webhook-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wabaId: selectedWabaId,
          eventType
        })
      });

      if (response.ok) {
        toast({
          title: "Test Sent!",
          description: `Test webhook sent for ${eventType}. Check your endpoint for the payload.`,
        });
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || 'Failed to send test webhook',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending test webhook:', error);
      toast({
        title: "Error",
        description: "Failed to send test webhook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = wabaAccounts.find(acc => acc.wabaId === selectedWabaId);
  const activeEventsCount = Object.values(webhookConfig.events).filter(Boolean).length;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className=" mx-auto p-6 ">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                Developer Portal
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                Build Powerful WhatsApp Integrations
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Connect Zaptick with your favorite tools using webhooks. Get real-time notifications, 
                automate workflows, and build custom integrations with ease.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Webhook className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{webhookConfig._id ? '1' : '0'}</p>
                    <p className="text-sm text-slate-600">Active Webhooks</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{activeEventsCount}</p>
                    <p className="text-sm text-slate-600">Event Types</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{webhookConfig.totalEvents || 0}</p>
                    <p className="text-sm text-slate-600">Events Sent</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">5000+</p>
                    <p className="text-sm text-slate-600">Integrations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-slate-200 bg-white rounded-t-2xl">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('setup')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'setup'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>Quick Setup</span>
                    {!webhookConfig._id && (
                      <Badge variant="outline" className="ml-1 bg-orange-50 text-orange-600 border-orange-200">
                        Start Here
                      </Badge>
                    )}
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('webhooks')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'webhooks'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Webhook className="h-4 w-4" />
                    <span>Webhooks</span>
                    {webhookConfig._id && (
                      <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">
                        Active
                      </Badge>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('integrations')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'integrations'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Integrations</span>
                    <Badge variant="outline" className="ml-1 text-xs bg-purple-50 text-purple-600 border-purple-200">
                      Popular
                    </Badge>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('examples')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'examples'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>Examples</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('documentation')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'documentation'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Documentation</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border border-slate-200 border-t-0">
            {activeTab === 'setup' && (
              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Get Started in 3 Easy Steps</h2>
                    <p className="text-lg text-slate-600">Set up your first webhook integration in under 5 minutes</p>
                  </div>

                  {/* Setup Steps */}
                  <div className="space-y-8">
                    {/* Step 1: Choose Integration */}
                    <div className="relative">
                      <div className="flex items-center mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold mr-4">
                          1
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">Choose Your Integration Platform</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ml-14">
                        {integrationGuides.map((integration) => {
                          const Icon = integration.icon;
                          const isSelected = selectedIntegration === integration.name.toLowerCase();
                          
                          return (
                            <div
                              key={integration.name}
                              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 shadow-md'
                                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                              }`}
                              onClick={() => {
                                setSelectedIntegration(integration.name.toLowerCase());
                                setSetupStep(1);
                              }}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`h-10 w-10 rounded-lg bg-${integration.color}-100 flex items-center justify-center`}>
                                  <Icon className={`h-5 w-5 text-${integration.color}-600`} />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-slate-900">{integration.name}</h4>
                                  {integration.name === 'Zapier' && (
                                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-xs">
                                      Most Popular
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 mb-4">{integration.description}</p>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {integration.steps.length} Steps
                                </Badge>
                                {isSelected && <Check className="h-5 w-5 text-blue-600" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: Setup Instructions */}
                    {selectedIntegration && (
                      <div className="relative">
                        <div className="flex items-center mb-6">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold mr-4">
                            2
                          </div>
                          <h3 className="text-xl font-semibold text-slate-900">
                            Follow {selectedIntegration.charAt(0).toUpperCase() + selectedIntegration.slice(1)} Setup Instructions
                          </h3>
                        </div>

                        <div className="ml-14">
                          <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                              {integrationGuides
                                .find(g => g.name.toLowerCase() === selectedIntegration)
                                ?.steps.map((step, index) => (
                                <div key={index} className="flex items-start gap-4 mb-4 last:mb-0">
                                 <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-medium text-sm flex-shrink-0 mt-0.5">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-slate-700">{step}</p>
                                  </div>
                                </div>
                              ))}
                              
                              <Separator className="my-6" />
                              
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <h4 className="font-semibold text-blue-900 mb-1">Use Case Example</h4>
                                    <p className="text-blue-700 text-sm">
                                      {integrationGuides.find(g => g.name.toLowerCase() === selectedIntegration)?.useCase}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Configure Webhook */}
                    {selectedIntegration && (
                      <div className="relative">
                        <div className="flex items-center mb-6">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold mr-4">
                            3
                          </div>
                          <h3 className="text-xl font-semibold text-slate-900">Configure Your Webhook in Zaptick</h3>
                        </div>

                        <div className="ml-14">
                          <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                              <div className="space-y-6">
                                {/* WABA Selection */}
                                <div>
                                  <Label className="text-base font-medium text-slate-900 mb-3 block">
                                    Select WhatsApp Business Account
                                  </Label>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {wabaAccounts.map((account) => (
                                      <div
                                        key={account.wabaId}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                          selectedWabaId === account.wabaId
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                        onClick={() => setSelectedWabaId(account.wabaId)}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <FaWhatsapp className="h-4 w-4 text-green-600" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-slate-900 truncate">{account.businessName}</h4>
                                            <p className="text-sm text-slate-600 truncate">{account.phoneNumber}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Quick Configuration */}
                                {selectedAccount && (
                                  <div className="space-y-4">
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                      <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="font-medium text-green-900">Ready to Configure</span>
                                      </div>
                                      <p className="text-green-700 text-sm">
                                        Account selected: <strong>{selectedAccount.businessName}</strong>
                                      </p>
                                    </div>

                                    <Button 
                                      onClick={() => setIsConfigDialogOpen(true)}
                                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-12"
                                    >
                                      <Settings className="h-5 w-5 mr-2" />
                                      Configure Webhook Now
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-12 bg-slate-50 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium text-slate-900">Setup Progress</span>
                      <span className="text-sm text-slate-600">
                        {!selectedIntegration ? '0' : selectedAccount && webhookConfig._id ? '3' : selectedAccount ? '2' : '1'}/3 Complete
                      </span>
                    </div>
                    <Progress 
                      value={!selectedIntegration ? 0 : selectedAccount && webhookConfig._id ? 100 : selectedAccount ? 66 : 33} 
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'webhooks' && (
              <div className="p-8">
                <div className="space-y-8">
                  {/* WABA Account Selection */}
                  <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-white">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center">
                          <FaWhatsapp className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-slate-900">WhatsApp Business Account</CardTitle>
                          <CardDescription className="text-slate-600">
                            Select the account for webhook configuration
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {wabaAccounts.map((account) => (
                          <div
                            key={account.wabaId}
                            className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                              selectedWabaId === account.wabaId
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                            }`}
                            onClick={() => setSelectedWabaId(account.wabaId)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <FaWhatsapp className="h-6 w-6 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 truncate">{account.businessName}</h3>
                                <p className="text-sm text-slate-600 truncate">{account.phoneNumber}</p>
                              </div>
                              {selectedWabaId === account.wabaId && (
                                <Badge className="bg-blue-600 hover:bg-blue-700">
                                  Selected
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Webhook Configuration */}
                  {selectedAccount && (
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center">
                              <Webhook className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-slate-900">Webhook Configuration</CardTitle>
                              <CardDescription className="text-slate-600">
                                Real-time events for {selectedAccount.businessName}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {webhookConfig._id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => testWebhook('customer.message')}
                                disabled={loading}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Test
                              </Button>
                            )}
                            <Button onClick={() => setIsConfigDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                              <Settings className="h-4 w-4 mr-2" />
                              {webhookConfig._id ? 'Update' : 'Configure'}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {webhookConfig._id ? (
                          <div className="space-y-6">
                            {/* Status Card */}
                            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                                  <div>
                                    <p className="font-semibold text-green-900">Webhook Active & Monitoring</p>
                                    <p className="text-sm text-green-700 font-mono bg-green-100 px-2 py-1 rounded mt-1 inline-block">
                                      {webhookConfig.webhookUrl.replace(/^https?:\/\//, '').substring(0, 40)}...
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                  Online
                                </Badge>
                              </div>
                            </div>

                            {/* Enhanced Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Activity className="h-4 w-4 text-blue-600" />
                                  <p className="text-sm font-medium text-blue-900">Total Events</p>
                                </div>
                                <p className="text-2xl font-bold text-blue-900">{webhookConfig.totalEvents || 0}</p>
                              </div>
                              
                              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Webhook className="h-4 w-4 text-purple-600" />
                                  <p className="text-sm font-medium text-purple-900">Active Events</p>
                                </div>
                                <p className="text-2xl font-bold text-purple-900">
                                  {Object.values(webhookConfig.events).filter(Boolean).length}
                                </p>
                              </div>
                              
                              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4 text-amber-600" />
                                  <p className="text-sm font-medium text-amber-900">Last Triggered</p>
                                </div>
                                <p className="text-sm font-bold text-amber-900">
                                  {webhookConfig.lastTriggered 
                                    ? new Date(webhookConfig.lastTriggered).toLocaleDateString()
                                    : 'Never'
                                  }
                                </p>
                              </div>
                              
                              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Shield className="h-4 w-4 text-green-600" />
                                  <p className="text-sm font-medium text-green-900">Status</p>
                                </div>
                                <p className="text-sm font-bold text-green-900">Operational</p>
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-slate-50 p-6 rounded-xl">
                              <h4 className="font-semibold text-slate-900 mb-4">Test Your Webhook</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => testWebhook('customer.message')}
                                  disabled={loading}
                                  className="justify-start hover:bg-blue-50 hover:border-blue-300"
                                >
                                  <FaWhatsapp className="h-4 w-4 mr-2" />
                                  Customer Message
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => testWebhook('message.delivered')}
                                  disabled={loading}
                                  className="justify-start hover:bg-green-50 hover:border-green-300"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Delivery Status
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => testWebhook('campaign.sent')}
                                  disabled={loading}
                                  className="justify-start hover:bg-purple-50 hover:border-purple-300"
                                >
                                  <Users className="h-4 w-4 mr-2" />
                                  Campaign Event
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-16">
                            <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6">
                              <Webhook className="h-12 w-12 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Webhook Configured</h3>
                            <p className="text-slate-600 mb-6 max-w-md mx-auto">
                              Set up webhooks to receive real-time events and integrate with automation platforms like Zapier and Pabbly Connect.
                            </p>
                            <Button 
                              onClick={() => setIsConfigDialogOpen(true)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Configure Webhook
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Popular Integration Platforms</h2>
                    <p className="text-lg text-slate-600">Connect Zaptick with thousands of apps and services</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {integrationGuides.map((integration, index) => {
                      const Icon = integration.icon;
                      
                      return (
                        <Card key={integration.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                          <CardContent className="p-8">
                            <div className="text-center">
                              <div className={`h-16 w-16 rounded-2xl bg-${integration.color}-100 flex items-center justify-center mx-auto mb-4`}>
                                <Icon className={`h-8 w-8 text-${integration.color}-600`} />
                              </div>
                              <h3 className="text-xl font-bold text-slate-900 mb-2">{integration.name}</h3>
                              <p className="text-slate-600 mb-6">{integration.description}</p>
                              
                              <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                  <Check className="h-4 w-4 text-green-600" />
                                  <span>{integration.steps.length}-step setup</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                  <Check className="h-4 w-4 text-green-600" />
                                  <span>Real-time webhooks</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                  <Check className="h-4 w-4 text-green-600" />
                                  <span>Secure & reliable</span>
                                </div>
                              </div>

                              <Button 
                                className="w-full"
                                variant={index === 0 ? "default" : "outline"}
                                onClick={() => {
                                  setSelectedIntegration(integration.name.toLowerCase());
                                  setActiveTab('setup');
                                }}
                              >
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Get Started
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Integration Benefits */}
                  <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50">
                    <CardContent className="p-8">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Why Use Webhook Integrations?</h3>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                          Unlock the full potential of your WhatsApp Business communication with powerful integrations
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                            <Zap className="h-6 w-6 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-slate-900 mb-2">Real-time Automation</h4>
                          <p className="text-sm text-slate-600">Instant responses to customer actions and events</p>
                        </div>

                        <div className="text-center">
                          <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                          </div>
                          <h4 className="font-semibold text-slate-900 mb-2">Improved Efficiency</h4>
                          <p className="text-sm text-slate-600">Reduce manual work by 80% with smart automation</p>
                        </div>

                        <div className="text-center">
                          <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                            <Shield className="h-6 w-6 text-purple-600" />
                          </div>
                          <h4 className="font-semibold text-slate-900 mb-2">Secure & Reliable</h4>
                          <p className="text-sm text-slate-600">Enterprise-grade security with 99.9% uptime</p>
                        </div>

                        <div className="text-center">
                          <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                            <Globe className="h-6 w-6 text-amber-600" />
                          </div>
                          <h4 className="font-semibold text-slate-900 mb-2">5000+ Integrations</h4>
                          <p className="text-sm text-slate-600">Connect with any app or service you use</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'examples' && (
              <div className="p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Real-World Integration Examples</h2>
                    <p className="text-lg text-slate-600">See how businesses use webhooks to automate their workflows</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {webhookExamples.map((example, index) => (
                      <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardContent className="p-8">
                          <div className="flex items-start gap-4 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                              <Star className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 mb-2">{example.title}</h3>
                              <p className="text-slate-600">{example.description}</p>
                            </div>
                          </div>

                          <div className="space-y-4 mb-6">
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-2">Webhook Events Used:</h4>
                              <div className="flex flex-wrap gap-2">
                                {example.events.map((event, eventIndex) => (
                                  <Badge key={eventIndex} variant="outline" className="bg-slate-50">
                                    {event}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-slate-900 mb-2">Workflow:</h4>
                              <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-700 font-mono">{example.workflow}</p>
                              </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-green-900">Business Impact:</span>
                                <span className="text-green-700">{example.benefit}</span>
                              </div>
                            </div>
                          </div>

                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => {
                              setActiveTab('setup');
                              setSelectedIntegration('zapier');
                            }}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Try This Example
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Sample Payload Preview */}
                  <Card className="border-0 shadow-sm mt-12">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Sample Webhook Payload
                      </CardTitle>
                      <CardDescription>
                        Example of what your webhook endpoint will receive
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-900 rounded-lg p-6 overflow-x-auto">
                        <pre className="text-green-400 text-sm">
{`{
  "event": "customer.message",
  "timestamp": 1703123456789,
  "data": {
    "message": {
      "id": "msg_abc123",
      "whatsappMessageId": "wamid.xxx",
      "type": "text",
      "content": "Hello, I need help with my order",
      "timestamp": "2023-12-21T10:30:00Z"
    },
    "contact": {
      "id": "contact_xyz789",
      "name": "John Doe",
      "phone": "+1234567890"
    },
    "conversation": {
      "id": "conv_def456"
    }
  },
  "wabaId": "your-waba-id",
  "userId": "your-user-id"
}`}
                        </pre>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify({
                            event: "customer.message",
                            timestamp: 1703123456789,
                            data: {
                              message: {
                                id: "msg_abc123",
                                whatsappMessageId: "wamid.xxx",
                                type: "text",
                                content: "Hello, I need help with my order",
                                timestamp: "2023-12-21T10:30:00Z"
                              },
                              contact: {
                                id: "contact_xyz789",
                                name: "John Doe",
                                phone: "+1234567890"
                              },
                              conversation: {
                                id: "conv_def456"
                              }
                            },
                            wabaId: "your-waba-id",
                            userId: "your-user-id"
                          }, null, 2), 'Sample payload')}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Payload
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('/settings/developer/samples', '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View All Samples
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'documentation' && (
              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Developer Documentation</h2>
                    <p className="text-lg text-slate-600">Everything you need to build powerful WhatsApp integrations</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Quick Start Guide */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <Play className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <CardTitle>Quick Start Guide</CardTitle>
                            <CardDescription>Get up and running in minutes</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</div>
                            <span className="text-sm">Choose your integration platform</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</div>
                            <span className="text-sm">Configure webhook URL</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</div>
                            <span className="text-sm">Select event types</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">4</div>
                            <span className="text-sm">Test and deploy</span>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Read Full Guide
                        </Button>
                      </CardContent>
                    </Card>

                    {/* API Reference */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Code className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle>API Reference</CardTitle>
                            <CardDescription>Complete webhook API documentation</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 text-sm">Event Types</h4>
                            <p className="text-xs text-blue-700 mt-1">Complete list of available webhook events</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-900 text-sm">Payload Structure</h4>
                            <p className="text-xs text-green-700 mt-1">Detailed payload schemas and examples</p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-purple-900 text-sm">Security</h4>
                            <p className="text-xs text-purple-700 mt-1">Signature verification and best practices</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View API Docs
                        </Button>
                      </CardContent>
                    </Card>

                    {/* SDKs & Libraries */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Database className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <CardTitle>SDKs & Libraries</CardTitle>
                            <CardDescription>Pre-built integrations for popular platforms</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-6 rounded bg-yellow-400 flex items-center justify-center">
                                <span className="text-xs font-bold">JS</span>
                              </div>
                              <span className="text-sm font-medium">Node.js SDK</span>
                            </div>
                            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-6 rounded bg-blue-500 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">PY</span>
                              </div>
                              <span className="text-sm font-medium">Python SDK</span>
                            </div>
                            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-6 rounded bg-red-500 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">PHP</span>
                              </div>
                              <span className="text-sm font-medium">PHP SDK</span>
                            </div>
                            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          <Bell className="h-4 w-4 mr-2" />
                          Notify When Available
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Community & Support */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <CardTitle>Community & Support</CardTitle>
                            <CardDescription>Get help from our developer community</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full justify-start">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Developer Discord
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <FileText className="h-4 w-4 mr-2" />
                            Knowledge Base
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Mail className="h-4 w-4 mr-2" />
                            Email Support
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Feature Comparison */}
                  <Card className="border-0 shadow-sm mt-12">
                    <CardHeader>
                      <CardTitle className="text-center">Webhook vs Traditional Polling</CardTitle>
                      <CardDescription className="text-center">
                        Why webhooks are the superior choice for real-time integrations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-3 px-4 font-semibold text-slate-900">Feature</th>
                              <th className="text-center py-3 px-4 font-semibold text-green-900">Webhooks</th>
                              <th className="text-center py-3 px-4 font-semibold text-slate-600">Traditional Polling</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-slate-100">
                              <td className="py-3 px-4 text-slate-900">Response Time</td>
                              <td className="py-3 px-4 text-center">
                                <Badge className="bg-green-100 text-green-800">Instant</Badge>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge variant="outline" className="text-slate-600">1-5 minutes</Badge>
                              </td>
                            </tr>
                            <tr className="border-b border-slate-100">
                              <td className="py-3 px-4 text-slate-900">Resource Usage</td>
                              <td className="py-3 px-4 text-center">
                                <Badge className="bg-green-100 text-green-800">Minimal</Badge>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge variant="outline" className="text-slate-600">High</Badge>
                              </td>
                            </tr>
                            <tr className="border-b border-slate-100">
                              <td className="py-3 px-4 text-slate-900">Reliability</td>
                              <td className="py-3 px-4 text-center">
                                <Badge className="bg-green-100 text-green-800">99.9%</Badge>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge variant="outline" className="text-slate-600">Variable</Badge>
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 px-4 text-slate-900">Setup Complexity</td>
                              <td className="py-3 px-4 text-center">
                                <Badge className="bg-green-100 text-green-800">Simple</Badge>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge variant="outline" className="text-slate-600">Complex</Badge>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Webhook Configuration Dialog */}
          <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0">
              <DialogHeader className="px-8 py-6 border-b border-slate-100 flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center">
                    <Webhook className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-slate-900">
                      Configure Webhook URL
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 mt-1">
                      Set up real-time event notifications for your WhatsApp Business account.{' '}
                      <a 
                        href="#" 
                        className="text-blue-600 hover:underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Learn more about webhooks
                      </a>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="space-y-8">
                  {/* URL and Secret Key Configuration */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold">
                        1
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">Webhook Configuration</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-slate-900 font-medium flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Webhook URL
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          </Label>
                          <p className="text-sm text-slate-600 mt-1">
                            Must include http:// or https://. Get this from your automation platform.
                          </p>
                        </div>
                        <Input
                          placeholder="https://hooks.zapier.com/hooks/..."
                          value={webhookConfig.webhookUrl}
                          onChange={(e) => setWebhookConfig(prev => ({
                            ...prev,
                            webhookUrl: e.target.value
                          }))}
                          className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-slate-900 font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Secret Key
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          </Label>
                          <p className="text-sm text-slate-600 mt-1">
                            Used to verify webhook authenticity. Generate or enter your own.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              type={showSecretKey ? "text" : "password"}
                              placeholder="Enter or generate secret key"
                              value={webhookConfig.secretKey}
                              onChange={(e) => setWebhookConfig(prev => ({
                                ...prev,
                                secretKey: e.target.value
                              }))}
                              className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSecretKey(!showSecretKey)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => copyToClipboard(webhookConfig.secretKey, 'Secret key')}
                            disabled={!webhookConfig.secretKey}
                            className="flex-shrink-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateNewSecretKey}
                            className="text-green-600 border-green-200 hover:bg-green-50 flex-shrink-0"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Platform Badge */}
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="h-8 w-8 rounded bg-green-600 flex items-center justify-center">
                        <FaWhatsapp className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-green-600 font-semibold">WhatsApp Business API</span>
                        <p className="text-green-700 text-sm">Secure, reliable webhook delivery</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Event Selection */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold">
                        2
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">Select Webhook Events</h3>
                    </div>

                    <Alert className="border-blue-200 bg-blue-50">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        Choose the events you want to receive. You can always modify these later.
                        <strong className="ml-1">Popular combinations are pre-selected for you.</strong>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      {eventCategories.map((category) => {
                        const Icon = category.icon;
                        const isExpanded = expandedCategories.includes(category.id);
                        const categoryEvents = category.events.filter(event => 
                          webhookConfig.events[event.key as keyof typeof webhookConfig.events]
                        ).length;
                        
                        return (
                          <div key={category.id} className="border rounded-xl overflow-hidden">
                            <button
                              type="button"
                              onClick={() => toggleCategory(category.id)}
                              className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <Icon className="h-6 w-6 text-slate-600" />
                                <div>
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-semibold text-slate-900">{category.title}</h4>
                                    {category.popular && (
                                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                                        <Star className="h-3 w-3 mr-1" />
                                        Popular
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {categoryEvents > 0 && (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                    {categoryEvents} selected
                                  </Badge>
                                )}
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-slate-600" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-slate-600" />
                                )}
                              </div>
                            </button>
                            
                            {isExpanded && (
                              <div className="px-6 pb-6 space-y-4 border-t border-slate-100 bg-slate-50/50">
                                {category.events.map((event) => (
                                  <div key={event.key} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200">
                                    <Checkbox
                                      id={event.key}
                                      checked={webhookConfig.events[event.key as keyof typeof webhookConfig.events]}
                                      onCheckedChange={(checked) => updateEventConfig(event.key, !!checked)}
                                      disabled={event.premium}
                                      className="mt-0.5"
                                    />
                                    <div className="flex-1">
                                      <Label 
                                        htmlFor={event.key} 
                                        className={`font-medium cursor-pointer ${event.premium ? 'text-slate-400' : 'text-slate-900'}`}
                                      >
                                        {event.label}
                                        {event.default && (
                                          <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-600 border-green-200">
                                            Recommended
                                          </Badge>
                                        )}
                                        {event.premium && (
                                          <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-600 border-amber-200">
                                            Premium
                                          </Badge>
                                        )}
                                      </Label>
                                      {event.description && (
                                        <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Need Help Choosing Events?</h4>
                          <p className="text-sm text-slate-600 mb-3">
                            Not sure which events to select? Check out our integration examples or start with the recommended events.
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0 h-auto text-blue-600"
                              onClick={() => window.open('/settings/developer/samples', '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Sample Payloads
                            </Button>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0 h-auto text-blue-600"
                              onClick={() => {
                                setActiveTab('examples');
                                setIsConfigDialogOpen(false);
                              }}
                            >
                              <Lightbulb className="h-4 w-4 mr-1" />
                              See Examples
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="px-8 py-6 border-t border-slate-100 flex-shrink-0 bg-white">
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">{Object.values(webhookConfig.events).filter(Boolean).length}</span> events selected
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsConfigDialogOpen(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveWebhookConfig}
                      disabled={loading || !webhookConfig.webhookUrl || !webhookConfig.secretKey}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 min-w-[120px]"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          {webhookConfig._id ? 'Update Webhook' : 'Create Webhook'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
}