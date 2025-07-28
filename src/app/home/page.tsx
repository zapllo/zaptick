'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Phone,
  CheckCircle2 as CheckCircle,
  RefreshCw,
  Instagram,
  ArrowRight,
  Users,
  MessageSquare,
  FolderKanban,
  ShoppingCart,
  Bot,
  BookOpen,
  AlertCircle,
  Loader2,
  ExternalLink,
  ActivitySquare,
  AlertTriangle,
  CheckCircle as CheckIcon,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';

interface UserData {
  id: string;
  name: string;
  email: string;
  wabaAccounts: {
    wabaId: string;
    phoneNumberId: string;
    businessName: string;
    phoneNumber: string;
    connectedAt: Date;
    status: 'active' | 'disconnected' | 'pending';
    isvNameToken: string;
    templateCount?: number;
  }[];
}

interface HealthStatus {
  phoneNumbers: {
    id: string;
    phoneNumber: string;
    verified: boolean;
    status: string;
    qualityRating: string;
  }[];
}

export default function HomePage() {
  /* ------------------------------------------------------------------ */
  /*  Local state                                                       */
  /* ------------------------------------------------------------------ */
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'instagram'>('whatsapp');
  const [activeWhatsAppFeature, setActiveWhatsAppFeature] = useState(0);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* ------------------------------------------------------------------ */
  /*  Fetch user data on component mount                                */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();

        console.log('Fetched user data:', data.user); // Debug log
        console.log('WABA Accounts:', data.user.wabaAccounts); // Debug log

        setUser(data.user);

        // If user has at least one WABA account, set it as selected and fetch health status
        if (data.user.wabaAccounts && data.user.wabaAccounts.length > 0) {
          const firstWaba = data.user.wabaAccounts[0];
          console.log('First WABA:', firstWaba); // Debug log
          console.log('WABA ID to fetch:', firstWaba.wabaId); // Debug log

          // setSelectedWabaId(firstWaba.wabaId);
          fetchHealthStatus(firstWaba.wabaId);
        } else {
          console.log('No WABA accounts found'); // Debug log
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user data. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Fetch health status                                               */
  /* ------------------------------------------------------------------ */
  const fetchHealthStatus = async (wabaId: string) => {
    console.log('fetchHealthStatus called with wabaId:', wabaId); // Debug log

    if (!wabaId) {
      console.error('No WABA ID provided to fetchHealthStatus');
      toast({
        title: "Error",
        description: "No WABA ID available to check health status",
        variant: "destructive"
      });
      return;
    }

    setLoadingHealth(true);
    try {
      const url = `/api/waba/health?wabaId=${encodeURIComponent(wabaId)}`;
      console.log('Fetching health from URL:', url); // Debug log

      const response = await fetch(url);

      console.log('Health API response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Health API error:', errorData); // Debug log
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch health status`);
      }

      const data = await response.json();
      console.log('Health API response data:', data); // Debug log

      setHealthStatus(data.healthStatus);

      if (data.healthStatus.error) {
        toast({
          title: "Warning",
          description: data.healthStatus.error,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error fetching health status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch WhatsApp health status.",
        variant: "destructive"
      });
    } finally {
      setLoadingHealth(false);
    }
  };

  const copyToClipboard = async (text: string, idType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(idType);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Copied!",
        description: `${idType} copied to clipboard`,
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Static features data                                              */
  /* ------------------------------------------------------------------ */
  const whatsAppFeatures = [
    {
      title: 'Bulk WhatsApp campaigns',
      subtitle: 'Keep re‑engaging with leads & paid customers',
      body: {
        description:
          'Send bulk WhatsApp campaigns to 1000s of customers to re‑engage them and drive repeat orders',
        prerequisites: [
          { label: 'Add your customers to Zaptick', cta: 'Add Customers', href: '/contacts' },
          { label: 'Create a template & wait for its approval', cta: 'Create Template', href: '/templates' },
        ],
        steps: [{ label: 'Create a new campaign', cta: 'Create Campaign', href: '/campaigns' }],
      },
      phoneShot: '/mock-phone.png', // place a 320×640 shot in public folder
    },
    {
      title: 'Automate WhatsApp notifications',
      subtitle: 'Delight customers at every stage of their journey',
      body: {
        description:
          'Trigger order, payment & delivery notifications automatically and keep users informed throughout their journey.',
        prerequisites: [
          { label: 'Integrate your store / backend', cta: 'Explore Integrations', href: '/integrations' },
          { label: 'Map each event with an approved template', cta: 'Map Templates', href: '/templates' },
        ],
        steps: [
          { label: 'Enable notification workflow', cta: 'Enable Now', href: '/automation' },
        ],
      },
      phoneShot: '/mock-phone.png',
    },
    {
      title: 'Automate FAQ replies',
      subtitle: 'Clear visitor doubts',
      body: {
        description:
          'Set up keyword triggers & canned responses so visitors get instant answers without waiting for an agent.',
        prerequisites: [
          { label: 'Create canned responses', cta: 'Create Response', href: '/automation/faq' },
        ],
        steps: [{ label: 'Enable FAQ bot', cta: 'Enable Bot', href: '/automation/faq' }],
      },
      phoneShot: '/mock-phone.png',
    },
    {
      title: 'Automate WhatsApp catalog browsing',
      subtitle: 'Convert visitors into prospective buyers',
      body: {
        description:
          'Let visitors explore your product catalogue inside WhatsApp itself and add items to cart in one tap.',
        prerequisites: [
          { label: 'Upload product catalogue', cta: 'Upload Catalogue', href: '/catalog' },
        ],
        steps: [
          { label: 'Turn on catalogue bot', cta: 'Enable Bot', href: '/automation/catalog' },
        ],
      },
      phoneShot: '/mock-phone.png',
    },
    {
      title: 'Automate WhatsApp checkout',
      subtitle: 'Turn prospective buyers into paid customers',
      body: {
        description:
          'Allow users to complete the entire checkout on WhatsApp with payment links & order confirmation.',
        prerequisites: [
          { label: 'Configure payment provider', cta: 'Configure', href: '/settings/payments' },
        ],
        steps: [{ label: 'Enable checkout flow', cta: 'Enable Now', href: '/automation/checkout' }],
      },
      phoneShot: '/mock-phone.png',
    },
  ];

  const exploreMore = [
    {
      title: 'Add WhatsApp Contacts',
      subtitle: 'Manage contacts efficiently',
      icon: Phone,
    },
    {
      title: 'Add Team Members',
      subtitle: 'Manage member permissions',
      icon: Users,
    },
    {
      title: 'Explore Integrations',
      subtitle: 'Link GSheets, FB forms & more',
      icon: Bot,
    },
    {
      title: 'APIs & Webhooks',
      subtitle: 'Create custom integrations',
      icon: BookOpen,
    },
  ];

  /* ------------------------------------------------------------------ */
  /*  Get quality rating color                                          */
  /* ------------------------------------------------------------------ */
  const getQualityRatingColor = (rating: string) => {
    switch (rating?.toLowerCase()) {
      case 'green':
        return 'text-primary bg-primary/10';
      case 'yellow':
        return 'text-amber-600 bg-amber-100';
      case 'red':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityRatingIcon = (rating: string) => {
    switch (rating?.toLowerCase()) {
      case 'green':
        return <CheckIcon className="h-5 w-5 text-primary" />;
      case 'yellow':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'red':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Render helpers                                                    */
  /* ------------------------------------------------------------------ */
  const WhatsAppMenu = () => (
    <ul className="space-y-2">
      {whatsAppFeatures.map((feat, idx) => (
        <li key={feat.title}>
          <button
            onClick={() => setActiveWhatsAppFeature(idx)}
            className={
              'flex w-full flex-col rounded-md border px-4 py-3 text-left transition-colors ' +
              (idx === activeWhatsAppFeature
                ? 'bg-emerald-50 border-emerald-200/70 wark:bg-emerald-800/10 wark:border-emerald-700/50'
                : 'hover:bg-muted')
            }
          >
            <span className="font-medium text-sm">{feat.title}</span>
            <span className="text-xs text-muted-foreground">{feat.subtitle}</span>
          </button>
        </li>
      ))}

    </ul>
  );

const WhatsAppDetails = () => {
    const feat = whatsAppFeatures[activeWhatsAppFeature];
    return (
      <div className="flex flex-col gap-6 rounded-md border p-6">
        <p className="text-sm text-muted-foreground">{feat.body.description}</p>

        <div>
          <h4 className="mb-2 text-sm font-semibold">PRE‑REQUISITES</h4>
          <ul className="space-y-2">
            {feat.body.prerequisites.map((p) => (
              <li key={p.label} className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                <span className="flex-1 text-sm">{p.label}</span>
                <Link href={p.href}>
                  <button className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                    {p.cta}
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">STEPS TO SETUP</h4>
          <ul className="space-y-2">
            {feat.body.steps.map((s) => (
              <li key={s.label} className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm">{s.label}</span>
                <Link href={s.href}>
                  <button className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 transition-colors">
                    {s.cta}
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  /* ------------------------------------------------------------------ */
  /*  Loading state                                                     */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Page markup                                                       */
  /* ------------------------------------------------------------------ */
  return (
    <Layout>
      <main className="space-y-8 p-6 pb-12">
        {/* Greeting */}
        <h1 className="text-2xl font-bold tracking-tight">
          Hello, <span className="text-primary">{user?.name?.split(' ')[0] || 'there'}</span>. Welcome to ZapTick!
        </h1>


        {/* Connection status */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Platform Connections</h2>
            <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">2 platforms</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* WhatsApp connected */}
            {user?.wabaAccounts && user.wabaAccounts.length > 0 ? (
              <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:from-muted/40 wark:to-green-900/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                      <FaWhatsapp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 wark:text-white">WhatsApp Business</p>
                      <p className="text-sm text-green-600 font-medium">Connected & Active</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 wark:bg-green-900/30 wark:text-green-400">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      {healthStatus?.phoneNumbers?.[0]?.verified ? 'Business Verified' : 'Active'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 wark:text-gray-300">
                    <Phone className="h-4 w-4" />
                    <span className="font-mono">{user.wabaAccounts[0].phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 wark:text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Business account verified</span>
                  </div>
                </div>

                {/* Decorative element */}
                <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
              </div>
            ) : (
              <div className="group relative overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-white p-6 transition-all duration-300 hover:border-green-300 hover:bg-green-50/30 wark:border-gray-700 wark:bg-muted/40">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 wark:bg-gray-800">
                      <Phone className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 wark:text-white">WhatsApp Business</p>
                      <p className="text-sm text-gray-500">Not connected</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 wark:text-gray-300 mb-4">
                  Connect your WhatsApp Business account to start sending messages and managing conversations.
                </p>

                <button className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-md">
                  Connect WhatsApp Business
                </button>
              </div>
            )}

            {/* Instagram connected */}
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-pink-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-pink-200 wark:from-muted/40 wark:to-pink-900/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg">
                    <Instagram className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 wark:text-white">Instagram Business</p>
                    <p className="text-sm text-pink-600 font-medium">Coming Soon</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-1 text-xs font-medium text-pink-700 wark:bg-pink-900/30 wark:text-pink-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                  Preview
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 wark:text-gray-300">
                  <Instagram className="h-4 w-4" />
                  <span className="font-mono">@comingsoon</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 wark:text-gray-300">
                  <Info className="h-4 w-4 text-pink-500" />
                  <span>Instagram automation in development</span>
                </div>
              </div>

              {/* Decorative element */}
              <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-pink-500/10 transition-all duration-300 group-hover:scale-110" />
            </div>
          </div>
        </div>

        {/* WhatsApp Health Status Section */}
        {user?.wabaAccounts && user.wabaAccounts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ActivitySquare className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">WhatsApp Health Overview</h3>
              </div>

              <button
                onClick={() => fetchHealthStatus(user.wabaAccounts[0].wabaId)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary rounded-lg px-3 py-2 border border-gray-200 hover:border-primary/30 transition-all duration-200 hover:bg-primary/5"
                disabled={loadingHealth}
              >
                {loadingHealth ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh Status</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm wark:bg-muted/40">
              {loadingHealth && !healthStatus ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Loading health data...</p>
                  </div>
                </div>
              ) : healthStatus?.phoneNumbers && healthStatus.phoneNumbers.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Status Card */}
                  <div className="group rounded-xl border-2 border-green-100 bg-gradient-to-br from-green-50/50 to-white p-5 transition-all duration-300 hover:border-green-200 hover:shadow-md wark:from-green-900/10 wark:to-muted/40">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 wark:text-white">Phone Status</h4>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 wark:bg-green-900/30 wark:text-green-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        {healthStatus.phoneNumbers[0].status || "Active"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 wark:text-gray-300 mb-4">
                      Your WhatsApp phone number is registered and {healthStatus.phoneNumbers[0].verified ? "verified" : "active"}.
                    </p>

                    {/* Phone Number ID */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 wark:text-gray-400">Phone Number ID</span>
                        <button
                          onClick={() => copyToClipboard(healthStatus.phoneNumbers[0].id, 'Phone Number ID')}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 hover:bg-gray-200 wark:bg-gray-700 wark:hover:bg-gray-600 px-2 py-1 text-xs font-medium text-gray-600 wark:text-gray-300 transition-all duration-200 hover:scale-105"
                        >
                          {copiedId === 'Phone Number ID' ? (
                            <>
                              <Check className="h-3 w-3 text-green-500" />
                              <span className="text-green-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 wark:bg-gray-800 px-3 py-2 rounded-lg border">
                        <code className="text-xs font-mono text-gray-700 wark:text-gray-300 flex-1 truncate">
                          {healthStatus.phoneNumbers[0].id}
                        </code>
                      </div>
                    </div>

                    {/* WABA ID */}
                    {user?.wabaAccounts && user.wabaAccounts.length > 0 && (
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500 wark:text-gray-400">WABA ID</span>
                          <button
                            onClick={() => copyToClipboard(user.wabaAccounts[0].wabaId, 'WABA ID')}
                            className="inline-flex items-center gap-1 rounded-lg bg-gray-100 hover:bg-gray-200 wark:bg-gray-700 wark:hover:bg-gray-600 px-2 py-1 text-xs font-medium text-gray-600 wark:text-gray-300 transition-all duration-200 hover:scale-105"
                          >
                            {copiedId === 'WABA ID' ? (
                              <>
                                <Check className="h-3 w-3 text-green-500" />
                                <span className="text-green-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 wark:bg-gray-800 px-3 py-2 rounded-lg border">
                          <code className="text-xs font-mono text-gray-700 wark:text-gray-300 flex-1 truncate">
                            {user.wabaAccounts[0].wabaId}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quality Rating Card */}
                  <div className="group rounded-xl border-2 p-5 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 wark:text-white">Quality Rating</h4>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getQualityRatingColor(healthStatus.phoneNumbers[0].qualityRating)}`}>
                        {getQualityRatingIcon(healthStatus.phoneNumbers[0].qualityRating)}
                        {healthStatus.phoneNumbers[0].qualityRating || "Unknown"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 wark:text-gray-300 mb-3">
                      {healthStatus.phoneNumbers[0].qualityRating?.toLowerCase() === "green"
                        ? "Your quality rating is excellent."
                        : healthStatus.phoneNumbers[0].qualityRating?.toLowerCase() === "yellow"
                          ? "Your quality needs improvement."
                          : healthStatus.phoneNumbers[0].qualityRating?.toLowerCase() === "red"
                            ? "Your quality rating is low."
                            : "Quality rating unavailable."}
                    </p>
                    <a
                      href="https://www.facebook.com/business/help/896873687365001"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Learn how to improve <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Quick Actions Card */}
                  <div className="group rounded-xl border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-5 transition-all duration-300 hover:border-blue-200 hover:shadow-md wark:from-blue-900/10 wark:to-muted/40">
                    <h4 className="font-semibold text-gray-900 wark:text-white mb-4">Quick Actions</h4>
                    <div className="space-y-2">
                      <Link href='/analytics'>
                        <button className="w-full text-left text-sm bg-white border hover:bg-blue-50 hover:border-blue-200 px-3 py-2.5 rounded-lg flex items-center justify-between transition-all duration-200 wark:bg-gray-800 wark:border-gray-700 wark:hover:bg-blue-900/20">
                          <span className="flex items-center gap-2">
                            <ActivitySquare className="h-4 w-4 text-blue-500" />
                            View message metrics
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </button>
                      </Link>
                      <Link href='/templates'>
                        <button className="w-full mt-2 text-left text-sm bg-white border hover:bg-blue-50 hover:border-blue-200 px-3 py-2.5 rounded-lg flex items-center justify-between transition-all duration-200 wark:bg-gray-800 wark:border-gray-700 wark:hover:bg-blue-900/20">
                          <span className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                            Optimize templates
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </button>
                      </Link>
                      <Link href='/settings/whatsapp-profile'>
                        <button className="w-full mt-2 text-left text-sm bg-white border hover:bg-blue-50 hover:border-blue-200 px-3 py-2.5 rounded-lg flex items-center justify-between transition-all duration-200 wark:bg-gray-800 wark:border-gray-700 wark:hover:bg-blue-900/20">
                          <span className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            Review business profile
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-gray-100 p-4 mb-4 wark:bg-gray-800">
                    <AlertCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 wark:text-white mb-2">No Health Data Available</h4>
                  <p className="text-sm text-gray-600 wark:text-gray-300 mb-4 max-w-md">
                    We couldn&apos;t retrieve your WhatsApp health status at this time. This might be due to a temporary issue.
                  </p>
                  <button
                    onClick={() => fetchHealthStatus(user.wabaAccounts[0].wabaId)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Check Health Status
                  </button>
                </div>
              )}
            </div>
          </div>
        )}



        {/* Upgrade plan banner */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 shadow-sm">
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 wark:text-white">
                  Unleash your potential with Pro plans
                </h3>
                <p className="text-gray-600 wark:text-gray-300">
                  Get access to advanced features like automated ordering bot, API access, and team analytics
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <CheckCircle className="h-4 w-4" />
                    Pro Plan
                  </span>
                  <span className="text-gray-500">₹3,500/month</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 wark:bg-green-900/30 wark:text-green-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Save 15% on yearly
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Link href="/wallet/plans">
                <button className="rounded-xl bg-white border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 wark:bg-gray-800 wark:border-gray-700 wark:text-gray-300">
                  Compare Plans
                </button>
              </Link>
              <Link href="/wallet/plans">
                <button className="rounded-xl bg-gradient-to-r from-primary to-primary/90 px-6 py-3 text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                  Upgrade Now
                </button>
              </Link>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10" />
          <div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-primary/5" />
        </div>


        {/* Tabs */}
        <div className="space-y-6">
          {/* Tab triggers */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 wark:bg-gray-800">
              <button
                className={
                  'relative rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 ' +
                  (activeTab === 'whatsapp'
                    ? 'bg-white text-primary shadow-sm wark:bg-gray-700 wark:text-white'
                    : 'text-gray-600 hover:text-gray-900 wark:text-gray-400 wark:hover:text-gray-200')
                }
                onClick={() => setActiveTab('whatsapp')}
              >
                <FaWhatsapp className="h-4 w-4 inline mr-2" />
                WhatsApp
                {activeTab === 'whatsapp' && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full" />
                )}
              </button>
              <button
                className={
                  'relative rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 ' +
                  (activeTab === 'instagram'
                    ? 'bg-white text-primary shadow-sm wark:bg-gray-700 wark:text-white'
                    : 'text-gray-600 hover:text-gray-900 wark:text-gray-400 wark:hover:text-gray-200')
                }
                onClick={() => setActiveTab('instagram')}
              >
                <Instagram className="h-4 w-4 inline mr-2" />
                Instagram
                {activeTab === 'instagram' && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>{activeTab === 'whatsapp' ? 'WhatsApp features' : 'Instagram features'}</span>
            </div>
          </div>

          {/* Tab content */}
          {activeTab === 'whatsapp' && (
            <div className="grid gap-6 md:grid-cols-[280px_1fr_300px]">
              {/* Sidebar menu */}
              <aside className="rounded-xl border bg-white p-6 shadow-sm wark:bg-muted/40">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 wark:text-white mb-2">WhatsApp Features</h3>
                  <p className="text-xs text-gray-500">Choose a feature to learn more</p>
                </div>
                <WhatsAppMenu />
              </aside>

              {/* Feature details */}
              <section className="rounded-xl border bg-white shadow-sm wark:bg-muted/40">
                <WhatsAppDetails />
              </section>

              {/* Phone preview */}
              <section className="flex items-center justify-center">
                <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-b from-gray-50 to-white p-4 shadow-xl wark:from-gray-800 wark:to-gray-900 wark:border-gray-700">
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <video
                      src='/video.mp4'
                      autoPlay
                      muted
                      loop
                      className='h-[550px] w-full object-cover'
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">Live Preview</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'instagram' && (
            <div className="rounded-xl border bg-gradient-to-br from-pink-50/50 to-white p-12 text-center shadow-sm wark:from-pink-900/10 wark:to-muted/40">
              <div className="mx-auto max-w-md space-y-6">
                <div className="flex items-center justify-center">
                  <div className="rounded-full bg-gradient-to-br from-pink-500 to-pink-600 p-4 shadow-lg">
                    <Instagram className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-gray-900 wark:text-white">
                    Instagram Automation Coming Soon
                  </h3>
                  <p className="text-gray-600 wark:text-gray-300">
                    We&apos;re working hard to bring you powerful Instagram automation features.
                    Stay tuned for updates!
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button className="rounded-lg border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50 transition-colors wark:bg-pink-900/20 wark:border-pink-800">
                    Notify Me
                  </button>
                  <button className="rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-200">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Explore more */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Explore more features</h2>
              <p className="text-sm text-muted-foreground mt-1">Discover powerful tools to grow your business</p>
            </div>
            <Link href="/features" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
              View all features
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/contacts" className="group">
              <div className="group relative flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-1 cursor-pointer wark:bg-muted/40">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-200">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors duration-200">
                    Add WhatsApp Contacts
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Manage contacts efficiently
                  </p>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
            </Link>

            <Link href="/settings/agents" className="group">
              <div className="group relative flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-1 cursor-pointer wark:bg-muted/40">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 group-hover:from-blue-500/20 group-hover:to-blue-500/10 transition-all duration-200">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold leading-tight group-hover:text-blue-500 transition-colors duration-200">
                    Add Team Members
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Manage member permissions
                  </p>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
            </Link>

            <Link href="/integrations" className="group">
              <div className="group relative flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-1 cursor-pointer wark:bg-muted/40">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 group-hover:from-purple-500/20 group-hover:to-purple-500/10 transition-all duration-200">
                    <Bot className="h-6 w-6 text-purple-500" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold leading-tight group-hover:text-purple-500 transition-colors duration-200">
                    Explore Integrations
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Link GSheets, FB forms & more
                  </p>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
            </Link>

            <Link href="/settings/developers" className="group">
              <div className="group relative flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-1 cursor-pointer wark:bg-muted/40">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 group-hover:from-orange-500/20 group-hover:to-orange-500/10 transition-all duration-200">
                    <BookOpen className="h-6 w-6 text-orange-500" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold leading-tight group-hover:text-orange-500 transition-colors duration-200">
                    APIs & Webhooks
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Create custom integrations
                  </p>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
            </Link>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            {/* <Link href="/live-chat">
              <button className="inline-flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 px-4 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <MessageSquare className="h-4 w-4" />
                Live Chat Setup
              </button>
            </Link> */}
            <Link href="/templates">
              <button className="inline-flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 px-4 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <FolderKanban className="h-4 w-4" />
                Template Library
              </button>
            </Link>
            {/* <Link href="/ai-assistant">
              <button className="inline-flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 px-4 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Bot className="h-4 w-4" />
                AI Assistant
              </button>
            </Link> */}
          </div>
        </div>
      </main>
    </Layout>
  );
}
