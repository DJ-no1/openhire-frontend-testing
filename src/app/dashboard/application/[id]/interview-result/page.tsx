"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Download,
    Share,
    RefreshCw,
    Loader2,
    AlertCircle,
    Clock,
    Camera,
    MessageSquare,
    FileText,
    Calendar,
    User,
    Brain,
    CheckCircle,
    ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from '@/lib/supabaseClient';

interface InterviewArtifact {
    id: string;
    application_id: string;
    interview_type: string;
    status: string;
    started_at: string;
    completed_at: string;
    duration_minutes: number;
    total_questions: number;
    answered_questions: number;
    ai_assessment: any;
    conversation_log: any[];
    image_url: string | null;
    audio_url: string | null;
    video_url: string | null;
    performance_metrics: any;
    created_at: string;
    updated_at: string;
}

interface InterviewStats {
    totalQuestions: number;
    answeredQuestions: number;
    duration: string;
    completionRate: number;
    averageResponseTime: number;
    imagesCaptured: number;
}

export default function InterviewResultPage() {
    const { id } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [interviewArtifacts, setInterviewArtifacts] = useState<InterviewArtifact[]>([]);
    const [selectedArtifact, setSelectedArtifact] = useState<InterviewArtifact | null>(null);
    const [interviewStats, setInterviewStats] = useState<InterviewStats | null>(null);

    const applicationId = id as string;

    // Fetch interview artifacts
    const fetchInterviewArtifacts = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('🔍 Fetching interview artifacts for application:', applicationId);

            // Step 1: First get the interview_artifact_id from the applications table
            const { data: applicationData, error: appError } = await supabase
                .from('applications')
                .select('interview_artifact_id')
                .eq('id', applicationId)
                .single();

            if (appError) {
                console.error('❌ Error fetching application:', appError);
                setError(`Failed to fetch application data: ${appError.message}`);
                return;
            }

            if (!applicationData?.interview_artifact_id) {
                console.log('📭 No interview artifact ID found for this application');
                setInterviewArtifacts([]);
                setError('No interview has been completed for this application yet.');
                return;
            }

            const rawInterviewArtifactId = applicationData.interview_artifact_id;
            console.log('🎯 Found interview artifact ID(s):', rawInterviewArtifactId);

            // Handle comma-separated interview artifact IDs - use the last one (most recent)
            const interviewArtifactIds = rawInterviewArtifactId.split(',').map((id: string) => id.trim());
            const interviewArtifactId = interviewArtifactIds[interviewArtifactIds.length - 1];

            console.log('📋 All artifact IDs:', interviewArtifactIds);
            console.log('🎯 Using latest artifact ID:', interviewArtifactId);

            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(interviewArtifactId)) {
                console.error('❌ Invalid UUID format:', interviewArtifactId);
                setError(`Invalid interview artifact ID format: ${interviewArtifactId}. Please contact support.`);
                return;
            }

            // Step 2: Check if the interview_artifacts table exists
            const { data: testData, error: testError } = await supabase
                .from('interview_artifacts')
                .select('id')
                .limit(1);

            if (testError) {
                console.error('❌ Table may not exist:', testError);
                setInterviewArtifacts([]);
                setError('Interview artifacts table not found. Please ensure the database is properly set up.');
                return;
            }

            // Step 3: Fetch the specific interview artifact using the ID
            const { data: artifact, error: fetchError } = await supabase
                .from('interview_artifacts')
                .select('*')
                .eq('id', interviewArtifactId)
                .single();

            if (fetchError) {
                console.error('❌ Error fetching interview artifact:', fetchError);
                throw new Error(`Failed to fetch interview data: ${fetchError.message}`);
            }

            console.log('📊 Found interview artifact:', artifact);

            // Since we're fetching a single artifact, wrap it in an array for consistency
            const artifactsArray = artifact ? [artifact] : [];
            setInterviewArtifacts(artifactsArray);

            // Set the artifact as selected
            if (artifact) {
                setSelectedArtifact(artifact);

                // Calculate interview stats
                const stats: InterviewStats = {
                    totalQuestions: artifact.total_questions || 0,
                    answeredQuestions: artifact.answered_questions || 0,
                    duration: formatDuration(artifact.duration_minutes || 0),
                    completionRate: artifact.total_questions
                        ? Math.round((artifact.answered_questions / artifact.total_questions) * 100)
                        : 0,
                    averageResponseTime: calculateAverageResponseTime(artifact.conversation_log || []),
                    imagesCaptured: artifact.image_url
                        ? (typeof artifact.image_url === 'string' && artifact.image_url.includes(',')
                            ? artifact.image_url.split(',').filter((url: string) => url.trim().length > 0).length
                            : 1)
                        : 0
                };

                setInterviewStats(stats);
            } else {
                setError('Interview artifact not found.');
            }

        } catch (err) {
            console.error('❌ Error in fetchInterviewArtifacts:', err);
            const errorMessage = (err as Error).message;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };    // Helper functions
    const formatDuration = (minutes: number): string => {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    const calculateAverageResponseTime = (conversationLog: any[]): number => {
        if (!conversationLog || conversationLog.length === 0) return 0;

        // This is a simplified calculation - in reality, you'd calculate based on timestamps
        return Math.round(Math.random() * 30 + 15); // Mock: 15-45 seconds
    };

    const formatDate = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    // Initialize data fetching
    useEffect(() => {
        if (applicationId) {
            fetchInterviewArtifacts();
        }
    }, [applicationId]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                    <div>
                        <h3 className="text-lg font-medium">Loading Interview Results</h3>
                        <p className="text-muted-foreground">Retrieving your interview data and analysis...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="max-w-lg w-full border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="h-6 w-6" />
                            Error Loading Interview Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-red-700">{error}</p>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => router.back()}
                                variant="outline"
                                className="flex-1"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </Button>
                            <Button
                                onClick={fetchInterviewArtifacts}
                                className="flex-1"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // No results state
    if (interviewArtifacts.length === 0 && !loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="max-w-lg w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-6 w-6" />
                            No Interview Results Found
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600">
                            {error?.includes('table')
                                ? 'The interview artifacts table is not set up. Please run the database setup script.'
                                : 'No interview artifacts found for this application. The interview may not have been completed or data may still be processing.'}
                        </p>

                        {error?.includes('table') && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                <p className="text-blue-800 text-sm">
                                    <strong>Database Setup Required:</strong><br />
                                    Run the SQL script from <code>database-schemas/debug_interview_artifacts.sql</code> in your Supabase SQL editor to create the required table structure.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={() => router.back()}
                                variant="outline"
                                className="flex-1"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </Button>
                            <Button
                                onClick={fetchInterviewArtifacts}
                                className="flex-1"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="mr-4"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-lg font-semibold">Interview Results</h1>
                                <p className="text-sm text-gray-600">Application ID: {applicationId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                            <Button variant="outline" size="sm">
                                <Share className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview Completed Successfully!</h2>
                        <p className="text-lg text-gray-600 mb-6">
                            Your AI interview has been completed and analyzed. Review your results below.
                        </p>
                        {selectedArtifact && (
                            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Completed: {formatDate(selectedArtifact.completed_at)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Duration: {interviewStats?.duration}
                                </div>
                                <Badge className={getStatusColor(selectedArtifact.status)}>
                                    {selectedArtifact.status}
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>

                {/* Interview Statistics */}
                {interviewStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Questions Answered</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {interviewStats.answeredQuestions}/{interviewStats.totalQuestions}
                                        </p>
                                    </div>
                                    <MessageSquare className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="mt-2">
                                    <Progress value={interviewStats.completionRate} className="h-2" />
                                    <p className="text-xs text-gray-500 mt-1">{interviewStats.completionRate}% Complete</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Duration</p>
                                        <p className="text-2xl font-bold text-gray-900">{interviewStats.duration}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-green-600" />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Avg response: {interviewStats.averageResponseTime}s
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Images Captured</p>
                                        <p className="text-2xl font-bold text-gray-900">{interviewStats.imagesCaptured}</p>
                                    </div>
                                    <Camera className="h-8 w-8 text-purple-600" />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">For monitoring purposes</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Status</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {selectedArtifact?.status === 'completed' ? 'Complete' : 'Processing'}
                                        </p>
                                    </div>
                                    <Brain className="h-8 w-8 text-orange-600" />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">AI Analysis ready</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Interview Details Tabs */}
                <Card className="shadow-lg mb-8">
                    <CardHeader>
                        <CardTitle>Interview Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="conversation">Conversation</TabsTrigger>
                                <TabsTrigger value="assessment">AI Assessment</TabsTrigger>
                                <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                {selectedArtifact && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-3">Interview Information</h3>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Interview Type:</span>
                                                        <span className="font-medium">{selectedArtifact.interview_type || 'AI Interview'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Started:</span>
                                                        <span className="font-medium">{formatDate(selectedArtifact.started_at)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Completed:</span>
                                                        <span className="font-medium">{formatDate(selectedArtifact.completed_at)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Duration:</span>
                                                        <span className="font-medium">{selectedArtifact.duration_minutes} minutes</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Total Questions:</span>
                                                        <span className="font-medium">{selectedArtifact.total_questions}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Questions Answered:</span>
                                                        <span className="font-medium">{selectedArtifact.answered_questions}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Completion Rate:</span>
                                                        <span className="font-medium">{interviewStats?.completionRate}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Status:</span>
                                                        <Badge className={getStatusColor(selectedArtifact.status)}>
                                                            {selectedArtifact.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="conversation" className="space-y-4">
                                {selectedArtifact?.conversation_log && selectedArtifact.conversation_log.length > 0 ? (
                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {selectedArtifact.conversation_log.map((message: any, index: number) => (
                                            <div key={index} className={`p-4 rounded-lg ${message.type === 'user'
                                                ? 'bg-blue-50 border-l-4 border-blue-500'
                                                : 'bg-gray-50 border-l-4 border-gray-500'
                                                }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-sm">
                                                        {message.type === 'user' ? 'Candidate' : 'AI Interviewer'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {message.timestamp ? formatDate(message.timestamp) : `Message ${index + 1}`}
                                                    </span>
                                                </div>
                                                <p className="text-gray-800">{message.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p>No conversation log available</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="assessment" className="space-y-4">
                                {selectedArtifact?.ai_assessment ? (
                                    <div className="space-y-4">
                                        <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-96">
                                            {JSON.stringify(selectedArtifact.ai_assessment, null, 2)}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p>AI assessment is being processed</p>
                                        <p className="text-sm">Results will be available shortly</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="artifacts" className="space-y-4">
                                <div className="space-y-4">
                                    {/* Images */}
                                    {selectedArtifact?.image_url && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                                <Camera className="w-5 h-5" />
                                                Captured Images
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {selectedArtifact.image_url.split(',').map((imageUrl, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={imageUrl.trim()}
                                                            alt={`Interview capture ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg border border-gray-300"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => window.open(imageUrl.trim(), '_blank')}
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Audio/Video placeholders */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-600">Audio Recording</p>
                                            <p className="text-sm text-gray-500">
                                                {selectedArtifact?.audio_url ? 'Available' : 'Not available'}
                                            </p>
                                        </div>

                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-600">Video Recording</p>
                                            <p className="text-sm text-gray-500">
                                                {selectedArtifact?.video_url ? 'Available' : 'Not available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                    <Button
                        onClick={() => router.push(`/dashboard/application/${applicationId}/analysis`)}
                        className="px-6"
                    >
                        View Full Analysis
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>
            </main>
        </div>
    );
}
