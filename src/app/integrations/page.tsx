'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ExternalLink, Play, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  pricing: 'free' | 'paid';
  logo: string;
  status: 'available' | 'connected' | 'coming_soon' | 'restricted';
  hasVideo?: boolean;
  hasInfo?: boolean;
  videoUrl?: string;
  infoUrl?: string;
  restrictionReason?: string;
  tags?: string[];
}

const integrations: Integration[] = [
  {
    id: 'whatsapp-pay',
    name: 'WhatsApp Pay',
    category: 'Payment Provider',
    description: 'Create a frictionless payment experience on WhatsApp to improve conversions',
    pricing: 'free',
    logo: '/integrations/whatsapp-pay.png',
    status: 'available',
    hasVideo: true,
    videoUrl: 'https://example.com/whatsapp-pay-video'
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    category: 'Payment Provider',
    description: 'When customers send WhatsApp carts, send payment links automatically in a checkout botflow',
    pricing: 'free',
    logo: '/integrations/razorpay.png',
    status: 'available',
    hasVideo: true,
    videoUrl: 'https://example.com/razorpay-video'
  },
  {
    id: 'payu',
    name: 'PayU',
    category: 'Payment Provider',
    description: 'When customers send WhatsApp carts, send payment links automatically in a auto-checkout workflow',
    pricing: 'free',
    logo: '/integrations/payu.png',
    status: 'available',
    hasVideo: true,
    videoUrl: 'https://example.com/payu-video'
  },
  {
    id: 'aspire',
    name: 'Aspire',
    category: 'Payment Provider',
    description: 'Generate and automatically send payment links in WhatsApp carts, enabling a seamless auto-checkout experience for customers',
    pricing: 'paid',
    logo: '/integrations/aspire.png',
    status: 'available'
  },
  {
    id: 'xendit',
    name: 'Xendit',
    category: 'Payment Provider',
    description: 'Generate and automatically send payment links in WhatsApp carts, enabling a seamless auto-checkout experience for customers',
    pricing: 'paid',
    logo: '/integrations/xendit.png',
    status: 'available'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Payment Provider',
    description: 'Create/Update users on Interakt and Send automatic WhatsApp notifications upon Payment status updates on Stripe',
    pricing: 'paid',
    logo: '/integrations/stripe.png',
    status: 'available',
    hasInfo: true,
    infoUrl: 'https://stripe.com/docs'
  },
  {
    id: 'pabbly-connect',
    name: 'Pabbly Connect',
    category: 'Connector Platform',
    description: 'Send WhatsApp notifications on triggers from any software in the world',
    pricing: 'free',
    logo: '/integrations/pabbly.png',
    status: 'available'
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    category: 'Data Storage',
    description: 'Send automatic WhatsApp notifications whenever a new row is added in a sheet',
    pricing: 'free',
    logo: '/integrations/google-sheets.png',
    status: 'available',
    hasInfo: true,
    infoUrl: 'https://developers.google.com/sheets'
  },
  {
    id: 'shopify-sales',
    name: 'Shopify Sales Channel',
    category: 'e-Commerce Platform',
    description: 'Auto-sync Shopify products & collections to WhatsApp',
    pricing: 'free',
    logo: '/integrations/shopify.png',
    status: 'available',
    hasVideo: true,
    videoUrl: 'https://example.com/shopify-video'
  },
  {
    id: 'shopify-marketing',
    name: 'Shopify Marketing',
    category: 'e-Commerce Platform',
    description: 'Send automatic WhatsApp notifications to recover abandoned carts, confirm CoD Orders & much more',
    pricing: 'free',
    logo: '/integrations/shopify.png',
    status: 'available',
    hasVideo: true,
    videoUrl: 'https://example.com/shopify-marketing-video'
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    category: 'e-Commerce Platform',
    description: 'Send automatic WhatsApp notifications to recover abandoned carts, confirm orders & much more',
    pricing: 'free',
    logo: '/integrations/woocommerce.png',
    status: 'available'
  },
  {
    id: 'facebook-leads',
    name: 'Facebook Lead Form',
    category: 'Ads Platform',
    description: 'As soon as a lead fills the form, add them in Interakt & send an automatic welcome notification',
    pricing: 'paid',
    logo: '/integrations/facebook-leads.png',
    status: 'available'
  },
  {
    id: 'integromat',
    name: 'Integromat',
    category: 'Connector Platform',
    description: 'Send WhatsApp notifications on triggers from any software in the world',
    pricing: 'free',
    logo: '/integrations/integromat.png',
    status: 'available'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'Connector Platform',
    description: 'Send WhatsApp notifications on triggers from any software in the world',
    pricing: 'free',
    logo: '/integrations/zapier.png',
    status: 'available'
  },
  {
    id: 'zoho-crm',
    name: 'Zoho CRM',
    category: 'CRM Platform',
    description: 'Create/Update users on Interakt and Send automatic WhatsApp notifications upon user/lead creation or updation in Zoho',
    pricing: 'paid',
    logo: '/integrations/zoho-crm.png',
    status: 'available',
    hasInfo: true,
    infoUrl: 'https://www.zoho.com/crm/developer/'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'CRM Platform',
    description: 'Create/Update users on Interakt and Send automatic WhatsApp notifications upon user/lead creation or updation in Hubspot',
    pricing: 'paid',
    logo: '/integrations/hubspot.png',
    status: 'available',
    hasInfo: true,
    infoUrl: 'https://developers.hubspot.com/'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM Platform',
    description: 'Create/Update users on Interakt and Send automatic WhatsApp notifications upon user/lead creation or updation in Salesforce',
    pricing: 'paid',
    logo: '/integrations/salesforce.png',
    status: 'available',
    hasInfo: true,
    infoUrl: 'https://developer.salesforce.com/'
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk v2',
    category: 'Helpdesk Platform',
    description: 'Create/Update users on Interakt and Send automatic WhatsApp notifications upon Ticket creation or updation on Freshdesk',
    pricing: 'paid',
    logo: '/integrations/freshdesk.png',
    status: 'available',
    hasInfo: true,
    infoUrl: 'https://developers.freshdesk.com/'
  },
  {
    id: 'zoho-billing',
    name: 'Zoho Billing',
    category: 'Billing Platform',
    description: 'Create/Update users on Interakt and Send automatic WhatsApp notifications upon Subscription/Invoice creation or updation on Zoho Billing',
    pricing: 'paid',
    logo: '/integrations/zoho-billing.png',
    status: 'available',
    hasInfo: true,
    infoUrl: 'https://www.zoho.com/billing/api/'
  },
  {
    id: 'zoho-bigin',
    name: 'Zoho Bigin CRM',
    category: 'CRM Platform',
    description: 'Create/Update users on Interakt and Send automatic WhatsApp notifications upon Contact/Company creation or updation on Zoho Bigin',
    pricing: 'paid',
    logo: '/integrations/zoho-bigin.png',
    status: 'available',
    hasInfo: true,
    infoUrl: 'https://www.zoho.com/bigin/developer/'
  },
  {
    id: 'judgeme',
    name: 'Judge.me',
    category: 'Product Review Platform',
    description: 'Create/Update a Review on Judge.me when a customer completes a Feedback workflow on Interakt',
    pricing: 'paid',
    logo: '/integrations/judgeme.png',
    status: 'restricted',
    restrictionReason: 'The Judge.me integration is available only on our Advanced paid plan. Please upgrade your plan to access this feature.',
    hasInfo: true,
    infoUrl: 'https://judge.me/api'
  },
  {
    id: 'freshworks-crm',
    name: 'Freshworks CRM',
    category: 'CRM Platform',
    description: 'Freshworks CRM is a platform for sales and marketing people to sell faster and market smarter.',
    pricing: 'paid',
    logo: '/integrations/freshworks-crm.png',
    status: 'available',
    hasInfo: true,
    infoUrl: 'https://developers.freshworks.com/crm/'
  },
  {
    id: 'calendly',
    name: 'Calendly',
    category: 'Scheduling Automation Platform',
    description: 'Calendly is an online meeting scheduling platform that helps find the perfect time for a meet.',
    pricing: 'paid',
    logo: '/integrations/calendly.png',
    status: 'available',
    hasInfo: true,
    infoUrl: 'https://developer.calendly.com/'
  },
  {
    id: 'zoho-books',
    name: 'Zoho Books',
    category: 'Billing Platform',
    description: 'Zoho Books is an accounting software for businesses to help in book-keeping, billing, invoicing, bank reconciliation, accounting etc',
    pricing: 'paid',
    logo: '/integrations/zoho-books.png',
    status: 'available',
    hasInfo: true,
    infoUrl: 'https://www.zoho.com/books/api/'
  },
  {
    id: 'yampi',
    name: 'Yampi',
    category: 'e-Commerce Platform',
    description: 'Create/Update users on Interakt and Send automatic WhatsApp notifications upon different events from your Yampi store',
    pricing: 'free',
    logo: '/integrations/yampi.png',
    status: 'available',
    hasInfo: true,
    infoUrl: 'https://docs.yampi.com.br/'
  },
  {
    id: 'wafeq',
    name: 'Wafeq',
    category: 'Accounting Software',
    description: 'Send invoices to customers via WhatsApp',
    pricing: 'paid',
    logo: '/integrations/wafeq.png',
    status: 'available',
    hasInfo: true,
    infoUrl: 'https://wafeq.com/api'
  }
];

