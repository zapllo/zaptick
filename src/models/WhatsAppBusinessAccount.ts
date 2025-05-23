import mongoose, { Schema, Document } from 'mongoose';

export interface IWABA extends Document {
  company: mongoose.Types.ObjectId;
  businessName: string;
  businessDescription?: string;
  industry: string;
  wabaId: string; // WhatsApp Business Account ID from Meta
  wabaCurrency: string;
  businessManagerId?: string;
  phoneNumbers: {
    phoneNumber: string;
    displayName: string;
    isVerified: boolean;
    qualityRating?: string;
    status: 'active' | 'pending' | 'inactive';
    whatsappBusinessPhoneNumberId: string;
  }[];
  businessVertical: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  email: string;
  website?: string;
  profilePicture?: string;
  messageTemplates: mongoose.Types.ObjectId[];
  webhookUrl?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationRejectionReason?: string;
  accessToken: string;
  accessTokenExpires: Date;
  refreshToken?: string;
  settings: {
    replyButtonText?: string;
    enableMarkAsSeen: boolean;
    defaultGreetingMessage?: string;
    defaultAwayMessage?: string;
    businessHours: {
      day: string;
      isOpen: boolean;
      openTime?: string;
      closeTime?: string;
    }[];
    autoResponders: boolean;
  };
  interaktConfig: {
    apiKey?: string;
    accountId?: string;
    integrationId?: string;
  };
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WABASchema: Schema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  businessName: {
    type: String,
    required: [true, 'Please add a business name'],
    trim: true
  },
  businessDescription: String,
  industry: {
    type: String,
    required: [true, 'Please specify industry']
  },
  wabaId: {
    type: String,
    required: [true, 'WhatsApp Business Account ID is required'],
    unique: true
  },
  wabaCurrency: {
    type: String,
    required: [true, 'Currency is required']
  },
  businessManagerId: String,
  phoneNumbers: [{
    phoneNumber: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    qualityRating: String,
    status: {
      type: String,
      enum: ['active', 'pending', 'inactive'],
      default: 'pending'
    },
    whatsappBusinessPhoneNumberId: {
      type: String,
      required: true
    }
  }],
  businessVertical: {
    type: String,
    required: [true, 'Business vertical is required']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  website: String,
  profilePicture: String,
  messageTemplates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessageTemplate'
  }],
  webhookUrl: String,
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verificationRejectionReason: String,
  accessToken: {
    type: String,
    required: [true, 'Access token is required']
  },
  accessTokenExpires: {
    type: Date,
    required: [true, 'Access token expiration is required']
  },
  refreshToken: String,
  settings: {
    replyButtonText: String,
    enableMarkAsSeen: {
      type: Boolean,
      default: true
    },
    defaultGreetingMessage: String,
    defaultAwayMessage: String,
    businessHours: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true
      },
      isOpen: {
        type: Boolean,
        default: true
      },
      openTime: String,
      closeTime: String
    }],
    autoResponders: {
      type: Boolean,
      default: false
    }
  },
  interaktConfig: {
    apiKey: String,
    accountId: String,
    integrationId: String,
  },
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

export default mongoose.models.WhatsAppBusinessAccount ||
  mongoose.model<IWABA>('WhatsAppBusinessAccount', WABASchema);
