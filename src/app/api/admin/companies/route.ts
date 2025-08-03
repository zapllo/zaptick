import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/models/Company';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const companies = await Company.find(
      {}, 
      'name templateRates walletBalance currency industry category location subscriptionPlan subscriptionStatus createdAt isActive'
    )
    .sort({ name: 1 })
    .lean();

    // Ensure walletBalance is a number and handle any edge cases
    const processedCompanies = companies.map(company => ({
      ...company,
      walletBalance: typeof company.walletBalance === 'number' ? company.walletBalance : 0,
      currency: company.currency || 'INR'
    }));

    return NextResponse.json({
      success: true,
      companies: processedCompanies
    });

  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { companyId, walletBalance, currency } = body;

    if (!companyId || walletBalance === undefined || walletBalance === null) {
      return NextResponse.json(
        { success: false, error: 'Company ID and wallet balance are required' },
        { status: 400 }
      );
    }

    // Ensure walletBalance is a valid number
    const numericBalance = parseFloat(walletBalance);
    if (isNaN(numericBalance) || numericBalance < 0) {
      return NextResponse.json(
        { success: false, error: 'Wallet balance must be a valid positive number' },
        { status: 400 }
      );
    }

    const updateData: any = { walletBalance: numericBalance };
    if (currency) {
      updateData.currency = currency;
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      updateData,
      { new: true, select: 'name walletBalance currency' }
    );

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Wallet balance updated successfully',
      company: {
        ...company.toObject(),
        walletBalance: typeof company.walletBalance === 'number' ? company.walletBalance : 0
      }
    });

  } catch (error) {
    console.error('Error updating wallet balance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update wallet balance' },
      { status: 500 }
    );
  }
}