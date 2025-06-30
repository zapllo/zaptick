"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
import { AlertCircle, ArrowLeft, Shield, Mail, CheckCircle } from "lucide-react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || "Failed to process your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background/95 to-green-50/20 p-4">
      {/* Background animated elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Link href="/">
          <div className="flex items-center gap-2">
            <img src='/zapzap.png' className="h-12"/>
          </div>
        </Link>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="w-full h-full max-w-md"
      >
        <Card className="border shadow-lg  overflow-hidden backdrop-blur-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <div className="flex items-center mb-2">
                <Link href="/login" className="text-green-600 hover:text-green-700 flex items-center mr-4">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span className="text-sm">Back to login</span>
                </Link>
              </div>
              <CardTitle className="text-2xl">Reset your password</CardTitle>
              <CardDescription>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-start"
                >
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 mb-4 border border-green-100 rounded-lg p-6 text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-green-100 p-3">
                      <Mail className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-green-800 mb-2">Check your email</h3>
                  <p className="text-green-700 mb-4">
                    We&apos;ve sent a password reset link to <strong>{email}</strong>
                  </p>
                  <div className="text-sm text-green-600">
                    <p>Didn&apos;t receive the email? Check your spam folder or</p>
                    <button
                      type="button"
                      onClick={() => handleSubmit(new Event('click') as any)}
                      className="text-green-700 font-medium hover:underline mt-1"
                    >
                      Click here to try again
                    </button>
                  </div>
                </motion.div>
              ) : (
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
              )}

              {!success && (
                <motion.div
                  variants={fadeIn}
                  className="bg-blue-50 p-3 mb-2 rounded-lg mt-4 border border-blue-100"
                >
                  <div className="flex items-start text-sm text-blue-800">
                    <Shield className="h-4 w-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>
                      We&apos;ll send you a secure link to reset your password. The link will expire after 30 minutes.
                    </span>
                  </div>
                </motion.div>
              )}
            </CardContent>

            {!success && (
              <CardFooter className="flex flex-col">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Button
                    className="w-full h-11 text-base bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-300"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </motion.div>
              </CardFooter>
            )}
          </form>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-center text-sm text-muted-foreground"
      >
        <p>
          Remember your password? <Link href="/login" className="text-green-600 hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
