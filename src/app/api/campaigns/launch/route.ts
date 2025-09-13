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
import { sendCampaignLaunchNotification } from "@/lib/notifications";

// Add more detailed logging in the buildAudienceQuery function
function buildAudienceQuery(filters: any) {
  console.log('🔍 Building audience query from filters:', JSON.stringify(filters, null, 2));

  const query: any = {};

  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
    console.log('📌 Tags filter applied:', query.tags);
  }

  if (filters.whatsappOptedIn !== undefined) {
    query.whatsappOptIn = filters.whatsappOptedIn;
    console.log('📱 WhatsApp opt-in filter applied:', query.whatsappOptIn);
  }

  // Add contact groups filter
  if (filters.contactGroups && filters.contactGroups.length > 0) {
    // This needs to be implemented based on your contact group structure
    console.log('👥 Contact groups filter applied:', filters.contactGroups);
  }

  if (filters.conditions && filters.conditions.length > 0) {
    // ... existing conditions logic ...
  }

  console.log('🎯 Final MongoDB query:', JSON.stringify(query, null, 2));
  return query;
}


// Helper function to get timezone offset in minutes
function getTimezoneOffset(timezone: string): number {
  const timezoneOffsets: { [key: string]: number } = {
    'UTC': 0,
    'America/New_York': -5 * 60, // EST (simplified - doesn't handle DST)
    'America/Los_Angeles': -8 * 60, // PST
    'America/Chicago': -6 * 60, // CST
    'America/Denver': -7 * 60, // MST
    'Europe/London': 0, // GMT
    'Europe/Paris': 1 * 60, // CET
    'Europe/Berlin': 1 * 60, // CET
    'Europe/Rome': 1 * 60, // CET
    'Asia/Tokyo': 9 * 60, // JST
    'Asia/Dubai': 4 * 60, // GST
    'Asia/Singapore': 8 * 60, // SGT
    'Asia/Kolkata': 5.5 * 60, // IST
    'Asia/Shanghai': 8 * 60, // CST
    'Australia/Sydney': 10 * 60, // AEST (simplified)
    'Australia/Melbourne': 10 * 60, // AEST (simplified)
  };

  return timezoneOffsets[timezone] || 0;
}

