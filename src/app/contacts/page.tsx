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
  ChevronUp
} from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import AudienceFilter from "@/components/filters/AudienceFilter";

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

  // New state for audience filter visibility
  const [isAudienceFilterVisible, setIsAudienceFilterVisible] = useState(false);

  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
    tags: "",
    notes: "",
    customFields: {} as Record<string, any>
  });

  const [editContact, setEditContact] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    tags: "",
    notes: "",
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

  // Inside the ContactsPage component, add these:
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchWabaAccounts();
    fetchCustomFields();
  }, []);

  useEffect(() => {
    if (selectedWabaId) {
      fetchContacts();
    }
  }, [selectedWabaId, searchQuery, statusFilter, tagFilter, customFieldFilters]);

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
    // Create initial visibility state that includes custom fields
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

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedWabaId) params.append('wabaId', selectedWabaId);
      if (searchQuery) params.append('search', searchQuery);

      // Add custom field filters to params
      Object.entries(customFieldFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(`customField.${key}`, String(value));
        }
      });

      const response = await fetch(`/api/contacts?${params}`);
      const data = await response.json();

      if (data.success) {
        let filteredContacts = data.contacts;

        // Apply status filter
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

        // Apply tag filter
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

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone || !selectedWabaId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate required custom fields
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
      // Apply default values to any custom fields that weren't filled
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
          email: "",
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

    // Validate required custom fields
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
      const response = await fetch(`/api/contacts/${editContact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editContact.name,
          phone: editContact.phone,
          email: editContact.email,
          tags: editContact.tags.split(',').map(tag => tag.trim()).filter(Boolean),
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
      // Implement bulk delete API call
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

        // Update the selected contact if it's still being viewed
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
      // Implement tag update logic - first remove old tag
      await fetch(`/api/contacts/${selectedContact.id}/tags/${encodeURIComponent(oldTag)}`, {
        method: 'DELETE',
      });

      // Then add new tag
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

        // Update the selected contact if it's still being viewed
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

        // Update the selected contact if it's still being viewed
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
      // Implement bulk tag addition
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
    // Navigate to conversations page with this contact
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
      email: contact.email || "",
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

  const clearAllFilters = () => {
    setStatusFilter("all");
    setTagFilter([]);
    setSearchQuery("");
    setCustomFieldFilters({});
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

  // Get visible columns including custom fields
  const visibleColumns = useMemo(() => {
    return Object.entries(columnVisibility)
      .filter(([_, isVisible]) => isVisible)
      .map(([key]) => key);
  }, [columnVisibility]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedWabaId) {
      return;
    }

    setImportLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('wabaId', selectedWabaId);

      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Import Successful",
          description: `Imported ${data.results.imported} contacts. Skipped ${data.results.skipped}. Failed ${data.results.errors}.`,
        });
        fetchContacts();
      } else {
        toast({
          title: "Import Failed",
          description: data.error || "Failed to import contacts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error importing contacts:', error);
      toast({
        title: "Import Failed",
        description: "An error occurred while importing contacts",
        variant: "destructive",
      });
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
      // Use direct download approach for CSV
      const params = new URLSearchParams();
      params.append('wabaId', selectedWabaId);

      // Create a link element to trigger the download
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

  // Create trait fields for the audience filter based on contact properties and custom fields
  const traitFields = [
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

  // Create event fields for the audience filter
  const eventFields = [
    { label: "Message Sent", key: "messageSent", type: "date" as const },
    { label: "Message Received", key: "messageReceived", type: "date" as const }
  ];

  // Handle applying audience filters
  const handleApplyAudienceFilters = (filters: {
    tags: string[];
    conditions: any[];
    operator: "AND" | "OR";
    whatsappOptedIn: boolean;
  }) => {
    // Clear existing filters first
    setSearchQuery("");
    setCustomFieldFilters({});

    // Apply tag filters
    setTagFilter(filters.tags);

    // Apply WhatsApp opted in filter
    if (filters.whatsappOptedIn) {
      setStatusFilter("subscribed");
    } else {
      setStatusFilter("all");
    }

    // Process conditions to apply appropriate filters
    const newCustomFieldFilters: Record<string, any> = {};

    filters.conditions.forEach(condition => {
      if (condition.field.startsWith('customField.')) {
        const fieldKey = condition.field.replace('customField.', '');
        newCustomFieldFilters[fieldKey] = condition.value;
      } else if (condition.field === 'name' || condition.field === 'email' || condition.field === 'phone') {
        // For basic search fields, set the search query if operator is 'contains' or 'equals'
        if (condition.operator === 'contains' || condition.operator === 'equals') {
          setSearchQuery(condition.value);
        }
      }
    });

    setCustomFieldFilters(newCustomFieldFilters);
  };

  return (
    <Layout>
      <div className="container overflow-hidden mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Contacts</h1>
            <p className="text-muted-foreground mt-1">Manage your WhatsApp contacts and communication preferences</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={handleImportClick}
              disabled={importLoading || !selectedWabaId}
            >
              {importLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={handleExportContacts}
              disabled={exportLoading || !selectedWabaId || contacts.length === 0}
            >
              {exportLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </>
              )}
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="h-9"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* WABA Account Selector */}
        <div className="mb-6">
          <Label htmlFor="waba-select" className="text-sm font-medium mb-2 block">
            WhatsApp Business Account
          </Label>
          <Select value={selectedWabaId} onValueChange={setSelectedWabaId}>
            <SelectTrigger id="waba-select" className="w-full max-w-md">
              <SelectValue placeholder="Select WhatsApp Business Account" />
            </SelectTrigger>
            <SelectContent>
              {wabaAccounts.map((account) => (
                <SelectItem key={account.wabaId} value={account.wabaId}>
                  {account.businessName} ({account.phoneNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Audience Filter Section */}


        {/* Applied Filters */}
        {(searchQuery || statusFilter !== "all" || tagFilter.length > 0 || Object.values(customFieldFilters).some(v => v)) && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 border rounded-md bg-muted/20">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Active Filters:</span>
            </div>

            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                {searchQuery}
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </Badge>
            )}

            {statusFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {statusFilter === "subscribed" ? "Subscribed" :
                  statusFilter === "unsubscribed" ? "Unsubscribed" :
                    statusFilter === "recent" ? "Recently Active" : "Inactive"}
                <button onClick={() => setStatusFilter("all")}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </Badge>
            )}

            {tagFilter.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {tag}
                <button onClick={() => handleToggleTagFilter(tag)}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </Badge>
            ))}

            {/* Custom Field Filters */}
            {Object.entries(customFieldFilters).map(([key, value]) => {
              if (!value) return null;
              const field = customFields.find(f => f.key === key);
              if (!field) return null;

              return (
                <Badge key={key} variant="secondary" className="flex items-center gap-1">
                  {getCustomFieldIcon(field.type)}
                  {field.name}: {value}
                  <button onClick={() => {
                    setCustomFieldFilters({
                      ...customFieldFilters,
                      [key]: ''
                    });
                  }}>
                    <X className="h-3 w-3 ml-1" />
                  </button>
                </Badge>
              );
            })}

            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={clearAllFilters}
            >
              <FilterX className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        )}

        {/* Search, Filter Controls and Columns Menu */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Toggle Audience Filter */}
            <Button
              variant={isAudienceFilterVisible ? "default" : "default"}
              onClick={() => setIsAudienceFilterVisible(!isAudienceFilterVisible)}
              className={isAudienceFilterVisible ? "bg-primary":"flex gap-2 bg-[#D7E8DC] hover:bg-[#DBFAE6] text-primary" }
            >
              <Filter className="h-4 w-4" />
              {isAudienceFilterVisible ? "Hide Filters" : "Show Filters"}
            </Button>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 !bg-[#D7E8DC] hover:bg-[#DBFAE6] text-primary ">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent >
                <SelectItem value="all">All Contacts</SelectItem>
                <SelectItem value="subscribed">Subscribed</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                <SelectItem value="recent">Recently Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Tag Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="bg-primary/10" asChild>
                <Button variant="default" className="bg-[#D7E8DC] hover:bg-[#DBFAE6] text-primary hover:text- flex gap-2">
                  <Tag className="h-4 w-4" />
                  Filter by Tags
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Select Tags</DropdownMenuLabel>
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
                        {tagFilter.includes(tag) && <Check className="h-4 w-4" />}
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

            {/* Custom Field Filters */}

            {/* Column Visibility */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Columns className="h-4 w-4" />
                  Columns
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 h-56 overflow-y-scroll">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Toggle Visible Columns</h4>
                  <ScrollArea className="h-60 overflow-y-auto p-1">
                    <div className="space-y-1">
                      {/* Standard columns */}
                      {Object.entries(columnVisibility)
                        .filter(([key]) => !key.startsWith('customField_'))
                        .map(([column, isVisible]) => (
                          <div key={column} className="flex items-center space-x-2 py-1 px-2 hover:bg-muted rounded-md">
                            <Checkbox
                              id={`column-${column}`}
                              checked={isVisible}
                              onCheckedChange={() => handleToggleColumnVisibility(column)}
                            />
                            <label
                              htmlFor={`column-${column}`}
                              className="flex-1 text-sm font-medium leading-none cursor-pointer"
                            >
                              {column === 'id' ? 'ID' :
                                column === 'userId' ? 'User ID' :
                                  column === 'phone' ? 'Phone Number' :
                                    column === 'email' ? 'Email' :
                                      column === 'name' ? 'Name' :
                                        column === 'tags' ? 'Tags' :
                                          column === 'createdAt' ? 'Creation Date' :
                                            column === 'countryCode' ? 'Country Code' :
                                              column === 'whatsappOptIn' ? 'WhatsApp Opted' :
                                                column === 'isSpam' ? 'Marked as Spam?' :
                                                  column === 'sourceId' ? 'Source ID' :
                                                    column === 'sourceUrl' ? 'Source URL' :
                                                      column === 'source' ? 'Source' :
                                                        column === 'lastMessageAt' ? 'Last Message' :
                                                          'Actions'}
                            </label>
                            {isVisible && <Check className="h-4 w-4 text-primary" />}
                          </div>
                        ))}

                      {/* Custom field columns */}
                      {customFields.length > 0 && (
                        <>
                          <div className="py-1 px-2 text-sm font-semibold">Custom Fields</div>
                          {customFields.map(field => {
                            const columnKey = `customField_${field.key}`;
                            return (
                              <div key={columnKey} className="flex items-center space-x-2 py-1 px-2 hover:bg-muted rounded-md">
                                <Checkbox
                                  id={`column-${columnKey}`}
                                  checked={columnVisibility[columnKey] || false}
                                  onCheckedChange={() => handleToggleColumnVisibility(columnKey)}
                                />
                                <label
                                  htmlFor={`column-${columnKey}`}
                                  className="flex-1 text-sm font-medium leading-none cursor-pointer"
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

            {selectedContacts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Actions ({selectedContacts.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsAddTagDialogOpen(true)}>
                    <Tag className="mr-2 h-4 w-4" />
                    Add Tag
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Selected
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
        {/* Audience Filter Section */}
        <Collapsible
          open={isAudienceFilterVisible}
          onOpenChange={setIsAudienceFilterVisible}
          className="mb-6  rounded-lg"
        >

          <CollapsibleContent className="p-4 border-t">
            <AudienceFilter
              tags={allTags}
              traitFields={[...traitFields, ...customFieldTraits]}
              eventFields={eventFields}
              onApplyFilters={handleApplyAudienceFilters}
              initialFilters={{
                tags: tagFilter,
                conditions: [],
                operator: "AND",
                whatsappOptedIn: statusFilter === "subscribed"
              }}
            />
          </CollapsibleContent>
        </Collapsible>
        {/* Contacts Table */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-background">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No contacts found</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all" || tagFilter.length > 0 || Object.values(customFieldFilters).some(v => v)
                ? "Try adjusting your filters or search terms"
                : "Get started by adding your first contact"}
            </p>
            {!searchQuery && statusFilter === "all" && tagFilter.length === 0 && Object.values(customFieldFilters).every(v => !v) && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto max-w-7xl 2xl:max-w-screen w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#E4EAE8]">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedContacts.length === contacts.length && contacts.length > 0}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    {columnVisibility.name && <TableHead className="font-semibold">Contact</TableHead>}
                    {columnVisibility.phone && <TableHead className="font-semibold">Phone</TableHead>}
                    {columnVisibility.email && <TableHead className="font-semibold">Email</TableHead>}
                    {columnVisibility.whatsappOptIn && <TableHead className="font-semibold">Status</TableHead>}
                    {columnVisibility.tags && <TableHead className="font-semibold">Tags</TableHead>}

                    {/* Custom Field Headers */}
                    {customFields.map(field =>
                      columnVisibility[`customField_${field.key}`] && (
                        <TableHead className="font-semibold" key={field.id}>
                          <div className="flex items-center gap-1">
                            {getCustomFieldIcon(field.type)}
                            <span>{field.name}</span>
                          </div>
                        </TableHead>
                      )
                    )}

                    {columnVisibility.countryCode && <TableHead className="font-semibold">Country</TableHead>}
                    {columnVisibility.createdAt && <TableHead className="font-semibold">Created</TableHead>}
                    {columnVisibility.lastMessageAt && <TableHead className="font-semibold">Last Contact</TableHead>}
                    {columnVisibility.id &&<TableHead className="font-semibold">ID</TableHead>}
                    {columnVisibility.userId && <TableHead className="font-semibold">User ID</TableHead>}
                    {columnVisibility.isSpam &&<TableHead className="font-semibold">Spam</TableHead>}
                    {columnVisibility.sourceId && <TableHead className="font-semibold">Source ID</TableHead>}
                    {columnVisibility.sourceUrl && <TableHead className="font-semibold">Source URL</TableHead>}
                    {columnVisibility.source && <TableHead className="font-semibold">Source</TableHead>}
                    {columnVisibility.actions && <TableHead className="font-semibold text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id} className="group">
                      <TableCell>
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => toggleSelectContact(contact.id)}
                          aria-label={`Select ${contact.name}`}
                        />
                      </TableCell>
                      {columnVisibility.name && (
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {contact.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{contact.name}</div>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.phone && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{contact.phone}</span>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.email && (
                        <TableCell>
                          {contact.email ? (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{contact.email}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                      {columnVisibility.whatsappOptIn && (
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              contact.whatsappOptIn
                                ? ""
                                : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900"
                            }
                          >
                            {contact.whatsappOptIn ? "Subscribed" : "Unsubscribed"}
                          </Badge>
                        </TableCell>
                      )}
                      {columnVisibility.tags && (
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {contact.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{contact.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      )}

                      {/* Custom Field Cells */}
                      {customFields.map(field =>
                        columnVisibility[`customField_${field.key}`] && (
                          <TableCell key={field.id}>
                            {renderCustomFieldValue(contact, field)}
                          </TableCell>
                        )
                      )}

                      {columnVisibility.countryCode && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{contact.countryCode || contact.phone.slice(0, 3)}</span>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.createdAt && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{format(new Date(contact.createdAt), "MMM dd, yyyy")}</span>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.lastMessageAt && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {contact.lastMessageAt
                                ? format(new Date(contact.lastMessageAt), "MMM dd, yyyy")
                                : "Never"
                              }
                            </span>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.id && (
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {contact.id}
                        </TableCell>
                      )}
                      {columnVisibility.userId && (
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {contact.userId || "—"}
                        </TableCell>
                      )}
                      {columnVisibility.isSpam && (
                        <TableCell>
                          {contact.isSpam ? (
                            <Badge variant="destructive">Spam</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">No</Badge>
                          )}
                        </TableCell>
                      )}
                      {columnVisibility.sourceId && (
                        <TableCell className="text-xs text-muted-foreground">
                          {contact.sourceId || "—"}
                        </TableCell>
                      )}
                      {columnVisibility.sourceUrl && (
                        <TableCell className="text-xs text-muted-foreground">
                          {contact.sourceUrl ? (
                            <a href={contact.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                              Link
                            </a>
                          ) : "—"}
                        </TableCell>
                      )}
                      {columnVisibility.source && (
                        <TableCell className="text-xs text-muted-foreground">
                          {contact.source || "—"}
                        </TableCell>
                      )}
                      {columnVisibility.actions && (
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewContact(contact)}
                              className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            >
                              <Info className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendMessage(contact.id)}
                              className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span className="sr-only">Message</span>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">More</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewContact(contact)}>
                                  <Info className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditContactClick(contact)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Contact
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAddTagClick(contact)}>
                                  <Tag className="mr-2 h-4 w-4" />
                                  Add Tag
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteContactClick(contact)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
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
          </div>
        )}

        {/* Add Contact Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px] p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-xl">Add New Contact</DialogTitle>
              <DialogDescription>
                Create a new WhatsApp contact for your business account.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 grid gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">BASIC INFORMATION</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      placeholder="Contact Name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      placeholder="+1234567890"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Include country code (e.g., +1 for US)</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@example.com"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">ADDITIONAL INFORMATION</h3>

                <div>
                  <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="customer, premium, support (comma separated)"
                    value={newContact.tags}
                    onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this contact..."
                    value={newContact.notes}
                    onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Custom Fields */}
              {customFields.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">CUSTOM FIELDS</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customFields.map(field => (
                      <div key={field.id}>
                        <Label htmlFor={`custom-${field.key}`} className="text-sm font-medium">
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
                            className="mt-1"
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
                            className="mt-1"
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
                            className="mt-1"
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
                            <SelectTrigger id={`custom-${field.key}`} className="mt-1">
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
                          <p className="text-xs text-muted-foreground mt-1">
                            Default: {field.defaultValue}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddContact}>
                Add Contact
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Contact Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-xl">Edit Contact</DialogTitle>
              <DialogDescription>
                Update contact information.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 grid gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">BASIC INFORMATION</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name" className="text-sm font-medium">Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="edit-name"
                      placeholder="Contact Name"
                      value={editContact.name}
                      onChange={(e) => setEditContact({ ...editContact, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-phone" className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="edit-phone"
                      placeholder="+1234567890"
                      value={editContact.phone}
                      onChange={(e) => setEditContact({ ...editContact, phone: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Include country code (e.g., +1 for US)</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="contact@example.com"
                    value={editContact.email}
                    onChange={(e) => setEditContact({ ...editContact, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">ADDITIONAL INFORMATION</h3>

                <div>
                  <Label htmlFor="edit-tags" className="text-sm font-medium">Tags</Label>
                  <Input
                    id="edit-tags"
                    placeholder="customer, premium, support (comma separated)"
                    value={editContact.tags}
                    onChange={(e) => setEditContact({ ...editContact, tags: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-notes" className="text-sm font-medium">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    placeholder="Additional notes about this contact..."
                    value={editContact.notes}
                    onChange={(e) => setEditContact({ ...editContact, notes: e.target.value })}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Custom Fields */}
              {customFields.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">CUSTOM FIELDS</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customFields.map(field => (
                      <div key={field.id}>
                        <Label htmlFor={`edit-custom-${field.key}`} className="text-sm font-medium">
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
                            className="mt-1"
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
                            className="mt-1"
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
                            className="mt-1"
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
                            <SelectTrigger id={`edit-custom-${field.key}`} className="mt-1">
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

            <DialogFooter className="pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditContact}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Contact Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Contact Details</DialogTitle>
            </DialogHeader>
            {selectedContact && (
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">
                    <User className="h-4 w-4 mr-2" />
                    Info
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Activity
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <UserCog className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="pt-4">
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                        {selectedContact.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedContact.name}</h3>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{selectedContact.phone}</span>
                      </div>
                      {selectedContact.email && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{selectedContact.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <Tag className="h-4 w-4" /> Tags
                        </h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedContact.tags.length > 0 ? (
                            selectedContact.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {tag}
                                <button
                                  onClick={() => handleRemoveTag(selectedContact.id, tag)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm">No tags</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => handleAddTagClick(selectedContact)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Tag
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <Info className="h-4 w-4" /> Status Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">WhatsApp Status:</span>
                            <Badge
                              variant="outline"
                              className={
                                selectedContact.whatsappOptIn
                                  ? ""
                                  : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900"
                              }
                            >
                              {selectedContact.whatsappOptIn ? "Subscribed" : "Unsubscribed"}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Created:</span>
                            <span>{format(new Date(selectedContact.createdAt), "MMM dd, yyyy")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Contact:</span>
                            <span>
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
                  {selectedContact.customFields &&
                    Object.keys(selectedContact.customFields).length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium text-sm mb-3">Custom Fields</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(selectedContact.customFields).map(([key, value]) => {
                            if (!value) return null;
                            const field = customFields.find(f => f.key === key);
                            if (!field) return null;

                            return (
                              <div key={key} className="flex flex-col p-2 border rounded-md">
                                <span className="text-xs text-muted-foreground">
                                  {field.name}
                                </span>
                                <span className="font-medium">
                                  {field.type === 'Date' && typeof value === 'string'
                                    ? format(new Date(value), "MMM dd, yyyy")
                                    : String(value)
                                  }
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {selectedContact.notes && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Notes</h4>
                      <div className="bg-muted/40 p-3 rounded-md text-sm">
                        {selectedContact.notes}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="pt-4">
                  <div className="text-center py-8">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">Conversation History</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      View past messages and interaction history
                    </p>
                    <Button
                      onClick={() => handleSendMessage(selectedContact.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Conversations
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Edit Contact</h4>
                        <p className="text-sm text-muted-foreground">
                          Update contact information and details
                        </p>
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

                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Tag Management</h4>
                        <p className="text-sm text-muted-foreground">
                          Add or remove tags from this contact
                        </p>
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

                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-red-600">Delete Contact</h4>
                        <p className="text-sm text-muted-foreground">
                          Permanently remove this contact
                        </p>
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
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Tag Dialog */}
        <Dialog open={isAddTagDialogOpen} onOpenChange={setIsAddTagDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedContacts.length > 1
                  ? `Add Tag to ${selectedContacts.length} Contacts`
                  : "Add Tag to Contact"}
              </DialogTitle>
              <DialogDescription>
                Tags help you organize and segment your contacts.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-tag">Tag Name</Label>
                <Input
                  id="new-tag"
                  placeholder="Enter tag name (e.g. customer, premium)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
              </div>

              {allTags.length > 0 && (
                <div className="space-y-2">
                  <Label>Choose from existing tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => setNewTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTagDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={selectedContacts.length > 1 ? handleBulkAddTag : handleAddTag}
                disabled={!newTag.trim()}
              >
                Add Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Tag Dialog */}
        <Dialog open={isEditTagDialogOpen} onOpenChange={setIsEditTagDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
              <DialogDescription>
                Update tag name for this contact.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="updated-tag">New Tag Name</Label>
                <Input
                  id="updated-tag"
                  placeholder="Enter updated tag name"
                  value={updatedTag}
                  onChange={(e) => setUpdatedTag(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditTagDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleEditTag}
                disabled={!updatedTag.trim() || updatedTag === oldTag}
              >
                Update Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
    </Layout>
  );
}
