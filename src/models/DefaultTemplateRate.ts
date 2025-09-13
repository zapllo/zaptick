import mongoose from "mongoose";

const DefaultTemplateRateSchema = new mongoose.Schema(
  {
    countryCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    countryName: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR'
    },
    rates: {
      marketing: {
        interaktPrice: {
          type: Number,
          required: true,
          default: 0.25
        },
        marginPercentage: {
          type: Number,
          required: true,
          default: 20
        },
        platformPrice: {
          type: Number,
          required: true,
          default: 0.30
        }
      },
      authentication: {
        interaktPrice: {
          type: Number,
          required: true,
          default: 0.15
        },
        marginPercentage: {
          type: Number,
          required: true,
          default: 20
        },
        platformPrice: {
          type: Number,
          required: true,
          default: 0.18
        }
      },
      utility: {
        interaktPrice: {
          type: Number,
          required: true,
          default: 0.20
        },
        marginPercentage: {
          type: Number,
          required: true,
          default: 20
        },
        platformPrice: {
          type: Number,
          required: true,
          default: 0.24
        }
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: String,
      default: 'system'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Add indexes
DefaultTemplateRateSchema.index({ countryCode: 1 });
DefaultTemplateRateSchema.index({ isActive: 1 });

export default mongoose.models.DefaultTemplateRate || 
  mongoose.model("DefaultTemplateRate", DefaultTemplateRateSchema);