import mongoose, { Document, Schema } from 'mongoose';

export interface IDemo extends Document {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;

  // Company Information
  company: string;
  jobTitle: string;
  website?: string;
  industry: string;
  companySize: string;
  currentSolution?: string;
  bookingId?: string;

  // Demo Details
  interests: string[];
  preferredDate: Date;
  preferredTime: string;
  additionalInfo?: string;

  // Booking Status
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  bookedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;

  // Meeting Details
  meetingLink?: string;
  meetingId?: string;
  assignedSalesRep?: string;

  // Follow-up Information
  demoNotes?: string;
  followUpDate?: Date;
  conversionStatus?: 'not-contacted' | 'contacted' | 'interested' | 'trial' | 'customer' | 'lost';

  // UTM and Tracking
  source?: string;
  campaign?: string;
  referrer?: string;

  createdAt: Date;
  updatedAt: Date;

  // Methods
  fullName: string;
  formattedPhone: string;
  isUpcoming(): boolean;
  confirm(): Promise<IDemo>;
  complete(notes?: string): Promise<IDemo>;
}

// Define static methods interface
interface IDemoModel extends mongoose.Model<IDemo> {
  findUpcoming(days?: number): Promise<IDemo[]>;
  getAnalytics(startDate?: Date, endDate?: Date): Promise<any[]>;
}

const DemoSchema = new Schema<IDemo>(
  {
    // Personal Information
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    countryCode: {
      type: String,
      required: [true, 'Country code is required'],
      trim: true
    },

    // Company Information
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Optional field
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Please provide a valid website URL'
      }
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      enum: [
        'E-commerce & Retail',
        'Healthcare & Medical',
        'Education & Training',
        'Real Estate',
        'Financial Services',
        'Travel & Hospitality',
        'Food & Restaurants',
        'Technology & Software',
        'Manufacturing',
        'Marketing & Advertising',
        'Other'
      ]
    },
    companySize: {
      type: String,
      required: [true, 'Company size is required'],
      enum: [
        '1-10 employees',
        '11-50 employees',
        '51-200 employees',
        '201-500 employees',
        '500+ employees'
      ]
    },
    currentSolution: {
      type: String,
      trim: true,
      maxlength: [200, 'Current solution description cannot exceed 200 characters']
    },

    // Demo Details
    interests: [{
      type: String,
      enum: [
        'whatsapp-api',
        'automation',
        'broadcasting',
        'analytics',
        'integrations',
        'team-features'
      ]
    }],
    preferredDate: {
      type: Date,
      required: [true, 'Preferred date is required'],
      validate: {
        validator: function (v: Date) {
          // Create a new date without time for comparison
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const preferredDate = new Date(v);
          preferredDate.setHours(0, 0, 0, 0);
          return preferredDate >= today;
        },
        message: 'Preferred date cannot be in the past'
      }
    },
    preferredTime: {
      type: String,
      required: [true, 'Preferred time is required'],
      enum: [
        '9:00 AM - 10:00 AM',
        '10:00 AM - 11:00 AM',
        '11:00 AM - 12:00 PM',
        '12:00 PM - 1:00 PM',
        '2:00 PM - 3:00 PM',
        '3:00 PM - 4:00 PM',
        '4:00 PM - 5:00 PM',
        '5:00 PM - 6:00 PM'
      ]
    },
    additionalInfo: {
      type: String,
      trim: true,
      maxlength: [500, 'Additional information cannot exceed 500 characters']
    },

    // Booking Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'pending'
    },
    bookedAt: {
      type: Date,
      default: Date.now
    },
    confirmedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },

    // Meeting Details
    meetingLink: {
      type: String,
      trim: true
    },
    meetingId: {
      type: String,
      trim: true
    },
    assignedSalesRep: {
      type: String,
      trim: true
    },

    bookingId: {
      type: String,
      required: [true, 'Booking ID is required'],
      unique: true,
      trim: true,
      maxlength: [6, 'Booking ID cannot exceed 6 characters']
    },

    // Follow-up Information
    demoNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Demo notes cannot exceed 1000 characters']
    },
    followUpDate: {
      type: Date
    },
    conversionStatus: {
      type: String,
      enum: ['not-contacted', 'contacted', 'interested', 'trial', 'customer', 'lost'],
      default: 'not-contacted'
    },

    // UTM and Tracking
    source: {
      type: String,
      trim: true,
      maxlength: [100, 'Source cannot exceed 100 characters']
    },
    campaign: {
      type: String,
      trim: true,
      maxlength: [100, 'Campaign cannot exceed 100 characters']
    },
    referrer: {
      type: String,
      trim: true,
      maxlength: [200, 'Referrer cannot exceed 200 characters']
    }
  },
  {
    timestamps: true
  }
);

