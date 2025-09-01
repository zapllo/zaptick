import mongoose, { Document, Schema } from 'mongoose';

export interface IInstagramAccount extends Document {
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  instagramBusinessId: string;
  instagramAccountId: string;
  username: string;
  name: string;
  profilePictureUrl?: string;
  followersCount?: number;
  followsCount?: number;
  mediaCount?: number;
  biography?: string;
  website?: string;
  accessToken: string;
  pageId: string; // Facebook Page ID connected to Instagram
  pageName: string;
  pageAccessToken: string;
  connectedAt: Date;
  status: 'active' | 'disconnected' | 'pending' | 'expired';
  lastSyncAt?: Date;
  permissions: string[];
  tokenExpiresAt?: Date;
}

const InstagramAccountSchema = new Schema<IInstagramAccount>(
  {
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
    instagramBusinessId: {
      type: String,
      required: true,
      unique: true
    },
    instagramAccountId: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    profilePictureUrl: String,
    followersCount: Number,
    followsCount: Number,
    mediaCount: Number,
    biography: String,
    website: String,
    accessToken: {
      type: String,
      required: true
    },
    pageId: {
      type: String,
      required: true
    },
    pageName: {
      type: String,
      required: true
    },
    pageAccessToken: {
      type: String,
      required: true
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'disconnected', 'pending', 'expired'],
      default: 'active'
    },
    lastSyncAt: Date,
    permissions: [String],
    tokenExpiresAt: Date
  },
  { timestamps: true }
);

export default mongoose.models.InstagramAccount || mongoose.model<IInstagramAccount>('InstagramAccount', InstagramAccountSchema);