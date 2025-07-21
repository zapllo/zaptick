"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useAuth } from "@/contexts/AuthContext";
import ConnectWabaButton from "@/components/connectWABA";
import {
    MessageSquare,
    Megaphone,
    Bot,
    Phone,
    Facebook,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    XCircle,
    AlertCircle,
    Shield,
    Clock,
    Users,
    Zap,
    Loader2,
    RefreshCw
} from "lucide-react";

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

// Industry restrictions data
const RESTRICTED_INDUSTRIES = [
    "Medical and healthcare products",
    "Unsafe ingestible supplements",
    "Drugs, whether prescription, recreational, or otherwise",
    "Tobacco items and related paraphernalia",
    "Alcohol",
    "Weapons, ammunition, or explosives",
    "Animals",
    "Adult products or services",
    "Items or products with overtly sexualised positioning",
    "Third-Party Infringement",
    "Body parts and fluids",
    "Dating services",
    "Products or items that facilitate or encourage unauthorized access to digital media",
    "Digital and subscription services, including links to or processing of any subscription sales, renewals, or upgrades",
    "Real, virtual, or fake currency",
    "Business models, goods, items, or services that WhatsApp determines may be or are fraudulent, misleading, offensive, or deceptive",
    "Real money gambling services"
];

// API vs Personal comparison data
const COMPARISON_DATA = [
    {
        feature: "Sending Bulk Campaigns",
        api: { allowed: true, note: "Learn more about Messaging Limits" },
        personal: { allowed: false }
    },
    {
        feature: "Messaging a customer outside of the 24-hour conversation window",
        api: { allowed: true, note: "Allowed, but only with an approved template" },
        personal: { allowed: true }
    },
    {
        feature: "Automating WhatsApp notifications on external events",
        api: { allowed: true },
        personal: { allowed: false }
    },
    {
        feature: "Being a part of WhatsApp groups",
        api: { allowed: false },
        personal: { allowed: true }
    },
    {
        feature: "Sharing WhatsApp statuses",
        api: { allowed: false },
        personal: { allowed: true }
    },
    {
        feature: "Automating WhatsApp replies to customer messages",
        api: { allowed: true },
        personal: { allowed: false }
    }
];

// Pending connection state
const PendingConnectionCard = ({ onRefresh }: { onRefresh: () => void }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
            <div>
                <h3 className="font-medium text-blue-900">Connection in Progress</h3>
                <p className="text-sm text-blue-700">
                    Your WhatsApp Business Account is being processed by Interakt. This usually takes 2-5 minutes.
                </p>
            </div>
        </div>
        <div className="text-xs text-blue-600 space-y-1 mb-4">
            <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" /> WABA details submitted
            </div>
            <div className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" /> Interakt processing your account...
            </div>
            <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" /> Setting up credit line and verification
            </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-700 mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
        </div>
        <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Status
        </Button>
    </div>
);

// Failed connection state
const FailedConnectionCard = ({ onRetry, onClearState }: {
    onRetry: () => void;
    onClearState: () => void;
}) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
                <h3 className="font-medium text-red-900">Setup Taking Longer Than Expected</h3>
                <p className="text-sm text-red-700">
                    Your WABA setup might have encountered an issue or is taking longer than usual. You can try again or contact support.
                </p>
            </div>
        </div>
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={onClearState}
                className="border-red-200 text-red-700 hover:bg-red-50"
            >
                Try Again
            </Button>
            <Button
                variant="default"
                size="sm"
                onClick={onRetry}
                className="bg-red-600 hover:bg-red-700"
            >
                Contact Support
            </Button>
        </div>
    </div>
);

