"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Users,
    UserPlus,
    Shield,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Eye,
    Search,
    Filter,
    Mail,
    Calendar,
    Crown,
    ArrowRight,
    Activity,
    Clock,
    Settings,
    UserCheck,
    AlertTriangle,
    TrendingUp,
    Globe,
    Zap,
    Sparkles,
} from "lucide-react";

interface Role {
    _id: string;
    name: string;
    description?: string;
    permissions: {
        resource: string;
        actions: string[];
    }[];
    isDefault: boolean;
}

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    roleId?: Role;
    isActive: boolean;
    lastLoginAt?: string;
    invitedBy?: {
        name: string;
        email: string;
    };
    invitedAt?: string;
    createdAt: string;
}

interface TeamLimitInfo {
    currentCount: number;
    limit: number;
    canAddMore: boolean;
    plan: string;
    planName: string;
    subscriptionStatus: string;
    remainingSlots: number;
}

export default function AgentsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState<string>("all");

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const { toast } = useToast();

    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        roleId: "",
        role: "agent",
    });

    const [editUser, setEditUser] = useState({
        id: "",
        name: "",
        email: "",
        roleId: "",
        isActive: true,
        role: "agent",
    });

    const [teamLimitInfo, setTeamLimitInfo] = useState<TeamLimitInfo | null>(null);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchTeamLimitInfo();
    }, []);
    const fetchTeamLimitInfo = async () => {
        try {
            const response = await fetch('/api/users/team-limit');
            const data = await response.json();

            if (data.success) {
                setTeamLimitInfo(data.data);
            }
        } catch (error) {
            console.error('Error fetching team limit info:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();

            if (data.success) {
                // Additional client-side sorting to ensure consistency
                const sortedUsers = data.users.sort((a: User, b: User) => {
                    // Define role hierarchy weights
                    const getRoleWeight = (user: User) => {
                        if (user.isOwner || user.role === 'owner') return 3;
                        if (user.role === 'admin') return 2;
                        return 1; // agents and other roles
                    };

                    const weightA = getRoleWeight(a);
                    const weightB = getRoleWeight(b);

                    // Sort by role weight (descending), then by creation date (newest first)
                    if (weightA !== weightB) {
                        return weightB - weightA;
                    }

                    // If same role weight, sort by creation date (newest first)
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });

                setUsers(sortedUsers);
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to fetch users",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: "Error",
                description: "Failed to fetch users",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/roles');
            const data = await response.json();

            if (data.success) {
                setRoles(data.roles);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Team member added successfully",
                });
                setIsAddDialogOpen(false);
                setNewUser({
                    name: "",
                    email: "",
                    password: "",
                    roleId: "",
                    role: "agent",
                });
                fetchUsers();
                fetchTeamLimitInfo(); // Refresh team limit info
            } else {
                // Handle specific error codes
                if (data.code === 'TEAM_LIMIT_REACHED') {
                    toast({
                        title: "Team Limit Reached",
                        description: `You've reached the ${data.limit} team member limit for your ${data.plan} plan. Upgrade to add more members.`,
                        variant: "destructive",
                        action: (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = '/settings/billing'}
                                className="ml-2"
                            >
                                Upgrade Plan
                            </Button>
                        ),
                    });
                } else if (data.code === 'SUBSCRIPTION_INACTIVE') {
                    toast({
                        title: "Subscription Required",
                        description: "Your subscription is not active. Please upgrade or renew your plan to add team members.",
                        variant: "destructive",
                        action: (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = '/settings/billing'}
                                className="ml-2"
                            >
                                View Billing
                            </Button>
                        ),
                    });
                } else {
                    toast({
                        title: "Error",
                        description: data.message || "Failed to add team member",
                        variant: "destructive",
                    });
                }
            }
        } catch (error) {
            console.error('Error creating user:', error);
            toast({
                title: "Error",
                description: "Failed to add team member",
                variant: "destructive",
            });
        }
    };
    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'starter': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'growth': return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'advanced': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'enterprise': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getPlanIcon = (plan: string) => {
        switch (plan) {
            case 'starter': return <Zap className="h-4 w-4" />;
            case 'growth': return <TrendingUp className="h-4 w-4" />;
            case 'advanced': return <Sparkles className="h-4 w-4" />;
            case 'enterprise': return <Crown className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };
    const handleUpdateUser = async () => {
        if (!editUser.name || !editUser.email) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await fetch(`/api/users/${editUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editUser.name,
                    email: editUser.email,
                    roleId: editUser.roleId,
                    isActive: editUser.isActive,
                    role: editUser.role,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Team member updated successfully",
                });
                setIsEditDialogOpen(false);
                fetchUsers();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to update team member",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast({
                title: "Error",
                description: "Failed to update team member",
                variant: "destructive",
            });
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        try {
            const response = await fetch(`/api/users/${selectedUser._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Team member removed successfully",
                });
                setIsDeleteDialogOpen(false);
                setSelectedUser(null);
                fetchUsers();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to remove team member",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast({
                title: "Error",
                description: "Failed to remove team member",
                variant: "destructive",
            });
        }
    };

    const handleEditClick = (user: User) => {
        setEditUser({
            id: user._id,
            name: user.name,
            email: user.email,
            roleId: user.roleId?._id || "",
            isActive: user.isActive,
            role: user.role,
        });
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    const handleViewClick = (user: User) => {
        setSelectedUser(user);
        setIsViewDialogOpen(true);
    };

    const getResourceIcon = (resource: string) => {
        switch (resource) {
            case 'conversations':
                return '💬';
            case 'templates':
                return '📝';
            case 'dashboard':
                return '📊';
            case 'automations':
                return '🤖';
            case 'contacts':
                return '👥';
            case 'integrations':
                return '🔗';
            case 'analytics':
                return '📈';
            case 'settings':
                return '⚙️';
            default:
                return '📄';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner':
                return <Crown className="h-4 w-4 text-yellow-500" />;
            case 'admin':
                return <Shield className="h-4 w-4 text-blue-500" />;
            case 'agent':
                return <UserCheck className="h-4 w-4 text-green-500" />;
            default:
                return <UserCheck className="h-4 w-4 text-gray-500" />;
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === "all" || user.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        admins: users.filter(u => u.role === 'admin').length,
        agents: users.filter(u => u.role === 'agent').length,
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 wark:from-gray-900 wark:via-gray-800 wark:to-gray-900">
                <div className=" mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent wark:from-white wark:to-gray-300">
                                            Team Management
                                        </h1>
                                        <p className="text-gray-600 wark:text-gray-400">
                                            Manage your team members and their permissions
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    className="border-2 border-dashed border-gray-300 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                                    onClick={() => window.location.href = '/settings/roles'}
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Manage Roles
                                </Button>
                                <Button
                                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                                    onClick={() => {
                                        if (teamLimitInfo && !teamLimitInfo.canAddMore) {
                                            if (teamLimitInfo.subscriptionStatus !== 'active') {
                                                toast({
                                                    title: "Subscription Required",
                                                    description: "Your subscription is not active. Please upgrade or renew your plan to add team members.",
                                                    variant: "destructive",
                                                    action: (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.location.href = '/settings/billing'}
                                                            className="ml-2"
                                                        >
                                                            View Billing
                                                        </Button>
                                                    ),
                                                });
                                            } else {
                                                toast({
                                                    title: "Team Limit Reached",
                                                    description: `You've reached the ${teamLimitInfo.limit} team member limit for your ${teamLimitInfo.planName} plan. Upgrade to add more members.`,
                                                    variant: "destructive",
                                                    action: (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.location.href = '/settings/billing'}
                                                            className="ml-2"
                                                        >
                                                            Upgrade Plan
                                                        </Button>
                                                    ),
                                                });
                                            }
                                            return;
                                        }
                                        setIsAddDialogOpen(true);
                                    }}
                                    disabled={teamLimitInfo && !teamLimitInfo.canAddMore}
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Team Member
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white wark:from-blue-900/20 wark:to-gray-800">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 wark:text-blue-400">Total Members</p>
                                        <p className="text-3xl font-bold text-blue-900 wark:text-blue-100">{stats.total}</p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                                        <Users className="h-6 w-6 text-blue-500" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-sm text-green-600 wark:text-green-400">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Active team</span>
                                </div>
                            </CardContent>
                            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-blue-500/5" />
                        </Card>

                        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-white wark:from-green-900/20 wark:to-gray-800">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600 wark:text-green-400">Active Users</p>
                                        <p className="text-3xl font-bold text-green-900 wark:text-green-100">{stats.active}</p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                                        <Activity className="h-6 w-6 text-green-500" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 wark:text-gray-400">
                                    <Globe className="h-4 w-4" />
                                    <span>Online now</span>
                                </div>
                            </CardContent>
                            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-green-500/5" />
                        </Card>

                        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white wark:from-purple-900/20 wark:to-gray-800">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600 wark:text-purple-400">Admins</p>
                                        <p className="text-3xl font-bold text-purple-900 wark:text-purple-100">{stats.admins}</p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                                        <Shield className="h-6 w-6 text-purple-500" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 wark:text-gray-400">
                                    <Zap className="h-4 w-4" />
                                    <span>Full access</span>
                                </div>
                            </CardContent>
                            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-purple-500/5" />
                        </Card>

                        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white wark:from-orange-900/20 wark:to-gray-800">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-600 wark:text-orange-400">Agents</p>
                                        <p className="text-3xl font-bold text-orange-900 wark:text-orange-100">{stats.agents}</p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                                        <UserCheck className="h-6 w-6 text-orange-500" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 wark:text-gray-400">
                                    <Clock className="h-4 w-4" />
                                    <span>Support team</span>
                                </div>
                            </CardContent>
                            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-orange-500/5" />
                        </Card>
                    </div> */}
                    {/* Team Limit Info Card */}
                    {teamLimitInfo && (
                        <Card className="mb-6 p-0 border-0 shadow-lg bg-gradient-to-r from-slate-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${getPlanColor(teamLimitInfo.plan)}`}>
                                            {getPlanIcon(teamLimitInfo.plan)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">
                                                {teamLimitInfo.planName} Plan
                                            </h3>
                                            <p className="text-sm text-slate-600">
                                                {teamLimitInfo.limit === Infinity
                                                    ? `${teamLimitInfo.currentCount} team members (Unlimited)`
                                                    : `${teamLimitInfo.currentCount} of ${teamLimitInfo.limit} team members used`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {/* {teamLimitInfo.limit !== Infinity && (
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-slate-700">
                                                    {teamLimitInfo.remainingSlots} slots remaining
                                                </div>
                                                <div className="w-32 bg-slate-200 rounded-full h-2 mt-1">
                                                    <div
                                                        className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${(teamLimitInfo.currentCount / teamLimitInfo.limit) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )} */}
                                        {!teamLimitInfo.canAddMore && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.location.href = '/settings/billing'}
                                                className="border-primary/20 text-primary hover:bg-primary/5"
                                            >
                                                Upgrade Plan
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {isLoading ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[200px]" />
                                            <Skeleton className="h-3 w-[150px]" />
                                        </div>
                                    </div>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[180px]" />
                                                <Skeleton className="h-3 w-[120px]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : users.length === 0 ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="py-16">
                                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                                    <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                                        <Users className="h-16 w-16 text-primary" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-semibold text-gray-900 wark:text-white">
                                            Welcome to Team Management
                                        </h3>
                                        <p className="text-gray-600 wark:text-gray-400 max-w-md">
                                            Start building your team by inviting members to help manage your WhatsApp communications and grow your business.
                                        </p>
                                    </div>
                                    <Button
                                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                                        onClick={() => {
                                            if (teamLimitInfo && !teamLimitInfo.canAddMore) {
                                                toast({
                                                    title: "Team Limit Reached",
                                                    description: `Upgrade your ${teamLimitInfo.planName} plan to add team members.`,
                                                    variant: "destructive",
                                                });
                                                return;
                                            }
                                            setIsAddDialogOpen(true);
                                        }}
                                        disabled={teamLimitInfo && !teamLimitInfo.canAddMore}
                                    >
                                        <UserPlus className="h-5 w-5 mr-2" />
                                        Invite Your First Team Member
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="pb-6">
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-semibold">Team Members</CardTitle>
                                        <CardDescription className="mt-1">
                                            Manage your team members and their access levels
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search members..."
                                                className="pl-9 w-64"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                                            <SelectTrigger className="w-[140px]">
                                                <Filter className="h-4 w-4 mr-2" />
                                                <SelectValue placeholder="Filter by role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Roles</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="agent">Agent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent border-gray-200 wark:border-gray-700">
                                                <TableHead className="font-semibold text-gray-900 wark:text-gray-100">Member</TableHead>
                                                <TableHead className="font-semibold text-gray-900 wark:text-gray-100">Role</TableHead>
                                                <TableHead className="font-semibold text-gray-900 wark:text-gray-100">Status</TableHead>
                                                <TableHead className="font-semibold text-gray-900 wark:text-gray-100">Last Activity</TableHead>
                                                <TableHead className="font-semibold text-gray-900 wark:text-gray-100">Joined</TableHead>
                                                <TableHead className="text-right font-semibold text-gray-900 wark:text-gray-100">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUsers.map((user) => (
                                                <TableRow key={user._id} className="group hover:bg-gray-50/50 wark:hover:bg-gray-800/50 transition-colors">
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-4">
                                                            <Avatar className="h-12 w-12 ring-2 ring-gray-100 wark:ring-gray-700">
                                                                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold text-lg">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-semibold text-gray-900 wark:text-white">{user.name}</div>
                                                                <div className="text-sm text-gray-500 wark:text-gray-400 flex items-center gap-1">
                                                                    <Mail className="h-3 w-3" />
                                                                    {user.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center gap-2">
                                                                {getRoleIcon(user.role)}
                                                                <Badge variant={user.role === 'admin' ? 'default' : user.role === 'owner' ? 'secondary' : 'outline'} className="font-medium">
                                                                    {user.role === 'owner' ? 'Owner' : user.role === 'admin' ? "Admin" : "Agent"}
                                                                </Badge>
                                                            </div>
                                                            {user.roleId && (
                                                                <span className="text-xs text-gray-500 wark:text-gray-400">
                                                                    {user.roleId.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.isActive ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                                                <span className="text-sm font-medium text-green-600 wark:text-green-400">Active</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                                                <span className="text-sm font-medium text-red-600 wark:text-red-400">Inactive</span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 wark:text-gray-400">
                                                            <Clock className="h-4 w-4" />
                                                            {user.lastLoginAt ? (
                                                                format(new Date(user.lastLoginAt), "MMM dd, yyyy")
                                                            ) : (
                                                                <span className="text-gray-400">Never</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 wark:text-gray-400">
                                                            <Calendar className="h-4 w-4" />
                                                            {format(new Date(user.createdAt), "MMM dd, yyyy")}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 hover:bg-gray-100 wark:hover:bg-gray-700"
                                                                    >
                                                                        <MoreVertical className="h-4 w-4" />
                                                                        <span className="sr-only">Actions</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48">
                                                                    <DropdownMenuItem onClick={() => handleViewClick(user)} className="flex items-center gap-2">
                                                                        <Eye className="h-4 w-4" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleEditClick(user)} className="flex items-center gap-2">
                                                                        <Edit className="h-4 w-4" />
                                                                        Edit Member
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-red-600 focus:text-red-600 flex items-center gap-2"
                                                                        onClick={() => handleDeleteClick(user)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        Remove Member
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

                    {/* Add User Dialog */}
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogContent className="sm:max-w-[600px] max-h-[95vh] flex flex-col p-0">
                            <DialogHeader className="px-6 py-4 border-b border-slate-300 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center">
                                        <UserPlus className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-semibold text-slate-900">
                                            Add Team Member
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-600">
                                            Invite a new team member to your workspace
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                <div className="space-y-8">
                                    {/* Basic Information */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                Basic Information
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                                                    Full Name <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="name"
                                                    placeholder="John Doe"
                                                    value={newUser.name}
                                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                                    className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20"
                                                />
                                                <p className="text-xs text-slate-500">
                                                    Enter the full name of the team member
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                                                    Email Address <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    value={newUser.email}
                                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                    className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20"
                                                />
                                                <p className="text-xs text-slate-500">
                                                    This will be used for login and notifications
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                                                Temporary Password <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="Enter temporary password"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20"
                                            />
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-amber-800">Security Notice</p>
                                                        <p className="text-sm text-amber-700 mt-1">
                                                            User will be asked to change this password on first login
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Role & Permissions */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                Role & Permissions
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="role-type" className="text-sm font-medium text-slate-700">
                                                    User Type <span className="text-red-500">*</span>
                                                </Label>
                                                <Select
                                                    value={newUser.role}
                                                    onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                                                >
                                                    <SelectTrigger id="role-type" className="bg-white border-slate-200 focus:border-green-500/50 focus:ring-green-500/20">
                                                        <SelectValue placeholder="Select user type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="agent">
                                                            <div className="flex items-center gap-2">
                                                                <UserCheck className="h-4 w-4 text-green-500" />
                                                                Agent
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="admin">
                                                            <div className="flex items-center gap-2">
                                                                <Shield className="h-4 w-4 text-blue-500" />
                                                                Admin
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-slate-500">
                                                    Determines the base level of access
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="role" className="text-sm font-medium text-slate-700">
                                                    Specific Role (Optional)
                                                </Label>
                                                <Select
                                                    value={newUser.roleId}
                                                    onValueChange={(value) => setNewUser({ ...newUser, roleId: value })}
                                                >
                                                    <SelectTrigger id="role" className="bg-white border-slate-200 focus:border-green-500/50 focus:ring-green-500/20">
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="None">No specific role</SelectItem>
                                                        {roles.map((role) => (
                                                            <SelectItem key={role._id} value={role._id}>
                                                                <div className="flex items-center justify-between w-full">
                                                                    <span>{role.name}</span>
                                                                    {role.isDefault && (
                                                                        <Badge variant="outline" className="ml-2 text-xs">
                                                                            Default
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-slate-500">
                                                    Assign custom permissions and access levels
                                                </p>
                                            </div>
                                        </div>
                                    </div>
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
                                    onClick={handleAddUser}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Member
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Edit User Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="sm:max-w-[600px] max-h-[95vh] flex flex-col p-0">
                            <DialogHeader className="px-6 py-4 border-b border-slate-300 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center">
                                        <Edit className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-semibold text-slate-900">
                                            Edit Team Member
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-600">
                                            Update team member information and permissions
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                <div className="space-y-8">
                                    {/* Basic Information */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                Basic Information
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-name" className="text-sm font-medium text-slate-700">
                                                    Full Name <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="edit-name"
                                                    placeholder="John Doe"
                                                    value={editUser.name}
                                                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                                                    className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="edit-email" className="text-sm font-medium text-slate-700">
                                                    Email Address <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="edit-email"
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    value={editUser.email}
                                                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                                    className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Role & Permissions */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                Role & Permissions
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-role-type" className="text-sm font-medium text-slate-700">
                                                    User Type
                                                </Label>
                                                <Select
                                                    value={editUser.role}
                                                    onValueChange={(value) => setEditUser({ ...editUser, role: value })}
                                                >
                                                    <SelectTrigger id="edit-role-type" className="bg-white border-slate-200 focus:border-green-500/50 focus:ring-green-500/20">
                                                        <SelectValue placeholder="Select user type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="agent">
                                                            <div className="flex items-center gap-2">
                                                                <UserCheck className="h-4 w-4 text-green-500" />
                                                                Agent
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="admin">
                                                            <div className="flex items-center gap-2">
                                                                <Shield className="h-4 w-4 text-blue-500" />
                                                                Admin
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="edit-role" className="text-sm font-medium text-slate-700">
                                                    Specific Role
                                                </Label>
                                                <Select
                                                    value={editUser.roleId}
                                                    onValueChange={(value) => setEditUser({ ...editUser, roleId: value })}
                                                >
                                                    <SelectTrigger id="edit-role" className="bg-white border-slate-200 focus:border-green-500/50 focus:ring-green-500/20">
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="None">No specific role</SelectItem>
                                                        {roles.map((role) => (
                                                            <SelectItem key={role._id} value={role._id}>
                                                                <div className="flex items-center justify-between w-full">
                                                                    <span>{role.name}</span>
                                                                    {role.isDefault && (
                                                                        <Badge variant="outline" className="ml-2 text-xs">
                                                                            Default
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Status */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                Account Status
                                            </h3>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                                                    <Activity className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <Label htmlFor="edit-active" className="text-sm font-medium text-purple-800">
                                                        User Account Status
                                                    </Label>
                                                    <p className="text-xs text-purple-600">
                                                        Control whether this user can access the system
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="edit-active"
                                                    checked={editUser.isActive}
                                                    onCheckedChange={(checked) => setEditUser({ ...editUser, isActive: checked })}
                                                />
                                                <div className="flex items-center gap-1 text-sm font-medium text-purple-800">
                                                    {editUser.isActive ? (
                                                        <>
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                            Inactive
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
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
                                    onClick={handleUpdateUser}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* View User Dialog */}
                    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                        <DialogContent className="sm:max-w-[700px] max-h-[95vh] flex flex-col p-0">
                            <DialogHeader className="px-6 py-4 border-b border-slate-300 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/20 flex items-center justify-center">
                                        <Eye className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-semibold text-slate-900">
                                            Team Member Details
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-600">
                                            View complete information about this team member
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                {selectedUser && (
                                    <div className="space-y-8">
                                        {/* Member Profile */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                    Member Profile
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
                                                <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                                                    <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary text-2xl font-semibold">
                                                        {selectedUser.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-3">
                                                    <h3 className="text-xl font-semibold text-slate-900">{selectedUser.name}</h3>
                                                    <p className="text-slate-600 flex items-center gap-2">
                                                        <Mail className="h-4 w-4" />
                                                        {selectedUser.email}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            {getRoleIcon(selectedUser.role)}
                                                            <Badge variant={selectedUser.role === 'admin' ? 'default' : selectedUser.role === 'owner' ? 'secondary' : 'outline'}>
                                                                {selectedUser.role === 'owner' ? 'Owner' : selectedUser.role === 'admin' ? "Admin" : "Agent"}
                                                            </Badge>
                                                        </div>
                                                        {selectedUser.isActive ? (
                                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                                <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                                                                Active
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                                                                <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                                                                Inactive
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Activity Information */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                    Activity Information
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-lg border border-blue-200">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                                                            <Clock className="h-4 w-4" />
                                                            Last Login
                                                        </div>
                                                        <p className="text-blue-900 font-medium">
                                                            {selectedUser.lastLoginAt
                                                                ? format(new Date(selectedUser.lastLoginAt), "MMM dd, yyyy 'at' HH:mm")
                                                                : "Never logged in"
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-gradient-to-r from-green-50 to-green-100/50 p-4 rounded-lg border border-green-200">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-green-800">
                                                            <Calendar className="h-4 w-4" />
                                                            Joined Date
                                                        </div>
                                                        <p className="text-green-900 font-medium">
                                                            {format(new Date(selectedUser.createdAt), "MMM dd, yyyy")}
                                                        </p>
                                                    </div>
                                                </div>

                                                {selectedUser.invitedBy && (
                                                    <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 p-4 rounded-lg border border-purple-200 md:col-span-2">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-sm font-medium text-purple-800">
                                                                <UserPlus className="h-4 w-4" />
                                                                Invited By
                                                            </div>
                                                            <p className="text-purple-900 font-medium">{selectedUser.invitedBy.name}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Role Permissions */}
                                        {selectedUser.roleId && (
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                                        Role Permissions
                                                    </h3>
                                                </div>

                                                <div className="bg-gradient-to-r from-slate-50 to-white p-6 rounded-xl border border-slate-200">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center">
                                                                <Shield className="h-5 w-5 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-slate-900">{selectedUser.roleId.name}</h4>
                                                                {selectedUser.roleId.description && (
                                                                    <p className="text-sm text-slate-600">{selectedUser.roleId.description}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {selectedUser.roleId.permissions.map((permission, index) => (
                                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-lg">{getResourceIcon(permission.resource)}</span>
                                                                        <span className="font-medium capitalize text-slate-900">
                                                                            {permission.resource}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex gap-1">
                                                                        {permission.actions.map((action) => (
                                                                            <Badge key={action} variant="secondary" className="text-xs">
                                                                                {action}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsViewDialogOpen(false)}
                                    className="hover:bg-slate-50"
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsViewDialogOpen(false);
                                        if (selectedUser) {
                                            setTimeout(() => handleEditClick(selectedUser), 100);
                                        }
                                    }}
                                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Member
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-red-600">
                                    <AlertTriangle className="h-5 w-5" />
                                    Remove Team Member?
                                </DialogTitle>
                                <DialogDescription>
                                    This action cannot be undone. The user will lose access to your workspace immediately.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                {selectedUser && (
                                    <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 wark:bg-red-900/20 border border-red-200 wark:border-red-800">
                                        <Avatar className="h-12 w-12 ring-2 ring-red-200">
                                            <AvatarFallback className="bg-red-100 wark:bg-red-800 text-red-700 wark:text-red-300 font-medium">
                                                {selectedUser.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-red-900 wark:text-red-100">{selectedUser.name}</div>
                                            <div className="text-sm text-red-700 wark:text-red-300">{selectedUser.email}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteUser}
                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove Member
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </Layout>
    );
}