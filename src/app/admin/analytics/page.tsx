'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Users,
  Wallet,
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
  Calendar,
  Download,
  Filter,
  ArrowUpIcon,
  ArrowDownIcon,
  DollarSign,
  Search,
  Target,
  Lightbulb,
  Star,
  AlertTriangle,
  TrendingUpIcon,
  Eye,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DatePickerWithRange } from '@/components/ui/date-picker-range';
import { DateRange } from 'react-day-picker';
import { addDays, subDays, startOfMonth, endOfMonth } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalCompanies: number;
    totalUsers: number;
    activeCompanies: number;
    activeUsers: number;
    inactiveCompanies: number;
    inactiveUsers: number;
  };
  growth: {
    companies: { current: number; previous: number; percentage: number; };
    users: { current: number; previous: number; percentage: number; };
    revenue: { current: number; previous: number; percentage: number; };
  };
  expenses: {
    totalExpenses: number;
    categoryBreakdown: Array<{ name: string; value: number; count: number; }>;
    monthlyExpenses: Array<{ name: string; amount: number; transactions: number; }>;
    avgMonthlyExpense: number;
  };
  insights: {
    avgMonthlySpend: number;
    projectedAnnualCost: number;
    potentialSavings: number;
    spendChange: number;
  };
  topSpendingCompanies: Array<{
    _id: string;
    companyName: string;
    industry: string;
    totalSpent: number;
    transactionCount: number;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    savings: number;
    type: string;
    action: string;
    actionLabel: string;
    priority: string;
  }>;
  recentActivity: Array<{
    _id: string;
    type: string;
    companyName: string;
    amount: number;
    description: string;
    timestamp: Date;
    details: string;
  }>;
  [key: string]: any;
}

