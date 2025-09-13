import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import Contact from "@/models/Contact";
import Template from "@/models/Template";
import Conversation from "@/models/Conversation";
import User from "@/models/User";
import { v4 as uuidv4 } from 'uuid';
import { renderTemplateBody, extractHeaderMedia } from '@/lib/renderTemplate';
import WalletTransaction from "@/models/WalletTransaction";

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;

// Helper function to build template components from template structure
function buildTemplateComponents(template: any, variables: any = {}, contact: any = {}) {
    console.log('🔧 buildTemplateComponents called with variables:', variables);
    console.log('🔧 Template components:', JSON.stringify(template.components, null, 2));

    const components = [];

    if (!template.components) return components;

    for (const component of template.components) {
        console.log('🔧 Processing component:', component.type, component.format);

        if (component.type === 'HEADER') {
            if (component.format === 'TEXT' && component.text?.includes('{{')) {
                // Handle TEXT headers with variables
                const headerParams = [];
                const matches = component.text.match(/\{\{[^}]+\}\}/g) || [];
                matches.forEach((match: string, index: number) => {
                    const varName = match.replace(/\{\{|\}\}/g, '').trim();
                    const paramIndex = (index + 1).toString();

                    // Try to get value from variables or contact data
                    let value = variables[paramIndex] || variables[varName];
                    if (!value && contact) {
                        // Try to get from contact fields
                        if (varName.toLowerCase() === 'name') value = contact.name;
                        else if (varName.toLowerCase() === 'phone') value = contact.phone;
                        else if (varName.toLowerCase() === 'email') value = contact.email;
                        else if (contact.customFields && contact.customFields[varName]) {
                            value = contact.customFields[varName];
                        }
                    }

                    headerParams.push({
                        type: 'text',
                        text: value || `[${varName}]`
                    });
                });

                if (headerParams.length > 0) {
                    components.push({
                        type: 'header',
                        parameters: headerParams
                    });
                }
            } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(component.format)) {
                // Handle media headers
                if (component.mediaUrl) {
                    let mediaParam;

                    if (component.format === 'IMAGE') {
                        mediaParam = {
                            type: 'image',
                            image: {
                                link: component.mediaUrl
                            }
                        };
                    } else if (component.format === 'VIDEO') {
                        mediaParam = {
                            type: 'video',
                            video: {
                                link: component.mediaUrl
                            }
                        };
                    } else if (component.format === 'DOCUMENT') {
                        mediaParam = {
                            type: 'document',
                            document: {
                                link: component.mediaUrl,
                                filename: component.text || 'document.pdf'
                            }
                        };
                    }

                    if (mediaParam) {
                        components.push({
                            type: 'header',
                            parameters: [mediaParam]
                        });
                    }
                }
            }
        } else if (component.type === 'BODY' && component.text?.includes('{{')) {
            // Handle BODY with variables
            const bodyParams = [];
            const matches = component.text.match(/\{\{[^}]+\}\}/g) || [];
            matches.forEach((match: string, index: number) => {
                const varName = match.replace(/\{\{|\}\}/g, '').trim();
                const paramIndex = (index + 1).toString();

                // Try to get value from variables or contact data
                let value = variables[paramIndex] || variables[varName];
                if (!value && contact) {
                    // Try to get from contact fields
                    if (varName.toLowerCase() === 'name') value = contact.name;
                    else if (varName.toLowerCase() === 'phone') value = contact.phone;
                    else if (varName.toLowerCase() === 'email') value = contact.email;
                    else if (contact.customFields && contact.customFields[varName]) {
                        value = contact.customFields[varName];
                    }
                }

                bodyParams.push({
                    type: 'text',
                    text: value || `[${varName}]`
                });
            });

            if (bodyParams.length > 0) {
                components.push({
                    type: 'body',
                    parameters: bodyParams
                });
            }
        } else if (component.type === 'BUTTONS' && component.buttons) {
            // Handle BUTTONS with URL variables
            const buttonComponents = [];

            component.buttons.forEach((button: any, buttonIndex: number) => {
                if (button.type === 'URL' && button.url?.includes('{{')) {
                    const matches = button.url.match(/\{\{[^}]+\}\}/g) || [];
                    const buttonParams: any[] = [];

                    matches.forEach((match: string, index: number) => {
                        const varName = match.replace(/\{\{|\}\}/g, '').trim();
                        const paramIndex = (index + 1).toString();

                        // Try to get value from variables or contact data
                        let value = variables[paramIndex] || variables[varName];
                        if (!value && contact) {
                            // Try to get from contact fields
                            if (varName.toLowerCase() === 'name') value = contact.name;
                            else if (varName.toLowerCase() === 'phone') value = contact.phone;
                            else if (varName.toLowerCase() === 'email') value = contact.email;
                            else if (contact.customFields && contact.customFields[varName]) {
                                value = contact.customFields[varName];
                            }
                        }

                        buttonParams.push({
                            type: 'text',
                            text: value || `[${varName}]`
                        });
                    });

                    if (buttonParams.length > 0) {
                        buttonComponents.push({
                            type: 'button',
                            sub_type: 'url',
                            index: buttonIndex,
                            parameters: buttonParams
                        });
                    }
                }
            });

            buttonComponents.forEach(buttonComp => {
                components.push(buttonComp);
            });
        }
    }

    return components;
}

