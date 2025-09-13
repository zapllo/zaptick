'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Calendar,
  MessageSquare,
  FileText,
  Send,
  Loader2,
  Settings,
  Zap,
  HelpCircle,
  Paperclip,
  Download,
  Eye,
  X
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

interface TicketMessage {
  id: string;
  sender: {
    name: string;
    email: string;
  };
  senderType: 'user' | 'agent';
  message: string;
  timestamp: string;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
}

interface SupportTicket {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  user: {
    name: string;
    email: string;
  };
  assignedTo?: {
    name: string;
    email: string;
  };
  attachments: Array<{
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  messages: TicketMessage[];
  resolution?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [attachments, setAttachments] = useState<Array<{
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>>([]);
  const [uploading, setUploading] = useState(false);


  useEffect(() => {
    if (params.id) {
      fetchTicket();
    }
  }, [params.id]);

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/support/tickets/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/support');
          return;
        }
        throw new Error('Failed to fetch ticket');
      }

      const data = await response.json();
      setTicket(data.ticket);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast({
        title: "Error",
        description: "Failed to fetch ticket details",
        variant: "destructive"
      });
      router.push('/support');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);
    const newAttachments: Array<{
      filename: string;
      url: string;
      size: number;
      mimeType: string;
    }> = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'DOCUMENT'); // You can determine type based on file.type

        const response = await fetch('/api/upload-media', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();

        newAttachments.push({
          filename: file.name,
          url: data.url,
          size: file.size,
          mimeType: file.type
        });
      }

      setAttachments(prev => [...prev, ...newAttachments]);
      toast({
        title: "Success",
        description: `${newAttachments.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSendingReply(true);
    try {
      const response = await fetch(`/api/support/tickets/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: replyMessage.trim(),
          attachments: attachments
        }),
      });

      if (!response.ok) throw new Error('Failed to send reply');

      const data = await response.json();

      // Update the ticket with new messages
      setTicket(prev => prev ? {
        ...prev,
        messages: data.ticket.messages,
        status: prev.status === 'resolved' || prev.status === 'closed' ? 'in_progress' : prev.status
      } : null);

      setReplyMessage('');
      setAttachments([]); // Clear attachments after successful reply
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive"
      });
    } finally {
      setSendingReply(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 text-white w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-white " />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-white " />;
      case 'closed': return <XCircle className="h-4 w-4 text-white " />;
      default: return <AlertCircle className="h-4 w-4 text-white " />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Settings className="h-4 w-4 text-white" />;
      case 'billing': return <FileText className="h-4 w-4 text-white" />;
      case 'feature_request': return <Zap className="h-4 w-4 text-white" />;
      case 'bug_report': return <AlertCircle className="h-4 w-4 text-white" />;
      case 'general': return <HelpCircle className="h-4 w-4 text-white" />;
      default: return <HelpCircle className="h-4 w-4 text-white" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading ticket details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Ticket not found</h2>
            <p className="text-muted-foreground mb-4">The ticket you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/support">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />

              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  const getStatusBg = (status: string) => {
    switch (status) {
      case 'open': return 'from-white to-blue-50/30 warK:from-muted/40 warK:to-blue-900/10';
      case 'in_progress': return 'from-white to-amber-50/30 warK:from-muted/40 warK:to-amber-900/10';
      case 'resolved': return 'from-white to-green-50/30 warK:from-muted/40 warK:to-green-900/10';
      case 'closed': return 'from-white to-gray-50/30 warK:from-muted/40 warK:to-gray-900/10';
      default: return 'from-white to-gray-50/30 warK:from-muted/40 warK:to-gray-900/10';
    }
  };
  const getStatusAccent = (status: string) => {
    switch (status) {
      case 'open': return 'blue';
      case 'in_progress': return 'amber';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'open': return 'from-blue-500 to-blue-600';
      case 'in_progress': return 'from-amber-500 to-amber-600';
      case 'resolved': return 'from-green-500 to-green-600';
      case 'closed': return 'from-gray-500 to-gray-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'low': return 'from-green-500 to-green-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'urgent': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Modern Header Card */}
        <div className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br ${getStatusBg(ticket.status)} p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-${getStatusAccent(ticket.status)}-200`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start  gap-4">
              <Link href="/support">
                <Button variant="ghost" size="sm" className="mt-3">
                  <ArrowLeft className="h-4 w-4 " />
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                <div className={`flex h-12  w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getStatusGradient(ticket.status)} shadow-lg`}>
                  {getStatusIcon(ticket.status)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 warK:text-white mb-1">
                    {ticket.title}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-gray-600 warK:text-gray-300">
                    <span className="font-mono">#{ticket.ticketId}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 rounded-full bg-${getStatusAccent(ticket.status)}-100 px-3 py-1 text-xs font-medium text-${getStatusAccent(ticket.status)}-700 warK:bg-${getStatusAccent(ticket.status)}-900/30 warK:text-${getStatusAccent(ticket.status)}-400`}>
                <div className={`h-1.5 w-1.5 rounded-full bg-${getStatusAccent(ticket.status)}-500`} />
                {ticket.status.replace('_', ' ').toUpperCase()}
              </span>
              <Badge className={`border ${getPriorityColor(ticket.priority)} font-medium`}>
                {ticket.priority.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 warK:text-gray-300">
              {getCategoryIcon(ticket.category)}
              <span className="font-medium">{ticket.category.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 warK:text-gray-300">
              <User className="h-4 w-4" />
              <span>Created by {ticket.user.name}</span>
            </div>
            {ticket.assignedTo && (
              <div className="flex items-center gap-2 text-sm text-gray-600 warK:text-gray-300">
                <User className={`h-4 w-4 text-${getStatusAccent(ticket.status)}-500`} />
                <span>Assigned to {ticket.assignedTo.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600 warK:text-gray-300">
              <MessageSquare className="h-4 w-4" />
              <span>{ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Decorative element */}
          <div className={`absolute -right-8 -top-8 h-16 w-16 rounded-full bg-${getStatusAccent(ticket.status)}-500/10 transition-all duration-300 group-hover:scale-110`} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 warK::from-muted/40 warK::to-blue-900/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getPriorityGradient(ticket.priority)} shadow-lg`}>
                    {getCategoryIcon(ticket.category)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 warK::text-white">{ticket.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600 warK::text-gray-300 mt-1">
                      <span className="font-medium capitalize">{ticket.category.replace('_', ' ')}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 warK::bg-orange-900/30 warK::text-orange-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-gray-700 warK::text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 warK::border-gray-700">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Attachments ({ticket.attachments.length})
                  </h4>
                  <div className="grid gap-2">
                    {ticket.attachments.map((attachment, index) => (
                      <div key={index} className="group/attachment flex items-center gap-3 p-3 bg-gray-50 warK::bg-gray-800/50 rounded-lg hover:bg-gray-100 warK::hover:bg-gray-800 transition-colors">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 warK::bg-blue-900/30">
                          <FileText className="h-5 w-5 text-blue-600 warK::text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 warK::text-white">{attachment.filename}</span>
                          <p className="text-xs text-gray-500 warK::text-gray-400">
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover/attachment:opacity-100 transition-opacity">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decorative element */}
              <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
            </div>

            {/* Messages */}
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 warK::from-muted/40 warK::to-green-900/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 warK::text-white">Conversation</h2>
                    <p className="text-sm text-gray-600 warK::text-gray-300">
                      {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 warK::bg-green-900/30 warK::text-green-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  ACTIVE
                </span>
              </div>

              <div className="space-y-6">
                {ticket.messages.map((message, index) => (
                  <div key={message.id} className="flex gap-4">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarFallback className={message.senderType === 'agent' ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-semibold'}>
                        {message.sender.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 warK::text-white">{message.sender.name}</span>
                        {message.senderType === 'agent' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Support Agent
                          </span>
                        )}
                        <span className="text-xs text-gray-500 warK::text-gray-400">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-gray-50 warK::bg-gray-800/50 rounded-lg p-4 border border-gray-200 warK::border-gray-700">
                        <p className="text-sm text-gray-800 warK::text-gray-200 leading-relaxed whitespace-pre-wrap">
                          {message.message}
                        </p>
                      </div>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3">
                          <div className="grid gap-2">
                            {message.attachments.map((attachment, attachIndex) => (
                              <div key={attachIndex} className="flex items-center gap-2 p-2 bg-gray-100 warK::bg-gray-800 rounded-lg text-xs">
                                <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 warK::bg-blue-900/30">
                                  <FileText className="h-3 w-3 text-blue-600 warK::text-blue-400" />
                                </div>
                                <span className="flex-1 font-medium text-gray-900 warK::text-white">{attachment.filename}</span>
                                <span className="text-gray-500 warK::text-gray-400">
                                  {formatFileSize(attachment.size)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative element */}
              <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
            </div>

            {/* Reply Form */}
            {ticket.status !== 'closed' && (
              <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-purple-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-purple-200 wark:from-muted/40 wark:to-purple-900/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                    <Send className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 wark:text-white">Add Reply</h2>
                    <p className="text-sm text-gray-600 wark:text-gray-300">
                      Send a message to our support team
                    </p>
                  </div>
                </div>

                <form onSubmit={handleReply} className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 wark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white wark:bg-gray-800 text-gray-900 wark:text-white placeholder-gray-500 wark:placeholder-gray-400 transition-colors"
                      required
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {replyMessage.length}/1000
                    </div>
                  </div>

                  {/* Attachments Preview */}
                  {attachments.length > 0 && (
                    <div className="bg-gray-50 wark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 wark:border-gray-700">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-purple-500" />
                        Attachments ({attachments.length})
                      </h4>
                      <div className="grid gap-2">
                        {attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-white wark:bg-gray-800 rounded-lg border border-gray-200 wark:border-gray-700">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 wark:bg-purple-900/30">
                              <FileText className="h-4 w-4 text-purple-600 wark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 wark:text-white">{attachment.filename}</span>
                              <p className="text-xs text-gray-500 wark:text-gray-400">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 wark:hover:bg-red-900/20"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="attachment-upload"
                        className="hidden"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
                        onChange={(e) => {
                          if (e.target.files) {
                            handleFileUpload(e.target.files);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-white wark:bg-gray-800 hover:bg-gray-50 wark:hover:bg-gray-700"
                        onClick={() => document.getElementById('attachment-upload')?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Paperclip className="h-4 w-4 mr-2" />
                            Attach Files
                          </>
                        )}
                      </Button>
                      {attachments.length > 0 && (
                        <span className="text-xs text-gray-500 wark:text-gray-400">
                          {attachments.length} file(s) attached
                        </span>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={sendingReply || !replyMessage.trim()}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingReply ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Decorative element */}
                <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-purple-500/10 transition-all duration-300 group-hover:scale-110" />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-indigo-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200 warK::from-muted/40 warK::to-indigo-900/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 warK::text-white">Ticket Information</h3>
                  <p className="text-sm text-gray-600 warK::text-gray-300">Details & timeline</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 warK::bg-indigo-900/30">
                    <User className="h-4 w-4 text-indigo-600 warK::text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 warK::text-white">Created by</p>
                    <p className="text-sm text-gray-600 warK::text-gray-300 mt-1">{ticket.user.name}</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent warK::via-gray-600" />

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 warK::bg-blue-900/30">
                    <Calendar className="h-4 w-4 text-blue-600 warK::text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 warK::text-white">Created</p>
                    <p className="text-sm text-gray-600 warK::text-gray-300 mt-1">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent warK::via-gray-600" />

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 warK::bg-amber-900/30">
                    <MessageSquare className="h-4 w-4 text-amber-600 warK::text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 warK::text-white">Last updated</p>
                    <p className="text-sm text-gray-600 warK::text-gray-300 mt-1">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {ticket.assignedTo && (
                  <>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent warK::via-gray-600" />
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 warK::bg-purple-900/30">
                        <User className="h-4 w-4 text-purple-600 warK::text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 warK::text-white">Assigned to</p>
                        <p className="text-sm text-gray-600 warK::text-gray-300 mt-1">{ticket.assignedTo.name}</p>
                      </div>
                    </div>
                  </>
                )}

                {ticket.resolvedAt && (
                  <>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent warK::via-gray-600" />
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 warK::bg-green-900/30">
                        <CheckCircle className="h-4 w-4 text-green-600 warK::text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 warK::text-white">Resolved</p>
                        <p className="text-sm text-gray-600 warK::text-gray-300 mt-1">
                          {new Date(ticket.resolvedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Decorative element */}
              <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-indigo-500/10 transition-all duration-300 group-hover:scale-110" />
            </div>

            {/* Resolution */}
            {ticket.resolution && (
              <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 warK::from-muted/40 warK::to-green-900/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 warK::text-white">Resolution</h3>
                    <p className="text-sm text-gray-600 warK::text-gray-300">Issue resolved</p>
                  </div>
                </div>
                <div className="bg-green-50 warK::bg-green-900/20 rounded-lg p-4 border border-green-200 warK::border-green-800">
                  <p className="text-sm text-gray-800 warK::text-gray-200 leading-relaxed">
                    {ticket.resolution}
                  </p>
                </div>

                {/* Decorative element */}
                <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
              </div>
            )}

            {/* Quick Actions */}
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-orange-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-orange-200 warK::from-muted/40 warK::to-orange-900/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 warK::text-white">Quick Actions</h3>
                  <p className="text-sm text-gray-600 warK::text-gray-300">Helpful shortcuts</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/support">
                  <Button variant="outline" className="w-full justify-start h-12 bg-white warK::bg-gray-800 hover:bg-orange-50 warK::hover:bg-orange-900/20 border-orange-200 warK::border-orange-800 transition-all duration-200 group/btn">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 warK::bg-orange-900/30 mr-3 group-hover/btn:bg-orange-200 warK::group-hover/btn:bg-orange-900/50 transition-colors">
                      <Eye className="h-4 w-4 text-orange-600 warK::text-orange-400" />
                    </div>
                    <span className="font-medium">View All Tickets</span>
                  </Button>
                </Link>
                <Link href="/support">
                  <Button variant="outline" className="w-full  mt-2 justify-start h-12 bg-white warK::bg-gray-800 hover:bg-orange-50 warK::hover:bg-orange-900/20 border-orange-200 warK::border-orange-800 transition-all duration-200 group/btn">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 warK::bg-orange-900/30 mr-3 group-hover/btn:bg-orange-200 warK::group-hover/btn:bg-orange-900/50 transition-colors">
                      <MessageSquare className="h-4 w-4 text-orange-600 warK::text-orange-400" />
                    </div>
                    <span className="font-medium">Create New Ticket</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start mt-2 h-12 bg-white warK::bg-gray-800 hover:bg-orange-50 warK::hover:bg-orange-900/20 border-orange-200 warK::border-orange-800 transition-all duration-200 group/btn"
                  onClick={() => window.print()}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 warK::bg-orange-900/30 mr-3 group-hover/btn:bg-orange-200 warK::group-hover/btn:bg-orange-900/50 transition-colors">
                    <FileText className="h-4 w-4 text-orange-600 warK::text-orange-400" />
                  </div>
                  <span className="font-medium">Print Ticket</span>
                </Button>
              </div>

              {/* Decorative element */}
              <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-orange-500/10 transition-all duration-300 group-hover:scale-110" />
            </div>

            {/* Help Resources */}
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-teal-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-teal-200 warK::from-muted/40 warK::to-teal-900/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg">
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 warK::text-white">Need More Help?</h3>
                  <p className="text-sm text-gray-600 warK::text-gray-300">Additional resources</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-teal-50 warK::bg-teal-900/20 rounded-lg p-4 border border-teal-200 warK::border-teal-800">
                  <p className="text-sm font-semibold text-gray-900 warK::text-white mb-2">Contact Support</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 warK::text-gray-300">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-teal-100 warK::bg-teal-900/40">
                      <span className="text-xs">📧</span>
                    </div>
                    <span>support@zapllo.com</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-white warK::bg-gray-800 hover:bg-teal-50 warK::hover:bg-teal-900/20 border-teal-200 warK::border-teal-800 transition-all duration-200 group/btn"
                  onClick={() => window.open('https://zapllo.com/tutorials-zapllo', '_blank')}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 warK::bg-teal-900/30 mr-3 group-hover/btn:bg-teal-200 warK::group-hover/btn:bg-teal-900/50 transition-colors">
                    <HelpCircle className="h-4 w-4 text-teal-600 warK::text-teal-400" />
                  </div>
                  <span className="font-medium">Browse Tutorials</span>
                </Button>
              </div>

              {/* Decorative element */}
              <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-teal-500/10 transition-all duration-300 group-hover:scale-110" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}