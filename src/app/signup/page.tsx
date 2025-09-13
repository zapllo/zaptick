"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Zap, Shield, BarChart, CheckCircle, Users, Globe, User, Building2, MapPin, Briefcase, Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BiCategory } from "react-icons/bi";

// Animation variants
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

const featureItem = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

// Industry categories mapping
const INDUSTRY_CATEGORIES = {
  "Marketing & Advertising": [
    "Digital Marketing",
    "Traditional Advertising"
  ],
  "Retail": [
    "Ecommerce & Online Stores",
    "Physical Stores & Brick Mortar",
    "Omnichannel Ecommerce & Physical Stores"
  ],
  "Education": [
    "Schools & Universities",
    "Coaching Classes & Training Institutes",
    "Online Learning Platforms",
    "Books & Publications"
  ],
  "Entertainment, Social Media & Gaming": [
    "Movies & TV Shows",
    "Events & Performing Arts",
    "Cinema Halls & Multiplexes",
    "Magazines & Publications",
    "Gaming",
    "Social Media Figures",
    "Gambling & Real Money Gaming"
  ],
  "Finance": [
    "Banks",
    "Investments",
    "Payment Aggregators",
    "Insurance",
    "Loans"
  ],
  "Healthcare": [
    "Medical Services",
    "Prescription Medicines & Drugs",
    "Hospitals"
  ],
  "Public Utilities & Non-Profits": [
    "Government Services",
    "Charities",
    "Religious Organizations"
  ],
  "Professional Services": [
    "Legal Consulting Services",
    "Other Services"
  ],
  "Technology": [
    "Software & IT Services",
    "Technology & Hardware"
  ],
  "Travel & Hospitality": [
    "Hotels & Lodging",
    "Transportation",
    "Tour Agencies",
    "Clubs"
  ],
  "Automotive": [
    "Automobile Dealers",
    "Automotive Services"
  ],
  "Real Estate & Construction": [
    "Property Sales",
    "Building & Construction"
  ],
  "Restaurants": [
    "Fast Food",
    "Fine Dining",
    "Catering"
  ],
  "Manufacturing & Impex": [
    "Consumer Goods Production",
    "Industrial Production",
    "Impex"
  ],
  "Fitness & Wellness": [
    "Gyms & Fitness Centers",
    "Fitness Services",
    "Spas & Salons"
  ],
  "Others": [
    "Miscellaneous"
  ]
};

