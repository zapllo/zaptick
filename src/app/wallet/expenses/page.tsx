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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  DownloadIcon,
  Loader2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Receipt,
  Filter,
  Sparkles,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F97316"];

interface ExpenseData {
  totalExpenses: number;
  changePercentage: number;
  categoryBreakdown: { name: string; value: number }[];
  monthlyExpenses: { name: string; amount: number }[];
  transactions: {
    id: string;
    category: string;
    description: string;
    date: string;
    amount: number;
    referenceType: string;
  }[];
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function ExpensesPage() {
  const [period, setPeriod] = useState("year");
  const [category, setCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [expenseData, setExpenseData] = useState<ExpenseData>({
    totalExpenses: 0,
    changePercentage: 0,
    categoryBreakdown: [],
    monthlyExpenses: [],
    transactions: [],
    period: "year",
    dateRange: { start: "", end: "" }
  });
  const { toast } = useToast();

  useEffect(() => {
    loadExpenseData();
  }, [period, category]);

  const loadExpenseData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/wallet/expenses?period=${period}&category=${category}`);
      const result = await response.json();

      if (result.success) {
        setExpenseData(result.data);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load expense data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading expense data:", error);
      toast({
        title: "Error",
        description: "Failed to load expense data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const exportData = () => {
    const csvContent = [
      ["Category", "Description", "Date", "Amount"].join(","),
      ...expenseData.transactions.map(tx => [
        tx.category,
        tx.description,
        formatDate(tx.date),
        tx.amount.toString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryStats = () => {
    const topCategories = expenseData.categoryBreakdown
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    return topCategories.map(category => ({
      name: category.name,
      amount: category.value,
      percentage: expenseData.totalExpenses > 0
        ? ((category.value / expenseData.totalExpenses) * 100).toFixed(0)
        : "0"
    }));
  };

  const topCategories = getCategoryStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="font-medium text-slate-900 wark:text-white">Loading expense data...</p>
          <p className="text-sm text-slate-500">Analyzing your spending patterns</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 pb-12">
      {/* Modern Header */}
      <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 wark:from-muted/40 wark:to-blue-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 wark:text-white">
                Track Expenses
              </h1>
              <p className="text-slate-600 wark:text-slate-300">
                Monitor and analyze your spending patterns
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 wark:bg-slate-800 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600 wark:text-slate-300">
                {expenseData.transactions.length} transactions
              </span>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
      </div>

      {/* Filters */}
      <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-600 wark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 wark:text-slate-300">Filter & Export</span>
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

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px] bg-white wark:bg-slate-800 border-slate-200 wark:border-slate-700">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="campaign">Campaign Messages</SelectItem>
                <SelectItem value="message">WhatsApp API</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="other">Other Services</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={exportData}
              className="border-slate-200 wark:border-slate-700 hover:border-primary hover:bg-primary/5"
            >
              <DownloadIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-slate-500/10 transition-all duration-300 group-hover:scale-110" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Spend Card */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-red-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-red-200 wark:from-muted/40 wark:to-red-900/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-600 wark:text-slate-400">Total Spend</p>
              <p className="text-2xl font-bold text-slate-900 wark:text-white">
                {formatCurrency(expenseData.totalExpenses)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {expenseData.changePercentage >= 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
            <p className={cn(
              "text-xs font-medium",
              expenseData.changePercentage >= 0 ? 'text-red-500' : 'text-green-500'
            )}>
              {expenseData.changePercentage >= 0 ? '+' : ''}{expenseData.changePercentage}% from last {period}
            </p>
          </div>

          <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-red-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Top Categories */}
        {topCategories.map((category, index) => (
          <div key={category.name} className={`group relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md ${
            index === 0
              ? 'bg-gradient-to-br from-white to-blue-50/30 hover:border-blue-200 wark:from-muted/40 wark:to-blue-900/10'
              : index === 1
                ? 'bg-gradient-to-br from-white to-green-50/30 hover:border-green-200 wark:from-muted/40 wark:to-green-900/10'
                : 'bg-gradient-to-br from-white to-purple-50/30 hover:border-purple-200 wark:from-muted/40 wark:to-purple-900/10'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-lg ${
                index === 0
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : index === 1
                    ? 'bg-gradient-to-br from-green-500 to-green-600'
                    : 'bg-gradient-to-br from-purple-500 to-purple-600'
              }`}>
                {index === 0 && <Star className="h-5 w-5 text-white" />}
                {index === 1 && <TrendingUp className="h-5 w-5 text-white" />}
                {index === 2 && <BarChart3 className="h-5 w-5 text-white" />}
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-600 wark:text-slate-400">{category.name}</p>
                <p className="text-2xl font-bold text-slate-900 wark:text-white">
                  {formatCurrency(category.amount)}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 wark:text-slate-400">
              {category.percentage}% of total expenses
            </p>

            <div className={`absolute -right-6 -top-6 h-12 w-12 rounded-full transition-all duration-300 group-hover:scale-110 ${
              index === 0
                ? 'bg-blue-500/10'
                : index === 1
                  ? 'bg-green-500/10'
                  : 'bg-purple-500/10'
            }`} />
          </div>
        ))}

        {/* Fill remaining slots if less than 3 categories */}
        {Array.from({ length: Math.max(0, 3 - topCategories.length) }).map((_, index) => (
          <div key={`empty-${index}`} className="group relative overflow-hidden rounded-xl border-2 border-dashed border-slate-200 wark:border-slate-700 p-6 bg-white wark:bg-muted/40 transition-all duration-300 hover:border-slate-300 wark:hover:border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 wark:bg-slate-800">
                <BarChart3 className="h-5 w-5 text-slate-400" />
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 wark:text-slate-400">No Data</p>
                <p className="text-2xl font-bold text-slate-400">₹0.00</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 wark:text-slate-400">
              0% of total expenses
            </p>
          </div>
        ))}
      </div>
      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Expenses Chart */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10">
          <div className="p-6 border-b border-slate-200 wark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/20">
                <BarChart3 className="h-4 w-4 text-blue-600 wark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-900 wark:text-white">Monthly Expenses</h3>
            </div>
            <p className="text-sm text-slate-600 wark:text-slate-400">
              Your spending patterns throughout the year
            </p>
          </div>

          <div className="p-6">
            <div className="h-80">
              {expenseData.monthlyExpenses.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={expenseData.monthlyExpenses}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
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
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#3B82F6"
                      fill="url(#colorGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 wark:bg-slate-800 mx-auto mb-3">
                      <BarChart3 className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-600 wark:text-slate-400 mb-1">No expense data available</p>
                    <p className="text-sm text-slate-500 wark:text-slate-500">Start making transactions to see your spending trends</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Expense Breakdown Pie Chart */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10">
          <div className="p-6 border-b border-slate-200 wark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/20">
                <PieChartIcon className="h-4 w-4 text-purple-600 wark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-slate-900 wark:text-white">Expense Breakdown</h3>
            </div>
            <p className="text-sm text-slate-600 wark:text-slate-400">
              Distribution of expenses by category
            </p>
          </div>

          <div className="p-6">
            <div className="h-80">
              {expenseData.categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      labelStyle={{ fontSize: 12, fontWeight: 500 }}
                    >
                      {expenseData.categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
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
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 wark:bg-slate-800 mx-auto mb-3">
                      <PieChartIcon className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-600 wark:text-slate-400 mb-1">No expense data available</p>
                    <p className="text-sm text-slate-500 wark:text-slate-500">Transaction categories will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-purple-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 wark:text-white">Recent Transactions</h2>
              <p className="text-sm text-slate-600 wark:text-slate-300">
                Detailed breakdown of recent expenses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-100 wark:bg-slate-800 px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-600 wark:text-slate-300">
              {expenseData.transactions.length} recent transactions
            </span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10">
          {expenseData.transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 wark:divide-slate-700">
                <thead className="bg-slate-50/50 wark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 wark:text-slate-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 wark:text-slate-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 wark:text-slate-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 wark:text-slate-300 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white wark:bg-muted/40 divide-y divide-slate-200 wark:divide-slate-700">
                  {expenseData.transactions.map((transaction, index) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-slate-50/50 wark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          transaction.category === 'Campaign Messages'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 wark:bg-blue-900/30 wark:text-blue-400 wark:border-blue-700'
                            : transaction.category === 'WhatsApp API'
                              ? 'bg-green-50 text-green-700 border-green-200 wark:bg-green-900/30 wark:text-green-400 wark:border-green-700'
                              : transaction.category === 'Subscription'
                                ? 'bg-purple-50 text-purple-700 border-purple-200 wark:bg-purple-900/30 wark:text-purple-400 wark:border-purple-700'
                                : 'bg-slate-50 text-slate-700 border-slate-200 wark:bg-slate-800 wark:text-slate-300 wark:border-slate-700'
                        }`}>
                          {transaction.category}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900 wark:text-white">
                          {transaction.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600 wark:text-slate-400">
                          {formatDate(transaction.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-red-600 wark:text-red-400">
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 wark:bg-slate-800 mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 wark:text-white mb-2">No expenses found</h3>
              <p className="text-sm text-slate-600 wark:text-slate-300 max-w-md mx-auto leading-relaxed">
                No expense transactions found for the selected period and category.
              </p>
            </div>
          )}

          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-slate-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>
      </div>
    </div>
  );
}
