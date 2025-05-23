import mongoose, { Schema, Document } from 'mongoose';

export interface ILabel extends Document {
  company: mongoose.Types.ObjectId;
  name: string;
  color: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LabelSchema: Schema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Label name is required'],
    trim: true
  },
  color: {
    type: String,
    required: [true, 'Label color is required'],
    default: '#3498db'
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
LabelSchema.index({ company: 1, name: 1 }, { unique: true });

export default mongoose.models.Label || mongoose.model<ILabel>('Label', LabelSchema);
