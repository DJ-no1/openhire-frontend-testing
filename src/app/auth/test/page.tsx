'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useAuthLoading } from '@/hooks/useAuthLoading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/ui/page-skeleton';
import { CheckCircle, XCircle, User, Mail, Shield } from 'lucide-react';

export default function AuthTestPage() {
    const { user, loading, signOut } = useAuth();
    const { isLoading } = useAuthLoading();

    if (isLoading || loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Authentication Test Page
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Testing cookie-based authentication with Supabase SSR
                    </p>
                </div>

                {/* Authentication Status Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Authentication Status
                        </CardTitle>
                        <CardDescription>
                            Current authentication state and user information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                {user ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                <span className={user ? 'text-green-600' : 'text-red-600'}>
                                    {user ? 'Authenticated' : 'Not Authenticated'}
                                </span>
                            </div>

                            {user && (
                                <div className="space-y-3 mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-600" />
                                        <span className="font-medium">User ID:</span>
                                        <span className="font-mono text-sm">{user.id}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-600" />
                                        <span className="font-medium">Email:</span>
                                        <span>{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-600" />
                                        <span className="font-medium">Name:</span>
                                        <span>{user.user_metadata?.name || 'Not set'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-gray-600" />
                                        <span className="font-medium">Role:</span>
                                        <span>{user.user_metadata?.role || 'Not set'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Features Test Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Authentication Features Test</CardTitle>
                        <CardDescription>
                            Test various authentication features and cross-tab functionality
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-medium mb-2">✅ Cookie-based Auth</h3>
                                    <p className="text-sm text-gray-600">
                                        Authentication tokens stored in secure HttpOnly cookies
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-medium mb-2">✅ Cross-tab Sync</h3>
                                    <p className="text-sm text-gray-600">
                                        Authentication state shared between browser tabs
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-medium mb-2">✅ Skeleton Loading</h3>
                                    <p className="text-sm text-gray-600">
                                        Smooth loading experience with skeleton placeholders
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-medium mb-2">✅ Server-side Auth</h3>
                                    <p className="text-sm text-gray-600">
                                        Middleware handles authentication on server-side
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="font-medium mb-3">Test Instructions:</h3>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                                    <li>Sign in on this tab</li>
                                    <li>Open a new tab and navigate to the dashboard - should be automatically authenticated</li>
                                    <li>Sign out on one tab - both tabs should be logged out</li>
                                    <li>Refresh the page - should maintain authentication state</li>
                                </ol>
                            </div>

                            {user ? (
                                <div className="pt-4">
                                    <Button onClick={signOut} variant="destructive">
                                        Sign Out
                                    </Button>
                                </div>
                            ) : (
                                <div className="pt-4 space-x-2">
                                    <Button asChild>
                                        <a href="/auth/signin">Sign in as Candidate</a>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <a href="/recruiters/auth/signin">Sign in as Recruiter</a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
