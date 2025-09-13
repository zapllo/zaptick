"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Sparkles,
    CheckCircle,
    AlertTriangle,
    ArrowLeft,
    MessageSquare,
    Users,
    TrendingUp,
    Clock,
    Target,
    Heart,
    Zap,
    BarChart3,
    Calendar,
    Globe2,
    ChevronRight,
    Lightbulb,
    Star,
    UserCheck,
    MessageCircle,
    Send,
    Timer,
    ThumbsUp,
    Eye,
    Repeat
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/layout/header";

export default function IncreaseEngagementPage() {
    const [activeTab, setActiveTab] = useState("strategies");

    const engagementStrategies = [
        {
            title: "Personalization",
            description: "Tailor messages to individual customer preferences",
            icon: Users,
            color: "blue",
            impact: "65% higher response rates",
            tactics: [
                "Use customer names and purchase history",
                "Segment audiences by behavior patterns",
                "Send location-based relevant content",
                "Reference past interactions naturally"
            ]
        },
        {
            title: "Timing Optimization",
            description: "Send messages when customers are most likely to engage",
            icon: Clock,
            color: "green",
            impact: "45% increase in open rates",
            tactics: [
                "Analyze customer activity patterns",
                "Respect time zones and local business hours",
                "Test different send times for segments",
                "Avoid peak busy periods for your audience"
            ]
        },
        {
            title: "Interactive Content",
            description: "Use buttons, quick replies, and rich media",
            icon: MessageCircle,
            color: "purple",
            impact: "80% higher engagement",
            tactics: [
                "Add quick reply buttons for common responses",
                "Use carousel messages for product showcases",
                "Include interactive polls and surveys",
                "Provide clear call-to-action buttons"
            ]
        }
    ];

    const contentTypes = [
        {
            type: "Educational Content",
            description: "Share valuable knowledge and insights",
            examples: [
                "How-to guides and tutorials",
                "Industry tips and best practices",
                "Product usage instructions",
                "FAQ responses and explanations"
            ],
            engagementRate: "72%"
        },
        {
            type: "Behind the Scenes",
            description: "Show your company culture and processes",
            examples: [
                "Team introductions and stories",
                "Product development process",
                "Company events and milestones",
                "Customer success stories"
            ],
            engagementRate: "68%"
        },
        {
            type: "User-Generated Content",
            description: "Feature content created by your customers",
            examples: [
                "Customer reviews and testimonials",
                "Product photos from customers",
                "Success stories and case studies",
                "Community challenges and contests"
            ],
            engagementRate: "85%"
        },
        {
            type: "Exclusive Offers",
            description: "Provide special deals for WhatsApp subscribers",
            examples: [
                "WhatsApp-only discount codes",
                "Early access to new products",
                "VIP customer events invitations",
                "Loyalty program rewards"
            ],
            engagementRate: "91%"
        }
    ];

    const messagingTactics = [
        {
            title: "Response Speed",
            icon: Zap,
            description: "Quick responses boost satisfaction",
            metrics: [
                { label: "Target Response Time", value: "< 5 minutes", color: "green" },
                { label: "Customer Satisfaction", value: "94%", color: "blue" },
                { label: "Repeat Engagement", value: "+60%", color: "purple" }
            ]
        },
        {
            title: "Message Frequency",
            icon: Calendar,
            description: "Find the sweet spot for your audience",
            metrics: [
                { label: "Optimal Frequency", value: "2-3 per week", color: "green" },
                { label: "Unsubscribe Rate", value: "< 2%", color: "blue" },
                { label: "Engagement Rate", value: "78%", color: "purple" }
            ]
        },
        {
            title: "Content Quality",
            icon: Star,
            description: "High-value content drives engagement",
            metrics: [
                { label: "Value-First Approach", value: "90% helpful", color: "green" },
                { label: "Read Rate", value: "86%", color: "blue" },
                { label: "Share Rate", value: "23%", color: "purple" }
            ]
        }
    ];

    const automationStrategies = [
        {
            title: "Welcome Sequences",
            description: "Onboard new customers effectively",
            steps: [
                "Send immediate welcome message",
                "Introduce your brand and values",
                "Share helpful getting-started resources",
                "Set expectations for future communications"
            ]
        },
        {
            title: "Abandoned Cart Recovery",
            description: "Re-engage customers who didn't complete purchases",
            steps: [
                "Send gentle reminder after 1 hour",
                "Offer assistance or answer questions",
                "Provide limited-time incentive after 24 hours",
                "Share customer reviews and social proof"
            ]
        },
        {
            title: "Re-engagement Campaigns",
            description: "Win back inactive customers",
            steps: [
                "Identify inactive customers (30+ days)",
                "Send 'We miss you' personalized message",
                "Offer exclusive comeback discount",
                "Share new products or features they might like"
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
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent wark:from-white wark:to-gray-300">
                                    Increase Customer Engagement
                                </h1>
                                <p className="text-gray-600 wark:text-gray-300">
                                    Strategies and tactics to boost customer interaction and build lasting relationships through WhatsApp.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-purple-50/30 wark:from-muted/40 wark:to-purple-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 wark:bg-purple-900/30">
                                    <TrendingUp className="h-5 w-5 text-purple-600 wark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">3.5x</p>
                                    <p className="text-xs text-muted-foreground">Higher engagement with personalization</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 wark:from-muted/40 wark:to-green-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 wark:bg-green-900/30">
                                    <MessageSquare className="h-5 w-5 text-green-600 wark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">85%</p>
                                    <p className="text-xs text-muted-foreground">Response rate with interactive content</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 wark:from-muted/40 wark:to-blue-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 wark:bg-blue-900/30">
                                    <Clock className="h-5 w-5 text-blue-600 wark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">5 min</p>
                                    <p className="text-xs text-muted-foreground">Optimal response time for engagement</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-amber-50/30 wark:from-muted/40 wark:to-amber-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 wark:bg-amber-900/30">
                                    <Heart className="h-5 w-5 text-amber-600 wark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">92%</p>
                                    <p className="text-xs text-muted-foreground">Customer satisfaction with quick support</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full max-w-lg grid-cols-3 bg-gray-100 wark:bg-gray-800 p-1 rounded-xl">
                        <TabsTrigger value="strategies" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Strategies
                        </TabsTrigger>
                        <TabsTrigger value="content" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Content
                        </TabsTrigger>
                        <TabsTrigger value="automation" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Automation
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="strategies" className="space-y-6">
                        {/* Core Strategies */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            {engagementStrategies.map((strategy, index) => {
                                const Icon = strategy.icon;
                                return (
                                    <Card key={index} className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-gray-50/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 wark:from-muted/40 wark:to-gray-800/30">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                                                    strategy.color === 'blue' ? 'from-blue-500 to-blue-600' :
                                                    strategy.color === 'green' ? 'from-green-500 to-green-600' :
                                                    'from-purple-500 to-purple-600'
                                                }`}>
                                                    <Icon className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{strategy.title}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">{strategy.description}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="w-fit bg-green-50 text-green-700 border-green-200 wark:bg-green-900/30">
                                                {strategy.impact}
                                            </Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {strategy.tactics.map((tactic, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>{tactic}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                        <div className={`absolute -right-8 -top-8 h-16 w-16 rounded-full transition-all duration-300 group-hover:scale-110 ${
                                            strategy.color === 'blue' ? 'bg-blue-500/10' :
                                            strategy.color === 'green' ? 'bg-green-500/10' :
                                            'bg-purple-500/10'
                                        }`} />
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Messaging Tactics */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Key Messaging Tactics</h3>
                            <div className="grid gap-4 md:grid-cols-3">
                                {messagingTactics.map((tactic, index) => {
                                    const Icon = tactic.icon;
                                    return (
                                        <Card key={index} className="rounded-xl border bg-gradient-to-br from-white to-gray-50/30 wark:from-muted/40 wark:to-gray-800/30">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <Icon className="h-5 w-5 text-primary" />
                                                    {tactic.title}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground">{tactic.description}</p>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {tactic.metrics.map((metric, i) => (
                                                        <div key={i} className="flex items-center justify-between">
                                                            <span className="text-sm text-muted-foreground">{metric.label}</span>
                                                            <Badge variant="outline" className={`${
                                                                metric.color === 'green' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                metric.color === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                'bg-purple-50 text-purple-700 border-purple-200'
                                                            } wark:bg-opacity-20`}>
                                                                {metric.value}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Important Notice */}
                        <Alert className="border-purple-200 bg-purple-50 wark:bg-purple-900/20">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            <AlertDescription className="text-purple-800 wark:text-purple-200">
                                <strong>Pro Tip:</strong> Focus on building genuine relationships rather than just pushing products. 
                                Customers are 4x more likely to engage with brands that provide value and show genuine interest in their needs.
                            </AlertDescription>
                        </Alert>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {contentTypes.map((content, index) => (
                                <Card key={index} className="rounded-xl border bg-gradient-to-br from-white to-gray-50/30 wark:from-muted/40 wark:to-gray-800/30">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{content.type}</CardTitle>
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 wark:bg-green-900/30">
                                                {content.engagementRate} avg engagement
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{content.description}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">Examples:</h4>
                                            <ul className="space-y-2">
                                                {content.examples.map((example, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                                        <span>{example}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Content Calendar Tips */}
                        <Card className="rounded-xl border bg-gradient-to-br from-white to-blue-50/30 wark:from-muted/40 wark:to-blue-900/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    Content Calendar Best Practices
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Plan your content strategy for consistent engagement
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Weekly Planning</h4>
                                        <ul className="text-sm space-y-1 text-muted-foreground">
                                            <li>• Monday: Educational content</li>
                                            <li>• Wednesday: Behind-the-scenes</li>
                                            <li>• Friday: Customer features</li>
                                            <li>• Sunday: Weekly wrap-up</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Content Mix</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Educational (40%)</span>
                                                <Progress value={40} className="w-16 h-2" />
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Promotional (30%)</span>
                                                <Progress value={30} className="w-16 h-2" />
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Entertainment (30%)</span>
                                                <Progress value={30} className="w-16 h-2" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Optimal Times</h4>
                                        <ul className="text-sm space-y-1 text-muted-foreground">
                                            <li>• Morning: 8-10 AM</li>
                                            <li>• Lunch: 12-1 PM</li>
                                            <li>• Evening: 6-8 PM</li>
                                            <li>• Avoid: Late night hours</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="automation" className="space-y-6">
                        <div className="space-y-6">
                            {automationStrategies.map((automation, index) => (
                                <Card key={index} className="rounded-xl border bg-gradient-to-br from-white to-gray-50/30 wark:from-muted/40 wark:to-gray-800/30">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{automation.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{automation.description}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {automation.steps.map((step, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                                                        <span className="text-xs font-medium text-primary">{i + 1}</span>
                                                    </div>
                                                    <span className="text-sm">{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Automation Tools */}
                        <Card className="rounded-xl border bg-gradient-to-br from-white to-green-50/30 wark:from-muted/40 wark:to-green-900/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-green-600" />
                                    Automation Features in Zaptick
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Leverage built-in automation tools to scale your engagement
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <h4 className="font-medium">Available Automations</h4>
                                        <ul className="space-y-2">
                                            {[
                                                "Drip campaigns for new subscribers",
                                                "Event-triggered messages",
                                                "Birthday and anniversary wishes",
                                                "Cart abandonment sequences"
                                            ].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-medium">Smart Features</h4>
                                        <ul className="space-y-2">
                                            {[
                                                "AI-powered send time optimization",
                                                "Automatic customer segmentation",
                                                "Response rate tracking",
                                                "A/B testing for templates"
                                            ].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm">
                                                    <Sparkles className="h-4 w-4 text-purple-500" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Resources */}
                <Card className="rounded-xl border bg-gradient-to-br from-white to-blue-50/30 wark:from-muted/40 wark:to-blue-900/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            Engagement Resources
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Tools and resources to help you boost customer engagement
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Button variant="outline" className="justify-start gap-2 h-auto p-4" asChild>
                                <Link href="/campaigns/create">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 wark:bg-purple-900/30">
                                        <Send className="h-4 w-4 text-purple-600 wark:text-purple-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">Create Engagement Campaign</p>
                                        <p className="text-xs text-muted-foreground">Start building your campaign</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 ml-auto" />
                                </Link>
                            </Button>

                            <Button variant="outline" className="justify-start gap-2 h-auto p-4" asChild>
                                <Link href="/dashboard">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 wark:bg-green-900/30">
                                        <BarChart3 className="h-4 w-4 text-green-600 wark:text-green-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">View Analytics</p>
                                        <p className="text-xs text-muted-foreground">Track your engagement metrics</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 ml-auto" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}