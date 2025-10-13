import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/models/Company';
import User from '@/models/User';

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    await dbConnect();

    const company = await Company.findById(params.companyId).lean();

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get company users
    const users = await User.find({ companyId: params.companyId })
      .select('-password -twoFactorCode -twoFactorExpiry')
      .lean();

    // Get company statistics
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const ownerUsers = users.filter(user => user.isOwner).length;
    const adminUsers = users.filter(user => user.role === 'admin').length;
    const agentUsers = users.filter(user => user.role === 'agent').length;

    const companyStats = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      ownerUsers,
      adminUsers,
      agentUsers,
      totalTemplateRates: company.templateRates?.length || 0,
      activeTemplateRates: company.templateRates?.filter(rate => rate.isActive).length || 0
    };

    return NextResponse.json({
      success: true,
      company: {
        ...company,
        users,
        stats: companyStats
      }
    });

  } catch (error) {
    console.error('Error fetching company details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    await dbConnect();

    const body = await req.json();
    const { updates } = body;

    if (!updates) {
      return NextResponse.json(
        { success: false, error: 'Updates are required' },
        { status: 400 }
      );
    }

    const company = await Company.findByIdAndUpdate(
      params.companyId,
      { ...updates, updatedAt: Date.now() },
      { new: true }
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    await dbConnect();

    // Delete all users associated with the company
    await User.deleteMany({ companyId: params.companyId });

    // Delete the company
    const company = await Company.findByIdAndDelete(params.companyId);

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Company and all associated users deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
