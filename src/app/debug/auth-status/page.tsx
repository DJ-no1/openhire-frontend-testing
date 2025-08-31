'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AuthDebugPage() {
    const { user, loading, signOut } = useAuth()
    const router = useRouter()

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
    }

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Authentication Debug</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Authentication Status:</h3>
                        <p>Authenticated: {user ? 'Yes' : 'No'}</p>
                    </div>

                    {user && (
                        <>
                            <div>
                                <h3 className="font-semibold">User Information:</h3>
                                <p>ID: {user.id}</p>
                                <p>Email: {user.email}</p>
                                <p>Role: {user.user_metadata?.role || 'No role'}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold">User Metadata:</h3>
                                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(user.user_metadata, null, 2)}
                                </pre>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold">Navigation Tests:</h3>
                                <div className="flex flex-wrap gap-2">
                                    <Button onClick={() => router.push('/')}>Go to Home</Button>
                                    <Button onClick={() => router.push('/dashboard')}>Candidate Dashboard</Button>
                                    <Button onClick={() => router.push('/recruiters/dashboard')}>Recruiter Dashboard</Button>
                                    <Button onClick={handleSignOut} variant="destructive">Sign Out</Button>
                                </div>
                            </div>
                        </>
                    )}

                    {!user && (
                        <div className="space-y-2">
                            <p>You are not authenticated.</p>
                            <div className="flex gap-2">
                                <Button onClick={() => router.push('/auth/signin')}>Sign In</Button>
                                <Button onClick={() => router.push('/auth/signup')}>Sign Up</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
