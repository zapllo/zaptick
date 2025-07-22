// src/app/campaigns/create/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
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



  useEffect(() => {

    fetchTemplateButtons();
    fetchTemplatesAndWorkflows();

  }, [campaign.message.template]);

  const fetchTemplatesAndWorkflows = async () => {

    try {
      // Fetch templates
      const templatesResponse = await fetch(`/api/templates`);
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setAvailableTemplates(templatesData.templates || []);
      }

      // Fetch workflows
      const workflowsResponse = await fetch(`/api/workflows`);
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
  // Add the complete ResponseHandlingSection component within your main component:
  const ResponseHandlingSection = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Response Handling
          </CardTitle>
          <CardDescription>
            Configure how to handle customer responses to your campaign messages
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Enable Response Handling */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Response Handling</Label>
              <p className="text-sm text-muted-foreground">
                Automatically handle customer responses to campaign messages
              </p>
            </div>
            <Switch
              checked={responseHandling.enabled}
              onCheckedChange={(checked) =>
                setResponseHandling(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {responseHandling.enabled && (
            <div className="space-y-6 border-t pt-6">
              {/* Auto Reply Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Reply className="w-4 h-4" />
                      Auto Reply
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Send an automatic reply to any response
                    </p>
                  </div>
                  <Switch
                    checked={responseHandling.autoReply.enabled}
                    onCheckedChange={(checked) =>
                      setResponseHandling(prev => ({
                        ...prev,
                        autoReply: { ...prev.autoReply, enabled: checked }
                      }))
                    }
                  />
                </div>

                {responseHandling.autoReply.enabled && (
                  <div className="ml-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Reply Type</Label>
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
                          <SelectTrigger>
                            <SelectValue placeholder="Select reply type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Message</SelectItem>
                            <SelectItem value="template">Template Message</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Delay (minutes)</Label>
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
                        />
                      </div>
                    </div>

                    {responseHandling.autoReply.templateId ? (
                      <div className="space-y-2">
                        <Label>Select Template</Label>
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
                          <SelectTrigger>
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
                      <div className="space-y-2">
                        <Label>Auto Reply Message</Label>
                        <Textarea
                          value={responseHandling.autoReply.message}
                          onChange={(e) =>
                            setResponseHandling(prev => ({
                              ...prev,
                              autoReply: { ...prev.autoReply, message: e.target.value }
                            }))
                          }
                          placeholder="Thank you for your response. We'll get back to you soon!"
                          className="min-h-[100px]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Workflow Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Workflow className="w-4 h-4" />
                      Trigger Workflow
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Start a workflow when customers respond
                    </p>
                  </div>
                  <Switch
                    checked={responseHandling.workflow.enabled}
                    onCheckedChange={(checked) =>
                      setResponseHandling(prev => ({
                        ...prev,
                        workflow: { ...prev.workflow, enabled: checked }
                      }))
                    }
                  />
                </div>

                {responseHandling.workflow.enabled && (
                  <div className="ml-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Select Workflow</Label>
                        <Select
                          value={responseHandling.workflow.workflowId}
                          onValueChange={(value) => {
                            const workflow = availableWorkflows.find((w: any) => w._id === value);
                            setResponseHandling(prev => ({
                              ...prev,
                              workflow: {
                                ...prev.workflow,
                                workflowId: value,
                                workflowName: workflow?.name || ''
                              }
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a workflow" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableWorkflows
                              .filter((workflow: any) => workflow.isActive)
                              .map((workflow: any) => (
                                <SelectItem key={workflow._id} value={workflow._id}>
                                  {workflow.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Trigger Delay (minutes)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="1440"
                          value={responseHandling.workflow.triggerDelay}
                          onChange={(e) =>
                            setResponseHandling(prev => ({
                              ...prev,
                              workflow: { ...prev.workflow, triggerDelay: parseInt(e.target.value) || 0 }
                            }))
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Opt-out Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <UserX className="w-4 h-4" />
                      Customer Opt-out
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Handle customer opt-out requests from template button clicks
                    </p>
                  </div>
                  <Switch
                    checked={responseHandling.optOut.enabled}
                    onCheckedChange={(checked) =>
                      setResponseHandling(prev => ({
                        ...prev,
                        optOut: { ...prev.optOut, enabled: checked }
                      }))
                    }
                  />
                </div>

                {responseHandling.optOut.enabled && (
                  <div className="ml-6 space-y-4">
                    {templateButtons.length > 0 ? (
                      <div className="space-y-2">
                        <Label>Select Opt-out Buttons</Label>
                        <p className="text-sm text-muted-foreground">
                          Choose which quick reply buttons should trigger customer opt-out
                        </p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
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
                    ) : (
                      <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
                        <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm">
                          No quick reply buttons found in selected template
                        </p>
                        <p className="text-xs">
                          Opt-out functionality requires a template with quick reply buttons
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Acknowledgment Message</Label>
                      <Textarea
                        value={responseHandling.optOut.acknowledgmentMessage}
                        onChange={(e) =>
                          setResponseHandling(prev => ({
                            ...prev,
                            optOut: { ...prev.optOut, acknowledgmentMessage: e.target.value }
                          }))
                        }
                        placeholder="Thank you. You have been unsubscribed from our messages."
                        className="min-h-[80px]"
                      />
                      <p className="text-xs text-muted-foreground">
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
                      />
                      <Label htmlFor="update-contact" className="text-sm">
                        Automatically update contact opt-in status
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Update your campaign object to include responseHandling:
  const updateCampaignResponseHandling = () => {
    setCampaign(prev => ({
      ...prev,
      responseHandling: responseHandling
    }));
  };


  // Steps configuration
  const [steps, setSteps] = useState([
    { id: 1, title: "Audience", icon: Users, isCompleted: false, isRequired: true },
    { id: 2, title: "Message", icon: MessageSquare, isCompleted: false, isRequired: true },
    { id: 3, title: "Response Handling", icon: Bell, isCompleted: false, isRequired: false, badgeText: "Recommended" },
    { id: 4, title: "Conversion Tracking", icon: BarChart, isCompleted: false, isRequired: false, badgeText: "Optional" },
    { id: 5, title: "Schedule", icon: Calendar, isCompleted: false, isRequired: true },
    { id: 6, title: "Retries", icon: RefreshCw, isCompleted: false, isRequired: false, badgeText: "Optional" },
    { id: 7, title: "Review", icon: Rocket, isCompleted: false, isRequired: true },
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

  // Add a function to toggle contact selection
  const toggleContactSelection = (contactId: string) => {
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
            ? filteredContacts.length
            : newSelectedContacts.length
        }
      };
    });
  };

  // Add a function to select/deselect all contacts
  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      // Deselect all
      setSelectedContacts([]);

      // Update campaign audience count
      setCampaign(prev => ({
        ...prev,
        audience: {
          ...prev.audience,
          selectedContacts: [],
          count: 0
        }
      }));
    } else {
      // Select all
      const allContactIds = filteredContacts.map(contact => contact.id);
      setSelectedContacts(allContactIds);

      // Update campaign audience count
      setCampaign(prev => ({
        ...prev,
        audience: {
          ...prev.audience,
          selectedContacts: allContactIds,
          count: filteredContacts.length
        }
      }));
    }
  };

  // Update selected contacts when filters change
  useEffect(() => {
    if (Object.keys(campaign.audience.filters).length > 0) {
      // When filters are applied, reset selection
      setSelectedContacts([]);

      // Update campaign with filtered contacts
      setCampaign(prev => ({
        ...prev,
        audience: {
          ...prev.audience,
          selectedContacts: [],
          count: filteredContacts.length
        }
      }));
    } else {
      // When filters are reset, update campaign count based on selection
      setCampaign(prev => ({
        ...prev,
        audience: {
          ...prev.audience,
          count: selectedContacts.length,
          selectedContacts: selectedContacts
        }
      }));
    }
  }, [campaign.audience.filters]);


  // Fetch all contacts
  const fetchContacts = async () => {
    setIsLoadingContacts(true);
    try {
      // Fetch contacts from API
      const response = await fetch('/api/contacts');
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();

      if (data.success) {
        setContacts(data.contacts || []);
        setFilteredContacts(data.contacts || []);
        setAudienceCount(data.contacts.length || 0);

        // Update campaign with initial audience count
        setCampaign(prev => ({
          ...prev,
          audience: {
            ...prev.audience,
            count: data.contacts.length || 0
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

  // Apply audience filters locally
  const handleApplyFilters = (filters: any) => {
    let filtered = [...contacts];

    // Apply tag filters
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(contact => {
        return filters.tags.every((tag: string) =>
          contact.tags && contact.tags.includes(tag)
        );
      });
    }
    setSelectedContacts([]);
    // Apply WhatsApp opt-in filter
    if (filters.whatsappOptedIn) {
      filtered = filtered.filter(contact => contact.whatsappOptIn);
    }

    // Apply conditions
    if (filters.conditions && filters.conditions.length > 0) {
      filtered = filtered.filter(contact => {
        let meetsCriteria = filters.operator === "AND";

        for (const condition of filters.conditions) {
          let fieldValue;

          // Handle custom fields
          if (condition.field.startsWith('customField.')) {
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
            default:
              conditionMet = false;
          }

          if (filters.operator === "AND") {
            meetsCriteria = meetsCriteria && conditionMet;
          } else {
            meetsCriteria = meetsCriteria || conditionMet;
          }
        }

        return meetsCriteria;
      });
    }

    // Update filtered contacts and audience count
    setFilteredContacts(filtered);
    setAudienceCount(filtered.length);

    // Update campaign audience
    setCampaign(prev => ({
      ...prev,
      audience: {
        filters,
        count: filtered.length,
        selectedContacts: [] // Clear selected contacts when using filters
      }
    }));

    toast({
      title: "Success",
      description: `Audience filtered to ${filtered.length} contacts`,
    });
  };

  // Select template
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Update template category for cost calculation
      setSelectedTemplateCategory(template.category || "MARKETING");

      // Check if template.variables exists and is an array before mapping
      const templateVariables = Array.isArray(template.variables)
        ? template.variables.map(variable => ({ name: variable, value: "" }))
        : [];

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

  // Mark a step as completed
  const completeStep = (stepId: number) => {
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, isCompleted: true } : step
      )
    );

    // Move to next step
    if (stepId < steps.length) {
      setActiveStep(stepId + 1);

      // Scroll to content
      if (contentRef.current) {
        contentRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Save campaign as draft
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

      // Add selected contacts to the audience object before saving
      const campaignToSave = {
        ...campaign,
        responseHandling,

        audience: {
          ...campaign.audience,
          selectedContacts: selectedContacts
        },
        status: 'draft'
      };

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

  // Launch campaign (continued)
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

      // Calculate expected cost
      const messagePrice = calculateMessagePrice(selectedTemplateCategory);
      const totalCost = messagePrice.totalPrice * campaign.audience.count;
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

      // Add selected contacts to the audience object before launching
      const campaignToLaunch = {
        ...campaign,
        responseHandling,
        audience: {
          ...campaign.audience,
          selectedContacts: selectedContacts
        }
      };

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

  // Reset audience filters
  const resetAudienceFilters = () => {
    setFilteredContacts(contacts);
    setAudienceCount(contacts.length);
    setCampaign(prev => ({
      ...prev,
      audience: {
        filters: {},
        count: selectedContacts.length || 0,
        selectedContacts: selectedContacts
      }
    }));

    toast({
      title: "Filters Reset",
      description: "Showing all contacts",
    });
  };

  return (
    <Layout>
      <div className="min-h-screen p-6">
        {/* Header */}
        <div className="sticky top-0 z-30  ">
          <div className="container py-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/campaigns')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold">Create Campaign</h1>
                  <p className="text-sm text-gray-500">Set up a new WhatsApp campaign</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={saveCampaignAsDraft}
                  disabled={isLoading}
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
            <div className="max-w-2xl mb-6">
              <Label htmlFor="campaign-name" className="text-sm font-medium mb-2 block">
                Campaign Name
              </Label>
              <Input
                id="campaign-name"
                placeholder="Enter a descriptive name for your campaign"
                value={campaign.name}
                onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                className="h-12 text-lg"
              />
            </div>

            {/* Progress */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Campaign Setup</span>
                <span className="text-sm text-gray-500">{calculateProgress()}% complete</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
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
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle>Choose Your Audience</CardTitle>
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
                                    {filteredContacts.map((contact) => (
                                      <TableRow
                                        key={contact.id}
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
                                                checked={selectedContacts.includes(contact.id)}
                                                onCheckedChange={() => toggleContactSelection(contact.id)}
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
                                    ))}
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
                              (Object.keys(campaign.audience.filters).length === 0 && selectedContacts.length === 0)
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
                            <div className="bg-primary/10 p-2 rounded-full">
                              <MessageSquare className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle>Create Your Message</CardTitle>
                              <CardDescription>Craft your WhatsApp message content</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="template" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                              <TabsTrigger value="template">Use Template</TabsTrigger>
                              <TabsTrigger value="custom">Custom Message</TabsTrigger>
                            </TabsList>

                            <TabsContent value="template">
                              {isLoadingTemplates ? (
                                <div className="py-8 text-center">
                                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary/60" />
                                  <p className="text-muted-foreground">Loading templates...</p>
                                </div>
                              ) : templates.length > 0 ? (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label className="mb-2 block">Select a Template</Label>
                                      <Select
                                        value={campaign.message.template}
                                        onValueChange={(templateId) => {
                                          handleTemplateSelect(templateId);
                                          // Set message type to template when template is selected
                                          setCampaign(prev => ({
                                            ...prev,
                                            message: {
                                              ...prev.message,
                                              type: "template",
                                              template: templateId,
                                              customMessage: "" // Clear custom message
                                            }
                                          }));
                                        }}
                                      >
                                        <SelectTrigger>
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
                                    </div>
                                  </div>
                                  {campaign.message.template && (
                                    <>
                                      <div className="bg-gray-50 rounded-lg p-4 border">
                                        <Label className="mb-2 block">Template Preview</Label>
                                        <div className="bg-white p-4 rounded-lg border">
                                          <p className="whitespace-pre-wrap">
                                            {templates.find(t => t.id === campaign.message.template)?.content}
                                          </p>
                                        </div>
                                      </div>
                                      {/* Add a conditional check here */}
                                      {campaign.message.variables && campaign.message.variables.length > 0 ? (
                                        <div className="border rounded-lg p-4">
                                          <h3 className="font-medium mb-4">Fill Template Variables</h3>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {campaign.message.variables.map((variable, index) => (
                                              <div key={index}>
                                                <Label htmlFor={`var-${variable.name}`} className="mb-1 block">
                                                  {variable.name}
                                                </Label>
                                                <Input
                                                  id={`var-${variable.name}`}
                                                  placeholder={`Enter ${variable.name}`}
                                                  value={variable.value}
                                                  onChange={(e) => handleVariableUpdate(variable.name, e.target.value)}
                                                />
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="border border-dashed rounded-lg p-4 text-center">
                                          <p className="text-sm text-gray-500">
                                            This template has no variables to fill.
                                          </p>
                                        </div>
                                      )}

                                      {/* Cost Estimator */}
                                      <div className="mt-8">
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
                            </TabsContent>

                            <TabsContent value="custom">
                              <div className="space-y-4">
                                <div className="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200 flex items-start gap-3">
                                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium mb-1">Custom messages have limitations</h4>
                                    <p className="text-sm">
                                      WhatsApp only allows sending custom format messages to users who have messaged you in the last
                                      24 hours. For all other users, you must use an approved template.
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="custom-message" className="mb-2 block">Message Content</Label>
                                  <Textarea
                                    id="custom-message"
                                    placeholder="Enter your message here..."
                                    rows={6}
                                    value={campaign.message.customMessage || ""}
                                    onChange={(e) => setCampaign(prev => ({
                                      ...prev,
                                      message: {
                                        ...prev.message,
                                        type: "custom", // Set message type to custom
                                        customMessage: e.target.value,
                                        template: "" // Clear template when using custom message
                                      }
                                    }))}
                                    className="font-mono"
                                  />
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
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
                            disabled={
                              (!campaign.message.type || campaign.message.type === "template")
                                ? !campaign.message.template
                                : !campaign.message.customMessage
                            }
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
                    <ResponseHandlingSection />
                  )}

                  {/* Step 4: Conversion Tracking */}
                  {activeStep === 4 && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <BarChart className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle>Conversion Tracking</CardTitle>
                              <CardDescription>Track goals and conversions from this campaign</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
                            <div>
                              <h3 className="font-medium">Enable conversion tracking</h3>
                              <p className="text-sm text-gray-500">Track specific goals and conversions from this campaign</p>
                            </div>
                            <Switch
                              checked={campaign.conversionTracking.enabled}
                              onCheckedChange={(checked) => setCampaign(prev => ({
                                ...prev,
                                conversionTracking: {
                                  ...prev.conversionTracking,
                                  enabled: checked
                                }
                              }))}
                            />
                          </div>

                          {campaign.conversionTracking.enabled ? (
                            <div className="space-y-6">
                              {/* Conversion Goals Section */}
                              <div className="border rounded-lg p-5">
                                <h3 className="font-medium mb-3">Conversion Goals</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                  Select one or more goals to track for this campaign
                                </p>

                                <div className="space-y-4">
                                  {/* Predefined goals */}
                                  <div>
                                    <Label className="mb-2 block">Standard Goals</Label>
                                    <div className="flex flex-wrap gap-2">
                                      {['Purchase', 'Sign Up', 'Appointment', 'Registration', 'Form Submission', 'Download'].map(goal => (
                                        <Badge
                                          key={goal}
                                          variant={campaign.conversionTracking.goals.includes(goal) ? "default" : "outline"}
                                          className="cursor-pointer py-1.5 px-3"
                                          onClick={() => {
                                            setCampaign(prev => {
                                              const goals = prev.conversionTracking.goals.includes(goal)
                                                ? prev.conversionTracking.goals.filter(g => g !== goal)
                                                : [...prev.conversionTracking.goals, goal];

                                              return {
                                                ...prev,
                                                conversionTracking: {
                                                  ...prev.conversionTracking,
                                                  goals
                                                }
                                              };
                                            });
                                          }}
                                        >
                                          {goal}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Custom goal */}
                                  <div>
                                    <Label htmlFor="custom-goal" className="mb-2 block">
                                      Custom Goal (Optional)
                                    </Label>
                                    <div className="flex gap-2">
                                      <Input
                                        id="custom-goal"
                                        placeholder="Enter custom goal name"
                                        value={customGoal}
                                        onChange={(e) => setCustomGoal(e.target.value)}
                                      />
                                      <Button
                                        onClick={() => {
                                          if (!customGoal) return;

                                          setCampaign(prev => ({
                                            ...prev,
                                            conversionTracking: {
                                              ...prev.conversionTracking,
                                              goals: [...prev.conversionTracking.goals, customGoal]
                                            }
                                          }));

                                          setCustomGoal('');

                                          toast({
                                            title: "Custom goal added",
                                            description: `Added custom goal: ${customGoal}`,
                                          });
                                        }}
                                      >
                                        Add
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Tracking Method Section */}
                              <div className="border rounded-lg p-5">
                                <h3 className="font-medium mb-3">Tracking Method</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                  Choose how you want to track conversions from this campaign
                                </p>

                                <div className="space-y-4">
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                      <Checkbox
                                        id="tracking-link"
                                        checked={campaign.conversionTracking.methods?.includes('link')}
                                        onCheckedChange={(checked) => {
                                          setCampaign(prev => {
                                            const methods = checked
                                              ? [...(prev.conversionTracking.methods || []), 'link']
                                              : (prev.conversionTracking.methods || []).filter(m => m !== 'link');

                                            return {
                                              ...prev,
                                              conversionTracking: {
                                                ...prev.conversionTracking,
                                                methods
                                              }
                                            };
                                          });
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label
                                        htmlFor="tracking-link"
                                        className="text-base font-medium"
                                      >
                                        Tracking Links
                                      </Label>
                                      <p className="text-sm text-gray-500">
                                        Track conversions through unique tracking links in your messages
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                      <Checkbox
                                        id="tracking-code"
                                        checked={campaign.conversionTracking.methods?.includes('code')}
                                        onCheckedChange={(checked) => {
                                          setCampaign(prev => {
                                            const methods = checked
                                              ? [...(prev.conversionTracking.methods || []), 'code']
                                              : (prev.conversionTracking.methods || []).filter(m => m !== 'code');

                                            return {
                                              ...prev,
                                              conversionTracking: {
                                                ...prev.conversionTracking,
                                                methods
                                              }
                                            };
                                          });
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label
                                        htmlFor="tracking-code"
                                        className="text-base font-medium"
                                      >
                                        Tracking Pixel
                                      </Label>
                                      <p className="text-sm text-gray-500">
                                        Use a tracking pixel code on your website to track conversions
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                      <Checkbox
                                        id="tracking-api"
                                        checked={campaign.conversionTracking.methods?.includes('api')}
                                        onCheckedChange={(checked) => {
                                          setCampaign(prev => {
                                            const methods = checked
                                              ? [...(prev.conversionTracking.methods || []), 'api']
                                              : (prev.conversionTracking.methods || []).filter(m => m !== 'api');

                                            return {
                                              ...prev,
                                              conversionTracking: {
                                                ...prev.conversionTracking,
                                                methods
                                              }
                                            };
                                          });
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label
                                        htmlFor="tracking-api"
                                        className="text-base font-medium"
                                      >
                                        API Integration
                                      </Label>
                                      <p className="text-sm text-gray-500">
                                        Track conversions via API calls from your system
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Attribution Window */}
                              <div className="border rounded-lg p-5">
                                <h3 className="font-medium mb-3">Attribution Window</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                  Set how long after message delivery a conversion will be attributed to this campaign
                                </p>

                                <div>
                                  <Label htmlFor="attribution-window" className="mb-2 block">
                                    Attribution Window (days)
                                  </Label>
                                  <div className="max-w-xs">
                                    <Select
                                      value={String(campaign.conversionTracking.attributionWindow || 7)}
                                      onValueChange={(value) => setCampaign(prev => ({
                                        ...prev,
                                        conversionTracking: {
                                          ...prev.conversionTracking,
                                          attributionWindow: parseInt(value)
                                        }
                                      }))}
                                    >
                                      <SelectTrigger id="attribution-window">
                                        <SelectValue placeholder="Select attribution window" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">1 day</SelectItem>
                                        <SelectItem value="3">3 days</SelectItem>
                                        <SelectItem value="7">7 days</SelectItem>
                                        <SelectItem value="14">14 days</SelectItem>
                                        <SelectItem value="30">30 days</SelectItem>
                                        <SelectItem value="90">90 days</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="border border-dashed rounded-lg p-8 text-center">
                              <BarChart className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                              <h3 className="font-medium mb-2">No Conversion Tracking</h3>
                              <p className="text-sm text-gray-500 max-w-md mx-auto">
                                You haven&apos;t set up conversion tracking. Enable this feature to track the effectiveness of your campaign.
                              </p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-between border-t bg-gray-50">
                          <Button
                            variant="outline"
                            onClick={() => goToStep(3)}
                          >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>

                          <Button onClick={() => completeStep(4)}>
                            Continue
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  )}

                  {/* Step 5: Schedule */}
                  {activeStep === 5 && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <CardTitle>Schedule Your Campaign</CardTitle>
                              <CardDescription>Choose when your messages will be sent</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label htmlFor="send-date" className="mb-2 block">Send Date</Label>
                              <Input
                                id="send-date"
                                type="date"
                                value={campaign.schedule.sendTime.split('T')[0] || ''}
                                onChange={(e) => {
                                  const date = e.target.value;
                                  const time = campaign.schedule.sendTime.split('T')[1] || '12:00';
                                  setCampaign(prev => ({
                                    ...prev,
                                    schedule: {
                                      ...prev.schedule,
                                      sendTime: date ? `${date}T${time}` : ''
                                    }
                                  }));
                                }}
                              />
                            </div>

                            <div>
                              <Label htmlFor="send-time" className="mb-2 block">Send Time</Label>
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
                              />
                            </div>

                            <div>
                              <Label htmlFor="timezone" className="mb-2 block">Timezone</Label>
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
                                <SelectTrigger id="timezone">
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
                            </div>

                            <div className="flex items-center">
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border w-full">
                                <Clock className="h-5 w-5 text-gray-500" />
                                <span className="text-gray-600">
                                  {campaign.schedule.sendTime
                                    ? `Scheduled for ${new Date(campaign.schedule.sendTime).toLocaleString()}`
                                    : "Send immediately when launched"
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-blue-700 mb-1">Scheduling Information</h4>
                                <p className="text-sm text-blue-700">
                                  If you don&apos;t select a date and time, your campaign will be sent immediately when launched.
                                  Messages will only be sent to contacts who have opted in to receive WhatsApp messages.
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t bg-gray-50">
                          <Button
                            variant="outline"
                            onClick={() => goToStep(4)}
                          >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>

                          <Button onClick={() => completeStep(5)}>
                            Continue
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  )}

                  {/* Step 6: Retries - Enhanced with day-based intervals */}
                  {activeStep === 6 && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-full">
                              <RefreshCw className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <CardTitle>Message Retries</CardTitle>
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
                  {activeStep === 7 && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <Rocket className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <CardTitle>Review and Launch</CardTitle>
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
