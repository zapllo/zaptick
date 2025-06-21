import mongoose, { Document, Schema } from 'mongoose';

export type FieldType = 'Text' | 'Number' | 'Date' | 'Dropdown';

export interface IContactCustomField extends Document {
  name: string;
  key: string;
  type: FieldType;
  companyId: mongoose.Types.ObjectId;
  required: boolean;
  options?: string[];
  defaultValue?: string | number | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactCustomFieldSchema = new Schema<IContactCustomField>(
  {
    name: {
      type: String,
      required: [true, 'Field name is required'],
      trim: true,
    },
    key: {
      type: String,
      required: [true, 'Field key is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Field type is required'],
      enum: ['Text', 'Number', 'Date', 'Dropdown'],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: [{
      type: String,
      trim: true,
    }],
    defaultValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

// Create compound index for efficient queries
ContactCustomFieldSchema.index({ companyId: 1, key: 1 }, { unique: true });

export default mongoose.models.ContactCustomField ||
  mongoose.model<IContactCustomField>('ContactCustomField', ContactCustomFieldSchema);
