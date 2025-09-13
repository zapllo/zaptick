import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  company: mongoose.Types.ObjectId;
  invoiceNumber: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  amount: number;
  currency: string;
  taxAmount: number;
  totalAmount: number;
  dueDate: Date;
  paidDate?: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    type: 'subscription' | 'message' | 'template' | 'service' | 'other';
  }[];
  paymentMethod?: {
    type: 'card' | 'banktransfer' | 'paypal' | 'other';
    details?: any;
  };
  paymentReference?: string;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: Date,
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  items: [{
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: ['subscription', 'message', 'template', 'service', 'other'],
      default: 'other'
    }
  }],
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'banktransfer', 'paypal', 'other']
    },
    details: mongoose.Schema.Types.Mixed
  },
  paymentReference: String,
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
