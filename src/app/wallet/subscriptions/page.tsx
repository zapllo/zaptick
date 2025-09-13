"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CreditCard,
  Clock,
  Package,
  RefreshCw,
  Settings,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample subscription plans
const plans = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for small businesses just getting started",
    price: 49,
    features: [
      "5,000 messages per month",
      "Basic WhatsApp templates",
      "Standard support",
      "1 WABA account",
      "Basic analytics",
    ],
    current: false,
  },
  {
    id: "pro",
    name: "Professional",
    description: "For growing businesses with more advanced needs",
    price: 99,
    features: [
      "15,000 messages per month",
      "Advanced WhatsApp templates",
      "Priority support",
      "3 WABA accounts",
      "Advanced analytics",
      "Custom integrations",
    ],
    current: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with custom requirements",
    price: 249,
    features: [
      "50,000 messages per month",
      "Unlimited WhatsApp templates",
      "24/7 dedicated support",
      "Unlimited WABA accounts",
      "Enterprise analytics",
      "Custom integrations",
      "Dedicated account manager",
      "Service level agreement",
    ],
    current: false,
  },
];

// Sample subscription add-ons
const addons = [
  {
    id: "addon-1",
    name: "Additional Messages",
    description: "5,000 additional messages per month",
    price: 20,
    active: true,
  },
  {
    id: "addon-2",
    name: "Advanced Analytics",
    description: "Detailed insights and reporting",
    price: 15,
    active: false,
  },
  {
    id: "addon-3",
    name: "Additional WABA",
    description: "Add another WhatsApp Business Account",
    price: 30,
    active: false,
  },
];

export default function SubscriptionsPage() {
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Get current plan
  const currentPlan = plans.find((plan) => plan.current);

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setIsUpgradeDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Manage Subscriptions
          </h1>
          <p className="text-muted-foreground">
            View and manage your subscription plans and add-ons
          </p>
        </div>
      </div>

      {currentPlan && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Current Plan</CardTitle>
                <CardDescription>
                  Your active subscription details
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 wark:bg-green-900/30 wark:text-green-400 wark:hover:bg-green-900/40">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold">{currentPlan.name} Plan</h3>
                <p className="text-muted-foreground">{currentPlan.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="font-normal">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    Monthly
                  </Badge>
                  <Badge variant="outline" className="font-normal">
                    <CreditCard className="h-3 w-3 mr-1" />
                    Auto-renews Nov 15, 2023
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${currentPlan.price}/mo</p>
                <p className="text-sm text-muted-foreground">
                  Next billing date: Nov 15, 2023
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Messages Used</span>
                  <span>7,560 / 15,000</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {currentPlan.features.map((feature, i) => (
                  <Badge key={i} variant="secondary" className="font-normal">
                    <Check className="h-3 w-3 mr-1" />
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-6">
            <div>
              <Dialog
                open={isConfirmCancelOpen}
                onOpenChange={setIsConfirmCancelOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Cancel Subscription</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Subscription?</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel your subscription? You&apos;ll
                      lose access to all premium features at the end of your
                      current billing period.
                    </DialogDescription>
                  </DialogHeader>
                  <Alert className="bg-amber-50 border-amber-200 wark:bg-amber-900/30 wark:border-amber-800 mt-4">
                    <AlertCircle className="h-4 w-4 text-amber-600 wark:text-amber-400" />
                    <AlertTitle className="text-amber-800 wark:text-amber-400">
                      Important Information
                    </AlertTitle>
                    <AlertDescription className="text-amber-700 wark:text-amber-300">
                      Your plan will remain active until November 15, 2023. No
                      refunds will be issued for the current billing cycle.
                    </AlertDescription>
                  </Alert>
                  <DialogFooter className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsConfirmCancelOpen(false)}
                    >
                      Keep Subscription
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setIsConfirmCancelOpen(false)}
                    >
                      Cancel Subscription
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Manage Plan
              </Button>
              <Button className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Upgrade
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(plan.current && "border-primary bg-primary/5")}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">${plan.price}/mo</div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-1 text-green-600 wark:text-green-400" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.current ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant={plan.id === "enterprise" ? "default" : "outline"}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {plan.id === "enterprise" ? "Upgrade" : "Switch to Plan"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add-ons</CardTitle>
          <CardDescription>
            Enhance your subscription with additional features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {addons.map((addon) => (
              <div
                key={addon.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg"
              >
                <div className="mb-4 sm:mb-0">
                  <h3 className="font-medium">{addon.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {addon.description}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">${addon.price}/mo</p>
                  <Button
                    variant={addon.active ? "outline" : "default"}
                    size="sm"
                  >
                    {addon.active ? "Remove" : "Add"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Recent payments for your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Oct 15, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Professional Plan - Monthly
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    $99.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-200 wark:bg-green-900/30 wark:text-green-400 wark:border-green-900"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Sep 15, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Professional Plan - Monthly
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    $99.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-200 wark:bg-green-900/30 wark:text-green-400 wark:border-green-900"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Aug 15, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    Basic Plan - Monthly
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    $49.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-200 wark:bg-green-900/30 wark:text-green-400 wark:border-green-900"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Plan Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              Review the details of your plan change
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="font-medium">Professional Plan</p>
                <p className="text-sm">$99.00/month</p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">New Plan</p>
                <p className="font-medium">Enterprise Plan</p>
                <p className="text-sm">$249.00/month</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h4 className="font-medium">Billing Changes</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Prorated Credit (Current Plan)</span>
                  <span>-$65.34</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>New Plan (Remaining Days)</span>
                  <span>$165.67</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total charged today</span>
                  <span>$100.33</span>
                </div>
              </div>

              <Alert className="bg-muted mt-4">
                <Clock className="h-4 w-4" />
                <AlertTitle>Billing Cycle</AlertTitle>
                <AlertDescription>
                  Your billing date will remain on the 15th of each month. The next
                  full charge of $249.00 will occur on November 15, 2023.
                </AlertDescription>
              </Alert>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpgradeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsUpgradeDialogOpen(false)}>
              Confirm Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
