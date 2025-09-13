"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    MessageSquare,
    CheckCircle,
    AlertTriangle,
    ArrowLeft,
    FileText,
    Zap,
    Target,
    Clock,
    TrendingUp,
    Users,
    Sparkles,
    Copy,
    Eye,
    ThumbsUp,
    X,
    ChevronRight,
    Lightbulb,
    Shield,
    Globe2,
    Bell
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/header";

export default function TemplateBestPracticesPage() {
    const [activeTab, setActiveTab] = useState("categories");
    const [selectedExample, setSelectedExample] = useState<string | null>(null);

    const templateCategories = [
        {
            name: "Marketing",
            description: "Promotional messages, offers, and announcements",
            icon: TrendingUp,
            color: "purple",
            approvalTime: "24-48 hours",
            tips: [
                "Include clear call-to-actions",
                "Use compelling but honest language",
                "Add unsubscribe instructions",
                "Personalize with customer data"
            ],
            limitations: [
                "Limited to customers who opted in within 24 hours",
                "Cannot be used for customer service",
                "Requires explicit marketing consent"
            ]
        },
        {
            name: "Utility",
            description: "Transaction updates, account notifications, alerts",
            icon: Bell,
            color: "blue",
            approvalTime: "2-6 hours",
            tips: [
                "Keep language factual and clear",
                "Avoid promotional content",
                "Include relevant transaction details",
                "Use consistent formatting"
            ],
            limitations: [
                "No promotional content allowed",
                "Must relate to existing transaction",
                "Cannot include marketing messages"
            ]
        },
        {
            name: "Authentication",
            description: "One-time passwords, verification codes, security alerts",
            icon: Shield,
            color: "green",
            approvalTime: "1-2 hours",
            tips: [
                "Keep messages concise",
                "Include security best practices",
                "Add expiry time for codes",
                "Use standard OTP format"
            ],
            limitations: [
                "Only for authentication purposes",
                "Cannot include promotional content",
                "Must expire within reasonable time"
            ]
        }
    ];

    const templateExamples = {
        marketing: {
            good: {
                title: "Flash Sale - 50% Off Everything!",
                content: "Hi {{1}}, 🎉 Flash Sale Alert! Get 50% off everything in store today only. Use code: FLASH50. Shop now: {{2}} Reply STOP to opt out.",
                reasons: [
                    "Clear, compelling offer",
                    "Personalized with customer name",
                    "Includes opt-out instruction",
                    "Has clear call-to-action"
                ]
            },
            bad: {
                title: "Buy now!!!",
                content: "URGENT!!! Buy now or miss out forever!!! Click here immediately!!!",
                reasons: [
                    "Too many exclamation marks",
                    "Creates false urgency",
                    "No personalization",
                    "No opt-out option"
                ]
            }
        },
        utility: {
            good: {
                title: "Order Confirmation",
                content: "Hi {{1}}, your order #{{2}} has been confirmed. Total: ${{3}}. Estimated delivery: {{4}}. Track your order: {{5}}",
                reasons: [
                    "Clear transaction details",
                    "Includes all relevant information",
                    "Provides tracking option",
                    "Professional tone"
                ]
            },
            bad: {
                title: "Order Update + Special Offer",
                content: "Your order is confirmed! While you wait, check out our amazing deals and save more!",
                reasons: [
                    "Includes promotional content",
                    "Vague transaction details",
                    "Mixed utility with marketing",
                    "Not focused on transaction"
                ]
            }
        }
    };

    const optimizationTips = [
        {
            title: "Language & Tone",
            icon: MessageSquare,
            tips: [
                "Use simple, clear language",
                "Match your brand voice",
                "Avoid excessive punctuation",
                "Keep sentences short and readable"
            ]
        },
        {
            title: "Personalization",
            icon: Users,
            tips: [
                "Include customer name variables",
                "Reference past purchases",
                "Use location-based content",
                "Segment by customer preferences"
            ]
        },
        {
            title: "Call-to-Actions",
            icon: Target,
            tips: [
                "Make CTAs clear and specific",
                "Use action-oriented words",
                "Include urgency when appropriate",
                "Provide easy next steps"
            ]
        },
        {
            title: "Media & Formatting",
            icon: Eye,
            tips: [
                "Use high-quality images",
                "Optimize file sizes",
                "Include alt text for accessibility",
                "Test on different devices"
            ]
        }
    ];

    return (
        <div className="">
            <Header />
            <div className="p-8 space-y-3">
                {/* Header */}
                <div className="space-y-4 p-3">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                                <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent wark:from-white wark:to-gray-300">
                                    Template Best Practices
                                </h1>
                                <p className="text-gray-600 wark:text-gray-300">
                                    Learn how to create templates that get approved quickly and perform exceptionally well.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 wark:from-muted/40 wark:to-green-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 wark:bg-green-900/30">
                                    <Zap className="h-5 w-5 text-green-600 wark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">2x Faster</p>
                                    <p className="text-xs text-muted-foreground">Approval time with best practices</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 wark:from-muted/40 wark:to-blue-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 wark:bg-blue-900/30">
                                    <Target className="h-5 w-5 text-blue-600 wark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">95%+</p>
                                    <p className="text-xs text-muted-foreground">Approval rate for compliant templates</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-purple-50/30 wark:from-muted/40 wark:to-purple-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 wark:bg-purple-900/30">
                                    <ThumbsUp className="h-5 w-5 text-purple-600 wark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">40%</p>
                                    <p className="text-xs text-muted-foreground">Higher engagement rates</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-amber-50/30 wark:from-muted/40 wark:to-amber-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 wark:bg-amber-900/30">
                                    <Clock className="h-5 w-5 text-amber-600 wark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">24h</p>
                                    <p className="text-xs text-muted-foreground">Average approval time</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full max-w-lg grid-cols-3 bg-gray-100 wark:bg-gray-800 p-1 rounded-xl">
                        <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Categories
                        </TabsTrigger>
                        <TabsTrigger value="examples" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Examples
                        </TabsTrigger>
                        <TabsTrigger value="optimization" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Optimization
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="categories" className="space-y-6">
                        <div className="space-y-6">
                            {templateCategories.map((category, index) => {
                                const Icon = category.icon;
                                return (
                                    <Card key={index} className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-gray-50/30 hover:shadow-lg transition-all duration-300 wark:from-muted/40 wark:to-gray-800/30">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg ${
                                                        category.color === 'purple' ? 'from-purple-500 to-purple-600' :
                                                        category.color === 'blue' ? 'from-blue-500 to-blue-600' :
                                                        'from-green-500 to-green-600'
                                                    }`}>
                                                        <Icon className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-xl">{category.name}</CardTitle>
                                                        <p className="text-sm text-muted-foreground">{category.description}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 wark:bg-green-900/30">
                                                    {category.approvalTime}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div>
                                                    <h4 className="font-semibold text-green-700 wark:text-green-400 mb-3 flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4" />
                                                        Best Practices
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {category.tips.map((tip, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                                                <span>{tip}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-amber-700 wark:text-amber-400 mb-3 flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        Limitations
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {category.limitations.map((limitation, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                                                                <span>{limitation}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="examples" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Marketing Examples */}
                            <Card className="rounded-xl border bg-gradient-to-br from-white to-gray-50/30 wark:from-muted/40 wark:to-gray-800/30">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                        Marketing Templates
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Good Example */}
                                    <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50/50 wark:bg-green-900/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="font-medium text-green-800 wark:text-green-300">Good Example</span>
                                        </div>
                                        <div className="bg-white wark:bg-gray-800 p-3 rounded border mb-2">
                                            <p className="text-sm font-mono">{templateExamples.marketing.good.content}</p>
                                        </div>
                                        <ul className="text-xs space-y-1">
                                            {templateExamples.marketing.good.reasons.map((reason, i) => (
                                                <li key={i} className="flex items-center gap-1 text-green-700 wark:text-green-400">
                                                    <CheckCircle className="h-3 w-3" />
                                                    {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Bad Example */}
                                    <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50/50 wark:bg-red-900/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <X className="h-4 w-4 text-red-600" />
                                            <span className="font-medium text-red-800 wark:text-red-300">Bad Example</span>
                                        </div>
                                        <div className="bg-white wark:bg-gray-800 p-3 rounded border mb-2">
                                            <p className="text-sm font-mono">{templateExamples.marketing.bad.content}</p>
                                        </div>
                                        <ul className="text-xs space-y-1">
                                            {templateExamples.marketing.bad.reasons.map((reason, i) => (
                                                <li key={i} className="flex items-center gap-1 text-red-700 wark:text-red-400">
                                                    <X className="h-3 w-3" />
                                                    {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Utility Examples */}
                            <Card className="rounded-xl border bg-gradient-to-br from-white to-gray-50/30 wark:from-muted/40 wark:to-gray-800/30">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-blue-600" />
                                        Utility Templates
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Good Example */}
                                    <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50/50 wark:bg-green-900/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="font-medium text-green-800 wark:text-green-300">Good Example</span>
                                        </div>
                                        <div className="bg-white wark:bg-gray-800 p-3 rounded border mb-2">
                                            <p className="text-sm font-mono">{templateExamples.utility.good.content}</p>
                                        </div>
                                        <ul className="text-xs space-y-1">
                                            {templateExamples.utility.good.reasons.map((reason, i) => (
                                                <li key={i} className="flex items-center gap-1 text-green-700 wark:text-green-400">
                                                    <CheckCircle className="h-3 w-3" />
                                                    {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Bad Example */}
                                    <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50/50 wark:bg-red-900/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <X className="h-4 w-4 text-red-600" />
                                            <span className="font-medium text-red-800 wark:text-red-300">Bad Example</span>
                                        </div>
                                        <div className="bg-white wark:bg-gray-800 p-3 rounded border mb-2">
                                            <p className="text-sm font-mono">{templateExamples.utility.bad.content}</p>
                                        </div>
                                        <ul className="text-xs space-y-1">
                                            {templateExamples.utility.bad.reasons.map((reason, i) => (
                                                <li key={i} className="flex items-center gap-1 text-red-700 wark:text-red-400">
                                                    <X className="h-3 w-3" />
                                                    {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="optimization" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {optimizationTips.map((tip, index) => {
                                const Icon = tip.icon;
                                return (
                                    <Card key={index} className="rounded-xl border bg-gradient-to-br from-white to-gray-50/30 wark:from-muted/40 wark:to-gray-800/30">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Icon className="h-5 w-5 text-primary" />
                                                {tip.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3">
                                                {tip.tips.map((tipItem, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                                                            <span className="text-xs font-medium text-primary">{i + 1}</span>
                                                        </div>
                                                        <span className="text-sm">{tipItem}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Pro Tips */}
                        <Alert className="border-blue-200 bg-blue-50 wark:bg-blue-900/20">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800 wark:text-blue-200">
                                <strong>Pro Tip:</strong> Test your templates with a small audience before full deployment. 
                                Monitor engagement rates and adjust your approach based on customer feedback and analytics.
                            </AlertDescription>
                        </Alert>
                    </TabsContent>
                </Tabs>

                {/* Resources */}
                <Card className="rounded-xl border bg-gradient-to-br from-white to-blue-50/30 wark:from-muted/40 wark:to-blue-900/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Template Resources
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Helpful resources for creating effective WhatsApp Business templates
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Button variant="outline" className="justify-start gap-2 h-auto p-4" asChild>
                                <Link href="/templates">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 wark:bg-green-900/30">
                                        <Sparkles className="h-4 w-4 text-green-600 wark:text-green-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">Create New Template</p>
                                        <p className="text-xs text-muted-foreground">Start building your template</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 ml-auto" />
                                </Link>
                            </Button>

                            <Button variant="outline" className="justify-start gap-2 h-auto p-4" asChild>
                                <a href="https://developers.facebook.com/docs/whatsapp/message-templates" target="_blank" rel="noopener noreferrer">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 wark:bg-blue-900/30">
                                        <Globe2 className="h-4 w-4 text-blue-600 wark:text-blue-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">Official Documentation</p>
                                        <p className="text-xs text-muted-foreground">WhatsApp template guidelines</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 ml-auto" />
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}