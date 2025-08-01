import mongoose, { Document, Schema } from 'mongoose';

export interface IChatbot extends Document {
  userId: string;
  wabaId: string;
  name: string;
  description?: string;
  isActive: boolean;
  
  // AI Configuration
  aiModel: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo';
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  
  // Trigger Configuration
  triggers: string[];
  matchType: 'exact' | 'contains' | 'starts_with' | 'ends_with';
  caseSensitive: boolean;
  priority: number;
  
  // Response Configuration
  fallbackMessage: string;
  enableFallback: boolean;
  maxResponseLength: number;
  
  // Conversation Settings
  conversationMemory: boolean;
  memoryDuration: number; // in minutes
  contextWindow: number; // number of previous messages to include
  
  // Usage Statistics
  usageCount: number;
  totalTokensUsed: number;
  totalCostINR: number; // Changed from totalCostUSD to totalCostINR
  lastTriggered?: Date;
  
  // Advanced Settings
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatbotSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wabaId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // AI Configuration
  aiModel: {
    type: String,
    enum: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    default: 'gpt-3.5-turbo'
  },
  systemPrompt: {
    type: String,
    required: true,
    default: 'You are a helpful customer service assistant. Respond professionally and helpfully to customer inquiries.'
  },
  temperature: {
    type: Number,
    min: 0,
    max: 2,
    default: 0.7
  },
  maxTokens: {
    type: Number,
    min: 1,
    max: 4096,
    default: 500
  },
  
  // Trigger Configuration
  triggers: [{
    type: String,
    trim: true
  }],
  matchType: {
    type: String,
    enum: ['exact', 'contains', 'starts_with', 'ends_with'],
    default: 'contains'
  },
  caseSensitive: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  },
  
  // Response Configuration
  fallbackMessage: {
    type: String,
    default: 'I apologize, but I\'m having trouble understanding your request. Could you please rephrase or contact our support team for assistance?'
  },
  enableFallback: {
    type: Boolean,
    default: true
  },
  maxResponseLength: {
    type: Number,
    default: 1000
  },
  
  // Conversation Settings
  conversationMemory: {
    type: Boolean,
    default: true
  },
  memoryDuration: {
    type: Number,
    default: 30 // 30 minutes
  },
  contextWindow: {
    type: Number,
    default: 5 // last 5 messages
  },
  
  // Usage Statistics
  usageCount: {
    type: Number,
    default: 0
  },
  totalTokensUsed: {
    type: Number,
    default: 0
  },
  totalCostINR: { // Changed from totalCostUSD
    type: Number,
    default: 0
  },
  // Keep the old field for backward compatibility but mark as deprecated
  totalCostUSD: {
    type: Number,
    default: 0
  },
  lastTriggered: Date,
  
  // Advanced Settings
  tags: [String]
}, {
  timestamps: true
});

// Create indexes for efficient queries
ChatbotSchema.index({ userId: 1, wabaId: 1 });
ChatbotSchema.index({ userId: 1, wabaId: 1, isActive: 1 });
ChatbotSchema.index({ priority: -1 });

export default mongoose.models.Chatbot || mongoose.model<IChatbot>('Chatbot', ChatbotSchema);