import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhook extends Document {
  company: mongoose.Types.ObjectId;
  wabaId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  endpointUrl: string;
  secret?: string;
  status: 'active' | 'inactive' | 'failed';
  events: string[];
  headers: { key: string; value: string }[];
  failureCount: number;
  lastFailureReason?: string;
  lastSuccessTime?: Date;
  lastFailureTime?: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookSchema: Schema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  wabaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsAppBusinessAccount'
  },
  name: {
    type: String,
    required: [true, 'Webhook name is required'],
    trim: true
  },
  description: String,
  endpointUrl: {
    type: String,
    required: [true, 'Endpoint URL is required'],
    match: [
      /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]+(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/,
      'Please enter a valid URL'
    ]
  },
  secret: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'failed'],
    default: 'active'
  },
  events: {
    type: [String],
    required: [true, 'At least one event is required'],
    validate: [(val: string[]) => val.length > 0, 'At least one event is required']
  },
  headers: [{
    key: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    _id: false
  }],
  failureCount: {
    type: Number,
    default: 0
  },
  lastFailureReason: String,
  lastSuccessTime: Date,
  lastFailureTime: Date,
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

export default mongoose.models.Webhook || mongoose.model<IWebhook>('Webhook', WebhookSchema);
