"use client";

import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ShieldCheck,
    CheckCircle,
    AlertTriangle,
    ExternalLink,
    ArrowLeft,
    FileText,
    Users,
    MessageSquare,
    Clock,
    Zap,
    Globe,
    Lock,
    TrendingUp,
    ChevronRight,
    Info,
    BookOpen,
    Target
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/layout/header";

export default function WhatsAppPoliciesPage() {
    const [activeTab, setActiveTab] = useState("overview");

    const policyCategories = [
        {
            title: "Commerce Policy",
            description: "Guidelines for business transactions and sales",
            icon: TrendingUp,
            color: "green",
            items: [
                "Clearly describe your products and services",
                "Provide accurate pricing and availability",
                "Honor your return and refund policies",
                "Avoid misleading promotional content"
            ]
        },
        {
            title: "Messaging Policy",
            description: "Rules for sending messages and content",
            icon: MessageSquare,
            color: "blue",
            items: [
                "Send messages only to opted-in users",
                "Provide clear opt-out mechanisms",
                "Respect messaging frequency limits",
                "Use appropriate message categories"
            ]
        },
        {
            title: "Content Guidelines",
            description: "Standards for message content and media",
            icon: FileText,
            color: "purple",
            items: [
                "Avoid spam and unsolicited content",
                "No adult content or gambling",
                "Respect intellectual property rights",
                "Use high-quality, relevant media"
            ]
        }
    ];

    const bestPractices = [
        {
            title: "Template Approval Tips",
            description: "Increase your template approval rates",
            tips: [
                "Use clear, concise language",
                "Include relevant placeholders",
                "Avoid promotional language in utility templates",
                "Test templates before submission"
            ]
        },
        {
            title: "Message Delivery",
            description: "Optimize your message delivery rates",
            tips: [
                "Maintain good sender reputation",
                "Send messages at appropriate times",
                "Monitor and respond to user feedback",
                "Keep contact lists clean and updated"
            ]
        },
        {
            title: "Customer Experience",
            description: "Enhance user engagement and satisfaction",
            tips: [
                "Personalize messages when possible",
                "Provide quick customer support",
                "Use interactive elements effectively",
                "Respect user preferences and privacy"
            ]
        }
    ];

    return (
        <div className="  ">
            <Header />
<div className="p-8 space-y-3">
            {/* Header */}
            <div className="space-y-4 p-3 ">

                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent wark::from-white wark::to-gray-300">
                                WhatsApp Business Policy Compliance
                            </h1>
                            <p className="text-gray-600 wark::text-gray-300">
                                Essential guidelines to ensure your messages comply with WhatsApp&apos;s policies and maintain high delivery rates.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 wark::from-muted/40 wark::to-green-900/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 wark::bg-green-900/30">
                                <CheckCircle className="h-5 w-5 text-green-600 wark::text-green-400" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold">95%+</p>
                                <p className="text-xs text-muted-foreground">Compliant businesses see higher delivery rates</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 wark::from-muted/40 wark::to-blue-900/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 wark::bg-blue-900/30">
                                <Zap className="h-5 w-5 text-blue-600 wark::text-blue-400" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold">24h</p>
                                <p className="text-xs text-muted-foreground">Faster template approval with compliance</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-purple-50/30 wark::from-muted/40 wark::to-purple-900/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 wark::bg-purple-900/30">
                                <Users className="h-5 w-5 text-purple-600 wark::text-purple-400" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold">3x</p>
                                <p className="text-xs text-muted-foreground">Better customer engagement rates</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-amber-50/30 wark::from-muted/40 wark::to-amber-900/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 wark::bg-amber-900/30">
                                <Globe className="h-5 w-5 text-amber-600 wark::text-amber-400" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold">Global</p>
                                <p className="text-xs text-muted-foreground">Policies apply worldwide</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <TabsList className="grid w-full max-w-lg grid-cols-3 bg-gray-100 wark::bg-gray-800 p-1 rounded-xl">
                        <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="guidelines" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Guidelines
                        </TabsTrigger>
                        <TabsTrigger value="checklist" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Checklist
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-6">
                    {/* Policy Categories */}
                    <div className="grid gap-6 md:grid-cols-3">
                        {policyCategories.map((category, index) => {
                            const Icon = category.icon;
                            return (
                                <Card key={index} className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-gray-50/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 wark::from-muted/40 wark::to-gray-800/30">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300 ${category.color === 'green' ? 'from-green-500 to-green-600' :
                                                category.color === 'blue' ? 'from-blue-500 to-blue-600' :
                                                    'from-purple-500 to-purple-600'
                                                }`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{category.title}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{category.description}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {category.items.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <div className={`absolute -right-8 -top-8 h-16 w-16 rounded-full transition-all duration-300 group-hover:scale-110 ${category.color === 'green' ? 'bg-green-500/10' :
                                        category.color === 'blue' ? 'bg-blue-500/10' :
                                            'bg-purple-500/10'
                                        }`} />
                                </Card>
                            );
                        })}
                    </div>

                    {/* Important Notice */}
                    <Alert className="border-amber-200 bg-amber-50 wark::bg-amber-900/20">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 wark::text-amber-200">
                            <strong>Important:</strong> Violating WhatsApp Business policies can result in account restrictions,
                            reduced message delivery rates, or complete account suspension. Always review the latest policies
                            before launching campaigns.
                        </AlertDescription>
                    </Alert>
                </TabsContent>

                <TabsContent value="guidelines" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {bestPractices.map((practice, index) => (
                            <Card key={index} className="rounded-xl border bg-gradient-to-br from-white to-gray-50/30 wark::from-muted/40 wark::to-gray-800/30">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-primary" />
                                        {practice.title}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">{practice.description}</p>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {practice.tips.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                                                    <span className="text-xs font-medium text-primary">{i + 1}</span>
                                                </div>
                                                <span className="text-sm">{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="checklist" className="space-y-6">
                    <Card className="rounded-xl border bg-gradient-to-br from-white to-gray-50/30 wark::from-muted/40 wark::to-gray-800/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                Pre-Launch Compliance Checklist
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Complete this checklist before launching your WhatsApp Business campaigns
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {[
                                {
                                    category: "Business Setup",
                                    items: [
                                        "Business profile is complete with accurate information",
                                        "Business verification is completed",
                                        "Display name matches your business name",
                                        "Profile photo represents your brand appropriately"
                                    ]
                                },
                                {
                                    category: "Template Compliance",
                                    items: [
                                        "Templates use appropriate categories (Marketing, Utility, Authentication)",
                                        "No promotional content in utility templates",
                                        "Clear call-to-actions in marketing templates",
                                        "Placeholders are relevant and necessary"
                                    ]
                                },
                                {
                                    category: "Contact Management",
                                    items: [
                                        "All contacts have explicitly opted in",
                                        "Opt-out mechanism is clearly provided",
                                        "Contact data is accurate and up-to-date",
                                        "Segmentation follows user preferences"
                                    ]
                                },
                                {
                                    category: "Content Guidelines",
                                    items: [
                                        "No spam or misleading content",
                                        "Media files are high quality and relevant",
                                        "Messaging frequency is reasonable",
                                        "Customer support is readily available"
                                    ]
                                }
                            ].map((section, index) => (
                                <div key={index} className="space-y-3">
                                    <h3 className="font-semibold text-lg">{section.category}</h3>
                                    <div className="grid gap-2">
                                        {section.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                                                <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-green-500 bg-green-50 wark::bg-green-900/30">
                                                    <CheckCircle className="h-3 w-3 text-green-600 wark::text-green-400" />
                                                </div>
                                                <span className="text-sm">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Resources */}
            <Card className="rounded-xl border bg-gradient-to-br from-white to-blue-50/30 wark::from-muted/40 wark::to-blue-900/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ExternalLink className="h-5 w-5 text-blue-600" />
                        Official Resources
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Stay updated with the latest WhatsApp Business policies and guidelines
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Button variant="outline" className="justify-start gap-2 h-auto p-4" asChild>
                            <a href="https://www.whatsapp.com/legal/business-policy/" target="_blank" rel="noopener noreferrer">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 wark::bg-green-900/30">
                                    <Globe className="h-4 w-4 text-green-600 wark::text-green-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium">WhatsApp Business Policy</p>
                                    <p className="text-xs text-muted-foreground">Official policy documentation</p>
                                </div>
                                <ChevronRight className="h-4 w-4 ml-auto" />
                            </a>
                        </Button>

                        <Button variant="outline" className="justify-start gap-2 h-auto p-4" asChild>
                            <a href="https://developers.facebook.com/docs/whatsapp/overview/getting-started" target="_blank" rel="noopener noreferrer">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 wark::bg-blue-900/30">
                                    <BookOpen className="h-4 w-4 text-blue-600 wark::text-blue-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium">Developer Documentation</p>
                                    <p className="text-xs text-muted-foreground">Technical guidelines and best practices</p>
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