'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Home, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // If user is authenticated, redirect to their appropriate dashboard
        if (!loading && user) {
            const redirectTo = user.user_metadata?.role === 'recruiter'
                ? '/recruiters/dashboard'
                : '/dashboard'
            router.push(redirectTo)
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    const handleGoHome = () => {
        if (user) {
            const redirectTo = user.user_metadata?.role === 'recruiter'
                ? '/recruiters/dashboard'
                : '/dashboard'
            router.push(redirectTo)
        } else {
            router.push('/')
        }
    }

    const handleSignIn = () => {
        router.push('/auth/signin')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <Card className="shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-4">
                            <Shield className="h-10 w-10 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Access Denied
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <p className="text-gray-600 mb-4">
                                You don't have permission to access this page. This could be because:
                            </p>
                            <ul className="text-sm text-gray-500 space-y-2 mb-6">
                                <li>• You're not signed in</li>
                                <li>• You don't have the required role</li>
                                <li>• You're trying to access a restricted area</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={handleGoHome}
                                className="w-full"
                                variant="default"
                            >
                                <Home className="h-4 w-4 mr-2" />
                                Go to Dashboard
                            </Button>

                            {!user && (
                                <Button
                                    onClick={handleSignIn}
                                    className="w-full"
                                    variant="outline"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Sign In
                                </Button>
                            )}

                            <Button
                                onClick={() => router.back()}
                                className="w-full"
                                variant="ghost"
                            >
                                Go Back
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}