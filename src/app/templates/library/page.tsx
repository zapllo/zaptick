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
    Phone
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

                    <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
                        {/* Category Tabs */}
                        <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
                            <TabsTrigger value="all" className="gap-2">
                                <BookOpen className="h-4 w-4" />
                                All Templates
                                <Badge variant="secondary" className="ml-1">
                                    {categoryStats.all}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="marketing" className="gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Marketing
                                <Badge variant="secondary" className="ml-1">
                                    {categoryStats.marketing}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="utility" className="gap-2">
                                <Settings className="h-4 w-4" />
                                Utility
                                <Badge variant="secondary" className="ml-1">
                                    {categoryStats.utility}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="authentication" className="gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Authentication
                                <Badge variant="secondary" className="ml-1">
                                    {categoryStats.authentication}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>

                        {/* Search and Filters */}
                        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
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
                                        disabled={!aiPrompt.trim() || generatingAi}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {generatingAi ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Generating Template...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4" />
                                                Generate Template
                                            </>
                                        )}
                                    </Button>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </Layout>
    );
}