import mongoose, { Document, Schema } from 'mongoose';

export interface IWebhookConfig extends Document {
    userId: string;
    wabaId: string;
    webhookUrl: string;
    secretKey: string;
    isActive: boolean;
    events: {
        accountAlerts: boolean;
        accountUpdate: boolean;
        accountReviewUpdate: boolean;
        businessCapabilityUpdate: boolean;
        phoneNumberQualityUpdate: boolean;
        templatePerformanceMetrics: boolean;
        templateStatusUpdate: boolean;
        messages: boolean;
        messagesSent: boolean;
        messagesDelivered: boolean;
        messagesRead: boolean;
        messagesFailed: boolean;
        messagesButtonClick: boolean;
        messagesCompletedFlow: boolean;
        campaignsSent: boolean;
        campaignsDelivered: boolean;
        campaignsRead: boolean;
        campaignsFailed: boolean;
        campaignsCompletedFlow: boolean;
        cartsAndOrders: boolean;
        paymentConfirmations: boolean;
        paymentFailures: boolean;
        customerMessages: boolean;
        workflowResponses: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
    lastTriggered?: Date;
    totalEvents: number;
}

const WebhookConfigSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    wabaId: {
        type: String,
        required: true
    },
    webhookUrl: {
        type: String,
        required: true,
        validate: {
            validator: function (v: string) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Webhook URL must include http:// or https://'
        }
    },
    secretKey: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    events: {
        // Account Alerts & Events
        accountAlerts: { type: Boolean, default: false },
        accountUpdate: { type: Boolean, default: false },
        accountReviewUpdate: { type: Boolean, default: false },
        businessCapabilityUpdate: { type: Boolean, default: false },
        phoneNumberQualityUpdate: { type: Boolean, default: false },

        // Template Alerts & Events
        templatePerformanceMetrics: { type: Boolean, default: false },
        templateStatusUpdate: { type: Boolean, default: false },
        messages: { type: Boolean, default: false },

        // Template Messages Sent via API
        messagesSent: { type: Boolean, default: true },
        messagesDelivered: { type: Boolean, default: true },
        messagesRead: { type: Boolean, default: true },
        messagesFailed: { type: Boolean, default: true },
        messagesButtonClick: { type: Boolean, default: true },
        messagesCompletedFlow: { type: Boolean, default: false },

        // Template Messages sent via Zaptick Campaigns
        campaignsSent: { type: Boolean, default: true },
        campaignsDelivered: { type: Boolean, default: true },
        campaignsRead: { type: Boolean, default: true },
        campaignsFailed: { type: Boolean, default: true },
        campaignsCompletedFlow: { type: Boolean, default: false },

        // WhatsApp Carts & Orders
        cartsAndOrders: { type: Boolean, default: false },

        // Payment Confirmations
        paymentConfirmations: { type: Boolean, default: false },
        paymentFailures: { type: Boolean, default: false },

        // Others
        customerMessages: { type: Boolean, default: false },
        workflowResponses: { type: Boolean, default: false }
    },
    lastTriggered: Date,
    totalEvents: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient queries
WebhookConfigSchema.index({ userId: 1, wabaId: 1 }, { unique: true });

export default mongoose.models.WebhookConfig || mongoose.model<IWebhookConfig>('WebhookConfig', WebhookConfigSchema);