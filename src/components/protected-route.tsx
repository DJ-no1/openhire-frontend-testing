'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageSkeleton } from '@/components/ui/page-skeleton';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'recruiter' | 'candidate';
    allowedRoles?: ('recruiter' | 'candidate')[];
    fallbackUrl?: string;
}

export function ProtectedRoute({
    children,
    requiredRole,
    allowedRoles,
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

        // Check role requirements
        const userRole = user.user_metadata?.role || 'candidate';

        if (requiredRole && userRole !== requiredRole) {
            // User doesn't have the required role
            const redirectUrl = userRole === 'recruiter' ? '/recruiters/dashboard' : '/dashboard';
            router.push(redirectUrl);
            return;
        }

        if (allowedRoles && !allowedRoles.includes(userRole as 'recruiter' | 'candidate')) {
            // User's role is not in the allowed roles list
            const redirectUrl = userRole === 'recruiter' ? '/recruiters/dashboard' : '/dashboard';
            router.push(redirectUrl);
            return;
        }

        setShouldRender(true);
    }, [user, loading, requiredRole, allowedRoles, fallbackUrl, router]);

    if (loading) {
        return <PageSkeleton />;
    }

    if (!shouldRender) {
        return null;
    }

    return <>{children}</>;
}
