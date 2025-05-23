"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Tag,
  Edit,
  Trash,
  PenLine,
  CheckCircle,
  Users,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  User,
  XCircle
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { HexColorPicker } from "react-colorful";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for contact labels
const contactLabels = [
  {
    id: 1,
    name: "Customer",
    description: "All active customers",
    contactCount: 3247,
    color: "#25D366", // WhatsApp green
    lastUpdated: new Date(2023, 5, 15),
    createdAt: new Date(2023, 1, 10),
  },
  {
    id: 2,
    name: "Premium",
    description: "Premium subscription customers",
    contactCount: 752,
    color: "#9C27B0", // Purple
    lastUpdated: new Date(2023, 5, 12),
    createdAt: new Date(2023, 2, 5),
  },
  {
    id: 3,
    name: "Active",
    description: "Customers who have engaged in the last 30 days",
    contactCount: 2184,
    color: "#4CAF50", // Green
    lastUpdated: new Date(2023, 5, 14),
    createdAt: new Date(2023, 3, 8),
  },
  {
    id: 4,
    name: "Support",
    description: "Customers with open support tickets",
    contactCount: 97,
    color: "#2196F3", // Blue
    lastUpdated: new Date(2023, 5, 13),
    createdAt: new Date(2023, 4, 20),
  },
  {
    id: 5,
    name: "Lead",
    description: "Potential customers in the sales pipeline",
    contactCount: 346,
    color: "#FF9800", // Orange
    lastUpdated: new Date(2023, 5, 10),
    createdAt: new Date(2023, 4, 15),
  },
  {
    id: 6,
    name: "Inactive",
    description: "Customers who haven't engaged in the last 90 days",
    contactCount: 589,
    color: "#9E9E9E", // Gray
    lastUpdated: new Date(2023, 5, 8),
    createdAt: new Date(2023, 3, 1),
  },
  {
    id: 7,
    name: "New",
    description: "Customers who joined in the last 30 days",
    contactCount: 124,
    color: "#673AB7", // Deep Purple
    lastUpdated: new Date(2023, 5, 15),
    createdAt: new Date(2023, 5, 1),
  },
];

