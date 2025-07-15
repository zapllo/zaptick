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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  CheckCircle2,
  Users,
  ArrowLeft,
  Crown,
  Lock,
  Unlock,
  Settings,
  Star,
  Globe,
  Zap,
  AlertTriangle,
  Search,
  Filter,
  Copy,
  Eye,
  Activity,
} from "lucide-react";

interface Permission {
  resource: string;
  actions: string[];
}

interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isDefault: boolean;
  createdAt: string;
}

const AVAILABLE_RESOURCES = [
  { key: 'conversations', label: 'Conversations', description: 'Access to WhatsApp conversations', icon: '💬' },
  { key: 'templates', label: 'Templates', description: 'Manage message templates', icon: '📝' },
  { key: 'dashboard', label: 'Dashboard', description: 'View analytics and metrics', icon: '📊' },
  { key: 'automations', label: 'Automations', description: 'Create and manage automations', icon: '🤖' },
  { key: 'contacts', label: 'Contacts', description: 'Manage contact database', icon: '👥' },
  { key: 'integrations', label: 'Integrations', description: 'Configure third-party integrations', icon: '🔗' },
  { key: 'analytics', label: 'Analytics', description: 'View detailed reports and analytics', icon: '📈' },
  { key: 'settings', label: 'Settings', description: 'Access system settings', icon: '⚙️' },
];

