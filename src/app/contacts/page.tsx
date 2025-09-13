"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  Tag,
  User,
  Upload,
  Download,
  UserPlus,
  Info,
  Check,
  X,
  MoreHorizontal,
  Calendar,
  Globe,
  Columns,
  ChevronDown,
  Copy,
  CheckCheck,
  FilterX,
  UserCog,
  Clock,
  BarChart2,
  TextQuote,
  Hash,
  CalendarDays,
  ListFilter,
  ChevronUp,
  Sparkles,
  TrendingUp,
  Activity,
  Target,
  Users,
  Eye,
  Layers,
  BarChart3,
  Settings,
  Crown,
  Star,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  Gauge
} from "lucide-react";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { CreditCard, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AudienceFilter from "@/components/filters/AudienceFilter";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ImportMappingDialog from "@/components/contacts/importMappingDialog";

type FieldType = 'Text' | 'Number' | 'Date' | 'Dropdown';

interface CustomField {
  id: string;
  name: string;
  key: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  defaultValue?: any;
  active: boolean;
  createdAt: string;
}

interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  contactCount: number;
  color: string;
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsappOptIn: boolean;
  tags: string[];
  notes?: string;
  lastMessageAt?: string;
  isActive: boolean;
  createdAt: string;
  userId?: string;
  countryCode?: string;
  isSpam?: boolean;
  sourceId?: string;
  sourceUrl?: string;
  source?: string;
  customFields?: Record<string, any>;
}

interface WabaAccount {
  wabaId: string;
  businessName: string;
  phoneNumber: string;
  phoneNumberId: string;
}

interface ColumnVisibility {
  id: boolean;
  userId: boolean;
  phone: boolean;
  email: boolean;
  name: boolean;
  tags: boolean;
  createdAt: boolean;
  countryCode: boolean;
  whatsappOptIn: boolean;
  isSpam: boolean;
  sourceId: boolean;
  sourceUrl: boolean;
  source: boolean;
  lastMessageAt: boolean;
  actions: boolean;
  [key: string]: boolean; // For dynamic custom field columns
}


