"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Upload,
  Download,
  Tag,
  UserPlus,
  ArrowUpDown,
  ChevronDown,
  Check,
  Star,
  User,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Info,
  X,
  Trash
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

// Mock data for contacts
const contacts = [
  {
    id: 1,
    firstName: "Sarah",
    lastName: "Johnson",
    phoneNumber: "+1 (555) 123-4567",
    waId: "15551234567",
    email: "sarah@example.com",
    profilePicture: "/avatars/female1.jpg",
    labels: ["Customer", "Premium", "Active"],
    lastMessageTimestamp: new Date(2023, 5, 15),
    isSubscribed: true,
    optInStatus: "opted_in",
    lastContactedAt: new Date(2023, 5, 15),
    tags: ["interested", "follow-up"],
    notes: ["Interested in premium plan", "Asked about international shipping"],
  },
  {
    id: 2,
    firstName: "Michael",
    lastName: "Rodriguez",
    phoneNumber: "+1 (555) 987-6543",
    waId: "15559876543",
    email: "michael@example.com",
    profilePicture: "/avatars/man3.jpg",
    labels: ["Customer", "New"],
    lastMessageTimestamp: new Date(2023, 5, 14),
    isSubscribed: true,
    optInStatus: "opted_in",
    lastContactedAt: new Date(2023, 5, 14),
    tags: ["new-customer"],
    notes: ["First time buyer"],
  },
  {
    id: 3,
    firstName: "Emma",
    lastName: "Wilson",
    phoneNumber: "+1 (555) 456-7890",
    waId: "15554567890",
    email: "emma@example.com",
    profilePicture: "/avatars/female2.jpg",
    labels: ["Customer", "Support"],
    lastMessageTimestamp: new Date(2023, 5, 12),
    isSubscribed: true,
    optInStatus: "opted_in",
    lastContactedAt: new Date(2023, 5, 12),
    tags: ["support", "billing-issue"],
    notes: ["Had issues with payment", "Resolved on last call"],
  },
  {
    id: 4,
    firstName: "James",
    lastName: "Thompson",
    phoneNumber: "+1 (555) 234-5678",
    waId: "15552345678",
    email: "james@example.com",
    profilePicture: "/avatars/man1.jpg",
    labels: ["Lead"],
    lastMessageTimestamp: new Date(2023, 5, 10),
    isSubscribed: true,
    optInStatus: "opted_in",
    lastContactedAt: new Date(2023, 5, 10),
    tags: ["lead", "pricing"],
    notes: ["Requested pricing information", "Send follow up next week"],
  },
  {
    id: 5,
    firstName: "Olivia",
    lastName: "Davis",
    phoneNumber: "+1 (555) 876-5432",
    waId: "15558765432",
    email: "olivia@example.com",
    profilePicture: "",
    labels: ["Customer", "Inactive"],
    lastMessageTimestamp: new Date(2023, 4, 25),
    isSubscribed: false,
    optInStatus: "opted_out",
    lastContactedAt: new Date(2023, 4, 25),
    tags: ["inactive", "churned"],
    notes: ["Unsubscribed last month", "Was unhappy with shipping times"],
  },
];

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [openContactId, setOpenContactId] = useState<number | null>(null);
  const [addContactOpen, setAddContactOpen] = useState(false);

  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const phone = contact.phoneNumber.toLowerCase();
    const email = contact.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || phone.includes(query) || email.includes(query);
  });

  const toggleSelectContact = (id: number) => {
    setSelectedContacts(prev =>
      prev.includes(id)
        ? prev.filter(contactId => contactId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Contacts</h2>
            <p className="text-muted-foreground">
              Manage your WhatsApp contacts and communication preferences
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => setAddContactOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contacts</SelectItem>
                <SelectItem value="subscribed">Subscribed</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                <SelectItem value="recent">Recently Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            {selectedContacts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Actions
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Message Selected</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Tag className="mr-2 h-4 w-4" />
                    <span>Add Label</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Add to Group</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Delete Selected</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <div className="flex border rounded-md overflow-hidden">
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
            </div>
          </div>
        </div>

        {viewMode === "table" ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Labels</TableHead>
                  <TableHead>Last Contacted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                      No contacts found. Try adjusting your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id} className="group">
                      <TableCell>
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => toggleSelectContact(contact.id)}
                          aria-label={`Select ${contact.firstName} ${contact.lastName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={contact.profilePicture} alt={`${contact.firstName} ${contact.lastName}`} />
                            <AvatarFallback>{contact.firstName[0]}{contact.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                            <div className="text-sm text-muted-foreground">{contact.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{contact.phoneNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contact.labels.map((label, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={
                                label === "Premium" ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                                label === "Active" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                label === "Support" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                label === "Lead" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                label === "Inactive" ? "bg-gray-500/10 text-gray-500 border-gray-500/20" :
                                label === "New" ? "bg-primary/10 text-primary border-primary/20" :
                                "bg-muted text-muted-foreground"
                              }
                            >
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{format(contact.lastContactedAt, "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            contact.optInStatus === "opted_in"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          }
                        >
                          {contact.optInStatus === "opted_in" ? "Subscribed" : "Unsubscribed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={() => setOpenContactId(contact.id)}
                          >
                            <Info className="h-4 w-4" />
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
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                              <DropdownMenuItem>Add to Group</DropdownMenuItem>
                              <DropdownMenuItem>Add Label</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">Delete Contact</DropdownMenuItem>
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredContacts.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-48 bg-muted/20 rounded-lg border">
                <p className="text-muted-foreground">No contacts found. Try adjusting your search.</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <Card key={contact.id} className="group">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Checkbox
                          className="mr-2"
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => toggleSelectContact(contact.id)}
                          aria-label={`Select ${contact.firstName} ${contact.lastName}`}
                        />
                        <div>
                          <CardTitle className="text-base">{contact.firstName} {contact.lastName}</CardTitle>
                          <CardDescription className="truncate max-w-[180px]">{contact.email}</CardDescription>
                        </div>
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
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                          <DropdownMenuItem>Add to Group</DropdownMenuItem>
                          <DropdownMenuItem>Add Label</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Delete Contact</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={contact.profilePicture} alt={`${contact.firstName} ${contact.lastName}`} />
                        <AvatarFallback>{contact.firstName[0]}{contact.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          {contact.phoneNumber}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {contact.labels.slice(0, 2).map((label, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={
                                label === "Premium" ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                                label === "Active" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                label === "Support" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                label === "Lead" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                label === "Inactive" ? "bg-gray-500/10 text-gray-500 border-gray-500/20" :
                                label === "New" ? "bg-primary/10 text-primary border-primary/20" :
                                "bg-muted text-muted-foreground"
                              }
                            >
                              {label}
                            </Badge>
                          ))}
                          {contact.labels.length > 2 && (
                            <Badge variant="outline">+{contact.labels.length - 2}</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Message</span>
                        <span>{format(contact.lastMessageTimestamp, "MMM d")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge
                          variant="outline"
                          className={
                            contact.optInStatus === "opted_in"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          }
                        >
                          {contact.optInStatus === "opted_in" ? "Subscribed" : "Unsubscribed"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3 flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => setOpenContactId(contact.id)}
                    >
                      <Info className="h-3.5 w-3.5 mr-1" />
                      Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      Message
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Contact details dialog */}
      {openContactId && (
        <Dialog open={openContactId !== null} onOpenChange={() => setOpenContactId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Contact Details</DialogTitle>
              <DialogDescription>
                View and manage contact information
              </DialogDescription>
            </DialogHeader>

            {(() => {
              const contact = contacts.find(c => c.id === openContactId);
              if (!contact) return null;

              return (
                <div className="mt-4">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col items-center gap-3">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={contact.profilePicture} alt={`${contact.firstName} ${contact.lastName}`} />
                        <AvatarFallback className="text-2xl">{contact.firstName[0]}{contact.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex">
                        <Button variant="outline" size="sm" className="text-xs mr-2">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Phone className="h-3.5 w-3.5 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">{contact.firstName} {contact.lastName}</h3>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {contact.labels.map((label, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={
                                label === "Premium" ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                                label === "Active" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                label === "Support" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                label === "Lead" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                label === "Inactive" ? "bg-gray-500/10 text-gray-500 border-gray-500/20" :
                                label === "New" ? "bg-primary/10 text-primary border-primary/20" :
                                "bg-muted text-muted-foreground"
                              }
                            >
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Tabs defaultValue="info">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="info">Basic Info</TabsTrigger>
                          <TabsTrigger value="activity">Activity</TabsTrigger>
                          <TabsTrigger value="notes">Notes</TabsTrigger>
                          <TabsTrigger value="tags">Tags</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="text-sm font-medium">Phone</div>
                            <div className="text-sm">{contact.phoneNumber}</div>

                            <div className="text-sm font-medium">WhatsApp ID</div>
                            <div className="text-sm">{contact.waId}</div>

                            <div className="text-sm font-medium">Email</div>
                            <div className="text-sm">{contact.email}</div>

                            <div className="text-sm font-medium">Status</div>
                            <div className="text-sm">
                              <Badge
                                variant="outline"
                                className={
                                  contact.optInStatus === "opted_in"
                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                                }
                              >
                                {contact.optInStatus === "opted_in" ? "Subscribed" : "Unsubscribed"}
                              </Badge>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="activity" className="mt-4">
                          <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Last Message</span>
                              <span>{format(contact.lastMessageTimestamp, "MMM d, yyyy 'at' h:mm a")}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                          <span className="font-medium">Last Contacted</span>
                              <span>{format(contact.lastContactedAt, "MMM d, yyyy 'at' h:mm a")}</span>
                            </div>
                            <div className="border-t pt-4">
                              <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                              <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-1.5">
                                    <MessageSquare className="h-3 w-3 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div>
                                    <div className="text-sm">Sent message</div>
                                    <div className="text-xs text-muted-foreground">{format(new Date(2023, 5, 15), "MMM d, yyyy 'at' h:mm a")}</div>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5">
                                    <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div>
                                    <div className="text-sm">Opted in to marketing messages</div>
                                    <div className="text-xs text-muted-foreground">{format(new Date(2023, 5, 10), "MMM d, yyyy 'at' h:mm a")}</div>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-1.5">
                                    <Tag className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div>
                                    <div className="text-sm">Added to Premium label</div>
                                    <div className="text-xs text-muted-foreground">{format(new Date(2023, 5, 5), "MMM d, yyyy 'at' h:mm a")}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="notes" className="mt-4">
                          <div className="space-y-4">
                            {contact.notes.length === 0 ? (
                              <div className="text-center p-4 text-muted-foreground">
                                No notes available for this contact.
                              </div>
                            ) : (
                              contact.notes.map((note, index) => (
                                <div key={index} className="bg-muted/30 rounded-lg p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="font-medium text-sm">Note {index + 1}</div>
                                    <div className="text-xs text-muted-foreground">{format(new Date(2023, 5 - index, 15 - index * 3), "MMM d, yyyy")}</div>
                                  </div>
                                  <p className="text-sm">{note}</p>
                                </div>
                              ))
                            )}

                            <div className="pt-2">
                              <Button variant="outline" size="sm" className="w-full">
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Add Note
                              </Button>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="tags" className="mt-4">
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {contact.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-muted px-2 py-1 flex items-center gap-1"
                                >
                                  {tag}
                                  <X className="h-3 w-3 cursor-pointer" />
                                </Badge>
                              ))}
                            </div>

                            <div className="pt-2">
                              <Button variant="outline" size="sm" className="w-full">
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Add Tag
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </div>
              );
            })()}

            <DialogFooter className="mt-6">
              <Button variant="outline" size="sm">Edit Contact</Button>
              <Button size="sm">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Contact Dialog */}
      <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Create a new WhatsApp contact in your database.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name <span className="text-destructive">*</span>
                </label>
                <Input id="firstName" placeholder="First Name" />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <Input id="lastName" placeholder="Last Name" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <Input id="phoneNumber" placeholder="+1 (555) 123-4567" />
              <p className="text-xs text-muted-foreground">
                Must include country code (e.g. +1)
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" type="email" placeholder="email@example.com" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Labels
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select labels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Opt-in Status
              </label>
              <Select defaultValue="opted_in">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opted_in">Subscribed (Opted In)</SelectItem>
                  <SelectItem value="opted_out">Unsubscribed (Opted Out)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddContactOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
