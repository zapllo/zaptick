import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  businessType: string;
  industry: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  website?: string;
  logo?: string;
  phoneNumber: string;
  email: string;
  vatNumber?: string;
  registrationNumber?: string;
  subscriptionPlan: 'free' | 'starter' | 'growth' | 'enterprise';
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'cancelled';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  billingCycle: 'monthly' | 'annually';
  billingEmail: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod?: {
    type: 'card' | 'banktransfer' | 'paypal';
    details: any;
  };
  messagingLimit: number;
  messagesUsed: number;
  apiKey?: string;
  whatsappBusinessAccounts: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  businessType: {
    type: String,
    required: [true, 'Please specify business type']
  },
  industry: {
    type: String,
    required: [true, 'Please specify industry']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please add a street address']
    },
    city: {
      type: String,
      required: [true, 'Please add a city']
    },
    state: {
      type: String,
      required: [true, 'Please add a state/province']
    },
    postalCode: {
      type: String,
      required: [true, 'Please add a postal code']
    },
    country: {
      type: String,
      required: [true, 'Please add a country']
    }
  },
  website: String,
  logo: String,
  phoneNumber: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  vatNumber: String,
  registrationNumber: String,
  subscriptionPlan: {
    type: String,
    enum: ['free', 'starter', 'growth', 'enterprise'],
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'trial', 'expired', 'cancelled'],
    default: 'trial'
  },
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  billingCycle: {
    type: String,
    enum: ['monthly', 'annually'],
    default: 'monthly'
  },
  billingEmail: {
    type: String,
    required: [true, 'Please add a billing email']
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'banktransfer', 'paypal']
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  messagingLimit: {
    type: Number,
    default: 1000
  },
  messagesUsed: {
    type: Number,
    default: 0
  },
  apiKey: String,
  whatsappBusinessAccounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsAppBusinessAccount'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
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

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
