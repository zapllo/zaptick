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
import {
    CheckCircle,
    Zap,
    MessageSquare,
    BarChart2,
    Users,
    ChevronRight,
    Shield,
    Globe,
    ArrowRight,
    ShoppingBag,
    PieChart,
    Smartphone,
    Lock,
    Headphones,
    Star,
    Clock,
    Code,
    Search,
    TrendingUp,
    Target,
    Timer,
    Bot,
    Sparkles,
    Layers,
    Info,
    UserPlus,
    Link as LinkIcon,
    DollarSign,
    Award,
    Briefcase,
    Building,
    HandHeart,
    ChevronDown,
    Plus,
    Minus
} from "lucide-react";
import PartnerBadges from "@/components/ui/partner-badges";

export default function PartnersPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [hoveredPartnerType, setHoveredPartnerType] = useState<number | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [commission, setCommission] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep(prev => (prev === 2 ? 0 : prev + 1));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const commissionInterval = setInterval(() => {
            setCommission(prev => {
                const next = prev + 1;
                return next >= 30 ? 30 : next;
            });
        }, 50);

        return () => clearInterval(commissionInterval);
    }, []);

    const partnerTypes = [
        {
            title: "Strategy Consultants",
            description: "Collaborate with your valuable clientele to implement Zaptick's WhatsApp Business solutions. Our team offers personalized demos & leadership support to ensure successful client closures.",
            icon: Briefcase,
            image: "/partners/strategy-consultant.png",
            highlights: ["Personalized demos", "Leadership support", "Client success focus"],
            color: "green",
            gradient: "from-green-500 to-emerald-600"
        },
        {
            title: "Tech & GTM Partners",
            description: "Join the Zaptick ecosystem for a joint go-to-market strategy. Perfect for tech companies looking to enhance their service offerings with our robust WhatsApp solutions.",
            icon: Building,
            image: "/partners/tech-partner.png",
            highlights: ["Joint GTM strategy", "Technical integration", "Co-branded solutions"],
            color: "blue",
            gradient: "from-blue-500 to-cyan-600"
        },
        {
            title: "Referral/Affiliate Partner",
            description: "Simply refer customers our way. Ideal for managing smaller accounts - we'll handle the complexities of closing deals while you earn attractive commissions.",
            icon: HandHeart,
            image: "/partners/referral-partner.png",
            highlights: ["Simple referrals", "No deal complexity", "Attractive commissions"],
            color: "purple",
            gradient: "from-purple-500 to-pink-600"
        }
    ];

    const benefits = [
        {
            title: "Comprehensive Training",
            description: "Extensive training and consultation to ensure customer success and your growth",
            icon: Award,
            color: "green"
        },
        {
            title: "Advanced Platform",
            description: "Leverage our cutting-edge WhatsApp Business API platform and tools",
            icon: Zap,
            color: "blue"
        },
        {
            title: "Attractive Rewards",
            description: "Up to 30% commission for first year and 15% lifetime recurring commission",
            icon: DollarSign,
            color: "purple"
        },
        {
            title: "Trusted Brand",
            description: "Partner with a platform trusted by 5000+ businesses across 50+ countries",
            icon: Shield,
            color: "orange"
        }
    ];

    const faqs = [
        {
            question: "Will I Receive Support in Terms of Promotional Material?",
            answer: "Yes! We provide comprehensive marketing materials including brochures, case studies, demo videos, and co-branded presentations to help you effectively promote Zaptick to your clients."
        },
        {
            question: "When Are Commission Payouts Processed?",
            answer: "Commission payouts are processed monthly, typically within the first 10 business days of each month. You'll receive detailed reports showing your earnings and referred customers."
        },
        {
            question: "What's the Commission Structure?",
            answer: "You earn up to 30% commission in the first year for each referred customer, followed by 15% lifetime recurring commission. Commission rates may vary based on partnership tier and customer plan."
        },
        {
            question: "How Are Referrals Tracked?",
            answer: "We use advanced tracking through unique referral links and codes. Every interaction is monitored through our partner portal, ensuring you get credit for all your referrals."
        },
        {
            question: "For How Long Can I Expect to Receive Recurring Commissions?",
            answer: "You'll receive recurring commissions for the entire lifetime of the referred customer's subscription with Zaptick, as long as they remain an active paying customer."
        }
    ];

    return (
        <div className="bg-white overflow-hidden">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-green-100/40 via-blue-100/30 to-purple-100/40 rounded-full blur-3xl opacity-60" />
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
                </div>

                <div className=" mx-auto px-8 relative z-10">
                    <div className=" mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            {/* Hero Content */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="space-y-8"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-50 to-blue-50 px-4 py-2 border border-green-200/50"
                                >
                                    <UserPlus className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">Partner Program</span>
                                </motion.div>

                                <div className="space-y-6">
                                    <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                                        Become a part of the
                                        <span className="relative inline-block ml-4">
                                            <span className="relative z-10 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                                growth story
                                            </span>
                                            <motion.div
                                                className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-green-200 to-blue-200 rounded-full"
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: 1 }}
                                                transition={{ delay: 0.8, duration: 1 }}
                                            />
                                        </span>
                                        <br />
                                        and earn up to{" "}
                                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                            {commission}% commission
                                        </span>
                                    </h1>

                                    <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                                        Join Zaptick&apos;s partner ecosystem and help businesses transform their WhatsApp communication while earning attractive recurring commissions.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                                        size="lg"
                                        className="h-14 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 transition-all duration-300"
                                    >
                                        <Link href="#register" className="flex items-center gap-2">
                                            Sign Up Now
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="h-14 px-8 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300"
                                    >
                                        <Link href="#partner-types">
                                            Learn More
                                        </Link>
                                    </Button>
                                </div>
                                {/* Partner Badges */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2, duration: 0.5 }}
                                    className="pt-6  mb-8 flex justify-center"
                                >
                                    <PartnerBadges animated={true} size="md" />
                                </motion.div>
                                {/* Trust Indicators */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1, duration: 0.5 }}
                                    className="flex items-center gap-6 pt-4"
                                >
                                    <div className="flex -space-x-3">
                                        {[
                                            "/avatars/man1.jpg",
                                            "/avatars/female1.jpg",
                                            "/avatars/man2.jpg",
                                            "/avatars/female2.jpg"
                                        ].map((avatar, i) => (
                                            <div key={i} className="h-10 w-10 rounded-full border-2 border-white shadow-md overflow-hidden">
                                                <Image
                                                    src={avatar}
                                                    alt={`Partner ${i + 1}`}
                                                    width={40}
                                                    height={40}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40' fill='none'%3E%3Ccircle cx='20' cy='20' r='20' fill='url(%23gradient)'/%3E%3Cdefs%3E%3ClinearGradient id='gradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2334d399'/%3E%3Cstop offset='100%25' stop-color='%233b82f6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='12' font-weight='600' fill='white'%3EP" + (i + 1) + "%3C/text%3E%3C/svg%3E";
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">200+ active partners</p>
                                        <p className="text-xs text-gray-500">earning with Zaptick</p>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Hero Visual */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="relative"
                            >
                                <div className="relative">
                                    {/* Main Partnership Dashboard */}
                                    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-3 px-4 border-b border-gray-200 flex items-center">
                                            <div className="flex gap-2 mr-4">
                                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                            </div>
                                            <div className="text-sm font-mono text-gray-600 bg-white px-4 py-1.5 rounded-lg flex-grow text-center shadow-sm">
                                                partners.zaptick.io/dashboard
                                            </div>
                                        </div>

                                        <div className="relative p-6">
                                            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                                        <div className="text-2xl font-bold text-green-600">₹2,45,000</div>
                                                        <div className="text-sm text-gray-600">Total Earnings</div>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                                        <div className="text-2xl font-bold text-blue-600">23</div>
                                                        <div className="text-sm text-gray-600">Active Referrals</div>
                                                    </div>
                                                </div>

                                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm font-medium text-gray-700">This Month</span>
                                                        <span className="text-sm text-green-600 font-medium">+18%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                                        <motion.div
                                                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: "75%" }}
                                                            transition={{ delay: 1.2, duration: 1.5 }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Floating Commission Cards */}
                                    <motion.div
                                        className="absolute -bottom-6 -right-8 bg-white rounded-xl shadow-xl border border-gray-100 p-4 max-w-[200px]"
                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ delay: 1.2, duration: 0.6 }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm">
                                                <DollarSign className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">New Commission!</p>
                                                <p className="text-xs text-gray-500 mb-2">₹15,000 from referral</p>
                                                <div className="flex items-center gap-1">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                                    <span className="text-xs text-green-600 font-medium">Just now</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="absolute top-5 -left-8 bg-white rounded-xl shadow-xl border border-gray-100 p-4 max-w-[220px]"
                                        initial={{ opacity: 0, scale: 0.8, y: -20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ delay: 1.4, duration: 0.6 }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-sm">
                                                <TrendingUp className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Performance Growth</p>
                                                <div className="flex items-baseline gap-2 mt-1">
                                                    <span className="text-lg font-bold text-gray-900">156%</span>
                                                    <span className="text-xs text-green-600 font-medium">↑ 23%</span>
                                                </div>
                                                <p className="text-xs text-gray-500">vs last month</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Background Decorative Elements */}
                                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-green-100/20 via-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted By Section */}
            <section className="py-16 border-t border-gray-100">
                <div className=" mx-auto px-4">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-gray-500 font-medium">Trusted by Top Brands like</p>
                    </motion.div>

                    <motion.div
                        className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0.6 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        {[
                            { src: "/brands/sabhyasachi.webp", alt: "Sabhyasachi" },
                            { src: "/brands/malabar.webp", alt: "Malabar" },
                            { src: "/brands/pantaloons.webp", alt: "Pantaloons" },
                            { src: "/brands/emerald.webp", alt: "Emerald" },
                            { src: "/brands/walkingtree.webp", alt: "Walking Tree" },
                            { src: "/brands/greenlab.webp", alt: "Green Lab" }
                        ].map((brand, i) => (
                            <motion.div
                                key={i}
                                className="h-12 hover:opacity-100 transition-opacity duration-300"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Image
                                    src={brand.src}
                                    alt={brand.alt}
                                    width={120}
                                    height={48}
                                    className="object-contain max-h-12"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='48' viewBox='0 0 120 48' fill='none'%3E%3Crect width='120' height='48' fill='%23f9fafb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='12' fill='%236b7280'%3E" + brand.alt + "%3C/text%3E%3C/svg%3E";
                                    }}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-20"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Badge className="mb-4 px-4 py-2 bg-purple-50 text-purple-700 border-purple-200">
                            Simple Process
                        </Badge>
                        <h2 className="text-4xl font-bold mb-6 text-gray-900">
                            Become a Zaptick Channel Partner and earn recurring commission for 3 years
                        </h2>
                        <p className="text-lg text-gray-600">
                            Start earning attractive commissions in just three simple steps
                        </p>
                    </motion.div>

                    <div className=" mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                {
                                    step: 1,
                                    title: "Register",
                                    description: "Fill in the form and register on our partner platform. Get instant access to your partner dashboard.",
                                    icon: UserPlus,
                                    color: "green",
                                    gradient: "from-green-500 to-emerald-600"
                                },
                                {
                                    step: 2,
                                    title: "Get unique referral code and link",
                                    description: "Receive your personalized referral code and tracking links to share with potential customers.",
                                    icon: LinkIcon,
                                    color: "blue",
                                    gradient: "from-blue-500 to-cyan-600"
                                },
                                {
                                    step: 3,
                                    title: "Refer customers and earn",
                                    description: "Share your unique link with customers and start earning up to 30% commission on successful referrals.",
                                    icon: DollarSign,
                                    color: "purple",
                                    gradient: "from-purple-500 to-pink-600"
                                }
                            ].map((step, index) => (
                                <motion.div
                                    key={index}
                                    className="group relative"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                >
                                    {/* Step Number */}
                                    <div className="flex justify-center mb-8">
                                        <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} shadow-lg text-white font-bold text-xl ${activeStep === index ? 'scale-110' : ''} transition-transform duration-300`}>
                                            {step.step}
                                            {activeStep === index && (
                                                <div className="absolute -inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-2xl animate-pulse" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Card */}
                                    <div className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-${step.color}-50/30 p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-${step.color}-200 text-center`}>
                                        <div className="flex justify-center mb-4">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                                <step.icon className="h-6 w-6 text-white" />
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{step.description}</p>

                                        {/* Decorative element */}
                                        <div className={`absolute -right-6 -top-6 h-16 w-16 rounded-full bg-${step.color}-500/10 transition-all duration-300 group-hover:scale-110`} />
                                    </div>

                                    {/* Connector Line */}
                                    {index < 2 && (
                                        <div className="hidden md:block absolute top-8 left-full w-12 h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 z-10">
                                            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2">
                                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Commission Structure */}
                    <motion.div
                        className="mt-20 max-w-4xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-2xl p-8 border border-gray-200">
                            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
                                Earn up to 30% commission for first year per onboarded customer and up to 15% lifetime
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-xl p-6 shadow-sm border">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600 mb-2">30%</div>
                                        <div className="text-lg font-semibold text-gray-900 mb-2">First Year Commission</div>
                                        <div className="text-sm text-gray-600">For each successfully onboarded customer</div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-sm border">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-600 mb-2">15%</div>
                                        <div className="text-lg font-semibold text-gray-900 mb-2">Lifetime Recurring</div>
                                        <div className="text-sm text-gray-600">Ongoing commission for customer lifetime</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Partner Types Section */}
            <section id="partner-types" className="py-24 bg-white">
                <div className=" mx-auto px-4">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-20"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Badge className="mb-4 px-4 py-2 bg-blue-50 text-blue-700 border-blue-200">
                            Partnership Options
                        </Badge>
                        <h2 className="text-4xl font-bold mb-6 text-gray-900">
                            Types of Partners
                        </h2>
                        <p className="text-lg text-gray-600">
                            Choose the partnership model that best fits your business and expertise
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8  mx-auto">
                        {partnerTypes.map((partner, index) => (
                            <motion.div
                                key={index}
                                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-${partner.color}-50/30 p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-${partner.color}-200`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                onMouseEnter={() => setHoveredPartnerType(index)}
                                onMouseLeave={() => setHoveredPartnerType(null)}
                                whileHover={{ y: -5 }}
                            >
                                <div className="text-center mb-6">
                                    <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${partner.gradient} shadow-lg mb-4 transition-transform duration-300 ${hoveredPartnerType === index ? 'scale-110' : ''}`}>
                                        <partner.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{partner.title}</h3>
                                </div>

                                <p className="text-gray-600 mb-6 leading-relaxed text-center">{partner.description}</p>

                                <div className="space-y-3 mb-6">
                                    {partner.highlights.map((highlight, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="flex items-center gap-3"
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.3 + idx * 0.1 }}
                                        >
                                            <div className={`flex h-5 w-5 rounded-full bg-${partner.color}-100 items-center justify-center`}>
                                                <CheckCircle className={`h-3 w-3 text-${partner.color}-600`} />
                                            </div>
                                            <span className="text-sm text-gray-700 font-medium">{highlight}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="text-center">
                                    <Button
                                        className={`bg-gradient-to-r ${partner.gradient} hover:opacity-90 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300`}
                                    >
                                        <Link href="#register">
                                            Become Partner
                                        </Link>
                                    </Button>
                                </div>

                                {/* Decorative element */}
                                <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full bg-${partner.color}-500/10 transition-all duration-500 group-hover:scale-125`} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Partner Section */}
            <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
                <div className=" mx-auto px-4">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-20"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Badge className="mb-4 px-4 py-2 bg-green-50 text-green-700 border-green-200">
                            Partnership Benefits
                        </Badge>
                        <h2 className="text-4xl font-bold mb-6 text-gray-900">
                            Why Partner with Zaptick?
                        </h2>
                        <p className="text-lg text-gray-600">
                            Leverage the credibility of Zaptick, a brand trusted by 5,000+ customers across 50+ countries. Join us in our mission to catalyze digital growth and business transformation worldwide.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8  mx-auto">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-${benefit.color}-50/30 p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-${benefit.color}-200 text-center`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-${benefit.color}-500 to-${benefit.color}-600 shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <benefit.icon className="h-6 w-6 text-white" />
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-3">{benefit.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>

                                {/* Decorative element */}
                                <div className={`absolute -right-4 -top-4 h-12 w-12 rounded-full bg-${benefit.color}-500/10 transition-all duration-300 group-hover:scale-110`} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Registration Section */}
            <section id="register" className="py-24 bg-white">
                <div className=" mx-auto px-4">
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
                                        Join Our Partner Network
                                    </Badge>
                                </motion.div>

                                <motion.h2
                                    className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Ready to start earning with Zaptick?
                                </motion.h2>

                                <motion.p
                                    className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Join our partner program today and start earning attractive commissions while helping businesses transform their WhatsApp communication.
                                </motion.p>

                                <motion.div
                                    className="flex flex-col sm:flex-row gap-4 justify-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Button
                                        size="lg"
                                        className="h-14 px-8 bg-white text-green-700 hover:bg-gray-50 shadow-lg font-semibold text-base"
                                    >
                                        <Link href="/partner-registration" className="flex items-center gap-2">
                                            Sign Up Now
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
                <div className=" mx-auto px-4">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-20"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Badge className="mb-4 px-4 py-2 bg-indigo-50 text-indigo-700 border-indigo-200">
                            Partner Support
                        </Badge>
                        <h2 className="text-4xl font-bold mb-6 text-gray-900">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-gray-600">
                            Get answers to common questions about our partner program
                        </p>
                    </motion.div>

                    <div className="ml mx-auto">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                className="mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                    <button
                                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    >
                                        <span className="font-semibold text-gray-900">{faq.question}</span>
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
                                                <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Terms and Conditions */}
            <section className="py-16 bg-white border-t border-gray-100">
                <div className=" mx-auto px-4">
                    <motion.div
                        className="max-w-4xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-2xl font-bold text-center mb-12 text-gray-900">
                            Terms and Conditions
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    number: 1,
                                    text: "Affiliate partners are required to enter into a formal partnership agreement with Zaptick."
                                },
                                {
                                    number: 2,
                                    text: "Commission payouts are contingent upon managerial approval. Terms and conditions apply."
                                },
                                {
                                    number: 3,
                                    text: "To qualify for commissions, referred businesses must be legitimate and fully comply with all WhatsApp Business policies."
                                }
                            ].map((term, index) => (
                                <motion.div
                                    key={index}
                                    className="flex gap-4 p-6 bg-gray-50 rounded-xl border"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-sm flex-shrink-0">
                                        {term.number}
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed">{term.text}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}