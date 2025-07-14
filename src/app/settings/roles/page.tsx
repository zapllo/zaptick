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
  { key: 'conversations', label: 'Conversations', description: 'Access to WhatsApp conversations' },
  { key: 'templates', label: 'Templates', description: 'Manage message templates' },
  { key: 'dashboard', label: 'Dashboard', description: 'View analytics and metrics' },
  { key: 'automations', label: 'Automations', description: 'Create and manage automations' },
  { key: 'contacts', label: 'Contacts', description: 'Manage contact database' },
  { key: 'integrations', label: 'Integrations', description: 'Configure third-party integrations' },
  { key: 'analytics', label: 'Analytics', description: 'View detailed reports and analytics' },
  { key: 'settings', label: 'Settings', description: 'Access system settings' },
];

const AVAILABLE_ACTIONS = [
  { key: 'read', label: 'Read', description: 'View and read data' },
  { key: 'write', label: 'Write', description: 'Create and update data' },
  { key: 'delete', label: 'Delete', description: 'Delete data' },
  { key: 'manage', label: 'Manage', description: 'Full administrative access' },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const updatePermissions = (
    permissions: Permission[], 
    resource: string, 
    actions: string[]
  ): Permission[] => {
    const existingIndex = permissions.findIndex(p => p.resource === resource);
    
    if (actions.length === 0) {
      // Remove permission if no actions selected
      return permissions.filter(p => p.resource !== resource);
    }
    
    if (existingIndex >= 0) {
      // Update existing permission
      const updated = [...permissions];
      updated[existingIndex] = { resource, actions };
      return updated;
    } else {
      // Add new permission
      return [...permissions, { resource, actions }];
    }
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

  const PermissionBuilder = ({ 
    permissions, 
    setPermissions 
  }: { 
    permissions: Permission[], 
    setPermissions: (permissions: Permission[]) => void 
  }) => {
    return (
      <div className="space-y-4">
        <Label className="text-sm font-medium">Permissions</Label>
        <div className="border rounded-lg p-4 space-y-4">
          {AVAILABLE_RESOURCES.map((resource) => {
            const permission = permissions.find(p => p.resource === resource.key);
            const selectedActions = permission?.actions || [];

            return (
              <div key={resource.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getResourceIcon(resource.key)}</span>
                    <div>
                      <Label className="font-medium">{resource.label}</Label>
                      <p className="text-xs text-muted-foreground">{resource.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 ml-8">
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
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {action.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/settings/agents'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Team
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Roles & Permissions</h1>
              <p className="text-muted-foreground mt-1">
                Define roles and manage access permissions for your team
              </p>
            </div>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : roles.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Shield className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">No Roles Created</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Create roles to organize your team permissions and control access to different features.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Role
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                Manage roles and their associated permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role._id} className="group">
                      <TableCell>
                        <div>
                          <div className="font-medium">{role.name}</div>
                          {role.description && (
                            <div className="text-sm text-muted-foreground">{role.description}</div>
                          )}
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
                          <span className="flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(role.createdAt), "MMM dd, yyyy")}
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
                              <DropdownMenuItem onClick={() => handleEditClick(role)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteClick(role)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
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
            </CardContent>
          </Card>
        )}

        {/* Add Role Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions for your team members
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Customer Support Agent, Sales Manager"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this role is responsible for..."
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  rows={3}
                />
              </div>

              <PermissionBuilder
                permissions={newRole.permissions}
                setPermissions={(permissions) => setNewRole({ ...newRole, permissions })}
              />

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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRole}>
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>
                Update role permissions and settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Role Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g. Customer Support Agent, Sales Manager"
                  value={editRole.name}
                  onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Describe what this role is responsible for..."
                  value={editRole.description}
                  onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
                  rows={3}
                />
              </div>

              <PermissionBuilder
                permissions={editRole.permissions}
                setPermissions={(permissions) => setEditRole({ ...editRole, permissions })}
              />

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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRole}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Role?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Users assigned to this role will lose their permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedRole && (
                <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{selectedRole.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedRole.permissions.length} permissions
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
              >
                Delete Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}