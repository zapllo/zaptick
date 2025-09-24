"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Download,
  Info,
  TrendingUp,
  TrendingDown,
  Loader2,
  Sparkles,
  Target,
  Zap,
  BarChart3,
  LineChartIcon,
  Lightbulb,
  Star
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/pricing";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface InsightsData {
  metrics: {
    avgMonthlySpend: number;
    projectedAnnualCost: number;
    potentialSavings: number;
    spendChange: number;
    currentSpend: number;
    previousSpend: number;
  };
  usageData: Array<{
    name: string;
    messages: number;
    api: number;
    templates: number;
  }>;
  compareData: Array<{
    name: string;
    current: number;
    previous: number;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    savings: number;
    type: "subscription" | "usage" | "optimization";
    action: string;
    actionLabel: string;
  }>;
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function InsightsPage() {
  const [period, setPeriod] = useState("year");
  const [isLoading, setIsLoading] = useState(true);
  const [insightsData, setInsightsData] = useState<InsightsData>({
    metrics: {
      avgMonthlySpend: 0,
      projectedAnnualCost: 0,
      potentialSavings: 0,
      spendChange: 0,
      currentSpend: 0,
      previousSpend: 0
    },
    usageData: [],
    compareData: [],
    recommendations: [],
    period: "year",
    dateRange: { start: "", end: "" }
  });
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadInsightsData();
  }, [period]);

  const loadInsightsData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/wallet/insights?period=${period}`);
      const result = await response.json();

      if (result.success) {
        setInsightsData(result.data);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load insights data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading insights data:", error);
      toast({
        title: "Error",
        description: "Failed to load insights data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportInsights = () => {
    const csvContent = [
      ["Metric", "Value"].join(","),
      ["Average Monthly Spend", insightsData.metrics.avgMonthlySpend.toString()],
      ["Projected Annual Cost", insightsData.metrics.projectedAnnualCost.toString()],
      ["Potential Savings", insightsData.metrics.potentialSavings.toString()],
      ["Spend Change (%)", insightsData.metrics.spendChange.toString()],
      "",
      ["Month", "Messages", "API Calls", "Templates"].join(","),
      ...insightsData.usageData.map(item => [
        item.name,
        item.messages.toString(),
        item.api.toString(),
        item.templates.toString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `insights-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRecommendationAction = (action: string) => {
    router.push(action);
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "subscription":
        return "bg-blue-100 text-blue-800 wark:bg-blue-900/30 wark:text-blue-400";
      case "usage":
        return "bg-green-100 text-green-800 wark:bg-green-900/30 wark:text-green-400";
      case "optimization":
        return "bg-yellow-100 text-yellow-800 wark:bg-yellow-900/30 wark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 wark:bg-gray-900/30 wark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-purple-500 animate-pulse" />
          </div>
          <p className="font-medium text-slate-900 wark:text-white">Loading insights...</p>
          <p className="text-sm text-slate-500">Analyzing your usage patterns</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 pb-12">
      {/* Modern Header */}
      <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-purple-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-purple-200 wark:from-muted/40 wark:to-purple-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 wark:text-white">
                View Insights
              </h1>
              <p className="text-slate-600 wark:text-slate-300">
                Analyze your usage patterns and optimize spending
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 wark:bg-slate-800 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600 wark:text-slate-300">Smart analytics</span>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-purple-500/10 transition-all duration-300 group-hover:scale-110" />
      </div>

      {/* Filters */}
      <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-slate-600 wark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 wark:text-slate-300">Analysis Period</span>
          </div>

          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px] bg-white wark:bg-slate-800 border-slate-200 wark:border-slate-700">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={exportInsights}
              className="border-slate-200 wark:border-slate-700 hover:border-primary hover:bg-primary/5"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-slate-500/10 transition-all duration-300 group-hover:scale-110" />
      </div>

      {/* Savings Alert */}
      {insightsData.metrics.potentialSavings > 0 && (
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:from-muted/40 wark:to-green-900/10">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 wark:text-white mb-1">💡 Usage Insight Tip</h3>
              <p className="text-slate-600 wark:text-slate-300 leading-relaxed">
                You could save approximately <span className="font-semibold text-green-600 wark:text-green-400">{formatCurrency(insightsData.metrics.potentialSavings)}</span> per month by following our optimization recommendations.{' '}
                <button
                  onClick={() => document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' })}
                  className="font-medium text-green-600 wark:text-green-400 hover:text-green-800 wark:hover:text-green-300 underline transition-colors"
                >
                  See recommendations
                </button>
              </p>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Average Monthly Spend */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 wark:from-muted/40 wark:to-blue-900/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-600 wark:text-slate-400">Average Monthly Spend</p>
            <p className="text-3xl font-bold text-slate-900 wark:text-white">
              {formatCurrency(insightsData.metrics.avgMonthlySpend)}
            </p>
            <div className="flex items-center gap-2 text-xs">
              {insightsData.metrics.spendChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500" />
              )}
              <span className={cn(
                "font-medium",
                insightsData.metrics.spendChange >= 0 ? "text-red-500" : "text-green-500"
              )}>
                {insightsData.metrics.spendChange >= 0 ? '+' : ''}{insightsData.metrics.spendChange.toFixed(1)}%
              </span>
              <span className="text-slate-500 wark:text-slate-400">vs previous period</span>
            </div>
          </div>

          <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Projected Annual Cost */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-purple-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-purple-200 wark:from-muted/40 wark:to-purple-900/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-600 wark:text-slate-400">Projected Annual Cost</p>
            <p className="text-3xl font-bold text-slate-900 wark:text-white">
              {formatCurrency(insightsData.metrics.projectedAnnualCost)}
            </p>
            <p className="text-xs text-slate-500 wark:text-slate-400">
              Based on current usage patterns
            </p>
          </div>

          <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-purple-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Potential Savings */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:from-muted/40 wark:to-green-900/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
              <Star className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-600 wark:text-slate-400">Potential Savings</p>
            <p className="text-3xl font-bold text-green-600 wark:text-green-400">
              {formatCurrency(insightsData.metrics.potentialSavings)}
            </p>
            <p className="text-xs text-slate-500 wark:text-slate-400">
              By optimizing your usage and subscription
            </p>
          </div>

          <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Usage Analytics */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10">
          <div className="p-6 border-b border-slate-200 wark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/20">
                <LineChartIcon className="h-4 w-4 text-blue-600 wark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-900 wark:text-white">Usage Analytics</h3>
            </div>
            <p className="text-sm text-slate-600 wark:text-slate-400">
              Track your usage patterns over time
            </p>
          </div>

          <div className="p-6">
            <div className="h-80">
              {insightsData.usageData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={insightsData.usageData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="name"
                      className="text-xs"
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => [value, "Count"]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="messages"
                      name="Messages Sent"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="api"
                      name="API Calls"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="templates"
                      name="Templates Used"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 wark:bg-slate-800 mx-auto mb-3">
                      <LineChartIcon className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-600 wark:text-slate-400 mb-1">No usage data available</p>
                    <p className="text-sm text-slate-500 wark:text-slate-500">Usage patterns will appear here as you use the platform</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Year-over-Year Comparison */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10">
          <div className="p-6 border-b border-slate-200 wark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/20">
                <BarChart3 className="h-4 w-4 text-green-600 wark:text-green-400" />
              </div>
              <h3 className="font-semibold text-slate-900 wark:text-white">Year-over-Year Comparison</h3>
            </div>
            <p className="text-sm text-slate-600 wark:text-slate-400">
              Compare your current spending with the previous year
            </p>
          </div>

          <div className="p-6">
            <div className="h-80">
              {insightsData.compareData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={insightsData.compareData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="name"
                      className="text-xs"
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="previous"
                      name="Previous Year"
                      fill="#94A3B8"
                      radius={[4, 4, 0, 0]}
                      opacity={0.7}
                    />
                    <Bar
                      dataKey="current"
                      name="Current Year"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 wark:bg-slate-800 mx-auto mb-3">
                      <BarChart3 className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-600 wark:text-slate-400 mb-1">No comparison data available</p>
                    <p className="text-sm text-slate-500 wark:text-slate-500">Year-over-year comparisons will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div id="recommendations" className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 wark:text-white">Optimization Recommendations</h2>
              <p className="text-sm text-slate-600 wark:text-slate-300">
                Personalized suggestions to help you save
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-100 wark:bg-slate-800 px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-600 wark:text-slate-300">
              {insightsData.recommendations.length} recommendations
            </span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10">
          {insightsData.recommendations.length > 0 ? (
            <div className="p-6">
              <div className="space-y-4">
                {insightsData.recommendations.map((recommendation, index) => (
                  <div key={recommendation.id} className={`group/item relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md ${
                    recommendation.type === 'subscription'
                      ? 'bg-gradient-to-br from-white to-blue-50/30 border-blue-200 hover:border-blue-300 wark:from-slate-800/50 wark:to-blue-900/10 wark:border-blue-800 wark:hover:border-blue-700'
                      : recommendation.type === 'usage'
                        ? 'bg-gradient-to-br from-white to-green-50/30 border-green-200 hover:border-green-300 wark:from-slate-800/50 wark:to-green-900/10 wark:border-green-800 wark:hover:border-green-700'
                        : 'bg-gradient-to-br from-white to-yellow-50/30 border-yellow-200 hover:border-yellow-300 wark:from-slate-800/50 wark:to-yellow-900/10 wark:border-yellow-800 wark:hover:border-yellow-700'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl shadow-lg ${
                        recommendation.type === 'subscription'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : recommendation.type === 'usage'
                            ? 'bg-gradient-to-br from-green-500 to-green-600'
                            : 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                      }`}>
                        <Info className="h-5 w-5 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-900 wark:text-white mb-1">
                              {recommendation.title}
                            </h3>
                            <p className="text-sm text-slate-600 wark:text-slate-300 leading-relaxed">
                              {recommendation.description}
                            </p>
                          </div>
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRecommendationIcon(recommendation.type)}`}>
                            {recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-semibold text-green-600 wark:text-green-400">
                              Potential savings: {formatCurrency(recommendation.savings)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleRecommendationAction(recommendation.action)}
                            className={cn(
                              "gap-2 shadow-sm transition-all duration-200 hover:scale-105",
                              recommendation.type === "subscription"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                : recommendation.type === "usage"
                                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                  : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                            )}
                          >
                            <Zap className="h-3 w-3" />
                            {recommendation.actionLabel}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className={`absolute -right-6 -top-6 h-12 w-12 rounded-full transition-all duration-300 group-hover/item:scale-110 ${
                      recommendation.type === 'subscription'
                        ? 'bg-blue-500/10'
                        : recommendation.type === 'usage'
                          ? 'bg-green-500/10'
                          : 'bg-yellow-500/10'
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 wark:bg-slate-800 mx-auto mb-4">
                <Info className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 wark:text-white mb-2">No recommendations available</h3>
              <p className="text-sm text-slate-600 wark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Continue using our services to get personalized optimization recommendations.
              </p>
            </div>
          )}

          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-slate-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>
      </div>
    </div>
  );
}
