import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  id: string;
  senderId: 'customer' | 'agent' | 'system'; // Added 'system' as valid sender
  content: string;
  messageType: 'text' | 'image' | 'video' | 'document' | 'audio' | 'template' | 'system' | 'note'; // Added 'system' and 'note'
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  whatsappMessageId?: string;
  templateName?: string;


  /*  NEW  */
  mediaId?: string;        // original WA media-id
  mediaUrl?: string;       // **permanent S3 URL**
  mimeType?: string;
  fileName?: string;
  mediaCaption?: string;

  senderName?: string; // Added senderName for displaying who sent the message
}

export interface IConversation extends Document {
  contactId: mongoose.Types.ObjectId;
  wabaId: string;
  phoneNumberId: string;
  userId: string;
  messages: IMessage[];
  labels?: string[];
  status: 'active' | 'closed' | 'resolved' | 'pending'; // Added 'pending' status
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
  senderId: { type: String, enum: ['customer', 'agent', 'system'], required: true }, // Added 'system'
  content: { type: String, required: true },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'document', 'audio', 'template', 'system', 'note'], // Added 'system' and 'note'
    default: 'text'
  },
  replyTo: {
    type: String,
    default: null
  },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  whatsappMessageId: String,
  templateName: String,
  mediaId: String,
  mediaUrl: String,
  mimeType: String,
  fileName: String,
  mediaCaption: String,
  senderName: String // Added senderName field
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
  labels: [String],
  status: {
    type: String,
    enum: ['active', 'closed', 'resolved', 'pending'], // Added 'pending'
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
