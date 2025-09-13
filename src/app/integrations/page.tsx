'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ExternalLink, Play, Info, AlertTriangle, CheckCircle, Zap, ArrowRight, Star, Shield, Clock, Users, ChevronRight, X, TrendingUp, Sparkles, Activity } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
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
  isInternal?: boolean;
  internalRoute?: string;
}

const integrations: Integration[] = [
  {
    id: 'zapllo-crm',
    name: 'Zapllo CRM',
    category: 'CRM Platform',
    description: 'Seamlessly integrate your WhatsApp contacts with Zapllo CRM for advanced lead management and sales pipeline tracking',
    logo: '/logoonly.png',
    status: 'available',
    hasInfo: true,
    infoUrl: 'https://crm.zapllo.com',
    setupTime: '5 minutes',
    rating: 4.9,
    usersCount: '25K+',
    detailedDescription: 'Zapllo CRM integration enables you to convert WhatsApp conversations into qualified leads, manage your sales pipeline, and track customer interactions all in one place. Boost your conversion rates with automated lead scoring and follow-up workflows.',
    features: ['Lead conversion from WhatsApp', 'Pipeline management', 'Contact synchronization', 'Automated follow-ups'],
    benefits: ['Streamlined lead management', 'Higher conversion rates', 'Better customer insights', 'Automated workflows'],
    requirements: ['Zapllo CRM account', 'WhatsApp Business Account'],
    supportedFeatures: ['Contact sync', 'Lead creation', 'Pipeline tracking', 'Activity logging'],
    isInternal: true,
    internalRoute: '/crm-integration'
  },
  {
    id: 'whatsapp-pay',
    name: 'WhatsApp Pay',
    category: 'Payment Provider',
    description: 'Create a frictionless payment experience on WhatsApp to improve conversions',
    logo: '/integrations/whatsapp.webp',
    status: 'available',
    hasVideo: true,
    videoUrl: '',
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
    logo: '/integrations/sheets.png',
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
    logo: '/integrations/judge.webp',
    status: 'restricted',
    restrictionReason: 'The Judge.me integration is available only on our Advanced plan. Please upgrade your plan to access this feature.',
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
];

const categories = [
  'All Categories',
  'CRM Platform',
  'Payment Provider',
  'e-Commerce Platform',
  'Connector Platform',
  'Data Storage',
  'Ads Platform',
  'Helpdesk Platform',
  'Billing Platform',
  'Product Review Platform',
  'Scheduling Automation Platform',
  'Accounting Software'
];

export default function IntegrationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [filteredIntegrations, setFilteredIntegrations] = useState(integrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    let filtered = integrations;

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
  }, [searchQuery, selectedCategory]);

  const handleConnect = async (integration: Integration) => {
    if (integration.isInternal && integration.internalRoute) {
      router.push(integration.internalRoute);
      return;
    }

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
    if (integration.isInternal && integration.internalRoute) {
      router.push(integration.internalRoute);
      return;
    }

    setSelectedIntegration(integration);
    setIsDialogOpen(true);
  };

  const getButtonText = (integration: Integration) => {
    if (integration.isInternal) return 'Setup Integration';
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
    { label: 'Available Now', value: integrations.filter(i => i.status === 'available').length, change: '+15%' }
  ];

  return (
    <Layout>
      <TooltipProvider>
        <div className="min-h-screen px-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 wark:from-slate-900 wark:via-slate-800 wark:to-slate-900/50">
          <div className=" mx-auto p-6">
            <div className="space-y-8">
              {/* Modern Header */}
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 shadow-sm">
                          <Zap className="h-6 w-6 text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 animate-pulse" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent wark:from-white wark:to-slate-200">
                          Integrations Marketplace
                        </h1>
                        <p className="text-slate-600 wark:text-slate-300 font-medium">
                          Connect Zaptick with your favorite tools and supercharge your workflow
                        </p>
                      </div>
                    </div>

                    {/* Integration Stats Pills */}
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                          {integrations.length} Total
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                          {integrations.filter(i => i.status === 'available').length} Available
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                          {categories.length - 1} Categories
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                          All systems operational
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-slate-200 wark:border-slate-700 hover:border-primary/30 wark:hover:border-primary/60 hover:bg-primary/5 wark:hover:bg-primary/10"
                      onClick={() => {
                        toast({
                          title: "Coming Soon",
                          description: "Integration templates will be available soon",
                        });
                      }}
                    >
                      <Sparkles className="h-4 w-4" />
                      Templates
                    </Button>
                    <Link href='/support'>
                      <Button className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                        <ArrowRight className="h-4 w-4" />
                        Request Integration
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Enhanced Search and Filters */}
              <Card className="border-0 shadow-sm bg-gradient-to-r from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 p-2 wark:to-slate-900/10">
                <CardContent className="p-2">
                  <div className="flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 wark:text-slate-500" />
                      <Input
                        placeholder="Search integrations by name, category, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 bg-white wark:bg-slate-800 border-slate-200 wark:border-slate-700 focus:border-primary/50 focus:ring-primary/20 text-slate-900 wark:text-white placeholder:text-slate-500 wark:placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full h-full bg-white wark:bg-slate-800 border-slate-200 wark:border-slate-700">
                          <div className="flex items-center h-full gap-2">
                            <Filter className="h-4 w-4 text-slate-500" />
                            <SelectValue className='' placeholder="All Categories" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 border-slate-200 wark:border-slate-700 hover:bg-slate-50 wark:hover:bg-slate-800"
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedCategory('All Categories');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clear all filters</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Featured Integration Spotlight */}
              {searchQuery === '' && selectedCategory === 'All Categories' && (
                <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 via-primary/3 to-blue-500/5 wark:from-primary/10 p-2 wark:via-primary/5 wark:to-blue-500/10 overflow-hidden">
                  <CardContent className="p-2">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-2xl bg-white wark:bg-slate-800 shadow-lg flex items-center justify-center">
                            <img src="/logoonly.png" className="w-16 h-16 object-contain rounded-xl" alt="Zapllo CRM" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-">
                            <Star className="h-4 w-4 text-white fill-white" />
                          </div>

                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-900 wark:text-white">Featured: Zapllo CRM</h3>
                            <Badge className="bg-primary/10 text-primary border-primary/20 wark:bg-primary/20 wark:text-primary-foreground">
                              Official Integration
                            </Badge>
                          </div>
                          <p className="text-slate-600 wark:text-slate-300 mb-4 max-w-2xl">
                            Transform your WhatsApp conversations into qualified leads with our official CRM integration.
                            Seamlessly manage your sales pipeline and boost conversion rates.
                          </p>
                          <div className="flex items-center gap-6 text-sm text-slate-500 wark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>4.9 rating</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>25K+ users</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>5 min setup</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Button
                          onClick={() => router.push('/crm-integration')}
                          size="lg"
                          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        >
                          <Zap className="h-5 w-5 mr-2" />
                          Setup CRM Integration
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                        <p className="text-xs text-center text-slate-500 wark:text-slate-400">No additional cost</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Integrations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIntegrations.map((integration) => (
                  <Card
                    key={integration.id}
                    className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/30 wark:from-muted/40 wark:to-slate-900/10 overflow-hidden"
                    onClick={() => handleCardClick(integration)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <CardHeader className="pb-4 relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white wark:bg-slate-800 shadow-sm">
                              <img src={integration.logo} className='object-contain w-12 h-12 rounded-lg' alt={integration.name} />
                            </div>
                            {integration.status === 'connected' && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                            )}
                            {integration.isInternal && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <Star className="h-3 w-3 text-white fill-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors text-slate-900 wark:text-white">
                                {integration.name}
                              </CardTitle>
                              {integration.isInternal && (
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 wark:bg-primary/20">
                                  Official
                                </Badge>
                              )}
                              {integration.status === 'restricted' && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Shield className="h-4 w-4 text-amber-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs text-sm">{integration.restrictionReason}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs bg-slate-100 wark:bg-slate-800 text-slate-700 wark:text-slate-300 border-slate-200 wark:border-slate-700">
                                {integration.category}
                              </Badge>
                              {integration.rating && (
                                <div className="flex items-center gap-1 text-xs text-slate-500 wark:text-slate-400">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {integration.rating}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 wark:text-slate-500 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 wark:text-slate-400 mt-2">
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

                    <CardContent className="pt-0 relative">
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-50 wark:bg-slate-800/50 rounded-lg border border-slate-200 wark:border-slate-700">
                          <CardDescription className="text-sm leading-relaxed text-slate-700 wark:text-slate-300">
                            {integration.description}
                          </CardDescription>
                        </div>

                        {integration.features && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-slate-700 wark:text-slate-300">Key Features:</h4>
                            <div className="flex flex-wrap gap-1">
                              {integration.features.slice(0, 2).map((feature, index) => (
                                <Badge key={index} variant="secondary" className="text-xs py-1 px-2 bg-blue-100 wark:bg-blue-900/30 text-blue-700 wark:text-blue-300 border-blue-200 wark:border-blue-700">
                                  {feature}
                                </Badge>
                              ))}
                              {integration.features.length > 2 && (
                                <Badge variant="secondary" className="text-xs py-1 px-2 bg-slate-100 wark:bg-slate-800 text-slate-700 wark:text-slate-300 border-slate-200 wark:border-slate-700">
                                  +{integration.features.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 wark:border-slate-700">
                          <div className="flex items-center gap-2 text-xs text-slate-500 wark:text-slate-400">
                            {integration.status === 'available' && <CheckCircle className="h-3 w-3 text-green-500" />}
                            {integration.status === 'connected' && <CheckCircle className="h-3 w-3 text-green-500" />}
                            {integration.status === 'restricted' && <Shield className="h-3 w-3 text-amber-500" />}
                            {integration.status === 'coming_soon' && <Clock className="h-3 w-3 text-blue-500" />}
                            <span className="capitalize">
                              {integration.status === 'coming_soon' ? 'Coming Soon' :
                                integration.status === 'restricted' ? 'Premium' :
                                  integration.status}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-slate-700 wark:text-slate-300">
                            {integration.setupTime}
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    {/* Hover overlay */}
                    <div className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110" />
                  </Card>
                ))}
              </div>

              {/* Enhanced Integration Details Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  {selectedIntegration && (
                    <div className="space-y-6">
                      <DialogHeader>
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white wark:bg-slate-800 shadow-lg">
                              <img src={selectedIntegration.logo} className='object-contain w-12 h-12 rounded-lg' alt={selectedIntegration.name} />
                            </div>
                            {selectedIntegration.status === 'connected' && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                            )}
                            {selectedIntegration.isInternal && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <Star className="h-4 w-4 text-white fill-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <DialogTitle className="text-2xl font-bold mb-2 text-slate-900 wark:text-white">
                              {selectedIntegration.name}
                            </DialogTitle>
                            <div className="flex items-center gap-3 mb-3">
                              <Badge variant="outline" className="bg-slate-100 wark:bg-slate-800 text-slate-700 wark:text-slate-300 border-slate-200 wark:border-slate-700">
                                {selectedIntegration.category}
                              </Badge>
                              {selectedIntegration.isInternal && (
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 wark:bg-primary/20">
                                  Official Integration
                                </Badge>
                              )}
                              {selectedIntegration.rating && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  {selectedIntegration.rating}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500 wark:text-slate-400">
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
                        <div className="p-4 bg-slate-50 wark:bg-slate-800/50 rounded-lg border border-slate-200 wark:border-slate-700">
                          <h3 className="font-semibold mb-2 text-slate-900 wark:text-white">About this integration</h3>
                          <p className="text-sm text-slate-700 wark:text-slate-300 leading-relaxed">
                            {selectedIntegration.detailedDescription || selectedIntegration.description}
                          </p>
                        </div>

                        {selectedIntegration.features && (
                          <div className="p-4 bg-blue-50 wark:bg-blue-900/20 rounded-lg border border-blue-200 wark:border-blue-700">
                            <h3 className="font-semibold mb-3 text-blue-900 wark:text-blue-100 flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Key Features
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {selectedIntegration.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-blue-800 wark:text-blue-200">
                                  <CheckCircle className="h-4 w-4 text-blue-600 wark:text-blue-400 flex-shrink-0" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedIntegration.benefits && (
                          <div className="p-4 bg-green-50 wark:bg-green-900/20 rounded-lg border border-green-200 wark:border-green-700">
                            <h3 className="font-semibold mb-3 text-green-900 wark:text-green-100 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Benefits
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {selectedIntegration.benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-green-800 wark:text-green-200">
                                  <Activity className="h-4 w-4 text-green-600 wark:text-green-400 flex-shrink-0" />
                                  {benefit}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedIntegration.requirements && (
                          <div className="p-4 bg-amber-50 wark:bg-amber-900/20 rounded-lg border border-amber-200 wark:border-amber-700">
                            <h3 className="font-semibold mb-3 text-amber-900 wark:text-amber-100 flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Requirements
                            </h3>
                            <div className="space-y-2">
                              {selectedIntegration.requirements.map((requirement, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-amber-800 wark:text-amber-200">
                                  <div className="w-2 h-2 bg-amber-600 wark:bg-amber-400 rounded-full flex-shrink-0"></div>
                                  {requirement}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedIntegration.status === 'restricted' && (
                          <div className="p-4 bg-red-50 wark:bg-red-900/20 border border-red-200 wark:border-red-700 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="h-4 w-4 text-red-600 wark:text-red-400" />
                              <h4 className="font-medium text-red-800 wark:text-red-200">Upgrade Required</h4>
                            </div>
                            <p className="text-sm text-red-700 wark:text-red-300">
                              {selectedIntegration.restrictionReason}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-3 pt-4 border-t border-slate-200 wark:border-slate-700">
                          {selectedIntegration.hasVideo && (
                            <Button
                              variant="outline"
                              onClick={() => window.open(selectedIntegration.videoUrl, '_blank')}
                              className="flex-1 hover:bg-slate-50 wark:hover:bg-slate-800"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Watch Demo
                            </Button>
                          )}
                          {selectedIntegration.hasInfo && !selectedIntegration.isInternal && (
                            <Button
                              variant="outline"
                              onClick={() => window.open(selectedIntegration.infoUrl, '_blank')}
                              className="flex-1 hover:bg-slate-50 wark:hover:bg-slate-800"
                            >
                              <Info className="h-4 w-4 mr-2" />
                              Learn More
                            </Button>
                          )}
                          <Button
                            onClick={() => handleConnect(selectedIntegration)}
                            variant={getButtonVariant(selectedIntegration)}
                            className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 hover:scale-105 transition-all duration-200"
                            disabled={selectedIntegration.status === 'connected' || selectedIntegration.status === 'coming_soon'}
                          >
                            {selectedIntegration.status === 'connected' && (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            {getButtonText(selectedIntegration)}
                            {(selectedIntegration.status === 'available' || selectedIntegration.isInternal) && (
                              <ArrowRight className="h-4 w-4 ml-2" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Popular Categories */}
              {searchQuery === '' && selectedCategory === 'All Categories' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900 wark:text-white">Popular Categories</h2>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 wark:hover:bg-slate-800">
                      View all categories
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.slice(1, 5).map((category) => {
                      const count = integrations.filter(i => i.category === category).length;
                      const categoryIcon = {
                        'CRM Platform': '🎯',
                        'Payment Provider': '💳',
                        'e-Commerce Platform': '🛒',
                        'Data Storage': '📊'
                      }[category] || '⚡';

                      return (
                        <Card
                          key={category}
                          className="group cursor-pointer border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/30 wark:from-muted/40 wark:to-slate-900/10"
                          onClick={() => setSelectedCategory(category)}
                        >
                          <CardContent className="p-6 text-center">
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                              {categoryIcon}
                            </div>
                            <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2 text-slate-900 wark:text-white">
                              {category}
                            </h3>
                            <p className="text-xs text-slate-500 wark:text-slate-400">
                              {count} integration{count !== 1 ? 's' : ''}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {filteredIntegrations.length === 0 && (
                <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 wark:to-slate-900/10">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="relative mx-auto w-24 h-24 mb-6">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 wark:from-slate-700 wark:to-slate-800 flex items-center justify-center">
                        <Search className="h-12 w-12 text-slate-400 wark:text-slate-500" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                        <X className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-slate-900 wark:text-white">No integrations found</h3>
                    <p className="text-sm text-slate-600 wark:text-slate-400 max-w-md mb-6">
                      We couldn&apos;t find any integrations matching your search criteria. Try adjusting your filters or search terms.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('All Categories');
                        }}
                        className="hover:bg-white wark:hover:bg-slate-800"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear filters
                      </Button>
                      <Link href='/support'>
                        <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Request Integration
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Integration Stats */}


              {/* Request New Integration */}
              <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 wark:from-primary/10 wark:to-primary/20 wark:hover:from-primary/15 wark:hover:to-primary/25 transition-all duration-300">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 wark:bg-primary/20 rounded-xl">
                      <Info className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-slate-900 wark:text-white">Can&apos;t find what you&apos;re looking for?</h3>
                      <p className="text-sm text-slate-600 wark:text-slate-400">
                        Let us know what integration you need and we&apos;ll consider adding it to our marketplace.
                      </p>
                    </div>
                  </div>
                  <Link href='/support'>
                    <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 hover:shadow-lg transition-all duration-200 hover:scale-105">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Request Integration
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </Layout>
  );
}
