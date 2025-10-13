'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ExternalLink, Play, Info, CheckCircle, Zap, ArrowRight, Star, Shield, Clock, Users, ChevronRight, X, TrendingUp, Sparkles, Activity, Plus, Loader2, Target, CreditCard, ShoppingCart, Database, Layers, Calendar, Globe, Settings } from 'lucide-react';
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
    id: 'hubspot',
    name: 'HubSpot',
    category: 'CRM Platform',
    description: 'Sync WhatsApp conversations with HubSpot CRM to manage leads, track interactions, and automate follow-ups',
    logo: '/integrations/hubspot.png',
    status: 'restricted',
    restrictionReason: 'HubSpot integration is available only on our Pro plan. Upgrade to connect with HubSpot CRM and sync your contacts automatically.',
    hasVideo: true,
    hasInfo: true,
    videoUrl: 'https://example.com/hubspot-video',
    infoUrl: 'https://hubspot.com',
    setupTime: '15 minutes',
    rating: 4.8,
    usersCount: '180K+',
    detailedDescription: 'Connect your WhatsApp Business with HubSpot to automatically create contacts, log conversations, and trigger marketing workflows based on customer interactions.',
    features: ['Contact synchronization', 'Deal creation', 'Activity logging', 'Marketing automation triggers'],
    benefits: ['Unified customer data', 'Automated lead nurturing', 'Sales pipeline visibility', 'Marketing automation'],
    requirements: ['HubSpot account', 'Pro plan subscription', 'API access'],
    supportedFeatures: ['Contact management', 'Deal tracking', 'Email sequences', 'Reporting']
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM Platform',
    description: 'Integrate WhatsApp with Salesforce to create leads, update opportunities, and track customer interactions',
    logo: '/integrations/salesforce.png',
    status: 'restricted',
    restrictionReason: 'Salesforce integration requires our Enterprise plan. This premium integration includes advanced field mapping and custom object support.',
    hasVideo: true,
    hasInfo: true,
    videoUrl: 'https://example.com/salesforce-video',
    infoUrl: 'https://salesforce.com',
    setupTime: '25 minutes',
    rating: 4.7,
    usersCount: '500K+',
    detailedDescription: 'Powerful Salesforce integration that automatically creates leads from WhatsApp conversations, updates opportunities, and provides comprehensive tracking of customer interactions across your sales funnel.',
    features: ['Lead creation', 'Opportunity updates', 'Custom field mapping', 'Workflow triggers'],
    benefits: ['Complete sales visibility', 'Automated data entry', 'Custom workflows', 'Enterprise-grade security'],
    requirements: ['Salesforce org', 'Enterprise plan', 'System admin access'],
    supportedFeatures: ['Custom objects', 'Apex triggers', 'Field mapping', 'Bulk operations']
  },
  {
    id: 'zoho-crm',
    name: 'Zoho CRM',
    category: 'CRM Platform',
    description: 'Connect WhatsApp with Zoho CRM to manage leads, automate workflows, and track sales performance',
    logo: '/integrations/zohocrm.png',
    status: 'restricted',
    restrictionReason: 'Zoho CRM integration is available on Pro and Enterprise plans. Upgrade to sync contacts and automate your sales process.',
    hasVideo: true,
    hasInfo: true,
    videoUrl: 'https://example.com/zoho-video',
    infoUrl: 'https://zoho.com/crm',
    setupTime: '12 minutes',
    rating: 4.6,
    usersCount: '85K+',
    detailedDescription: 'Seamlessly integrate WhatsApp with Zoho CRM to convert conversations into leads, track customer journey, and automate sales workflows for better conversion rates.',
    features: ['Lead management', 'Contact sync', 'Deal tracking', 'Automation rules'],
    benefits: ['Streamlined sales process', 'Better lead qualification', 'Automated follow-ups', 'Performance analytics'],
    requirements: ['Zoho CRM account', 'Pro plan or higher', 'API permissions'],
    supportedFeatures: ['Leads', 'Contacts', 'Deals', 'Custom fields']
  },
  {
    id: 'whatsapp-pay',
    name: 'WhatsApp Pay',
    category: 'Payment Provider',
    description: 'Create a frictionless payment experience on WhatsApp to improve conversions',
    logo: '/integrations/whatsapp.webp',
    status: 'restricted',
    restrictionReason: 'WhatsApp Pay integration requires our Pro plan to enable seamless payment processing within WhatsApp conversations.',
    hasVideo: true,
    videoUrl: '',
    setupTime: '10 minutes',
    rating: 4.8,
    usersCount: '45K+',
    detailedDescription: 'WhatsApp Pay integration allows your customers to make seamless payments directly within WhatsApp conversations, reducing cart abandonment and increasing conversion rates.',
    features: ['Instant payment processing', 'Secure UPI integration', 'Real-time payment status', 'Automated receipts'],
    benefits: ['Reduced cart abandonment', 'Faster checkout process', 'Increased customer trust', 'Higher conversion rates'],
    requirements: ['Active WhatsApp Business Account', 'Valid business verification', 'Pro plan subscription'],
    supportedFeatures: ['Payment links', 'Order confirmation', 'Refund processing', 'Transaction tracking']
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    category: 'Payment Provider',
    description: 'When customers send WhatsApp carts, send payment links automatically in a checkout botflow',
    logo: '/integrations/razorpay.png',
    status: 'restricted',
    restrictionReason: 'Razorpay integration is available on our Pro plan. Upgrade to enable automated payment links and seamless checkout workflows.',
    hasVideo: true,
    videoUrl: 'https://example.com/razorpay-video',
    setupTime: '10 minutes',
    rating: 4.7,
    usersCount: '120K+',
    detailedDescription: 'Razorpay integration enables automatic payment link generation and seamless checkout experience for your WhatsApp commerce with support for multiple payment methods.',
    features: ['Automated payment links', 'Multi-payment options', 'Real-time notifications', 'Subscription billing'],
    benefits: ['Streamlined checkout', 'Higher conversion rates', 'Better customer experience', 'Automated invoicing'],
    requirements: ['Razorpay account', 'API keys configuration', 'Pro plan subscription'],
    supportedFeatures: ['Payment gateway', 'Subscription billing', 'Refund management', 'Analytics dashboard']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Payment Provider',
    description: 'Accept payments through WhatsApp using Stripe\'s secure payment processing infrastructure',
    logo: '/integrations/stripe.png',
    status: 'restricted',
    restrictionReason: 'Stripe integration requires our Pro plan for secure payment processing and automated checkout workflows.',
    hasVideo: true,
    hasInfo: true,
    videoUrl: 'https://example.com/stripe-video',
    infoUrl: 'https://stripe.com',
    setupTime: '15 minutes',
    rating: 4.9,
    usersCount: '200K+',
    detailedDescription: 'Integrate Stripe with WhatsApp to accept payments globally, handle subscriptions, and provide customers with a secure, seamless payment experience directly in chat.',
    features: ['Global payment processing', 'Subscription management', 'Automated invoicing', 'Advanced fraud protection'],
    benefits: ['Global reach', 'Enhanced security', 'Subscription support', 'Developer-friendly APIs'],
    requirements: ['Stripe account', 'Pro plan subscription', 'SSL certificate'],
    supportedFeatures: ['Credit cards', 'Digital wallets', 'Bank transfers', 'Subscriptions']
  },
  {
    id: 'cashfree',
    name: 'Cashfree',
    category: 'Payment Provider',
    description: 'Enable UPI, card, and wallet payments through WhatsApp using Cashfree\'s payment gateway',
    logo: '/integrations/cf.png',
    status: 'restricted',
    restrictionReason: 'Cashfree integration is available on our Pro plan to enable comprehensive payment solutions for Indian businesses.',
    hasVideo: true,
    hasInfo: true,
    videoUrl: 'https://example.com/cashfree-video',
    infoUrl: 'https://cashfree.com',
    setupTime: '12 minutes',
    rating: 4.6,
    usersCount: '75K+',
    detailedDescription: 'Cashfree integration provides comprehensive payment solutions for Indian businesses, supporting UPI, cards, wallets, and net banking through WhatsApp.',
    features: ['UPI payments', 'Card processing', 'Wallet integration', 'Net banking support'],
    benefits: ['India-focused features', 'Multiple payment methods', 'Competitive pricing', 'Local support'],
    requirements: ['Cashfree account', 'Indian business registration', 'Pro plan subscription'],
    supportedFeatures: ['UPI', 'Cards', 'Wallets', 'Net banking']
  },
  {
    id: 'payu',
    name: 'PayU',
    category: 'Payment Provider',
    description: 'When customers send WhatsApp carts, send payment links automatically in a auto-checkout workflow',
    logo: '/integrations/payu.png',
    status: 'restricted',
    restrictionReason: 'PayU integration requires our Pro plan for automated checkout workflows and payment processing capabilities.',
    hasVideo: true,
    videoUrl: 'https://example.com/payu-video',
    setupTime: '8 minutes',
    rating: 4.6,
    usersCount: '95K+',
    detailedDescription: 'PayU integration provides robust payment processing capabilities with automated checkout workflows for WhatsApp commerce, supporting multiple payment methods and currencies.',
    features: ['Auto-checkout workflows', 'Multiple payment methods', 'Fraud protection', 'Multi-currency support'],
    benefits: ['Secure transactions', 'Global payment support', 'Easy integration', 'Risk management'],
    requirements: ['PayU merchant account', 'Business verification', 'Pro plan subscription'],
    supportedFeatures: ['Payment processing', 'Recurring payments', 'Analytics dashboard', 'Risk management']
  },
  {
    id: 'shopify-sales',
    name: 'Shopify',
    category: 'e-Commerce Platform',
    description: 'Auto-sync Shopify products & collections to WhatsApp and enable seamless shopping experience',
    logo: '/integrations/shopify.png',
    status: 'restricted',
    restrictionReason: 'Shopify integration is available on our Pro plan. Sync your products and enable WhatsApp commerce with advanced features.',
    hasVideo: true,
    videoUrl: 'https://example.com/shopify-video',
    setupTime: '15 minutes',
    rating: 4.9,
    usersCount: '300K+',
    detailedDescription: 'Shopify Sales Channel integration automatically syncs your products and collections to WhatsApp, enabling seamless catalog browsing, cart management, and order processing.',
    features: ['Product sync', 'Inventory management', 'Order tracking', 'Cart abandonment recovery'],
    benefits: ['Unified catalog', 'Real-time inventory', 'Streamlined operations', 'Increased sales'],
    requirements: ['Shopify store', 'Admin access', 'Pro plan subscription'],
    supportedFeatures: ['Product catalog', 'Order management', 'Customer data sync', 'Inventory tracking']
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    category: 'e-Commerce Platform',
    description: 'Connect your WooCommerce store with WhatsApp for automated order notifications and customer support',
    logo: '/integrations/woo.png',
    status: 'restricted',
    restrictionReason: 'WooCommerce integration requires our Pro plan to enable product sync and automated order management.',
    hasVideo: true,
    hasInfo: true,
    videoUrl: 'https://example.com/woocommerce-video',
    infoUrl: 'https://woocommerce.com',
    setupTime: '20 minutes',
    rating: 4.7,
    usersCount: '150K+',
    detailedDescription: 'Integrate WooCommerce with WhatsApp to sync products, automate order notifications, handle customer inquiries, and provide seamless shopping experience.',
    features: ['Product synchronization', 'Order notifications', 'Customer support integration', 'Abandoned cart recovery'],
    benefits: ['Enhanced customer experience', 'Automated communications', 'Increased conversions', 'Better support'],
    requirements: ['WooCommerce store', 'WordPress admin access', 'Pro plan subscription'],
    supportedFeatures: ['Products', 'Orders', 'Customers', 'Inventory']
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    category: 'Data Storage',
    description: 'Send automatic WhatsApp notifications whenever a new row is added in a sheet and sync contact data',
    logo: '/integrations/sheets.png',
    status: 'restricted',
    restrictionReason: 'Google Sheets integration is available on our Pro plan. Automate data workflows and sync contacts seamlessly.',
    hasInfo: true,
    infoUrl: 'https://developers.google.com/sheets',
    setupTime: '8 minutes',
    rating: 4.5,
    usersCount: '200K+',
    detailedDescription: 'Google Sheets integration enables automatic WhatsApp notifications based on spreadsheet changes, contact data synchronization, and workflow automation perfect for lead management.',
    features: ['Real-time triggers', 'Data synchronization', 'Custom notifications', 'Bulk contact import'],
    benefits: ['Automated workflows', 'Easy data management', 'No coding required', 'Real-time updates'],
    requirements: ['Google account', 'Sheet access permissions', 'Pro plan subscription'],
    supportedFeatures: ['Row-based triggers', 'Data validation', 'Bulk operations', 'Custom formatting']
  },
  {
    id: 'facebook-leads',
    name: 'Facebook Lead Ads',
    category: 'Ads Platform',
    description: 'Automatically send WhatsApp messages to new Facebook lead ad submissions for instant follow-up',
    logo: '/integrations/facebook.webp',
    status: 'restricted',
    restrictionReason: 'Facebook Lead Ads integration requires our Pro plan to enable automated lead follow-up and conversion optimization.',
    hasVideo: true,
    hasInfo: true,
    videoUrl: 'https://example.com/facebook-video',
    infoUrl: 'https://facebook.com/business',
    setupTime: '18 minutes',
    rating: 4.8,
    usersCount: '120K+',
    detailedDescription: 'Connect Facebook Lead Ads with WhatsApp to instantly follow up with new leads, send welcome messages, and guide prospects through your sales funnel automatically.',
    features: ['Instant lead notifications', 'Automated follow-up messages', 'Lead qualification flows', 'Conversion tracking'],
    benefits: ['Faster lead response', 'Higher conversion rates', 'Automated nurturing', 'Better ROI'],
    requirements: ['Facebook Business account', 'Active ad campaigns', 'Pro plan subscription'],
    supportedFeatures: ['Lead forms', 'Custom questions', 'Audience targeting', 'Campaign tracking']
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'Automation Platform',
    description: 'Connect WhatsApp with 5000+ apps through Zapier for advanced workflow automation',
    logo: '/integrations/zapier.jpeg',
    status: 'restricted',
    restrictionReason: 'Zapier integration is available on our Pro plan. Connect with thousands of apps and create powerful automation workflows.',
    hasVideo: true,
    hasInfo: true,
    videoUrl: 'https://example.com/zapier-video',
    infoUrl: 'https://zapier.com',
    setupTime: '10 minutes',
    rating: 4.7,
    usersCount: '400K+',
    detailedDescription: 'Zapier integration opens up endless possibilities by connecting WhatsApp with over 5000 applications, enabling complex workflow automation without coding.',
    features: ['5000+ app connections', 'Multi-step workflows', 'Conditional logic', 'Data transformation'],
    benefits: ['Unlimited possibilities', 'No coding required', 'Time savings', 'Process automation'],
    requirements: ['Zapier account', 'Target app accounts', 'Pro plan subscription'],
    supportedFeatures: ['Triggers', 'Actions', 'Filters', 'Webhooks']
  },
  {
    id: 'integromat',
    name: 'Make (Integromat)',
    category: 'Automation Platform',
    description: 'Create complex automation scenarios connecting WhatsApp with multiple apps and services',
    logo: '/integrations/make.jpg',
    status: 'restricted',
    restrictionReason: 'Make integration requires our Pro plan for advanced automation scenarios and complex workflow management.',
    hasVideo: true,
    hasInfo: true,
    videoUrl: 'https://example.com/make-video',
    infoUrl: 'https://make.com',
    setupTime: '15 minutes',
    rating: 4.6,
    usersCount: '85K+',
    detailedDescription: 'Make (formerly Integromat) integration enables sophisticated automation scenarios with visual workflow builder, connecting WhatsApp to hundreds of services with advanced logic.',
    features: ['Visual workflow builder', 'Advanced routing', 'Error handling', 'Data manipulation'],
    benefits: ['Complex automations', 'Visual design', 'Error recovery', 'Detailed logging'],
    requirements: ['Make account', 'Pro plan subscription', 'Target service accounts'],
    supportedFeatures: ['Scenarios', 'Routers', 'Filters', 'Functions']
  },
  {
    id: 'pabbly-connect',
    name: 'Pabbly Connect',
    category: 'Automation Platform',
    description: 'Automate WhatsApp workflows by connecting with popular business applications through Pabbly',
    logo: '/integrations/pabbly.svg',
    status: 'restricted',
    restrictionReason: 'Pabbly Connect integration is available on our Pro plan. Enable workflow automation with hundreds of business applications.',
    hasVideo: true,
    hasInfo: true,
    videoUrl: 'https://example.com/pabbly-video',
    infoUrl: 'https://pabbly.com/connect',
    setupTime: '12 minutes',
    rating: 4.5,
    usersCount: '60K+',
    detailedDescription: 'Pabbly Connect integration provides affordable automation solutions, connecting WhatsApp with popular business apps for streamlined workflows and data synchronization.',
    features: ['Multi-app workflows', 'Data mapping', 'Conditional workflows', 'Real-time sync'],
    benefits: ['Cost-effective automation', 'Easy setup', 'Reliable execution', 'Good support'],
    requirements: ['Pabbly Connect account', 'Pro plan subscription', 'Connected app accounts'],
    supportedFeatures: ['Workflows', 'Triggers', 'Actions', 'Data filters']
  },
  {
    id: 'calendly',
    name: 'Calendly',
    category: 'Scheduling Platform',
    description: 'Send WhatsApp notifications for new Calendly bookings and automate appointment confirmations',
    logo: '/integrations/calendly.png',
    status: 'restricted',
    restrictionReason: 'Calendly integration requires our Pro plan to enable automated appointment notifications and booking management.',
    hasVideo: true,
    hasInfo: true,
    videoUrl: 'https://example.com/calendly-video',
    infoUrl: 'https://calendly.com',
    setupTime: '10 minutes',
    rating: 4.8,
    usersCount: '95K+',
    detailedDescription: 'Calendly integration automates appointment-related communications through WhatsApp, sending booking confirmations, reminders, and follow-up messages to improve show rates.',
    features: ['Booking notifications', 'Appointment reminders', 'Cancellation alerts', 'Follow-up automation'],
    benefits: ['Improved show rates', 'Better communication', 'Automated reminders', 'Enhanced experience'],
    requirements: ['Calendly account', 'Pro plan subscription', 'Calendar access'],
    supportedFeatures: ['Event types', 'Booking forms', 'Reminders', 'Cancellations']
  },
  {
    id: 'judgeme',
    name: 'Judge.me',
    category: 'Product Review Platform',
    description: 'Create/Update a Review on Judge.me when a customer completes a Feedback workflow on WhatsApp',
    logo: '/integrations/judge.webp',
    status: 'restricted',
    restrictionReason: 'Judge.me integration is available on our Pro plan. Automate review collection and boost your store\'s social proof.',
    hasInfo: true,
    infoUrl: 'https://judge.me/api',
    setupTime: '20 minutes',
    rating: 4.4,
    usersCount: '35K+',
    detailedDescription: 'Judge.me integration helps you collect and manage customer reviews through WhatsApp feedback workflows, automatically requesting reviews and boosting your store\'s credibility.',
    features: ['Review collection', 'Automated follow-ups', 'Rating management', 'Photo reviews'],
    benefits: ['Increased social proof', 'Higher conversion rates', 'Customer insights', 'Better SEO'],
    requirements: ['Judge.me account', 'Pro plan subscription', 'Store integration'],
    supportedFeatures: ['Review requests', 'Photo reviews', 'Review analytics', 'Incentives']
  },
];

