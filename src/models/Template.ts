import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  category: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY' | 'CAROUSEL' | 'CAROUSEL_UTILITY'; // Add CAROUSEL
  language: string;
  components?: {
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS' | 'CAROUSEL';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    text?: string;
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
    // Fix: Update carousel cards structure to match payload
    cards?: {
      components?: {
        type: 'HEADER' | 'BODY' | 'BUTTONS';
        format?: 'IMAGE' | 'VIDEO' | 'TEXT';
        text?: string;
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
    addCodeEntryOption?: boolean; // Add missing field
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
      enum: ['AUTHENTICATION', 'MARKETING', 'UTILITY', 'CAROUSEL','CAROUSEL_UTILITY'] // Add CAROUSEL
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
        enum: ['HEADER', 'BODY', 'FOOTER', 'BUTTONS', 'CAROUSEL']
      },
      format: {
        type: String,
        enum: ['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT']
      },
      text: String,
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
      // Fix: Update carousel cards schema to match the actual payload structure
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
      addCodeEntryOption: { // Add missing field
        type: Boolean,
        default: true
      }
    }
  },
  { timestamps: true }
);

// Index for efficient queries
TemplateSchema.index({ userId: 1, wabaId: 1 });
TemplateSchema.index({ status: 1 });

export default mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);