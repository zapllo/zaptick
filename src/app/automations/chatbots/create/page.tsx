"use client";

import React, { useState } from 'react';
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
  X
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
  aiModel: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo';
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
    label: 'GPT-3.5 Turbo',
    description: 'Fast and efficient, great for most use cases',
    cost: '$0.0015 per 1K tokens',
    icon: Cpu,
    color: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  {
    value: 'gpt-4',
    label: 'GPT-4',
    description: 'Most capable model, better reasoning',
    cost: '$0.03 per 1K tokens',
    icon: Brain,
    color: 'text-purple-600 bg-purple-50 border-purple-200'
  },
  {
    value: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    description: 'Latest GPT-4 with improved speed',
    cost: '$0.01 per 1K tokens',
    icon: Brain,
    color: 'text-purple-600 bg-purple-50 border-purple-200'
  }
];

const SYSTEM_PROMPT_TEMPLATES = [
  {
    name: 'Customer Service',
    prompt: 'You are a helpful customer service assistant. Respond professionally and helpfully to customer inquiries. Keep responses concise and friendly. Always try to resolve the customer\'s issue or direct them to the appropriate resource.'
  },
  {
    name: 'Sales Assistant',
    prompt: 'You are a knowledgeable sales assistant. Help customers understand our products and services. Be enthusiastic but not pushy. Focus on understanding customer needs and providing relevant recommendations.'
  },
  {
    name: 'Technical Support',
    prompt: 'You are a technical support specialist. Help customers troubleshoot issues and provide step-by-step solutions. Be patient and thorough in your explanations. Ask clarifying questions when needed.'
  },
  {
    name: 'FAQ Assistant',
    prompt: 'You are an FAQ assistant. Provide accurate answers to frequently asked questions. If you don\'t know the answer, direct the customer to contact support. Keep responses clear and concise.'
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
    isActive: true
  });

  const [currentTag, setCurrentTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isTestLoading, setIsTestLoading] = useState(false);

  // Get selected WABA ID
  const selectedWabaId = typeof window !== 'undefined' ? localStorage.getItem('selectedWabaId') || '' : '';

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

    // Validate form
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
          triggers: validTriggers
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
      // Simple test using current form data
      const testPayload = {
        message: testMessage,
        systemPrompt: formData.systemPrompt,
        aiModel: formData.aiModel,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens
      };

      // For now, we'll show a mock response since we don't have the test endpoint yet
      setTimeout(() => {
        setTestResponse(`AI would respond based on your configuration:\n\nModel: ${formData.aiModel}\nTemperature: ${formData.temperature}\nMax Tokens: ${formData.maxTokens}\n\nThis is a preview. The actual response would be generated by OpenAI using your system prompt.`);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
          <div className="mx-auto p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
             <Button
                variant="outline"
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Create AI Chatbot</h1>
                  <p className="text-muted-foreground">Build an intelligent assistant for your customers</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Configuration */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Chatbot Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            placeholder="e.g., Customer Support Assistant"
                            value={formData.name}
                            onChange={(e) => updateFormData('name', e.target.value)}
                            className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority" className="text-sm font-medium flex items-center gap-1">
                            Priority
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Higher priority chatbots will be triggered first
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
                            className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Describe what this chatbot does..."
                          value={formData.description}
                          onChange={(e) => updateFormData('description', e.target.value)}
                          rows={3}
                          className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Configuration */}
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                        AI Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* AI Model Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          AI Model <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {AI_MODELS.map((model) => (
                            <div
                              key={model.value}
                              className={cn(
                                "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                                formData.aiModel === model.value
                                  ? "border-primary bg-primary/5"
                                  : "border-slate-200 hover:border-slate-300"
                              )}
                              onClick={() => updateFormData('aiModel', model.value)}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <model.icon className="h-5 w-5 text-primary" />
                                <h3 className="font-medium text-slate-900">{model.label}</h3>
                              </div>
                              <p className="text-xs text-slate-600 mb-2">{model.description}</p>
                              <Badge variant="outline" className={model.color}>
                                {model.cost}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* System Prompt */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            System Prompt <span className="text-red-500">*</span>
                          </Label>
                          <Select onValueChange={(value) => {
                            const template = SYSTEM_PROMPT_TEMPLATES.find(t => t.name === value);
                            if (template) {
                              updateFormData('systemPrompt', template.prompt);
                            }
                          }}>
                            <SelectTrigger className="w-48 bg-white border-slate-200">
                              <SelectValue placeholder="Use template" />
                            </SelectTrigger>
                            <SelectContent>
                              {SYSTEM_PROMPT_TEMPLATES.map((template) => (
                                <SelectItem key={template.name} value={template.name}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Textarea
                          placeholder="Define how the AI should behave and respond..."
                          value={formData.systemPrompt}
                          onChange={(e) => updateFormData('systemPrompt', e.target.value)}
                          rows={5}
                          className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                        />
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            The system prompt defines your chatbot&apos;s personality and behavior. Be specific about tone, style, and any constraints.
                          </AlertDescription>
                        </Alert>
                      </div>

                      {/* Advanced AI Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium flex items-center gap-1">
                            Temperature: {formData.temperature}
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Controls randomness. Higher = more creative, Lower = more focused
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
                            <span>Focused (0)</span>
                            <span>Balanced (1)</span>
                            <span>Creative (2)</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium flex items-center gap-1">
                            Max Tokens: {formData.maxTokens}
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Maximum length of AI responses (~4 characters per token)
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
                            <span>Short (50)</span>
                            <span>Medium (500)</span>
                            <span>Long (2000)</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trigger Configuration */}
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Trigger Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Match Type</Label>
                          <Select
                            value={formData.matchType}
                            onValueChange={(value: any) => updateFormData('matchType', value)}
                          >
                            <SelectTrigger className="bg-white border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contains">Contains keyword</SelectItem>
                              <SelectItem value="exact">Exact match</SelectItem>
                              <SelectItem value="starts_with">Starts with</SelectItem>
                              <SelectItem value="ends_with">Ends with</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                          <Switch
                            id="caseSensitive"
                            checked={formData.caseSensitive}
                            onCheckedChange={(checked) => updateFormData('caseSensitive', checked)}
                          />
                          <Label htmlFor="caseSensitive" className="text-sm font-medium">
                            Case sensitive
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Trigger Keywords <span className="text-red-500">*</span>
                        </Label>
                        <div className="space-y-2">
                          {formData.triggers.map((trigger, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder="Enter trigger keyword..."
                                value={trigger}
                                onChange={(e) => updateTrigger(index, e.target.value)}
                                className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                              />
                              {formData.triggers.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeTrigger(index)}
                                  className="px-3 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
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
                          className="gap-2 border-dashed border-slate-300 hover:border-primary/50 hover:bg-primary/5"
                        >
                          <Plus className="h-3 w-3" />
                          Add Trigger
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Advanced Settings */}
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        Advanced Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Fallback Configuration */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="enableFallback"
                            checked={formData.enableFallback}
                            onCheckedChange={(checked) => updateFormData('enableFallback', checked)}
                          />
                          <Label htmlFor="enableFallback" className="text-sm font-medium">
                            Enable fallback message
                          </Label>
                        </div>
                        {formData.enableFallback && (
                          <Textarea
                            placeholder="Message to send when AI fails to respond..."
                            value={formData.fallbackMessage}
                            onChange={(e) => updateFormData('fallbackMessage', e.target.value)}
                            rows={3}
                            className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                          />
                        )}
                      </div>

                      <Separator />

                      {/* Memory Configuration */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="conversationMemory"
                            checked={formData.conversationMemory}
                            onCheckedChange={(checked) => updateFormData('conversationMemory', checked)}
                          />
                          <Label htmlFor="conversationMemory" className="text-sm font-medium">
                            Conversation memory
                          </Label>
                        </div>
                        {formData.conversationMemory && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Memory Duration (minutes)</Label>
                              <Input
                                type="number"
                                min="1"
                                max="1440"
                                value={formData.memoryDuration}
                                onChange={(e) => updateFormData('memoryDuration', parseInt(e.target.value) || 30)}
                                className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Context Window</Label>
                              <Input
                                type="number"
                                min="1"
                                max="20"
                                value={formData.contextWindow}
                                onChange={(e) => updateFormData('contextWindow', parseInt(e.target.value) || 5)}
                                className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Tags */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Tags</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a tag..."
                            value={currentTag}
                            onChange={(e) => setCurrentTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag();
                              }
                            }}
                            className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addTag}
                            className="px-3"
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
                                className="gap-1 bg-slate-100 text-slate-700 hover:bg-slate-200"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="hover:text-red-600"
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

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Test Chat */}
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm sticky top-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        Test Your Chatbot
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Test Message</Label>
                        <Textarea
                          placeholder="Type a message to test..."
                          value={testMessage}
                          onChange={(e) => setTestMessage(e.target.value)}
                          rows={3}
                          className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={testChatbot}
                        disabled={isTestLoading || !testMessage.trim()}
                        className="w-full gap-2"
                      >
                        {isTestLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <TestTube className="h-4 w-4" />
                            Test Response
                          </>
                        )}
                      </Button>
                      {testResponse && (
                        <div className="p-3 bg-slate-50 rounded-lg border">
                          <Label className="text-xs font-medium text-slate-600 mb-2 block">AI Response:</Label>
                          <p className="text-sm text-slate-900 whitespace-pre-wrap">{testResponse}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Model Info */}
                  {selectedModel && (
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <selectedModel.icon className="h-5 w-5 text-purple-600" />
                          <h3 className="font-semibold text-purple-900">{selectedModel.label}</h3>
                        </div>
                        <p className="text-sm text-purple-700 mb-3">{selectedModel.description}</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-purple-600">Cost:</span>
                            <span className="font-medium text-purple-900">{selectedModel.cost}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-600">Temperature:</span>
                            <span className="font-medium text-purple-900">{formData.temperature}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-600">Max Tokens:</span>
                            <span className="font-medium text-purple-900">{formData.maxTokens}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Status */}
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Chatbot Status</Label>
                          <p className="text-xs text-muted-foreground">Activate when ready</p>
                        </div>
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked) => updateFormData('isActive', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Form Actions */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Create Chatbot
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