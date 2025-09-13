import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Parse the webhook data
    const body = await req.json();
    const value = body?.entry?.[0]?.changes?.[0]?.value ?? {};

    // Process only message status updates
    if (value.messaging_product === 'whatsapp' && value.statuses) {
      await processStatusUpdates(value);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing status webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}

async function processStatusUpdates(data: any) {
  if (!data.statuses || !data.statuses.length) return;

  for (const status of data.statuses) {
    try {
      const whatsappMessageId = status.id;
      const statusValue = status.status; // 'sent', 'delivered', 'read', 'failed'

      // Only process 'failed' statuses for refunds
      if (statusValue === 'failed') {
        // Find the campaign associated with this message
        const campaign = await Campaign.findOne({
          'stats.messages.whatsappMessageId': whatsappMessageId
        });

        if (campaign) {
          // Get the message from campaign stats
          const messageRecord = campaign.stats.messages.find(
            (m: any) => m.whatsappMessageId === whatsappMessageId
          );

          if (messageRecord && !messageRecord.refunded) {
            // Mark as refunded to prevent duplicate refunds
            messageRecord.refunded = true;
            await campaign.save();

            // Get message price from campaign pricing
            const messagePrice = campaign.pricing.messagePrice;

            // Find the user to refund
            const user = await User.findById(campaign.userId);
            if (user) {
              // Refund the amount to the user's wallet
              user.walletBalance += messagePrice;
              await user.save();

              // Record the refund transaction
              const transaction = new WalletTransaction({
                userId: user._id,
                amount: messagePrice,
                type: "refund",
                status: "completed",
                description: `Refund for failed message in campaign: ${campaign.name}`,
                referenceType: "message",
                referenceId: campaign._id,
                metadata: {
                  campaignId: campaign._id,
                  whatsappMessageId: whatsappMessageId,
                  originalStatus: statusValue
                }
              });
              await transaction.save();

              console.log(`Refunded ${messagePrice} to user ${user._id} for failed message ${whatsappMessageId}`);
            }
          }
        } else {
          console.log(`Could not find campaign for message ID: ${whatsappMessageId}`);
        }
      }

      // Update message status in the campaign
      if (campaign) {
        const messageIndex = campaign.stats.messages.findIndex(
          (m: any) => m.whatsappMessageId === whatsappMessageId
        );

        if (messageIndex !== -1) {
          campaign.stats.messages[messageIndex].status = statusValue;
          await campaign.save();
        }

        // Update campaign stats counts
        campaign.stats[statusValue] = (campaign.stats[statusValue] || 0) + 1;
        await campaign.save();
      }
    } catch (err) {
      console.error('Error processing message status update:', err);
    }
  }
}
