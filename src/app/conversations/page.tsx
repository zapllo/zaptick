"use client";

import { useState, useEffect, useRef, Suspense } from "react";
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
  ChevronLeft
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
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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


  // Update this in your useEffect hooks section

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

  const hasTemplateVariables = (template: Template) => {
    return template.components?.some(comp =>
      (comp.type === 'body' && comp.text?.includes('{{')) ||
      (comp.type === 'header' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(comp.format || ''))
    );
  };
  // Template dialog states
  const [templateVariables, setTemplateVariables] = useState<{ [key: string]: string }>({});
  const [showTemplateVariablesDialog, setShowTemplateVariablesDialog] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ type: string, url: string } | null>(null);
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
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await fetchConversations();
      await fetchContacts();
      if (activeConversation) {
        await fetchMessages(activeConversation.id);
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

      const response = await fetch(`/api/conversations?${params}`);
      const data = await response.json();
      if (data.success) setConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
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

  // Effects
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

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      setSelectedContact(null);

      // Ensure contact details are available for sending messages
      if (!activeConversation.contact) {
        // If for some reason contact details are missing, fetch them
        fetchConversationDetails(activeConversation.id);
      }
    }
  }, [activeConversation]);

  // Add this new function to fetch conversation details if needed
  const fetchConversationDetails = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      const data = await response.json();
      if (data.success && data.conversation) {
        // Update the active conversation with complete details
        setActiveConversation(data.conversation);
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      toast({
        title: "Failed to load complete conversation details",
        variant: "destructive"
      });
    }
  };

  // useEffect(() => { scrollToBottom(); }, [messages]);

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

        // Attempt to fetch complete conversation details
        try {
          const response = await fetch(`/api/conversations/${activeConversation.id}`);
          const data = await response.json();
          if (data.success && data.conversation && data.conversation.contact?.id) {
            contactId = data.conversation.contact.id;
            console.log('Retrieved contact ID from API:', contactId);
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
        // If this was a new conversation, fetch the created conversation and set as active
        if (!activeConversation && data.conversationId) {
          console.log('Fetching new conversation:', data.conversationId);
          const convResponse = await fetch(`/api/conversations/${data.conversationId}`);
          const convData = await convResponse.json();
          if (convData.success) {
            setActiveConversation(convData.conversation);
            setSelectedContact(null); // Clear selected contact since we now have a conversation
            // Refresh the conversations list
            fetchConversations();
          }
        } else if (activeConversation) {
          // For existing conversations, just fetch updated messages
          fetchMessages(activeConversation.id);
          // Also refresh conversations list to update last message
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

  // Modified sendTemplate function
  const sendTemplate = async (template: Template, skipVariables = false) => {
    // Get contact ID - prioritize selectedContact over activeConversation contact
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
        description: "Please select a contact to send a template",
        variant: "destructive"
      });
      return;
    }

    if (isSending) return;

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
          contactId: contactId,
          wabaId: wabaId,
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
            setSelectedContact(null); // Clear selected contact
            fetchConversations(); // Refresh conversations list
          }
        } else if (activeConversation) {
          // Otherwise, fetch the updated messages
          fetchMessages(activeConversation.id);
          fetchConversations(); // Refresh conversations list
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

  if (wabaAccounts.length === 0) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center bg-background">
          <Card className="max-w-md mx-auto shadow-md">
            <CardHeader className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Connect WhatsApp</CardTitle>
              <CardDescription className="text-muted-foreground">
                Connect your WhatsApp Business Account to start managing conversations with your customers.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center pb-6">
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="text-primary-foreground"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Connect Account
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-screen flex w-full  flex-col bg-background">
        {/* Top Navigation Bar */}
        <div className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <AlignJustify className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold hidden md:block">Conversations</h1>
            {/* <div className="flex items-center gap-2">
              <Select value={selectedWabaId} onValueChange={setSelectedWabaId} >
                <SelectTrigger>
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
            </div> */}
          </div>






          {/* Pill list section */}
          {Array.from(new Set(contacts.flatMap(contact => contact.tags || []))).length > 0 ? (
            <div className="relative">
              {/* ← arrow */}
              <div className="absolute bg-white border cursor-pointer left-0 top-0 h-[42px] flex items-center ml-4 rounded rounded-r-none z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={scrollLeft}
                  className="h-8 w-8"
                  disabled={!canScrollLeft}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>

              {/* scrollable pill list */}
              <div
                ref={scrollContainerRef}
                onScroll={checkScrollability}
                className="ml-12 h-[42px] overflow-x-auto w-full max-w-[600px] border rounded rounded-l-none overflow-y-hidden scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <Tabs
                  value={activeTagFilter ?? "all"}
                  onValueChange={(v) => setActiveTagFilter(v === "all" ? null : v)}
                  className="w-full"
                >
                  <TabsList className="flex items-center  gap-2 bg-transparent h-full px-12">
                    {/* ALL */}
                    <TabsTrigger
                      value="all"
                      className="flex items-center gap-2 px-3  h-8 rounded-md text-sm font-medium whitespace-nowrap
             data-[state=inactive]:cursor-pointer data-[state=inactive]:border-gray-200
             data-[state=inactive]:text-gray-700 data-[state=inactive]:bg-white
             data-[state=active]:border data-[state=active]:border-primary -300
             data-[state=active]:text-primary -900 data-[state=active]:bg-primary/20
             hover:bg-gray-50 transition-colors"
                    >
                      All
                    </TabsTrigger>

                    {/* DYNAMIC TAGS */}
                    {Array.from(new Set(contacts.flatMap(contact => contact.tags || []))).map((tag, index) => {
                      // Count conversations with contacts that have this tag
                      const tagCount = conversations.filter(conv => {
                        return conv.contact &&
                          Array.isArray(conv.contact.tags) &&
                          conv.contact.tags.includes(tag);
                      }).length;

                      // Only show tabs for tags that have conversations
                      if (tagCount === 0) return null;
                      return (
                        <TabsTrigger
                          key={tag}
                          value={tag}
                          className="flex items-center gap-2 px-3 h-8 rounded-md text-sm font-medium whitespace-nowrap
                 data-[state=inactive]:cursor-pointer data-[state=inactive]:border-gray-200
                 data-[state=inactive]:text-gray-700 data-[state=inactive]:bg-white
                 data-[state=active]:border data-[state=active]:border-primary -300
                 data-[state=active]:text-primary -900 data-[state=active]:bg-primary/20
                 hover:bg-gray-50 transition-colors"
                        >
                          <h1 className='text-black'>{tag}</h1>
                          <span className="text-xs text-gray-500 bg-[#e1dfe1] px-1.5 py-0.5 rounded">
                            {tagCount}
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </div>

              {/* Right gradient fade */}
              <div className="absolute bg-white right-0 top-0 h-[42px] border rounded-r bg-gradient-to-l from-white via-white to-transparent flex items-center pr-2 pointer-events-none z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={scrollRight}
                  className="h-7 w-7 pointer-events-auto"
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ) : null}



          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={refreshData}
                    disabled={isRefreshing}
                  >
                    <RefreshCcw className={cn("h-5 w-5", isRefreshing && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh conversations</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowContactDialog(true)}
                  >
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New conversation</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Bulk Select Toggle */}


            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.location.href = '/contacts'}>
                  <User className="h-4 w-4 mr-2" />
                  Manage Contacts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/templates'}>
                  <FileText className="h-4 w-4 mr-2" />
                  Message Templates
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Conversations List Sidebar */}

          {/* Conversations List Sidebar */}
          <div className={cn(
            "w-full md:w-80 lg:w-96 flex flex-col bg-white border-r overflow-hidden",
            !isMobileMenuOpen && "hidden md:flex",
            isMobileMenuOpen && "absolute inset-0 z-50 md:relative"
          )}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
              {isBulkSelectMode ? (
                <div className="flex items-center gap-2 w-full">
                  <Button variant="ghost" size="icon" onClick={exitBulkMode} className="p-1">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <span className="font-medium">{selectedConversations.length} chat{selectedConversations.length !== 1 ? 's' : ''} selected</span>
                </div>
              ) : (
                <h2 className="font-medium text-lg">Inbox</h2>
              )}
              <div className="flex items-center relative gap-1">

                {isBulkSelectMode ? (
                  <Button variant="ghost" size="icon" onClick={() => {
                    setShowBulkActions(!showBulkActions);
                  }}>
                    <MoreVertical className="h-5 w-5 text-gray-500" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" onClick={() => setIsBulkSelectMode(true)}>
                    <LiaCheckDoubleSolid className="h-5 w-5 scale-150 text-primary" />
                  </Button>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={getActiveFilterCount() > 0 ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setShowFilterDialog(true)}
                        className={getActiveFilterCount() > 0 ? "relative" : ""}
                      >
                        <Filter className="h-5 w-5 scale-125 text-primary" />
                        {getActiveFilterCount() > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center rounded-full">
                            {getActiveFilterCount()}
                          </span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {getActiveFilterCount() > 0 ? `${getActiveFilterCount()} filters active` : "Filter conversations"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {isBulkSelectMode && selectedConversations.length > 0 && showBulkActions && (
                  <div className="absolute top-12 w-56 -right-12 bg-white shadow-lg rounded-md z-50 border">
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => setShowBulkTagDialog(true)}>
                        Apply tag
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { }}>
                        Add to broadcast list
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => setShowBulkAssignDialog(true)}>
                        Assign to
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { }}>
                        Unassign chats
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500" onClick={() => setShowBulkDeleteDialog(true)}>
                        Delete chats
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search bar */}
            <div className="p-2 border-b">
              <div className="flex items-center gap-2">
                {searchQuery.trim().length > 0 && (
                  <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")} className="p-1">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn("pl-10", searchQuery.trim().length > 0 ? "flex-1" : "w-full")}
                  />
                </div>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {/* New conversation indicator */}
              {selectedContact && (
                <div
                  className="flex items-center border-b p-3 cursor-pointer hover:bg-gray-50 bg-primary/5"
                  onClick={() => {
                    console.log('Clicking on new conversation with contact:', selectedContact);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <div className="relative mr-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedContact.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{selectedContact.name}</h3>
                      <Badge variant="secondary" className="ml-2 text-xs bg-primary text-primary-foreground">New</Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">Start conversation</p>
                  </div>
                </div>
              )}

              {/* Existing conversations */}
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "flex items-center border-b p-3 cursor-pointer hover:bg-gray-50",
                    activeConversation?.id === conversation.id && !isBulkSelectMode ? "bg-accent" : "",
                    selectedConversations.includes(conversation.id) && "bg-green-50"
                  )}
                  onClick={() => {
                    if (isBulkSelectMode) {
                      toggleConversationSelection(conversation.id);
                    } else {
                      console.log('Selecting conversation with contact:', conversation.contact);
                      if (!conversation.contact?.id) {
                        // If contact ID is missing, fetch complete conversation data
                        fetchConversationDetails(conversation.id);
                      }
                      setActiveConversation(conversation);
                      setSelectedContact(null);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                >
                  {/* Contact Avatar with Selection */}
                  <div className="relative mr-3">
                    {isBulkSelectMode ? (
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center border-2",
                        selectedConversations.includes(conversation.id)
                          ? "border-primary -500 bg-green-100"
                          : "border-gray-200 bg-gray-100"
                      )}>
                        {selectedConversations.includes(conversation.id) && (
                          <IoMdCheckmark className="h-5 w-5  text-primary -500" />
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gray-200 text-gray-700">
                            {conversation.contact.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.contact.whatsappOptIn && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{conversation.contact.name}</h3>
                      <span className="text-xs text-gray-500">{formatMessageTime(conversation.lastMessageAt)}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {conversation.labels && conversation.labels.length > 0 && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] h-4 px-1.5",
                            `bg-${labels.find(l => l.id === conversation.labels[0])?.color || "blue"}-100 text-${labels.find(l => l.id === conversation.labels[0])?.color || "blue"}-800`
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

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate max-w-[160px]">
                        {conversation.lastMessageType === "image" ? (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            Photo
                          </span>
                        ) : conversation.lastMessageType === "video" ? (
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            Video
                          </span>
                        ) : conversation.lastMessageType === "document" ? (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Document
                          </span>
                        ) : conversation.lastMessageType === "template" ? (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Template
                          </span>
                        ) : (
                          conversation.lastMessage
                        )}
                      </p>

                      <div className="flex items-center gap-1">
                        {conversation.isWithin24Hours && (
                          <Zap className="h-3 w-3 text-green-500" />
                        )}
                        {conversation.unreadCount > 0 && (
                          <div className="flex items-center justify-center bg-green-500 text-white text-xs h-5 min-w-5 px-1.5 rounded-full">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredConversations.length === 0 && !selectedContact && (
                <div className="text-center py-10 px-4">
                  {getActiveFilterCount() > 0 ? (
                    <>
                      <div className="bg-muted p-4 rounded-full w-fit mx-auto mb-4">
                        <Filter className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-foreground mb-1">No conversations match filters</h3>
                      <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters to see more results</p>
                      <Button
                        onClick={resetFilters}
                        size="sm"
                        variant="outline"
                      >
                        Clear Filters
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="bg-muted p-4 rounded-full w-fit mx-auto mb-4">
                        <MessageSquare className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-foreground mb-1">No conversations</h3>
                      <p className="text-muted-foreground text-sm mb-4">Start your first conversation</p>
                      <Button
                        onClick={() => setShowContactDialog(true)}
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Chat
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>


            {/* Context Menu for Bulk Actions */}

          </div>

          {/* Chat Area */}
          {(activeConversation || selectedContact) ? (
            <div className="flex-1  flex flex-col">

              {/* Chat Header */}
              <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden mr-1"
                    onClick={() => setIsMobileMenuOpen(true)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>

                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {getCurrentChatTitle().charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h2 className="font-medium text-foreground">{getCurrentChatTitle()}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Circle className={cn(
                          "h-2 w-2",
                          activeConversation?.status === 'active' && "fill-green-500 text-green-500",
                          activeConversation?.status === 'pending' && "fill-amber-500 text-amber-500",
                          activeConversation?.status === 'resolved' && "fill-blue-500 text-blue-500",
                          activeConversation?.status === 'closed' && "fill-slate-500 text-slate-500",
                          !activeConversation && "fill-green-500 text-green-500"
                        )} />
                        {selectedContact ? 'New Conversation' :
                          activeConversation?.status === 'active' ? 'Active' :
                            activeConversation?.status === 'closed' ? 'Closed' :
                              activeConversation?.status === 'resolved' ? 'Resolved' : 'Pending'}
                      </span>

                      {getCurrentContact()?.tags && getCurrentContact()?.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1  max-w-[200px]">
                          {getCurrentContact()?.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs h-5 px-1.5 bg-primary/10 text-primary border-primary/20"
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

                <div className="flex items-center  gap4">
                  {activeConversation?.assignedTo ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge
                          variant="outline"
                          className="h-8 border-primary border  cursor-pointer"
                        >
                          <User className="h-3 w-3" />
                          {teamMembers.find(u => u.id === activeConversation.assignedTo)?.name.split(' ')[0] || 'Agent'}
                          <ChevronDown className="h-3 w-3 ml-0.5" />
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="cursor-pointer">
                            <UserPlus className="h-4 w-4 mr-2" />
                            <span>Reassign to</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {teamMembers.map(member => (
                              <DropdownMenuItem
                                key={member.id}
                                onClick={() => assignConversation(member.id)}
                                className="cursor-pointer"
                              >
                                <div className="flex items-center w-full">
                                  <User className="h-4 w-4 mr-2" />
                                  <span>{member.name}</span>
                                  {member.id === activeConversation.assignedTo && (
                                    <Check className="h-4 w-4 ml-auto" />
                                  )}
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => assignConversation('')}
                          className="text-red-600 cursor-pointer"
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
                          className="text-xs h-5 px-1.5 bg-gray-50 text-gray-600 border-gray-200 cursor-pointer hover:bg-gray-100 flex items-center gap-1"
                        >
                          <UserPlus className="h-3 w-3" />
                          Assign
                          <ChevronDown className="h-3 w-3 ml-0.5" />
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {teamMembers.map(member => (
                          <DropdownMenuItem
                            key={member.id}
                            onClick={() => assignConversation(member.id)}
                            className="cursor-pointer"
                          >
                            <User className="h-4 w-4 mr-2" />
                            <span>{member.name}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <div className='flex items-center gap-2 ml-4'>
                    {/* Add Tag Button */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="cursor-pointer" asChild>

                        <Tag className="h-4 w-4 scale-125 text-primary" />

                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {/* Existing contact tags to toggle */}
                        {getCurrentContact()?.tags && getCurrentContact()?.tags.map((tag, index) => (
                          <DropdownMenuCheckboxItem
                            key={index}
                            checked={true}
                            onCheckedChange={() => handleRemoveTag(tag)}
                          >
                            {tag}
                          </DropdownMenuCheckboxItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowAddTagDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Tag
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Chat Actions Dropdown - enhanced UI */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild className="cursor-pointer">

                        <MoreVertical className="h-4 scale-125 text-primary" />

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

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer rounded-full"
                            onClick={() => setShowInfoPanel(true)}
                          >
                            <FaRegUserCircle className='scale-125 text-primary' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Contact info</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              {/* Messages Area - keeping the existing styling for the chat area */}
              <ScrollArea style={{ backgroundImage: "url('/bg.png')" }} className="flex-1 object-contain h-[300px] p-4 ">
                <div className="space-y-4 max-w-7xl mx-auto">
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


                        {/* Messages for this date */}
                        {dateMessages.map((message) => {
                          // For system messages (assignments, status changes, notes)
                          if (message.messageType === 'system' || message.messageType === 'note') {
                            return (
                              <div key={message.id} className="flex justify-center">
                                <div className="bg-[#e1dfe1] px-3 py-1.5 rounded-xl text-xs text-muted-foreground max-w-[80%] text-center">
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
                                    "px-2 py-3 rounded-lg relative",
                                    message.senderId === "agent"
                                      ? "bg-[#eafeef] text-black rounded-br-none"
                                      : "bg-card text-card-foreground rounded-bl-none"
                                  )}
                                >
                                  {/* Message Tail */}


                                  {/* Message Tail */}
                                  <div
                                    className={cn(
                                      "absolute w-[20px] h-[20px] rounded-[10px] bottom-[7px]",
                                      message.senderId === "agent"
                                        ? "right-[-14px]"
                                        : "left-[-14px]"
                                    )}
                                    style={{
                                      boxShadow: message.senderId === "agent"
                                        ? 'rgb(234, 254, 239) -6px 6px 0px 0px' // Negative x-offset for right-side tail
                                        : 'rgb(255, 255, 255) 6px 6px 0px 0px',  // Positive x-offset for left-side tail
                                      backgroundColor: 'transparent',
                                      cursor: 'auto'
                                    }}
                                  />


                                  {/* Handle different message types */}
                                  {message.messageType === 'text' && (
                                    <div className="flex gap-8">
                                      <p className="text-sm">{message.content}</p>
                                      <div className={cn(
                                        "flex items-center mt-3 gap-1 text-xs text-muted-foreground opacity-70",
                                        message.senderId === "agent" ? "justify-end" : "justify-start"
                                      )}>
                                        <span>{formatFullMessageTime(message.timestamp)}</span>
                                        {message.senderId === "agent" && getStatusIcon(message.status)}
                                      </div>
                                    </div>
                                  )}

                                  {message.messageType === 'image' && (
                                    <div className="space-y-2 p-0 w-64 max-h-[200px] h-full object-cover">
                                      <img
                                        src={message.mediaUrl}
                                        alt={message.mediaCaption || "Image"}
                                        className="rounded-md w-full max-h-[200px] h-full object-cover cursor-pointer"
                                        onClick={() => setSelectedImageUrl(message.mediaUrl)}
                                      />
                                      {message.mediaCaption && (
                                        <p className="text-sm">{message.mediaCaption}</p>
                                      )}
                                    </div>
                                  )}

                                  {message.messageType === 'video' && (
                                    <div className="space-y-2">
                                      <video
                                        src={message.mediaUrl}
                                        controls
                                        className="rounded-md max-w-full max-h-[300px]"
                                      />
                                      {message.mediaCaption && (
                                        <p className="text-sm">{message.mediaCaption}</p>
                                      )}
                                    </div>
                                  )}

                                  {message.messageType === 'audio' && (
                                    <div className="space-y-2">
                                      <audio
                                        src={message.mediaUrl}
                                        controls
                                        className="w-64"
                                      />
                                      {message.mediaCaption && (
                                        <p className="text-sm">{message.mediaCaption}</p>
                                      )}
                                    </div>
                                  )}

                                  {message.messageType === 'document' && (
                                    <div className="space-y-2">
                                      <a
                                        href={message.mediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-3 bg-accent/50 rounded-md hover:bg-accent"
                                      >
                                        <FileText className="h-6 w-6 mr-2 text-primary" />
                                        <div>
                                          <p className="text-sm font-medium">
                                            {message.mediaCaption || message.mediaUrl?.split('/').pop() || "Document"}
                                          </p>
                                          <p className="text-xs text-muted-foreground">Click to open</p>
                                        </div>
                                      </a>
                                    </div>
                                  )}

                                  {message.templateName && (
                                    <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                                      <FileText className="h-3 w-3" />
                                      Template: {message.templateName}
                                    </div>
                                  )}
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

              {/* Message Input - enhanced UI */}
              <div className="bg-gradient-to-r from-card to-card/90 border-t shadow-sm px-4 py-3">
                {isWithin24Hours() ? (
                  <div className="flex items-end gap-3 max-w-4xl mx-auto">
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-full h-10 w-10 bg-accent hover:bg-accent/80 text-accent-foreground transition-all"
                                >
                                  <Paperclip className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-56 p-2">
                                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md focus:bg-accent">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <ImageIcon className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">Photo or Video</p>
                                    <p className="text-xs text-muted-foreground">Send media files</p>
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md focus:bg-accent mt-1">
                                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-orange-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">Document</p>
                                    <p className="text-xs text-muted-foreground">Share files</p>
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setShowTemplateDialog(true)}
                                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md focus:bg-accent mt-1"
                                >
                                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">Template</p>
                                    <p className="text-xs text-muted-foreground">Use saved templates</p>
                                  </div>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TooltipTrigger>
                          <TooltipContent side="top">Attach files</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex-1 relative">
                      <Textarea
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="min-h-[48px] max-h-32 resize-none pr-12 py-3 pl-4 rounded-2xl bg-white shadow-sm border-muted focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                        rows={1}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full hover:bg-accent/50"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          >
                            <Smile className={`h-5 w-5 ${showEmojiPicker ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground transition-colors`} />
                          </Button>

                          {showEmojiPicker && (
                            <div className="absolute bottom-10 right-0 z-50">
                              <div
                                className="fixed inset-0"
                                onClick={() => setShowEmojiPicker(false)}
                              ></div>
                              <div className="relative z-50 shadow-lg rounded-lg border border-border">
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
                          )}
                        </div>
                      </div>
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={sendMessage}
                            disabled={!messageInput.trim() || isSending}
                            size="icon"
                            className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 transition-all shadow-md disabled:opacity-70"
                          >
                            {isSending ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                            ) : (
                              <Send className="h-5 w-5 ml-0.5" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Send message</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ) : (
                  <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 shadow-sm overflow-hidden h-fit  mx-auto">
                    <CardContent className="p-0">
                      <div className="flex items-start">
                        <div className="bg-amber-200/60 p-5 ml-2 flex items-center rounded-full justify-center">
                          <AlertCircle className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="flex-1 p-4">
                          <h4 className="font-medium text-amber-900 mb-1 text-lg">
                            24-hour messaging window expired
                          </h4>
                          <p className="text-amber-700 text-sm mb-4 leading-relaxed">
                            For WhatsApp policy compliance, you can only send pre-approved message templates
                            when the 24-hour conversation window has expired.
                          </p>
                          <Button
                            onClick={() => setShowTemplateDialog(true)}
                            variant="outline"
                            className="border-amber-300 cursor-pointer bg-amber-100 text-amber-800 hover:bg-amber-200 px-4 py-2 h-auto shadow-sm"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Choose Template
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background to-accent/5">
              <div className="text-center p-8 max-w-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  No conversation selected
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Choose a conversation from the sidebar or start a new one
                </p>
                <Button
                  onClick={() => setShowContactDialog(true)}
                  className="h-11 px-6 rounded-lg font-medium shadow-sm"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Start conversation
                </Button>
              </div>
            </div>
          )}



          {/* Contact Info Side Panel - enhanced with Card components */}
          <Sheet open={showInfoPanel} onOpenChange={setShowInfoPanel}>
            <SheetContent className="w-[350px] h-full sm:w-[400px] p-0 overflow-y-scroll">
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

          {/* Template Selection Dialog - modernized with improved preview */}
          {/* Template Selection Dialog - improved with better preview */}
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Choose Message Template</DialogTitle>
                <DialogDescription>
                  Select an approved template to send to your customer
                </DialogDescription>
              </DialogHeader>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  className="pl-10"
                />
              </div>

              {/* Template list and preview side by side */}
              <div className="flex gap-4 h-[350px]">
                {/* Templates list - single column */}
                <ScrollArea className="w-1/2 pr-2 border-r">
                  <div className="space-y-2 pb-2">
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
                            "p-3 border rounded-md cursor-pointer transition-all",
                            selectedTemplate?.id === template.id
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50 hover:bg-accent/20"
                          )}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{template.category}</Badge>
                                {hasVariables && (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                    Variables
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">{template.language}</Badge>
                          </div>
                        </div>
                      );
                    })}

                    {templates.length === 0 && (
                      <div className="text-center py-8">
                        <div className="bg-muted p-4 rounded-full w-fit mx-auto mb-4">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-foreground mb-2">No templates</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          No templates available
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Active template preview */}
                <div className="w-1/2">
                  {selectedTemplate ? (
                    <div className="h-full flex flex-col">
                      <div className="bg-muted/40 rounded-md p-3 mb-2 flex items-center justify-between">
                        <h4 className="font-medium text-sm">Template Preview</h4>
                        <Badge variant="secondary" className="text-xs">
                          {selectedTemplate.language}
                        </Badge>
                      </div>
                      <ScrollArea className="flex-1 border rounded-md p-4 bg-white">
                        <div className="space-y-4">
                          {/* Template header if exists */}
                          {selectedTemplate.components?.find(c => c.type === 'header') && (
                            <div className="font-medium">
                              {selectedTemplate.components?.find(c => c.type === 'header')?.format === 'TEXT' &&
                                selectedTemplate.components?.find(c => c.type === 'header')?.text}
                              {selectedTemplate.components?.find(c => c.type === 'header')?.format === 'IMAGE' && (
                                <div className="text-center p-2 bg-blue-50 rounded border border-blue-100 text-blue-700">
                                  <ImageIcon className="h-4 w-4 mx-auto mb-1" />
                                  <span className="text-xs">Image Header</span>
                                </div>
                              )}
                              {selectedTemplate.components?.find(c => c.type === 'header')?.format === 'VIDEO' && (
                                <div className="text-center p-2 bg-purple-50 rounded border border-purple-100 text-purple-700">
                                  <Video className="h-4 w-4 mx-auto mb-1" />
                                  <span className="text-xs">Video Header</span>
                                </div>
                              )}
                              {selectedTemplate.components?.find(c => c.type === 'header')?.format === 'DOCUMENT' && (
                                <div className="text-center p-2 bg-amber-50 rounded border border-amber-100 text-amber-700">
                                  <FileText className="h-4 w-4 mx-auto mb-1" />
                                  <span className="text-xs">Document Header</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Template body - highlight variables */}
                          <div className="text-sm">
                            {selectedTemplate.components?.find(c => c.type === 'body')?.text?.split(/(\{\{[^}]+\}\})/).map((part, index) => {
                              if (part.match(/\{\{[^}]+\}\}/)) {
                                return (
                                  <span key={index} className="bg-blue-100 text-blue-800 px-1 rounded">
                                    {part}
                                  </span>
                                );
                              }
                              return <span key={index}>{part}</span>;
                            }) || 'No body content available'}
                          </div>

                          {/* Template footer if exists */}
                          {selectedTemplate.components?.find(c => c.type === 'footer') && (
                            <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                              {selectedTemplate.components?.find(c => c.type === 'footer')?.text}
                            </div>
                          )}

                          {/* Template buttons if exist */}
                          {selectedTemplate.components?.some(c => c.type === 'buttons') && (
                            <div className="pt-2 mt-2 border-t">
                              <Button variant="outline" className="w-full justify-center text-center h-8 text-xs" disabled>
                                Example Button
                              </Button>
                            </div>
                          )}
                        </div>
                      </ScrollArea>

                      {/* Variable requirements */}
                      {selectedTemplate.components?.some(comp =>
                        (comp.type === 'body' && comp.text?.includes('{{')) ||
                        (comp.type === 'header' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(comp.format || ''))
                      ) && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-100 text-xs text-blue-700">
                            <div className="flex items-center">
                              <Info className="h-3.5 w-3.5 mr-1.5" />
                              This template requires variable values to be entered before sending
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center border rounded-md bg-muted/20">
                      <div className="text-center p-4">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">
                          Select a template to preview
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-4">
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

          {/* Replace your existing Bulk Tag Dialog with this implementation */}
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
            <DialogOverlay className="backdrop-blur-xs" />
            <DialogContent className="backdrop-blur-2xl ">
              <DialogHeader>
                <DialogTitle>Filter Conversations</DialogTitle>
                <DialogDescription>
                  Set filters to find specific conversations
                </DialogDescription>
              </DialogHeader>
              <Separator className="my-1" />
              <div className="space-y-4 py-2 max-h-[60vh] -mt-3  overflow-y-auto pr-2">
                <div className="flex items-center justify-between">
                  {/* <h4 className="font-medium">Active Filters</h4> */}
                  {getActiveFilterCount() > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="h-7 px-2 text-xs"
                    >
                      Reset All
                    </Button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="space-y-2 -mt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Status</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['active', 'pending', 'resolved', 'closed'].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={filters.status.includes(status)}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              status: checked
                                ? [...prev.status, status]
                                : prev.status.filter(s => s !== status)
                            }));
                          }}
                        />
                        <label
                          htmlFor={`status-${status}`}
                          className="text-sm font-medium capitalize leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Assignment Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assignment</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
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
                        className="text-sm font-medium leading-none"
                      >
                        Unassigned
                      </label>
                    </div>
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2">
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
                          className="text-sm font-medium leading-none"
                        >
                          {member.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Labels Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Labels</label>
                  <div className="space-y-2">
                    {labels.map((label) => (
                      <div key={label.id} className="flex items-center space-x-2">
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
                          className="text-sm font-medium leading-none flex items-center gap-2"
                        >
                          <div className={`w-3 h-3 rounded-full bg-${label.color}-500`}></div>
                          {label.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Message Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Message Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['text', 'image', 'video', 'document', 'audio', 'template'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={filters.messageType.includes(type)}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              messageType: checked
                                ? [...prev.messageType, type]
                                : prev.messageType.filter(t => t !== type)
                            }));
                          }}
                        />
                        <label
                          htmlFor={`type-${type}`}
                          className="text-sm font-medium capitalize leading-none"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Date Range Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                  >
                    <SelectTrigger className="w-full">
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

                <Separator />

                {/* Sort Options */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <div className="flex gap-2">
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                    >
                      <SelectTrigger className="flex-1">
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
                    >
                      {filters.sortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Toggle Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Filters</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="unread-only"
                        checked={filters.unreadOnly}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, unreadOnly: checked || false }))}
                      />
                      <label
                        htmlFor="unread-only"
                        className="text-sm font-medium leading-none flex items-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Unread Only
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="within-24h"
                        checked={filters.within24Hours}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, within24Hours: checked || false }))}
                      />
                      <label
                        htmlFor="within-24h"
                        className="text-sm font-medium leading-none flex items-center gap-2"
                      >
                        <Zap className="h-4 w-4" />
                        Within 24 Hours
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has-media"
                        checked={filters.hasMedia}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasMedia: checked || false }))}
                      />
                      <label
                        htmlFor="has-media"
                        className="text-sm font-medium leading-none flex items-center gap-2"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Has Media
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has-notes"
                        checked={filters.hasNotes}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasNotes: checked || false }))}
                      />
                      <label
                        htmlFor="has-notes"
                        className="text-sm font-medium leading-none flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Has Notes
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
                <Button onClick={() => setShowFilterDialog(false)}>
                  Apply Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Image Preview Dialog */}
          <Dialog open={!!selectedImageUrl} onOpenChange={(open) => !open && setSelectedImageUrl(null)}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white"
                    onClick={() => setSelectedImageUrl(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-center bg-black/10 p-2">
                  <img
                    src={selectedImageUrl || ''}
                    alt="Preview"
                    className="max-h-[80vh] max-w-full object-contain"
                  />
                </div>
              </div>
              <DialogFooter className="p-3 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedImageUrl || '', '_blank')}
                >
                  <span className="flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Original
                  </span>
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
                  <span className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </span>
                </Button>
              </DialogFooter>
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
          <TemplateVariablesDialog />
        </div>
      </div>
    </Layout>
  );

  function ContactInfoPanel() {
    const contact = getCurrentContact();
    if (!contact) return null;

    return (
      <div className="space-y-6 p-6">
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
                <Button variant="ghost" size="sm" className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
            <h4 className="font-medium  flex items-center gap-2 text-primary">
              <Tag className="h-4 w-4" />
              Tags
            </h4>
            <Button variant="outline" size="sm" className="h-7 px-2.5 border-dashed border-primary/50 text-primary hover:bg-primary/10">
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
                  className="bg-accent/30 hover:bg-accent/50 border-border/80 transition-colors py-1 px-2.5 cursor-pointer group"
                >
                  {tag}
                  <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
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
            <h4 className="font-medium text-foreground flex items-center gap-2 text-primary">
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
