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
import { AlertCircle, Download, Info, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
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
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "usage":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "optimization":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">View Insights</h1>
          <p className="text-muted-foreground">
            Analyze your usage patterns and optimize spending
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={exportInsights}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {insightsData.metrics.potentialSavings > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Usage insight tip</AlertTitle>
          <AlertDescription>
            You could save approximately {formatCurrency(insightsData.metrics.potentialSavings)} per month by following our optimization recommendations.{' '}
            <button 
              onClick={() => document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' })}
              className="font-medium underline"
            >
              See recommendations
            </button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Monthly Spend</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(insightsData.metrics.avgMonthlySpend)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              {insightsData.metrics.spendChange >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              )}
              <span className={insightsData.metrics.spendChange >= 0 ? "text-red-500" : "text-green-500"}>
                {insightsData.metrics.spendChange >= 0 ? '+' : ''}{insightsData.metrics.spendChange.toFixed(1)}%
              </span>
              <span className="ml-1">compared to previous period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Projected Annual Cost</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(insightsData.metrics.projectedAnnualCost)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              Based on current usage patterns
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Potential Savings</CardDescription>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              {formatCurrency(insightsData.metrics.potentialSavings)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              By optimizing your usage and subscription
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Analytics</CardTitle>
          <CardDescription>
            Track your usage patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, "Count"]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="messages"
                    name="Messages Sent"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="api"
                    name="API Calls"
                    stroke="#82ca9d"
                  />
                  <Line
                    type="monotone"
                    dataKey="templates"
                    name="Templates Used"
                    stroke="#ffc658"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No usage data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Year-over-Year Comparison</CardTitle>
          <CardDescription>
            Compare your current spending with the previous year
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
                  <Legend />
                  <Bar
                    dataKey="previous"
                    name="Previous Year"
                    fill="#8884d8"
                    opacity={0.6}
                  />
                  <Bar dataKey="current" name="Current Year" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No comparison data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card id="recommendations">
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
          <CardDescription>
            Personalized suggestions to help you save
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insightsData.recommendations.length > 0 ? (
            <div className="space-y-4">
              {insightsData.recommendations.map((recommendation) => (
                <div key={recommendation.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className={`p-2 rounded-full ${getRecommendationIcon(recommendation.type)}`}>
                    <Info className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">
                      {recommendation.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {recommendation.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        Potential savings: {formatCurrency(recommendation.savings)}
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => handleRecommendationAction(recommendation.action)}
                        variant={recommendation.type === "subscription" ? "default" : "outline"}
                      >
                        {recommendation.actionLabel}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">No recommendations available</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Continue using our services to get personalized optimization recommendations.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}