export default function WhatsAppOnboardingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState("+91");
    const [hasReadTerms, setHasReadTerms] = useState(false);
    const [pendingConnection, setPendingConnection] = useState(false);
    const [connectionTimeout, setConnectionTimeout] = useState(false);
    const [wabaAccounts, setWabaAccounts] = useState<any[]>([]);

    // Collapsible states
    const [apiVsPersonalOpen, setApiVsPersonalOpen] = useState(false);
    const [restrictedIndustriesOpen, setRestrictedIndustriesOpen] = useState(false);
    const [requirementsOpen, setRequirementsOpen] = useState(false);

    // Check for pending connection in localStorage
    useEffect(() => {
        if (!user?.id) return;

        const pending = localStorage.getItem(`waba_pending_${user.id}`);
        const pendingTimestamp = localStorage.getItem(`waba_pending_timestamp_${user.id}`);

        if (pending && pendingTimestamp) {
            const timeDiff = Date.now() - parseInt(pendingTimestamp);
            const fiveMinutes = 5 * 60 * 1000;

            if (timeDiff > fiveMinutes) {
                setConnectionTimeout(true);
                setPendingConnection(true);
            } else {
                setPendingConnection(true);
            }

            console.log('Found pending WABA connection, time elapsed:', Math.round(timeDiff / 1000), 'seconds');
        }
    }, [user?.id]);

    // Listen for WABA connection events
    useEffect(() => {
        const handleWABAConnected = () => {
            console.log('WABA connection completed, redirecting to dashboard...');
            clearPendingState();
            router.push('/dashboard');
        };

        const handleWABASignupStarted = () => {
            console.log('WABA signup started');
            setPendingConnection(true);
            setConnectionTimeout(false);
            if (user?.id) {
                localStorage.setItem(`waba_pending_${user.id}`, 'true');
                localStorage.setItem(`waba_pending_timestamp_${user.id}`, Date.now().toString());
            }
        };

        const handleWABASignupCompleted = () => {
            console.log('WABA signup completed, checking for accounts...');
            setTimeout(() => {
                fetchUserData();
            }, 2000);
        };

        window.addEventListener('wabaConnected', handleWABAConnected);
        window.addEventListener('wabaSignupStarted', handleWABASignupStarted);
        window.addEventListener('wabaSignupCompleted', handleWABASignupCompleted);

        return () => {
            window.removeEventListener('wabaConnected', handleWABAConnected);
            window.removeEventListener('wabaSignupStarted', handleWABASignupStarted);
            window.removeEventListener('wabaSignupCompleted', handleWABASignupCompleted);
        };
    }, [user?.id, router]);

    const clearPendingState = () => {
        setPendingConnection(false);
        setConnectionTimeout(false);
        if (user?.id) {
            localStorage.removeItem(`waba_pending_${user.id}`);
            localStorage.removeItem(`waba_pending_timestamp_${user.id}`);
        }
    };

    const fetchUserData = async () => {
        if (!user?.id) return;

        try {
            const response = await fetch('/api/user/waba-accounts', {
                headers: {
                    'x-user-id': user.id,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Fetched WABA accounts:', data.wabaAccounts);
                setWabaAccounts(data.wabaAccounts || []);

                // If we found accounts and there was a pending connection, clear it
                if (data.wabaAccounts?.length > 0 && pendingConnection) {
                    clearPendingState();
                    // Dispatch event to notify user
                    window.dispatchEvent(new CustomEvent('wabaConnected'));
                }
            } else {
                console.error('Failed to fetch WABA accounts:', response.status);
            }
        } catch (error) {
            console.error("Error fetching WABA accounts:", error);
        }
    };

    // Auto-refresh when connection is pending
    useEffect(() => {
        if (pendingConnection && !connectionTimeout) {
            const interval = setInterval(() => {
                console.log('Auto-refreshing WABA accounts...');
                fetchUserData();
            }, 15000); // Check every 15 seconds

            return () => clearInterval(interval);
        }
    }, [pendingConnection, connectionTimeout, user?.id]);

    // Timeout handler
    useEffect(() => {
        if (pendingConnection && !connectionTimeout) {
            const timeout = setTimeout(() => {
                setConnectionTimeout(true);
                console.log('WABA connection timeout reached');
            }, 5 * 60 * 1000); // 5 minutes

            return () => clearTimeout(timeout);
        }
    }, [pendingConnection, connectionTimeout]);

    const handleRefreshAccounts = () => {
        fetchUserData();
    };

    const handleClearPendingState = () => {
        clearPendingState();
    };

    const handleContactSupport = () => {
        window.open('mailto:support@zaptick.io?subject=WABA Connection Issue', '_blank');
    };

    // Store phone number when checkbox is checked
    useEffect(() => {
        if (hasReadTerms && phoneNumber && user?.id) {
            localStorage.setItem(`waba_phone_${user.id}`, phoneNumber);
        }
    }, [hasReadTerms, phoneNumber, user?.id]);

    const renderConnectionSection = () => {
        if (wabaAccounts.length > 0) {
            // User already has accounts, redirect to dashboard
            router.push('/dashboard');
            return null;
        }

        if (pendingConnection) {
            return connectionTimeout ? (
                <FailedConnectionCard
                    onRetry={handleContactSupport}
                    onClearState={handleClearPendingState}
                />
            ) : (
                <PendingConnectionCard onRefresh={handleRefreshAccounts} />
            );
        }

        // Show the connect button only if terms are agreed and phone number is entered
        if (hasReadTerms && phoneNumber) {
            return (
                <div className="space-y-4">
                    <ConnectWabaButton />
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            The connection process will guide you through Meta&apos;s secure onboarding flow.
                        </p>
                    </div>
                </div>
            );
        }

        // Show message to complete requirements first
        return (
            <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">Complete Requirements First</h3>
                <p className="text-sm text-gray-600">
                    Please enter your phone number and agree to the terms above to proceed with WhatsApp Business API setup.
                </p>
            </div>
        );
    };

    // Fetch user data on component mount
    useEffect(() => {
        fetchUserData();
    }, [user?.id]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-green-50/20">
            {/* Header */}
            <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <img src='/zapzap.png' className="h-8" alt="Zaptick" />
                        </Link>
                        <Badge variant="outline" className="text-sm px-4 py-1 border-green-600/20 bg-green-50 text-green-600">
                            WhatsApp Business API Setup
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="max-w- mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Hero Section */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeIn}
                            className="text-center lg:text-left"
                        >
                            <div className="mb-6">
                                <Image
                                    src="/whatsapp-api-hero.png"
                                    alt="WhatsApp Business API"
                                    width={200}
                                    height={50}
                                    className="mx-auto lg:mx-0"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight mb-4">
                                Connect Your WhatsApp Business API
                            </h1>

                            <p className="text-lg text-muted-foreground mb-6">
                                Transform your customer communication with WhatsApp Business API
                            </p>

                            {/* Features Grid */}
                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                            >
                                <motion.div variants={featureItem} className="flex items-center gap-3 p-4 bg-white rounded-lg border shadow-sm">
                                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                                        <Megaphone className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Send bulk WhatsApp campaigns</h3>
                                    </div>
                                </motion.div>

                                <motion.div variants={featureItem} className="flex items-center gap-3 p-4 bg-white rounded-lg border shadow-sm">
                                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Automate WhatsApp notifications</h3>
                                    </div>
                                </motion.div>

                                <motion.div variants={featureItem} className="flex items-center gap-3 p-4 bg-white rounded-lg border shadow-sm">
                                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                                        <Bot className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Automate replies on WhatsApp</h3>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Important Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-amber-50 border border-amber-200 rounded-lg p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-amber-900">Important Information</h2>
                            </div>

                            <div className="space-y-6">
                                {/* WhatsApp Business API vs Personal/Business Account */}
                                <Collapsible open={apiVsPersonalOpen} onOpenChange={setApiVsPersonalOpen}>
                                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
                                        <h3 className="font-medium text-left">WhatsApp Business API vs WhatsApp Personal/Business Account</h3>
                                        {apiVsPersonalOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-4 bg-white rounded-lg border p-4">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-2 font-semibold">Feature</th>
                                                        <th className="text-left p-2 font-semibold">WhatsApp Business API</th>
                                                        <th className="text-left p-2 font-semibold">WhatsApp Personal/Business App</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {COMPARISON_DATA.map((item, index) => (
                                                        <tr key={index} className="border-b">
                                                            <td className="p-2 text-gray-700">{item.feature}</td>
                                                            <td className="p-2">
                                                                <div className="flex items-center gap-2">
                                                                    {item.api.allowed ? (
                                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                                    ) : (
                                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                                    )}
                                                                    <span className="font-medium">
                                                                        {item.api.allowed ? "Allowed" : "Not Allowed"}
                                                                    </span>
                                                                </div>
                                                                {item.api.note && (
                                                                    <p className="text-xs text-gray-500 mt-1">{item.api.note}</p>
                                                                )}
                                                            </td>
                                                            <td className="p-2">
                                                                <div className="flex items-center gap-2">
                                                                    {item.personal.allowed ? (
                                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                                    ) : (
                                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                                    )}
                                                                    <span className="font-medium">
                                                                        {item.personal.allowed ? "Allowed" : "Not Allowed"}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>

                                {/* Industries restricted from WhatsApp APIs */}
                                <Collapsible open={restrictedIndustriesOpen} onOpenChange={setRestrictedIndustriesOpen}>
                                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
                                        <h3 className="font-medium text-left">Industries restricted from WhatsApp APIs</h3>
                                        {restrictedIndustriesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-4 bg-white rounded-lg border p-4">
                                        <p className="text-sm text-gray-600 mb-4">
                                            If your business transacts in any of the below products, we advise you to not connect your number since WhatsApp might ban your number. For more details, read the{" "}
                                            <Link href="https://www.whatsapp.com/legal/commerce-policy" target="_blank" className="text-blue-600 hover:underline font-medium">
                                                WhatsApp Commerce Policy
                                            </Link>{" "}
                                            &{" "}
                                            <Link href="https://faq.whatsapp.com/933578044281252/" target="_blank" className="text-blue-600 hover:underline font-medium">
                                                How to comply
                                            </Link>.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {RESTRICTED_INDUSTRIES.map((industry, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm">
                                                    <div className="h-1.5 w-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                                                    <span className="text-gray-700">{industry}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>

                                {/* Requirements for setting up WhatsApp API */}
                                <Collapsible open={requirementsOpen} onOpenChange={setRequirementsOpen}>
                                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
                                        <h3 className="font-medium text-left">Requirements for setting up WhatsApp API</h3>
                                        {requirementsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-4 bg-white rounded-lg border p-4 space-y-6">
                                        {/* Valid Contact Number */}
                                        <div className="flex gap-4">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <Phone className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium mb-2">A valid contact number</h4>
                                                <ul className="space-y-2 text-sm text-gray-600">
                                                    <li className="flex gap-2">
                                                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                                        We recommend using a new number which isn&apos;t being used in the WhatsApp Personal / Business Apps.
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                                        If you want to use a number which is already being used in WhatsApp Personal/Business Apps, you must delete the WhatsApp account on that number first.
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                                        The number should be able to receive an OTP (via SMS / voice call).
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                                        If you already have a WhatsApp API number through another provider, please email us and we will help migrate your number.
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Facebook Business Manager */}
                                        <div className="flex gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <Facebook className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium mb-2">Access to your company&apos;s Facebook Business Manager</h4>
                                                <ul className="space-y-2 text-sm text-gray-600">
                                                    <li className="flex gap-2">
                                                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                                        Make sure you have admin permissions to the Facebook Business Manager account of your company.
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                                        If your company doesn&apos;t have a Business Manager Account yet, you&apos;ll get the option to create one in the next step.
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                                        While creating a new account, you will be required to provide a website URL or a social media profile page URL (like, a Facebook page).
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>
                        </motion.div>
                        {/* Trust Indicators */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 grid grid-cols-3 gap-3"
                        >
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>Trusted by 5000+ businesses</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Setup completed in under 10 minutes</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="h-4 w-4" />
                                <span>Official Meta Business Partner</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Sidebar - Connection Form */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-xl">Connect Your WhatsApp Business API Account</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Phone Number Input */}
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number *</Label>
                                            <PhoneInput
                                                country={'in'}
                                                value={phoneNumber}
                                                onChange={(phone, country: any) => {
                                                    setPhoneNumber(phone);
                                                    setCountryCode(country.dialCode);
                                                }}
                                                inputProps={{
                                                    name: 'phone',
                                                    required: true,
                                                    autoFocus: false
                                                }}
                                                containerClass="w-full"
                                                inputClass="w-full h-11 pl-12 pr-4 border border-slate-200 rounded-md focus:border-green-400 focus:ring-2 focus:ring-green-200 bg-white transition-all"
                                                buttonClass="border-slate-200 hover:bg-slate-50 rounded-l-md"
                                                dropdownClass="bg-white border-slate-200 shadow-lg"
                                                searchClass="bg-white border-slate-200"
                                                enableSearch={true}
                                                disableSearchIcon={false}
                                                searchPlaceholder="Search countries..."
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                This number will be used for your WhatsApp Business API account
                                            </p>
                                        </div>

                                        {/* Terms Agreement */}
                                        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                            <Checkbox
                                                id="terms"
                                                checked={hasReadTerms}
                                                onCheckedChange={(checked) => setHasReadTerms(checked === true)}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label
                                                    htmlFor="terms"
                                                    className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    I have read and understood the above information.
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    By proceeding, you agree to comply with WhatsApp&apos;s policies and Zaptick&apos;s terms of service.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Connection Status or Button */}
                                        <div className="space-y-4">
                                            {renderConnectionSection()}
                                        </div>

                                        {/* Security Notice */}
                                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                            <Shield className="h-4 w-4 text-green-600" />
                                            <p className="text-xs text-green-700">
                                                Your information is secured with enterprise-grade encryption and complies with global privacy regulations.
                                            </p>
                                        </div>

                                        {/* Skip for now option - Only show if not pending and no accounts */}
                                        {!pendingConnection && wabaAccounts.length === 0 && (
                                            <div className="text-center pt-4 border-t">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push('/dashboard')}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    Skip for now, I&apos;ll set this up later
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}