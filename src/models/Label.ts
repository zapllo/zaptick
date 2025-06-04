import mongoose, { Document, Schema } from 'mongoose';

export interface ILabel extends Document {
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabelSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    required: true,
    default: 'blue'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create index for efficient queries
LabelSchema.index({ userId: 1 });

export default mongoose.models.Label || mongoose.model<ILabel>('Label', LabelSchema);
