import mongoose, { Schema, Document } from 'mongoose';

export interface IChatbot extends Document {
  company: mongoose.Types.ObjectId;
  wabaId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  type: 'rule_based' | 'ai_powered' | 'hybrid';
  aiConfig?: {
    provider: 'openai' | 'azure' | 'cohere' | 'anthropic' | 'custom';
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    apiKey?: string;
    fallbackResponses: string[];
  };
  flow: {
    nodes: {
      id: string;
      type: 'message' | 'condition' | 'input' | 'action' | 'api_call' | 'ai_response';
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
        type: 'equals' | 'contains' | 'starts_with' | 'not_equals' | 'regex';
        value: string;
      };
    }[];
  };
  triggers: {
    keywords: string[];
    patterns: string[];
    enabled: boolean;
    respondToAll: boolean;
  };
  businessHours?: {
    enabled: boolean;
    timezone: string;
    schedule: {
      day: string;
      isOpen: boolean;
      openTime?: string;
      closeTime?: string;
    }[];
    afterHoursMessage?: string;
  };
  handoff: {
    enabled: boolean;
    triggerKeywords: string[];
    autoHandoffPatterns: string[];
    handoffMessage: string;
  };
  analytics: {
    conversations: number;
    messagesReceived: number;
    messagesSent: number;
    handoffs: number;
    resolutionRate: number;
    avgResponseTime: number;
    topIntents: { intent: string; count: number }[];
  };
  logs: {
    enabled: boolean;
    retentionDays: number;
  };
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatbotSchema: Schema = new Schema({
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
    required: [true, 'Chatbot name is required'],
    trim: true
  },
  description: String,
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['rule_based', 'ai_powered', 'hybrid'],
    default: 'rule_based'
  },
  aiConfig: {
    provider: {
      type: String,
      enum: ['openai', 'azure', 'cohere', 'anthropic', 'custom']
    },
    model: String,
    temperature: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.7
    },
    maxTokens: {
      type: Number,
      default: 500
    },
    systemPrompt: String,
    apiKey: String,
    fallbackResponses: [String]
  },
  flow: {
    nodes: [{
      id: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['message', 'condition', 'input', 'action', 'api_call', 'ai_response'],
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
          enum: ['equals', 'contains', 'starts_with', 'not_equals', 'regex']
        },
        value: String
      },
      _id: false
    }]
  },
  triggers: {
    keywords: [String],
    patterns: [String],
    enabled: {
      type: Boolean,
      default: true
    },
    respondToAll: {
      type: Boolean,
      default: false
    }
  },
  businessHours: {
    enabled: {
      type: Boolean,
      default: false
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true
      },
      isOpen: {
        type: Boolean,
        default: true
      },
      openTime: String,
      closeTime: String,
      _id: false
    }],
    afterHoursMessage: String
  },
  handoff: {
    enabled: {
      type: Boolean,
      default: true
    },
    triggerKeywords: [String],
    autoHandoffPatterns: [String],
    handoffMessage: {
      type: String,
      default: "I'll connect you with a human agent who will assist you shortly."
    }
  },
  analytics: {
    conversations: {
      type: Number,
      default: 0
    },
    messagesReceived: {
      type: Number,
      default: 0
    },
    messagesSent: {
      type: Number,
      default: 0
    },
    handoffs: {
      type: Number,
      default: 0
    },
    resolutionRate: {
      type: Number,
      default: 0
    },
    avgResponseTime: {
      type: Number,
      default: 0
    },
    topIntents: [{
      intent: String,
      count: Number,
      _id: false
    }]
  },
  logs: {
    enabled: {
      type: Boolean,
      default: true
    },
    retentionDays: {
      type: Number,
      default: 30
    }
  },
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

export default mongoose.models.Chatbot || mongoose.model<IChatbot>('Chatbot', ChatbotSchema);
