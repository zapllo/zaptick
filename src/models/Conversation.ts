import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  id: string;
  senderId: 'customer' | 'agent';
  content: string;
  messageType: 'text' | 'image' | 'video' | 'document' | 'audio' | 'template';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  whatsappMessageId?: string;
  templateName?: string;
  mediaUrl?: string;
  mediaCaption?: string;
}

export interface IConversation extends Document {
  contactId: mongoose.Types.ObjectId;
  wabaId: string;
  phoneNumberId: string;
  userId: string;
  messages: IMessage[];
  status: 'active' | 'closed' | 'resolved';
  assignedTo?: string;
  lastMessageAt: Date;
  lastMessage: string;
  lastMessageType: string;
  unreadCount: number;
  tags?: string[];
  isWithin24Hours: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  id: { type: String, required: true },
  senderId: { type: String, enum: ['customer', 'agent'], required: true },
  content: { type: String, required: true },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'document', 'audio', 'template'],
    default: 'text'
  },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  whatsappMessageId: String,
  templateName: String,
  mediaUrl: String,
  mediaCaption: String
});

const ConversationSchema = new Schema({
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  wabaId: {
    type: String,
    required: true
  },
  phoneNumberId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [MessageSchema],
  status: {
    type: String,
    enum: ['active', 'closed', 'resolved'],
    default: 'active'
  },
  assignedTo: String,
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  lastMessage: String,
  lastMessageType: {
    type: String,
    default: 'text'
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  isWithin24Hours: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for efficient queries
ConversationSchema.index({ userId: 1, lastMessageAt: -1 });
ConversationSchema.index({ contactId: 1 });
ConversationSchema.index({ wabaId: 1 });

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
