'use client';

import { useEffect, useState } from "react";
import { calculateMessagePrice, formatCurrency } from "@/lib/pricing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface CostEstimatorProps {
  audienceCount: number;
  templateCategory?: string;
  templateId?: string;
  companyBalance?: number;
}

export function CostEstimator({
  audienceCount,
  templateCategory = "MARKETING",
  templateId,
  companyBalance
}: CostEstimatorProps) {
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | undefined>(companyBalance);
  const [estimatedCost, setEstimatedCost] = useState<{
    perMessage: number;
    total: number;
    breakdown: {
      basePrice: number;
      gst: number;
      markup: number;
    };
  }>({
    perMessage: 0,
    total: 0,
    breakdown: {
      basePrice: 0,
      gst: 0,
      markup: 0
    }
  });

  // Get wallet balance if not provided
  useEffect(() => {
    if (companyBalance === undefined) {
      const fetchWalletBalance = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/wallet/balance');
          const data = await response.json();

          if (data.success) {
            setWalletBalance(data.walletBalance);
          }
        } catch (error) {
          console.error('Error fetching wallet balance:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchWalletBalance();
    }
  }, [companyBalance]);

  // Calculate cost whenever audience or template changes
  useEffect(() => {
    if (!templateCategory) return;

    const pricing = calculateMessagePrice(templateCategory);

    setEstimatedCost({
      perMessage: pricing.totalPrice,
      total: pricing.totalPrice * audienceCount,
      breakdown: {
        basePrice: pricing.basePrice,
        gst: pricing.gstPrice,
        markup: pricing.markupPrice
      }
    });
  }, [audienceCount, templateCategory]);

  // Check if balance is sufficient
  const isBalanceSufficient = walletBalance !== undefined && walletBalance >= estimatedCost.total;

  // Calculate percentage of wallet that will be used
  const usagePercentage = walletBalance && walletBalance > 0
    ? Math.min((estimatedCost.total / walletBalance) * 100, 100)
    : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center">
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span>Loading cost information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Estimated Campaign Cost
          {templateId && (
            <Badge variant="outline" className="ml-2 text-xs font-normal">
              {templateCategory?.toLowerCase()}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Based on your selected audience and message template
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {!templateId && (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Select a template</AlertTitle>
              <AlertDescription>
                Select a message template to see accurate pricing
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Cost per message</div>
              <div className="font-semibold">{formatCurrency(estimatedCost.perMessage)}</div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Total audience</div>
              <div className="font-semibold">{audienceCount} contacts</div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Total cost</span>
              <span className="text-lg font-semibold">{formatCurrency(estimatedCost.total)}</span>
            </div>

            <div className="text-xs text-muted-foreground">
              Includes GST ({formatCurrency(estimatedCost.breakdown.gst * audienceCount)})
            </div>
          </div>

          {walletBalance !== undefined && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Wallet balance</span>
                <span className="font-medium">{formatCurrency(walletBalance)}</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Campaign cost</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(estimatedCost.total)}
                    ({usagePercentage.toFixed(0)}% of balance)
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
              </div>

              {!isBalanceSufficient && (
                <Alert variant="destructive" className="mt-3">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertTitle>Insufficient balance</AlertTitle>
                  <AlertDescription>
                    You need {formatCurrency(estimatedCost.total - (walletBalance || 0))} more to launch this campaign
                  </AlertDescription>
                </Alert>
              )}

              {isBalanceSufficient && (
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  <span>Sufficient balance to launch</span>
                </div>
              )}
            </div>
          )}

          {walletBalance === undefined && (
            <Button variant="outline" className="w-full mt-2" onClick={() => window.location.href = '/wallet'}>
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Add Funds to Wallet
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
