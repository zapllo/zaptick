import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Campaign from "@/models/Campaign";

export async function PATCH(
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

    // Await the params before using them
    const resolvedParams = await params;
    const { status } = await req.json();

    // Validate status
    const validStatuses = ['active', 'paused'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'active' or 'paused'" },
        { status: 400 }
      );
    }

    // Find the campaign
    const campaign = await Campaign.findOne({
      _id: resolvedParams.id,
      userId: decoded.id,
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Check if status change is valid
    const currentStatus = campaign.status;
    
    // Validate status transitions
    if (status === 'paused') {
      if (currentStatus !== 'active') {
        return NextResponse.json({
          error: "Cannot pause campaign",
          reason: `Campaign must be active to pause. Current status: ${currentStatus}`
        }, { status: 400 });
      }

      // Check if campaign is in grace period
      const now = new Date();
      const campaignAge = now.getTime() - campaign.createdAt.getTime();
      const isInGracePeriod = campaignAge < 60000 && !campaign.stats?.processStartedAt;

      if (isInGracePeriod) {
        return NextResponse.json({
          error: "Cannot pause campaign in grace period",
          reason: "Campaign hasn't started sending messages yet. Use cancel instead."
        }, { status: 400 });
      }

      // Check if campaign is already processing
      if (campaign.stats?.processing) {
        return NextResponse.json({
          error: "Cannot pause campaign",
          reason: "Campaign is currently processing messages. Please try again in a moment."
        }, { status: 400 });
      }
    }

    if (status === 'active') {
      if (currentStatus !== 'paused') {
        return NextResponse.json({
          error: "Cannot resume campaign",
          reason: `Campaign must be paused to resume. Current status: ${currentStatus}`
        }, { status: 400 });
      }
    }

    const now = new Date();

    // Update campaign status
    const updateData: any = {
      status: status,
      updatedAt: now
    };

    // Add status-specific fields
    if (status === 'paused') {
      updateData['stats.pausedAt'] = now;
      updateData['stats.pauseReason'] = 'Paused by user';
    } else if (status === 'active') {
      updateData['stats.resumedAt'] = now;
      updateData['stats.pausedAt'] = undefined;
      updateData['stats.pauseReason'] = undefined;
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      campaign._id,
      { $set: updateData, $unset: status === 'active' ? { 'stats.pausedAt': 1, 'stats.pauseReason': 1 } : {} },
      { new: true }
    );

    if (!updatedCampaign) {
      return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
    }

    // Log the status change
    console.log(`Campaign ${campaign._id} status changed from ${currentStatus} to ${status} by user ${decoded.id}`);

    return NextResponse.json({
      success: true,
      message: `Campaign ${status === 'active' ? 'resumed' : 'paused'} successfully`,
      campaign: {
        id: updatedCampaign._id,
        name: updatedCampaign.name,
        status: updatedCampaign.status,
        updatedAt: updatedCampaign.updatedAt
      }
    });

  } catch (error) {
    console.error("Campaign status change error:", error);
    return NextResponse.json(
      {
        error: "Failed to change campaign status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also support GET requests to check current status
export async function GET(
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

    // Await the params before using them
    const resolvedParams = await params;

    // Find the campaign
    const campaign = await Campaign.findOne({
      _id: resolvedParams.id,
      userId: decoded.id,
    }).select('_id name status stats createdAt updatedAt');

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Check if campaign is in grace period
    const now = new Date();
    const campaignAge = now.getTime() - campaign.createdAt.getTime();
    const isInGracePeriod = campaignAge < 60000 && 
                           campaign.status === 'active' &&
                           !campaign.stats?.processStartedAt;

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign._id,
        name: campaign.name,
        status: campaign.status,
        isInGracePeriod,
        timeRemaining: isInGracePeriod ? Math.ceil((60000 - campaignAge) / 1000) : 0,
        stats: {
          processing: campaign.stats?.processing || false,
          pausedAt: campaign.stats?.pausedAt,
          resumedAt: campaign.stats?.resumedAt,
          sent: campaign.stats?.sent || 0,
          failed: campaign.stats?.failed || 0,
          total: campaign.stats?.total || 0
        },
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt
      }
    });

  } catch (error) {
    console.error("Campaign status fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch campaign status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}