// Get industries array
const INDUSTRIES = Object.keys(INDUSTRY_CATEGORIES);

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();

  // Personal Information
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Company Information
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companyCategory, setCompanyCategory] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyCountryCode, setCompanyCountryCode] = useState("+91");

  // Available categories based on selected industry
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Counter animation for stats
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  useEffect(() => {
    const timer1 = setInterval(() => {
      setCount1(prev => (prev < 98 ? prev + 1 : prev));
    }, 30);

    const timer2 = setInterval(() => {
      setCount2(prev => (prev < 10000 ? prev + 100 : prev));
    }, 20);

    return () => {
      clearInterval(timer1);
      clearInterval(timer2);
    };
  }, []);

  // Update categories when industry changes
  useEffect(() => {
    if (companyIndustry) {
      setAvailableCategories(INDUSTRY_CATEGORIES[companyIndustry as keyof typeof INDUSTRY_CATEGORIES] || []);
      // Reset category when industry changes
      setCompanyCategory("");
    } else {
      setAvailableCategories([]);
      setCompanyCategory("");
    }
  }, [companyIndustry]);

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signup(
        name,
        email,
        password,
        companyName,
        companyWebsite,
        companyLocation,
        companyIndustry,
        companyCategory,
        companyPhone,
        companyCountryCode
      );
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate personal info
      if (!name || !email || !password) {
        setError("Please fill in all required fields");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
      setError("");
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 1 ? 'bg-green-600 text-white' : 'bg-green-600 text-white'
          }`}>
          {currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
        </div>
        <div className={`h-0.5 w-8 ${currentStep > 1 ? 'bg-green-600' : 'bg-gray-300'}`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-500'
          }`}>
          2
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center flex-col md:flex-row bg-gradient-to-br from-background via-background/95 to-green-50/20 overflow-hidden">
      {/* Left side - Engaging content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center relative"
      >
        {/* Background animated elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-64 h-64 bg-green-200 rounded-full opacity-10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-80 h-80 bg-blue-200 rounded-full opacity-10 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          />
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <img src='/zapzap.png' className="h-12" />
              </div>
            </div>
          </Link>
        </motion.div>

        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Badge variant="outline" className="mb-4 text-sm px-4 py-1 border-green-600/20 bg-green-50 text-green-600 animate-pulse">
              WhatsApp Business API Platform
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Supercharge your <br />
              <span className="text-green-600 relative">
                WhatsApp Business
                <motion.div
                  className="absolute bottom-1 left-0 h-2 bg-green-200/50 w-full -z-10"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                />
              </span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Join thousands of businesses leveraging Zaptick to engage with their customers on WhatsApp.
            </p>
          </motion.div>

          {/* Stats counters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4 mt-6 mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border shadow-sm">
              <h3 className="text-3xl font-bold text-green-600">{count1}%</h3>
              <p className="text-sm text-muted-foreground">Customer response rate increase</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border shadow-sm">
              <h3 className="text-3xl font-bold text-green-600">{count2.toLocaleString()}+</h3>
              <p className="text-sm text-muted-foreground">Messages sent daily</p>
            </div>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-6 mt-8"
          >
            <motion.div variants={featureItem} className="feature-card group">
              <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Automated Messaging</h3>
                  <p className="text-sm text-muted-foreground">Engage customers with automated responses</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={featureItem} className="feature-card group">
              <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                  <BarChart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Detailed Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track performance and engagement metrics</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={featureItem} className="feature-card group">
              <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Official WhatsApp API</h3>
                  <p className="text-sm text-muted-foreground">Fully compliant with Meta&apos;s policies</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={featureItem} className="feature-card group">
              <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Quick Integration</h3>
                  <p className="text-sm text-muted-foreground">Set up in minutes, not days</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Testimonial and trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-10 p-5 bg-white rounded-lg border border-border shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0L100 0L100 100L0 0Z" fill="#f0fdf4" />
              </svg>
            </div>

            <div className="flex items-start gap-4 relative">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-green-100">
                <Image
                  src="/avatars/female1.jpg"
                  alt="User testimonial"
                  width={48}
                  height={48}
                  className="object-fill"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23d4d4d8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div>
                <div className="flex mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.svg
                      key={star}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + star * 0.1 }}
                      className="h-4 w-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                  ))}
                </div>
                <p className="text-sm italic">&quot; Zaptick transformed our customer communication. Our response time improved by 70% and customer satisfaction is at an all-time high.&quot;</p>
                <div className="flex items-center mt-2">
                  <p className="text-sm font-medium">Maria Rodriguez</p>
                  <span className="mx-2 text-gray-300">•</span>
                  <p className="text-xs text-muted-foreground">Customer Experience Manager at TechRetail</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap items-center gap-2 mt-6"
          >
            <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-3 py-1 text-xs border shadow-sm">
              <Users size={12} className="text-green-600" />
              <span>Trusted by 5000+ businesses</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-3 py-1 text-xs border shadow-sm">
              <Globe size={12} className="text-green-600" />
              <span>Available in 160+ countries</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-3 py-1 text-xs border shadow-sm">
              <CheckCircle size={12} className="text-green-600" />
              <span>Meta Business Partner</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-1/2 -mt-12 p-6 md:p-12 flex items-center justify-center bg-white/50 backdrop-blur-sm relative"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-conic from-green-500 via-white to-green-500"
            animate={{
              rotate: [0, 360],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{
              borderRadius: "100%",
              width: "200%",
              height: "200%",
              top: "-50%",
              left: "-50%"
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-md z-10"
        >
          <Card className="border shadow-lg overflow-hidden backdrop-blur-sm">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-xl">
                  {currentStep === 1 ? "Personal Information" : "Company Information"}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1
                    ? "Create your personal account details"
                    : "Tell us about your business"
                  }
                </CardDescription>
                {renderStepIndicator()}
              </CardHeader>

              <CardContent className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {currentStep === 1 ? (
                  <>
                    <motion.div variants={fadeIn} className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="Jane Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="h-11 pl-10 transition-all focus:ring-2 focus:ring-green-200 focus:border-green-400"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={fadeIn} className="space-y-2">
                      <Label htmlFor="email">Business Email *</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 pl-10 transition-all focus:ring-2 focus:ring-green-200 focus:border-green-400"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={fadeIn} className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="password">Password *</Label>
                        <span className="text-xs text-muted-foreground">
                          {passwordStrength > 0 ? `Strength: ${['Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1]}` : 'Min. 6 characters'}
                        </span>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="h-11 pr-10 transition-all focus:ring-2 focus:ring-green-200 focus:border-green-400"
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Password strength indicator */}
                      {password.length > 0 && (
                        <div className="flex gap-1 mt-1.5">
                          {[1, 2, 3, 4].map((level) => (
                            <motion.div
                              key={level}
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              className={`h-1 rounded-full flex-1 ${level <= passwordStrength
                                ? level === 1
                                  ? "bg-red-400"
                                  : level === 2
                                    ? "bg-orange-400"
                                    : level === 3
                                      ? "bg-yellow-400"
                                      : "bg-green-500"
                                : "bg-gray-200"
                                }`}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div variants={fadeIn} className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="companyName"
                          placeholder="Your Company Name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          className="h-11 pl-10 transition-all focus:ring-2 focus:ring-green-200 focus:border-green-400"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={fadeIn} className="space-y-2">
                      <Label htmlFor="companyPhone">Company Phone</Label>
                      <div className="phone-input-container">
                        <PhoneInput
                          country={'in'}
                          value={companyPhone}
                          onChange={(phone, country: any) => {
                            setCompanyPhone(phone);
                            setCompanyCountryCode(country.dialCode);
                          }}
                          inputProps={{
                            name: 'companyPhone',
                            required: false,
                            autoFocus: false
                          }}
                          containerClass="w-full"
                          inputClass="w-full h-11 pl-12 p border border-slate-200 rounded-md focus:border-green-400 px-4 focus:ring-2 focus:ring-green-200 bg-white transition-all"
                          buttonClass="border-slate-200 hover:bg-slate-50 rounded-l-md"
                          dropdownClass="bg-white border-slate-200 shadow-lg"
                          searchClass="bg-white border-slate-200"
                          enableSearch={true}
                          disableSearchIcon={false}
                          searchPlaceholder="Search countries..."
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={fadeIn} className="space-y-2">
                      <Label htmlFor="companyWebsite">Company Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="companyWebsite"
                          placeholder="https://www.yourcompany.com"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          className="h-11 pl-10 transition-all focus:ring-2 focus:ring-green-200 focus:border-green-400"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={fadeIn} className="space-y-2">
                      <Label htmlFor="companyLocation">Company Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="companyLocation"
                          placeholder="City, Country"
                          value={companyLocation}
                          onChange={(e) => setCompanyLocation(e.target.value)}
                          className="h-11 pl-10 transition-all focus:ring-2 focus:ring-green-200 focus:border-green-400"
                        />
                      </div>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      <motion.div variants={fadeIn} className="space-y-2">
                        <Label htmlFor="companyIndustry">Industry</Label>
                        <Select value={companyIndustry} onValueChange={setCompanyIndustry}>
                          <SelectTrigger className="h-11 transition-all focus:ring-2  w-full focus:ring-green-200 focus:border-green-400">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Select your industry" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {INDUSTRIES.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>

                      <motion.div variants={fadeIn} className="space-y-2">
                        <Label htmlFor="companyCategory">Category</Label>
                        <Select 
                          value={companyCategory} 
                          onValueChange={setCompanyCategory}
                          disabled={!companyIndustry}
                        >
                          <SelectTrigger className="h-11 transition-all focus:ring-2 focus:ring-green-200 w-full focus:border-green-400">
                            <div className="flex items-center gap-2">
                              <BiCategory className="h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder={companyIndustry ? "Select category" : "Select industry first"} />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {availableCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </div>
                  </>
                )}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-muted/50 p-3 rounded-lg mt-4 border border-dashed border-muted-foreground/20 cursor-help">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Shield className="h-4 w-4 mr-2 text-green-600" />
                          <span>Your data is secured with enterprise-grade encryption</span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80 text-sm">
                        Zaptick uses state-of-the-art security measures to protect your business data,
                        ensuring compliance with global privacy regulations including GDPR and CCPA.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardContent>

              <CardFooter className="flex mt-2 flex-col">
                <div className="flex gap-2 w-full">
                  {currentStep === 2 && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 text-base"
                        onClick={handlePrevStep}
                        disabled={isLoading}
                      >
                        Back
                      </Button>
                    </motion.div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      className="w-full h-12 text-base bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-300"
                      type={currentStep === 1 ? "button" : "submit"}
                      onClick={currentStep === 1 ? handleNextStep : undefined}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : currentStep === 1 ? (
                        "Continue"
                      ) : (
                        "Create Your Zaptick Account"
                      )}
                    </Button>
                  </motion.div>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 text-sm text-center text-muted-foreground"
                >
                  By signing up, you agree to our{" "}
                  <Link href="https://zapllo.com/terms" className="text-green-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="https://zapllo.com/privacypolicy" className="text-green-600 hover:underline">
                    Privacy Policy
                  </Link>
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-green-600 font-medium hover:underline">
                      Sign in
                    </Link>
                  </p>
                </motion.div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}