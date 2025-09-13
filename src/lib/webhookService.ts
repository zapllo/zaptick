import WebhookConfig from '@/models/WebhookConfig';
import { sendWebhook, WebhookPayload } from '@/lib/webhookUtils';

export class WebhookService {
  static async sendEvent(
    userId: string,
    wabaId: string,
    eventType: string,
    eventData: any
  ): Promise<void> {
    try {
      // Get webhook configuration
      const config = await WebhookConfig.findOne({
        userId,
        wabaId,
        isActive: true
      });

      if (!config) {
        console.log(`No active webhook config found for user ${userId}, waba ${wabaId}`);
        return;
      }

      // Check if this event type is enabled
      const eventKey = this.getEventKey(eventType);
      if (!eventKey || !config.events[eventKey]) {
        console.log(`Event type ${eventType} not enabled for webhook`);
        return;
      }

      // Prepare webhook payload
      const payload: WebhookPayload = {
        event: eventType,
        timestamp: Date.now(),
        data: eventData,
        wabaId,
        userId
      };

      // Send webhook
      const success = await sendWebhook(config.webhookUrl, payload, config.secretKey);

      // Update statistics
      if (success) {
        await WebhookConfig.findByIdAndUpdate(config._id, {
          $inc: { totalEvents: 1 },
          lastTriggered: new Date()
        });
        console.log(`Webhook sent successfully for event ${eventType}`);
      } else {
        console.error(`Failed to send webhook for event ${eventType}`);
      }

    } catch (error) {
      console.error('Error sending webhook:', error);
    }
  }

  private static getEventKey(eventType: string): string | null {
    const eventMapping: { [key: string]: string } = {
      // Message events
      'message.sent': 'messagesSent',
      'message.delivered': 'messagesDelivered',
      'message.read': 'messagesRead',
      'message.failed': 'messagesFailed',
      'message.button_click': 'messagesButtonClick',
      'message.completed_flow': 'messagesCompletedFlow',
      
      // Campaign events
      'campaign.sent': 'campaignsSent',
      'campaign.delivered': 'campaignsDelivered',
      'campaign.read': 'campaignsRead',
      'campaign.failed': 'campaignsFailed',
      'campaign.completed_flow': 'campaignsCompletedFlow',
      
      // Customer messages
      'customer.message': 'customerMessages',
      'workflow.response': 'workflowResponses',
      
      // Account events
      'account.alert': 'accountAlerts',
      'account.update': 'accountUpdate',
      'account.review_update': 'accountReviewUpdate',
      'business.capability_update': 'businessCapabilityUpdate',
      'phone.quality_update': 'phoneNumberQualityUpdate',
      
      // Template events
      'template.performance_metrics': 'templatePerformanceMetrics',
      'template.status_update': 'templateStatusUpdate',
      'template.messages': 'messages',
      
      // Commerce events
      'commerce.cart_order': 'cartsAndOrders',
      'payment.confirmation': 'paymentConfirmations',
      'payment.failure': 'paymentFailures',
    };

    return eventMapping[eventType] || null;
  }

  // Convenience methods for common events
  static async sendMessageEvent(
    userId: string,
    wabaId: string,
    eventType: 'sent' | 'delivered' | 'read' | 'failed',
    messageData: any
  ): Promise<void> {
    await this.sendEvent(userId, wabaId, `message.${eventType}`, {
      message: messageData,
      timestamp: new Date().toISOString()
    });
  }

  static async sendCampaignEvent(
    userId: string,
    wabaId: string,
    eventType: 'sent' | 'delivered' | 'read' | 'failed',
    campaignData: any
  ): Promise<void> {
    await this.sendEvent(userId, wabaId, `campaign.${eventType}`, {
      campaign: campaignData,
      timestamp: new Date().toISOString()
    });
  }

  static async sendCustomerMessage(
    userId: string,
    wabaId: string,
    messageData: any
  ): Promise<void> {
    await this.sendEvent(userId, wabaId, 'customer.message', {
      message: messageData,
      contact: messageData.contact,
      timestamp: new Date().toISOString()
    });
  }

  static async sendWorkflowResponse(
    userId: string,
    wabaId: string,
    workflowData: any
  ): Promise<void> {
    await this.sendEvent(userId, wabaId, 'workflow.response', {
      workflow: workflowData,
      timestamp: new Date().toISOString()
    });
  }
}