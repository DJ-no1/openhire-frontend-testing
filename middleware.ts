import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for API routes, static files, and public assets
    if (pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/public')) {
        return NextResponse.next();
    }

    // Get token from cookie
    const token = request.cookies.get('sb-access-token')?.value;

    // Paths that require authentication
    const protectedPaths = ['/dashboard', '/recruiters/dashboard'];

    // Paths that require recruiter role
    const recruiterPaths = ['/recruiters/dashboard'];

    // Paths that require candidate role
    const candidatePaths = ['/dashboard'];

    // Check if the current path is protected
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    const isRecruiterPath = recruiterPaths.some(path => pathname.startsWith(path));
    const isCandidatePath = candidatePaths.some(path => pathname.startsWith(path));

    // If accessing a protected path without authentication, redirect to signin
    if (isProtectedPath && !token) {
        const redirectTo = isRecruiterPath ? '/recruiters/auth/signin' : '/auth/signin';
        return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // If authenticated and accessing auth pages, redirect to appropriate dashboard
    if (token && (pathname.includes('/auth/signin') || pathname.includes('/auth/signup') ||
        pathname.includes('/recruiters/auth/signin') || pathname.includes('/recruiters/auth/signup'))) {
        // For now, we'll redirect based on the auth path they were trying to access
        // In a real implementation, you'd want to check the user's role from the token
        const redirectTo = pathname.includes('/recruiters/auth') ? '/recruiters/dashboard' : '/dashboard';
        return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
