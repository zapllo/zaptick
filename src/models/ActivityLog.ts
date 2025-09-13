import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  company: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId?: mongoose.Types.ObjectId;
  previousData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  timestamp: Date;
}

const ActivityLogSchema: Schema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true
  },
  resourceType: {
    type: String,
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  previousData: mongoose.Schema.Types.Mixed,
  newData: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  // Use a capped collection to automatically limit log storage
  capped: {
    size: 100000000, // 100MB
    max: 1000000     // 1 million documents
  }
});

// Create indexes for common queries
ActivityLogSchema.index({ company: 1, timestamp: -1 });
ActivityLogSchema.index({ user: 1, timestamp: -1 });
ActivityLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
