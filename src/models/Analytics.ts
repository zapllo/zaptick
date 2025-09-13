import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  company: mongoose.Types.ObjectId;
  wabaId: mongoose.Types.ObjectId;
  period: 'daily' | 'weekly' | 'monthly';
  date: Date;
  messageMetrics: {
    inbound: number;
    outbound: number;
    total: number;
    delivered: number;
    read: number;
    failed: number;
    deliveryRate: number;
    readRate: number;
  };
  conversationMetrics: {
    new: number;
    active: number;
    resolved: number;
    averageResolutionTime: number;
    averageFirstResponseTime: number;
    averageResponseTime: number;
  };
  userMetrics: {
    userId: mongoose.Types.ObjectId;
    messagesHandled: number;
    conversationsHandled: number;
    averageResponseTime: number;
    resolutionRate: number;
  }[];
  contactMetrics: {
    newContacts: number;
    activeContacts: number;
    totalContacts: number;
    optOutRate: number;
  };
  templateMetrics: {
    templateId: mongoose.Types.ObjectId;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    deliveryRate: number;
    readRate: number;
  }[];
  broadcastMetrics: {
    broadcastId: mongoose.Types.ObjectId;
    sent: number;
    delivered: number;
    read: number;
    responded: number;
    deliveryRate: number;
    readRate: number;
    responseRate: number;
  }[];
  automationMetrics: {
    automationId: mongoose.Types.ObjectId;
    triggered: number;
    completed: number;
    failed: number;
    completionRate: number;
  }[];
  costs: {
    totalCost: number;
    conversationCost: number;
    marketingCost: number;
    currency: string;
  };
  qualityScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema: Schema = new Schema({
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
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  messageMetrics: {
    inbound: {
      type: Number,
      default: 0
    },
    outbound: {
      type: Number,
      default: 0
    },
    total: {
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
    failed: {
      type: Number,
      default: 0
    },
    deliveryRate: {
      type: Number,
      default: 0
    },
    readRate: {
      type: Number,
      default: 0
    }
  },
  conversationMetrics: {
    new: {
      type: Number,
      default: 0
    },
    active: {
      type: Number,
      default: 0
    },
    resolved: {
      type: Number,
      default: 0
    },
    averageResolutionTime: {
      type: Number,
      default: 0
    },
    averageFirstResponseTime: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    }
  },
  userMetrics: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    messagesHandled: {
      type: Number,
      default: 0
    },
    conversationsHandled: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    resolutionRate: {
      type: Number,
      default: 0
    }
  }],
  contactMetrics: {
    newContacts: {
      type: Number,
      default: 0
    },
    activeContacts: {
      type: Number,
      default: 0
    },
    totalContacts: {
      type: Number,
      default: 0
    },
    optOutRate: {
      type: Number,
      default: 0
    }
  },
  templateMetrics: [{
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessageTemplate',
      required: true
    },
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
    failed: {
      type: Number,
      default: 0
    },
    deliveryRate: {
      type: Number,
      default: 0
    },
    readRate: {
      type: Number,
      default: 0
    }
  }],
  broadcastMetrics: [{
    broadcastId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Broadcast',
      required: true
    },
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
    responded: {
      type: Number,
      default: 0
    },
    deliveryRate: {
      type: Number,
      default: 0
    },
    readRate: {
      type: Number,
      default: 0
    },
    responseRate: {
      type: Number,
      default: 0
    }
  }],
  automationMetrics: [{
    automationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Automation',
      required: true
    },
    triggered: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  }],
  costs: {
    totalCost: {
      type: Number,
      default: 0
    },
    conversationCost: {
      type: Number,
      default: 0
    },
    marketingCost: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  qualityScore: Number,
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

// Create compound index for efficient querying
AnalyticsSchema.index({ company: 1, wabaId: 1, period: 1, date: 1 }, { unique: true });

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
