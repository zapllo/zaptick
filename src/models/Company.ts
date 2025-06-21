import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  address?: string;
  website?: string;
  industry?: string;
  size?: string;
  walletBalance: number;  // Add wallet balance to company
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      trim: true,
    },
    walletBalance: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
