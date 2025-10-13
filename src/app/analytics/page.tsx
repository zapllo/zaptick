'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Users,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  Phone,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Zap,
  Globe,
  Star,
  Timer,
  Mail,
  UserCheck,
  MessageCircle,
  PlayCircle,
  Pause,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  DollarSign,
  TrendingDown as TrendingDownIcon,
  Info
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Area, AreaChart } from 'recharts';
import { ProgressRing } from '@/components/analytics/ProgressRing';

interface AnalyticsData {
  totalMessages: number;
  previousMessages: number;
  activeConversations: number;
  previousActiveConversations: number;
  totalContacts: number;
  contactsInRange: number;
  contactsInPrevious: number;
  templateStats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    disabled: number;
    deleted: number;
    categories: {
      marketing: number;
      authentication: number;
      utility: number;
    };
    mostUsed: Array<{
      name: string;
      category: string;
      useCount: number;
      deliveryRate: number;
      readRate: number;
    }>;
  };
  messageTrend: Array<{
    date: string;
    day: string;
    count: number;
  }>;
  contactMetrics: {
    total: number;
    new: number;
    engagementRate: string;
  };
  recentMessages: Array<{
    id: string;
    name: string;
    message: string;
    time: string;
    read: boolean;
  }>;
  messageMetrics: {
    deliveryRate: number;
    readRate: number;
    responseRate: number;
    responseTime: number;
  };
  campaignMetrics: {
    active: number;
    totalSent: number;
    conversionRate: number;
  };
  workflowMetrics: {
    active: number;
    totalExecutions: number;
    timeSaved: number;
  };
  autoReplyMetrics: {
    active: number;
    totalUsage: number;
  };
  costMetrics: {
    thisMonth: number;
    costPerMessage: number;
    savingsVsEmail: number;
  };
  geographicData: Array<{
    country: string;
    percentage: number;
    flag: string;
  }>;
  peakHoursData: Array<{
    hour: string;
    messages: number;
  }>;
  messageTypesData: {
    text: number;
    template: number;
    media: number;
  };
  insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    content: string;
    icon: string;
  }>;
}

