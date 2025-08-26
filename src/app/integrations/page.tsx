'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ExternalLink, Play, Info, AlertTriangle, CheckCircle, Zap, ArrowRight, Star, Shield, Clock, Users, ChevronRight, X } from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
          <div className="max-w-7xl mx-auto p-6">
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                          Integrations Marketplace
                        </h1>
                        <p className="text-muted-foreground font-medium">
                          Connect Zaptick with your favorite tools and supercharge your workflow
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
                    <Card key={index} className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
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

              {/* Search and Filters */}
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search integrations by name, category, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[240px] bg-white border-slate-200">
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
                </CardContent>
              </Card>

              {/* Integrations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIntegrations.map((integration) => (
                  <Card
                    key={integration.id}
                    className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm overflow-hidden"
                    onClick={() => handleCardClick(integration)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center">
                              <img src={integration.logo} className='object-contain w-full h-full rounded-xl' alt={integration.name} />
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
                              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                                {integration.name}
                              </CardTitle>
                              {integration.isInternal && (
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
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
                              <Badge variant="outline" className="text-xs">
                                {integration.category}
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
                        <CardDescription className="text-sm leading-relaxed line-clamp-3">
                          {integration.description}
                        </CardDescription>

                        {integration.features && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {integration.features.slice(0, 2).map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs py-1 px-2 bg-slate-100 text-slate-700">
                                {feature}
                              </Badge>
                            ))}
                            {integration.features.length > 2 && (
                              <Badge variant="secondary" className="text-xs py-1 px-2 bg-slate-100 text-slate-700">
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
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center">
                              <img src={selectedIntegration.logo} className='object-cover w-full h-full rounded-xl' alt={selectedIntegration.name} />
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
                            <DialogTitle className="text-2xl font-bold mb-2">
                              {selectedIntegration.name}
                            </DialogTitle>
                            <div className="flex items-center gap-3 mb-3">
                              <Badge variant="outline">{selectedIntegration.category}</Badge>
                              {selectedIntegration.isInternal && (
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
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
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="h-4 w-4 text-amber-600" />
                              <h4 className="font-medium text-amber-800">Upgrade Required</h4>
                            </div>
                            <p className="text-sm text-amber-700">
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
                          {selectedIntegration.hasInfo && !selectedIntegration.isInternal && (
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
                  <Link href='/support'>
                    <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 hover:shadow-lg transition-all duration-200">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Request Integration
                    </Button>
                  </Link>
                </CardContent>
              </Card>

           {/* Empty State */}
              {filteredIntegrations.length === 0 && (
                <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
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
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear filters
                      </Button>
                      <Link href='/support'>
                        <Button>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Request Integration
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Popular Categories */}
              {searchQuery === '' && selectedCategory === 'All Categories' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900">Popular Categories</h2>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
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
                          className="group cursor-pointer border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white/60 backdrop-blur-sm"
                          onClick={() => setSelectedCategory(category)}
                        >
                          <CardContent className="p-6 text-center">
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                              {categoryIcon}
                            </div>
                            <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
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
              )}

              {/* Featured Integration Spotlight */}
              {searchQuery === '' && selectedCategory === 'All Categories' && (
                <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 via-primary/3 to-blue-500/5 overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                            <img src="/logoonly.png" className="w-16 h-16 object-contain rounded-xl" alt="Zapllo CRM" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Star className="h-4 w-4 text-white fill-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-slate-900">Featured: Zapllo CRM</h3>
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              Official Integration
                            </Badge>
                          </div>
                          <p className="text-slate-600 mb-4 max-w-2xl">
                            Transform your WhatsApp conversations into qualified leads with our official CRM integration. 
                            Seamlessly manage your sales pipeline and boost conversion rates.
                          </p>
                          <div className="flex items-center gap-6 text-sm text-slate-500">
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
                          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Zap className="h-5 w-5 mr-2" />
                          Setup CRM Integration
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                        <p className="text-xs text-center text-slate-500">No additional cost</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Integration Stats */}
              {searchQuery === '' && selectedCategory === 'All Categories' && (
                <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">Integration Insights</CardTitle>
                        <CardDescription>
                          Discover how integrations enhance your workflow
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-2xl flex items-center justify-center mx-auto">
                          <Zap className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-lg">Boost Efficiency</h3>
                        <p className="text-sm text-muted-foreground">
                          Save hours every week with automated workflows and seamless data sync
                        </p>
                      </div>
                      
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto">
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-lg">Better Customer Experience</h3>
                        <p className="text-sm text-muted-foreground">
                          Provide faster responses and personalized interactions across all channels
                        </p>
                      </div>
                      
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto">
                          <Star className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-lg">Scale Your Business</h3>
                        <p className="text-sm text-muted-foreground">
                          Handle more customers and grow revenue with powerful automation tools
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </Layout>
  );
}