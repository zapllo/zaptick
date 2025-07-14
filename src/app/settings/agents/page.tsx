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
    Settings,
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

export default function AgentsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

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

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();

            if (data.success) {
                setUsers(data.users);
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
                    description: "User created successfully",
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
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to create user",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error creating user:', error);
            toast({
                title: "Error",
                description: "Failed to create user",
                variant: "destructive",
            });
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
                    description: "User updated successfully",
                });
                setIsEditDialogOpen(false);
                fetchUsers();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to update user",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast({
                title: "Error",
                description: "Failed to update user",
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
                    description: "User deleted successfully",
                });
                setIsDeleteDialogOpen(false);
                setSelectedUser(null);
                fetchUsers();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to delete user",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast({
                title: "Error",
                description: "Failed to delete user",
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

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Team Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your team members and their access permissions
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/settings/roles'}
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Manage Roles
                        </Button>
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Team Member
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-12 w-full" />
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <Card className="text-center py-16">
                        <CardContent>
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="rounded-full bg-primary/10 p-4">
                                    <Users className="h-12 w-12 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">No Team Members Yet</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Start building your team by inviting team members to help manage your WhatsApp communications.
                                </p>
                                <Button onClick={() => setIsAddDialogOpen(true)}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Invite Your First Team Member
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                Manage your team members and their access levels
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead>Added</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user._id} className="group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                        {user.role === 'owner' ? 'Owner' : user.role === 'admin' ? "Admin" : "Agent"}
                                                    </Badge>
                                                    {user.roleId && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {user.roleId.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.isActive ? (
                                                    <span className="flex items-center text-green-600">
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-red-600">
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {user.lastLoginAt ? (
                                                    format(new Date(user.lastLoginAt), "MMM dd, yyyy")
                                                ) : (
                                                    <span className="text-muted-foreground">Never</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(user.createdAt), "MMM dd, yyyy")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                                <span className="sr-only">Actions</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleViewClick(user)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEditClick(user)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit User
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() => handleDeleteClick(user)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete User
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Add User Dialog */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Team Member</DialogTitle>
                            <DialogDescription>
                                Invite a new team member to your workspace
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Temporary Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter temporary password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">
                                    User will be asked to change this on first login
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role-type">User Type</Label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                                >
                                    <SelectTrigger id="role-type">
                                        <SelectValue placeholder="Select user type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="agent">Agent</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role (Optional)</Label>
                                <Select
                                    value={newUser.roleId}
                                    onValueChange={(value) => setNewUser({ ...newUser, roleId: value })}
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="No">No specific role</SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem key={role._id} value={role._id}>
                                                {role.name}
                                                {role.isDefault && " (Default)"}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddUser}>
                                Add User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit User Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Team Member</DialogTitle>
                            <DialogDescription>
                                Update team member information and permissions
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Full Name *</Label>
                                <Input
                                    id="edit-name"
                                    placeholder="John Doe"
                                    value={editUser.name}
                                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email Address *</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={editUser.email}
                                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-role-type">User Type</Label>
                                <Select
                                    value={editUser.role}
                                    onValueChange={(value) => setEditUser({ ...editUser, role: value })}
                                >
                                    <SelectTrigger id="edit-role-type">
                                        <SelectValue placeholder="Select user type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="agent">Agent</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-role">Role</Label>
                                <Select
                                    value={editUser.roleId}
                                    onValueChange={(value) => setEditUser({ ...editUser, roleId: value })}
                                >
                                    <SelectTrigger id="edit-role">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="None">No specific role</SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem key={role._id} value={role._id}>
                                                {role.name}
                                                {role.isDefault && " (Default)"}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-active"
                                    checked={editUser.isActive}
                                    onCheckedChange={(checked) =>
                                        setEditUser({ ...editUser, isActive: checked })
                                    }
                                />
                                <label
                                    htmlFor="edit-active"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    User is active
                                </label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateUser}>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* View User Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Team Member Details</DialogTitle>
                        </DialogHeader>
                        {selectedUser && (
                            <div className="space-y-6 py-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                                            {selectedUser.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                                        <p className="text-muted-foreground">{selectedUser.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'}>
                                                {selectedUser.role === 'owner' ? 'Owner' : selectedUser.role === 'admin' ? "Admin" : "Agent"}
                                            </Badge>
                                            {selectedUser.isActive ? (
                                                <Badge variant="outline" className="text-green-600 border-green-600">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-red-600 border-red-600">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                                        <p className="mt-1">
                                            {selectedUser.lastLoginAt
                                                ? format(new Date(selectedUser.lastLoginAt), "MMM dd, yyyy 'at' HH:mm")
                                                : "Never logged in"
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Added On</Label>
                                        <p className="mt-1">
                                            {format(new Date(selectedUser.createdAt), "MMM dd, yyyy")}
                                        </p>
                                    </div>
                                    {selectedUser.invitedBy && (
                                        <div className="col-span-2">
                                            <Label className="text-sm font-medium text-muted-foreground">Invited By</Label>
                                            <p className="mt-1">{selectedUser.invitedBy.name}</p>
                                        </div>
                                    )}
                                </div>

                                {selectedUser.roleId && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                                            Role Permissions
                                        </Label>
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg">{selectedUser.roleId.name}</CardTitle>
                                                {selectedUser.roleId.description && (
                                                    <CardDescription>{selectedUser.roleId.description}</CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {selectedUser.roleId.permissions.map((permission, index) => (
                                                        <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">{getResourceIcon(permission.resource)}</span>
                                                                <span className="font-medium capitalize">{permission.resource}</span>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                {permission.actions.map((action) => (
                                                                    <Badge key={action} variant="outline" className="text-xs">
                                                                        {action}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                                Close
                            </Button>
                            <Button onClick={() => {
                                setIsViewDialogOpen(false);
                                if (selectedUser) {
                                    setTimeout(() => handleEditClick(selectedUser), 100);
                                }
                            }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-red-600">Delete Team Member?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. The user will lose access to your workspace immediately.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            {selectedUser && (
                                <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {selectedUser.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{selectedUser.name}</div>
                                        <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
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
                            >
                                Delete User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}