const AVAILABLE_ACTIONS = [
  { key: 'read', label: 'Read', description: 'View and read data', color: 'bg-blue-100 text-blue-800' },
  { key: 'write', label: 'Write', description: 'Create and update data', color: 'bg-green-100 text-green-800' },
  { key: 'delete', label: 'Delete', description: 'Delete data', color: 'bg-red-100 text-red-800' },
  { key: 'manage', label: 'Manage', description: 'Full administrative access', color: 'bg-purple-100 text-purple-800' },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { toast } = useToast();

  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as Permission[],
    isDefault: false,
  });

  const [editRole, setEditRole] = useState({
    id: "",
    name: "",
    description: "",
    permissions: [] as Permission[],
    isDefault: false,
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();

      if (data.success) {
        setRoles(data.roles);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch roles",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRole.name || newRole.permissions.length === 0) {
      toast({
        title: "Error",
        description: "Please provide role name and at least one permission",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRole),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Role created successfully",
        });
        setIsAddDialogOpen(false);
        setNewRole({
          name: "",
          description: "",
          permissions: [],
          isDefault: false,
        });
        fetchRoles();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!editRole.name || editRole.permissions.length === 0) {
      toast({
        title: "Error",
        description: "Please provide role name and at least one permission",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/roles/${editRole.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editRole.name,
          description: editRole.description,
          permissions: editRole.permissions,
          isDefault: editRole.isDefault,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Role updated successfully",
        });
        setIsEditDialogOpen(false);
        fetchRoles();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      const response = await fetch(`/api/roles/${selectedRole._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Role deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        setSelectedRole(null);
        fetchRoles();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (role: Role) => {
    setEditRole({
      id: role._id,
      name: role.name,
      description: role.description || "",
      permissions: role.permissions,
      isDefault: role.isDefault,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleViewClick = (role: Role) => {
    setSelectedRole(role);
    setIsViewDialogOpen(true);
  };

  const updatePermissions = (
    permissions: Permission[],
    resource: string,
    actions: string[]
  ): Permission[] => {
    const existingIndex = permissions.findIndex(p => p.resource === resource);

    if (actions.length === 0) {
      return permissions.filter(p => p.resource !== resource);
    }

    if (existingIndex >= 0) {
      const updated = [...permissions];
      updated[existingIndex] = { resource, actions };
      return updated;
    } else {
      return [...permissions, { resource, actions }];
    }
  };

  const getResourceIcon = (resource: string) => {
    const resourceItem = AVAILABLE_RESOURCES.find(r => r.key === resource);
    return resourceItem ? resourceItem.icon : '📄';
  };

  const getActionColor = (action: string) => {
    const actionItem = AVAILABLE_ACTIONS.find(a => a.key === action);
    return actionItem ? actionItem.color : 'bg-gray-100 text-gray-800';
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: roles.length,
    default: roles.filter(r => r.isDefault).length,
    custom: roles.filter(r => !r.isDefault).length,
    totalPermissions: roles.reduce((acc, role) => acc + role.permissions.length, 0),
  };

  const PermissionBuilder = ({
    permissions,
    setPermissions
  }: {
    permissions: Permission[],
    setPermissions: (permissions: Permission[]) => void
  }) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Configure Permissions</Label>
          <div className="text-sm text-gray-500">
            {permissions.length} resource{permissions.length !== 1 ? 's' : ''} configured
          </div>
        </div>

        <div className="space-y-4">
          {AVAILABLE_RESOURCES.map((resource) => {
            const permission = permissions.find(p => p.resource === resource.key);
            const selectedActions = permission?.actions || [];

            return (
              <Card key={resource.key} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                          <span className="text-lg">{resource.icon}</span>
                        </div>
                        <div>
                          <Label className="font-semibold text-gray-900 wark:text-white">
                            {resource.label}
                          </Label>
                          <p className="text-sm text-gray-500 wark:text-gray-400">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedActions.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {selectedActions.length} permission{selectedActions.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {AVAILABLE_ACTIONS.map((action) => (
                        <div key={action.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${resource.key}-${action.key}`}
                            checked={selectedActions.includes(action.key)}
                            onCheckedChange={(checked) => {
                              const newActions = checked
                                ? [...selectedActions, action.key]
                                : selectedActions.filter(a => a !== action.key);

                              setPermissions(updatePermissions(permissions, resource.key, newActions));
                            }}
                          />
                          <Label
                            htmlFor={`${resource.key}-${action.key}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(action.key)}`}>
                              {action.label}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 wark:from-gray-900 wark:via-gray-800 wark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/settings/agents'}
                  className="text-gray-600 hover:text-gray-900 wark:text-gray-400 wark:hover:text-gray-100"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Team
                </Button>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent wark:from-white wark:to-gray-300">
                      Roles & Permissions
                    </h1>
                    <p className="text-gray-600 wark:text-gray-400">
                      Define roles and manage access permissions for your team
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white wark:from-purple-900/20 wark:to-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 wark:text-purple-400">Total Roles</p>
                    <p className="text-3xl font-bold text-purple-900 wark:text-purple-100">{stats.total}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                    <Shield className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 wark:text-gray-400">
                  <Activity className="h-4 w-4" />
                  <span>Active roles</span>
                </div>
              </CardContent>
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-purple-500/5" />
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white wark:from-blue-900/20 wark:to-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 wark:text-blue-400">Default Roles</p>
                    <p className="text-3xl font-bold text-blue-900 wark:text-blue-100">{stats.default}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                    <Star className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 wark:text-gray-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Auto-assigned</span>
                </div>
              </CardContent>
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-blue-500/5" />
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-white wark:from-green-900/20 wark:to-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 wark:text-green-400">Custom Roles</p>
                    <p className="text-3xl font-bold text-green-900 wark:text-green-100">{stats.custom}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                    <Settings className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 wark:text-gray-400">
                  <Zap className="h-4 w-4" />
                  <span>Customized</span>
                </div>
              </CardContent>
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-green-500/5" />
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white wark:from-orange-900/20 wark:to-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 wark:text-orange-400">Permissions</p>
                    <p className="text-3xl font-bold text-orange-900 wark:text-orange-100">{stats.totalPermissions}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                    <Lock className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 wark:text-gray-400">
                  <Globe className="h-4 w-4" />
                  <span>Total granted</span>
                </div>
              </CardContent>
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-orange-500/5" />
            </Card>
          </div>

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
          ) : roles.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                    <Shield className="h-16 w-16 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-gray-900 wark:text-white">
                      No Roles Created Yet
                    </h3>
                    <p className="text-gray-600 wark:text-gray-400 max-w-md">
                      Create roles to organize your team permissions and control access to different features of your platform.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Role
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">Role Management</CardTitle>
                    <CardDescription className="mt-1">
                      Manage roles and their associated permissions
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search roles..."
                        className="pl-9 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-gray-200 wark:border-gray-700">
                        <TableHead className="font-semibold text-gray-900 wark:text-gray-100">Role</TableHead>
                        <TableHead className="font-semibold text-gray-900 wark:text-gray-100">Permissions</TableHead>
                        <TableHead className="font-semibold text-gray-900 wark:text-gray-100">Default</TableHead>
                        <TableHead className="font-semibold text-gray-900 wark:text-gray-100">Created</TableHead>
                        <TableHead className="text-right font-semibold text-gray-900 wark:text-gray-100">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.map((role) => (
                        <TableRow key={role._id} className="group hover:bg-gray-50/50 wark:hover:bg-gray-800/50 transition-colors">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                                <Shield className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 wark:text-white flex items-center gap-2">
                                  {role.name}
                                  {role.isDefault && (
                                    <Crown className="h-4 w-4 text-yellow-500" />
                                  )}
                                </div>
                                {role.description && (
                                  <div className="text-sm text-gray-500 wark:text-gray-400">
                                    {role.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.slice(0, 3).map((permission, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {getResourceIcon(permission.resource)} {permission.resource}
                                </Badge>
                              ))}
                              {role.permissions.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{role.permissions.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {role.isDefault ? (
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-medium text-green-600 wark:text-green-400">Yes</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500 wark:text-gray-400">No</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 wark:text-gray-400">
                              {format(new Date(role.createdAt), "MMM dd, yyyy")}
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
                                  <DropdownMenuItem onClick={() => handleViewClick(role)} className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditClick(role)} className="flex items-center gap-2">
                                    <Edit className="h-4 w-4" />
                                    Edit Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center gap-2">
                                    <Copy className="h-4 w-4" />
                                    Duplicate Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 flex items-center gap-2"
                                    onClick={() => handleDeleteClick(role)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Role
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

          {/* Add Role Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Create New Role
                </DialogTitle>
                <DialogDescription>
                  Define a new role with specific permissions for your team members
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Role Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Customer Support Agent, Sales Manager"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      className="border-gray-200 focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="Brief description of this role"
                      value={newRole.description}
                      onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                      className="border-gray-200 focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>

                <PermissionBuilder
                  permissions={newRole.permissions}
                  setPermissions={(permissions) => setNewRole({ ...newRole, permissions })}
                />

                <div className="flex items-center justify-between p-4 bg-gray-50 wark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="default"
                      checked={newRole.isDefault}
                      onCheckedChange={(checked) =>
                        setNewRole({ ...newRole, isDefault: checked })
                      }
                    />
                    <label
                      htmlFor="default"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Set as default role for new team members
                    </label>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="h-3 w-3" />
                    Auto-assigned
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddRole}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  Create Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Role Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-primary" />
                  Edit Role
                </DialogTitle>
                <DialogDescription>
                  Update role permissions and settings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Role Name *</Label>
                    <Input
                      id="edit-name"
                      placeholder="e.g. Customer Support Agent, Sales Manager"
                      value={editRole.name}
                      onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
                      className="border-gray-200 focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description (Optional)</Label>
                    <Input
                      id="edit-description"
                      placeholder="Brief description of this role"
                      value={editRole.description}
                      onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
                      className="border-gray-200 focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>

                <PermissionBuilder
                  permissions={editRole.permissions}
                  setPermissions={(permissions) => setEditRole({ ...editRole, permissions })}
                />

                <div className="flex items-center justify-between p-4 bg-gray-50 wark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-default"
                      checked={editRole.isDefault}
                      onCheckedChange={(checked) =>
                        setEditRole({ ...editRole, isDefault: checked })
                      }
                    />
                    <label
                      htmlFor="edit-default"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Set as default role for new team members
                    </label>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="h-3 w-3" />
                    Auto-assigned
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateRole}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Role Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Role Details
                </DialogTitle>
              </DialogHeader>
              {selectedRole && (
                <div className="space-y-6 py-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white wark:from-gray-800 wark:to-gray-900 rounded-xl border">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900 wark:text-white flex items-center gap-2">
                        {selectedRole.name}
                        {selectedRole.isDefault && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <Crown className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </h3>
                      {selectedRole.description && (
                        <p className="text-gray-600 wark:text-gray-400">
                          {selectedRole.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Created {format(new Date(selectedRole.createdAt), "MMM dd, yyyy")}</span>
                        <span>•</span>
                        <span>{selectedRole.permissions.length} permission{selectedRole.permissions.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 wark:text-white">Permissions Overview</h4>
                    <div className="grid gap-4">
                      {selectedRole.permissions.map((permission, index) => (
                        <Card key={index} className="border-0 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                                  <span className="text-lg">{getResourceIcon(permission.resource)}</span>
                                </div>
                                <div>
                                  <span className="font-medium capitalize text-gray-900 wark:text-white">
                                    {permission.resource}
                                  </span>
                                  <p className="text-sm text-gray-500 wark:text-gray-400">
                                    {AVAILABLE_RESOURCES.find(r => r.key === permission.resource)?.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {permission.actions.map((action) => (
                                 <span key={action} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(action)}`}>
                                    {action}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    if (selectedRole) {
                      setTimeout(() => handleEditClick(selectedRole), 100);
                    }
                  }}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Role
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
                  Delete Role?
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Users assigned to this role will lose their permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {selectedRole && (
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 wark:bg-red-900/20 border border-red-200 wark:border-red-800">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 wark:bg-red-800">
                      <Shield className="h-6 w-6 text-red-600 wark:text-red-400" />
                    </div>
                    <div>
                      <div className="font-medium text-red-900 wark:text-red-100 flex items-center gap-2">
                        {selectedRole.name}
                        {selectedRole.isDefault && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-sm text-red-700 wark:text-red-300">
                        {selectedRole.permissions.length} permission{selectedRole.permissions.length !== 1 ? 's' : ''}
                      </div>
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
                  onClick={handleDeleteRole}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
}