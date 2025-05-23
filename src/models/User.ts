import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'agent';
  company: mongoose.Types.ObjectId;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  lastLogin?: Date;
  isActive: boolean;
  profilePicture?: string;
  phoneNumber?: string;
  // WhatsApp authentication fields
  whatsappAuthenticated: boolean;
  whatsappId?: string;
  whatsappPhoneNumber?: string;
  whatsappName?: string;
  whatsappProfilePic?: string;
  whatsappAuthToken?: string;
  // End of WhatsApp authentication fields
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  timezone: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  authMethod: 'email' | 'whatsapp' | 'both';
  signupCompleted: boolean; // To track if the user has completed all required profile info
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

const UserSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined values and maintains uniqueness for non-null values
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'agent'],
    default: 'agent'
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  profilePicture: String,
  phoneNumber: String,

  // WhatsApp authentication fields
  whatsappAuthenticated: {
    type: Boolean,
    default: false
  },
  whatsappId: String,
  whatsappPhoneNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  whatsappName: String,
  whatsappProfilePic: String,
  whatsappAuthToken: String,

  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  timezone: {
    type: String,
    default: 'UTC'
  },
  language: {
    type: String,
    default: 'en'
  },
  authMethod: {
    type: String,
    enum: ['email', 'whatsapp', 'both'],
    default: 'email'
  },
  signupCompleted: {
    type: Boolean,
    default: false
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

// Encrypt password using bcrypt
UserSchema.pre<IUser>('save', async function (next) {
  // Only hash the password if it's modified and exists
  if (!this.isModified('password') || !this.password) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Make either email+password or whatsappAuthenticated required
UserSchema.pre<IUser>('validate', function (next) {
  if ((!this.email || !this.password) && !this.whatsappAuthenticated) {
    this.invalidate('authMethod', 'Either email/password or WhatsApp authentication is required');
  }
  next();
});

// Update authMethod based on available credentials
UserSchema.pre<IUser>('save', function (next) {
  if (this.email && this.password && this.whatsappAuthenticated) {
    this.authMethod = 'both';
  } else if (this.whatsappAuthenticated) {
    this.authMethod = 'whatsapp';
  } else {
    this.authMethod = 'email';
  }
  next();
});


// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