// Helper function to determine if campaign should be scheduled or active
function determineCampaignStatus(scheduleData: any): {
  status: 'active' | 'scheduled',
  adjustedScheduledTime: Date | null,
  shouldChargeNow: boolean
} {
  if (!scheduleData?.sendTime) {
    return {
      status: 'active',
      adjustedScheduledTime: null,
      shouldChargeNow: true
    };
  }

  const scheduledTime = new Date(scheduleData.sendTime);
  const now = new Date();

  // Handle timezone conversion
  let adjustedScheduledTime = scheduledTime;
  if (scheduleData.timezone && scheduleData.timezone !== 'UTC') {
    const timezoneOffset = getTimezoneOffset(scheduleData.timezone);
    // Convert scheduled time to UTC
    adjustedScheduledTime = new Date(scheduledTime.getTime() - (timezoneOffset * 60 * 1000));
  }

  const isScheduledForFuture = adjustedScheduledTime > now;

  return {
    status: isScheduledForFuture ? 'scheduled' : 'active',
    adjustedScheduledTime,
    shouldChargeNow: !isScheduledForFuture
  };
}

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Get user and company
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const company = await Company.findById(user.companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const campaignData = await req.json();

    // Validate required fields
    if (!campaignData.name?.trim()) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }

    // Validate message type and content
    const messageType = campaignData.message?.type || "template";

    if (messageType === "template" && !campaignData.message?.template) {
      return NextResponse.json(
        { error: "Template ID is required for template messages" },
        { status: 400 }
      );
    }

    if (messageType === "custom" && !campaignData.message?.customMessage?.trim()) {
      return NextResponse.json(
        { error: "Custom message content is required for custom messages" },
        { status: 400 }
      );
    }

    // Determine campaign status and scheduling
    const { status: campaignStatus, adjustedScheduledTime, shouldChargeNow } =
      determineCampaignStatus(campaignData.schedule);

    // Fetch template for template messages
    let template = null;
    let templateCategory = "MARKETING";

    if (messageType === "template") {
      template = await Template.findById(campaignData.message.template);
      if (!template) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 }
        );
      }
      templateCategory = template.category || "MARKETING";
    }

    // Calculate audience count
    let audienceCount = 0;

    // In the audience calculation section, add logging
    console.log('Campaign audience data:', {
      hasSelectedContacts: campaignData.audience?.selectedContacts?.length > 0,
      selectedContactsCount: campaignData.audience?.selectedContacts?.length || 0,
      hasFilters: campaignData.audience?.filters && Object.keys(campaignData.audience.filters).length > 0
    });

    if (campaignData.audience?.selectedContacts && campaignData.audience.selectedContacts.length > 0) {
      // Use selected contacts - count only opted-in contacts
      console.log('Using selected contacts:', campaignData.audience.selectedContacts);
      audienceCount = await Contact.countDocuments({
        _id: { $in: campaignData.audience.selectedContacts },
        userId: decoded.id,
        whatsappOptIn: true
      });
    } else if (campaignData.audience?.filters && Object.keys(campaignData.audience.filters).length > 0) {
      // Use filtered contacts - count only opted-in contacts
      console.log('Using filtered contacts with filters:', campaignData.audience.filters);
      const audienceQuery = buildAudienceQuery(campaignData.audience.filters);
      audienceCount = await Contact.countDocuments({
        userId: decoded.id,
        whatsappOptIn: true,
        ...audienceQuery,
      });
    }

    console.log('Final audience count:', audienceCount);

    if (audienceCount === 0) {
      return NextResponse.json(
        { error: "No eligible contacts found. Contacts must have WhatsApp opt-in enabled." },
        { status: 400 }
      );
    }

    // Calculate pricing (only for template messages)
    let totalCost = 0;
    let messagePrice = { totalPrice: 0, basePrice: 0, gstPrice: 0, markupPrice: 0 };

    if (messageType === "template") {
      const isInternational = false; // Can be determined by contact analysis
      messagePrice = calculateMessagePrice(templateCategory, isInternational);
      totalCost = messagePrice.totalPrice * audienceCount;
    }

    // Validate wallet balance
    if (totalCost > 0) {
      if (shouldChargeNow && company.walletBalance < totalCost) {
        return NextResponse.json(
          {
            error: "Insufficient wallet balance",
            requiredAmount: totalCost,
            currentBalance: company.walletBalance,
            shortfall: totalCost - company.walletBalance
          },
          { status: 400 }
        );
      }

      // For scheduled campaigns, warn if balance might be insufficient
      if (!shouldChargeNow && company.walletBalance < totalCost) {
        console.warn(`Scheduled campaign ${campaignData.name} may fail due to insufficient balance at start time`);
      }
    }

    // Create campaign document
    const campaignDoc: any = {
      name: campaignData.name.trim(),
      type: campaignData.type || "one-time",
      userId: decoded.id,
      audience: {
        filters: campaignData.audience?.filters || {},
        count: audienceCount,
        selectedContacts: campaignData.audience?.selectedContacts || []
      },
      message: {
        type: messageType,
        template: campaignData.message?.template || null,
        templateName: template?.name || null,
        templateCategory: template?.category || null,
        customMessage: campaignData.message?.customMessage || null,
        variables: campaignData.message?.variables || []
      },
      responseHandling: {
        enabled: campaignData.responseHandling?.enabled ?? false,

        autoReply: {
          ...campaignData.responseHandling?.autoReply,
          enabled: campaignData.responseHandling?.autoReply?.enabled ?? false
        },

        workflow: {
          ...campaignData.responseHandling?.workflow,
          enabled: campaignData.responseHandling?.workflow?.enabled ?? false
        },

        optOut: {
          ...campaignData.responseHandling?.optOut,
          enabled: campaignData.responseHandling?.optOut?.enabled ?? false,
          triggerButtons: campaignData.responseHandling?.optOut?.triggerButtons ?? [],
          acknowledgmentMessage: campaignData.responseHandling?.optOut?.acknowledgmentMessage ?? "",
          updateContact: campaignData.responseHandling?.optOut?.updateContact ?? true
        }
      },

      conversionTracking: {
        enabled: campaignData.conversionTracking?.enabled || false,
        goals: campaignData.conversionTracking?.goals || [],
        methods: campaignData.conversionTracking?.methods || ["link"],
        attributionWindow: campaignData.conversionTracking?.attributionWindow || 7
      },
      schedule: {
        sendTime: adjustedScheduledTime,
        timezone: campaignData.schedule?.timezone || "UTC"
      },
      retries: {
        enabled: campaignData.retries?.enabled || false,
        count: campaignData.retries?.count || 3,
        interval: campaignData.retries?.interval || 1, // days
        customStartDate: campaignData.retries?.customStartDate || null
      },
      status: campaignStatus,
      stats: {
        total: audienceCount,
        sent: 0,
        delivered: 0,
        read: 0,
        replied: 0,
        failed: 0,
        conversions: 0,
        retries: {
          attempted: 0,
          successful: 0,
          failed: 0
        },
        messages: [],
        processing: false
      }
    };

    // Add pricing info for template messages
    if (totalCost > 0) {
      campaignDoc.pricing = {
        messagePrice: messagePrice.totalPrice,
        totalCost: totalCost,
        messagePriceDetails: messagePrice
      };
    }

    // Handle existing campaign update or create new
    let campaign;
    if (campaignData.id) {
      campaign = await Campaign.findOneAndUpdate(
        { _id: campaignData.id, userId: decoded.id },
        campaignDoc,
        { new: true, runValidators: true }
      );

      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found or access denied" },
          { status: 404 }
        );
      }
    } else {
      campaign = new Campaign(campaignDoc);
      await campaign.save();
    }

    // Handle wallet charging for immediate campaigns
    let walletTransaction = null;
    let remainingBalance = company.walletBalance;

    if (shouldChargeNow && totalCost > 0) {
      try {
        // Deduct from wallet
        company.walletBalance -= totalCost;
        await company.save();
        remainingBalance = company.walletBalance;

        // Create transaction record
        walletTransaction = new WalletTransaction({
          companyId: company._id,
          amount: totalCost,
          type: "debit",
          status: "completed",
          description: `Campaign Launch: ${campaign.name} - ${audienceCount} messages`,
          referenceType: "campaign",
          referenceId: campaign._id,
          metadata: {
            campaignId: campaign._id,
            campaignName: campaign.name,
            templateId: template?._id,
            templateCategory: templateCategory,
            messageCount: audienceCount,
            unitPrice: messagePrice.totalPrice,
            launchedAt: new Date()
          }
        });
        await walletTransaction.save();

        console.log(`💳 Charged ${totalCost} for immediate campaign ${campaign._id}`);
      } catch (walletError) {
        // Rollback campaign if wallet charge fails
        await Campaign.findByIdAndDelete(campaign._id);
        throw new Error(`Wallet charge failed: ${walletError}`);
      }
    }

    // Send notification email (async, don't wait)
    const notificationData = {
      name: campaign.name,
      audienceCount: audienceCount,
      totalCost: totalCost,
      currency: company.currency || "INR",
      scheduledTime: campaignStatus === 'scheduled' ? adjustedScheduledTime : null,
      type: campaignStatus === 'scheduled' ? 'scheduled' : 'launched',
      timezone: campaignData.schedule?.timezone
    };

    sendCampaignLaunchNotification(decoded.id, notificationData).catch(error => {
      console.error('Email notification failed:', error);
    });

    // Prepare response
    const responseData = {
      success: true,
      campaign: {
        id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        audienceCount: audienceCount,
        createdAt: campaign.createdAt,
        scheduledTime: adjustedScheduledTime,
        timezone: campaignData.schedule?.timezone || "UTC"
      },
      billing: {
        totalCost: totalCost,
        messagePrice: messagePrice.totalPrice,
        remainingBalance: remainingBalance,
        currency: company.currency || "INR",
        chargedNow: shouldChargeNow && totalCost > 0,
        willChargeAt: !shouldChargeNow && adjustedScheduledTime ? adjustedScheduledTime : null,
        transactionId: walletTransaction?._id
      },
      scheduling: {
        isScheduled: campaignStatus === 'scheduled',
        originalTime: campaignData.schedule?.sendTime,
        adjustedTime: adjustedScheduledTime,
        timezone: campaignData.schedule?.timezone || "UTC"
      }
    };

    console.log(`✅ Campaign ${campaign.status === 'scheduled' ? 'scheduled' : 'launched'}: ${campaign.name} (${campaign._id})`);

    return NextResponse.json(responseData);

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