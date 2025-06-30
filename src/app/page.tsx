"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
  LucideIcon,
  ShoppingBag,
  PieChart,
  Smartphone,
  Lock,
  Headphones,
  Star,
  Clock,
  Code,
  Search
} from "lucide-react";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const heroRef = useRef(null);
  const introRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  // Animated counters
  const [messageCount, setMessageCount] = useState(0);
  const [responseRate, setResponseRate] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);

  // Parallax effects
  const { scrollYProgress } = useScroll();
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scrollScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.98]);

  const features = [
    {
      title: "Comprehensive Messaging Suite",
      description: "Engage customers with personalized broadcast messages, automated responses, and rich media content directly through WhatsApp.",
      icon: MessageSquare,
      image: '/conversation.png',
      benefits: ["98% open rates", "Personalized interactions", "Rich media support"],
      color: "green"
    },
    {
      title: "Intelligent Automation",
      description: "Build sophisticated conversation flows and deploy AI-powered chatbots to handle inquiries, qualify leads, and collect information 24/7.",
      icon: Zap,
      image: '/automation.png',
      benefits: ["Visual flow builder", "AI response suggestions", "Time-saving workflows"],
      color: "blue"
    },
    {
      title: "Seamless Commerce Integration",
      description: "Convert conversations into transactions with product catalogs, checkout processes, and payment gateways directly within WhatsApp.",
      icon: ShoppingBag,
      benefits: ["Complete purchase journey", "Payment gateway integration", "Order tracking"],
      color: "purple"
    },
    {
      title: "Advanced Analytics Dashboard",
      description: "Gain deep insights into performance metrics, customer behavior, and ROI with comprehensive real-time analytics.",
      icon: BarChart2,
      image: '/dashboard.png',
      benefits: ["Conversion tracking", "Customer journey analytics", "Performance optimization"],
      color: "orange"
    }
  ];

  const testimonials = [
    {
      quote: "Zaptick transformed our customer communication strategy. Our response times decreased by 70% and customer satisfaction scores reached an all-time high of 98%.",
      author: "Sarah Johnson",
      position: "Customer Experience Director",
      company: "Global Retail Inc.",
      image: "/testimonial-1.jpg"
    },
    {
      quote: "The ROI we've seen with Zaptick is extraordinary. Our WhatsApp campaigns consistently outperform email by 5x, with conversion rates above 35%.",
      author: "Michael Chen",
      position: "VP of Digital Marketing",
      company: "TechSolutions Group",
      image: "/testimonial-2.jpg"
    },
    {
      quote: "Implementing Zaptick's WhatsApp automation reduced our support costs by 60% while improving our CSAT scores. The platform paid for itself within two months.",
      author: "Elena Rodriguez",
      position: "Head of Customer Support",
      company: "Fintech Innovations",
      image: "/testimonial-3.jpg"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev === features.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

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

  return (
    <div className="bg-white overflow-hidden">
      <Header />

      {/* Hero Section - Sophisticated and Clean */}
      <section className="relative md:pt-24 pt-12 pb-20 overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute -top-[10%] -right-[5%] w-[50%] h-[40%] bg-green-50 rounded-full opacity-60 blur-3xl" />
          <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-blue-50 rounded-full opacity-40 blur-3xl" />
          <div className="absolute -bottom-[10%] right-[10%] w-[40%] h-[40%] bg-purple-50 rounded-full opacity-50 blur-3xl" />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(236,253,245,0.4) 0%, rgba(255,255,255,0) 70%)"
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <Badge className="px-3 py-1.5 bg-green-50 text-green-600 border-green-100">
                WhatsApp Business API Platform
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900">
                Elevate Your <span className="relative inline-block">
                  <span className="relative z-10">Business Communication</span>
                  <motion.span
                    className="absolute bottom-2 left-0 w-full h-3 bg-green-100 -z-10"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 1 }}
                  />
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Zaptick transforms WhatsApp into a powerful platform for customer engagement, support, and commerce with enterprise-grade automation.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="h-14 px-8 bg-green-600 hover:bg-green-700 text-white font-medium text-base">
                  <Link href="/signup" className="flex items-center gap-2">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 border-green-200 text-green-600 hover:bg-green-50 font-medium text-base"
                  onClick={() => setIsPlaying(true)}
                >
                  <Play className="mr-2 h-4 w-4" /> Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                      <span className="text-gray-600 text-xs font-medium">U{i}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">500+ businesses</span> trust Zaptick for WhatsApp engagement
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 py-3 px-4 border-b border-gray-100 flex items-center">
                  <div className="flex gap-1.5 mr-3">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-sm font-mono text-gray-500 bg-white px-4 py-1 rounded-md flex-grow text-center">
                    zaptick.io/dashboard
                  </div>
                </div>
                <div className="relative">
                  <Image
                    src="/dashboard.png"
                    alt="Zaptick Dashboard"
                    width={600}
                    height={450}
                    className="w-full"
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='450' viewBox='0 0 600 450' fill='none'%3E%3Crect width='600' height='450' fill='%23f9fafb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='24' fill='%236b7280'%3EZaptick Dashboard%3C/text%3E%3C/svg%3E";
                    }}
                  />

                  {/* Interactive UI Elements */}
                  <motion.div
                    className="absolute top-8 right-8 bg-white rounded-lg shadow-lg p-3 border border-gray-100"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 rounded-full p-1.5">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">New Customer Captured</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
                          <p className="text-xs text-gray-500">30 seconds ago</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute bottom-8 left-8 bg-white rounded-lg shadow-lg p-4 border border-gray-100 max-w-[200px]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full mt-1">
                        <BarChart2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Conversion Rate</h4>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-gray-900">32%</span>
                          <span className="text-xs text-green-600">+12%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full mt-2 w-full">
                          <motion.div
                            className="h-full bg-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "32%" }}
                            transition={{ delay: 1.5, duration: 1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-green-100 rounded-full opacity-80 blur-xl z-0"></div>
              <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 w-40 h-40 bg-blue-100 rounded-full opacity-80 blur-xl z-0"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-medium text-gray-600">Trusted by industry leaders worldwide</h2>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center items-center gap-x-16 gap-y-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {[
              { src: "/brands/sabhyasachi.webp", alt: "Sabhyasachi" },
              { src: "/brands/walkingtree.webp", alt: "Walking Tree" },
              { src: "/brands/birlabraniacs.webp", alt: "Birla Braniacs" },
              { src: "/brands/bvcventures.webp", alt: "BVC Ventures" },
              { src: "/brands/emerald.webp", alt: "Emerald" },
              { src: "/brands/greenlab.webp", alt: "Green Lab" },
              { src: "/brands/lineargent.webp", alt: "Linear Gent" },
              { src: "/brands/malabar.webp", alt: "Malabar" },
              { src: "/brands/pantaloons.webp", alt: "Pantaloons" }
            ].map((brand, i) => (
              <div key={i} className="h-14 opacity-70 hover:opacity-100 transition-opacity duration-300 flex items-center">
                <Image
                  src={brand.src}
                  alt={brand.alt}
                  width={120}
                  height={56}
                  className="object-contain max-h-14"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='56' viewBox='0 0 120 56' fill='none'%3E%3Crect width='120' height='56' fill='%23f9fafb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='12' fill='%236b7280'%3E" + brand.alt + "%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section ref={statsRef} className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 px-3 py-1.5 bg-gray-100 text-gray-800">
              Why Choose Zaptick
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Enterprise-grade WhatsApp solution with measurable results
            </h2>
            <p className="text-lg text-gray-600">
              Our platform drives real business outcomes through powerful automation and analytics
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{messageCount.toLocaleString()}+</h3>
              <p className="text-lg font-medium mb-2">Messages Delivered Daily</p>
              <p className="text-gray-600 text-sm">98% open rate within 3 minutes</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{responseRate}%</h3>
              <p className="text-lg font-medium mb-2">Response Rate</p>
              <p className="text-gray-600 text-sm">Compared to 23% for email</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{satisfaction.toFixed(1)}%</h3>
              <p className="text-lg font-medium mb-2">Customer Satisfaction</p>
              <p className="text-gray-600 text-sm">Based on post-conversation surveys</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Section */}
      <section id="features" ref={featuresRef} className="py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 px-3 py-1.5 bg-green-50 text-green-600">
              Key Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Everything you need for WhatsApp success
            </h2>
            <p className="text-lg text-gray-600">
              Our comprehensive platform provides all the tools to engage, convert, and support your customers
            </p>
          </motion.div>

          <Tabs
            defaultValue={features[0].title.toLowerCase().replace(/\s+/g, '-')}
            className="w-full"
          >
            <div className="flex justify-center mb-12">
              <TabsList className="grid grid-cols-2 h-32 bg-muted md:h-12 px-4 md:grid-cols-4 md:gap-1 gap-y-6">
                {features.map((feature, index) => (
                  <TabsTrigger
                    key={index}
                    value={feature.title.toLowerCase().replace(/\s+/g, '-')}
                    className={`h-fit py-2 px-2`}
                  >
                    <feature.icon className="h-4 w-4 mr-2" />
                    {feature.title.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {features.map((feature, index) => (
              <TabsContent
                key={index}
                value={feature.title.toLowerCase().replace(/\s+/g, '-')}
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                  >
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-${feature.color}-100`}>
                      <feature.icon className={`h-7 w-7 text-${feature.color}-600`} />
                      {/* <img src={feature.image} /> */}
                    </div>

                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                      <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        {feature.description}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {feature.benefits.map((benefit, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                          className="flex items-center gap-3"
                        >
                          <div className={`flex h-6 w-6 rounded-full bg-${feature.color}-100 items-center justify-center`}>
                            <CheckCircle className={`h-3.5 w-3.5 text-${feature.color}-600`} />
                          </div>
                          <span className="text-gray-700">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>

                    <Button
                      className={`bg-${feature.color}-600 hover:bg-${feature.color}-700 text-white px-8 h-12`}
                    >
                      Learn More <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative h-[500px] lg:h-auto"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100 rounded-2xl -z-10 opacity-50`}></div>

                    <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                      <div className="bg-gray-50 py-3 px-4 border-b border-gray-100 flex items-center">
                        <div className="flex gap-1.5 mr-3">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="text-sm font-mono text-gray-500 bg-white px-4 py-1 rounded-md flex-grow text-center">
                          zaptick.io/{feature.title.toLowerCase().split(' ')[0]}
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="h-[400px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
                          {/* <feature.icon className={`h-16 w-16 text-${feature.color}-400`} /> */}
                          <img src={feature.image} className="h-[90%]" />
                        </div>
                      </div>
                    </div>

                    {/* Decorative elements based on feature type */}
                    {feature.title.includes("Messaging") && (
                      <motion.div
                        className="absolute -right-6 top-1/4 bg-white rounded-lg shadow-lg p-3 border border-gray-100 max-w-[200px]"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <div className="flex gap-2 items-start">
                          <div className="mt-1 bg-green-100 rounded-full p-1">
                            <MessageSquare className="h-3 w-3 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">Broadcast Status</p>
                            <p className="text-[10px] text-gray-500">1,342 delivered • 98% read</p>
                            <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                              <motion.div
                                className="h-full bg-green-500 rounded-full"
                                initial={{ width: "0%" }}
                                whileInView={{ width: "98%" }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.8, duration: 1 }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {feature.title.includes("Automation") && (
                      <motion.div
                        className="absolute -left-6 bottom-1/4 bg-white rounded-lg shadow-lg p-3 border border-gray-100"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 rounded-full p-1.5">
                            <Zap className="h-3 w-3 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">Auto-response active</p>
                            <div className="flex gap-1 items-center">
                              <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" />
                              <p className="text-[10px] text-gray-500">Responding in 3s</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {feature.title.includes("Commerce") && (
                      <motion.div
                        className="absolute -top-6 left-1/3 bg-white rounded-lg shadow-lg p-3 border border-gray-100"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="bg-purple-100 rounded-full p-1.5">
                            <ShoppingBag className="h-3 w-3 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">New order received</p>
                            <p className="text-[10px] text-gray-500">$297.00 • 3 items</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {feature.title.includes("Analytics") && (
                      <motion.div
                        className="absolute -bottom-6 right-1/3 bg-white rounded-lg shadow-lg p-3 border border-gray-100"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="bg-orange-100 rounded-full p-1.5">
                            <BarChart2 className="h-3 w-3 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">ROI increased by 34%</p>
                            <p className="text-[10px] text-gray-500">View detailed report</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Workflow Showcase Section */}
      <section id="workflow" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 px-3 py-1.5 bg-blue-50 text-blue-600">
              Seamless Experience
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              How Zaptick works
            </h2>
            <p className="text-lg text-gray-600">
              Our platform provides an intuitive workflow to engage with your customers through WhatsApp
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-20">
              {[
                {
                  step: 1,
                  title: "Connect your WhatsApp",
                  description: "Seamlessly integrate your WhatsApp Business account with our platform in minutes.",
                  icon: Smartphone,
                  color: "green"
                },
                {
                  step: 2,
                  title: "Create engaging flows",
                  description: "Build automated conversation flows with our intuitive visual builder.",
                  icon: Zap,
                  color: "blue"
                },
                {
                  step: 3,
                  title: "Analyze and optimize",
                  description: "Track performance and continuously improve your customer engagement.",
                  icon: PieChart,
                  color: "yellow"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="relative text-center"
                >
                  {/* Step indicator */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className={`h-12 w-12 rounded-full bg-${item.color}-200 text-black flex items-center justify-center text-xl font-bold shadow-lg`}>
                      {item.step}
                    </div>
                  </div>

                  {/* Step content */}
                  <div className={`pt-8 pb-10 px-6 bg-white rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-${item.color}-200`}>
                    <div className={`mb-6 mx-auto p-4 rounded-xl bg-${item.color}-50`}>
                      <item.icon className={`h-8 w-8 text-${item.color}-600`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 mb-6">{item.description}</p>
                    <div className="mt-auto">
                      <Button
                        variant="ghost"
                        className={`text-${item.color}-600 hover:bg-${item.color}-50`}
                      >
                        Learn more <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Connector line (except for last item) */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-12 h-0.5 bg-gray-200">
                      <div className="absolute top-1/2 left-full transform -translate-y-1/2 -translate-x-1/2">
                        <ChevronRight className="h-5 w-5 text-gray-300" />
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
      <section id='testimonials' ref={testimonialsRef} className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 px-3 py-1.5 bg-orange-50 text-orange-600">
              Success Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              What our clients are saying
            </h2>
            <p className="text-lg text-gray-600">
              See how businesses of all sizes are transforming their customer engagement with Zaptick
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <Carousel className="w-full">
              <CarouselContent>
                {[
                  {
                    quote: "Zaptick transformed our customer communication strategy. Our response times decreased by 70% and customer satisfaction scores reached an all-time high of 98%.",
                    author: "Sarah Johnson",
                    position: "Customer Experience Director",
                    company: "Global Retail Inc.",
                    image: "/avatars/female1.jpg"
                  },
                  {
                    quote: "The ROI we've seen with Zaptick is extraordinary. Our WhatsApp campaigns consistently outperform email by 5x, with conversion rates above 35%.",
                    author: "Michael Chen",
                    position: "VP of Digital Marketing",
                    company: "TechSolutions Group",
                    image: "/avatars/man6.jpg"
                  },
                  {
                    quote: "Implementing Zaptick's WhatsApp automation reduced our support costs by 60% while improving our CSAT scores. The platform paid for itself within two months.",
                    author: "Elena Rodriguez",
                    position: "Head of Customer Support",
                    company: "Fintech Innovations",
                    image: "/avatars/female2.jpg"
                  },
                  {
                    quote: "The customer insights we've gained through Zaptick have been invaluable. We're now able to personalize our messaging in ways we never could before.",
                    author: "David Thompson",
                    position: "Chief Marketing Officer",
                    company: "NexGen Retail",
                    image: "/avatars/man1.jpg"
                  },
                  {
                    quote: "As a growing e-commerce business, Zaptick has allowed us to scale our customer support without increasing headcount. The AI-powered responses are remarkable.",
                    author: "Jason Lee",
                    position: "Founder & CEO",
                    company: "Urban Essentials",
                    image: "/avatars/man2.jpg"
                  }
                ].map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/1">
                    <div className="p-1">
                      <Card className="border-none shadow-xl bg-gradient-to-br from-gray-50 to-white">
                        <CardContent className="p-8">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                              <div className="mb-6">
                                <div className="flex mb-4">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                  ))}
                                </div>
                                <blockquote className="text-xl md:text-2xl text-gray-700 font-medium italic leading-relaxed mb-8">
                                  &quot;{testimonial.quote}&quot;
                                </blockquote>
                              </div>

                              <div className="flex items-center">
                                <div className="h-14 w-14 rounded-full bg-gray-200 mr-4 overflow-hidden flex-shrink-0 border-2 border-white shadow-md">
                                  <Image
                                    src={testimonial.image}
                                    alt={testimonial.author}
                                    width={56}
                                    height={56}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56' fill='none'%3E%3Crect width='56' height='56' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='20' fill='%236b7280'%3E" + testimonial.author.charAt(0) + "%3C/text%3E%3C/svg%3E";
                                    }}
                                  />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900">{testimonial.author}</h4>
                                  <p className="text-gray-600">{testimonial.position}, {testimonial.company}</p>
                                </div>
                              </div>
                            </div>

                            <div className="relative hidden md:block">
                              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl opacity-70"></div>
                              <div className="relative h-full rounded-xl overflow-hidden flex items-center justify-center p-8">
                                <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                      <BarChart2 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">Results</p>
                                      <p className="text-xs text-gray-500">After implementing Zaptick</p>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    {index === 0 ? [
                                      "Customer satisfaction +45%",
                                      "Response time -60%",
                                      "Conversion rate +38%"
                                    ] : index === 1 ? [
                                      "Campaign ROI +420%",
                                      "Click-through rate +210%",
                                      "Lead quality +67%"
                                    ] : index === 2 ? [
                                      "Support costs -60%",
                                      "Resolution time -45%",
                                      "CSAT score +28%"
                                    ] : index === 3 ? [
                                      "Customer insights +75%",
                                      "Personalization score +52%",
                                      "Repeat purchases +33%"
                                    ] : [
                                      "Automation rate +85%",
                                      "Team efficiency +120%",
                                      "Customer growth +47%"
                                    ].map((result, idx) => (
                                      <div key={idx} className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-gray-700">{result}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-2 mt-6">
                <CarouselPrevious className="relative static translate-y-0 translate-x-0" />
                <CarouselNext className="relative static translate-y-0 translate-x-0" />
              </div>
            </Carousel>

            <motion.div
              className="mt-12 pt-12 border-t border-gray-200 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p className="text-gray-600 mb-6">Trusted by innovative companies around the world</p>
              <div className="flex flex-wrap justify-center gap-8 items-center">
                {[
                  { src: "/brands/sabhyasachi.webp", alt: "Sabhyasachi" },
                  { src: "/brands/walkingtree.webp", alt: "Walking Tree" },
                  { src: "/brands/birlabraniacs.webp", alt: "Birla Braniacs" },
                  { src: "/brands/bvcventures.webp", alt: "BVC Ventures" },
                  { src: "/brands/emerald.webp", alt: "Emerald" },
                  { src: "/brands/malabar.webp", alt: "Malabar" }
                ].map((brand, i) => (
                  <div key={i} className="h-12 opacity-70 hover:opacity-100 transition-opacity duration-300 flex items-center">
                    <Image
                      src={brand.src}
                      alt={brand.alt}
                      width={100}
                      height={48}
                      className="object-contain max-h-12"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='48' viewBox='0 0 100 48' fill='none'%3E%3Crect width='100' height='48' fill='%23f9fafb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='12' fill='%236b7280'%3E" + brand.alt + "%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id='integrations' className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 px-3 py-1.5 bg-purple-50 text-purple-600">
              Ecosystem
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Integrate with your favorite tools
            </h2>
            <p className="text-lg text-gray-600">
              Zaptick connects seamlessly with your existing tech stack for a unified workflow
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            {/* Define all integrations once */}
            {(() => {
              // All integrations data
              const allIntegrations = [
                { src: "/integrations/shopify.png", alt: "Shopify", category: "E-commerce" },
                { src: "/integrations/stripe.png", alt: "Stripe", category: "Payment" },
                { src: "/integrations/razorpay.png", alt: "Razorpay", category: "Payment" },
                { src: "/integrations/payu.png", alt: "PayU", category: "Payment" },
                { src: "/integrations/zohobooks.png", alt: "Zoho Books", category: "Business" },
                { src: "/integrations/zoho-inventory.png", alt: "Zoho Inventory", category: "Business" },
                { src: "/integrations/tally.webp", alt: "Tally", category: "Business" },
                { src: "/integrations/zendesk.png", alt: "Zendesk", category: "Support" },
                { src: "/integrations/gmail.png", alt: "Gmail", category: "Communication" },
                { src: "/integrations/twilio.jpg", alt: "Twilio", category: "Communication" },
                { src: "/integrations/google.webp", alt: "Google", category: "Marketing" },
                { src: "/integrations/google-ads.png", alt: "Google Ads", category: "Marketing" },
                { src: "/integrations/facebook.webp", alt: "Facebook", category: "Marketing" },
                { src: "/integrations/indiamart.png", alt: "IndiaMART", category: "Marketing" },
                { src: "/integrations/tradeindia.png", alt: "TradeIndia", category: "Marketing" },
                { src: "/integrations/JustDial.png", alt: "JustDial", category: "Marketing" },
                { src: "/integrations/delhivery.png", alt: "Delhivery", category: "Logistics" },
                { src: "/integrations/callhippo.png", alt: "CallHippo", category: "Communication" },
                { src: "/integrations/zapllo-caller.png", alt: "Zapllo Caller", category: "Communication" },
                { src: "/integrations/interakt.jpeg", alt: "Interakt", category: "Communication" }
              ];

              // Define the tabs categories
              const categories = ['all', 'e-commerce', 'payment', 'marketing', 'support', 'communication', 'business', 'logistics'];

              // Integration card component
              const IntegrationCard = ({ integration, index }) => (
                <motion.div
                  key={index}

                  className="bg-white rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 hover:shadow-md transition-all group relative"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="h-12 w-full mb-4 flex items-center justify-center">
                    <Image
                      src={integration.src}
                      alt={integration.alt}
                      width={100}
                      height={40}
                      className="object-contain max-h-12 max-w-[80%] group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='40' viewBox='0 0 100 40' fill='none'%3E%3Crect width='100' height='40' fill='%23f9fafb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='12' fill='%236b7280'%3E" + integration.alt + "%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{integration.alt}</p>
                  <p className="text-xs text-gray-500 mt-1">{integration.category}</p>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-purple-600 bg-opacity-90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-medium px-3 py-1.5 rounded-full bg-white/20 text-sm flex items-center">
                      Connect <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </div>
                </motion.div>
              );

              return (
                <Tabs defaultValue="all" className="w-full mb-12">
                  <div className="flex justify-center">
                    <TabsList className="bg-white rounded-full shadow-sm border border-gray-100 p-1 flex flex-wrap justify-center">
                      {['All Integrations', 'E-commerce', 'Payment', 'Marketing', 'Support', 'Communication', 'Business', 'Logistics'].map((category) => (
                        <TabsTrigger
                          key={category}
                          value={category.toLowerCase().replace(/\s+/g, '-')}
                          className="rounded-full px-4 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                        >
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {/* Generate tab content for each category */}
                  {categories.map((category) => {
                    // Filter integrations based on category
                    const filteredIntegrations = category === 'all'
                      ? allIntegrations
                      : allIntegrations.filter(integration =>
                        integration.category.toLowerCase() === category.replace('-', ' '));

                    return (
                      <TabsContent key={category} value={category} className="mt-8">
                        {category !== 'all' && (
                          <motion.p
                            className="text-center text-gray-500 mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            Showing {filteredIntegrations.length} {category.replace('-', ' ')} integrations
                          </motion.p>
                        )}

                        <motion.div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"

                          initial="hidden"
                          animate="show"
                        >
                          {filteredIntegrations.length > 0 ? (
                            filteredIntegrations.map((integration, index) => (
                              <IntegrationCard key={`${category}-${index}`} integration={integration} index={index} />
                            ))
                          ) : (
                            <div className="col-span-full py-16 text-center">
                              <div className="bg-purple-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Search className="h-8 w-8 text-purple-500" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
                              <p className="text-gray-500 max-w-md mx-auto">
                                We&apos;re constantly adding new integrations. Contact us to request this integration.
                              </p>
                              <Button variant="outline" className="mt-4">
                                Request Integration
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              );
            })()}

            {/* Integration Stats */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {[
                { count: "40+", label: "Native Integrations", icon: Zap },
                { count: "10min", label: "Average Setup Time", icon: Clock },
                { count: "API", label: "API Access", icon: Code }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100"
                >
                  <div className="inline-flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-purple-100 mb-4">
                    <stat.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.count}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              className="mt-16 pt-8 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >

            {/*
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 h-12 shadow-md">
                Explore Integration Marketplace <ChevronRight className="ml-1 h-4 w-4" />
              </Button> */}
              <p className="text-sm text-gray-500 mt-4">
                Don&apos;t see what you need? Request a custom integration at support@zapllo.com.
              </p>
              </motion.div>
            {/* </motion.div> */}
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { title: "GDPR Compliant", icon: Shield, description: "Full compliance with data protection regulations" },
                { title: "SOC 2 Certified", icon: Lock, description: "Enterprise-grade security standards" },
                { title: "99.9% Uptime", icon: Globe, description: "Reliable service with SLA guarantees" },
                { title: "24/7 Support", icon: Headphones, description: "Expert assistance whenever you need it" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-6xl mx-auto bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
              <div className="col-span-3 p-10 md:p-14 text-white">
                <motion.h2
                  className="text-3xl md:text-4xl font-bold mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  Ready to transform your WhatsApp Business experience?
                </motion.h2>

                <motion.p
                  className="text-white/90 text-lg mb-8 max-w-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  Join thousands of businesses already using Zaptick to engage with customers, increase sales, and provide exceptional support.
                </motion.p>

                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="bg-white text-green-700 hover:bg-white/90 h-14 px-8 text-base font-medium">
                      <Link href="/signup" className="flex items-center gap-2">
                        Start Your Free Trial <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>

                    <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 h-14 px-8 text-base font-medium">
                      <Link href="/contact" className="flex items-center gap-2">
                        Request Demo
                      </Link>
                    </Button>
                  </div>

                  <div className="pt-6 space-y-3">
                    <div className="flex items-center gap-2 text-white/90">
                      <CheckCircle className="h-5 w-5 text-white" />
                      <span>No credit card required</span>
                    </div>

                    <div className="flex items-center gap-2 text-white/90">
                      <CheckCircle className="h-5 w-5 text-white" />
                      <span>14-day free trial with full access</span>
                    </div>

                    <div className="flex items-center gap-2 text-white/90">
                      <CheckCircle className="h-5 w-5 text-white" />
                      <span>Cancel anytime</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="col-span-2 relative hidden lg:block">
                <div className="absolute inset-0 bg-black/10"></div>
                {/* <Image
                  src="/cta-image.jpg"
                  alt="WhatsApp Business Platform"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600' fill='none'%3E%3Crect width='600' height='600' fill='%2310b981'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='24' fill='white'%3ECTA Image%3C/text%3E%3C/svg%3E";
                  }}
                /> */}

                <motion.div
                  className="absolute top-1/4 left-8 bg-white rounded-xl shadow-lg p-4 max-w-[200px]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 rounded-full p-2">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Start today</p>
                      <p className="text-[10px] text-gray-500">Be live within minutes</p>
                    </div>
                  </div>
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
              className="relative w-full max-w-4xl bg-transparent"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsPlaying(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
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
