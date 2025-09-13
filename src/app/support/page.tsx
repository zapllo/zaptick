'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  FileText,
  User,
  Calendar,
  Tag,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  Loader2,
  ArrowRight,
  Zap,
  Shield,
  Users,
  Settings,
  X,
  Paperclip,
  Upload
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

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
  messageCount: number;
  resolution?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);

      const response = await fetch(`/api/support/tickets?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tickets');

      const data = await response.json();
      setTickets(data.tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch support tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Settings className="h-4 w-4" />;
      case 'billing': return <FileText className="h-4 w-4" />;
      case 'feature_request': return <Zap className="h-4 w-4" />;
      case 'bug_report': return <AlertCircle className="h-4 w-4" />;
      case 'general': return <HelpCircle className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTicketStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    const closed = tickets.filter(t => t.status === 'closed').length;

    return { total, open, inProgress, resolved, closed };
  };

  const stats = getTicketStats();

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading support tickets...</p>
          </div>
        </div>
      </Layout>
    );
  }
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
      <div className="space-y-8 p-6">
        {/* Modern Header */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 wark:from-muted/40 wark:to-blue-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 wark:text-white">Help & Support</h1>
                <p className="text-gray-600 wark:text-gray-300">
                  Get help with your account and submit support requests
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateTicket(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </div>
          {/* Decorative element */}
          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Quick Help Resources */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-indigo-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200 wark:from-muted/40 wark:to-indigo-900/10 cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 wark:text-white">Tutorials & FAQs</h3>
                  <p className="text-sm text-indigo-600 wark:text-indigo-400 font-medium">Find answers quickly</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 wark:bg-indigo-900/30 wark:text-indigo-400">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Available
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 wark:text-gray-300">
                <BookOpen className="h-4 w-4" />
                <span>Comprehensive guides and tutorials</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 wark:text-gray-300">
                <ExternalLink className="h-4 w-4 text-indigo-500" />
                <span>Browse our knowledge base</span>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-indigo-500/10 transition-all duration-300 group-hover:scale-110" />
          </div>

          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-orange-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-orange-200 wark:from-muted/40 wark:to-orange-900/10 cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 wark:text-white">Email Support</h3>
                  <p className="text-sm text-orange-600 wark:text-orange-400 font-medium">Direct contact</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 wark:bg-orange-900/30 wark:text-orange-400">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                Active
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 wark:text-gray-300">
                <Mail className="h-4 w-4" />
                <span className="font-mono">support@zapllo.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 wark:text-gray-300">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>24-48 hour response time</span>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-orange-500/10 transition-all duration-300 group-hover:scale-110" />
          </div>
        </div>

        {/* Tickets Overview Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 wark:from-blue-900/20 wark:to-muted/40">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 wark:bg-blue-900/30">
                <MessageSquare className="h-4 w-4 text-blue-600 wark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-blue-900 wark:text-blue-100">Total Tickets</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 wark:text-blue-400">{stats.total}</div>
            <p className="text-xs text-blue-600 wark:text-blue-400 mt-1">All time</p>
          </div>

          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-orange-50 to-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-orange-200 wark:from-orange-900/20 wark:to-muted/40">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 wark:bg-orange-900/30">
                <AlertCircle className="h-4 w-4 text-orange-600 wark:text-orange-400" />
              </div>
              <span className="text-sm font-medium text-orange-900 wark:text-orange-100">Open</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 wark:text-orange-400">{stats.open}</div>
            <p className="text-xs text-orange-600 wark:text-orange-400 mt-1">Awaiting response</p>
          </div>

          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-200 wark:from-amber-900/20 wark:to-muted/40">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 wark:bg-amber-900/30">
                <Clock className="h-4 w-4 text-amber-600 wark:text-amber-400" />
              </div>
              <span className="text-sm font-medium text-amber-900 wark:text-amber-100">In Progress</span>
            </div>
            <div className="text-2xl font-bold text-amber-600 wark:text-amber-400">{stats.inProgress}</div>
            <p className="text-xs text-amber-600 wark:text-amber-400 mt-1">Being worked on</p>
          </div>

          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-green-50 to-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:from-green-900/20 wark:to-muted/40">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 wark:bg-green-900/30">
                <CheckCircle className="h-4 w-4 text-green-600 wark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-green-900 wark:text-green-100">Resolved</span>
            </div>
            <div className="text-2xl font-bold text-green-600 wark:text-green-400">{stats.resolved}</div>
            <p className="text-xs text-green-600 wark:text-green-400 mt-1">Ready to close</p>
          </div>

          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-200 wark:from-gray-900/20 wark:to-muted/40">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 wark:bg-gray-900/30">
                <XCircle className="h-4 w-4 text-gray-600 wark:text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 wark:text-gray-100">Closed</span>
            </div>
            <div className="text-2xl font-bold text-gray-600 wark:text-gray-400">{stats.closed}</div>
            <p className="text-xs text-gray-600 wark:text-gray-400 mt-1">Completed</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-purple-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-purple-200 wark:from-muted/40 wark:to-purple-900/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 wark:text-white">Search & Filter</h3>
              <p className="text-sm text-gray-600 wark:text-gray-300">Find your tickets quickly</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white wark:bg-gray-800 border-gray-300 wark:border-gray-600"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 wark:border-gray-600 bg-white wark:bg-gray-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 wark:border-gray-600 bg-white wark:bg-gray-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="feature_request">Feature Request</option>
                <option value="bug_report">Bug Report</option>
                <option value="general">General</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 wark:border-gray-600 bg-white wark:bg-gray-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Decorative element */}
          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-purple-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-gray-50/30 p-12 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-200 wark:from-muted/40 wark:to-gray-900/10">
              <div className="flex flex-col items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 wark:from-gray-800 wark:to-gray-700">
                  <MessageSquare className="h-8 w-8 text-gray-400 wark:text-gray-500" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 wark:text-white">No tickets found</h3>
                  <p className="text-gray-600 wark:text-gray-300">
                    {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all'
                      ? 'Try adjusting your filters or search term'
                      : 'Create your first support ticket to get started'}
                  </p>
                </div>
                {(!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && priorityFilter === 'all') && (
                  <Button
                    onClick={() => setShowCreateTicket(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                )}
              </div>
              {/* Decorative element */}
              <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-gray-500/10 transition-all duration-300 group-hover:scale-110" />
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <Link href={`/support/tickets/${ticket.id}`} key={ticket.id} className="cursor-pointer block">
                <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-gray-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 wark:from-muted/40 wark:to-gray-900/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white ${getPriorityGradient(ticket.priority)} shadow-lg`}>
                        {getCategoryIcon(ticket.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 wark:text-white truncate">{ticket.title}</h3>
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            #{ticket.ticketId}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 wark:text-gray-300 line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-gray-600 wark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{ticket.user.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>{ticket.messageCount} messages</span>
                      </div>
                      {ticket.attachments.length > 0 && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{ticket.attachments.length} files</span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="bg-white wark:bg-gray-800 hover:bg-gray-50 wark:hover:bg-gray-700">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  {/* Decorative element */}
                  <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-primary/10 transition-all duration-300 group-hover:scale-110" />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Create Ticket Modal */}
        {showCreateTicket && (
          <CreateTicketModal
            onClose={() => setShowCreateTicket(false)}
            onSuccess={() => {
              setShowCreateTicket(false);
              fetchTickets();
            }}
          />
        )}
      </div>
    </Layout>
  );
}



// Create Ticket Modal Component
function CreateTicketModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedAttachments, setUploadedAttachments] = useState<Array<{
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>>([]);

  const categories = [
    { value: 'general', label: 'General Inquiry', icon: HelpCircle, color: 'text-blue-600' },
    { value: 'technical', label: 'Technical Issue', icon: Settings, color: 'text-red-600' },
    { value: 'billing', label: 'Billing & Payments', icon: FileText, color: 'text-green-600' },
    { value: 'feature_request', label: 'Feature Request', icon: Zap, color: 'text-purple-600' },
    { value: 'bug_report', label: 'Bug Report', icon: AlertCircle, color: 'text-orange-600' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', description: 'General questions or minor issues', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', description: 'Standard issues affecting workflow', color: 'text-yellow-600' },
    { value: 'high', label: 'High', description: 'Important issues requiring prompt attention', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', description: 'Critical issues blocking operations', color: 'text-red-600' },
  ];

  const getFileType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    return 'DOCUMENT';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    setUploadingFiles(true);

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', getFileType(file.type));

        const response = await fetch('/api/upload-media', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        return {
          filename: file.name,
          url: data.url,
          size: file.size,
          mimeType: file.type
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setUploadedAttachments(prev => [...prev, ...uploadedFiles]);
      setFiles(prev => [...prev, ...selectedFiles]);

      toast({
        title: "Success",
        description: `${selectedFiles.length} file(s) uploaded successfully`,
      });

    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive"
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setUploadedAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          attachments: uploadedAttachments
        }),
      });

      if (!response.ok) throw new Error('Failed to create ticket');

      const data = await response.json();
      toast({
        title: "Success",
        description: `Support ticket ${data.ticket.ticketId} created successfully`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create support ticket",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.title && formData.description && formData.category && formData.priority;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
     <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-300 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Create Support Ticket
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Describe your issue and we&apos;ll help you resolve it as quickly as possible
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Ticket Classification */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Ticket Classification
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <category.icon className={`h-4 w-4 ${category.color}`} />
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Choose the category that best describes your issue
                  </p>
                </div>

                {/* Priority Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Priority <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20">
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${priority.color.replace('text-', 'bg-')}`} />
                              <span className="font-medium">{priority.label}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{priority.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Select based on the urgency of your issue
                  </p>
                </div>
              </div>
            </div>

            {/* Issue Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Issue Details
                </h3>
              </div>

              <div className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief description of your issue"
                    className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Provide a clear and concise title for your issue
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed information about your issue. Include steps to reproduce, expected behavior, and any error messages..."
                    rows={4}
                    className="bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20 resize-none"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Be as specific as possible to help us resolve your issue quickly
                  </p>
                </div>
              </div>
            </div>

            {/* File Attachments */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Supporting Files
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                      <Paperclip className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-purple-800">
                        Attachment Support
                      </Label>
                      <p className="text-xs text-purple-600">
                        Upload files to help us understand your issue better
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-purple-600 font-medium">
                    Optional
                  </span>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors bg-slate-50">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.zip,.mp4,.mov,.avi"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingFiles}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`cursor-pointer flex flex-col items-center gap-3 ${uploadingFiles ? 'opacity-50' : ''}`}
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      {uploadingFiles ? (
                        <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                      ) : (
                        <Upload className="h-6 w-6 text-slate-600" />
                      )}
                    </div>
                    <div className="text-sm">
                      {uploadingFiles ? (
                        <span className="text-slate-600 font-medium">Uploading files...</span>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-slate-700">
                            <span className="font-medium text-blue-600">Click to upload</span>
                            <span className="text-slate-500"> or drag and drop</span>
                          </p>
                          <p className="text-xs text-slate-500">
                            Images, Documents, Videos (max 16MB each)
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-slate-700">
                        Uploaded Files ({files.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                              {file.type.startsWith('image/') ? (
                                <FileText className="h-4 w-4 text-purple-600" />
                              ) : file.type.startsWith('video/') ? (
                                <FileText className="h-4 w-4 text-purple-600" />
                              ) : (
                                <Paperclip className="h-4 w-4 text-purple-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                              <p className="text-xs text-slate-500">
                                {formatFileSize(file.size)} • {file.type}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading || uploadingFiles}
            className="hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !isFormValid || uploadingFiles}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
