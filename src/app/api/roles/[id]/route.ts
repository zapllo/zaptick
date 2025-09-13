import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import Role from '@/models/Role';
import User from '@/models/User';

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

    // Only allow admins to update roles
    // if (currentUser.role !== 'admin') {
    //   return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    // }

    const { name, description, permissions, isDefault } = await req.json();

    // Find the role and verify it belongs to the company
    const role = await Role.findOne({ 
      _id: params.id, 
      companyId: currentUser.companyId 
    });

    if (!role) {
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    }

    // Check if new name conflicts with existing roles
    if (name && name.trim() !== role.name) {
      const existingRole = await Role.findOne({ 
        name: name.trim(), 
        companyId: currentUser.companyId,
        _id: { $ne: params.id }
      });

      if (existingRole) {
        return NextResponse.json(
          { success: false, message: 'Role name already exists' },
          { status: 400 }
        );
      }
    }

    // If setting as default, remove default from other roles
    if (isDefault && !role.isDefault) {
      await Role.updateMany(
        { companyId: currentUser.companyId, _id: { $ne: params.id } },
        { isDefault: false }
      );
    }

    // Update role
    if (name) role.name = name.trim();
    if (description !== undefined) role.description = description?.trim();
    if (permissions) role.permissions = permissions;
    if (isDefault !== undefined) role.isDefault = isDefault;

    await role.save();

    return NextResponse.json({
      success: true,
      role,
      message: 'Role updated successfully'
    });

  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update role' },
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

    // Only allow admins to delete roles
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    }

    // Find the role and verify it belongs to the company
    const role = await Role.findOne({ 
      _id: params.id, 
      companyId: currentUser.companyId 
    });

    if (!role) {
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    }

    // Check if any users are assigned to this role
    const usersWithRole = await User.countDocuments({ roleId: params.id });
    if (usersWithRole > 0) {
      return NextResponse.json(
        { success: false, message: `Cannot delete role. ${usersWithRole} user(s) are assigned to this role.` },
        { status: 400 }
      );
    }

    await Role.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete role' },
      { status: 500 }
    );
  }
}