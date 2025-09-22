"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquare,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Shield,
  Zap,
  Star,
  ArrowRight,
  Play,
  Download,
  ExternalLink,
  Building2,
  Globe,
  Settings,
  BarChart3,
  FileText,
  Phone,
  Mail,
  Video,
  Image
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

export default function WhatsAppGuidePage() {
  const [activeStep, setActiveStep] = useState(1);

  const setupSteps = [
    {
      id: 1,
      title: "Create WhatsApp Business Account",
      duration: "5 minutes",
      difficulty: "Easy",
      description: "Set up your official WhatsApp Business profile with all necessary information",
      requirements: [
        "Valid phone number",
        "Business information",
        "Profile picture and description"
      ],
      tips: [
        "Use a dedicated business phone number",
        "Complete all profile fields for better credibility",
        "Add business hours and location if applicable"
      ]
    },
    {
      id: 2,
      title: "Apply for WhatsApp Business API",
      duration: "2-7 days",
      difficulty: "Medium",
      description: "Get approved for WhatsApp Business API to unlock advanced features and integrations",
      requirements: [
        "Verified business information",
        "Facebook Business Manager account",
        "Terms of Service agreement"
      ],
      tips: [
        "Ensure business information matches official documents",
        "Response time affects approval",
        "Have your use case clearly defined"
      ]
    },
    {
      id: 3,
      title: "Connect with Zaptick Platform",
      duration: "10 minutes",
      difficulty: "Easy",
      description: "Link your approved WhatsApp Business API with Zaptick for powerful automation",
      requirements: [
        "WhatsApp Business API access",
        "Zaptick account",
        "Admin permissions"
      ],
      tips: [
        "Keep API credentials secure",
        "Test connection before going live",
        "Configure webhook endpoints properly"
      ]
    },
    {
      id: 4,
      title: "Create Message Templates",
      duration: "30 minutes",
      difficulty: "Medium",
      description: "Design and submit message templates for different business scenarios",
      requirements: [
        "Template content in local language",
        "Proper variable formatting",
        "Category selection"
      ],
      tips: [
        "Keep messages clear and concise",
        "Include call-to-action buttons",
        "Test templates thoroughly"
      ]
    },
    {
      id: 5,
      title: "Set Up Automation & Launch",
      duration: "1 hour",
      difficulty: "Advanced",
      description: "Configure automated workflows and launch your WhatsApp Business solution",
      requirements: [
        "Approved message templates",
        "Contact database",
        "Business workflows defined"
      ],
      tips: [
        "Start with simple automations",
        "Monitor performance closely",
        "Have fallback options ready"
      ]
    }
  ];

  const features = [
    {
      title: "Business Profile",
      description: "Create a professional business presence on WhatsApp",
      icon: Building2,
      benefits: [
        "Verified business badge",
        "Business information display",
        "Professional credibility"
      ]
    },
    {
      title: "Message Templates",
      description: "Send pre-approved messages for notifications and marketing",
      icon: FileText,
      benefits: [
        "24-hour messaging window extension",
        "Rich media support",
        "Interactive buttons"
      ]
    },
    {
      title: "Automation & Chatbots",
      description: "Automate customer interactions with intelligent workflows",
      icon: Zap,
      benefits: [
        "24/7 customer support",
        "Lead qualification",
        "Response time reduction"
      ]
    },
    {
      title: "Analytics & Insights",
      description: "Track message performance and customer engagement",
      icon: BarChart3,
      benefits: [
        "Delivery and read rates",
        "Customer behavior insights",
        "ROI measurement"
      ]
    },
    {
      title: "Multi-Agent Support",
      description: "Team collaboration for customer support",
      icon: Users,
      benefits: [
        "Multiple team members",
        "Internal notes and tags",
        "Performance tracking"
      ]
    },
    {
      title: "API Integration",
      description: "Connect with your existing business systems",
      icon: Globe,
      benefits: [
        "CRM integration",
        "E-commerce platforms",
        "Custom workflows"
      ]
    }
  ];

  const messageTypes = [
    {
      type: "Text Messages",
      icon: MessageSquare,
      description: "Plain text messages with formatting options",
      useCases: ["Order confirmations", "Appointment reminders", "Customer support"],
      limits: "No character limit"
    },
    {
      type: "Media Messages",
      icon: Image,
      description: "Images, documents, videos, and audio files",
      useCases: ["Product catalogs", "Invoice sharing", "Tutorial videos"],
      limits: "16MB file size limit"
    },
    {
      type: "Interactive Messages",
      icon: Settings,
      description: "Buttons, lists, and quick replies",
      useCases: ["Menu selections", "Feedback collection", "Quick responses"],
      limits: "Up to 10 buttons/options"
    },
    {
      type: "Location Messages",
      icon: Globe,
      description: "Share location and address information",
      useCases: ["Store locations", "Delivery tracking", "Event venues"],
      limits: "Live location sharing available"
    }
  ];

  const bestPractices = [
    {
      category: "Messaging Guidelines",
      icon: MessageSquare,
      practices: [
        "Always get opt-in consent before messaging",
        "Respect customer preferences and time zones",
        "Keep messages relevant and valuable",
        "Provide easy opt-out options",
        "Use personalization appropriately"
      ]
    },
    {
      category: "Template Management",
      icon: FileText,
      practices: [
        "Create templates for common scenarios",
        "Keep template content clear and concise",
        "Include proper call-to-action buttons",
        "Test templates before submission",
        "Monitor template performance regularly"
      ]
    },
    {
      category: "Customer Experience",
      icon: Users,
      practices: [
        "Respond to customers promptly",
        "Maintain professional tone",
        "Provide helpful and accurate information",
        "Use rich media when appropriate",
        "Follow up on unresolved issues"
      ]
    },
    {
      category: "Compliance & Security",
      icon: Shield,
      practices: [
        "Follow WhatsApp Commerce Policy",
        "Protect customer data and privacy",
        "Implement proper authentication",
        "Regular security audits",
        "Stay updated with policy changes"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-green-50/20">
      <Header />

      {/* Hero Section */}
      <section className="pt-40 pb-20 relative overflow-hidden">
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
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp Business Guide
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Complete WhatsApp
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                Business Guide
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl text-gray-600 mb-8 leading-relaxed">
              Everything you need to know about setting up and optimizing WhatsApp Business for your company.
              From account creation to advanced automation strategies.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 text-lg px-8 py-4 h-auto">
                <Play className="mr-2 h-5 w-5" />
                Watch Video Guide
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto">
                <Download className="mr-2 h-5 w-5" />
                Download PDF Guide
              </Button>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div variants={fadeIn} className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Setup Progress</span>
                <span>{activeStep}/5 Steps Completed</span>
              </div>
              <Progress value={(activeStep / 5) * 100} className="h-2" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Setup Steps */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Setup Steps</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Follow this step-by-step guide to get your WhatsApp Business up and running
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Tabs value={activeStep.toString()} onValueChange={(value) => setActiveStep(parseInt(value))}>
                <TabsList className="grid w-full grid-cols-5 mb-8">
                  {setupSteps.map((step) => (
                    <TabsTrigger
                      key={step.id}
                      value={step.id.toString()}
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-blue-600"
                    >
                      Step {step.id}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {setupSteps.map((step) => (
                  <TabsContent key={step.id} value={step.id.toString()}>
                    <Card className="overflow-hidden shadow-xl">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 pb-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              {step.id}
                            </div>
                            <div>
                              <CardTitle className="text-2xl">{step.title}</CardTitle>
                              <div className="flex items-center gap-4 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {step.duration}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${step.difficulty === 'Easy' ? 'border-green-300 text-green-700' :
                                      step.difficulty === 'Medium' ? 'border-yellow-300 text-yellow-700' :
                                        'border-red-300 text-red-700'
                                    }`}
                                >
                                  {step.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-lg">
                          {step.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              Requirements
                            </h4>
                            <ul className="space-y-2">
                              {step.requirements.map((req, index) => (
                                <li key={index} className="flex items-center gap-2 text-gray-700">
                                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Star className="w-5 h-5 text-yellow-500" />
                              Pro Tips
                            </h4>
                            <ul className="space-y-2">
                              {step.tips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2 text-gray-700">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex justify-between mt-8">
                          <Button
                            variant="outline"
                            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                            disabled={activeStep === 1}
                          >
                            Previous Step
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-green-600 to-blue-600"
                            onClick={() => setActiveStep(Math.min(5, activeStep + 1))}
                            disabled={activeStep === 5}
                          >
                            Next Step
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WhatsApp Business Features */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">WhatsApp Business Features</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover the powerful features available with WhatsApp Business API
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-medium text-gray-900 mb-3">Key Benefits:</h4>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Message Types */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Message Types & Capabilities</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Learn about different message formats and their use cases
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {messageTypes.map((msgType, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <msgType.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle>{msgType.type}</CardTitle>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {msgType.limits}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>{msgType.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-medium text-gray-900 mb-3">Common Use Cases:</h4>
                      <div className="flex flex-wrap gap-2">
                        {msgType.useCases.map((useCase, useCaseIndex) => (
                          <Badge key={useCaseIndex} variant="secondary" className="text-xs">
                            {useCase}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Best Practices & Guidelines</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Follow these guidelines to ensure optimal performance and compliance
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {bestPractices.map((category, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <category.icon className="w-5 h-5 text-green-600" />
                        </div>
                        <CardTitle className="text-lg">{category.category}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {category.practices.map((practice, practiceIndex) => (
                          <li key={practiceIndex} className="flex items-start gap-3 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            {practice}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Policy Compliance */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6" />
                  <CardTitle className="text-xl">Important: WhatsApp Commerce Policy</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">✅ Allowed Activities</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Customer support and service notifications</li>
                      <li>• Order confirmations and shipping updates</li>
                      <li>• Appointment reminders and confirmations</li>
                      <li>• Account alerts and security notifications</li>
                      <li>• Personalized recommendations (with opt-in)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">❌ Prohibited Activities</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Unsolicited marketing messages</li>
                      <li>• Spam or bulk messaging without consent</li>
                      <li>• Adult content or illegal activities</li>
                      <li>• Misleading or false information</li>
                      <li>• Harassment or threatening messages</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800">
                    <strong>Important:</strong> Violating WhatsApp's Commerce Policy can result in account suspension or permanent ban.
                    Always ensure compliance with local regulations and obtain proper consent before messaging customers.
                  </p>
                </div>

                <div className="mt-6 flex gap-4">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Read Full Policy
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Compliance Checklist
                  </Button>
                </div>
              </CardContent>
            </Card>
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
              Ready to Get Started?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Let Zaptick help you set up and optimize your WhatsApp Business solution.
              Our experts will guide you through every step.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-green-50 text-lg px-8 py-4 h-auto font-semibold"
                >
                  <Video className="mr-2 h-5 w-5" />
                  Book Setup Call
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-4 h-auto font-semibold"
                onClick={() => window.open('https://wa.me/919836630366?text=Hi%20Zaptick%20team%2C%20I%20need%20help%20setting%20up%20WhatsApp%20Business.%20Can%20you%20assist%3F', '_blank')}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Get Help via WhatsApp
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-green-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Expert guidance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Free setup support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Ongoing assistance</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-400/20 rounded-full blur-xl"></div>
      </section>

      <Footer />
    </div>
  );
}
