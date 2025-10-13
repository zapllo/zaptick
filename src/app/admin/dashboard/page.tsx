'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Users,
  Wallet,
  CreditCard,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
  Eye,
  DollarSign,
  Brain
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface Analytics {
  overview: {
    totalCompanies: number;
    totalUsers: number;
    activeCompanies: number;
    activeUsers: number;
    inactiveCompanies: number;
    inactiveUsers: number;
  };
  subscriptions: Array<{
    _id: string;
    count: number;
  }>;
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
  growth: Array<{
    _id: { year: number; month: number };
    count: number;
  }>;
  industries: Array<{
    _id: string;
    count: number;
  }>;
  locations: Array<{
    _id: string;
    count: number;
  }>;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (!analytics) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
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
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Complete overview of your platform analytics and management
          </p>
        </div>
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalCompanies}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-green-600">
                {analytics.overview.activeCompanies} active
              </Badge>
              <Badge variant="outline" className="text-red-600">
                {analytics.overview.inactiveCompanies} inactive
              </Badge>
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-green-600">
                {analytics.overview.activeUsers} active
              </Badge>
              <Badge variant="outline" className="text-red-600">
                {analytics.overview.inactiveUsers} inactive
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.wallet.totalWalletBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.wallet.companiesWithPositiveBalance} companies with positive balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AI Credits</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.aiCredits.totalAiCredits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.aiCredits.companiesWithCredits} companies with credits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Subscription Plans
            </CardTitle>
            <CardDescription>Distribution of companies by subscription plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.subscriptions.map((sub) => (
              <div key={sub._id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {sub._id || 'Unknown'}
                  </Badge>
                </div>
                <div className="text-sm font-medium">{sub.count}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Industries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Industries
            </CardTitle>
            <CardDescription>Companies by industry breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.industries?.slice(0, 5).map((industry) => (
              <div key={industry._id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {industry._id}
                  </Badge>
                </div>
                <div className="text-sm font-medium">{industry.count}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Top Locations
          </CardTitle>
          <CardDescription>Companies by location breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {analytics.locations?.slice(0, 10).map((location) => (
              <div key={location._id} className="p-4 border rounded-lg">
                <div className="text-sm font-medium">{location._id}</div>
                <div className="text-2xl font-bold text-primary">{location.count}</div>
                <div className="text-xs text-muted-foreground">companies</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Manage your platform efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/companies">
              <Button variant="outline" className="w-full gap-2">
                <Building2 className="h-4 w-4" />
                Manage Companies
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full gap-2">
                <Users className="h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/template-rates">
              <Button variant="outline" className="w-full gap-2">
                <DollarSign className="h-4 w-4" />
                Template Rates
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
