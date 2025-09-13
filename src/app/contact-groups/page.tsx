"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Users,
    Search,
    Edit,
    Trash2,
    MoreVertical,
    Eye,
    Copy,
    Filter,
    Grid3X3,
    List,
    UserPlus,
    X,
    Palette,
    Tag as TagIcon,
    MessageSquare,
    AlertCircle,
    CheckCircle,
    FilterX,
    RefreshCw,
    ChevronUp,
    ChevronDown,
    Calendar,
    Settings
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
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AudienceFilter from "@/components/filters/AudienceFilter";

interface Contact {
    id: string;
    name: string;
    phone: string;
    email?: string;
    whatsappOptIn: boolean;
    tags: string[];
}

interface ContactGroup {
    id: string;
    name: string;
    description?: string;
    contacts?: Contact[];
    contactCount: number;
    color: string;
    createdAt: string;
    updatedAt: string;
}

const DEFAULT_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
    '#6366F1', '#84CC16', '#F43F5E', '#06B6D4'
];

export default function ContactGroupsPage() {
    const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [contactSearchQuery, setContactSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [availableTags, setAvailableTags] = useState<string[]>([]);

    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Selected items
    const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);
    const [selectedContactsForGroup, setSelectedContactsForGroup] = useState<string[]>([]);
    // Add state for showing/hiding filters
    const [showFilters, setShowFilters] = useState(false);
    // Form states
    const [newGroup, setNewGroup] = useState({
        name: "",
        description: "",
        color: DEFAULT_COLORS[0],
        contacts: [] as string[]
    });

    const [editGroup, setEditGroup] = useState({
        id: "",
        name: "",
        description: "",
        color: DEFAULT_COLORS[0],
        contacts: [] as string[]
    });

    // Filter states
    const [appliedFilters, setAppliedFilters] = useState<any>(null);

    const { toast } = useToast();

    // Sample trait and event fields - customize based on your Contact model
    const traitFields = [
        { label: "Name", key: "name", type: "text" as const },
        { label: "Phone", key: "phone", type: "text" as const },
        { label: "Email", key: "email", type: "text" as const },
        { label: "Country Code", key: "countryCode", type: "text" as const },
        { label: "WhatsApp Opt In", key: "whatsappOptIn", type: "select" as const, options: ["true", "false"] },
        { label: "Notes", key: "notes", type: "text" as const },
        { label: "Created Date", key: "createdAt", type: "date" as const },
        { label: "Last Message Date", key: "lastMessageAt", type: "date" as const },
    ];

    const eventFields = [
        { label: "Last Login", key: "lastLogin", type: "date" as const },
        { label: "Message Count", key: "messageCount", type: "number" as const },
        { label: "Campaign Interactions", key: "campaignInteractions", type: "number" as const },
    ];

    // Fetch contact groups
    const fetchContactGroups = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);

            const response = await fetch(`/api/contact-groups?${params}`);
            const data = await response.json();

            if (data.success) {
                setContactGroups(data.groups);
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to fetch contact groups",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error fetching contact groups:', error);
            toast({
                title: "Error",
                description: "Failed to fetch contact groups",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch contacts with filtering capability
    // const fetchFilteredContacts = async (filters?: any) => {
    //     setIsLoadingContacts(true);
    //     try {
    //         const params = new URLSearchParams();
    //         if (contactSearchQuery) params.append('search', contactSearchQuery);
    //         if (filters) params.append('filters', JSON.stringify(filters));

    //         const response = await fetch(`/api/contacts?${params}`);
    //         const data = await response.json();

    //         if (data.success) {
    //             setFilteredContacts(data.contacts);
    //             // Extract unique tags
    //             const allTags = data.contacts.flatMap((contact: Contact) => contact.tags || []);
    //             setAvailableTags([...new Set(allTags)]);
    //         } else {
    //             toast({
    //                 title: "Error",
    //                 description: "Failed to fetch contacts",
    //                 variant: "destructive",
    //             });
    //         }
    //     } catch (error) {
    //         console.error('Error fetching contacts:', error);
    //         toast({
    //             title: "Error",
    //             description: "Failed to fetch contacts",
    //             variant: "destructive",
    //         });
    //     } finally {
    //         setIsLoadingContacts(false);
    //     }
    // };

    // Fetch contacts for group creation/editing
    const fetchContacts = async () => {
        try {
            const response = await fetch('/api/contacts');
            const data = await response.json();

            if (data.success) {
                setContacts(data.contacts);
                setFilteredContacts(data.contacts);
                // Extract unique tags
                const allTags = data.contacts.flatMap((contact: Contact) => contact.tags || []);
                setAvailableTags([...new Set(allTags)]);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    useEffect(() => {
        fetchContactGroups();
    }, [searchQuery]);

    useEffect(() => {
        fetchContacts();
    }, []);

    // Fix the useEffect for contact search to include contacts dependency
    useEffect(() => {
        if (!contactSearchQuery && !appliedFilters) {
            setFilteredContacts(contacts);
        } else {
            fetchFilteredContacts(appliedFilters);
        }
    }, [contactSearchQuery, contacts, appliedFilters]); // Add contacts and appliedFilters as dependencies

    // Update the handleApplyFilters function to ensure it triggers re-fetch
    // Apply audience filters using API
    const handleApplyFilters = async (filters: any) => {
        try {
            setIsLoadingContacts(true);

            // Clear selected contacts when filters are applied
            setSelectedContacts([]);

            // Build query parameters for the API
            const queryParams = new URLSearchParams();

            // Add audience filters as a single parameter
            if (filters) {
                queryParams.append('audienceFilters', JSON.stringify(filters));
            }

            // Fetch filtered contacts from API
            const response = await fetch(`/api/contacts?${queryParams.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch filtered contacts');
            }

            const data = await response.json();

            if (data.success) {
                const filteredContacts = data.contacts || [];
                setFilteredContacts(filteredContacts);
                setAudienceCount(filteredContacts.length);

                // Update campaign audience
                setCampaign(prev => ({
                    ...prev,
                    audience: {
                        filters,
                        count: filteredContacts.length,
                        selectedContacts: [] // Clear selected contacts when using filters
                    }
                }));

                toast({
                    title: "Success",
                    description: `Audience filtered to ${filteredContacts.length} contacts`,
                });
            } else {
                throw new Error(data.error || 'Failed to filter contacts');
            }
        } catch (error) {
            console.error('Error applying filters:', error);
            toast({
                title: "Error",
                description: "Failed to apply audience filters",
                variant: "destructive",
            });
        } finally {
            setIsLoadingContacts(false);
        }
    };

    // Update fetchFilteredContacts to handle the filter structure properly
    const fetchFilteredContacts = async (filters?: any) => {
        setIsLoadingContacts(true);
        try {
            const params = new URLSearchParams();
            if (contactSearchQuery) params.append('search', contactSearchQuery);

            // Debug: Log what we're sending
            console.log('Sending filters to API:', filters);

            if (filters) {
                // Your API expects 'audienceFilters' not 'filters'
                params.append('audienceFilters', JSON.stringify(filters));
            }

            console.log('API URL:', `/api/contacts?${params.toString()}`);

            const response = await fetch(`/api/contacts?${params.toString()}`);
            const data = await response.json();

            console.log('API Response:', data);

            if (data.success) {
                setFilteredContacts(data.contacts);
                // Extract unique tags
                const allTags = data.contacts.flatMap((contact: Contact) => contact.tags || []);
                setAvailableTags([...new Set(allTags)]);

                console.log(`Filtered contacts: ${data.contacts.length} contacts found`);
            } else {
                console.error('API Error:', data.error);
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
            setIsLoadingContacts(false);
        }
    };



    // Add a debug function to test filters manually
    const debugFilters = () => {
        console.log('Current applied filters:', appliedFilters);
        console.log('Available tags:', availableTags);
        console.log('Filtered contacts:', filteredContacts.length);
        console.log('All contacts:', contacts.length);
    };

    // Clear all filters
    const handleClearFilters = () => {
        setAppliedFilters(null);
        setContactSearchQuery("");
        setFilteredContacts(contacts);
    };

    // Create contact group
    const handleCreateGroup = async () => {
        if (!newGroup.name.trim()) {
            toast({
                title: "Error",
                description: "Group name is required",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await fetch('/api/contact-groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newGroup.name,
                    description: newGroup.description,
                    color: newGroup.color,
                    contacts: newGroup.contacts
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Contact group created successfully",
                });
                setIsCreateDialogOpen(false);
                setNewGroup({
                    name: "",
                    description: "",
                    color: DEFAULT_COLORS[0],
                    contacts: []
                });
                fetchContactGroups();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to create contact group",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error creating contact group:', error);
            toast({
                title: "Error",
                description: "Failed to create contact group",
                variant: "destructive",
            });
        }
    };

    // Edit contact group
    const handleEditGroup = async () => {
        if (!editGroup.name.trim()) {
            toast({
                title: "Error",
                description: "Group name is required",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await fetch(`/api/contact-groups/${editGroup.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editGroup.name,
                    description: editGroup.description,
                    color: editGroup.color,
                    contacts: editGroup.contacts
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Contact group updated successfully",
                });
                setIsEditDialogOpen(false);
                fetchContactGroups();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to update contact group",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error updating contact group:', error);
            toast({
                title: "Error",
                description: "Failed to update contact group",
                variant: "destructive",
            });
        }
    };

    // Delete contact group
    const handleDeleteGroup = async () => {
        if (!selectedGroup) return;

        try {
            const response = await fetch(`/api/contact-groups/${selectedGroup.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Contact group deleted successfully",
                });
                setIsDeleteDialogOpen(false);
                setSelectedGroup(null);
                fetchContactGroups();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to delete contact group",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error deleting contact group:', error);
            toast({
                title: "Error",
                description: "Failed to delete contact group",
                variant: "destructive",
            });
        }
    };

    // Handle view group with full contact details
    const handleViewGroup = async (group: ContactGroup) => {
        try {
            const response = await fetch(`/api/contact-groups/${group.id}?includeContacts=true`);
            const data = await response.json();

            if (data.success) {
                setSelectedGroup(data.group);
                setIsViewDialogOpen(true);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to load group details",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error fetching group details:', error);
            toast({
                title: "Error",
                description: "Failed to load group details",
                variant: "destructive",
            });
        }
    };

    // Handle edit group click
    const handleEditGroupClick = (group: ContactGroup) => {
        setEditGroup({
            id: group.id,
            name: group.name,
            description: group.description || "",
            color: group.color,
            contacts: group.contacts?.map(c => c.id) || []
        });
        setIsEditDialogOpen(true);
    };

    // Handle delete group click
    const handleDeleteGroupClick = (group: ContactGroup) => {
        setSelectedGroup(group);
        setIsDeleteDialogOpen(true);
    };

    // Toggle contact selection for group creation/editing
    const toggleContactSelection = (contactId: string, isNewGroup: boolean = true) => {
        if (isNewGroup) {
            setNewGroup(prev => ({
                ...prev,
                contacts: prev.contacts.includes(contactId)
                    ? prev.contacts.filter(id => id !== contactId)
                    : [...prev.contacts, contactId]
            }));
        } else {
            setEditGroup(prev => ({
                ...prev,
                contacts: prev.contacts.includes(contactId)
                    ? prev.contacts.filter(id => id !== contactId)
                    : [...prev.contacts, contactId]
            }));
        }
    };

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
                                            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 animate-pulse" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent wark:from-white wark:to-slate-200">
                                                Contact Groups
                                            </h1>
                                            <p className="text-slate-600 wark:text-slate-300 font-medium">
                                                Create and manage broadcast lists for targeted campaigns
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Stats Pills */}
                                    <div className="flex items-center gap-3 mt-4">
                                        <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                                                {contactGroups.length} Groups
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                                                {contactGroups.reduce((sum, group) => sum + group.contactCount, 0)} Total Contacts
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-full bg-white wark:bg-slate-800 border border-slate-200 wark:border-slate-700 px-3 py-1.5 shadow-sm">
                                            <div className="h-2 w-2 rounded-full bg-purple-500" />
                                            <span className="text-xs font-medium text-slate-700 wark:text-slate-300">
                                                Broadcast Ready
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={() => setIsCreateDialogOpen(true)}
                                        className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create Group
                                    </Button>
                                </div>
                            </div>
                            {/* Filters & Controls */}
                            <Card className="border-0 p-0 shadow-sm bg-white/80 backdrop-blur-sm">
                                <CardContent className="p-4">
                                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                                            <div className="relative flex-1 max-w-md">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                                <Input
                                                    placeholder="Search contact groups..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-10 bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                                                <Button
                                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                                    size="sm"
                                                    onClick={() => setViewMode('grid')}
                                                    className="h-8 px-3"
                                                >
                                                    <Grid3X3 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                                    size="sm"
                                                    onClick={() => setViewMode('list')}
                                                    className="h-8 px-3"
                                                >
                                                    <List className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

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
                                                <h3 className="text-xl font-semibold text-slate-900 wark:text-white">Loading Contact Groups</h3>
                                                <p className="text-sm text-slate-600 wark:text-slate-300">Fetching your broadcast lists...</p>
                                                <div className="flex items-center gap-1 text-xs text-slate-500 wark:text-slate-400">
                                                    <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                                                    <span>This may take a few seconds</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : contactGroups.length === 0 ? (
                                <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm wark:from-muted/40 wark:to-slate-900/10">
                                    <CardContent className="p-12">
                                        <div className="text-center space-y-8">
                                            <div className="relative mx-auto w-32 h-32">
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                                                    <Users className="h-16 w-16 text-primary" />
                                                </div>
                                                <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center animate-bounce">
                                                    <Plus className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                                                    <MessageSquare className="h-3 w-3 text-white" />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-2xl font-bold text-slate-900 wark:text-white">
                                                    Create your first contact group
                                                </h3>
                                                <p className="text-slate-600 wark:text-slate-300 max-w-md mx-auto leading-relaxed">
                                                    Organize your contacts into targeted groups for more effective campaigns and broadcasts.
                                                </p>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                                <Button
                                                    onClick={() => setIsCreateDialogOpen(true)}
                                                    className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                                    size="lg"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                    Create Your First Group
                                                </Button>
                                            </div>

                                            {/* Feature highlights */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-200 wark:border-slate-700">
                                                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800/50">
                                                    <div className="h-10 w-10 rounded-xl bg-blue-100 wark:bg-blue-900/30 flex items-center justify-center">
                                                        <Filter className="h-5 w-5 text-blue-600 wark:text-blue-400" />
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-medium text-sm text-slate-900 wark:text-white">Smart Filters</div>
                                                        <div className="text-xs text-slate-500 wark:text-slate-400">Advanced targeting</div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800/50">
                                                    <div className="h-10 w-10 rounded-xl bg-green-100 wark:bg-green-900/30 flex items-center justify-center">
                                                        <MessageSquare className="h-5 w-5 text-green-600 wark:text-green-400" />
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-medium text-sm text-slate-900 wark:text-white">Broadcast Ready</div>
                                                        <div className="text-xs text-slate-500 wark:text-slate-400">Instant campaigns</div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 wark:border-slate-700 bg-white wark:bg-slate-800/50">
                                                    <div className="h-10 w-10 rounded-xl bg-purple-100 wark:bg-purple-900/30 flex items-center justify-center">
                                                        <Palette className="h-5 w-5 text-purple-600 wark:text-purple-400" />
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-medium text-sm text-slate-900 wark:text-white">Color Coding</div>
                                                        <div className="text-xs text-slate-500 wark:text-slate-400">Visual organization</div>
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
                                            {contactGroups.map((group) => (
                                                <Card
                                                    key={group.id}
                                                    className="group relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer wark:from-muted/40 wark:to-slate-900/10"
                                                    onClick={() => handleViewGroup(group)}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                                    <CardHeader className="pb-3 relative">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <div
                                                                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border-2 transition-all duration-300 group-hover:scale-110"
                                                                    style={{
                                                                        backgroundColor: `${group.color}20`,
                                                                        borderColor: `${group.color}30`
                                                                    }}
                                                                >
                                                                    <Users className="h-6 w-6" style={{ color: group.color }} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-semibold text-slate-900 wark:text-white group-hover:text-primary transition-colors line-clamp-1 text-base">
                                                                        {group.name}
                                                                    </h3>
                                                                    <p className="text-sm text-slate-600 wark:text-slate-400 line-clamp-2">
                                                                        {group.description || `${group.contactCount} contacts`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
                                                                    <DropdownMenuItem onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleViewGroup(group);
                                                                    }}>
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditGroupClick(group);
                                                                    }}>
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Edit Group
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.location.href = `/campaigns/create?groupId=${group.id}`;
                                                                    }}>
                                                                        <MessageSquare className="h-4 w-4 mr-2" />
                                                                        Create Campaign
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-red-600 focus:text-red-600"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteGroupClick(group);
                                                                        }}
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
                                                            <div className="flex items-center justify-between p-3 bg-slate-50 wark:bg-slate-800/50 rounded-lg border border-slate-200 wark:border-slate-700">
                                                                <div className="flex items-center gap-2">
                                                                    <Users className="h-4 w-4 text-slate-500 wark:text-slate-400" />
                                                                    <span className="text-sm font-medium text-slate-700 wark:text-slate-300">Contacts</span>
                                                                </div>
                                                                <span className="text-sm font-bold text-slate-900 wark:text-white">
                                                                    {group.contactCount.toLocaleString()}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 wark:border-slate-700">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-3 w-3 text-slate-500" />
                                                                    <span className="text-slate-600 wark:text-slate-400">Created</span>
                                                                </div>
                                                                <span className="font-medium text-slate-900 wark:text-white">
                                                                    {format(new Date(group.createdAt), "MMM dd, yyyy")}
                                                                </span>
                                                            </div>

                                                            <Badge
                                                                variant="outline"
                                                                className="w-full justify-center text-xs font-medium"
                                                                style={{
                                                                    borderColor: `${group.color}40`,
                                                                    color: group.color,
                                                                    backgroundColor: `${group.color}10`
                                                                }}
                                                            >
                                                                <div className={`h-2 w-2 rounded-full mr-1 animate-pulse`} style={{ backgroundColor: group.color }} />
                                                                Broadcast Ready
                                                            </Badge>
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
                                                <div className="overflow-x-auto">
                                                    <Table>
                                                        <TableHeader className="bg-[#D9E6DE]   wark:from-slate-800/50 wark:to-slate-900/30">
                                                            <TableRow className="border-b border-slate-200 wark:border-slate-700">
                                                                <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                                                    <div className="flex items-center gap-2">
                                                                        <Users className="h-4 w-4" />
                                                                        Group
                                                                    </div>
                                                                </TableHead>
                                                                <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                                                    <div className="flex items-center gap-2">
                                                                        <TagIcon className="h-4 w-4" />
                                                                        Description
                                                                    </div>
                                                                </TableHead>
                                                                <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                                                    <div className="flex items-center gap-2">
                                                                        <UserPlus className="h-4 w-4" />
                                                                        Contacts
                                                                    </div>
                                                                </TableHead>
                                                                <TableHead className="font-semibold text-slate-700 wark:text-slate-300">
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="h-4 w-4" />
                                                                        Created
                                                                    </div>
                                                                </TableHead>
                                                                <TableHead className="font-semibold text-slate-700 wark:text-slate-300 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <Settings className="h-4 w-4" />
                                                                        Actions
                                                                    </div>
                                                                </TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {contactGroups.map((group, index) => (
                                                                <TableRow
                                                                    key={group.id}
                                                                    className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent wark:hover:from-slate-800/30 wark:hover:to-transparent transition-all duration-200 group border-b border-slate-100 wark:border-slate-800"
                                                                >
                                                                    <TableCell className="py-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <div
                                                                                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm border"
                                                                                style={{
                                                                                    backgroundColor: `${group.color}20`,
                                                                                    borderColor: `${group.color}30`
                                                                                }}
                                                                            >
                                                                                <Users className="h-5 w-5" style={{ color: group.color }} />
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium text-slate-900 wark:text-white">{group.name}</div>
                                                                                <div className="text-xs text-slate-500 wark:text-slate-400">
                                                                                    Group #{index + 1}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <span className="text-sm text-slate-600 wark:text-slate-300">
                                                                            {group.description || (
                                                                                <span className="italic text-slate-400 wark:text-slate-500">No description</span>
                                                                            )}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex items-center gap-2 p-2 bg-slate-50 wark:bg-slate-800/30 rounded-lg border border-slate-200 wark:border-slate-700">
                                                                            <div className="h-6 w-6 rounded bg-blue-100 wark:bg-blue-900/30 flex items-center justify-center">
                                                                                <Users className="h-3 w-3 text-blue-600 wark:text-blue-400" />
                                                                            </div>
                                                                            <span className="font-medium text-slate-900 wark:text-white">{group.contactCount.toLocaleString()}</span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="text-sm">
                                                                            <div className="font-medium text-slate-900 wark:text-white">
                                                                                {format(new Date(group.createdAt), "MMM dd, yyyy")}
                                                                            </div>
                                                                            <div className="text-slate-500 wark:text-slate-400 text-xs">
                                                                                {format(new Date(group.createdAt), "HH:mm")}
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex justify-end gap-1">
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={() => handleViewGroup(group)}
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
                                                                                        onClick={() => window.location.href = `/campaigns/create?groupId=${group.id}`}
                                                                                        className="h-8 w-8 p-0 hover:bg-green-100 wark:hover:bg-green-900/30"
                                                                                    >
                                                                                        <MessageSquare className="h-3.5 w-3.5 text-green-600 wark:text-green-400" />
                                                                                    </Button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Create Campaign</TooltipContent>
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
                                                                                    <DropdownMenuItem onClick={() => handleEditGroupClick(group)}>
                                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                                        Edit Group
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem
                                                                                        className="text-red-600 focus:text-red-600"
                                                                                        onClick={() => handleDeleteGroupClick(group)}
                                                                                    >
                                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                                        Delete Group
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        </div>
                                                                    </TableCell>
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

                            {/* Create Group Dialog */}
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0">
                                    <DialogHeader className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                                                <UserPlus className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <DialogTitle className="text-xl font-semibold text-slate-900">
                                                    Create Contact Group
                                                </DialogTitle>
                                                <DialogDescription className="text-slate-600">
                                                    Create a new broadcast list to organize your contacts
                                                </DialogDescription>
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <div className="flex-1 overflow-y-auto px-6 py-6">
                                        <div className="space-y-6">
                                            {/* Basic Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                        Basic Information
                                                    </h3>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="group-name" className="text-sm font-medium text-slate-700">
                                                            Group Name <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="group-name"
                                                            placeholder="e.g., Mumbai Customers, VIP Clients"
                                                            value={newGroup.name}
                                                            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                                            className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">
                                                            Color
                                                        </Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {DEFAULT_COLORS.map((color) => (
                                                                <button
                                                                    key={color}
                                                                    type="button"
                                                                    className={cn(
                                                                        "w-8 h-8 rounded-full border-2 transition-all",
                                                                        newGroup.color === color
                                                                            ? "border-slate-400 scale-110"
                                                                            : "border-slate-200 hover:border-slate-300"
                                                                    )}
                                                                    style={{ backgroundColor: color }}
                                                                    onClick={() => setNewGroup({ ...newGroup, color })}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="group-description" className="text-sm font-medium text-slate-700">
                                                        Description
                                                    </Label>
                                                    <Textarea
                                                        id="group-description"
                                                        placeholder="Brief description of this contact group..."
                                                        value={newGroup.description}
                                                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                                        rows={3}
                                                        className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Contact Selection with Advanced Filters */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                            Select Contacts
                                                        </h3>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {newGroup.contacts.length} of {filteredContacts.length} selected
                                                    </div>
                                                </div>

                                                {/* Contact Search */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative flex-1">
                                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                                            <Input
                                                                placeholder="Search contacts by name or phone..."
                                                                value={contactSearchQuery}
                                                                onChange={(e) => setContactSearchQuery(e.target.value)}
                                                                className="pl-10 bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setShowFilters(!showFilters)}
                                                            className={cn(
                                                                "gap-2",
                                                                showFilters && "bg-primary/5 border-primary/20"
                                                            )}
                                                        >
                                                            <Filter className="h-4 w-4" />
                                                            Filters
                                                            {showFilters ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => fetchContacts()}
                                                            disabled={isLoadingContacts}
                                                        >
                                                            <RefreshCw className={cn("h-4 w-4", isLoadingContacts && "animate-spin")} />
                                                        </Button>
                                                        {appliedFilters && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleClearFilters}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <FilterX className="h-4 w-4 mr-2" />
                                                                Clear Filters
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Advanced Filters - Collapsible */}
                                                    {showFilters && (
                                                        <div className="animate-in slide-in-from-top-2 duration-200">
                                                            <AudienceFilter
                                                                tags={availableTags}
                                                                traitFields={traitFields}
                                                                eventFields={eventFields}
                                                                contactGroups={[]} // Don't show contact groups in the filter when creating a new group
                                                                onApplyFilters={handleApplyFilters}
                                                                initialFilters={appliedFilters}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Contact List */}
                                                <Card className="max-h-96 overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-medium">
                                                                    {isLoadingContacts ? "Loading contacts..." : "Available Contacts"}
                                                                </h4>
                                                                {appliedFilters && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        Filtered
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setNewGroup({ ...newGroup, contacts: [] })}
                                                                    disabled={newGroup.contacts.length === 0}
                                                                >
                                                                    Clear All
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setNewGroup({ ...newGroup, contacts: filteredContacts.map(c => c.id) })}
                                                                    disabled={newGroup.contacts.length === filteredContacts.length || filteredContacts.length === 0}
                                                                >
                                                                    Select All
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <ScrollArea className="h-80 px-6 pb-6">
                                                        {isLoadingContacts ? (
                                                            <div className="flex items-center justify-center py-8">
                                                                <div className="flex items-center gap-2">
                                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                                    <span className="text-sm text-muted-foreground">Loading contacts...</span>
                                                                </div>
                                                            </div>
                                                        ) : filteredContacts.length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                                <Users className="h-12 w-12 text-muted-foreground mb-3" />
                                                                <p className="text-muted-foreground font-medium">No contacts found</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {appliedFilters || contactSearchQuery
                                                                        ? "Try adjusting your filters or search terms"
                                                                        : "You haven't added any contacts yet"
                                                                    }
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {filteredContacts.map((contact) => (
                                                                    <div
                                                                        key={contact.id}
                                                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                                                    >
                                                                        <Checkbox
                                                                            checked={newGroup.contacts.includes(contact.id)}
                                                                            onCheckedChange={() => toggleContactSelection(contact.id, true)}
                                                                        />
                                                                        <Avatar className="h-8 w-8">
                                                                            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                                                                {contact.name.charAt(0).toUpperCase()}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1">
                                                                            <div className="font-medium text-sm">{contact.name}</div>
                                                                            <div className="text-xs text-muted-foreground">{contact.phone}</div>
                                                                            {contact.email && (
                                                                                <div className="text-xs text-muted-foreground">{contact.email}</div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge
                                                                                variant="outline"
                                                                                className={cn(
                                                                                    "text-xs",
                                                                                    contact.whatsappOptIn
                                                                                        ? "bg-green-100 text-green-700 border-green-200"
                                                                                        : "bg-red-100 text-red-700 border-red-200"
                                                                                )}
                                                                            >
                                                                                {contact.whatsappOptIn ? "Opted In" : "Opted Out"}
                                                                            </Badge>
                                                                            {contact.tags && contact.tags.length > 0 && (
                                                                                <div className="flex gap-1">
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
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </ScrollArea>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsCreateDialogOpen(false)}
                                            className="hover:bg-slate-50"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleCreateGroup}
                                            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Create Group
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* Edit Group Dialog */}
                            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0">
                                    <DialogHeader className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                                                <Edit className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <DialogTitle className="text-xl font-semibold text-slate-900">
                                                    Edit Contact Group
                                                </DialogTitle>
                                                <DialogDescription className="text-slate-600">
                                                    Update group information and manage contacts
                                                </DialogDescription>
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <div className="flex-1 overflow-y-auto px-6 py-6">
                                        <div className="space-y-6">
                                            {/* Basic Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                        Basic Information
                                                    </h3>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-group-name" className="text-sm font-medium text-slate-700">
                                                            Group Name <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="edit-group-name"
                                                            placeholder="e.g., Mumbai Customers, VIP Clients"
                                                            value={editGroup.name}
                                                            onChange={(e) => setEditGroup({ ...editGroup, name: e.target.value })}
                                                            className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">
                                                            Color
                                                        </Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {DEFAULT_COLORS.map((color) => (
                                                                <button
                                                                    key={color}
                                                                    type="button"
                                                                    className={cn(
                                                                        "w-8 h-8 rounded-full border-2 transition-all",
                                                                        editGroup.color === color
                                                                            ? "border-slate-400 scale-110"
                                                                            : "border-slate-200 hover:border-slate-300"
                                                                    )}
                                                                    style={{ backgroundColor: color }}
                                                                    onClick={() => setEditGroup({ ...editGroup, color })}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="edit-group-description" className="text-sm font-medium text-slate-700">
                                                        Description
                                                    </Label>
                                                    <Textarea
                                                        id="edit-group-description"
                                                        placeholder="Brief description of this contact group..."
                                                        value={editGroup.description}
                                                        onChange={(e) => setEditGroup({ ...editGroup, description: e.target.value })}
                                                        rows={3}
                                                        className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Contact Selection with Advanced Filters */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                            Select Contacts
                                                        </h3>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {editGroup.contacts.length} of {filteredContacts.length} selected
                                                    </div>
                                                </div>

                                                {/* Contact Search */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative flex-1">
                                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                                            <Input
                                                                placeholder="Search contacts by name or phone..."
                                                                value={contactSearchQuery}
                                                                onChange={(e) => setContactSearchQuery(e.target.value)}
                                                                className="pl-10 bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => fetchContacts()}
                                                            disabled={isLoadingContacts}
                                                        >
                                                            <RefreshCw className={cn("h-4 w-4", isLoadingContacts && "animate-spin")} />
                                                        </Button>
                                                        {appliedFilters && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleClearFilters}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <FilterX className="h-4 w-4 mr-2" />
                                                                Clear Filters
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Advanced Filters */}
                                                    <AudienceFilter
                                                        tags={availableTags}
                                                        traitFields={traitFields}
                                                        eventFields={eventFields}
                                                        contactGroups={contactGroups.filter(g => g.id !== editGroup.id)} // Exclude current group
                                                        onApplyFilters={handleApplyFilters}
                                                        initialFilters={appliedFilters}
                                                    />
                                                </div>

                                                {/* Contact List */}
                                                <Card className="max-h-96 overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-medium">
                                                                    {isLoadingContacts ? "Loading contacts..." : "Available Contacts"}
                                                                </h4>
                                                                {appliedFilters && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        Filtered
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setEditGroup({ ...editGroup, contacts: [] })}
                                                                    disabled={editGroup.contacts.length === 0}
                                                                >
                                                                    Clear All
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setEditGroup({ ...editGroup, contacts: filteredContacts.map(c => c.id) })}
                                                                    disabled={editGroup.contacts.length === filteredContacts.length || filteredContacts.length === 0}
                                                                >
                                                                    Select All
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <ScrollArea className="h-80 px-6 pb-6">
                                                        {isLoadingContacts ? (
                                                            <div className="flex items-center justify-center py-8">
                                                                <div className="flex items-center gap-2">
                                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                                    <span className="text-sm text-muted-foreground">Loading contacts...</span>
                                                                </div>
                                                            </div>
                                                        ) : filteredContacts.length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                                <Users className="h-12 w-12 text-muted-foreground mb-3" />
                                                                <p className="text-muted-foreground font-medium">No contacts found</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {appliedFilters || contactSearchQuery
                                                                        ? "Try adjusting your filters or search terms"
                                                                        : "You haven't added any contacts yet"
                                                                    }
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {filteredContacts.map((contact) => (
                                                                    <div
                                                                        key={contact.id}
                                                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                                                    >
                                                                        <Checkbox
                                                                            checked={editGroup.contacts.includes(contact.id)}
                                                                            onCheckedChange={() => toggleContactSelection(contact.id, false)}
                                                                        />
                                                                        <Avatar className="h-8 w-8">
                                                                            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                                                                {contact.name.charAt(0).toUpperCase()}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1">
                                                                            <div className="font-medium text-sm">{contact.name}</div>
                                                                            <div className="text-xs text-muted-foreground">{contact.phone}</div>
                                                                            {contact.email && (
                                                                                <div className="text-xs text-muted-foreground">{contact.email}</div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge
                                                                                variant="outline"
                                                                                className={cn(
                                                                                    "text-xs",
                                                                                    contact.whatsappOptIn
                                                                                        ? "bg-green-100 text-green-700 border-green-200"
                                                                                        : "bg-red-100 text-red-700 border-red-200"
                                                                                )}
                                                                            >
                                                                                {contact.whatsappOptIn ? "Opted In" : "Opted Out"}
                                                                            </Badge>
                                                                            {contact.tags && contact.tags.length > 0 && (
                                                                                <div className="flex gap-1">
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
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </ScrollArea>
                                                </Card>
                                            </div>
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
                                            onClick={handleEditGroup}
                                            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* View Group Dialog */}
                            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                                <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0">
                                    <DialogHeader className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                                                <Eye className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <DialogTitle className="text-xl font-semibold text-slate-900">
                                                    {selectedGroup?.name}
                                                </DialogTitle>
                                                <DialogDescription className="text-slate-600">
                                                    {selectedGroup?.contactCount} contacts in this group
                                                </DialogDescription>
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <div className="flex-1 overflow-y-auto px-6 py-6">
                                        {selectedGroup && (
                                            <div className="space-y-6">
                                                {/* Group Info */}
                                                <Card>
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-center justify-between">
                                                            <CardTitle className="text-base">Contacts in Group</CardTitle>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setIsViewDialogOpen(false);
                                                                        setTimeout(() => handleEditGroupClick(selectedGroup), 100);
                                                                    }}
                                                                >
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit Group
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => window.location.href = `/campaigns/create?groupId=${selectedGroup.id}`}
                                                                >
                                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                                    Create Campaign
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {selectedGroup.contacts && selectedGroup.contacts.length > 0 ? (
                                                            <ScrollArea className="h-96">
                                                                <div className="space-y-3">
                                                                    {selectedGroup.contacts.map((contact) => (
                                                                        <div
                                                                            key={contact.id}
                                                                            className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-slate-50 transition-colors"
                                                                        >
                                                                            <Avatar className="h-10 w-10">
                                                                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                                                    {contact.name.charAt(0).toUpperCase()}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <div className="flex-1">
                                                                                <div className="font-medium text-slate-900">{contact.name}</div>
                                                                                <div className="text-sm text-muted-foreground">{contact.phone}</div>
                                                                                {contact.email && (
                                                                                    <div className="text-sm text-muted-foreground">{contact.email}</div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className={cn(
                                                                                        "text-xs",
                                                                                        contact.whatsappOptIn
                                                                                            ? "bg-green-100 text-green-700 border-green-200"
                                                                                            : "bg-red-100 text-red-700 border-red-200"
                                                                                    )}
                                                                                >
                                                                                    {contact.whatsappOptIn ? (
                                                                                        <>
                                                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                                                            Opted In
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <X className="h-3 w-3 mr-1" />
                                                                                            Opted Out
                                                                                        </>
                                                                                    )}
                                                                                </Badge>
                                                                                {contact.tags && contact.tags.length > 0 && (
                                                                                    <div className="flex gap-1">
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
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </ScrollArea>
                                                        ) : (
                                                            <div className="text-center py-8">
                                                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                                                <p className="text-muted-foreground">No contacts in this group yet</p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Delete Confirmation Dialog */}
                            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <AlertDialogContent className="sm:max-w-md">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5" />
                                            Delete Contact Group?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. The contact group &quot;{selectedGroup?.name}&quot; will be permanently deleted.
                                            The contacts themselves will not be deleted.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    {selectedGroup && (
                                        <div className="py-4">
                                            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: `${selectedGroup.color}20`, border: `1px solid ${selectedGroup.color}30` }}
                                                >
                                                    <Users className="h-5 w-5" style={{ color: selectedGroup.color }} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{selectedGroup.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {selectedGroup.contactCount} contacts
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteGroup}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            Delete Group
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </TooltipProvider>
            </Layout>
        </ProtectedRoute>
    );
}
