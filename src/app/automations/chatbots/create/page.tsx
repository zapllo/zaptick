"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  Brain,
  Cpu,
  Settings,
  Target,
  Zap,
  Save,
  TestTube,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Info,
  HelpCircle,
  Plus,
  X,
  FileText,
  Rocket,
  Shield,
  Wand2,
  CloudLightning
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import AutomationsLayout from '@/components/layout/automation-layout';

interface ChatbotFormData {
  name: string;
  description: string;
  aiModel: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo'; // Keep original model names for API
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  triggers: string[];
  matchType: 'exact' | 'contains' | 'starts_with' | 'ends_with';
  caseSensitive: boolean;
  priority: number;
  fallbackMessage: string;
  enableFallback: boolean;
  maxResponseLength: number;
  conversationMemory: boolean;
  memoryDuration: number;
  contextWindow: number;
  tags: string[];
  isActive: boolean;
}

const AI_MODELS = [
  {
    value: 'gpt-3.5-turbo',
    label: 'Zaptick Smart',
    description: 'Fast and efficient, perfect for quick responses',
    cost: '₹0.125 per 1K tokens',
    icon: CloudLightning,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    gradient: 'from-blue-500 to-blue-600',
    // badge: 'Recommended'
  },
  {
    value: 'gpt-4',
    label: 'Zaptick Pro',
    description: 'Advanced reasoning for complex conversations',
    cost: '₹0.84 per 1K tokens',
    icon: Brain,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    gradient: 'from-purple-500 to-purple-600',
    badge: 'Popular'
  },
  {
    value: 'gpt-4-turbo',
    label: 'Zaptick Ultra',
    description: 'Most powerful model with superior intelligence',
    cost: '₹2.51 per 1K tokens',
    icon: Sparkles,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    gradient: 'from-emerald-500 to-emerald-600',
    // badge: 'Premium'
  }
];

const SYSTEM_PROMPT_TEMPLATES = [
  {
    name: 'Customer Support',
    icon: Shield,
    prompt: 'You are a professional customer support assistant for Zaptick. Respond helpfully and courteously to customer inquiries. Provide clear, concise solutions and escalate complex issues when needed. Always maintain a friendly, professional tone.',
    color: 'text-blue-600 bg-blue-50'
  },
  {
    name: 'Sales Assistant',
    icon: Target,
    prompt: 'You are an enthusiastic sales assistant for Zaptick. Help customers discover the perfect solutions for their needs. Ask qualifying questions, provide relevant recommendations, and guide them toward making informed decisions. Be helpful, not pushy.',
    color: 'text-green-600 bg-green-50'
  },
  {
    name: 'Technical Support',
    icon: Settings,
    prompt: 'You are a technical support specialist for Zaptick. Provide step-by-step troubleshooting guidance and technical solutions. Break down complex concepts into simple terms. Always verify understanding before proceeding.',
    color: 'text-purple-600 bg-purple-50'
  },
  {
    name: 'General Assistant',
    icon: Bot,
    prompt: 'You are a helpful AI assistant for Zaptick. Provide accurate information, answer questions clearly, and assist with various customer needs. Maintain a professional yet friendly demeanor in all interactions.',
    color: 'text-orange-600 bg-orange-50'
  }
];

