import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import { sendCampaignCreationNotification } from "@/lib/notifications";
import Contact from "@/models/Contact";

// Helper function to build MongoDB query from audience filters
function buildAudienceQuery(filters: any) {
  const query: any = {};

  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  if (filters.whatsappOptedIn !== undefined) {
    query.whatsappOptIn = filters.whatsappOptedIn;
  }

  if (filters.conditions && filters.conditions.length > 0) {
    const conditionsQuery = filters.conditions.map((condition: any) => {
      let fieldQuery: any = {};

      let field = condition.field;
      if (field.startsWith('customField.')) {
        field = field.replace('customField.', '');
        field = `customFields.${field}`;
      }

      switch (condition.operator) {
        case "equals":
          fieldQuery[field] = condition.value;
          break;
        case "not_equals":
          fieldQuery[field] = { $ne: condition.value };
          break;
        case "contains":
          fieldQuery[field] = { $regex: condition.value, $options: 'i' };
          break;
        case "not_contains":
          fieldQuery[field] = { $not: { $regex: condition.value, $options: 'i' } };
          break;
        case "starts_with":
          fieldQuery[field] = { $regex: `^${condition.value}`, $options: 'i' };
          break;
        case "ends_with":
          fieldQuery[field] = { $regex: `${condition.value}$`, $options: 'i' };
          break;
        case "greater_than":
          fieldQuery[field] = { $gt: condition.value };
          break;
        case "less_than":
          fieldQuery[field] = { $lt: condition.value };
          break;
      }

      return fieldQuery;
    });

    if (filters.operator === "AND") {
      query.$and = conditionsQuery;
    } else {
      query.$or = conditionsQuery;
    }
  }

  return query;
}

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
    
    // Calculate audience count for notification
    let audienceCount = 0;
    if (campaignData.audience?.selectedContacts && campaignData.audience.selectedContacts.length > 0) {
      audienceCount = campaignData.audience.selectedContacts.length;
    } else if (campaignData.audience?.filters) {
      // Build query based on audience filters
      const audienceQuery = buildAudienceQuery(campaignData.audience.filters);
      audienceCount = await Contact.countDocuments({
        userId: decoded.id,
        ...audienceQuery,
      });
    }

    // Create new campaign
    const campaign = new Campaign({
      name: campaignData.name,
      type: campaignData.type || "one-time",
      userId: decoded.id,
      audience: {
        ...campaignData.audience,
        count: audienceCount
      },
      message: campaignData.message,
      responseHandling: campaignData.responseHandling,
      conversionTracking: campaignData.conversionTracking,
      schedule: campaignData.schedule,
      retries: campaignData.retries,
      status: campaignData.status || "draft",
    });

    await campaign.save();

    // Send email notifications (async, don't wait for it)
    sendCampaignCreationNotification(decoded.id, {
      name: campaign.name,
      type: campaign.type,
      audienceCount: audienceCount
    }).catch(error => {
      console.error('Email notification failed:', error);
    });

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
        // Map new stats structure to old metrics structure for frontend compatibility
        metrics: campaign.stats ? {
          delivered: campaign.stats.sent || 0,
          read: campaign.stats.read || 0,
          replied: campaign.stats.replied || 0,
          conversions: campaign.stats.conversions || 0,
        } : undefined,
        scheduleTime: campaign.schedule?.sendTime,
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