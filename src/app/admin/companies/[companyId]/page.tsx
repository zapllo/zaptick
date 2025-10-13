'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Users,
  Wallet,
  Brain,
  Activity,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  RefreshCw
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

interface CompanyAnalytics {
  company: {
    _id: string;
    name: string;
    industry?: string;
    location?: string;
    walletBalance: number;
    aiCredits: number;
    subscriptionPlan: string;
    subscriptionStatus: string;
  };
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalExpenses: number;
    totalCredits: number;
    changePercentage: number;
  };
  expenses: {
    categoryBreakdown: Array<{ name: string; value: number; count: number; }>;
    monthlyExpenses: Array<{ name: string; amount: number; }>;
    avgMonthlyExpense: number;
  };
  insights: {
    avgMonthlySpend: number;
    projectedAnnualCost: number;
    potentialSavings: number;
  };
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    savings: number;
    type: string;
  }>;
}

export default function CompanyDetailsPage() {
  const params = useParams();
  const companyId = params?.companyId as string;
  const [analytics, setAnalytics] = useState<CompanyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (companyId) {
      loadCompanyAnalytics();
    }
  }, [companyId]);

  const loadCompanyAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/companies/${companyId}/analytics`);

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        toast({
          title: "Error",
          description: "Failed to load company analytics",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading company analytics:', error);
      toast({
        title: "Error",
        description: "Error loading company analytics",
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

  if (loading || !analytics) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading company analytics...</p>
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
          <Link href="/admin/companies">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{analytics.company.name}</h1>
            <p className="text-muted-foreground">
              Detailed analytics and insights for this company
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadCompanyAnalytics} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Link href={`/admin/companies/${companyId}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Company
            </Button>
          </Link>
        </div>
      </div>

      {/* Company Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.company.walletBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Current balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Credits</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.company.aiCredits}</div>
            <p className="text-xs text-muted-foreground">
              Available credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.insights.avgMonthlySpend)}</div>
            <div className="flex items-center gap-1 mt-1">
              {analytics.overview.changePercentage >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={`text-xs ${analytics.overview.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(analytics.overview.changePercentage).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Expenses Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Expenses</CardTitle>
                <CardDescription>Spending trend over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
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
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Breakdown by category</CardDescription>
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

          {/* Expense Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Summary</CardTitle>
              <CardDescription>Detailed breakdown of company expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.expenses.categoryBreakdown.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.count} transactions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(category.value)}</div>
                      <div className="text-sm text-muted-foreground">
                        {((category.value / analytics.expenses.categoryBreakdown.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(analytics.insights.avgMonthlySpend)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Average monthly spending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Annual Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(analytics.insights.projectedAnnualCost)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on current trends
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Potential Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(analytics.insights.potentialSavings)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Through optimization
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic company details and subscription status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Industry</label>
                    <p className="font-medium">{analytics.company.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="font-medium">{analytics.company.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Users</label>
                    <p className="font-medium">{analytics.overview.totalUsers}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Subscription Plan</label>
                    <div className="flex items-center gap-2">
                      <Badge variant={analytics.company.subscriptionPlan === 'free' ? 'secondary' : 'default'}>
                        {analytics.company.subscriptionPlan}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Subscription Status</label>
                    <div className="flex items-center gap-2">
                      <Badge variant={analytics.company.subscriptionStatus === 'active' ? 'default' : 'destructive'}>
                        {analytics.company.subscriptionStatus}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Active Users</label>
                    <p className="font-medium">{analytics.overview.activeUsers}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>Personalized suggestions to help this company save costs</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recommendations.map((recommendation) => (
                    <div key={recommendation.id} className="p-6 border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{recommendation.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {recommendation.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          {recommendation.type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-semibold text-green-600">
                            Potential savings: {formatCurrency(recommendation.savings)}
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          Learn More
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
                  <p className="text-muted-foreground">
                    Recommendations will appear as more usage data becomes available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Users</CardTitle>
              <CardDescription>Manage users for this company</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                  Total: {analytics.overview.totalUsers} users ({analytics.overview.activeUsers} active)
                </div>
                <Link href={`/admin/users?companyId=${companyId}`}>
                  <Button className="gap-2">
                    <Eye className="h-4 w-4" />
                    View All Users
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
