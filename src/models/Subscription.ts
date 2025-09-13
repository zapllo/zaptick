import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  company: mongoose.Types.ObjectId;
  plan: 'free' | 'starter' | 'growth' | 'enterprise' | 'custom';
  status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  trialEndsAt?: Date;
  billingCycle: 'monthly' | 'annually';
  amount: number;
  currency: string;
  autoRenew: boolean;
  features: {
    messageLimit: number;
    userLimit: number;
    wabaLimit: number;
    templateLimit: number;
    chatbotEnabled: boolean;
    apiAccess: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    customFeatures?: string[];
  };
  paymentMethod?: {
    type: 'card' | 'banktransfer' | 'paypal';
    details?: any;
    lastFour?: string;
    expiryDate?: string;
  };
  cancelledAt?: Date;
  cancellationReason?: string;
  nextBillingDate?: Date;
  invoices: mongoose.Types.ObjectId[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'starter', 'growth', 'enterprise', 'custom'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'trialing', 'past_due', 'cancelled', 'expired'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: Date,
  trialEndsAt: Date,
  billingCycle: {
    type: String,
    enum: ['monthly', 'annually'],
    default: 'monthly'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  features: {
    messageLimit: {
      type: Number,
      required: true
    },
    userLimit: {
      type: Number,
      required: true
    },
    wabaLimit: {
      type: Number,
      required: true
    },
    templateLimit: {
      type: Number,
      required: true
    },
    chatbotEnabled: {
      type: Boolean,
      default: false
    },
    apiAccess: {
      type: Boolean,
      default: false
    },
    advancedAnalytics: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    customFeatures: [String]
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'banktransfer', 'paypal']
    },
    details: mongoose.Schema.Types.Mixed,
    lastFour: String,
    expiryDate: String
  },
  cancelledAt: Date,
  cancellationReason: String,
  nextBillingDate: Date,
  invoices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  }],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
