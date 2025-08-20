import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for API routes, static files, public assets, and public job pages
    if (pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/public') ||
        pathname.startsWith('/test') ||
        pathname.startsWith('/jobs') ||
        pathname.includes('/interview-result') || // Allow interview-result pages for testing
        pathname === '/') {
        return NextResponse.next();
    }

    // Get Supabase session tokens from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;

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

    // Create response object
    const response = NextResponse.next();

    // If accessing a protected path without authentication, redirect to signin
    if (isProtectedPath && !accessToken && !refreshToken) {
        const redirectTo = isRecruiterPath ? '/recruiters/auth/signin' : '/auth/signin';
        return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // If authenticated and accessing auth pages, redirect to appropriate dashboard
    if ((accessToken || refreshToken) && (
        pathname.includes('/auth/signin') ||
        pathname.includes('/auth/signup') ||
        pathname.includes('/recruiters/auth/signin') ||
        pathname.includes('/recruiters/auth/signup')
    )) {
        // For now, we'll redirect based on the auth path they were trying to access
        const redirectTo = pathname.includes('/recruiters/auth') ? '/recruiters/dashboard' : '/dashboard';
        return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Set security headers to improve session persistence
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
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
