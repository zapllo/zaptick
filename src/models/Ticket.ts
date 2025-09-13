import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  company: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo?: mongoose.Types.ObjectId;
  submittedBy: mongoose.Types.ObjectId;
  relatedTo?: {
    type: 'waba' | 'contact' | 'template' | 'broadcast' | 'conversation' | 'billing';
    id?: mongoose.Types.ObjectId;
  };
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  comments: {
    text: string;
    user: mongoose.Types.ObjectId;
    timestamp: Date;
    isPrivate: boolean;
    attachments?: {
      name: string;
      url: string;
      type: string;
      size: number;
    }[];
  }[];
  resolutionSummary?: string;
  closedAt?: Date;
  dueDate?: Date;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema: Schema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Ticket subject is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Ticket description is required']
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'on_hold', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    required: [true, 'Ticket category is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedTo: {
    type: {
      type: String,
      enum: ['waba', 'contact', 'template', 'broadcast', 'conversation', 'billing']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  }],
  comments: [{
    text: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    attachments: [{
      name: String,
      url: String,
      type: String,
      size: Number
    }]
  }],
  resolutionSummary: String,
  closedAt: Date,
  dueDate: Date,
  tags: [String],
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

// Create indexes for common queries
TicketSchema.index({ company: 1, status: 1 });
TicketSchema.index({ assignedTo: 1, status: 1 });

export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);
