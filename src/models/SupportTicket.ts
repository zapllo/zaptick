import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportTicket extends Document {
  ticketId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  messages: Array<{
    id: string;
    sender: mongoose.Types.ObjectId;
    senderType: 'user' | 'agent';
    message: string;
    timestamp: Date;
    attachments?: Array<{
      filename: string;
      url: string;
      size: number;
      mimeType: string;
    }>;
  }>;
  resolution?: string;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true
    },
    title: {
      type: String,
      required: [true, 'Ticket title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Ticket description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: ['technical', 'billing', 'feature_request', 'bug_report', 'general'],
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open'
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
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    attachments: [{
      filename: String,
      url: String,
      size: Number,
      mimeType: String
    }],
    messages: [{
      id: {
        type: String,
        required: true
      },
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      senderType: {
        type: String,
        enum: ['user', 'agent'],
        required: true
      },
      message: {
        type: String,
        required: true,
        trim: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      attachments: [{
        filename: String,
        url: String,
        size: Number,
        mimeType: String
      }]
    }],
    resolution: {
      type: String,
      trim: true
    },
    resolvedAt: {
      type: Date
    },
    closedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Generate ticket ID before saving
SupportTicketSchema.pre('save', function(next) {
  if (this.isNew && !this.ticketId) {
    // Generate ticket ID like ZT-2024-001234
    const now = new Date();
    const year = now.getFullYear();
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    this.ticketId = `ZT-${year}-${random}`;
  }
  next();
});

export default mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);