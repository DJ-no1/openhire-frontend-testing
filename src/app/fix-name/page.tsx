'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { syncCurrentUserName } from '@/lib/fix-user-names';

export default function QuickNameFixPage() {
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fixName = async () => {
        setIsLoading(true);
        try {
            const fixResult = await syncCurrentUserName();
            setResult(fixResult);
        } catch (error) {
            setResult({ success: false, message: `Error: ${error}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>🔧 Quick Name Fix</CardTitle>
                    <CardDescription>
                        Fix "Job Applicant" name issue by syncing with your auth data
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        onClick={fixName}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Fixing Name...' : 'Fix My Name Now'}
                    </Button>

                    {result && (
                        <div className={`p-4 rounded-lg border ${result.success
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                            <h3 className="font-medium mb-2">
                                {result.success ? '✅ Success!' : '❌ Error'}
                            </h3>
                            <p className="text-sm mb-3">{result.message}</p>

                            {result.data && (
                                <div className="text-xs bg-white/50 p-2 rounded">
                                    <div><strong>Previous:</strong> {result.data.previousName}</div>
                                    <div><strong>Updated:</strong> {result.data.newName}</div>
                                    <div><strong>Auth Name:</strong> {result.data.authName}</div>
                                </div>
                            )}

                            {result.success && (
                                <p className="text-xs mt-3 opacity-75">
                                    💡 Refresh the page to see the changes reflected everywhere
                                </p>
                            )}
                        </div>
                    )}

                    <div className="text-xs text-gray-600 space-y-2">
                        <p><strong>What this fixes:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Updates "Job Applicant" to your real name</li>
                            <li>Syncs your custom users table with auth data</li>
                            <li>Ensures display_name is set correctly</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
