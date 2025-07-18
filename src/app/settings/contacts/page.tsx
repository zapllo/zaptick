"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  List,
  TextQuote,
  Calendar,
  Hash,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  X,
} from "lucide-react";

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

export default function ContactCustomFieldsPage() {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedField, setSelectedField] = useState<CustomField | null>(null);
  const { toast } = useToast();

  const [newField, setNewField] = useState({
    name: "",
    type: "Text" as FieldType,
    required: false,
    options: "",
    defaultValue: "",
  });

  const [editField, setEditField] = useState({
    id: "",
    name: "",
    type: "Text" as FieldType,
    required: false,
    options: "",
    defaultValue: "",
  });

  useEffect(() => {
    fetchCustomFields();
  }, []);

  const fetchCustomFields = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/custom-fields');
      const data = await response.json();

      if (data.success) {
        setCustomFields(data.fields);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch custom fields",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      toast({
        title: "Error",
        description: "Failed to fetch custom fields",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddField = async () => {
    if (!newField.name || !newField.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/custom-fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newField.name,
          type: newField.type,
          required: newField.required,
          options: newField.type === 'Dropdown' ? newField.options.split(',').map(o => o.trim()).filter(Boolean) : [],
          defaultValue: newField.defaultValue || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Custom field added successfully",
        });
        setIsAddDialogOpen(false);
        setNewField({
          name: "",
          type: "Text",
          required: false,
          options: "",
          defaultValue: "",
        });
        fetchCustomFields();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add custom field",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding custom field:', error);
      toast({
        title: "Error",
        description: "Failed to add custom field",
        variant: "destructive",
      });
    }
  };

  const handleUpdateField = async () => {
    if (!editField.name || !editField.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/custom-fields/${editField.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editField.name,
          type: editField.type,
          required: editField.required,
          options: editField.type === 'Dropdown' ? editField.options.split(',').map(o => o.trim()).filter(Boolean) : [],
          defaultValue: editField.defaultValue || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Custom field updated successfully",
        });
        setIsEditDialogOpen(false);
        fetchCustomFields();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update custom field",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating custom field:', error);
      toast({
        title: "Error",
        description: "Failed to update custom field",
        variant: "destructive",
      });
    }
  };

  const handleDeleteField = async () => {
    if (!selectedField) return;

    try {
      const response = await fetch(`/api/custom-fields/${selectedField.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Custom field deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        setSelectedField(null);
        fetchCustomFields();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete custom field",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting custom field:', error);
      toast({
        title: "Error",
        description: "Failed to delete custom field",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (field: CustomField) => {
    setEditField({
      id: field.id,
      name: field.name,
      type: field.type,
      required: field.required,
      options: field.options ? field.options.join(', ') : '',
      defaultValue: field.defaultValue || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (field: CustomField) => {
    setSelectedField(field);
    setIsDeleteDialogOpen(true);
  };

  const getFieldTypeIcon = (type: FieldType) => {
    switch (type) {
      case 'Text':
        return <TextQuote className="h-4 w-4 text-blue-500" />;
      case 'Number':
        return <Hash className="h-4 w-4 text-green-500" />;
      case 'Date':
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case 'Dropdown':
        return <List className="h-4 w-4 text-purple-500" />;
      default:
        return <TextQuote className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className=" mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Contact Custom Fields</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage custom fields for your contacts
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Field
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : customFields.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <List className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">No Custom Fields Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Custom fields allow you to store additional information about your contacts.
                  Create your first custom field to get started.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Custom Field
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
              <CardDescription>
                Fields your team can use to store additional contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customFields.map((field) => (
                    <TableRow key={field.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFieldTypeIcon(field.type)}
                          <div>
                            <div className="font-medium">{field.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Key: {field.key}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {field.type}
                        </Badge>
                        {field.type === 'Dropdown' && field.options && field.options.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Options: {field.options.join(', ')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {field.required ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Yes
                          </span>
                        ) : (
                          <span className="flex items-center text-muted-foreground">
                            <XCircle className="h-4 w-4 mr-1" />
                            No
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(field.createdAt), "MMM dd, yyyy")}
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
                              <DropdownMenuItem onClick={() => handleEditClick(field)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Field
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteClick(field)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Field
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

        {/* Add Custom Field Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[95vh] flex flex-col p-0">
            <DialogHeader className="px-6 py-4 border-b border-slate-300 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-slate-900">
                    Add Custom Field
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Create a new custom field for your contacts
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Field Configuration */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      Field Configuration
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                        Field Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g. Company Size, Budget, Referral Source"
                        value={newField.name}
                        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                        className="bg-white border-slate-200 focus:border-green-500/50 focus:ring-green-500/20"
                      />
                      <p className="text-xs text-slate-500">
                        This will be displayed in forms and contact details
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-medium text-slate-700">
                        Field Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={newField.type}
                        onValueChange={(value) => setNewField({ ...newField, type: value as FieldType })}
                      >
                        <SelectTrigger id="type" className="bg-white border-slate-200 focus:border-green-500/50 focus:ring-green-500/20">
                          <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Text">
                            <div className="flex items-center gap-2">
                              <TextQuote className="h-4 w-4 text-blue-500" />
                              <span>Text</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Number">
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4 text-green-500" />
                              <span>Number</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Date">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-amber-500" />
                              <span>Date</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Dropdown">
                            <div className="flex items-center gap-2">
                              <List className="h-4 w-4 text-purple-500" />
                              <span>Dropdown</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newField.type === 'Dropdown' && (
                      <div className="space-y-2">
                        <Label htmlFor="options" className="text-sm font-medium text-slate-700">
                          Dropdown Options <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="options"
                          placeholder="Option 1, Option 2, Option 3"
                          value={newField.options}
                          onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                          className="bg-white border-slate-200 focus:border-green-500/50 focus:ring-green-500/20"
                        />
                        <p className="text-xs text-slate-500">
                          Enter options separated by commas
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="defaultValue" className="text-sm font-medium text-slate-700">
                        Default Value (Optional)
                      </Label>
                      <Input
                        id="defaultValue"
                        placeholder="Default value"
                        value={newField.defaultValue}
                        onChange={(e) => setNewField({ ...newField, defaultValue: e.target.value })}
                        className="bg-white border-slate-200 focus:border-green-500/50 focus:ring-green-500/20"
                      />
                      <p className="text-xs text-slate-500">
                        Pre-fill this field with a default value
                      </p>
                    </div>
                  </div>
                </div>

                {/* Field Properties */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      Field Properties
                    </h3>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="required"
                        checked={newField.required}
                        onCheckedChange={(checked) =>
                          setNewField({ ...newField, required: checked as boolean })
                        }
                        className="mt-1"
                      />
                      <div>
                        <label
                          htmlFor="required"
                          className="text-sm font-medium text-purple-800 cursor-pointer"
                        >
                          Required Field
                        </label>
                        <p className="text-xs text-purple-600 mt-1">
                          This field must be filled when creating or updating contacts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      Preview
                    </h3>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getFieldTypeIcon(newField.type)}
                        <span className="font-medium text-green-800">
                          {newField.name || 'Field Name'}
                          {newField.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </div>
                      <div className="text-sm text-green-600">
                        Type: {newField.type}
                        {newField.options && newField.type === 'Dropdown' && (
                          <span className="ml-2">
                            ({newField.options.split(',').map(o => o.trim()).filter(Boolean).length} options)
                          </span>
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
                onClick={() => setIsAddDialogOpen(false)}
                className="hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddField}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Custom Field Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[95vh] flex flex-col p-0">
            <DialogHeader className="px-6 py-4 border-b border-slate-300 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center">
                  <Edit className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-slate-900">
                    Edit Custom Field
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Update this custom field&apos;s properties
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Field Configuration */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      Field Configuration
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name" className="text-sm font-medium text-slate-700">
                        Field Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-name"
                        placeholder="e.g. Company Size, Budget, Referral Source"
                        value={editField.name}
                        onChange={(e) => setEditField({ ...editField, name: e.target.value })}
                        className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-type" className="text-sm font-medium text-slate-700">
                        Field Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={editField.type}
                        onValueChange={(value) => setEditField({ ...editField, type: value as FieldType })}
                      >
                        <SelectTrigger id="edit-type" className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20">
                          <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Text">
                            <div className="flex items-center gap-2">
                              <TextQuote className="h-4 w-4 text-blue-500" />
                              <span>Text</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Number">
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4 text-green-500" />
                              <span>Number</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Date">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-amber-500" />
                              <span>Date</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Dropdown">
                            <div className="flex items-center gap-2">
                              <List className="h-4 w-4 text-purple-500" />
                              <span>Dropdown</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {editField.type === 'Dropdown' && (
                      <div className="space-y-2">
                        <Label htmlFor="edit-options" className="text-sm font-medium text-slate-700">
                          Dropdown Options <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="edit-options"
                          placeholder="Option 1, Option 2, Option 3"
                          value={editField.options}
                          onChange={(e) => setEditField({ ...editField, options: e.target.value })}
                          className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20"
                        />
                        <p className="text-xs text-slate-500">
                          Enter options separated by commas
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="edit-defaultValue" className="text-sm font-medium text-slate-700">
                        Default Value (Optional)
                      </Label>
                      <Input
                        id="edit-defaultValue"
                        placeholder="Default value"
                        value={editField.defaultValue}
                        onChange={(e) => setEditField({ ...editField, defaultValue: e.target.value })}
                        className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Field Properties */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      Field Properties
                    </h3>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="edit-required"
                        checked={editField.required}
                        onCheckedChange={(checked) =>
                          setEditField({ ...editField, required: checked as boolean })
                        }
                        className="mt-1"
                      />
                      <div>
                        <label
                          htmlFor="edit-required"
                          className="text-sm font-medium text-purple-800 cursor-pointer"
                        >
                          Required Field
                        </label>
                        <p className="text-xs text-purple-600 mt-1">
                          This field must be filled when creating or updating contacts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      Preview
                    </h3>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getFieldTypeIcon(editField.type)}
                        <span className="font-medium text-green-800">
                          {editField.name || 'Field Name'}
                          {editField.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </div>
                      <div className="text-sm text-green-600">
                        Type: {editField.type}
                        {editField.options && editField.type === 'Dropdown' && (
                          <span className="ml-2">
                            ({editField.options.split(',').map(o => o.trim()).filter(Boolean).length} options)
                          </span>
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
                onClick={handleUpdateField}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[450px] p-0">
            <DialogHeader className="px-6 py-4 border-b border-slate-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/20 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-red-600">
                    Delete Custom Field?
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    This action cannot be undone
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="px-6 py-6">
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">
                    This field will be removed from your contact forms and filter options.
                    Existing data in contacts will be preserved but not visible or editable.
                  </p>
                </div>

                {selectedField && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                        {getFieldTypeIcon(selectedField.type)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{selectedField.name}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                          <span>Type: {selectedField.type}</span>
                          {selectedField.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-white">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteField}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Field
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Custom Field?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This field will be removed from your contact forms and filter options.
                Existing data in contacts will be preserved but not visible or editable.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedField && (
                <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                  {getFieldTypeIcon(selectedField.type)}
                  <div>
                    <div className="font-medium">{selectedField.name}</div>
                    <div className="text-sm text-muted-foreground">Type: {selectedField.type}</div>
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
                onClick={handleDeleteField}
              >
                Delete Field
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
