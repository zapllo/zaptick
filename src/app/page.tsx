"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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
  Play,
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
  Info
} from "lucide-react";
import PartnerBadges from "@/components/ui/partner-badges";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMetric, setActiveMetric] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  // Animated counters
  const [messageCount, setMessageCount] = useState(0);
  const [responseRate, setResponseRate] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);

  // Parallax effects
  const { scrollYProgress } = useScroll();
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric(prev => (prev === 2 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageCount(prev => {
        const next = prev + 25;
        return next >= 5000 ? 5000 : next;
      });
    }, 20);

    const responseInterval = setInterval(() => {
      setResponseRate(prev => {
        const next = prev + 1;
        return next >= 98 ? 98 : next;
      });
    }, 30);

    const satisfactionInterval = setInterval(() => {
      setSatisfaction(prev => {
        const next = prev + 0.5;
        return next >= 96.5 ? 96.5 : next;
      });
    }, 25);

    return () => {
      clearInterval(messageInterval);
      clearInterval(responseInterval);
      clearInterval(satisfactionInterval);
    };
  }, []);

  const features = [
    {
      title: "Smart Messaging Hub",
      description: "Transform WhatsApp into your primary customer engagement platform with intelligent broadcast campaigns and personalized interactions.",
      icon: MessageSquare,
      image: '/conversation.png',
      highlights: ["98% open rates", "Rich media support", "Smart templates"],
      color: "green",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      title: "AI-Powered Automation",
      description: "Deploy sophisticated chatbots and conversation flows that handle inquiries, qualify leads, and provide instant support 24/7.",
      icon: Bot,
      image: '/03.png',
      highlights: ["Visual flow builder", "AI responses", "Smart routing"],
      color: "blue",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      title: "Smart Campaigns",
      description: "Create and manage targeted broadcast campaigns with personalized messaging, automated scheduling, and real-time performance tracking.",
      icon: Target,
      image: '/04.png',
      highlights: ["Bulk messaging", "Smart segmentation", "Campaign analytics"],
      color: "purple",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "Advanced Analytics",
      description: "Gain actionable insights with real-time performance metrics, customer journey analytics, and ROI tracking.",
      icon: TrendingUp,
      image: '/02.png',
      highlights: ["Real-time insights", "Customer analytics", "ROI tracking"],
      color: "orange",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const metrics = [
    {
      value: messageCount.toLocaleString() + "+",
      label: "Messages Delivered Daily",
      description: "with 98% open rate",
      icon: MessageSquare,
      color: "green"
    },
    {
      value: responseRate + "%",
      label: "Response Rate",
      description: "vs 23% for email",
      icon: Zap,
      color: "blue"
    },
    {
      value: satisfaction.toFixed(1) + "%",
      label: "Customer Satisfaction",
      description: "based on surveys",
      icon: Users,
      color: "purple"
    }
  ];

  const testimonials = [
    {
      quote: "Zaptick transformed our customer communication. Response times decreased by 70% and satisfaction scores hit 98%.",
      author: "Sarah Johnson",
      position: "Customer Experience Director",
      company: "Global Retail Inc.",
      image: "/avatars/female1.jpg",
      results: ["Response time -70%", "Satisfaction +45%", "Conversions +38%"]
    },
    {
      quote: "The ROI with Zaptick is extraordinary. WhatsApp campaigns outperform email by 5x with 35%+ conversion rates.",
      author: "Michael Chen",
      position: "VP of Digital Marketing",
      company: "TechSolutions Group",
      image: "/avatars/man6.jpg",
      results: ["ROI +420%", "CTR +210%", "Lead quality +67%"]
    },
    {
      quote: "Zaptick reduced our support costs by 60% while improving CSAT. The platform paid for itself in two months.",
      author: "Elena Rodriguez",
      position: "Head of Customer Support",
      company: "Fintech Innovations",
      image: "/avatars/female2.jpg",
      results: ["Support costs -60%", "Resolution time -45%", "CSAT +28%"]
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
          <div className="max-7xl mx-auto">
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
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">WhatsApp Business API Platform</span>
                </motion.div>

                <div className="space-y-6">
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                    Transform Your
                    <span className="relative inline-block ml-4">
                      <span className="relative z-10 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        WhatsApp
                      </span>
                      <motion.div
                        className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-green-200 to-blue-200 rounded-full"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                      />
                    </span>
                    <br />
                    Into Revenue
                  </h1>

                  <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                    Zaptick empowers businesses to engage customers, automate support, and drive sales through WhatsApp with enterprise-grade tools.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="h-14 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 transition-all duration-300"
                  >
                    <Link href="/signup" className="flex items-center gap-2">
                      Book Free Demo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300"
                    onClick={() => setIsPlaying(true)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Watch Demo
                  </Button>
                </div>
                {/* Partner Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="pt-6"
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
                          alt={`Customer ${i + 1}`}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40' fill='none'%3E%3Ccircle cx='20' cy='20' r='20' fill='url(%23gradient)'/%3E%3Cdefs%3E%3ClinearGradient id='gradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2334d399'/%3E%3Cstop offset='100%25' stop-color='%233b82f6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='12' font-weight='600' fill='white'%3EU" + (i + 1) + "%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">5000+ businesses</p>
                    <p className="text-xs text-gray-500">trust Zaptick daily</p>
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
                  {/* Main Dashboard */}
                  <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-3 px-4 border-b border-gray-200 flex items-center">
                      <div className="flex gap-2 mr-4">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="text-sm font-mono text-gray-600 bg-white px-4 py-1.5 rounded-lg flex-grow text-center shadow-sm">
                        zaptick.io/analytics
                      </div>
                    </div>

                    <div className="relative p-2">
                      <Image
                        src="/01.png"
                        alt="Zaptick Dashboard"
                        width={600}
                        height={400}
                        className="w-full rounded-lg"
                        priority
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400' fill='none'%3E%3Crect width='600' height='400' fill='%23f8fafc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='20' fill='%236b7280'%3EZaptick Dashboard%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  </div>

                  {/* Floating Notification Cards */}
                  <motion.div
                    className="absolute -bottom-3 -right-6 bg-white rounded-xl shadow-xl border border-gray-100 p-4 max-w-[200px]"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">New Sale!</p>
                        <p className="text-xs text-gray-500 mb-2">Customer converted via WhatsApp</p>
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                          <span className="text-xs text-green-600 font-medium">Just now</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute top-5 -left-6 bg-white rounded-xl shadow-xl border border-gray-100 p-4 max-w-[220px]"
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-sm">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Campaign Performance</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-lg font-bold text-gray-900">94%</span>
                          <span className="text-xs text-green-600 font-medium">+23%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "94%" }}
                            transition={{ delay: 1.8, duration: 1.2 }}
                          />
                        </div>
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
            <p className="text-gray-500 font-medium">Trusted by industry leaders worldwide</p>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 "
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

      {/* Metrics Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50/50 to-white">
        <div className=" mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 px-4 py-2 bg-green-50 text-green-700 border-green-200">
              Performance That Speaks
            </Badge>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Results that drive real business impact
            </h2>
            <p className="text-lg text-gray-600">
              Our platform delivers measurable outcomes through powerful automation and insights
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-${metric.color}-50/30 p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-${metric.color}-200 cursor-pointer`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => setActiveMetric(index)}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-${metric.color}-500 to-${metric.color}-600 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <metric.icon className="h-7 w-7 text-white" />
                  </div>

                  {activeMetric === index && (
                    <motion.span
                      className={`inline-flex items-center gap-1 rounded-full bg-${metric.color}-100 px-3 py-1 text-xs font-medium text-${metric.color}-700`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className={`h-1.5 w-1.5 rounded-full bg-${metric.color}-500 animate-pulse`} />
                      Live
                    </motion.span>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-4xl font-bold text-gray-900">{metric.value}</h3>
                  <p className="text-lg font-semibold text-gray-800">{metric.label}</p>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>

                {/* Decorative element */}
                <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full bg-${metric.color}-500/10 transition-all duration-500 group-hover:scale-125 group-hover:bg-${metric.color}-500/20`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className=" mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 px-4 py-2 bg-blue-50 text-blue-700 border-blue-200">
              Powerful Features
            </Badge>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Everything you need to succeed on WhatsApp
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive tools designed to transform customer engagement and drive business growth
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ml mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-${feature.color}-50/30 p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-${feature.color}-200`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform duration-300 ${hoveredFeature === index ? 'scale-110' : ''}`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{feature.title}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full bg-${feature.color}-100 px-2 py-1 text-xs font-medium text-${feature.color}-700`}>
                        <div className={`h-1.5 w-1.5 rounded-full bg-${feature.color}-500`} />
                        Available
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>

                <div className="space-y-3 mb-6">
                  {feature.highlights.map((highlight, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                    >
                      <div className={`flex h-5 w-5 rounded-full bg-${feature.color}-100 items-center justify-center`}>
                        <CheckCircle className={`h-3 w-3 text-${feature.color}-600`} />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{highlight}</span>
                    </motion.div>
                  ))}
                </div>

                {feature.image && (
                  <div className="relative bg-gray-50 rounded-xl p-4 mb-6">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={400}
                      height={200}
                      className="w-full rounded-lg border h object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200' fill='none'%3E%3Crect width='400' height='200' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='16' fill='%236b7280'%3E" + feature.title + "%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                )}

                {/* <Button
                  variant="ghost"
                  className={`text-${feature.color}-600 hover:bg-${feature.color}-50 p-0 h-auto font-semibold`}
                >
                  Learn more <ChevronRight className="ml-1 h-4 w-4" />
                </Button> */}

                {/* Decorative element */}
                <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full bg-${feature.color}-500/10 transition-all duration-500 group-hover:scale-125`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className=" mx-auto px-4">
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
              Get started in minutes, not hours
            </h2>
            <p className="text-lg text-gray-600">
              Our streamlined onboarding gets you engaging customers through WhatsApp quickly
            </p>
          </motion.div>


          <div className="mal mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: 1,
                  title: "Connect WhatsApp",
                  description: "Link your WhatsApp Business account with Zaptick in under 2 minutes using our secure integration.",
                  icon: Smartphone,
                  color: "green",
                  gradient: "from-green-500 to-emerald-600"
                },
                {
                  step: 2,
                  title: "Design Workflows",
                  description: "Create intelligent conversation flows using our visual builder with drag-and-drop simplicity.",
                  icon: Layers,
                  color: "blue",
                  gradient: "from-blue-500 to-cyan-600"
                },
                {
                  step: 3,
                  title: "Launch & Scale",
                  description: "Deploy your campaigns and watch real-time analytics as customers engage and convert.",
                  icon: Target,
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
                    <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} shadow-lg text-white font-bold text-xl`}>
                      {step.step}
                      <div className="absolute -inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                    <p className="text-gray-600 leading-relaxed mb-4">{step.description}</p>

                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-${step.color}-600 hover:bg-${step.color}-50 font-semibold`}
                    >
                      Learn more <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>

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
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className=" mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 px-4 py-2 bg-orange-50 text-orange-700 border-orange-200">
              Success Stories
            </Badge>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Trusted by businesses worldwide
            </h2>
            <p className="text-lg text-gray-600">
              See how companies transform their customer engagement with Zaptick
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-gray-50/30 p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-200"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {/* Rating */}
                <div className="flex mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-gray-700 font-medium leading-relaxed mb-8 italic">
                  &quot;{testimonial.quote}&quot;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4 mb-6">
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
                    <p className="text-sm font-medium text-gray-800">{testimonial.company}</p>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-2">
                  {testimonial.results.map((result, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700 font-medium">{result}</span>
                    </div>
                  ))}
                </div>

                {/* Decorative element */}
                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gray-500/5 transition-all duration-300 group-hover:scale-110" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="testimonials" className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className=" mx-auto px-4">
          <motion.div
            className="text-center m-3xl mx-auto mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 px-4 py-2 bg-indigo-50 text-indigo-700 border-indigo-200">
              Seamless Connections
            </Badge>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Integrate with your favorite tools
            </h2>
            <p className="text-lg text-gray-600">
              Connect Zaptick with your existing tech stack for a unified workflow
            </p>
          </motion.div>

          {/* Featured Integrations */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6  mx-auto mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {[
              { src: "/integrations/shopify.png", alt: "Shopify" },
              { src: "/integrations/stripe.png", alt: "Stripe" },
              { src: "/integrations/razorpay.png", alt: "Razorpay" },
              { src: "/integrations/zohobooks.png", alt: "Zoho Books" },
              { src: "/integrations/zendesk.png", alt: "Zendesk" },
              { src: "/integrations/gmail.png", alt: "Gmail" },
              { src: "/integrations/google-ads.png", alt: "Google Ads" },
              { src: "/integrations/facebook.webp", alt: "Facebook" },
              { src: "/integrations/twilio.jpg", alt: "Twilio" },
              { src: "/integrations/delhivery.png", alt: "Delhivery" },
              { src: "/integrations/callhippo.png", alt: "CallHippo" },
              { src: "/integrations/interakt.jpeg", alt: "Interakt" }
            ].map((integration, index) => (
              <motion.div
                key={index}
                className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-gray-50/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-200 flex flex-col items-center justify-center text-center min-h-[100px]"
                whileHover={{ y: -2, scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="h-8 w-full mb-2 flex items-center justify-center">
                  <Image
                    src={integration.src}
                    alt={integration.alt}
                    width={80}
                    height={32}
                    className="object-contain max-h-8 max-w-[70%] group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='32' viewBox='0 0 80 32' fill='none'%3E%3Crect width='80' height='32' fill='%23f9fafb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='10' fill='%236b7280'%3E" + integration.alt + "%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <p className="text-xs font-medium text-gray-700">{integration.alt}</p>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-indigo-600 bg-opacity-90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-medium text-xs px-2 py-1 rounded-full bg-white/20 flex items-center">
                    Connect <ArrowRight className="ml-1 h-3 w-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Integration Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 maxl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {[
              { count: "40+", label: "Native Integrations", icon: Zap, color: "indigo" },
              { count: "5min", label: "Average Setup Time", icon: Timer, color: "green" },
              { count: "99.9%", label: "Uptime Guarantee", icon: Shield, color: "blue" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-${stat.color}-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-${stat.color}-200 text-center`}
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`inline-flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.count}</h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>

                {/* Decorative element */}
                <div className={`absolute -right-4 -top-4 h-12 w-12 rounded-full bg-${stat.color}-500/10 transition-all duration-300 group-hover:scale-110`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className=" mx-auto px-4">
          <motion.div
            className="relative max-l mx-auto"
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
                    Start Your WhatsApp Journey
                  </Badge>
                </motion.div>

                <motion.h2
                  className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Ready to transform your business communication?
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
                      Book a demo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  {/* <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-14 px-8 text-black border-white/30 hover:bg-white/10 font-semibold text-base"
                  >
                    <Link href="/contact">
                      Book a Demo
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

      {/* Video Modal */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPlaying(false)}
          >
            <motion.div
              className="relative w-full ma-4xl bg-transparent"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
                onClick={() => setIsPlaying(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Zaptick Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}