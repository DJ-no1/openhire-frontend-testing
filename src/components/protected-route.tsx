'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'recruiter' | 'candidate';
    fallbackUrl?: string;
}

export function ProtectedRoute({
    children,
    requiredRole,
    fallbackUrl
}: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Allow interview-result pages for testing without authentication
        if (typeof window !== 'undefined' && window.location.pathname.includes('/interview-result')) {
            console.log('🔓 Bypassing ProtectedRoute for interview-result page');
            setShouldRender(true);
            return;
        }

        if (loading) return;

        if (!user) {
            // Not authenticated, redirect to appropriate signin page
            const redirectUrl = requiredRole === 'recruiter'
                ? '/recruiters/auth/signin'
                : fallbackUrl || '/auth/signin';
            router.push(redirectUrl);
            return;
        }

        if (requiredRole && user.role !== requiredRole) {
            // Wrong role, redirect to appropriate dashboard
            const redirectUrl = user.role === 'recruiter'
                ? '/recruiters/dashboard'
                : '/dashboard';
            router.push(redirectUrl);
            return;
        }

        setShouldRender(true);
    }, [user, loading, requiredRole, fallbackUrl, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!shouldRender) {
        return null;
    }

    return <>{children}</>;
}