// Updated sendMessageToContact function to handle retries
async function sendMessageToContact(
    contact: any,
    campaign: any,
    template: any = null,
    wabaAccount: any,
    isRetry: boolean = false,
    originalMessageResult?: any
) {
    try {
        let phoneNumber = contact.phone;
        if (!phoneNumber.startsWith('+')) {
            phoneNumber = '+' + phoneNumber;
        }

        let whatsappPayload;
        let renderedBody = "";

        if (campaign.message.type === "template" && template) {
            // Build variables object from campaign variables
            const variables: any = {};
            if (campaign.message.variables && Array.isArray(campaign.message.variables)) {
                campaign.message.variables.forEach((variable: any, index: number) => {
                    variables[variable.name] = variable.value;
                    variables[(index + 1).toString()] = variable.value; // Also map by index
                });
            }

            // Build template components with contact data
            const components = buildTemplateComponents(template, variables, contact);

            whatsappPayload = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: phoneNumber,
                type: "template",
                template: {
                    name: template.name,
                    language: {
                        code: template.language || 'en'
                    }
                }
            };

            if (components && components.length > 0) {
                whatsappPayload.template.components = components;
            }

            // Render template for local storage
            renderedBody = renderTemplateBody(template, components, variables);
        } else if (campaign.message.type === "custom") {
            // Custom message
            whatsappPayload = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: phoneNumber,
                type: "text",
                text: {
                    preview_url: false,
                    body: campaign.message.customMessage
                }
            };
            renderedBody = campaign.message.customMessage;
        } else {
            throw new Error("Invalid message type or missing template");
        }

        console.log(`${isRetry ? 'Retrying' : 'Sending'} message to ${contact.phone}:`, JSON.stringify(whatsappPayload, null, 2));

        // Send message via WhatsApp API
        const interaktResponse = await fetch(
            `https://amped-express.interakt.ai/api/v17.0/${wabaAccount.phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'x-access-token': INT_TOKEN!,
                    'x-waba-id': contact.wabaId,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(whatsappPayload)
            }
        );

        const responseText = await interaktResponse.text();
        console.log(`WhatsApp API response for ${contact.phone}:`, responseText);

        if (!interaktResponse.ok) {
            throw new Error(`WhatsApp API error: ${responseText}`);
        }

        let interaktData;
        try {
            interaktData = JSON.parse(responseText);
        } catch (parseError) {
            throw new Error(`Invalid JSON response: ${responseText}`);
        }

        // Create/update conversation record
        let conversation = await Conversation.findOne({ contactId: contact._id });

        const newMessage = {
            id: uuidv4(),
            senderId: 'agent' as const,
            content: renderedBody,
            messageType: campaign.message.type === "template" ? "template" : "text",
            timestamp: new Date(),
            status: 'sent' as const,
            whatsappMessageId: interaktData.messages?.[0]?.id,
            senderName: 'Campaign Bot',
            templateName: campaign.message.type === "template" ? template?.name : undefined,
            campaignId: campaign._id.toString()
        };

        if (conversation) {
            conversation.messages.push(newMessage);
            conversation.lastMessage = renderedBody;
            conversation.lastMessageType = campaign.message.type === "template" ? "template" : "text";
            conversation.lastMessageAt = new Date();
            conversation.status = 'active';
            conversation.isWithin24Hours = true;
        } else {
            conversation = new Conversation({
                contactId: contact._id,
                wabaId: contact.wabaId,
                phoneNumberId: contact.phoneNumberId,
                userId: campaign.userId,
                messages: [newMessage],
                lastMessage: renderedBody,
                lastMessageType: campaign.message.type === "template" ? "template" : "text",
                lastMessageAt: new Date(),
                isWithin24Hours: true
            });
        }

        await conversation.save();

        // Update contact's last message time
        contact.lastMessageAt = new Date();
        await contact.save();

        return {
            success: true,
            messageId: interaktData.messages?.[0]?.id,
            whatsappMessageId: interaktData.messages?.[0]?.id,
            isRetry
        };

    } catch (error) {
        console.error(`Error ${isRetry ? 'retrying' : 'sending'} message to ${contact.phone}:`, error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const currentRetryCount = (originalMessageResult?.retryCount || 0) + (isRetry ? 1 : 0);
        const maxRetries = campaign.retries?.count || 0;
        const hasMoreRetries = campaign.retries?.enabled && currentRetryCount < maxRetries;

        return {
            success: false,
            error: errorMessage,
            isRetry,
            retryCount: currentRetryCount,
            maxRetriesReached: !hasMoreRetries,
            nextRetryAt: hasMoreRetries ? calculateNextRetryTime(currentRetryCount, campaign.retries.interval) : undefined
        };
    }
}

// Helper function to build audience query from filters
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
// Update the isEligibleForRetry function
function isEligibleForRetry(message: any, campaign: any): boolean {
    if (!campaign.retries?.enabled) return false;
    if (message.status !== 'failed') return false;
    if (message.maxRetriesReached) return false;

    const retryCount = message.retryCount || 0;
    if (retryCount >= campaign.retries.count) return false;

    const now = new Date();
    if (message.nextRetryAt && new Date(message.nextRetryAt) > now) return false;

    return true;
}

// Update the calculateNextRetryTime helper function
function calculateNextRetryTime(retryCount: number, intervalDays: number, customStartDate?: Date): Date {
    const now = new Date();

    if (customStartDate && retryCount === 0) {
        // First retry should use the custom start date
        return new Date(customStartDate);
    }

    // Subsequent retries are spaced by the interval in days
    const baseDate = customStartDate || now;
    const retryDate = new Date(baseDate);
    retryDate.setDate(retryDate.getDate() + (intervalDays * (retryCount + 1)));

    return retryDate;
}


// Add this enhanced function at the top
function isScheduledTimeReached(campaign: any): boolean {
    if (!campaign.schedule?.sendTime) {
        return true; // No schedule means send immediately
    }

    const now = new Date();
    const scheduledTime = new Date(campaign.schedule.sendTime);

    // Handle timezone conversion
    if (campaign.schedule.timezone && campaign.schedule.timezone !== 'UTC') {
        const timezoneOffset = getTimezoneOffset(campaign.schedule.timezone);
        const adjustedScheduledTime = new Date(scheduledTime.getTime() - (timezoneOffset * 60 * 1000));
        return now >= adjustedScheduledTime;
    }

    return now >= scheduledTime;
}

// Helper function for timezone offsets
function getTimezoneOffset(timezone: string): number {
    const timezoneOffsets: { [key: string]: number } = {
        'UTC': 0,
        'America/New_York': -5 * 60,
        'America/Los_Angeles': -8 * 60,
        'Europe/London': 0,
        'Europe/Paris': 1 * 60,
        'Asia/Tokyo': 9 * 60,
        'Asia/Dubai': 4 * 60,
        'Asia/Singapore': 8 * 60,
        'Asia/Kolkata': 5.5 * 60,
        'Australia/Sydney': 10 * 60,
    };

    return timezoneOffsets[timezone] || 0;
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        console.log('🔄 Processing campaigns and retries...');

        const now = new Date();
        const sixtySecondsAgo = new Date(now.getTime() - 60 * 1000);

        // Enhanced query to include scheduled campaigns whose time has come
        const campaignsToProcess = await Campaign.find({
            $or: [
                // Active campaigns
                {
                    status: 'active',
                    $or: [
                        // New campaigns past grace period
                        {
                            createdAt: { $lte: sixtySecondsAgo },
                            'stats.processStartedAt': { $exists: false }
                        },
                        // Campaigns with pending batches
                        {
                            'stats.nextBatchIndex': { $exists: true, $gte: 0 }
                        },
                        // Campaigns already started
                        {
                            'stats.processStartedAt': { $exists: true }
                        },
                        // Campaigns with failed messages eligible for retry
                        {
                            'retries.enabled': true,
                            'stats.messages': {
                                $elemMatch: {
                                    status: 'failed',
                                    $or: [
                                        { maxRetriesReached: { $ne: true } },
                                        { maxRetriesReached: { $exists: false } }
                                    ],
                                    $or: [
                                        { nextRetryAt: { $lte: now } },
                                        { nextRetryAt: { $exists: false } }
                                    ]
                                }
                            }
                        }
                    ]
                },
                // Scheduled campaigns whose time has come
                {
                    status: 'scheduled'
                    // We'll check the time in code since timezone handling is complex in MongoDB
                }
            ]
        }).populate('userId');

        console.log(`Found ${campaignsToProcess.length} campaigns to evaluate`);

        // Filter campaigns that should actually be processed
        const activeCampaigns = [];
        const scheduledCampaignsNotReady = [];

        for (const campaign of campaignsToProcess) {
            if (campaign.status === 'scheduled') {
                if (isScheduledTimeReached(campaign)) {
                    console.log(`📅 Scheduled campaign ${campaign._id} time reached, activating...`);

                    // Handle wallet charging for scheduled campaigns
                    if (campaign.pricing?.totalCost > 0) {
                        const user = await User.findById(campaign.userId).populate('companyId');
                        const company = user?.companyId;

                        if (company && company.walletBalance >= campaign.pricing.totalCost) {
                            // Charge the wallet now
                            company.walletBalance -= campaign.pricing.totalCost;
                            await company.save();

                            // Record the transaction
                            const transaction = new WalletTransaction({
                                companyId: company._id,
                                amount: campaign.pricing.totalCost,
                                type: "debit",
                                status: "completed",
                                description: `Scheduled Campaign Started: ${campaign.name}`,
                                referenceType: "campaign",
                                referenceId: campaign._id,
                                metadata: {
                                    campaignId: campaign._id,
                                    scheduledTime: campaign.schedule?.sendTime,
                                    messageCount: campaign.audience?.count || 0
                                }
                            });
                            await transaction.save();

                            console.log(`💳 Charged ${campaign.pricing.totalCost} for scheduled campaign ${campaign._id}`);
                        } else {
                            // Insufficient balance - mark campaign as failed
                            await Campaign.findByIdAndUpdate(campaign._id, {
                                status: 'failed',
                                'stats.failureReason': 'Insufficient wallet balance when scheduled time reached',
                                'stats.failedAt': now
                            });

                            console.log(`❌ Campaign ${campaign._id} failed due to insufficient balance`);
                            continue;
                        }
                    }

                    // Update status to active
                    await Campaign.findByIdAndUpdate(campaign._id, {
                        status: 'active',
                        'stats.scheduledActivatedAt': now
                    });

                    // Add to processing queue
                    campaign.status = 'active';
                    activeCampaigns.push(campaign);
                } else {
                    const scheduledTime = new Date(campaign.schedule.sendTime);
                    const timeUntil = Math.ceil((scheduledTime.getTime() - now.getTime()) / (1000 * 60));
                    console.log(`⏰ Campaign ${campaign._id} scheduled in ${timeUntil} minutes`);
                    scheduledCampaignsNotReady.push({
                        id: campaign._id,
                        name: campaign.name,
                        timeUntilScheduled: timeUntil
                    });
                }
            } else if (campaign.status === 'active') {
                // Apply existing logic for active campaigns
                const campaignAge = now.getTime() - campaign.createdAt.getTime();
                const isInGracePeriod = campaignAge < 60000 &&
                    !campaign.stats?.nextBatchIndex &&
                    !campaign.stats?.processStartedAt;

                if (!isInGracePeriod && !campaign.stats?.processing) {
                    activeCampaigns.push(campaign);
                }
            }
        }

        console.log(`${activeCampaigns.length} campaigns ready for processing`);
        console.log(`${scheduledCampaignsNotReady.length} campaigns still scheduled for future`);

        const results = [];

        // Add info about scheduled campaigns not ready
        scheduledCampaignsNotReady.forEach(scheduled => {
            results.push({
                campaignId: scheduled.id,
                campaignName: scheduled.name,
                processed: false,
                status: 'scheduled',
                timeUntilScheduled: scheduled.timeUntilScheduled,
                note: `Scheduled to start in ${scheduled.timeUntilScheduled} minutes`
            });
        });

        for (const campaign of activeCampaigns) {
            try {
                console.log(`🔍 Processing campaign: ${campaign.name} (${campaign._id})`);

                // Skip if campaign is already being processed
                if (campaign.stats?.processing) {
                    console.log(`Campaign ${campaign._id} is already being processed, skipping...`);
                    continue;
                }

                // Mark campaign as being processed
                await Campaign.findByIdAndUpdate(campaign._id, {
                    'stats.processing': true,
                    'stats.processStartedAt': campaign.stats?.processStartedAt || now
                });

                // Get the template if it's a template message
                let template = null;
                if (campaign.message.type === "template" && campaign.message.template) {
                    template = await Template.findById(campaign.message.template);
                    if (!template) {
                        console.error(`Template ${campaign.message.template} not found for campaign ${campaign._id}`);
                        await Campaign.findByIdAndUpdate(campaign._id, {
                            status: 'failed',
                            'stats.processing': false,
                            'stats.failureReason': 'Template not found'
                        });
                        continue;
                    }
                }

                // Get user's WABA accounts
                const user = await User.findById(campaign.userId);
                if (!user) {
                    console.error(`User ${campaign.userId} not found for campaign ${campaign._id}`);
                    await Campaign.findByIdAndUpdate(campaign._id, {
                        status: 'failed',
                        'stats.processing': false,
                        'stats.failureReason': 'User not found'
                    });
                    continue;
                }

                const wabaAccounts = user.wabaAccounts || [];

                if (wabaAccounts.length === 0) {
                    console.error(`No WABA accounts found for user ${campaign.userId}`);
                    await Campaign.findByIdAndUpdate(campaign._id, {
                        status: 'failed',
                        'stats.processing': false,
                        'stats.failureReason': 'No WABA accounts configured'
                    });
                    continue;
                }

                let sentCount = 0;
                let failedCount = 0;
                let retryCount = 0;
                const messageResults = [];

                // Check for messages that need retrying
                const messagesForRetry = (campaign.stats?.messages || []).filter((msg: any) =>
                    isEligibleForRetry(msg, campaign)
                );

                if (messagesForRetry.length > 0) {
                    console.log(`🔄 Found ${messagesForRetry.length} messages eligible for retry`);

                    // Process retry messages with rate limiting
                    const retryBatchSize = 10; // Smaller batch size for retries
                    const retryDelay = 2000; // 2 seconds delay between retries

                    for (let i = 0; i < messagesForRetry.length; i += retryBatchSize) {
                        const retryBatch = messagesForRetry.slice(i, i + retryBatchSize);

                        for (const messageToRetry of retryBatch) {
                            try {
                                // Find the contact
                                const contact = await Contact.findById(messageToRetry.contactId);
                                if (!contact) {
                                    console.error(`Contact ${messageToRetry.contactId} not found for retry`);
                                    continue;
                                }

                                // Find appropriate WABA account
                                const wabaAccount = wabaAccounts.find((account: any) =>
                                    account.wabaId === contact.wabaId
                                );

                                if (!wabaAccount) {
                                    console.error(`No matching WABA account found for contact ${contact._id} retry`);
                                    continue;
                                }

                                // Attempt retry
                                const retryResult = await sendMessageToContact(
                                    contact,
                                    campaign,
                                    template,
                                    wabaAccount,
                                    true,
                                    messageToRetry
                                );

                                // Update the message result
                                const messageIndex = campaign.stats.messages.findIndex((msg: any) =>
                                    msg.contactId === messageToRetry.contactId
                                );

                                if (messageIndex !== -1) {
                                    if (retryResult.success) {
                                        campaign.stats.messages[messageIndex] = {
                                            ...campaign.stats.messages[messageIndex],
                                            status: 'sent',
                                            messageId: retryResult.messageId,
                                            whatsappMessageId: retryResult.whatsappMessageId,
                                            sentAt: new Date(),
                                            retryCount: retryResult.retryCount || 0,
                                            lastRetryAt: new Date(),
                                            error: undefined,
                                            failedAt: undefined
                                        };
                                        sentCount++;
                                        retryCount++;
                                        console.log(`✅ Retry successful for ${contact.phone}`);
                                    } else {
                                        campaign.stats.messages[messageIndex] = {
                                            ...campaign.stats.messages[messageIndex],
                                            retryCount: retryResult.retryCount || 0,
                                            lastRetryAt: new Date(),
                                            nextRetryAt: retryResult.nextRetryAt,
                                            maxRetriesReached: retryResult.maxRetriesReached,
                                            error: retryResult.error
                                        };

                                        if (retryResult.maxRetriesReached) {
                                            failedCount++;
                                            console.log(`❌ Max retries reached for ${contact.phone}: ${retryResult.error}`);
                                        } else {
                                            console.log(`🔄 Retry failed for ${contact.phone}, will retry at ${retryResult.nextRetryAt}: ${retryResult.error}`);
                                        }
                                    }
                                }

                                // Add delay between retries
                                if (i < retryBatch.length - 1) {
                                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                                }

                            } catch (error) {
                                console.error(`Error processing retry for message ${messageToRetry.contactId}:`, error);
                            }
                        }
                    }

                    // Update campaign stats after processing retries
                    await Campaign.findByIdAndUpdate(campaign._id, {
                        'stats.sent': (campaign.stats.sent || 0) + sentCount,
                        'stats.failed': (campaign.stats.failed || 0) + failedCount,
                        'stats.messages': campaign.stats.messages,
                        'stats.processing': false,
                        'stats.lastProcessedAt': now
                    });

                    results.push({
                        campaignId: campaign._id,
                        campaignName: campaign.name,
                        processed: true,
                        retriesProcessed: retryCount,
                        retriesSuccessful: sentCount,
                        retriesFailed: failedCount,
                        status: 'retry_processed'
                    });

                    continue; // Skip to next campaign after processing retries
                }

                // Continue with regular campaign processing if no retries needed...
                // [Rest of the existing campaign processing logic remains the same]

                // Get target contacts for new messages
                let targetContacts = [];

                console.log(`🔍 Checking audience selection method...`);

                if (campaign.audience.selectedContacts && campaign.audience.selectedContacts.length > 0) {
                    console.log(`📞 Using selected contacts: ${campaign.audience.selectedContacts.length}`);
                    targetContacts = await Contact.find({
                        _id: { $in: campaign.audience.selectedContacts },
                        userId: campaign.userId,
                        whatsappOptIn: true
                    });
                } else if (campaign.audience.filters && Object.keys(campaign.audience.filters).length > 0) {
                    console.log(`🔍 Using filtered contacts`);
                    const audienceQuery = buildAudienceQuery(campaign.audience.filters);
                    targetContacts = await Contact.find({
                        userId: campaign.userId,
                        whatsappOptIn: true,
                        ...audienceQuery
                    });
                }

                if (targetContacts.length === 0) {
                    console.log(`No eligible contacts found for campaign ${campaign._id}`);
                    await Campaign.findByIdAndUpdate(campaign._id, {
                        status: 'completed',
                        'stats.processing': false,
                        'stats.completedAt': now
                    });
                    continue;
                }

                // Initialize campaign stats if not exists
                if (!campaign.stats) {
                    campaign.stats = {
                        total: targetContacts.length,
                        sent: 0,
                        delivered: 0,
                        read: 0,
                        failed: 0,
                        messages: []
                    };
                }

                // Check if we need to resume from a specific batch
                const startIndex = campaign.stats.nextBatchIndex || 0;
                if (startIndex > 0) {
                    console.log(`🔄 Resuming campaign from contact ${startIndex + 1}/${targetContacts.length}`);
                    targetContacts = targetContacts.slice(startIndex);
                }

                // Process new messages with existing logic...
                const batchSize = 50;
                const delayBetweenContacts = 1200;

                console.log(`📤 Starting to send messages to ${targetContacts.length} contacts (${batchSize} per minute)`);

                for (let i = 0; i < targetContacts.length; i += batchSize) {
                    const batch = targetContacts.slice(i, i + batchSize);
                    const batchStartTime = Date.now();

                    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(targetContacts.length / batchSize)}: contacts ${i + 1} to ${Math.min(i + batchSize, targetContacts.length)}`);

                    for (let j = 0; j < batch.length; j++) {
                        const contact = batch[j];

                        try {
                            const wabaAccount = wabaAccounts.find((account: any) =>
                                account.wabaId === contact.wabaId
                            );

                            if (!wabaAccount) {
                                console.error(`No matching WABA account found for contact ${contact._id}`);
                                failedCount++;
                                messageResults.push({
                                    contactId: contact._id.toString(),
                                    error: 'No matching WABA account',
                                    failedAt: new Date(),
                                    status: 'failed',
                                    retryCount: 0,
                                    maxRetriesReached: !campaign.retries?.enabled
                                });
                                continue;
                            }

                            // Check if message was already sent
                            const existingMessage = campaign.stats.messages?.find((msg: any) =>
                                msg.contactId === contact._id.toString()
                            );

                            if (existingMessage) {
                                console.log(`Message already sent to contact ${contact._id} for campaign ${campaign._id}`);
                                continue;
                            }

                            // Send message to contact
                            const result = await sendMessageToContact(contact, campaign, template, wabaAccount);

                            if (result.success && !result.skipped) {
                                sentCount++;
                                messageResults.push({
                                    contactId: contact._id.toString(),
                                    messageId: result.messageId,
                                    whatsappMessageId: result.whatsappMessageId,
                                    sentAt: new Date(),
                                    status: 'sent',
                                    retryCount: 0
                                });
                                console.log(`✅ Message sent to ${contact.phone} (${j + 1}/${batch.length} in current batch)`);
                            } else if (!result.success) {
                                failedCount++;
                                const messageResult: any = {
                                    contactId: contact._id.toString(),
                                    error: result.error,
                                    failedAt: new Date(),
                                    status: 'failed',
                                    retryCount: result.retryCount || 0,
                                    maxRetriesReached: result.maxRetriesReached || false
                                };

                                if (result.nextRetryAt) {
                                    messageResult.nextRetryAt = result.nextRetryAt;
                                }

                                messageResults.push(messageResult);
                                console.log(`❌ Failed to send message to ${contact.phone}: ${result.error}`);
                            }

                            if (j < batch.length - 1) {
                                await new Promise(resolve => setTimeout(resolve, delayBetweenContacts));
                            }

                        } catch (error) {
                            console.error(`Error processing contact ${contact._id}:`, error);
                            failedCount++;
                            messageResults.push({
                                contactId: contact._id.toString(),
                                error: error instanceof Error ? error.message : 'Unknown error',
                                failedAt: new Date(),
                                status: 'failed',
                                retryCount: 0,
                                maxRetriesReached: !campaign.retries?.enabled
                            });
                        }
                    }

                    const batchProcessingTime = Date.now() - batchStartTime;
                    console.log(`📦 Batch completed in ${(batchProcessingTime / 1000).toFixed(1)}s. Sent: ${sentCount}, Failed: ${failedCount}`);

                    // Update campaign stats after each batch
                    const currentStats = {
                        total: campaign.stats.total,
                        sent: (campaign.stats.sent || 0) + sentCount,
                        delivered: campaign.stats.delivered || 0,
                        read: campaign.stats.read || 0,
                        failed: (campaign.stats.failed || 0) + failedCount,
                        messages: [
                            ...(campaign.stats.messages || []),
                            ...messageResults
                        ],
                        processing: true,
                        lastProcessedAt: now,
                        currentBatch: Math.floor(i / batchSize) + 1,
                        totalBatches: Math.ceil(targetContacts.length / batchSize),
                        processStartedAt: campaign.stats.processStartedAt || now
                    };

                    await Campaign.findByIdAndUpdate(campaign._id, {
                        stats: currentStats
                    });

                    // If there are more contacts to process, wait for the next cron cycle
                    if (i + batchSize < targetContacts.length) {
                        console.log(`⏳ Batch complete. Remaining contacts: ${targetContacts.length - (i + batchSize)}. Will continue in next cron cycle.`);

                        await Campaign.findByIdAndUpdate(campaign._id, {
                            'stats.processing': false,
                            'stats.nextBatchIndex': (startIndex || 0) + i + batchSize,
                            'stats.lastProcessedAt': now
                        });

                        results.push({
                            campaignId: campaign._id,
                            campaignName: campaign.name,
                            processed: true,
                            sent: sentCount,
                            failed: failedCount,
                            status: 'active',
                            note: `Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(targetContacts.length / batchSize)}. Continuing in next cycle.`
                        });

                        break;
                    }
                }

                // If we've processed all contacts, finalize the campaign
                if (!targetContacts.length || (startIndex + targetContacts.length) >= (campaign.stats.total || 0)) {
                    const finalStats = {
                        total: campaign.stats.total,
                        sent: (campaign.stats.sent || 0) + sentCount,
                        delivered: campaign.stats.delivered || 0,
                        read: campaign.stats.read || 0,
                        failed: (campaign.stats.failed || 0) + failedCount,
                        messages: [
                            ...(campaign.stats.messages || []),
                            ...messageResults
                        ],
                        processing: false,
                        lastProcessedAt: now,
                        nextBatchIndex: undefined,
                        processStartedAt: campaign.stats.processStartedAt || now
                    };

                    let finalStatus = 'active';
                    if (finalStats.sent + finalStats.failed >= finalStats.total) {
                        if (campaign.type === 'one-time') {
                            finalStatus = 'completed';
                            finalStats.completedAt = now;
                        }
                    }

                    await Campaign.findByIdAndUpdate(campaign._id, {
                        status: finalStatus,
                        stats: finalStats
                    });

                    console.log(`Campaign ${campaign._id} processing complete: ${finalStats.sent} sent, ${finalStats.failed} failed`);

                    results.push({
                        campaignId: campaign._id,
                        campaignName: campaign.name,
                        processed: true,
                        sent: sentCount,
                        failed: failedCount,
                        status: finalStatus
                    });
                }

            } catch (error) {
                console.error(`Error processing campaign ${campaign._id}:`, error);

                await Campaign.findByIdAndUpdate(campaign._id, {
                    status: 'failed',
                    'stats.processing': false,
                    'stats.failureReason': error instanceof Error ? error.message : 'Unknown error',
                    'stats.failedAt': now
                });

                results.push({
                    campaignId: campaign._id,
                    campaignName: campaign.name,
                    processed: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        console.log('✅ Campaign processing and retry handling completed');

        return NextResponse.json({
            success: true,
            processedAt: now,
            campaignsFound: activeCampaigns.length,
            results
        });

    } catch (error) {
        console.error('❌ Error in campaign processing:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}


// Allow GET requests for manual testing
export async function GET(req: NextRequest) {
    // For manual testing - same logic as POST
    return POST(req);
}