import mongoose, { Document, Schema } from 'mongoose';

export interface IContactGroup extends Document {
  name: string;
  description?: string;
  companyId: mongoose.Types.ObjectId;
  userId: string;
  contacts: mongoose.Types.ObjectId[];
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactGroupSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  }],
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
ContactGroupSchema.index({ userId: 1, companyId: 1 });
ContactGroupSchema.index({ name: 1, companyId: 1 }, { unique: true });

export default mongoose.models.ContactGroup || mongoose.model<IContactGroup>('ContactGroup', ContactGroupSchema);