"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PermissionCheck from "./PermissionCheck";
import Layout from "../layout/Layout";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    resource?: string;
    action?: string;
    adminOnly?: boolean;
    ownerOnly?: boolean; // Add owner-only protection
    fallback?: React.ReactNode;
}

export default function ProtectedRoute({
    children,
    resource,
    action = "read",
    adminOnly = false,
    ownerOnly = false,
    fallback
}: ProtectedRouteProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>('');
    const [isOwner, setIsOwner] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                setIsAuthenticated(true);
                setUserRole(data.user.role);
                setIsOwner(data.user.isOwner || data.user.role === 'owner');
            } else {
                router.push('/login');
                return;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/login');
            return;
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    // Check owner-only routes
    if (ownerOnly && !isOwner) {
        return fallback || (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <DotLottieReact
                            src="/denied.lottie"
                            loop
                            autoplay
                        />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                        <p className="text-gray-600">You need company owner privileges to access this page.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Check admin-only routes (owners are considered admins)
    if (adminOnly && !isOwner && userRole !== 'admin') {
        return fallback || (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <DotLottieReact
                            src="/denied.lottie"
                            loop
                            autoplay
                        />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                        <p className="text-gray-600">You need administrator privileges to access this page.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // If resource and action specified, check permissions
    if (resource && action) {
        return (
            <PermissionCheck
                resource={resource}
                action={action}
                fallback={fallback || (
                    <Layout>
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <DotLottieReact
                                    src="/denied.lottie"
                                    loop
                                    autoplay
                                />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                                <p className="text-gray-600">You don&apos;t have permission to access this resource.</p>
                            </div>
                        </div>
                    </Layout>
                )}
            >
                {children}
            </PermissionCheck>
        );
    }

    return <>{children}</>;
}