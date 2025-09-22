"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
  MessageSquare,
  Zap,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Smartphone,
  Mail,
  ArrowLeft,
  Timer
} from "lucide-react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: credentials, 2: 2FA
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const { login } = useAuth();

  // Timer for OTP expiry
  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // If credentials are valid, proceed to 2FA
      setStep(2);
      setTimeLeft(300); // Reset timer
      setCanResend(false);

      // Send OTP
      await sendOTP();

    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async () => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.message || "Failed to send verification code.");
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      // Login successful, redirect based on role
      if (data.user.role === 'superadmin') {
        window.location.href = '/admin/template-rates';
      } else {
        window.location.href = '/dashboard';
      }

    } catch (err: any) {
      setError(err.message || "Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    setTimeLeft(300);
    await sendOTP();
  };

  const goBackToCredentials = () => {
    setStep(1);
    setOtpCode("");
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-background via-background/95 to-green-50/20 overflow-hidden">
      {/* Left side - Engaging content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInLeft}
        className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center relative"
      >
        {/* Background animated elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 right-10 w-64 h-64 bg-green-200 rounded-full opacity-10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, -20, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-10 w-80 h-80 bg-blue-200 rounded-full opacity-10 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 30, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          />
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Image
                src='/zapzap.png'
                alt="Zaptick Logo"
                width={180}
                height={60}
                className="mb-6"
                priority
              />
            </div>
          </Link>
        </motion.div>

        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Badge variant="outline" className="mb-4 text-sm px-4 py-1 border-green-600/20 bg-green-50 text-green-600">
              {step === 1 ? "Welcome Back" : "Secure Login"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {step === 1 ? (
                <>
                  Log in to your <br />
                  <span className="text-green-600 relative">
                    Zaptick account
                    <motion.div
                      className="absolute bottom-1 left-0 h-2 bg-green-200/50 w-full -z-10"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                    />
                  </span>
                </>
              ) : (
                <>
                  Enter verification <br />
                  <span className="text-green-600 relative">
                    code
                    <motion.div
                      className="absolute bottom-1 left-0 h-2 bg-green-200/50 w-full -z-10"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    />
                  </span>
                </>
              )}
            </h1>
            <p className="text-muted-foreground text-lg">
              {step === 1
                ? "Access your WhatsApp Business tools and continue where you left off."
                : `We've sent a 6-digit code to ${email}. Enter it below to complete your login.`
              }
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-md mt-8"
          >
            {step === 1 ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-green-50 flex items-center justify-center flex-shrink-0">
<Smartphone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Manage on the go</h3>
                    <p className="text-sm text-muted-foreground">Log in to access your WhatsApp campaigns from anywhere</p>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
                >
                  <div className="flex items-center gap-2 p-3 bg-green-50/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Real-time analytics</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Team collaboration</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Message templates</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Customer insights</span>
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">Enhanced security for your business account</p>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
                >
                  <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Account protection</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Secure authentication</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg">
                    <Timer className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Time: {formatTime(timeLeft)}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Email verification</span>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <p className="text-sm text-muted-foreground">
                {step === 1
                  ? "Secure login with enterprise-grade encryption"
                  : "Your account is protected with two-factor authentication"
                }
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Form */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInRight}
        className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center bg-white/50 backdrop-blur-sm relative"
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
            {step === 1 ? (
              <form onSubmit={handleCredentialsSubmit}>
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>
                    Sign in to access your Zaptick dashboard
                  </CardDescription>
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

                  <motion.div variants={fadeIn} className="space-y-2 mt-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10 transition-all focus:ring-2 focus:ring-green-200 focus:border-green-400"
                    />
                  </motion.div>

                  <motion.div variants={fadeIn} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/forgot-password" className="text-xs text-green-600 hover:underline font-medium">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 pr-10 transition-all focus:ring-2 focus:ring-green-200 focus:border-green-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={fadeIn}
                    className="bg-green-50 p-3 mb-2 rounded-lg mt-4 border border-green-100"
                  >
                    <div className="flex items-center text-sm text-green-800">
                      <Lock className="h-4 w-4 mr-2 text-green-600" />
                      <span>Secured with industry-standard encryption</span>
                    </div>
                  </motion.div>
                </CardContent>

                <CardFooter className="flex flex-col">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <Button
                      className="w-full h-12 text-base bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-300"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Continue"
                      )}
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 text-center"
                  >
                    <p className="text-sm text-muted-foreground">
                      Don&apos;t have an account?{" "}
                      <Link href="/signup" className="text-green-600 font-medium hover:underline">
                        Sign up for free
                      </Link>
                    </p>
                  </motion.div>
                </CardFooter>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goBackToCredentials}
                      className="p-0 h-auto text-gray-500 hover:text-gray-700"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle className="text-2xl">Verification Required</CardTitle>
                  </div>
                  <CardDescription>
                    Enter the 6-digit code sent to your email
                  </CardDescription>
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

                  <motion.div variants={fadeIn} className="space-y-2">
                    <Label htmlFor="otpCode">Verification Code</Label>
                    <Input
                      id="otpCode"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      className="h-12 text-center text-xl tracking-widest font-mono transition-all focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      autoComplete="one-time-code"
                    />
                  </motion.div>

                  {timeLeft > 0 ? (
                    <motion.div
                      variants={fadeIn}
                      className="bg-blue-50 mb-2 p-3 rounded-lg border border-blue-100"
                    >
                      <div className="flex items-center justify-between text-sm text-blue-800">
                        <div className="flex items-center">
                          <Timer className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Code expires in {formatTime(timeLeft)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-orange-50 p-3 rounded-lg border border-orange-100"
                    >
                      <div className="text-sm text-orange-800">
                        Your verification code has expired.
                      </div>
                    </motion.div>
                  )}

                  {canResend && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleResendOTP}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Resend verification code
                      </Button>
                    </motion.div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <Button
                      className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
                      type="submit"
                      disabled={isLoading || otpCode.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Sign In"
                      )}
                    </Button>
                  </motion.div>
                </CardFooter>
              </form>
            )}
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center text-xs text-muted-foreground"
          >
            <p>
              Need help? <Link href="/contact" className="text-green-600 hover:underline">Contact support</Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
