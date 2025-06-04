"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Send,
  Paperclip,
  Smile,
  FileText,
  Check,
  Phone,
  Video,
  Info,
  Tag,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  MessageSquare,
  X,
  ImageIcon,
  MoreVertical,
  Star,
  Archive,
  Settings,
  Circle,
  Filter,
  PlusCircle,
  Users,
  BookOpen,
  Calendar,
  Clipboard,
  UserPlus,
  CornerUpRight,
  ChevronDown
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isYesterday, isSameDay, differenceInDays, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

// Interface definitions aligned with our models
interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsappOptIn: boolean;
  tags: string[];
  notes?: string;
  wabaId: string;
  phoneNumberId: string;
  userId: string;
  lastMessageAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  senderId: 'customer' | 'agent' | 'system';
  content: string;
  messageType: 'text' | 'image' | 'video' | 'document' | 'audio' | 'template' | 'system' | 'note';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  whatsappMessageId?: string;
  templateName?: string;
  mediaUrl?: string;
  mediaCaption?: string;
  senderName?: string;
}

interface Conversation {
  id: string;
  contact: Contact;
  lastMessage: string;
  lastMessageType: string;
  lastMessageAt: string;
  status: 'active' | 'closed' | 'resolved' | 'pending';
  assignedTo?: string;
  unreadCount: number;
  tags: string[];
  labels: string[];
  isWithin24Hours: boolean;
  messageCount: number;
  wabaId: string;
  phoneNumberId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  status: string;
  components: any[];
  wabaId: string;
  createdAt: string;
  updatedAt: string;
}

