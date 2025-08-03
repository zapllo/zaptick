import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  companyId: mongoose.Types.ObjectId;
  roleId?: mongoose.Types.ObjectId;
  wabaAccounts: {
    wabaId: string;
    phoneNumberId: string;
    businessName: string;
    phoneNumber: string;
    connectedAt: Date;
    status: 'active' | 'disconnected' | 'pending';
    isvNameToken: string;
    templateCount?: number;
  }[];
  role: 'owner' | 'admin' | 'agent' | 'superadmin'; // Add 'owner' role
  isActive: boolean;
  isOwner: boolean; // Add owner flag
  isSuperAdmin: boolean; // Add super admin flag
  lastLoginAt?: Date;
  invitedBy?: mongoose.Types.ObjectId;
  invitedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'agent', 'superadmin'],
      default: 'agent'
    },
    isOwner: {
      type: Boolean,
      default: false
    },
    isSuperAdmin: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLoginAt: {
      type: Date
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    invitedAt: {
      type: Date
    },
    wabaAccounts: [
      {
        wabaId: { type: String, required: true },
        phoneNumberId: { type: String, required: true },
        businessName: { type: String, default: '' },
        phoneNumber: { type: String, default: '' },
        connectedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['active', 'disconnected', 'pending'],
          default: 'active'
        },
        isvNameToken: { type: String },
        templateCount: { type: Number, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);