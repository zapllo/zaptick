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
import { CalendarIcon, DownloadIcon, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/pricing";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

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
    // Create CSV content
    const csvContent = [
      ["Category", "Description", "Date", "Amount"].join(","),
      ...expenseData.transactions.map(tx => [
        tx.category,
        tx.description,
        formatDate(tx.date),
        tx.amount.toString()
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate category stats
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading expense data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Track Expenses</h1>
          <p className="text-muted-foreground">
            Monitor and analyze your spending patterns
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
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
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
          <Button variant="outline" size="icon" onClick={exportData}>
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spend</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(expenseData.totalExpenses)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              {expenseData.changePercentage >= 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
              <p className={`text-xs ${expenseData.changePercentage >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {expenseData.changePercentage >= 0 ? '+' : ''}{expenseData.changePercentage}% from last {period}
              </p>
            </div>
          </CardContent>
        </Card>

        {topCategories.map((category, index) => (
          <Card key={category.name}>
            <CardHeader className="pb-2">
              <CardDescription>{category.name}</CardDescription>
              <CardTitle className="text-2xl">
                {formatCurrency(category.amount)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {category.percentage}% of total expenses
              </p>
            </CardContent>
          </Card>
        ))}

        {/* Fill remaining slots with empty cards if less than 3 categories */}
        {Array.from({ length: Math.max(0, 3 - topCategories.length) }).map((_, index) => (
          <Card key={`empty-${index}`}>
            <CardHeader className="pb-2">
              <CardDescription>No Data</CardDescription>
              <CardTitle className="text-2xl">₹0.00</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                0% of total expenses
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
            <CardDescription>
              Your spending patterns throughout the year
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No expense data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>
              Distribution of expenses by category
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {expenseData.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {expenseData.categoryBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No expense data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Detailed breakdown of recent expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenseData.transactions.length > 0 ? (
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {expenseData.transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">No expenses found</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                No expense transactions found for the selected period and category.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}