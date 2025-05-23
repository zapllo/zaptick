import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  company: mongoose.Types.ObjectId;
  phoneNumber: string;
  waId: string; // WhatsApp ID
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  profilePicture?: string;
  labels: mongoose.Types.ObjectId[];
  contactAttributes: {
    key: string;
    value: string;
  }[];
  assignedTo?: mongoose.Types.ObjectId;
  lastMessageTimestamp?: Date;
  lastMessageContent?: string;
  lastMessageDirection?: 'inbound' | 'outbound';
  conversationStatus: 'active' | 'closed' | 'resolved';
  conversationAssignedAt?: Date;
  isBlocked: boolean;
  isSubscribed: boolean;
  optInStatus: 'opted_in' | 'opted_out' | 'unknown';
  optInTimestamp?: Date;
  optOutTimestamp?: Date;
  lastContactedAt?: Date;
  tags: string[];
  notes: string[];
  metadata: any;
  createdBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    index: true
  },
  waId: {
    type: String,
    required: [true, 'WhatsApp ID is required'],
    unique: true
  },
  firstName: String,
  lastName: String,
  fullName: String,
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  profilePicture: String,
  labels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Label'
  }],
  contactAttributes: [{
    key: String,
    value: String,
    _id: false
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastMessageTimestamp: Date,
  lastMessageContent: String,
  lastMessageDirection: {
    type: String,
    enum: ['inbound', 'outbound']
  },
  conversationStatus: {
    type: String,
    enum: ['active', 'closed', 'resolved'],
    default: 'active'
  },
  conversationAssignedAt: Date,
  isBlocked: {
    type: Boolean,
    default: false
  },
  isSubscribed: {
    type: Boolean,
    default: true
  },
  optInStatus: {
    type: String,
    enum: ['opted_in', 'opted_out', 'unknown'],
    default: 'unknown'
  },
  optInTimestamp: Date,
  optOutTimestamp: Date,
  lastContactedAt: Date,
  tags: [String],
  notes: [String],
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  createdBy: {
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

// Create compound index for company + phone number
ContactSchema.index({ company: 1, phoneNumber: 1 });

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
