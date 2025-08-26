"use client";

import { useState, useEffect, useRef, Suspense, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { IoIosSearch, IoMdCheckmark } from "react-icons/io";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { BiCheckDouble } from "react-icons/bi";
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
  ChevronDown,
  SortAsc,
  SortDesc,
  Inbox,
  MessageCircle,
  UserCheck,
  UserX,
  Zap,
  Shield,
  Eye,
  EyeOff,
  Menu,
  ArrowLeft,
  RefreshCcw,
  AlignJustify,
  Share,
  Copy,
  ExternalLink,
  Download,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Reply,
  LayoutIcon,
  CreditCard,
  ArrowRight
} from "lucide-react";
import { FaRegUserCircle } from "react-icons/fa";
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
  DropdownMenuCheckboxItem,
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
  DialogOverlay,
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
import { format, isToday, isYesterday, isSameDay, differenceInDays, parseISO, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FaSearch } from "react-icons/fa";
import EmojiPicker from 'emoji-picker-react';
import { type EmojiClickData } from 'emoji-picker-react';
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import { Label } from "@/components/ui/label";


/**
 * A helper to locate messages quickly when rendering replies.
 */
function useMessageMap(messages: Message[]) {
  return useMemo(() => {
    const map: Record<string, Message> = {};
    messages.forEach((m) => {
      if (m.whatsappMessageId) map[m.whatsappMessageId] = m;
      map[m.id] = m;
    });
    return map;
  }, [messages]);
}



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

// Add this interface after the existing interfaces
interface UserSubscription {
  plan: string;
  status: 'active' | 'expired' | 'cancelled';
  endDate?: string;
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

// Filter interfaces
interface ConversationFilters {
  status: string[];
  assigned: string[];
  labels: string[];
  messageType: string[];
  dateRange: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  unreadOnly: boolean;
  within24Hours: boolean;
  hasMedia: boolean;
  hasNotes: boolean;
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

// Add this helper function near the top of your component
const formatWhatsAppText = (text: string) => {
  if (!text) return '';

  // Handle WhatsApp formatting
  let formattedText = text
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/~(.*?)~/g, '<span style="text-decoration: line-through;">$1</span>');

  // Handle line breaks - convert \n to <br>
  formattedText = formattedText.replace(/\n/g, '<br>');

  return formattedText;
};







// Add these skeleton loader components after your imports
const ConversationSkeleton = () => (
  <div className="p-4 border-b border-border/30 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-muted/60 to-muted/40"></div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-gradient-to-r from-muted/60 to-muted/40 rounded"></div>
          <div className="h-3 w-12 bg-gradient-to-r from-muted/40 to-muted/30 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full"></div>
          <div className="h-3 w-20 bg-gradient-to-r from-muted/40 to-muted/30 rounded"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 w-40 bg-gradient-to-r from-muted/40 to-muted/30 rounded"></div>
          <div className="h-5 w-5 bg-gradient-to-r from-green-200 to-green-100 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
);

const MessageSkeleton = ({ isAgent = false }: { isAgent?: boolean }) => (
  <div className={`flex mb-4 animate-pulse ${isAgent ? 'justify-end' : 'justify-start'}`}>
    <div className="max-w-[65%] space-y-2">
      <div className={`text-xs px-1 ${isAgent ? 'text-right' : 'text-left'}`}>
        <div className={`h-3 w-16 bg-gradient-to-r from-muted/40 to-muted/30 rounded ${isAgent ? 'ml-auto' : ''}`}></div>
      </div>
      <div
        className={`px-3 py-2 rounded-lg relative shadow-sm ${isAgent
          ? "bg-gradient-to-br from-green-100/80 to-green-50/60 rounded-br-sm ml-auto"
          : "bg-gradient-to-br from-white/80 to-gray-50/60 rounded-bl-sm border border-gray-100"
          }`}
      >
        <div className="space-y-2 pb-4">
          <div className={`h-4 bg-gradient-to-r from-muted/40 to-muted/30 rounded ${Math.random() > 0.5 ? 'w-32' : 'w-48'}`}></div>
          {Math.random() > 0.6 && (
            <div className={`h-4 bg-gradient-to-r from-muted/30 to-muted/20 rounded ${Math.random() > 0.5 ? 'w-24' : 'w-36'}`}></div>
          )}
        </div>
        <div className="absolute bottom-1 right-2 flex items-center gap-1">
          <div className="h-2 w-8 bg-gradient-to-r from-muted/30 to-muted/20 rounded"></div>
          {isAgent && (
            <div className="h-3 w-3 bg-gradient-to-r from-blue-200 to-blue-100 rounded"></div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const ChatHeaderSkeleton = () => (
  <div className="bg-gradient-to-r from-card to-card/95 border-b border-border/50 px-4 py-3 shadow-sm backdrop-blur-md md:w-[94%] 2xl:w-[95%] flex-shrink-0 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10"></div>
        <div className="space-y-2">
          <div className="h-5 w-32 bg-gradient-to-r from-muted/60 to-muted/40 rounded"></div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-green-300 to-green-200"></div>
            <div className="h-3 w-16 bg-gradient-to-r from-muted/40 to-muted/30 rounded"></div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 w-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full"></div>
        <div className="h-8 w-8 bg-gradient-to-r from-muted/40 to-muted/30 rounded-full"></div>
        <div className="h-8 w-8 bg-gradient-to-r from-muted/40 to-muted/30 rounded-full"></div>
        <div className="h-8 w-8 bg-gradient-to-r from-muted/40 to-muted/30 rounded-full"></div>
      </div>
    </div>
  </div>
);

const ConversationListLoader = () => (
  <div className="space-y-0">
    <div className="p-4 border-b border-border/50 bg-gradient-to-r from-card to-card/95 flex-shrink-0">
      <div className="flex items-center gap-3 animate-pulse">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10"></div>
        <div className="space-y-2">
          <div className="h-5 w-20 bg-gradient-to-r from-muted/60 to-muted/40 rounded"></div>
          <div className="h-3 w-32 bg-gradient-to-r from-muted/40 to-muted/30 rounded"></div>
        </div>
      </div>
    </div>

    <div className="p-4 border-b border-border/50 bg-card/30 animate-pulse">
      <div className="h-10 bg-gradient-to-r from-background/60 to-background/40 rounded-lg border border-border/30"></div>
    </div>

    <div className="flex-1 overflow-hidden">
      {Array.from({ length: 8 }, (_, i) => (
        <ConversationSkeleton key={i} />
      ))}
    </div>
  </div>
);

const ChatAreaLoader = () => (
  <div className="flex-1 max-h-screen flex flex-col bg-gradient-to-b from-background to-background/95 backdrop-blur-md shadow-sm min-w-0 overflow-hidden">
    <ChatHeaderSkeleton />

    <div className="flex-1 max-h-[95%] md:w-[94%] 2xl:w-[95%] h-fit flex flex-col overflow-y-scroll relative">
      <div className="flex-1 overflow-y-auto" style={{ backgroundImage: "url('/bg.png')" }}>
        <div className="p-4 bg-cover bg-center bg-no-repeat min-h-full">
          <div className="space-y-4 mx-auto">
            {/* Date separator skeleton */}
            <div className="flex items-center justify-center my-8 animate-pulse">
              <div className="h-8 w-24 bg-gradient-to-r from-background/80 to-background/60 rounded-full border border-border/30"></div>
            </div>

            {/* Message skeletons */}
            {Array.from({ length: 6 }, (_, i) => (
              <MessageSkeleton key={i} isAgent={i % 3 === 0} />
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Input area skeleton */}
    <div className="sticky md:w-[94%] 2xl:w-[95%] bottom-12 bg-gradient-to-r from-card/95 to-card/90 border-t border-border/50 shadow-lg px-4 pb-6 pt-4 backdrop-blur-md animate-pulse">
      <div className="flex items-end gap-3 relative mx-auto">
        <div className="h-10 w-10 bg-gradient-to-r from-accent/60 to-accent/40 rounded-full"></div>
        <div className="flex-1 h-16 bg-gradient-to-r from-background/80 to-background/60 rounded-2xl border border-border/30"></div>
        <div className="h-12 w-12 bg-gradient-to-r from-primary/60 to-primary/40 rounded-full"></div>
      </div>
    </div>
  </div>
);
function ConversationsPageContent() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWabaId, setSelectedWabaId] = useState<string>("");
  const [wabaAccounts, setWabaAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  // Add loading states for messages
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  // Add this state variable after the existing state variables
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);



  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showCreateLabelDialog, setShowCreateLabelDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Add these state variables near the top of your component
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [selectedErrorMessage, setSelectedErrorMessage] = useState<Message | null>(null);

  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("blue");
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; firstName: string }>({
    id: "",
    name: "",
    firstName: ""
  });
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    content: string;
    senderName: string;
  } | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // Add new state for file uploads
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadType, setUploadType] = useState<'IMAGE' | 'VIDEO' | 'DOCUMENT'>('IMAGE');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);


