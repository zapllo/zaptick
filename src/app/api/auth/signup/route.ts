import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Company from '@/models/Company';
import { createToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, email, password, companyName } = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Create new company
    const company = await Company.create({
      name: companyName,
    });

    // Create new user with company reference
    const user = await User.create({
      name,
      email,
      password,
      companyId: company._id,
      role: 'admin', // First user is admin
    });

    // Generate token
    const token = createToken(user);

    // Return token and user
    return NextResponse.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        companyId: user.companyId,
        role: user.role
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong during signup' },
      { status: 500 }
    );
  }
}
