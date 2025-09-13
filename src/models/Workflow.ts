import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay' | 'webhook';
  position: { x: number; y: number };
  data: {
    label: string;
    config: any;
  };
}

export interface IWorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  type?: string;
}

export interface IWorkflow extends Document {
  userId: string;
  wabaId: string;
  name: string;
  description?: string;
  isActive: boolean;
  nodes: IWorkflowNode[];
  edges: IWorkflowEdge[];
  triggers: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  executionCount: number;
  successCount: number;
  failureCount: number;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

const WorkflowNodeSchema = new Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['trigger', 'condition', 'action', 'delay', 'webhook'],
    required: true
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  data: {
    label: { type: String, required: true },
    config: Schema.Types.Mixed
  }
});

const WorkflowEdgeSchema = new Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  sourceHandle: String,
  targetHandle: String,
  label: String,
  type: String
});

const WorkflowSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wabaId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  nodes: [WorkflowNodeSchema],
  edges: [WorkflowEdgeSchema],
  triggers: [String],
  version: {
    type: Number,
    default: 1
  },
  lastTriggered: Date,
  executionCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  viewport: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    zoom: { type: Number, default: 1 }
  }
}, {
  timestamps: true
});

// Create indexes for efficient queries
WorkflowSchema.index({ userId: 1, wabaId: 1 });
WorkflowSchema.index({ userId: 1, wabaId: 1, isActive: 1 });

export default mongoose.models.Workflow || mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
