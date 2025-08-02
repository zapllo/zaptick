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

  // NEW: Knowledge Base Configuration
  knowledgeBase: {
    enabled: boolean;
    documents: Array<{
      id: string;
      filename: string;
      originalName: string;
      fileType: string;
      fileSize: number;
      uploadedAt: Date;
      processedAt?: Date;
      status: 'uploading' | 'processing' | 'processed' | 'failed';
      errorMessage?: string;
      chunks?: number; // Number of text chunks created
      s3Url?: string;
    }>;
    settings: {
      maxDocuments: number;
      maxFileSize: number; // in MB
      allowedFileTypes: string[];
      chunkSize: number;
      chunkOverlap: number;
      searchMode: 'semantic' | 'keyword' | 'hybrid';
      maxRelevantChunks: number;
    };
    vectorStore?: {
      provider: 'pinecone' | 'weaviate' | 'local';
      indexName?: string;
      namespace?: string;
    };
  };

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
  totalCostINR: number;
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

  // NEW: Knowledge Base Configuration
  knowledgeBase: {
    enabled: {
      type: Boolean,
      default: false
    },
    documents: [{
      id: {
        type: String,
        required: true
      },
      filename: {
        type: String,
        required: true
      },
      originalName: {
        type: String,
        required: true
      },
      fileType: {
        type: String,
        required: true
      },
      fileSize: {
        type: Number,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      processedAt: Date,
      status: {
        type: String,
        enum: ['uploading', 'processing', 'processed', 'failed'],
        default: 'uploading'
      },
      errorMessage: String,
      chunks: Number,
      s3Url: String,
      processedChunks: {
        type: [String], // Array of strings (the actual text chunks)
        default: []
      },
      textPreview: String,
      processingStats: {
        originalLength: Number,
        chunksCount: Number,
        averageChunkSize: Number
      }
    }],
    settings: {
      maxDocuments: {
        type: Number,
        default: 10
      },
      maxFileSize: {
        type: Number,
        default: 10 // 10MB
      },
      allowedFileTypes: {
        type: [String],
        default: ['pdf', 'txt', 'doc', 'docx', 'csv']
      },
      chunkSize: {
        type: Number,
        default: 1000
      },
      chunkOverlap: {
        type: Number,
        default: 200
      },
      searchMode: {
        type: String,
        enum: ['semantic', 'keyword', 'hybrid'],
        default: 'semantic'
      },
      maxRelevantChunks: {
        type: Number,
        default: 3
      }
    },
    vectorStore: {
      provider: {
        type: String,
        enum: ['pinecone', 'weaviate', 'local'],
        default: 'local'
      },
      indexName: String,
      namespace: String
    }
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
  totalCostINR: {
    type: Number,
    default: 0
  },
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