// Add this interface after the existing interfaces
interface UserSubscription {
  plan: string;
  status: 'active' | 'expired' | 'cancelled';
  endDate?: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false);
  const [isEditTagDialogOpen, setIsEditTagDialogOpen] = useState(false);
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = useState(false);
  const [selectedWabaId, setSelectedWabaId] = useState<string>("");
  const [wabaAccounts, setWabaAccounts] = useState<WabaAccount[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newTag, setNewTag] = useState("");
  const [oldTag, setOldTag] = useState("");
  const [updatedTag, setUpdatedTag] = useState("");
  const { toast } = useToast();
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customFieldFilters, setCustomFieldFilters] = useState<Record<string, any>>({});
  const [isAudienceFilterVisible, setIsAudienceFilterVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Add these new state variables
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
  const [isAddToGroupDialogOpen, setIsAddToGroupDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    countryCode: "+91",
    email: "",
    tags: "",
    notes: "",
    whatsappOptIn: true, // Add this field
    customFields: {} as Record<string, any>
  });

  const [editContact, setEditContact] = useState({
    id: "",
    name: "",
    phone: "",
    countryCode: "",
    email: "",
    tags: "",
    notes: "",
    whatsappOptIn: true, // Add this field
    customFields: {} as Record<string, any>
  });


  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    id: false,
    userId: false,
    phone: true,
    email: true,
    name: true,
    tags: true,
    createdAt: true,
    countryCode: false,
    whatsappOptIn: true,
    isSpam: false,
    sourceId: false,
    sourceUrl: false,
    source: false,
    lastMessageAt: false,
    actions: true
  });

  // const fileInputRef = useRef<HTMLInputElement>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [isAudienceFilterActive, setIsAudienceFilterActive] = useState(false);
  // Inside the ContactsPage component, add these new state variables
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  // Add these state variables after the existing state variables
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);

  // Add this function to fetch user subscription status
  const fetchUserSubscription = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.user) {
        setUserSubscription(data.user.subscription);
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  // Add this useEffect to fetch subscription status on component mount
  useEffect(() => {
    fetchUserSubscription();
  }, []);


  useEffect(() => {
    fetchWabaAccounts();
    fetchCustomFields();
  }, []);

  useEffect(() => {
    if (selectedWabaId && !isAudienceFilterActive) {
      fetchContacts();
    }
  }, [selectedWabaId, searchQuery, statusFilter, tagFilter, customFieldFilters, isAudienceFilterActive]);
  // Extract all unique tags from contacts
  useEffect(() => {
    const tags = new Set<string>();
    contacts.forEach(contact => {
      contact.tags.forEach(tag => tags.add(tag));
    });
    setAllTags(Array.from(tags));
  }, [contacts]);

  // Update column visibility when custom fields change
  useEffect(() => {
    const customFieldColumns = customFields.reduce((acc, field) => ({
      ...acc,
      [`customField_${field.key}`]: false
    }), {});

    setColumnVisibility(prev => ({
      ...prev,
      ...customFieldColumns
    }));
  }, [customFields]);

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

  const fetchCustomFields = async () => {
    try {
      const response = await fetch('/api/custom-fields');
      const data = await response.json();

      if (data.success) {
        setCustomFields(data.fields);
      }
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      toast({
        title: "Error",
        description: "Failed to fetch custom fields",
        variant: "destructive",
      });
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone || !selectedWabaId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const missingRequiredFields = customFields
      .filter(field => field.required)
      .filter(field => {
        const value = newContact.customFields?.[field.key];
        return value === undefined || value === null || value === '';
      });

    if (missingRequiredFields.length > 0) {
      toast({
        title: "Error",
        description: `Please fill in required fields: ${missingRequiredFields.map(f => f.name).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const customFieldsWithDefaults = { ...newContact.customFields };

      customFields.forEach(field => {
        if (
          (customFieldsWithDefaults[field.key] === undefined ||
            customFieldsWithDefaults[field.key] === '') &&
          field.defaultValue
        ) {
          customFieldsWithDefaults[field.key] = field.defaultValue;
        }
      });

      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newContact,
          wabaId: selectedWabaId,
          tags: newContact.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          customFields: customFieldsWithDefaults
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Contact added successfully",
        });
        setIsAddDialogOpen(false);
        setNewContact({
          name: "",
          phone: "",
          countryCode: "+91",
          email: "",
          whatsappOptIn: true, // Reset to default
          tags: "",
          notes: "",
          customFields: {}
        });
        fetchContacts();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add contact",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      });
    }
  };

  const handleEditContact = async () => {
    if (!editContact.name || !editContact.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    const missingRequiredFields = customFields
      .filter(field => field.required)
      .filter(field => {
        const value = editContact.customFields?.[field.key];
        return value === undefined || value === null || value === '';
      });

    if (missingRequiredFields.length > 0) {
      toast({
        title: "Error",
        description: `Please fill in required fields: ${missingRequiredFields.map(f => f.name).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Process tags
      let tagsArray = editContact.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const response = await fetch(`/api/contacts/${editContact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editContact.name,
          phone: editContact.phone,
          countryCode: editContact.countryCode,
          email: editContact.email,
          whatsappOptIn: editContact.whatsappOptIn, // This should now be correctly sent
          tags: tagsArray,
          notes: editContact.notes,
          customFields: editContact.customFields || {}
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Contact updated successfully",
        });
        setIsEditDialogOpen(false);
        fetchContacts();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update contact",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Contact deleted successfully",
        });
        setIsDeleteConfirmDialogOpen(false);
        setSelectedContact(null);
        fetchContacts();
        setSelectedContacts(prev => prev.filter(id => id !== contactId));
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete contact",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMultipleContacts = async () => {
    try {
      const response = await fetch(`/api/contacts/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactIds: selectedContacts
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: `${selectedContacts.length} contacts deleted successfully`,
        });
        setIsDeleteConfirmDialogOpen(false);
        fetchContacts();
        setSelectedContacts([]);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete contacts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting multiple contacts:', error);
      toast({
        title: "Error",
        description: "Failed to delete contacts",
        variant: "destructive",
      });
    }
  };

  const handleAddTag = async () => {
    if (!newTag || !selectedContact) return;

    try {
      const response = await fetch(`/api/contacts/${selectedContact.id}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tag: newTag.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Tag added successfully",
        });
        setIsAddTagDialogOpen(false);
        setNewTag("");
        fetchContacts();

        if (selectedContact && data.contact.id === selectedContact.id) {
          setSelectedContact(data.contact);
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add tag",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding tag:', error);
      toast({
        title: "Error",
        description: "Failed to add tag",
        variant: "destructive",
      });
    }
  };

  const handleEditTag = async () => {
    if (!oldTag || !updatedTag || !selectedContact) return;

    try {
      await fetch(`/api/contacts/${selectedContact.id}/tags/${encodeURIComponent(oldTag)}`, {
        method: 'DELETE',
      });

      const response = await fetch(`/api/contacts/${selectedContact.id}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tag: updatedTag.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Tag updated successfully",
        });
        setIsEditTagDialogOpen(false);
        setOldTag("");
        setUpdatedTag("");
        fetchContacts();

        if (selectedContact && data.contact.id === selectedContact.id) {
          setSelectedContact(data.contact);
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update tag",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating tag:', error);
      toast({
        title: "Error",
        description: "Failed to update tag",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTag = async (contactId: string, tag: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}/tags/${encodeURIComponent(tag)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Tag removed successfully",
        });
        fetchContacts();

        if (selectedContact && data.contact.id === selectedContact.id) {
          setSelectedContact(data.contact);
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to remove tag",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error removing tag:', error);
      toast({
        title: "Error",
        description: "Failed to remove tag",
        variant: "destructive",
      });
    }
  };

  const handleBulkAddTag = async () => {
    if (!newTag || selectedContacts.length === 0) return;

    try {
      const response = await fetch(`/api/contacts/bulk-tag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactIds: selectedContacts,
          tag: newTag.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: `Tag added to ${selectedContacts.length} contacts`,
        });
        setIsAddTagDialogOpen(false);
        setNewTag("");
        fetchContacts();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add tags",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding bulk tags:', error);
      toast({
        title: "Error",
        description: "Failed to add tags",
        variant: "destructive",
      });
    }
  };

  const toggleSelectContact = (id: string) => {
    setSelectedContacts(prev =>
      prev.includes(id)
        ? prev.filter(contactId => contactId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact.id));
    }
  };

  const handleSendMessage = (contactId: string) => {
    window.location.href = `/conversations?contactId=${contactId}`;
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsViewDialogOpen(true);
  };

  const handleEditContactClick = (contact: Contact) => {
    setEditContact({
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      countryCode: contact.countryCode || "",
      email: contact.email || "",
      whatsappOptIn: contact.whatsappOptIn, // Add this
      tags: contact.tags.join(", "),
      notes: contact.notes || "",
      customFields: contact.customFields || {}
    });
    setIsEditDialogOpen(true);
  };

  const handleAddTagClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsAddTagDialogOpen(true);
  };

  const handleEditTagClick = (contact: Contact, tag: string) => {
    setSelectedContact(contact);
    setOldTag(tag);
    setUpdatedTag(tag);
    setIsEditTagDialogOpen(true);
  };

  const handleDeleteContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDeleteConfirmDialogOpen(true);
  };

  const handleToggleColumnVisibility = (column: string) => {
    setColumnVisibility({
      ...columnVisibility,
      [column]: !columnVisibility[column]
    });
  };

  const handleToggleTagFilter = (tag: string) => {
    setTagFilter(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Update the clearAllFilters function to deactivate audience filters
  const clearAllFilters = () => {
    setStatusFilter("all");
    setTagFilter([]);
    setSearchQuery("");
    setCustomFieldFilters({});
    setIsAudienceFilterActive(false); // This will trigger the useEffect to fetch all contacts
  };


  const renderCustomFieldValue = (contact: Contact, field: CustomField) => {
    if (!contact.customFields || contact.customFields[field.key] === undefined) {
      return <span className="text-muted-foreground">—</span>;
    }

    const value = contact.customFields[field.key];

    switch (field.type) {
      case 'Date':
        return value ? format(new Date(value), "MMM dd, yyyy") : "—";
      case 'Dropdown':
        return <Badge variant="outline">{value}</Badge>;
      default:
        return String(value);
    }
  };

  const getCustomFieldIcon = (type: FieldType) => {
    switch (type) {
      case 'Text':
        return <TextQuote className="h-3 w-3 text-muted-foreground" />;
      case 'Number':
        return <Hash className="h-3 w-3 text-muted-foreground" />;
      case 'Date':
        return <CalendarDays className="h-3 w-3 text-muted-foreground" />;
      case 'Dropdown':
        return <ListFilter className="h-3 w-3 text-muted-foreground" />;
      default:
        return <TextQuote className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const visibleColumns = useMemo(() => {
    return Object.entries(columnVisibility)
      .filter(([_, isVisible]) => isVisible)
      .map(([key]) => key);
  }, [columnVisibility]);

  // Update the import click handler
  const handleImportClick = () => {
    if (!selectedWabaId) {
      toast({
        title: "Error",
        description: "Please select a WhatsApp Business Account first",
        variant: "destructive",
      });
      return;
    }
    setIsImportDialogOpen(true);
  };

  // Add this handler for when import is complete
  const handleImportComplete = () => {
    fetchContacts();
    setImportLoading(false);
  };




  const handleExportContacts = async () => {
    if (!selectedWabaId) {
      toast({
        title: "Export Failed",
        description: "Please select a WhatsApp Business Account",
        variant: "destructive",
      });
      return;
    }

    setExportLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('wabaId', selectedWabaId);

      const link = document.createElement('a');
      link.href = `/api/contacts/export?${params}`;
      link.download = `contacts_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Started",
        description: "Your contacts are being downloaded",
      });
    } catch (error) {
      console.error('Error exporting contacts:', error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting contacts",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const traitFields = [
    { label: "Name", key: "name", type: "text" as const },
    { label: "Email", key: "email", type: "text" as const },
    { label: "Phone", key: "phone", type: "text" as const },
    { label: "Last Contact", key: "lastMessageAt", type: "date" as const },
    { label: "Created At", key: "createdAt", type: "date" as const },
  ];

  const customFieldTraits = customFields.map(field => ({
    label: field.name,
    key: `customField.${field.key}`,
    type: field.type.toLowerCase() as "text" | "number" | "date" | "select",
    options: field.options
  }));

  const eventFields = [
    { label: "Message Sent", key: "messageSent", type: "date" as const },
    { label: "Message Received", key: "messageReceived", type: "date" as const }
  ];


  const handleApplyAudienceFilters = (filters: {
    tags: string[];
    conditionGroups: any[];
    groupOperator: "AND" | "OR";
    whatsappOptedIn: boolean;
  }) => {
    console.log('Applying audience filters:', filters);

    // Set audience filter as active to prevent regular fetchContacts
    setIsAudienceFilterActive(true);

    // Clear existing filters
    setSearchQuery("");
    setStatusFilter("all");
    setTagFilter([]);
    setCustomFieldFilters({});

    // Apply the audience filters by calling fetchContacts with the filters
    fetchContactsWithAudienceFilters(filters);
  };


  // Update fetchContactsWithAudienceFilters
  const fetchContactsWithAudienceFilters = async (audienceFilters: any) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedWabaId) params.append('wabaId', selectedWabaId);

      // Add audience filters as a JSON string
      if (audienceFilters) {
        params.append('audienceFilters', JSON.stringify(audienceFilters));
      }

      console.log('Fetching contacts with params:', params.toString());

      const response = await fetch(`/api/contacts?${params}`);
      const data = await response.json();

      if (data.success) {
        console.log(`Received ${data.contacts.length} contacts from API`);
        setContacts(data.contacts);

        // Update local state to reflect the applied filters
        setTagFilter(audienceFilters.tags || []);
        if (audienceFilters.whatsappOptedIn) {
          setStatusFilter("subscribed");
        }

        // Keep audience filter active
        setIsAudienceFilterActive(true);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch contacts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching contacts with audience filters:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  // Update the existing fetchContacts function to handle audience filters
  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedWabaId) params.append('wabaId', selectedWabaId);
      if (searchQuery) params.append('search', searchQuery);

      // Add custom field filters to params (legacy support)
      Object.entries(customFieldFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(`customField.${key}`, String(value));
        }
      });

      const response = await fetch(`/api/contacts?${params}`);
      const data = await response.json();

      if (data.success) {
        let filteredContacts = data.contacts;

        // Apply status filter (client-side for legacy support)
        if (statusFilter !== "all") {
          filteredContacts = data.contacts.filter((contact: Contact) => {
            switch (statusFilter) {
              case "subscribed":
                return contact.whatsappOptIn;
              case "unsubscribed":
                return !contact.whatsappOptIn;
              case "recent":
                return contact.lastMessageAt &&
                  new Date(contact.lastMessageAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              case "inactive":
                return !contact.lastMessageAt ||
                  new Date(contact.lastMessageAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
              default:
                return true;
            }
          });
        }

        // Apply tag filter (client-side for legacy support)
        if (tagFilter.length > 0) {
          filteredContacts = filteredContacts.filter((contact: Contact) => {
            return tagFilter.some(tag => contact.tags.includes(tag));
          });
        }

        setContacts(filteredContacts);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch contacts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Add this new useEffect to fetch contact groups
  useEffect(() => {
    fetchContactGroups();
  }, []);

  // Add this function to fetch contact groups
  const fetchContactGroups = async () => {
    try {
      const response = await fetch('/api/contact-groups');
      const data = await response.json();

      if (data.success) {
        setContactGroups(data.groups);
      }
    } catch (error) {
      console.error('Error fetching contact groups:', error);
    }
  };

  // Add this function to handle adding contacts to a group
  const handleAddToGroup = async () => {
    if (!selectedGroupId || selectedContacts.length === 0) {
      toast({
        title: "Error",
        description: "Please select a group and contacts",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/contact-groups/${selectedGroupId}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactIds: selectedContacts
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: `${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''} added to group successfully`,
        });
        setIsAddToGroupDialogOpen(false);
        setSelectedGroupId("");
        setSelectedContacts([]);
        // Optionally refresh contact groups to update contact counts
        fetchContactGroups();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add contacts to group",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding contacts to group:', error);
      toast({
        title: "Error",
        description: "Failed to add contacts to group",
        variant: "destructive",
      });
    }
  };

  // Calculate stats
  const totalContacts = contacts.length;
  const subscribedContacts = contacts.filter(c => c.whatsappOptIn).length;
  const recentActivity = contacts.filter(c =>
    c.lastMessageAt && new Date(c.lastMessageAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const subscriptionRate = totalContacts > 0 ? Math.round((subscribedContacts / totalContacts) * 100) : 0;


  // Add the subscription loading check
  if (isCheckingSubscription) {
    return (
      <ProtectedRoute resource="contacts" action="read">
        <Layout>
          <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Checking subscription status...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Add the subscription expiration check
  if (userSubscription?.status === 'expired') {
    return (
      <ProtectedRoute resource="contacts" action="read">
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
                  Please renew your subscription to continue accessing the contacts management feature.
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
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <span>Contact management & organization</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                      <Upload className="h-4 w-4 text-green-600" />
                    </div>
                    <span>Bulk import and export features</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                      <Tag className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>Advanced tagging & segmentation</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                      <Filter className="h-4 w-4 text-amber-600" />
                    </div>
                    <span>Custom fields & filtering</span>
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
      </ProtectedRoute>
    );
  }



  return (
    <ProtectedRoute resource="contacts" action="read">
      <Layout>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 wark:from-slate-900 wark:via-slate-800 wark:to-slate-900/50">
            <div className="mx-auto p-6 space-y-8">
              {/* Modern Header Section */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 shadow-sm">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent wark:from-white wark:to-slate-200">
                        Contact Management
                      </h1>
                      <p className="text-slate-600 wark:text-slate-300 font-medium">
                        Organize and manage your WhatsApp contacts effectively
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats Pills */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                        {totalContacts.toLocaleString()} Total
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                        {subscribedContacts} Subscribed
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                        {allTags.length} Tags
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-slate-200 wark:border-slate-700 hover:border-blue-300 wark:hover:border-blue-600 hover:bg-blue-50 wark:hover:bg-blue-900/20"
                    onClick={handleImportClick}
                    disabled={importLoading || !selectedWabaId}
                  >
                    {importLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Import CSV
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-slate-200 wark:border-slate-700 hover:border-green-300 wark:hover:border-green-600 hover:bg-green-50 wark:hover:bg-green-900/20"
                    onClick={handleExportContacts}
                    disabled={exportLoading || !selectedWabaId || contacts.length === 0}
                  >
                    {exportLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Export CSV
                  </Button>

                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Contact
                  </Button>
                </div>
              </div>


              {/* Applied Filters */}
              {(searchQuery || statusFilter !== "all" || tagFilter.length > 0 || Object.values(customFieldFilters).some(v => v)) && (
                <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50 to-white border-amber-200 wark:from-amber-900/10 wark:to-muted/40 wark:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-amber-100 wark:bg-amber-900/30 flex items-center justify-center">
                          <Filter className="h-4 w-4 text-amber-600 wark:text-amber-400" />
                        </div>
                        <span className="text-sm font-semibold text-amber-900 wark:text-amber-300">Active Filters:</span>
                      </div>

                      {searchQuery && (
                        <Badge variant="secondary" className="flex items-center gap-1 bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 shadow-sm">
                          <Search className="h-3 w-3" />
                          {searchQuery}
                          <button
                            onClick={() => setSearchQuery("")}
                            className="ml-1 hover:text-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}

                      {statusFilter !== "all" && (
                        <Badge variant="secondary" className="flex items-center gap-1 bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 shadow-sm">
                          <User className="h-3 w-3" />
                          {statusFilter === "subscribed" ? "Subscribed" :
                            statusFilter === "unsubscribed" ? "Unsubscribed" :
                              statusFilter === "recent" ? "Recently Active" : "Inactive"}
                          <button
                            onClick={() => setStatusFilter("all")}
                            className="ml-1 hover:text-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}

                      {tagFilter.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 shadow-sm">
                          <Tag className="h-3 w-3" />
                          {tag}
                          <button
                            onClick={() => handleToggleTagFilter(tag)}
                            className="ml-1 hover:text-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}

                      {Object.entries(customFieldFilters).map(([key, value]) => {
                        if (!value) return null;
                        const field = customFields.find(f => f.key === key);
                        if (!field) return null;

                        return (
                          <Badge key={key} variant="secondary" className="flex items-center gap-1 bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 shadow-sm">
                            {getCustomFieldIcon(field.type)}
                            {field.name}: {value}
                            <button
                              onClick={() => {
                                setCustomFieldFilters({
                                  ...customFieldFilters,
                                  [key]: ''
                                });
                              }}
                              className="ml-1 hover:text-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-3 text-xs text-amber-700 wark:text-amber-300 hover:bg-amber-100 wark:hover:bg-amber-900/20 border border-amber-200 wark:border-amber-800"
                        onClick={clearAllFilters}
                      >
                        <FilterX className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Filters & Controls */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 p-2 wark:to-slate-900/10">
                <CardContent className="p-2">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          placeholder="Search contacts by name, phone, or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-white wark:bg-slate-800 border-slate-200 wark:border-slate-700 focus:border-primary/50 focus:ring-primary/20 shadow-sm"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={isAudienceFilterVisible ? "default" : "outline"}
                          onClick={() => setIsAudienceFilterVisible(!isAudienceFilterVisible)}
                          className="gap-2 shadow-sm"
                        >
                          <Filter className="h-4 w-4" />
                          {isAudienceFilterVisible ? "Hide Filters" : "Advanced Filters"}
                        </Button>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-36 bg-white wark:bg-slate-800 shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="subscribed">Subscribed</SelectItem>
                            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                            <SelectItem value="recent">Recently Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 shadow-sm">
                              <Tag className="h-4 w-4" />
                              Tags
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <ScrollArea className="h-60">
                              {allTags.length > 0 ? (
                                allTags.map((tag) => (
                                  <DropdownMenuItem
                                    key={tag}
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      handleToggleTagFilter(tag);
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <Checkbox
                                      checked={tagFilter.includes(tag)}
                                      onCheckedChange={() => handleToggleTagFilter(tag)}
                                      id={`tag-${tag}`}
                                    />
                                    <label
                                      htmlFor={`tag-${tag}`}
                                      className="flex-1 cursor-pointer"
                                    >
                                      {tag}
                                    </label>
                                    {tagFilter.includes(tag) && <Check className="h-4 w-4 text-primary" />}
                                  </DropdownMenuItem>
                                ))
                              ) : (
                                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                  No tags available
                                </div>
                              )}
                            </ScrollArea>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                setTagFilter([]);
                              }}
                              className="justify-center font-medium"
                            >
                              Clear Tag Filters
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="gap-2 shadow-sm">
                            <Columns className="h-4 w-4" />
                            Columns
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 max-h-96 overflow-y-auto">
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Toggle Visible Columns</h4>
                            <ScrollArea className="max-h-60">
                              <div className="space-y-2">
                                {Object.entries(columnVisibility)
                                  .filter(([key]) => !key.startsWith('customField_'))
                                  .map(([column, isVisible]) => (
                                    <div key={column} className="flex items-center space-x-2 p-1">
                                      <Checkbox
                                        id={`column-${column}`}
                                        checked={isVisible}
                                        onCheckedChange={() => handleToggleColumnVisibility(column)}
                                      />
                                      <label
                                        htmlFor={`column-${column}`}
                                        className="flex-1 text-sm cursor-pointer"
                                      >
                                        {column === 'id' ? 'ID' :
                                          column === 'userId' ? 'User ID' :
                                            column === 'phone' ? 'Phone Number' :
                                              column === 'email' ? 'Email' :
                                                column === 'name' ? 'Name' :
                                                  column === 'tags' ? 'Tags' :
                                                    column === 'createdAt' ? 'Creation Date' :
                                                      column === 'countryCode' ? 'Country Code' :
                                                        column === 'whatsappOptIn' ? 'WhatsApp Status' :
                                                          column === 'isSpam' ? 'Spam Status' :
                                                            column === 'sourceId' ? 'Source ID' :
                                                              column === 'sourceUrl' ? 'Source URL' :
                                                                column === 'source' ? 'Source' :
                                                                  column === 'lastMessageAt' ? 'Last Message' :
                                                                    'Actions'}
                                      </label>
                                      {isVisible && <Check className="h-4 w-4 text-primary" />}
                                    </div>
                                  ))}

                                {customFields.length > 0 && (
                                  <>
                                    <div className="py-2 text-sm font-semibold border-t">Custom Fields</div>
                                    {customFields.map(field => {
                                      const columnKey = `customField_${field.key}`;
                                      return (
                                        <div key={columnKey} className="flex items-center space-x-2 p-1">
                                          <Checkbox
                                            id={`column-${columnKey}`}
                                            checked={columnVisibility[columnKey] || false}
                                            onCheckedChange={() => handleToggleColumnVisibility(columnKey)}
                                          />
                                          <label
                                            htmlFor={`column-${columnKey}`}
                                            className="flex-1 text-sm cursor-pointer"
                                          >
                                            {field.name}
                                          </label>
                                          {columnVisibility[columnKey] && <Check className="h-4 w-4 text-primary" />}
                                        </div>
                                      );
                                    })}
                                  </>
                                )}
                              </div>
                            </ScrollArea>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <div className="flex items-center gap-1 p-1 bg-slate-100 wark:bg-slate-800 rounded-lg">
                        <Button
                          variant={viewMode === 'table' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('table')}
                          className="h-8 px-3"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                          className="h-8 px-3"
                        >
                          <Layers className="h-4 w-4" />
                        </Button>
                      </div>

                      {selectedContacts.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-primary/5 wark:bg-primary/10 border-primary/20 text-primary shadow-sm">
                              Actions ({selectedContacts.length})
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsAddTagDialogOpen(true)}>
                              <Tag className="mr-2 h-4 w-4" />
                              Add Tag
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsAddToGroupDialogOpen(true)}>
                              <Users className="mr-2 h-4 w-4" />
                              Add to Group
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setIsDeleteConfirmDialogOpen(true)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Selected
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audience Filter Section */}
              <Collapsible
                open={isAudienceFilterVisible}
                onOpenChange={setIsAudienceFilterVisible}
                className="space-y-2"
              >
                <CollapsibleContent>
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 wark:to-slate-900/10">
                    <CardContent className="p-6">
                      <AudienceFilter
                        tags={allTags}
                        traitFields={[...traitFields, ...customFieldTraits]}
                        eventFields={eventFields}
                        onApplyFilters={handleApplyAudienceFilters}
                        initialFilters={{
                          tags: tagFilter,
                          conditionGroups: [],
                          groupOperator: "AND",
                          whatsappOptedIn: statusFilter === "subscribed"
                        }}
                      />
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
              {/* Content */}
              {/* Content */}
              {isLoading ? (
                <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 wark:to-slate-900/10">
                  <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Users className="w-8 h-8 text-primary animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold text-slate-900 wark:text-white">Loading Contacts</h3>
                        <p className="text-sm text-slate-600 wark:text-slate-300">Fetching your contact database...</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 wark:text-slate-400">
                          <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                          <span>This may take a few seconds</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : contacts.length === 0 ? (
                <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 wark:to-slate-900/10">
                  <CardContent className="p-12">
                    <div className="text-center space-y-8">
                      <div className="relative mx-auto w-32 h-32">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                          <Users className="h-16 w-16 text-primary" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center animate-bounce">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                          <Plus className="h-3 w-3 text-white" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-slate-900 wark:text-white">
                          {searchQuery || statusFilter !== "all" || tagFilter.length > 0 || Object.values(customFieldFilters).some(v => v)
                            ? "No contacts match your filters"
                            : "Ready to build your contact database?"
                          }
                        </h3>
                        <p className="text-slate-600 wark:text-slate-300 max-w-md mx-auto leading-relaxed">
                          {searchQuery || statusFilter !== "all" || tagFilter.length > 0 || Object.values(customFieldFilters).some(v => v)
                            ? "Try adjusting your search criteria or filters to find the contacts you're looking for."
                            : "Start building meaningful relationships with your audience by adding your first contact or importing existing contacts."
                          }
                        </p>
                      </div>

                      {!searchQuery && statusFilter === "all" && tagFilter.length === 0 && Object.values(customFieldFilters).every(v => !v) && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                          <Button
                            onClick={() => setIsAddDialogOpen(true)}
                            className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                            size="lg"
                          >
                            <Plus className="h-5 w-5" />
                            Add Your First Contact
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            className="gap-2 border-2 hover:border-primary/50 hover:bg-primary/5"
                            onClick={handleImportClick}
                          >
                            <Upload className="h-5 w-5" />
                            Import Contacts
                          </Button>
                        </div>
                      )}

                      {/* Feature highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-200 wark:border-slate-700">
                        <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800/50">
                          <div className="h-10 w-10 rounded-xl bg-blue-100 wark:bg-blue-900/30 flex items-center justify-center">
                            <Tag className="h-5 w-5 text-blue-600 wark:text-blue-400" />
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-sm text-slate-900 wark:text-white">Smart Tagging</div>
                            <div className="text-xs text-slate-500 wark:text-slate-400">Organize with labels</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800/50">
                          <div className="h-10 w-10 rounded-xl bg-green-100 wark:bg-green-900/30 flex items-center justify-center">
                            <Upload className="h-5 w-5 text-green-600 wark:text-green-400" />
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-sm text-slate-900 wark:text-white">Bulk Import</div>
                            <div className="text-xs text-slate-500 wark:text-slate-400">CSV file support</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800/50">
                          <div className="h-10 w-10 rounded-xl bg-purple-100 wark:bg-purple-900/30 flex items-center justify-center">
                            <Filter className="h-5 w-5 text-purple-600 wark:text-purple-400" />
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-sm text-slate-900 wark:text-white">Advanced Filters</div>
                            <div className="text-xs text-slate-500 wark:text-slate-400">Find contacts easily</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {contacts.map((contact) => (
                        <Card
                          key={contact.id}
                          className="group relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 wark:from-muted/40 wark:to-slate-900/10"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          <CardHeader className="pb-3 relative">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <Checkbox
                                  checked={selectedContacts.includes(contact.id)}
                                  onCheckedChange={() => toggleSelectContact(contact.id)}
                                  className="border-slate-300 wark:border-slate-600"
                                />
                                <Avatar className="h-12 w-12 border-2 border-white wark:border-slate-700 shadow-sm">
                                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                                    {contact.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h3
                                    className="font-semibold text-slate-900 wark:text-white group-hover:text-primary transition-colors cursor-pointer line-clamp-1 text-base"
                                    onClick={() => handleViewContact(contact)}
                                  >
                                    {contact.name}
                                  </h3>
                                  <div className="flex items-center gap-1 text-sm text-slate-600 wark:text-slate-400">
                                    <Phone className="h-3 w-3" />
                                    {contact.phone}
                                  </div>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 wark:hover:bg-slate-800"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleViewContact(contact)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditContactClick(contact)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Contact
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSendMessage(contact.id)}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAddTagClick(contact)}>
                                    <Tag className="h-4 w-4 mr-2" />
                                    Add Tag
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => handleDeleteContactClick(contact)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4 pb-4 relative">
                            <div className="space-y-3">
                              {contact.email && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 wark:text-slate-400">
                                  <div className="h-6 w-6 rounded-lg bg-slate-100 wark:bg-slate-800 flex items-center justify-center">
                                    <Mail className="h-3 w-3" />
                                  </div>
                                  <span className="truncate">{contact.email}</span>
                                </div>
                              )}

                              <div className="flex items-center justify-between p-3 bg-slate-50 wark:bg-slate-800/50 rounded-lg border border-slate-200 wark:border-slate-700">
                                <span className="text-sm font-medium text-slate-700 wark:text-slate-300">WhatsApp Status</span>
                                <Badge
                                  variant="outline"
                                  className={
                                    contact.whatsappOptIn
                                      ? "bg-green-50 text-green-700 border-green-200 wark:bg-green-900/30 wark:text-green-400 wark:border-green-700"
                                      : "bg-red-50 text-red-700 border-red-200 wark:bg-red-900/30 wark:text-red-400 wark:border-red-700"
                                  }
                                >
                                  <div className={`h-2 w-2 rounded-full mr-1 ${contact.whatsappOptIn ? 'bg-green-500' : 'bg-red-500'}`} />
                                  {contact.whatsappOptIn ? "Subscribed" : "Unsubscribed"}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-slate-700 wark:text-slate-300">Tags</span>
                                  {contact.tags.length > 0 && (
                                    <span className="text-xs text-slate-500 wark:text-slate-400">
                                      {contact.tags.length} tag{contact.tags.length > 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {contact.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {contact.tags.length > 3 && (
                                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-slate-100 wark:bg-slate-700 text-slate-600 wark:text-slate-300">
                                      +{contact.tags.length - 3}
                                    </Badge>
                                  )}
                                  {contact.tags.length === 0 && (
                                    <span className="text-xs text-slate-500 wark:text-slate-400 italic">No tags</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 wark:border-slate-700">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-slate-500" />
                                  <span className="text-slate-600 wark:text-slate-400">Last Contact</span>
                                </div>
                                <span className="font-medium text-slate-900 wark:text-white">
                                  {contact.lastMessageAt
                                    ? format(new Date(contact.lastMessageAt), "MMM dd")
                                    : "Never"
                                  }
                                </span>
                              </div>
                            </div>
                          </CardContent>

                          {/* Decorative hover effect */}
                          <div className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110" />
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-0 p-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 wark:to-slate-900/10">
                      <CardContent className="p-0">
                        <div className="overflow-x-auto p-0">
                          {selectedContacts.length > 0 && (
                            <div className="bg-primary/5 wark:bg-primary/10 hover:bg-primary/10 wark:hover:bg-primary/20 font-medium p-4 border-b border-primary/10 wark:border-primary/20 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-primary/10 wark:bg-primary/20 flex items-center justify-center">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="text-primary font-semibold">
                                    {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedContacts([])}
                                  className="text-primary hover:bg-primary/10"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Clear Selection
                                </Button>
                              </div>
                            </div>
                          )}

                          <Table>
                            <TableHeader className="bg-[#D9E6DE] wark:from-slate-800/50 wark:to-slate-900/30">
                              <TableRow className="border-b border-slate-200 wark:border-slate-700">
                                <TableHead className="w-12 px-4">
                                  <Checkbox
                                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                    aria-label="Select all"
                                    className="border-slate-300 wark:border-slate-600"
                                  />
                                </TableHead>
                                {columnVisibility.name && (
                                  <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      Contact
                                    </div>
                                  </TableHead>
                                )}
                                {columnVisibility.phone && (
                                  <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4" />
                                      Phone
                                    </div>
                                  </TableHead>
                                )}
                                {columnVisibility.email && (
                                  <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4" />
                                      Email
                                    </div>
                                  </TableHead>
                                )}
                                {columnVisibility.whatsappOptIn && (
                                  <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                      <MessageSquare className="h-4 w-4" />
                                      Status
                                    </div>
                                  </TableHead>
                                )}
                                {columnVisibility.tags && (
                                  <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                      <Tag className="h-4 w-4" />
                                      Tags
                                    </div>
                                  </TableHead>
                                )}

                                {customFields.map(field =>
                                  columnVisibility[`customField_${field.key}`] && (
                                    <TableHead className="font-semibold text-slate-700 wark:text-slate-300" key={field.id}>
                                      <div className="flex items-center gap-2">
                                        {getCustomFieldIcon(field.type)}
                                        <span>{field.name}</span>
                                      </div>
                                    </TableHead>
                                  )
                                )}

                                {columnVisibility.countryCode && (
                                  <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                      <Globe className="h-4 w-4" />
                                      Country
                                    </div>
                                  </TableHead>
                                )}
                                {columnVisibility.createdAt && (
                                  <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      Created
                                    </div>
                                  </TableHead>
                                )}
                                {columnVisibility.lastMessageAt && (
                                  <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      Last Contact
                                    </div>
                                  </TableHead>
                                )}
                                {columnVisibility.id && <TableHead className="font-semibold text-slate-700 wark:text-slate-300">ID</TableHead>}
                                {columnVisibility.userId && <TableHead className="font-semibold text-slate-700 wark:text-slate-300">User ID</TableHead>}
                                {columnVisibility.isSpam && <TableHead className="font-semibold text-slate-700 wark:text-slate-300">Spam</TableHead>}
                                {columnVisibility.sourceId && <TableHead className="font-semibold text-slate-700 wark:text-slate-300">Source ID</TableHead>}
                                {columnVisibility.sourceUrl && <TableHead className="font-semibold text-slate-700 wark:text-slate-300">Source URL</TableHead>}
                                {columnVisibility.source && <TableHead className="font-semibold text-slate-700 wark:text-slate-300">Source</TableHead>}
                                {columnVisibility.actions && (
                                  <TableHead className="font-semibold text-slate-700 wark:text-slate-300 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Settings className="h-4 w-4" />
                                      Actions
                                    </div>
                                  </TableHead>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {contacts.map((contact, index) => (
                                <TableRow
                                  key={contact.id}
                                  className={`
                      hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent
                      wark:hover:from-slate-800/30 wark:hover:to-transparent
                      transition-all duration-200 group border-b border-slate-100 wark:border-slate-800
                      ${selectedContacts.includes(contact.id) ? 'bg-primary/5 wark:bg-primary/10' : ''}
                    `}
                                >
                                  <TableCell className="px-4">
                                    <Checkbox
                                      checked={selectedContacts.includes(contact.id)}
                                      onCheckedChange={() => toggleSelectContact(contact.id)}
                                      aria-label={`Select ${contact.name}`}
                                      className="border-slate-300 wark:border-slate-600"
                                    />
                                  </TableCell>
                                  {columnVisibility.name && (
                                    <TableCell className="py-3">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-slate-200 wark:border-slate-700 shadow-sm">
                                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {contact.name.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div
                                            className="font-medium text-slate-900 wark:text-white hover:text-primary cursor-pointer transition-colors"
                                            onClick={() => handleViewContact(contact)}
                                          >
                                            {contact.name}
                                          </div>
                                          <div className="text-xs text-slate-500 wark:text-slate-400">
                                            Contact #{index + 1}
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                  )}
                                  {columnVisibility.phone && (
                                    <TableCell>
                                      <div className="flex items-center gap-2 p-2 bg-slate-50 wark:bg-slate-800/30 rounded-lg border border-slate-200 wark:border-slate-700">
                                        <div className="h-6 w-6 rounded bg-green-100 wark:bg-green-900/30 flex items-center justify-center">
                                          <Phone className="h-3 w-3 text-green-600 wark:text-green-400" />
                                        </div>
                                        <span className="text-sm font-mono text-slate-900 wark:text-white">{contact.phone}</span>
                                      </div>
                                    </TableCell>
                                  )}
                                  {columnVisibility.email && (
                                    <TableCell>
                                      {contact.email ? (
                                        <div className="flex items-center gap-2 p-2 bg-slate-50 wark:bg-slate-800/30 rounded-lg border border-slate-200 wark:border-slate-700">
                                          <div className="h-6 w-6 rounded bg-blue-100 wark:bg-blue-900/30 flex items-center justify-center">
                                            <Mail className="h-3 w-3 text-blue-600 wark:text-blue-400" />
                                          </div>
                                          <span className="text-sm text-slate-900 wark:text-white truncate">{contact.email}</span>
                                        </div>
                                      ) : (
                                        <span className="text-sm text-slate-400 wark:text-slate-500 italic">—</span>
                                      )}
                                    </TableCell>
                                  )}
                                  {columnVisibility.whatsappOptIn && (
                                    <TableCell>
                                      <Badge
                                        variant="outline"
                                        className={
                                          contact.whatsappOptIn
                                            ? "bg-green-50 text-green-700 border-green-200 wark:bg-green-900/30 wark:text-green-400 wark:border-green-700"
                                            : "bg-red-50 text-red-700 border-red-200 wark:bg-red-900/30 wark:text-red-400 wark:border-red-700"
                                        }
                                      >
                                        <div className={`h-2 w-2 rounded-full mr-2 ${contact.whatsappOptIn ? 'bg-green-500' : 'bg-red-500'}`} />
                                        {contact.whatsappOptIn ? "Subscribed" : "Unsubscribed"}
                                      </Badge>
                                    </TableCell>
                                  )}
                                  {columnVisibility.tags && (
                                    <TableCell>
                                      <div className="flex flex-wrap gap-1">
                                        {contact.tags.slice(0, 2).map((tag, tagIndex) => (
                                          <Badge key={tagIndex} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                                            {tag}
                                          </Badge>
                                        ))}
                                        {contact.tags.length > 2 && (
                                          <Badge variant="secondary" className="text-xs bg-slate-100 wark:bg-slate-700 text-slate-600 wark:text-slate-300">
                                            +{contact.tags.length - 2}
                                          </Badge>
                                        )}
                                        {contact.tags.length === 0 && (
                                          <span className="text-xs text-slate-400 wark:text-slate-500 italic">No tags</span>
                                        )}
                                      </div>
                                    </TableCell>
                                  )}

                                  {customFields.map(field =>
                                    columnVisibility[`customField_${field.key}`] && (
                                      <TableCell key={field.id}>
                                        {renderCustomFieldValue(contact, field)}
                                      </TableCell>
                                    )
                                  )}

                                  {columnVisibility.countryCode && (
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Globe className="h-3 w-3 text-slate-400" />
                                        <span className="text-sm text-slate-700 wark:text-slate-300">{contact.countryCode || contact.phone.slice(0, 3)}</span>
                                      </div>
                                    </TableCell>
                                  )}
                                  {columnVisibility.createdAt && (
                                    <TableCell>
                                      <div className="text-sm">
                                        <div className="font-medium text-slate-900 wark:text-white">
                                          {format(new Date(contact.createdAt), "MMM dd, yyyy")}
                                        </div>
                                        <div className="text-slate-500 wark:text-slate-400 text-xs">
                                          {format(new Date(contact.createdAt), "HH:mm")}
                                        </div>
                                      </div>
                                    </TableCell>
                                  )}
                                  {columnVisibility.lastMessageAt && (
                                    <TableCell>
                                      <div className="text-sm">
                                        {contact.lastMessageAt ? (
                                          <>
                                            <div className="font-medium text-slate-900 wark:text-white">
                                              {format(new Date(contact.lastMessageAt), "MMM dd, yyyy")}
                                            </div>
                                            <div className="text-slate-500 wark:text-slate-400 text-xs">
                                              {format(new Date(contact.lastMessageAt), "HH:mm")}
                                            </div>
                                          </>
                                        ) : (
                                          <span className="text-slate-400 wark:text-slate-500 italic">Never</span>
                                        )}
                                      </div>
                                    </TableCell>
                                  )}
                                  {columnVisibility.id && (
                                    <TableCell className="font-mono text-xs text-slate-500 wark:text-slate-400">
                                      {contact.id}
                                    </TableCell>
                                  )}
                                  {columnVisibility.userId && (
                                    <TableCell className="font-mono text-xs text-slate-500 wark:text-slate-400">
                                      {contact.userId || "—"}
                                    </TableCell>
                                  )}
                                  {columnVisibility.isSpam && (
                                    <TableCell>
                                      {contact.isSpam ? (
                                        <Badge variant="destructive" className="text-xs">Spam</Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-xs text-slate-500 wark:text-slate-400">Clean</Badge>
                                      )}
                                    </TableCell>
                                  )}
                                  {columnVisibility.sourceId && (
                                    <TableCell className="text-xs text-slate-500 wark:text-slate-400">
                                      {contact.sourceId || "—"}
                                    </TableCell>
                                  )}
                                  {columnVisibility.sourceUrl && (
                                    <TableCell className="text-xs text-slate-500 wark:text-slate-400">
                                      {contact.sourceUrl ? (
                                        <a href={contact.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                                          <div className="flex items-center gap-1">
                                            <span>View</span>
                                            <ArrowUpRight className="h-3 w-3" />
                                          </div>
                                        </a>
                                      ) : "—"}
                                    </TableCell>
                                  )}
                                  {columnVisibility.source && (
                                    <TableCell className="text-xs text-slate-500 wark:text-slate-400">
                                      {contact.source || "—"}
                                    </TableCell>
                                  )}
                                  {columnVisibility.actions && (
                                    <TableCell>
                                      <div className="flex justify-end gap-1">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleViewContact(contact)}
                                              className="h-8 w-8 p-0 hover:bg-blue-100 wark:hover:bg-blue-900/30"
                                            >
                                              <Eye className="h-3.5 w-3.5 text-blue-600 wark:text-blue-400" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>View Details</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleSendMessage(contact.id)}
                                              className="h-8 w-8 p-0 hover:bg-green-100 wark:hover:bg-green-900/30"
                                            >
                                              <MessageSquare className="h-3.5 w-3.5 text-green-600 wark:text-green-400" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Send Message</TooltipContent>
                                        </Tooltip>

                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0 hover:bg-slate-100 wark:hover:bg-slate-800"
                                            >
                                              <MoreVertical className="h-4 w-4 text-slate-600 wark:text-slate-400" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuLabel className="font-semibold">Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleEditContactClick(contact)}>
                                              <Edit className="h-4 w-4 mr-2" />
                                              Edit Contact
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAddTagClick(contact)}>
                                              <Tag className="h-4 w-4 mr-2" />
                                              Add Tag
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                              className="text-red-600 focus:text-red-600"
                                              onClick={() => handleDeleteContactClick(contact)}
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Delete Contact
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
              {/* Add Contact Dialog */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[95vh] flex flex-col p-0">
                  <DialogHeader className="px-6 py-4 border-b border-slate-300 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                        <UserPlus className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-semibold text-slate-900">
                          Add New Contact
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                          Create a new WhatsApp contact for your business account
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-8">
                      {/* Basic Information */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                            Basic Information
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                              Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="name"
                              placeholder="Enter contact name"
                              value={newContact.name}
                              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                              className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                              Email Address
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="contact@example.com"
                              value={newContact.email}
                              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                              className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                              Phone Number <span className="text-red-500">*</span>
                            </Label>
                            <div className="phone-input-container">
                              <PhoneInput
                                country={'in'}
                                value={newContact.phone}
                                onChange={(phone, country: any) => {
                                  setNewContact({
                                    ...newContact,
                                    phone: phone,
                                    countryCode: country.dialCode
                                  });
                                }}
                                inputProps={{
                                  name: 'phone',
                                  required: true,
                                  autoFocus: false
                                }}
                                containerClass="w-full"
                                inputClass="w-full h-10 pl-12 pr-4 border border-slate-200 rounded-md focus:border-primary/50 focus:ring-1 focus:ring-primary/20 bg-white"
                                buttonClass="border-slate-200 hover:bg-slate-50"
                                dropdownClass="bg-white border-slate-200 shadow-lg"
                                searchClass="bg-white border-slate-200"
                                enableSearch={true}
                                disableSearchIcon={false}
                                searchPlaceholder="Search countries..."
                              />
                            </div>
                            <p className="text-xs text-slate-500">
                              Select your country and enter the phone number
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Settings */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                            WhatsApp Settings
                          </h3>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <Label htmlFor="edit-whatsapp-optin" className="text-sm font-medium text-green-800">
                                  WhatsApp Marketing Messages
                                </Label>
                                <p className="text-xs text-green-600">
                                  Allow sending marketing and promotional messages
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                id="edit-whatsapp-optin"
                                type="checkbox"
                                checked={editContact.whatsappOptIn}
                                onChange={(e) => {
                                  console.log("Checkbox changed:", e.target.checked); // Add debug logging
                                  setEditContact({
                                    ...editContact,
                                    whatsappOptIn: e.target.checked
                                  });
                                }}
                                className="w-5 h-5 text-green-600 border-green-300 rounded focus:ring-green-500"
                              />
                              <Label htmlFor="edit-whatsapp-optin" className="text-sm font-medium text-green-800">
                                {editContact.whatsappOptIn ? 'Opted In' : 'Opted Out'}
                              </Label>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500">
                            Contacts must opt-in to receive marketing messages via WhatsApp according to WhatsApp&apos;s policies
                          </p>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                            Additional Information
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="tags" className="text-sm font-medium text-slate-700">
                              Tags
                            </Label>
                            <Input
                              id="tags"
                              placeholder="customer, premium, support (comma separated)"
                              value={newContact.tags}
                              onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                              className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                            />
                            <p className="text-xs text-slate-500">
                              Add tags to organize and segment your contacts
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="notes" className="text-sm font-medium text-slate-700">
                              Notes
                            </Label>
                            <Textarea
                              id="notes"
                              placeholder="Add any additional notes about this contact..."
                              value={newContact.notes}
                              onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                              rows={3}
                              className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Custom Fields */}
                      {customFields.length > 0 && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                              Custom Fields
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {customFields.map(field => (
                              <div key={field.id} className="space-y-2">
                                <Label htmlFor={`custom-${field.key}`} className="text-sm font-medium text-slate-700">
                                  {field.name} {field.required && <span className="text-red-500">*</span>}
                                </Label>

                                {field.type === 'Text' && (
                                  <Input
                                    id={`custom-${field.key}`}
                                    placeholder={`Enter ${field.name.toLowerCase()}`}
                                    value={newContact.customFields?.[field.key] || ''}
                                    onChange={(e) => {
                                      const updatedCustomFields = {
                                        ...newContact.customFields,
                                        [field.key]: e.target.value
                                      };
                                      setNewContact({
                                        ...newContact,
                                        customFields: updatedCustomFields
                                      });
                                    }}
                                    required={field.required}
                                    className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                  />
                                )}

                                {field.type === 'Number' && (
                                  <Input
                                    id={`custom-${field.key}`}
                                    type="number"
                                    placeholder={`Enter ${field.name.toLowerCase()}`}
                                    value={newContact.customFields?.[field.key] || ''}
                                    onChange={(e) => {
                                      const updatedCustomFields = {
                                        ...newContact.customFields,
                                        [field.key]: e.target.value ? Number(e.target.value) : ''
                                      };
                                      setNewContact({
                                        ...newContact,
                                        customFields: updatedCustomFields
                                      });
                                    }}
                                    required={field.required}
                                    className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                  />
                                )}

                                {field.type === 'Date' && (
                                  <Input
                                    id={`custom-${field.key}`}
                                    type="date"
                                    value={newContact.customFields?.[field.key] || ''}
                                    onChange={(e) => {
                                      const updatedCustomFields = {
                                        ...newContact.customFields,
                                        [field.key]: e.target.value
                                      };
                                      setNewContact({
                                        ...newContact,
                                        customFields: updatedCustomFields
                                      });
                                    }}
                                    required={field.required}
                                    className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                  />
                                )}

                                {field.type === 'Dropdown' && field.options && (
                                  <Select
                                    value={newContact.customFields?.[field.key] || ''}
                                    onValueChange={(value) => {
                                      const updatedCustomFields = {
                                        ...newContact.customFields,
                                        [field.key]: value
                                      };
                                      setNewContact({
                                        ...newContact,
                                        customFields: updatedCustomFields
                                      });
                                    }}
                                  >
                                    <SelectTrigger id={`custom-${field.key}`} className="bg-white border-slate-200">
                                      <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {field.options.map(option => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}

                                {field.defaultValue && !newContact.customFields?.[field.key] && (
                                  <p className="text-xs text-slate-500">
                                    Default: {field.defaultValue}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      className="hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddContact}
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Contact Dialog */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[95vh] flex flex-col p-0">
                  <DialogHeader className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                        <Edit className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-semibold text-slate-900">
                          Edit Contact
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                          Update contact information and details
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-8">
                      {/* Basic Information */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                            Basic Information
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-sm font-medium text-slate-700">
                              Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="edit-name"
                              placeholder="Enter contact name"
                              value={editContact.name}
                              onChange={(e) => setEditContact({ ...editContact, name: e.target.value })}
                              className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-email" className="text-sm font-medium text-slate-700">
                              Email Address
                            </Label>
                            <Input
                              id="edit-email"
                              type="email"
                              placeholder="contact@example.com"
                              value={editContact.email}
                              onChange={(e) => setEditContact({ ...editContact, email: e.target.value })}
                              className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-phone" className="text-sm font-medium text-slate-700">
                              Phone Number <span className="text-red-500">*</span>
                            </Label>
                            <div className="phone-input-container">
                              <PhoneInput
                                country={'in'}
                                value={editContact.phone}
                                onChange={(phone, country: any) => {
                                  setEditContact({
                                    ...editContact,
                                    phone: phone,
                                    countryCode: country.dialCode
                                  });
                                }}
                                inputProps={{
                                  name: 'phone',
                                  required: true,
                                  autoFocus: false
                                }}
                                containerClass="w-full"
                                inputClass="w-full h-10 pl-12 pr-4 border border-slate-200 rounded-md focus:border-primary/50 focus:ring-1 focus:ring-primary/20 bg-white"
                                buttonClass="border-slate-200 hover:bg-slate-50"
                                dropdownClass="bg-white border-slate-200 shadow-lg"
                                searchClass="bg-white border-slate-200"
                                enableSearch={true}
                                disableSearchIcon={false}
                                searchPlaceholder="Search countries..."
                              />
                            </div>
                            <p className="text-xs text-slate-500">
                              Select your country and enter the phone number
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Settings */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                            WhatsApp Settings
                          </h3>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <Label htmlFor="edit-whatsapp-optin" className="text-sm font-medium text-green-800">
                                  WhatsApp Marketing Messages
                                </Label>
                                <p className="text-xs text-green-600">
                                  Allow sending marketing and promotional messages
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                id="edit-whatsapp-optin"
                                type="checkbox"
                                checked={editContact.whatsappOptIn}
                                onChange={(e) => setEditContact({ ...editContact, whatsappOptIn: e.target.checked })}
                                className="w-5 h-5 text-green-600 border-green-300 rounded focus:ring-green-500"
                              />
                              <Label htmlFor="edit-whatsapp-optin" className="text-sm font-medium text-green-800">
                                {editContact.whatsappOptIn ? 'Opted In' : 'Opted Out'}
                              </Label>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500">
                            Contacts must opt-in to receive marketing messages via WhatsApp according to WhatsApp&apos;s policies
                          </p>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                            Additional Information
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="edit-tags" className="text-sm font-medium text-slate-700">
                              Tags
                            </Label>
                            <Input
                              id="edit-tags"
                              placeholder="customer, premium, support (comma separated)"
                              value={editContact.tags}
                              onChange={(e) => setEditContact({ ...editContact, tags: e.target.value })}
                              className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                            />
                            <p className="text-xs text-slate-500">
                              Add tags to organize and segment your contacts
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-notes" className="text-sm font-medium text-slate-700">
                              Notes
                            </Label>
                            <Textarea
                              id="edit-notes"
                              placeholder="Add any additional notes about this contact..."
                              value={editContact.notes}
                              onChange={(e) => setEditContact({ ...editContact, notes: e.target.value })}
                              rows={3}
                              className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Custom Fields */}
                      {customFields.length > 0 && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                              Custom Fields
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {customFields.map(field => (
                              <div key={field.id} className="space-y-2">
                                <Label htmlFor={`edit-custom-${field.key}`} className="text-sm font-medium text-slate-700">
                                  {field.name} {field.required && <span className="text-red-500">*</span>}
                                </Label>

                                {field.type === 'Text' && (
                                  <Input
                                    id={`edit-custom-${field.key}`}
                                    placeholder={`Enter ${field.name.toLowerCase()}`}
                                    value={editContact.customFields?.[field.key] || ''}
                                    onChange={(e) => {
                                      const updatedCustomFields = {
                                        ...editContact.customFields,
                                        [field.key]: e.target.value
                                      };
                                      setEditContact({
                                        ...editContact,
                                        customFields: updatedCustomFields
                                      });
                                    }}
                                    required={field.required}
                                    className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                  />
                                )}

                                {field.type === 'Number' && (
                                  <Input
                                    id={`edit-custom-${field.key}`}
                                    type="number"
                                    placeholder={`Enter ${field.name.toLowerCase()}`}
                                    value={editContact.customFields?.[field.key] || ''}
                                    onChange={(e) => {
                                      const updatedCustomFields = {
                                        ...editContact.customFields,
                                        [field.key]: e.target.value ? Number(e.target.value) : ''
                                      };
                                      setEditContact({
                                        ...editContact,
                                        customFields: updatedCustomFields
                                      });
                                    }}
                                    required={field.required}
                                    className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                  />
                                )}

                                {field.type === 'Date' && (
                                  <Input
                                    id={`edit-custom-${field.key}`}
                                    type="date"
                                    value={editContact.customFields?.[field.key] || ''}
                                    onChange={(e) => {
                                      const updatedCustomFields = {
                                        ...editContact.customFields,
                                        [field.key]: e.target.value
                                      };
                                      setEditContact({
                                        ...editContact,
                                        customFields: updatedCustomFields
                                      });
                                    }}
                                    required={field.required}
                                    className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                  />
                                )}

                                {field.type === 'Dropdown' && field.options && (
                                  <Select
                                    value={editContact.customFields?.[field.key] || ''}
                                    onValueChange={(value) => {
                                      const updatedCustomFields = {
                                        ...editContact.customFields,
                                        [field.key]: value
                                      };
                                      setEditContact({
                                        ...editContact,
                                        customFields: updatedCustomFields
                                      });
                                    }}
                                  >
                                    <SelectTrigger id={`edit-custom-${field.key}`} className="bg-white border-slate-200">
                                      <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {field.options.map(option => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      className="hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleEditContact}
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={isAddToGroupDialogOpen} onOpenChange={setIsAddToGroupDialogOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col p-0">
                  <DialogHeader className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-semibold text-slate-900">
                          Add to Contact Group
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                          Add {selectedContacts.length} selected contact{selectedContacts.length > 1 ? 's' : ''} to an existing group
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-6">
                      {/* Group Selection */}
                      <div className="space-y-3">
                        <Label htmlFor="group-select" className="text-sm font-medium text-slate-700">
                          Select Contact Group
                        </Label>

                        {contactGroups.length > 0 ? (
                          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                            <SelectTrigger id="group-select" className="bg-white border-slate-200">
                              <SelectValue placeholder="Choose a contact group" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {contactGroups.map((group) => (
                                <SelectItem key={group.id} value={group.id}>
                                  <div className="flex items-center gap-3 w-full">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: group.color }}
                                    />
                                    <div className="flex-1">
                                      <div className="font-medium">{group.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {group.contactCount} contacts
                                        {group.description && ` • ${group.description}`}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No contact groups found</p>
                            <p className="text-sm">Create a contact group first to organize your contacts</p>
                          </div>
                        )}
                      </div>

                      {/* Selected Group Preview */}
                      {selectedGroupId && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">
                            Selected Group
                          </Label>
                          {(() => {
                            const selectedGroup = contactGroups.find(g => g.id === selectedGroupId);
                            return selectedGroup ? (
                              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: selectedGroup.color }}
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium text-green-900">{selectedGroup.name}</div>
                                    <div className="text-sm text-green-700">
                                      Currently has {selectedGroup.contactCount} contacts
                                      {selectedGroup.description && ` • ${selectedGroup.description}`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}

                      {/* Selected Contacts Summary */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-700">
                          Contacts to Add ({selectedContacts.length})
                        </Label>
                        <div className="max-h-32 overflow-y-auto p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="space-y-2">
                            {contacts
                              .filter(contact => selectedContacts.includes(contact.id))
                              .slice(0, 5)
                              .map((contact) => (
                                <div key={contact.id} className="flex items-center gap-3 text-sm">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                      {contact.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{contact.name}</span>
                                  <span className="text-muted-foreground">{contact.phone}</span>
                                </div>
                              ))}
                            {selectedContacts.length > 5 && (
                              <div className="text-center text-sm text-muted-foreground mt-2">
                                and {selectedContacts.length - 5} more contacts...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddToGroupDialogOpen(false)}
                      className="hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddToGroup}
                      disabled={!selectedGroupId || selectedContacts.length === 0 || contactGroups.length === 0}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Add to Group
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* View Contact Dialog */}
              <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[95vh] flex flex-col p-0">
                  <DialogHeader className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                        <Eye className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-semibold text-slate-900">
                          Contact Details
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                          View and manage contact information
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto">
                    {selectedContact && (
                      <Tabs defaultValue="info" className="w-full h-full flex flex-col">
                        <div className="px-6 pt-4 border-b border-slate-100 flex-shrink-0">
                          <TabsList className="grid w-full grid-cols-3 bg-slate-50">
                            <TabsTrigger value="info" className="flex items-center gap-2 data-[state=active]:bg-white">
                              <User className="h-4 w-4" />
                              Info
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="flex items-center gap-2 data-[state=active]:bg-white">
                              <BarChart2 className="h-4 w-4" />
                              Activity
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-white">
                              <UserCog className="h-4 w-4" />
                              Settings
                            </TabsTrigger>
                          </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6">
                          <TabsContent value="info" className="mt-0 space-y-6">
                            {/* Contact Header */}
                            <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                                  {selectedContact.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold text-slate-900">{selectedContact.name}</h3>
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Phone className="h-4 w-4" />
                                    <span className="font-medium">{selectedContact.phone}</span>
                                    {selectedContact.countryCode && (
                                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                                        {selectedContact.countryCode}
                                      </span>
                                    )}
                                  </div>
                                  {selectedContact.email && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                      <Mail className="h-4 w-4" />
                                      <span>{selectedContact.email}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="mt-3">
                                  <Badge
                                    variant="outline"
                                    className={
                                      selectedContact.whatsappOptIn
                                        ? "bg-green-100 text-green-700 border-green-200"
                                        : "bg-red-100 text-red-700 border-red-200"
                                    }
                                  >
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    {selectedContact.whatsappOptIn ? "Subscribed" : "Unsubscribed"}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Information Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Tags Section */}
                              <Card className="border-slate-200 hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                      <Tag className="h-4 w-4" />
                                      Tags
                                    </h4>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                      {selectedContact.tags.length > 0 ? (
                                        selectedContact.tags.map((tag, index) => (
                                          <Badge
                                            key={index}
                                            variant="secondary"
                                            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 transition-colors"
                                          >
                                            {tag}
                                            <button
                                              onClick={() => handleRemoveTag(selectedContact.id, tag)}
                                              className="ml-1 hover:text-red-600 transition-colors"
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          </Badge>
                                        ))
                                      ) : (
                                        <p className="text-slate-500 text-sm italic">No tags assigned</p>
                                      )}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full"
                                      onClick={() => handleAddTagClick(selectedContact)}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Tag
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Status Information */}
                              <Card className="border-slate-200 hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                      <Info className="h-4 w-4" />
                                      Status Information
                                    </h4>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                      <span className="text-sm font-medium text-slate-700">WhatsApp Status</span>
                                      <Badge
                                        variant="outline"
                                        className={
                                          selectedContact.whatsappOptIn
                                            ? "bg-green-100 text-green-700 border-green-200"
                                            : "bg-red-100 text-red-700 border-red-200"
                                        }
                                      >
                                        {selectedContact.whatsappOptIn ? "Subscribed" : "Unsubscribed"}
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                      <span className="text-sm font-medium text-slate-700">Created</span>
                                      <span className="text-sm text-slate-900">
                                        {format(new Date(selectedContact.createdAt), "MMM dd, yyyy")}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                      <span className="text-sm font-medium text-slate-700">Last Contact</span>
                                      <span className="text-sm text-slate-900">
                                        {selectedContact.lastMessageAt
                                          ? format(new Date(selectedContact.lastMessageAt), "MMM dd, yyyy")
                                          : "Never"
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Custom Fields Section */}
                            {selectedContact.customFields && Object.keys(selectedContact.customFields).length > 0 && (
                              <Card className="border-slate-200 hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                                    <h4 className="font-semibold text-slate-900">Custom Fields</h4>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(selectedContact.customFields).map(([key, value]) => {
                                      if (!value) return null;
                                      const field = customFields.find(f => f.key === key);
                                      if (!field) return null;

                                      return (
                                        <div key={key} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                          <div className="flex items-center gap-2 mb-2">
                                            {getCustomFieldIcon(field.type)}
                                            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                                              {field.name}
                                            </span>
                                          </div>
                                          <span className="font-medium text-slate-900">
                                            {field.type === 'Date' && typeof value === 'string'
                                              ? format(new Date(value), "MMM dd, yyyy")
                                              : String(value)
                                            }
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Notes Section */}
                            {selectedContact.notes && (
                              <Card className="border-slate-200 hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                                    <h4 className="font-semibold text-slate-900">Notes</h4>
                                  </div>
                                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                    <p className="text-slate-700 leading-relaxed">{selectedContact.notes}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </TabsContent>

                          <TabsContent value="activity" className="mt-0">
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                                <MessageSquare className="h-10 w-10 text-slate-400" />
                              </div>
                              <h3 className="text-xl font-semibold text-slate-900 mb-2">Conversation History</h3>
                              <p className="text-slate-600 mb-6 max-w-md">
                                View past messages and interaction history with this contact
                              </p>
                              <Button
                                onClick={() => handleSendMessage(selectedContact.id)}
                                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                View Conversations
                              </Button>
                            </div>
                          </TabsContent>

                          <TabsContent value="settings" className="mt-0">
                            <div className="space-y-6">
                              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Edit className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-slate-900">Edit Contact</h4>
                                    <p className="text-sm text-slate-600">
                                      Update contact information and details
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsViewDialogOpen(false);
                                    setTimeout(() => handleEditContactClick(selectedContact), 100);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </div>

                              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Tag className="h-6 w-6 text-purple-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-slate-900">Tag Management</h4>
                                    <p className="text-sm text-slate-600">
                                      Add or remove tags from this contact
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsViewDialogOpen(false);
                                    setTimeout(() => handleAddTagClick(selectedContact), 100);
                                  }}
                                >
                                  <Tag className="h-4 w-4 mr-2" />
                                  Manage Tags
                                </Button>
                              </div>

                              <div className="flex items-center justify-between p-6 bg-red-50 rounded-lg border border-red-200">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <Trash2 className="h-6 w-6 text-red-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-red-900">Delete Contact</h4>
                                    <p className="text-sm text-red-700">
                                      Permanently remove this contact from your database
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    setIsViewDialogOpen(false);
                                    setTimeout(() => handleDeleteContactClick(selectedContact), 100);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </TabsContent>
                        </div>
                      </Tabs>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Add Tag Dialog */}
              <Dialog open={isAddTagDialogOpen} onOpenChange={setIsAddTagDialogOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col p-0">
                  <DialogHeader className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center">
                        <Tag className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-semibold text-slate-900">
                          {selectedContacts.length > 1
                            ? `Add Tag to ${selectedContacts.length} Contacts`
                            : "Add Tag to Contact"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                          Tags help you organize and segment your contacts effectively
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-6">
                      {/* Tag Input */}
                      <div className="space-y-3">
                        <Label htmlFor="new-tag" className="text-sm font-medium text-slate-700">
                          Tag Name
                        </Label>
                        <Input
                          id="new-tag"
                          placeholder="Enter tag name (e.g. customer, premium, vip)"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20"
                        />
                        <p className="text-xs text-slate-500">
                          Tags are case-sensitive and help categorize your contacts
                        </p>
                      </div>

                      {/* Existing Tags */}
                      {allTags.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">
                            Choose from existing tags
                          </Label>
                          <div className="max-h-32 overflow-y-auto p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex flex-wrap gap-2">
                              {allTags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-colors"
                                  onClick={() => setNewTag(tag)}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-500">
                            Click on any existing tag to select it
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddTagDialogOpen(false)}
                      className="hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={selectedContacts.length > 1 ? handleBulkAddTag : handleAddTag}
                      disabled={!newTag.trim()}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      Add Tag
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <ImportMappingDialog
                open={isImportDialogOpen}
                onOpenChange={setIsImportDialogOpen}
                onImportComplete={handleImportComplete}
                wabaId={selectedWabaId}
              />
              {/* Edit Tag Dialog */}
              <Dialog open={isEditTagDialogOpen} onOpenChange={setIsEditTagDialogOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col p-0">
                  <DialogHeader className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/20 flex items-center justify-center">
                        <Edit className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-semibold text-slate-900">
                          Edit Tag
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                          Update the tag name for this contact
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-6">
                      {/* Current Tag */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-700">
                          Current Tag
                        </Label>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                          <Badge variant="outline" className="text-base px-3 py-1">
                            {oldTag}
                          </Badge>
                        </div>
                      </div>

                      {/* New Tag Input */}
                      <div className="space-y-3">
                        <Label htmlFor="updated-tag" className="text-sm font-medium text-slate-700">
                          New Tag Name
                        </Label>
                        <Input
                          id="updated-tag"
                          placeholder="Enter new tag name"
                          value={updatedTag}
                          onChange={(e) => setUpdatedTag(e.target.value)}
                          className="bg-white border-slate-200 focus:border-amber-500/50 focus:ring-amber-500/20"
                        />
                        <p className="text-xs text-slate-500">
                          This will update the tag for this contact only
                        </p>
                      </div>

                      {/* Preview */}
                      {updatedTag.trim() && updatedTag !== oldTag && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">
                            Preview
                          </Label>
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Edit className="h-4 w-4 text-amber-600" />
                              <span className="text-sm text-amber-800">
                                Tag will be changed from &quot;{oldTag}&quot; to &quot;{updatedTag}&quot;
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditTagDialogOpen(false)}
                      className="hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleEditTag}
                      disabled={!updatedTag.trim() || updatedTag === oldTag}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update Tag
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>


              {/* Delete Confirmation Dialog */}
              <AlertDialog open={isDeleteConfirmDialogOpen} onOpenChange={setIsDeleteConfirmDialogOpen}>
                <AlertDialogContent className="sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      {selectedContacts.length > 1 && selectedContacts.length !== 1
                        ? `Delete ${selectedContacts.length} Contacts?`
                        : "Delete Contact?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The contact{selectedContacts.length > 1 ? "s" : ""} will be permanently removed from your system.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="py-4">
                    {selectedContact && selectedContacts.length === 1 ? (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-red-100 text-red-600 font-medium">
                            {selectedContact.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-slate-900">{selectedContact.name}</div>
                          <div className="text-sm text-slate-600">{selectedContact.phone}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 rounded-lg bg-slate-50 border">
                        <p className="font-medium text-slate-900">{selectedContacts.length} contacts selected for deletion</p>
                      </div>
                    )}
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        if (selectedContacts.length > 1) {
                          handleDeleteMultipleContacts();
                        } else if (selectedContact) {
                          handleDeleteContact(selectedContact.id);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Delete Confirmation Dialog */}
              <Dialog open={isDeleteConfirmDialogOpen} onOpenChange={setIsDeleteConfirmDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-red-600">
                      {selectedContacts.length > 1 && selectedContacts.length !== 1
                        ? `Delete ${selectedContacts.length} Contacts?`
                        : "Delete Contact?"}
                    </DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. The contact{selectedContacts.length > 1 ? "s" : ""} will be permanently removed from your system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    {selectedContact && selectedContacts.length === 1 ? (
                      <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {selectedContact.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedContact.name}</div>
                          <div className="text-sm text-muted-foreground">{selectedContact.phone}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-3 rounded-md bg-muted/50">
                        <p className="font-medium">{selectedContacts.length} contacts selected for deletion</p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteConfirmDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (selectedContacts.length > 1) {
                          handleDeleteMultipleContacts();
                        } else if (selectedContact) {
                          handleDeleteContact(selectedContact.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </TooltipProvider>
      </Layout>
    </ProtectedRoute>
  );
}
