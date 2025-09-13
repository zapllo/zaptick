import mongoose, { Document, Schema } from 'mongoose';

export interface IAutoReply extends Document {
  userId: string;
  wabaId: string;
  name: string;
  isActive: boolean;
  triggers: string[]; // Array of trigger phrases/keywords
  replyMessage: string;
  replyType: 'text' | 'template' | 'workflow';
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: any[];
  matchType: 'exact' | 'contains' | 'starts_with' | 'ends_with';
  caseSensitive: boolean;
  priority: number; // Higher number = higher priority
  createdAt: Date;
  updatedAt: Date;
  usageCount: number; // Track how many times this auto reply was triggered
  lastTriggered?: Date;
}

const AutoReplySchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wabaId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  workflowId: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  triggers: [{
    type: String,
    required: true,
    trim: true
  }],
  replyMessage: {
    type: String,
    required: true
  },
  replyType: {
    type: String,
    enum: ['text', 'template', 'workflow'],
    default: 'text'
  },
  templateName: String,
  templateLanguage: {
    type: String,
    default: 'en'
  },
  templateComponents: [Schema.Types.Mixed],
  matchType: {
    type: String,
    enum: ['exact', 'contains', 'starts_with', 'ends_with'],
    default: 'contains'
  },
  caseSensitive: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastTriggered: Date
}, {
  timestamps: true
});

// Create indexes for efficient queries
AutoReplySchema.index({ userId: 1, wabaId: 1 });
AutoReplySchema.index({ userId: 1, wabaId: 1, isActive: 1 });
AutoReplySchema.index({ priority: -1 });

export default mongoose.models.AutoReply || mongoose.model<IAutoReply>('AutoReply', AutoReplySchema);
