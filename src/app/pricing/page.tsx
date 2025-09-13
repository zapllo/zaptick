"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    CheckCircle,
    Zap,
    MessageSquare,
    BarChart2,
    Users,
    ChevronRight,
    ChevronDown,
    Shield,
    Globe,
    ArrowRight,
    TrendingUp,
    Target,
    Bot,
    Sparkles,
    Crown,
    Rocket,
    Info,
    PhoneCall,
    Settings,
    Monitor,
    Database,
    Star,
    X,
    Building2,
    MessageCircle,
    Activity,
    Smartphone,
    Clock,
    Key,
    FileText,
    Brain,
    Layers,
    PieChart,
    BarChart3,
    Headphones,
    Lock,
    Timer,
    Minus,
    CheckCircle2
} from "lucide-react";
import PartnerBadges from "@/components/ui/partner-badges";

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
            quarterly: 7500,
            yearly: 2125
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
            quarterly: 10500,
            yearly: 2975
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
            quarterly: 0,
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

const detailedFeatures = [
    {
        category: "Communication & Messaging",
        icon: MessageSquare,
        features: [
            { name: "Team Inbox", starter: "5 agents", pro: "10 agents", enterprise: "Unlimited" },
            { name: "Bulk Broadcasts", starter: true, pro: true, enterprise: true },
            { name: "Rich Media Support", starter: true, pro: true, enterprise: true },
            { name: "Message Templates", starter: "Basic", pro: "Advanced", enterprise: "Custom" },
            { name: "Smart Replies", starter: false, pro: true, enterprise: true },
            { name: "Auto-responders", starter: "Basic", pro: "Advanced", enterprise: "AI-Powered" }
        ]
    },
    {
        category: "Automation & Bots",
        icon: Bot,
        features: [
            { name: "Chatbot Builder", starter: "Basic", pro: "Advanced", enterprise: "AI-Enhanced" },
            { name: "Conversation Flows", starter: "Simple", pro: "Complex", enterprise: "Unlimited" },
            { name: "AI Integration", starter: false, pro: "Limited", enterprise: "Full" },
            { name: "Smart Routing", starter: false, pro: true, enterprise: true },
            { name: "Custom Workflows", starter: "3", pro: "20", enterprise: "Unlimited" },
            { name: "API Access", starter: false, pro: "REST API", enterprise: "Full API Suite" }
        ]
    },
    {
        category: "Analytics & Reporting",
        icon: BarChart3,
        features: [
            { name: "Basic Analytics", starter: true, pro: true, enterprise: true },
            { name: "Advanced Reports", starter: false, pro: true, enterprise: true },
            { name: "Custom Dashboards", starter: false, pro: "Limited", enterprise: "Unlimited" },
            { name: "Real-time Metrics", starter: "Basic", pro: "Advanced", enterprise: "Enterprise" },
            { name: "Data Export", starter: "CSV", pro: "CSV, Excel", enterprise: "All Formats" },
            { name: "API Analytics", starter: false, pro: "Basic", enterprise: "Advanced" }
        ]
    },
    {
        category: "Integrations & Tools",
        icon: Zap,
        features: [
            { name: "CRM Integration", starter: "Basic", pro: "Advanced", enterprise: "Custom" },
            { name: "E-commerce Platforms", starter: "2", pro: "10", enterprise: "Unlimited" },
            { name: "Payment Gateways", starter: "1", pro: "5", enterprise: "Unlimited" },
            { name: "Webhook Support", starter: false, pro: true, enterprise: true },
            { name: "Third-party Apps", starter: "5", pro: "25", enterprise: "Unlimited" },
            { name: "Custom Integrations", starter: false, pro: "Limited", enterprise: "Full" }
        ]
    },
    {
        category: "Support & Security",
        icon: Shield,
        features: [
            { name: "Customer Support", starter: "Email", pro: "Email + Chat", enterprise: "24/7 Dedicated" },
            { name: "Implementation Support", starter: "Self-service", pro: "Guided", enterprise: "White-glove" },
            { name: "Data Security", starter: "Standard", pro: "Advanced", enterprise: "Enterprise" },
            { name: "SLA", starter: "99.5%", pro: "99.9%", enterprise: "Custom SLA" },
            { name: "Backup & Recovery", starter: "Basic", pro: "Advanced", enterprise: "Enterprise" },
            { name: "Compliance", starter: "GDPR", pro: "GDPR, SOC2", enterprise: "Full Compliance" }
        ]
    }
];

