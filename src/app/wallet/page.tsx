"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Wallet,
  Plus,
  CreditCard,
  Clock,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/pricing";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Script from "next/script";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Define transaction type
interface Transaction {
  id: string;
  amount: number;
  type: "credit" | "debit" | "refund";
  status: "pending" | "completed" | "failed";
  description: string;
  createdAt: string;
  metadata?: any;
  referenceType?: string;
}

// Define wallet summary type
interface WalletSummary {
  balance: number;
  formattedBalance: string;
  totalDebits: number;
  totalCredits: number;
  pendingAmount: number;
  thisMonth: {
    debits: number;
    credits: number;
  };
}

const WalletPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletSummary, setWalletSummary] = useState<WalletSummary>({
    balance: 0,
    formattedBalance: "₹0.00",
    totalDebits: 0,
    totalCredits: 0,
    pendingAmount: 0,
    thisMonth: {
      debits: 0,
      credits: 0,
    },
  });
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
  const [amount, setAmount] = useState<number>(1000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [transactionType, setTransactionType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const { toast } = useToast();

  // Predefined amounts for quick selection
  const suggestedAmounts = [500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    loadWalletData();
  }, [currentPage, transactionType]);

  // Add this function to reset dialog values
  const resetDialogValues = () => {
    setAmount(1000); // Reset to default amount
    setIsPaymentProcessing(false);
    setPaymentInitiated(false);
  };

  // Update the dialog close handler
  const handleDialogClose = (open: boolean) => {
    if (!open && !isPaymentProcessing) {
      setShowAddFundsDialog(false);
      resetDialogValues();
    }
  };

  const loadWalletData = async () => {
    setIsLoading(true);
    try {
      // Fetch wallet balance and transactions
      const response = await fetch(
        `/api/wallet?page=${currentPage}&limit=10&type=${transactionType}`
      );
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions || []);
        setWalletSummary({
          balance: data.balance,
          formattedBalance: data.formattedBalance,
          totalDebits: data.totalDebits || 0,
          totalCredits: data.totalCredits || 0,
          pendingAmount: data.pendingAmount || 0,
          thisMonth: data.thisMonth || { debits: 0, credits: 0 },
        });
        setTotalPages(data.pagination?.pages || 1);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load wallet data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading wallet data:", error);
      toast({
        title: "Error",
        description: "Failed to load wallet data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter transactions with search query
  const filteredTransactions = transactions.filter((transaction) => {
    return (
      searchQuery === "" ||
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.referenceType?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate GST and total amount
  const calculateGST = (amount: number) => {
    const gst = Math.round(amount * 0.18 * 100) / 100; // 18% GST
    const total = amount + gst;
    return { gst, total };
  };

  // Function to handle adding funds
  const handleAddFunds = async () => {
    if (amount < 100) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount of at least ₹100",
        variant: "destructive",
      });
      return;
    }

    const { gst, total } = calculateGST(amount);

    try {
      setIsPaymentProcessing(true);
      setPaymentInitiated(true);

      // Create order on server
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total * 100, // Razorpay expects amount in smallest currency unit (paise)
          currency: "INR",
          receipt: `wallet-topup-${Date.now()}`,
          notes: {
            purpose: "Wallet Top-up",
            baseAmount: amount,
            gst: gst,
            totalAmount: total,
          },
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.orderId) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // Close the dialog before opening Razorpay
      setShowAddFundsDialog(false);

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: "INR",
        name: "Zaptick - Wallet Recharge",
        description: "Wallet Recharge (including 18% GST)",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment with your server
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: amount, // Base amount to be credited to wallet
                totalAmount: total, // Total amount paid including GST
                gst: gst,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // If verification successful, add funds to wallet
              const walletResponse = await fetch("/api/wallet", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  amount, // Only the base amount is credited to wallet
                  paymentMethod: "Razorpay",
                  paymentId: response.razorpay_payment_id,
                  totalPaid: total,
                  gst: gst,
                }),
              });

              const walletData = await walletResponse.json();

              if (walletData.success) {
                toast({
                  title: "Success",
                  description: `₹${amount.toFixed(2)} has been added to your wallet`,
                });
                resetDialogValues();
                loadWalletData(); // Refresh wallet data
              } else {
                throw new Error(walletData.error || "Failed to add funds to wallet");
              }
            } else {
              throw new Error(verifyData.error || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment process error:", error);
            toast({
              title: "Payment Error",
              description: error instanceof Error ? error.message : "Payment processing failed",
              variant: "destructive",
            });
            // Reopen the dialog on error
            setShowAddFundsDialog(true);
          } finally {
            setIsPaymentProcessing(false);
            setPaymentInitiated(false);
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "",
        },
        theme: {
          color: "#378A4F", // Green primary color
        },
        modal: {
          // Handle Razorpay modal dismissal
          ondismiss: function () {
            setIsPaymentProcessing(false);
            setPaymentInitiated(false);
            // Reopen the dialog when Razorpay modal is dismissed
            setTimeout(() => {
              setShowAddFundsDialog(true);
            }, 100);
          },
          // Set z-index higher than dialog
          backdrop_close: true,
          escape: true,
          confirm_close: true
        }
      };

      // Add a small delay to ensure dialog is closed
      setTimeout(() => {
        // Initialize Razorpay
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      }, 200);

    } catch (error) {
      console.error("Error initiating payment:", error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment",
        variant: "destructive",
      });
      setIsPaymentProcessing(false);
      setPaymentInitiated(false);
      // Keep dialog open on error
      setShowAddFundsDialog(true);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  // Get transaction type badge
  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "credit":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <ArrowUp className="h-3 w-3 mr-1" />
            Credit
          </Badge>
        );
      case "debit":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <ArrowDown className="h-3 w-3 mr-1" />
            Debit
          </Badge>
        );
      case "refund":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <RefreshCw className="h-3 w-3 mr-1" />
            Refund
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 p-6 pb-12">
      {/* Modern Header */}
      <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-primary/5 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 wark:from-muted/40 wark:to-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 wark:text-white">
                Wallet Overview
              </h1>
              <p className="text-slate-600 wark:text-slate-300">
                Manage your account balance and transactions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 wark:bg-slate-800 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600 wark:text-slate-300">Secure payment gateway</span>
            </div>
            <Button
              onClick={() => setShowAddFundsDialog(true)}
              className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              Add Funds
            </Button>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-primary/10 transition-all duration-300 group-hover:scale-110" />
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Balance Card */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 wark:from-muted/40 wark:to-blue-900/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 wark:text-white">Current Balance</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadWalletData}
              className="gap-2 hover:bg-blue-50 wark:hover:bg-blue-900/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-slate-900 wark:text-white mb-2">
                {walletSummary.formattedBalance}
              </div>
              <div className="flex items-center gap-2 text-sm mb-4">
                <span className="text-slate-600 wark:text-slate-400">This month:</span>
                <span className={cn(
                  "font-medium",
                  walletSummary.thisMonth.credits - walletSummary.thisMonth.debits >= 0
                    ? "text-green-600 wark:text-green-400"
                    : "text-red-600 wark:text-red-400"
                )}>
                  {walletSummary.thisMonth.credits - walletSummary.thisMonth.debits >= 0 ? '+' : ''}
                  {formatCurrency(walletSummary.thisMonth.credits - walletSummary.thisMonth.debits)}
                </span>
              </div>
              <Button
                onClick={() => setShowAddFundsDialog(true)}
                className="w-full gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Funds
              </Button>
            </>
          )}

          <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Total Added Card */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-green-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-green-200 wark:from-muted/40 wark:to-green-900/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 wark:text-white">Total Added</h3>
          </div>

          <div className="text-2xl font-bold text-green-600 wark:text-green-400 mb-2">
            {formatCurrency(walletSummary.totalCredits)}
          </div>
          <div className="text-sm text-slate-600 wark:text-slate-400">
            All-time funds added to wallet
          </div>

          <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-green-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Total Spent Card */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-red-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-red-200 wark:from-muted/40 wark:to-red-900/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 wark:text-white">Total Spent</h3>
          </div>

          <div className="text-2xl font-bold text-red-600 wark:text-red-400 mb-2">
            {formatCurrency(walletSummary.totalDebits)}
          </div>
          <div className="text-sm text-slate-600 wark:text-slate-400">
            All-time spending from wallet
          </div>

          <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-red-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 wark:text-white">Transaction History</h2>
              <p className="text-sm text-slate-600 wark:text-slate-300">
                View and filter your past wallet transactions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-100 wark:bg-slate-800 px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-600 wark:text-slate-300">
              {transactions.length} transactions
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search transactions..."
                className="pl-10 bg-white wark:bg-slate-800 border-slate-200 wark:border-slate-700 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="md:w-[200px] bg-white wark:bg-slate-800 border-slate-200 wark:border-slate-700">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="credit">Credits Only</SelectItem>
                <SelectItem value="debit">Debits Only</SelectItem>
                <SelectItem value="refund">Refunds Only</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={loadWalletData}
              className="gap-2 border-slate-200 wark:border-slate-700 hover:border-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-slate-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Transactions Table */}
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-slate-50/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200 wark:from-muted/40 wark:to-slate-900/10">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <p className="font-medium text-slate-900 wark:text-white">Loading transactions...</p>
                <p className="text-sm text-slate-500">Fetching your transaction history</p>
              </div>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50 wark:bg-slate-800/50">
                    <TableRow className="border-slate-200 wark:border-slate-700">
                      <TableHead className="font-semibold text-slate-700 wark:text-slate-300">Description</TableHead>
                      <TableHead className="font-semibold text-slate-700 wark:text-slate-300">Type</TableHead>
                      <TableHead className="font-semibold text-slate-700 wark:text-slate-300">Amount</TableHead>
                      <TableHead className="font-semibold text-slate-700 wark:text-slate-300">Date & Time</TableHead>
                      <TableHead className="font-semibold text-slate-700 wark:text-slate-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="border-slate-200 wark:border-slate-700 hover:bg-slate-50/50 wark:hover:bg-slate-800/50 transition-colors">
                        <TableCell>
                          <div className="font-medium text-slate-900 wark:text-white">{transaction.description}</div>
                          {transaction.referenceType && (
                            <div className="text-xs text-slate-500 wark:text-slate-400 mt-1">
                              Type: {transaction.referenceType}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getTransactionBadge(transaction.type)}
                        </TableCell>
                        <TableCell className={cn(
                          "font-semibold",
                          transaction.type === "credit" || transaction.type === "refund"
                            ? "text-green-600 wark:text-green-400"
                            : "text-red-600 wark:text-red-400"
                        )}>
                          {transaction.type === "credit" || transaction.type === "refund" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900 wark:text-white">
                              {formatDate(transaction.createdAt)}
                            </span>
                            <span className="text-xs text-slate-500 wark:text-slate-400">
                              {formatTime(transaction.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(transaction.status)}
                            <span className="capitalize text-sm font-medium text-slate-700 wark:text-slate-300">
                              {transaction.status}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 wark:border-slate-700 p-4 bg-slate-50/50 wark:bg-slate-800/50">
                  <div className="text-sm text-slate-600 wark:text-slate-400">
                    Showing page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1 || isLoading}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages || isLoading}
                      className="gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 wark:bg-slate-800 mx-auto mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 wark:text-white mb-2">No transactions found</h3>
              <p className="text-sm text-slate-600 wark:text-slate-300 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? `No transactions match your search "${searchQuery}"`
                  : "You don't have any transactions yet. Add funds to get started."}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowAddFundsDialog(true)}
                  className="mt-6 gap-2 bg-gradient-to-r from-primary to-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Funds
                </Button>
              )}
            </div>
          )}

          <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-slate-500/10 transition-all duration-300 group-hover:scale-110" />
        </div>
      </div>

      {/* Add Funds Dialog */}
      <Dialog open={showAddFundsDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 z-50">
          <DialogHeader className="px-6 py-4 border-b border-slate-200 wark:border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900 wark:text-white">
                  Add Funds to Wallet
                </DialogTitle>
                <DialogDescription className="text-slate-600 wark:text-slate-400 mt-1">
                  Enter the amount you want to add to your wallet
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* Amount Input Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <h3 className="text-sm font-semibold text-slate-700 wark:text-slate-300 uppercase tracking-wider">
                    Amount
                  </h3>
                </div>

                <div className="group relative overflow-hidden p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                  <Label htmlFor="amount" className="text-sm font-medium text-primary mb-2 block">
                    Amount (INR)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary font-medium text-lg">
                      ₹
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      min="100"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="pl-8 h-12 text-lg font-semibold bg-white wark:bg-slate-800 border-primary/30 focus:border-primary focus:ring-primary/20"
                      placeholder="Enter amount"
                    />
                  </div>
                  <p className="text-xs text-primary/80 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Minimum amount: ₹100
                  </p>

                  <div className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-primary/20 transition-all duration-300 group-hover:scale-110" />
                </div>
              </div>

              {/* Quick Amounts Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <h3 className="text-sm font-semibold text-slate-700 wark:text-slate-300 uppercase tracking-wider">
                    Quick Amounts
                  </h3>
                </div>

                <div className="group relative overflow-hidden p-4 bg-gradient-to-br from-blue-50/50 to-blue-50/80 wark:from-blue-900/10 wark:to-blue-900/20 rounded-xl border border-blue-200/50 wark:border-blue-800/50">
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 500, 1000, 2000, 5000, 10000].map((amt) => (
                      <Button
                        key={amt}
                        type="button"
                        variant={amount === amt ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAmount(amt)}
                        className={cn(
                          "h-10 transition-all duration-200",
                          amount === amt
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg scale-105 border-blue-600"
                            : "bg-white wark:bg-slate-800 hover:bg-blue-50 wark:hover:bg-blue-900/20 border-blue-300 wark:border-blue-700 text-blue-700 wark:text-blue-400 hover:border-blue-400"
                        )}
                      >
                        ₹{amt.toLocaleString()}
                      </Button>
                    ))}
                  </div>

                  <div className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-blue-500/20 transition-all duration-300 group-hover:scale-110" />
                </div>
              </div>

              {/* GST Calculation Display */}
              {amount >= 100 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <h3 className="text-sm font-semibold text-slate-700 wark:text-slate-300 uppercase tracking-wider">
                      Payment Breakdown
                    </h3>
                  </div>

                  <div className="group relative overflow-hidden p-4 bg-gradient-to-br from-purple-50/50 to-purple-50/80 wark:from-purple-900/10 wark:to-purple-900/20 rounded-xl border border-purple-200/50 wark:border-purple-800/50">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white wark:bg-slate-800 rounded-lg border border-purple-200/50 wark:border-purple-800/50">
                        <span className="text-sm font-medium text-purple-800 wark:text-purple-300 flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Wallet Credit Amount
                        </span>
                        <span className="text-sm font-semibold text-purple-900 wark:text-purple-200">
                          ₹{amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-white wark:bg-slate-800 rounded-lg border border-purple-200/50 wark:border-purple-800/50">
                        <span className="text-sm text-purple-700 wark:text-purple-400 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          GST (18%)
                        </span>
                        <span className="text-sm font-medium text-purple-800 wark:text-purple-300">
                          ₹{calculateGST(amount).gst.toFixed(2)}
                        </span>
                      </div>

                      <div className="h-px bg-purple-200 wark:bg-purple-800 my-2" />

                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-100 to-purple-200 wark:from-purple-900/30 wark:to-purple-900/50 rounded-lg border border-purple-300 wark:border-purple-700">
                        <span className="text-sm font-semibold text-purple-900 wark:text-purple-100 flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          Total Amount to Pay
                        </span>
                        <span className="text-lg font-bold text-purple-900 wark:text-purple-100">
                          ₹{calculateGST(amount).total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-purple-500/20 transition-all duration-300 group-hover:scale-110" />
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <h3 className="text-sm font-semibold text-slate-700 wark:text-slate-300 uppercase tracking-wider">
                    Security Information
                  </h3>
                </div>

                <div className="group relative overflow-hidden p-4 bg-gradient-to-br from-green-50/50 to-green-50/80 wark:from-green-900/10 wark:to-green-900/20 rounded-xl border border-green-200/50 wark:border-green-800/50">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 wark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="h-4 w-4 text-green-600 wark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-green-800 wark:text-green-300 mb-1">
                        Secure Payment Gateway
                      </h4>
                      <p className="text-sm text-green-700 wark:text-green-400 leading-relaxed">
                        Your payment will be processed securely through Razorpay with 256-bit SSL encryption.
                        GST will be collected as per government regulations.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <CheckCircle className="h-3 w-3 text-green-600 wark:text-green-400" />
                        <span className="text-xs text-green-600 wark:text-green-400 font-medium">
                          PCI DSS Compliant
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-green-500/20 transition-all duration-300 group-hover:scale-110" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-200 wark:border-slate-700 flex-shrink-0 bg-slate-50/50 wark:bg-slate-800/50">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-slate-600 wark:text-slate-400">
                <Wallet className="h-4 w-4" />
                <span>
                  {amount >= 100
                    ? `₹${amount.toLocaleString()} will be added to your wallet`
                    : 'Enter amount to continue'
                  }
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                  disabled={isPaymentProcessing}
                  className="hover:bg-slate-100 wark:hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddFunds}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  disabled={amount < 100 || isPaymentProcessing}
                >
                  {isPaymentProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pay ₹{amount >= 100 ? calculateGST(amount).total.toFixed(2) : '0.00'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletPage;
