"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Users,
  UserPlus,
  Edit,
  Trash,
  User,
  MessageSquare,
  ArrowRight,
  Check,
  X
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { format } from "date-fns";

// Mock data for contact groups
const contactGroups = [
  {
    id: 1,
    name: "Newsletter Subscribers",
    description: "Customers who have opted in to receive marketing newsletters",
    contactCount: 1245,
    lastUpdated: new Date(2023, 5, 12),
    createdAt: new Date(2023, 2, 15),
    isActive: true,
    owner: "John Doe",
    avatars: ["/avatars/female1.jpg", "/avatars/man3.jpg", "/avatars/female2.jpg"]
  },
  {
    id: 2,
    name: "Premium Customers",
    description: "Customers with premium subscription plans",
    contactCount: 867,
    lastUpdated: new Date(2023, 5, 10),
    createdAt: new Date(2023, 3, 20),
    isActive: true,
    owner: "Jane Smith",
    avatars: ["/avatars/female1.jpg", "/avatars/man1.jpg"]
  },
  {
    id: 3,
    name: "Product Updates",
    description: "Customers interested in product updates and new releases",
    contactCount: 532,
    lastUpdated: new Date(2023, 5, 8),
    createdAt: new Date(2023, 4, 5),
    isActive: true,
    owner: "John Doe",
    avatars: ["/avatars/man3.jpg", "/avatars/female2.jpg", "/avatars/man1.jpg"]
  },
  {
    id: 4,
    name: "Inactive Customers",
    description: "Customers who haven't engaged in the last 90 days",
    contactCount: 218,
    lastUpdated: new Date(2023, 5, 1),
    createdAt: new Date(2023, 4, 12),
    isActive: false,
    owner: "Jane Smith",
    avatars: ["/avatars/female2.jpg"]
  },
  {
    id: 5,
    name: "New Leads",
    description: "Recent leads that need nurturing",
    contactCount: 97,
    lastUpdated: new Date(2023, 5, 15),
    createdAt: new Date(2023, 5, 1),
    isActive: true,
    owner: "John Doe",
    avatars: ["/avatars/man1.jpg"]
  },
];

export default function ContactGroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<null | number>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filteredGroups = contactGroups.filter(group => {
    return group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Contact Groups</h2>
            <p className="text-muted-foreground">
              Organize contacts into groups for easier management and messaging
            </p>
          </div>
          <Button onClick={() => setCreateGroupOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
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
            {filteredGroups.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-48 bg-muted/20 rounded-lg border">
                <p className="text-muted-foreground">No groups found. Try adjusting your search.</p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <Card key={group.id} className="group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
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
                          <DropdownMenuItem onClick={() => setSelectedGroup(group.id)}>
                            <User className="mr-2 h-4 w-4" />
                            <span>View Members</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Message Group</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Group</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete Group</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="line-clamp-2">{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex justify-between mb-3">
                      <div className="flex -space-x-2">
                        {group.avatars.map((avatar, i) => (
                          <Avatar key={i} className="border-2 border-background h-8 w-8">
                            <AvatarImage src={avatar} />
                            <AvatarFallback>U{i+1}</AvatarFallback>
                          </Avatar>
                        ))}
                        {group.contactCount > group.avatars.length && (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
                            +{group.contactCount - group.avatars.length}
                          </div>
                        )}
                      </div>
                      <Badge variant={group.isActive ? "default" : "outline"}>
                        {group.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Contacts</span>
                        <span>{group.contactCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span>{format(group.lastUpdated, "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Owner</span>
                        <span>{group.owner}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedGroup(group.id)}>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Manage Group
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
                  <TableHead>Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No groups found. Try adjusting your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroups.map((group) => (
                    <TableRow key={group.id} className="group">
                      <TableCell>
                        <div>
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">{group.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex -space-x-2 mr-2">
                            {group.avatars.slice(0, 3).map((avatar, i) => (
                              <Avatar key={i} className="border-2 border-background h-6 w-6">
                                <AvatarImage src={avatar} />
                                <AvatarFallback>U{i+1}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-sm">{group.contactCount.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>{format(group.lastUpdated, "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={group.isActive ? "default" : "outline"}>
                          {group.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{group.owner}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={() => setSelectedGroup(group.id)}
                          >
                            <User className="h-4 w-4" />
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
                              <DropdownMenuItem onClick={() => setSelectedGroup(group.id)}>
                                <User className="mr-2 h-4 w-4" />
                                <span>View Members</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span>Message Group</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Group</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete Group</span>
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

      {/* Create Group Dialog */}
      <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Contact Group</DialogTitle>
            <DialogDescription>
              Create a new group to organize your contacts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="groupName" className="text-sm font-medium">
                Group Name <span className="text-destructive">*</span>
              </label>
              <Input id="groupName" placeholder="e.g. Newsletter Subscribers" />
            </div>

            <div className="space-y-2">
              <label htmlFor="groupDescription" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="groupDescription"
                placeholder="Describe the purpose of this group"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="contacts" className="text-sm font-medium">
                  Add Contacts
                </label>
                <Button variant="link" size="sm" className="text-xs h-auto p-0">
                  Select All
                </Button>
              </div>
              <div className="max-h-52 overflow-y-auto border rounded-md p-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={`/avatars/${i % 2 === 0 ? 'man' : 'female'}${i % 3 + 1}.jpg`} />
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">
                          {i % 2 === 0 ? "John Doe" : "Jane Smith"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          +1 (555) {i}23-456{i}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">5 contacts selected</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateGroupOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Group Members Dialog */}
      <Dialog open={selectedGroup !== null} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Group Members</DialogTitle>
            <DialogDescription>
              Manage contacts in this group.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">
                {selectedGroup !== null ? contactGroups.find(g => g.id === selectedGroup)?.name : ""}
              </h3>
              <Badge>
                {selectedGroup !== null ? contactGroups.find(g => g.id === selectedGroup)?.contactCount : 0} contacts
              </Badge>
            </div>

            <div className="flex justify-between items-center mb-4">
              <Input
                placeholder="Search members..."
                className="max-w-sm"
              />
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Members
              </Button>
            </div>

           <div className="max-h-80 overflow-y-auto border rounded-md">
              {/* This would be populated with the group's actual members */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 px-4 border-b last:border-0 hover:bg-muted/30">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9 mr-3">
                      <AvatarImage src={`/avatars/${i % 2 === 0 ? 'man' : 'female'}${i % 3 + 1}.jpg`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {i % 2 === 0 ? "John Doe" : "Jane Smith"} {i}
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
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" size="sm" className="text-destructive">
              <Trash className="h-4 w-4 mr-2" />
              Delete Group
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedGroup(null)}>
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
