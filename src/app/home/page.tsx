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
  Sparkles,
  BarChart3,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Star,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import InstagramOnboardingModal from '@/components/instagram/InstagramOnboardingModal';

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
  // ADD INSTAGRAM STATE
  const [connectingInstagram, setConnectingInstagram] = useState(false);

  // Add state for modal
  const [showInstagramOnboarding, setShowInstagramOnboarding] = useState(false);

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
  /*  Instagram connection function                                     */
  /* ------------------------------------------------------------------ */
  // Update the Instagram connection function
  const connectInstagram = () => {
    setShowInstagramOnboarding(true);
  };

  const handleInstagramConnect = () => {
    setShowInstagramOnboarding(false);
    setConnectingInstagram(true);

    // Use Instagram App ID instead of Facebook App ID
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID; // Changed this
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    const scope = 'instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_show_list,pages_read_engagement';

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=instagram_connect`;

    window.location.href = authUrl;
  };

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

  /* ------------------------------------------------------------------ */
  /*  Get quality rating color                                          */
  /* ------------------------------------------------------------------ */
  const getQualityRatingColor = (rating: string) => {
    switch (rating?.toLowerCase()) {
      case 'green':
        return 'text-green-600 bg-green-50 border-green-200 wark:text-green-400 wark:bg-green-900/30 wark:border-green-700';
      case 'yellow':
        return 'text-amber-600 bg-amber-50 border-amber-200 wark:text-amber-400 wark:bg-amber-900/30 wark:border-amber-700';
      case 'red':
        return 'text-red-600 bg-red-50 border-red-200 wark:text-red-400 wark:bg-red-900/30 wark:border-red-700';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200 wark:text-slate-400 wark:bg-slate-800/30 wark:border-slate-700';
    }
  };

  const getQualityRatingIcon = (rating: string) => {
    switch (rating?.toLowerCase()) {
      case 'green':
        return <CheckIcon className="h-5 w-5 text-green-600 wark:text-green-400" />;
      case 'yellow':
        return <AlertTriangle className="h-5 w-5 text-amber-600 wark:text-amber-400" />;
      case 'red':
        return <AlertTriangle className="h-5 w-5 text-red-600 wark:text-red-400" />;
      default:
        return <Info className="h-5 w-5 text-slate-600 wark:text-slate-400" />;
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Render helpers                                                    */
  /* ------------------------------------------------------------------ */
  const WhatsAppMenu = () => (
    <div className="space-y-3">
      {whatsAppFeatures.map((feat, idx) => (
        <div key={feat.title}>
          <button
            onClick={() => setActiveWhatsAppFeature(idx)}
            className={
              'group relative overflow-hidden w-full flex flex-col rounded-xl border p-4 text-left transition-all duration-300 ' +
              (idx === activeWhatsAppFeature
                ? 'bg-gradient-to-br from-white to-green-50/30 border-green-200 shadow-sm hover:shadow-md wark:from-muted/40 wark:to-green-900/10 wark:border-green-700/50'
                : 'bg-gradient-to-br from-white to-slate-50/30 border-slate-200 hover:border-green-200 hover:shadow-sm wark:from-muted/40 wark:to-slate-900/10 wark:border-slate-700 wark:hover:border-green-700/50')
            }
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 ${idx === activeWhatsAppFeature
                ? 'bg-green-100 wark:bg-green-900/30'
                : 'bg-slate-100 group-hover:bg-green-100 wark:bg-slate-800 wark:group-hover:bg-green-900/30'
                }`}>
                <MessageSquare className={`h-4 w-4 transition-colors ${idx === activeWhatsAppFeature
                  ? 'text-green-600 wark:text-green-400'
                  : 'text-slate-600 group-hover:text-green-600 wark:text-slate-400 wark:group-hover:text-green-400'
                  }`} />
              </div>
              <span className={`font-semibold text-sm transition-colors ${idx === activeWhatsAppFeature
                ? 'text-slate-900 wark:text-white'
                : 'text-slate-800 group-hover:text-slate-900 wark:text-slate-200 wark:group-hover:text-white'
                }`}>
                {feat.title}
              </span>
            </div>
            <p className="text-xs text-slate-600 wark:text-slate-400 ml-11 leading-relaxed">
              {feat.subtitle}
            </p>
            {/* Decorative element */}
            <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
          </button>
        </div>
      ))}
    </div>
  );

  const WhatsAppDetails = () => {
    const feat = whatsAppFeatures[activeWhatsAppFeature];
    return (
      <div className="group relative h-full overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10">
        <div className="space-y-6">
          <p className="text-sm text-slate-600 wark:text-slate-300 leading-relaxed">
            {feat.body.description}
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-lg bg-blue-100 wark:bg-blue-900/30 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-blue-600 wark:text-blue-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 wark:text-white">PRE‑REQUISITES</h4>
            </div>
            <div className="space-y-3 ml-8">
              {feat.body.prerequisites.map((p) => (
                <div key={p.label} className="group/item relative overflow-hidden rounded-lg border bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 wark:bg-slate-800/50 wark:border-slate-700 wark:hover:border-blue-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-slate-700 wark:text-slate-300">{p.label}</span>
                    </div>
                    <Link href={p.href}>
                      <button className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md">
                        {p.cta}
                      </button>
                    </Link>
                  </div>
                  <div className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-blue-500/10 transition-all duration-300 group-hover/item:scale-110" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-lg bg-green-100 wark:bg-green-900/30 flex items-center justify-center">
                <Zap className="h-4 w-4 text-green-600 wark:text-green-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 wark:text-white">STEPS TO SETUP</h4>
            </div>
            <div className="space-y-3 ml-8">
              {feat.body.steps.map((s) => (
                <div key={s.label} className="group/item relative overflow-hidden rounded-lg border bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:bg-slate-800/50 wark:border-slate-700 wark:hover:border-green-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-green-100 wark:bg-green-900/30 flex items-center justify-center text-xs font-bold text-green-600 wark:text-green-400">
                        1
                      </div>
                      <span className="text-sm text-slate-700 wark:text-slate-300">{s.label}</span>
                    </div>
                    <Link href={s.href}>
                      <button className="rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md">
                        {s.cta}
                      </button>
                    </Link>
                  </div>
                  <div className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-green-500/10 transition-all duration-300 group-hover/item:scale-110" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-slate-500/10 transition-all duration-300 group-hover:scale-110" />
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
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-900 wark:text-white">Loading your dashboard...</p>
              <p className="text-sm text-slate-500">Setting up your workspace</p>
            </div>
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
        {/* Modern Greeting Header */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 wark:from-muted/40 wark:to-blue-900/10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 wark:text-white">
                Hello, <span className="text-primary">{user?.name?.split(' ')[0] || 'there'}</span>!
              </h1>
              <p className="text-slate-600 wark:text-slate-300">
                Welcome to ZapTick. Let&apos;s build something amazing together.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600 wark:text-slate-400 mt-4">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>All systems online</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Ready to scale</span>
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Connection status */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <ActivitySquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 wark:text-white">Platform Connections</h2>
                <p className="text-sm text-slate-600 wark:text-slate-300">Manage your connected messaging platforms</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 wark:bg-slate-800 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600 wark:text-slate-300">2 platforms available</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* WhatsApp connected */}
            {user?.wabaAccounts && user.wabaAccounts.length > 0 ? (
              <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:from-muted/40 wark:to-green-900/10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FaWhatsapp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 wark:text-white text-lg">WhatsApp Business</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-sm text-green-600 wark:text-green-400 font-medium">Connected & Active</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 wark:bg-green-900/30 border border-green-200 wark:border-green-700 px-2 py-1 text-xs font-medium text-green-700 wark:text-green-400">
                      <CheckCircle className="h-3 w-3" />
                      {healthStatus?.phoneNumbers?.[0]?.verified ? 'Business Verified' : 'Active'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 wark:bg-slate-800/50 border border-slate-200 wark:border-slate-700">
                    <Phone className="h-4 w-4 text-green-600 wark:text-green-400 flex-shrink-0" />
                    <span className="text-sm font-mono text-slate-900 wark:text-slate-100">{user.wabaAccounts[0].phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 wark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Business account verified and ready for messaging</span>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200 wark:border-slate-700">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900 wark:text-white">Active</div>
                    <div className="text-xs text-slate-600 wark:text-slate-400">Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900 wark:text-white">{user.wabaAccounts[0].templateCount || 0}</div>
                    <div className="text-xs text-slate-600 wark:text-slate-400">Templates</div>
                  </div>
                </div>

                {/* Decorative element */}
                <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
              </div>
            ) : (
              <div className="group relative overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 transition-all duration-300 hover:border-green-300 hover:bg-green-50/30 wark:border-slate-700 wark:bg-muted/40">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 wark:bg-slate-800 group-hover:bg-green-100 wark:group-hover:bg-green-900/30 transition-colors duration-300">
                      <Phone className="h-6 w-6 text-slate-400 group-hover:text-green-500 transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 wark:text-white text-lg">WhatsApp Business</h3>
                      <p className="text-sm text-slate-500 wark:text-slate-400">Not connected</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 wark:text-slate-300 mb-6 leading-relaxed">
                  Connect your WhatsApp Business account to start sending messages and managing conversations with your customers.
                </p>

                <Link href="/dashboard">
                  <button className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:scale-105">
                    Connect WhatsApp Business
                  </button>
                </Link>

                {/* Benefits */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 wark:border-slate-700">
                  <div className="flex items-center gap-2 text-xs text-slate-600 wark:text-slate-400">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Free setup</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 wark:text-slate-400">
                    <CheckCircle className="h-3 w-3 text-blue-500" />
                    <span>5 min process</span>
                  </div>
                </div>
              </div>
            )}

            {/* Instagram connection status */}
            {user?.instagramAccounts && user.instagramAccounts.length > 0 ? (
              <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-pink-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-pink-200 wark:from-muted/40 wark:to-pink-900/10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Instagram className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 wark:text-white text-lg">Instagram Business</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                        <p className="text-sm text-pink-600 wark:text-pink-400 font-medium">Connected & Active</p>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 wark:bg-pink-900/30 border border-pink-200 wark:border-pink-700 px-2 py-1 text-xs font-medium text-pink-700 wark:text-pink-400">
                    <CheckCircle className="h-3 w-3" />
                    Business Connected
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 wark:bg-slate-800/50 border border-slate-200 wark:border-slate-700">
                    <Instagram className="h-4 w-4 text-pink-600 wark:text-pink-400 flex-shrink-0" />
                    <span className="text-sm font-mono text-slate-900 wark:text-slate-100">@{user.instagramAccounts[0].username}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 wark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-pink-500 flex-shrink-0" />
                    <span>{user.instagramAccounts[0].followersCount?.toLocaleString()} followers connected</span>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200 wark:border-slate-700">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900 wark:text-white">Active</div>
                    <div className="text-xs text-slate-600 wark:text-slate-400">Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900 wark:text-white">{user.instagramAccounts[0].followersCount?.toLocaleString() || '0'}</div>
                    <div className="text-xs text-slate-600 wark:text-slate-400">Followers</div>
                  </div>
                </div>

                {/* Decorative element */}
                <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-pink-500/10 transition-all duration-300 group-hover:scale-110" />
              </div>
            ) : (
              <div className="group relative overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 transition-all duration-300 hover:border-pink-300 hover:bg-pink-50/30 wark:border-slate-700 wark:bg-muted/40">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 wark:bg-slate-800 group-hover:bg-pink-100 wark:group-hover:bg-pink-900/30 transition-colors duration-300">
                      <Instagram className="h-6 w-6 text-slate-400 group-hover:text-pink-500 transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 wark:text-white text-lg">Instagram Business</h3>
                      <p className="text-sm text-slate-500 wark:text-slate-400">Not connected</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 wark:text-slate-300 mb-6 leading-relaxed">
                  Connect your Instagram Business account to manage DMs and comments automatically.
                </p>

                <button
                  // onClick={connectInstagram}
                  disabled={true}
                  className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-pink-600 hover:to-pink-700 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {connectingInstagram ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </div>
                  ) : (
                    'Coming Soon'
                  )}
                </button>

                {/* Benefits */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 wark:border-slate-700">
                  <div className="flex items-center gap-2 text-xs text-slate-600 wark:text-slate-400">
                    <CheckCircle className="h-3 w-3 text-pink-500" />
                    <span>Auto DM replies</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 wark:text-slate-400">
                    <CheckCircle className="h-3 w-3 text-purple-500" />
                    <span>Comment management</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Health Status Section */}
        {user?.wabaAccounts && user.wabaAccounts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 wark:text-white">WhatsApp Health Overview</h3>
                  <p className="text-sm text-slate-600 wark:text-slate-300">Monitor your account performance and status</p>
                </div>
              </div>

              <button
                onClick={() => fetchHealthStatus(user.wabaAccounts[0].wabaId)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 wark:text-slate-300 transition-all duration-200 hover:border-blue-300 wark:hover:border-blue-600 hover:bg-blue-50 wark:hover:bg-blue-900/20 hover:text-blue-600 wark:hover:text-blue-400"
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

            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10">
              {loadingHealth && !healthStatus ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 animate-pulse" />
                    </div>
                    <p className="font-medium text-slate-900 wark:text-white">Loading health data...</p>
                    <p className="text-sm text-slate-500">Fetching your WhatsApp status</p>
                  </div>
                </div>
              ) : healthStatus?.phoneNumbers && healthStatus.phoneNumbers.length > 0 ? (
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Status Card */}
                  <div className="group/card relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:from-slate-800/50 wark:to-green-900/10 wark:border-slate-700 wark:hover:border-green-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover/card:scale-110 transition-transform duration-300">
                          <Phone className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-slate-900 wark:text-white">Phone Status</h4>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border ${getQualityRatingColor('green')}`}>
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        {healthStatus.phoneNumbers[0].status || "Active"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 wark:text-slate-300 mb-4 leading-relaxed">
                      Your WhatsApp phone number is registered and {healthStatus.phoneNumbers[0].verified ? "verified" : "active"}.
                    </p>

                    {/* Phone Number ID */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500 wark:text-slate-400">Phone Number ID</span>
                          <button
                            onClick={() => copyToClipboard(healthStatus.phoneNumbers[0].id, 'Phone Number ID')}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 wark:bg-slate-700 wark:hover:bg-slate-600 px-2 py-1 text-xs font-medium text-slate-600 wark:text-slate-300 transition-all duration-200 hover:scale-105"
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
                        <div className="rounded-lg bg-slate-50 wark:bg-slate-800 border border-slate-200 wark:border-slate-700 p-2.5">
                          <code className="text-xs font-mono text-slate-700 wark:text-slate-300 break-all">
                            {healthStatus.phoneNumbers[0].id}
                          </code>
                        </div>
                      </div>

                      {/* WABA ID */}
                      {user?.wabaAccounts && user.wabaAccounts.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 wark:text-slate-400">WABA ID</span>
                            <button
                              onClick={() => copyToClipboard(user.wabaAccounts[0].wabaId, 'WABA ID')}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 wark:bg-slate-700 wark:hover:bg-slate-600 px-2 py-1 text-xs font-medium text-slate-600 wark:text-slate-300 transition-all duration-200 hover:scale-105"
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
                          <div className="rounded-lg bg-slate-50 wark:bg-slate-800 border border-slate-200 wark:border-slate-700 p-2.5">
                            <code className="text-xs font-mono text-slate-700 wark:text-slate-300 break-all">
                              {user.wabaAccounts[0].wabaId}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-green-500/10 transition-all duration-300 group-hover/card:scale-110" />
                  </div>

                  {/* Quality Rating Card */}
                  <div className={`group/card relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md ${healthStatus.phoneNumbers[0].qualityRating?.toLowerCase() === 'green'
                    ? 'bg-gradient-to-br from-white to-green-50/30 border-green-200 hover:border-green-300 wark:from-slate-800/50 wark:to-green-900/10 wark:border-green-700 wark:hover:border-green-600'
                    : healthStatus.phoneNumbers[0].qualityRating?.toLowerCase() === 'yellow'
                      ? 'bg-gradient-to-br from-white to-amber-50/30 border-amber-200 hover:border-amber-300 wark:from-slate-800/50 wark:to-amber-900/10 wark:border-amber-700 wark:hover:border-amber-600'
                      : 'bg-gradient-to-br from-white to-slate-50/30 border-slate-200 hover:border-slate-300 wark:from-slate-800/50 wark:to-slate-900/10 wark:border-slate-700 wark:hover:border-slate-600'
                    }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-lg group-hover/card:scale-110 transition-transform duration-300 ${healthStatus.phoneNumbers[0].qualityRating?.toLowerCase() === 'green'
                          ? 'bg-gradient-to-br from-green-500 to-green-600'
                          : healthStatus.phoneNumbers[0].qualityRating?.toLowerCase() === 'yellow'
                            ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                            : 'bg-gradient-to-br from-slate-500 to-slate-600'
                          }`}>
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-slate-900 wark:text-white">Quality Rating</h4>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border ${getQualityRatingColor(healthStatus.phoneNumbers[0].qualityRating)}`}>
                        {getQualityRatingIcon(healthStatus.phoneNumbers[0].qualityRating)}
                        {healthStatus.phoneNumbers[0].qualityRating || "Unknown"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 wark:text-slate-300 mb-4 leading-relaxed">
                      {healthStatus.phoneNumbers[0].qualityRating?.toLowerCase() === "green"
                        ? "Your quality rating is excellent. Keep up the great work!"
                        : healthStatus.phoneNumbers[0].qualityRating?.toLowerCase() === "yellow"
                          ? "Your quality needs improvement. Review our best practices."
                          : healthStatus.phoneNumbers[0].qualityRating?.toLowerCase() === "red"
                            ? "Your quality rating is low. Immediate attention required."
                            : "Quality rating unavailable. Check back later."}
                    </p>

                    <a
                      href="https://www.facebook.com/business/help/896873687365001"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 wark:text-blue-400 hover:text-blue-800 wark:hover:text-blue-300 transition-colors"
                    >
                      Learn how to improve <ExternalLink className="h-3 w-3" />
                    </a>

                    <div className={`absolute -right-6 -top-6 h-12 w-12 rounded-full transition-all duration-300 group-hover/card:scale-110 ${healthStatus.phoneNumbers[0].qualityRating?.toLowerCase() === 'green'
                      ? 'bg-green-500/10'
                      : healthStatus.phoneNumbers[0].qualityRating?.toLowerCase() === 'yellow'
                        ? 'bg-amber-500/10'
                        : 'bg-slate-500/10'
                      }`} />
                  </div>

                  {/* Quick Actions Card */}
                  <div className="group/card relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 wark:from-slate-800/50 wark:to-blue-900/10 wark:border-slate-700 wark:hover:border-blue-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover/card:scale-110 transition-transform duration-300">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-900 wark:text-white">Quick Actions</h4>
                    </div>

                    <div className="space-y-2">
                      <Link href='/analytics'>
                        <button className="group/btn w-full text-left rounded-lg border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800 p-3 transition-all duration-200 hover:border-blue-300 wark:hover:border-blue-600 hover:bg-blue-50 wark:hover:bg-blue-900/20 hover:shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-slate-700 wark:text-slate-300">View Analytics</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover/btn:text-blue-500 group-hover/btn:translate-x-1 transition-all duration-200" />
                          </div>
                        </button>
                      </Link>

                      <Link href='/templates'>
                        <button className="group/btn mt-2 w-full text-left rounded-lg border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800 p-3 transition-all duration-200 hover:border-blue-300 wark:hover:border-blue-600 hover:bg-blue-50 wark:hover:bg-blue-900/20 hover:shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-slate-700 wark:text-slate-300">Manage Templates</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover/btn:text-blue-500 group-hover/btn:translate-x-1 transition-all duration-200" />
                          </div>
                        </button>
                      </Link>

                      <Link href='/settings/whatsapp-profile'>
                        <button className="group/btn mt-2 w-full text-left rounded-lg border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800 p-3 transition-all duration-200 hover:border-blue-300 wark:hover:border-blue-600 hover:bg-blue-50 wark:hover:bg-blue-900/20 hover:shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-slate-700 wark:text-slate-300">Business Profile</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover/btn:text-blue-500 group-hover/btn:translate-x-1 transition-all duration-200" />
                          </div>
                        </button>
                      </Link>
                    </div>

                    <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-blue-500/10 transition-all duration-300 group-hover/card:scale-110" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 wark:bg-slate-800 mb-4">
                    <AlertCircle className="h-8 w-8 text-slate-400" />
                  </div>
                  <h4 className="font-semibold text-slate-900 wark:text-white mb-2">No Health Data Available</h4>
                  <p className="text-sm text-slate-600 wark:text-slate-300 mb-6 max-w-md leading-relaxed">
                    We couldn&apos;t retrieve your WhatsApp health status at this time. This might be due to a temporary issue.
                  </p>
                  <button
                    onClick={() => fetchHealthStatus(user.wabaAccounts[0].wabaId)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Check Health Status
                  </button>
                </div>
              )}

              {/* Decorative element */}
              <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-slate-500/10 transition-all duration-300 group-hover:scale-110" />
            </div>
          </div>
        )}

        {/* Upgrade plan banner */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-primary/5 p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 wark:from-muted/40 wark:to-primary/10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-900 wark:text-white">
                  Unleash your potential with Pro plans
                </h3>
                <p className="text-slate-600 wark:text-slate-300 leading-relaxed">
                  Get access to advanced features like automated ordering bot, API access, and team analytics
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Star className="h-3 w-3 text-primary" />
                    </div>
                    <span className="font-medium text-primary">Pro Plan</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 wark:text-slate-400">
                    <span>₹3,500/month</span>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-green-100 wark:bg-green-900/30 border border-green-200 wark:border-green-700 px-2 py-1 text-xs font-medium text-green-700 wark:text-green-400">
                    <TrendingUp className="h-3 w-3" />
                    Save 15% on yearly
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Link href="/wallet/plans">
                <button className="rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800 px-6 py-3 text-sm font-medium text-slate-700 wark:text-slate-300 transition-all duration-200 hover:bg-slate-50 wark:hover:bg-slate-700 hover:border-slate-300 wark:hover:border-slate-600">
                  Compare Plans
                </button>
              </Link>
              <Link href="/wallet/plans">
                <button className="rounded-xl bg-gradient-to-r from-primary to-primary/90 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105">
                  Upgrade Now
                </button>
              </Link>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 transition-all duration-300 group-hover:scale-110" />
          <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-primary/5" />
        </div>

        {/* Modern Tabs Section */}
        <div className="space-y-6">
          {/* Tab triggers */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 wark:bg-slate-800 p-1 shad">
              <button
                className={
                  'relative rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200 ' +
                  (activeTab === 'whatsapp'
                    ? 'bg-white wark:bg-slate-700 text-primary shadow-sm'
                    : 'text-slate-600 wark:text-slate-400 hover:text-slate-900 wark:hover:text-slate-200 hover:bg-slate-50 wark:hover:bg-slate-700/50')
                }
                onClick={() => setActiveTab('whatsapp')}
              >
                <div className="flex items-center gap-2">
                  <FaWhatsapp className="h-4 w-4" />
                  <span>WhatsApp</span>
                </div>
                {activeTab === 'whatsapp' && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full" />
                )}
              </button>
              <button
                className={
                  'relative rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200 ' +
                  (activeTab === 'instagram'
                    ? 'bg-white wark:bg-slate-700 text-primary shadow-sm'
                    : 'text-slate-600 wark:text-slate-400 hover:text-slate-900 wark:hover:text-slate-200 hover:bg-slate-50 wark:hover:bg-slate-700/50')
                }
                onClick={() => setActiveTab('instagram')}
              >
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </div>
                {activeTab === 'instagram' && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-slate-100 wark:bg-slate-800 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600 wark:text-slate-300">
                {activeTab === 'whatsapp' ? 'WhatsApp features' : 'Instagram features'}
              </span>
            </div>
          </div>

      {activeTab === 'whatsapp' && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Sidebar menu */}
              <aside className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10 h-fit">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 wark:bg-green-900/30">
                      <FaWhatsapp className="h-4 w-4 text-green-600 wark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 wark:text-white">WhatsApp Features</h3>
                  </div>
                  <p className="text-xs text-slate-600 wark:text-slate-400">
                    Choose a feature to learn more about implementation
                  </p>
                </div>
                <WhatsAppMenu />

                {/* Decorative element */}
                <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
              </aside>
 {/* Phone preview */}
              <section className="flex items-start w-full justify-center h-fit sticky top-6">
                <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 wark:border-slate-700 bg-gradient-to-b from-slate-50 to-white wark:from-slate-800 wark:to-slate-900 p-4 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-slate-300 wark:hover:border-slate-600 w-full max-w-[280px]">
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <video
                      src='/video.mp4'
                      autoPlay
                      muted
                      loop
                      className='h-[480px] w-full object-cover'
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-xs font-medium text-slate-600 wark:text-slate-400">Live Preview</p>
                    </div>
                  </div>

                  {/* Decorative glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </section>
              {/* Feature details */}
              <section className="h-full">
                <WhatsAppDetails />
              </section>


            </div>
          )}
          {activeTab === 'instagram' && (
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-pink-50/30 p-12 shadow-sm text-center transition-all duration-300 hover:shadow-md hover:border-pink-200 wark:from-muted/40 wark:to-pink-900/10">
              <div className="mx-auto max-w-lg space-y-6">
                <div className="flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg">
                    <Instagram className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-900 wark:text-white">
                    Instagram Automation Coming Soon
                  </h3>
                  <p className="text-slate-600 wark:text-slate-300 leading-relaxed">
                    We&apos;re working hard to bring you powerful Instagram automation features.
                    Stay tuned for updates and be the first to know when it launches!
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 pt-4">
                  <button className="rounded-xl border border-pink-200 wark:border-pink-700 bg-white wark:bg-pink-900/20 px-6 py-3 text-sm font-medium text-pink-600 wark:text-pink-400 transition-all duration-200 hover:bg-pink-50 wark:hover:bg-pink-900/30 hover:border-pink-300 wark:hover:border-pink-600">
                    Notify Me
                  </button>
                  <button className="rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-pink-600 hover:to-pink-700 hover:shadow-xl hover:scale-105">
                    Learn More
                  </button>
                </div>
              </div>

              {/* Decorative element */}
              <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-pink-500/10 transition-all duration-300 group-hover:scale-110" />
            </div>
          )}
        </div>

        {/* Explore more features */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 wark:text-white">Explore More Features</h2>
                <p className="text-sm text-slate-600 wark:text-slate-300">Discover powerful tools to grow your business</p>
              </div>
            </div>
            {/* <Link href="/features" className="group flex items-center gap-2 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 wark:text-slate-300 transition-all duration-200 hover:border-purple-300 wark:hover:border-purple-600 hover:bg-purple-50 wark:hover:bg-purple-900/20 hover:text-purple-600 wark:hover:text-purple-400">
              <span>View all features</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link> */}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/contacts" className="group">
              <div className="group/card relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 hover:-translate-y-1 cursor-pointer wark:from-muted/40 wark:to-green-900/10 wark:border-slate-700 wark:hover:border-green-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 group-hover/card:from-green-500/20 group-hover/card:to-green-500/10 transition-all duration-300">
                    <Phone className="h-6 w-6 text-green-600 wark:text-green-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900 wark:text-white leading-tight group-hover:text-green-600 wark:group-hover:text-green-400 transition-colors duration-200">
                    Add WhatsApp Contacts
                  </h3>
                  <p className="text-sm text-slate-600 wark:text-slate-300 leading-relaxed">
                    Manage your customer database efficiently with advanced contact management tools
                  </p>
                </div>

                {/* Feature badges */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 wark:border-slate-700">
                  <span className="text-xs bg-green-100 wark:bg-green-900/30 text-green-700 wark:text-green-400 px-2 py-1 rounded-full">Import CSV</span>
                  <span className="text-xs bg-blue-100 wark:bg-blue-900/30 text-blue-700 wark:text-blue-400 px-2 py-1 rounded-full">Bulk Actions</span>
                </div>

                {/* Decorative elements */}
                <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-green-500/10 transition-all duration-300 group-hover/card:scale-110" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
            </Link>

            <Link href="/settings/agents" className="group">
              <div className="group/card relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 hover:-translate-y-1 cursor-pointer wark:from-muted/40 wark:to-blue-900/10 wark:border-slate-700 wark:hover:border-blue-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 group-hover/card:from-blue-500/20 group-hover/card:to-blue-500/10 transition-all duration-300">
                    <Users className="h-6 w-6 text-blue-600 wark:text-blue-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900 wark:text-white leading-tight group-hover:text-blue-600 wark:group-hover:text-blue-400 transition-colors duration-200">
                    Add Team Members
                  </h3>
                  <p className="text-sm text-slate-600 wark:text-slate-300 leading-relaxed">
                    Collaborate with your team and manage permissions for better workflow
                  </p>
                </div>

                {/* Feature badges */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 wark:border-slate-700">
                  <span className="text-xs bg-blue-100 wark:bg-blue-900/30 text-blue-700 wark:text-blue-400 px-2 py-1 rounded-full">Role-based</span>
                  <span className="text-xs bg-purple-100 wark:bg-purple-900/30 text-purple-700 wark:text-purple-400 px-2 py-1 rounded-full">Permissions</span>
                </div>

                {/* Decorative elements */}
                <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-blue-500/10 transition-all duration-300 group-hover/card:scale-110" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
            </Link>

            <Link href="/integrations" className="group">
              <div className="group/card relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-purple-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-purple-200 hover:-translate-y-1 cursor-pointer wark:from-muted/40 wark:to-purple-900/10 wark:border-slate-700 wark:hover:border-purple-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 group-hover/card:from-purple-500/20 group-hover/card:to-purple-500/10 transition-all duration-300">
                    <Bot className="h-6 w-6 text-purple-600 wark:text-purple-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900 wark:text-white leading-tight group-hover:text-purple-600 wark:group-hover:text-purple-400 transition-colors duration-200">
                    Explore Integrations
                  </h3>
                  <p className="text-sm text-slate-600 wark:text-slate-300 leading-relaxed">
                    Connect with Google Sheets, Facebook forms, and 50+ other platforms
                  </p>
                </div>

                {/* Feature badges */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 wark:border-slate-700">
                  <span className="text-xs bg-purple-100 wark:bg-purple-900/30 text-purple-700 wark:text-purple-400 px-2 py-1 rounded-full">50+ Apps</span>
                  <span className="text-xs bg-green-100 wark:bg-green-900/30 text-green-700 wark:text-green-400 px-2 py-1 rounded-full">Real-time</span>
                </div>

                {/* Decorative elements */}
                <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-purple-500/10 transition-all duration-300 group-hover/card:scale-110" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
            </Link>

            <Link href="/settings/developers" className="group">
              <div className="group/card relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-orange-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-orange-200 hover:-translate-y-1 cursor-pointer wark:from-muted/40 wark:to-orange-900/10 wark:border-slate-700 wark:hover:border-orange-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 group-hover/card:from-orange-500/20 group-hover/card:to-orange-500/10 transition-all duration-300">
                    <BookOpen className="h-6 w-6 text-orange-600 wark:text-orange-400" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900 wark:text-white leading-tight group-hover:text-orange-600 wark:group-hover:text-orange-400 transition-colors duration-200">
                    APIs & Webhooks
                  </h3>
                  <p className="text-sm text-slate-600 wark:text-slate-300 leading-relaxed">
                    Build custom integrations with our comprehensive API documentation
                  </p>
                </div>

                {/* Feature badges */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 wark:border-slate-700">
                  <span className="text-xs bg-orange-100 wark:bg-orange-900/30 text-orange-700 wark:text-orange-400 px-2 py-1 rounded-full">REST API</span>
                  <span className="text-xs bg-blue-100 wark:bg-blue-900/30 text-blue-700 wark:text-blue-400 px-2 py-1 rounded-full">Webhooks</span>
                </div>

                {/* Decorative elements */}
                <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-orange-500/10 transition-all duration-300 group-hover/card:scale-110" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
            </Link>
          </div>

          {/* Quick action buttons */}
          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 wark:bg-slate-800">
                <Zap className="h-4 w-4 text-slate-600 wark:text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 wark:text-white">Quick Actions</h3>
            </div>

            <div className="flex flex-wrap space-y-2 gap-3">
              <Link href="/templates">
                <button className="group/btn inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 wark:border-slate-600 bg-white wark:bg-slate-800 px-4 py-3 text-sm font-medium text-slate-600 wark:text-slate-300 transition-all duration-200 hover:border-green-300 wark:hover:border-green-600 hover:bg-green-50 wark:hover:bg-green-900/20 hover:text-green-600 wark:hover:text-green-400 hover:shadow-sm hover:-translate-y-0.5">
                  <FolderKanban className="h-4 w-4 transition-transform duration-200 group-hover/btn:scale-110" />
                  <span>Template Library</span>
                </button>
              </Link>

              <Link href="/contacts">
                <button className="group/btn  inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 wark:border-slate-600 bg-white wark:bg-slate-800 px-4 py-3 text-sm font-medium text-slate-600 wark:text-slate-300 transition-all duration-200 hover:border-blue-300 wark:hover:border-blue-600 hover:bg-blue-50 wark:hover:bg-blue-900/20 hover:text-blue-600 wark:hover:text-blue-400 hover:shadow-sm hover:-translate-y-0.5">
                  <Users className="h-4 w-4 transition-transform duration-200 group-hover/btn:scale-110" />
                  <span>Contact Management</span>
                </button>
              </Link>

              <Link href="/analytics">
                <button className="group/btn inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 wark:border-slate-600 bg-white wark:bg-slate-800 px-4 py-3 text-sm font-medium text-slate-600 wark:text-slate-300 transition-all duration-200 hover:border-purple-300 wark:hover:border-purple-600 hover:bg-purple-50 wark:hover:bg-purple-900/20 hover:text-purple-600 wark:hover:text-purple-400 hover:shadow-sm hover:-translate-y-0.5">
                  <BarChart3 className="h-4 w-4 transition-transform duration-200 group-hover/btn:scale-110" />
                  <span>View Analytics</span>
                </button>
              </Link>
            </div>

            {/* Decorative element */}
            <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-slate-500/10 transition-all duration-300 group-hover:scale-110" />
          </div>
        </div>

        {/* Instagram Onboarding Modal */}
        <InstagramOnboardingModal
          isOpen={showInstagramOnboarding}
          onClose={() => setShowInstagramOnboarding(false)}
          onConnect={handleInstagramConnect}
        />
      </main>
    </Layout>
  );
}
