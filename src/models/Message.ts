
import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  company: mongoose.Types.ObjectId;
  wabaId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  contact: mongoose.Types.ObjectId;
  waMessageId: string;
  direction: 'inbound' | 'outbound';
  messageType: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact' | 'template' | 'interactive' | 'sticker' | 'reaction';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  content: {
    text?: string;
    caption?: string;
    mediaUrl?: string;
    mediaType?: string;
    mediaSize?: number;
    fileName?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    contactName?: string;
    contactPhone?: string;
    templateName?: string;
    templateLanguage?: string;
    templateParams?: any[];
    interactiveType?: 'button' | 'list';
    interactiveContent?: any;
    stickerUrl?: string;
    reactionEmoji?: string;
    reactionMessageId?: string;
  };
  metadata: {
    metaWaId?: string;
    templateMessageName?: string;
    templateMessageId?: string;
    buttonText?: string;
    contextMessageId?: string;
  };
  sentTimestamp: Date;
  deliveredTimestamp?: Date;
  readTimestamp?: Date;
  errorInfo?: {
    code: string;
    title: string;
    message: string;
    parameters?: any[];
  };
  sentBy?: mongoose.Types.ObjectId;
  cost?: number;
  labels?: mongoose.Types.ObjectId[];
  fromMe: boolean;
  isMarketing: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
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
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  waMessageId: {
    type: String,
    required: true,
    unique: true
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'audio', 'video', 'document', 'location', 'contact', 'template', 'interactive', 'sticker', 'reaction'],
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  content: {
    text: String,
    caption: String,
    mediaUrl: String,
    mediaType: String,
    mediaSize: Number,
    fileName: String,
    latitude: Number,
    longitude: Number,
    address: String,
    contactName: String,
    contactPhone: String,
    templateName: String,
    templateLanguage: String,
    templateParams: [mongoose.Schema.Types.Mixed],
    interactiveType: {
      type: String,
      enum: ['button', 'list']
    },
    interactiveContent: mongoose.Schema.Types.Mixed,
    stickerUrl: String,
    reactionEmoji: String,
    reactionMessageId: String
  },
  metadata: {
    metaWaId: String,
    templateMessageName: String,
    templateMessageId: String,
    buttonText: String,
    contextMessageId: String
  },
  sentTimestamp: {
    type: Date,
    required: true
  },
  deliveredTimestamp: Date,
  readTimestamp: Date,
  errorInfo: {
    code: String,
    title: String,
    message: String,
    parameters: [mongoose.Schema.Types.Mixed]
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cost: Number,
  labels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Label'
  }],
  fromMe: {
    type: Boolean,
    required: true
  },
  isMarketing: {
    type: Boolean,
    default: false
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

// Create compound indexes for efficient queries
MessageSchema.index({ conversationId: 1, sentTimestamp: 1 });
MessageSchema.index({ wabaId: 1, contact: 1 });
MessageSchema.index({ company: 1, sentTimestamp: -1 });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
