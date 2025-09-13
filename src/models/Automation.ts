import mongoose, { Schema, Document } from 'mongoose';

export interface IAutomation extends Document {
  company: mongoose.Types.ObjectId;
  wabaId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  triggerType: 'keyword' | 'event' | 'tag' | 'scheduled' | 'api' | 'contact_field' | 'inactivity';
  triggerConfig: {
    keywords?: string[];
    event?: 'contact_created' | 'message_received' | 'conversation_opened' | 'tag_added' | 'webhook_received';
    tag?: string;
    schedule?: {
      frequency: 'once' | 'daily' | 'weekly' | 'monthly';
      time?: string;
      days?: string[];
      date?: string;
    };
    contactField?: {
      field: string;
      condition: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
      value: string;
    };
    inactivityDays?: number;
  };
  flow: {
    nodes: {
      id: string;
      type: 'message' | 'condition' | 'delay' | 'action' | 'api_call';
      position: {
        x: number;
        y: number;
      };
      data: any;
    }[];
    edges: {
      id: string;
      source: string;
      target: string;
      label?: string;
      condition?: {
        type: 'equals' | 'contains' | 'starts_with' | 'not_equals';
        value: string;
      };
    }[];
  };
  executionStats: {
    totalExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
    averageCompletionTime?: number;
  };
  activeContacts?: number;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AutomationSchema: Schema = new Schema({
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
    required: [true, 'Automation name is required'],
    trim: true
  },
  description: String,
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft'
  },
  triggerType: {
    type: String,
    enum: ['keyword', 'event', 'tag', 'scheduled', 'api', 'contact_field', 'inactivity'],
    required: true
  },
  triggerConfig: {
    keywords: [String],
    event: {
      type: String,
      enum: ['contact_created', 'message_received', 'conversation_opened', 'tag_added', 'webhook_received']
    },
    tag: String,
    schedule: {
      frequency: {
        type: String,
        enum: ['once', 'daily', 'weekly', 'monthly']
      },
      time: String,
      days: [String],
      date: String,
    },
    contactField: {
      field: String,
      condition: {
        type: String,
        enum: ['equals', 'contains', 'starts_with', 'ends_with', 'greater_than', 'less_than']
      },
      value: String
    },
    inactivityDays: Number
  },
  flow: {
    nodes: [{
      id: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['message', 'condition', 'delay', 'action', 'api_call'],
        required: true
      },
      position: {
        x: {
          type: Number,
          required: true
        },
        y: {
          type: Number,
          required: true
        }
      },
      data: mongoose.Schema.Types.Mixed,
      _id: false
    }],
    edges: [{
      id: {
        type: String,
        required: true
      },
      source: {
        type: String,
        required: true
      },
      target: {
        type: String,
        required: true
      },
      label: String,
      condition: {
        type: {
          type: String,
          enum: ['equals', 'contains', 'starts_with', 'not_equals']
        },
        value: String
      },
      _id: false
    }]
  },
  executionStats: {
    totalExecutions: {
      type: Number,
      default: 0
    },
    completedExecutions: {
      type: Number,
      default: 0
    },
    failedExecutions: {
      type: Number,
      default: 0
    },
    averageCompletionTime: Number
  },
  activeContacts: {
    type: Number,
    default: 0
  },
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

export default mongoose.models.Automation || mongoose.model<IAutomation>('Automation', AutomationSchema);
