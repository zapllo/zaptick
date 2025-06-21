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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Sample data for charts
const usageData = [
  { name: "Jan", messages: 1200, api: 3400, templates: 800 },
  { name: "Feb", messages: 1900, api: 2800, templates: 950 },
  { name: "Mar", messages: 2100, api: 3800, templates: 1100 },
  { name: "Apr", messages: 1800, api: 4200, templates: 1000 },
  { name: "May", messages: 2400, api: 4800, templates: 1400 },
  { name: "Jun", messages: 2800, api: 5200, templates: 1600 },
  { name: "Jul", messages: 3200, api: 5800, templates: 1800 },
  { name: "Aug", messages: 3600, api: 6400, templates: 2100 },
  { name: "Sep", messages: 3800, api: 6800, templates: 2300 },
  { name: "Oct", messages: 0, api: 0, templates: 0 },
  { name: "Nov", messages: 0, api: 0, templates: 0 },
  { name: "Dec", messages: 0, api: 0, templates: 0 },
];

const compareData = [
  { name: "Jan", current: 400, previous: 240 },
  { name: "Feb", current: 300, previous: 139 },
  { name: "Mar", current: 500, previous: 980 },
  { name: "Apr", current: 280, previous: 390 },
  { name: "May", current: 590, previous: 480 },
  { name: "Jun", current: 320, previous: 380 },
  { name: "Jul", current: 350, previous: 430 },
  { name: "Aug", current: 420, previous: 380 },
  { name: "Sep", current: 370, previous: 320 },
  { name: "Oct", current: 0, previous: 404 },
  { name: "Nov", current: 0, previous: 390 },
  { name: "Dec", current: 0, previous: 430 },
];

export default function InsightsPage() {
  const [period, setPeriod] = useState("year");

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
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Usage insight tip</AlertTitle>
        <AlertDescription>
          You could save approximately ₹120 per month by upgrading to our annual
          subscription plan. <a href="#" className="font-medium underline">Learn more</a>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Monthly Spend</CardDescription>
            <CardTitle className="text-2xl">₹350.00</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <span className="text-green-600 dark:text-green-400 font-medium mr-1">
                -12.5%
              </span>
              compared to previous period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Projected Annual Cost</CardDescription>
            <CardTitle className="text-2xl">₹4,200.00</CardTitle>
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
              ₹850.00
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              By optimizing your subscription plan
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={usageData}
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
                <Tooltip formatter={(value) => [`₹{value}`, "Count"]} />
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={compareData}
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
                <Tooltip formatter={(value) => [`₹₹{value}`, "Amount"]} />
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
          <CardDescription>
            Personalized suggestions to help you save
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 p-2 rounded-full">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">
                  Switch to annual billing
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Switching to our annual plan would save you approximately
                  ₹320 per year based on your current usage.
                </p>
                <Button size="sm">Upgrade Plan</Button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 p-2 rounded-full">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">
                  Optimize template usage
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  You&apos;re currently using many one-time templates. Creating
                  reusable templates could save you approximately ₹90 per
                  month.
                </p>
                <Button size="sm" variant="outline">
                  Learn More
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 p-2 rounded-full">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">
                  Optimize API calls
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Consider batching your API calls to reduce the total number
                  of requests. This could save you approximately ₹65 per
                  month.
                </p>
                <Button size="sm" variant="outline">
                  View API Documentation
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
