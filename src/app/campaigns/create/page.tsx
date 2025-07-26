// src/app/campaigns/create/page.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Rocket,
  Save,
  Send,
  Sparkles,
  Target,
  Users,
  MessageSquare,
  BarChart,
  Info,
  Loader2,
  FileCog,
  Bell,
  Award,
  Search,
  Clock,
  Filter,
  FileText,
  CheckCircle2,
  CircleAlert,
  Globe,
  AlertTriangle,
  AlertCircle,
  ArrowUpRight,
  Plus,
  X,
  Trash,
  ArrowRight,
  MessageCircle,
  Reply,
  Workflow,
  UserX,
} from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import AudienceFilter from "@/components/filters/AudienceFilter";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { calculateMessagePrice, formatCurrency } from "@/lib/pricing";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { BiCalendar } from "react-icons/bi";

// Campaign type definition
interface Campaign {
  id?: string;
  name: string;
  type: "ongoing" | "one-time";
  audience: {
    filters: any;
    count: number;
    selectedContacts?: string[];
  };
  message: {
    type?: "template" | "custom"; // Add message type
    template: string;
    customMessage?: string; // Add custom message field
    variables: any[];
  };
  responseHandling: {
    enabled: boolean;
    keywords?: Array<{
      trigger: string;
      matchType: string;
      response: string;
    }>;
    defaultResponse?: string;
    forwardToEmail?: boolean;
    forwardEmail?: string;
    flows: any[];
  };
  conversionTracking: {
    enabled: boolean;
    goals: string[];
    methods?: string[];
    attributionWindow?: number;
  };
  schedule: {
    sendTime: string;
    timezone: string;
  };
  retries: {
    enabled: boolean;
    count: number;
    interval: number;
  };
  status: "draft" | "scheduled" | "active" | "paused";
}

interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
  isCompleted: boolean;
  isRequired: boolean;
  badgeText?: string;
}

// Custom field type
interface CustomField {
  id: string;
  name: string;
  key: string;
  type: 'Text' | 'Number' | 'Date' | 'Dropdown';
  required: boolean;
  options?: string[];
  defaultValue?: any;
  active: boolean;
}

// Template type
interface Template {
  id: string;
  name: string;
  content: string;
  variables: string[];
  category: string;
  status: string;
}

// Contact type
interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsappOptIn: boolean;
  tags: string[];
  notes?: string;
  lastMessageAt?: string;
  createdAt: string;
  customFields?: Record<string, any>;
}

// Timezone type
interface Timezone {
  value: string;
  label: string;
  offset: string;
}

