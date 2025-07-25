// src/app/wallet/page.tsx
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

    <div className=" p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Wallet</h1>
          <p className="text-muted-foreground">Manage your account balance and transactions</p>
        </div>
        <Button onClick={() => setShowAddFundsDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Funds
        </Button>
      </div>

      {/* Wallet Balance Card */}
      <div className="grid grid-cols-1  gap-6 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Wallet Balance</CardTitle>
            <CardDescription>Current available funds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="h-20 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {walletSummary.formattedBalance}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">This month</span>
                  <span>
                    {formatCurrency(walletSummary.thisMonth.credits - walletSummary.thisMonth.debits)}
                  </span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1 text-green-600" />
                      Total Added
                    </span>
                    <span className="text-green-600">
                      {formatCurrency(walletSummary.totalCredits)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <ArrowDown className="h-3 w-3 mr-1 text-red-600" />
                      Total Spent
                    </span>
                    <span className="text-red-600">
                      {formatCurrency(walletSummary.totalDebits)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAddFundsDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
          </CardFooter>
        </Card>


      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Transaction History</h2>
            <p className="text-muted-foreground">
              View and filter your past wallet transactions
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-10 w-full md:w-[220px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select
              value={transactionType}
              onValueChange={setTransactionType}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="credit">Credits Only</SelectItem>
                <SelectItem value="debit">Debits Only</SelectItem>
                <SelectItem value="refund">Refunds Only</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadWalletData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-60">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading transaction history...</p>
                </div>
              </div>
            ) : filteredTransactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.referenceType && `Type: ${transaction.referenceType}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTransactionBadge(transaction.type)}
                      </TableCell>
                      <TableCell className={
                        transaction.type === "credit" || transaction.type === "refund"
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }>
                        {transaction.type === "credit" || transaction.type === "refund" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{formatDate(transaction.createdAt)}</span>
                          <span className="text-xs text-muted-foreground">{formatTime(transaction.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(transaction.status)}
                          <span className="capitalize text-sm">{transaction.status}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-1">No transactions found</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {searchQuery
                    ? `No transactions match your search "${searchQuery}"`
                    : "You don't have any transactions yet. Add funds to get started."}
                </p>
              </div>
            )}
          </CardContent>
          {transactions.length > 0 && (
            <CardFooter className="flex items-center justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>


      {/* Add Funds Dialog */}
      <Dialog open={showAddFundsDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 z-50">
          <DialogHeader className="px-6 py-4 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  Add Funds to Wallet
                </DialogTitle>
                <DialogDescription className="text-slate-600 mt-1">
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
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Amount
                  </h3>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <Label htmlFor="amount" className="text-sm font-medium text-green-800 mb-2 block">
                    Amount (INR)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600 font-medium text-lg">
                      ₹
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      min="100"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="pl-8 h-12 text-lg font-semibold bg-white border-green-300 focus:border-green-500 focus:ring-green-500/20"
                      placeholder="Enter amount"
                    />
                  </div>
                  <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Minimum amount: ₹100
                  </p>
                </div>
              </div>

              {/* Quick Amounts Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Quick Amounts
                  </h3>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
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
                            : "bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:border-blue-400"
                        )}
                      >
                        ₹{amt.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* GST Calculation Display */}
              {amount >= 100 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      Payment Breakdown
                    </h3>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-purple-200">
                        <span className="text-sm font-medium text-purple-800 flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Wallet Credit Amount
                        </span>
                        <span className="text-sm font-semibold text-purple-900">
                          ₹{amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-purple-200">
                        <span className="text-sm text-purple-700 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          GST (18%)
                        </span>
                        <span className="text-sm font-medium text-purple-800">
                          ₹{calculateGST(amount).gst.toFixed(2)}
                        </span>
                      </div>

                      <div className="h-px bg-purple-200 my-2" />

                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg border border-purple-300">
                        <span className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          Total Amount to Pay
                        </span>
                        <span className="text-lg font-bold text-purple-900">
                          ₹{calculateGST(amount).total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Security Information
                  </h3>
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CreditCard className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-800 mb-1">
                        Secure Payment Gateway
                      </h4>
                      <p className="text-sm text-emerald-700 leading-relaxed">
                        Your payment will be processed securely through Razorpay with 256-bit SSL encryption.
                        GST will be collected as per government regulations.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                        <span className="text-xs text-emerald-600 font-medium">
                          PCI DSS Compliant
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-slate-500">
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
                  className="hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddFunds}
                  className="gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
