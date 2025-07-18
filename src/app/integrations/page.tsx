'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ExternalLink, Play, Info, AlertTriangle, CheckCircle, Zap, ArrowRight, Star, Shield, Clock, Users, ChevronRight, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  features?: string[];
  setupTime?: string;
  rating?: number;
  usersCount?: string;
  detailedDescription?: string;
  benefits?: string[];
  requirements?: string[];
  supportedFeatures?: string[];
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
    videoUrl: 'https://example.com/whatsapp-pay-video',
    setupTime: '5 minutes',
    rating: 4.8,
    usersCount: '10K+',
    detailedDescription: 'WhatsApp Pay integration allows your customers to make seamless payments directly within WhatsApp conversations, reducing cart abandonment and increasing conversion rates.',
    features: ['Instant payment processing', 'Secure UPI integration', 'Real-time payment status'],
    benefits: ['Reduced cart abandonment', 'Faster checkout process', 'Increased customer trust'],
    requirements: ['Active WhatsApp Business Account', 'Valid business verification'],
    supportedFeatures: ['Payment links', 'Order confirmation', 'Refund processing']
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
    videoUrl: 'https://example.com/razorpay-video',
    setupTime: '10 minutes',
    rating: 4.7,
    usersCount: '50K+',
    detailedDescription: 'Razorpay integration enables automatic payment link generation and seamless checkout experience for your WhatsApp commerce.',
    features: ['Automated payment links', 'Multi-payment options', 'Real-time notifications'],
    benefits: ['Streamlined checkout', 'Higher conversion rates', 'Better customer experience'],
    requirements: ['Razorpay account', 'API keys configuration'],
    supportedFeatures: ['Payment gateway', 'Subscription billing', 'Refund management']
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
    videoUrl: 'https://example.com/payu-video',
    setupTime: '8 minutes',
    rating: 4.6,
    usersCount: '25K+',
    detailedDescription: 'PayU integration provides robust payment processing capabilities with automated checkout workflows for WhatsApp commerce.',
    features: ['Auto-checkout workflows', 'Multiple payment methods', 'Fraud protection'],
    benefits: ['Secure transactions', 'Global payment support', 'Easy integration'],
    requirements: ['PayU merchant account', 'Business verification'],
    supportedFeatures: ['Payment processing', 'Recurring payments', 'Analytics dashboard']
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
    videoUrl: 'https://example.com/shopify-video',
    setupTime: '15 minutes',
    rating: 4.9,
    usersCount: '100K+',
    detailedDescription: 'Shopify Sales Channel integration automatically syncs your products and collections to WhatsApp, enabling seamless catalog browsing and purchasing.',
    features: ['Product sync', 'Inventory management', 'Order tracking'],
    benefits: ['Unified catalog', 'Real-time inventory', 'Streamlined operations'],
    requirements: ['Shopify store', 'Admin access'],
    supportedFeatures: ['Product catalog', 'Order management', 'Customer data sync']
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
    infoUrl: 'https://developers.google.com/sheets',
    setupTime: '5 minutes',
    rating: 4.5,
    usersCount: '75K+',
    detailedDescription: 'Google Sheets integration enables automatic WhatsApp notifications based on spreadsheet changes, perfect for lead management and data tracking.',
    features: ['Real-time triggers', 'Data synchronization', 'Custom notifications'],
    benefits: ['Automated workflows', 'Easy data management', 'No coding required'],
    requirements: ['Google account', 'Sheet access permissions'],
    supportedFeatures: ['Row-based triggers', 'Data validation', 'Bulk operations']
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
    infoUrl: 'https://judge.me/api',
    setupTime: '20 minutes',
    rating: 4.4,
    usersCount: '15K+',
    detailedDescription: 'Judge.me integration helps you collect and manage customer reviews through WhatsApp feedback workflows, boosting your store\'s credibility.',
    features: ['Review collection', 'Automated follow-ups', 'Rating management'],
    benefits: ['Increased social proof', 'Higher conversion rates', 'Customer insights'],
    requirements: ['Judge.me account', 'Advanced plan subscription'],
    supportedFeatures: ['Review requests', 'Photo reviews', 'Review analytics']
  },
  // Add more integrations with similar detailed structure...
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
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to connect to ${integration.name}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleCardClick = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsDialogOpen(true);
  };

  const getButtonText = (integration: Integration) => {
    if (integration.status === 'connected') return 'Connected';
    if (integration.status === 'coming_soon') return 'Coming Soon';
    if (integration.status === 'restricted') return 'Upgrade to Connect';
    return 'Connect Now';
  };

  const getButtonVariant = (integration: Integration) => {
    if (integration.status === 'connected') return 'outline';
    if (integration.status === 'coming_soon') return 'outline';
    if (integration.status === 'restricted') return 'outline';
    return 'default';
  };

  const stats = [
    { label: 'Total Integrations', value: integrations.length, change: '+12%' },
    { label: 'Connected Apps', value: integrations.filter(i => i.status === 'connected').length, change: '+23%' },
    { label: 'Categories', value: categories.length - 1, change: '+2%' },
    { label: 'Free Integrations', value: integrations.filter(i => i.pricing === 'free').length, change: '+15%' }
  ];

  return (
    <Layout>
      <div className=" mx-auto p-6 ">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent wark:from-white wark:to-gray-300">
                      Integrations Marketplace
                    </h1>
                    <p className="text-muted-foreground">
                      Connect ZapTick with your favorite tools and supercharge your workflow
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-green-600 font-medium">All systems operational</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 wark:from-gray-900/50 wark:to-gray-800/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Navigation and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto bg-gray-100 wark:bg-gray-800 p-1 rounded-xl">
                  <TabsTrigger value="all" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    All Apps
                  </TabsTrigger>
                  <TabsTrigger value="free" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Free Apps
                  </TabsTrigger>
                  <TabsTrigger value="paid" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Paid Apps
                  </TabsTrigger>
                  <TabsTrigger value="my-apps" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    My Apps
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-3 w-full lg:w-auto">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full lg:w-[240px] bg-white wark:bg-gray-800 border-gray-200 wark:border-gray-700">
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

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search integrations by name, category, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white wark:bg-gray-800 border-gray-200 wark:border-gray-700 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <Card 
                key={integration.id} 
                className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white wark:bg-gray-900/50 overflow-hidden"
                onClick={() => handleCardClick(integration)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg"></div>
                        </div>
                        {integration.status === 'connected' && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {integration.name}
                          </CardTitle>
                          {integration.status === 'restricted' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Shield className="h-4 w-4 text-amber-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs text-sm">{integration.restrictionReason}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={integration.pricing === 'free' ? 'default' : 'secondary'}
                            className={`${integration.pricing === 'free' 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            } transition-colors duration-200`}
                          >
                            {integration.pricing}
                          </Badge>
                          {integration.rating && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {integration.rating}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {integration.usersCount || '1K+'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {integration.setupTime || '10 min'}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-600 wark:text-gray-400 mb-2">
                      {integration.category}
                    </p>
                    <CardDescription className="text-sm leading-relaxed line-clamp-2">
                      {integration.description}
                    </CardDescription>
                    
                    {integration.features && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {integration.features.slice(0, 2).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs py-1 px-2 bg-gray-50 wark:bg-gray-800">
                            {feature}
                          </Badge>
                        ))}
                        {integration.features.length > 2 && (
                          <Badge variant="outline" className="text-xs py-1 px-2 bg-gray-50 wark:bg-gray-800">
                            +{integration.features.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            ))}
          </div>

          {/* Integration Details Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              {selectedIntegration && (
                <div className="space-y-6">
                  <DialogHeader>
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg"></div>
                        </div>
                        {selectedIntegration.status === 'connected' && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <DialogTitle className="text-2xl font-bold mb-2">
                          {selectedIntegration.name}
                        </DialogTitle>
                        <div className="flex items-center gap-3 mb-3">
                          <Badge 
                            variant={selectedIntegration.pricing === 'free' ? 'default' : 'secondary'}
                            className={selectedIntegration.pricing === 'free' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                            }
                          >
                            {selectedIntegration.pricing}
                          </Badge>
                          <Badge variant="outline">{selectedIntegration.category}</Badge>
                          {selectedIntegration.rating && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              {selectedIntegration.rating}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {selectedIntegration.usersCount || '1K+'} users
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {selectedIntegration.setupTime || '10 min'} setup
                          </span>
                        </div>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">About this integration</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedIntegration.detailedDescription || selectedIntegration.description}
                      </p>
                    </div>

                    {selectedIntegration.features && (
                      <div>
                        <h3 className="font-semibold mb-3">Key Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedIntegration.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedIntegration.benefits && (
                      <div>
                        <h3 className="font-semibold mb-3">Benefits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedIntegration.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedIntegration.requirements && (
                      <div>
                        <h3 className="font-semibold mb-3">Requirements</h3>
                        <div className="space-y-2">
                          {selectedIntegration.requirements.map((requirement, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                              {requirement}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedIntegration.status === 'restricted' && (
                      <div className="p-4 bg-amber-50 wark:bg-amber-900/20 border border-amber-200 wark:border-amber-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-amber-600" />
                          <h4 className="font-medium text-amber-800 wark:text-amber-200">Upgrade Required</h4>
                        </div>
                        <p className="text-sm text-amber-700 wark:text-amber-300">
                          {selectedIntegration.restrictionReason}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4 border-t">
                      {selectedIntegration.hasVideo && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(selectedIntegration.videoUrl, '_blank')}
                          className="flex-1"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch Demo
                        </Button>
                      )}
                      {selectedIntegration.hasInfo && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(selectedIntegration.infoUrl, '_blank')}
                          className="flex-1"
                        >
                          <Info className="h-4 w-4 mr-2" />
                          Learn More
                        </Button>
                      )}
                      <Button
                        onClick={() => handleConnect(selectedIntegration)}
                        variant={getButtonVariant(selectedIntegration)}
                        className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                        disabled={selectedIntegration.status === 'connected' || selectedIntegration.status === 'coming_soon'}
                      >
                        {selectedIntegration.status === 'connected' && (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {getButtonText(selectedIntegration)}
                        {selectedIntegration.status === 'available' && (
                          <ArrowRight className="h-4 w-4 ml-2" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Request New Integration */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all duration-300">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Info className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Can&apos;t find what you&apos;re looking for?</h3>
                  <p className="text-sm text-muted-foreground">
                 Let us know what integration you need and we&apos;ll consider adding it to our marketplace.
                  </p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 hover:shadow-lg transition-all duration-200">
                <ArrowRight className="h-4 w-4 mr-2" />
                Request Integration
              </Button>
            </CardContent>
          </Card>

          {/* Empty State */}
          {filteredIntegrations.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 wark:from-gray-800 wark:to-gray-700 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No integrations found</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                  We couldn&apos;t find any integrations matching your search criteria. Try adjusting your filters or search terms.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Categories');
                      setActiveTab('all');
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear filters
                  </Button>
                  <Button>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Request Integration
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Popular Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Popular Categories</h2>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View all categories
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(1, 5).map((category) => {
                const count = integrations.filter(i => i.category === category).length;
                return (
                  <Card 
                    key={category} 
                    className="group cursor-pointer border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                        {category}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {count} integration{count !== 1 ? 's' : ''}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Updates */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recent Updates</CardTitle>
                  <CardDescription>
                    Latest integrations and improvements
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  View changelog
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: 'WhatsApp Pay Integration',
                    description: 'New payment processing capabilities added',
                    date: '2 days ago',
                    type: 'new'
                  },
                  {
                    title: 'Shopify Sales Channel',
                    description: 'Improved product sync and inventory management',
                    date: '1 week ago',
                    type: 'update'
                  },
                  {
                    title: 'Google Sheets Enhancement',
                    description: 'Better error handling and retry mechanisms',
                    date: '2 weeks ago',
                    type: 'improvement'
                  }
                ].map((update, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 wark:hover:bg-gray-800/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      update.type === 'new' ? 'bg-green-500' : 
                      update.type === 'update' ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{update.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {update.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {update.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {update.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}