import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import User from '@/models/User';
import Role from '@/models/Role';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    // Get current user to verify permissions
    const currentUser = await User.findById(decoded.id).select('companyId role');
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Only allow admins to update users
    // if (currentUser.role !== 'admin') {
    //   return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    // }

    const { name, email, roleId, isActive, role } = await req.json();

    // Find the user and verify it belongs to the company
    const user = await User.findOne({ 
      _id: params.id, 
      companyId: currentUser.companyId 
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Prevent admin from updating their own admin status
    if (user._id.toString() === currentUser._id.toString() && role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Cannot change your own admin role' },
        { status: 400 }
      );
    }

    // Check if new email conflicts with existing users
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: params.id }
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Verify role exists if provided
    if (roleId) {
      const roleExists = await Role.findOne({ 
        _id: roleId, 
        companyId: currentUser.companyId 
      });
      if (!roleExists) {
        return NextResponse.json(
          { success: false, message: 'Invalid role selected' },
          { status: 400 }
        );
      }
    }

    // Update user
    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (roleId !== undefined) user.roleId = roleId;
    if (isActive !== undefined) user.isActive = isActive;
    if (role) user.role = role;

    await user.save();

    // Populate role information for response
    await user.populate('roleId', 'name permissions');

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    // Get current user to verify permissions
    const currentUser = await User.findById(decoded.id).select('companyId role');
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Only allow admins to delete users
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    }

    // Find the user and verify it belongs to the company
    const user = await User.findOne({ 
      _id: params.id, 
      companyId: currentUser.companyId 
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}