interface UserData {
  wabaAccounts: Array<{
    wabaId: string;
    phoneNumberId: string;
    businessName: string;
    phoneNumber: string;
    status: string;
  }>;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const timeRanges = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' }
];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedWaba, setSelectedWaba] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user data and set default WABA
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) throw new Error('Failed to fetch user data');

        const data = await response.json();
        setUser(data.user);

        if (data.user.wabaAccounts?.length > 0) {
          setSelectedWaba(data.user.wabaAccounts[0].wabaId);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive"
        });
      }
    };

    fetchUserData();
  }, []);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!selectedWaba) return;

    setRefreshing(true);
    try {
      const params = new URLSearchParams({
        timeRange,
        wabaId: selectedWaba
      });

      const response = await fetch(`/api/admin/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };






  // Fetch analytics when dependencies change
  useEffect(() => {
    if (selectedWaba) {
      fetchAnalytics();
    }
  }, [selectedWaba, timeRange]);

  // Format number with animation
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Calculate percentage change
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '100' : '0';
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color = 'primary',
    suffix = '',
    loading = false
  }: {
    title: string;
    value: number | string;
    change?: string;
    icon: any;
    color?: 'primary' | 'success' | 'warning' | 'error';
    suffix?: string;
    loading?: boolean;
  }) => {
    const colorClasses = {
      primary: 'text-primary bg-primary/10',
      success: 'text-green-600 bg-green-100',
      warning: 'text-amber-600 bg-amber-100',
      error: 'text-red-600 bg-red-100'
    };

    const changeColor = change && parseFloat(change) > 0 ? 'text-green-600' : 'text-red-600';
    const ChangeIcon = change && parseFloat(change) > 0 ? ArrowUpRight : ArrowDownRight;

    return (
      <Card className="group rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground group-hover:text-primary/80 transition-colors">
                {title}
              </p>
              <div className="flex items-center gap-2">
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                ) : (
                  <h3 className="text-2xl font-bold tracking-tight">
                    {typeof value === 'number' ? formatNumber(value) : value}{suffix}
                  </h3>
                )}
                {change && !loading && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
                    <ChangeIcon className="h-4 w-4" />
                    {change}%
                  </div>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color]} group-hover:scale-110 transition-transform duration-200`}>
           <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getInsightIcon = (iconName: string) => {
    switch (iconName) {
      case 'trending-up':
        return TrendingUp;
      case 'alert-circle':
        return AlertCircle;
      case 'file-text':
        return FileText;
      case 'users':
        return Users;
      default:
        return Info;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getInsightTextColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-900';
      case 'warning':
        return 'text-amber-900';
      case 'info':
        return 'text-blue-900';
      default:
        return 'text-gray-900';
    }
  };

  const getInsightIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-amber-600 bg-amber-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && !analytics) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading analytics...</p>
            <p className="text-sm text-muted-foreground">Gathering insights from your WhatsApp data</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 p-6">
      {/* Clean Header */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold">
                        BETA
                      </Badge>
                    </div>
                    <p className="text-gray-600">Comprehensive insights into your WhatsApp Business performance</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {/* WABA Selector */}
                {/* <Select value={selectedWaba} onValueChange={setSelectedWaba}>
                  <SelectTrigger className="w-[220px] border-gray-300">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Select WhatsApp Account" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {user?.wabaAccounts?.map((account) => (
                      <SelectItem key={account.wabaId} value={account.wabaId}>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{account.phoneNumber || account.businessName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}

                {/* Time Range Selector */}
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[160px] border-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {timeRanges?.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Action Buttons */}
                <Button
                  variant="outline"
                  onClick={fetchAnalytics}
                  disabled={refreshing}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>

                {/* <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4" />
                  Export
                  <Badge variant="secondary" className="ml-1 text-xs bg-blue-100 text-blue-800">
                    Beta
                  </Badge>
                </Button> */}
              </div>
            </div>
          </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Messages"
            value={analytics?.totalMessages || 0}
            change={getPercentageChange(analytics?.totalMessages || 0, analytics?.previousMessages || 0)}
            icon={MessageSquare}
            color="primary"
            loading={loading}
          />
          <StatCard
            title="Active Conversations"
            value={analytics?.activeConversations || 0}
            change={getPercentageChange(analytics?.activeConversations || 0, analytics?.previousActiveConversations || 0)}
            icon={MessageCircle}
            color="success"
            loading={loading}
          />
          <StatCard
            title="Total Contacts"
            value={analytics?.totalContacts || 0}
            change={getPercentageChange(analytics?.contactsInRange || 0, analytics?.contactsInPrevious || 0)}
            icon={Users}
            color="primary"
            loading={loading}
          />
          <StatCard
            title="Delivery Rate"
            value={analytics?.messageMetrics.deliveryRate || 0}
            icon={CheckCircle2}
            color="success"
            suffix="%"
            loading={loading}
          />
        </div>

        {/* Message Performance */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Message Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.messageTrend || []}>
                    <defs>
                      <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMessages)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Message Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Delivery Rate</span>
                  <span className="text-sm font-medium">{analytics?.messageMetrics.deliveryRate || 0}%</span>
                </div>
                <Progress value={analytics?.messageMetrics.deliveryRate || 0} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Read Rate</span>
                  <span className="text-sm font-medium">{analytics?.messageMetrics.readRate || 0}%</span>
                </div>
                <Progress value={analytics?.messageMetrics.readRate || 0} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Response Rate</span>
                  <span className="text-sm font-medium">{analytics?.messageMetrics.responseRate || 0}%</span>
                </div>
                <Progress value={analytics?.messageMetrics.responseRate || 0} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                  <div className="flex items-center gap-1">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{analytics?.messageMetrics.responseTime || 0}h</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates & Contacts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Template Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Template Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Template Status Distribution */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Approved</span>
                    </div>
                    <p className="text-2xl font-bold">{analytics?.templateStats.approved || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Pending</span>
                    </div>
                    <p className="text-2xl font-bold">{analytics?.templateStats.pending || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Rejected</span>
                    </div>
                    <p className="text-2xl font-bold">{analytics?.templateStats.rejected || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Disabled</span>
                    </div>
                    <p className="text-2xl font-bold">{analytics?.templateStats.disabled || 0}</p>
                  </div>
                </div>

                {/* Template Categories */}
                <div className="space-y-3">
                  <h4 className="font-medium">Categories</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Marketing</span>
                      <Badge variant="secondary">{analytics?.templateStats.categories.marketing || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Authentication</span>
                      <Badge variant="secondary">{analytics?.templateStats.categories.authentication || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Utility</span>
                      <Badge variant="secondary">{analytics?.templateStats.categories.utility || 0}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Contact Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Contacts</p>
                    <p className="text-2xl font-bold">{analytics?.contactMetrics.total || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">New Contacts</p>
                    <p className="text-2xl font-bold text-green-600">{analytics?.contactMetrics.new || 0}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Engagement Rate</span>
                    <span className="text-sm font-medium">{analytics?.contactMetrics.engagementRate || 0}%</span>
                  </div>
                  <Progress value={parseFloat(analytics?.contactMetrics.engagementRate || '0')} className="h-2" />
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Recent Activity</h4>
                  <div className="space-y-2">
                    {analytics?.recentMessages.slice(0, 3).map((message, index) => (
                      <div key={message.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`w-2 h-2 rounded-full ${message.read ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{message.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{message.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Most Used Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Performing Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.templateStats.mostUsed.length > 0 ? (
                analytics.templateStats.mostUsed.map((template, index) => (
                  <div key={template.name} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {template.category} • {template.useCount} uses
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">{template.deliveryRate}%</p>
                        <p className="text-xs text-muted-foreground">Delivery</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{template.readRate}%</p>
                        <p className="text-xs text-muted-foreground">Read</p>
                      </div>
                      {/*
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      */}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No template usage data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
              <Badge variant="outline" className="ml-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {analytics?.recentMessages.length > 0 ? (
                analytics.recentMessages.map((message, index) => (
                  <div key={message.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">New message from {message.name}</p>
                      <p className="text-xs text-muted-foreground">{message.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
                    </div>
                    <Badge variant={message.read ? "default" : "secondary"}>
                      {message.read ? "Read" : "Unread"}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Comparison */}
        {/* <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Channel Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{analytics?.messageMetrics.deliveryRate || 0}%</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${analytics?.messageMetrics.deliveryRate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">23.8%</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '23.8%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium">SMS</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">12.4%</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '12.4%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.geographicData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.flag}</span>
                      <span className="text-sm font-medium">{item.country}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Advanced Analytics */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Peak Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.peakHoursData || []}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="hour" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="messages" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Peak activity based on your message data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Message Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ProgressRing progress={analytics?.messageTypesData.text || 0} size={120} color="#10B981">
                  <div className="text-center">
                    <p className="text-xl font-bold">{analytics?.messageTypesData.text || 0}%</p>
                    <p className="text-xs text-muted-foreground">Text</p>
                  </div>
                </ProgressRing>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Text Messages</span>
                  </div>
                  <span className="text-sm font-medium">{analytics?.messageTypesData.text || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Templates</span>
                  </div>
                  <span className="text-sm font-medium">{analytics?.messageTypesData.template || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Media</span>
                  </div>
                  <span className="text-sm font-medium">{analytics?.messageTypesData.media || 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {analytics?.contactsInRange && analytics?.contactsInPrevious
                      ? `+${getPercentageChange(analytics.contactsInRange, analytics.contactsInPrevious)}%`
                      : '+0%'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Contact Growth</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">New Contacts</span>
                    <span className="text-sm font-medium text-green-600">+{analytics?.contactsInRange || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Messages</span>
                    <span className="text-sm font-medium text-green-600">
                      {analytics?.totalMessages && analytics?.previousMessages
                        ? `+${getPercentageChange(analytics.totalMessages, analytics.previousMessages)}%`
                        : '+0%'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Engagement</span>
                    <span className="text-sm font-medium text-green-600">{analytics?.contactMetrics.engagementRate || 0}%</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Compared to previous period
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Insights */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Campaign Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Campaign Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Campaigns</span>
                  <Badge variant="outline">{analytics?.campaignMetrics.active || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Sent</span>
                <span className="text-sm font-medium">{formatNumber(analytics?.campaignMetrics.totalSent || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="text-sm font-medium">{analytics?.campaignMetrics.conversionRate || 0}%</span>
                </div>
                <Progress value={analytics?.campaignMetrics.conversionRate || 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Workflow Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Workflow Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Workflows</span>
                  <Badge variant="outline">{analytics?.workflowMetrics.active || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Executions</span>
                  <span className="text-sm font-medium">{formatNumber(analytics?.workflowMetrics.totalExecutions || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Time Saved</span>
                  <span className="text-sm font-medium">{analytics?.workflowMetrics.timeSaved || 0}h</span>
                </div>
                <Progress value={Math.min((analytics?.workflowMetrics.timeSaved || 0) * 2, 100)} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Cost Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Period</span>
                  <span className="text-sm font-medium">₹{analytics?.costMetrics.thisMonth || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cost per Message</span>
                  <span className="text-sm font-medium">₹{analytics?.costMetrics.costPerMessage || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Savings vs Email</span>
                  <span className="text-sm font-medium text-green-600">{analytics?.costMetrics.savingsVsEmail || 0}%</span>
                </div>
                <Progress value={analytics?.costMetrics.savingsVsEmail || 0} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI-Powered Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.insights && analytics.insights.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {analytics.insights.map((insight, index) => {
                  const IconComponent = getInsightIcon(insight.icon);
                  return (
                    <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getInsightIconColor(insight.type)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className={`font-medium ${getInsightTextColor(insight.type)}`}>{insight.title}</h4>
                          <p className={`text-sm mt-1 ${getInsightTextColor(insight.type)} opacity-80`}>
                            {insight.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No insights available at the moment</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Insights will appear as you send more messages and engage with contacts
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
