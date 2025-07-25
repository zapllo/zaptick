"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  MessageSquare, 
  Bot, 
  Users, 
  Zap, 
  Shield,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Star,
  Sparkles,
  Crown,
  Rocket,
  Info,
  PhoneCall,
  Globe,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  Smartphone,
  Monitor,
  FileText,
  Database,
  Key,
  Brain,
  Building2,
  MessageCircle,
  Activity,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/pricing";
import { motion, AnimatePresence } from "framer-motion";

interface PricingPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tagline: string;
  price: {
    quarterly: number;
    yearly: number;
  };
  yearlyDiscount?: number;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  bgGradient: string;
  borderColor: string;
  badgeColor: string;
  decorativeColor: string;
}

const plans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    displayName: "Starter",
    description: "Build simple bots",
    tagline: "Perfect for small businesses getting started",
    price: {
      quarterly: 8832, // ₹2500 * 3 months + 18% GST = ₹8,832
      yearly: 2500 // Display yearly as the base price per month
    },
    yearlyDiscount: 15,
    features: [
      "Team inbox (5 agents free)",
      "Send bulk broadcasts",
      "Bulk import",
      "Define customer segments",
      "Share products and catalogues",
      "Detailed broadcast analytics",
      "Excel export and import",
      "Google sheets integration",
      "Access on mobile and web",
      "Unlimited tags",
      "10 custom attributes"
    ],
    icon: <MessageSquare className="h-6 w-6" />,
    color: "text-blue-600",
    gradient: "from-blue-500 to-blue-600",
    bgGradient: "from-white to-blue-50/30",
    borderColor: "hover:border-blue-200",
    badgeColor: "bg-blue-100 text-blue-700",
    decorativeColor: "bg-blue-500/10"
  },
  {
    id: "pro",
    name: "Pro",
    displayName: "Pro",
    description: "Build complex bots",
    tagline: "Advanced features for growing businesses",
    price: {
      quarterly: 12390, // ₹3500 * 3 months + 18% GST = ₹12,390
      yearly: 3500 // Display yearly as the base price per month
    },
    yearlyDiscount: 15,
    features: [
      "Everything available in Starter",
      "Team inbox (10 agents free)",
      "Roles & permissions",
      "Number masking",
      "Automated ordering bot",
      "3rd party integrations",
      "Developer API",
      "Agent & Organisation Analytics",
      "Reports",
      "30 custom attributes"
    ],
    popular: true,
    icon: <TrendingUp className="h-6 w-6" />,
    color: "text-primary",
    gradient: "from-primary to-primary/80",
    bgGradient: "from-white to-green-50/30",
    borderColor: "hover:border-green-200",
    badgeColor: "bg-green-100 text-green-700",
    decorativeColor: "bg-green-500/10"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    displayName: "Enterprise",
    description: "AI and ChatGPT bots",
    tagline: "Ultimate solution for large organizations",
    price: {
      quarterly: 0, // Custom pricing
      yearly: 0
    },
    features: [
      "Everything available in Pro",
      "Custom pricing per agent",
      "Complex journeys",
      "Special customizations",
      "Special integrations",
      "50 custom attributes",
      "Dedicated support",
      "Priority implementation",
      "Custom SLA"
    ],
    icon: <Crown className="h-6 w-6" />,
    color: "text-amber-600",
    gradient: "from-amber-500 to-amber-600",
    bgGradient: "from-white to-amber-50/30",
    borderColor: "hover:border-amber-200",
    badgeColor: "bg-amber-100 text-amber-700",
    decorativeColor: "bg-amber-500/10"
  }
];