const whyChooseFeatures = [
    {
        title: "Enterprise-Grade Security",
        description: "Bank-level encryption and compliance with international standards",
        icon: Shield,
        color: "red",
        gradient: "from-red-500 to-red-600"
    },
    {
        title: "99.9% Uptime Guarantee",
        description: "Reliable infrastructure ensuring your business never stops",
        icon: Activity,
        color: "green",
        gradient: "from-green-500 to-green-600"
    },
    {
        title: "Lightning Fast Setup",
        description: "Get up and running in under 5 minutes with guided onboarding",
        icon: Rocket,
        color: "blue",
        gradient: "from-blue-500 to-blue-600"
    },
    {
        title: "24/7 Expert Support",
        description: "Dedicated support team ready to help you succeed",
        icon: Headphones,
        color: "purple",
        gradient: "from-purple-500 to-purple-600"
    },
    {
        title: "Seamless Integrations",
        description: "Connect with 40+ tools and platforms you already use",
        icon: Layers,
        color: "indigo",
        gradient: "from-indigo-500 to-indigo-600"
    },
    {
        title: "Global Scale",
        description: "Trusted by businesses in 50+ countries worldwide",
        icon: Globe,
        color: "cyan",
        gradient: "from-cyan-500 to-cyan-600"
    }
];

const testimonials = [
    {
        quote: "Zaptick transformed our customer communication. We saw 5x better engagement than email.",
        author: "Sarah Johnson",
        position: "Marketing Director",
        company: "TechCorp",
        image: "/avatars/female1.jpg",
        plan: "Pro"
    },
    {
        quote: "The ROI is incredible. Our WhatsApp campaigns now drive 40% of our revenue.",
        author: "Michael Chen",
        position: "CEO",
        company: "E-commerce Plus",
        image: "/avatars/man6.jpg",
        plan: "Enterprise"
    },
    {
        quote: "Customer support costs reduced by 60% while satisfaction scores hit all-time highs.",
        author: "Elena Rodriguez",
        position: "Operations Head",
        company: "ServiceFirst",
        image: "/avatars/female2.jpg",
        plan: "Pro"
    }
];