export default function CreateChatbotPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState<ChatbotFormData>({
    name: '',
    description: '',
    aiModel: 'gpt-3.5-turbo',
    systemPrompt: SYSTEM_PROMPT_TEMPLATES[0].prompt,
    temperature: 0.7,
    maxTokens: 500,
    triggers: [''],
    matchType: 'contains',
    caseSensitive: false,
    priority: 0,
    fallbackMessage: 'I apologize, but I\'m having trouble understanding your request. Could you please rephrase or contact our support team for assistance?',
    enableFallback: true,
    maxResponseLength: 1000,
    conversationMemory: true,
    memoryDuration: 30,
    contextWindow: 5,
    tags: [],
    isActive: true,
  });

  const [knowledgeBase, setKnowledgeBase] = useState({
    enabled: false,
    documents: [],
    settings: {
      maxDocuments: 10,
      maxFileSize: 10,
      allowedFileTypes: ['pdf', 'txt', 'doc', 'docx', 'csv', 'json', 'md'],
      chunkSize: 1000,
      chunkOverlap: 200,
      searchMode: 'semantic' as const,
      maxRelevantChunks: 3
    }
  });

  const [currentTag, setCurrentTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [wabaAccounts, setWabaAccounts] = useState<any[]>([]);
  const [selectedWabaId, setSelectedWabaId] = useState<string>('');
  const [isLoadingWaba, setIsLoadingWaba] = useState(true);

  // Load WABA accounts
  const fetchWabaAccounts = async () => {
    try {
      const response = await fetch('/api/waba-accounts');
      const data = await response.json();

      if (data.success) {
        setWabaAccounts(data.accounts);

        const savedWabaId = localStorage.getItem('selectedWabaId');
        if (savedWabaId && data.accounts.find((a: any) => a.wabaId === savedWabaId)) {
          setSelectedWabaId(savedWabaId);
        } else if (data.accounts.length > 0) {
          const firstWaba = data.accounts[0];
          setSelectedWabaId(firstWaba.wabaId);
          localStorage.setItem('selectedWabaId', firstWaba.wabaId);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch WABA accounts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching WABA accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch WABA accounts",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWaba(false);
    }
  };

  useEffect(() => {
    fetchWabaAccounts();
  }, []);

  const updateFormData = (field: keyof ChatbotFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTrigger = () => {
    setFormData(prev => ({
      ...prev,
      triggers: [...prev.triggers, '']
    }));
  };

  const removeTrigger = (index: number) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.filter((_, i) => i !== index)
    }));
  };

  const updateTrigger = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.map((trigger, i) => i === index ? value : trigger)
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWabaId) {
      toast({
        title: "Error",
        description: "No WABA selected",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Chatbot name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.systemPrompt.trim()) {
      toast({
        title: "Error",
        description: "System prompt is required",
        variant: "destructive",
      });
      return;
    }

    const validTriggers = formData.triggers.filter(t => t.trim());
    if (validTriggers.length === 0) {
      toast({
        title: "Error",
        description: "At least one trigger is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          wabaId: selectedWabaId,
          triggers: validTriggers,
          knowledgeBase: knowledgeBase.enabled ? knowledgeBase : undefined
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Chatbot created successfully",
        });
        router.push('/automations/chatbots');
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create chatbot",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating chatbot:', error);
      toast({
        title: "Error",
        description: "Failed to create chatbot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testChatbot = async () => {
    if (!testMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test message",
        variant: "destructive",
      });
      return;
    }

    setIsTestLoading(true);
    setTestResponse('');

    try {
      setTimeout(() => {
        const selectedModelLabel = AI_MODELS.find(m => m.value === formData.aiModel)?.label;
        setTestResponse(`Based on your ${selectedModelLabel} configuration, here's how your chatbot would respond:\n\nModel: ${selectedModelLabel}\nTemperature: ${formData.temperature}\nMax Tokens: ${formData.maxTokens}\n\nThis is a preview response. Your actual chatbot will use Zaptick's AI to generate intelligent, contextual responses based on your system prompt and configuration.`);
        setIsTestLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error testing chatbot:', error);
      toast({
        title: "Error",
        description: "Failed to test chatbot",
        variant: "destructive",
      });
      setIsTestLoading(false);
    }
  };
  const selectedModel = AI_MODELS.find(m => m.value === formData.aiModel);

  return (
    <AutomationsLayout>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
          <div className="mx-auto p-6">
            {/* Enhanced Header */}
            <div className="flex items-center gap-6 mb-8">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="p-2 hover:bg-primary/5"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl shadow-lg">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-1">Create AI Chatbot</h1>
                  <p className="text-slate-600">Build an intelligent assistant powered by Zaptick AI</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                      <Wand2 className="h-3 w-3 mr-1" />
                      AI-Powered
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-600 border-emerald-200">
                      <Zap className="h-3 w-3 mr-1" />
                      Instant Setup
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Configuration */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Basic Information */}
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                        <span className="text-xl">Basic Information</span>
                        <Badge variant="outline" className="ml-auto text-xs">Required</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            Chatbot Name
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            placeholder="e.g., Customer Support Assistant"
                            value={formData.name}
                            onChange={(e) => updateFormData('name', e.target.value)}
                            className="bg-white/70 border-slate-200 focus:border-primary/50 focus:ring-primary/20 h-12 text-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority" className="text-sm font-semibold flex items-center gap-2">
                            <Target className="h-4 w-4 text-orange-500" />
                            Priority
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Higher priority chatbots are triggered first
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input
                            id="priority"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.priority}
                            onChange={(e) => updateFormData('priority', parseInt(e.target.value) || 0)}
                            className="bg-white/70 border-slate-200 focus:border-primary/50 focus:ring-primary/20 h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Describe what this chatbot does and how it helps your customers..."
                          value={formData.description}
                          onChange={(e) => updateFormData('description', e.target.value)}
                          rows={3}
                          className="bg-white/70 border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none text-base"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Model Selection - Enhanced */}
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600" />
                        <span className="text-xl">Choose Your AI Brain</span>
                        <Badge variant="outline" className="ml-auto text-xs bg-purple-50 text-purple-600 border-purple-200">
                          Zaptick AI
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-slate-600">Select the perfect AI model for your use case</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {AI_MODELS.map((model) => (
                          <div
                            key={model.value}
                            className={cn(
                              "relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg group",
                              formData.aiModel === model.value
                                ? "border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg scale-105"
                                : "border-slate-200 hover:border-slate-300 hover:shadow-md hover:scale-102"
                            )}
                            onClick={() => updateFormData('aiModel', model.value)}
                          >
                            {model.badge && (
                              <div className="absolute -top-2 -right-2">
                                <Badge className={`text-xs bg-gradient-to-r ${model.gradient} text-white shadow-lg`}>
                                  {model.badge}
                                </Badge>
                              </div>
                            )}

                            <div className="flex items-center gap-3 mb-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${model.gradient} shadow-md`}>
                                <model.icon className="h-5 w-5 text-white" />
                              </div>
                              <h3 className="font-semibold text-slate-900">{model.label}</h3>
                            </div>

                            <p className="text-sm text-slate-600 mb-4 leading-relaxed">{model.description}</p>

                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className={cn("text-xs", model.color)}>
                                {model.cost}
                              </Badge>
                              {formData.aiModel === model.value && (
                                <div className="flex items-center gap-1 text-primary">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                  <span className="text-xs font-medium">Selected</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* System Prompt Templates */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />
                            System Prompt
                            <span className="text-red-500">*</span>
                          </Label>
                          <Select onValueChange={(value) => {
                            const template = SYSTEM_PROMPT_TEMPLATES.find(t => t.name === value);
                            if (template) {
                              updateFormData('systemPrompt', template.prompt);
                            }
                          }}>
                            <SelectTrigger className="w-56 bg-white/70 border-slate-200 h-10">
                              <SelectValue placeholder="Choose template" />
                            </SelectTrigger>
                            <SelectContent>
                              {SYSTEM_PROMPT_TEMPLATES.map((template) => (
                                <SelectItem key={template.name} value={template.name} className="p-3">
                                  <div className="flex items-center gap-2">
                                    <template.icon className="h-4 w-4" />
                                    <span>{template.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Textarea
                          placeholder="Define how your AI assistant should behave, respond, and interact with customers..."
                          value={formData.systemPrompt}
                          onChange={(e) => updateFormData('systemPrompt', e.target.value)}
                          rows={4}
                          className="bg-white/70 border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none text-base"
                        />

                        <Alert className="border-primary/20 bg-primary/5">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <AlertDescription className="text-primary">
                            <strong>Pro Tip:</strong> Be specific about your chatbot&apos;s role, tone, and any business rules. This helps ensure consistent, on-brand responses.
                          </AlertDescription>
                        </Alert>
                      </div>

                      {/* AI Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Settings className="h-4 w-4 text-blue-500" />
                            Creativity Level: {formData.temperature}
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Higher values make responses more creative and varied
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <Slider
                            value={[formData.temperature]}
                            onValueChange={([value]) => updateFormData('temperature', value)}
                            min={0}
                            max={2}
                            step={0.1}
                            className="py-4"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Consistent
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              Balanced
                            </span>
                            <span className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Creative
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-500" />
                            Response Length: {formData.maxTokens} tokens
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Controls maximum length of responses (~4 characters per token)
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <Slider
                            value={[formData.maxTokens]}
                            onValueChange={([value]) => updateFormData('maxTokens', value)}
                            min={50}
                            max={2000}
                            step={50}
                            className="py-4"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Brief (50)</span>
                            <span>Standard (500)</span>
                            <span>Detailed (2000)</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Knowledge Base */}
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600" />
                        <span className="text-xl">Knowledge Base</span>
                        <Badge variant="outline" className="ml-auto text-xs bg-indigo-50 text-indigo-600 border-indigo-200">
                          Smart Learning
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-slate-600">Upload documents to make your chatbot an expert</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                              <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-sm font-semibold text-indigo-900">Enable Knowledge Base</Label>
                              <p className="text-xs text-indigo-700">
                                Upload documents to enhance your chatbot with specific knowledge
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={knowledgeBase.enabled}
                            onCheckedChange={(checked) => setKnowledgeBase(prev => ({ ...prev, enabled: checked }))}
                          />
                        </div>

                        {knowledgeBase.enabled && (
                          <div className="space-y-4">
                            <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center bg-gradient-to-br from-indigo-50/50 to-white">
                              <div className="space-y-4">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                  <FileText className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900 text-lg">Knowledge Base Enabled</h3>
                                  <p className="text-sm text-slate-600">
                                    Documents can be uploaded after creating the chatbot
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 rounded-xl p-4 border border-indigo-200">
                              <div className="flex items-start gap-3">
                                <Rocket className="h-5 w-5 text-indigo-600 mt-0.5" />
                                <div className="text-sm text-indigo-800">
                                  <p className="font-semibold mb-2">Powerful Knowledge Features</p>
                                  <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>Support for PDF, Word, TXT, CSV, JSON, and Markdown files</li>
                                    <li>Intelligent text processing and semantic search integration</li>
                                    <li>Up to {knowledgeBase.settings.maxDocuments} documents, {knowledgeBase.settings.maxFileSize}MB each</li>
                                    <li>Real-time context injection for accurate responses</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trigger Configuration */}
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-green-500 to-green-600" />
                        <span className="text-xl">Trigger Settings</span>
                        <Badge variant="outline" className="ml-auto text-xs bg-green-50 text-green-600 border-green-200">
                          Smart Detection
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-slate-600">Define when your chatbot should respond</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-500" />
                            Match Type
                          </Label>
                          <Select
                            value={formData.matchType}
                            onValueChange={(value: any) => updateFormData('matchType', value)}
                          >
                            <SelectTrigger className="bg-white/70 border-slate-200 h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contains">Contains keyword anywhere</SelectItem>
                              <SelectItem value="exact">Must match exactly</SelectItem>
                              <SelectItem value="starts_with">Starts with keyword</SelectItem>
                              <SelectItem value="ends_with">Ends with keyword</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-3 pt-8">
                          <Switch
                            id="caseSensitive"
                            checked={formData.caseSensitive}
                            onCheckedChange={(checked) => updateFormData('caseSensitive', checked)}
                          />
                          <Label htmlFor="caseSensitive" className="text-sm font-semibold">
                            Case sensitive matching
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          Trigger Keywords
                          <span className="text-red-500">*</span>
                        </Label>
                        <div className="space-y-3">
                          {formData.triggers.map((trigger, index) => (
                            <div key={index} className="flex gap-3">
                              <div className="flex-1 relative">
                                <Input
                                  placeholder="e.g., help, support, question..."
                                  value={trigger}
                                  onChange={(e) => updateTrigger(index, e.target.value)}
                                  className="bg-white/70 border-slate-200 focus:border-primary/50 focus:ring-primary/20 h-12 pl-4 pr-12"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
                                  #{index + 1}
                                </div>
                              </div>
                              {formData.triggers.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeTrigger(index)}
                                  className="px-3 h-12 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addTrigger}
                          className="gap-2 border-dashed border-green-300 hover:border-green-400 hover:bg-green-50 text-green-600 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Add Another Trigger
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Advanced Settings */}
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600" />
                        <span className="text-xl">Advanced Configuration</span>
                        <Badge variant="outline" className="ml-auto text-xs bg-orange-50 text-orange-600 border-orange-200">
                          Optional
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-slate-600">Fine-tune your chatbot&apos;s behavior</p>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {/* Fallback Configuration */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl border border-orange-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                              <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-sm font-semibold text-orange-900">Fallback Protection</Label>
                              <p className="text-xs text-orange-700">
                                Backup message when AI encounters issues
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="enableFallback"
                            checked={formData.enableFallback}
                            onCheckedChange={(checked) => updateFormData('enableFallback', checked)}
                          />
                        </div>
                        {formData.enableFallback && (
                          <Textarea
                            placeholder="Enter a helpful fallback message for when the AI needs assistance..."
                            value={formData.fallbackMessage}
                            onChange={(e) => updateFormData('fallbackMessage', e.target.value)}
                            rows={3}
                            className="bg-white/70 border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                          />
                        )}
                      </div>

                      <Separator className="my-6" />

                      {/* Memory Configuration */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl border border-purple-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                              <Brain className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-sm font-semibold text-purple-900">Conversation Memory</Label>
                              <p className="text-xs text-purple-700">
                                Remember context from previous messages
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="conversationMemory"
                            checked={formData.conversationMemory}
                            onCheckedChange={(checked) => updateFormData('conversationMemory', checked)}
                          />
                        </div>
                        {formData.conversationMemory && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">Memory Duration (minutes)</Label>
                              <Input
                                type="number"
                                min="1"
                                max="1440"
                                value={formData.memoryDuration}
                                onChange={(e) => updateFormData('memoryDuration', parseInt(e.target.value) || 30)}
                                className="bg-white/70 border-slate-200 focus:border-primary/50 focus:ring-primary/20 h-12"
                              />
                              <p className="text-xs text-slate-500">How long to remember conversations</p>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">Context Messages</Label>
                              <Input
                                type="number"
                                min="1"
                                max="20"
                                value={formData.contextWindow}
                                onChange={(e) => updateFormData('contextWindow', parseInt(e.target.value) || 5)}
                                className="bg-white/70 border-slate-200 focus:border-primary/50 focus:ring-primary/20 h-12"
                              />
                              <p className="text-xs text-slate-500">Number of previous messages to consider</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator className="my-6" />

                      {/* Tags */}
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          Organization Tags
                        </Label>
                        <div className="flex gap-3">
                          <Input
                            placeholder="Add tags like 'sales', 'support', 'billing'..."
                            value={currentTag}
                            onChange={(e) => setCurrentTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag();
                              }
                            }}
                            className="bg-white/70 border-slate-200 focus:border-primary/50 focus:ring-primary/20 h-12"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addTag}
                            className="px-4 h-12 hover:bg-primary/5 hover:border-primary/30"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {formData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 text-sm"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="hover:text-red-600 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Enhanced Sidebar */}
                <div className="space-y-6">
                  {/* Live Test Panel */}
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm sticky top-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
                          <TestTube className="h-5 w-5 text-white" />
                        </div>
                        <span>Live Test</span>
                        <Badge className="ml-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs">
                          Real-time
                        </Badge>
                      </CardTitle>
                      <p className="text-xs text-slate-600">Test your chatbot before deploying</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Test Message</Label>
                        <Textarea
                          placeholder="Type a message to test your chatbot..."
                          value={testMessage}
                          onChange={(e) => setTestMessage(e.target.value)}
                          rows={3}
                          className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={testChatbot}
                        disabled={isTestLoading || !testMessage.trim()}
                        className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 h-11"
                      >
                        {isTestLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Rocket className="h-4 w-4" />
                            Test Response
                          </>
                        )}
                      </Button>

                      {testResponse && (
                        <div className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-inner">
                          <Label className="text-xs font-semibold text-slate-600 mb-3 block flex items-center gap-2">
                            <Bot className="h-3 w-3" />
                            AI Response Preview:
                          </Label>
                          <p className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">{testResponse}</p>
                          <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                            <span>Model: {selectedModel?.label}</span>
                            <Badge variant="outline" className="text-xs">
                              ₹{(Math.random() * 2).toFixed(4)}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Model Summary */}
                  {selectedModel && (
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100/50">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedModel.gradient} shadow-md`}>
                            <selectedModel.icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-purple-900">{selectedModel.label}</h3>
                            <Badge className={`text-xs bg-gradient-to-r ${selectedModel.gradient} text-white mt-1`}>
                              {selectedModel.badge}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-purple-700 mb-4">{selectedModel.description}</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-purple-600">Cost per 1K tokens:</span>
                            <Badge variant="outline" className="text-purple-700 border-purple-300">
                              {selectedModel.cost}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-600">Creativity:</span>
                            <span className="font-medium text-purple-900">{formData.temperature}/2.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-600">Max Response:</span>
                            <span className="font-medium text-purple-900">{formData.maxTokens} tokens</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-600">Memory:</span>
                            <span className="font-medium text-purple-900">
                              {formData.conversationMemory ? `${formData.memoryDuration}min` : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Status */}
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-semibold">Chatbot Status</Label>
                            <p className="text-xs text-muted-foreground">Auto-activate when ready</p>
                          </div>
                          <Switch
                            checked={formData.isActive}
                            onCheckedChange={(checked) => updateFormData('isActive', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">AI Model</span>
                            <Badge variant="outline" className="text-xs">
                              {selectedModel?.label}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Knowledge Base</span>
                            <Badge variant={knowledgeBase.enabled ? "default" : "secondary"} className="text-xs">
                              {knowledgeBase.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Triggers</span>
                            <Badge variant="outline" className="text-xs">
                              {formData.triggers.filter(t => t.trim()).length} keywords
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Enhanced Form Actions */}
              <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-slate-50/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="gap-2 h-12 px-6 hover:bg-slate-50"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Cancel
                      </Button>
                      <div className="text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Your chatbot will be ready to use immediately after creation
                        </p>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-8 text-base font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          Creating Chatbot...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-5 w-5" />
                          Create AI Chatbot
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </TooltipProvider>
    </AutomationsLayout>
  );
}