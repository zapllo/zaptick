import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Company from "@/models/Company";
import Campaign from "@/models/Campaign";
import WalletTransaction from "@/models/WalletTransaction";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const company = await Company.findById(user.companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Await the params before using them
    const resolvedParams = await params;

    // Find the campaign
    const campaign = await Campaign.findOne({
      _id: resolvedParams.id,
      userId: decoded.id,
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Check if campaign can be cancelled
    const now = new Date();
    const campaignAge = now.getTime() - campaign.createdAt.getTime();
    const isInGracePeriod = campaignAge < 60000 && 
                           campaign.status === 'active' &&
                           (!campaign.stats?.processStartedAt);

    if (!isInGracePeriod && campaign.status === 'active' && campaign.stats?.sent > 0) {
      return NextResponse.json({
        error: "Cannot cancel campaign",
        reason: "Campaign has already started sending messages and is past the 60-second grace period"
      }, { status: 400 });
    }

    if (campaign.status !== 'active' && campaign.status !== 'scheduled') {
      return NextResponse.json({
        error: "Cannot cancel campaign",
        reason: `Campaign is already ${campaign.status}`
      }, { status: 400 });
    }

    // Calculate refund amount
    let refundAmount = 0;
    if (campaign.pricing?.totalCost) {
      // If no messages were sent, refund the full amount
      if (!campaign.stats?.sent || campaign.stats.sent === 0) {
        refundAmount = campaign.pricing.totalCost;
      } else {
        // Partial refund for unsent messages
        const messagesSent = campaign.stats.sent;
        const totalMessages = campaign.stats.total || campaign.audience.count;
        const unsentMessages = Math.max(0, totalMessages - messagesSent);
        const pricePerMessage = campaign.pricing.messagePrice || 0;
        refundAmount = unsentMessages * pricePerMessage;
      }
    }

    // Update campaign status to cancelled
    await Campaign.findByIdAndUpdate(campaign._id, {
      status: 'cancelled',
      'stats.processing': false,
      'stats.cancelledAt': now,
      'stats.cancelReason': 'User cancelled',
    });

    // Process refund if applicable
    if (refundAmount > 0) {
      // Add refund to company wallet
      company.walletBalance += refundAmount;
      await company.save();

      // Record the refund transaction - using your model's structure
      const refundTransaction = new WalletTransaction({
        companyId: company._id,
        amount: refundAmount,
        type: "credit", // Use credit instead of refund for type
        status: "completed",
        description: `Campaign cancellation refund: ${campaign.name}`,
        reference: `campaign-cancel-${campaign._id}`, // Use reference field
        referenceType: "campaign", // Use campaign since it's campaign-related
        referenceId: campaign._id,
        metadata: {
          campaignId: campaign._id,
          originalAmount: campaign.pricing?.totalCost || 0,
          messagesSent: campaign.stats?.sent || 0,
          refundReason: 'Campaign cancelled by user',
          transactionType: 'campaign_refund' // Store the specific type in metadata
        }
      });
      await refundTransaction.save();
    }

    return NextResponse.json({
      success: true,
      message: "Campaign cancelled successfully",
      campaign: {
        id: campaign._id,
        name: campaign.name,
        status: 'cancelled',
        cancelledAt: now
      },
      refund: {
        amount: refundAmount,
        newWalletBalance: company.walletBalance,
        currency: company.currency || "INR"
      }
    });

  } catch (error) {
    console.error("Campaign cancellation error:", error);
    return NextResponse.json(
      {
        error: "Failed to cancel campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}