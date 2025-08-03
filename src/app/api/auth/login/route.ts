import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = createToken(user);

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin || user.role === 'superadmin',
        isOwner: user.isOwner,
        companyId: user.companyId,
      },
    });

    console.log(response, 'response')
    // Set HTTP-only cookie with the token
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: false,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    console.log('Set auth cookie, token length:', token.length);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Something went wrong during login' },
      { status: 500 }
    );
  }
}
