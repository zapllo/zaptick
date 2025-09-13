import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Company from '@/models/Company';
import { createToken } from '@/lib/jwt';
import { seedDefaultRoles } from '@/lib/seedDefaultRoles';

// Define the industry-category mapping for validation
const INDUSTRY_CATEGORIES = {
  "Marketing & Advertising": [
    "Digital Marketing",
    "Traditional Advertising"
  ],
  "Retail": [
    "Ecommerce & Online Stores",
    "Physical Stores & Brick Mortar",
    "Omnichannel Ecommerce & Physical Stores"
  ],
  "Education": [
    "Schools & Universities",
    "Coaching Classes & Training Institutes",
    "Online Learning Platforms",
    "Books & Publications"
  ],
  "Entertainment, Social Media & Gaming": [
    "Movies & TV Shows",
    "Events & Performing Arts",
    "Cinema Halls & Multiplexes",
    "Magazines & Publications",
    "Gaming",
    "Social Media Figures",
    "Gambling & Real Money Gaming"
  ],
  "Finance": [
    "Banks",
    "Investments",
    "Payment Aggregators",
    "Insurance",
    "Loans"
  ],
  "Healthcare": [
    "Medical Services",
    "Prescription Medicines & Drugs",
    "Hospitals"
  ],
  "Public Utilities & Non-Profits": [
    "Government Services",
    "Charities",
    "Religious Organizations"
  ],
  "Professional Services": [
    "Legal Consulting Services",
    "Other Services"
  ],
  "Technology": [
    "Software & IT Services",
    "Technology & Hardware"
  ],
  "Travel & Hospitality": [
    "Hotels & Lodging",
    "Transportation",
    "Tour Agencies",
    "Clubs"
  ],
  "Automotive": [
    "Automobile Dealers",
    "Automotive Services"
  ],
  "Real Estate & Construction": [
    "Property Sales",
    "Building & Construction"
  ],
  "Restaurants": [
    "Fast Food",
    "Fine Dining",
    "Catering"
  ],
  "Manufacturing & Impex": [
    "Consumer Goods Production",
    "Industrial Production",
    "Impex"
  ],
  "Fitness & Wellness": [
    "Gyms & Fitness Centers",
    "Fitness Services",
    "Spas & Salons"
  ],
  "Others": [
    "Miscellaneous"
  ]
};

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { 
      name, 
      email, 
      password, 
      companyName, 
      companyWebsite, 
      companyLocation, 
      companyIndustry, 
      companyCategory,
      companyPhone,
      companyCountryCode
    } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !companyName) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Validate industry-category relationship
    if (companyIndustry && companyCategory) {
      const validCategories = INDUSTRY_CATEGORIES[companyIndustry as keyof typeof INDUSTRY_CATEGORIES];
      if (!validCategories || !validCategories.includes(companyCategory)) {
        return NextResponse.json(
          { error: 'Invalid category for the selected industry' },
          { status: 400 }
        );
      }
    }

    // Validate industry exists in our enum
    if (companyIndustry && !Object.keys(INDUSTRY_CATEGORIES).includes(companyIndustry)) {
      return NextResponse.json(
        { error: 'Invalid industry selected' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Create new company with additional fields
    const company = await Company.create({
      name: companyName,
      website: companyWebsite,
      location: companyLocation,
      industry: companyIndustry,
      category: companyCategory,
      phone: companyPhone,
      countryCode: companyCountryCode,
      walletBalance: 0
    });

    // Create new user with company reference
    const user = await User.create({
      name,
      email,
      password,
      companyId: company._id,
      role: 'owner',
      isOwner: true,
    });

    // Seed default roles for the company
    await seedDefaultRoles(company._id);

    // Generate token
    const token = createToken(user);

    // Return token and user info
    return NextResponse.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        companyId: user.companyId,
        role: user.role
      },
      company: {
        id: company._id,
        name: company.name,
        industry: company.industry,
        category: company.category,
        location: company.location
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle specific MongoDB validation errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
      
      if (error.message.includes('validation failed')) {
        return NextResponse.json(
          { error: 'Please check your input data' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Something went wrong during signup' },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint to fetch available categories for a specific industry
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get('industry');
    
    if (!industry) {
      return NextResponse.json({
        industries: Object.keys(INDUSTRY_CATEGORIES),
        categories: {}
      });
    }
    
    const categories = INDUSTRY_CATEGORIES[industry as keyof typeof INDUSTRY_CATEGORIES] || [];
    
    return NextResponse.json({
      industry,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}