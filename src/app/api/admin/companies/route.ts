import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/models/Company';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'companyId',
          as: 'users'
        }
      },
      {
        $addFields: {
          totalUsers: { $size: '$users' },
          activeUsers: {
            $size: {
              $filter: {
                input: '$users',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      },
      {
        $sort: { [sortBy]: sortOrder }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ];

    const companies = await Company.aggregate(pipeline);
    const totalCompanies = await Company.countDocuments();

    // Calculate pagination info
    const totalPages = Math.ceil(totalCompanies / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      companies,
      pagination: {
        currentPage: page,
        totalPages,
        totalCompanies,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Check if company name already exists
    const existingCompany = await Company.findOne({ name: body.name });
    if (existingCompany) {
      return NextResponse.json(
        { success: false, error: 'Company name already exists' },
        { status: 400 }
      );
    }

    const company = await Company.create({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Company created successfully',
      company
    });

  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create company' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { companyId, walletBalance, aiCredits, currency, ...otherUpdates } = body;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = { ...otherUpdates, updatedAt: new Date() };

    // Handle wallet balance update
    if (typeof walletBalance === 'number') {
      updateData.walletBalance = Math.max(0, walletBalance);
    }

    // Handle AI credits update
    if (typeof aiCredits === 'number') {
      updateData.aiCredits = Math.max(0, aiCredits);
    }

    // Handle currency update
    if (currency) {
      updateData.currency = currency;
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Company updated successfully',
      company
    });

  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update company' },
      { status: 500 }
    );
  }
}

