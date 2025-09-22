"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Building2,
  Mail,
  Phone,
  User,
  Globe,
  CheckCircle,
  ArrowRight,
  Zap,
  MessageSquare,
  BarChart3,
  Users,
  Shield,
  Star,
  Play,
  Loader2
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { cn } from "@/lib/utils";

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

export default function DemoPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+91",
    company: "",
    jobTitle: "",
    website: "",
    industry: "",
    companySize: "",
    currentSolution: "",
    interests: [] as string[],
    preferredDate: undefined as Date | undefined,
    preferredTime: "",
    additionalInfo: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const countryCodes = [
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+1", country: "USA", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+61", country: "Australia", flag: "🇦🇺" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+81", country: "Japan", flag: "🇯🇵" },
    { code: "+86", country: "China", flag: "🇨🇳" },
    { code: "+65", country: "Singapore", flag: "🇸🇬" },
    { code: "+971", country: "UAE", flag: "🇦🇪" }
  ];

  const industries = [
    "E-commerce & Retail",
    "Healthcare & Medical",
    "Education & Training",
    "Real Estate",
    "Financial Services",
    "Travel & Hospitality",
    "Food & Restaurants",
    "Technology & Software",
    "Manufacturing",
    "Marketing & Advertising",
    "Other"
  ];

  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "500+ employees"
  ];

  const timeSlots = [
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 1:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
    "5:00 PM - 6:00 PM"
  ];

  const interestOptions = [
    { id: "whatsapp-api", label: "WhatsApp API Setup", icon: MessageSquare },
    { id: "automation", label: "Message Automation", icon: Zap },
    { id: "broadcasting", label: "Bulk Messaging", icon: Users },
    { id: "analytics", label: "Analytics & Reporting", icon: BarChart3 },
    { id: "integrations", label: "CRM Integrations", icon: Globe },
    { id: "team-features", label: "Team Features", icon: Shield }
  ];

  const benefits = [
    {
      icon: MessageSquare,
      title: "Instant Setup",
      description: "Get your WhatsApp Business API running in minutes"
    },
    {
      icon: Zap,
      title: "Smart Automation",
      description: "Automate responses and workflows to save time"
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Track performance with comprehensive reporting"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Manage conversations across multiple team members"
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      preferredDate: date
    }));
    setIsCalendarOpen(false);
  };

  const validateForm = () => {
    const required = [
      'firstName', 'lastName', 'email', 'phone', 'company',
      'jobTitle', 'industry', 'companySize', 'preferredDate', 'preferredTime'
    ];

    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Phone validation
    if (formData.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return false;
    }

    // Date validation
    if (formData.preferredDate && formData.preferredDate < new Date()) {
      toast.error("Please select a future date");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/demo/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          preferredDate: formData.preferredDate?.toISOString()
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Demo booked successfully! Check your email for confirmation.");

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          countryCode: "+91",
          company: "",
          jobTitle: "",
          website: "",
          industry: "",
          companySize: "",
          currentSolution: "",
          interests: [],
          preferredDate: undefined,
          preferredTime: "",
          additionalInfo: ""
        });

      } else {
        toast.error(result.error || "Failed to book demo. Please try again.");
      }
    } catch (error) {
      console.error('Demo booking error:', error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2); // Allow booking up to 2 months in advance

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-blue-50/20">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 relative overflow-hidden">
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
                <Play className="w-4 h-4 mr-2" />
                Book a Demo
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              See Zaptick in
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Action
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl text-gray-600 mb-8 leading-relaxed">
              Get a personalized demo of our WhatsApp Business solutions.
              See exactly how Zaptick can transform your customer communication.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>30-minute personalized demo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Industry-specific use cases</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Live Q&A with experts</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">

            {/* Form Section */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Book Your Demo
                  </CardTitle>
                  <p className="text-gray-600">
                    Fill in your details and we'll show you how Zaptick can work for your business
                  </p>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                      </h3>

                      <div className="grid grid-cols-2  gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="John"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Doe"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">

                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            className="pl-10"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="john@company.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">

                        <Label htmlFor="phone">Phone Number *</Label>
                        <div className="flex gap-2">
                          <Select
                            value={formData.countryCode}
                            onValueChange={(value) => handleInputChange('countryCode', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {countryCodes.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  <span className="flex items-center gap-2">
                                    {country.flag} {country.code}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="phone"
                              type="tel"
                              className="pl-10"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="9876543210"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Company Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Company Information
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">

                          <Label htmlFor="company">Company Name *</Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            placeholder="Acme Corp"
                            required
                          />
                        </div>
                        <div className="space-y-2">

                          <Label htmlFor="jobTitle">Job Title *</Label>
                          <Input
                            id="jobTitle"
                            value={formData.jobTitle}
                            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                            placeholder="Marketing Manager"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">

                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="website"
                            type="url"
                            className="pl-10"
                            value={formData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            placeholder="https://company.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">

                          <Label htmlFor="industry">Industry *</Label>
                          <Select
                            value={formData.industry}
                            onValueChange={(value) => handleInputChange('industry', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {industries.map((industry) => (
                                <SelectItem key={industry} value={industry}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">

                          <Label htmlFor="companySize">Company Size *</Label>
                          <Select
                            value={formData.companySize}
                            onValueChange={(value) => handleInputChange('companySize', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue className="w-full" placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {companySizes.map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">

                        <Label htmlFor="currentSolution">Current Solution</Label>
                        <Input
                          id="currentSolution"
                          value={formData.currentSolution}
                          onChange={(e) => handleInputChange('currentSolution', e.target.value)}
                          placeholder="What are you currently using?"
                        />
                      </div>
                    </div>

                    {/* Demo Preferences */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Demo Preferences
                      </h3>

                      <div>
                        <Label>What are you interested in? (Select all that apply)</Label>
                        <div className="grid  grid-cols-2 gap-6 mt-4">
                          {interestOptions.map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={option.id}
                                checked={formData.interests.includes(option.id)}
                                onCheckedChange={() => handleInterestToggle(option.id)}
                              />
                              <label
                                htmlFor={option.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <option.icon className="w-4 h-4" />
                                  {option.label}
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 mt-6 gap-4">
                        <div className="space-y-2">

                          <Label>Preferred Date *</Label>
                          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formData.preferredDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.preferredDate ? format(formData.preferredDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={formData.preferredDate}
                                onSelect={handleDateSelect}
                                disabled={(date) =>
                                  date < today || date > maxDate
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">

                          <Label htmlFor="preferredTime">Preferred Time *</Label>
                          <Select
                            value={formData.preferredTime}
                            onValueChange={(value) => handleInputChange('preferredTime', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">

                        <Label htmlFor="additionalInfo">Additional Information</Label>
                        <Textarea
                          id="additionalInfo"
                          value={formData.additionalInfo}
                          onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                          placeholder="Tell us more about your specific needs or questions..."
                          rows={3}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 h-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Booking Demo...
                        </>
                      ) : (
                        <>
                          Book Demo
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Benefits Section */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  What You'll See in the Demo
                </h2>

                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      variants={fadeIn}
                      className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                        <p className="text-gray-600">{benefit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Social Proof */}
              <motion.div variants={fadeIn}>
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-700 italic mb-4">
                        "The demo was incredibly insightful. Within 30 minutes, I could see exactly how Zaptick would transform our customer communication."
                      </p>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Sarah Johnson</p>
                        <p>Head of Customer Success, TechCorp</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Info */}
              <motion.div variants={fadeIn}>
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 text-center">
                      Prefer to Talk First?
                    </h3>
                    <div className="space-y-3">
                      <a
                        href="https://wa.me/919836630366?text=Hi%20Zaptick%20team%2C%20I'm%20interested%20in%20booking%20a%20demo.%20Can%20we%20discuss%3F"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                      >
                        <MessageSquare className="w-5 h-5" />
                        WhatsApp Us
                      </a>
                      <a
                        href="tel:+919836630366"
                        className="flex items-center justify-center gap-2 w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium"
                      >
                        <Phone className="w-5 h-5" />
                        Call +91 9836630366
                      </a>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Available Mon-Fri, 9 AM - 6 PM IST
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Feature Highlights */}
              <motion.div variants={fadeIn}>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Demo Highlights
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Live WhatsApp API setup walkthrough
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Real-time message automation demo
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Custom use case examples for your industry
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Integration capabilities showcase
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Pricing and implementation discussion
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Q&A with WhatsApp experts
                    </li>
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Get answers to common questions about our demos
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div variants={fadeIn}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      How long is the demo?
                    </h3>
                    <p className="text-gray-600">
                      Our demos typically last 30 minutes, including time for your questions and discussion about your specific use case.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      What will I see in the demo?
                    </h3>
                    <p className="text-gray-600">
                      You'll see a live demonstration of our WhatsApp Business features, including message automation, analytics, and integrations tailored to your industry.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Do I need to prepare anything?
                    </h3>
                    <p className="text-gray-600">
                      Just come with your questions! It's helpful to think about your current communication challenges and goals beforehand.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Can my team join the demo?
                    </h3>
                    <p className="text-gray-600">
                      Absolutely! We encourage team participation. Just let us know how many people will join when we send the calendar invitation.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      What if I need to reschedule?
                    </h3>
                    <p className="text-gray-600">
                      No problem! You can reschedule anytime by replying to your confirmation email or contacting us directly.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Will there be any sales pressure?
                    </h3>
                    <p className="text-gray-600">
                      Not at all! Our demos are educational. We'll answer your questions and show you how Zaptick works, with no pressure to buy.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
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
              Ready to Transform Your Customer Communication?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already growing with Zaptick's WhatsApp solutions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle className="w-5 h-5" />
                <span>Free 30-minute demo</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle className="w-5 h-5" />
                <span>No commitment required</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle className="w-5 h-5" />
                <span>Expert guidance included</span>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-blue-200">
                Still have questions? <a href="mailto:hello@zaptick.com" className="text-white underline hover:no-underline">Email us</a> or
                <a href="https://wa.me/919836630366" target="_blank" rel="noopener noreferrer" className="text-white underline hover:no-underline ml-1">WhatsApp us</a>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400/20 rounded-full blur-xl"></div>
      </section>

      <Footer />
    </div>
  );
}
