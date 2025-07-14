import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import User from '@/models/User';
import Role from '@/models/Role';
import bcrypt from 'bcrypt';

export async function GET(req: NextRequest) {
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

    // Get current user to verify company
    const currentUser = await User.findById(decoded.id).select('companyId role isOwner');
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Only allow owners and admins to manage users
    const isOwnerOrAdmin = currentUser.isOwner || currentUser.role === 'owner' || currentUser.role === 'admin';
    if (!isOwnerOrAdmin) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    }

    const users = await User.find({ 
      companyId: currentUser.companyId,
    })
    .populate('roleId', 'name permissions')
    .populate('invitedBy', 'name email')
    .select('-password')
    .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    // Get current user to verify permissions and get WABA accounts
    const currentUser = await User.findById(decoded.id).select('companyId role isOwner wabaAccounts');
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Only allow owners and admins to create users
    const isOwnerOrAdmin = currentUser.isOwner || currentUser.role === 'owner' || currentUser.role === 'admin';
    if (!isOwnerOrAdmin) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    }

    const { name, email, password, roleId, role = 'agent' } = await req.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      );
    }

    // Prevent creating another owner (only one owner per company)
    if (role === 'owner') {
      return NextResponse.json(
        { success: false, message: 'Cannot create another owner. There can only be one owner per company.' },
        { status: 400 }
      );
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

    // If no roleId provided, get default role
    let finalRoleId = roleId;
    if (!finalRoleId) {
      const defaultRole = await Role.findOne({ 
        companyId: currentUser.companyId, 
        isDefault: true 
      });
      finalRoleId = defaultRole?._id;
    }

    // Get company WABA accounts from the owner or find the owner's accounts
    let companyWabaAccounts = currentUser.wabaAccounts || [];
    
    // If current user doesn't have WABA accounts, find the owner's accounts
    if (!companyWabaAccounts.length) {
      const owner = await User.findOne({ 
        companyId: currentUser.companyId,
        $or: [
          { isOwner: true },
          { role: 'owner' }
        ]
      }).select('wabaAccounts');
      
      if (owner && owner.wabaAccounts) {
        companyWabaAccounts = owner.wabaAccounts;
      }
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      companyId: currentUser.companyId,
      roleId: finalRoleId,
      role,
      isOwner: false, // New users are never owners
      invitedBy: currentUser._id,
      invitedAt: new Date(),
      wabaAccounts: companyWabaAccounts // Share company's WABA accounts
    });

    await user.save();

    // Populate role information for response
    await user.populate('roleId', 'name permissions');

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'User created successfully with access to company WhatsApp Business accounts'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    );
  }
}