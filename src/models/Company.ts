import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  address?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string; // Add location field
  category?: string; // Add category field
  phone?: string; // Add phone field
  countryCode?: string; // Add country code field
  walletBalance: number;
  aiCredits: number; // Add AI credits field
  currency?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: 'active' | 'expired' | 'cancelled';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  billingCycle?: 'monthly' | 'quarterly' | 'yearly';
  lastPaymentId?: string;
  lastPaymentAmount?: number;
  lastPaymentDate?: Date;
  createdAt: Date;
  logo?: string;
  updatedAt: Date;
  // WhatsApp Business Profile data
  whatsappProfile: {
    about?: string;
    profilePictureUrl?: string;
    profilePictureHandle?: string;
    email?: string;
    website?: string;
    address?: string;
    businessCategory?: string;
    businessDescription?: string;
    lastUpdated?: Date;
  };
  // WhatsApp Business Account settings per WABA
  wabaSettings: Array<{
    wabaId: string;
    businessName?: string;
    businessCategory?: string;
    businessDescription?: string;
    profilePictureUrl?: string;
    profilePictureHandle?: string;
    lastSyncAt?: Date;
  }>;
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
    location: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    countryCode: {
      type: String,
      trim: true,
    },
    logo: {
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
    category: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
      default: 'INR'
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    aiCredits: {
      type: Number,
      default: 10, // Give 10 free AI credits to start
      min: 0
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'starter', 'growth', 'advanced', 'enterprise'],
      default: 'free'
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'expired'
    },
    subscriptionStartDate: {
      type: Date
    },
    subscriptionEndDate: {
      type: Date
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly']
    },
    lastPaymentId: {
      type: String
    },
    lastPaymentAmount: {
      type: Number
    },
    lastPaymentDate: {
      type: Date
    },
    whatsappProfile: {
      about: String,
      profilePictureUrl: String,
      profilePictureHandle: String,
      email: String,
      website: String,
      address: String,
      businessCategory: String,
      businessDescription: String,
      lastUpdated: Date
    },
    wabaSettings: [{
      wabaId: {
        type: String,
        required: true
      },
      businessName: String,
      businessCategory: String,
      businessDescription: String,
      profilePictureUrl: String,
      profilePictureHandle: String,
      lastSyncAt: Date
    }]
  },
  { timestamps: true }
);

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);