import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  category: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY' | 'CAROUSEL' | 'CAROUSEL_UTILITY' | 'LIMITED_TIME_OFFER';
  language: string;
  components?: {
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS' | 'CAROUSEL' | 'LIMITED_TIME_OFFER';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    text?: string;
    // Add S3 URL fields to components
    mediaUrl?: string; // S3 URL for media
    s3Handle?: string; // S3 handle
    example?: {
      header_text?: string[];
      body_text?: string[][];
      button_text?: string[][];
      header_handle?: string[];
    };
    buttons?: {
      type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE';
      text: string;
      url?: string;
      phone_number?: string;
      copy_code?: string;
      example?: string[];
    }[];
    // Updated carousel cards structure with S3 URLs
    cards?: {
      components?: {
        type: 'HEADER' | 'BODY' | 'BUTTONS';
        format?: 'IMAGE' | 'VIDEO' | 'TEXT';
        text?: string;
        // Add S3 URL fields to carousel card components
        mediaUrl?: string; // S3 URL for carousel card media
        s3Handle?: string; // S3 handle for carousel card media
        example?: {
          header_handle?: string[];
          body_text?: string[][];
        };
        buttons?: {
          type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
          text: string;
          url?: string;
          phone_number?: string;
          example?: string[];
        }[];
      }[];
    }[];
  }[];
  // Add limited time offer specific fields
  limited_time_offer?: {
    expiration_time_ms?: number;
  };
  // Add limited time offer settings
  offerSettings?: {
    expirationTimeMs: number;
    couponCode?: string;
  };
  wabaId: string;
  phoneNumberId: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED' | 'DELETED';
  whatsappTemplateId?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  lastUsed?: Date;
  useCount: number;
  authSettings?: {
    codeExpirationMinutes: number;
    codeLength: number;
    addCodeEntryOption?: boolean;
  };
}

const TemplateSchema = new Schema<ITemplate>(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      match: [/^[a-z0-9_]+$/, 'Template name can only contain lowercase letters, numbers, and underscores']
    },
    category: {
      type: String,
      required: [true, 'Template category is required'],
      enum: ['AUTHENTICATION', 'MARKETING', 'UTILITY', 'CAROUSEL', 'CAROUSEL_UTILITY', 'LIMITED_TIME_OFFER']
    },
    language: {
      type: String,
      required: [true, 'Template language is required'],
      default: 'en'
    },
    components: [{
      type: {
        type: String,
        required: true,
        enum: ['HEADER', 'BODY', 'FOOTER', 'BUTTONS', 'CAROUSEL', 'LIMITED_TIME_OFFER']
      },
      format: {
        type: String,
        enum: ['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT']
      },
      text: String,
      // Add S3 URL fields to component schema
      mediaUrl: String, // S3 URL for media
      s3Handle: String, // S3 handle
      example: {
        header_text: [String],
        body_text: [[String]],
        button_text: [[String]],
        header_handle: [String]
      },
      buttons: [{
        type: {
          type: String,
          enum: ['QUICK_REPLY', 'URL', 'PHONE_NUMBER', 'COPY_CODE']
        },
        text: String,
        url: String,
        phone_number: String,
        copy_code: String,
        example: [String]
      }],
      // Updated carousel cards schema with S3 URLs
      cards: [{
        components: [{
          type: {
            type: String,
            enum: ['HEADER', 'BODY', 'BUTTONS']
          },
          format: {
            type: String,
            enum: ['IMAGE', 'VIDEO', 'TEXT']
          },
          text: String,
          // Add S3 URL fields to carousel card component schema
          mediaUrl: String, // S3 URL for carousel card media
          s3Handle: String, // S3 handle for carousel card media
          example: {
            header_handle: [String],
            body_text: [[String]]
          },
          buttons: [{
            type: {
              type: String,
              enum: ['QUICK_REPLY', 'URL', 'PHONE_NUMBER']
            },
            text: String,
            url: String,
            phone_number: String,
            example: [String]
          }]
        }]
      }]
    }],
    wabaId: {
      type: String,
      required: [true, 'WABA ID is required']
    },
    phoneNumberId: {
      type: String,
      required: [true, 'Phone Number ID is required']
    },
    userId: {
      type: String,
      required: [true, 'User ID is required']
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'DISABLED', 'DELETED'],
      default: 'PENDING'
    },
    whatsappTemplateId: String,
    rejectionReason: String,
    approvedAt: Date,
    lastUsed: Date,
    useCount: {
      type: Number,
      default: 0
    },
    authSettings: {
      codeExpirationMinutes: {
        type: Number,
        default: 10
      },
      codeLength: {
        type: Number,
        default: 6
      },
      addCodeEntryOption: {
        type: Boolean,
        default: true
      }
    },
    // Add offer settings schema
    offerSettings: {
      expirationTimeMs: {
        type: Number
      },
      couponCode: {
        type: String
      }
    }
  },
  { timestamps: true }
);

// Index for efficient queries
TemplateSchema.index({ userId: 1, wabaId: 1 });
TemplateSchema.index({ status: 1 });

export default mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);