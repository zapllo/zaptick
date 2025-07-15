"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageSquare, Users, ShoppingBag, BarChart2, Zap, Globe, Lock, Bot } from "lucide-react";

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState("messaging");
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const features = {
    messaging: [
      {
        icon: <MessageSquare className="h-5 w-5 text-emerald-500" />,
        title: "Broadcast Messaging",
        description: "Send personalized messages to thousands of customers in seconds with dynamic variables and smart segmentation."
      },
      {
        icon: <Users className="h-5 w-5 text-emerald-500" />,
        title: "Team Inbox",
        description: "Collaborative inbox where multiple team members can handle customer conversations with assignment and internal notes."
      },
      {
        icon: <Bot className="h-5 w-5 text-emerald-500" />,
        title: "AI-Powered Templates",
        description: "Pre-approved message templates with AI suggestions to improve engagement and conversion rates."
      }
    ],
    automation: [
      {
        icon: <Zap className="h-5 w-5 text-blue-500" />,
        title: "Flow Builder",
        description: "Visual drag-and-drop flow builder to create complex conversation flows without coding."
      },
      {
        icon: <Bot className="h-5 w-5 text-blue-500" />,
        title: "AI Chatbots",
        description: "Create intelligent chatbots that qualify leads, answer FAQs, and collect customer information 24/7."
      },
      {
        icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
        title: "Triggered Automations",
        description: "Set up event-based automations that trigger based on customer behavior or external events."
      }
    ],
    commerce: [
      {
        icon: <ShoppingBag className="h-5 w-5 text-purple-500" />,
        title: "Product Catalog",
        description: "Showcase your products directly in WhatsApp with detailed images, descriptions, and pricing."
      },
      {
        icon: <CheckCircle className="h-5 w-5 text-purple-500" />,
        title: "Checkout Process",
        description: "Guide customers through a seamless checkout process without leaving the WhatsApp conversation."
      },
      {
        icon: <Lock className="h-5 w-5 text-purple-500" />,
        title: "Payment Integration",
        description: "Secure payment processing with multiple payment gateway options and order tracking."
      }
    ],
    analytics: [
      {
        icon: <BarChart2 className="h-5 w-5 text-orange-500" />,
        title: "Performance Dashboard",
        description: "Comprehensive analytics dashboard showing message performance, response times, and conversion rates."
      },
      {
        icon: <Users className="h-5 w-5 text-orange-500" />,
        title: "Customer Insights",
        description: "Detailed customer profiles with conversation history, preferences, and engagement metrics."
      },
      {
        icon: <Globe className="h-5 w-5 text-orange-500" />,
        title: "Custom Reports",
        description: "Build and schedule custom reports for different teams and stakeholders with exportable data."
      }
    ],
  };

  const tabImages: Record<string, string> = {
    messaging: "/features-messaging.png",
    automation: "/features-automation.png",
    commerce: "/features-commerce.png",
    analytics: "/features-analytics.png",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    },
  };

  return (
    <section id="features" ref={ref} className="container mx-auto py-20 px-4 md:px-8">
      <div className="text-center mb-16">
        <Badge className="mb-4 px-3 py-1 bg-emerald-100 text-emerald-800 wark:bg-emerald-900 wark:text-emerald-300">Features</Badge>
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to grow with WhatsApp</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Our platform provides all the tools you need to engage customers, drive sales, and provide support through WhatsApp.
        </p>
      </div>

      <Tabs
        defaultValue="messaging"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-center mb-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/50 p-1">
            <TabsTrigger
              value="messaging"
              className="data-[state=active]:bg-white wark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messaging
            </TabsTrigger>
            <TabsTrigger
              value="automation"
              className="data-[state=active]:bg-white wark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              Automation
            </TabsTrigger>
            <TabsTrigger
              value="commerce"
              className="data-[state=active]:bg-white wark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Commerce
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white wark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        {Object.keys(features).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              <motion.div
                className="lg:w-1/2 relative"
                initial={{ opacity: 0, x: -30 }}
                animate={inView && activeTab === tab ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-gradient-to-br from-muted/50 to-muted p-6 rounded-3xl shadow-lg border border-muted-foreground/10">
                  <Image
                    src={tabImages[tab]}
                    alt={`${tab} feature`}
                    width={600}
                    height={400}
                    className="rounded-xl shadow-md"
                  />

                  {/* Interactive elements specific to each tab */}
                  {tab === "messaging" && (
                    <motion.div
                      className="absolute -right-6 top-1/4 bg-white wark:bg-gray-800 shadow-lg rounded-lg p-3 max-w-[200px]"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={inView && activeTab === tab ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div className="flex gap-2 items-start">
                        <div className="mt-1 bg-emerald-100 wark:bg-emerald-900/50 rounded-full p-1">
                          <MessageSquare className="h-3 w-3 text-emerald-600 wark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">Bulk Message Status</p>
                          <p className="text-[10px] text-muted-foreground">1,342 delivered • 98% open rate</p>
                          <div className="h-1.5 bg-gray-200 wark:bg-gray-700 rounded-full mt-1">
                            <motion.div
                              className="h-full bg-emerald-500 rounded-full"
                              initial={{ width: "0%" }}
                              animate={inView && activeTab === tab ? { width: "98%" } : { width: "0%" }}
                              transition={{ delay: 0.5, duration: 1 }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tab === "automation" && (
                    <motion.div
                      className="absolute -left-6 bottom-1/4 bg-white wark:bg-gray-800 shadow-lg rounded-lg p-3"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={inView && activeTab === tab ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 wark:bg-blue-900/50 rounded-full p-1.5">
                          <Zap className="h-3 w-3 text-blue-600 wark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">Auto-response activated</p>
                          <div className="flex gap-1 items-center">
                            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                            <p className="text-[10px] text-muted-foreground">Responding in 3s</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tab === "commerce" && (
                    <motion.div
                      className="absolute -top-6 left-1/3 bg-white wark:bg-gray-800 shadow-lg rounded-lg p-3"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={inView && activeTab === tab ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-100 wark:bg-purple-900/50 rounded-full p-1.5">
                          <ShoppingBag className="h-3 w-3 text-purple-600 wark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">New order placed!</p>
                          <p className="text-[10px] text-muted-foreground">$129.99 • 2 items</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tab === "analytics" && (
                    <motion.div
                      className="absolute -bottom-6 right-1/3 bg-white wark:bg-gray-800 shadow-lg rounded-lg p-3"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={inView && activeTab === tab ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="bg-orange-100 wark:bg-orange-900/50 rounded-full p-1.5">
                          <BarChart2 className="h-3 w-3 text-orange-600 wark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">Conversion up 24%</p>
                          <p className="text-[10px] text-muted-foreground">Weekly report available</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <motion.div
                className="lg:w-1/2 space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate={inView && activeTab === tab ? "visible" : "hidden"}
              >
                <div>
                  <h3 className="text-2xl font-bold mb-4">
                    {tab === "messaging" && "Engage with customers at scale"}
                    {tab === "automation" && "Automate conversations intelligently"}
                    {tab === "commerce" && "Sell products directly in WhatsApp"}
                    {tab === "analytics" && "Measure and optimize performance"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {tab === "messaging" && "Reach your customers instantly with personalized messages that get read and drive action."}
                    {tab === "automation" && "Save time and resources with intelligent automations that handle routine inquiries and qualify leads."}
                    {tab === "commerce" && "Turn conversations into conversions with a complete WhatsApp shopping experience."}
                    {tab === "analytics" && "Get deep insights into your WhatsApp communication performance to optimize your strategy."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  {features[tab as keyof typeof features].map((feature, index: number) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex gap-4 items-start"
                    >
                      <div className="bg-muted p-2 rounded-full">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold mb-1">{feature.title}</h4>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div variants={itemVariants}>
                  <Button
                    size="lg"
                    className={`${tab === "messaging" ? "bg-emerald-500 hover:bg-emerald-600" :
                      tab === "automation" ? "bg-blue-500 hover:bg-blue-600" :
                        tab === "commerce" ? "bg-purple-500 hover:bg-purple-600" :
                          "bg-orange-500 hover:bg-orange-600"
                      } text-white`}
                  >
                    Explore {tab === "messaging" ? "Messaging" :
                      tab === "automation" ? "Automation" :
                        tab === "commerce" ? "Commerce" :
                          "Analytics"} Features
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Interactive feature showcase */}
      <div className="mt-24 bg-gradient-to-r from-gray-50 to-gray-100 wark:from-gray-900 wark:to-gray-800 rounded-3xl p-8 md:p-12">
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Interactive User Experience</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">See how ZapTick&apos;s features work together to create a seamless WhatsApp business experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            className="bg-white wark:bg-gray-800 rounded-xl shadow-lg p-6 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ y: -5 }}
          >
            <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500" />
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-emerald-500" />
              Smart Response Suggestions
            </h4>
            <p className="text-muted-foreground mb-4">AI-powered response suggestions based on conversation context and customer history.</p>
            <div className="bg-gray-100 wark:bg-gray-700 rounded-lg p-3 mt-4">
              <div className="flex flex-col gap-2">
                <div className="bg-emerald-100 wark:bg-emerald-900/30 text-emerald-800 wark:text-emerald-300 text-sm p-2 rounded-lg">
                  &quot;Thanks for your interest! Would you like to see our latest collection?&quot;
                </div>
                <div className="bg-blue-100 wark:bg-blue-900/30 text-blue-800 wark:text-blue-300 text-sm p-2 rounded-lg">
                  &quot;I&apos;d be happy to help you track your order. Could you provide your order number?&quot;
                </div>
                <div className="bg-purple-100 wark:bg-purple-900/30 text-purple-800 wark:text-purple-300 text-sm p-2 rounded-lg">
                  &quot;We have a special discount for you! Would you like to learn more?&quot;
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">Use suggestion</Button>
            </div>
          </motion.div>

          <motion.div
            className="bg-white wark:bg-gray-800 rounded-xl shadow-lg p-6 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ y: -5 }}
          >
            <div className="absolute top-0 left-0 h-1 w-full bg-blue-500" />
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Bot className="h-5 w-5 mr-2 text-blue-500" />
              Visual Flow Builder
            </h4>
            <p className="text-muted-foreground mb-4">Create complex conversation flows with our drag-and-drop visual builder.</p>
            <div className="bg-gray-100 wark:bg-gray-700 rounded-lg p-3 mt-4 h-[150px] relative">
              {/* Simplified flow builder representation */}
              <div className="absolute top-4 left-4 w-[80px] h-[30px] bg-blue-500 rounded-lg flex items-center justify-center text-xs text-white">
                Start
              </div>
              <svg className="absolute top-[19px] left-[94px]" width="30" height="2">
                <line x1="0" y1="0" x2="30" y2="0" stroke="#3b82f6" strokeWidth="2" />
              </svg>
              <div className="absolute top-4 left-[134px] w-[80px] h-[30px] bg-gray-200 wark:bg-gray-600 rounded-lg flex items-center justify-center text-xs">
                Message
              </div>
              <svg className="absolute top-[19px] left-[224px]" width="30" height="2">
                <line x1="0" y1="0" x2="30" y2="0" stroke="#3b82f6" strokeWidth="2" />
              </svg>
              <div className="absolute top-4 left-[264px] w-[80px] h-[30px] bg-orange-500 rounded-lg flex items-center justify-center text-xs text-white">
                Condition
              </div>
              <svg className="absolute top-[34px] left-[304px]" width="2" height="30">
                <line x1="0" y1="0" x2="0" y2="30" stroke="#3b82f6" strokeWidth="2" />
              </svg>
              <div className="absolute top-[74px] left-[264px] w-[80px] h-[30px] bg-green-500 rounded-lg flex items-center justify-center text-xs text-white">
                Yes
              </div>
              <svg className="absolute top-[74px] left-[354px]" width="2" height="30">
                <line x1="0" y1="0" x2="0" y2="30" stroke="#3b82f6" strokeWidth="2" />
              </svg>
              <div className="absolute top-[114px] left-[314px] w-[80px] h-[30px] bg-red-500 rounded-lg flex items-center justify-center text-xs text-white">
                No
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white wark:bg-gray-800 rounded-xl shadow-lg p-6 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ y: -5 }}
          >
            <div className="absolute top-0 left-0 h-1 w-full bg-purple-500" />
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2 text-purple-500" />
              In-Chat Product Catalog
            </h4>
            <p className="text-muted-foreground mb-4">Let customers browse and purchase products without leaving WhatsApp.</p>
            <div className="bg-gray-100 wark:bg-gray-700 rounded-lg p-3 mt-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white wark:bg-gray-800 rounded-lg p-2">
                  <div className="bg-gray-200 wark:bg-gray-600 h-12 w-full rounded-md mb-2"></div>
                  <p className="text-xs font-medium">Premium Watch</p>
                  <p className="text-xs text-muted-foreground">$199.99</p>
                </div>
                <div className="bg-white wark:bg-gray-800 rounded-lg p-2">
                  <div className="bg-gray-200 wark:bg-gray-600 h-12 w-full rounded-md mb-2"></div>
                  <p className="text-xs font-medium">Luxury Bag</p>
                  <p className="text-xs text-muted-foreground">$149.99</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-purple-500">View all products (24)</Button>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 flex justify-center">
          <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white">
            Explore All Features
          </Button>
        </div>
      </div>
    </section>
  );
}
