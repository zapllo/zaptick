import mongoose, { Schema, Document } from 'mongoose';

export interface IBroadcast extends Document {
  company: mongoose.Types.ObjectId;
  wabaId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
  messageTemplate: mongoose.Types.ObjectId;
  templateParameters?: {
    recipientId: string;
    parameters: {
      type: 'text' | 'image' | 'document' | 'video';
      parameter: string;
      value: string;
    }[];
  }[];
  scheduledTime?: Date;
  completedTime?: Date;
  timezone?: string;
  recipients: {
    list: mongoose.Types.ObjectId[];
    count: number;
    filter?: any;
  };
  analytics: {
    sent: number;
    delivered: number;
    read: number;
    clicked?: number;
    failed: number;
    deliveryRate?: number;
    readRate?: number;
    clickRate?: number;
  };
  failureDetails?: {
    recipientId: string;
    error: {
      code: string;
      message: string;
    };
  }[];
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BroadcastSchema: Schema = new Schema({
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
    required: [true, 'Broadcast name is required'],
    trim: true
  },
  description: String,
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled', 'failed'],
    default: 'draft'
  },
  messageTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessageTemplate',
    required: true
  },
  templateParameters: [{
    recipientId: {
      type: String,
      required: true
    },
    parameters: [{
      type: {
        type: String,
        enum: ['text', 'image', 'document', 'video'],
        default: 'text'
      },
      parameter: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      },
      _id: false
    }],
    _id: false
  }],
  scheduledTime: Date,
  completedTime: Date,
  timezone: {
    type: String,
    default: 'UTC'
  },
  recipients: {
    list: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    }],
    count: {
      type: Number,
      default: 0
    },
    filter: mongoose.Schema.Types.Mixed
  },
  analytics: {
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    read: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    },
    deliveryRate: Number,
    readRate: Number,
    clickRate: Number
  },
  failureDetails: [{
    recipientId: {
      type: String,
      required: true
    },
    error: {
      code: String,
      message: String
    },
    _id: false
  }],
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
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

export default mongoose.models.Broadcast || mongoose.model<IBroadcast>('Broadcast', BroadcastSchema);