// Cost estimator component
function CostEstimator({
  audienceCount,
  templateCategory = "MARKETING",
  templateId,
  companyBalance
}: {
  audienceCount: number;
  templateCategory?: string;
  templateId?: string;
  companyBalance?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | undefined>(companyBalance);
  const [estimatedCost, setEstimatedCost] = useState<{
    perMessage: number;
    total: number;
    breakdown: {
      basePrice: number;
      gst: number;
      markup: number;
    };
  }>({
    perMessage: 0,
    total: 0,
    breakdown: {
      basePrice: 0,
      gst: 0,
      markup: 0
    }
  });



  // Get wallet balance if not provided
  useEffect(() => {
    if (companyBalance === undefined) {
      const fetchWalletBalance = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/wallet/balance');
          const data = await response.json();

          if (data.success) {
            setWalletBalance(data.walletBalance);
          }
        } catch (error) {
          console.error('Error fetching wallet balance:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchWalletBalance();
    }
  }, [companyBalance]);



  // Calculate cost whenever audience or template changes
  useEffect(() => {
    if (!templateCategory) return;

    const pricing = calculateMessagePrice(templateCategory);

    setEstimatedCost({
      perMessage: pricing.totalPrice,
      total: pricing.totalPrice * audienceCount,
      breakdown: {
        basePrice: pricing.basePrice,
        gst: pricing.gstPrice,
        markup: pricing.markupPrice
      }
    });
  }, [audienceCount, templateCategory]);

  // Check if balance is sufficient
  const isBalanceSufficient = walletBalance !== undefined && walletBalance >= estimatedCost.total;

  // Calculate percentage of wallet that will be used
  const usagePercentage = walletBalance && walletBalance > 0
    ? Math.min((estimatedCost.total / walletBalance) * 100, 100)
    : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center">
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span>Loading cost information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Estimated Campaign Cost
          {templateId && (
            <Badge variant="outline" className="ml-2 text-xs font-normal">
              {templateCategory?.toLowerCase()}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Based on your selected audience and message template
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {!templateId && (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Select a template</AlertTitle>
              <AlertDescription>
                Select a message template to see accurate pricing
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Cost per message</div>
              <div className="font-semibold">{formatCurrency(estimatedCost.perMessage)}</div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Total audience</div>
              <div className="font-semibold">{audienceCount} contacts</div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Total cost</span>
              <span className="text-lg font-semibold">{formatCurrency(estimatedCost.total)}</span>
            </div>

            <div className="text-xs text-muted-foreground">
              Includes GST ({formatCurrency(estimatedCost.breakdown.gst * audienceCount)})
            </div>
          </div>

          {walletBalance !== undefined && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Wallet balance</span>
                <span className="font-medium">{formatCurrency(walletBalance)}</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Campaign cost</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(estimatedCost.total)}
                    ({usagePercentage.toFixed(0)}% of balance)
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
              </div>

              {!isBalanceSufficient && (
                <Alert variant="destructive" className="mt-3">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertTitle>Insufficient balance</AlertTitle>
                  <AlertDescription>
                    You need {formatCurrency(estimatedCost.total - (walletBalance || 0))} more to launch this campaign
                  </AlertDescription>
                </Alert>
              )}

              {isBalanceSufficient && (
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  <span>Sufficient balance to launch</span>
                </div>
              )}
            </div>
          )}

          {walletBalance === undefined && (
            <Button variant="outline" className="w-full mt-2" onClick={() => window.location.href = '/wallet'}>
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Add Funds to Wallet
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const timezones: Timezone[] = [
  { value: "UTC", label: "UTC", offset: "+00:00" },
  { value: "America/New_York", label: "New York", offset: "-05:00" },
  { value: "America/Los_Angeles", label: "Los Angeles", offset: "-08:00" },
  { value: "Europe/London", label: "London", offset: "+00:00" },
  { value: "Europe/Paris", label: "Paris", offset: "+01:00" },
  { value: "Asia/Tokyo", label: "Tokyo", offset: "+09:00" },
  { value: "Asia/Dubai", label: "Dubai", offset: "+04:00" },
  { value: "Asia/Singapore", label: "Singapore", offset: "+08:00" },
  { value: "Australia/Sydney", label: "Sydney", offset: "+10:00" },
];

// Add the complete ResponseHandlingSection component within your main component:
// Update the ResponseHandlingSection component to match modern design
const ResponseHandlingSection = ({
  responseHandling,
  setResponseHandling,
  setCampaign,
  campaign,
  setActiveStep,
  contentRef,
  setSteps,
  steps,
  availableTemplates,
  availableWorkflows,
  templateButtons
}) => {
  const handleContinue = () => {
    console.log("Continue button clicked");

    // Update the campaign with response handling data
    setCampaign(prev => ({
      ...prev,
      responseHandling: responseHandling
    }));

    // Mark the step as completed - use find instead of array index
    setSteps(prevSteps => {
      return prevSteps.map(step =>
        step.id === 3 ? { ...step, isCompleted: true } : step
      );
    });
    // Navigate to the next step
    setActiveStep(4);

    // Scroll to content if needed
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-slate-900">
              Response Handling
            </CardTitle>
            <CardDescription className="text-slate-600">
              Configure how to handle customer responses to your campaign messages
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <div className="flex-1 px-6 py-6">
        <div className="space-y-8">
          {/* Main toggle */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Response Settings
              </h3>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <Label htmlFor="enable-response" className="text-sm font-medium text-slate-800">
                    Enable Response Handling
                  </Label>
                  <p className="text-xs text-slate-600">
                    Automatically handle customer responses to campaign messages
                  </p>
                </div>
              </div>
              <Switch
                id="enable-response"
                checked={responseHandling.enabled}
                onCheckedChange={(checked) =>
                  setResponseHandling(prev => ({ ...prev, enabled: checked }))
                }
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>

          {responseHandling.enabled && (
            <>
              {/* Auto Reply Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Auto Reply
                  </h3>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Reply className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="auto-reply" className="text-sm font-medium text-green-800">
                        Send Automatic Reply
                      </Label>
                      <p className="text-xs text-green-600">
                        Send an automatic response to any customer message
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="auto-reply"
                    checked={responseHandling.autoReply.enabled}
                    onCheckedChange={(checked) =>
                      setResponseHandling(prev => ({
                        ...prev,
                        autoReply: { ...prev.autoReply, enabled: checked }
                      }))
                    }
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>

                {responseHandling.autoReply.enabled && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pl-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Reply Type
                      </Label>
                      <Select
                        value={responseHandling.autoReply.templateId ? 'template' : 'text'}
                        onValueChange={(value) => {
                          if (value === 'text') {
                            setResponseHandling(prev => ({
                              ...prev,
                              autoReply: {
                                ...prev.autoReply,
                                templateId: '',
                                templateName: ''
                              }
                            }));
                          }
                        }}
                      >
                        <SelectTrigger className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20">
                          <SelectValue placeholder="Select reply type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text Message</SelectItem>

                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Delay (minutes)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="1440"
                        value={responseHandling.autoReply.delay}
                        onChange={(e) =>
                          setResponseHandling(prev => ({
                            ...prev,
                            autoReply: { ...prev.autoReply, delay: parseInt(e.target.value) || 0 }
                          }))
                        }
                        placeholder="0"
                        className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                      />
                      <p className="text-xs text-slate-500">
                        How long to wait before sending the auto reply
                      </p>
                    </div>

                    {responseHandling.autoReply.templateId ? (
                      <div className="space-y-2 lg:col-span-2">
                        <Label className="text-sm font-medium text-slate-700">
                          Select Template
                        </Label>
                        <Select
                          value={responseHandling.autoReply.templateId}
                          onValueChange={(value) => {
                            const template = availableTemplates.find((t: any) => t._id === value);
                            setResponseHandling(prev => ({
                              ...prev,
                              autoReply: {
                                ...prev.autoReply,
                                templateId: value,
                                templateName: template?.name || ''
                              }
                            }));
                          }}
                        >
                          <SelectTrigger className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20">
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTemplates.map((template: any) => (
                              <SelectItem key={template._id} value={template._id}>
                                {template.name} ({template.category})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-2 lg:col-span-2">
                        <Label className="text-sm font-medium text-slate-700">
                          Auto Reply Message
                        </Label>
                        <Textarea
                          value={responseHandling.autoReply.message}
                          onChange={(e) => {
                            const value = e.target.value;
                            setResponseHandling(prev => ({
                              ...prev,
                              autoReply: {
                                ...prev.autoReply,
                                message: value
                              }
                            }));
                          }}
                          placeholder="Thank you for your response. We'll get back to you soon!"
                          className="min-h-[100px] bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Opt-out Section - Only show if there are template buttons */}
              {templateButtons.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      Customer Opt-out
                    </h3>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
                        <UserX className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <Label htmlFor="opt-out" className="text-sm font-medium text-amber-800">
                          Handle Opt-out Requests
                        </Label>
                        <p className="text-xs text-amber-600">
                          Process opt-out requests from template button clicks
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="opt-out"
                      checked={responseHandling.optOut.enabled}
                      onCheckedChange={(checked) =>
                        setResponseHandling(prev => ({
                          ...prev,
                          optOut: { ...prev.optOut, enabled: checked }
                        }))
                      }
                      className="data-[state=checked]:bg-amber-600"
                    />
                  </div>

                  {responseHandling.optOut.enabled && (
                    <div className="space-y-6 pl-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          Select Opt-out Buttons
                        </Label>
                        <p className="text-xs text-slate-500">
                          Choose which quick reply buttons should trigger customer opt-out
                        </p>
                        <div className="space-y-3 max-h-32 overflow-y-auto p-4 bg-white rounded-lg border border-slate-200">
                          {templateButtons.map((button: any, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Checkbox
                                id={`button-${index}`}
                                checked={responseHandling.optOut.triggerButtons.includes(button.payload)}
                                onCheckedChange={(checked) => {
                                  setResponseHandling(prev => ({
                                    ...prev,
                                    optOut: {
                                      ...prev.optOut,
                                      triggerButtons: checked
                                        ? [...prev.optOut.triggerButtons, button.payload]
                                        : prev.optOut.triggerButtons.filter(p => p !== button.payload)
                                    }
                                  }));
                                }}
                                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                              />
                              <Label
                                htmlFor={`button-${index}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {button.text}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          Acknowledgment Message
                        </Label>
                        <Textarea
                          value={responseHandling.optOut.acknowledgmentMessage}
                          onChange={(e) =>
                            setResponseHandling(prev => ({
                              ...prev,
                              optOut: { ...prev.optOut, acknowledgmentMessage: e.target.value }
                            }))
                          }
                          placeholder="Thank you. You have been unsubscribed from our messages."
                          className="min-h-[80px] bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                        />
                        <p className="text-xs text-slate-500">
                          This message will be sent to customers who opt out
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="update-contact"
                          checked={responseHandling.optOut.updateContact}
                          onCheckedChange={(checked) =>
                            setResponseHandling(prev => ({
                              ...prev,
                              optOut: { ...prev.optOut, updateContact: checked as boolean }
                            }))
                          }
                          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <Label htmlFor="update-contact" className="text-sm">
                          Automatically update contact opt-in status
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CardFooter className="px-6 py-4 justify-between w-full flex border-t border-slate-100 flex-shrink-0 bg-white">
        <Button
          variant="outline"
          onClick={() => setActiveStep(2)}
          className="hover:bg-slate-50"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};


const CreateCampaignPage = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [audienceCount, setAudienceCount] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Contact data state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  // Add state for custom retry date
  const [customRetryDate, setCustomRetryDate] = useState<string>('');
  const [showCustomRetryDate, setShowCustomRetryDate] = useState(false);
  // Filter data state
  const [tags, setTags] = useState<string[]>([]);
  const [traitFields, setTraitFields] = useState<any[]>([]);
  const [eventFields, setEventFields] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>("MARKETING");
  const [walletBalance, setWalletBalance] = useState<number | undefined>(undefined);
  // Add countdown dialog state
  const [showCountdownDialog, setShowCountdownDialog] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [launchedCampaignId, setLaunchedCampaignId] = useState<string | null>(null);
  const [launchedCampaignData, setLaunchedCampaignData] = useState<any>(null);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
  // Add state for selected contacts
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // Add state for keyword responses
  const [newKeyword, setNewKeyword] = useState({
    trigger: '',
    matchType: 'contains',
    response: ''
  });

  // Add state for custom goal
  const [customGoal, setCustomGoal] = useState('');

  // Campaign state
  const [campaign, setCampaign] = useState<Campaign>({
    name: "",
    type: "one-time",
    audience: {
      filters: {},
      count: 0,
      selectedContacts: [],
    },
    message: {
      type: "template", // Default to template type
      template: "",
      customMessage: "", // Add separate field for custom message
      variables: [],
    },
    responseHandling: {
      enabled: false,
      keywords: [], // Add keywords array
      defaultResponse: "", // Add default response
      forwardToEmail: false, // Add email forwarding option
      forwardEmail: "", // Add email for forwarding
      flows: [],
    },
    conversionTracking: {
      enabled: false,
      goals: [],
      methods: ["link"], // Default to link tracking
      attributionWindow: 7, // Default to 7-day attribution window
    },
    schedule: {
      sendTime: "",
      timezone: "UTC",
    },
    retries: {
      enabled: false,
      count: 3,
      interval: 60,
    },
    status: "draft",
  });
  const [responseHandling, setResponseHandling] = useState({
    enabled: false,
    autoReply: {
      enabled: false,
      message: '',
      templateId: '',
      templateName: '',
      delay: 0
    },
    workflow: {
      enabled: false,
      workflowId: '',
      workflowName: '',
      triggerDelay: 0
    },
    optOut: {
      enabled: false,
      triggerButtons: [] as string[],
      acknowledgmentMessage: 'Thank you. You have been unsubscribed from our messages.',
      updateContact: true
    }
  });

  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [availableWorkflows, setAvailableWorkflows] = useState([]);
  const [templateButtons, setTemplateButtons] = useState<any[]>([]);
  const [selectedWabaId, setSelectedWabaId] = useState<string>("");
  const [wabaAccounts, setWabaAccounts] = useState<WabaAccount[]>([]);
  // Add state for contact groups
  const [contactGroups, setContactGroups] = useState<any[]>([]);
  const [isLoadingContactGroups, setIsLoadingContactGroups] = useState(false);


  useEffect(() => {
    if (!selectedWabaId) return;          // wait until we have one
    fetchTemplateButtons();               // ← still depends on template id
    fetchTemplatesAndWorkflows();
  }, [selectedWabaId, campaign.message.template]);

  useEffect(() => {
    fetchWabaAccounts();
  }, []);

  const fetchWabaAccounts = async () => {
    try {
      const response = await fetch('/api/waba-accounts');
      const data = await response.json();
      if (data.success) {
        setWabaAccounts(data.accounts);
        if (data.accounts.length > 0) {
          setSelectedWabaId(data.accounts[0].wabaId);
        }
      }
    } catch (error) {
      console.error('Error fetching WABA accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch WhatsApp accounts",
        variant: "destructive",
      });
    }
  };

  // Add useEffect to fetch contact groups
  useEffect(() => {
    fetchContactGroups();
  }, []);

  // Add function to fetch contact groups
  const fetchContactGroups = async () => {
    setIsLoadingContactGroups(true);
    try {
      const response = await fetch('/api/contact-groups?includeContacts=false');
      const data = await response.json();

      if (data.success) {
        setContactGroups(data.groups || []);
      } else {
        console.error('Failed to fetch contact groups:', data.error);
      }
    } catch (error) {
      console.error('Error fetching contact groups:', error);
    } finally {
      setIsLoadingContactGroups(false);
    }
  };

  const fetchTemplatesAndWorkflows = async () => {

    try {
      // Fetch templates
      const templatesResponse = await fetch(`/api/templates`);
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setAvailableTemplates(templatesData.templates || []);
      }
      // Fetch workflows
      const workflowsResponse = await fetch(`/api/workflows?wabaId=${selectedWabaId}`);
      if (workflowsResponse.ok) {
        const workflowsData = await workflowsResponse.json();
        setAvailableWorkflows(workflowsData.workflows || []);
      }
    } catch (error) {
      console.error('Error fetching templates and workflows:', error);
    }
  };

  const fetchTemplateButtons = async () => {
    if (!campaign.message.template) return;

    try {
      const response = await fetch(`/api/templates/${campaign.message.template}`);
      if (response.ok) {
        const data = await response.json();
        const template = data.template;

        // Extract quick reply buttons from template
        const buttons =
          template.components
            ?.find((c: any) => c.type === 'BUTTONS')
            ?.buttons?.filter((b: any) => b.type === 'QUICK_REPLY')
            // keep both the visible text and the payload (id)
            ?.map((b: any) => ({
              text: b.text,                 // what users see
              payload: b.payload || b.id || b.text  // what WA sends back
            })) || [];

        setTemplateButtons(buttons);

      }
    } catch (error) {
      console.error('Error fetching template buttons:', error);
    }
  };
  console.log(templateButtons, 'okay', responseHandling, 'response handling');

  // Add a function to synchronize the responseHandling state with the campaign
  const updateCampaignResponseHandling = () => {
    setCampaign(prev => ({
      ...prev,
      responseHandling: responseHandling
    }));
  };
  // Make sure to call this when navigating away from the response handling section
  useEffect(() => {
    if (activeStep !== 3 && campaign.responseHandling !== responseHandling) {
      updateCampaignResponseHandling();
    }
  }, [activeStep]);

  // Steps configuration
  const [steps, setSteps] = useState([
    { id: 1, title: "Audience", icon: Users, isCompleted: false, isRequired: true },
    { id: 2, title: "Message", icon: MessageSquare, isCompleted: false, isRequired: true },
    { id: 3, title: "Response Handling", icon: Bell, isCompleted: false, isRequired: false, badgeText: "Recommended" },

    { id: 4, title: "Schedule", icon: BiCalendar, isCompleted: false, isRequired: true },
    { id: 5, title: "Retries", icon: RefreshCw, isCompleted: false, isRequired: false, badgeText: "Optional" },
    { id: 6, title: "Review", icon: Rocket, isCompleted: false, isRequired: true },
  ]);

  // Fetch initial data on component mount
  useEffect(() => {
    Promise.all([
      fetchContacts(),
      fetchCustomFields(),
      fetchTemplates(),
      fetchWalletBalance()
    ]).then(() => {
      setIsLoading(false);
    }).catch(error => {
      console.error("Error loading initial data:", error);
      setIsLoading(false);
    });
  }, []);

  // Cleanup countdown interval on component unmount
  useEffect(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [countdownInterval]);

  useEffect(() => {
    // Mark steps as completed based on campaign state
    const updatedSteps = [...steps];

    // Step 1: Audience
    updatedSteps[0].isCompleted = Boolean(
      campaign.name &&
      campaign.audience.count > 0
    );

    // Step 2: Message
    updatedSteps[1].isCompleted = Boolean(
      (campaign.message.type === "template" && campaign.message.template) ||
      (campaign.message.type === "custom" && campaign.message.customMessage)
    );

    // Step 3: Response Handling
    // Mark as completed if it's enabled or if we've visited and explicitly disabled it
    updatedSteps[2].isCompleted = Boolean(
      activeStep > 3 ||
      (responseHandling.enabled && (
        (responseHandling.autoReply.enabled) ||
        (responseHandling.workflow.enabled) ||
        (responseHandling.optOut.enabled)
      ))
    );



    // Step 5: Schedule
    updatedSteps[3].isCompleted = Boolean(
      activeStep > 4 ||
      campaign.schedule.sendTime ||
      activeStep === 4
    );

    // Step 6: Retries
    // Mark as completed if retries are configured or if we've visited and explicitly disabled them
    updatedSteps[4].isCompleted = Boolean(
      activeStep > 5 ||
      campaign.retries.enabled ||
      activeStep === 5
    );

    // Step 7: Review
    updatedSteps[5].isCompleted = activeStep === 6;

    // Update steps state only if there are changes
    if (JSON.stringify(updatedSteps) !== JSON.stringify(steps)) {
      setSteps(updatedSteps);
    }
  }, [campaign, activeStep, responseHandling, steps]);



  // Add this useEffect to debug contact data
  useEffect(() => {
    console.log('📊 Contact Debug Info:', {
      totalContacts: contacts.length,
      filteredContacts: filteredContacts.length,
      selectedContacts: selectedContacts.length,
      contactsWithWhatsappOptIn: contacts.filter(c => c.whatsappOptIn).length,
      filteredContactsWithWhatsappOptIn: filteredContacts.filter(c => c.whatsappOptIn).length,
      campaignAudienceFilters: campaign.audience.filters,
      campaignAudienceCount: campaign.audience.count,
      sampleContacts: contacts.slice(0, 3).map(c => ({
        id: c.id,
        name: c.name,
        whatsappOptIn: c.whatsappOptIn,
        tags: c.tags
      }))
    });
  }, [contacts, filteredContacts, selectedContacts, campaign.audience]);

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      const response = await fetch('/api/wallet/balance');
      const data = await response.json();

      if (data.success) {
        setWalletBalance(data.walletBalance);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  // Extract tags from contacts
  useEffect(() => {
    if (contacts.length > 0) {
      const tagsSet = new Set<string>();
      contacts.forEach(contact => {
        if (contact.tags && Array.isArray(contact.tags)) {
          contact.tags.forEach((tag: string) => tagsSet.add(tag));
        }
      });
      setTags(Array.from(tagsSet));
    }
  }, [contacts]);

  // Set up trait fields based on custom fields
  useEffect(() => {
    // Build trait fields from system properties and custom fields
    const baseTraitFields = [
      { label: "Name", key: "name", type: "text" as const },
      { label: "Email", key: "email", type: "text" as const },
      { label: "Phone", key: "phone", type: "text" as const },
      { label: "Last Contact", key: "lastMessageAt", type: "date" as const },
      { label: "Created At", key: "createdAt", type: "date" as const },
    ];

    // Convert custom fields to trait fields
    const customFieldTraits = customFields.map(field => ({
      label: field.name,
      key: `customField.${field.key}`,
      type: field.type.toLowerCase() as "text" | "number" | "date" | "select",
      options: field.options
    }));

    setTraitFields([...baseTraitFields, ...customFieldTraits]);

    // Set event fields
    setEventFields([
      { label: "Message Sent", key: "messageSent", type: "date" as const },
      { label: "Message Received", key: "messageReceived", type: "date" as const },
      { label: "Clicked Link", key: "clickedLink", type: "date" as const },
      { label: "Conversion", key: "conversion", type: "date" as const }
    ]);
  }, [customFields]);

  // Calculate progress
  const calculateProgress = () => {
    const totalRequiredSteps = steps.filter(step => step.isRequired).length;
    const completedRequiredSteps = steps.filter(step => step.isRequired && step.isCompleted).length;
    return Math.round((completedRequiredSteps / totalRequiredSteps) * 100);
  };

  // Complete updated toggleContactSelection function
  const toggleContactSelection = (contactId: string) => {
    const contact = filteredContacts.find(c => (c._id || c.id) === contactId);

    // Prevent selection of opted-out contacts
    if (!contact?.whatsappOptIn) {
      toast({
        title: "Cannot Select Contact",
        description: "This contact has opted out of WhatsApp communications and cannot receive campaigns.",
        variant: "destructive",
      });
      return;
    }

    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );

    // Update campaign audience count and selected contacts
    setCampaign(prev => {
      const newSelectedContacts = prev.audience.selectedContacts?.includes(contactId)
        ? prev.audience.selectedContacts.filter(id => id !== contactId)
        : [...(prev.audience.selectedContacts || []), contactId];

      return {
        ...prev,
        audience: {
          ...prev.audience,
          selectedContacts: newSelectedContacts,
          count: prev.audience.filters && Object.keys(prev.audience.filters).length > 0
            ? filteredContacts.filter(c => c.whatsappOptIn).length
            : newSelectedContacts.length
        }
      };
    });
  };

  // Complete updated toggleSelectAll function
  const toggleSelectAll = () => {
    // Only work with opted-in contacts
    const optedInContacts = filteredContacts.filter(c => c.whatsappOptIn);
    const optedInContactIds = optedInContacts.map(contact => contact._id || contact.id);

    if (selectedContacts.length === optedInContactIds.length &&
      optedInContactIds.every(id => selectedContacts.includes(id))) {
      // Deselect all
      setSelectedContacts([]);
      setCampaign(prev => ({
        ...prev,
        audience: {
          ...prev.audience,
          selectedContacts: [],
          count: 0
        }
      }));
    } else {
      // Select all opted-in contacts
      setSelectedContacts(optedInContactIds);
      setCampaign(prev => ({
        ...prev,
        audience: {
          ...prev.audience,
          selectedContacts: optedInContactIds,
          count: optedInContactIds.length
        }
      }));
    }

    // Show info if there are opted-out contacts
    const optedOutCount = filteredContacts.length - optedInContacts.length;
    if (optedOutCount > 0) {
      toast({
        title: "Selection Updated",
        description: `Selected ${optedInContactIds.length} contacts. ${optedOutCount} opted-out contacts excluded.`,
      });
    }
  };


  // Update the useEffect that handles filter changes
  useEffect(() => {
    if (Object.keys(campaign.audience.filters).length > 0) {
      // When filters are applied, don't reset selection, just use filtered count
      setCampaign(prev => ({
        ...prev,
        audience: {
          ...prev.audience,
          // Keep selectedContacts for when filters are removed
          count: filteredContacts.length
        }
      }));
    } else {
      // When no filters, use selected contacts
      setCampaign(prev => ({
        ...prev,
        audience: {
          ...prev.audience,
          count: selectedContacts.length,
          selectedContacts: selectedContacts
        }
      }));
    }
  }, [filteredContacts.length, selectedContacts.length]); // More specific dependencies

  // Complete updated fetchContacts function
  const fetchContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const response = await fetch('/api/contacts');
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();

      if (data.success) {
        const allContacts = data.contacts || [];
        const optedInContacts = allContacts.filter(c => c.whatsappOptIn);

        setContacts(allContacts);
        setFilteredContacts(allContacts); // Show all for visibility
        setAudienceCount(optedInContacts.length); // But count only opted-in

        console.log('📊 Contacts loaded:', {
          total: allContacts.length,
          optedIn: optedInContacts.length,
          optedOut: allContacts.length - optedInContacts.length
        });

        // Update campaign with initial opted-in audience count
        setCampaign(prev => ({
          ...prev,
          audience: {
            ...prev.audience,
            count: optedInContacts.length
          }
        }));
      } else {
        throw new Error(data.error || 'Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Fetch custom fields
  const fetchCustomFields = async () => {
    try {
      const response = await fetch('/api/custom-fields');
      const data = await response.json();

      if (data.success) {
        setCustomFields(data.fields || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to load custom fields",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      toast({
        title: "Error",
        description: "Failed to load custom fields",
        variant: "destructive",
      });
    }
  };

  // Fetch message templates
  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to load message templates",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load message templates",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Complete updated handleApplyFilters function
  const handleApplyFilters = (filters: any) => {
    console.log('🎯 Applying filters:', filters);

    let filtered = [...contacts];

    // Log initial state
    console.log('📊 Initial contacts:', {
      total: filtered.length,
      withWhatsappOptIn: filtered.filter(c => c.whatsappOptIn).length
    });

    // ALWAYS filter out opted-out contacts first (this should happen regardless of any checkbox)
    const beforeOptOutFilter = filtered.length;
    filtered = filtered.filter(contact => contact.whatsappOptIn === true);

    console.log('📱 After removing opted-out contacts:', {
      before: beforeOptOutFilter,
      after: filtered.length,
      removed: beforeOptOutFilter - filtered.length
    });

    // Apply contact groups filter
    if (filters.contactGroups && filters.contactGroups.length > 0) {
      console.log('👥 Applying contact groups filter:', filters.contactGroups);

      const selectedGroupContacts = new Set<string>();
      filters.contactGroups.forEach((groupId: string) => {
        const group = contactGroups.find(g => g.id === groupId);
        if (group && group.contacts) {
          group.contacts.forEach((contactId: string) => {
            selectedGroupContacts.add(contactId);
          });
        }
      });

      // Filter contacts to only include those in selected groups
      const beforeGroupFilter = filtered.length;
      filtered = filtered.filter(contact => selectedGroupContacts.has(contact._id || contact.id));

      console.log('👥 After contact groups filter:', {
        before: beforeGroupFilter,
        after: filtered.length
      });
    }

    // Apply tag filters
    if (filters.tags && filters.tags.length > 0) {
      console.log('🏷️ Applying tags filter:', filters.tags);
      const beforeTagFilter = filtered.length;

      filtered = filtered.filter(contact => {
        return filters.tags.every((tag: string) =>
          contact.tags && contact.tags.includes(tag)
        );
      });

      console.log('🏷️ After tags filter:', {
        before: beforeTagFilter,
        after: filtered.length
      });
    }

    // Apply conditions (existing logic)
    if (filters.conditionGroups && filters.conditionGroups.length > 0) {
      console.log('📋 Applying condition groups:', filters.conditionGroups);
      const beforeConditionsFilter = filtered.length;

      filtered = filtered.filter(contact => {
        // Group evaluation logic
        const groupResults = filters.conditionGroups.map((group: any) => {
          const { conditions, operator } = group;

          if (conditions.length === 0) return true;

          const conditionResults = conditions.map((condition: any) => {
            let fieldValue;

            // Handle custom fields
            if (condition.field && condition.field.startsWith('customField.')) {
              const fieldKey = condition.field.replace('customField.', '');
              fieldValue = contact.customFields?.[fieldKey];
            } else {
              // Handle regular fields
              fieldValue = contact[condition.field];
            }

            let conditionMet = false;

            switch (condition.operator) {
              case "equals":
                conditionMet = fieldValue === condition.value;
                break;
              case "not_equals":
                conditionMet = fieldValue !== condition.value;
                break;
              case "contains":
                conditionMet = fieldValue && String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
                break;
              case "not_contains":
                conditionMet = !fieldValue || !String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
                break;
              case "starts_with":
                conditionMet = fieldValue && String(fieldValue).toLowerCase().startsWith(String(condition.value).toLowerCase());
                break;
              case "ends_with":
                conditionMet = fieldValue && String(fieldValue).toLowerCase().endsWith(String(condition.value).toLowerCase());
                break;
              case "greater_than":
                conditionMet = fieldValue > condition.value;
                break;
              case "less_than":
                conditionMet = fieldValue < condition.value;
                break;
              case "is_unknown":
                conditionMet = !fieldValue || fieldValue === null || fieldValue === undefined || fieldValue === '';
                break;
              case "has_any_value":
                conditionMet = fieldValue && fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
                break;
              // Add date operators
              case "after":
              case "on":
              case "before":
              case "more_than":
              case "exactly":
              case "less_than":
                // Handle date comparisons
                if (fieldValue && condition.value) {
                  const fieldDate = new Date(fieldValue);
                  const conditionDate = typeof condition.value === 'number'
                    ? new Date(Date.now() - (condition.value * 24 * 60 * 60 * 1000))
                    : new Date(condition.value);

                  switch (condition.operator) {
                    case "after":
                      conditionMet = fieldDate > conditionDate;
                      break;
                    case "on":
                      conditionMet = fieldDate.toDateString() === conditionDate.toDateString();
                      break;
                    case "before":
                      conditionMet = fieldDate < conditionDate;
                      break;
                    case "more_than":
                      conditionMet = fieldDate < conditionDate;
                      break;
                    case "exactly":
                      conditionMet = fieldDate.toDateString() === conditionDate.toDateString();
                      break;
                    case "less_than":
                      conditionMet = fieldDate > conditionDate;
                      break;
                  }
                }
                break;
              default:
                conditionMet = false;
            }

            return conditionMet;
          });

          // Combine conditions within the group
          if (operator === "OR") {
            return conditionResults.some(result => result);
          } else {
            return conditionResults.every(result => result);
          }
        });

        // Combine groups
        if (filters.groupOperator === "OR") {
          return groupResults.some(result => result);
        } else {
          return groupResults.every(result => result);
        }
      });

      console.log('📋 After conditions filter:', {
        before: beforeConditionsFilter,
        after: filtered.length
      });
    }

    console.log('🎯 Final filtered result:', {
      totalFiltered: filtered.length,
      allHaveWhatsappOptIn: filtered.every(c => c.whatsappOptIn),
      sampleContacts: filtered.slice(0, 3).map(c => ({
        id: c._id || c.id,
        name: c.name,
        whatsappOptIn: c.whatsappOptIn,
        tags: c.tags
      }))
    });

    // Clear individual contact selection when using filters
    setSelectedContacts([]);
    setFilteredContacts(filtered);
    setAudienceCount(filtered.length);

    // Update campaign audience - DON'T send the whatsappOptedIn flag to backend
    const filtersForBackend = {
      ...filters
      // Remove whatsappOptedIn from filters since we handle it automatically
      // The backend will always filter for whatsappOptIn: true
    };
    delete filtersForBackend.whatsappOptedIn;

    setCampaign(prev => ({
      ...prev,
      audience: {
        filters: filtersForBackend,
        count: filtered.length,
        selectedContacts: [] // Clear selected contacts when using filters
      }
    }));

    toast({
      title: "Success",
      description: `Audience filtered to ${filtered.length} contacts (opted-out contacts excluded)`,
    });
  };


  // Select template
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Update template category for cost calculation
      setSelectedTemplateCategory(template.category || "MARKETING");

      // Fix: Check if variables field exists and correctly parse it
      let templateVariables = [];
      if (typeof template.variables === 'number' && template.variables > 0) {
        // Handle case where variables is just a count
        templateVariables = Array.from({ length: template.variables }, (_, i) => ({
          name: `Variable ${i + 1}`,
          value: ""
        }));
      } else if (Array.isArray(template.variables)) {
        // Handle case where variables is already an array
        templateVariables = template.variables.map(variable => ({
          name: variable,
          value: ""
        }));
      }

      setCampaign(prev => ({
        ...prev,
        message: {
          ...prev.message,
          type: "template", // Set type to template
          template: templateId,
          customMessage: "", // Clear custom message when selecting a template
          variables: templateVariables
        }
      }));
    }
  };

  // Update template variable
  const handleVariableUpdate = (variableName: string, value: string) => {
    setCampaign(prev => ({
      ...prev,
      message: {
        ...prev.message,
        variables: prev.message.variables.map(variable =>
          variable.name === variableName
            ? { ...variable, value }
            : variable
        )
      }
    }));
  };

  // Update completeStep function to handle renumbered steps
  const completeStep = (stepId: number) => {
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, isCompleted: true } : step
      )
    );

    // Move to next step (based on ID, not array index)
    const currentStepIndex = steps.findIndex(step => step.id === stepId);
    if (currentStepIndex !== -1 && currentStepIndex < steps.length - 1) {
      // Find the ID of the next step
      const nextStepId = steps[currentStepIndex + 1].id;
      setActiveStep(nextStepId);
    }

    // Scroll to content
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  // Complete updated saveCampaignAsDraft function
  const saveCampaignAsDraft = async () => {
    if (!campaign.name) {
      toast({
        title: "Error",
        description: "Please provide a campaign name",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Determine final audience based on filters vs selection
      const finalAudience = {
        ...campaign.audience,
        selectedContacts: Object.keys(campaign.audience.filters).length > 0
          ? [] // When using filters, don't send selectedContacts
          : selectedContacts.filter(contactId => {
            // Only include opted-in contacts
            const contact = contacts.find(c => (c._id || c.id) === contactId);
            return contact?.whatsappOptIn;
          })
      };

      const campaignToSave = {
        ...campaign,
        responseHandling,
        audience: finalAudience,
        status: 'draft'
      };

      console.log('💾 Saving campaign with audience:', finalAudience);

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to save campaign');
      }

      toast({
        title: "Success",
        description: "Campaign saved as draft",
      });

      // Redirect after successful save
      setTimeout(() => {
        router.push('/campaigns');
      }, 1000);

    } catch (error) {
      console.error('Error saving campaign:', error);
      toast({
        title: "Error",
        description: "Failed to save campaign",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Complete updated launchCampaign function
  const launchCampaign = async () => {
    // Validate required fields
    if (!campaign.name) {
      toast({
        title: "Error",
        description: "Please provide a campaign name",
        variant: "destructive",
      });
      return;
    }

    if (campaign.audience.count === 0) {
      toast({
        title: "Error",
        description: "Your audience is empty. Please adjust your filters or select contacts.",
        variant: "destructive",
      });
      return;
    }

    if ((!campaign.message.type || campaign.message.type === "template") && !campaign.message.template) {
      toast({
        title: "Error",
        description: "Please select a message template",
        variant: "destructive",
      });
      return;
    }

    if (campaign.message.type === "custom" && !campaign.message.customMessage) {
      toast({
        title: "Error",
        description: "Please enter your custom message content",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Calculate expected cost for opted-in contacts only
      const messagePrice = calculateMessagePrice(selectedTemplateCategory);
      const eligibleContactsCount = Object.keys(campaign.audience.filters).length > 0
        ? filteredContacts.filter(c => c.whatsappOptIn).length
        : selectedContacts.filter(contactId => {
          const contact = contacts.find(c => (c._id || c.id) === contactId);
          return contact?.whatsappOptIn;
        }).length;

      const totalCost = messagePrice.totalPrice * eligibleContactsCount;

      // Check if wallet balance is sufficient
      if (walletBalance !== undefined && walletBalance < totalCost) {
        toast({
          title: "Insufficient Funds",
          description: `You need ${formatCurrency(totalCost - walletBalance)} more in your wallet to launch this campaign.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Determine final audience based on filters vs selection
      const finalAudience = {
        ...campaign.audience,
        selectedContacts: Object.keys(campaign.audience.filters).length > 0
          ? [] // When using filters, don't send selectedContacts
          : selectedContacts.filter(contactId => {
            // Only include opted-in contacts
            const contact = contacts.find(c => (c._id || c.id) === contactId);
            return contact?.whatsappOptIn;
          }),
        count: eligibleContactsCount // Update count to reflect only opted-in contacts
      };

      const campaignToLaunch = {
        ...campaign,
        responseHandling,
        audience: finalAudience
      };

      console.log('🚀 Launching campaign with audience:', finalAudience);

      const response = await fetch('/api/campaigns/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignToLaunch),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to launch campaign');
      }

      const data = await response.json();

      // Update wallet balance after campaign launch
      setWalletBalance(data.billing?.remainingBalance);

      // Show countdown dialog instead of immediate redirect
      setLaunchedCampaignId(data.campaign.id);
      setLaunchedCampaignData(data);
      setShowCountdownDialog(true);
      setCountdown(60);

      // Start countdown
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Countdown finished, redirect to campaigns page
            clearInterval(interval);
            setShowCountdownDialog(false);
            toast({
              title: "Campaign Started",
              description: "Your campaign has started sending messages successfully!",
            });
            router.push('/campaigns');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setCountdownInterval(interval);

      toast({
        title: "Campaign Launched",
        description: `Campaign launched successfully. ${formatCurrency(data.billing?.totalCost || 0)} has been deducted from your wallet.`,
      });

    } catch (error) {
      console.error('Error launching campaign:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to launch campaign",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add this useEffect for debugging
  useEffect(() => {
    console.log('📊 Campaign Debug Info:', {
      totalContacts: contacts.length,
      filteredContacts: filteredContacts.length,
      selectedContacts: selectedContacts.length,
      contactsWithWhatsappOptIn: contacts.filter(c => c.whatsappOptIn).length,
      filteredContactsWithWhatsappOptIn: filteredContacts.filter(c => c.whatsappOptIn).length,
      campaignAudienceFilters: campaign.audience.filters,
      campaignAudienceCount: campaign.audience.count,
      hasFilters: Object.keys(campaign.audience.filters).length > 0,
      sampleFilteredContacts: filteredContacts.slice(0, 3).map(c => ({
        id: c._id || c.id,
        name: c.name,
        whatsappOptIn: c.whatsappOptIn,
        tags: c.tags
      }))
    });
  }, [contacts, filteredContacts, selectedContacts, campaign.audience]);

  // Cancel launched campaign function
  const cancelLaunchedCampaign = async () => {
    if (!launchedCampaignId) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/campaigns/${launchedCampaignId}/cancel`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // Clear countdown
        if (countdownInterval) {
          clearInterval(countdownInterval);
          setCountdownInterval(null);
        }

        // Update wallet balance with refund
        setWalletBalance(data.refund.newWalletBalance);

        // Close dialog
        setShowCountdownDialog(false);

        toast({
          title: "Campaign Cancelled",
          description: data.refund.amount > 0
            ? `Campaign cancelled successfully. ${formatCurrency(data.refund.amount)} has been refunded to your wallet.`
            : "Campaign cancelled successfully.",
        });

        // Redirect to campaigns page
        router.push('/campaigns');
      } else {
        throw new Error(data.error || 'Failed to cancel campaign');
      }
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel campaign",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Continue to campaigns without cancelling
  const continueToCampaigns = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    setShowCountdownDialog(false);
    toast({
      title: "Campaign Active",
      description: "Your campaign is now active and will start sending messages shortly.",
    });
    router.push('/campaigns');
  };

  // Add a function to get consistent contact ID
  const getContactId = (contact: Contact) => contact._id || contact.id;
  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Navigate to a specific step
  const goToStep = (stepId: number) => {
    setActiveStep(stepId);

    // Scroll to content
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Complete updated resetAudienceFilters function
  const resetAudienceFilters = () => {
    const optedInContacts = contacts.filter(c => c.whatsappOptIn);

    setFilteredContacts(contacts);
    setAudienceCount(optedInContacts.length);
    setCampaign(prev => ({
      ...prev,
      audience: {
        filters: {},
        count: selectedContacts.length || optedInContacts.length,
        selectedContacts: selectedContacts
      }
    }));

    toast({
      title: "Filters Reset",
      description: `Showing all contacts (${optedInContacts.length} eligible for campaigns)`,
    });
  };

  return (
    <Layout>
      <div className="min-h-screen p-6">
        {/* Header */}
        <div className="sticky top-0 z-30  backdrop-blur-sm border-b border-slate-200">
          <div className=" py-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/campaigns')}
                  className="rounded-full h-9 w-9 hover:bg-slate-100"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-700" />
                </Button>
                <div>
                  <div className="flex items-center gap-3 ">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-semibold text-slate-700">Create Campaign</h1>
                      <p className="text-xs text-slate-500">Set up a new WhatsApp campaign</p>
                    </div>
                  </div>

                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={saveCampaignAsDraft}
                  disabled={isLoading}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save as Draft
                </Button>

                <Button
                  onClick={launchCampaign}
                  disabled={isLoading || calculateProgress() < 100}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Rocket className="h-4 w-4 mr-2" />
                  )}
                  Launch Campaign
                </Button>
              </div>
            </div>

            {/* Campaign name input */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
              <div className="flex items-center gap-3 mb-4">

                <div>
                  <h2 className="text-sm font-semibold text-slate-700">Campaign Details</h2>
                  <p className="text-xs text-slate-500">Give your campaign a clear, descriptive name</p>
                </div>
              </div>

              <div className="max-w-2xl">
                <Label htmlFor="campaign-name" className="text-sm font-medium mb-2 block text-slate-700">
                  Campaign Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="campaign-name"
                  placeholder="Enter a descriptive name for your campaign"
                  value={campaign.name}
                  onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                  className="h-12 text-lg bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Choose a name that clearly identifies this campaign&apos;s purpose
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Campaign Setup</span>
                <span className="text-sm text-slate-500">{calculateProgress()}% complete</span>
              </div>
              <div className="relative">
                <Progress value={calculateProgress()} className="h-2" />

              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Step navigation sidebar */}
            <div className="lg:w-72 space-y-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 cursor-pointer transition-colors",
                    activeStep === step.id && "bg-primary/5 border-primary",
                    step.isCompleted && "border-green-200"
                  )}
                  onClick={() => goToStep(step.id)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    step.isCompleted ? "bg-green-100" : activeStep === step.id ? "bg-primary" : "bg-gray-100"
                  )}>
                    {step.isCompleted ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <step.icon className={cn(
                        "h-4 w-4",
                        activeStep === step.id ? "text-white" : "text-gray-500"
                      )} />
                    )}
                  </div>

                  <div>
                    <div className="font-medium">
                      {step.title}
                      {step.badgeText && (
                        <Badge variant="outline" className="ml-2 py-0 px-1.5 text-[10px]">
                          {step.badgeText}
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      {step.isCompleted ? "Completed" : activeStep === step.id ? "In progress" : "Not started"}
                    </div>
                  </div>

                  {activeStep === step.id && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <ChevronRight className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1" ref={contentRef}>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-lg font-medium">Loading...</p>
                    <p className="text-sm text-muted-foreground">Setting up your campaign creator</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1: Audience */}
                  {activeStep === 1 && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-xl">Choose Your Audience</CardTitle>
                              <CardDescription>Define who will receive your campaign messages</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Campaign type selection */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold mb-3">Campaign Type</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div
                                className={cn(
                                  "p-4 rounded-lg border-2 cursor-pointer transition-all",
                                  campaign.type === "one-time"
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 hover:border-gray-300"
                                )}
                                onClick={() => setCampaign(prev => ({ ...prev, type: "one-time" }))}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={cn(
                                    "mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center",
                                    campaign.type === "one-time" ? "border-primary" : "border-gray-300"
                                  )}>
                                    {campaign.type === "one-time" && (
                                      <div className="w-3 h-3 rounded-full bg-primary" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-1">One-time Campaign</h4>
                                    <p className="text-sm text-gray-500">
                                      Send a message once to the current audience matching your filters
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div
                                className={cn(
                                  "p-4 rounded-lg border-2 cursor-pointer transition-all",
                                  campaign.type === "ongoing"
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 hover:border-gray-300"
                                )}
                                onClick={() => setCampaign(prev => ({ ...prev, type: "ongoing" }))}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={cn(
                                    "mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center",
                                    campaign.type === "ongoing" ? "border-primary" : "border-gray-300"
                                  )}>
                                    {campaign.type === "ongoing" && (
                                      <div className="w-3 h-3 rounded-full bg-primary" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-1">Ongoing Campaign</h4>
                                    <p className="text-sm text-gray-500">
                                      Automatically send to new users who match your criteria over time
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Audience Filter */}
                          {/* Audience Filter */}
                          <Collapsible className="border rounded-lg">
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-4">
                              <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-gray-500" />
                                <span className="font-medium">Audience Filters</span>
                              </div>
                              <ChevronDown className="h-5 w-5" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <Separator />
                              <div className="p-4">
                                <AudienceFilter
                                  tags={tags}
                                  traitFields={traitFields}
                                  eventFields={eventFields}
                                  contactGroups={contactGroups.map(group => ({
                                    id: group.id,
                                    name: group.name,
                                    contactCount: group.contactCount,
                                    color: group.color || '#3B82F6'
                                  }))}
                                  onApplyFilters={handleApplyFilters}
                                  initialFilters={campaign.audience.filters}
                                />
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </CardContent>
                      </Card>

                      {/* Audience Preview */}
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle>Audience Preview</CardTitle>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="font-normal">
                                {Object.keys(campaign.audience.filters).length > 0
                                  ? `${audienceCount} matching contacts`
                                  : `${selectedContacts.length} selected contacts`}
                              </Badge>
                              {/* Update the reset button to handle both cases */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (Object.keys(campaign.audience.filters).length > 0) {
                                    resetAudienceFilters();
                                  } else if (selectedContacts.length > 0) {
                                    setSelectedContacts([]);
                                    setCampaign(prev => ({
                                      ...prev,
                                      audience: {
                                        ...prev.audience,
                                        count: 0,
                                        selectedContacts: []
                                      }
                                    }));
                                    toast({
                                      title: "Selection Cleared",
                                      description: "All contacts deselected",
                                    });
                                  } else {
                                    fetchContacts();
                                    toast({
                                      title: "Refreshed",
                                      description: "Contact list updated",
                                    });
                                  }
                                }}
                                disabled={isLoadingContacts}
                              >
                                {isLoadingContacts ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                )}
                                {Object.keys(campaign.audience.filters).length > 0
                                  ? "Reset Filters"
                                  : selectedContacts.length > 0
                                    ? "Clear Selection"
                                    : "Refresh"}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {isLoadingContacts ? (
                            <div className="flex items-center justify-center h-64">
                              <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary/60" />
                                <p className="text-muted-foreground">Loading contacts...</p>
                              </div>
                            </div>
                          ) : filteredContacts.length > 0 ? (
                            <div className="border rounded-lg overflow-hidden">
                              <ScrollArea className="h-[350px]">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-12">
                                        <Checkbox
                                          checked={
                                            filteredContacts.length > 0 &&
                                            selectedContacts.length === filteredContacts.length
                                          }
                                          onCheckedChange={toggleSelectAll}
                                          aria-label="Select all contacts"
                                          className={
                                            Object.keys(campaign.audience.filters).length > 0
                                              ? "opacity-0 pointer-events-none"
                                              : ""
                                          }
                                        />
                                      </TableHead>
                                      <TableHead>Name</TableHead>
                                      <TableHead>Phone</TableHead>
                                      <TableHead>Email</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Tags</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {filteredContacts.map((contact) => {
                                      // Use a consistent ID - try both _id (MongoDB) and id (frontend)
                                      const contactId = contact._id || contact.id;

                                      return (
                                        <TableRow
                                          key={contactId}
                                          className="group"
                                        >
                                          <TableCell>
                                            {Object.keys(campaign.audience.filters).length > 0 ? (
                                              <Avatar className="h-8 w-8">
                                                <AvatarImage src={contact.avatar || undefined} />
                                                <AvatarFallback>{getInitials(contact.name || 'Unknown')}</AvatarFallback>
                                              </Avatar>
                                            ) : (
                                              <div className="flex items-center justify-center">
                                                <Checkbox
                                                  checked={selectedContacts.includes(contactId)}
                                                  onCheckedChange={() => toggleContactSelection(contactId)}
                                                  aria-label={`Select ${contact.name}`}
                                                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                />
                                              </div>
                                            )}
                                          </TableCell>
                                          <TableCell>{contact.name || 'Unknown'}</TableCell>
                                          <TableCell>{contact.phone || '-'}</TableCell>
                                          <TableCell>{contact.email || '-'}</TableCell>
                                          <TableCell>
                                            <Badge variant={contact.whatsappOptIn ? "default" : "secondary"}>
                                              {contact.whatsappOptIn ? "Subscribed" : "Unsubscribed"}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                              {contact.tags?.map((tag: string) => (
                                                <Badge key={tag} variant="outline" className="text-xs">
                                                  {tag}
                                                </Badge>
                                              ))}
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </ScrollArea>
                            </div>
                          ) : (
                            <div className="text-center py-12 border rounded-lg">
                              <Search className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                              <h3 className="font-medium mb-1">No contacts match your filters</h3>
                              <p className="text-sm text-gray-500 max-w-md mx-auto">
                                Adjust your audience filters or try adding more contacts to your database.
                              </p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-end border-t bg-gray-50">
                          {/* Finally, update the Continue button to check for selection or filters */}

                          <Button
                            onClick={() => completeStep(1)}
                            disabled={
                              !campaign.name ||
                              (Object.keys(campaign.audience.filters).length === 0 && selectedContacts.length === 0) ||
                              (Object.keys(campaign.audience.filters).length > 0 && filteredContacts.length === 0)
                            }
                          >
                            Continue to Message
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  )}

                  {/* Step 2: Message */}
                  {activeStep === 2 && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                              <MessageSquare className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className='text-xl'>Create Your Message</CardTitle>
                              <CardDescription>Select a WhatsApp message template for your campaign</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {isLoadingTemplates ? (
                            <div className="py-8 text-center">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary/60" />
                              <p className="text-muted-foreground">Loading templates...</p>
                            </div>
                          ) : templates.length > 0 ? (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-slate-700">Select a Template</Label>
                                  <Select
                                    value={campaign.message.template}
                                    onValueChange={(templateId) => {
                                      handleTemplateSelect(templateId);
                                      setCampaign(prev => ({
                                        ...prev,
                                        message: {
                                          ...prev.message,
                                          type: "template",
                                          template: templateId,
                                          customMessage: ""
                                        }
                                      }));
                                    }}
                                  >
                                    <SelectTrigger className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20">
                                      <SelectValue placeholder="Choose a message template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {templates.map((template) => (
                                        <SelectItem key={template.id} value={template.id}>
                                          {template.name} {template.category && `(${template.category})`}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-slate-500">
                                    Select an approved template to send to your contacts
                                  </p>
                                </div>
                              </div>

                              {campaign.message.template && (
                                <>
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                        Template Preview
                                      </h3>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                                      <p className="whitespace-pre-wrap">
                                        {templates.find(t => t.id === campaign.message.template)?.content}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Template Variables */}
                                  {campaign.message.variables && campaign.message.variables.length > 0 ? (
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                          Fill Template Variables
                                        </h3>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {campaign.message.variables.map((variable, index) => (
                                          <div key={index} className="space-y-2">
                                            <Label htmlFor={`var-${variable.name}`} className="text-sm font-medium text-slate-700">
                                              {variable.name}
                                            </Label>
                                            <Input
                                              id={`var-${variable.name}`}
                                              placeholder={`Enter ${variable.name}`}
                                              value={variable.value}
                                              onChange={(e) => handleVariableUpdate(variable.name, e.target.value)}
                                              className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="border border-dashed rounded-lg p-4 text-center">
                                      <p className="text-sm text-slate-500">
                                        This template has no variables to fill.
                                      </p>
                                    </div>
                                  )}

                                  {/* Cost Estimator */}
                                  <div className="space-y-3 mt-2">
                                    <div className="flex items-center gap-2">
                                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                        Campaign Cost
                                      </h3>
                                    </div>

                                    <CostEstimator
                                      audienceCount={campaign.audience.count}
                                      templateCategory={selectedTemplateCategory}
                                      templateId={campaign.message.template}
                                      companyBalance={walletBalance}
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="border rounded-lg p-8 text-center">
                              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                              <h3 className="font-medium mb-2">No templates available</h3>
                              <p className="text-sm text-gray-500 max-w-md mx-auto">
                                You need to create WhatsApp message templates first
                              </p>
                              <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => router.push('/templates')}
                              >
                                Go to Templates
                              </Button>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-between border-t bg-gray-50">
                          <Button
                            variant="outline"
                            onClick={() => goToStep(1)}
                          >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>

                          <Button
                            onClick={() => completeStep(2)}
                            disabled={!campaign.message.template}
                          >
                            Continue
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  )}
                  {/* Step 3: Response Handling */}
                  {activeStep === 3 && (
                    <ResponseHandlingSection
                      responseHandling={responseHandling}
                      setResponseHandling={setResponseHandling}
                      setCampaign={setCampaign}
                      campaign={campaign}
                      setActiveStep={setActiveStep}
                      contentRef={contentRef}
                      setSteps={setSteps}
                      steps={steps}
                      availableTemplates={availableTemplates}
                      availableWorkflows={availableWorkflows}
                      templateButtons={templateButtons}
                    />
                  )}


                  {/* Step 5: Schedule */}
                  {activeStep === 4 && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                              <BiCalendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-semibold text-slate-900">Schedule Your Campaign</CardTitle>
                              <CardDescription className="text-slate-600">Choose when your messages will be sent</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-8">
                            {/* Schedule Settings */}
                            <div className="space-y-6">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                  Timing Options
                                </h3>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label htmlFor="send-date" className="text-sm font-medium text-slate-700">
                                    Send Date
                                  </Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20",
                                          !campaign.schedule.sendTime.split('T')[0] && "text-muted-foreground"
                                        )}
                                      >
                                        <BiCalendar className="mr-2 h-4 w-4" />
                                        {campaign.schedule.sendTime.split('T')[0] ? (
                                          format(new Date(campaign.schedule.sendTime.split('T')[0]), "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={campaign.schedule.sendTime.split('T')[0] ? new Date(campaign.schedule.sendTime.split('T')[0]) : undefined}
                                        onSelect={(date) => {
                                          if (date) {
                                            const time = campaign.schedule.sendTime.split('T')[1] || '12:00';
                                            const formattedDate = format(date, "yyyy-MM-dd");
                                            setCampaign(prev => ({
                                              ...prev,
                                              schedule: {
                                                ...prev.schedule,
                                                sendTime: `${formattedDate}T${time}`
                                              }
                                            }));
                                          }
                                        }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <p className="text-xs text-slate-500">
                                    Select the date when your campaign should be sent
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="send-time" className="text-sm font-medium text-slate-700">
                                    Send Time
                                  </Label>
                                  <div className="flex">
                                    <Input
                                      id="send-time"
                                      type="time"
                                      value={campaign.schedule.sendTime.split('T')[1] || '12:00'}
                                      onChange={(e) => {
                                        const time = e.target.value;
                                        const date = campaign.schedule.sendTime.split('T')[0] || '';
                                        setCampaign(prev => ({
                                          ...prev,
                                          schedule: {
                                            ...prev.schedule,
                                            sendTime: date ? `${date}T${time}` : `T${time}`
                                          }
                                        }));
                                      }}
                                      className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                    />
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    Set the time in 24-hour format (HH:MM)
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="timezone" className="text-sm font-medium text-slate-700">
                                    Timezone
                                  </Label>
                                  <Select
                                    value={campaign.schedule.timezone}
                                    onValueChange={(value) => setCampaign(prev => ({
                                      ...prev,
                                      schedule: {
                                        ...prev.schedule,
                                        timezone: value
                                      }
                                    }))}
                                  >
                                    <SelectTrigger id="timezone" className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20">
                                      <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {timezones.map((tz) => (
                                        <SelectItem key={tz.value} value={tz.value}>
                                          {tz.label} ({tz.offset})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-slate-500">
                                    Choose the timezone for your scheduled time
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-slate-700">
                                    Scheduled For
                                  </Label>
                                  <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 h-10">
                                    <Clock className="h-4 w-4 text-slate-500" />
                                    <span className="text-slate-700 text-sm">
                                      {campaign.schedule.sendTime
                                        ? `${format(new Date(campaign.schedule.sendTime), "PPP")} at ${format(new Date(campaign.schedule.sendTime), "p")}`
                                        : "Send immediately when launched"
                                      }
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    Your campaign will be sent at this date and time
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Send Now Option */}
                            <div className="space-y-6">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                  Quick Send
                                </h3>
                              </div>

                              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
                                    <Rocket className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-amber-800">
                                      Send Immediately
                                    </p>
                                    <p className="text-xs text-amber-600">
                                      Skip scheduling and send as soon as campaign is launched
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  onClick={() => setCampaign(prev => ({
                                    ...prev,
                                    schedule: {
                                      ...prev.schedule,
                                      sendTime: ""
                                    }
                                  }))}
                                  className="bg-white border-amber-200 text-amber-700 hover:bg-amber-50"
                                >
                                  <Rocket className="h-4 w-4 mr-2" />
                                  Send Now
                                </Button>
                              </div>
                            </div>

                            {/* Info Section */}
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <h4 className="font-medium text-blue-700 mb-1">Scheduling Information</h4>
                                  <div className="text-sm text-blue-700 space-y-2">
                                    <p>
                                      If you don&apos;t select a date and time, your campaign will be sent immediately when launched.
                                    </p>
                                    <p>
                                      Messages will only be sent to contacts who have opted in to receive WhatsApp messages.
                                    </p>
                                    <p>
                                      For optimal engagement, consider your audience&apos;s local time when scheduling.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="px-6 w-full flex justify-between py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                          <Button
                            variant="outline"
                            onClick={() => goToStep(3)}
                            className="hover:bg-slate-50"
                          >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>

                          <Button
                            onClick={() => completeStep(4)}
                            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            Continue
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  )}
                  {/* Step 6: Retries - Enhanced with day-based intervals */}
                  {activeStep === 5 && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                              <RefreshCw className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <CardTitle className='text-xl'>Message Retries</CardTitle>
                              <CardDescription>Configure how to handle failed message deliveries</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
                            <div>
                              <h3 className="font-medium">Enable message retries</h3>
                              <p className="text-sm text-gray-500">Automatically retry sending failed messages</p>
                            </div>
                            <Switch
                              checked={campaign.retries.enabled}
                              onCheckedChange={(checked) => setCampaign(prev => ({
                                ...prev,
                                retries: {
                                  ...prev.retries,
                                  enabled: checked
                                }
                              }))}
                            />
                          </div>

                          {campaign.retries.enabled ? (
                            <div className="space-y-6">
                              {/* Retry Configuration */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="retry-count" className="block mb-2">
                                      Number of retry attempts
                                    </Label>
                                    <Select
                                      value={campaign.retries.count.toString()}
                                      onValueChange={(value) => setCampaign(prev => ({
                                        ...prev,
                                        retries: {
                                          ...prev.retries,
                                          count: parseInt(value)
                                        }
                                      }))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">1 attempt</SelectItem>
                                        <SelectItem value="2">2 attempts</SelectItem>
                                        <SelectItem value="3">3 attempts</SelectItem>
                                        <SelectItem value="4">4 attempts</SelectItem>
                                        <SelectItem value="5">5 attempts (max)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-500 mt-1">Maximum 5 retry attempts allowed</p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="retry-interval" className="block mb-2">
                                      Retry schedule
                                    </Label>
                                    <Select
                                      value={showCustomRetryDate ? 'custom' : campaign.retries.interval.toString()}
                                      onValueChange={(value) => {
                                        if (value === 'custom') {
                                          setShowCustomRetryDate(true);
                                        } else {
                                          setShowCustomRetryDate(false);
                                          setCampaign(prev => ({
                                            ...prev,
                                            retries: {
                                              ...prev.retries,
                                              interval: parseInt(value)
                                            }
                                          }));
                                        }
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">1 day</SelectItem>
                                        <SelectItem value="2">2 days</SelectItem>
                                        <SelectItem value="3">3 days</SelectItem>
                                        <SelectItem value="7">1 week</SelectItem>
                                        <SelectItem value="custom">Custom date</SelectItem>
                                      </SelectContent>
                                    </Select>

                                    {showCustomRetryDate && (
                                      <div className="mt-3">
                                        <Label htmlFor="custom-retry-date" className="block mb-2 text-sm">
                                          Custom retry date
                                        </Label>
                                        <Input
                                          id="custom-retry-date"
                                          type="date"
                                          value={customRetryDate}
                                          min={new Date().toISOString().split('T')[0]}
                                          onChange={(e) => {
                                            setCustomRetryDate(e.target.value);
                                            // Calculate days difference and update campaign
                                            if (e.target.value) {
                                              const today = new Date();
                                              const selectedDate = new Date(e.target.value);
                                              const diffTime = selectedDate.getTime() - today.getTime();
                                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                              setCampaign(prev => ({
                                                ...prev,
                                                retries: {
                                                  ...prev.retries,
                                                  interval: Math.max(1, diffDays) // Ensure at least 1 day
                                                }
                                              }));
                                            }
                                          }}
                                          className="w-full"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                          Failed messages will be retried starting from this date
                                        </p>
                                      </div>
                                    )}

                                    <p className="text-xs text-gray-500 mt-1">
                                      {showCustomRetryDate
                                        ? 'Retries will start on your selected date'
                                        : 'Retries will start after the selected interval'
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Retry Strategy Explanation */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium text-blue-700 mb-2">How Retries Work</h4>
                                    <div className="text-sm text-blue-700 space-y-2">
                                      <p>
                                        <strong>Scheduled Retries:</strong> Failed messages will be retried on specific dates based on your schedule.
                                      </p>
                                      <div className="bg-blue-100 rounded p-3 mt-2">
                                        <p className="font-medium mb-1">
                                          Retry Schedule for {campaign.retries.count} attempts:
                                        </p>
                                        <ul className="text-xs space-y-1">
                                          {Array.from({ length: campaign.retries.count }, (_, i) => {
                                            const today = new Date();
                                            let retryDate;

                                            if (showCustomRetryDate && customRetryDate) {
                                              // Custom date based retries
                                              retryDate = new Date(customRetryDate);
                                              retryDate.setDate(retryDate.getDate() + (i * campaign.retries.interval));
                                            } else {
                                              // Standard day-based retries
                                              retryDate = new Date(today);
                                              retryDate.setDate(today.getDate() + (campaign.retries.interval * (i + 1)));
                                            }

                                            return (
                                              <li key={i}>
                                                • Attempt {i + 1}: {retryDate.toLocaleDateString('en-US', {
                                                  weekday: 'short',
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric'
                                                })}
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      </div>
                                      <p className="mt-2">
                                        <strong>Common Retry Reasons:</strong> Network timeouts, temporary API issues, rate limiting, recipient device offline.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Retry Scenarios */}
                              <div className="border rounded-lg p-4">
                                <h4 className="font-medium mb-3">What Messages Get Retried?</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <h5 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                                      <CheckCircle2 className="h-4 w-4" />
                                      Will Retry
                                    </h5>
                                    <ul className="space-y-1 text-gray-600">
                                      <li>• Network timeouts</li>
                                      <li>• API rate limit errors</li>
                                      <li>• Temporary server errors (5xx)</li>
                                      <li>• Recipient device temporarily offline</li>
                                      <li>• WhatsApp service disruptions</li>
                                    </ul>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                                      <X className="h-4 w-4" />
                                      Won&apos;t Retry
                                    </h5>
                                    <ul className="space-y-1 text-gray-600">
                                      <li>• Invalid phone numbers</li>
                                      <li>• Blocked/spam numbers</li>
                                      <li>• Template approval issues</li>
                                      <li>• Account suspension</li>
                                      <li>• User opted out</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              {/* Timing Considerations */}
                              <div className="border rounded-lg p-4">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  Timing Considerations
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <h5 className="font-medium mb-2">Best Practices</h5>
                                    <ul className="space-y-1 text-gray-600">
                                      <li>• Wait at least 24 hours between retries</li>
                                      <li>• Consider time zones for global campaigns</li>
                                      <li>• Avoid weekends for business messages</li>
                                      <li>• Schedule during business hours</li>
                                    </ul>
                                  </div>
                                  <div>
                                    <h5 className="font-medium mb-2">Current Schedule</h5>
                                    <div className="bg-gray-50 p-2 rounded text-xs">
                                      {showCustomRetryDate ? (
                                        customRetryDate ? (
                                          <span>Starting: {new Date(customRetryDate).toLocaleDateString()}</span>
                                        ) : (
                                          <span className="text-amber-600">Select a custom date</span>
                                        )
                                      ) : (
                                        <span>
                                          Every {campaign.retries.interval} day{campaign.retries.interval > 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Cost Impact Warning */}
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Cost Impact</AlertTitle>
                                <AlertDescription>
                                  Retry attempts don&apos;t incur additional charges - you only pay for successfully delivered messages.
                                  However, successful retries will count toward your monthly message quota.
                                </AlertDescription>
                              </Alert>
                            </div>
                          ) : (
                            <div className="border border-dashed rounded-lg p-8 text-center">
                              <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                              <h3 className="font-medium mb-2">No Retry Configuration</h3>
                              <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                                Without retry configuration, failed message delivery attempts won&apos;t be retried automatically.
                                This may result in lower delivery rates for your campaign.
                              </p>
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 max-w-md mx-auto">
                                <div className="flex items-center gap-2 text-amber-800">
                                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                  <span className="text-sm font-medium">Recommendation</span>
                                </div>
                                <p className="text-xs text-amber-700 mt-1">
                                  Enable retries to improve delivery rates by up to 15-20% for temporary failures.
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-between border-t bg-gray-50">
                          <Button
                            variant="outline"
                            onClick={() => goToStep(5)}
                          >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>

                          <Button
                            onClick={() => completeStep(6)}
                            disabled={showCustomRetryDate && !customRetryDate}
                          >
                            Continue to Review
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  )}



                  {/* Step 7: Review */}
                  {activeStep === 6 && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                              <Rocket className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <CardTitle className='text-xl'>Review and Launch</CardTitle>
                              <CardDescription>Verify your campaign details before launching</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center space-y-4 mb-8">
                            <div className="bg-green-50 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                              <Rocket className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-medium">Ready to Launch Your Campaign</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                              Review your campaign details below. Once launched, your messages will be delivered according to your schedule.
                            </p>
                          </div>

                          <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-5 border">
                              <h4 className="font-medium mb-3 text-sm uppercase text-gray-500">Campaign Details</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-500">Campaign Name</p>
                                  <p className="font-medium">{campaign.name || "Untitled Campaign"}</p>
                                </div>

                                <div className="space-y-1">
                                  <p className="text-sm text-gray-500">Campaign Type</p>
                                  <p className="font-medium capitalize">{campaign.type}</p>
                                </div>

                                <div className="space-y-1">
                                  <p className="text-sm text-gray-500">Audience Size</p>
                                  <p className="font-medium">{campaign.audience.count} contacts</p>
                                </div>

                                <div className="space-y-1">
                                  <p className="text-sm text-gray-500">Send Time</p>
                                  <p className="font-medium">{campaign.schedule.sendTime
                                    ? new Date(campaign.schedule.sendTime).toLocaleString()
                                    : "Immediately after launch"}</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-5 border">
                              <h4 className="font-medium mb-3 text-sm uppercase text-gray-500">Features Enabled</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${campaign.responseHandling.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    <Bell className={`h-4 w-4 ${campaign.responseHandling.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                                  </div>
                                  <div>
                                    <p className="font-medium">Response Handling</p>
                                    <p className="text-xs text-gray-500">{campaign.responseHandling.enabled ? 'Enabled' : 'Disabled'}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${campaign.conversionTracking.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    <BarChart className={`h-4 w-4 ${campaign.conversionTracking.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                                  </div>
                                  <div>
                                    <p className="font-medium">Conversion Tracking</p>
                                    <p className="text-xs text-gray-500">{campaign.conversionTracking.enabled ? 'Enabled' : 'Disabled'}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${campaign.retries.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    <RefreshCw className={`h-4 w-4 ${campaign.retries.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                                  </div>
                                  <div>
                                    <p className="font-medium">Message Retries</p>
                                    <p className="text-xs text-gray-500">
                                      {campaign.retries.enabled ? `${campaign.retries.count} attempts` : 'Disabled'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-5 border">
                              <h4 className="font-medium mb-3 text-sm uppercase text-gray-500">Message Preview</h4>
                              <div className="border rounded-lg p-4 bg-white">
                                {(campaign.message.type === "template" && campaign.message.template) ? (
                                  <div className="p-4 bg-green-50 rounded-lg flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <h4 className="font-medium text-green-700 mb-1">Message Template Selected</h4>
                                      <p className="text-sm text-green-700">
                                        You&apos;ve selected a message template that will be sent to your audience.
                                      </p>
                                      <p className="text-sm font-medium mt-2">
                                        Template: {templates.find(t => t.id === campaign.message.template)?.name || "Unknown"}
                                      </p>
                                      <p className="text-sm mt-1">
                                        Category: {selectedTemplateCategory || "Unknown"}
                                      </p>
                                    </div>
                                  </div>
                                ) : campaign.message.type === "custom" && campaign.message.customMessage ? (
                                  <div className="p-4 bg-amber-50 rounded-lg flex items-start gap-3">
                                    <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <h4 className="font-medium text-amber-700 mb-1">Custom Message</h4>
                                      <p className="text-sm text-amber-700">
                                        You&apos;ve created a custom message. Remember, this can only be sent to users who have messaged you in the last 24 hours.
                                      </p>
                                      <div className="mt-2 p-3 bg-white rounded border border-amber-200">
                                        <p className="text-sm whitespace-pre-wrap">{campaign.message.customMessage}</p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-4 bg-amber-50 rounded-lg flex items-start gap-3">
                                    <CircleAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <h4 className="font-medium text-amber-700 mb-1">No Message Selected</h4>
                                      <p className="text-sm text-amber-700">
                                        You need to select a message template before launching your campaign.
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Retry Configuration Preview */}
                            {campaign.retries.enabled && (
                              <div className="bg-gray-50 rounded-lg p-5 border">
                                <h4 className="font-medium mb-3 text-sm uppercase text-gray-500">Retry Configuration</h4>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-lg border">
                                      <p className="text-sm font-medium mb-1">Max Retry Attempts</p>
                                      <p className="text-lg font-semibold text-purple-600">{campaign.retries.count}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border">
                                      <p className="text-sm font-medium mb-1">Retry Interval</p>
                                      <p className="text-lg font-semibold text-purple-600">
                                        {showCustomRetryDate ? (
                                          customRetryDate ?
                                            `From ${new Date(customRetryDate).toLocaleDateString()}` :
                                            'Custom date'
                                        ) : (
                                          campaign.retries.interval === 1 ? '1 day' :
                                            campaign.retries.interval === 7 ? '1 week' :
                                              `${campaign.retries.interval} days`
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-white p-3 rounded-lg border">
                                    <p className="text-sm font-medium mb-2">Retry Schedule</p>
                                    <div className="flex flex-wrap gap-2">
                                      {Array.from({ length: campaign.retries.count }, (_, i) => {
                                        const today = new Date();
                                        let retryDate;

                                        if (showCustomRetryDate && customRetryDate) {
                                          retryDate = new Date(customRetryDate);
                                          retryDate.setDate(retryDate.getDate() + (i * campaign.retries.interval));
                                        } else {
                                          retryDate = new Date(today);
                                          retryDate.setDate(today.getDate() + (campaign.retries.interval * (i + 1)));
                                        }

                                        return (
                                          <Badge key={i} variant="outline" className="text-xs">
                                            #{i + 1}: {retryDate.toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric'
                                            })}
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-blue-800">
                                      <Info className="h-4 w-4 flex-shrink-0" />
                                      <span className="text-sm font-medium">Retry Strategy</span>
                                    </div>
                                    <p className="text-xs text-blue-700 mt-1">
                                      {showCustomRetryDate ? (
                                        customRetryDate ?
                                          `Failed messages will be retried starting ${new Date(customRetryDate).toLocaleDateString()}, then every ${campaign.retries.interval} day${campaign.retries.interval > 1 ? 's' : ''}` :
                                          'Please select a custom retry date'
                                      ) : (
                                        `Failed messages will be retried every ${campaign.retries.interval} day${campaign.retries.interval > 1 ? 's' : ''} for up to ${campaign.retries.count} attempts`
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {/* Response Handling Preview */}
                            {campaign.responseHandling.enabled && (
                              <div className="bg-gray-50 rounded-lg p-5 border">
                                <h4 className="font-medium mb-3 text-sm uppercase text-gray-500">Response Handling</h4>
                                <div className="space-y-4">
                                  {campaign.responseHandling.keywords && campaign.responseHandling.keywords.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">Keyword Responses</p>
                                      <div className="bg-white p-3 rounded-lg border">
                                        <div className="space-y-2">
                                          {campaign.responseHandling.keywords.map((keyword, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm">
                                              <Badge variant="outline" className="mt-0.5">
                                                {keyword.trigger}
                                              </Badge>
                                              <span className="text-gray-500">→</span>
                                              <span className="text-gray-700 flex-1">{keyword.response}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {campaign.responseHandling.defaultResponse && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">Default Response</p>
                                      <div className="bg-white p-3 rounded-lg border">
                                        <p className="text-sm text-gray-700">{campaign.responseHandling.defaultResponse}</p>
                                      </div>
                                    </div>
                                  )}

                                  {campaign.responseHandling.forwardToEmail && campaign.responseHandling.forwardEmail && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">Email Forwarding</p>
                                      <div className="bg-white p-3 rounded-lg border">
                                        <p className="text-sm text-gray-700">Replies will be forwarded to: {campaign.responseHandling.forwardEmail}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Conversion Tracking Preview */}
                            {campaign.conversionTracking.enabled && (
                              <div className="bg-gray-50 rounded-lg p-5 border">
                                <h4 className="font-medium mb-3 text-sm uppercase text-gray-500">Conversion Tracking</h4>
                                <div className="space-y-4">
                                  {campaign.conversionTracking.goals.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">Goals to Track</p>
                                      <div className="flex flex-wrap gap-1">
                                        {campaign.conversionTracking.goals.map((goal, idx) => (
                                          <Badge key={idx} variant="secondary">
                                            {goal}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {campaign.conversionTracking.methods && campaign.conversionTracking.methods.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">Tracking Methods</p>
                                      <div className="bg-white p-3 rounded-lg border">
                                        <ul className="text-sm list-disc pl-5 space-y-1">
                                          {campaign.conversionTracking.methods.includes('link') && (
                                            <li>Tracking Links</li>
                                          )}
                                          {campaign.conversionTracking.methods.includes('code') && (
                                            <li>Tracking Pixel</li>
                                          )}
                                          {campaign.conversionTracking.methods.includes('api') && (
                                            <li>API Integration</li>
                                          )}
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  {campaign.conversionTracking.attributionWindow && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">Attribution Window</p>
                                      <div className="bg-white p-3 rounded-lg border">
                                        <p className="text-sm text-gray-700">{campaign.conversionTracking.attributionWindow} days</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Cost Estimator in Review */}
                            <div className="bg-gray-50 rounded-lg p-5 border mt-6">
                              <h4 className="font-medium mb-3 text-sm uppercase text-gray-500">Campaign Cost</h4>
                              <CostEstimator
                                audienceCount={campaign.audience.count}
                                templateCategory={selectedTemplateCategory}
                                templateId={campaign.message.template}
                                companyBalance={walletBalance}
                              />
                            </div>
                          </div>

                          {/* Pre-launch checklist */}
                          <div className="mt-8">
                            <h4 className="font-medium mb-4">Pre-Launch Checklist</h4>
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className={`p-0.5 rounded-full ${campaign.name ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                  {campaign.name ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                  ) : (
                                    <CircleAlert className="h-5 w-5" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">Campaign name is set</p>
                                  <p className="text-sm text-gray-500">
                                    {campaign.name ?
                                      `Your campaign is named "${campaign.name}"` :
                                      "Please provide a name for your campaign"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className={`p-0.5 rounded-full ${campaign.audience.count > 0 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                  {campaign.audience.count > 0 ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                  ) : (
                                    <CircleAlert className="h-5 w-5" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">Audience is selected</p>
                                  <p className="text-sm text-gray-500">
                                    {campaign.audience.count > 0 ?
                                      `${campaign.audience.count} contacts will receive your message` :
                                      "Your audience is empty. Please adjust your filters or select contacts."}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className={`p-0.5 rounded-full ${(campaign.message.type === "template" && campaign.message.template) ||
                                  (campaign.message.type === "custom" && campaign.message.customMessage)
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-amber-100 text-amber-600'}`}>
                                  {(campaign.message.type === "template" && campaign.message.template) ||
                                    (campaign.message.type === "custom" && campaign.message.customMessage) ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                  ) : (
                                    <CircleAlert className="h-5 w-5" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">Message is created</p>
                                  <p className="text-sm text-gray-500">
                                    {campaign.message.type === "template" && campaign.message.template ?
                                      "You've selected a message template" :
                                      campaign.message.type === "custom" && campaign.message.customMessage ?
                                        "You've created a custom message" :
                                        "Please create your message content"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className={`p-0.5 rounded-full bg-green-100 text-green-600`}>
                                  <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="font-medium">Schedule is configured</p>
                                  <p className="text-sm text-gray-500">
                                    {campaign.schedule.sendTime ?
                                      `Your campaign will be sent at ${new Date(campaign.schedule.sendTime).toLocaleString()}` :
                                      "Your campaign will be sent immediately when launched"}
                                  </p>
                                </div>
                              </div>

                              {/* Wallet balance check */}
                              {campaign.message.template && campaign.audience.count > 0 && (
                                <div className="flex items-start gap-3">
                                  <div className={`p-0.5 rounded-full ${walletBalance !== undefined && walletBalance >= calculateMessagePrice(selectedTemplateCategory).totalPrice * campaign.audience.count ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {walletBalance !== undefined && walletBalance >= calculateMessagePrice(selectedTemplateCategory).totalPrice * campaign.audience.count ? (
                                      <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                      <CircleAlert className="h-5 w-5" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">Wallet balance</p>
                                    <p className="text-sm text-gray-500">
                                      {walletBalance !== undefined ? (
                                        walletBalance >= calculateMessagePrice(selectedTemplateCategory).totalPrice * campaign.audience.count ?
                                          `You have sufficient funds (${formatCurrency(walletBalance)}) to launch this campaign` :
                                          `Insufficient funds. You need ${formatCurrency(calculateMessagePrice(selectedTemplateCategory).totalPrice * campaign.audience.count)} but have ${formatCurrency(walletBalance)}`
                                      ) : "Checking wallet balance..."}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Check that WhatsApp opted-in contacts exist */}
                              <div className="flex items-start gap-3">
                                <div className={`p-0.5 rounded-full ${filteredContacts.some(c => c.whatsappOptIn) ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                  {filteredContacts.some(c => c.whatsappOptIn) ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                  ) : (
                                    <CircleAlert className="h-5 w-5" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">Opted-in recipients</p>
                                  <p className="text-sm text-gray-500">
                                    {filteredContacts.some(c => c.whatsappOptIn) ?
                                      `${filteredContacts.filter(c => c.whatsappOptIn).length} contacts have opted in to receive WhatsApp messages` :
                                      "Warning: None of your selected contacts have opted in to receive WhatsApp messages"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t bg-gray-50">
                          <Button
                            variant="outline"
                            onClick={() => goToStep(6)}
                          >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>

                          <Button
                            onClick={launchCampaign}
                            disabled={
                              isLoading ||
                              !campaign.name ||
                              campaign.audience.count === 0 ||
                              ((!campaign.message.type || campaign.message.type === "template") && !campaign.message.template) ||
                              (campaign.message.type === "custom" && !campaign.message.customMessage) ||
                              (walletBalance !== undefined && walletBalance < calculateMessagePrice(selectedTemplateCategory).totalPrice * campaign.audience.count)
                            }
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Rocket className="h-4 w-4 mr-2" />
                            )}
                            Launch Campaign
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {/* Add the countdown dialog before the closing Layout tag */}
        <Dialog open={showCountdownDialog} onOpenChange={() => { }}>
          <DialogContent className="" closeButton={false}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <Rocket className="h-5 w-5 text-green-600" />
                </div>
                Campaign Launched Successfully!
              </DialogTitle>
              <DialogDescription>
                Your campaign has been launched and messages will start sending in:
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center py-6">
              {/* Countdown Display */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center bg-primary/5">
                  <span className="text-3xl font-bold text-primary">{countdown}</span>
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
              </div>

              <p className="text-sm text-muted-foreground mt-4 text-center">
                seconds remaining
              </p>

              {/* Campaign Summary */}
              {launchedCampaignData && (
                <div className="w-full mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Campaign Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Campaign:</span>
                      <span className="font-medium">{launchedCampaignData.campaign.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Audience:</span>
                      <span className="font-medium">{launchedCampaignData.campaign.audienceCount} contacts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-medium">{formatCurrency(launchedCampaignData.billing.totalCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wallet Balance:</span>
                      <span className="font-medium">{formatCurrency(launchedCampaignData.billing.remainingBalance)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Message */}
              <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Grace Period Active</p>
                  <p className="text-amber-700">
                    You can cancel this campaign before messages start sending.
                    After the countdown, messages will be sent automatically.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={continueToCampaigns}
                disabled={isLoading}
                className="flex-1"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Continue to Campaigns
              </Button>
              <Button
                variant="destructive"
                onClick={cancelLaunchedCampaign}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Cancel Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

    </Layout>
  );
};

export default CreateCampaignPage;
