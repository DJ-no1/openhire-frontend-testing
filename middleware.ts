import { updateSession } from './src/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for API routes, static files, public assets, and public job pages
    if (pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/public') ||
        pathname.startsWith('/test') ||
        pathname.startsWith('/jobs') ||
        pathname.includes('/interview-result') || // Allow interview-result pages for testing
        pathname === '/') {
        return NextResponse.next()
    }

    // Update session using Supabase SSR
    const { supabaseResponse, user } = await updateSession(request)

    // Get user role from metadata
    const userRole = user?.user_metadata?.role || 'candidate'

    // Paths that require authentication
    const protectedPaths = ['/dashboard', '/recruiters']

    // Paths that require recruiter role
    const recruiterPaths = ['/recruiters']

    // Paths that require candidate role  
    const candidatePaths = ['/dashboard']

    // Auth pages
    const authPages = [
        '/auth/signin',
        '/auth/signup',
        '/recruiters/auth/signin',
        '/recruiters/auth/signup'
    ]

    // Check if the current path is protected
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
    const isRecruiterPath = recruiterPaths.some(path => pathname.startsWith(path))
    const isCandidatePath = candidatePaths.some(path => pathname.startsWith(path))
    const isAuthPage = authPages.some(path => pathname.startsWith(path))

    // If accessing a protected path without authentication, redirect to signin
    if (isProtectedPath && !user) {
        const redirectTo = isRecruiterPath ? '/recruiters/auth/signin' : '/auth/signin'
        const redirectUrl = new URL(redirectTo, request.url)
        return NextResponse.redirect(redirectUrl)
    }

    // If authenticated and accessing auth pages, redirect to appropriate dashboard based on user role
    if (user && isAuthPage) {
        const redirectTo = userRole === 'recruiter' ? '/recruiters/dashboard' : '/dashboard'
        const redirectUrl = new URL(redirectTo, request.url)
        return NextResponse.redirect(redirectUrl)
    }

    // Role-based access control for authenticated users
    if (user && isProtectedPath) {
        // Prevent candidates from accessing recruiter pages
        if (userRole === 'candidate' && isRecruiterPath) {
            const redirectUrl = new URL('/dashboard', request.url)
            return NextResponse.redirect(redirectUrl)
        }

        // Prevent recruiters from accessing candidate pages
        if (userRole === 'recruiter' && isCandidatePath) {
            const redirectUrl = new URL('/recruiters/dashboard', request.url)
            return NextResponse.redirect(redirectUrl)
        }
    }

    // Set security headers to improve session persistence
    supabaseResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    supabaseResponse.headers.set('Pragma', 'no-cache')
    supabaseResponse.headers.set('Expires', '0')

    return supabaseResponse
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