const categories = [
  'All Categories',
  'CRM Platform',
  'Payment Provider',
  'e-Commerce Platform',
  'Automation Platform',
  'Data Storage',
  'Ads Platform',
  'Helpdesk Platform',
  'Billing Platform',
  'Product Review Platform',
  'Scheduling Platform',
  'Accounting Software'
];

export default function IntegrationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [filteredIntegrations, setFilteredIntegrations] = useState(integrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    let filtered = integrations;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(integration =>
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.features?.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
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

    if (integration.status === 'coming_soon') {
      toast({
        title: "Coming Soon",
        description: `${integration.name} integration will be available soon. Stay tuned!`,
        variant: "default"
      });
      return;
    }

    setConnecting(integration.id);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

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
    } finally {
      setConnecting(null);
    }
  };

  const openIntegrationDialog = (integration: Integration) => {
    if (integration.isInternal && integration.internalRoute) {
      router.push(integration.internalRoute);
      return;
    }
    setSelectedIntegration(integration);
    setIsDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'restricted':
        return <Shield className="h-4 w-4 text-amber-500" />;
      case 'coming_soon':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'restricted':
        return 'Premium';
      case 'coming_soon':
        return 'Coming Soon';
      default:
        return 'Available';
    }
  };

  const getButtonText = (integration: Integration) => {
    if (connecting === integration.id) return 'Connecting...';
    if (integration.isInternal) return 'Setup Integration';
    if (integration.status === 'connected') return 'Connected';
    if (integration.status === 'coming_soon') return 'Coming Soon';
    if (integration.status === 'restricted') return 'Upgrade Required';
    return 'Connect Now';
  };

  return (
    <Layout>
      <TooltipProvider>
        <div className="space-y-8 p-10  pb-12">
          {/* Modern Header */}
          <div className="group w-full relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-primary/5 p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 wark:from-muted/40 wark:to-primary/10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 wark:text-white mb-2">
                      Integration Marketplace
                    </h1>
                    <p className="text-slate-600 wark:text-slate-300 leading-relaxed">
                      Connect ZapTick with your favorite tools and supercharge your workflow
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium text-slate-700 wark:text-slate-300">
                      {integrations.length} integrations available
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                   <span className="font-medium text-slate-700 wark:text-slate-300">
                      {categories.length - 1} categories
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-medium text-slate-700 wark:text-slate-300">
                      All systems online
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" className="gap-2 border-slate-200 wark:border-slate-700 hover:border-primary/30 wark:hover:border-primary/60 hover:bg-primary/5 wark:hover:bg-primary/10">
                  <Sparkles className="h-4 w-4" />
                  Coming Soon
                </Button>
                <Link href='/support'>
                  <Button className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                    <Plus className="h-4 w-4" />
                    Request Integration
                  </Button>
                </Link>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 transition-all duration-300 group-hover:scale-110" />
          </div>

          {/* Search and Filters */}
          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-r from-white to-slate-50/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 wark:text-slate-500" />
                <Input
                  placeholder="Search integrations, features, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white wark:bg-slate-800 border-slate-200 wark:border-slate-700 focus:border-primary/50 focus:ring-primary/20 text-slate-900 wark:text-white placeholder:text-slate-500 wark:placeholder:text-slate-400 text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 wark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[220px] h-12 bg-white wark:bg-slate-800 border-slate-200 wark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-slate-500" />
                      <SelectValue placeholder="All Categories" />
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

                {(searchQuery || selectedCategory !== 'All Categories') && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="h-12 px-4 border-slate-200 wark:border-slate-700 hover:bg-slate-50 wark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-slate-500/10 transition-all duration-300 group-hover:scale-110" />
          </div>

          {/* Featured Integration */}
          {searchQuery === '' && selectedCategory === 'All Categories' && (
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:from-muted/40 wark:to-green-900/10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-start gap-6 flex-1">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-white wark:bg-slate-800 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Image src="/logoonly.png" width={64} height={64} className="object-contain rounded-xl" alt="Zapllo CRM" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <Star className="h-4 w-4 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-slate-900 wark:text-white">Featured: Zapllo CRM</h3>
                      <Badge className="bg-primary/10 text-primary border-primary/20 wark:bg-primary/20 wark:text-primary-foreground">
                        Official Integration
                      </Badge>
                      <Badge className="bg-green-100 wark:bg-green-900/30 text-green-700 wark:text-green-300 border-green-200 wark:border-green-700">
                        Free
                      </Badge>
                    </div>
                    <p className="text-slate-600 wark:text-slate-300 mb-4 leading-relaxed text-lg">
                      Transform your WhatsApp conversations into qualified leads with our official CRM integration.
                      Seamlessly manage your sales pipeline and boost conversion rates.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-slate-500 wark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">4.9 rating</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">25K+ users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">5 min setup</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">No additional cost</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => router.push('/crm-integration')}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 px-8 py-4"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Setup Integration
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              {/* Decorative element */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
            </div>
          )}

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <Card
                key={integration.id}
                className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/30 wark:from-muted/40 wark:to-slate-900/10 overflow-hidden"
                onClick={() => openIntegrationDialog(integration)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <CardHeader className="pb-4 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white wark:bg-slate-800 shadow-sm group-hover:scale-110 transition-transform duration-300">
                          <Image src={integration.logo} width={48} height={48} className='object-contain rounded-lg' alt={integration.name} />
                        </div>
                        {integration.status === 'connected' && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                        {integration.isInternal && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                            <Star className="h-4 w-4 text-white fill-white" />
                          </div>
                        )}
                        {integration.status === 'restricted' && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                            <Shield className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors text-slate-900 wark:text-white leading-tight">
                          {integration.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs bg-slate-100 wark:bg-slate-800 text-slate-700 wark:text-slate-300 border-slate-200 wark:border-slate-700">
                            {integration.category}
                          </Badge>
                          {integration.isInternal && (
                            <Badge variant="outline" className="text-xs bg-green-100 wark:bg-green-900/30 text-green-700 wark:text-green-300 border-green-200 wark:border-green-700">
                              Free
                            </Badge>
                          )}
                          {integration.status === 'restricted' && (
                            <Badge variant="outline" className="text-xs bg-amber-100 wark:bg-amber-900/30 text-amber-700 wark:text-amber-300 border-amber-200 wark:border-amber-700">
                              Pro Plan
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 wark:text-slate-500 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-500 wark:text-slate-400">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(integration.status)}
                      <span className="font-medium">{getStatusLabel(integration.status)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{integration.setupTime || '10 min'}</span>
                    </div>
                    {integration.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{integration.rating}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0 relative">
                  <div className="space-y-4">
                    <CardDescription className="text-sm leading-relaxed text-slate-700 wark:text-slate-300 line-clamp-3">
                      {integration.description}
                    </CardDescription>

                    {integration.features && (
                      <div className="flex flex-wrap gap-1">
                        {integration.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs py-1 px-2 bg-blue-100 wark:bg-blue-900/30 text-blue-700 wark:text-blue-300 border-blue-200 wark:border-blue-700">
                            {feature}
                          </Badge>
                        ))}
                        {integration.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs py-1 px-2 bg-slate-100 wark:bg-slate-800 text-slate-700 wark:text-slate-300 border-slate-200 wark:border-slate-700">
                            +{integration.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Hover overlay */}
                <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 pointer-events-none" />
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredIntegrations.length === 0 && (
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 p-12 shadow-sm text-center transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10">
              <div className="mx-auto max-w-md space-y-6">
                <div className="flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 wark:bg-slate-800">
                    <Search className="h-10 w-10 text-slate-400 wark:text-slate-500" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-900 wark:text-white">No integrations found</h3>
                  <p className="text-slate-600 wark:text-slate-300 leading-relaxed">
                    We couldn't find any integrations matching your search criteria. Try adjusting your filters or search terms.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="hover:bg-slate-50 wark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear filters
                  </Button>
                  <Link href='/support'>
                    <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80">
                      <Plus className="h-4 w-4 mr-2" />
                      Request Integration
                    </Button>
                  </Link>
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-slate-500/10 transition-all duration-300 group-hover:scale-110" />
            </div>
          )}

          {/* Popular Categories - Show only when no filters */}
          {searchQuery === '' && selectedCategory === 'All Categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 wark:text-white">Popular Categories</h2>
                    <p className="text-sm text-slate-600 wark:text-slate-300">Explore integrations by category</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.slice(1, 5).map((category) => {
                  const count = integrations.filter(i => i.category === category).length;
                  const categoryData = {
                    'CRM Platform': {
                      icon: Target,
                      color: 'from-blue-500 to-blue-600',
                      bgColor: 'bg-blue-50 wark:bg-blue-900/20',
                      borderColor: 'border-blue-200 wark:border-blue-700'
                    },
                    'Payment Provider': {
                      icon: CreditCard,
                      color: 'from-green-500 to-green-600',
                      bgColor: 'bg-green-50 wark:bg-green-900/20',
                      borderColor: 'border-green-200 wark:border-green-700'
                    },
                    'e-Commerce Platform': {
                      icon: ShoppingCart,
                      color: 'from-purple-500 to-purple-600',
                      bgColor: 'bg-purple-50 wark:bg-purple-900/20',
                      borderColor: 'border-purple-200 wark:border-purple-700'
                    },
                    'Automation Platform': {
                      icon: Settings,
                      color: 'from-orange-500 to-orange-600',
                      bgColor: 'bg-orange-50 wark:bg-orange-900/20',
                      borderColor: 'border-orange-200 wark:border-orange-700'
                    }
                  }[category] || {
                    icon: Layers,
                    color: 'from-slate-500 to-slate-600',
                    bgColor: 'bg-slate-50 wark:bg-slate-800/50',
                    borderColor: 'border-slate-200 wark:border-slate-700'
                  };

                  const IconComponent = categoryData.icon;

                  return (
                    <Card
                      key={category}
                      className={`group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/30 wark:from-muted/40 wark:to-slate-900/10 overflow-hidden`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <CardContent className="p-6 text-center relative">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${categoryData.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <IconComponent className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2 text-slate-900 wark:text-white">
                          {category}
                        </h3>
                        <p className="text-xs text-slate-500 wark:text-slate-400 font-medium">
                          {count} integration{count !== 1 ? 's' : ''}
                        </p>

                        {/* Decorative element */}
                        <div className={`absolute -right-4 -top-4 h-8 w-8 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br ${categoryData.color}`} />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Integration Details Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
              {selectedIntegration && (
                <>
                  {/* Header - Fixed */}
                  <DialogHeader className="flex-shrink-0 pb-4 border-b border-slate-200 wark:border-slate-700">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-white wark:bg-slate-800 shadow-lg">
                          <Image
                            src={selectedIntegration.logo}
                            width={56}
                            height={56}
                            className='object-contain rounded-lg'
                            alt={selectedIntegration.name}
                          />
                        </div>
                        {selectedIntegration.status === 'connected' && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                        )}
                        {selectedIntegration.isInternal && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                            <Star className="h-5 w-5 text-white fill-white" />
                          </div>
                        )}
                        {selectedIntegration.status === 'restricted' && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <DialogTitle className="text-2xl font-bold text-slate-900 wark:text-white">
                            {selectedIntegration.name}
                          </DialogTitle>
                          {selectedIntegration.isInternal && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 wark:bg-primary/20">
                              Official Integration
                            </Badge>
                          )}
                          {selectedIntegration.isInternal ? (
                            <Badge className="bg-green-100 wark:bg-green-900/30 text-green-700 wark:text-green-300 border-green-200 wark:border-green-700">
                              Free
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 wark:bg-amber-900/20 text-amber-700 wark:text-amber-300 border-amber-200 wark:border-amber-700">
                              Pro Plan Required
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="bg-slate-100 wark:bg-slate-800 text-slate-700 wark:text-slate-300 border-slate-200 wark:border-slate-700">
                            {selectedIntegration.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-slate-500 wark:text-slate-400">
                            {getStatusIcon(selectedIntegration.status)}
                            <span>{getStatusLabel(selectedIntegration.status)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-500 wark:text-slate-400">
                          {selectedIntegration.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{selectedIntegration.rating}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">{selectedIntegration.usersCount || '1K+'} users</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">{selectedIntegration.setupTime || '10 min'} setup</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogHeader>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto py-6 space-y-6">
                    {/* Description */}
                    <div className="p-4 bg-slate-50 wark:bg-slate-800/50 rounded-xl border border-slate-200 wark:border-slate-700">
                      <h3 className="font-semibold mb-3 text-slate-900 wark:text-white flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        About this integration
                      </h3>
                      <p className="text-sm text-slate-700 wark:text-slate-300 leading-relaxed">
                        {selectedIntegration.detailedDescription || selectedIntegration.description}
                      </p>
                    </div>

                    {/* Features */}
                    {selectedIntegration.features && (
                      <div className="p-4 bg-blue-50 wark:bg-blue-900/20 rounded-xl border border-blue-200 wark:border-blue-700">
                        <h3 className="font-semibold mb-3 text-blue-900 wark:text-blue-100 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Key Features
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedIntegration.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-blue-800 wark:text-blue-200">
                              <CheckCircle className="h-4 w-4 text-blue-600 wark:text-blue-400 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Benefits */}
                    {selectedIntegration.benefits && (
                      <div className="p-4 bg-green-50 wark:bg-green-900/20 rounded-xl border border-green-200 wark:border-green-700">
                        <h3 className="font-semibold mb-3 text-green-900 wark:text-green-100 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Benefits
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedIntegration.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-green-800 wark:text-green-200">
                              <Activity className="h-4 w-4 text-green-600 wark:text-green-400 flex-shrink-0" />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Requirements */}
                    {selectedIntegration.requirements && (
                      <div className="p-4 bg-amber-50 wark:bg-amber-900/20 rounded-xl border border-amber-200 wark:border-amber-700">
                     <h3 className="font-semibold mb-3 text-amber-900 wark:text-amber-100 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Requirements
                        </h3>
                        <div className="space-y-2">
                          {selectedIntegration.requirements.map((requirement, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-amber-800 wark:text-amber-200">
                              <div className="w-2 h-2 bg-amber-600 wark:bg-amber-400 rounded-full flex-shrink-0" />
                              <span>{requirement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Restriction Notice */}
                    {selectedIntegration.status === 'restricted' && (
                      <div className="p-4 bg-red-50 wark:bg-red-900/20 border border-red-200 wark:border-red-700 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-red-600 wark:text-red-400" />
                          <h4 className="font-semibold text-red-800 wark:text-red-200">Pro Plan Required</h4>
                        </div>
                        <p className="text-sm text-red-700 wark:text-red-300 mb-4">
                          {selectedIntegration.restrictionReason}
                        </p>
                        <Link href="/wallet/plans">
                          <Button size="sm" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Upgrade to Pro Plan
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Fixed Action Buttons */}
                  <div className="flex-shrink-0 pt-4 border-t border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      {selectedIntegration.hasVideo && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (selectedIntegration.videoUrl) {
                              window.open(selectedIntegration.videoUrl, '_blank');
                            }
                          }}
                          className="flex-1 hover:bg-slate-50 wark:hover:bg-slate-800 border-slate-200 wark:border-slate-700"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch Demo
                        </Button>
                      )}

                      {selectedIntegration.hasInfo && !selectedIntegration.isInternal && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (selectedIntegration.infoUrl) {
                              window.open(selectedIntegration.infoUrl, '_blank');
                            }
                          }}
                          className="flex-1 hover:bg-slate-50 wark:hover:bg-slate-800 border-slate-200 wark:border-slate-700"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Learn More
                        </Button>
                      )}

                      <Button
                        onClick={() => handleConnect(selectedIntegration)}
                        className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                        disabled={connecting === selectedIntegration.id || selectedIntegration.status === 'connected'}
                      >
                        {connecting === selectedIntegration.id && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        {selectedIntegration.status === 'connected' && (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {getButtonText(selectedIntegration)}
                        {(selectedIntegration.status === 'available' || selectedIntegration.isInternal) && connecting !== selectedIntegration.id && (
                          <ArrowRight className="h-4 w-4 ml-2" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Upgrade Plan Banner */}


          {/* Request Integration CTA */}
          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-r from-slate-50 to-slate-100/50 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-slate-800/50 wark:to-slate-900/50 wark:hover:border-slate-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 wark:bg-slate-800 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-6 w-6 text-slate-600 wark:text-slate-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1 text-slate-900 wark:text-white">Can't find what you're looking for?</h3>
                  <p className="text-sm text-slate-600 wark:text-slate-400 leading-relaxed">
                    Let us know what integration you need and we'll consider adding it to our marketplace.
                  </p>
                </div>
              </div>
              <Link href='/support'>
                <Button size="lg" variant="outline" className="border-slate-200 wark:border-slate-700 hover:bg-slate-50 wark:hover:bg-slate-800 px-8">
                  <Plus className="h-4 w-4 mr-2" />
                  Request Integration
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-slate-500/10 transition-all duration-300 group-hover:scale-110" />
          </div>
        </div>
      </TooltipProvider>
    </Layout>
  );
}
