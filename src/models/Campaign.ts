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
    },
    message: {
      template: {
        type: String,
        default: "",
      },
      variables: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
      },
    },
    responseHandling: {
      enabled: {
        type: Boolean,
        default: false,
      },
      flows: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
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
      },
      count: {
        type: Number,
        default: 3,
      },
      interval: {
        type: Number, // in minutes
        default: 60,
      },
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "paused", "completed", "failed"],
      default: "draft",
    },
    stats: {
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
    },
  },
  { timestamps: true }
);

// Only create the model if it doesn't already exist
export default mongoose.models.Campaign ||
  mongoose.model("Campaign", CampaignSchema);
