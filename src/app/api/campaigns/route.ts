import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Campaign from "@/models/Campaign";

// Create a new campaign
export async function POST(req: NextRequest) {
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

    const campaignData = await req.json();

    // Validate required fields
    if (!campaignData.name) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }

    // Create new campaign
    const campaign = new Campaign({
      name: campaignData.name,
      type: campaignData.type || "one-time",
      userId: decoded.id,
      audience: campaignData.audience,
      message: campaignData.message,
      responseHandling: campaignData.responseHandling,
      conversionTracking: campaignData.conversionTracking,
      schedule: campaignData.schedule,
      retries: campaignData.retries,
      status: campaignData.status || "draft",
    });

    await campaign.save();

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        createdAt: campaign.createdAt,
      },
    });
  } catch (error) {
    console.error("Campaign creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Get all campaigns
export async function GET(req: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    // Build query
    const query: any = { userId: decoded.id };
    if (status && status !== "all") query.status = status;
    if (type && type !== "all") query.type = type;

    // Get campaigns from database
    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      campaigns: campaigns.map((campaign: any) => ({
        id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        audience: {
          count: campaign.audience?.count || 0,
        },
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Campaigns fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch campaigns",
      },
      { status: 500 }
    );
  }
}
