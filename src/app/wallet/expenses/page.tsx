"use client";

import { useState } from "react";
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
import { CalendarIcon, DownloadIcon, FilterIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample data for charts
const monthlyExpenses = [
  { name: "Jan", amount: 400 },
  { name: "Feb", amount: 300 },
  { name: "Mar", amount: 500 },
  { name: "Apr", amount: 280 },
  { name: "May", amount: 590 },
  { name: "Jun", amount: 320 },
  { name: "Jul", amount: 350 },
  { name: "Aug", amount: 420 },
  { name: "Sep", amount: 370 },
  { name: "Oct", amount: 310 },
  { name: "Nov", amount: 0 },
  { name: "Dec", amount: 0 },
];

const categoryData = [
  { name: "WhatsApp API", value: 420 },
  { name: "Template Messages", value: 180 },
  { name: "Subscription", value: 250 },
  { name: "Additional Services", value: 120 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function ExpensesPage() {
  const [period, setPeriod] = useState("year");

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
          <Select
            value={period}
            onValueChange={setPeriod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <CalendarIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spend</CardDescription>
            <CardTitle className="text-2xl">₹970.00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>API Usage</CardDescription>
            <CardTitle className="text-2xl">₹420.00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              43% of total expenses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Template Messages</CardDescription>
            <CardTitle className="text-2xl">₹180.00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              19% of total expenses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Subscription</CardDescription>
            <CardTitle className="text-2xl">₹250.00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              26% of total expenses
            </p>
          </CardContent>
        </Card>
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyExpenses}
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
                  formatter={(value) => [`₹₹{value}`, "Amount"]}
                  labelFormatter={(label) => `Month: ₹{label}`}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
              </AreaChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `₹{name}: ₹{(percent * 100).toFixed(0)}%`
                  }
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-₹{index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  formatter={(value) => [`₹₹{value}`, "Amount"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Summary</CardTitle>
          <CardDescription>
            Detailed breakdown of all expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border">
                      WhatsApp API
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Monthly API usage fees
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Sep 25, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    ₹120.00
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border">
                      Template Messages
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Template message fees
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Sep 20, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    ₹85.00
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border">
                      Subscription
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Monthly subscription payment
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Sep 15, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    ₹250.00
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border">
                      Additional Services
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Custom integration setup
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Sep 10, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    ₹120.00
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border">
                      WhatsApp API
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Additional API calls
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Sep 5, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    ₹95.00
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border">
                      Template Messages
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Promotional campaign
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Sep 1, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    ₹300.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
