import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Company from "@/models/Company";
import Campaign from "@/models/Campaign";
import Template from "@/models/Template";
import Contact from "@/models/Contact";
import WalletTransaction from "@/models/WalletTransaction";
import { calculateMessagePrice } from "@/lib/pricing";

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

    // Get company for wallet balance
    const company = await Company.findById(user.companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const campaignData = await req.json();

    // Validate required fields
    if (!campaignData.name) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }

    // Ensure template is specified for message
    if (!campaignData.message?.template) {
      return NextResponse.json(
        { error: "Template ID is required for campaign messages" },
        { status: 400 }
      );
    }

    // Fetch the template to get its category for pricing
    const template = await Template.findById(campaignData.message.template);
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Get audience count to calculate total cost
    let audienceCount = 0;

    // Either use selected contacts or filter query
    if (campaignData.audience?.selectedContacts && campaignData.audience.selectedContacts.length > 0) {
      // Use selected contacts array
      audienceCount = campaignData.audience.selectedContacts.length;
    } else if (campaignData.audience?.filters) {
      // Build query based on audience filters
      const audienceQuery = buildAudienceQuery(campaignData.audience.filters);
      audienceCount = await Contact.countDocuments({
        userId: decoded.id,
        ...audienceQuery,
      });
    }

    if (audienceCount === 0) {
      return NextResponse.json(
        { error: "No contacts match the audience criteria" },
        { status: 400 }
      );
    }

    // Calculate pricing based on template category
    const isInternational = false; // Default, can be determined by contact's phone country code
    const messagePrice = calculateMessagePrice(template.category, isInternational);

    // Total cost for all messages
    const totalCost = messagePrice.totalPrice * audienceCount;

    // Check if company has sufficient balance
    if (company.walletBalance < totalCost) {
      return NextResponse.json(
        {
          error: "Insufficient wallet balance",
          requiredAmount: totalCost,
          currentBalance: company.walletBalance
        },
        { status: 400 }
      );
    }

    // For an existing campaign, update it
    let campaign;
    if (campaignData.id) {
      campaign = await Campaign.findOne({
        _id: campaignData.id,
        userId: decoded.id,
      });

      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 }
        );
      }

      // Update campaign fields
      campaign.name = campaignData.name;
      campaign.type = campaignData.type;
      campaign.audience = campaignData.audience;
      campaign.message = campaignData.message;
      campaign.responseHandling = campaignData.responseHandling;
      campaign.conversionTracking = campaignData.conversionTracking;
      campaign.schedule = campaignData.schedule;
      campaign.retries = campaignData.retries;
      campaign.status = "active"; // Set to active when launching
      campaign.pricing = {
        messagePrice: messagePrice.totalPrice,
        totalCost: totalCost,
        messagePriceDetails: messagePrice
      };
    } else {
      // Create new campaign
      campaign = new Campaign({
        name: campaignData.name,
        type: campaignData.type || "one-time",
        userId: decoded.id,
        companyId: company._id,
        audience: {
          ...campaignData.audience,
          count: audienceCount
        },
        message: {
          template: campaignData.message.template,
          templateName: template.name,
          templateCategory: template.category,
          variables: campaignData.message.variables || []
        },
        responseHandling: campaignData.responseHandling,
        conversionTracking: campaignData.conversionTracking,
        schedule: campaignData.schedule,
        retries: campaignData.retries,
        status: "active", // Set to active when launching
        pricing: {
          messagePrice: messagePrice.totalPrice,
          totalCost: totalCost,
          messagePriceDetails: messagePrice
        },
        stats: {
          total: audienceCount,
          sent: 0,
          delivered: 0,
          read: 0,
          failed: 0,
          messages: []
        }
      });
    }

    // Save the campaign
    await campaign.save();

    // Deduct the amount from company's wallet
    company.walletBalance -= totalCost;
    await company.save();

    // Record the transaction
    const transaction = new WalletTransaction({
      companyId: company._id,
      amount: totalCost,
      type: "debit",
      status: "completed",
      description: `Campaign: ${campaign.name} - ${audienceCount} messages`,
      referenceType: "campaign",
      referenceId: campaign._id,
      metadata: {
        campaignId: campaign._id,
        templateId: template._id,
        messageCount: audienceCount,
        unitPrice: messagePrice.totalPrice,
        templateCategory: template.category
      }
    });
    await transaction.save();

// SEND MESSAGE ROUTE HERE FOR THE CRON JOB

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        audienceCount: audienceCount,
        createdAt: campaign.createdAt,
      },
      billing: {
        totalCost: totalCost,
        messagePrice: messagePrice.totalPrice,
        remainingBalance: company.walletBalance,
        currency: "INR"
      }
    });
  } catch (error) {
    console.error("Campaign launch error:", error);
    return NextResponse.json(
      {
        error: "Failed to launch campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to build MongoDB query from audience filters
function buildAudienceQuery(filters: any) {
  const query: any = {};

  // Example implementation - this would need to be customized based on your filter structure
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  if (filters.whatsappOptedIn !== undefined) {
    query.whatsappOptIn = filters.whatsappOptedIn;
  }

  // Handle conditions with AND/OR operators
  if (filters.conditions && filters.conditions.length > 0) {
    const conditionsQuery = filters.conditions.map((condition: any) => {
      let fieldQuery: any = {};

      // Handle custom fields
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
