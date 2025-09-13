import mongoose, { Schema, Document } from 'mongoose';

export interface IMessageTemplate extends Document {
  company: mongoose.Types.ObjectId;
  wabaId: mongoose.Types.ObjectId;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DISABLED';
  rejectionReason?: string;
  components: {
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';
    text?: string;
    example?: {
      header_text?: string[];
      body_text?: string[][];
      media_url?: string[];
    };
    buttons?: {
      type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
      text: string;
      url?: string;
      phone_number?: string;
    }[];
  }[];
  templateId?: string; // Meta's template ID
  interaktTemplateId?: string; // Interakt's template ID
  submissionId?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  usageCount: number;
  successCount: number;
  failureCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageTemplateSchema: Schema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  wabaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsAppBusinessAccount',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['MARKETING', 'UTILITY', 'AUTHENTICATION'],
    required: [true, 'Template category is required']
  },
  language: {
    type: String,
    required: [true, 'Template language is required']
  },
  status: {
    type: String,
    enum: ['APPROVED', 'PENDING', 'REJECTED', 'DISABLED'],
    default: 'PENDING'
  },
  rejectionReason: String,
  components: [{
    type: {
      type: String,
      enum: ['HEADER', 'BODY', 'FOOTER', 'BUTTONS'],
      required: true
    },
    format: {
      type: String,
      enum: ['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION']
    },
    text: String,
    example: {
      header_text: [String],
      body_text: [[String]],
      media_url: [String]
    },
    buttons: [{
      type: {
        type: String,
        enum: ['QUICK_REPLY', 'URL', 'PHONE_NUMBER']
      },
      text: String,
      url: String,
      phone_number: String,
      _id: false
    }],
    _id: false
  }],
  templateId: String,
  interaktTemplateId: String,
  submissionId: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  tags: [String],
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

// Create compound index for wabaId and name for quick lookups
MessageTemplateSchema.index({ wabaId: 1, name: 1 }, { unique: true });

export default mongoose.models.MessageTemplate || mongoose.model<IMessageTemplate>('MessageTemplate', MessageTemplateSchema);
