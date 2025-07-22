import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["one-time", "ongoing"],
      default: "one-time",
    },
    audience: {
      filters: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      count: {
        type: Number,
        default: 0,
      },
      selectedContacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact"
      }]
    },
    message: {
      type: {
        type: String,
        enum: ["template", "custom"],
        default: "template"
      },
      template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Template"
      },
      templateName: String,
      templateCategory: String,
      customMessage: String,
      variables: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
      },
    },
    responseHandling: {
      enabled: { type: Boolean, default: false },

      // Auto-reply configuration
      autoReply: {
        enabled: { type: Boolean, default: false },
        message: String,
        templateId: String,
        templateName: String,
        delay: { type: Number, default: 0 } // delay in minutes
      },

      // Workflow configuration
      workflow: {
        enabled: { type: Boolean, default: false },
        workflowId: String,
        workflowName: String,
        triggerDelay: { type: Number, default: 0 } // delay in minutes
      },

      // Opt-out configuration
      optOut: {
        enabled: { type: Boolean, default: false },
        triggerButtons: [String], // Button IDs that trigger opt-out
        acknowledgmentMessage: String,
        updateContact: { type: Boolean, default: true }
      },
    },
    conversionTracking: {
      enabled: {
        type: Boolean,
        default: false,
      },
      goals: {
        type: [String],
        default: [],
      },
      methods: {
        type: [String],
        default: ["link"]
      },
      attributionWindow: {
        type: Number,
        default: 7
      }
    },
    schedule: {
      sendTime: {
        type: Date,
      },
      timezone: {
        type: String,
        default: "UTC",
      },
    },
    retries: {
      enabled: {
        type: Boolean,
        default: false,
        count: {
          type: Number,
          default: 3,
          min: 1,
          max: 5
        },
        interval: {
          type: Number, // in days instead of minutes
          default: 1,
          min: 1,
          max: 30 // maximum 30 days
        },
        customStartDate: {
          type: Date, // for custom retry start date
          default: null
        }
      },
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "paused", "completed", "failed", "cancelled"],
      default: "draft",
    },
    pricing: {
      messagePrice: Number,
      totalCost: Number,
      messagePriceDetails: mongoose.Schema.Types.Mixed
    },
    stats: {
      total: {
        type: Number,
        default: 0,
      },
      sent: {
        type: Number,
        default: 0,
      },
      delivered: {
        type: Number,
        default: 0,
      },
      read: {
        type: Number,
        default: 0,
      },
      replied: {
        type: Number,
        default: 0,
      },
      failed: {
        type: Number,
        default: 0,
      },
      conversions: {
        type: Number,
        default: 0,
      },
      messages: [{
        contactId: String,
        messageId: String,
        whatsappMessageId: String,
        sentAt: Date,
        deliveredAt: Date,
        readAt: Date,
        repliedAt: Date,
        failedAt: Date,
        error: String,
        status: {
          type: String,
          enum: ["sent", "delivered", "read", "replied", "failed"],
          default: "sent"
        },
        retryCount: {
          type: Number,
          default: 0
        },
        lastRetryAt: Date,
        nextRetryAt: Date,
        maxRetriesReached: {
          type: Boolean,
          default: false
        }
      }],

      processing: {
        type: Boolean,
        default: false
      },
      // Add opt-out tracking
      optOuts: { type: Number, default: 0 },
      optOutEvents: [{
        contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
        contactPhone: String,
        timestamp: { type: Date, default: Date.now },
        campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }
      }],

      // Add response tracking
      responses: { type: Number, default: 0 },
      autoRepliesSent: { type: Number, default: 0 },
      workflowsTriggered: { type: Number, default: 0 },
      processStartedAt: Date,
      lastProcessedAt: Date,
      completedAt: Date,
      failedAt: Date,
      failureReason: String,
      cancelledAt: Date,
      cancelReason: String,
      pausedAt: Date,        // New field
      pauseReason: String,   // New field
      resumedAt: Date,       // New field
      nextBatchIndex: Number,
      currentBatch: Number,
      totalBatches: Number
    },
  },
  { timestamps: true }
);
// Add indexes for efficient retry queries
CampaignSchema.index({ 'stats.messages.status': 1 });
CampaignSchema.index({ 'stats.messages.nextRetryAt': 1 });
CampaignSchema.index({ 'stats.messages.maxRetriesReached': 1 });
CampaignSchema.index({ 'retries.enabled': 1 });

// Only create the model if it doesn't already exist
export default mongoose.models.Campaign ||
  mongoose.model("Campaign", CampaignSchema);