"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
import { AlertCircle, ArrowLeft, Shield, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// Loading component
function LoadingState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Icons.spinner className="h-8 w-8 animate-spin text-green-600" />
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  );
}

// Main component with search params
function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  // Validate the token on page load
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Missing reset token. Please request a new password reset link.");
        setIsValidatingToken(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Invalid or expired token");
        }

        setIsTokenValid(true);
      } catch (err: any) {
        console.error("Token validation error:", err);
        setError(err.message || "Your password reset link is invalid or has expired. Please request a new one.");
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || "Failed to reset your password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while validating token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-green-600" />
        <p className="mt-4 text-muted-foreground">Validating your reset link...</p>
      </div>
    );
  }

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
        className="w-full max-w-md"
      >
        <Card className="border shadow-lg overflow-hidden backdrop-blur-sm">
          {!isTokenValid && !success ? (
            <div className="p-6">
              <div className="flex flex-col items-center text-center py-4">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Invalid Reset Link</h2>
                <p className="text-muted-foreground mb-6">
                  {error || "Your password reset link is invalid or has expired."}
                </p>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => router.push('/forgot-password')}
                >
                  Request New Reset Link
                </Button>
              </div>
            </div>
          ) : success ? (
            <div className="p-6">
              <div className="flex flex-col items-center text-center py-4">
                <div className="rounded-full bg-green-100 p-3 mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Password Reset Successful!</h2>
                <p className="text-muted-foreground mb-6">
                  Your password has been successfully updated. You will be redirected to the login page shortly.
                </p>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => router.push('/login')}
                >
                  Go to Login
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Link href="/login" className="text-green-600 hover:text-green-700 flex items-center mr-4">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span className="text-sm">Back to login</span>
                  </Link>
                </div>
                <CardTitle className="text-2xl">Create new password</CardTitle>
                <CardDescription>
                  Please enter a new password for your account.
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

                <motion.div variants={fadeIn} className="space-y-2 mt-4">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10 transition-all focus:ring-2 focus:ring-green-200 focus:border-green-400"
                      placeholder="Enter new password"
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

                <motion.div variants={fadeIn} className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 pr-10 transition-all focus:ring-2 focus:ring-green-200 focus:border-green-400"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeIn}
                  className="bg-blue-50 p-3 mb-2 rounded-lg mt-4 border border-blue-100"
                >
                  <div className="flex items-start text-sm text-blue-800">
                    <Shield className="h-4 w-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>
                      Your password should be at least 8 characters and include a mix of letters, numbers, and symbols for better security.
                    </span>
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
                    className="w-full h-11 text-base bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-300"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </motion.div>
              </CardFooter>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

// Main page component with Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