  // Add more specific state for scroll management
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [scrollLocked, setScrollLocked] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true); // This should already exist in your code



  const [templateContactInfo, setTemplateContactInfo] = useState<{
    contactId: string;
    wabaId: string;
  } | null>(null);
  const messageMap = useMessageMap(messages);

  const renderReplySnippet = (msg: Message) => {
    if (!msg.replyTo) return null;
    const original = messageMap[msg.replyTo] as Message | undefined;
    return (
      <div className="mb-1 pl-2 border-l-2 border-primary/40 text-xs text-muted-foreground max-w-full truncate">
        <span className="font-medium">
          {original?.senderName || (original?.senderId === "agent" ? "You" : getCurrentContact()?.name || "Customer")}
        </span>
        : {original?.content || "[Deleted message]"}
      </div>
    );
  };


  const handleFileSelect = (file: File, type: string) => {
    console.log('File selected:', file.name, type);
  };

  // Update the handleUploadComplete function to populate templateMediaInputs
  // Update handleUploadComplete to better handle template media
  // Update the handleUploadComplete function
  const handleUploadComplete = (url: string, type: 'IMAGE' | 'VIDEO' | 'DOCUMENT') => {
    console.log('🎉 Upload completed:', { url, type });

    // If we're in template mode, set the template media input
    if (selectedTemplate) {
      const mediaType = type.toLowerCase();
      const inputKey = `header_${mediaType}`;

      setTemplateMediaInputs(prev => {
        const updated = {
          ...prev,
          [inputKey]: url
        };
        console.log('🔧 Updated templateMediaInputs:', updated);
        return updated;
      });

      toast({
        title: "Upload successful",
        description: `${type.toLowerCase()} uploaded and ready to use in template`
      });
    } else {
      // Regular media message - send immediately
      sendMediaMessage(url, type);
    }

    // Close the upload dialog
    setShowFileUpload(false);
  };



  const handleMediaUpload = (type: 'IMAGE' | 'VIDEO' | 'DOCUMENT') => {
    console.log('handleMediaUpload called with type:', type);

    // Set the upload type and show file upload dialog
    setUploadType(type);
    setShowFileUpload(true);

    // If we're in template mode, we need to remember this is for a template
    if (selectedTemplate) {
      console.log('Upload is for template:', selectedTemplate.name);
    }
  };


  // Add a function to handle emoji selection
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput(prev => prev + emojiData.emoji);
    // Optionally close the picker after selection
    // setShowEmojiPicker(false);
  };
  // Filter states
  const [filters, setFilters] = useState<ConversationFilters>({
    status: [],
    assigned: [],
    labels: [],
    messageType: [],
    dateRange: 'all',
    sortBy: 'lastMessageAt',
    sortOrder: 'desc',
    unreadOnly: false,
    within24Hours: false,
    hasMedia: false,
    hasNotes: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  // Add these state variables
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Add this near the top of your component where other useEffects are defined
  useEffect(() => {
    const handleContactIdFromUrl = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const contactId = searchParams.get('contactId');

      if (contactId && contacts.length > 0) {
        // Find the contact with the matching ID
        const matchingContact = contacts.find(contact => contact.id === contactId);

        if (matchingContact) {
          console.log('Found matching contact from URL param:', matchingContact);

          // Check if there's an existing conversation with this contact
          const existingConversation = conversations.find(
            conv => conv.contact && (conv.contact.id === contactId || conv.contact._id === contactId)
          );

          if (existingConversation) {
            console.log('Opening existing conversation:', existingConversation);
            setActiveConversation(existingConversation);
            setSelectedContact(null);
          } else {
            console.log('Starting new conversation with contact:', matchingContact);
            setSelectedContact(matchingContact);
            setActiveConversation(null);
            setMessages([]);
          }

          // Clear the URL parameter without page reload
          window.history.replaceState({}, document.title, '/conversations');
        } else {
          console.log('Contact ID from URL not found in contacts list:', contactId);
          // If contacts are loaded but the specified contact isn't found, fetch it directly
          if (selectedWabaId) {
            try {
              const response = await fetch(`/api/contacts/${contactId}`);
              const data = await response.json();

              if (data.success && data.contact) {
                console.log('Fetched contact directly:', data.contact);
                setSelectedContact(data.contact);
                setActiveConversation(null);
                setMessages([]);

                // Clear the URL parameter without page reload
                window.history.replaceState({}, document.title, '/conversations');
              }
            } catch (error) {
              console.error('Error fetching specific contact:', error);
              toast({
                title: "Error",
                description: "Couldn't find the specified contact",
                variant: "destructive"
              });
            }
          }
        }
      }
    };

    handleContactIdFromUrl();
  }, [contacts, conversations, selectedWabaId]);
  // Add this debugging useEffect temporarily
  useEffect(() => {
    console.log('selectedImageUrl state changed:', selectedImageUrl);
  }, [selectedImageUrl]);
  // Add these helper functions
  const formatTemplatePreview = (text: string) => {
    if (!text) return '';

    // Replace variables with sample values
    let formattedText = text.replace(/\{\{[^}]+\}\}/g, (match) => {
      const varName = match.replace(/\{\{|\}\}/g, '').trim();
      return `[${varName}]`;
    });

    return formattedText;
  };

  // Update the hasMediaHeaders function with better case handling
  const hasMediaHeaders = (template: Template) => {
    if (!template.components) return false;

    return template.components.some(comp => {
      const componentType = comp.type?.toUpperCase?.() || comp.type?.toUpperCase();
      const format = comp.format?.toUpperCase?.() || comp.format?.toUpperCase();

      console.log('Checking component for media header:', {
        type: componentType,
        format: format,
        isHeaderWithMedia: componentType === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(format)
      });

      return componentType === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(format);
    });
  };

  // Update the hasTemplateVariables function with better case handling
  const hasTemplateVariables = (template: Template) => {
    if (!template.components) return false;

    return template.components.some(comp => {
      const componentType = comp.type?.toUpperCase?.() || comp.type?.toUpperCase();
      const format = comp.format?.toUpperCase?.() || comp.format?.toUpperCase();

      // Check for TEXT variables in body
      if (componentType === 'BODY' && comp.text?.includes('{{')) {
        return true;
      }
      // Check for TEXT variables in TEXT headers
      if (componentType === 'HEADER' && format === 'TEXT' && comp.text?.includes('{{')) {
        return true;
      }
      // Check for URL variables in buttons
      if (componentType === 'BUTTON' && comp.sub_type === 'url' && comp.url?.includes('{{')) {
        return true;
      }
      // Check for URL variables in BUTTONS component
      if (componentType === 'BUTTONS' && comp.buttons) {
        return comp.buttons.some((button: any) =>
          button.type === 'URL' && button.url?.includes('{{')
        );
      }
      return false;
    });
  };


  const [templateMediaInputs, setTemplateMediaInputs] = useState<{ [key: string]: string }>({});
  const [showTemplateVariablesDialog, setShowTemplateVariablesDialog] = useState(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Add scroll functions
  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Add useEffect to check scrollability when content changes
  useEffect(() => {
    checkScrollability();
  }, [contacts, conversations]);

  // Bulk selection states
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  const [isLow, setIsLow] = useState(false);
  const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false);
  const [showBulkTagDialog, setShowBulkTagDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkAssignUserId, setBulkAssignUserId] = useState("");
  const [bulkTagName, setBulkTagName] = useState("");
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [selectedBulkTags, setSelectedBulkTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  // Helper function to get unique tags from all contacts
  const getUniqueTags = () => {
    return Array.from(new Set(contacts.flatMap(contact => contact.tags || [])))
      .filter(tag => tag && tag.trim().length > 0)
      .sort();
  };

  // Updated bulkAddTags function to handle _id property
  const bulkAddTags = async () => {
    if (selectedBulkTags.length === 0 || selectedConversations.length === 0) return;

    setIsBulkProcessing(true);
    console.log("Starting bulk tag operation...");

    try {
      let successCount = 0;
      let failCount = 0;

      // Process each conversation one by one
      for (const conversationId of selectedConversations) {
        // Find the conversation in our local state
        const conversation = conversations.find(c => c.id === conversationId);

        console.log(`Processing conversation:`, conversation);

        if (!conversation) {
          console.error(`Conversation ${conversationId} not found in state`);
          failCount++;
          continue;
        }

        // Check if contact exists
        if (!conversation.contact) {
          console.error(`Conversation ${conversationId} has no contact property`);
          failCount++;
          continue;
        }

        // Get contact ID - handle both id and _id properties
        const contactId = conversation.contact.id || conversation.contact._id;

        if (!contactId) {
          console.error(`Contact in conversation ${conversationId} has no id or _id property`);
          failCount++;
          continue;
        }

        console.log(`Processing contact ${contactId} from conversation ${conversationId}`);

        // Process each tag for this contact
        for (const tag of selectedBulkTags) {
          if (!tag.trim()) continue;

          console.log(`Adding tag "${tag}" to contact ${contactId}`);

          try {
            const response = await fetch(`/api/contacts/${contactId}/tags`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tag: tag.trim() }),
            });

            if (response.ok) {
              successCount++;
              console.log(`Successfully added tag "${tag}" to contact ${contactId}`);
            } else {
              failCount++;
              const errorData = await response.json();
              console.error(`Failed to add tag "${tag}" to contact ${contactId}:`, errorData);
            }
          } catch (error) {
            failCount++;
            console.error(`Error adding tag "${tag}" to contact ${contactId}:`, error);
          }
        }
      }

      // Refresh data
      await fetchConversations();
      await fetchContacts();

      const message = failCount > 0
        ? `Added tags with ${successCount} successes and ${failCount} failures`
        : `Successfully added tags to all selected conversations`;

      toast({
        title: "Tags updated",
        description: message,
        variant: failCount > 0 ? "default" : "default"
      });

      // Reset the dialog state
      setShowBulkTagDialog(false);
      setSelectedBulkTags([]);
      setBulkTagName("");
      setTagSearchQuery("");
      clearSelection();

    } catch (error) {
      console.error("Error in bulk tag operation:", error);
      toast({
        title: "Failed to add tags",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Helper functions
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM dd");
  };

  const formatFullMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, "h:mm a"); // Changed from "HH:mm" to "h:mm a"
  }

  const getDateGroupLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";

    const daysAgo = differenceInDays(new Date(), date);
    if (daysAgo < 7) return format(date, "EEEE"); // Day name
    return format(date, "MMMM d, yyyy"); // Full date
  };

  // Add function to refresh data
  // Update refresh to preserve scroll position
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await fetchConversations();
      await fetchContacts();
      if (activeConversation) {
        // Use preserve mode during refresh
        await fetchMessages(activeConversation.id, 'preserve');
      }
      toast({ title: "Data refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Failed to refresh data",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };




  // Add this useEffect to auto-select the first conversation
  useEffect(() => {
    // Auto-select first conversation when page loads
    if (!activeConversation && !selectedContact && filteredConversations.length > 0) {
      const firstConversation = filteredConversations[0];
      console.log('Auto-selecting first conversation:', firstConversation);

      // Check if contact details are available
      if (firstConversation.contact?.id) {
        setActiveConversation(firstConversation);
        console.log('Contact ID available:', firstConversation.contact.id);
      } else {
        // If contact details are missing, fetch them
        console.log('Contact details missing, fetching conversation details...');
        fetchConversationDetails(firstConversation.id).then(() => {
          // After fetching, the conversation should have contact details
          const updatedConversation = conversations.find(c => c.id === firstConversation.id);
          if (updatedConversation?.contact?.id) {
            setActiveConversation(updatedConversation);
            console.log('Contact ID now available:', updatedConversation.contact.id);
          }
        });
      }
    }
  }, [filteredConversations, activeConversation, selectedContact, conversations]);

  const getCurrentContact = () => selectedContact || activeConversation?.contact;
  const getCurrentChatTitle = () => getCurrentContact()?.name || "Select a conversation";
  const isWithin24Hours = () => {
    if (selectedContact) return true; // New conversations are always within 24h
    return activeConversation?.isWithin24Hours || false;
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "h-3 w-3";
    switch (status) {
      case 'sent': return <Check className={cn(iconClass, "text-muted-foreground")} />; // Single gray check
      case 'delivered': return (<BiCheckDouble className="scale-150 text-blue-500" />
      ); // Double gray checks
      case 'read': return (
        <div className="relative">
          <Check className={cn(iconClass, "text-blue-500")} />
          <Check className={cn(iconClass, "text-blue-500 absolute -right-1")} />
        </div>
      ); // Double blue checks
      case 'failed': return <AlertCircle className={cn(iconClass, "text-red-500")} />; // Red alert for failed
      default: return <Clock className={cn(iconClass, "text-muted-foreground")} />; // Clock for pending
    }
  };
  // Debounced scroll handler to better detect user intent
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showAddTagDialog, setShowAddTagDialog] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  // Bulk selection functions
  const toggleConversationSelection = (conversationId: string) => {
    setSelectedConversations(prev =>
      prev.includes(conversationId)
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  };

  const selectAllConversations = () => {
    setSelectedConversations(filteredConversations.map(conv => conv.id));
  };

  const clearSelection = () => {
    setSelectedConversations([]);
  };

  const exitBulkMode = () => {
    setIsBulkSelectMode(false);
    clearSelection();
  };
  // Update the handleScroll function to work with regular div
  // Update scroll handler to be more responsive
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom < 100;
    const isScrolledUp = distanceFromBottom > 150;

    // Immediately set scroll lock to prevent any auto-scrolling
    setScrollLocked(true);
    setIsUserScrolling(true);

    // Update scroll states
    setUserScrolledUp(isScrolledUp);
    setShouldAutoScroll(isNearBottom);

    console.log('User scrolling:', { distanceFromBottom, isScrolledUp, isNearBottom });

    // Clear previous timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    // Longer timeout to ensure user has really stopped scrolling
    const newTimeout = setTimeout(() => {
      console.log('User stopped scrolling, unlocking');
      setScrollLocked(false);
      setIsUserScrolling(false);
    }, 1500); // Increased to 1.5 seconds

    setScrollTimeout(newTimeout);
  }, [scrollTimeout]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [scrollTimeout]);

  // Update the scrollToBottom function
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current && messagesEndRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  // Bulk action functions
  const bulkAssignConversations = async () => {
    if (!bulkAssignUserId || selectedConversations.length === 0) return;

    setIsBulkProcessing(true);
    try {
      const promises = selectedConversations.map(conversationId =>
        fetch(`/api/conversations/${conversationId}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignedTo: bulkAssignUserId }),
        })
      );

      await Promise.all(promises);

      // Refresh conversations
      await fetchConversations();

      const assignedUser = teamMembers.find(m => m.id === bulkAssignUserId);
      toast({
        title: `${selectedConversations.length} conversations assigned to ${assignedUser?.name}`
      });

      setShowBulkAssignDialog(false);
      setBulkAssignUserId("");
      clearSelection();
    } catch (error) {
      toast({
        title: "Failed to assign conversations",
        variant: "destructive"
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const bulkAddTag = async () => {
    if (!bulkTagName.trim() || selectedConversations.length === 0) return;

    setIsBulkProcessing(true);
    try {
      // Get contact IDs from selected conversations
      const contactPromises = selectedConversations.map(async (conversationId) => {
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation?.contact?.id) {
          return fetch(`/api/contacts/${conversation.contact.id}/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tag: bulkTagName.trim() }),
          });
        }
        return null;
      });

      const responses = await Promise.all(contactPromises);
      const successful = responses.filter(r => r !== null).length;

      // Refresh data
      await fetchConversations();
      await fetchContacts();

      toast({
        title: `Tag "${bulkTagName}" added to ${successful} contacts`
      });

      setShowBulkTagDialog(false);
      setBulkTagName("");
      clearSelection();
    } catch (error) {
      toast({
        title: "Failed to add tags",
        variant: "destructive"
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const bulkDeleteConversations = async () => {
    if (selectedConversations.length === 0) return;

    setIsBulkProcessing(true);
    try {
      const promises = selectedConversations.map(conversationId =>
        fetch(`/api/conversations/${conversationId}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(promises);

      // Refresh conversations
      await fetchConversations();

      toast({
        title: `${selectedConversations.length} conversations deleted`
      });

      setShowBulkDeleteDialog(false);
      clearSelection();

      // If active conversation was deleted, clear it
      if (activeConversation && selectedConversations.includes(activeConversation.id)) {
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (error) {
      toast({
        title: "Failed to delete conversations",
        variant: "destructive"
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Add these functions to handle tags
  // Modify the handleAddTag function to accept an optional tag parameter
  const handleAddTag = async (existingTag?: string) => {
    const tagToAdd = existingTag || newTag.trim();
    if (!tagToAdd || !getCurrentContact()) return;

    try {
      const response = await fetch(`/api/contacts/${getCurrentContact()?.id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag: tagToAdd,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update the contact with the new tag
        if (selectedContact) {
          setSelectedContact({
            ...selectedContact,
            tags: [...(selectedContact.tags || []), tagToAdd]
          });
        } else if (activeConversation) {
          setActiveConversation({
            ...activeConversation,
            contact: {
              ...activeConversation.contact,
              tags: [...(activeConversation.contact.tags || []), tagToAdd]
            }
          });
        }

        // Refresh contacts list to update tags
        fetchContacts();
        if (!existingTag) {
          setNewTag("");
        }
        toast({ title: "Tag added successfully" });
      } else {
        toast({ title: "Failed to add tag", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error adding tag:", error);
      toast({ title: "Failed to add tag", variant: "destructive" });
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!getCurrentContact()) return;

    try {
      const response = await fetch(`/api/contacts/${getCurrentContact()?.id}/tags/${encodeURIComponent(tagToRemove)}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        // Update the contact without the removed tag
        if (selectedContact) {
          setSelectedContact({
            ...selectedContact,
            tags: selectedContact.tags.filter(tag => tag !== tagToRemove)
          });
        } else if (activeConversation) {
          setActiveConversation({
            ...activeConversation,
            contact: {
              ...activeConversation.contact,
              tags: activeConversation.contact.tags.filter(tag => tag !== tagToRemove)
            }
          });
        }

        // Refresh contacts list to update tags
        fetchContacts();
        toast({ title: "Tag removed successfully" });
      } else {
        toast({ title: "Failed to remove tag", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error removing tag:", error);
      toast({ title: "Failed to remove tag", variant: "destructive" });
    }
  };

  // Add this helper function to safely check for tags
  const hasTag = (conversation: Conversation, tagName: string) => {
    if (!conversation.contact) return false;
    if (!conversation.contact.tags) return false;
    if (!Array.isArray(conversation.contact.tags)) return false;
    return conversation.contact.tags.includes(tagName);
  };

  // Filter functions
  // Update the applyFilters function
  const applyFilters = (convs: Conversation[]) => {
    let filtered = [...convs];
    // **NEW: Filter out closed conversations by default unless specifically filtered for**
    if (!filters.status.includes('closed')) {
      filtered = filtered.filter(conv => conv.status !== 'closed');
    }
    // Text search
    if (searchQuery.trim()) {
      filtered = filtered.filter(conversation =>
        conversation.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.contact.phone.includes(searchQuery) ||
        conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tag filter - this should be the primary filter when activeTagFilter is set
    if (activeTagFilter) {
      console.log(`Filtering by tag "${activeTagFilter}"`);

      filtered = filtered.filter(conversation => {
        // Ensure the contact exists and has tags that include the active filter
        return conversation.contact &&
          Array.isArray(conversation.contact.tags) &&
          conversation.contact.tags.includes(activeTagFilter);
      });

      console.log(`After tag filter: ${filtered.length} conversations remaining`);

      // When tag filter is active, skip other filters to avoid conflicts
      return filtered;
    }

    // Only apply other filters if no tag filter is active
    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(conv => filters.status.includes(conv.status));
    }

    // Assigned filter
    if (filters.assigned.length > 0) {
      filtered = filtered.filter(conv => {
        if (filters.assigned.includes('unassigned')) {
          return !conv.assignedTo || filters.assigned.includes(conv.assignedTo);
        }
        return conv.assignedTo && filters.assigned.includes(conv.assignedTo);
      });
    }

    // Labels filter
    if (filters.labels.length > 0) {
      filtered = filtered.filter(conv =>
        conv.labels && conv.labels.some(label => filters.labels.includes(label))
      );
    }

    // Message type filter
    if (filters.messageType.length > 0) {
      filtered = filtered.filter(conv => filters.messageType.includes(conv.lastMessageType));
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let dateThreshold: Date;

      switch (filters.dateRange) {
        case 'today':
          dateThreshold = startOfDay(now);
          break;
        case 'yesterday':
          dateThreshold = startOfDay(subDays(now, 1));
          break;
        case 'week':
          dateThreshold = subDays(now, 7);
          break;
        case 'month':
          dateThreshold = subDays(now, 30);
          break;
        default:
          dateThreshold = new Date(0);
      }

      filtered = filtered.filter(conv => new Date(conv.lastMessageAt) >= dateThreshold);
    }

    // Unread only filter
    if (filters.unreadOnly) {
      filtered = filtered.filter(conv => conv.unreadCount > 0);
    }

    // Within 24 hours filter
    if (filters.within24Hours) {
      filtered = filtered.filter(conv => conv.isWithin24Hours);
    }

    // Has media filter
    if (filters.hasMedia) {
      filtered = filtered.filter(conv =>
        ['image', 'video', 'document', 'audio'].includes(conv.lastMessageType)
      );
    }

    // Has notes filter
    if (filters.hasNotes) {
      filtered = filtered.filter(conv =>
        conv.contact.notes && conv.contact.notes.trim().length > 0
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'lastMessageAt':
          aValue = new Date(a.lastMessageAt);
          bValue = new Date(b.lastMessageAt);
          break;
        case 'name':
          aValue = a.contact.name.toLowerCase();
          bValue = b.contact.name.toLowerCase();
          break;
        case 'unreadCount':
          aValue = a.unreadCount;
          bValue = b.unreadCount;
          break;
        case 'messageCount':
          aValue = a.messageCount;
          bValue = b.messageCount;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = new Date(a.lastMessageAt);
          bValue = new Date(b.lastMessageAt);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Update filtered conversations when filters or conversations change
  // Update this useEffect to include activeTagFilter in the dependency array
  useEffect(() => {
    const filtered = applyFilters(conversations);
    setFilteredConversations(filtered);
  }, [searchQuery, filters, conversations, activeTagFilter]);

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      status: [],
      assigned: [],
      labels: [],
      messageType: [],
      dateRange: 'all',
      sortBy: 'lastMessageAt',
      sortOrder: 'desc',
      unreadOnly: false,
      within24Hours: false,
      hasMedia: false,
      hasNotes: false,
    });
    setSearchQuery("");
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.assigned.length > 0) count++;
    if (filters.labels.length > 0) count++;
    if (filters.messageType.length > 0) count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.unreadOnly) count++;
    if (filters.within24Hours) count++;
    if (filters.hasMedia) count++;
    if (filters.hasNotes) count++;
    if (searchQuery.trim()) count++;
    return count;
  };

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
  // Update the fetchCurrentUser function
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

        // Set subscription data
        setUserSubscription(data.user.subscription);

        if (data.user.walletBalance < 250) {
          setIsLow(true)
        }
        console.log('Current user set:', {
          id: data.user.id,
          name: data.user.name,
          firstName
        });
        console.log('Subscription:', data.user.subscription);
        console.log(isLow, 'is low???')
      } else {
        console.error('No user data in response:', data);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    } finally {
      setIsCheckingSubscription(false);
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
    if (!activeConversation || messages.length === 0) return;

    const within = compute24hWindow(messages);

    // Update the conversation in the conversations list instead
    if (activeConversation.isWithin24Hours !== within) {
      setConversations(prevConversations =>
        prevConversations.map(conv =>
          conv.id === activeConversation.id
            ? { ...conv, isWithin24Hours: within }
            : conv
        )
      );

      // Update filtered conversations too
      setFilteredConversations(prevFiltered =>
        prevFiltered.map(conv =>
          conv.id === activeConversation.id
            ? { ...conv, isWithin24Hours: within }
            : conv
        )
      );

      // Update active conversation without triggering the conversation change effect
      setActiveConversation(prev => prev ? { ...prev, isWithin24Hours: within } : prev);
    }
  }, [messages]);

  // Add this new function to handle sending uploaded media
  const sendMediaMessage = async (mediaUrl: string, mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT', caption?: string) => {
    if (!getCurrentContact() || isSending) return;

    let contactId: string;
    let wabaId: string;

    if (selectedContact) {
      contactId = selectedContact.id;
      wabaId = selectedContact.wabaId;
    } else if (activeConversation?.contact?.id) {
      contactId = activeConversation.contact.id;
      wabaId = activeConversation.wabaId;
    } else {
      toast({
        title: "Contact information missing",
        description: "Please select a contact to send media",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId,
          wabaId,
          messageType: mediaType.toLowerCase(), // 'image', 'video', 'document'
          mediaUrl,
          mediaCaption: caption,
          conversationId: activeConversation?.id,
          senderName: currentUser.name
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (!activeConversation && data.conversationId) {
          const convResponse = await fetch(`/api/conversations/${data.conversationId}`);
          const convData = await convResponse.json();
          if (convData.success) {
            setActiveConversation(convData.conversation);
            setSelectedContact(null);
            fetchConversations();
          }
        } else if (activeConversation) {
          setUserScrolledUp(false);
          setScrollLocked(false);
          setTimeout(() => {
            fetchMessages(activeConversation.id, 'force-bottom');
          }, 100);
          fetchConversations();
        }

        toast({ title: `${mediaType.toLowerCase()} sent successfully` });
      } else {
        toast({
          title: `Failed to send ${mediaType.toLowerCase()}`,
          description: data.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Send media error:', error);
      toast({
        title: `Failed to send ${mediaType.toLowerCase()}`,
        description: "Network error. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };



  // Update your fetchConversations function
  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Add this near your fetchContacts function
  const fetchContacts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedWabaId) params.append('wabaId', selectedWabaId);
      const response = await fetch(`/api/contacts?${params}`);
      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts);
        console.log("Fetched contacts with tags:", data.contacts.map(c => ({ name: c.name, tags: c.tags })));
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  // Update the fetchMessages function to be more conservative about auto-scrolling
  const fetchMessages = async (conversationId: string, scrollBehavior: 'auto' | 'force-bottom' | 'preserve' | 'none' = 'auto') => {
    try {
      setIsLoadingMessages(true);

      // Get REAL current scroll position instead of relying on state
      const scrollContainer = scrollAreaRef.current;
      let wasActuallyAtBottom = false;
      let currentScrollTop = 0;
      let currentScrollHeight = 0;

      if (scrollContainer) {
        currentScrollTop = scrollContainer.scrollTop;
        currentScrollHeight = scrollContainer.scrollHeight;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        wasActuallyAtBottom = distanceFromBottom < 50; // User is actually at bottom
      }

      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      const data = await response.json();

      if (data.success) {
        const newMessages = data.conversation.messages || [];
        const hasNewMessages = newMessages.length > lastMessageCount;

        setMessages(newMessages);
        setLastMessageCount(newMessages.length);

        // Handle scrolling based on behavior and ACTUAL scroll position
        setTimeout(() => {
          if (scrollLocked || isUserScrolling) {
            // NEVER interfere if user is actively scrolling
            console.log('User is scrolling, skipping auto-scroll');
            return;
          }

          switch (scrollBehavior) {
            case 'force-bottom':
              // Always scroll to bottom (user sent message, conversation change)
              console.log('Force scrolling to bottom');
              scrollToBottom();
              setUserScrolledUp(false);
              setShouldAutoScroll(true);
              break;

            case 'preserve':
              // NEVER auto-scroll, always preserve position
              console.log('Preserving scroll position');
              if (scrollContainer && hasNewMessages) {
                // Try to maintain the same relative position
                const newScrollHeight = scrollContainer.scrollHeight;
                const heightDiff = newScrollHeight - currentScrollHeight;
                if (heightDiff > 0) {
                  scrollContainer.scrollTop = currentScrollTop + heightDiff;
                }
              }
              break;

            case 'none':
              // Do absolutely nothing
              console.log('No scroll action');
              break;

            case 'auto':
            default:
              // Only auto-scroll if user was ACTUALLY at bottom AND there are new messages
              if (wasActuallyAtBottom && hasNewMessages && !userScrolledUp) {
                console.log('User was at bottom, auto-scrolling to show new messages');
                scrollToBottom();
                setShouldAutoScroll(true);
              } else if (hasNewMessages && userScrolledUp) {
                // User is scrolled up, maintain their position
                console.log('User scrolled up, maintaining position despite new messages');
                if (scrollContainer) {
                  const newScrollHeight = scrollContainer.scrollHeight;
                  const heightDiff = newScrollHeight - currentScrollHeight;
                  if (heightDiff > 0) {
                    scrollContainer.scrollTop = currentScrollTop + heightDiff;
                  }
                }
              } else {
                console.log('No auto-scroll needed');
              }
              break;
          }
        }, 50);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };
  // Add this function inside the ConversationsPageContent component
  const markConversationAsRead = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/mark-read`, {
        method: 'POST'
      });

      if (response.ok) {
        // Update the local conversation state
        setConversations(prevConversations =>
          prevConversations.map(conv =>
            conv.id === conversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );

        // Update filtered conversations as well
        setFilteredConversations(prevFiltered =>
          prevFiltered.map(conv =>
            conv.id === conversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error);
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
  }, [selectedWabaId]);

  // Update the useEffect that calls fetchMessages on conversation change
  // Update useEffect for conversation changes
  useEffect(() => {
    if (activeConversation) {
      // Reset all scroll states for new conversation
      setUserScrolledUp(false);
      setScrollLocked(false);
      setIsUserScrolling(false);
      setShouldAutoScroll(true);
      // Force scroll to bottom for new conversations
      fetchMessages(activeConversation.id, 'force-bottom');
      setSelectedContact(null);
      if (!activeConversation.contact) {
        fetchConversationDetails(activeConversation.id);
      }
    }
  }, [activeConversation]);


  // Update periodic message fetching with better logic
  useEffect(() => {
    if (!activeConversation) return;

    const interval = setInterval(async () => {
      // Don't fetch if user is actively scrolling
      if (scrollLocked || isUserScrolling) {
        return;
      }

      // Use auto mode for periodic updates - respects user position
      await fetchMessages(activeConversation.id, 'auto');
    }, 5000);

    return () => clearInterval(interval);
  }, [activeConversation, scrollLocked, isUserScrolling]);


  // Also make sure the fetchConversationDetails function is working properly
  const fetchConversationDetails = async (conversationId: string) => {
    try {
      console.log('Fetching details for conversation:', conversationId);
      const response = await fetch(`/api/conversations/${conversationId}`);

      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      console.log('Conversation details response:', data);

      if (data.success && data.conversation) {
        // Ensure we have complete contact information
        if (!data.conversation.contact?.id) {
          console.error('Fetched conversation still missing contact ID:', data.conversation);
          return null;
        }

        // Update the conversations list with complete details
        setConversations(prevConversations =>
          prevConversations.map(conv =>
            conv.id === conversationId ? data.conversation : conv
          )
        );

        console.log('Updated conversation with contact:', data.conversation.contact);
        return data.conversation;
      } else {
        console.error('Failed to fetch conversation details:', data);
        return null;
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      return null;
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
  function getOriginalMessageContent(id: string) {
    const original = messages.find(msg => msg.whatsappMessageId === id || msg.id === id);
    return original?.content || '[Deleted message]';
  }


  // Also update the sendMessage function to better handle the contact ID extraction
  const sendMessage = async () => {
    if (!messageInput.trim() || isSending) return;

    // Get contact ID and ensure it's actually being passed
    let contactId: string | undefined;
    let wabaId: string | undefined;

    if (selectedContact) {
      // New conversation case
      contactId = selectedContact.id;
      wabaId = selectedContact.wabaId;
      console.log('Sending message to new contact:', { contactId, wabaId });
    } else if (activeConversation) {
      // Existing conversation case - ensure we're getting the correct contact ID
      contactId = activeConversation.contact?.id;
      wabaId = activeConversation.wabaId;

      // Debug the values
      console.log('Active conversation contact:', activeConversation.contact);
      console.log('Sending message to existing conversation:', {
        conversationId: activeConversation.id,
        contactId,
        wabaId
      });

      if (!contactId) {
        console.error('Contact ID missing from active conversation:', activeConversation);
        console.log('Attempting to fetch complete conversation details...');

        // Attempt to fetch complete conversation details
        try {
          const conversationDetails = await fetchConversationDetails(activeConversation.id);
          if (conversationDetails?.contact?.id) {
            contactId = conversationDetails.contact.id;
            wabaId = conversationDetails.wabaId;
            console.log('Retrieved contact ID from API:', contactId);

            // Update the active conversation with complete details
            setActiveConversation(conversationDetails);
          } else {
            toast({
              title: "Contact information missing",
              description: "Please reload the conversation and try again",
              variant: "destructive"
            });
            return;
          }
        } catch (error) {
          console.error('Error fetching conversation details:', error);
          toast({
            title: "Failed to get contact information",
            description: "Please reload the conversation and try again",
            variant: "destructive"
          });
          return;
        }
      }
    } else {
      toast({
        title: "Contact information missing",
        description: "Please select a contact to send a message",
        variant: "destructive"
      });
      return;
    }

    // Ensure we have both contactId and wabaId before proceeding
    if (!contactId || !wabaId) {
      console.error('Missing required parameters after all attempts:', { contactId, wabaId });
      toast({
        title: "Contact information missing",
        description: "Please select a contact to send a message",
        variant: "destructive"
      });
      return;
    }

    console.log('Sending message with:', { contactId, wabaId, messageInput: messageInput.trim() });


    // Ensure we have both contactId and wabaId before proceeding
    if (!contactId || !wabaId) {
      console.error('Missing required parameters:', { contactId, wabaId });
      toast({
        title: "Contact information missing",
        description: "Please select a contact to send a message",
        variant: "destructive"
      });
      return;
    }

    console.log('Sending message with:', { contactId, wabaId, messageInput: messageInput.trim() });

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contactId,
          wabaId: wabaId,
          message: messageInput.trim(),
          messageType: 'text',
          conversationId: activeConversation?.id,
          senderName: currentUser.name
        }),
      });

      const data = await response.json();
      console.log('Send message response:', data);

      if (data.success) {
        if (!activeConversation && data.conversationId) {
          const convResponse = await fetch(`/api/conversations/${data.conversationId}`);
          const convData = await convResponse.json();
          if (convData.success) {
            setActiveConversation(convData.conversation);
            setSelectedContact(null);
            fetchConversations();
          }
        } else if (activeConversation) {
          // User sent message - reset scroll state and force to bottom
          setUserScrolledUp(false);
          setScrollLocked(false);
          setTimeout(() => {
            fetchMessages(activeConversation.id, 'force-bottom');
          }, 100);
          fetchConversations();
        }

        setMessageInput("");
        toast({ title: "Message sent successfully" });
      } else {
        console.error('Send message error:', data);
        toast({
          title: data.message || "Failed to send message",
          description: data.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: "Failed to send message",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendReplyMessage = async (originalMessageId: string, content: string) => {
    if (!activeConversation || !getCurrentContact()) return;

    const payload = {
      contactId: getCurrentContact().id,
      conversationId: activeConversation.id,
      replyToMessageId: originalMessageId,
      message: content
    };

    const res = await fetch('/api/messages/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      // fetchMessages(activeConversation.id); // Refresh messages
    } else {
      toast({ title: 'Failed to send reply', variant: 'destructive' });
    }
  };


  const handleSend = async () => {
    if (!messageInput.trim() || isSending) return;

    if (replyingTo) {
      // -----  it's a reply  -----
      await sendReplyMessage(replyingTo.id, messageInput.trim());
      setReplyingTo(null);          // hide the reply banner
    } else {
      // -----  normal message  ---
      await sendMessage();
    }

    setMessageInput("");
  };

  // Update the sendTemplate function to be much simpler
  const sendTemplate = async (template: Template, variables: { [key: string]: string } = {}) => {
    console.log('🔍 SENDTEMPLATE START - Contact Resolution');

    let contactId: string;
    let wabaId: string;

    // Enhanced contact resolution (keep existing logic)
    if (selectedContact) {
      contactId = selectedContact.id;
      wabaId = selectedContact.wabaId;
      console.log('✅ Using selectedContact:', { contactId, wabaId });
    } else if (activeConversation?.contact?.id) {
      contactId = activeConversation.contact.id;
      wabaId = activeConversation.wabaId;
      console.log('✅ Using activeConversation contact:', { contactId, wabaId });
    } else if (activeConversation?.id) {
      console.log('⚠️ Contact ID missing, attempting to fetch conversation details...');
      try {
        const completeConversation = await fetchConversationDetails(activeConversation.id);
        if (completeConversation?.contact?.id) {
          contactId = completeConversation.contact.id;
          wabaId = completeConversation.wabaId;
          setActiveConversation(completeConversation);
          console.log('✅ Retrieved contact from API:', { contactId, wabaId });
        } else {
          toast({
            title: "Contact information missing",
            description: "Please reload the conversation and try again",
            variant: "destructive"
          });
          return;
        }
      } catch (error) {
        toast({
          title: "Failed to load contact information",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
        return;
      }
    } else {
      toast({
        title: "Contact information missing",
        description: "Please select a contact to send a template",
        variant: "destructive"
      });
      return;
    }

    if (!contactId || !wabaId) {
      toast({
        title: "Contact information incomplete",
        description: "Missing contact ID or WABA ID. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (isSending) return;

    setIsSending(true);
    try {
      // Simple payload - server handles media from template doc
      const requestPayload = {
        contactId: contactId,
        messageType: 'template',
        templateId: template.id,
        conversationId: activeConversation?.id,
        senderName: currentUser.name,
        variables: variables // Variables from the dialog
      };

      console.log('🚀 Final request payload:', JSON.stringify(requestPayload, null, 2));

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      const data = await response.json();
      console.log('API response:', data);

      if (data.success) {
        if (!activeConversation && data.conversationId) {
          const convResponse = await fetch(`/api/conversations/${data.conversationId}`);
          const convData = await convResponse.json();
          if (convData.success) {
            setActiveConversation(convData.conversation);
            setSelectedContact(null);
            fetchConversations();
          }
        } else if (activeConversation) {
          // fetchMessages(activeConversation.id);
          fetchConversations();
        }

        setShowTemplateDialog(false);
        setSelectedTemplate(null);
        // setTemplateVariables({}); // Clear variables
        toast({ title: "Template sent successfully" });
      } else {
        console.error('Template sending failed:', data);
        toast({
          title: "Failed to send template",
          description: data.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Template sending error:", error);
      toast({
        title: "Failed to send template",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };


  const selectContactForChat = (contact: Contact) => {
    const existingConversation = conversations.find(conv => conv.contact.id === contact.id);
    if (existingConversation) {
      setActiveConversation(existingConversation);
      setSelectedContact(null);
    } else {
      // Ensure the contact has all required fields
      console.log('Selected contact for new chat:', contact);
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

    const previousStatus = activeConversation.status; // Store the previous status

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
        // **FIRST: Always refetch conversations to update the sidebar**
        await fetchConversations();

        // **SECOND: Get the updated conversation data**
        const convResponse = await fetch(`/api/conversations/${activeConversation.id}`);
        const convData = await convResponse.json();
        let updatedConversation = null;
        if (convData.success) {
          updatedConversation = convData.conversation;
          setActiveConversation(updatedConversation);
        }

        // **THIRD: Fetch messages to get the system message**
        await fetchMessages(activeConversation.id);

        // **FOURTH: Handle status-specific logic**
        if (status === 'closed') {
          // If closing, clear active conversation and select next available
          // setActiveConversation(null);
          setMessages([]);

          // Wait a bit for conversations to update, then select first available
          setTimeout(async () => {
            // Refetch to get the latest conversations
            await fetchConversations();

            // Get conversations that aren't closed
            const response = await fetch(`/api/conversations${selectedWabaId ? `?wabaId=${selectedWabaId}` : ''}`);
            const data = await response.json();
            if (data.success) {
              const availableConversations = data.conversations.filter((conv: Conversation) => conv.status !== 'closed');
              // if (availableConversations.length > 0) {
              //   setActiveConversation(availableConversations[0]);
              // }
            }
          }, 300);
        } else if (previousStatus === 'closed' && status !== 'closed') {
          // If reopening a closed conversation, ensure it stays active
          if (updatedConversation) {
            setActiveConversation(updatedConversation);
          }
        }

        toast({
          title: `Conversation marked as ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          description: status === 'closed'
            ? 'Conversation has been closed'
            : previousStatus === 'closed'
              ? 'Conversation has been reopened and is now visible in the sidebar'
              : undefined
        });
      } else {
        toast({ title: data.message || "Failed to update conversation status", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error updating conversation status:', error);
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



  if (wabaAccounts.length === 0) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-4">
          <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-green-50/30 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-green-200 wark:from-muted/40 wark:to-green-900/10 max-w-lg w-full">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg transition-all duration-300 group-hover:scale-110">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 wark:text-white mb-1">
                    WhatsApp Business
                  </h1>
                  <p className="text-sm text-green-600 font-medium">
                    Ready to Connect
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 wark:bg-green-900/30 wark:text-green-400 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Setup Required
              </span>
            </div>

            {/* Description Section */}
            <div className="space-y-4 mb-8">
              <p className="text-gray-700 wark:text-gray-300 leading-relaxed">
                Connect your WhatsApp Business Account to start managing conversations with your customers in real-time.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 wark:text-gray-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 wark:bg-green-900/30">
                    <Users className="h-4 w-4 text-green-600 wark:text-green-400" />
                  </div>
                  <span>Manage customer conversations</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 wark:text-gray-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 wark:bg-blue-900/30">
                    <Zap className="h-4 w-4 text-blue-600 wark:text-blue-400" />
                  </div>
                  <span>Automated message templates</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 wark:text-gray-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 wark:bg-purple-900/30">
                    <Shield className="h-4 w-4 text-purple-600 wark:text-purple-400" />
                  </div>
                  <span>Secure business messaging</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-4 cursor-pointer">
              <Link href='/dashboard'>
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full h-12 bg-gradient-to-r  from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>

              <div className="flex items-center mt-4 justify-center gap-2 text-xs text-gray-500 wark:text-gray-400">
                <Info className="h-3 w-3" />
                <span>Quick setup • 2 minutes</span>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
            <div className="absolute -left-4 -bottom-4 h-12 w-12 rounded-full bg-green-400/20 transition-all duration-300 group-hover:scale-125" />

            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </Layout>
    );
  }
  // Add this check right after the wabaAccounts.length === 0 check
  if (isCheckingSubscription) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking subscription status...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Add this check after the loading check and before the main content
  if (userSubscription?.status === 'expired') {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-red-50/20 to-background p-4">
          <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-red-50/30 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-red-200 max-w-lg w-full">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg transition-all duration-300 group-hover:scale-110">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Subscription Expired
                  </h1>
                  <p className="text-sm text-red-600 font-medium">
                    Access Restricted
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Expired
              </span>
            </div>

            {/* Description Section */}
            <div className="space-y-4 mb-8">
              <p className="text-gray-700 leading-relaxed">
                Your subscription has expired and you&apos;ve been moved to the Free plan.
                Please renew your subscription to continue accessing the conversations feature.
              </p>

              {userSubscription?.endDate && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-1">
                        Subscription expired on
                      </p>
                      <p className="text-sm text-red-700">
                        {format(new Date(userSubscription.endDate), 'PPP')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>Access to conversations</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Team collaboration features</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                    <Zap className="h-4 w-4 text-purple-600" />
                  </div>
                  <span>Advanced automation tools</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-4">
              <Button
                onClick={() => window.location.href = '/wallet/plans'}
                className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Renew Subscription
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <AlertCircle className="h-3 w-3" />
                <span>Choose from flexible pricing plans</span>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-red-500/10 transition-all duration-300 group-hover:scale-110" />
            <div className="absolute -left-4 -bottom-4 h-12 w-12 rounded-full bg-red-400/20 transition-all duration-300 group-hover:scale-125" />

            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="h-screen flex w-full fixed overflow-hidden   flex-col ">
        {/* Top Navigation Bar - Modern Design */}
        <div className="h-16 w-[96%] border-b border-border/50 bg-gradient-to-r from-background to-background/95 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full hover:bg-accent/50 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <AlignJustify className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-foreground">Conversations</h1>
                <p className="text-xs text-muted-foreground">
                  {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Tag Filter Pills */}
          {Array.from(new Set(contacts.flatMap(contact => contact.tags || []))).length > 0 ? (
            <div className="relative flex-1 max-w-2xl mx-8 hidden lg:block">
              {/* Left scroll button with enhanced styling */}
              <div className="absolute left-0 top-0 h-full flex items-center z-20">
                <div className="bg-gradient-to-r from-background via-background to-background/80 pl-2 pr-4 h-full flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={scrollLeft}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all duration-200 hover:scale-105",
                      canScrollLeft
                        ? "bg-white/80 hover:bg-white shadow-sm border border-border/50"
                        : "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!canScrollLeft}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Scrollable tag container with modern styling */}
              <div
                ref={scrollContainerRef}
                onScroll={checkScrollability}
                className="h-10 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth px-12"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <div className="h-full bg-gradient-to-r from-accent/20 to-accent/10 rounded-full border border-border/30 backdrop-blur-sm">
                  <Tabs
                    value={activeTagFilter ?? "all"}
                    onValueChange={(v) => setActiveTagFilter(v === "all" ? null : v)}
                    className="w-full h-full"
                  >
                    <TabsList className="h-full bg-transparent flex items-center gap-1 px-4">
                      {/* ALL Tab - Enhanced */}
                      <TabsTrigger
                        value="all"
                        className="group relative flex items-center gap-2 px-4 py-2 h-8 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 hover:scale-105
                          data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-accent/50
                          data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                          border-0 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                      >
                        <div className="flex items-center gap-2">
                          <Inbox className="h-3.5 w-3.5" />
                          <span>All</span>
                          <div className="flex items-center justify-center bg-background/20 text-current text-xs h-5 min-w-5 px-1.5 rounded-full font-medium">
                            {conversations.length}
                          </div>
                        </div>
                      </TabsTrigger>

                      {/* Dynamic Tags - Enhanced */}
                      {Array.from(new Set(contacts.flatMap(contact => contact.tags || []))).map((tag, index) => {
                        const tagCount = conversations.filter(conv => {
                          return conv.contact &&
                            Array.isArray(conv.contact.tags) &&
                            conv.contact.tags.includes(tag);
                        }).length;

                        if (tagCount === 0) return null;

                        return (
                          <TabsTrigger
                            key={tag}
                            value={tag}
                            className="group relative flex items-center gap-2 px-4 py-2 h-8 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 hover:scale-105
                              data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-accent/50
                              data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                              border-0 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-current opacity-60"></div>
                              <span>{tag}</span>
                              <div className="flex items-center justify-center bg-background/20 text-current text-xs h-5 min-w-5 px-1.5 rounded-full font-medium">
                                {tagCount}
                              </div>
                            </div>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Right scroll button with enhanced styling */}
              <div className="absolute right-0 top-0 h-full flex items-center z-20">
                <div className="bg-gradient-to-l from-background via-background to-background/80 pr-2 pl-4 h-full flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={scrollRight}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all duration-200 hover:scale-105",
                      canScrollRight
                        ? "bg-white/80 hover:bg-white shadow-sm border border-border/50"
                        : "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!canScrollRight}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Action Buttons - Enhanced */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={refreshData}
                    disabled={isRefreshing}
                    className="rounded-full hover:bg-accent/50 transition-all duration-200 hover:scale-105"
                  >
                    <RefreshCcw className={cn("h-5 w-5", isRefreshing && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-popover/95 backdrop-blur-sm border">
                  <p className="flex items-center text-black gap-2">
                    <RefreshCcw className="h-3 w-3" />
                    Refresh conversations
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowContactDialog(true)}
                    className="rounded-full hover:bg-accent/50 transition-all duration-200 hover:scale-105 relative group"
                  >
                    <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-popover/95 backdrop-blur-sm border">
                  <p className="flex items-center text-black gap-2">
                    <PlusCircle className="h-3 w-3" />
                    New conversation
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-accent/50 transition-all duration-200 hover:scale-105"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-popover/95 backdrop-blur-sm border-border/50">
                <DropdownMenuItem
                  onClick={() => window.location.href = '/contacts'}
                  className="cursor-pointer hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 mr-3 group-hover:bg-blue-200 transition-colors">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Manage Contacts</p>
                    <p className="text-xs text-muted-foreground">Add, edit, or organize</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.location.href = '/templates'}
                  className="cursor-pointer hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 mr-3 group-hover:bg-purple-200 transition-colors">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Message Templates</p>
                    <p className="text-xs text-muted-foreground">Create and manage</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem
                  onClick={() => window.location.href = '/settings'}
                  className="cursor-pointer hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 mr-3 group-hover:bg-gray-200 transition-colors">
                    <Settings className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Settings</p>
                    <p className="text-xs text-muted-foreground">Configure preferences</p>
                  </div>
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Conversations List Sidebar - Modern Design */}
          <div className={cn(
            "w-full md:w-80 lg:w-96 flex flex-col bg-gradient-to-b from-background to-background/95 border-r border-border/50 overflow-y- backdrop-blur-md shadow-sm",
            !isMobileMenuOpen && "hidden md:flex",
            isMobileMenuOpen && "absolute inset-0 z-50 md:relative"
          )}>
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-card to-card/95 flex-shrink-0">
              {isBulkSelectMode ? (
                <div className="flex items-center gap-3 w-full">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={exitBulkMode}
                    className="h-8 w-8 rounded-full hover:bg-accent/50 transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <LiaCheckDoubleSolid className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">
                        {selectedConversations.length} chat{selectedConversations.length !== 1 ? 's' : ''} selected
                      </span>
                      <p className="text-xs text-muted-foreground">Bulk actions available</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                    <Inbox className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-foreground">Inbox</h2>
                    <p className="text-xs text-muted-foreground">
                      {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center relative gap-2">
                {isBulkSelectMode ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-accent/50 transition-all duration-200"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-sm border-border/50">
                      <DropdownMenuItem
                        onClick={() => setShowBulkTagDialog(true)}
                        className="cursor-pointer hover:bg-accent/50 transition-colors group"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 mr-3 group-hover:bg-blue-200 transition-colors">
                          <Tag className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Apply Tag</p>
                          <p className="text-xs text-muted-foreground">Add tags to conversations</p>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { }}
                        className="cursor-pointer hover:bg-accent/50 transition-colors group"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 mr-3 group-hover:bg-purple-200 transition-colors">
                          <Users className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Add to Broadcast</p>
                          <p className="text-xs text-muted-foreground">Create broadcast list</p>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowBulkAssignDialog(true)}
                        className="cursor-pointer hover:bg-accent/50 transition-colors group"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 mr-3 group-hover:bg-green-200 transition-colors">
                          <UserPlus className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Assign To</p>
                          <p className="text-xs text-muted-foreground">Assign to team member</p>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { }}
                        className="cursor-pointer hover:bg-accent/50 transition-colors group"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 mr-3 group-hover:bg-orange-200 transition-colors">
                          <UserX className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">Unassign</p>
                          <p className="text-xs text-muted-foreground">Remove assignments</p>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowBulkDeleteDialog(true)}
                        className="cursor-pointer hover:bg-destructive/10 transition-colors group text-destructive"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 mr-3 group-hover:bg-red-200 transition-colors">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Delete Chats</p>
                          <p className="text-xs text-muted-foreground">Permanently remove</p>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsBulkSelectMode(true)}
                          className="h-8 w-8 rounded-full hover:bg-accent/50 transition-all duration-200 hover:scale-105"
                        >
                          <LiaCheckDoubleSolid className="h-4 w-4 text-primary" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="flex items-center gap-2">
                          <LiaCheckDoubleSolid className="h-3 w-3" />
                          Bulk select mode
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={getActiveFilterCount() > 0 ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setShowFilterDialog(true)}
                        className={cn(
                          "h-8 w-8 rounded-full transition-all duration-200 hover:scale-105 relative",
                          getActiveFilterCount() > 0
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                            : "hover:bg-accent/50"
                        )}
                      >
                        <Filter className="h-4 w-4" />
                        {getActiveFilterCount() > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 bg-background text-primary text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-primary animate-pulse">
                            {getActiveFilterCount()}
                          </span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="flex items-center gap-2">
                        <Filter className="h-3 w-3" />
                        {getActiveFilterCount() > 0 ? `${getActiveFilterCount()} filters active` : "Filter conversations"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Enhanced Search Bar - Fixed */}
            <div className="p-4 border-b border-border/50 bg-card/30 flex-shrink-0">
              <div className="flex items-center gap-2">
                {searchQuery.trim().length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery("")}
                    className="h-8 w-8 rounded-full hover:bg-accent/50 transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "pl-10 h-10 bg-background/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg transition-all duration-200",
                      searchQuery.trim().length > 0 ? "flex-1" : "w-full"
                    )}
                  />
                  {searchQuery.trim().length > 0 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="flex items-center justify-center w-5 h-5 bg-primary/10 rounded-full">
                        <span className="text-xs font-medium text-primary">
                          {filteredConversations.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Conversations List */}
            <div className="flex-1 mb-24 overflow-y-auto">
              {isLoadingConversations ? (
                <div className="space-y-0">
                  {Array.from({ length: 8 }, (_, i) => (
                    <ConversationSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <>
                  {/* New conversation indicator - Enhanced */}
                  {selectedContact && (
                    <div
                      className="group flex items-center border-b border-border/50 p-4 cursor-pointer hover:bg-accent/30 bg-gradient-to-r from-primary/5 to-primary/10 transition-all duration-200"
                      onClick={() => {
                        console.log('Clicking on new conversation with contact:', selectedContact);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <div className="relative mr-3">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20 transition-all duration-200 group-hover:ring-primary/40">
                          <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-semibold">
                            {selectedContact.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center animate-pulse">
                          <Plus className="h-2.5 w-2.5 text-primary-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">{selectedContact.name}</h3>
                          <Badge className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-sm">
                            New
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Start conversation</p>
                      </div>
                    </div>
                  )}

                  {/* Existing conversations - Enhanced */}
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        "group flex items-center border-b border-border/30 p-4 cursor-pointer transition-all duration-200",
                        "hover:bg-accent/30 hover:border-border/50",
                        activeConversation?.id === conversation.id && !isBulkSelectMode ? "bg-accent/50 border-primary/20" : "",
                        selectedConversations.includes(conversation.id) && "bg-green-50 border-green-200",
                        isBulkSelectMode && "hover:bg-accent/20"
                      )}
                      onClick={async () => {
                        if (isBulkSelectMode) {
                          toggleConversationSelection(conversation.id);
                        } else {
                          console.log('Selecting conversation with contact:', conversation.contact);

                          // Always fetch complete conversation details when selecting
                          if (!conversation.contact?.id) {
                            console.log('Contact ID missing, fetching conversation details...');
                            const completeConversation = await fetchConversationDetails(conversation.id);
                            if (completeConversation) {
                              setActiveConversation(completeConversation);
                            }
                          } else {
                            setActiveConversation(conversation);
                          }

                          setSelectedContact(null);
                          setIsMobileMenuOpen(false);

                          // Mark conversation as read if it has unread messages
                          if (conversation.unreadCount > 0) {
                            markConversationAsRead(conversation.id);
                          }
                        }
                      }}
                    >
                      {/* Enhanced Contact Avatar with Selection */}
                      <div className="relative mr-3">
                        {isBulkSelectMode ? (
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                            selectedConversations.includes(conversation.id)
                              ? "border-primary bg-primary/10 scale-105"
                              : "border-border bg-muted hover:border-primary/50"
                          )}>
                            {selectedConversations.includes(conversation.id) && (
                              <IoMdCheckmark className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <Avatar className={cn(
                              "h-12 w-12 transition-all duration-200",
                              activeConversation?.id === conversation.id && "ring-2 ring-primary/50"
                            )}>
                              <AvatarFallback className="bg-gradient-to-br from-muted to-muted/70 text-foreground font-medium">
                                {conversation.contact.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.contact.whatsappOptIn && (
                              <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                                <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Enhanced Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-foreground truncate">{conversation.contact.name}</h3>
                          <span className="text-xs text-muted-foreground font-medium">
                            {formatMessageTime(conversation.lastMessageAt)}
                          </span>
                        </div>

                        {/* Enhanced Labels and Tags */}
                        <div className="flex flex-wrap gap-1 mb-1">
                          {conversation.labels && conversation.labels.length > 0 && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] h-4 px-1.5 font-medium",
                                `bg-${labels.find(l => l.id === conversation.labels[0])?.color || "blue"}-100 text-${labels.find(l => l.id === conversation.labels[0])?.color || "blue"}-800 border-${labels.find(l => l.id === conversation.labels[0])?.color || "blue"}-200`
                              )}
                            >
                              {labels.find(l => l.id === conversation.labels[0])?.name || "Label"}
                            </Badge>
                          )}
                          {conversation.assignedTo && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-blue-50 text-blue-700 border-blue-200 font-medium">
                              {teamMembers.find(u => u.id === conversation.assignedTo)?.name.split(' ')[0] || "Assigned"}
                            </Badge>
                          )}
                        </div>

                        {/* Enhanced Message Preview */}
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate max-w-[180px] leading-relaxed">
                            {conversation.lastMessageType === "image" ? (
                              <span className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-blue-100 flex items-center justify-center">
                                  <ImageIcon className="h-2 w-2 text-blue-600" />
                                </div>
                                Photo
                              </span>
                            ) : conversation.lastMessageType === "video" ? (
                              <span className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-purple-100 flex items-center justify-center">
                                  <Video className="h-2 w-2 text-purple-600" />
                                </div>
                                Video
                              </span>
                            ) : conversation.lastMessageType === "document" ? (
                              <span className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-orange-100 flex items-center justify-center">
                                  <FileText className="h-2 w-2 text-orange-600" />
                                </div>
                                Document
                              </span>
                            ) : conversation.lastMessageType === "template" ? (
                              <span className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-green-100 flex items-center justify-center">
                                  <FileText className="h-2 w-2 text-green-600" />
                                </div>
                                Template
                              </span>
                            ) : (
                              conversation.lastMessage
                            )}
                          </p>

                          {/* Enhanced Status Indicators */}
                          <div className="flex items-center gap-1.5">
                            {conversation.isWithin24Hours && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                      <Zap className="h-2.5 w-2.5 text-green-600" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>24-hour window active</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {conversation.unreadCount > 0 && (
                              <div className="flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white text-xs h-5 min-w-5 px-1.5 rounded-full font-semibold shadow-sm animate-pulse">
                                {conversation.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Enhanced Empty State */}
                  {filteredConversations.length === 0 && !selectedContact && (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                      {getActiveFilterCount() > 0 ? (
                        <>
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-muted/70 flex items-center justify-center mb-6">
                            <Filter className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">No conversations match filters</h3>
                          <p className="text-muted-foreground text-sm mb-6 max-w-sm leading-relaxed">
                            Try adjusting your filters to see more results, or clear all filters to view all conversations.
                          </p>
                          <Button
                            onClick={resetFilters}
                            size="sm"
                            variant="outline"
                            className="hover:bg-accent transition-colors"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear Filters
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6">
                            <MessageSquare className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">No conversations yet</h3>
                          <p className="text-muted-foreground text-sm mb-6 max-w-sm leading-relaxed">
                            Start your first conversation with a customer to see it appear here.
                          </p>
                          <Button
                            onClick={() => setShowContactDialog(true)}
                            size="sm"
                            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            New Chat
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Chat Area - Fixed height */}
          {(activeConversation || selectedContact) ? (
            <div className="flex-1   max-h-screen flex flex-col bg-gradient-to-b from-background to-background/95 backdrop-blur-md shadow-sm min-w-0 overflow-hidden">
              {/* Enhanced Chat Header - Fixed */}
              {/* Chat Header */}

              <div className="bg-gradient-to-r from-card to-card/95 border-b border-border/50 px-4 py-3 shadow-sm backdrop-blur-md md:w-[94%] 2xl:w-[95%] flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden mr-1 h-8 w-8 rounded-full hover:bg-accent/50 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(true)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>

                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20 transition-all duration-200 hover:ring-primary/40">
                        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-semibold">
                          {getCurrentChatTitle().charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {getCurrentContact()?.whatsappOptIn && (
                        <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                          <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-foreground text-lg">{getCurrentChatTitle()}</h2>
                        <div className="flex items-center gap-1.5">
                          <Circle className={cn(
                            "h-2.5 w-2.5 transition-all duration-200",
                            activeConversation?.status === 'active' && "fill-green-500 text-green-500",
                            activeConversation?.status === 'pending' && "fill-amber-500 text-amber-500",
                            activeConversation?.status === 'resolved' && "fill-blue-500 text-blue-500",
                            activeConversation?.status === 'closed' && "fill-slate-500 text-slate-500",
                            !activeConversation && "fill-green-500 text-green-500"
                          )} />
                          <span className="text-xs text-muted-foreground font-medium">
                            {selectedContact ? 'New Conversation' :
                              activeConversation?.status === 'active' ? 'Active' :
                                activeConversation?.status === 'closed' ? 'Closed' :
                                  activeConversation?.status === 'resolved' ? 'Resolved' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        {getCurrentContact()?.tags && getCurrentContact()?.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 max-w-[250px]">
                            {getCurrentContact()?.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20 font-medium hover:bg-primary/20 transition-colors"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {activeConversation?.labels && activeConversation.labels.length > 0 && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] h-4 px-1.5 font-medium",
                              labels.find(l => l.id === activeConversation.labels[0])?.color
                                ? `bg-${labels.find(l => l.id === activeConversation.labels[0])?.color}-100 text-${labels.find(l => l.id === activeConversation.labels[0])?.color}-800 border-${labels.find(l => l.id === activeConversation.labels[0])?.color}-200`
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            )}
                          >
                            {labels.find(l => l.id === activeConversation.labels[0])?.name || "Label"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex items-center gap-2 -ml-4">
                    {activeConversation?.assignedTo ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge
                            variant="outline"
                            className="h-8 border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-all duration-200 hover:scale-105"
                          >
                            <User className="h-3 w-3" />
                            {teamMembers.find(u => u.id === activeConversation.assignedTo)?.name.split(' ')[0] || 'Agent'}
                            <ChevronDown className="h-3 w-3 ml-0.5" />
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-popover/95 backdrop-blur-sm border-border/50">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="cursor-pointer hover:bg-accent/50 transition-colors">
                              <UserPlus className="h-4 w-4 mr-2" />
                              <span>Reassign to</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="bg-popover/95 backdrop-blur-sm border-border/50">
                              {teamMembers.map(member => (
                                <DropdownMenuItem
                                  key={member.id}
                                  onClick={() => assignConversation(member.id)}
                                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                                >
                                  <div className="flex items-center w-full">
                                    <User className="h-4 w-4 mr-2" />
                                    <span>{member.name}</span>
                                    {member.id === activeConversation.assignedTo && (
                                      <Check className="h-4 w-4 ml-auto text-primary" />
                                    )}
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => assignConversation('')}
                            className="text-red-600 cursor-pointer hover:bg-red-50 transition-colors"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            <span>Unassign</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge
                            variant="outline"
                            className="h-8 bg-accent/50 text-muted-foreground border-border/50 cursor-pointer hover:bg-accent/80 hover:text-foreground transition-all duration-200 hover:scale-105"
                          >
                            <UserPlus className="h-3 w-3" />
                            Assign
                            <ChevronDown className="h-3 w-3 ml-0.5" />
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-popover/95 backdrop-blur-sm border-border/50">
                          {teamMembers.map(member => (
                            <DropdownMenuItem
                              key={member.id}
                              onClick={() => assignConversation(member.id)}
                              className="cursor-pointer hover:bg-accent/50 transition-colors"
                            >
                              <User className="h-4 w-4 mr-2" />
                              <span>{member.name}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    <div className='flex items-center gap-2 ml-2'>
                      {/* Enhanced Tag Button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="cursor-pointer" asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full hover:bg-accent/50 transition-all duration-200 hover:scale-105"
                                >
                                  <Tag className="h-4 w-4 text-primary" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-sm border-border/50">
                                {getCurrentContact()?.tags && getCurrentContact()?.tags.map((tag, index) => (
                                  <DropdownMenuCheckboxItem
                                    key={index}
                                    checked={true}
                                    onCheckedChange={() => handleRemoveTag(tag)}
                                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                                  >
                                    {tag}
                                  </DropdownMenuCheckboxItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setShowAddTagDialog(true)}
                                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                                >
                                  <Plus className="h-4 w-4 mr-2 text-primary" />
                                  Add New Tag
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Manage tags</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Enhanced Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-accent/50 transition-all duration-200 hover:scale-105"
                          >
                            <MoreVertical className="h-4 w-4 text-primary" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-sm border-border/50">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="cursor-pointer hover:bg-accent/50 transition-colors">
                              <UserPlus className="h-4 w-4 mr-2 text-blue-600" />
                              <span>Assign to</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-48 bg-popover/95 backdrop-blur-sm border-border/50">
                              {teamMembers.map(member => (
                                <DropdownMenuItem
                                  key={member.id}
                                  onClick={() => assignConversation(member.id)}
                                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                                >
                                  <User className="h-4 w-4 mr-2" />
                                  <span>{member.name}</span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="cursor-pointer hover:bg-accent/50 transition-colors">
                              <Tag className="h-4 w-4 mr-2 text-purple-600" />
                              <span>Add label</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-48 bg-popover/95 backdrop-blur-sm border-border/50">
                              {labels.map(label => (
                                <DropdownMenuItem
                                  key={label.id}
                                  onClick={() => addLabelToConversation(label.id)}
                                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                                  style={{
                                    backgroundColor: `rgb(${label.color === 'red' ? '254 226 226' :
                                      label.color === 'blue' ? '219 234 254' :
                                        label.color === 'green' ? '220 252 231' :
                                          label.color === 'yellow' ? '254 249 195' :
                                            label.color === 'purple' ? '243 232 255' :
                                              label.color === 'orange' ? '255 237 213' :
                                                label.color === 'pink' ? '252 231 243' :
                                                  label.color === 'gray' ? '243 244 246' : '219 234 254'})`,
                                    color: `rgb(${label.color === 'red' ? '153 27 27' :
                                      label.color === 'blue' ? '30 64 175' :
                                        label.color === 'green' ? '22 101 52' :
                                          label.color === 'yellow' ? '133 77 14' :
                                            label.color === 'purple' ? '107 33 168' :
                                              label.color === 'orange' ? '154 52 18' :
                                                label.color === 'pink' ? '157 23 77' :
                                                  label.color === 'gray' ? '55 65 81' : '30 64 175'})`
                                  }}
                                >
                                  <span>{label.name}</span>
                                </DropdownMenuItem>
                              ))}
                              {labels.length > 0 && <DropdownMenuSeparator />}
                              <DropdownMenuItem
                                onClick={() => setShowCreateLabelDialog(true)}
                                className="text-primary hover:bg-primary/10 cursor-pointer transition-colors"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                <span>Create new label</span>
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          <DropdownMenuItem
                            onClick={() => setShowNoteDialog(true)}
                            className="cursor-pointer hover:bg-accent/50 transition-colors"
                          >
                            <Clipboard className="h-4 w-4 mr-2 text-green-600" />
                            <span>Add note</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="cursor-pointer hover:bg-accent/50 transition-colors">
                              <Clock className="h-4 w-4 mr-2 text-amber-600" />
                              <span>Change status</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-48 bg-popover/95 backdrop-blur-sm border-border/50">
                              <DropdownMenuItem
                                onClick={() => changeConversationStatus('active')}
                                className="text-green-700 cursor-pointer hover:bg-green-50 transition-colors"
                              >
                                <Circle className="h-4 w-4 mr-2 fill-green-500 text-green-500" />
                                <span>Active</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => changeConversationStatus('pending')}
                                className="text-amber-700 cursor-pointer hover:bg-amber-50 transition-colors"
                              >
                                <Circle className="h-4 w-4 mr-2 fill-amber-500 text-amber-500" />
                                <span>Pending</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => changeConversationStatus('resolved')}
                                className="text-blue-700 cursor-pointer hover:bg-blue-50 transition-colors"
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                                <span>Resolved</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => changeConversationStatus('closed')}
                                className="text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors"
                              >
                                <Archive className="h-4 w-4 mr-2 text-slate-500" />
                                <span>Closed</span>
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => setShowTemplateDialog(true)}
                            className="cursor-pointer hover:bg-accent/50 transition-colors"
                          >
                            <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                            <span>Send template</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Enhanced Contact Info Button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-accent/50 transition-all duration-200 hover:scale-105"
                              onClick={() => setShowInfoPanel(true)}
                            >
                              <FaRegUserCircle className='h-4 w-4 text-primary' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Contact info</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

              </div>

              {/* Enhanced Messages Area */}
              <div className="flex-1 max-h-[95%] md:w-[94%] 2xl:w-[95%] h-fit flex flex-col overflow-y-scroll relative">
                <div
                  ref={scrollAreaRef}
                  className="flex-1 overflow-y-auto"
                  style={{ backgroundImage: "url('/bg.png')" }}
                  onScroll={handleScroll}
                >
                  <div className="p-4 bg-cover bg-center bg-no-repeat min-h-full">
                    <div className="space-y-4 mx-auto">
                      {/* Enhanced Empty State for New Conversations */}
                      {selectedContact && messages.length === 0 && (
                        <div className="text-center py-12">
                          <div className="relative inline-block">
                            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl w-fit mx-auto mb-6 backdrop-blur-sm border border-primary/20">
                              <MessageSquare className="h-12 w-12 text-primary mx-auto" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                              <Plus className="h-3 w-3 text-primary-foreground" />
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-foreground mb-3">Start the conversation</h3>
                          <p className="text-muted-foreground  mx-auto leading-relaxed">
                            Send your first message to <span className="font-medium text-foreground">{selectedContact.name}</span> to begin the conversation.
                          </p>
                        </div>
                      )}

                      {/* Messages */}
                      {Object.entries(getGroupedMessages()).map(([dateKey, dateMessages]) => {
                        const dateLabel = getDateGroupLabel(dateMessages[0].timestamp);

                        return (
                          <div key={dateKey} className="space-y-6">
                            {/* Enhanced Date Separator */}
                            <div className="flex items-center justify-center my-8">
                              <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-muted-foreground border border-border/50 shadow-sm">
                                {dateLabel}
                              </div>
                            </div>


                            {/* Enhanced Messages */}
                            {dateMessages.map((message) => {
                              // console.log('🔍 ALL MESSAGE DEBUG:', {
                              //   id: message.id,
                              //   messageType: message.messageType,
                              //   content: message.content,
                              //   senderId: message.senderId,
                              //   interactiveData: message.interactiveData
                              // });

                              // if (message.messageType === 'template') {
                              //   console.log('Template message data:', {
                              //     id: message.id,
                              //     templateName: message.templateName,
                              //     templateId: message.templateId,
                              //     mediaUrl: message.mediaUrl,
                              //     templateButtons: message.templateButtons,
                              //     content: message.content
                              //   });
                              // }
                              // Enhanced System Messages
                              if (message.messageType === 'system' || message.messageType === 'note') {
                                return (
                                  <div key={message.id} className="flex justify-center pb-6">
                                    <div className="bg-background/80 backdrop-blur-sm  px-4 py-2 rounded-xl text-sm text-muted-foreground max-w-[80%] text-center border border-border/30 shadow-sm">
                                      {message.content}
                                    </div>
                                  </div>
                                );
                              }

                              {/* Enhanced Regular Messages - WhatsApp Style */ }
                              return (
                                <div
                                  key={message.id}
                                  className={cn(
                                    "flex group mb-1",
                                    message.senderId === "agent" ? "justify-end" : "justify-start"
                                  )}
                                >
                                  {message.status === 'failed' && (
                                    <button
                                      onClick={() => {
                                        setSelectedErrorMessage(message);
                                        setShowErrorDialog(true);
                                      }}
                                      className="flex items-center gap-1 cursor-pointer  rounded-full p-2 transition-colors group"
                                    >
                                      <AlertCircle className="h-6 w-6 text-red-500 group-hover:text-red-600" />
                                    </button>
                                  )}

                                  <div className="max-w-[65%] min-w-[120px]">
                                    {/* Sender Name - WhatsApp Style */}
                                    <div className={cn(
                                      "text-xs font-medium text-muted-foreground mb-1 px-1",
                                      message.senderId === "agent" ? "text-right" : "text-left"
                                    )}>
                                      {message.senderId === "agent"
                                        ? (message.senderName || currentUser.name)
                                        : getCurrentContact()?.name}
                                    </div>

                                    <div
                                      className={cn(
                                        "px-3 py-2 rounded-lg relative shadow-sm",
                                        message.senderId === "agent"
                                          ? "bg-[#dcf8c6] text-black rounded-br-sm"
                                          : "bg-white text-black rounded-bl-sm border border-gray-200"
                                      )}
                                    >
                                      {/* Reply Preview Block */}
                                      {message.replyTo && (
                                        <div className="mb-1  rounded border-l-4 border-blue-400 /10 bg-gray-200 px-2 py-2 text-xs text-muted-foreground">
                                          {getOriginalMessageContent(message.replyTo)}
                                        </div>
                                      )}
                                      {/* Enhanced Message Content */}
                                      {['text', 'template'].includes(message.messageType) && (
                                        <div className="pb-4">
                                          {message.messageType === 'template' ? (
                                            <div>
                                              {/* Display template image if it has mediaUrl */}
                                              {message.mediaUrl && (
                                                <div className="mb-2">
                                                  <div className="relative group/image">
                                                    <img
                                                      src={message.mediaUrl}
                                                      alt="Template image"
                                                      className="rounded-lg w-full max-w-sm max-h-64 object-cover cursor-pointer"
                                                      onClick={() => setSelectedImageUrl(message.mediaUrl)}
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                                      {/* <Eye className="h-6 w-6 text-white" /> */}
                                                    </div>
                                                  </div>
                                                </div>
                                              )}

                                              {/* Template content */}
                                              <div
                                                className="text-xs leading-relaxed whitespace-pre-wrap break-words max-w-sm w-full mb-2"
                                                dangerouslySetInnerHTML={{ __html: formatWhatsAppText(message.content) }}
                                              />

                                              {/* Template buttons */}
                                              {message.templateButtons && message.templateButtons.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-gray-200">
                                                  <div className="space-y-1">
                                                    {message.templateButtons.map((button, index) => (
                                                      <button
                                                        key={index}
                                                        className="w-full text-center text-xs text-blue-600 font-medium py-2 border border-gray-200 rounded bg-gray-50 transition-colors flex items-center justify-center gap-1"
                                                        onClick={() => {
                                                          if (button.type === 'URL' && button.url) {
                                                            window.open(button.url, '_blank');
                                                          } else if (button.type === 'PHONE_NUMBER' && button.phone_number) {
                                                            window.open(`tel:${button.phone_number}`, '_self');
                                                          }
                                                        }}
                                                      >
                                                        {button.type === 'URL' && <ExternalLink className="h-3 w-3" />}
                                                        {button.type === 'PHONE_NUMBER' && <Phone className="h-3 w-3" />}
                                                        {button.type === 'COPY_CODE' && (
                                                          <svg width="13px" height="13px" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <g clipPath="url(#clip0_38_32111)">
                                                              <path d="M6.66699 8.33268C6.66699 7.89065 6.84259 7.46673 7.15515 7.15417C7.46771 6.84161 7.89163 6.66602 8.33366 6.66602H15.0003C15.4424 6.66602 15.8663 6.84161 16.1788 7.15417C16.4914 7.46673 16.667 7.89065 16.667 8.33268V14.9993C16.667 15.4414 16.4914 15.8653 16.1788 16.1779C15.8663 16.4904 15.4424 16.666 15.0003 16.666H8.33366C7.89163 16.666 7.46771 16.4904 7.15515 16.1779C6.84259 15.8653 6.66699 15.4414 6.66699 14.9993V8.33268Z" stroke="#0096DE" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"></path>
                                                              <path d="M13.333 6.66732V5.00065C13.333 4.55862 13.1574 4.1347 12.8449 3.82214C12.5323 3.50958 12.1084 3.33398 11.6663 3.33398H4.99967C4.55765 3.33398 4.13372 3.50958 3.82116 3.82214C3.5086 4.1347 3.33301 4.55862 3.33301 5.00065V11.6673C3.33301 12.1093 3.5086 12.5333 3.82116 12.8458C4.13372 13.1584 4.55765 13.334 4.99967 13.334H6.66634" stroke="#0096DE" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"></path>
                                                            </g>
                                                            <defs>
                                                              <clipPath id="clip0_38_32111">
                                                                <rect width="20" height="20" fill="white"></rect>
                                                              </clipPath>
                                                            </defs>
                                                          </svg>
                                                        )}
                                                        {button.text}
                                                      </button>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            // Regular text message
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                              {message.content}
                                            </p>
                                          )}

                                          {/* Enhanced WhatsApp-style timestamp and status in bottom right */}
                                          <div className="flex items-center justify-end gap-1 mt-1 absolute bottom-1 right-2">
                                            <span className="text-xs text-gray-500">
                                              {format(new Date(message.timestamp), "h:mm a")}
                                            </span>
                                            {message.senderId === "agent" && (
                                              <div className="flex items-center gap-1">
                                                {message.status === 'sent' && (
                                                  <Check className="h-3 w-3 text-gray-400" />
                                                )}
                                                {message.status === 'delivered' && (
                                                  <div className="relative">
                                                    <Check className="h-3 w-3 text-gray-400" />
                                                    <Check className="h-3 w-3 text-gray-400 absolute -right-1 top-0" />
                                                  </div>
                                                )}
                                                {message.status === 'read' && (
                                                  <div className="relative">
                                                    <Check className="h-3 w-3 text-blue-500" />
                                                    <Check className="h-3 w-3 text-blue-500 absolute -right-1 top-0" />
                                                  </div>
                                                )}

                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}


                                      {/* Move interactive message handling HERE - outside the text/template condition */}
                                      {message.messageType === 'interactive' && (
                                        <div className="pb-4">
                                          {/* {console.log('✅ Rendering interactive message:', message)} */}

                                          {/* Interactive message response */}
                                          <div className="bg-blue-50 border border-blue-100 rounded-md p-2 mb-2">
                                            <div className="flex items-start gap-2">
                                              <div className="bg-blue-100 rounded-full p-1.5 mt-0.5">
                                                <Reply className="h-3.5 w-3.5 text-blue-600" />
                                              </div>
                                              <div>
                                                <p className="text-xs text-blue-600 font-medium mb-0.5">
                                                  {message.interactiveData?.type === 'button_reply'
                                                    ? 'Quick Reply'
                                                    : message.interactiveData?.type === 'list_reply'
                                                      ? 'List Selection'
                                                      : 'Interactive Response'}
                                                </p>
                                                <p className="text-sm font-medium text-gray-800">
                                                  {message.content}
                                                </p>
                                                {/* {message.interactiveData?.id && (
                                                  <p className="text-xs text-gray-500 mt-0.5">
                                                    Button ID: {message.interactiveData.id}
                                                  </p>
                                                )} */}
                                              </div>
                                            </div>
                                          </div>

                                          {/* WhatsApp-style timestamp */}
                                          <div className="flex items-center justify-end gap-1 mt-1 absolute bottom-1 right-2">
                                            <span className="text-xs text-gray-500">
                                              {format(new Date(message.timestamp), "h:mm a")}
                                            </span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Enhanced Media Messages - WhatsApp Style */}
                                      {message.messageType === 'image' && (
                                        <div className="pb-4">
                                          <div className="relative group/image mb-1">
                                            <img
                                              src={message.mediaUrl}
                                              alt={message.mediaCaption || "Image"}
                                              className="rounded-lg w-full max-w-sm max-h-64 object-cover cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                console.log('Image clicked, setting selectedImageUrl to:', message.mediaUrl);
                                                setSelectedImageUrl(message.mediaUrl);
                                              }}
                                              onError={(e) => {
                                                console.error('Image failed to load:', message.mediaUrl);
                                                e.currentTarget.style.display = 'none';
                                              }}
                                            />
                                            <div
                                              className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                console.log('Eye overlay clicked, setting selectedImageUrl to:', message.mediaUrl);
                                                setSelectedImageUrl(message.mediaUrl);
                                              }}
                                            >
                                              <Eye className="h-6 w-6 text-white" />
                                            </div>
                                          </div>
                                          {message.mediaCaption && (
                                            <p className="text-sm mb-2 break-words">{message.mediaCaption}</p>
                                          )}

                                          {/* WhatsApp-style timestamp and status */}
                                          <div className="flex items-center justify-end gap-1 mt-1 absolute bottom-1 right-2">
                                            <span className="text-xs text-gray-500">
                                              {format(new Date(message.timestamp), "h:mm a")}
                                            </span>
                                            {message.senderId === "agent" && (
                                              <div className="flex items-center gap-1">
                                                {message.status === 'sent' && (
                                                  <Check className="h-3 w-3 text-gray-400" />
                                                )}
                                                {message.status === 'delivered' && (
                                                  <div className="relative">
                                                    <Check className="h-3 w-3 text-gray-400" />
                                                    <Check className="h-3 w-3 text-gray-400 absolute -right-1 top-0" />
                                                  </div>
                                                )}
                                                {message.status === 'read' && (
                                                  <div className="relative">
                                                    <Check className="h-3 w-3 text-blue-500" />
                                                    <Check className="h-3 w-3 text-blue-500 absolute -right-1 top-0" />
                                                  </div>
                                                )}
                                                {message.status === 'failed' && (
                                                  <TooltipProvider>
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <button
                                                          onClick={() => {
                                                            setSelectedErrorMessage(message);
                                                            setShowErrorDialog(true);
                                                          }}
                                                          className="flex items-center gap-1 hover:bg-red-50 rounded-full p-1 transition-colors group"
                                                        >
                                                          <AlertCircle className="h-3 w-3 text-red-500 group-hover:text-red-600" />
                                                          <Info className="h-2 w-2 text-red-500 group-hover:text-red-600" />
                                                        </button>
                                                      </TooltipTrigger>
                                                      <TooltipContent side="top" className="bg-red-50 border-red-200">
                                                        <p className="text-red-800 text-xs">Message failed to send - Click for details</p>
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  </TooltipProvider>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {message.messageType === 'video' && (
                                        <div className="pb-4">
                                          <video
                                            src={message.mediaUrl}
                                            controls
                                            className="rounded-lg max-w-sm max-h-64 w-full mb-1"
                                          />
                                          {message.mediaCaption && (
                                            <p className="text-sm mb-2 break-words">{message.mediaCaption}</p>
                                          )}

                                          {/* WhatsApp-style timestamp and status */}
                                          <div className="flex items-center justify-end gap-1 absolute bottom-1 right-2">
                                            <span className="text-xs text-gray-500">
                                              {format(new Date(message.timestamp), "h:mm a")}
                                            </span>
                                            {message.senderId === "agent" && (
                                              <div className="flex items-center">
                                                {message.status === 'sent' && (
                                                  <Check className="h-3 w-3 text-gray-400" />
                                                )}
                                                {message.status === 'delivered' && (
                                                  <div className="relative">
                                                    <Check className="h-3 w-3 text-gray-400" />
                                                    <Check className="h-3 w-3 text-gray-400 absolute -right-1 top-0" />
                                                  </div>
                                                )}
                                                {message.status === 'read' && (
                                                  <div className="relative">
                                                    <Check className="h-3 w-3 text-blue-500" />
                                                    <Check className="h-3 w-3 text-blue-500 absolute -right-1 top-0" />
                                                  </div>
                                                )}
                                                {message.status === 'failed' && (
                                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {message.messageType === 'audio' && (
                                        <div className="pb-4">
                                          <audio
                                            src={message.mediaUrl}
                                            controls
                                            className="w-64 rounded-lg mb-1"
                                          />
                                          {message.mediaCaption && (
                                            <p className="text-sm mb-2 break-words">{message.mediaCaption}</p>
                                          )}

                                          {/* WhatsApp-style timestamp and status */}
                                          <div className="flex items-center justify-end gap-1 absolute bottom-1 right-2">
                                            <span className="text-xs text-gray-500">
                                              {format(new Date(message.timestamp), "h:mm a")}
                                            </span>
                                            {message.senderId === "agent" && (
                                              <div className="flex items-center">
                                                {message.status === 'sent' && (
                                                  <Check className="h-3 w-3 text-gray-400" />
                                                )}
                                                {message.status === 'delivered' && (
                                                  <div className="relative">
                                                    <Check className="h-3 w-3 text-gray-400" />
                                                    <Check className="h-3 w-3 text-gray-400 absolute -right-1 top-0" />
                                                  </div>
                                                )}
                                                {message.status === 'read' && (
                                                  <div className="relative">
                                                    <Check className="h-3 w-3 text-blue-500" />
                                                    <Check className="h-3 w-3 text-blue-500 absolute -right-1 top-0" />
                                                  </div>
                                                )}
                                                {message.status === 'failed' && (
                                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {message.messageType === 'document' && (
                                        <div className="pb-4">
                                          <a
                                            href={message.mediaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 group/doc border border-gray-200 mb-1"
                                          >
                                            <div className="p-2 bg-blue-100 rounded-lg mr-3 group-hover/doc:bg-blue-200 transition-colors">
                                              <FileText className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                              <p className="text-sm font-medium text-gray-900">
                                                {message.mediaCaption || message.mediaUrl?.split('/').pop() || "Document"}
                                              </p>
                                              <p className="text-xs text-gray-500">Click to open</p>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover/doc:opacity-100 transition-opacity" />
                                          </a>

                                          {/* WhatsApp-style timestamp and status */}
                                          <div className="flex items-center justify-end gap-1 absolute bottom-1 right-2">
                                            <span className="text-xs text-gray-500">
                                              {format(new Date(message.timestamp), "h:mm a")}
                                            </span>
                                            {message.senderId === "agent" && (
                                              <div className="flex items-center">
                                                {message.status === 'sent' && (
                                                  <Check className="h-3 w-3 text-gray-400" />
                                                )}
                                                {message.status === 'delivered' && (
                                                  <div className="relative">
                                                    <Check className="h-3 w-3 text-gray-400" />
                                                    <Check className="h-3 w-3 text-gray-400 absolute -right-1 top-0" />
                                                  </div>
                                                )}
                                                {message.status === 'read' && (
                                                  <div className="relative">
                                                    <Check className="h-3 w-3 text-blue-500" />
                                                    <Check className="h-3 w-3 text-blue-500 absolute -right-1 top-0" />
                                                  </div>
                                                )}
                                                {message.status === 'failed' && (
                                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Enhanced Template Indicator */}

                                    </div>


                                  </div>
                                  {message.senderId === 'agent' || message.senderId === 'customer' ? (
                                    <div className="flex justify-end items-center gap-2 mt-1 ml-1  text-xs text-muted-foreground cursor-pointer">
                                      <button
                                        onClick={() =>
                                          setReplyingTo({
                                            id: message.whatsappMessageId,
                                            content: message.content,
                                            senderName: message.senderName || 'Customer'
                                          })
                                        }
                                        className="hover:text-primary/80 cursor-pointer transition"
                                      >
                                        <Reply className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}


                          </div>
                        );
                      })}

                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </div>

                {!shouldAutoScroll && (
                  <div className="absolute bottom-16 right-4 z-10">
                    <Button
                      onClick={() => {
                        setUserScrolledUp(false);
                        setScrollLocked(false);
                        setShouldAutoScroll(true);
                        scrollToBottom();
                      }}
                      className="rounded-full h-8 w-8 shadow-lg bg-primary/90 hover:bg-primary text-primary-foreground"
                    >
                      <ChevronDown className="h-6 w-6" />
                    </Button>
                  </div>
                )}
              </div>
              {replyingTo && (
                <div className='relative w-full'>
                  <div className="mb-2 px-4 py-2 absolute -mt-24 z-[100] w-[95%]  border-l-4 border-blue-500 border-b-0 bg-blue-50 text-sm text-blue-900 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <strong>{replyingTo.senderName}:</strong>
                        <div className="truncate max-w-xs">{replyingTo.content}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setReplyingTo(null)}
                        className="text-blue-500"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {/* Enhanced Message Input - Always Visible */}
              <div className="sticky md:w-[94%] 2xl:w-[95%]  bottom-12 bg-gradient-to-r from-card/95 to-card/90 border-t border-border/50  shadow-lg px-4 pb-6 pt-4  backdrop-blur-md">
                {/* Low Balance Warning - Add this section */}
                {isLow && (
                  <div className="mb-4 mx-auto scale-90">
                    <Card className="bg-gradient-to-r h-32 mx-4 text-sm p-0 from-red-50/95 to-red-100/95 border-red-200/50 shadow-lg backdrop-blur-sm overflow-hidden">
                      <CardContent className="pb-2">
                        <div className="flex items-center gap-4 p-6">
                          <div className="flex-shrink-0">
                            <div className="bg-red-200/60 p-4 rounded-full flex items-center justify-center">
                              <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div>
                              <h4 className="font-semibold text-red-900 mb-2 text-lg">
                                Low balance - Top up your wallet
                              </h4>
                              <p className="text-red-700 text-sm leading-relaxed">
                                Your wallet balance is running low. Top up now to continue sending messages without interruption.
                              </p>

                            </div>

                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => window.location.href = '/wallet'}
                              className="bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all duration-200 hover:scale-105"
                            >
                              <Zap className="h-4 w-4 mr-2" />
                              Top Up Wallet
                            </Button>
                            <div className="flex items-center gap-2 text-xs text-red-700">
                              <Clock className="h-3 w-3" />
                              <span>Balance below ₹250</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}



                {isWithin24Hours() ? (
                  <div className="flex items-end gap-3 relative  mx-auto">
                    {/* Alternative Enhanced Attachment Button - Manual Control */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative w-10">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                              className="h-10 w-10 absolute -mt-14 rounded-full bg-accent/50 hover:bg-accent/80 borr/50 border-primary transition-all duration-200 hover:scale-105"
                            >
                              <Paperclip className="h-4 w-4" />
                            </Button>

                            {/* Custom Dropdown Menu */}
                            {showAttachmentMenu && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setShowAttachmentMenu(false)}
                                />
                                <div className="absolute bottom-12 left-0 z-50 w-56 p-2 bg-popover/95 backdrop-blur-sm border border-border/50 rounded-md shadow-lg">
                                  <div
                                    onClick={() => {
                                      handleMediaUpload('IMAGE');
                                      setShowAttachmentMenu(false);
                                    }}
                                    className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-lg hover:bg-accent/50 transition-colors group"
                                  >
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                      <ImageIcon className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">Photo or Video</p>
                                      <p className="text-xs text-muted-foreground">Send media files</p>
                                    </div>
                                  </div>

                                  <div
                                    onClick={() => {
                                      handleMediaUpload('DOCUMENT');
                                      setShowAttachmentMenu(false);
                                    }}
                                    className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-lg hover:bg-accent/50 transition-colors group mt-1"
                                  >
                                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                      <FileText className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">Document</p>
                                      <p className="text-xs text-muted-foreground">Share files</p>
                                    </div>
                                  </div>

                                  <div
                                    onClick={() => {
                                      setShowTemplateDialog(true);
                                      setShowAttachmentMenu(false);
                                    }}
                                    className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-lg hover:bg-accent/50 transition-colors group mt-1"
                                  >
                                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                      <FileText className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">Template</p>
                                      <p className="text-xs text-muted-foreground">Use saved templates</p>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-popover/95 backdrop-blur-sm border-border/50">
                          <p>Attach files</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Enhanced Message Input */}
                    <div className="flex-1 relative w-[99%]">
                      <Textarea
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        className="min-h-[72px] w-[99%] resize-none pr-16 py-3 pl-4 rounded-xl bg-background/95 backdrop-blur-sm border-primary focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-sm"
                        rows={1}
                      />

                      {/* Enhanced Input Actions */}
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 rounded-full hover:bg-accent/50 cursor-pointer transition-all duration-200 hover:scale-105"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          >
                            <Smile className={cn(
                              "h-8 w-8 scale-110 -ml-2 transition-colors duration-200",
                              showEmojiPicker ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                            )} />
                          </Button>

                          {/* Enhanced Emoji Picker */}
                          {showEmojiPicker && (
                            <>
                              {/* Backdrop overlay - this handles the outside click */}
                              <div
                                className="fixed inset-0 z-40 bg-transparent"
                                onClick={() => setShowEmojiPicker(false)}
                              />
                              {/* Emoji picker container */}
                              <div className="absolute bottom-12 right-0 z-50">
                                <div className="relative shadow-xl rounded-lg border border-border/50 backdrop-blur-sm">
                                  <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    searchDisabled={false}
                                    skinTonesDisabled={false}
                                    width={320}
                                    height={400}
                                    previewConfig={{
                                      showPreview: true
                                    }}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>




                    {/* Add File Upload Dialog */}
                    <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
                      <DialogContent className="max-w-">
                        <DialogHeader>
                          <DialogTitle>
                            Upload {uploadType === 'IMAGE' ? 'Photo/Video' : uploadType === 'VIDEO' ? 'Video' : 'Document'}
                          </DialogTitle>
                          <DialogDescription>
                            Select a file to upload and send to your contact
                          </DialogDescription>
                        </DialogHeader>

                        <FileUpload
                          onFileSelect={handleFileSelect}
                          onUploadComplete={handleUploadComplete}
                          accept={
                            uploadType === 'IMAGE' ? 'image/*,video/*' :
                              uploadType === 'VIDEO' ? 'video/*' :
                                'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                          }
                          type={uploadType}
                        />
                      </DialogContent>
                    </Dialog>
                    {/* Enhanced Send Button */}
                    <div className='relative w-10'>
                      <Button
                        onClick={handleSend}
                        disabled={!messageInput.trim() || isSending}
                        size="icon"
                        className={cn(
                          "h-12 w-12 rounded-full border-primary absolute -ml-4 -mt-14 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50",
                          !messageInput.trim() || isSending
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground hover:scale-105"
                        )}
                      >
                        {isSending ? (
                          <div className="animate-spin rounded-full  border-2 border-primary/50 border-t-transparent"></div>
                        ) : (
                          <Send className="h-6 w-6 scale-105 text-whi" />
                        )}
                      </Button></div>


                  </div>
                ) : (
                  /* Enhanced 24-hour Window Expired Card */
                  <div className=" mx-auto">
                    <Card className="bg-gradient-to-r from-amber-50/95 to-amber-100/95 border-amber-200/50 shadow-lg backdrop-blur-sm overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex items-start gap-4 p-6">
                          <div className="flex-shrink-0">
                            <div className="bg-amber-200/60 p-4 rounded-full flex items-center justify-center">
                              <AlertCircle className="h-6 w-6 text-amber-600" />
                            </div>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div>
                              <h4 className="font-semibold text-amber-900 mb-2 text-lg">
                                24-hour messaging window expired
                              </h4>
                              <p className="text-amber-700 text-sm leading-relaxed">
                                For WhatsApp policy compliance, you can only send pre-approved message templates
                                when the 24-hour conversation window has expired.
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                onClick={() => setShowTemplateDialog(true)}
                                className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all duration-200 hover:scale-105"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Choose Template
                              </Button>
                              <div className="flex items-center gap-2 text-xs text-amber-700">
                                <Clock className="h-3 w-3" />
                                <span>Templates only</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Enhanced Empty State */
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background/95 to-accent/5 backdrop-blur-md">
              <div className="text-center p-8 max-w-md">
                <div className="relative inline-block mb-8">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl backdrop-blur-sm border border-primary/20">
                    <MessageSquare className="h-12 w-12 text-primary mx-auto" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                    <Plus className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  No conversation selected
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Choose a conversation from the sidebar or start a new one to begin messaging your customers.
                </p>
                <Button
                  onClick={() => setShowContactDialog(true)}
                  className="h-12 px-8 rounded-xl font-medium shadow-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground transition-all duration-200 hover:scale-105"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Start conversation
                </Button>
              </div>
            </div>
          )}








          {/* Contact Info Side Panel - enhanced with Card components */}
          <Sheet open={showInfoPanel} onOpenChange={setShowInfoPanel}>
            <SheetContent className=" h-full  p-0 overflow-y-scroll">
              <div className="h-full flex flex-col">
                <SheetHeader className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <SheetTitle>Contact Details</SheetTitle>
                  </div>
                </SheetHeader>
                <ScrollArea className="flex-1">
                  <ContactInfoPanel />
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
          {/* Message Error Details Dialog - Modernized */}
          <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
            <DialogContent className="max-w-2xl  m-auto  p-0 overflow-y-scroll h-fit max-h-screen">
              <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-red-50 to-red-100/80">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/20 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold text-slate-900">Message Failed</DialogTitle>
                    <DialogDescription className="text-slate-600">
                      Details about why this message couldn&apos;t be delivered
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {selectedErrorMessage && (
                <div className="px-6 py-4">
                  <div className="space-y-6">
                    {/* Message Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                          Failed Message
                        </h3>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/20 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-red-900 mb-1">Message Content</p>
                            <div className="text-sm text-red-800 break-words bg-white/60 p-3 rounded border border-red-100">
                              {selectedErrorMessage.content.length > 100
                                ? `${selectedErrorMessage.content.substring(0, 100)}...`
                                : selectedErrorMessage.content
                              }
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                {selectedErrorMessage.messageType}
                              </Badge>
                              <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                {format(new Date(selectedErrorMessage.timestamp), "MMM d, h:mm a")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error Details Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                          Error Details
                        </h3>
                      </div>

                      <div className="grid gap-3">
                        {selectedErrorMessage.errorCode && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600">Error Code</label>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                              <code className="text-sm font-mono text-slate-800">
                                {selectedErrorMessage.errorCode}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 rounded-md hover:bg-slate-200"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedErrorMessage.errorCode);
                                  toast({
                                    title: "Copied to clipboard",
                                    description: "Error code copied",
                                    variant: "default"
                                  });
                                }}
                              >
                                <Copy className="h-3.5 w-3.5 text-slate-600" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {selectedErrorMessage.errorMessage && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600">Error Message</label>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <p className="text-sm text-slate-800 leading-relaxed">
                                {selectedErrorMessage.errorMessage}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedErrorMessage.retryCount && selectedErrorMessage.retryCount > 0 && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600">Retry Attempts</label>
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                                <RefreshCcw className="h-3 w-3 text-amber-600" />
                              </div>
                              <p className="text-sm text-amber-800">
                                Failed after {selectedErrorMessage.retryCount} attempt{selectedErrorMessage.retryCount > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Troubleshooting Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                          Troubleshooting
                        </h3>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Info className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-2">Possible Solutions</h4>
                            <ul className="text-sm text-blue-800 space-y-2">
                              <li className="flex items-start gap-2">
                                <Circle className="h-1.5 w-1.5 text-blue-500 mt-1.5" />
                                <span>Verify the contact&apos;s phone number format is correct</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Circle className="h-1.5 w-1.5 text-blue-500 mt-1.5" />
                                <span>Confirm the contact has WhatsApp installed</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Circle className="h-1.5 w-1.5 text-blue-500 mt-1.5" />
                                <span>For non-template messages, ensure the 24-hour window is active</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Circle className="h-1.5 w-1.5 text-blue-500 mt-1.5" />
                                <span>For templates, check that the template is approved</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Circle className="h-1.5 w-1.5 text-blue-500 mt-1.5" />
                                <span>Verify your WhatsApp Business account is in good standing</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 gap-2 bg-gradient-to-r from-slate-50 to-slate-100/80">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowErrorDialog(false);
                    setSelectedErrorMessage(null);
                  }}
                  className="border-slate-200 hover:bg-slate-50"
                >
                  Close
                </Button>
                {/* <Button
                  onClick={() => {
                    // TODO: Add retry functionality here if needed
                    if (selectedErrorMessage) {
                      toast({
                        title: "Retry functionality",
                        description: "Message retry feature coming soon",
                        variant: "default"
                      });
                    }
                    setShowErrorDialog(false);
                    setSelectedErrorMessage(null);
                  }}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Retry Message
                </Button> */}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Contact Selection Dialog - enhanced UI */}
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
                        <Card
                          key={contact.id}
                          className="p-3 hover:border-primary/50 hover:bg-accent/50 cursor-pointer transition-colors"
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
                        </Card>
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



          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogContent className="sm:max-w-[900px] max-h-[95vh] flex flex-col p-0">
              <DialogHeader className="px-6 py-4 border-b border-slate-300 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold text-slate-900">
                      Send Message Template
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                      Choose a template and customize it before sending to your contact
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-hidden flex">
                {/* Templates List - Left Side */}
                <div className="w-1/2  border-r border-slate-200 flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Available Templates
                      </h3>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search templates..."
                        className="pl-10 bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 h-9"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-3">
                      {templates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          isSelected={selectedTemplate?.id === template.id}
                          onClick={() => setSelectedTemplate(template)}
                        />
                      ))}

                      {templates.length === 0 && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4 mx-auto">
                            <FileText className="h-8 w-8 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">No templates available</h3>
                          <p className="text-slate-600 text-sm mb-4 max-w-sm mx-auto">
                            Create templates to send structured messages to your customers.
                          </p>
                          <Button
                            onClick={() => window.location.href = '/templates'}
                            variant="outline"
                            className="border-slate-200 hover:bg-slate-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Template
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Template Preview - Right Side */}
                <div className="w-1/2 h-full mb-12 max-h-screen overflow-y-scroll flex flex-col">
                  {selectedTemplate ? (
                    <div className="flex-1 flex flex-col">
                      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                            Template Preview & Customize
                          </h3>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900">{selectedTemplate.name}</h4>
                            <p className="text-xs text-slate-600">
                              {selectedTemplate.category.toLowerCase()} • {selectedTemplate.language.toUpperCase()}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">
                            {selectedTemplate.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto px-6 py-6">
                        <TemplatePreviewAndCustomizeModern
                          template={selectedTemplate}
                          onSend={(template, variables) => sendTemplate(template, variables)}
                          isSending={isSending}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center px-6">
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 mx-auto">
                          <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a template</h3>
                        <p className="text-slate-600 text-sm max-w-sm">
                          Choose a template from the list to preview and customize it before sending
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplateDialog(false)}
                  className="hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => window.location.href = '/templates'}
                  variant="outline"
                  className="border-slate-200 hover:bg-slate-50"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create New Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>


          {/* Template Preview Dialog - Add this near your other Dialog components */}
          <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{previewTemplate?.name}</DialogTitle>
                <DialogDescription>
                  Template preview with sample variable values
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="bg-accent/20 p-4 rounded-lg border border-border/40">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-3 flex-1">
                      {/* Header, if any */}
                      {previewTemplate?.components?.find(c => c.type === 'header')?.text && (
                        <div className="font-medium">
                          {previewTemplate?.components?.find(c => c.type === 'header')?.text}
                        </div>
                      )}

                      {/* Body */}
                      <div className="text-sm text-foreground/90 whitespace-pre-line">
                        {formatTemplatePreview(previewTemplate?.components?.find(c => c.type === 'body')?.text || '')}
                      </div>

                      {/* Footer, if any */}
                      {previewTemplate?.components?.find(c => c.type === 'footer')?.text && (
                        <div className="text-xs text-muted-foreground mt-2">
                          {previewTemplate?.components?.find(c => c.type === 'footer')?.text}
                        </div>
                      )}

                      {/* Buttons, if any */}
                      {previewTemplate?.components?.some(c => c.type === 'button') && (
                        <div className="pt-2">
                          <Button variant="outline" className="w-full justify-center text-center h-9" disabled>
                            Example Button
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Close Preview
                </Button>
                <Button onClick={() => {
                  if (previewTemplate) {
                    setSelectedTemplate(previewTemplate);
                    setPreviewTemplate(null);
                    // Open variables dialog if needed
                    if (hasTemplateVariables(previewTemplate)) {
                      setShowTemplateVariablesDialog(true);
                    } else {
                      sendTemplate(previewTemplate);
                    }
                  }
                }}>
                  Use Template
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

          {/* Create Label Dialog - Modernized UI */}
          <Dialog open={showCreateLabelDialog} onOpenChange={setShowCreateLabelDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">Create Label</DialogTitle>
                <DialogDescription>
                  Create a new label to categorize your conversations
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Label Name</label>
                  <Input
                    placeholder="Enter label name"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    className="focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Label Color</label>

                  {/* Color picker circles */}
                  <div className="grid grid-cols-4 mt-2 gap-3">
                    {['blue', 'green', 'red', 'yellow', 'purple', 'orange', 'gray', 'teal'].map((color) => (
                      <div
                        key={color}
                        className={`flex flex-col bg- items-center gap-1.5 cursor-pointer group`}
                        onClick={() => setNewLabelColor(color)}
                      >
                        <div
                          className={`h-10 w-10 rounded-full transition-all
                  bg-${color}-500 hover:bg-${color}-600
                  ${newLabelColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''}
                  shadow-sm hover:shadow-md`}
                        />
                        <span className={`text-xs font-medium capitalize
                ${newLabelColor === color ? 'text-foreground' : 'text-muted-foreground'}
                group-hover:text-foreground transition-colors`}>
                          {color}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateLabelDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createLabel}
                  disabled={!newLabelName.trim()}
                  className={`bg-${newLabelColor}-500 hover:bg-${newLabelColor}-600 text-white`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Label
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bulk Tag Dialog */}
          <Dialog open={showBulkTagDialog} onOpenChange={setShowBulkTagDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Tags to Conversations</DialogTitle>
                <DialogDescription>
                  Add tags to {selectedConversations.length} selected conversations
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Search/Create input for new tag */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Create new tag</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter new tag name"
                      value={bulkTagName}
                      onChange={(e) => setBulkTagName(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (bulkTagName.trim()) {
                          // Add to selected tags if not already there
                          setSelectedBulkTags(prev =>
                            prev.includes(bulkTagName.trim())
                              ? prev
                              : [...prev, bulkTagName.trim()]
                          );
                          setBulkTagName("");
                        }
                      }}
                      disabled={!bulkTagName.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Divider */}
                <Separator />

                {/* Search existing tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select existing tags</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tags..."
                      className="pl-10"
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Existing tags with checkboxes */}
                <ScrollArea className="h-48 border rounded-md">
                  <div className="p-2 space-y-1">
                    {getUniqueTags()
                      .filter(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase()))
                      .map((tag, index) => (
                        <div key={index} className="flex items-center space-x-2 p-1.5 hover:bg-accent rounded-md">
                          <Checkbox
                            id={`tag-${index}`}
                            checked={selectedBulkTags.includes(tag)}
                            onCheckedChange={(checked) => {
                              setSelectedBulkTags(prev =>
                                checked
                                  ? [...prev, tag]
                                  : prev.filter(t => t !== tag)
                              );
                            }}
                          />
                          <label
                            htmlFor={`tag-${index}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-full cursor-pointer"
                          >
                            {tag}
                          </label>
                        </div>
                      ))}

                    {getUniqueTags().filter(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase())).length === 0 && (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        {tagSearchQuery.trim()
                          ? `No tags matching "${tagSearchQuery}"`
                          : "No tags available"
                        }
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Selected tags display */}
                {selectedBulkTags.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Selected tags</label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBulkTags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-1">
                          {tag}
                          <X
                            className="h-3 w-3 ml-1.5 cursor-pointer"
                            onClick={() => setSelectedBulkTags(prev => prev.filter(t => t !== tag))}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBulkTagDialog(false);
                    setSelectedBulkTags([]);
                    setBulkTagName("");
                    setTagSearchQuery("");
                  }}
                  disabled={isBulkProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={bulkAddTags}
                  disabled={selectedBulkTags.length === 0 || isBulkProcessing}
                >
                  {isBulkProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Tag className="h-4 w-4 mr-2" />
                      Add Tags
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bulk Delete Dialog */}
          <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Conversations</DialogTitle>
                <DialogDescription className="text-destructive">
                  Are you sure you want to delete {selectedConversations.length} selected conversations? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowBulkDeleteDialog(false)}
                  disabled={isBulkProcessing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={bulkDeleteConversations}
                  disabled={isBulkProcessing}
                >
                  {isBulkProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
              <DialogHeader className="px-6 py-4 border-b border-slate-300 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center">
                    <Filter className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold text-slate-900">
                      Filter Conversations
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                      Set filters to find specific conversations
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  {/* Active Filters Summary */}
                  {getActiveFilterCount() > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-sm font-medium text-blue-800">
                            {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} active
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetFilters}
                          className="h-7 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Status Filter */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Status
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'active', label: 'Active', color: 'green' },
                        { id: 'pending', label: 'Pending', color: 'amber' },
                        { id: 'resolved', label: 'Resolved', color: 'blue' },
                        { id: 'closed', label: 'Closed', color: 'slate' }
                      ].map((status) => (
                        <div key={status.id} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <Checkbox
                            id={`status-${status.id}`}
                            checked={filters.status.includes(status.id)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                status: checked
                                  ? [...prev.status, status.id]
                                  : prev.status.filter(s => s !== status.id)
                              }));
                            }}
                          />
                          <label
                            htmlFor={`status-${status.id}`}
                            className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-2 flex-1"
                          >
                            <div className={`h-2 w-2 rounded-full bg-${status.color}-500`} />
                            {status.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assignment Filter */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Assignment
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                        <Checkbox
                          id="unassigned"
                          checked={filters.assigned.includes('unassigned')}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              assigned: checked
                                ? [...prev.assigned, 'unassigned']
                                : prev.assigned.filter(a => a !== 'unassigned')
                            }));
                          }}
                        />
                        <label
                          htmlFor="unassigned"
                          className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-2 flex-1"
                        >
                          <UserX className="h-4 w-4 text-slate-500" />
                          Unassigned
                        </label>
                      </div>
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <Checkbox
                            id={`member-${member.id}`}
                            checked={filters.assigned.includes(member.id)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                assigned: checked
                                  ? [...prev.assigned, member.id]
                                  : prev.assigned.filter(a => a !== member.id)
                              }));
                            }}
                          />
                          <label
                            htmlFor={`member-${member.id}`}
                            className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-2 flex-1"
                          >
                            <User className="h-4 w-4 text-slate-500" />
                            {member.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Labels Filter */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Labels
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {labels.length > 0 ? (
                        labels.map((label) => (
                          <div key={label.id} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <Checkbox
                              id={`label-${label.id}`}
                              checked={filters.labels.includes(label.id)}
                              onCheckedChange={(checked) => {
                                setFilters(prev => ({
                                  ...prev,
                                  labels: checked
                                    ? [...prev.labels, label.id]
                                    : prev.labels.filter(l => l !== label.id)
                                }));
                              }}
                            />
                            <label
                              htmlFor={`label-${label.id}`}
                              className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-2 flex-1"
                            >
                              <div className={`w-3 h-3 rounded-full bg-${label.color}-500`}></div>
                              {label.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-slate-500">
                          <Tag className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm">No labels available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message Type Filter */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Message Type
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'text', icon: MessageCircle, label: 'Text' },
                        { id: 'image', icon: ImageIcon, label: 'Image' },
                        { id: 'video', icon: Video, label: 'Video' },
                        { id: 'document', icon: FileText, label: 'Document' },
                        { id: 'audio', icon: Phone, label: 'Audio' },
                        { id: 'template', icon: FileText, label: 'Template' }
                      ].map((type) => (
                        <div key={type.id} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <Checkbox
                            id={`type-${type.id}`}
                            checked={filters.messageType.includes(type.id)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                messageType: checked
                                  ? [...prev.messageType, type.id]
                                  : prev.messageType.filter(t => t !== type.id)
                              }));
                            }}
                          />
                          <label
                            htmlFor={`type-${type.id}`}
                            className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-2 flex-1"
                          >
                            <type.icon className="h-4 w-4 text-slate-500" />
                            {type.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Date Range
                      </h3>
                    </div>
                    <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                      <Select
                        value={filters.dateRange}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                      >
                        <SelectTrigger className="w-full bg-white border-pink-300 focus:border-pink-500 focus:ring-pink-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="yesterday">Yesterday</SelectItem>
                          <SelectItem value="week">Last 7 Days</SelectItem>
                          <SelectItem value="month">Last 30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Sort Options
                      </h3>
                    </div>
                    <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                      <div className="flex gap-2">
                        <Select
                          value={filters.sortBy}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                        >
                          <SelectTrigger className="flex-1 bg-white border-teal-300 focus:border-teal-500 focus:ring-teal-500/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lastMessageAt">Last Message</SelectItem>
                            <SelectItem value="name">Contact Name</SelectItem>
                            <SelectItem value="unreadCount">Unread Count</SelectItem>
                            <SelectItem value="messageCount">Message Count</SelectItem>
                            <SelectItem value="createdAt">Created Date</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                          }))}
                          className="border-teal-300 text-teal-600 hover:bg-teal-100 hover:border-teal-400"
                        >
                          {filters.sortOrder === 'asc' ? (
                            <SortAsc className="h-4 w-4" />
                          ) : (
                            <SortDesc className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Quick Filters
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: 'unreadOnly', icon: MessageCircle, label: 'Unread Only', checked: filters.unreadOnly },
                        { id: 'within24Hours', icon: Zap, label: 'Within 24 Hours', checked: filters.within24Hours },
                        { id: 'hasMedia', icon: ImageIcon, label: 'Has Media', checked: filters.hasMedia },
                        { id: 'hasNotes', icon: FileText, label: 'Has Notes', checked: filters.hasNotes }
                      ].map((filter) => (
                        <div key={filter.id} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <Checkbox
                            id={filter.id}
                            checked={filter.checked}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({ ...prev, [filter.id]: checked || false }));
                            }}
                          />
                          <label
                            htmlFor={filter.id}
                            className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-2 flex-1"
                          >
                            <filter.icon className="h-4 w-4 text-slate-500" />
                            {filter.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Filter className="h-4 w-4" />
                    <span>
                      {getActiveFilterCount() > 0
                        ? `${getActiveFilterCount()} filter${getActiveFilterCount() > 1 ? 's' : ''} applied`
                        : 'No filters applied'
                      }
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      disabled={getActiveFilterCount() === 0}
                      className="hover:bg-slate-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reset All
                    </Button>
                    <Button
                      onClick={() => setShowFilterDialog(false)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>




          {/* Image Preview Dialog - Fixed */}
          <Dialog open={!!selectedImageUrl} onOpenChange={(open) => {
            if (!open) {
              setSelectedImageUrl(null);
            }
          }}>
            <DialogContent className="max-w-4xl h-fit max-h-screen p-0 overflow-y-scroll">
              <div className="relative">
                {/* Close button */}
                {/* <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white"
                    onClick={() => setSelectedImageUrl(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div> */}

                {/* Image container */}
                <div className="flex items-center justify-center  min-h-[300px]">
                  {selectedImageUrl && (
                    <img
                      src={selectedImageUrl}
                      alt="Preview"
                      className="max-h-[80vh] max-w-full object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Footer with action buttons */}
              <div className="flex justify-between p-3 pb-6 bg-gray-50 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedImageUrl || '', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Original
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (selectedImageUrl) {
                      const link = document.createElement('a');
                      link.href = selectedImageUrl;
                      link.download = selectedImageUrl.split('/').pop() || 'image';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Tag Dialog - Updated to match bulk tag dialog style */}
          <Dialog open={showAddTagDialog} onOpenChange={setShowAddTagDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Tag to Contact</DialogTitle>
                <DialogDescription>
                  Add or remove tags for {getCurrentContact()?.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Search/Create input for new tag */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Create new tag</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter new tag name"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (newTag.trim()) {
                          handleAddTag();
                        }
                      }}
                      disabled={!newTag.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Divider */}
                <Separator />

                {/* Search existing tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Manage existing tags</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tags..."
                      className="pl-10"
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Existing tags with checkboxes */}
                <ScrollArea className="h-48 border rounded-md">
                  <div className="p-2 space-y-1">
                    {getUniqueTags()
                      .filter(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase()))
                      .map((tag, index) => {
                        const isTagged = getCurrentContact()?.tags?.includes(tag) || false;

                        return (
                          <div key={index} className="flex items-center space-x-2 p-1.5 hover:bg-accent rounded-md">
                            <Checkbox
                              id={`single-tag-${index}`}
                              checked={isTagged}
                              onCheckedChange={(checked) => {
                                if (checked && !isTagged) {
                                  handleAddTag(tag);
                                } else if (!checked && isTagged) {
                                  handleRemoveTag(tag);
                                }
                              }}
                            />
                            <label
                              htmlFor={`single-tag-${index}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-full cursor-pointer"
                            >
                              {tag}
                              {isTagged && <span className="ml-2 text-xs text-primary">(applied)</span>}
                            </label>
                          </div>
                        );
                      })}

                    {getUniqueTags().filter(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase())).length === 0 && (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        {tagSearchQuery.trim()
                          ? `No tags matching "${tagSearchQuery}"`
                          : "No tags available"
                        }
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Current contact tags display */}
                {getCurrentContact()?.tags && getCurrentContact()?.tags.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current tags</label>
                    <div className="flex flex-wrap gap-1.5">
                      {getCurrentContact()?.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-1">
                          {tag}
                          <X
                            className="h-3 w-3 ml-1.5 cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddTagDialog(false);
                    setNewTag("");
                    setTagSearchQuery("");
                  }}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Template Variables Dialog - enhanced UI */}

        </div>
      </div>
    </Layout>
  );

  function ContactInfoPanel() {
    const contact = getCurrentContact();
    const { toast } = useToast();

    const [isUpdating, setIsUpdating] = useState(false);

    if (!contact) return null;

    // Handle WhatsApp opt-in toggle
    const handleOptInToggle = async (checked: boolean) => {
      if (!contact) return;

      setIsUpdating(true);

      try {
        // Update the contact's opt-in status
        const response = await fetch(`/api/contacts/${contact.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...contact,
            whatsappOptIn: checked,
            // The API will handle adding/removing the opted-out tag
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Update the contact in the local state
          if (selectedContact) {
            setSelectedContact({
              ...selectedContact,
              whatsappOptIn: checked,
              tags: handleOptedOutTag(selectedContact.tags || [], checked)
            });
          } else if (activeConversation) {
            setActiveConversation({
              ...activeConversation,
              contact: {
                ...activeConversation.contact,
                whatsappOptIn: checked,
                tags: handleOptedOutTag(activeConversation.contact.tags || [], checked)
              }
            });
          }

          toast({
            title: checked ? "WhatsApp opt-in enabled" : "WhatsApp opt-in disabled",
            description: checked ? "Contact can now receive marketing messages" : "Contact will only receive service messages",
          });

          // Refresh contacts to update the sidebar
          fetchContacts();
        } else {
          toast({
            title: "Failed to update contact",
            description: data.message || "Please try again",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error updating WhatsApp opt-in status:", error);
        toast({
          title: "Error updating contact",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsUpdating(false);
      }
    };

    // Helper function to manage the opted-out tag
    const handleOptedOutTag = (tags: string[], isOptedIn: boolean) => {
      const updatedTags = [...tags];
      const optedOutIndex = updatedTags.findIndex(tag => tag.toLowerCase() === 'opted-out');

      if (!isOptedIn && optedOutIndex === -1) {
        // Add opted-out tag if opted out and tag doesn't exist
        updatedTags.push('opted-out');
      } else if (isOptedIn && optedOutIndex !== -1) {
        // Remove opted-out tag if opted in and tag exists
        updatedTags.splice(optedOutIndex, 1);
      }

      return updatedTags;
    };

    return (
      <div className="space-y-6 w-full p-6">
        {/* Profile Section - Modernized with gradient background */}
        <div className="relative overflow-hidden rounded-lg mb-6">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background"></div>
          <div className="relative pt-8 pb-6 text-center px-4">
            <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-background shadow-lg">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                {contact.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold text-foreground mb-1">{contact.name}</h3>
            <p className="text-muted-foreground">{contact.phone}</p>
            <div className="mt-4">
              <Badge
                variant={contact.whatsappOptIn ? "default" : "secondary"}
                className={cn(
                  "px-3 py-1 text-sm",
                  contact.whatsappOptIn
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-slate-100 text-slate-800 border border-slate-200"
                )}
              >
                {contact.whatsappOptIn ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    WhatsApp Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                    WhatsApp Inactive
                  </span>
                )}
              </Badge>
            </div>
          </div>
        </div>

        {/* WhatsApp Settings - New section */}
        <div className="bg-card rounded-lg border border-border/50 p-4">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2 text-primary">
            <MessageSquare className="h-4 w-4" />
            WhatsApp Settings
          </h4>

          <div className="bg-green-50 rounded-lg border border-green-200 p-4 transition-all hover:border-green-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h5 className="font-medium text-green-800">Marketing Messages</h5>
                  <p className="text-xs text-green-600">
                    Allows sending promotional content
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp-optin-toggle"
                  checked={contact.whatsappOptIn}
                  onCheckedChange={handleOptInToggle}
                  disabled={isUpdating}
                  className="text-green-600 border-green-300 rounded focus:ring-green-500 h-5 w-5"
                />
                <Label
                  htmlFor="whatsapp-optin-toggle"
                  className={cn(
                    "text-sm font-medium",
                    contact.whatsappOptIn ? "text-green-800" : "text-slate-800"
                  )}
                >
                  {isUpdating ? "Updating..." : (contact.whatsappOptIn ? "Opted In" : "Opted Out")}
                </Label>
              </div>
            </div>

            {!contact.whatsappOptIn && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    This contact has opted out of marketing messages. You can only send them service messages or template messages.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conversation Stats - Card with visual indicators */}
        {activeConversation && (
          <div className="bg-accent/30 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Conversation Insights
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-lg p-3 border border-border/50 transition-all hover:border-primary/30 hover:shadow-sm">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-3 w-3 rounded-full",
                    activeConversation.status === 'active' && "bg-green-500",
                    activeConversation.status === 'pending' && "bg-amber-500",
                    activeConversation.status === 'resolved' && "bg-blue-500",
                    activeConversation.status === 'closed' && "bg-slate-500"
                  )}></div>
                  <p className="text-xs text-muted-foreground">Status</p>
                </div>
                <p className="font-medium text-sm capitalize mt-1">{activeConversation.status}</p>
              </div>
              <div className="bg-background rounded-lg p-3 border border-border/50 transition-all hover:border-primary/30 hover:shadow-sm">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3 w-3 text-primary" />
                  <p className="text-xs text-muted-foreground">Messages</p>
                </div>
                <p className="font-medium text-sm mt-1">{activeConversation.messageCount}</p>
              </div>
              <div className="bg-background rounded-lg p-3 border border-border/50 transition-all hover:border-primary/30 hover:shadow-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-indigo-500" />
                  <p className="text-xs text-muted-foreground">First message</p>
                </div>
                <p className="font-medium text-sm mt-1">
                  {format(new Date(activeConversation.createdAt || new Date()), "MMM d, yyyy")}
                </p>
              </div>
              <div className="bg-background rounded-lg p-3 border border-border/50 transition-all hover:border-primary/30 hover:shadow-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-amber-500" />
                  <p className="text-xs text-muted-foreground">24h window</p>
                </div>
                <p className={cn(
                  "font-medium text-sm mt-1",
                  activeConversation.isWithin24Hours ? "text-green-600" : "text-amber-600"
                )}>
                  {activeConversation.isWithin24Hours ? "Active" : "Expired"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Details - Modern card design */}
        <div className="bg-card rounded-lg border border-border/50 p-4">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2 text-primary">
            <User className="h-4 w-4" />
            Contact Information
          </h4>
          <div className="space-y-3">
            {contact.email && (
              <div className="group">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground block mb-1">Email Address</label>
                  <Button variant="ghost" size="sm" className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-sm p-2.5 rounded-md bg-accent/30 border border-border/50 hover:border-accent transition-colors">
                  {contact.email}
                </div>
              </div>
            )}
            <div className="group">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground block mb-1">Phone Number</label>
                <Button variant="ghost" size="sm" className="h-6 px-2 ">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-sm p-2.5 rounded-md bg-accent/30 border border-border/50 hover:border-accent transition-colors">
                {contact.phone}
              </div>
            </div>
          </div>
        </div>

        {/* Tags Section - Interactive tags */}
        <div className="bg-card rounded-lg border border-border/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center gap-2 text-primary">
              <Tag className="h-4 w-4" />
              Tags
            </h4>
            <Button onClick={() => setShowAddTagDialog(true)} variant="outline" size="sm" className="h-7 px-2.5 border-dashed border-primary/50 text-primary hover:bg-primary/10">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
          {contact.tags && contact.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {contact.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={cn(
                    "bg-accent/30 hover:bg-accent/50 border-border/80 transition-colors py-1 px-2.5 cursor-pointer group",
                    tag.toLowerCase() === 'opted-out' && "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  )}
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <X className="h-3 w-3 ml-1 " />
                </Badge>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 border border-dashed border-border/50 rounded-md">
              <p className="text-sm text-muted-foreground italic">No tags assigned</p>
            </div>
          )}
        </div>

        {/* Notes Section - Enhanced styling */}
        <div className="bg-card rounded-lg border border-border/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text- flex items-center gap-2 text-primary">
              <FileText className="h-4 w-4" />
              Notes
            </h4>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 border-dashed border-primary/50 text-primary hover:bg-primary/10"
              onClick={() => setShowNoteDialog(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
          {contact.notes ? (
            <div className="text-sm p-3 rounded-md bg-accent/30 border border-border/50 hover:border-accent transition-colors">
              <p className="text-foreground leading-relaxed">{contact.notes}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border/50 rounded-md">
              <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground italic">No notes available</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-primary hover:text-primary"
                onClick={() => setShowNoteDialog(true)}
              >
                Add a note
              </Button>
            </div>
          )}
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



// Template Card Component
const TemplateCard = ({
  template,
  isSelected,
  onClick
}: {
  template: Template;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const hasTextVariables = template.components?.some(comp =>
    (comp.type === 'BODY' && comp.text?.includes('{{')) ||
    (comp.type === 'HEADER' && comp.format === 'TEXT' && comp.text?.includes('{{'))
  );

  const hasMediaHeaders = template.components?.some(comp =>
    comp.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(comp.format)
  );

  const mediaType = template.components?.find(comp =>
    comp.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(comp.format)
  )?.format;

  return (
    <div
      className={cn(
        "group p-4 border rounded-lg cursor-pointer transition-all duration-200",
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border/50 hover:border-primary/30 hover:bg-accent/30 hover:shadow-sm"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground mb-1 truncate">
            {template.name}
          </h4>
          <p className="text-xs text-muted-foreground capitalize">
            {template.category.toLowerCase()}
          </p>
        </div>
        <Badge variant="outline" className="text-xs shrink-0 ml-2">
          {template.language}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {hasTextVariables && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
            Variables
          </Badge>
        )}
        {hasMediaHeaders && (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5" />
            {mediaType === 'IMAGE' && 'Image'}
            {mediaType === 'VIDEO' && 'Video'}
            {mediaType === 'DOCUMENT' && 'Document'}
          </Badge>
        )}
      </div>

      {/* Preview snippet */}
      <div className="text-xs text-muted-foreground leading-relaxed">
        <p className="truncate">
          {template.components?.find(c => c.type === 'BODY')?.text?.substring(0, 80) || 'No content preview available'}
          {(template.components?.find(c => c.type === 'BODY')?.text?.length || 0) > 80 && '...'}
        </p>
      </div>

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-primary/20">
          <div className="flex items-center text-xs text-primary font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
            Selected for customization
          </div>
        </div>
      )}
    </div>
  );
};

// Update the TemplatePreviewAndCustomize component to handle variables inline
// Modern Template Preview Component matching the contact dialog style
const TemplatePreviewAndCustomizeModern = ({
  template,
  onSend,
  isSending
}: {
  template: Template;
  onSend: (template: Template, variables: { [key: string]: string }) => void;
  isSending: boolean;
}) => {
  const [templateVariables, setTemplateVariables] = useState<{ [key: string]: string }>({});

  // Extract text variables from template
  const textVariables: string[] = [];
  if (template.components) {
    template.components.forEach(component => {
      if (component.type === 'BODY' && component.text) {
        const matches = component.text.match(/\{\{[^}]+\}\}/g) || [];
        matches.forEach((match: string) => {
          const varName = match.replace(/\{\{|\}\}/g, '').trim();
          if (!textVariables.includes(varName)) {
            textVariables.push(varName);
          }
        });
      }
      if (component.type === 'HEADER' && component.format === 'TEXT' && component.text) {
        const matches = component.text.match(/\{\{[^}]+\}\}/g) || [];
        matches.forEach((match: string) => {
          const varName = match.replace(/\{\{|\}\}/g, '').trim();
          if (!textVariables.includes(varName)) {
            textVariables.push(varName);
          }
        });
      }
    });
  }

  const hasVariables = textVariables.length > 0;
  const hasMediaHeader = template.components?.some(comp =>
    comp.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(comp.format)
  );

  const mediaComponent = template.components?.find(comp =>
    comp.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(comp.format)
  );

  const canSend = !hasVariables || textVariables.every(varName => templateVariables[varName]?.trim());

  const handleSend = () => {
    onSend(template, templateVariables);
  };

  // Function to render template text with variable highlighting
  const renderTextWithVariables = (text: string) => {
    if (!text) return null;

    return text.split(/(\{\{[^}]+\}\})/).map((part, index) => {
      if (part.match(/\{\{[^}]+\}\}/)) {
        const varName = part.replace(/\{\{|\}\}/g, '').trim();
        const value = templateVariables[varName];
        return (
          <span
            key={index}
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border transition-colors",
              value?.trim()
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-blue-50 text-blue-800 border-blue-200"
            )}
          >
            {value?.trim() || part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp Message Preview */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            WhatsApp Preview
          </h4>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
            <div className="flex items-center gap-2 text-xs text-green-700 font-medium">
              <MessageCircle className="h-4 w-4" />
              WhatsApp Business Message
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Header */}
            {template.components?.find(c => c.type === 'HEADER') && (
              <div className="space-y-3">
                {template.components?.find(c => c.type === 'HEADER')?.format === 'TEXT' && (
                  <div className="font-semibold text-slate-900 leading-relaxed">
                    {renderTextWithVariables(template.components?.find(c => c.type === 'HEADER')?.text || '')}
                  </div>
                )}
                {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(template.components?.find(c => c.type === 'HEADER')?.format || '') && (
                  <div className="relative">
                    {mediaComponent?.format === 'IMAGE' && mediaComponent?.mediaUrl ? (
                      <div className="relative">
                        <img
                          src={mediaComponent.mediaUrl}
                          alt="Template header"
                          className="w-full max-h-48 object-cover rounded-lg border border-slate-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                          <ImageIcon className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-700 font-medium">Image Header</p>
                          <p className="text-xs text-slate-500 mt-1">Template image will be displayed here</p>
                        </div>
                      </div>
                    ) : mediaComponent?.format === 'VIDEO' ? (
                      <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                        <Video className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                        <p className="text-sm text-purple-700 font-medium">Video Header</p>
                        <p className="text-xs text-purple-600 mt-1">Template video will be displayed here</p>
                      </div>
                    ) : mediaComponent?.format === 'DOCUMENT' ? (
                      <div className="text-center p-6 bg-amber-50 rounded-lg border border-amber-200">
                        <FileText className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                        <p className="text-sm text-amber-700 font-medium">Document Header</p>
                        <p className="text-xs text-amber-600 mt-1">Template document will be attached</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Body */}
            {template.components?.find(c => c.type === 'BODY') && (
              <div className="text-slate-900 leading-relaxed">
                {renderTextWithVariables(template.components?.find(c => c.type === 'BODY')?.text || '')}
              </div>
            )}

            {/* Footer */}
            {template.components?.find(c => c.type === 'FOOTER') && (
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                {template.components?.find(c => c.type === 'FOOTER')?.text}
              </div>
            )}

            {/* Buttons */}
            {template.components?.some(c => c.type === 'BUTTONS') && (
              <div className="pt-3 space-y-2">
                {template.components?.find(c => c.type === 'BUTTONS')?.buttons?.map((button: any, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-center h-9 text-sm border-slate-200 text-slate-700"
                    disabled
                  >
                    {button.type === 'URL' && <ExternalLink className="h-3.5 w-3.5 mr-2" />}
                    {button.type === 'PHONE_NUMBER' && <Phone className="h-3.5 w-3.5 mr-2" />}
                    {button.type === 'COPY_CODE' && <Copy className="h-3.5 w-3.5 mr-2" />}
                    {button.text}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variables Input Section */}
      {hasVariables && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Template Variables
            </h4>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              {textVariables.length} required
            </Badge>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="space-y-4">
              {textVariables.map((varName, index) => (
                <div key={index} className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    {varName} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder={`Enter value for ${varName}`}
                    value={templateVariables[varName] || ''}
                    onChange={(e) => setTemplateVariables(prev => ({
                      ...prev,
                      [varName]: e.target.value
                    }))}
                    className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                  />
                  <p className="text-xs text-slate-500">
                    This value will replace {`{{${varName}}}`} in the template
                  </p>
                </div>
              ))}
            </div>

            {!canSend && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Variables Required</p>
                  <p className="text-xs text-amber-700">Please fill in all required variables before sending</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media Header Info */}
      {hasMediaHeader && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Media Content
            </h4>
          </div>

          <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
            <div className="flex items-start gap-3">
              {mediaComponent?.format === 'IMAGE' && <ImageIcon className="h-5 w-5 text-purple-600 mt-0.5" />}
              {mediaComponent?.format === 'VIDEO' && <Video className="h-5 w-5 text-purple-600 mt-0.5" />}
              {mediaComponent?.format === 'DOCUMENT' && <FileText className="h-5 w-5 text-purple-600 mt-0.5" />}
              <div>
                <p className="text-sm font-medium text-purple-800 mb-1">
                  {mediaComponent?.format?.toLowerCase()} will be included automatically
                </p>
                <p className="text-xs text-purple-700">
                  The media file from your approved template will be sent with this message
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Button */}
      <div className="pt-4 border-t mb-96 border-slate-200">
        <Button
          onClick={handleSend}
          disabled={!canSend || isSending}
          className="w-full h-12  bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
              Sending Template...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Template Message
              {hasVariables && ` with ${textVariables.length} variable${textVariables.length > 1 ? 's' : ''}`}
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 mb-56 text-center mt-3 leading-relaxed">
          {hasVariables && hasMediaHeader
            ? 'Template will be sent with your custom variable values and media content'
            : hasVariables
              ? 'Your variable values will be automatically substituted in the message'
              : hasMediaHeader
                ? 'Template media will be included automatically with the message'
                : 'Template will be sent exactly as configured above'
          }
        </p>
      </div>
    </div>
  );
};