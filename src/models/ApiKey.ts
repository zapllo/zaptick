import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IApiKey extends Document {
  company: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  key: string;
  hash: string;
  permissions: string[];
  lastUsed?: Date;
  expiresAt?: Date;
  ipRestrictions?: string[];
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  generateKey(): string;
  verifyKey(providedKey: string): boolean;
}

const ApiKeySchema: Schema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: [true, 'API key name is required'],
    trim: true
  },
  description: String,
  hash: {
    type: String,
    required: true
  },
  permissions: {
    type: [String],
    required: true,
    default: ['read']
  },
  lastUsed: Date,
  expiresAt: Date,
  ipRestrictions: [String],
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

// Method to generate a new API key
ApiKeySchema.methods.generateKey = function() {
  // Generate a random key
  const apiKey = `wba_${crypto.randomBytes(32).toString('hex')}`;

  // Hash the key for storage
  const hash = crypto.createHash('sha256').update(apiKey).digest('hex');

  // Save the hash
  this.hash = hash;

  // Return the original key (which won't be stored in plaintext)
  return apiKey;
};

// Method to verify a provided key
ApiKeySchema.methods.verifyKey = function(providedKey: string) {
  // Hash the provided key and compare with stored hash
  const providedHash = crypto.createHash('sha256').update(providedKey).digest('hex');
  return this.hash === providedHash;
};

export default mongoose.models.ApiKey || mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
