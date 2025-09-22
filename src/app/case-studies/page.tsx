"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  ArrowRight,
  Star,
  Building2,
  ShoppingBag,
  Heart,
  GraduationCap,
  Home,
  Utensils,
  Play,
  Download,
  ExternalLink
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

export default function CaseStudiesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Industries", count: 12 },
    { id: "ecommerce", name: "E-commerce", count: 4, icon: ShoppingBag },
    { id: "healthcare", name: "Healthcare", count: 3, icon: Heart },
    { id: "education", name: "Education", count: 2, icon: GraduationCap },
    { id: "realestate", name: "Real Estate", count: 2, icon: Home },
    { id: "restaurants", name: "Restaurants", count: 1, icon: Utensils }
  ];

  const caseStudies = [
    {
      id: 1,
      category: "ecommerce",
      company: "StyleHub Fashion",
      industry: "E-commerce & Retail",
      logo: "/logos/stylehub.png",
      image: "/case-studies/stylehub-hero.jpg",
      title: "How StyleHub Increased Sales by 340% with WhatsApp Commerce",
      summary: "Fashion retailer StyleHub leveraged Zaptick's automation to create personalized shopping experiences, resulting in massive revenue growth.",
      metrics: [
        { label: "Sales Increase", value: "340%", icon: TrendingUp },
        { label: "Response Time", value: "< 30 sec", icon: Clock },
        { label: "Customer Satisfaction", value: "98%", icon: Star },
        { label: "Messages Sent", value: "50K+", icon: MessageSquare }
      ],
      challenge: "StyleHub was struggling with cart abandonment and wanted to create more personalized shopping experiences for their customers.",
      solution: "Implemented automated WhatsApp flows for cart recovery, personalized product recommendations, and instant customer support.",
      results: [
        "340% increase in sales conversion",
        "85% reduction in cart abandonment",
        "24/7 customer support automation",
        "98% customer satisfaction score"
      ],
      testimonial: {
        text: "Zaptick transformed our business completely. The WhatsApp automation not only recovered abandoned carts but created entirely new revenue streams we never imagined possible.",
        author: "Priya Sharma",
        role: "Founder & CEO",
        avatar: "/avatars/priya-sharma.jpg"
      },
      featured: true,
      readTime: "8 min",
      publishDate: "2024-01-15"
    },
    {
      id: 2,
      category: "healthcare",
      company: "MediCare Plus",
      industry: "Healthcare",
      logo: "/logos/medicare.png",
      image: "/case-studies/medicare-hero.jpg",
      title: "MediCare Plus: Streamlining Patient Communication",
      summary: "Healthcare provider improved patient engagement and reduced no-shows by 60% using automated WhatsApp reminders and consultations.",
      metrics: [
        { label: "No-show Reduction", value: "60%", icon: TrendingUp },
        { label: "Patient Satisfaction", value: "95%", icon: Star },
        { label: "Response Rate", value: "89%", icon: MessageSquare },
        { label: "Appointments", value: "12K+", icon: Users }
      ],
      challenge: "High no-show rates and inefficient patient communication were causing operational challenges and revenue loss.",
      solution: "Deployed automated appointment reminders, prescription notifications, and telemedicine support through WhatsApp.",
      results: [
        "60% reduction in no-shows",
        "95% patient satisfaction",
        "50% faster prescription delivery",
        "Automated 80% of routine communications"
      ],
      testimonial: {
        text: "Patient engagement has never been better. Our no-show rates dropped dramatically, and patients love the convenience of WhatsApp communication.",
        author: "Dr. Rajesh Gupta",
        role: "Chief Medical Officer",
        avatar: "/avatars/rajesh-gupta.jpg"
      },
      featured: false,
      readTime: "6 min",
      publishDate: "2024-01-10"
    },
    {
      id: 3,
      category: "realestate",
      company: "Dream Homes Realty",
      industry: "Real Estate",
      logo: "/logos/dreamhomes.png",
      image: "/case-studies/dreamhomes-hero.jpg",
      title: "Dream Homes: Converting Leads into Sales with WhatsApp",
      summary: "Real estate agency increased lead conversion by 250% using automated property showcases and instant client communication.",
      metrics: [
        { label: "Lead Conversion", value: "250%", icon: TrendingUp },
        { label: "Response Time", value: "< 2 min", icon: Clock },
        { label: "Properties Sold", value: "450+", icon: Home },
        { label: "Client Satisfaction", value: "97%", icon: Star }
      ],
      challenge: "Long response times and inefficient lead nurturing were causing potential buyers to lose interest.",
      solution: "Created automated property tours, instant lead responses, and personalized follow-up sequences via WhatsApp.",
      results: [
        "250% increase in lead conversion",
        "97% client satisfaction rate",
        "Instant property information delivery",
        "Automated virtual property tours"
      ],
      testimonial: {
        text: "Zaptick helped us close deals faster than ever. Clients love getting instant property details and virtual tours right on WhatsApp.",
        author: "Amit Patel",
        role: "Sales Director",
        avatar: "/avatars/amit-patel.jpg"
      },
      featured: false,
      readTime: "5 min",
      publishDate: "2024-01-05"
    },
    {
      id: 4,
      category: "education",
      company: "LearnPro Academy",
      industry: "Education",
      logo: "/logos/learnpro.png",
      image: "/case-studies/learnpro-hero.jpg",
      title: "LearnPro Academy: Enhancing Student Engagement",
      summary: "Online education platform improved course completion rates by 180% with personalized WhatsApp learning paths and support.",
      metrics: [
        { label: "Course Completion", value: "180%", icon: TrendingUp },
        { label: "Student Engagement", value: "92%", icon: Star },
        { label: "Support Queries", value: "5K+", icon: MessageSquare },
        { label: "Active Students", value: "8,500", icon: Users }
      ],
      challenge: "Low course completion rates and limited student engagement were affecting the platform's success metrics.",
      solution: "Implemented personalized learning reminders, progress tracking, and 24/7 doubt resolution through WhatsApp.",
      results: [
        "180% improvement in course completion",
        "92% student engagement rate",
        "24/7 automated doubt resolution",
        "Personalized learning path recommendations"
      ],
      testimonial: {
        text: "Our students are more engaged than ever. The WhatsApp integration made learning feel personal and accessible, leading to remarkable completion rates.",
        author: "Dr. Meera Singh",
        role: "Academic Director",
        avatar: "/avatars/meera-singh.jpg"
      },
      featured: false,
      readTime: "7 min",
      publishDate: "2023-12-28"
    }
  ];

  const filteredCaseStudies = selectedCategory === "all"
    ? caseStudies
    : caseStudies.filter(study => study.category === selectedCategory);

  const featuredStudy = caseStudies.find(study => study.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-green-50/20">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5"></div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn}>
              <Badge className="mb-6 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 border-green-200">
                <Building2 className="w-4 h-4 mr-2" />
                Case Studies
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Real Results from
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                Real Businesses
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl text-gray-600 mb-8 leading-relaxed">
              Discover how businesses across industries are using Zaptick to transform their customer communication
              and achieve remarkable growth through WhatsApp Business automation.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 text-lg px-8 py-4 h-auto">
                <Play className="mr-2 h-5 w-5" />
                Watch Success Stories
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto">
                <Download className="mr-2 h-5 w-5" />
                Download Report
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Case Study */}
      {featuredStudy && (
        <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="container mx-auto px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={staggerContainer}
            >
              <div className="text-center mb-16">
                <Badge className="mb-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
                  <Star className="w-4 h-4 mr-2" />
                  Featured Case Study
                </Badge>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Success Spotlight</h2>
              </div>

              <Card className="overflow-hidden shadow-2xl border-0">
                <div className="grid lg:grid-cols-2">
                  <motion.div variants={fadeIn} className="p-8 lg:p-12">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{featuredStudy.company}</h3>
                        <p className="text-gray-600">{featuredStudy.industry}</p>
                      </div>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {featuredStudy.title}
                    </h2>

                    <p className="text-lg text-gray-600 mb-8">
                      {featuredStudy.summary}
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                      {featuredStudy.metrics.map((metric, index) => (
                        <div key={index} className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <metric.icon className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                          <div className="text-sm text-gray-600">{metric.label}</div>
                        </div>
                      ))}
                    </div>

                    <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600">
                      Read Full Case Study
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>

                  <motion.div variants={fadeIn} className="relative bg-gradient-to-br from-green-500 to-blue-600 p-8 lg:p-12 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

                    <div className="relative z-10">
                      <h4 className="text-xl font-semibold mb-4">Challenge</h4>
                      <p className="mb-6 text-green-100">{featuredStudy.challenge}</p>

                      <h4 className="text-xl font-semibold mb-4">Solution</h4>
                      <p className="mb-8 text-green-100">{featuredStudy.solution}</p>

                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold">
                              {featuredStudy.testimonial.author.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold">{featuredStudy.testimonial.author}</div>
                            <div className="text-sm text-green-200">{featuredStudy.testimonial.role}</div>
                          </div>
                        </div>
                        <blockquote className="text-white italic">
                          "{featuredStudy.testimonial.text}"
                        </blockquote>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id
                  ? "bg-gradient-to-r from-green-600 to-blue-600"
                  : ""
                }
              >
                {category.icon && <category.icon className="w-4 h-4 mr-2" />}
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCaseStudies.filter(study => !study.featured).map((study, index) => (
              <motion.div key={study.id} variants={fadeIn}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardHeader className="p-0">
                    <div className="relative">
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg"></div>
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-gray-700">
                          {study.industry}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{study.company}</h3>
                        <p className="text-sm text-gray-500">{study.readTime} read</p>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                      {study.title}
                    </h4>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {study.summary}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {study.metrics.slice(0, 2).map((metric, metricIndex) => (
                        <div key={metricIndex} className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">{metric.value}</div>
                          <div className="text-xs text-gray-500">{metric.label}</div>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full group-hover:bg-green-50 group-hover:border-green-300 group-hover:text-green-700 transition-all">
                      Read Case Study
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of businesses already growing with Zaptick. Start your transformation today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-green-50 text-lg px-8 py-4 h-auto font-semibold"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Book a Demo
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-4 h-auto font-semibold"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Start Free Trial
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
