import mongoose, { Schema, Document } from 'mongoose';

export interface IAutomationExecution extends Document {
  company: mongoose.Types.ObjectId;
  wabaId: mongoose.Types.ObjectId;
  automation: mongoose.Types.ObjectId;
  contact: mongoose.Types.ObjectId;
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  currentNodeId?: string;
  completedNodeIds: string[];
  triggeredBy: 'system' | 'user' | 'api';
  triggeredByUserId?: mongoose.Types.ObjectId;
  executionData: {
    variables: Record<string, any>;
    lastMessageId?: string;
    lastNodeResult?: any;
    lastError?: {
      nodeId: string;
      message: string;
      details?: any;
      timestamp: Date;
    };
  };
  executionHistory: {
    nodeId: string;
    nodeName: string;
    nodeType: string;
    startTime: Date;
    endTime?: Date;
    status: 'completed' | 'failed' | 'skipped';
    result?: any;
    error?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AutomationExecutionSchema: Schema = new Schema({
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
  automation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Automation',
    required: true
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'failed', 'cancelled'],
    default: 'in_progress'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  currentNodeId: String,
  completedNodeIds: [String],
  triggeredBy: {
    type: String,
    enum: ['system', 'user', 'api'],
    default: 'system'
  },
  triggeredByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  executionData: {
    variables: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    lastMessageId: String,
    lastNodeResult: mongoose.Schema.Types.Mixed,
    lastError: {
      nodeId: String,
      message: String,
      details: mongoose.Schema.Types.Mixed,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  },
  executionHistory: [{
    nodeId: {
      type: String,
      required: true
    },
    nodeName: String,
    nodeType: {
      type: String,
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: Date,
    status: {
      type: String,
      enum: ['completed', 'failed', 'skipped'],
      required: true
    },
    result: mongoose.Schema.Types.Mixed,
    error: String
  }],
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

// Create compound indexes for efficient querying
AutomationExecutionSchema.index({ automation: 1, contact: 1, status: 1 });
AutomationExecutionSchema.index({ company: 1, startTime: -1 });

export default mongoose.models.AutomationExecution ||
  mongoose.model<IAutomationExecution>('AutomationExecution', AutomationExecutionSchema);
