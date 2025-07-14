"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PermissionCheckProps {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

interface UserPermissions {
  role: 'owner' | 'admin' | 'agent';
  isOwner: boolean;Ḥ
  permissions: {
    resource: string;
    actions: string[];
  }[];
}

export default function PermissionCheck({
  resource,
  action,
  children,
  fallback = null,
  redirectTo
}: PermissionCheckProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkPermission();
  }, [resource, action]);

  const checkPermission = async () => {
    try {
      const response = await fetch('/api/auth/permissions');
      const data = await response.json();

      if (data.success) {
        const userPermissions: UserPermissions = data.permissions;
        
        // Owners and Admins have access to everything
        if (userPermissions.isOwner || userPermissions.role === 'owner' || userPermissions.role === 'admin') {
          setHasPermission(true);
          return;
        }

        // Check specific permission
        const permission = userPermissions.permissions.find(p => p.resource === resource);
        const allowed = permission ? permission.actions.includes(action) : false;
        
        setHasPermission(allowed);

        // Redirect if no permission and redirectTo is specified
        if (!allowed && redirectTo) {
          router.push(redirectTo);
          return;
        }
      } else {
        setHasPermission(false);
        if (redirectTo) {
          router.push(redirectTo);
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setHasPermission(false);
      if (redirectTo) {
        router.push(redirectTo);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-8 w-full rounded"></div>;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}