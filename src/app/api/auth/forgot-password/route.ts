import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import { sendEmail } from '@/lib/sendEmail';

// Create a Reset Token model
import mongoose from 'mongoose';

// Define the schema if it doesn't exist already (add this to a models file later)
const ResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1800 // Token expires in 30 minutes (1800 seconds)
  }
});

// Create the model if it doesn't exist
const ResetToken = mongoose.models.ResetToken || mongoose.model('ResetToken', ResetTokenSchema);

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Don't reveal if the email exists for security reasons
    if (!user) {
      // Still return success for security
      return NextResponse.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Remove any existing tokens for this user
    await ResetToken.deleteMany({ userId: user._id });

    // Create a new reset token
    await ResetToken.create({
      userId: user._id,
      token: resetToken
    });

    // Generate the reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send the email with the reset link
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please click on the following link to reset your password: ${resetUrl}. This link will expire in 30 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/zapzap.png" alt="Zaptick Logo" style="height: 40px;" />
          </div>
          <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #555; margin-bottom: 15px;">Hello ${user.name},</p>
          <p style="color: #555; margin-bottom: 20px;">We received a request to reset your password. Click the button below to create a new password:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>

          <p style="color: #555; margin-bottom: 10px;">This link will expire in 30 minutes for security reasons.</p>
          <p style="color: #555; margin-bottom: 20px;">If you didn't request a password reset, you can safely ignore this email.</p>

          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #777;">
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #22c55e;">${resetUrl}</p>
          </div>
        </div>
      `
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong, please try again later' },
      { status: 500 }
    );
  }
}
