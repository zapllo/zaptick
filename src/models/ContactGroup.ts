import mongoose, { Schema, Document } from 'mongoose';

export interface IContactGroup extends Document {
  company: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: 'static' | 'dynamic';
  contacts: mongoose.Types.ObjectId[];
  dynamicFilter?: any;
  contactCount: number;
  lastUpdated: Date;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactGroupSchema: Schema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: ['static', 'dynamic'],
    default: 'static'
  },
  contacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  }],
  dynamicFilter: mongoose.Schema.Types.Mixed,
  contactCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
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

// Create compound index for company and name
ContactGroupSchema.index({ company: 1, name: 1 }, { unique: true });

export default mongoose.models.ContactGroup || mongoose.model<IContactGroup>('ContactGroup', ContactGroupSchema);
