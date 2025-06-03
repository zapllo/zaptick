"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Filter,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  FileText,
  ArrowLeft,
  Check,
  ChevronDown,
  Phone,
  Video,
  Info,
  Tag,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Plus,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Mic,
  ImageIcon
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsappOptIn: boolean;
  tags: string[];
  notes?: string;
}

interface Message {
  id: string;
  senderId: 'customer' | 'agent';
  content: string;
  messageType: 'text' | 'image' | 'video' | 'document' | 'audio' | 'template';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  whatsappMessageId?: string;
  templateName?: string;
}

interface Conversation {
  id: string;
  contact: Contact;
  lastMessage: string;
  lastMessageType: string;
  lastMessageAt: string;
  status: 'active' | 'closed' | 'resolved';
  assignedTo?: string;
  unreadCount: number;
  tags: string[];
  isWithin24Hours: boolean;
  messageCount: number;
}

interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  status: string;
  components: any[];
}

export default function ConversationsPage() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWabaId, setSelectedWabaId] = useState<string>("");
  const [wabaAccounts, setWabaAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Available tags for filtering
  const availableTags = [
    { name: "All", count: conversations.length, active: statusFilter === "all" },
    { name: "Close won", count: 25, active: false },
    { name: "Agreed to Buy", count: 48, active: false },
    { name: "Need Support", count: 39, active: false },
    { name: "Call Back", count: 83, active: false },
    { name: "Masterclass", count: 7, active: false },
    { name: "Junk", count: 14, active: false },
    { name: "International", count: 6, active: false },
    { name: "Qualified for Future", count: 5, active: false }
  ];

  useEffect(() => {
    fetchWabaAccounts();
  }, []);

  useEffect(() => {
    if (selectedWabaId) {
      fetchConversations();
      fetchContacts();
      fetchTemplates();
    }
  }, [selectedWabaId, statusFilter]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      setSelectedContact(null); // Clear selected contact when we have a conversation
    }
  }, [activeConversation]);

  useEffect(() => {
    // Check if we have a contactId in the URL params
    const contactId = searchParams.get('contactId');
    if (contactId && selectedWabaId) {
      handleContactFromUrl(contactId);
    }
  }, [searchParams, selectedWabaId, contacts]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContactFromUrl = async (contactId: string) => {
    // Find the contact
    const contact = contacts?.find(c => c.id === contactId);
    if (contact) {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => conv.contact.id === contactId);
      if (existingConversation) {
        setActiveConversation(existingConversation);
      } else {
        // Select the contact for new conversation
        setSelectedContact(contact);
        setActiveConversation(null);
        setMessages([]);
      }
    }
  };

  const fetchWabaAccounts = async () => {
    try {
      const response = await fetch('/api/waba-accounts');
      const data = await response.json();
      if (data.success && data.accounts) {
        setWabaAccounts(data.accounts);
        if (data.accounts.length > 0) {
          setSelectedWabaId(data.accounts[0].wabaId);
        } else {
          toast({
            title: "No WhatsApp Accounts",
            description: "Please connect a WhatsApp Business Account first",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching WABA accounts:', error);
    }
  };

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedWabaId) params.append('wabaId', selectedWabaId);
      if (statusFilter !== "all") params.append('status', statusFilter);

      const response = await fetch(`/api/conversations?${params}`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch conversations",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedWabaId) params.append('wabaId', selectedWabaId);

      const response = await fetch(`/api/contacts?${params}`);
      const data = await response.json();

      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.conversation.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedWabaId) params.append('wabaId', selectedWabaId);
      params.append('status', 'APPROVED');

      const response = await fetch(`/api/templates?${params}`);
      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || isSending) return;

    const targetContact = activeConversation?.contact || selectedContact;
    if (!targetContact) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: targetContact.id,
          message: messageInput.trim(),
          messageType: 'text'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add message to local state immediately
        const newMessage: Message = {
          id: data.message.id,
          senderId: 'agent',
          content: messageInput.trim(),
          messageType: 'text',
          timestamp: new Date().toISOString(),
          status: 'sent',
          whatsappMessageId: data.message.whatsappMessageId
        };

        setMessages(prev => [...prev, newMessage]);
        setMessageInput("");

        // If we were messaging a selected contact (new conversation), refresh conversations
        if (selectedContact && !activeConversation) {
          await fetchConversations();
          // Find and set the new conversation as active
          setTimeout(() => {
            const newConversation = conversations.find(conv => conv.contact.id === selectedContact.id);
            if (newConversation) {
              setActiveConversation(newConversation);
              setSelectedContact(null);
            }
          }, 500);
        } else {
          // Update existing conversation in list
          setConversations(prev =>
            prev.map(conv =>
              conv.id === activeConversation?.id
                ? {
                  ...conv,
                  lastMessage: messageInput.trim(),
                  lastMessageAt: new Date().toISOString(),
                  isWithin24Hours: true
                }
                : conv
            )
          );
        }

        toast({
          title: "Success",
          description: "Message sent successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send message",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendTemplate = async (template: Template) => {
    const targetContact = activeConversation?.contact || selectedContact;
    if (!targetContact || isSending) return;

    setIsSending(true);
    try {
      const bodyComponent = template.components.find(c => c.type === 'BODY');
      const templateText = bodyComponent?.text || template.name;

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: targetContact.id,
          message: templateText,
          messageType: 'template'
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newMessage: Message = {
          id: data.message.id,
          senderId: 'agent',
          content: templateText,
          messageType: 'template',
          timestamp: new Date().toISOString(),
          status: 'sent',
          templateName: template.name
        };

        setMessages(prev => [...prev, newMessage]);
        setShowTemplateDialog(false);

        toast({
          title: "Success",
          description: "Template sent successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send template",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending template:', error);
      toast({
        title: "Error",
        description: "Failed to send template",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const selectContactForChat = (contact: Contact) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(conv => conv.contact.id === contact.id);
    if (existingConversation) {
      setActiveConversation(existingConversation);
      setSelectedContact(null);
    } else {
      setSelectedContact(contact);
      setActiveConversation(null);
      setMessages([]);
    }
    setShowContactDialog(false);
  };

  const getCurrentContact = () => {
    return activeConversation?.contact || selectedContact;
  };

  const getCurrentChatTitle = () => {
    const contact = getCurrentContact();
    return contact ? contact.name : "Select a conversation";
  };

  const isWithin24Hours = () => {
    if (activeConversation) {
      return activeConversation.isWithin24Hours;
    }
    // For new conversations (selected contact), always allow messaging
    return selectedContact ? true : false;
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.contact.phone.includes(searchQuery) ||
    conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCircle className="h-3 w-3 text-blue-600" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const handleTagFilter = (tagName: string) => {
    if (tagName.toLowerCase() === "all") {
      setStatusFilter("all");
    } else {
      setStatusFilter(tagName.toLowerCase());
    }
  };

  if (wabaAccounts.length === 0) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No WhatsApp Business Account</h2>
            <p className="text-gray-600 mb-6">
              You need to connect a WhatsApp Business Account to start conversations.
            </p>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-green-600 hover:bg-green-700"
            >
              Connect WhatsApp Account
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-screen flex flex-col bg-[#f0f2f5]">
        {/* Tag filters at the top */}
        <div className="px-4 py-2 bg-white border-b flex items-center space-x-2 overflow-x-auto scrollbar-hide">
          <ChevronLeft className="h-5 w-5 text-[#54656f] flex-shrink-0" />

          {availableTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => handleTagFilter(tag.name)}
              className={`px-3 py-1.5 rounded-full text-sm flex items-center whitespace-nowrap ${tag.active
                ? "bg-[#25D366] text-white"
                : "bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef]"
                }`}
            >
              {tag.name}
              <span className={`ml-1 text-xs rounded-full px-1.5 ${tag.active ? "text-white" : "text-[#54656f]"}`}>
                {tag.count}
              </span>
            </button>
          ))}

          <ChevronRight className="h-5 w-5 text-[#54656f] flex-shrink-0" />
        </div>

        <div className="flex-1 flex">
          <div className="flex h-full w-full">
            <div className="w-[400px] flex flex-col border-r border-[#e9edef] bg-white">
              {/* Header */}
              <div className="px-4 py-3 h-[60px] flex items-center justify-between">
                <h2 className="text-[18px] font-semibold text-[#111b21]">All chats - All</h2>
                <div className="flex gap-4">
                  <Search className="h-[20px] w-[20px] text-[#54656f] cursor-pointer" />
                  <Check className="h-[20px] w-[20px] text-[#00a884] cursor-pointer" />
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto bg-white">

                {selectedContact && (
                  <div
                    className="border-b cursor-pointer hover:bg-[#f5f6f6] bg-white"
                    onClick={() => setActiveConversation({
                      id: "new", // Temp ID
                      contact: selectedContact,
                      lastMessage: "",
                      lastMessageAt: new Date().toISOString(),
                      unreadCount: 0,
                      senderId: "agent",
                      lastMessageType: "text"
                    })}
                  >
                    <div className="flex items-center py-3 px-4">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback className="bg-[#dfe5e7] text-[#54656f] font-semibold">
                          {selectedContact.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-[#111b21] text-[15px] truncate">
                            {selectedContact.name}
                          </span>
                          <span className="text-xs text-[#667781]">
                            {format(new Date(), "hh:mm a")}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-0.5">
                          <div className="flex flex-col">
                            <span className="text-xs text-[#54656f]">New conversation</span>
                            <span className="text-sm text-[#111b21] truncate max-w-[240px]">{selectedContact.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* List of existing conversations */}
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`border-b cursor-pointer hover:bg-[#f5f6f6] ${activeConversation?.id === conversation.id ? "bg-[#f0f2f5]" : "bg-white"}`}
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <div className="flex items-center py-3 px-4">
                      {/* Avatar or Image */}
                      <Avatar className="h-10 w-10 mr-3">
                        {conversation.contact.imageUrl ? (
                          <AvatarImage src={conversation.contact.imageUrl} alt={conversation.contact.name} />
                        ) : (
                          <AvatarFallback className="bg-[#e6e6e6] text-[#54656f] font-semibold">
                            {conversation.contact.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-[#111b21] text-[15px] truncate">
                            {conversation.contact.name}
                          </span>
                          <span className="text-xs text-[#667781]">
                            {format(new Date(conversation.lastMessageAt), "hh:mm a")}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-0.5">
                          <div className="flex flex-col">
                            <span className="text-xs text-[#54656f] flex items-center gap-1">
                              🗸🗸 <span>DoubleTick</span>
                            </span>

                            <span className="text-sm text-[#111b21] truncate max-w-[240px]">
                              {conversation.lastMessageType === "image" ? (
                                <>
                                  <ImageIcon className="inline-block h-4 w-4 mr-1" />
                                  Image
                                </>
                              ) : (
                                conversation.lastMessage
                              )}
                            </span>
                          </div>

                          {conversation.unreadCount > 0 && (
                            <div className="ml-2 bg-[#25d366] text-white text-[12px] font-semibold rounded-full h-[20px] w-[20px] flex items-center justify-center">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat window */}
            {(activeConversation || selectedContact) ? (
              <div className="flex-1 flex flex-col">
                {/* Chat header */}
                <div className="px-4 py-2.5 h-[60px] border-b border-[#e9edef] flex justify-between items-center bg-[#ffffff]">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 cursor-pointer">
                      <AvatarFallback className="bg-[#dfe5e7] text-[#54656f]">
                        {getCurrentChatTitle().charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-medium text-[16px] text-[#111b21]">{getCurrentChatTitle()}</h2>
                      <div className="text-xs text-[#667781] flex items-center gap-1">
                        <span>last seen today at {format(new Date(), "HH:mm")}</span>
                        {getCurrentContact()?.whatsappOptIn && (
                          <Badge variant="outline" className="bg-[#e7f7ef] text-[#027252] border-0 text-[11px] h-4 font-normal px-1">
                            Subscribed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-[#54656f] hover:bg-[#e9edef] rounded-full h-10 w-10">
                      <Search className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-[#54656f] hover:bg-[#e9edef] rounded-full h-10 w-10">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-[#54656f] hover:bg-[#e9edef] rounded-full h-10 w-10">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#54656f] hover:bg-[#e9edef] rounded-full h-10 w-10"
                      onClick={() => setShowInfoPanel(!showInfoPanel)}
                    >
                      <Info className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Chat messages */}
                <div
                  className="flex-1 p-4 overflow-y-auto bg-[#efeae2]"
                  style={{
                    backgroundImage: "url('/bg.png')",
                    backgroundRepeat: "repeat"
                  }}
                >
                  <div className="space-y-1.5 max-w-[85%] mx-auto">
                    {selectedContact && messages.length === 0 && (
                      <div className="text-center py-8 bg-white/80 rounded-lg shadow-sm mx-auto max-w-md mt-8">
                        <MessageSquare className="h-12 w-12 text-[#8696a0] mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-[#111b21] mb-2">Start a conversation</h3>
                        <p className="text-[#667781]">
                          Send a message to {selectedContact.name} to begin your conversation.
                        </p>
                      </div>
                    )}

                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === "agent" ? "justify-end" : "justify-start"}`}
                      >
                        {message.senderId === "customer" && (
                          <div className="flex flex-col max-w-[65%]">
                            <div className="bg-white rounded-lg px-2 py-[6px] shadow-sm relative">
                              {/* Chat bubble tail */}
                              <div className="absolute top-0 left-[-8px] w-[8px] h-[13px] overflow-hidden">
                                <div className="absolute transform rotate-45 bg-white w-3 h-3 top-[6px] left-[3px]"></div>
                              </div>
                              <div className="px-1 py-0.5">
                                <div className="whitespace-pre-line text-[#111b21] text-[14.2px] leading-[19px]">{message.content}</div>
                              </div>
                            </div>
                            <div className="text-xs text-[#667781] mt-0.5 ml-2">
                              {format(new Date(message.timestamp), "HH:mm")}
                            </div>
                          </div>
                        )}

                        {message.senderId === "agent" && (
                          <div className="flex flex-col max-w-[65%] items-end">
                            <div className="bg-[#d9fdd3] rounded-lg px-2 py-[6px] shadow-sm relative">
                              {/* Chat bubble tail */}
                              <div className="absolute top-0 right-[-8px] w-[8px] h-[13px] overflow-hidden">
                                <div className="absolute transform rotate-45 bg-[#d9fdd3] w-3 h-3 top-[6px] right-[3px]"></div>
                              </div>
                              <div className="px-1 py-0.5">
                                <div className="whitespace-pre-line text-[#111b21] text-[14.2px] leading-[19px]">{message.content}</div>
                                {message.templateName && (
                                  <div className="text-xs text-[#54656f] mt-1 flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    Template: {message.templateName}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-[#667781] mt-0.5 mr-2 flex items-center gap-1">
                              {format(new Date(message.timestamp), "HH:mm")}
                              {getStatusIcon(message.status)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message input */}
                <div className="py-2 px-4 bg-[#f0f2f5]">
                  {isWithin24Hours() ? (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-[#54656f] hover:bg-[#e9edef] rounded-full h-10 w-10">
                        <Smile className="h-[24px] w-[24px]" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-[#54656f] hover:bg-[#e9edef] rounded-full h-10 w-10">
                        <Paperclip className="h-[24px] w-[24px]" />
                      </Button>

                      <div className="flex-1 bg-white rounded-lg flex items-center">
                        <Input
                          placeholder="Type a message"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] py-[9px] h-[42px] placeholder-[#8696a0]"
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full h-10 w-10 ${messageInput.trim() ? 'text-[#54656f] hover:bg-[#e9edef]' : 'text-[#54656f] hover:bg-[#e9edef]'}`}
                      >
                        <Mic className="h-[24px] w-[24px]" />
                      </Button>

                      {messageInput.trim() && (
                        <Button
                          onClick={sendMessage}
                          disabled={!messageInput.trim() || isSending}
                          size="icon"
                          className="bg-[#00a884] hover:bg-[#017561] text-white rounded-full h-10 w-10"
                        >
                          {isSending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Send className="h-[18px] w-[18px]" />
                          )}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-[#fff8e1] border border-[#ffe0b2] rounded-lg p-3 text-center">
                        <AlertCircle className="h-5 w-5 text-[#f57c00] mx-auto mb-2" />
                        <div className="text-[#e65100] font-medium mb-1">
                          24-hour messaging window has expired
                        </div>
                        <div className="text-[#f57c00] text-sm">
                          You can only send pre-approved message templates to this contact.
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowTemplateDialog(true)}
                        className="w-full bg-[#00a884] hover:bg-[#017561] text-white"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Choose Template
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
                <div className="text-center">
                  <Image
                    src="/whatsapp-logo-large.png"
                    alt="WhatsApp"
                    width={200}
                    height={200}
                    className="mx-auto mb-4 opacity-10"
                  />
                  <h3 className="text-xl font-medium text-[#41525d] mb-2">WhatsApp Business Platform</h3>
                  <p className="text-[#667781] mb-4 max-w-md">
                    Send and receive messages with your customers using the WhatsApp Business API
                  </p>
                  <Button
                    onClick={() => setShowContactDialog(true)}
                    className="bg-[#00a884] hover:bg-[#017561] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Conversation
                  </Button>
                </div>
              </div>
            )}

            {/* Contact info panel */}
            {showInfoPanel && (activeConversation || selectedContact) && (
              <div className="w-[400px] border-l border-[#e9edef] flex flex-col bg-white">
                <div className="p-4 h-[60px] border-b border-[#e9edef] bg-[#f0f2f5] flex items-center justify-between">
                  <h3 className="font-medium text-[16px] text-[#111b21]">Contact Info</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#54656f] hover:bg-[#e9edef] rounded-full h-8 w-8"
                    onClick={() => setShowInfoPanel(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="p-6 flex flex-col space-y-6 overflow-y-auto">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Avatar className="h-[200px] w-[200px]">
                      <AvatarFallback className="bg-[#dfe5e7] text-[#54656f] text-7xl">
                        {getCurrentChatTitle().charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-xl text-[#111b21]">{getCurrentChatTitle()}</h4>
                      <p className="text-[#667781]">{getCurrentContact()?.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-white">
                    <div className="border-t border-b border-[#e9edef] py-4">
                      <h4 className="text-sm text-[#54656f] px-4 mb-3">About</h4>
                      <p className="text-[#111b21] px-4">Available</p>
                    </div>

                    {getCurrentContact()?.email && (
                      <div className="border-b border-[#e9edef] py-4">
                        <h4 className="text-sm text-[#54656f] px-4 mb-3">Email</h4>
                        <p className="text-[#111b21] px-4">{getCurrentContact()?.email}</p>
                      </div>
                    )}

                    <div className="border-b border-[#e9edef] py-4">
                      <h4 className="text-sm text-[#54656f] px-4 mb-3">WhatsApp Status</h4>
                      <div className="px-4">
                        <Badge
                          variant="outline"
                          className={
                            getCurrentContact()?.whatsappOptIn
                              ? "bg-[#e7f7ef] text-[#027252] border-0"
                              : "bg-[#fee2e2] text-[#b91c1c] border-0"
                          }
                        >
                          {getCurrentContact()?.whatsappOptIn ? "Subscribed" : "Unsubscribed"}
                        </Badge>
                      </div>
                    </div>

                    <div className="border-b border-[#e9edef] py-4">
                      <div className="flex justify-between items-center px-4 mb-3">
                        <h4 className="text-sm text-[#54656f]">Tags</h4>
                        <Button variant="ghost" size="sm" className="h-6 text-xs text-[#00a884]">
                          Edit
                        </Button>
                      </div>
                      <div className="px-4">
                        {getCurrentContact()?.tags && getCurrentContact()?.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {getCurrentContact()?.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-[#8696a0]">No tags assigned</p>
                        )}
                      </div>
                    </div>

                    <div className="border-b border-[#e9edef] py-4">
                      <h4 className="text-sm text-[#54656f] px-4 mb-3">Notes</h4>
                      <div className="px-4">
                        {getCurrentContact()?.notes ? (
                          <p className="text-[#111b21]">{getCurrentContact()?.notes}</p>
                        ) : (
                          <p className="text-sm text-[#8696a0]">No notes available</p>
                        )}
                      </div>
                    </div>

                    <div className="py-4 px-4">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-[#ea0038] hover:text-[#ea0038] hover:bg-[#f8e1e5]"
                      >
                        <AlertCircle className="h-5 w-5 mr-3" />
                        Block contact
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Selection Dialog */}
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
            <DialogHeader className="p-4 bg-[#008069] text-white">
              <DialogTitle className="text-white font-normal text-lg">Start New Conversation</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto p-2">
              {contacts.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-8 w-8 text-[#8696a0] mx-auto mb-2" />
                  <p className="text-[#667781] mb-4">No contacts available</p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/contacts'}
                    className="border-[#00a884] text-[#00a884] hover:bg-[#e7f7ef]"
                  >
                    Add Contacts
                  </Button>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {contacts
                    .filter(contact => !conversations?.find(conv => conv.contact.id === contact.id))
                    .map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#f5f6f6] rounded-lg cursor-pointer"
                        onClick={() => selectContactForChat(contact)}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-[#dfe5e7] text-[#54656f]">
                            {contact.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 border-b border-[#e9edef] py-2">
                          <div className="font-medium text-[#111b21]">{contact.name}</div>
                          <div className="text-sm text-[#667781]">{contact.phone}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1 py-2">
                          <Badge
                            variant="outline"
                            className={
                              contact.whatsappOptIn
                                ? "bg-[#e7f7ef] text-[#027252] border-0"
                                : "bg-[#fee2e2] text-[#b91c1c] border-0"
                            }
                          >
                            {contact.whatsappOptIn ? "Subscribed" : "Unsubscribed"}
                          </Badge>
                        </div>
                      </div>
                    ))}

                  {contacts.filter(contact => !conversations.find(conv => conv.contact.id === contact.id)).length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 text-[#8696a0] mx-auto mb-2" />
                      <p className="text-[#667781]">All contacts already have conversations</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter className="p-4 bg-white border-t border-[#e9edef]">
              <Button variant="outline" onClick={() => setShowContactDialog(false)}
                className="border-[#e9edef] text-[#54656f] hover:bg-[#f5f6f6]">
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/contacts'}
                className="border-[#00a884] text-[#00a884] hover:bg-[#e7f7ef]"
              >
                Manage Contacts
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Template Selection Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
            <DialogHeader className="p-4 bg-[#008069] text-white">
              <DialogTitle className="text-white font-normal text-lg">Choose Message Template</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto p-4">
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-[#8696a0] mx-auto mb-2" />
                  <p className="text-[#667781] mb-2">No approved templates available</p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/templates'}
                    className="border-[#00a884] text-[#00a884] hover:bg-[#e7f7ef]"
                  >
                    Create Templates
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedTemplate?.id === template.id
                        ? "border-[#00a884] bg-[#f0f7f4]"
                        : "border-[#e9edef] hover:bg-[#f5f6f6]"
                        }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-[#111b21]">{template.name}</h4>
                        <Badge variant="outline" className="bg-[#e7f7ef] text-[#027252] border-0">
                          {template.category}
                        </Badge>
                      </div>
                      <div className="text-sm text-[#54656f]">
                        {template?.components?.find(c => c.type === 'BODY')?.text || 'Template content'}
                      </div>
                      <div className="mt-2 text-xs text-[#8696a0]">
                        Language: {template.language}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter className="p-4 bg-white border-t border-[#e9edef]">
              <Button
                variant="outline"
                onClick={() => setShowTemplateDialog(false)}
                className="border-[#e9edef] text-[#54656f] hover:bg-[#f5f6f6]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedTemplate && sendTemplate(selectedTemplate)}
                disabled={!selectedTemplate || isSending}
                className="bg-[#00a884] hover:bg-[#017561] text-white"
              >
                {isSending ? "Sending..." : "Send Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
