import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Route configuration
const ROUTE_CONFIG = {
    // Public routes that don't require authentication
    PUBLIC_ROUTES: [
        '/',
        '/about',
        '/contact',
        '/features',
        '/pricing',
        '/privacy',
        '/terms',
        '/get-started',
        '/auth/signin',
        '/auth/signup',
        '/recruiters/auth/signin',
        '/recruiters/auth/signup',
        '/forgot-password',
        '/reset-password'
    ],

    // Routes that are excluded from middleware processing
    EXCLUDED_PATHS: [
        '/api',
        '/_next',
        '/favicon.ico',
        '/public',
        '/test',
        '/jobs', // Public job listings
        '/interview-result'
    ],

    // Role-specific route patterns
    CANDIDATE_ROUTES: [
        '/dashboard',
        '/profile',
        '/applications',
        '/interviews',
        '/settings'
    ],

    RECRUITER_ROUTES: [
        '/recruiters'
    ]
}

// Default redirects for each role
const DEFAULT_REDIRECTS = {
    candidate: '/dashboard',
    recruiter: '/recruiters/dashboard',
    unauthenticated: '/auth/signin'
}

/**
 * Get user role from the users table in the database
 */
async function getUserRole(supabase: any, userId: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching user role:', error)
            return null
        }

        return data?.role || null
    } catch (error) {
        console.error('Exception while fetching user role:', error)
        return null
    }
}

/**
 * Check if a path should be excluded from middleware processing
 */
function isExcludedPath(pathname: string): boolean {
    return ROUTE_CONFIG.EXCLUDED_PATHS.some(path => pathname.startsWith(path))
}

/**
 * Check if a path is a public route (accessible without authentication)
 */
function isPublicRoute(pathname: string): boolean {
    return ROUTE_CONFIG.PUBLIC_ROUTES.includes(pathname)
}

/**
 * Check if a path is an auth page (signin/signup)
 */
function isAuthPage(pathname: string): boolean {
    const authPages = [
        '/auth/signin',
        '/auth/signup',
        '/recruiters/auth/signin',
        '/recruiters/auth/signup'
    ]
    return authPages.includes(pathname)
}

/**
 * Check if a user role is allowed to access a specific path
 */
function isAllowedRoute(pathname: string, userRole: string): boolean {
    // Public routes are always allowed
    if (isPublicRoute(pathname)) {
        return true
    }

    if (userRole === 'recruiter') {
        // Recruiters can only access recruiter routes
        return ROUTE_CONFIG.RECRUITER_ROUTES.some(route => pathname.startsWith(route))
    } else if (userRole === 'candidate') {
        // Candidates can access candidate routes but not recruiter routes
        const isRecruiterRoute = ROUTE_CONFIG.RECRUITER_ROUTES.some(route => pathname.startsWith(route))
        return !isRecruiterRoute
    }

    return false
}

/**
 * Get the appropriate redirect URL based on user role and current path
 */
function getRedirectUrl(request: NextRequest, userRole: string | null, isAuthenticated: boolean): string | null {
    const { pathname } = request.nextUrl

    // Handle root path redirection
    if (pathname === '/') {
        if (isAuthenticated && userRole) {
            return DEFAULT_REDIRECTS[userRole as keyof typeof DEFAULT_REDIRECTS]
        }
        // Don't redirect unauthenticated users from home page - let them see the landing page
        return null
    }

    // Handle auth page access by authenticated users
    if (isAuthenticated && isAuthPage(pathname)) {
        if (userRole) {
            return DEFAULT_REDIRECTS[userRole as keyof typeof DEFAULT_REDIRECTS]
        }
    }

    // Handle unauthenticated access to protected routes
    if (!isAuthenticated && !isPublicRoute(pathname)) {
        return '/auth/signin'  // Redirect to signin for protected routes
    }

    // Handle role-based route restrictions
    if (isAuthenticated && userRole && !isAllowedRoute(pathname, userRole)) {
        return DEFAULT_REDIRECTS[userRole as keyof typeof DEFAULT_REDIRECTS]
    }

    return null
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for excluded paths
    if (isExcludedPath(pathname)) {
        return NextResponse.next()
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Get user session
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthenticated = !!user
    let userRole: string | null = null

    // If user is authenticated, get their role from the database
    if (isAuthenticated && user) {
        // First try to get role from metadata as fallback
        userRole = user.user_metadata?.role || null

        // Then try to get the authoritative role from the database
        const dbRole = await getUserRole(supabase, user.id)
        if (dbRole) {
            userRole = dbRole
        }

        // If no role found anywhere, default to candidate
        if (!userRole) {
            userRole = 'candidate'
        }
    }

    // Determine if a redirect is needed
    const redirectUrl = getRedirectUrl(request, userRole, isAuthenticated)

    if (redirectUrl) {
        const url = new URL(redirectUrl, request.url)

        // Prevent redirect loops by checking if we're already at the target
        if (url.pathname !== pathname) {
            return NextResponse.redirect(url)
        }
    }

    // Set security headers
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
