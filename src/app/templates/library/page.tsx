"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Search,
    Sparkles,
    Copy,
    Eye,
    Filter,
    Loader2,
    ArrowLeft,
    Plus,
    Wand2,
    FileText,
    MessageSquare,
    TrendingUp,
    Settings,
    ShieldCheck,
    ChevronRight,
    Star,
    Clock,
    Users,
    Target,
    Zap,
    BookOpen,
    Send,
    ExternalLink,
    Phone,
    CheckCircle,
    CreditCard,
    ArrowRight,
    AlertCircle
} from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LibraryTemplate {
    id: string;
    name: string;
    title: string;
    description: string;
    category: string;
    language: string;
    components: any[];
    variables: any[];
    buttons?: any[];
    tags: string[];
    useCase: string;
    authSettings?: any;
    source?: string;
    generatedAt?: string;
}

export default function TemplatesLibraryPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [templates, setTemplates] = useState<LibraryTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<LibraryTemplate | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [generatingAi, setGeneratingAi] = useState(false);
    const [aiGeneratedTemplate, setAiGeneratedTemplate] = useState<LibraryTemplate | null>(null);

    const [aiCredits, setAiCredits] = useState(0);
    const [showBuyCreditsDialog, setShowBuyCreditsDialog] = useState(false);
    const [creditsAmount, setCreditsAmount] = useState(50);
    const [isPurchasing, setIsPurchasing] = useState(false);


 const purchaseAiCredits = async () => {
        if (creditsAmount < 10) {
            toast.error('Please select at least 10 credits');
            return;
        }

        const costPerCredit = 2;
        const baseAmount = creditsAmount * costPerCredit;
        const { gst, total } = calculateGST(baseAmount);

        try {
            setIsPurchasing(true);

            // Create order on server
            const orderResponse = await fetch("/api/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: total * 100, // Razorpay expects amount in paise
                    currency: "INR",
                    receipt: `ai-credits-${Date.now()}`,
                    notes: {
                        purpose: "AI Credits Purchase",
                        creditsAmount: creditsAmount,
                        baseAmount: baseAmount,
                        gst: gst,
                        totalAmount: total,
                    },
                }),
            });

            const orderData = await orderResponse.json();

            if (!orderData.orderId) {
                throw new Error(orderData.error || "Failed to create payment order");
            }

            // Close the dialog before opening Razorpay
            setShowBuyCreditsDialog(false);

            // Initialize Razorpay payment
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: total * 100,
                currency: "INR",
                name: "Zapllo AI - Credits Purchase",
                description: `${creditsAmount} AI Credits (including 18% GST)`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        // Verify payment with your server
                        const verifyResponse = await fetch("/api/verify-payment", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {
                            // If verification successful, add AI credits
                            const creditsResponse = await fetch("/api/wallet", {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    creditsAmount,
                                    paymentId: response.razorpay_payment_id,
                                    totalPaid: total,
                                    gst: gst,
                                }),
                            });

                            const creditsData = await creditsResponse.json();

                            if (creditsData.success) {
                                setAiCredits(creditsData.newAiCredits);
                                toast.success(`Successfully purchased ${creditsAmount} AI credits!`);
                            } else {
                                throw new Error(creditsData.error || "Failed to add AI credits");
                            }
                        } else {
                            throw new Error(verifyData.error || "Payment verification failed");
                        }
                    } catch (error) {
                        console.error("Payment process error:", error);
                        toast.error(error instanceof Error ? error.message : "Payment processing failed");
                        // Reopen the dialog on error
                        setShowBuyCreditsDialog(true);
                    } finally {
                        setIsPurchasing(false);
                    }
                },
                prefill: {
                    name: "User",
                    email: "user@example.com",
                    contact: "",
                },
                theme: {
                    color: "#9333ea", // Purple color for AI credits
                },
                modal: {
                    ondismiss: function () {
                        setIsPurchasing(false);
                        // Reopen the dialog when Razorpay modal is dismissed
                        setTimeout(() => {
                            setShowBuyCreditsDialog(true);
                        }, 100);
                    },
                    backdrop_close: true,
                    escape: true,
                    confirm_close: true
                }
            };

            // Add a small delay to ensure dialog is closed
            setTimeout(() => {
                const razorpay = new (window as any).Razorpay(options);
                razorpay.open();
            }, 200);

        } catch (error) {
            console.error("Error initiating credits purchase:", error);
            toast.error(error instanceof Error ? error.message : "Failed to initiate payment");
            setIsPurchasing(false);
            setShowBuyCreditsDialog(true);
        }
    };

    // Helper function to calculate GST
    const calculateGST = (amount: number) => {
        const gst = Math.round(amount * 0.18 * 100) / 100; // 18% GST
        const total = amount + gst;
        return { gst, total };
    };



    useEffect(() => {
        fetchLibraryTemplates();
    }, [selectedCategory]);

    const fetchLibraryTemplates = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedCategory !== 'all') {
                params.set('category', selectedCategory);
            }

            const response = await fetch(`/api/templates/library?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setTemplates(data.templates || []);
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Failed to fetch library templates:', error);
            toast.error('Failed to load template library');
        } finally {
            setLoading(false);
        }
    };

    const generateAiTemplate = async () => {
        if (!aiPrompt.trim()) {
            toast.error('Please describe what kind of template you need');
            return;
        }

        try {
            setGeneratingAi(true);
            const response = await fetch('/api/templates/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: aiPrompt })
            });

            const data = await response.json();

            if (response.ok) {
                setAiGeneratedTemplate(data.template);
                toast.success('Template generated successfully!');
            } else {
                toast.error(data.error || 'Failed to generate template');
            }
        } catch (error) {
            console.error('AI generation error:', error);
            toast.error('Failed to generate template');
        } finally {
            setGeneratingAi(false);
        }
    };

    const applyTemplate = (template: LibraryTemplate) => {
        // Navigate to create template page with pre-filled data
        const templateData = encodeURIComponent(JSON.stringify(template));
        router.push(`/templates/create?library=${templateData}`);
    };

    const filteredTemplates = useMemo(() => {
        return templates.filter(template => {
            const matchesSearch = !searchQuery ||
                template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesSearch;
        });
    }, [templates, searchQuery]);

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'marketing':
                return <TrendingUp className="h-4 w-4 text-blue-600" />;
            case 'utility':
                return <Settings className="h-4 w-4 text-green-600" />;
            case 'authentication':
                return <ShieldCheck className="h-4 w-4 text-purple-600" />;
            default:
                return <FileText className="h-4 w-4 text-gray-600" />;
        }
    };

    const formatTemplateContent = (components: any[]) => {
        const bodyComponent = components.find(c => c.type === 'BODY');
        if (!bodyComponent) return 'No body content';

        let content = bodyComponent.text;
        // Replace variables with placeholder text
        content = content.replace(/\{\{(\d+)\}\}/g, (match: string, num: string) => {
            return `[Variable ${num}]`;
        });

        return content.length > 150 ? content.substring(0, 150) + '...' : content;
    };

    const categoryStats = useMemo(() => {
        const stats = {
            all: templates.length,
            marketing: templates.filter(t => t.category.toLowerCase() === 'marketing').length,
            utility: templates.filter(t => t.category.toLowerCase() === 'utility').length,
            authentication: templates.filter(t => t.category.toLowerCase() === 'authentication').length,
        };
        return stats;
    }, [templates]);

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
                <div className="mx-auto p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    Template Library
                                </h1>
                                <p className="text-muted-foreground">
                                    Ready-to-use templates and AI-generated content for your business
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => setIsAiDialogOpen(true)}
                            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            <Wand2 className="h-4 w-4" />
                            Generate with AI
                        </Button>
                    </div>

                    <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-8">
                        {/* Category Tabs */}
                        <TabsList className="h-12 p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200/50 w-fit">
                            <TabsTrigger
                                value="all"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 flex items-center gap-2"
                            >
                                <BookOpen className="h-4 w-4" />
                                All Templates
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-slate-200/80 text-slate-600 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                                    {categoryStats.all}
                                </Badge>
                            </TabsTrigger>

                            <TabsTrigger
                                value="marketing"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 flex items-center gap-2"
                            >
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                Marketing
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-slate-200/80 text-slate-600">
                                    {categoryStats.marketing}
                                </Badge>
                            </TabsTrigger>

                            <TabsTrigger
                                value="utility"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 flex items-center gap-2"
                            >
                                <Settings className="h-4 w-4 text-green-600" />
                                Utility
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-slate-200/80 text-slate-600">
                                    {categoryStats.utility}
                                </Badge>
                            </TabsTrigger>

                            <TabsTrigger
                                value="authentication"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 flex items-center gap-2"
                            >
                                <ShieldCheck className="h-4 w-4 text-purple-600" />
                                Authentication
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-slate-200/80 text-slate-600">
                                    {categoryStats.authentication}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>

                        {/* Search and Filters */}
                        <Card className="border-0 p-0 shadow-sm bg-white/80 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row gap-4 items-center">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            placeholder="Search templates by name, description, or tags..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Filter className="h-4 w-4" />
                                        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Template Grid */}
                        <TabsContent value={selectedCategory} className="mt-6">
                            {loading ? (
                                <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                                    <CardContent className="p-12">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="relative">
                                                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <BookOpen className="w-6 h-6 text-primary animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h3 className="text-lg font-semibold text-slate-900">Loading Templates</h3>
                                                <p className="text-sm text-muted-foreground">Fetching template library...</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : filteredTemplates.length === 0 ? (
                                <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                                    <CardContent className="p-12">
                                        <div className="text-center space-y-6">
                                            <div className="relative">
                                                <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mx-auto">
                                                    <Search className="h-12 w-12 text-primary" />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="text-2xl font-bold text-slate-900">No templates found</h3>
                                                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                                                    Try adjusting your search criteria or explore different categories.
                                                </p>
                                            </div>

                                            <Button
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setSelectedCategory("all");
                                                }}
                                                variant="outline"
                                                className="gap-2"
                                            >
                                                <Filter className="h-4 w-4" />
                                                Clear Filters
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredTemplates.map((template) => (
                                        <Card
                                            key={template.id}
                                            className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 group overflow-hidden"
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {getCategoryIcon(template.category)}
                                                        <Badge variant="outline" className="text-xs capitalize">
                                                            {template.category.toLowerCase()}
                                                        </Badge>
                                                        {template.source === 'ai_generated' && (
                                                            <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500">
                                                                <Sparkles className="h-3 w-3 mr-1" />
                                                                AI
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => {
                                                                setSelectedTemplate(template);
                                                                setIsPreviewOpen(true);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <CardTitle className="text-lg font-semibold text-slate-900 line-clamp-1">
                                                        {template.title}
                                                    </CardTitle>
                                                    <CardDescription className="text-sm line-clamp-2">
                                                        {template.description}
                                                    </CardDescription>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-4 pb-4">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                                        {formatTemplateContent(template.components)}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-1">
                                                    {template.tags.slice(0, 3).map((tag) => (
                                                        <Badge key={tag} variant="secondary" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {template.tags.length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{template.tags.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Variables</p>
                                                        <p className="font-medium">{template.variables?.length || 0}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Buttons</p>
                                                        <p className="font-medium">{template.buttons?.length || 0}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <div className="flex items-start gap-2">
                                                        <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm font-medium text-blue-800">Use Case</p>
                                                            <p className="text-sm text-blue-700 mt-1">{template.useCase}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>

                                            <CardFooter className="pt-0">
                                                <Button
                                                    onClick={() => applyTemplate(template)}
                                                    className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Use This Template
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Template Preview Dialog */}
                    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                        <DialogContent className="sm:max-w-[900px] max-h-[95vh] flex flex-col p-0">
                            <DialogHeader className="px-6 py-4 border-b border-slate-300 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                                        {selectedTemplate && getCategoryIcon(selectedTemplate.category)}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                            {selectedTemplate?.title}
                                            {selectedTemplate?.source === 'ai_generated' && (
                                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                                                    <Sparkles className="h-3 w-3 mr-1" />
                                                    AI Generated
                                                </Badge>
                                            )}
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-600 mt-1">
                                            {selectedTemplate?.description}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            {selectedTemplate && (
                                <div className="flex-1 overflow-y-auto px-6 py-6">
                                    <div className="space-y-8">
                                        {/* Template Stats */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
                                                <CardContent className="p-4">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-blue-600">
                                                            {selectedTemplate.variables?.length || 0}
                                                        </div>
                                                        <div className="text-sm text-blue-700 font-medium">Variables</div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card className="border-slate-200 bg-gradient-to-br from-green-50 to-green-100/50">
                                                <CardContent className="p-4">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-green-600">
                                                            {selectedTemplate.buttons?.length || 0}
                                                        </div>
                                                        <div className="text-sm text-green-700 font-medium">Buttons</div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
                                                <CardContent className="p-4">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-purple-600">
                                                            {selectedTemplate.components?.length || 0}
                                                        </div>
                                                        <div className="text-sm text-purple-700 font-medium">Components</div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Template Structure */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                    Template Structure
                                                </h3>
                                            </div>

                                            <div className="space-y-4">
                                                {selectedTemplate.components.map((component, index) => (
                                                    <Card key={index} className="border-l-4 border-l-primary bg-gradient-to-r from-slate-50 to-white">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline" className="bg-white border-primary/30 text-primary font-medium">
                                                                        {component.type}
                                                                    </Badge>
                                                                    {component.format && (
                                                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                                                            {component.format}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                                                                <p className="text-sm whitespace-pre-wrap text-slate-700 leading-relaxed">
                                                                    {component.text}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Variables Section */}
                                        {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                        Variables ({selectedTemplate.variables.length})
                                                    </h3>
                                                </div>

                                                <div className="grid gap-3">
                                                    {selectedTemplate.variables.map((variable, index) => (
                                                        <Card key={index} className="border-slate-200 bg-gradient-to-r from-amber-50 to-white">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                                                                            <span className="text-sm font-semibold text-amber-700">
                                                                                {variable.position || index + 1}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium text-sm text-slate-900">
                                                                                {variable.name}
                                                                            </div>
                                                                            <div className="text-xs text-slate-500">
                                                                                Example: <span className="font-medium text-slate-700">{variable.example}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {`{{${variable.position || index + 1}}}`}
                                                                    </Badge>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Buttons Section */}
                                        {selectedTemplate.buttons && selectedTemplate.buttons.length > 0 && (
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                        Action Buttons ({selectedTemplate.buttons.length})
                                                    </h3>
                                                </div>

                                                <div className="grid gap-3">
                                                    {selectedTemplate.buttons.map((button, index) => (
                                                        <Card key={index} className="border-slate-200 bg-gradient-to-r from-blue-50 to-white">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                                                            {button.type === 'URL' && <ExternalLink className="h-5 w-5 text-blue-600" />}
                                                                            {button.type === 'COPY_CODE' && <Copy className="h-5 w-5 text-blue-600" />}
                                                                            {button.type === 'QUICK_REPLY' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                                                                            {button.type === 'PHONE_NUMBER' && <Phone className="h-5 w-5 text-blue-600" />}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium text-sm text-slate-900">{button.text}</div>
                                                                            <div className="text-xs text-slate-500">
                                                                                {button.type === 'URL' && `URL: ${button.url}`}
                                                                                {button.type === 'COPY_CODE' && `Code: ${button.copy_code}`}
                                                                                {button.type === 'PHONE_NUMBER' && `Phone: ${button.phone_number}`}
                                                                                {button.type === 'QUICK_REPLY' && 'Quick Reply Button'}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline" className="capitalize">
                                                                        {button.type.replace('_', ' ').toLowerCase()}
                                                                    </Badge>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Use Case & Tags */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                    Use Case & Tags
                                                </h3>
                                            </div>

                                            <Card className="border-slate-200 bg-gradient-to-r from-green-50 to-white">
                                                <CardContent className="p-4">
                                                    <div className="space-y-4">
                                                        <div className="flex items-start gap-3">
                                                            <Target className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-sm font-medium text-green-800 mb-1">Recommended Use Case</p>
                                                                <p className="text-sm text-green-700 leading-relaxed">{selectedTemplate.useCase}</p>
                                                            </div>
                                                        </div>

                                                        <div className="pt-3 border-t border-green-200">
                                                            <p className="text-sm font-medium text-green-800 mb-2">Tags</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {selectedTemplate.tags.map((tag) => (
                                                                    <Badge key={tag} variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                                <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="hover:bg-slate-50">
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (selectedTemplate) {
                                            applyTemplate(selectedTemplate);
                                        }
                                    }}
                                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Use Template
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* AI Generation Dialog */}
                    <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
                        <DialogContent className="sm:max-w-[800px] max-h-[95vh] flex flex-col p-0">
                            <DialogHeader className="px-6 py-4 border-b border-slate-300 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/20 flex items-center justify-center">
                                        <Wand2 className="h-5 w-5 " />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                Generate Template with AI
                                            </span>
                                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                                <Sparkles className="h-3 w-3 mr-1" />
                                                Powered by Zapllo AI
                                            </Badge>
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-600 mt-1">
                                            Describe your template needs and let our AI create a professional WhatsApp Business template for you.
                                        </DialogDescription>
                                    </div>
                                </div>
                                 <div className="flex items-center jub mt-4 gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2 rounded-lg border border-purple-200">
                                <Sparkles className="h-4 w-4 text-purple-600" />
                                <div className="text-sm">
                                    <div className="font-semibold text-purple-800">{aiCredits} Credits</div>
                                    <div className="text-xs text-purple-600">5 credits per generation</div>
                                </div>
                                {aiCredits < 5 && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowBuyCreditsDialog(true)}
                                        className=" h-7 justify-end flex px-2 text-xs border-purple-300 ml-auto text-purple-700 hover:bg-purple-100"
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Buy Credits
                                    </Button>
                                )}
                            </div>
                                
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                <div className="space-y-8">
                                    {/* Prompt Input Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                Describe Your Template Needs
                                            </h3>
                                        </div>

                                        <div className="space-y-4">
                                            <Card className="border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
                                                <CardContent className="p-4">
                                                    <Label htmlFor="ai-prompt" className="text-sm font-medium text-slate-700 mb-2 block">
                                                        Template Description <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Textarea
                                                        id="ai-prompt"
                                                        placeholder="E.g., 'Create a welcome message template for new customers signing up for our fitness app. Include a motivational message, workout tips, and buttons to start their first workout and contact support.'"
                                                        value={aiPrompt}
                                                        onChange={(e) => setAiPrompt(e.target.value)}
                                                        rows={5}
                                                        className="resize-none bg-white border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                                                    />
                                                    <div className="flex items-center justify-between mt-2">
                                                        <p className="text-xs text-slate-500">
                                                            Be specific about your business, use case, tone, and any special requirements.
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {aiPrompt.length}/2000 characters
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    {/* AI Generated Template Preview */}
                                    {aiGeneratedTemplate && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                    Generated Template
                                                </h3>
                                            </div>

                                            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-white">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                                                            <Sparkles className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <span className="text-green-800">{aiGeneratedTemplate.title}</span>
                                                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 ml-auto">
                                                            AI Generated
                                                        </Badge>
                                                    </CardTitle>
                                                    <CardDescription className="text-green-700">
                                                        {aiGeneratedTemplate.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="bg-white p-4 rounded-lg border border-green-200">
                                                        <p className="text-sm whitespace-pre-wrap text-slate-700 leading-relaxed">
                                                            {formatTemplateContent(aiGeneratedTemplate.components)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                                                                <Settings className="h-3 w-3 text-amber-600" />
                                                            </div>
                                                            <span className="text-slate-600">
                                                                <span className="font-medium text-slate-900">{aiGeneratedTemplate.variables?.length || 0}</span> variables
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <MessageSquare className="h-3 w-3 text-blue-600" />
                                                            </div>
                                                            <span className="text-slate-600">
                                                                <span className="font-medium text-slate-900">{aiGeneratedTemplate.buttons?.length || 0}</span> buttons
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                                                                <FileText className="h-3 w-3 text-purple-600" />
                                                            </div>
                                                            <span className="text-slate-600">
                                                                <span className="font-medium text-slate-900">{aiGeneratedTemplate.category}</span> category
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    {/* Example Prompts Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                Example Prompts
                                            </h3>
                                        </div>

                                        <Card className="border-slate-200 bg-gradient-to-r from-blue-50 to-white">
                                            <CardContent className="p-4">
                                                <p className="text-sm text-blue-800 font-medium mb-3">
                                                    Click any example below to use it as a starting point:
                                                </p>
                                                <div className="grid gap-2">
                                                    {[
                                                        "Order confirmation template for an e-commerce store with tracking info and customer support contact",
                                                        "Appointment reminder for a dental clinic with confirmation buttons and rescheduling options",
                                                        "Flash sale announcement for a fashion brand with discount code and urgency messaging",
                                                        "Welcome message for a gym membership with class booking options and trainer contact info",
                                                        "Payment reminder template for invoicing with multiple payment options and support contact",
                                                        "Product launch announcement for a tech company with feature highlights and pre-order button"
                                                    ].map((example, index) => (
                                                        <Button
                                                            key={index}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="justify-start h-auto p-3 text-xs text-left hover:bg-blue-100 border border-transparent hover:border-blue-200 rounded-lg"
                                                            onClick={() => setAiPrompt(example)}
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-blue-500" />
                                                                <span className="text-slate-700">{example}</span>
                                                            </div>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Tips Section */}
                                    <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-white">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                                    <Target className="h-4 w-4 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-amber-800 mb-2">💡 Tips for Better Results</p>
                                                    <ul className="text-xs text-amber-700 space-y-1">
                                                        <li>• Be specific about your business type and target audience</li>
                                                        <li>• Mention the desired tone (professional, friendly, urgent, etc.)</li>
                                                        <li>• Include any specific information you want in the template</li>
                                                        <li>• Specify if you need buttons and what actions they should perform</li>
                                                        <li>• Mention any compliance requirements or restrictions</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                           <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsAiDialogOpen(false);
                                setAiGeneratedTemplate(null);
                                setAiPrompt("");
                            }}
                            className="hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                        {aiGeneratedTemplate ? (
                            <Button
                                onClick={() => {
                                    applyTemplate(aiGeneratedTemplate);
                                    setIsAiDialogOpen(false);
                                }}
                                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Use Generated Template
                            </Button>
                        ) : (
                            <Button
                                onClick={generateAiTemplate}
                                disabled={!aiPrompt.trim() || generatingAi || aiCredits < 5}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {generatingAi ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Generating Template...
                                    </>
                                ) : aiCredits < 5 ? (
                                    <>
                                        <AlertCircle className="h-4 w-4" />
                                        Insufficient Credits
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Generate Template (5 Credits)
                                    </>
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

             {/* Buy AI Credits Dialog - Updated */}
            <Dialog open={showBuyCreditsDialog} onOpenChange={(open) => {
                if (!open && !isPurchasing) {
                    setShowBuyCreditsDialog(false);
                }
            }}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
                    <DialogHeader className="px-6 py-4 border-b border-slate-200 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/20 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold text-slate-900">
                                    Purchase AI Credits
                                </DialogTitle>
                                <DialogDescription className="text-slate-600 mt-1">
                                    Buy AI credits to generate templates. Each generation costs 5 credits.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <div className="space-y-6">
                            {/* Current Credits Display */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                        Current Balance
                                    </h3>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-purple-800">Current AI Credits</p>
                                            <p className="text-xs text-purple-600">Available for template generation</p>
                                        </div>
                                        <div className="text-2xl font-bold text-purple-900">{aiCredits}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Credits Amount Selection */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                        Choose Credits Amount
                                    </h3>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="grid grid-cols-3 gap-2">
                                        {[25, 50, 100, 200, 500, 1000].map((amount) => (
                                            <Button
                                                key={amount}
                                                variant={creditsAmount === amount ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCreditsAmount(amount)}
                                                className={cn(
                                                    "flex flex-col h-auto py-3 transition-all duration-200",
                                                    creditsAmount === amount
                                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg scale-105 border-blue-600"
                                                        : "bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:border-blue-400"
                                                )}
                                            >
                                                <span className="font-semibold">{amount}</span>
                                                <span className="text-xs opacity-70">₹{amount * 2}</span>
                                            </Button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-blue-700 mt-2">
                                        💡 Tip: 100 credits = 20 template generations
                                    </p>
                                </div>
                            </div>

                            {/* Payment Breakdown */}
                            {creditsAmount >= 10 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                            Payment Breakdown
                                        </h3>
                                    </div>

                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                                                <span className="text-sm font-medium text-green-800 flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4" />
                                                    AI Credits ({creditsAmount})
                                                </span>
                                                <span className="text-sm font-semibold text-green-900">
                                                    ₹{(creditsAmount * 2).toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200">
                                                <span className="text-sm text-green-700 flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4" />
                                                    GST (18%)
                                                </span>
                                                <span className="text-sm font-medium text-green-800">
                                                    ₹{calculateGST(creditsAmount * 2).gst.toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="h-px bg-green-200 my-2" />

                                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-lg border border-green-300">
                                                <span className="text-sm font-semibold text-green-900 flex items-center gap-2">
                                                    <ArrowRight  className="h-4 w-4" />
                                                    Total Amount to Pay
                                                </span>
                                                <span className="text-lg font-bold text-green-900">
                                                    ₹{calculateGST(creditsAmount * 2).total.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Notice */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                        Secure Payment
                                    </h3>
                                </div>

                                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CreditCard className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-emerald-800 mb-1">
                                                Secure Payment Gateway
                                            </h4>
                                            <p className="text-sm text-emerald-700 leading-relaxed">
                                                Your payment will be processed securely through Razorpay. AI credits are added instantly after successful payment.
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <CheckCircle className="h-3 w-3 text-emerald-600" />
                                                <span className="text-xs text-emerald-600 font-medium">
                                                    256-bit SSL Encrypted
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Sparkles className="h-4 w-4" />
                                <span>
                                    {creditsAmount >= 10
                                        ? `${creditsAmount} credits will be added to your account`
                                        : 'Select credits amount to continue'
                                    }
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowBuyCreditsDialog(false)}
                                    disabled={isPurchasing}
                                    className="hover:bg-slate-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={purchaseAiCredits}
                                    className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                    disabled={creditsAmount < 10 || isPurchasing}
                                >
                                    {isPurchasing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Processing Payment...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="h-4 w-4" />
                                            Pay ₹{creditsAmount >= 10 ? calculateGST(creditsAmount * 2).total.toFixed(2) : '0.00'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </Layout>
    );
}