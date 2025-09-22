"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Book,
  Search,
  FileText,
  Code,
  Zap,
  MessageSquare,
  Settings,
  Users,
  BarChart3,
  Shield,
  Smartphone,
  Globe,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  CheckCircle
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Link from "next/link";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const quickStart = [
    {
      title: "Account Setup",
      description: "Create your account and connect WhatsApp Business API",
      icon: Users,
      time: "5 min",
      link: "/docs/setup"
    },
    {
      title: "Send Your First Message",
      description: "Learn how to send messages through Zaptick platform",
      icon: MessageSquare,
      time: "3 min",
      link: "/docs/first-message"
    },
    {
      title: "Create Message Templates",
      description: "Build and manage WhatsApp message templates",
      icon: FileText,
      time: "10 min",
      link: "/docs/templates"
    },
    {
      title: "Set Up Automation",
      description: "Automate responses and create chatbot workflows",
      icon: Zap,
      time: "15 min",
      link: "/docs/automation"
    }
  ];

  const categories = [
    {
      title: "Getting Started",
      description: "Everything you need to know to get up and running",
      icon: Book,
      color: "bg-blue-500",
      guides: [
        "Account Setup & Onboarding",
        "WhatsApp Business API Connection",
        "Dashboard Overview",
        "First Message Tutorial",
        "Basic Settings Configuration"
      ]
    },
    {
      title: "Message Management",
      description: "Create, send, and manage your WhatsApp communications",
      icon: MessageSquare,
      color: "bg-green-500",
      guides: [
        "Creating Message Templates",
        "Bulk Messaging",
        "Media Attachments",
        "Message Scheduling",
        "Contact Management"
      ]
    },
    {
      title: "Automation & Chatbots",
      description: "Set up intelligent automation for customer interactions",
      icon: Zap,
      color: "bg-purple-500",
      guides: [
        "Chatbot Builder",
        "Workflow Automation",
        "Trigger Conditions",
        "AI-Powered Responses",
        "Lead Qualification"
      ]
    },
    {
      title: "Analytics & Reporting",
      description: "Track performance and measure your success",
      icon: BarChart3,
      color: "bg-orange-500",
      guides: [
        "Message Analytics",
        "Delivery Reports",
        "Engagement Metrics",
        "Custom Dashboards",
        "Export Reports"
      ]
    },
    {
      title: "Integrations",
      description: "Connect Zaptick with your favorite tools",
      icon: Globe,
      color: "bg-teal-500",
      guides: [
        "CRM Integration",
        "E-commerce Platforms",
        "API Webhooks",
        "Zapier Connections",
        "Custom Integrations"
      ]
    },
    {
      title: "Team & Security",
      description: "Manage users, permissions, and security settings",
      icon: Shield,
      color: "bg-red-500",
      guides: [
        "Team Management",
        "User Permissions",
        "Security Settings",
        "Two-Factor Authentication",
        "Audit Logs"
      ]
    }
  ];

  const popularArticles = [
    {
      title: "How to Get WhatsApp Business API Approved",
      views: "12.5k",
      rating: 4.9,
      readTime: "8 min"
    },
    {
      title: "Setting Up Message Templates",
      views: "9.2k",
      rating: 4.8,
      readTime: "5 min"
    },
    {
      title: "Building Your First Chatbot",
      views: "7.8k",
      rating: 4.7,
      readTime: "12 min"
    },
    {
      title: "Bulk Messaging Best Practices",
      views: "6.4k",
      rating: 4.6,
      readTime: "6 min"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-blue-50/20">
      <Header />

      {/* Hero Section */}
      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn}>
              <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
                <Book className="w-4 h-4 mr-2" />
                Documentation
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Zaptick
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Documentation
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl text-gray-600 mb-8 leading-relaxed">
              Everything you need to master WhatsApp Business communication.
              From quick setup guides to advanced automation tutorials.
            </motion.p>

            {/* Search Bar */}
            <motion.div variants={fadeIn} className="relative max-w-2xl mx-auto mb-12">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-xl"
              />
              <Button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600"
                size="sm"
              >
                Search
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get up and running with Zaptick in under 30 minutes
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {quickStart.map((item, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <Link href={item.link}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                      <CardHeader className="text-center pb-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <item.icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">{item.time}</span>
                        </div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-center">
                          {item.description}
                        </CardDescription>
                        <div className="flex items-center justify-center mt-4 text-blue-600 group-hover:translate-x-2 transition-transform duration-300">
                          <span className="text-sm font-medium">Start Guide</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Browse by Category</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find exactly what you're looking for with our organized documentation
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <category.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="group-hover:text-blue-600 transition-colors">
                            {category.title}
                          </CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {category.guides.length} guides
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.guides.slice(0, 4).map((guide, guideIndex) => (
                          <li key={guideIndex} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                            <ChevronRight className="w-3 h-3" />
                            {guide}
                          </li>
                        ))}
                        {category.guides.length > 4 && (
                          <li className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">
                            +{category.guides.length - 4} more guides
                          </li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Popular Articles</h2>
              <p className="text-xl text-gray-600">
                Most viewed and highest rated documentation
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {popularArticles.map((article, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <Card className="mb-4 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span>{article.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{article.views} views</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{article.readTime} read</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Our support team is here to help. Get in touch and we'll get you the answers you need.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 h-auto font-semibold"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Contact Support
                </Button>
              </Link>
              <Link href="/api">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 h-auto font-semibold"
                >
                  <Code className="mr-2 h-5 w-5" />
                  API Reference
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
