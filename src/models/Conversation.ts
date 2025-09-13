import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  id: string;
  senderId: 'customer' | 'agent' | 'system';
  content: string;
  messageType: 'text' | 'image' | 'video' | 'document' | 'audio' | 'template' | 'system' | 'note' | 'interactive' | 'unsupported';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  whatsappMessageId?: string;
  templateName?: string;
  replyTo?: string;

  /*  MEDIA  */
  mediaId?: string;
  mediaUrl?: string;
  mimeType?: string;
  fileName?: string;
  mediaCaption?: string;

  /*  INTERACTIVE  */
  interactiveData?: {
    type: 'button_reply' | 'list_reply';
    id: string;
    title: string;
    description?: string;
  };

  /*  ERROR HANDLING  */
  errorMessage?: string;
  errorCode?: string;
  retryCount?: number;

  senderName?: string;
}

export interface IConversation extends Document {
  contactId: mongoose.Types.ObjectId;
  wabaId: string;
  phoneNumberId: string;
  userId: string;
  messages: IMessage[];
  labels?: string[];
  status: 'active' | 'closed' | 'resolved' | 'pending';
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
  id: { 
    type: String, 
    required: true 
  },
  senderId: { 
    type: String, 
    enum: ['customer', 'agent', 'system'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'document', 'audio', 'template', 'system', 'note', 'interactive', 'unsupported'],
    default: 'text'
  },
  replyTo: {
    type: String,
    default: null
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  whatsappMessageId: {
    type: String,
    sparse: true // Allow null/undefined values but create index for existing values
  },
  templateName: String,
  
  // Media fields
  mediaId: String,
  mediaUrl: String,
  mimeType: String,
  fileName: String,
  mediaCaption: String,
  
  // Interactive message data
  interactiveData: {
    type: {
      type: String,
      enum: ['button_reply', 'list_reply']
    },
    id: String,
    title: String,
    description: String
  },
  
  // Error handling fields - PROPERLY DEFINED
  errorMessage: {
    type: String,
    default: null
  },
  errorCode: {
    type: String,
    default: null
  },
  retryCount: { 
    type: Number, 
    default: 0 
  },
  
  senderName: String
}, {
  _id: false // Disable automatic _id for subdocuments to avoid conflicts
});

const ConversationSchema = new Schema({
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true,
    index: true
  },
  wabaId: {
    type: String,
    required: true,
    index: true
  },
  phoneNumberId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  messages: [MessageSchema],
  labels: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'resolved', 'pending'],
    default: 'active',
    index: true
  },
  assignedTo: {
    type: String,
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageType: {
    type: String,
    default: 'text'
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String],
    default: []
  },
  isWithin24Hours: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  // Add collection-level indexing options
  collection: 'conversations'
});

// Create compound indexes for efficient queries
ConversationSchema.index({ userId: 1, lastMessageAt: -1 });
ConversationSchema.index({ contactId: 1, userId: 1 });
ConversationSchema.index({ wabaId: 1, status: 1 });
ConversationSchema.index({ userId: 1, status: 1, lastMessageAt: -1 });
ConversationSchema.index({ 'messages.whatsappMessageId': 1 }, { sparse: true });

// Add a method to find messages by WhatsApp message ID
ConversationSchema.methods.findMessageByWhatsAppId = function(whatsappMessageId: string) {
  return this.messages.find((msg: any) => msg.whatsappMessageId === whatsappMessageId);
};

// Add a method to update message status
ConversationSchema.methods.updateMessageStatus = function(
  whatsappMessageId: string, 
  status: string, 
  errorMessage?: string, 
  errorCode?: string
) {
  const message = this.findMessageByWhatsAppId(whatsappMessageId);
  if (message) {
    message.status = status;
    if (status === 'failed') {
      message.errorMessage = errorMessage || 'Message delivery failed';
      message.errorCode = errorCode || 'unknown';
      message.retryCount = (message.retryCount || 0) + 1;
    }
    return true;
  }
  return false;
};

// Add a static method to find conversations with failed messages
ConversationSchema.statics.findWithFailedMessages = function() {
  return this.find({
    'messages.status': 'failed'
  });
};

// Pre-save middleware to ensure data consistency
ConversationSchema.pre('save', function(next) {
  // Ensure unreadCount is never negative
  if (this.unreadCount < 0) {
    this.unreadCount = 0;
  }
  
  // Update isWithin24Hours based on lastMessageAt
  if (this.lastMessageAt) {
    this.isWithin24Hours = this.lastMessageAt.getTime() > (Date.now() - 24 * 60 * 60 * 1000);
  }
  
  // Ensure all messages have required fields
  this.messages.forEach((message: any) => {
    if (!message.id) {
      message.id = new mongoose.Types.ObjectId().toString();
    }
    if (!message.timestamp) {
      message.timestamp = new Date();
    }
    if (!message.status) {
      message.status = 'sent';
    }
    if (typeof message.retryCount !== 'number') {
      message.retryCount = 0;
    }
  });
  
  next();
});

// Post-save middleware for logging
ConversationSchema.post('save', function(doc) {
  const failedMessages = doc.messages.filter((msg: any) => msg.status === 'failed');
  if (failedMessages.length > 0) {
    console.log(`Conversation ${doc._id} has ${failedMessages.length} failed messages`);
  }
});

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);