const categories = [
  'All Categories',
  'Payment Provider',
  'e-Commerce Platform',
  'Connector Platform',
  'CRM Platform',
  'Data Storage',
  'Ads Platform',
  'Helpdesk Platform',
  'Billing Platform',
  'Product Review Platform',
  'Scheduling Automation Platform',
  'Accounting Software'
];

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [filteredIntegrations, setFilteredIntegrations] = useState(integrations);

  useEffect(() => {
    let filtered = integrations;

    // Filter by tab
    if (activeTab !== 'all') {
      if (activeTab === 'free') {
        filtered = filtered.filter(integration => integration.pricing === 'free');
      } else if (activeTab === 'paid') {
        filtered = filtered.filter(integration => integration.pricing === 'paid');
      } else if (activeTab === 'my-apps') {
        filtered = filtered.filter(integration => integration.status === 'connected');
      }
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(integration =>
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(integration => integration.category === selectedCategory);
    }

    setFilteredIntegrations(filtered);
  }, [activeTab, searchQuery, selectedCategory]);

  const handleConnect = async (integration: Integration) => {
    if (integration.status === 'restricted') {
      toast({
        title: "Upgrade Required",
        description: integration.restrictionReason,
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: `Successfully connected to ${integration.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to connect to ${integration.name}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleWatchVideo = (videoUrl: string) => {
    window.open(videoUrl, '_blank');
  };

  const handleViewInfo = (infoUrl: string) => {
    window.open(infoUrl, '_blank');
  };

  const getButtonText = (integration: Integration) => {
    if (integration.status === 'connected') return 'Connected';
    if (integration.status === 'coming_soon') return 'Coming Soon';
    if (integration.status === 'restricted') return 'Connect to ZapTick';
    return integration.name === 'WhatsApp Pay' ? 'Connect' : 'Connect to ZapTick';
  };

  const getButtonVariant = (integration: Integration) => {
    if (integration.status === 'connected') return 'outline';
    if (integration.status === 'coming_soon') return 'outline';
    if (integration.status === 'restricted') return 'outline';
    return 'default';
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Integrations</h1>
              <p className="text-muted-foreground">Connect ZapTick with various applications</p>
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-4 sm:w-auto">
                <TabsTrigger value="all">All Apps</TabsTrigger>
                <TabsTrigger value="free">Free Apps</TabsTrigger>
                <TabsTrigger value="paid">Paid Apps</TabsTrigger>
                <TabsTrigger value="my-apps">My Apps</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredIntegrations.map((integration) => (
            <Card key={integration.id} className="flex flex-col h-full">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base font-medium">{integration.name}</CardTitle>
                        {integration.status === 'restricted' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-sm">{integration.restrictionReason}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <Badge 
                        variant={integration.pricing === 'free' ? 'default' : 'secondary'}
                        className={integration.pricing === 'free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                      >
                        {integration.pricing}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{integration.category}</p>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="mb-4">
                  <CardDescription className="text-sm leading-relaxed">
                    {integration.description}
                  </CardDescription>
                  
                  {(integration.hasVideo || integration.hasInfo) && (
                    <div className="flex gap-2 mt-3">
                      {integration.hasVideo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleWatchVideo(integration.videoUrl!)}
                          className="h-8 px-2 text-xs text-primary hover:text-primary"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Watch Video
                        </Button>
                      )}
                      {integration.hasInfo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInfo(integration.infoUrl!)}
                          className="h-8 px-2 text-xs text-primary hover:text-primary"
                        >
                          <Info className="h-3 w-3 mr-1" />
                          Know More
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => handleConnect(integration)}
                  variant={getButtonVariant(integration)}
                  className="w-full"
                  disabled={integration.status === 'connected' || integration.status === 'coming_soon' || integration.status === 'restricted'}
                >
                  {integration.status === 'connected' && (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {getButtonText(integration)}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Request New Integration */}
        <Card className="mt-8">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="font-semibold mb-1">Couldn&apos;t find the App you&apos;re looking for?</h3>
              <p className="text-sm text-muted-foreground">
                Let us know what integration you need and we&apos;l consider adding it.
              </p>
            </div>
            <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white">
              + Request apps
            </Button>
          </CardContent>
        </Card>

        {/* Empty State */}
        {filteredIntegrations.length === 0 && (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No integrations found</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                We couldn&apos;t find any integrations matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Categories');
                  setActiveTab('all');
                }}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}