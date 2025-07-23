import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission {
  resource: string;
  actions: string[];
}

export interface IRole extends Document {
  name: string;
  description?: string;
  companyId: mongoose.Types.ObjectId;
  permissions: IPermission[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema({
  resource: {
    type: String,
    required: true,
    enum: ['conversations', 'templates', 'dashboard', 'automations', 'contacts', 'integrations', 'analytics', 'settings']
  },
  actions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'manage']
  }]
});

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
    },
    permissions: [PermissionSchema],
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Ensure unique role names per company
RoleSchema.index({ name: 1, companyId: 1 }, { unique: true });

// Use a more robust check for model existence
const Role = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
export default Role;