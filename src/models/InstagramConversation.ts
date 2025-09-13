import mongoose, { Document, Schema } from 'mongoose';

export interface IInstagramMessage {
  id: string;
  senderId: 'customer' | 'agent' | 'system';
  content: string;
  messageType: 'text' | 'image' | 'story_reply' | 'story_mention' | 'media_share' | 'reaction' | 'system';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  instagramMessageId?: string;
  senderName?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  storyId?: string; // For story replies
  replyToMessageId?: string;
  reaction?: string; // For reactions
  errorMessage?: string;
  errorCode?: string;
  retryCount?: number;
}

export interface IInstagramConversation extends Document {
  instagramUserId: string; // Instagram User ID (IGSID)
  instagramUsername?: string;
  instagramAccountId: string; // Our Instagram Business Account ID
  userId: mongoose.Types.ObjectId; // ZapTick user
  companyId: mongoose.Types.ObjectId;
  messages: IInstagramMessage[];
  lastMessage?: string;
  lastMessageType?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  status: 'active' | 'archived' | 'blocked';
  isWithin24Hours: boolean; // Important for Instagram API restrictions
  tags?: string[];
  notes?: string;
  customerInfo?: {
    profilePictureUrl?: string;
    fullName?: string;
    isVerified?: boolean;
    followerCount?: number;
  };
}

const InstagramConversationSchema = new Schema<IInstagramConversation>(
  {
    instagramUserId: {
      type: String,
      required: true
    },
    instagramUsername: String,
    instagramAccountId: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    messages: [{
      id: { type: String, required: true },
      senderId: {
        type: String,
        enum: ['customer', 'agent', 'system'],
        required: true
      },
      content: { type: String, required: true },
      messageType: {
        type: String,
        enum: ['text', 'image', 'story_reply', 'story_mention', 'media_share', 'reaction', 'system'],
        default: 'text'
      },
      timestamp: { type: Date, required: true },
      status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed'],
        default: 'sent'
      },
      instagramMessageId: String,
      senderName: String,
      mediaUrl: String,
      mediaType: {
        type: String,
        enum: ['image', 'video']
      },
      storyId: String,
      replyToMessageId: String,
      reaction: String,
      errorMessage: String,
      errorCode: String,
      retryCount: { type: Number, default: 0 }
    }],
    lastMessage: String,
    lastMessageType: String,
    lastMessageAt: Date,
    unreadCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'archived', 'blocked'],
      default: 'active'
    },
    isWithin24Hours: { type: Boolean, default: true },
    tags: [String],
    notes: String,
    customerInfo: {
      profilePictureUrl: String,
      fullName: String,
      isVerified: Boolean,
      followerCount: Number
    }
  },
  { timestamps: true }
);

// Create indexes for efficient queries
InstagramConversationSchema.index({ instagramUserId: 1, instagramAccountId: 1 }, { unique: true });
InstagramConversationSchema.index({ userId: 1 });
InstagramConversationSchema.index({ lastMessageAt: -1 });

export default mongoose.models.InstagramConversation || mongoose.model<IInstagramConversation>('InstagramConversation', InstagramConversationSchema);