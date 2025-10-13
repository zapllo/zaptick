'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  Wallet,
  Brain,
  TrendingUp,
  TrendingDown,
  ArrowUpIcon,
  ArrowDownIcon,
  DollarSign
} from 'lucide-react';
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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

interface AnalyticsDashboardProps {
  analytics: {
    overview: {
      totalCompanies: number;
      totalUsers: number;
      activeCompanies: number;
      activeUsers: number;
    };
    growth: {
      companies: { percentage: number; };
      users: { percentage: number; };
      revenue: { current: number; percentage: number; };
    };
    expenses: {
      totalExpenses: number;
      categoryBreakdown: Array<{ name: string; value: number; }>;
      monthlyExpenses: Array<{ name: string; amount: number; }>;
    };
    wallet: {
      totalWalletBalance: number;
      avgWalletBalance: number;
      companiesWithPositiveBalance: number;
    };
    aiCredits: {
      totalAiCredits: number;
      avgAiCredits: number;
      companiesWithCredits: number;
    };
    subscriptions: Array<{ _id: string; count: number; }>;
    topSpendingCompanies: Array<{
      companyName: string;
      industry: string;
      totalSpent: number;
      transactionCount: number;
    }>;
  };
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
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

  return (
    <div className="space-y-8">
      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalCompanies}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">vs previous period</p>
              {formatPercentage(analytics.growth.companies.percentage)}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {analytics.overview.activeCompanies} active companies
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalUsers}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">vs previous period</p>
              {formatPercentage(analytics.growth.users.percentage)}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {analytics.overview.activeUsers} active users
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.growth.revenue.current)}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">vs previous period</p>
              {formatPercentage(analytics.growth.revenue.percentage)}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Total platform revenue
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.expenses.totalExpenses)}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Platform-wide expenses
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses Trend</CardTitle>
            <CardDescription>Platform-wide spending over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {analytics.expenses.monthlyExpenses.length > 0 ? (
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

        {/* Expense Categories Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Breakdown of platform expenses by category</CardDescription>
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

      {/* Subscription Distribution & Top Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>Companies by subscription plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.subscriptions.map((sub) => {
              const percentage = (sub.count / analytics.overview.totalCompanies) * 100;
              return (
                <div key={sub._id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {sub._id || 'Free'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm font-medium">{sub.count}</div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

{/* Top Spending Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Companies</CardTitle>
            <CardDescription>Companies with highest platform usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topSpendingCompanies.slice(0, 5).map((company, index) => (
                <div key={`${company.companyName}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{company.companyName}</div>
                      <div className="text-xs text-muted-foreground">{company.industry}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatCurrency(company.totalSpent)}</div>
                    <div className="text-xs text-muted-foreground">{company.transactionCount} txns</div>
                  </div>
                </div>
              ))}
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
                <span className="font-semibold">{formatCurrency(analytics.wallet.totalWalletBalance)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Balance</span>
                <span className="font-semibold">{formatCurrency(analytics.wallet.avgWalletBalance)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Positive Balances</span>
                <span className="font-semibold">{analytics.wallet.companiesWithPositiveBalance}</span>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                {((analytics.wallet.companiesWithPositiveBalance / analytics.overview.totalCompanies) * 100).toFixed(1)}%
                {' '}companies have positive balance
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
                <span className="font-semibold">{analytics.aiCredits.totalAiCredits.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Credits</span>
                <span className="font-semibold">{Math.round(analytics.aiCredits.avgAiCredits).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Companies with Credits</span>
                <span className="font-semibold">{analytics.aiCredits.companiesWithCredits}</span>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                {((analytics.aiCredits.companiesWithCredits / analytics.overview.totalCompanies) * 100).toFixed(1)}%
                {' '}companies have AI credits
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
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
                    {((analytics.overview.activeCompanies / analytics.overview.totalCompanies) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Users</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">
                    {((analytics.overview.activeUsers / analytics.overview.totalUsers) * 100).toFixed(1)}%
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
    </div>
  );
}
