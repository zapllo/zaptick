import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Company from '@/models/Company';

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.id).select('companyId role isOwner');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only owners and admins can update company information
    const isOwnerOrAdmin = user.isOwner || user.role === 'owner' || user.role === 'admin';
    if (!isOwnerOrAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const updateData = await req.json();
    const { name, address, website, industry, category, location, phone, countryCode, size, logo } = updateData;

    
    const company = await Company.findByIdAndUpdate(
      user.companyId,
      {
        name,
        address,
        website,
        industry,
        category,
        location,
        phone,
        countryCode,
        size,
        logo
      },
      { new: true, runValidators: true }
    );

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    await company.save();

    return NextResponse.json({
      success: true,
      company: {
        id: company._id,
        name: company.name,
        address: company.address,
        website: company.website,
        industry: company.industry,
        category: company.category,
        location: company.location,
        phone: company.phone,
        countryCode: company.countryCode,
        size: company.size,
        logo: company.logo
      }
    });
  } catch (error) {
    console.error('Update company error:', error);
    return NextResponse.json({ error: 'Failed to update company information' }, { status: 500 });
  }
}