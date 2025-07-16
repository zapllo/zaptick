"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Settings
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
  price: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  savings: {
    quarterly: number;
    yearly: number;
  };
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  marketingConversationRate: number;
  utilityConversationRate: number;
  authConversationRate: number;
}

const plans: PricingPlan[] = [
  {
    id: "starter",
    name: "STARTER",
    displayName: "Starter",
    description: "Perfect for small businesses getting started",
    price: {
      monthly: 999,
      quarterly: 2757,
      yearly: 9588
    },
    savings: {
      quarterly: 240,
      yearly: 1400
    },
    features: [
      "Unlimited free service conversations",
      "Unlimited team members",
      "Free WhatsApp Business Platform onboarding",
      "Chat automation (OOO, First greeting)",
      "Bulk WhatsApp notifications and campaign analytics",
      "WhatsApp Shared Team Inbox with quick replies",
      "Agent assignment, labels and more",
      "Up to 1 app integration (Shopify/Woocommerce/Razorpay/PayU)",
      "Unlimited Live Chat conversations",
      "48 hours SLA for Support"
    ],
    icon: <MessageSquare className="h-5 w-5" />,
    color: "text-blue-600",
    gradient: "from-blue-500 to-blue-600",
    marketingConversationRate: 0.882,
    utilityConversationRate: 0.160,
    authConversationRate: 0.129
  },
  {
    id: "growth",
    name: "GROWTH",
    displayName: "Growth",
    description: "Scale your business with advanced features",
    price: {
      monthly: 2499,
      quarterly: 6897,
      yearly: 23988
    },
    savings: {
      quarterly: 600,
      yearly: 5400
    },
    features: [
      "Everything in Starter, plus",
      "Advanced Campaign Filters",
      "Conversation Analytics",
      "Additional Chat automation (Delayed Message, Custom auto replies)",
      "Commerce (Catalog, Auto-checkout Workflow, Order Management)",
      "WhatsApp Pay integration",
      "Roles and permissions",
      "24 hours SLA for Support",
      "Up to 3 app integrations",
      "Developer APIs access to Template/Message send API",
      "Message Status Webhooks",
      "API Rate Limit - 300 msgs/min",
      "Campaign Summary Report (All)",
      "All Instagram Features - DMs, Comments, Quick Flows"
    ],
    popular: true,
    icon: <TrendingUp className="h-5 w-5" />,
    color: "text-primary",
    gradient: "from-primary to-primary/80",
    marketingConversationRate: 0.871,
    utilityConversationRate: 0.150,
    authConversationRate: 0.128
  },
  {
    id: "advanced",
    name: "ADVANCED",
    displayName: "Advanced",
    description: "For growing businesses with complex needs",
    price: {
      monthly: 3499,
      quarterly: 9657,
      yearly: 33588
    },
    savings: {
      quarterly: 840,
      yearly: 7500
    },
    features: [
      "Everything in Growth, plus",
      "Unlimited external apps integration",
      "Developer APIs access to Sessions message, Incoming messages",
      "API Rate Limit - 600 msgs/min",
      "Agent Stats and detailed analytics",
      "Automate chats with Auto & trait-based routing",
      "Detailed (user-level) campaign report",
      "Advanced workflow automation",
      "Priority support with 12-hour SLA",
      "Custom integrations support"
    ],
    icon: <BarChart3 className="h-5 w-5" />,
    color: "text-purple-600",
    gradient: "from-purple-500 to-purple-600",
    marketingConversationRate: 0.863,
    utilityConversationRate: 0.140,
    authConversationRate: 0.127
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    displayName: "Enterprise",
    description: "Ultimate solution for large organizations",
    price: {
      monthly: 49999,
      quarterly: 142000,
      yearly: 540000
    },
    savings: {
      quarterly: 8000,
      yearly: 59988
    },
    features: [
      "Everything in Advanced, plus",
      "Outbound & Inbound conversations charged on actuals (No markup)",
      "High speed messaging",
      "Connect with Martech tools - Clevertap, Webengage, Moengage",
      "API Rate Limit up to 60,000 msg/min",
      "Dedicated Customer Success Manager",
      "Custom fields in Detailed campaign reports",
      "White-label solutions available",
      "Custom development and integrations",
      "24/7 dedicated support",
      "On-premise deployment options"
    ],
    icon: <Crown className="h-5 w-5" />,
    color: "text-amber-600",
    gradient: "from-amber-500 to-amber-600",
    marketingConversationRate: 0.850,
    utilityConversationRate: 0.130,
    authConversationRate: 0.125
  }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("quarterly");
  const [loading, setLoading] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isYearly, setIsYearly] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isYearly) {
      setBillingCycle("yearly");
    } else {
      setBillingCycle("quarterly");
    }
  }, [isYearly]);

  const handleSubscribe = async (planId: string) => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to proceed.",
        variant: "destructive",
      });
      return;
    }

    setLoading(planId);
    
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error("Plan not found");

      const amount = plan.price[billingCycle];
      
      // Create Razorpay order
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          currency: 'INR',
          receipt: `plan_${planId}_${Date.now()}`,
          notes: {
            plan_id: planId,
            plan_name: plan.name,
            billing_cycle: billingCycle,
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
        description: `${plan.name} - ${billingCycle} subscription`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
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
              // Update subscription in database
              await fetch('/api/subscription/update', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  plan_id: planId,
                  billing_cycle: billingCycle,
                  payment_id: response.razorpay_payment_id,
                  order_id: response.razorpay_order_id,
                  amount: amount
                }),
              });

              toast({
                title: "Subscription Activated!",
                description: `Your ${plan.name} plan has been activated successfully.`,
              });

              // Redirect to wallet or dashboard
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
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className=" backdrop-blur-sm border-b sticky top-0 z-50">
        <div className=" mx-auto px-4  ">
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
                <h1 className="text-xl font-bold text-gray-900">Choose Your Plan</h1>
                <p className="text-sm text-gray-600">Select the perfect plan for your business</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <PhoneCall className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Need help? Contact support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
              Trusted by 10,000+ businesses
            </div>
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Scale your business with <span className="text-primary">WhatsApp automation</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From startups to enterprises, choose the plan that fits your needs and grow your customer engagement.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            <Badge variant="secondary" className="ml-2">
              Save up to 30%
            </Badge>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 mt-16 md:grid-cols-2 lg:grid-cols-2 gap-6"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative group  ${plan.popular ? 'md:scale-105' : ''}`}
            >
              <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular 
                  ? 'border-primary shadow-lg ring-1 ring-primary/20' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/80" />
                )}
                
                <CardHeader className="pb-4">
                  {plan.popular && (
                    <Badge className="absolute mt-3 -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  )}
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r ${plan.gradient} text-white shadow-lg`}>
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{plan.displayName}</h3>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatCurrency(plan.price[billingCycle])}
                      </span>
                      <span className="text-sm text-gray-600">
                        per {billingCycle}
                      </span>
                    </div>
                    
                    {billingCycle !== "monthly" && (
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-green-600 font-medium">
                          Save {formatCurrency(plan.savings[billingCycle])}
                        </div>
                        <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                          {Math.round((plan.savings[billingCycle] / (plan.price.monthly * (billingCycle === 'quarterly' ? 3 : 12))) * 100)}% off
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Conversation Rates */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Conversation Rates</span>
                    </div>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Marketing</span>
                        <span className="font-mono">₹{plan.marketingConversationRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Utility</span>
                        <span className="font-mono">₹{plan.utilityConversationRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Authentication</span>
                        <span className="font-mono">₹{plan.authConversationRate}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 italic">
                      *Rates for Indian destination numbers
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">What's included</span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {plan.features.slice(0, 6).map((feature, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Check className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 6 && (
                        <div className="text-xs text-gray-500 italic">
                          + {plan.features.length - 6} more features
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full transition-all duration-200 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl' 
                        : 'bg-gray-900 hover:bg-gray-800'
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
                        {plan.popular ? <Rocket className="h-4 w-4 mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                        Get Started
                      </>
                    )}
                  </Button>
                </CardContent>

                {/* Decorative gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Comparison */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Not sure which plan is right for you?</h3>
            <p className="text-gray-600">Compare features across all plans to find your perfect fit</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 rounded-xl bg-blue-50 border border-blue-200">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Getting Started</h4>
              <p className="text-sm text-gray-600 mb-4">Perfect for small businesses and solopreneurs</p>
              <Badge variant="outline" className="text-blue-600 border-blue-200">Starter Plan</Badge>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-primary/5 border border-primary/20">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Growing Business</h4>
              <p className="text-sm text-gray-600 mb-4">Advanced features for scaling companies</p>
              <Badge className="bg-primary text-white">Growth Plan</Badge>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-amber-50 border border-amber-200">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl mb-4">
                <Crown className="h-6 w-6 text-amber-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Enterprise</h4>
              <p className="text-sm text-gray-600 mb-4">Custom solutions for large organizations</p>
              <Badge variant="outline" className="text-amber-600 border-amber-200">Enterprise Plan</Badge>
            </div>
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
                . By subscribing, you acknowledge that you have read and understand our terms.
              </label>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center space-y-6"
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="p-6 bg-white rounded-xl border border-gray-200 text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Can I change my plan later?</h4>
                <p className="text-sm text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-gray-200 text-left">
                <h4 className="font-semibold text-gray-900 mb-2">What happens to my data if I cancel?</h4>
                <p className="text-sm text-gray-600">Your data is safely stored for 30 days after cancellation, giving you time to reactivate or export.</p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-gray-200 text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h4>
                <p className="text-sm text-gray-600">Yes, we offer a 14-day money-back guarantee for all our plans, no questions asked.</p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-gray-200 text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Is there a setup fee?</h4>
                <p className="text-sm text-gray-600">No setup fees! We also provide free onboarding assistance to help you get started quickly.</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <a href="/pricing-details" className="flex items-center space-x-2 hover:text-primary transition-colors">
              <Info className="h-4 w-4" />
              <span>Detailed Pricing</span>
            </a>
            <a href="/help" className="flex items-center space-x-2 hover:text-primary transition-colors">
              <PhoneCall className="h-4 w-4" />
              <span>Contact Support</span>
            </a>
            <a href="/demo" className="flex items-center space-x-2 hover:text-primary transition-colors">
              <Settings className="h-4 w-4" />
              <span>Book a Demo</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}