interface Label {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// First, add these interfaces for template components
interface TemplateParameter {
  type: 'text' | 'image' | 'document' | 'video';
  text?: string;
  image?: { link: string };
  document?: { link: string, filename?: string };
  video?: { link: string };
}

interface TemplateComponent {
  type: 'header' | 'body' | 'footer' | 'button';
  parameters?: TemplateParameter[];
  sub_type?: string;
  index?: number;
}

function compute24hWindow(messages: Message[]): boolean {
  const lastCustomer = [...messages].reverse()
    .find(m => m.senderId === 'customer');
  if (!lastCustomer) return false;
  return Date.now() - new Date(lastCustomer.timestamp).getTime() < 86_400_000;
}


function ConversationsPageContent() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWabaId, setSelectedWabaId] = useState<string>("");
  const [wabaAccounts, setWabaAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showCreateLabelDialog, setShowCreateLabelDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("blue");
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; firstName: string }>({
    id: "",
    name: "",
    firstName: ""
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  // Let's add a dialog to handle variable input
  const [templateVariables, setTemplateVariables] = useState<{ [key: string]: string }>({});
  const [showTemplateVariablesDialog, setShowTemplateVariablesDialog] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ type: string, url: string } | null>(null);

  // Helper functions
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM dd");
  };

  const formatFullMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, "HH:mm");
  };

  const getDateGroupLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";

    const daysAgo = differenceInDays(new Date(), date);
    if (daysAgo < 7) return format(date, "EEEE"); // Day name
    return format(date, "MMMM d, yyyy"); // Full date
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getCurrentContact = () => activeConversation?.contact || selectedContact;
  const getCurrentChatTitle = () => getCurrentContact()?.name || "Select a conversation";
  const isWithin24Hours = () => activeConversation?.isWithin24Hours || Boolean(selectedContact);

  const getStatusIcon = (status: string) => {
    const iconClass = "h-3 w-3";
    switch (status) {
      case 'sent': return <Check className={cn(iconClass, "text-muted-foreground")} />;
      case 'delivered': return <CheckCircle className={cn(iconClass, "text-primary")} />;
      case 'read': return <CheckCircle className={cn(iconClass, "text-primary")} />;
      case 'failed': return <AlertCircle className={cn(iconClass, "text-destructive")} />;
      default: return <Clock className={cn(iconClass, "text-muted-foreground")} />;
    }
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.contact.phone.includes(searchQuery) ||
    conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group messages by date for displaying date separators
  const getGroupedMessages = () => {
    const grouped: { [key: string]: Message[] } = {};

    messages.forEach(message => {
      const date = new Date(message.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(message);
    });

    return grouped;
  };

  // API functions
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      console.log('User data response:', data);

      if (data.user) {
        const firstName = data.user.name.split(' ')[0];
        setCurrentUser({
          id: data.user.id,
          name: data.user.name,
          firstName
        });
        console.log('Current user set:', {
          id: data.user.id,
          name: data.user.name,
          firstName
        });
      } else {
        console.error('No user data in response:', data);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  }
  const fetchWabaAccounts = async () => {
    try {
      const response = await fetch('/api/waba-accounts');
      const data = await response.json();
      if (data.success && data.accounts) {
        setWabaAccounts(data.accounts);
        if (data.accounts.length > 0) {
          setSelectedWabaId(data.accounts[0].wabaId);
        }
      }
    } catch (error) {
      console.error('Error fetching WABA accounts:', error);
    }
  };

  useEffect(() => {
    if (!activeConversation) return;
    const within = compute24hWindow(messages);
    setActiveConversation(cv =>
      cv ? { ...cv, isWithin24Hours: within } : cv);
  }, [messages]);


  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedWabaId) params.append('wabaId', selectedWabaId);
      if (statusFilter !== "all") params.append('status', statusFilter);

      const response = await fetch(`/api/conversations?${params}`);
      const data = await response.json();
      if (data.success) setConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedWabaId) params.append('wabaId', selectedWabaId);
      const response = await fetch(`/api/contacts?${params}`);
      const data = await response.json();
      if (data.success) setContacts(data.contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      const data = await response.json();
      if (data.success) setMessages(data.conversation.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedWabaId) params.append('wabaId', selectedWabaId);
      params.append('status', 'APPROVED');
      const response = await fetch(`/api/templates?${params}`);
      const data = await response.json();
      if (data.success) setTemplates(data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchLabels = async () => {
    try {
      const response = await fetch('/api/labels');
      const data = await response.json();
      if (data.success) setLabels(data.labels);
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team-members');
      const data = await response.json();
      if (data.success) setTeamMembers(data.teamMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const createLabel = async () => {
    if (!newLabelName.trim()) return;

    try {
      const response = await fetch('/api/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLabelName.trim(),
          color: newLabelColor
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Add the new label to the labels array
        setLabels(prevLabels => [...prevLabels, data.label]);
        setNewLabelName("");
        setShowCreateLabelDialog(false);
        toast({ title: "Label created successfully" });
      } else {
        toast({ title: data.message || "Failed to create label", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to create label", variant: "destructive" });
    }
  };
  console.log(currentUser, 'current user');

  if (!isWithin24Hours()) {
    toast({
      title: "24-hour window closed",
      description: "Please use an approved template.",
      variant: "destructive",
    });
    setShowTemplateDialog(true);
    return;
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || isSending) return;
    const targetContact = getCurrentContact();
    if (!targetContact) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: targetContact.id,
          wabaId: selectedWabaId,
          message: messageInput.trim(),
          messageType: 'text',
          conversationId: activeConversation?.id,
          senderName: currentUser.name
        }),
      });

      const data = await response.json();
      if (data.success) {
        // If this was a new conversation, fetch it and set as active
        if (!activeConversation && data.conversationId) {
          const convResponse = await fetch(`/api/conversations/${data.conversationId}`);
          const convData = await convResponse.json();
          if (convData.success) {
            setActiveConversation(convData.conversation);
          }
        } else if (activeConversation) {
          // Otherwise, fetch the updated messages
          fetchMessages(activeConversation.id);
        }

        setMessageInput("");
        toast({ title: "Message sent successfully" });
      } else {
        toast({ title: data.message || "Failed to send message", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  // Modified sendTemplate function
  const sendTemplate = async (template: Template, skipVariables = false) => {
    const targetContact = getCurrentContact();
    if (!targetContact || isSending) return;

    // Check if template has components that need variables
    const needsVariables = template.components?.some(comp =>
      comp.type === 'body' && comp.text?.includes('{{') ||
      comp.type === 'header' && (comp.format === 'IMAGE' || comp.format === 'VIDEO' || comp.format === 'DOCUMENT')
    );

    // If template needs variables and we haven't collected them yet
    if (needsVariables && !skipVariables) {
      setSelectedTemplate(template);
      setTemplateVariables({}); // Reset variables
      setSelectedMedia(null); // Reset media
      setShowTemplateVariablesDialog(true);
      return;
    }

    setIsSending(true);
    try {
      // Prepare components with variables
      let templateComponents: TemplateComponent[] = [];

      if (template.components && template.components.length > 0) {
        templateComponents = template.components.map(component => {
          // Create a base component
          const templateComponent: TemplateComponent = {
            type: component.type
          };

          // For header with media
          if (component.type === 'header' && component.format) {
            if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(component.format) && selectedMedia) {
              templateComponent.parameters = [{
                type: component.format.toLowerCase() as 'image' | 'video' | 'document',
                [component.format.toLowerCase()]: {
                  link: selectedMedia.url,
                  ...(component.format === 'DOCUMENT' && { filename: selectedMedia.url.split('/').pop() })
                }
              }];
            }
          }

          // For body with text variables
          if (component.type === 'body' && component.text) {
            // Extract variables from the template text
            const variables = (component.text.match(/\{\{[^}]+\}\}/g) || [])
              .map((v: string) => v.replace(/\{\{|\}\}/g, '').trim());

            if (variables.length > 0) {
              templateComponent.parameters = variables.map((varName: string) => ({
                type: 'text',
                text: templateVariables[varName] || `[${varName}]` // Use entered value or placeholder
              }));
            }
          }

          return templateComponent;
        }).filter(comp => comp.type); // Filter out any invalid components
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: targetContact.id,
          wabaId: selectedWabaId,
          messageType: 'template',
          templateId: template.id,
          templateName: template.name,
          language: template.language,
          templateComponents: templateComponents.length > 0 ? templateComponents : undefined,
          conversationId: activeConversation?.id,
          senderName: currentUser.name
        }),
      });

      const data = await response.json();
      if (data.success) {
        // If this was a new conversation, fetch it and set as active
        if (!activeConversation && data.conversationId) {
          const convResponse = await fetch(`/api/conversations/${data.conversationId}`);
          const convData = await convResponse.json();
          if (convData.success) {
            setActiveConversation(convData.conversation);
          }
        } else if (activeConversation) {
          // Otherwise, fetch the updated messages
          fetchMessages(activeConversation.id);
        }

        setShowTemplateDialog(false);
        setShowTemplateVariablesDialog(false);
        toast({ title: "Template sent successfully" });
      } else {
        toast({
          title: "Failed to send template",
          description: data.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Template sending error:", error);
      toast({ title: "Failed to send template", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };


  const TemplateVariablesDialog = () => {
    if (!selectedTemplate) return null;

    // Extract variable names from template
    const variableNames: string[] = [];
    let hasMediaHeader = false;
    let mediaType = '';

    selectedTemplate.components?.forEach(component => {
      if (component.type === 'body' && component.text) {
        const matches = component.text.match(/\{\{[^}]+\}\}/g) || [];
        matches.forEach((match: string) => {
          const varName = match.replace(/\{\{|\}\}/g, '').trim();
          if (!variableNames.includes(varName)) {
            variableNames.push(varName);
          }
        });
      }

      if (component.type === 'header' && component.format) {
        if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(component.format)) {
          hasMediaHeader = true;
          mediaType = component.format.toLowerCase();
        }
      }
    });

    return (
      <Dialog open={showTemplateVariablesDialog} onOpenChange={setShowTemplateVariablesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Template Variables</DialogTitle>
            <DialogDescription>
              Enter values for the variables in this template
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Media upload if needed */}
            {hasMediaHeader && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload {mediaType}</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder={`Enter ${mediaType} URL`}
                    value={selectedMedia?.url || ''}
                    onChange={(e) => setSelectedMedia({ type: mediaType, url: e.target.value })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter a publicly accessible URL for your {mediaType}
                </p>
              </div>
            )}

            {/* Text variables */}
            {variableNames.map((varName, index) => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium">{varName}</label>
                <Input
                  placeholder={`Enter value for ${varName}`}
                  value={templateVariables[varName] || ''}
                  onChange={(e) => setTemplateVariables(prev => ({
                    ...prev,
                    [varName]: e.target.value
                  }))}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTemplateVariablesDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedTemplate && sendTemplate(selectedTemplate, true)}
            >
              Send Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  const selectContactForChat = (contact: Contact) => {
    const existingConversation = conversations.find(conv => conv.contact.id === contact.id);
    if (existingConversation) {
      setActiveConversation(existingConversation);
      setSelectedContact(null);
    } else {
      setSelectedContact(contact);
      setActiveConversation(null);
      setMessages([]);
    }
    setShowContactDialog(false);
  };

  const assignConversation = async (userId: string) => {
    if (!activeConversation) return;

    try {
      const response = await fetch(`/api/conversations/${activeConversation.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTo: userId,
          assignedBy: currentUser.name
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the conversation to get updated data
        const convResponse = await fetch(`/api/conversations/${activeConversation.id}`);
        const convData = await convResponse.json();
        if (convData.success) {
          setActiveConversation(convData.conversation);
        }

        // Fetch messages to get the system message
        fetchMessages(activeConversation.id);

        const assignedUser = teamMembers.find(m => m.id === userId);
        toast({ title: `Conversation assigned to ${assignedUser?.name || 'team member'}` });
      } else {
        toast({ title: data.message || "Failed to assign conversation", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to assign conversation", variant: "destructive" });
    }
  };

  const changeConversationStatus = async (status: 'active' | 'closed' | 'resolved' | 'pending') => {
    if (!activeConversation) return;

    try {
      const response = await fetch(`/api/conversations/${activeConversation.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          updatedBy: currentUser.name
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the conversation to get updated data
        const convResponse = await fetch(`/api/conversations/${activeConversation.id}`);
        const convData = await convResponse.json();
        if (convData.success) {
          setActiveConversation(convData.conversation);
        }

        // Fetch messages to get the system message
        fetchMessages(activeConversation.id);

        toast({ title: `Conversation marked as ${status.charAt(0).toUpperCase() + status.slice(1)}` });
      } else {
        toast({ title: data.message || "Failed to update conversation status", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to update conversation status", variant: "destructive" });
    }
  };

  const addLabelToConversation = async (labelId: string) => {
    if (!activeConversation) return;

    try {
      const response = await fetch(`/api/conversations/${activeConversation.id}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labelId,
          addedBy: currentUser.name
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the conversation to get updated data
        const convResponse = await fetch(`/api/conversations/${activeConversation.id}`);
        const convData = await convResponse.json();
        if (convData.success) {
          setActiveConversation(convData.conversation);
        }

        // Fetch messages to get the system message
        fetchMessages(activeConversation.id);

        const label = labels.find(l => l.id === labelId);
        toast({ title: `Label "${label?.name || 'selected'}" added to conversation` });
      } else {
        toast({ title: data.message || "Failed to add label", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to add label", variant: "destructive" });
    }
  };

  const addNoteToConversation = async () => {
    if (!activeConversation || !noteInput.trim()) return;

    try {
      const response = await fetch(`/api/conversations/${activeConversation.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: noteInput,
          addedBy: currentUser.name
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Fetch messages to get the note that was added
        fetchMessages(activeConversation.id);

        setNoteInput("");
        setShowNoteDialog(false);
        toast({ title: "Note added to conversation" });
      } else {
        toast({ title: data.message || "Failed to add note", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to add note", variant: "destructive" });
    }
  };

  // Effects
  useEffect(() => {
    fetchWabaAccounts();
    fetchLabels();
    fetchTeamMembers();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedWabaId) {
      fetchConversations();
      fetchContacts();
      fetchTemplates();
    }
  }, [selectedWabaId, statusFilter]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      setSelectedContact(null);
    }
  }, [activeConversation]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  if (wabaAccounts.length === 0) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 rounded-lg bg-card shadow-sm border max-w-md">
            <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Connect WhatsApp</h2>
            <p className="text-muted-foreground mb-6">
              Connect your WhatsApp Business Account to start managing conversations with your customers.
            </p>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="text-primary-foreground"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Connect Account
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-screen flex bg-background">
        {/* Conversations List Sidebar */}
        <div className="w-80 flex flex-col bg-card border-r">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-semibold text-lg">Conversations</h1>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-md"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Tabs defaultValue="all" className="w-full mb-4">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
                <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex justify-between items-center">
              <Select value={selectedWabaId} onValueChange={setSelectedWabaId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {wabaAccounts.map(account => (
                    <SelectItem key={account.wabaId} value={account.wabaId}>
                      {account.businessName || account.phoneNumber || account.wabaId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowContactDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {/* New conversation */}
              {selectedContact && (
                <div
                  className="p-3 rounded-md bg-primary/5 border cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => {
                    // Create a placeholder conversation
                    const placeholderConv: Conversation = {
                      id: "new",
                      contact: selectedContact,
                      lastMessage: "",
                      lastMessageType: "text",
                      lastMessageAt: new Date().toISOString(),
                      status: "active",
                      unreadCount: 0,
                      tags: [],
                      labels: [],
                      isWithin24Hours: true,
                      messageCount: 0,
                      wabaId: selectedContact.wabaId,
                      phoneNumberId: selectedContact.phoneNumberId,
                      userId: selectedContact.userId,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };
                    setActiveConversation(placeholderConv);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedContact.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground truncate">{selectedContact.name}</h4>
                        <Badge variant="secondary" className="ml-2 text-xs">New</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">Start conversation</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Existing conversations */}
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "p-3 rounded-md cursor-pointer transition-colors",
                    activeConversation?.id === conversation.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setActiveConversation(conversation)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {conversation.contact.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.contact.whatsappOptIn && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate">{conversation.contact.name}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(conversation.lastMessageAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mt-0.5">
                        {conversation.labels && conversation.labels.length > 0 && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] h-4 px-1.5",
                              labels.find(l => l.id === conversation.labels[0])?.color
                                ? `bg-${labels.find(l => l.id === conversation.labels[0])?.color}-100 text-${labels.find(l => l.id === conversation.labels[0])?.color}-800`
                                : "bg-blue-100 text-blue-800"
                            )}
                          >
                            {labels.find(l => l.id === conversation.labels[0])?.name || "Label"}
                          </Badge>
                        )}
                        {conversation.assignedTo && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-blue-50 text-blue-700">
                            {teamMembers.find(u => u.id === conversation.assignedTo)?.name.split(' ')[0] || "Assigned"}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {conversation.lastMessageType === "image" ? (
                            <span className="flex items-center gap-1">
                              <ImageIcon className="h-3 w-3" />
                              Photo
                            </span>
                          ) : (
                            conversation.lastMessage
                          )}
                        </p>

                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2 text-xs h-5 min-w-5 flex items-center justify-center rounded-full">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredConversations.length === 0 && !selectedContact && (
                <div className="text-center py-10 px-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium text-foreground mb-1">No conversations</h3>
                  <p className="text-muted-foreground text-sm mb-4">Start your first conversation</p>
                  <Button
                    onClick={() => setShowContactDialog(true)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        {(activeConversation || selectedContact) ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="bg-card border-b px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {getCurrentChatTitle().charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium text-foreground">{getCurrentChatTitle()}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                        {activeConversation?.status === 'active' ? 'Active' :
                          activeConversation?.status === 'closed' ? 'Closed' :
                            activeConversation?.status === 'resolved' ? 'Resolved' : 'Pending'}
                      </span>
                      {getCurrentContact()?.whatsappOptIn && (
                        <Badge variant="outline" className="text-xs h-5 px-1.5 border-green-200 text-green-700 bg-green-50">
                          WhatsApp
                        </Badge>
                      )}

                      {activeConversation?.assignedTo && (
                        <Badge variant="outline" className="text-xs h-5 px-1.5 bg-blue-50 text-blue-700 border-blue-200">
                          Assigned: {teamMembers.find(u => u.id === activeConversation.assignedTo)?.name.split(' ')[0] || 'Agent'}
                        </Badge>
                      )}

                      {activeConversation?.labels && activeConversation.labels.length > 0 && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs h-5 px-1.5",
                            labels.find(l => l.id === activeConversation.labels[0])?.color
                              ? `bg-${labels.find(l => l.id === activeConversation.labels[0])?.color}-100 text-${labels.find(l => l.id === activeConversation.labels[0])?.color}-800`
                              : "bg-blue-100 text-blue-800"
                          )}
                        >
                          {labels.find(l => l.id === activeConversation.labels[0])?.name || "Label"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Chat Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Actions
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {/* Assign to team member */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <UserPlus className="h-4 w-4 mr-2" />
                          <span>Assign to</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48">
                          {teamMembers.map(member => (
                            <DropdownMenuItem
                              key={member.id}
                              onClick={() => assignConversation(member.id)}
                            >
                              <User className="h-4 w-4 mr-2" />
                              <span>{member.name}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      {/* Add label */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Tag className="h-4 w-4 mr-2" />
                          <span>Add label</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48">
                          {labels.map(label => (
                            <DropdownMenuItem
                              key={label.id}
                              onClick={() => addLabelToConversation(label.id)}
                              className={`bg-${label.color}-100 text-${label.color}-800 hover:bg-${label.color}-200`}
                            >
                              <span>{label.name}</span>
                            </DropdownMenuItem>
                          ))}

                          {labels.length > 0 && <DropdownMenuSeparator />}

                          <DropdownMenuItem
                            onClick={() => setShowCreateLabelDialog(true)}
                            className="text-primary hover:bg-primary/10"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            <span>Create new label</span>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      {/* Add note */}
                      <DropdownMenuItem onClick={() => setShowNoteDialog(true)}>
                        <Clipboard className="h-4 w-4 mr-2" />
                        <span>Add note</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Status management */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Change status</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48">
                          <DropdownMenuItem
                            onClick={() => changeConversationStatus('active')}
                            className="text-green-700"
                          >
                            <Circle className="h-4 w-4 mr-2 fill-green-500 text-green-500" />
                            <span>Active</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => changeConversationStatus('pending')}
                            className="text-amber-700"
                          >
                            <Circle className="h-4 w-4 mr-2 fill-amber-500 text-amber-500" />
                            <span>Pending</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => changeConversationStatus('resolved')}
                            className="text-blue-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                            <span>Resolved</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => changeConversationStatus('closed')}
                            className="text-slate-700"
                          >
                            <Archive className="h-4 w-4 mr-2 text-slate-500" />
                            <span>Closed</span>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      <DropdownMenuSeparator />

                      {/* Send template */}
                      <DropdownMenuItem onClick={() => setShowTemplateDialog(true)}>
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Send template</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setShowInfoPanel(true)}
                  >
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Star conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <X className="h-4 w-4 mr-2" />
                        Delete conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-[#F2EAE4] h-[450px]">
              <div className="space-y-4 max-w-3xl mx-auto">
                {selectedContact && messages.length === 0 && (
                  <div className="text-center py-10">
                    <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Start the conversation</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Send your first message to {selectedContact.name} to begin the conversation.
                    </p>
                  </div>
                )}

                {/* Messages with date separators */}
                {Object.entries(getGroupedMessages()).map(([dateKey, dateMessages]) => {
                  const dateLabel = getDateGroupLabel(dateMessages[0].timestamp);

                  return (
                    <div key={dateKey} className="space-y-4">
                      {/* Date separator */}
                      <div className="flex items-center justify-center my-6">
                        <div className="bg-muted px-3 py-1 rounded-full text-xs font-medium text-muted-foreground">
                          {dateLabel}
                        </div>
                      </div>

                      {/* Messages for this date */}
                      {dateMessages.map((message) => {
                        // For system messages (assignments, status changes, notes)
                        if (message.messageType === 'system' || message.messageType === 'note') {
                          return (
                            <div key={message.id} className="flex justify-center">
                              <div className="bg-muted px-3 py-1.5 rounded-full text-xs text-muted-foreground max-w-[80%] text-center">
                                {message.content}
                              </div>
                            </div>
                          );
                        }

                        // For regular messages
                        return (
                          <div
                            key={message.id}
                            className={cn(
                              "flex",
                              message.senderId === "agent" ? "justify-end" : "justify-start"
                            )}
                          >
                            <div className="max-w-[75%] space-y-1 group">
                              {/* Message sender name */}
                              <div className={cn(
                                "text-xs text-muted-foreground",
                                message.senderId === "agent" ? "text-right" : "text-left"
                              )}>
                                {message.senderId === "agent"
                                  ? (message.senderName || currentUser.name)
                                  : getCurrentContact()?.name}
                              </div>

                              <div
                                className={cn(
                                  "px-4 py-3 rounded-lg relative",
                                  message.senderId === "agent"
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-card text-card-foreground rounded-bl-none"
                                )}
                              >
                                <p className="text-sm">{message.content}</p>
                                {message.templateName && (
                                  <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                                    <FileText className="h-3 w-3" />
                                    Template: {message.templateName}
                                  </div>
                                )}
                              </div>
                              <div className={cn(
                                "flex items-center gap-1 text-xs text-muted-foreground opacity-70",
                                message.senderId === "agent" ? "justify-end" : "justify-start"
                              )}>
                                <span>{formatFullMessageTime(message.timestamp)}</span>
                                {message.senderId === "agent" && getStatusIcon(message.status)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-card border-t p-4">
              {isWithin24Hours() ? (
                <div className="flex items-end gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Photo or Video
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4 mr-2" />
                        Document
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="min-h-[40px] max-h-32 resize-none pr-10 py-2"
                      rows={1}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full"
                    >
                      <Smile className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  <Button
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || isSending}
                    size="icon"
                    className="rounded-full h-10 w-10"
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-800 mb-1">
                        24-hour messaging window expired
                      </h4>
                      <p className="text-amber-700 text-sm mb-3">
                        You can only send pre-approved message templates to continue this conversation.
                      </p>
                      <Button
                        onClick={() => setShowTemplateDialog(true)}
                        variant="outline"
                        className="border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Choose Template
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-accent/10">
            <div className="text-center max-w-md px-6">
              <div className="bg-primary/10 p-6 rounded-full w-fit mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-3">Your conversations</h3>
              <p className="text-muted-foreground mb-6">
                Select an existing conversation or start a new one to begin messaging with your customers.
              </p>
              <Button
                onClick={() => setShowContactDialog(true)}
                size="lg"
                className="gap-2"
              >
                <PlusCircle className="h-5 w-5" />
                New Conversation
              </Button>
            </div>
          </div>
        )}

        {/* Contact Info Side Panel */}
        <Sheet open={showInfoPanel} onOpenChange={setShowInfoPanel}>
          <SheetContent className="w-[350px] sm:w-[400px] p-0">
            <div className="h-full flex flex-col">
              <SheetHeader className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <SheetTitle>Contact Details</SheetTitle>
                  <SheetClose className="rounded-full h-7 w-7 p-0 flex items-center justify-center">
                    <X className="h-4 w-4" />
                  </SheetClose>
                </div>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <ContactInfoPanel />
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>

        {/* Contact Selection Dialog */}
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start New Conversation</DialogTitle>
              <DialogDescription>
                Choose a contact to begin a new WhatsApp conversation
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-10"
                />
              </div>

              <ScrollArea className="h-[350px]">
                <div className="space-y-2">
                  {contacts
                    .filter(contact => !conversations?.find(conv => conv.contact.id === contact.id))
                    .map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3 rounded-md border hover:border-primary/50 hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => selectContactForChat(contact)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {contact.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground">{contact.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{contact.phone}</p>
                          </div>
                          <Badge
                            variant={contact.whatsappOptIn ? "default" : "secondary"}
                            className={cn(
                              contact.whatsappOptIn
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                            )}
                          >
                            {contact.whatsappOptIn ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}

                  {contacts.filter(contact => !conversations.find(conv => conv.contact.id === contact.id)).length === 0 && (
                    <div className="text-center py-8">
                      <div className="bg-muted p-4 rounded-full w-fit mx-auto mb-4">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-foreground mb-2">No available contacts</h3>
                      <p className="text-muted-foreground mb-4">All contacts already have active conversations</p>
                      <Button
                        variant="outline"
                        onClick={() => window.location.href = '/contacts'}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Manage Contacts
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowContactDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => window.location.href = '/contacts'}
              >
                <User className="h-4 w-4 mr-2" />
                Manage Contacts
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Template Selection Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Choose Message Template</DialogTitle>
              <DialogDescription>
                Select an approved template to send to your customer
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="h-[350px]">
              <div className="space-y-3">
                {templates.map((template) => {
                  // Determine if template has variables or media
                  const hasVariables = template.components?.some(comp =>
                    (comp.type === 'body' && comp.text?.includes('{{')) ||
                    (comp.type === 'header' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(comp.format || ''))
                  );

                  return (
                    <div
                      key={template.id}
                      className={cn(
                        "p-4 rounded-md border cursor-pointer transition-colors",
                        selectedTemplate?.id === template.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50 hover:bg-accent/50"
                      )}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-foreground">{template.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{template.category}</Badge>
                            {hasVariables && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                Variables
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary">{template.language}</Badge>
                      </div>
                      <div className="bg-muted p-3 rounded-md text-sm">
                        <p className="text-muted-foreground">
                          {template?.components?.find(c => c.type === 'BODY')?.text || 'Template preview not available'}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {templates.length === 0 && (
                  <div className="text-center py-8">
                    <div className="bg-muted p-4 rounded-full w-fit mx-auto mb-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-foreground mb-2">No templates available</h3>
                    <p className="text-muted-foreground mb-4">
                      Create and get approval for message templates to send outside the 24-hour messaging window
                    </p>
                    <Button
                      onClick={() => window.location.href = '/templates'}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Create Templates
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowTemplateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedTemplate && sendTemplate(selectedTemplate)}
                disabled={!selectedTemplate || isSending}
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Template
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Note Dialog */}
        <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
              <DialogDescription>
                Add a note to this conversation that will be visible to your team
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <Textarea
                placeholder="Type your note here..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNoteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={addNoteToConversation}
                disabled={!noteInput.trim()}
              >
                <Clipboard className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Label Dialog */}
        <Dialog open={showCreateLabelDialog} onOpenChange={setShowCreateLabelDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Label</DialogTitle>
              <DialogDescription>
                Create a new label to categorize your conversations
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Label Name</label>
                <Input
                  placeholder="Enter label name"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Label Color</label>
                <Select value={newLabelColor} onValueChange={setNewLabelColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                    <SelectItem value="indigo">Indigo</SelectItem>
                    <SelectItem value="amber">Amber</SelectItem>
                  </SelectContent>
                </Select>
                <div className={`mt-2 h-6 w-full rounded bg-${newLabelColor}-100`}></div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateLabelDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createLabel}
                disabled={!newLabelName.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Label
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <TemplateVariablesDialog />
      </div>
    </Layout>
  );

  // Contact Information Panel Component
  function ContactInfoPanel() {
    const contact = getCurrentContact();
    if (!contact) return null;

    return (
      <div className="space-y-6 p-6">
        {/* Profile Section */}
        <div className="text-center">
          <Avatar className="h-20 w-20 mx-auto mb-4">
            <AvatarFallback className="text-xl">
              {contact.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-medium text-foreground mb-1">{contact.name}</h3>
          <p className="text-muted-foreground">{contact.phone}</p>
          <div className="mt-3">
            <Badge
              variant={contact.whatsappOptIn ? "default" : "secondary"}
              className={cn(
                contact.whatsappOptIn
                  ? "bg-green-100 text-green-800"
                  : "bg-slate-100 text-slate-800"
              )}
            >
              {contact.whatsappOptIn ? "WhatsApp Active" : "WhatsApp Inactive"}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Conversation Stats */}
        {activeConversation && (
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Conversation Info
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium text-sm capitalize">{activeConversation.status}</p>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground">Messages</p>
                <p className="font-medium text-sm">{activeConversation.messageCount}</p>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground">First message</p>
                <p className="font-medium text-sm">
                  {format(new Date(activeConversation.createdAt || new Date()), "MMM d, yyyy")}
                </p>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground">24h window</p>
                <p className="font-medium text-sm">{activeConversation.isWithin24Hours ? "Active" : "Expired"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Details */}
        <div>
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Contact Information
          </h4>
          <div className="space-y-3">
            {contact.email && (
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Email Address</label>
                <div className="text-sm p-2 rounded-md bg-accent/50">{contact.email}</div>
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Phone Number</label>
              <div className="text-sm p-2 rounded-md bg-accent/50">{contact.phone}</div>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </h4>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          {contact.tags && contact.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {contact.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-accent/50"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No tags assigned</p>
          )}
        </div>

        {/* Notes Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-primary"
              onClick={() => setShowNoteDialog(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          {contact.notes ? (
            <div className="text-sm p-3 rounded-md bg-accent/50">
              <p className="text-foreground">{contact.notes}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No notes available</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            size="sm"
          >
            <Star className="h-4 w-4 mr-2 text-amber-500" />
            <span>Add to Favorites</span>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            size="sm"
          >
            <Archive className="h-4 w-4 mr-2 text-primary" />
            <span>Archive Conversation</span>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            size="sm"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>Block Contact</span>
          </Button>
        </div>
      </div>
    );
  }
}

export default function ConversationsPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <ConversationsPageContent />
    </Suspense>
  );
}
