import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

// Reference the ResetToken model
const ResetToken = mongoose.models.ResetToken;

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Find the token in the database
    const resetToken = await ResetToken.findOne({ token });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findById(resetToken.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update the user's password
    user.password = password;
    await user.save();

    // Delete the token as it's now used
    await ResetToken.deleteOne({ _id: resetToken._id });

    // Send confirmation email (optional)
    // You can use your sendEmail function here to notify the user

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
