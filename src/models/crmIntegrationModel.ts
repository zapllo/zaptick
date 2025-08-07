import mongoose, { Document, Schema } from 'mongoose';

export interface ICrmIntegration extends Document {
  userId: string;
  companyId: mongoose.Types.ObjectId;
  wabaId: string;
  crmApiKey: string;
  crmBaseUrl: string;
  isActive: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CrmIntegrationSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  wabaId: {
    type: String,
    required: true,
    trim: true
  },
  crmApiKey: {
    type: String,
    required: true,
    trim: true
  },
  crmBaseUrl: {
    type: String,
    default: 'https://crm.zapllo.com',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSyncAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create compound index
CrmIntegrationSchema.index({ userId: 1, wabaId: 1 }, { unique: true });

export default mongoose.models.CrmIntegration || mongoose.model<ICrmIntegration>('CrmIntegration', CrmIntegrationSchema);