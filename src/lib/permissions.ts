import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';

export interface UserPermissions {
  userId: string;
  role: 'owner' | 'admin' | 'agent';
  isOwner: boolean;
  permissions: {
    resource: string;
    actions: string[];
  }[];
}

export async function getUserPermissions(token: string): Promise<UserPermissions | null> {
  try {
    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return null;
    }

    await dbConnect();

    const user = await User.findById(decoded.id)
      .populate('roleId', 'permissions')
      .select('role roleId isOwner');

    if (!user) {
      return null;
    }

    const allResources = ['conversations', 'templates', 'dashboard', 'automations', 'contacts', 'integrations', 'analytics', 'settings', 'campaigns'];
    const fullPermissions = allResources.map(resource => ({
      resource,
      actions: ['read', 'write', 'delete', 'manage']
    }));

    // Owners and Admins have full access to everything
    if (user.isOwner || user.role === 'owner' || user.role === 'admin') {
      return {
        userId: user._id.toString(),
        role: user.role,
        isOwner: user.isOwner || user.role === 'owner',
        permissions: fullPermissions
      };
    }

    // For agents, use their assigned role permissions
    const permissions = user.roleId?.permissions || [];

    return {
      userId: user._id.toString(),
      role: user.role,
      isOwner: false,
      permissions
    };

  } catch (error) {
    console.error('Error getting user permissions:', error);
    return null;
  }
}

export function hasPermission(
  userPermissions: UserPermissions | null,
  resource: string,
  action: string
): boolean {
  if (!userPermissions) {
    return false;
  }

  // Owners and Admins have access to everything
  if (userPermissions.isOwner || userPermissions.role === 'owner' || userPermissions.role === 'admin') {
    return true;
  }

  // Check specific permission
  const permission = userPermissions.permissions.find(p => p.resource === resource);
  return permission ? permission.actions.includes(action) : false;
}

export function requirePermission(resource: string, action: string) {
  return async function(req: any) {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      throw new Error('Not authenticated');
    }

    const userPermissions = await getUserPermissions(token);
    if (!hasPermission(userPermissions, resource, action)) {
      throw new Error('Insufficient permissions');
    }

    return userPermissions;
  };
}

export function isOwnerOrAdmin(userPermissions: UserPermissions | null): boolean {
  if (!userPermissions) return false;
  return userPermissions.isOwner || userPermissions.role === 'owner' || userPermissions.role === 'admin';
}