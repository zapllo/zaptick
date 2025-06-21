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
      enum: ["campaign", "message", "subscription", "manual", "other"],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export default mongoose.models.WalletTransaction ||
  mongoose.model("WalletTransaction", WalletTransactionSchema);
