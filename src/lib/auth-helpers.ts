import { verifyToken } from '@/lib/jwt';
import { NextRequest } from 'next/server';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  isOwner: boolean;
  companyId: string;
}

export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    return decoded as AuthUser;
  } catch (error) {
    return null;
  }
}

export function isSuperAdmin(user: AuthUser | null): boolean {
  return user?.role === 'superadmin' || user?.isSuperAdmin === true;
}