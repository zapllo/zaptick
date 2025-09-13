"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
  Bot,
  BarChart2,
  Target,
  Sparkles,
  Zap,
  ArrowRight,
  Phone,
  Calendar,
  User,
  Building,
  Mail,
  Globe,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  ShoppingBag,
  Settings,
  Send,
  Eye,
  Download
} from "lucide-react";

export default function Demo() {
  const [currentDemo, setCurrentDemo] = useState("messaging");
  const [isPlaying, setIsPlaying] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    useCase: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const demos = {
    messaging: {
      title: "Smart Messaging Hub",
      description: "See how businesses create and send targeted WhatsApp campaigns",
      icon: MessageSquare,
      color: "green",
      gradient: "from-green-500 to-emerald-600",
      features: [
        "Bulk messaging with personalization",
        "Rich media support (images, videos, documents)",
        "Message templates and quick replies",
        "Contact segmentation and targeting",
        "Delivery and read receipt tracking"
      ],
      stats: [
        { label: "Open Rate", value: "98%", change: "+23%" },
        { label: "Response Rate", value: "67%", change: "+45%" },
        { label: "Messages Sent", value: "15.2K", change: "+12%" }
      ]
    },
    automation: {
      title: "AI-Powered Automation",
      description: "Experience intelligent chatbots and workflow automation",
      icon: Bot,
      color: "blue",
      gradient: "from-blue-500 to-cyan-600",
      features: [
        "Visual flow builder with drag-and-drop",
        "AI-powered natural language processing",
        "Smart routing and escalation",
        "Multi-language support",
        "Integration with existing systems"
      ],
      stats: [
        { label: "Automation Rate", value: "85%", change: "+18%" },
        { label: "Response Time", value: "< 2s", change: "-67%" },
        { label: "Customer Satisfaction", value: "94%", change: "+12%" }
      ]
    },
    campaigns: {
      title: "Smart Campaigns",
      description: "Create and manage targeted broadcast campaigns",
      icon: Target,
      color: "purple",
      gradient: "from-purple-500 to-pink-600",
      features: [
        "Campaign builder with templates",
        "A/B testing and optimization",
        "Scheduled and triggered campaigns",
        "Performance analytics and insights",
        "ROI tracking and reporting"
      ],
      stats: [
        { label: "Campaign CTR", value: "34%", change: "+28%" },
        { label: "Conversion Rate", value: "12.5%", change: "+35%" },
        { label: "ROI", value: "420%", change: "+89%" }
      ]
    },
    analytics: {
      title: "Advanced Analytics",
      description: "Track performance and gain actionable insights",
      icon: BarChart2,
      color: "orange",
      gradient: "from-orange-500 to-red-600",
      features: [
        "Real-time dashboard and metrics",
        "Customer journey analytics",
        "Conversation insights and trends",
        "Team performance tracking",
        "Custom reports and exports"
      ],
      stats: [
        { label: "Data Points", value: "1.2M+", change: "+156%" },
        { label: "Insights Generated", value: "847", change: "+67%" },
        { label: "Accuracy", value: "99.2%", change: "+2%" }
      ]
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/40 via-purple-100/30 to-green-100/40 rounded-full blur-3xl opacity-60" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
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
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 border border-blue-200/50"
              >
                <Play className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Interactive Demo Experience</span>
              </motion.div>

              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                  See Zaptick in
                  <span className="relative inline-block ml-4">
                    <span className="relative z-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Action
                    </span>
                    <motion.div
                      className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.8, duration: 1 }}
                    />
                  </span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  Experience the power of WhatsApp Business automation with our interactive demo. See real features, metrics, and workflows in action.
                </p>
              </div>

              <Badge className="px-4 py-2 bg-green-50 text-green-700 border-green-200">
                <Sparkles className="h-4 w-4 mr-2" />
                Live Demo • No Setup Required
              </Badge>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Navigation */}
      <section className="py-8 bg-gradient-to-b from-gray-50/50 to-white border-b border-gray-100">
        <div className="container mx-auto px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(demos).map(([key, demo]) => (
                <motion.button
                  key={key}
                  onClick={() => setCurrentDemo(key)}
                  className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 ${
                    currentDemo === key
                      ? `bg-gradient-to-br from-${demo.color}-500 to-${demo.color}-600 text-white shadow-lg shadow-${demo.color}-500/25`
                      : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      currentDemo === key 
                        ? 'bg-white/20' 
                        : `bg-gradient-to-br from-${demo.color}-500 to-${demo.color}-600`
                    } shadow-sm`}>
                      <demo.icon className={`h-5 w-5 ${
                        currentDemo === key ? 'text-white' : 'text-white'
                      }`} />
                    </div>
                    {currentDemo === key && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-2 w-2 rounded-full bg-white"
                      />
                    )}
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${
                    currentDemo === key ? 'text-white' : 'text-gray-900'
                  }`}>
                    {demo.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${
                    currentDemo === key ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    {demo.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentDemo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start"
              >
                {/* Demo Interface */}
                <div className="lg:col-span-2">
                  <Card className="shadow-2xl border-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="text-white font-mono text-sm bg-gray-700 px-3 py-1 rounded">
                          zaptick.io/dashboard
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="text-white hover:bg-white/10"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/10"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
                        {/* Demo Content Based on Selection */}
                        {currentDemo === "messaging" && (
                          <div className="p-6 h-full">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                                <MessageSquare className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">Broadcast Campaign</h3>
                                <p className="text-sm text-green-600">Active • 2,847 recipients</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              {demos.messaging.stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                                    <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                </div>
                              ))}
                            </div>

                            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                              <div className="p-4 border-b border-gray-100">
                                <h4 className="font-semibold text-gray-900">Recent Messages</h4>
                              </div>
                              <div className="space-y-3 p-4">
                                {[
                                  { name: "John Doe", message: "Thanks for the quick response!", time: "2m ago", status: "read" },
                                  { name: "Sarah Miller", message: "Can you tell me more about pricing?", time: "5m ago", status: "delivered" },
                                  { name: "Mike Johnson", message: "I'm interested in your services", time: "8m ago", status: "sent" }
                                ].map((msg, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-semibold">
                                      {msg.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm text-gray-900">{msg.name}</span>
                                        <span className="text-xs text-gray-500">{msg.time}</span>
                                      </div>
                                      <p className="text-sm text-gray-600 truncate">{msg.message}</p>
                                    </div>
                                    <div className={`h-2 w-2 rounded-full ${
                                      msg.status === 'read' ? 'bg-blue-500' : 
                                      msg.status === 'delivered' ? 'bg-gray-400' : 'bg-green-500'
                                    }`} />
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {currentDemo === "automation" && (
                          <div className="p-6 h-full">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                                <Bot className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">AI Chatbot Flow</h3>
                                <p className="text-sm text-blue-600">Processing • 156 conversations</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              {demos.automation.stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                                    <span className="text-xs text-blue-600 font-medium">{stat.change}</span>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                </div>
                              ))}
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                              <h4 className="font-semibold text-gray-900 mb-4">Active Flow: Customer Support</h4>
                              <div className="space-y-3">
                                {[
                                  { step: "Welcome Message", status: "completed", icon: MessageSquare },
                                  { step: "Intent Recognition", status: "processing", icon: Bot },
                                  { step: "Route to Agent", status: "pending", icon: Users }
                                ].map((step, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.2 }}
                                    className="flex items-center gap-3"
                                  >
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                      step.status === 'completed' ? 'bg-green-100 text-green-600' :
                                      step.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                                      'bg-gray-100 text-gray-400'
                                    }`}>
                                      <step.icon className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium text-gray-900">{step.step}</span>
                                    <div className={`ml-auto h-2 w-2 rounded-full ${
                                      step.status === 'completed' ? 'bg-green-500' :
                                      step.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                                      'bg-gray-300'
                                    }`} />
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {currentDemo === "campaigns" && (
                          <div className="p-6 h-full">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                                <Target className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">Holiday Sale Campaign</h3>
                                <p className="text-sm text-purple-600">Running • 4,521 contacts targeted</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              {demos.campaigns.stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                                    <span className="text-xs text-purple-600 font-medium">{stat.change}</span>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                </div>
                              ))}
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                              <h4 className="font-semibold text-gray-900 mb-4">Campaign Timeline</h4>
                              <div className="space-y-4">
                                {[
                                  { time: "09:00 AM", event: "Campaign launched", status: "completed" },
                                  { time: "09:15 AM", event: "First batch sent (1,500 contacts)", status: "completed" },
                                  { time: "10:30 AM", event: "Second batch scheduled", status: "processing" },
                                  { time: "12:00 PM", event: "Final batch pending", status: "pending" }
                                ].map((item, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-3"
                                  >
                                    <div className="flex flex-col items-center">
                                      <div className={`h-3 w-3 rounded-full ${
                                        item.status === 'completed' ? 'bg-green-500' :
                                        item.status === 'processing' ? 'bg-purple-500 animate-pulse' :
                                        'bg-gray-300'
                                      }`} />
                                      {index < 3 && <div className="w-px h-6 bg-gray-200 mt-2" />}
                                    </div>
                                    <div className="flex-1 pb-4">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-gray-900">{item.event}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {item.time}
                                        </Badge>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {currentDemo === "analytics" && (
                          <div className="p-6 h-full">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                                <BarChart2 className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">Performance Analytics</h3>
                                <p className="text-sm text-orange-600">Real-time • Last 30 days</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              {demos.analytics.stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                                    <span className="text-xs text-orange-600 font-medium">{stat.change}</span>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                </div>
                              ))}
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                              <h4 className="font-semibold text-gray-900 mb-4">Key Insights</h4>
                              <div className="space-y-3">
                                {[
                                  { insight: "Peak engagement: 2-4 PM weekdays", trend: "up", value: "+34%" },
                                  { insight: "Best performing template: Welcome Series", trend: "up", value: "+67%" },
                                  { insight: "Customer lifecycle: 14 days average", trend: "down", value: "-8%" },
                                  { insight: "Most active segment: Premium customers", trend: "up", value: "+23%" }
                                ].map((item, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100"
                                  >
                                    <span className="text-sm text-gray-700">{item.insight}</span>
                                    <div className={`flex items-center gap-1 text-xs font-medium ${
                                      item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      <TrendingUp className={`h-3 w-3 ${item.trend === 'down' ? 'rotate-180' : ''}`} />
                                      {item.value}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Animated elements */}
                        {isPlaying && (
                          <motion.div
                            className="absolute top-4 right-4"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Demo Details */}
                <div className="space-y-6">
                  <Card className="p-6 shadow-lg border-0">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br`}>
                        
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900"></h3>
                          <p className="text-sm text-gray-600">{demos[currentDemo].description}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Key Features:</h4>
                        {demos[currentDemo].features.map((feature, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Demo Controls */}
                  {/* <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-gray-50 to-white">
                    <CardContent className="p-0">
                      <h4 className="font-semibold text-gray-900 mb-4">Demo Controls</h4>
                      <div className="space-y-3">
                       <Button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className={`w-full h-12 ${
                            isPlaying 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : `bg-gradient-to-r ${demos[currentDemo].gradient} hover:opacity-90`
                          } text-white font-semibold shadow-lg transition-all duration-300`}
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Demo
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Play Demo
                            </>
                          )}
                        </Button>

                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 hover:border-gray-300"
                          >
                            <RotateCcw className="mr-2 h-3 w-3" />
                            Restart
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 hover:border-gray-300"
                          >
                            <Eye className="mr-2 h-3 w-3" />
                            Full Screen
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card> */}

                  {/* Quick Actions */}
                  {/* <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50">
                    <CardContent className="p-0">
                      <h4 className="font-semibold text-gray-900 mb-4">Try It Yourself</h4>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Download className="mr-2 h-3 w-3" />
                          Download Template
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          <Settings className="mr-2 h-3 w-3" />
                          Customize Demo
                        </Button>
                      </div>
                    </CardContent>
                  </Card> */}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Book Demo Form */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge className="mb-4 px-4 py-2 bg-green-50 text-green-700 border-green-200">
                <Calendar className="h-4 w-4 mr-2" />
                Book Your Personal Demo
              </Badge>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">
                Ready to see Zaptick in your business?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Schedule a personalized demo with our experts. We&apos;ll show you exactly how Zaptick can transform your WhatsApp communication.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 shadow-xl border-0">
                  <CardContent className="p-0">
                    {!isSubmitted ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-600" />
                              Full Name *
                            </Label>
                            <Input
                              id="name"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="h-12"
                              placeholder="John Doe"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-green-600" />
                              Email Address *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className="h-12"
                              placeholder="john@company.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="company" className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-purple-600" />
                              Company Name
                            </Label>
                            <Input
                              id="company"
                              value={formData.company}
                              onChange={(e) => setFormData({...formData, company: e.target.value})}
                              className="h-12"
                              placeholder="Your Company Inc."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-orange-600" />
                              Phone Number
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              className="h-12"
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="useCase" className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-pink-600" />
                            Primary Use Case
                          </Label>
                          <Select value={formData.useCase} onValueChange={(value) => setFormData({...formData, useCase: value})}>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select your main interest" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer-support">Customer Support</SelectItem>
                              <SelectItem value="marketing">Marketing & Campaigns</SelectItem>
                              <SelectItem value="sales">Sales & Lead Generation</SelectItem>
                              <SelectItem value="automation">Process Automation</SelectItem>
                              <SelectItem value="analytics">Analytics & Insights</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-cyan-600" />
                            Tell us about your needs
                          </Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                            className="min-h-[100px]"
                            placeholder="What challenges are you looking to solve with WhatsApp?"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/25"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                              Scheduling Demo...
                            </>
                          ) : (
                            <>
                              <Calendar className="mr-2 h-4 w-4" />
                              Schedule My Demo
                            </>
                          )}
                        </Button>
                      </form>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <div className="flex justify-center mb-6">
                          <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Demo Scheduled!</h3>
                        <p className="text-gray-600 mb-6">
                          Thank you! Our team will contact you within 24 hours to schedule your personalized demo.
                        </p>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                          <p className="text-sm text-green-700 font-medium">
                            📧 Check your email for confirmation details
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">What to expect in your demo:</h3>
                  <div className="space-y-4">
                    {[
                      {
                        icon: Eye,
                        title: "Personalized Walkthrough",
                        description: "See exactly how Zaptick works for your specific use case and industry"
                      },
                      {
                        icon: Target,
                        title: "ROI Analysis",
                        description: "Understand potential cost savings and revenue impact for your business"
                      },
                      {
                        icon: Settings,
                        title: "Implementation Plan",
                        description: "Get a clear roadmap for setup, migration, and team training"
                      },
                      {
                        icon: Users,
                        title: "Q&A Session",
                        description: "Ask questions and get expert advice from our WhatsApp specialists"
                      }
                    ].map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm flex-shrink-0">
                          <benefit.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                          <p className="text-sm text-gray-600">{benefit.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">30-minute session</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        No commitment required
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Tailored to your business needs
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Expert WhatsApp guidance included
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}