'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, Download } from 'lucide-react';

export default function ResumePage() {
    const router = useRouter();

    return (
        <ProtectedRoute requiredRole="candidate">
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            className="mb-4"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Resume Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Upload and manage your resume to improve your job applications.
                        </p>
                    </div>

                    {/* Resume Upload Section */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Upload className="h-5 w-5 mr-2" />
                                Upload Resume
                            </CardTitle>
                            <CardDescription>
                                Upload your latest resume in PDF, DOC, or DOCX format (max 5MB)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Drag and drop your resume here
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    or click to browse your files
                                </p>
                                <Button>
                                    Choose File
                                </Button>
                            </div>
                            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                Supported formats: PDF, DOC, DOCX (max 5MB)
                            </div>
                        </CardContent>
                    </Card>

                    {/* Current Resume Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="h-5 w-5 mr-2" />
                                Current Resume
                            </CardTitle>
                            <CardDescription>
                                Your uploaded resume information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No resume uploaded yet
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    Upload your first resume to get started with job applications
                                </p>
                                <Button variant="outline">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Resume
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
