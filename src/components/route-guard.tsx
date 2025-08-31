'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface RouteGuardProps {
    children: React.ReactNode
    allowedRoles?: ('candidate' | 'recruiter')[]
    requiredRole?: 'candidate' | 'recruiter'
    requireAuth?: boolean
    blockAuth?: boolean // Block authenticated users (for auth pages)
}

export default function RouteGuard({
    children,
    allowedRoles,
    requiredRole,
    requireAuth = false,
    blockAuth = false
}: RouteGuardProps) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        if (loading) return

        // If blocking authenticated users (auth pages)
        if (blockAuth && user) {
            const redirectTo = user.role === 'recruiter' ? '/recruiters/dashboard' : '/dashboard'
            router.push(redirectTo)
            return
        }

        // If authentication is required but user is not logged in
        if (requireAuth && !user) {
            router.push('/auth/signin')
            return
        }

        // If specific role is required
        if (requiredRole && user?.role !== requiredRole) {
            const redirectTo = user?.role === 'recruiter' ? '/recruiters/dashboard' : '/dashboard'
            router.push(redirectTo)
            return
        }

        // If allowed roles are specified
        if (allowedRoles && user && user.role && !allowedRoles.includes(user.role as 'candidate' | 'recruiter')) {
            const redirectTo = user.role === 'recruiter' ? '/recruiters/dashboard' : '/dashboard'
            router.push(redirectTo)
            return
        }

        setIsAuthorized(true)
    }, [user, loading, router, allowedRoles, requiredRole, requireAuth, blockAuth])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    return <>{children}</>
}
