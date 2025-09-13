import mongoose from "mongoose";

const WalletTransactionSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit", "refund"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    description: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
    },
    referenceType: {
      type: String,
      enum: ["campaign", "message", "subscription", "manual", "other", "template", "refund"],
    },
    // ** FIXED: Allow both ObjectId and String for referenceId **
    referenceId: {
      type: mongoose.Schema.Types.Mixed, // This allows both ObjectId and String
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      // Enhanced metadata structure for template messages:
      // {
      //   templateName: String,
      //   templateType: 'marketing' | 'authentication' | 'utility',
      //   recipientPhone: String,
      //   countryCode: String,
      //   currency: String,
      //   messageType: 'template',
      //   campaignId?: String,
      //   whatsappMessageId?: String,
      //   refundReason?: String (for refunds),
      //   originalTransactionId?: String (for refunds),
      //   messageSource: 'campaign' | 'individual' | 'auto_reply' | 'workflow',
      //   balanceBefore?: Number,
      //   balanceAfter?: Number,
      //   messageId?: String (UUID for individual messages)
      // }
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
WalletTransactionSchema.index({ companyId: 1, createdAt: -1 });
WalletTransactionSchema.index({ companyId: 1, type: 1 });
WalletTransactionSchema.index({ referenceType: 1, referenceId: 1 });
WalletTransactionSchema.index({ 'metadata.templateType': 1, 'metadata.countryCode': 1 });
WalletTransactionSchema.index({ 'metadata.campaignId': 1 });

export default mongoose.models.WalletTransaction ||
  mongoose.model("WalletTransaction", WalletTransactionSchema);