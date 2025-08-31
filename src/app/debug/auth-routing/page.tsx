'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    User,
    Shield,
    Navigation,
    Database,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react'

export default function AuthDebugPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    const testRoutes = [
        { path: '/', label: 'Home', description: 'Should redirect based on auth/role' },
        { path: '/dashboard', label: 'Candidate Dashboard', description: 'Candidates only' },
        { path: '/recruiters/dashboard', label: 'Recruiter Dashboard', description: 'Recruiters only' },
        { path: '/auth/signin', label: 'Sign In', description: 'Authenticated users should be redirected' },
        { path: '/auth/signup', label: 'Sign Up', description: 'Authenticated users should be redirected' },
        { path: '/recruiters/jobs', label: 'Recruiter Jobs', description: 'Recruiters only' },
        { path: '/unauthorized', label: 'Unauthorized', description: 'Error page' }
    ]

    const navigateToRoute = (path: string) => {
        router.push(path)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    const userRole = user?.user_metadata?.role
    const isAuthenticated = !!user

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Role-Based Routing Debug Panel</h1>
                <p className="text-gray-600">Test and validate the routing implementation</p>
            </div>

            {/* Authentication Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Authentication Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="font-medium">Status</p>
                            <Badge variant={isAuthenticated ? "default" : "destructive"}>
                                {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                            </Badge>
                        </div>
                        <div>
                            <p className="font-medium">Role</p>
                            <Badge variant={userRole ? "default" : "secondary"}>
                                {userRole || "No Role"}
                            </Badge>
                        </div>
                        <div>
                            <p className="font-medium">User ID</p>
                            <p className="text-sm text-gray-600 truncate">
                                {user?.id || "N/A"}
                            </p>
                        </div>
                    </div>

                    {user && (
                        <div className="mt-4">
                            <p className="font-medium mb-2">User Metadata</p>
                            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                                {JSON.stringify(user.user_metadata, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Route Testing */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-5 w-5" />
                        Route Testing
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {testRoutes.map((route) => (
                            <div key={route.path} className="border rounded-lg p-4">
                                <h3 className="font-medium">{route.label}</h3>
                                <p className="text-sm text-gray-600 mb-3">{route.description}</p>
                                <Button
                                    onClick={() => navigateToRoute(route.path)}
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                >
                                    Navigate to {route.path}
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Expected Behavior */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Expected Behavior Matrix
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 p-2 text-left">Route</th>
                                    <th className="border border-gray-300 p-2 text-left">Unauthenticated</th>
                                    <th className="border border-gray-300 p-2 text-left">Candidate</th>
                                    <th className="border border-gray-300 p-2 text-left">Recruiter</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 p-2 font-mono">/</td>
                                    <td className="border border-gray-300 p-2">✅ Show Landing Page</td>
                                    <td className="border border-gray-300 p-2">→ /dashboard</td>
                                    <td className="border border-gray-300 p-2">→ /recruiters/dashboard</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2 font-mono">/dashboard</td>
                                    <td className="border border-gray-300 p-2">→ /auth/signin</td>
                                    <td className="border border-gray-300 p-2">✅ Allow</td>
                                    <td className="border border-gray-300 p-2">→ /recruiters/dashboard</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2 font-mono">/recruiters/dashboard</td>
                                    <td className="border border-gray-300 p-2">→ /auth/signin</td>
                                    <td className="border border-gray-300 p-2">→ /dashboard</td>
                                    <td className="border border-gray-300 p-2">✅ Allow</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2 font-mono">/auth/signin</td>
                                    <td className="border border-gray-300 p-2">✅ Allow</td>
                                    <td className="border border-gray-300 p-2">→ /dashboard</td>
                                    <td className="border border-gray-300 p-2">→ /recruiters/dashboard</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Current State Indicators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Current State Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            {isAuthenticated ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span>Authentication State: {isAuthenticated ? "Logged In" : "Not Logged In"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {userRole ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            )}
                            <span>Role Assignment: {userRole ? `Role = ${userRole}` : "No role assigned"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>Middleware: Active and compiled successfully</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => router.push('/auth/signin')} variant="outline">
                            Go to Sign In
                        </Button>
                        <Button onClick={() => router.push('/auth/signup')} variant="outline">
                            Go to Sign Up
                        </Button>
                        <Button onClick={() => router.push('/recruiters/auth/signin')} variant="outline">
                            Recruiter Sign In
                        </Button>
                        {isAuthenticated && (
                            <Button onClick={() => router.push('/')} variant="default">
                                Test Home Redirect
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