const faqs = [
    {
        question: "Can I switch plans anytime?",
        answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
    },
    {
        question: "What happens if I exceed my plan limits?",
        answer: "We'll notify you before you reach your limits. You can either upgrade your plan or purchase additional capacity as needed."
    },
    {
        question: "Is there a free trial?",
        answer: "We offer a free demo and consultation to help you understand how Zaptick can benefit your business. Contact our team to get started."
    },
    {
        question: "Do you offer custom enterprise solutions?",
        answer: "Yes, our Enterprise plan includes custom pricing, dedicated support, and tailored solutions for large organizations."
    },
    {
        question: "What kind of support do you provide?",
        answer: "Support varies by plan - from email support on Starter to 24/7 dedicated support on Enterprise, plus comprehensive documentation and training resources."
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. We use enterprise-grade encryption, comply with GDPR and other regulations, and maintain the highest security standards."
    }
];

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const GST_RATE = 0.18;

    const getBasePrice = (plan: PricingPlan) => {
        if (plan.id === 'enterprise') return 0;
        if (isYearly) {
            return plan.price.yearly * 12;
        } else {
            return plan.price.quarterly;
        }
    };

    const getCurrentPrice = (plan: PricingPlan) => {
        if (plan.id === 'enterprise') return 0;
        const basePrice = getBasePrice(plan);
        return Math.round(basePrice * (1 + GST_RATE));
    };

    const getDisplayPrice = (plan: PricingPlan) => {
        if (plan.id === 'enterprise') return 0;
        if (isYearly) {
            return plan.price.yearly;
        } else {
            return Math.round(plan.price.quarterly / 3);
        }
    };

    return (
        <div className="bg-white overflow-hidden">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-20 pb-16 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-green-100/40 via-blue-100/30 to-purple-100/40 rounded-full blur-3xl opacity-60" />
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
                </div>

                <div className=" mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center space-y-8"
                    >
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                            >
                                <Sparkles className="h-4 w-4" />
                                Trusted by businesses worldwide
                            </motion.div>
                            {/* Partner Badges */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2, duration: 0.5 }}
                                className="pt-6 flex justify-center"
                            >
                                <PartnerBadges animated={true} size="md" />
                            </motion.div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Simple, transparent
                                <span className="relative inline-block ml-4">
                                    <span className="relative z-10 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                        pricing
                                    </span>
                                    <motion.div
                                        className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-green-200 to-blue-200 rounded-full"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 0.8, duration: 1 }}
                                    />
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                Choose the perfect plan to automate your WhatsApp Business and achieve your goals.
                                Start free, scale as you grow.
                            </p>
                        </div>

                        {/* Billing Toggle */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="flex items-center justify-center space-x-4 bg-white rounded-full p-1 border border-gray-200 w-fit mx-auto shadow-sm"
                        >
                            <button
                                onClick={() => setIsYearly(false)}
                                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${!isYearly
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Quarterly
                            </button>
                            <button
                                onClick={() => setIsYearly(true)}
                                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isYearly
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Yearly
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-0">
                                    Save 15%
                                </Badge>
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-16 bg-gray-50/50">
                <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        <AnimatePresence mode="wait">
                            {plans.map((plan, index) => (
                                <motion.div
                                    key={`${plan.id}-${isYearly}`}
                                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: plan.popular ? 1.02 : 1 }}
                                    exit={{ opacity: 0, y: -30, scale: 0.9 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="relative group h-full"
                                >
                                    <div className={`group relative h-full overflow-hidden rounded-2xl border-2 bg-gradient-to-br ${plan.bgGradient} p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${plan.borderColor} ${plan.popular ? 'border-primary shadow-primary/10' : ''}`}>
                                        {/* Popular Badge */}
                                        {plan.popular && (
                                            <span className="absolute top-2  left-2 z-[100] inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg">
                                                <Star className="h-4 w-4" />
                                                Most Popular
                                            </span>
                                        )}

                                        {/* Plan Header */}
                                        <div className="text-center mb-8">
                                            <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${plan.gradient} shadow-lg text-white mb-4`}>
                                                {plan.icon}
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.displayName}</h3>
                                            <p className="text-gray-600 font-medium mb-1">{plan.description}</p>
                                            <p className="text-sm text-gray-500">{plan.tagline}</p>
                                        </div>

                                        {/* Pricing */}
                                        <div className="text-center mb-8">
                                            {plan.id === 'enterprise' ? (
                                                <div className="space-y-2">
                                                    <div className="text-4xl font-bold text-gray-900">Custom</div>
                                                    <p className="text-sm text-gray-600">Tailored to your needs</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="flex items-baseline justify-center space-x-2">
                                                        <span className="text-4xl font-bold text-gray-900">
                                                            ₹{getDisplayPrice(plan).toLocaleString()}
                                                        </span>
                                                        <span className="text-lg text-gray-600">/month</span>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {isYearly ? (
                                                            <>
                                                                <span>Billed yearly (₹{getCurrentPrice(plan).toLocaleString()})</span>
                                                                {plan.yearlyDiscount && (
                                                                    <div className="text-green-600 font-medium mt-1">
                                                                        Save {plan.yearlyDiscount}% vs quarterly
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span>Billed quarterly (₹{getCurrentPrice(plan).toLocaleString()})</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-2">
                                                        Includes 18% GST
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-4 mb-8">
                                            <div className="max-h- overflow-y-auto space-y-3">
                                                {plan.features.slice(0, 8).map((feature, featureIndex) => (
                                                    <motion.div
                                                        key={featureIndex}
                                                        className="flex items-start gap-3"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.3 + featureIndex * 0.05 }}
                                                    >
                                                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-sm text-gray-700">{feature}</span>
                                                    </motion.div>
                                                ))}
                                                {plan.features.length > 8 && (
                                                    <div className="text-sm text-gray-500 font-medium">
                                                        +{plan.features.length - 8} more features
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <Button
                                            className={`w-full h-12 transition-all duration-200 ${plan.popular
                                                ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl'
                                                : plan.id === 'enterprise'
                                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
                                                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                                                }`}
                                            size="lg"
                                        >
                                            <Link href={plan.id === 'enterprise' ? '/demo' : '/demo'} className="flex items-center gap-2">
                                                {plan.id === 'enterprise' ? (
                                                    <>
                                                        <PhoneCall className="h-4 w-4" />
                                                        Contact Sales
                                                    </>
                                                ) : (
                                                    <>
                                                        <Rocket className="h-4 w-4" />
                                                        Get Started
                                                    </>
                                                )}
                                            </Link>
                                        </Button>

                                        {/* Decorative element */}
                                        <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full ${plan.decorativeColor} transition-all duration-300 group-hover:scale-110`} />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </section>

            {/* Feature Comparison Table */}
            <section className="py-24 bg-white">
                <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Badge className="mb-4 px-4 py-2 bg-blue-50 text-blue-700 border-blue-200">
                            Detailed Comparison
                        </Badge>
                        <h2 className="text-4xl font-bold mb-6 text-gray-900">
                            Compare plans in detail
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            See exactly what&apos;s included in each plan and find the perfect fit for your business needs
                        </p>
                    </motion.div>

                    {/* Category Tabs */}
                    <motion.div
                        className="flex flex-wrap justify-center gap-2 mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        {detailedFeatures.map((category, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveTab(index)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === index
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <category.icon className="h-4 w-4" />
                                {category.category}
                            </button>
                        ))}
                    </motion.div>

                    {/* Comparison Table */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-900">
                                                {detailedFeatures[activeTab].category}
                                            </th>
                                            {plans.map((plan) => (
                                                <th key={plan.id} className="text-center py-4 px-6">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient} text-white`}>
                                                            {plan.icon}
                                                        </div>
                                                        <span className="font-semibold text-gray-900">{plan.name}</span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detailedFeatures[activeTab].features.map((feature, index) => (
                                            <motion.tr
                                                key={index}
                                                className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <td className="py-4 px-6 font-medium text-gray-900">{feature.name}</td>
                                                <td className="py-4 px-6 text-center">
                                                    {typeof feature.starter === 'boolean' ? (
                                                        feature.starter ? (
                                                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                                        ) : (
                                                            <X className="h-5 w-5 text-gray-400 mx-auto" />
                                                        )
                                                    ) : (
                                                        <span className="text-sm text-gray-700 font-medium">{feature.starter}</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {typeof feature.pro === 'boolean' ? (
                                                        feature.pro ? (
                                                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                                        ) : (
                                                            <X className="h-5 w-5 text-gray-400 mx-auto" />
                                                        )
                                                    ) : (
                                                        <span className="text-sm text-gray-700 font-medium">{feature.pro}</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {typeof feature.enterprise === 'boolean' ? (
                                                        feature.enterprise ? (
                                                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                                        ) : (
                                                            <X className="h-5 w-5 text-gray-400 mx-auto" />
                                                        )
                                                    ) : (
                                                        <span className="text-sm text-gray-700 font-medium">{feature.enterprise}</span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>

            {/* Why Choose Zaptick Section */}
            <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
                <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Badge className="mb-4 px-4 py-2 bg-green-50 text-green-700 border-green-200">
                            Why Choose Zaptick
                        </Badge>
                        <h2 className="text-4xl font-bold mb-6 text-gray-900">
                            Built for modern businesses
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Powerful features and enterprise-grade reliability that sets us apart from the competition
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {whyChooseFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-gray-50/30 p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-gray-200"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="h-7 w-7" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>

                                {/* Decorative element */}
                                <div className={`absolute -right-6 -top-6 h-16 w-16 rounded-full bg-${feature.color}-500/10 transition-all duration-300 group-hover:scale-110`} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-white">
                <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Badge className="mb-4 px-4 py-2 bg-purple-50 text-purple-700 border-purple-200">
                            Customer Success
                        </Badge>
                        <h2 className="text-4xl font-bold mb-6 text-gray-900">
                            Trusted by thousands of businesses
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            See how companies like yours are transforming their customer engagement with Zaptick
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-gray-50/30 p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-gray-200"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                {/* Plan Badge */}
                                <div className="flex items-center justify-between mb-6">
                                    <Badge className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
                                        {testimonial.plan} Plan
                                    </Badge>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                </div>

                                {/* Quote */}
                                <blockquote className="text-gray-700 font-medium leading-relaxed mb-8 italic">
                                    &quot;{testimonial.quote}&quot;
                                </blockquote>

                                {/* Author */}
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden border-2 border-white shadow-sm">
                                        <Image
                                            src={testimonial.image}
                                            alt={testimonial.author}
                                            width={48}
                                            height={48}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48' fill='none'%3E%3Crect width='48' height='48' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='18' fill='%236b7280'%3E" + testimonial.author.charAt(0) + "%3C/text%3E%3C/svg%3E";
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{testimonial.author}</h4>
                                        <p className="text-sm text-gray-600">{testimonial.position}</p>
                                        <p className="text-sm font-medium text-primary">{testimonial.company}</p>
                                    </div>
                                </div>

                                {/* Decorative element */}
                                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gray-500/5 transition-all duration-300 group-hover:scale-110" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-gray-50/50">
                <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Badge className="mb-4 px-4 py-2 bg-orange-50 text-orange-700 border-orange-200">
                            Got Questions?
                        </Badge>
                        <h2 className="text-4xl font-bold mb-6 text-gray-900">
                            Frequently asked questions
                        </h2>
                        <p className="text-lg text-gray-600">
                            Everything you need to know about our plans and pricing
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <button
                                    className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors duration-200"
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                                        {faq.question}
                                    </h3>
                                    <motion.div
                                        animate={{ rotate: openFaq === index ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown className="h-5 w-5 text-gray-500" />
                                    </motion.div>
                                </button>

                                <AnimatePresence>
                                    {openFaq === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-8 pb-6 text-gray-600 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-white">
                <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="relative  mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 p-12 md:p-16 shadow-2xl">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-black/10" />
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />

                            <div className="relative z-10 text-center">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Badge className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30">
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Get Started Today
                                    </Badge>
                                </motion.div>

                                <motion.h2
                                    className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Ready to transform your WhatsApp Business?
                                </motion.h2>

                                <motion.p
                                    className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Join thousands of businesses using Zaptick to engage customers, drive sales, and provide exceptional support through WhatsApp.
                                </motion.p>

                                <motion.div
                                    className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Button
                                        size="lg"
                                        className="h-14 px-8 bg-white text-green-700 hover:bg-gray-50 shadow-lg font-semibold text-base"
                                    >
                                        <Link href="/demo" className="flex items-center gap-2">
                                            Book Free Demo
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>

                                    {/* <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-14 px-8 text-white border-white/30 hover:bg-white/10 font-semibold text-base"
                                    >
                                        <Link href="/contact" className="flex items-center gap-2">
                                            <PhoneCall className="h-4 w-4" />
                                            Talk to Sales
                                        </Link>
                                    </Button> */}
                                </motion.div>

                                <motion.div
                                    className="space-y-3"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.6 }}
                                >
                                    {[
                                        "Free Demo • No credit card required",
                                        "Setup in under 5 minutes • Cancel anytime",
                                        "24/7 support • Enterprise-grade security"
                                    ].map((feature, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-center justify-center gap-2 text-white/90"
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.7 + index * 0.1 }}
                                        >
                                            <CheckCircle className="h-4 w-4 text-white" />
                                            <span className="text-sm">{feature}</span>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
