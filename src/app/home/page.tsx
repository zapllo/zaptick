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
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

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
        setUser(data.user);

        // If user has at least one WABA account, fetch health status for the first one
        if (data.user.wabaAccounts && data.user.wabaAccounts.length > 0) {
          fetchHealthStatus(data.user.wabaAccounts[0].wabaId);
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
    setLoadingHealth(true);
    try {
      const response = await fetch(`/api/waba/health?wabaId=${wabaId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch health status');
      }
      const data = await response.json();
      setHealthStatus(data.healthStatus);
    } catch (error) {
      console.error('Error fetching health status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch WhatsApp health status.",
        variant: "destructive"
      });
    } finally {
      setLoadingHealth(false);
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
          { label: 'Add your customers to Interakt', cta: 'Add Customers' },
          { label: 'Create a template & wait for its approval', cta: 'Create Template' },
        ],
        steps: [{ label: 'Create a new campaign', cta: 'Create Campaign' }],
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
          { label: 'Integrate your store / backend', cta: 'Explore Integrations' },
          { label: 'Map each event with an approved template', cta: 'Map Templates' },
        ],
        steps: [
          { label: 'Enable notification workflow', cta: 'Enable Now' },
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
          { label: 'Create canned responses', cta: 'Create Response' },
        ],
        steps: [{ label: 'Enable FAQ bot', cta: 'Enable Bot' }],
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
          { label: 'Upload product catalogue', cta: 'Upload Catalogue' },
        ],
        steps: [
          { label: 'Turn on catalogue bot', cta: 'Enable Bot' },
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
          { label: 'Configure payment provider', cta: 'Configure' },
        ],
        steps: [{ label: 'Enable checkout flow', cta: 'Enable Now' }],
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
                ? 'bg-emerald-50 border-emerald-200/70 dark:bg-emerald-800/10 dark:border-emerald-700/50'
                : 'hover:bg-muted')
            }
          >
            <span className="font-medium text-sm">{feat.title}</span>
            <span className="text-xs text-muted-foreground">{feat.subtitle}</span>
          </button>
        </li>
      ))}
      <li>
        <button className="w-full rounded-md bg-muted py-2 text-sm hover:bg-muted/70">View more ↓</button>
      </li>
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
                <button className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20">
                  {p.cta}
                </button>
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
                <button className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700">
                  {s.cta}
                </button>
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
        <div className="grid gap-4 md:grid-cols-2">
          {/* WhatsApp connected */}
          {user?.wabaAccounts && user.wabaAccounts.length > 0 ? (
            <div className="group relative flex flex-col justify-between gap-4 rounded-lg border bg-white p-5 shadow-sm dark:bg-muted/40">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium leading-tight">WhatsApp Number is connected</p>
                  <p className="text-sm text-muted-foreground">{user.wabaAccounts[0].phoneNumber}</p>
                </div>
              </div>

              <span className="absolute right-4 top-4 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                {healthStatus?.phoneNumbers?.[0]?.verified ? 'Business verified' : 'Active'}
              </span>
            </div>
          ) : (
            <div className="group relative flex flex-col justify-between gap-4 rounded-lg border bg-white p-5 shadow-sm dark:bg-muted/40">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium leading-tight">Connect WhatsApp Business</p>
                  <p className="text-sm text-muted-foreground">Add your WhatsApp business account</p>
                </div>
              </div>
              <button className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90">
                Connect Now
              </button>
            </div>
          )}

          {/* Instagram connected */}
          <div className="relative flex flex-col justify-between gap-4 rounded-lg border bg-white p-5 shadow-sm dark:bg-muted/40">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                <Instagram className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium leading-tight">Business Instagram is connected</p>
                <p className="text-sm text-muted-foreground">Your Instagram handle is <b>@comingsoon</b></p>
              </div>
            </div>
            <button className="absolute right-4 top-4 rounded-md border px-3 py-1 text-xs hover:bg-muted">Coming Soon</button>
          </div>
        </div>

        {/* WhatsApp Health Status Section */}
        {user?.wabaAccounts && user.wabaAccounts.length > 0 && (
          <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-muted/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ActivitySquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">WhatsApp Health Status</h3>
              </div>

              <button
                onClick={() => fetchHealthStatus(user.wabaAccounts[0].wabaId)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary rounded-md px-2 py-1 border"
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

            {loadingHealth && !healthStatus ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Loading health data...</span>
              </div>
            ) : healthStatus?.phoneNumbers && healthStatus.phoneNumbers.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {/* Status Card */}
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Phone Status</h4>
                    <span className="text-xs font-medium rounded-full bg-primary/10 text-primary -500 px-2 py-0.5">
                      {healthStatus.phoneNumbers[0].status || "Active"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your WhatsApp phone number is registered and {healthStatus.phoneNumbers[0].verified ? "verified" : "active"}.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Phone ID: {healthStatus.phoneNumbers[0].id.substring(0, 12)}...
                  </div>
                </div>

                {/* Quality Rating Card */}
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Quality Rating</h4>
                    <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${getQualityRatingColor(healthStatus.phoneNumbers[0].qualityRating)}`}>
                      {healthStatus.phoneNumbers[0].qualityRating || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {getQualityRatingIcon(healthStatus.phoneNumbers[0].qualityRating)}
                    <p className="text-sm text-muted-foreground">
                      {healthStatus.phoneNumbers[0].qualityRating?.toLowerCase() === "green"
                        ? "Your quality rating is good."
                        : healthStatus.phoneNumbers[0].qualityRating?.toLowerCase() === "yellow"
                          ? "Your quality needs improvement."
                          : healthStatus.phoneNumbers[0].qualityRating?.toLowerCase() === "red"
                            ? "Your quality rating is low."
                            : "Quality rating unavailable."}
                    </p>
                  </div>
                  <a
                    href="https://www.facebook.com/business/help/896873687365001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Learn how to improve <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Quick Actions Card */}
                <div className="rounded-md border p-4">
                  <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm bg-muted/50 hover:bg-muted px-3 py-2 rounded-md flex items-center justify-between">
                      View message metrics
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button className="w-full text-left text-sm bg-muted/50 hover:bg-muted px-3 py-2 rounded-md flex items-center justify-between">
                      Optimize templates
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <Link href='/settings/whatsapp-profile'>
                      <button className="w-full text-left text-sm bg-muted/50 hover:bg-muted px-3 py-2 rounded-md flex items-center justify-between">
                        Review business profile
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">No health data available.</p>
                <button
                  onClick={() => fetchHealthStatus(user.wabaAccounts[0].wabaId)}
                  className="text-sm text-primary hover:underline"
                >
                  Click to check WhatsApp health status
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upgrade plan banner */}
        <div className="flex flex-col justify-between gap-4 rounded-lg border bg-primary/5 p-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow">
              <ShoppingCart className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold leading-tight">Unleash your potential with one of our Active plans</p>
              <p className="text-sm text-muted-foreground">Growth Plan (₹6,897/quarter)</p>
            </div>
          </div>
          <button className="self-start rounded-md bg-primary px-6 py-2 text-sm font-medium text-white shadow hover:bg-primary/90 md:self-auto">
            Upgrade plan
          </button>
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          {/* Tab triggers */}
          <div className="flex gap-2 border-b">
            <button
              className={
                'rounded-t-md px-4 py-2 text-sm font-medium ' +
                (activeTab === 'whatsapp' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground')
              }
              onClick={() => setActiveTab('whatsapp')}
            >
              WhatsApp
            </button>
            <button
              className={
                'rounded-t-md px-4 py-2 text-sm font-medium ' +
                (activeTab === 'instagram' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground')
              }
              onClick={() => setActiveTab('instagram')}
            >
              Instagram
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'whatsapp' && (
            <div className="grid gap-6 md:grid-cols-[260px_1fr_280px]">
              {/* Sidebar menu */}
              <aside className="rounded-md border p-4">
                <WhatsAppMenu />
              </aside>

              {/* Feature details */}
              <section>
                <WhatsAppDetails />
              </section>

              {/* Phone preview */}
              <section className="flex items-center justify-center">
                <div className="rounded-lg border p-3 shadow-sm">
                  <video src='/video.mp4' autoPlay muted className='h-[400px]' />
                </div>
              </section>
            </div>
          )}

          {activeTab === 'instagram' && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-md border p-12 text-center">
              <Instagram className="h-10 w-10 text-pink-600" />
              <p className="max-w-md text-sm text-muted-foreground">
                Instagram automation features for ZapTick are coming soon. Stay tuned!
              </p>
            </div>
          )}
        </div>

        {/* Explore more */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Explore more exciting features!</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-col">
            {exploreMore.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </span>
                  <div>
                    <p className="font-medium leading-tight">{card.title}</p>
                    <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </Layout>
  );
}