const whyChooseFeatures = [
  {
    title: "Smart Automation",
    description: "Build sophisticated chatbots without coding knowledge",
    icon: <Bot className="h-6 w-6" />,
    gradient: "from-purple-500 to-purple-600",
    bgGradient: "from-white to-purple-50/30",
    decorativeColor: "bg-purple-500/10",
    borderColor: "hover:border-purple-200"
  },
  {
    title: "Team Collaboration",
    description: "Manage conversations seamlessly with your entire team",
    icon: <Users className="h-6 w-6" />,
    gradient: "from-blue-500 to-blue-600",
    bgGradient: "from-white to-blue-50/30",
    decorativeColor: "bg-blue-500/10",
    borderColor: "hover:border-blue-200"
  },
  {
    title: "Detailed Analytics",
    description: "Track performance with comprehensive real-time reports",
    icon: <BarChart3 className="h-6 w-6" />,
    gradient: "from-green-500 to-green-600",
    bgGradient: "from-white to-green-50/30",
    decorativeColor: "bg-green-500/10",
    borderColor: "hover:border-green-200"
  },
  {
    title: "Multi-Platform Access",
    description: "Access your dashboard on mobile, web, and desktop",
    icon: <Monitor className="h-6 w-6" />,
    gradient: "from-indigo-500 to-indigo-600",
    bgGradient: "from-white to-indigo-50/30",
    decorativeColor: "bg-indigo-500/10",
    borderColor: "hover:border-indigo-200"
  },
  {
    title: "Advanced Integrations",
    description: "Connect with your favorite tools and platforms",
    icon: <Zap className="h-6 w-6" />,
    gradient: "from-orange-500 to-orange-600",
    bgGradient: "from-white to-orange-50/30",
    decorativeColor: "bg-orange-500/10",
    borderColor: "hover:border-orange-200"
  },
  {
    title: "24/7 Support",
    description: "Get help whenever you need it with our dedicated support",
    icon: <Shield className="h-6 w-6" />,
    gradient: "from-red-500 to-red-600",
    bgGradient: "from-white to-red-50/30",
    decorativeColor: "bg-red-500/10",
    borderColor: "hover:border-red-200"
  }
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const getCurrentPrice = (plan: PricingPlan) => {
    if (plan.id === 'enterprise') return 0;
    return isYearly ? plan.price.yearly : plan.price.quarterly;
  };

  const handleSubscribe = async (planId: string) => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Required", 
        description: "Please agree to the terms and conditions to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (planId === "enterprise") {
      window.location.href = "mailto:sales@zaptick.com?subject=Enterprise Plan Inquiry";
      return;
    }

    setLoading(planId);
    
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error("Plan not found");

      const amount = getCurrentPrice(plan);
      
      // Create Razorpay order
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100,
          currency: 'INR',
          receipt: `plan_${planId}_${Date.now()}`,
          notes: {
            plan_id: planId,
            plan_name: plan.name,
            billing_cycle: isYearly ? 'yearly' : 'quarterly',
            amount: amount
          }
        }),
      });

      const { orderId } = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: 'Zaptick',
        description: `${plan.name} - ${isYearly ? 'yearly' : 'quarterly'} subscription`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResult.success) {
              await fetch('/api/subscription/update', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  plan_id: planId,
                  billing_cycle: isYearly ? 'yearly' : 'quarterly',
                  payment_id: response.razorpay_payment_id,
                  order_id: response.razorpay_order_id,
                  amount: amount
                }),
              });

              toast({
                title: "Subscription Activated!",
                description: `Your ${plan.name} plan has been activated successfully.`,
              });

              router.push('/wallet');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Error",
              description: "There was an issue verifying your payment. Please contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
        },
        theme: {
          color: '#1D4B3E',
        },
        modal: {
          ondismiss: function() {
            setLoading(null);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">WhatsApp Business API Pricing</h1>
                <p className="text-sm text-gray-600">A marketing automation tool that doesn&apos;t burn the pocket</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Trusted by businesses worldwide
            </div>
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan to automate your WhatsApp Business and achieve your goals
            </p>
          </div>

          {/* Billing Toggle - Updated */}
          <div className="flex items-center justify-center space-x-4 bg-white rounded-full p-1 border border-gray-200 w-fit mx-auto">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !isYearly 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isYearly 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-0">
                Save 15%
              </Badge>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <AnimatePresence mode="wait">
            {plans.map((plan, index) => (
              <motion.div
                key={`${plan.id}-${isYearly}`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: plan.popular ? 1.05 : 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <div className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br ${plan.bgGradient} p-6 shadow-sm transition-all duration-300 hover:shadow-md ${plan.borderColor} wark:from-muted/40 wark:to-muted/10`}>
                  {/* Popular Badge */}
                  {plan.popular && (
                    <span className="absolute top-2 right-0 z-[100]  transform  inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white shadow-lg">
                      <Star className="h-3 w-3" />
                      Most Popular
                    </span>
                  )}

                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient} shadow-lg text-white`}>
                        {plan.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 wark:text-white text-lg">{plan.displayName}</p>
                        <p className="text-sm text-gray-600 font-medium">{plan.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6">
                    {plan.id === 'enterprise' ? (
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-gray-900">Custom Pricing</div>
                        <p className="text-sm text-gray-600">Tailored to your needs</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-bold text-gray-900">
                            ₹{getCurrentPrice(plan).toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-600">
                            {isYearly ? '/month' : '/quarter'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {isYearly ? (
                            <>
                              <span>(Billed yearly)</span>
                              {plan.yearlyDiscount && (
                                <span className="text-green-600 font-medium ml-2">
                                  Save {plan.yearlyDiscount}%
                                </span>
                              )}
                            </>
                          ) : (
                            <span>(Billed quarterly)</span>
                          )}
                          <br />
                          Additional 18% GST chargeable
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-2 text-sm text-gray-600 wark:text-gray-300">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full transition-all duration-200 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl' 
                        : plan.id === 'enterprise'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                    size="lg"
                  >
                    {loading === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {plan.id === 'enterprise' ? (
                          <>
                            <PhoneCall className="h-4 w-4 mr-2" />
                            Contact Sales
                          </>
                        ) : (
                          <>
                            <Rocket className="h-4 w-4 mr-2" />
                            Get Started
                          </>
                        )}
                      </>
                    )}
                  </Button>

                  {/* Decorative element */}
                  <div className={`absolute -right-8 -top-8 h-16 w-16 rounded-full ${plan.decorativeColor} transition-all duration-300 group-hover:scale-110`} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Why Choose Zaptick */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Target className="h-4 w-4" />
              Why businesses choose us
            </div>
            <h3 className="text-3xl font-bold text-gray-900">Everything you need to succeed</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you automate, engage, and grow your business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="group relative overflow-hidden rounded-xl border bg-gradient-to-br"
                style={{
                  background: `linear-gradient(to bottom right, white, ${feature.bgGradient.split(' ')[2]})`
                }}
              >
                <div className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br ${feature.bgGradient} p-6 shadow-sm transition-all duration-300 hover:shadow-md ${feature.borderColor}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg text-white`}>
                        {feature.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{feature.title}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>

                  {/* Decorative element */}
                  <div className={`absolute -right-8 -top-8 h-16 w-16 rounded-full ${feature.decorativeColor} transition-all duration-300 group-hover:scale-110`} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Terms and Conditions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-start space-x-3">
            <Switch
              checked={agreedToTerms}
              onCheckedChange={setAgreedToTerms}
              className="mt-1"
            />
            <div className="flex-1">
              <label className="text-sm text-gray-700 cursor-pointer">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-primary hover:text-primary/80 font-medium underline">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" className="text-primary hover:text-primary/80 font-medium underline">
                  Privacy Policy
                </a>
                . All prices are exclusive of 18% GST.
              </label>
            </div>
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center space-y-6"
        >
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <a href="mailto:support@zaptick.com" className="flex items-center space-x-2 hover:text-primary transition-colors">
              <PhoneCall className="h-4 w-4" />
              <span>Contact Support</span>
            </a>
            <a href="/demo" className="flex items-center space-x-2 hover:text-primary transition-colors">
              <Settings className="h-4 w-4" />
              <span>Book a Demo</span>
            </a>
            <a href="/help" className="flex items-center space-x-2 hover:text-primary transition-colors">
              <Info className="h-4 w-4" />
              <span>Help Center</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}