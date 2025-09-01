import mongoose, { Document, Schema } from 'mongoose';

export interface IInstagramComment extends Document {
  commentId: string;
  parentId?: string; // For comment replies
  mediaId: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'carousel';
  instagramAccountId: string; // Our Instagram Business Account
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  authorId: string; // Instagram User ID of commenter
  authorUsername: string;
  authorProfilePic?: string;
  text: string;
  timestamp: Date;
  isHidden: boolean;
  likeCount?: number;
  replies?: {
    commentId: string;
    authorId: string;
    authorUsername: string;
    text: string;
    timestamp: Date;
    isFromBusiness: boolean;
  }[];
  businessReply?: {
    commentId: string;
    text: string;
    timestamp: Date;
    status: 'sent' | 'failed';
    agentName: string;
  };
  sentiment?: 'positive' | 'negative' | 'neutral';
  tags?: string[];
  status: 'new' | 'replied' | 'ignored' | 'escalated';
  assignedTo?: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high';
}

const InstagramCommentSchema = new Schema<IInstagramComment>(
  {
    commentId: {
      type: String,
      required: true,
      unique: true
    },
    parentId: String,
    mediaId: {
      type: String,
      required: true
    },
    mediaUrl: String,
    mediaType: {
      type: String,
      enum: ['image', 'video', 'carousel'],
      required: true
    },
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
    authorId: {
      type: String,
      required: true
    },
    authorUsername: {
      type: String,
      required: true
    },
    authorProfilePic: String,
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    },
    isHidden: {
      type: Boolean,
      default: false
    },
    likeCount: Number,
    replies: [{
      commentId: String,
      authorId: String,
      authorUsername: String,
      text: String,
      timestamp: Date,
      isFromBusiness: Boolean
    }],
    businessReply: {
      commentId: String,
      text: String,
      timestamp: Date,
      status: {
        type: String,
        enum: ['sent', 'failed']
      },
      agentName: String
    },
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    },
    tags: [String],
    status: {
      type: String,
      enum: ['new', 'replied', 'ignored', 'escalated'],
      default: 'new'
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  { timestamps: true }
);

// Create indexes
InstagramCommentSchema.index({ instagramAccountId: 1, timestamp: -1 });
InstagramCommentSchema.index({ status: 1 });
InstagramCommentSchema.index({ mediaId: 1 });

export default mongoose.models.InstagramComment || mongoose.model<IInstagramComment>('InstagramComment', InstagramCommentSchema);