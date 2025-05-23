import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  company: mongoose.Types.ObjectId;
  contact: mongoose.Types.ObjectId;
  wabaPhoneNumber: string;
  wabaId: mongoose.Types.ObjectId;
  startTimestamp: Date;
  endTimestamp?: Date;
  status: 'active' | 'closed' | 'resolved';
  assignedTo?: mongoose.Types.ObjectId;
  lastAssigned?: {
    user: mongoose.Types.ObjectId;
    timestamp: Date;
  };
  messageCount: number;
  lastMessage?: {
    content: string;
    timestamp: Date;
    direction: 'inbound' | 'outbound';
  };
  tags: string[];
  labels: mongoose.Types.ObjectId[];
  notes: {
    text: string;
    addedBy: mongoose.Types.ObjectId;
    timestamp: Date;
  }[];
  isFollowUpRequired: boolean;
  followUpDate?: Date;
  firstResponseTime?: number; // in milliseconds
  resolution?: {
    resolvedBy: mongoose.Types.ObjectId;
    timestamp: Date;
    reason?: string;
  };
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  wabaPhoneNumber: {
    type: String,
    required: true
  },
  wabaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsAppBusinessAccount',
    required: true
  },
  startTimestamp: {
    type: Date,
    default: Date.now
  },
  endTimestamp: Date,
  status: {
    type: String,
    enum: ['active', 'closed', 'resolved'],
    default: 'active'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastAssigned: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    _id: false
  },
  messageCount: {
    type: Number,
    default: 0
  },
  lastMessage: {
    content: String,
    timestamp: Date,
    direction: {
      type: String,
      enum: ['inbound', 'outbound']
    },
    _id: false
  },
  tags: [String],
  labels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Label'
  }],
  notes: [{
    text: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isFollowUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  firstResponseTime: Number,
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    reason: String,
    _id: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
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

// Create compound index for company + contact
ConversationSchema.index({ company: 1, contact: 1 });
// Create index for assigned agent and status for quick filtering
ConversationSchema.index({ assignedTo: 1, status: 1 });

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