// Create indexes
DemoSchema.index({ email: 1 });
DemoSchema.index({ company: 1 });
DemoSchema.index({ status: 1 });
DemoSchema.index({ preferredDate: 1 });
DemoSchema.index({ industry: 1 });
DemoSchema.index({ conversionStatus: 1 });
DemoSchema.index({ bookedAt: -1 });
DemoSchema.index({ status: 1, preferredDate: 1 });
DemoSchema.index({ assignedSalesRep: 1, status: 1 });

// Add virtual for full name
DemoSchema.virtual('fullName').get(function (this: IDemo) {
  return `${this.firstName} ${this.lastName}`;
});

// Add virtual for formatted phone
DemoSchema.virtual('formattedPhone').get(function (this: IDemo) {
  return `+${this.countryCode} ${this.phone}`;
});

// Add method to check if demo is upcoming
DemoSchema.methods.isUpcoming = function (this: IDemo): boolean {
  return this.preferredDate > new Date() && ['pending', 'confirmed'].includes(this.status);
};

// Add method to mark as confirmed
DemoSchema.methods.confirm = function (this: IDemo): Promise<IDemo> {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  return this.save();
};

// Add method to mark as completed
DemoSchema.methods.complete = function (this: IDemo, notes?: string): Promise<IDemo> {
  this.status = 'completed';
  this.completedAt = new Date();
  if (notes) {
    this.demoNotes = notes;
  }
  return this.save();
};

// Add static method to find upcoming demos
DemoSchema.statics.findUpcoming = function (this: IDemoModel, days: number = 7): Promise<IDemo[]> {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);

  return this.find({
    preferredDate: { $gte: now, $lte: futureDate },
    status: { $in: ['pending', 'confirmed'] }
  }).sort({ preferredDate: 1 });
};

// Add static method to get analytics
DemoSchema.statics.getAnalytics = function (this: IDemoModel, startDate?: Date, endDate?: Date): Promise<any[]> {
  const matchConditions: any = {};

  if (startDate || endDate) {
    matchConditions.bookedAt = {};
    if (startDate) matchConditions.bookedAt.$gte = startDate;
    if (endDate) matchConditions.bookedAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        completedDemos: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        conversionToCustomer: {
          $sum: { $cond: [{ $eq: ['$conversionStatus', 'customer'] }, 1, 0] }
        },
        industriesBreakdown: { $push: '$industry' },
        companySizeBreakdown: { $push: '$companySize' }
      }
    }
  ]);
};

// Pre-save middleware to ensure email uniqueness for pending/confirmed demos
DemoSchema.pre('save', async function (this: IDemo, next) {
  if (!this.isNew) {
    return next();
  }

  // Check if there's already a pending or confirmed demo for this email in the future
  const existingDemo = await (this.constructor as IDemoModel).findOne({
    email: this.email,
    preferredDate: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] }
  });

  if (existingDemo) {
    const error = new Error('You already have a pending demo booking. Please contact us to reschedule.');
    return next(error);
  }

  next();
});

// Export the model
const Demo = (mongoose.models.Demo as IDemoModel) || mongoose.model<IDemo, IDemoModel>('Demo', DemoSchema);

export default Demo;