export default function ContactLabelsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createLabelOpen, setCreateLabelOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<null | number>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [editingLabel, setEditingLabel] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState("#25D366");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const filteredLabels = contactLabels.filter(label => {
    return label.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      label.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Contact Labels</h2>
            <p className="text-muted-foreground">
              Create and manage labels to categorize your WhatsApp contacts
            </p>
          </div>
          <Button onClick={() => {
            setSelectedColor("#25D366");
            setCreateLabelOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Label
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search labels..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("grid")}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path d="M2 2.5C2 2.22386 2.22386 2 2.5 2H5.5C5.77614 2 6 2.22386 6 2.5V5.5C6 5.77614 5.77614 6 5.5 6H2.5C2.22386 6 2 5.77614 2 5.5V2.5ZM9 2.5C9 2.22386 9.22386 2 9.5 2H12.5C12.7761 2 13 2.22386 13 2.5V5.5C13 5.77614 12.7761 6 12.5 6H9.5C9.22386 6 9 5.77614 9 5.5V2.5ZM2 9.5C2 9.22386 2.22386 9 2.5 9H5.5C5.77614 9 6 9.22386 6 9.5V12.5C6 12.7761 5.77614 13 5.5 13H2.5C2.22386 13 2 12.7761 2 12.5V9.5ZM9 9.5C9 9.22386 9.22386 9 9.5 9H12.5C12.7761 9 13 9.22386 13 9.5V12.5C13 12.7761 12.7761 13 12.5 13H9.5C9.22386 13 9 12.7761 9 12.5V9.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("table")}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path d="M1.5 2C1.22386 2 1 2.22386 1 2.5V12.5C1 12.7761 1.22386 13 1.5 13H13.5C13.7761 13 14 12.7761 14 12.5V2.5C14 2.22386 13.7761 2 13.5 2H1.5ZM2 3H13V7H2V3ZM2 8H7V12H2V8ZM8 8H13V12H8V8Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </Button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLabels.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-48 bg-muted/20 rounded-lg border">
                <p className="text-muted-foreground">No labels found. Try adjusting your search.</p>
              </div>
            ) : (
              filteredLabels.map((label) => (
                <Card key={label.id} className="group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2 flex-shrink-0"
                          style={{ backgroundColor: label.color }}
                        ></div>
                        <CardTitle className="text-lg">{label.name}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedLabel(label.id)}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>View Contacts</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Message All</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setEditingLabel(label.id);
                            setSelectedColor(label.color);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Label</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete Label</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="line-clamp-2">{label.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Contacts</span>
                        <span>{label.contactCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span>{format(label.lastUpdated, "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Created</span>
                        <span>{format(label.createdAt, "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedLabel(label.id)}>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      View Contacts
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLabels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No labels found. Try adjusting your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLabels.map((label) => (
                    <TableRow key={label.id} className="group">
                      <TableCell>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                            style={{ backgroundColor: label.color }}
                          ></div>
                          <div>
                            <div className="font-medium">{label.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{label.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{label.contactCount.toLocaleString()}</TableCell>
                      <TableCell>{format(label.lastUpdated, "MMM d, yyyy")}</TableCell>
                      <TableCell>{format(label.createdAt, "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={() => setSelectedLabel(label.id)}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedLabel(label.id)}>
                                <Users className="mr-2 h-4 w-4" />
                                <span>View Contacts</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span>Message All</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setEditingLabel(label.id);
                                setSelectedColor(label.color);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Label</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete Label</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create Label Dialog */}
      <Dialog open={createLabelOpen} onOpenChange={setCreateLabelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Label</DialogTitle>
            <DialogDescription>
              Create a new label to categorize your contacts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="labelName" className="text-sm font-medium">
                Label Name <span className="text-destructive">*</span>
              </label>
              <Input id="labelName" placeholder="e.g. Premium Customers" />
            </div>

            <div className="space-y-2">
              <label htmlFor="labelDescription" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="labelDescription"
                placeholder="Describe what this label represents"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Color
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-md cursor-pointer border"
                  style={{ backgroundColor: selectedColor }}
                  onClick={() => setColorPickerOpen(!colorPickerOpen)}
                ></div>
                <Input
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="font-mono"
                />
              </div>

              {colorPickerOpen && (
                <div className="mt-2 p-3 border rounded-md bg-card">
                  {/* <HexColorPicker color={selectedColor} onChange={setSelectedColor} /> */}
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setColorPickerOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateLabelOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Label
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Label Dialog */}
      <Dialog
        open={editingLabel !== null}
        onOpenChange={(open) => !open && setEditingLabel(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Label</DialogTitle>
            <DialogDescription>
              Update your label details.
            </DialogDescription>
          </DialogHeader>
          {editingLabel !== null && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="editLabelName" className="text-sm font-medium">
                  Label Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="editLabelName"
                  defaultValue={contactLabels.find(l => l.id === editingLabel)?.name}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="editLabelDescription" className="text-sm font-medium">
                  Description
                </label>
                <Input
                  id="editLabelDescription"
                  defaultValue={contactLabels.find(l => l.id === editingLabel)?.description}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-md cursor-pointer border"
                    style={{ backgroundColor: selectedColor }}
                    onClick={() => setColorPickerOpen(!colorPickerOpen)}
                  ></div>
                  <Input
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="font-mono"
                  />
                </div>

                {colorPickerOpen && (
                  <div className="mt-2 p-3 border rounded-md bg-card">
                    {/* <HexColorPicker color={selectedColor} onChange={setSelectedColor} /> */}
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setColorPickerOpen(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button variant="outline" className="text-destructive" size="sm">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingLabel(null)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Label Contacts Dialog */}
      <Dialog open={selectedLabel !== null} onOpenChange={() => setSelectedLabel(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center">
                {selectedLabel !== null && (
                  <div
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: contactLabels.find(l => l.id === selectedLabel)?.color }}
                  ></div>
                )}
                <span>
                  {selectedLabel !== null && contactLabels.find(l => l.id === selectedLabel)?.name} Contacts
                </span>
              </div>
            </DialogTitle>
            <DialogDescription>
              Contacts with this label.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Badge>
                  {selectedLabel !== null && contactLabels.find(l => l.id === selectedLabel)?.contactCount} contacts
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Last updated {selectedLabel !== null && format(contactLabels.find(l => l.id === selectedLabel)?.lastUpdated || new Date(), "MMM d, yyyy")}
                </span>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Filter contacts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contacts</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {selectedLabel !== null && contactLabels.find(l => l.id === selectedLabel)?.contactCount} contacts
                </span>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto mt-4 border rounded-md">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-4 border-b last:border-0 hover:bg-muted/30">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9 mr-3">
                      <AvatarImage src={`/avatars/${i % 2 === 0 ? 'man' : 'female'}${i % 3 + 1}.jpg`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {i % 2 === 0 ? "John Doe" : "Jane Smith"} {i + 1}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        +1 (555) {i}23-456{i}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2 w-full justify-between">
              <Button variant="outline" size="sm" onClick={() => setSelectedLabel(null)}>
                Close
              </Button>
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message All
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
