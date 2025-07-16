import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  name: string;
  phone: string;
  email?: string;
  countryCode?: string; // Add this field
  wabaId: string;
  phoneNumberId: string;
  userId: string;
  companyId: mongoose.Types.ObjectId;
  customFields?: Record<string, any>;
  whatsappOptIn: boolean;
  tags?: string[];
  notes?: string;
  lastMessageAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  countryCode: { // Add this field
    type: String,
    trim: true
  },
  wabaId: {
    type: String,
    required: true
  },
  phoneNumberId: {
    type: String,
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customFields: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  whatsappOptIn: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  lastMessageAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
ContactSchema.index({ userId: 1, wabaId: 1 });
ContactSchema.index({ phone: 1, wabaId: 1 }, { unique: true });

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);