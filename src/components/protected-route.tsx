'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageSkeleton } from '@/components/ui/page-skeleton';

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

        // For now, we skip role checking as user object from Supabase doesn't have role directly
        // TODO: Implement role checking by fetching user profile from database if needed

        setShouldRender(true);
    }, [user, loading, requiredRole, fallbackUrl, router]);

    if (loading) {
        return <PageSkeleton />;
    }

    if (!shouldRender) {
        return null;
    }

    return <>{children}</>;
}
