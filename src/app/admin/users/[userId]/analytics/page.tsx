'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Building2,
  Activity,
  ArrowLeft,
  RefreshCw,
  Eye,
  Mail,
  Calendar,
  Shield,
  Wallet,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface UserAnalytics {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    isOwner: boolean;
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
  };
  company: {
    _id: string;
    name: string;
    industry?: string;
    walletBalance: number;
    aiCredits: number;
  };
  overview: {
    companyExpenses: number;
    companyTransactions: number;
    avgExpensePerTransaction: number;
    userContributionEstimate: number;
  };
  expenses: {
    categoryBreakdown: Array<{ name: string; value: number; count: number; }>;
    monthlyExpenses: Array<{ name: string; amount: number; }>;
  };
  userActivity: {
    lastLoginAt?: string;
    loginAttempts: number;
    isActive: boolean;
    role: string;
    isOwner: boolean;
  };
  connectedAccounts: {
    whatsappAccounts: number;
    instagramAccounts: number;
  };
}

export default function UserAnalyticsPage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadUserAnalytics();
    }
  }, [userId]);

  const loadUserAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/analytics`);

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        toast({
          title: "Error",
          description: "Failed to load user analytics",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading user analytics:', error);
      toast({
        title: "Error",
        description: "Error loading user analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || !analytics) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading user analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{analytics.user.name}</h1>
            <p className="text-muted-foreground">
              User analytics and activity insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadUserAnalytics} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {/* <Link href={`/admin/companies/${analytics.company._id}`}>
            <Button variant="outline" className="gap-2">
              <Building2 className="h-4 w-4" />
              View Company
            </Button>
          </Link> */}
        </div>
      </div>

      {/* User Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={analytics.user.isActive ? 'default' : 'destructive'}>
                {analytics.user.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">
                {analytics.user.role}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.user.isOwner ? 'Company Owner' : 'Team Member'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Login</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {formatDate(analytics.userActivity.lastLoginAt)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.userActivity.loginAttempts} login attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.connectedAccounts.whatsappAccounts + analytics.connectedAccounts.instagramAccounts}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.connectedAccounts.whatsappAccounts} WhatsApp, {analytics.connectedAccounts.instagramAccounts} Instagram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Expenses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.overview.companyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.companyTransactions} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium">{analytics.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{analytics.user.role}</Badge>
                    {analytics.user.isOwner && <Badge variant="default">Owner</Badge>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p className="font-medium">{formatDate(analytics.user.createdAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                <Link
                  href={`/admin/companies/${analytics.company._id}`}
                  className="block font-medium text-primary hover:underline"
                >
                  {analytics.company.name}
                </Link>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Industry</label>
                <p className="font-medium">{analytics.company.industry || 'Not specified'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Wallet Balance</label>
                  <p className="font-medium">{formatCurrency(analytics.company.walletBalance)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">AI Credits</label>
                  <p className="font-medium">{analytics.company.aiCredits}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="expenses">Company Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Summary</CardTitle>
              <CardDescription>Overview of user engagement and account status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Account Status</span>
                      <Badge variant={analytics.user.isActive ? 'default' : 'destructive'}>
                        {analytics.user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      User account is {analytics.user.isActive ? 'active and accessible' : 'deactivated'}
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Login Attempts</span>
                      <span className="text-sm font-semibold">{analytics.userActivity.loginAttempts}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recent login attempt count
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">WhatsApp Accounts</span>
                      <span className="text-sm font-semibold">{analytics.connectedAccounts.whatsappAccounts}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connected WhatsApp Business accounts
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Instagram Accounts</span>
                      <span className="text-sm font-semibold">{analytics.connectedAccounts.instagramAccounts}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connected Instagram Business accounts
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          {/* Company Expense Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Company Expenses</CardTitle>
                <CardDescription>Company spending trend over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {analytics.expenses.monthlyExpenses.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.expenses.monthlyExpenses}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
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

            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Company expense breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {analytics.expenses.categoryBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.expenses.categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {analytics.expenses.categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No expense data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Expense Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Company Expense Summary</CardTitle>
              <CardDescription>
                This user belongs to {analytics.company.name} - here's their company's expense overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Expenses</span>
                  </div>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.overview.companyExpenses)}</div>
                  <p className="text-sm text-muted-foreground">Company-wide spending</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Transactions</span>
                  </div>
                  <div className="text-2xl font-bold">{analytics.overview.companyTransactions}</div>
                  <p className="text-sm text-muted-foreground">Total transactions</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Avg per Transaction</span>
                  </div>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.overview.avgExpensePerTransaction)}</div>
                  <p className="text-sm text-muted-foreground">Average expense amount</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
