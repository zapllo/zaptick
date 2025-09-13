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
      .select('-password');

    // Sort users by role hierarchy: owner first, then admin, then others
    const sortedUsers = users.sort((a, b) => {
      // Define role hierarchy weights
      const getRoleWeight = (user: any) => {
        if (user.isOwner || user.role === 'owner') return 3;
        if (user.role === 'admin') return 2;
        return 1; // agents and other roles
      };

      const weightA = getRoleWeight(a);
      const weightB = getRoleWeight(b);

      // Sort by role weight (descending), then by creation date (newest first)
      if (weightA !== weightB) {
        return weightB - weightA;
      }

      // If same role weight, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      users: sortedUsers
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
    const currentUser = await User.findById(decoded.id).select('companyId role isOwner wabaAccounts').populate('companyId', 'subscriptionPlan subscriptionStatus');
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Only allow owners and admins to create users
    const isOwnerOrAdmin = currentUser.isOwner || currentUser.role === 'owner' || currentUser.role === 'admin';
    if (!isOwnerOrAdmin) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    }

    // Check subscription plan limits
    const company = currentUser.companyId as any;
    const subscriptionPlan = company?.subscriptionPlan || 'free';
    const subscriptionStatus = company?.subscriptionStatus || 'expired';

    // Check if subscription is active
    if (subscriptionStatus !== 'active') {
      return NextResponse.json({
        success: false,
        message: 'Your subscription is not active. Please upgrade or renew your plan to add team members.',
        code: 'SUBSCRIPTION_INACTIVE'
      }, { status: 403 });
    }

    // Define team member limits based on subscription plan
    const planLimits = {
      free: 1, // Only owner
      starter: 5, // Up to 5 total members including owner
      growth: 10, // Up to 10 total members including owner  
      advanced: 25, // Up to 25 total members including owner
      enterprise: Infinity // Unlimited
    };

    const currentLimit = planLimits[subscriptionPlan as keyof typeof planLimits] || planLimits.free;

    // Count existing users in the company
    const existingUsersCount = await User.countDocuments({ companyId: currentUser.companyId });

    // Check if adding this user would exceed the plan limit
    if (existingUsersCount >= currentLimit) {
      const planNames = {
        free: 'Free',
        starter: 'Starter',
        growth: 'Growth',
        advanced: 'Advanced',
        enterprise: 'Enterprise'
      };

      return NextResponse.json({
        success: false,
        message: `You've reached the team member limit for your ${planNames[subscriptionPlan as keyof typeof planNames] || 'current'} plan. Please upgrade to add more team members.`,
        code: 'TEAM_LIMIT_REACHED',
        currentCount: existingUsersCount,
        limit: currentLimit,
        plan: subscriptionPlan
      }, { status: 403 });
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