interface Company {
  _id: string;
  name: string;
  industry?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  companyId: { _id: string; name: string; };
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [timeframe, setTimeframe] = useState('30d');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [searchCompany, setSearchCompany] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
    loadCompanies();
    loadUsers();
  }, [dateRange, timeframe, selectedCompany, selectedUser]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        timeframe,
        ...(dateRange?.from && { from: dateRange.from.toISOString() }),
        ...(dateRange?.to && { to: dateRange.to.toISOString() }),
        ...(selectedCompany && { companyId: selectedCompany }),
        ...(selectedUser && { userId: selectedUser })
      });

      const response = await fetch(`/api/admin/analytics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Error loading analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const url = selectedCompany
        ? `/api/admin/users?companyId=${selectedCompany}`
        : '/api/admin/users';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const isPositive = percentage >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
        <span className="text-sm font-medium">{Math.abs(percentage).toFixed(1)}%</span>
      </div>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/admin/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRange,
          timeframe,
          companyId: selectedCompany,
          userId: selectedUser
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `admin-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "Analytics data exported successfully",
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export analytics data",
        variant: "destructive"
      });
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchCompany.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  if (!analytics) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading advanced analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive insights across all organizations, users, and spending patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={exportData}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={loadAnalytics}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analytics Filters
          </CardTitle>
          <CardDescription>
            Filter analytics by time period, company, or specific users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Time Period */}
            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company Filter */}
            <div className="space-y-2">
              <Label>Company</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={searchCompany}
                  onChange={(e) => setSearchCompany(e.target.value)}
                  className="pl-8"
                />
                {searchCompany && (
                  <div className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                    <div
                      className="p-2 hover:bg-muted cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedCompany('');
                        setSearchCompany('');
                      }}
                    >
                      <span className="font-medium">All Companies</span>
                    </div>
                    {filteredCompanies.map((company) => (
                      <div
                        key={company._id}
                        className="p-2 hover:bg-muted cursor-pointer"
                        onClick={() => {
                          setSelectedCompany(company._id);
                          setSearchCompany(company.name);
                          setSelectedUser('');
                        }}
                      >
                        <div className="font-medium">{company.name}</div>
                        {company.industry && (
                          <div className="text-xs text-muted-foreground">{company.industry}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* User Filter */}
            <div className="space-y-2">
              <Label>User</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="pl-8"
                  disabled={!selectedCompany}
                />
                {searchUser && selectedCompany && (
                  <div className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                    <div
                      className="p-2 hover:bg-muted cursor-pointer text-sm"
                      onClick={() => {
                        setSelectedUser('');
                        setSearchUser('');
                      }}
                    >
                      <span className="font-medium">All Users</span>
                    </div>
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className="p-2 hover:bg-muted cursor-pointer"
                        onClick={() => {
                          setSelectedUser(user._id);
                          setSearchUser(user.name);
                        }}
                      >
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Custom Date Range</Label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCompany || selectedUser) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Active Filters:</span>
              {selectedCompany && (
                <Badge variant="secondary" className="gap-1">
                  Company: {companies.find(c => c._id === selectedCompany)?.name}
                  <button
                    onClick={() => {
                      setSelectedCompany('');
                      setSearchCompany('');
                      setSelectedUser('');
                      setSearchUser('');
                    }}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedUser && (
                <Badge variant="secondary" className="gap-1">
                  User: {users.find(u => u._id === selectedUser)?.name}
                  <button
                    onClick={() => {
                      setSelectedUser('');
                      setSearchUser('');
                    }}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Growth Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Companies Growth</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalCompanies}</div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">vs previous period</p>
                  {analytics.growth?.companies && formatPercentage(analytics.growth.companies.percentage)}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {analytics.overview.activeCompanies} active companies
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users Growth</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalUsers}</div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">vs previous period</p>
                  {analytics.growth?.users && formatPercentage(analytics.growth.users.percentage)}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {analytics.overview.activeUsers} active users
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.growth?.revenue?.current || 0)}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">vs previous period</p>
                  {analytics.growth?.revenue && formatPercentage(analytics.growth.revenue.percentage)}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Platform revenue growth
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Balance</span>
                    <span className="font-semibold">{formatCurrency(analytics.wallet?.totalWalletBalance || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Balance</span>
                    <span className="font-semibold">{formatCurrency(analytics.wallet?.avgWalletBalance || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Positive Balances</span>
                    <span className="font-semibold">{analytics.wallet?.companiesWithPositiveBalance || 0}</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    {analytics.overview.totalCompanies > 0
                      ? (((analytics.wallet?.companiesWithPositiveBalance || 0) / analytics.overview.totalCompanies) * 100).toFixed(1)
                      : 0}% companies have positive balance
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Credits Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Credits</span>
                    <span className="font-semibold">{(analytics.aiCredits?.totalAiCredits || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Credits</span>
                    <span className="font-semibold">{Math.round(analytics.aiCredits?.avgAiCredits || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Companies with Credits</span>
                    <span className="font-semibold">{analytics.aiCredits?.companiesWithCredits || 0}</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    {analytics.overview.totalCompanies > 0
                      ? (((analytics.aiCredits?.companiesWithCredits || 0) / analytics.overview.totalCompanies) * 100).toFixed(1)
                      : 0}% companies have AI credits
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Companies</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        {analytics.overview.totalCompanies > 0
                          ? ((analytics.overview.activeCompanies / analytics.overview.totalCompanies) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Users</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        {analytics.overview.totalUsers > 0
                          ? ((analytics.overview.activeUsers / analytics.overview.totalUsers) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Status</span>
                    <Badge variant="default" className="bg-green-600">Healthy</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.expenses?.totalExpenses || 0)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {analytics.insights?.spendChange !== undefined && formatPercentage(analytics.insights.spendChange)}
                  <p className="text-xs text-muted-foreground">from last period</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Monthly Spend</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.expenses?.avgMonthlyExpense || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Average across all companies
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.expenses?.categoryBreakdown?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Active expense categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.expenses?.categoryBreakdown?.reduce((sum, cat) => sum + cat.count, 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Total transactions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Expenses Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Expenses Trend
              </CardTitle>
              <CardDescription>
                Platform-wide spending patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {analytics.expenses?.monthlyExpenses?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.expenses.monthlyExpenses}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No expense data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Monthly Spend</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.insights?.avgMonthlySpend || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Platform average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projected Annual Cost</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.insights?.projectedAnnualCost || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on current trends
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.insights?.potentialSavings || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Through optimization
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-6">
          {analytics.topSpendingCompanies?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Top Spending Companies
                </CardTitle>
                <CardDescription>
                  Companies with highest platform usage costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topSpendingCompanies.map((company, index) => (
                    <div key={company._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{company.companyName}</div>
                          <div className="text-sm text-muted-foreground">{company.industry}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(company.totalSpent)}</div>
                        <div className="text-sm text-muted-foreground">{company.transactionCount} transactions</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Platform Optimization Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered suggestions to optimize platform performance and costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.recommendations?.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recommendations.map((rec) => (
                    <div key={rec.id} className="p-6 border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{rec.title}</h3>
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {rec.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-semibold text-green-600">
                            Potential savings: {formatCurrency(rec.savings)}
                          </span>
                        </div>
                        <Button size="sm" className="gap-2">
                          <Settings className="h-3 w-3" />
                          {rec.actionLabel}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
                  <p className="text-muted-foreground">
                    The system will generate optimization recommendations as more data becomes available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Platform Activity
          </CardTitle>
          <CardDescription>
            Latest transactions and activities across all organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity?.length > 0 ? (
            <div className="space-y-4">
              {analytics.recentActivity.slice(0, 10).map((activity) => (
                <div key={activity._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'expense' ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <div className="font-medium text-sm">{activity.details}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold text-sm ${
                      activity.type === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {activity.type === 'expense' ? '-' : '+'}{formatCurrency(activity.amount)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
              <p className="text-muted-foreground">
                Recent platform activities will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
