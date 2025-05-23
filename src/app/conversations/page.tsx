"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  MessageSquare,
  Phone,
  Video,
  UserPlus,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  ChevronRight,
  Upload,
  Camera,
  FileText,
  MapPin,
  Contact,
  Inbox,
  CheckCircle,
  AlertCircle,
  Clock,
  Tag,
  User,
  BarChart
} from "lucide-react";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

export default function ConversationsPage() {
  const [activeConversation, setActiveConversation] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for conversations
  const conversations = [
    {
      id: 1,
      name: "Sarah Johnson",
      phone: "+1 (555) 123-4567",
      avatar: "/avatars/female1.jpg",
      lastMessage: "I'm interested in your product. Can you tell me more about it?",
      time: "10:42 AM",
      unread: 2,
      isActive: true,
      status: "active",
      assignedTo: "John Doe",
      lastMessageType: "text",
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      phone: "+1 (555) 987-6543",
      avatar: "/avatars/man3.jpg",
      lastMessage: "Thanks for the update on my order!",
      time: "Yesterday",
      unread: 0,
      isActive: false,
      status: "active",
      assignedTo: null,
      lastMessageType: "text",
    },
    {
      id: 3,
      name: "Emma Wilson",
      phone: "+1 (555) 456-7890",
      avatar: "/avatars/female2.jpg",
      lastMessage: "When will my order be shipped?",
      time: "Yesterday",
      unread: 0,
      isActive: false,
      status: "closed",
      assignedTo: "Jane Smith",
      lastMessageType: "text",
    },
    {
      id: 4,
      name: "James Thompson",
      phone: "+1 (555) 234-5678",
      avatar: "/avatars/man1.jpg",
      lastMessage: "Template: order_confirmation",
      time: "2 days ago",
      unread: 0,
      isActive: false,
      status: "resolved",
      assignedTo: null,
      lastMessageType: "template",
    },
  ];

  // Mock data for messages in the active conversation
  const messages = [
    {
      id: 1,
      senderId: "customer",
      content: "Hi there! I'm interested in your product. Can you tell me more about it?",
      timestamp: "10:30 AM",
      status: "read"
    },
    {
      id: 2,
      senderId: "agent",
      content: "Hello Sarah! Thank you for your interest. Our premium widget comes with a 2-year warranty and is available in three colors. Would you like me to send you our catalog?",
      timestamp: "10:35 AM",
      status: "read"
    },
    {
      id: 3,
      senderId: "customer",
      content: "Yes, that would be great. Also, do you offer international shipping?",
      timestamp: "10:40 AM",
      status: "read"
    },
    {
      id: 4,
      senderId: "agent",
      content: "Here's our latest catalog with all product specifications.",
      timestamp: "10:41 AM",
      status: "read",
      attachmentType: "document",
      attachmentName: "Product_Catalog_2023.pdf"
    },
    {
      id: 5,
      senderId: "agent",
      content: "Yes, we do offer international shipping to most countries. Shipping costs depend on the destination. May I know which country you're located in?",
      timestamp: "10:42 AM",
      status: "delivered"
    },
  ];

  return (
    <Layout>
      <div className="h-[calc(100vh-theme(spacing.14))] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Conversations</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>

        <div className="flex h-full border rounded-lg overflow-hidden">
          {/* Conversation list */}
          <div className="w-80 flex flex-col border-r bg-muted/20">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue="all" className="flex-1 flex flex-col">
              <div className="px-1 border-b">
                <TabsList className="w-full justify-start my-1 h-8 bg-transparent p-0 space-x-2">
                  <TabsTrigger value="all" className="h-7 px-2 data-[state=active]:bg-muted">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="unassigned" className="h-7 px-2 data-[state=active]:bg-muted">
                    Unassigned
                  </TabsTrigger>
                  <TabsTrigger value="assigned" className="h-7 px-2 data-[state=active]:bg-muted">
                    My Chats
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="flex-1 overflow-y-auto pt-0 mt-0">
                {conversations.map((conversation, index) => (
                  <div
                    key={conversation.id}
                    className={`p-3 cursor-pointer hover:bg-muted/50 ${
                      index === activeConversation ? "bg-muted" : ""
                    } ${index !== conversations.length - 1 ? "border-b" : ""}`}
                    onClick={() => setActiveConversation(index)}
                  >
                    <div className="flex gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.avatar} alt={conversation.name} />
                          <AvatarFallback>{conversation.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        {conversation.isActive && (
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-background"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="font-medium truncate pr-2">{conversation.name}</div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground">{conversation.time}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessageType === "template" ? (
                              <span className="italic">{conversation.lastMessage}</span>
                            ) : (
                              conversation.lastMessage
                            )}
                          </div>
                          {conversation.unread > 0 && (
                            <Badge className="ml-2">{conversation.unread}</Badge>
                          )}
                        </div>
                        <div className="flex gap-1 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs px-1.5 py-0 h-5 ${
                              conversation.status === "active" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                              conversation.status === "closed" ? "bg-gray-500/10 text-gray-500 border-gray-500/20" :
                              "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            }`}
                          >
                            {conversation.status}
                          </Badge>
                          {conversation.assignedTo && (
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0 h-5 bg-purple-500/10 text-purple-500 border-purple-500/20"
                            >
                              {conversation.assignedTo.split(" ")[0]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="unassigned" className="flex-1 overflow-y-auto pt-0 mt-0">
                {conversations.filter(c => !c.assignedTo).map((conversation, index) => (
                  <div
                    key={conversation.id}
                    className={`p-3 cursor-pointer hover:bg-muted/50 ${
                      index === activeConversation && !conversations[activeConversation].assignedTo ? "bg-muted" : ""
                    } ${index !== conversations.length - 1 ? "border-b" : ""}`}
                    onClick={() => {
                      const newIndex = conversations.findIndex(c => c.id === conversation.id);
                      setActiveConversation(newIndex);
                    }}
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.avatar} alt={conversation.name} />
                        <AvatarFallback>{conversation.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="font-medium truncate pr-2">{conversation.name}</div>
                          <span className="text-xs text-muted-foreground">{conversation.time}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessageType === "template" ? (
                              <span className="italic">{conversation.lastMessage}</span>
                            ) : (
                              conversation.lastMessage
                            )}
                          </div>
                          {conversation.unread > 0 && (
                            <Badge className="ml-2">{conversation.unread}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {conversations.filter(c => !c.assignedTo).length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <Inbox className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No unassigned conversations</h3>
                    <p className="text-sm text-muted-foreground">All conversations have been assigned to agents</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="assigned" className="flex-1 overflow-y-auto pt-0 mt-0">
                {conversations.filter(c => c.assignedTo === "John Doe").map((conversation, index) => (
                  <div
                    key={conversation.id}
                    className={`p-3 cursor-pointer hover:bg-muted/50 ${
                      index === activeConversation && conversations[activeConversation].assignedTo === "John Doe" ? "bg-muted" : ""
                    } ${index !== conversations.length - 1 ? "border-b" : ""}`}
                    onClick={() => {
                      const newIndex = conversations.findIndex(c => c.id === conversation.id);
                      setActiveConversation(newIndex);
                    }}
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.avatar} alt={conversation.name} />
                        <AvatarFallback>{conversation.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="font-medium truncate pr-2">{conversation.name}</div>
                          <span className="text-xs text-muted-foreground">{conversation.time}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage}
                          </div>
                          {conversation.unread > 0 && (
                            <Badge className="ml-2">{conversation.unread}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {conversations.filter(c => c.assignedTo === "John Doe").length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No assigned conversations</h3>
                    <p className="text-sm text-muted-foreground">You don&apos;t have any assigned conversations</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Chat window */}
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="px-4 py-3 border-b flex justify-between items-center">
              <div className="flex items-center">
                <Avatar className="h-9 w-9 mr-3">
                  <AvatarImage src={conversations[activeConversation].avatar} alt={conversations[activeConversation].name} />
                  <AvatarFallback>{conversations[activeConversation].name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium flex items-center">
                    {conversations[activeConversation].name}
                    {conversations[activeConversation].isActive && (
                      <span className="ml-2 flex items-center text-xs text-green-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></span>
                        Online
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {conversations[activeConversation].phone}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Call</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Video className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Video Call</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add to group</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Assign Conversation</DropdownMenuItem>
                    <DropdownMenuItem>Add Notes</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                    <DropdownMenuItem>Block Contact</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              <div className="bg-muted/30 text-center text-sm text-muted-foreground py-2 rounded-md">
                {format(new Date(), "MMMM d, yyyy")}
              </div>

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === "agent" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] ${
                    message.senderId === "agent"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                    } rounded-lg px-3 py-2`}
                  >
                    <div className="text-sm">{message.content}</div>

                    {/* Document attachment */}
                    {message.attachmentType === "document" && (
                      <div className="mt-2 bg-background/20 rounded p-2 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{message.attachmentName}</div>
                          <div className="text-xs opacity-80">PDF Document</div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs opacity-70">{message.timestamp}</span>
                      {message.senderId === "agent" && (
                        <span>
                          {message.status === "sent" && <Clock className="h-3 w-3 opacity-70" />}
                          {message.status === "delivered" && <CheckCircle className="h-3 w-3 opacity-70" />}
                          {message.status === "read" && <CheckCircle className="h-3 w-3 opacity-70" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message input */}
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>
                      <Upload className="h-4 w-4 mr-2" />
                      Document
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Camera className="h-4 w-4 mr-2" />
                      Image
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MapPin className="h-4 w-4 mr-2" />
                      Location
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Contact className="h-4 w-4 mr-2" />
                      Contact
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Input placeholder="Type a message..." className="flex-1" />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Customer info panel */}
          <div className="w-80 border-l bg-muted/10 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="flex flex-col items-center mb-4">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarImage src={conversations[activeConversation].avatar} alt={conversations[activeConversation].name} />
                  <AvatarFallback>{conversations[activeConversation].name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <h4 className="font-medium">{conversations[activeConversation].name}</h4>
                <p className="text-sm text-muted-foreground">{conversations[activeConversation].phone}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Basic Info</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="text-sm">sarah.j@example.com</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Contacted</span>
                      <span className="text-sm">Today, 10:42 AM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Joined</span>
                      <span className="text-sm">May 12, 2023</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Labels</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Customer</Badge>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Premium</Badge>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Custom Attributes</h4>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last purchase</span>
                      <span className="text-sm">June 3, 2023</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total orders</span>
                      <span className="text-sm">5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Lifetime value</span>
                      <span className="text-sm">$742.50</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-b">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Conversation Details</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Status</span>
                    <Badge
                      variant="outline"
                      className={
                        conversations[activeConversation].status === "active"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : conversations[activeConversation].status === "closed"
                          ? "bg-gray-500/10 text-gray-500 border-gray-500/20"
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      }
                    >
                      {conversations[activeConversation].status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Assigned To</span>
                    {conversations[activeConversation].assignedTo ? (
                      <div className="flex items-center">
                        <Avatar className="h-5 w-5 mr-1">
                          <AvatarFallback className="text-[10px]">JD</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{conversations[activeConversation].assignedTo}</span>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Assign
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Priority</span>
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                      Medium
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Notes</h3>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Add Note
                </Button>
              </div>

              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center">
                      <Avatar className="h-5 w-5 mr-1">
                        <AvatarFallback className="text-[10px]">JD</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">John Doe</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <p className="text-sm">Customer is interested in our premium plan. Needs more information about international shipping. Follow up tomorrow.</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center">
                      <Avatar className="h-5 w-5 mr-1">
                        <AvatarFallback className="text-[10px]">JS</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">Jane Smith</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Yesterday</span>
                  </div>
                  <p className="text-sm">Previous order had shipping delays. Customer was understanding but we should offer a discount on their next purchase.</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t">
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Tag className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Tag</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <User className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Profile</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <BarChart className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Activity</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
