"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Download,
    Share,
    RefreshCw,
    Loader2,
    AlertCircle,
    Clock,
    MessageSquare,
    Calendar,
    User,
    Brain,
    CheckCircle,
    Award,
    TrendingUp,
    Star,
    Users,
    Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from '@/lib/supabaseClient';
import {
    UniversalScoresChart,
    IndustryCompetencyChart,
    ConversationEngagementChart
} from '@/components/interview-charts';
import { EngagementLineChart } from '@/components/engagement-line-chart';

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
    ai_assessment: AssessmentData;
    conversation_log: any[];
    performance_metrics: any;
    created_at: string;
    updated_at: string;
}

interface AssessmentData {
    feedback?: {
        industry_specific_feedback?: {
            domain_strengths?: string[];
            domain_improvement_areas?: string[];
            technical_feedback_for_candidate?: string;
            technical_feedback_for_recruiters?: string;
        };
        overall_feedback_for_recruiters?: string;
        universal_feedback_for_candidate?: string;
        universal_feedback_for_recruiters?: string;
        areas_of_improvement_for_candidate?: string[];
    };
    industry_type?: string;
    overall_score?: number;
    assessment_type?: string;
    technical_score?: number;
    confidence_level?: string;
    universal_scores?: {
        teamwork_score?: number;
        adaptability_score?: number;
        cultural_fit_score?: number;
        communication_score?: number;
        problem_solving_score?: number;
        leadership_potential_score?: number;
    };
    interview_version?: string;
    assessment_timestamp?: string;
    final_recommendation?: string;
    interview_quality_score?: number;
    industry_competency_scores?: Record<string, number>;
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

            // Step 1: Try to get interview artifact from applications table first
            const { data: applicationData, error: appError } = await supabase
                .from('applications')
                .select('interview_artifact_id')
                .eq('id', applicationId)
                .single();

            let interviewArtifactId = null;

            if (appError) {
                console.warn('⚠️ Could not fetch from applications table:', appError.message);
                console.log('� Will try to find interview artifacts directly...');
            } else if (applicationData?.interview_artifact_id) {
                const rawInterviewArtifactId = applicationData.interview_artifact_id;
                console.log('✅ Found interview artifact ID from applications:', rawInterviewArtifactId);

                // Handle comma-separated interview artifact IDs - use the last one (most recent)
                const interviewArtifactIds = rawInterviewArtifactId.split(',').map((id: string) => id.trim());
                interviewArtifactId = interviewArtifactIds[interviewArtifactIds.length - 1];
                console.log('🎯 Using latest artifact ID:', interviewArtifactId);
            }

            // Step 2: If we don't have an artifact ID, try to find any interview artifacts that might be related
            if (!interviewArtifactId) {
                console.log('🔍 No artifact ID from applications table, searching all interview artifacts...');

                // Get all interview artifacts and let the user pick one if multiple exist
                const { data: allArtifacts, error: allError } = await supabase
                    .from('interview_artifacts')
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(10);

                if (allError) {
                    console.error('❌ Error fetching all interview artifacts:', allError);
                    throw new Error(`Database connection failed: ${allError.message}`);
                }

                if (!allArtifacts || allArtifacts.length === 0) {
                    console.log('📭 No interview artifacts found in database');
                    setInterviewArtifacts([]);
                    setError('No interview data found in the system. Please ensure an interview has been completed.');
                    return;
                }

                console.log(`📊 Found ${allArtifacts.length} total interview artifacts in database`);

                // Find the best artifact to display - prioritize high-scoring completed interviews
                let bestArtifact = allArtifacts[0]; // fallback to most recent
                let bestScore = 0;

                for (const artifact of allArtifacts) {
                    if (artifact.status === 'completed' && artifact.detailed_score?.universal_scores) {
                        const scores = artifact.detailed_score.universal_scores;
                        const scoreValues = [
                            scores.teamwork_score || 0,
                            scores.adaptability_score || 0,
                            scores.cultural_fit_score || 0,
                            scores.communication_score || 0,
                            scores.problem_solving_score || 0,
                            scores.leadership_potential_score || 0
                        ];
                        const averageScore = scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;

                        if (averageScore > bestScore) {
                            bestScore = averageScore;
                            bestArtifact = artifact;
                        }
                    }
                }

                interviewArtifactId = bestArtifact.id;
                console.log(`🎯 Using best artifact (score: ${bestScore.toFixed(1)}):`, interviewArtifactId, 'from', bestArtifact.timestamp);
            }

            // Step 3: Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(interviewArtifactId)) {
                console.error('❌ Invalid UUID format:', interviewArtifactId);
                setError(`Invalid interview artifact ID format: ${interviewArtifactId}. Please contact support.`);
                return;
            }

            // Step 4: Fetch the specific interview artifact using the ID
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
            console.log('📊 Detailed score exists:', !!artifact?.detailed_score);
            console.log('📊 Conversation exists:', !!artifact?.conversation);

            // Since we're fetching a single artifact, wrap it in an array for consistency
            const artifactsArray = artifact ? [artifact] : [];
            setInterviewArtifacts(artifactsArray);

            // Set the artifact as selected
            if (artifact) {
                // The actual data structure uses 'detailed_score' not 'ai_assessment'
                // and 'conversation' not 'conversation_log'
                console.log('📊 Processing artifact with detailed_score:', !!artifact.detailed_score);
                console.log('📊 Processing artifact with conversation:', !!artifact.conversation);

                // Map the real database structure to what the UI expects
                if (artifact.detailed_score) {
                    // Map detailed_score to ai_assessment for UI compatibility
                    artifact.ai_assessment = {
                        // Keep the original universal_scores structure for the chart
                        universal_scores: artifact.detailed_score.universal_scores || {
                            teamwork_score: 0,
                            adaptability_score: 0,
                            cultural_fit_score: 0,
                            communication_score: 0,
                            problem_solving_score: 0,
                            leadership_potential_score: 0
                        },

                        // Also add individual scores for backward compatibility
                        teamwork_score: artifact.detailed_score.universal_scores?.teamwork_score || 0,
                        adaptability_score: artifact.detailed_score.universal_scores?.adaptability_score || 0,
                        cultural_fit_score: artifact.detailed_score.universal_scores?.cultural_fit_score || 0,
                        communication_score: artifact.detailed_score.universal_scores?.communication_score || 0,
                        problem_solving_score: artifact.detailed_score.universal_scores?.problem_solving_score || 0,
                        leadership_potential_score: artifact.detailed_score.universal_scores?.leadership_potential_score || 0,

                        // Industry competency scores
                        industry_competency: artifact.detailed_score.industry_competency_scores || {},
                        industry_competency_scores: artifact.detailed_score.industry_competency_scores || {},

                        // Other scores
                        overall_score: artifact.detailed_score.overall_score || artifact.overall_score || 0,
                        technical_score: artifact.detailed_score.technical_score || 0,

                        // Recommendation
                        overall_recommendation: artifact.detailed_score.final_recommendation || 'no_data',

                        // Industry type
                        industry_type: artifact.detailed_score.industry_type || 'Unknown',

                        // Enhanced feedback data from detailed_score.feedback
                        feedback: artifact.detailed_score.feedback || {},
                        confidence_level: artifact.detailed_score.confidence_level || 'medium',
                        interview_quality_score: artifact.detailed_score.interview_quality_score || 0,
                        assessment_timestamp: artifact.detailed_score.assessment_timestamp || new Date().toISOString()
                    };
                    console.log('✅ Mapped detailed_score to ai_assessment');
                    console.log('📊 Universal scores:', artifact.ai_assessment.universal_scores);
                    console.log('📊 Industry competency scores:', artifact.ai_assessment.industry_competency_scores);
                    console.log('📊 Overall score:', artifact.ai_assessment.overall_score);
                } else {
                    console.log('⚠️ No detailed_score found in artifact');
                    artifact.ai_assessment = null;
                }

                // Map conversation to conversation_log for UI compatibility
                if (artifact.conversation && Array.isArray(artifact.conversation)) {
                    artifact.conversation_log = artifact.conversation;
                    console.log('✅ Mapped conversation to conversation_log, length:', artifact.conversation.length);

                    // Map question counts for the UI
                    artifact.total_questions = artifact.conversation.length;
                    artifact.answered_questions = artifact.conversation.length; // All questions in conversation were answered
                } else {
                    console.log('⚠️ No conversation array found');
                    artifact.conversation_log = [];
                    artifact.total_questions = 0;
                    artifact.answered_questions = 0;
                }

                console.log('📊 Final artifact with mapped assessment:', !!artifact.ai_assessment);
                setSelectedArtifact(artifact);

                // Calculate interview stats from real data
                const conversationLength = artifact.conversation_log?.length || 0;
                const stats: InterviewStats = {
                    // Use conversation length as total questions since each entry is a Q&A
                    totalQuestions: conversationLength,
                    answeredQuestions: conversationLength, // All questions in conversation were answered
                    duration: formatDuration(artifact.duration_minutes || calculateDurationFromConversation(artifact.conversation_log)),
                    completionRate: conversationLength > 0 ? 100 : 0, // If we have conversation, it's complete
                    averageResponseTime: calculateAverageResponseTime(artifact.conversation_log || []),
                    imagesCaptured: 0 // Not needed for candidate view
                };

                console.log('📈 Calculated stats:', stats);
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

        // Calculate average response time based on engagement scores if available
        const engagementScores = conversationLog
            .map(entry => entry.engagement_score)
            .filter(score => score !== undefined && score !== null);

        if (engagementScores.length > 0) {
            // Convert engagement score to approximate response time (higher engagement = faster response)
            const avgEngagement = engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length;
            // Map engagement (0-10) to response time (10-2 seconds, inverted)
            return Math.max(2, Math.min(10, 12 - avgEngagement));
        }

        return 5; // Default response time in seconds
    };

    const calculateDurationFromConversation = (conversationLog: any[]): number => {
        if (!conversationLog || conversationLog.length === 0) return 0;

        // Try to calculate from timestamps if available
        if (conversationLog.length >= 2) {
            const firstMessage = conversationLog[0];
            const lastMessage = conversationLog[conversationLog.length - 1];

            if (firstMessage.timestamp && lastMessage.timestamp) {
                try {
                    const start = new Date(firstMessage.timestamp);
                    const end = new Date(lastMessage.timestamp);
                    const durationMs = end.getTime() - start.getTime();
                    const durationMinutes = Math.max(1, Math.round(durationMs / (1000 * 60)));
                    return durationMinutes;
                } catch (e) {
                    console.log('⚠️ Could not parse timestamps for duration calculation');
                }
            }
        }

        // Estimate based on number of questions (assume 2-3 minutes per question)
        return Math.max(1, conversationLog.length * 2.5);
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

    const getRecommendationColor = (recommendation: string) => {
        switch (recommendation?.toLowerCase()) {
            case 'strong_hire':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'hire':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'maybe':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'no_hire':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getRecommendationText = (recommendation: string) => {
        switch (recommendation?.toLowerCase()) {
            case 'strong_hire':
                return 'Strong Hire';
            case 'hire':
                return 'Hire';
            case 'maybe':
                return 'Maybe';
            case 'no_hire':
                return 'Not Recommended';
            default:
                return recommendation || 'Pending';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
                                <h1 className="text-lg font-semibold text-gray-900">Interview Results</h1>
                                <p className="text-sm text-gray-600">Application ID: {applicationId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setLoading(true);
                                    fetchInterviewArtifacts();
                                }}
                                disabled={loading}
                                className="border-green-200 text-green-700 hover:bg-green-50"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                            <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Share className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Compact Header with Key Metrics */}
                {selectedArtifact && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-5">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Interview Results</h2>
                                <p className="text-sm text-gray-600">
                                    Completed: {formatDate(selectedArtifact.completed_at)} • Duration: {selectedArtifact.duration_minutes || 0}m
                                </p>
                            </div>
                            {selectedArtifact.ai_assessment?.final_recommendation && (
                                <div className="text-right">
                                    <p className="text-xs font-medium text-gray-600 mb-1">Final Recommendation</p>
                                    <Badge className={`${getRecommendationColor(selectedArtifact.ai_assessment.final_recommendation)} text-sm px-3 py-1`}>
                                        {getRecommendationText(selectedArtifact.ai_assessment.final_recommendation)}
                                    </Badge>
                                </div>
                            )}
                        </div>

                        {/* Compact Performance Metrics Grid */}
                        <div className="grid grid-cols-5 gap-3">
                            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                                <CardContent className="p-3 text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <Award className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <p className="text-xs font-medium text-blue-800">Overall Score</p>
                                    <p className="text-lg font-bold text-blue-900 mb-1">
                                        {selectedArtifact.ai_assessment?.overall_score || 0}/100
                                    </p>
                                    <Progress value={selectedArtifact.ai_assessment?.overall_score || 0} className="h-1" />
                                </CardContent>
                            </Card>

                            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                                <CardContent className="p-3 text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <Brain className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <p className="text-xs font-medium text-purple-800">Technical Score</p>
                                    <p className="text-lg font-bold text-purple-900 mb-1">
                                        {selectedArtifact.ai_assessment?.technical_score || 0}/100
                                    </p>
                                    <Progress value={selectedArtifact.ai_assessment?.technical_score || 0} className="h-1" />
                                </CardContent>
                            </Card>

                            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                                <CardContent className="p-3 text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <MessageSquare className="h-4 w-4 text-green-600" />
                                    </div>
                                    <p className="text-xs font-medium text-green-800">Questions</p>
                                    <p className="text-lg font-bold text-green-900 mb-1">
                                        {selectedArtifact.answered_questions || 0}/{selectedArtifact.total_questions || 0}
                                    </p>
                                    <Progress value={selectedArtifact.total_questions ? (selectedArtifact.answered_questions / selectedArtifact.total_questions) * 100 : 0} className="h-1" />
                                </CardContent>
                            </Card>

                            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                                <CardContent className="p-3 text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <Clock className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <p className="text-xs font-medium text-orange-800">Duration</p>
                                    <p className="text-lg font-bold text-orange-900 mb-1">
                                        {selectedArtifact.duration_minutes || 0}m
                                    </p>
                                    <p className="text-xs text-orange-700">Quality: {selectedArtifact.ai_assessment?.interview_quality_score || 0}/10</p>
                                </CardContent>
                            </Card>

                            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
                                <CardContent className="p-3 text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <TrendingUp className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <p className="text-xs font-medium text-indigo-800">Confidence</p>
                                    <p className="text-lg font-bold text-indigo-900 mb-1 capitalize">
                                        {selectedArtifact.ai_assessment?.confidence_level || 'N/A'}
                                    </p>
                                    <p className="text-xs text-indigo-700">Assessment level</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Main Content Tabs */}
                <Card className="shadow-sm border-slate-200 bg-white">
                    <CardContent className="p-0">
                        <Tabs defaultValue="overview" className="w-full">
                            <div className="border-b border-slate-200">
                                <TabsList className="grid w-full grid-cols-4 bg-transparent h-12 p-0">
                                    <TabsTrigger
                                        value="overview"
                                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full"
                                    >
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="conversation"
                                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full"
                                    >
                                        Conversation
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="assessment"
                                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full"
                                    >
                                        AI Assessment
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="feedback"
                                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full"
                                    >
                                        Detailed Feedback
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="overview" className="p-6 space-y-6">
                                {selectedArtifact && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-base font-semibold mb-3 text-gray-800">Interview Information</h3>
                                            <div className="space-y-2 text-sm bg-gray-50 rounded-lg p-4">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Interview Type:</span>
                                                    <span className="font-medium">{selectedArtifact.interview_type || 'AI Interview'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Status:</span>
                                                    <span className="font-medium capitalize">{selectedArtifact.status || 'Completed'}</span>
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
                                                    <span className="font-medium">{selectedArtifact.duration_minutes || 0} minutes</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Industry:</span>
                                                    <span className="font-medium">{selectedArtifact.ai_assessment?.industry_type || 'General'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-base font-semibold mb-3 text-gray-800">Performance Summary</h3>
                                            <div className="space-y-2 text-sm bg-blue-50 rounded-lg p-4">
                                                <div className="flex justify-between">
                                                    <span className="text-blue-700">Overall Score:</span>
                                                    <span className="font-bold text-blue-900">{selectedArtifact.ai_assessment?.overall_score || 0}/100</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-blue-700">Technical Score:</span>
                                                    <span className="font-bold text-blue-900">{selectedArtifact.ai_assessment?.technical_score || 0}/100</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-blue-700">Questions Answered:</span>
                                                    <span className="font-bold text-blue-900">{selectedArtifact.answered_questions || 0}/{selectedArtifact.total_questions || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-blue-700">Completion Rate:</span>
                                                    <span className="font-bold text-blue-900">{selectedArtifact.total_questions ? Math.round((selectedArtifact.answered_questions / selectedArtifact.total_questions) * 100) : 0}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-blue-700">Quality Score:</span>
                                                    <span className="font-bold text-blue-900">{selectedArtifact.ai_assessment?.interview_quality_score || 0}/10</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-blue-700">Recommendation:</span>
                                                    <Badge className={getRecommendationColor(selectedArtifact.ai_assessment?.final_recommendation || '')}>
                                                        {getRecommendationText(selectedArtifact.ai_assessment?.final_recommendation || '')}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="conversation" className="p-6">
                                {selectedArtifact?.conversation_log && selectedArtifact.conversation_log.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-base font-semibold text-gray-800">Interview Conversation</h3>
                                            <Badge variant="outline" className="border-blue-200 text-blue-700">
                                                {selectedArtifact.conversation_log.length} messages
                                            </Badge>
                                        </div>
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {selectedArtifact.conversation_log.map((message: any, index: number) => {
                                                const isUser = message.type === 'user' || message.role === 'user' || message.sender === 'user';
                                                const content = message.content || message.message || message.text || 'No content available';

                                                return (
                                                    <div key={index} className={`p-3 rounded-lg text-sm ${isUser
                                                        ? 'bg-blue-50 border border-blue-200 ml-8'
                                                        : 'bg-gray-50 border border-gray-200 mr-8'
                                                        }`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-xs flex items-center gap-2">
                                                                {isUser ? (
                                                                    <>
                                                                        <User className="w-3 h-3 text-blue-600" />
                                                                        <span className="text-blue-700">You</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Brain className="w-3 h-3 text-gray-600" />
                                                                        <span className="text-gray-700">AI Interviewer</span>
                                                                    </>
                                                                )}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {message.timestamp ? formatDate(message.timestamp) : `Message ${index + 1}`}
                                                            </span>
                                                        </div>
                                                        <p className={`leading-relaxed ${isUser ? 'text-blue-800' : 'text-gray-800'}`}>{content}</p>

                                                        {/* Show additional metadata if available */}
                                                        {(message.duration || message.confidence || message.sentiment) && (
                                                            <div className="mt-2 flex gap-4 text-xs text-gray-500">
                                                                {message.duration && (
                                                                    <span>Duration: {message.duration}s</span>
                                                                )}
                                                                {message.confidence && (
                                                                    <span>Confidence: {message.confidence}%</span>
                                                                )}
                                                                {message.sentiment && (
                                                                    <span>Sentiment: {message.sentiment}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">No Conversation Available</h3>
                                        <p className="text-sm">The conversation data is not available for this interview.</p>
                                        <p className="text-xs mt-1">This may happen if the interview was not completed or data was not saved.</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="assessment" className="p-6">
                                {selectedArtifact?.ai_assessment ? (
                                    <div className="space-y-6">
                                        {/* Compact Charts and Feedback Layout - 3 Columns */}
                                        <div className="grid grid-cols-12 gap-4">
                                            {/* Left Column - Universal Skills Chart */}
                                            <div className="col-span-4">
                                                <UniversalScoresChart data={selectedArtifact.ai_assessment?.universal_scores} />
                                            </div>

                                            {/* Middle Column - Feedback Cards */}
                                            <div className="col-span-4 space-y-3">
                                                {/* Universal Feedback */}
                                                {selectedArtifact.ai_assessment?.feedback?.universal_feedback_for_candidate && (
                                                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm h-fit">
                                                        <CardHeader className="pb-2">
                                                            <CardTitle className="text-blue-900 flex items-center gap-2 text-xs">
                                                                <User className="w-3 h-3" />
                                                                Universal Feedback for Candidate
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="pt-0">
                                                            <p className="text-blue-800 leading-relaxed text-xs">
                                                                {selectedArtifact.ai_assessment.feedback.universal_feedback_for_candidate}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {/* Technical Feedback */}
                                                {selectedArtifact.ai_assessment?.feedback?.industry_specific_feedback?.technical_feedback_for_candidate && (
                                                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm h-fit">
                                                        <CardHeader className="pb-2">
                                                            <CardTitle className="text-green-900 flex items-center gap-2 text-xs">
                                                                <Brain className="w-3 h-3" />
                                                                Industry-Based Feedback
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="pt-0">
                                                            <p className="text-green-800 leading-relaxed text-xs">
                                                                {selectedArtifact.ai_assessment.feedback.industry_specific_feedback.technical_feedback_for_candidate}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>

                                            {/* Right Column - Industry Competency Chart */}
                                            <div className="col-span-4">
                                                <IndustryCompetencyChart
                                                    data={selectedArtifact.ai_assessment?.industry_competency_scores}
                                                    industryType={selectedArtifact.ai_assessment?.industry_type || 'General'}
                                                />
                                            </div>
                                        </div>

                                        {/* Bottom Row - Engagement Chart and Engagement Score */}
                                        <div className="grid grid-cols-12 gap-4">
                                            {/* Engagement Chart - Takes up 8 columns */}
                                            <div className="col-span-8">
                                                <EngagementLineChart
                                                    conversationLog={selectedArtifact.conversation_log}
                                                    overallScore={selectedArtifact.ai_assessment?.overall_score}
                                                />
                                            </div>

                                            {/* Engagement Score Card - Takes up 4 columns */}
                                            <div className="col-span-4 space-y-3">
                                                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-sm h-fit">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-purple-900 text-center text-sm">
                                                            Engagement Score
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="text-center pt-0">
                                                        <div className="text-2xl font-bold text-purple-900 mb-1">
                                                            {selectedArtifact.ai_assessment?.overall_score || 0}%
                                                        </div>
                                                        <p className="text-xs text-purple-700 mb-2">
                                                            Overall interview performance
                                                        </p>
                                                        <Progress value={selectedArtifact.ai_assessment?.overall_score || 0} className="h-1.5" />
                                                    </CardContent>
                                                </Card>

                                                {/* Assessment Summary */}
                                                <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 shadow-sm h-fit">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-gray-900 text-center text-sm">
                                                            Assessment Summary
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="pt-0">
                                                        <div className="space-y-2 text-xs">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Technical Score:</span>
                                                                <span className="font-medium">{selectedArtifact.ai_assessment.technical_score || 0}/100</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Confidence Level:</span>
                                                                <Badge variant="outline" className="text-xs capitalize">
                                                                    {selectedArtifact.ai_assessment.confidence_level || 'N/A'}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Quality Score:</span>
                                                                <span className="font-medium">{selectedArtifact.ai_assessment.interview_quality_score || 0}/10</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>

                                        {/* Strengths and Improvements - Only show if data exists */}
                                        {selectedArtifact.ai_assessment.feedback?.industry_specific_feedback?.domain_strengths &&
                                            selectedArtifact.ai_assessment.feedback.industry_specific_feedback.domain_strengths.length > 0 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200 shadow-sm">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-green-900 flex items-center gap-2 text-sm">
                                                                <Star className="w-4 h-4" />
                                                                Your Strengths
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="pt-0">
                                                            <div className="space-y-2">
                                                                {selectedArtifact.ai_assessment.feedback.industry_specific_feedback.domain_strengths.map((strength: string, index: number) => (
                                                                    <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border border-green-100">
                                                                        <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                                                        <p className="text-green-800 text-xs leading-relaxed">{strength}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {((selectedArtifact.ai_assessment.feedback?.areas_of_improvement_for_candidate &&
                                                        selectedArtifact.ai_assessment.feedback.areas_of_improvement_for_candidate.length > 0) ||
                                                        (selectedArtifact.ai_assessment.feedback?.industry_specific_feedback?.domain_improvement_areas &&
                                                            selectedArtifact.ai_assessment.feedback.industry_specific_feedback.domain_improvement_areas.length > 0)) && (
                                                            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm">
                                                                <CardHeader className="pb-3">
                                                                    <CardTitle className="text-yellow-900 flex items-center gap-2 text-sm">
                                                                        <TrendingUp className="w-4 h-4" />
                                                                        Areas for Improvement
                                                                    </CardTitle>
                                                                </CardHeader>
                                                                <CardContent className="pt-0">
                                                                    <div className="space-y-2">
                                                                        {selectedArtifact.ai_assessment.feedback?.areas_of_improvement_for_candidate?.map((area: string, index: number) => (
                                                                            <div key={`general-${index}`} className="flex items-start gap-2 p-2 bg-white rounded border border-yellow-100">
                                                                                <AlertCircle className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                                                <p className="text-yellow-800 text-xs leading-relaxed">{area}</p>
                                                                            </div>
                                                                        ))}
                                                                        {selectedArtifact.ai_assessment.feedback?.industry_specific_feedback?.domain_improvement_areas?.map((area: string, index: number) => (
                                                                            <div key={`domain-${index}`} className="flex items-start gap-2 p-2 bg-white rounded border border-yellow-100">
                                                                                <AlertCircle className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                                                <p className="text-yellow-800 text-xs leading-relaxed">{area}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                </div>
                                            )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">No AI Assessment Available</h3>
                                        <p className="text-gray-500 mb-4">The AI assessment data is not available for this interview.</p>
                                        <p className="text-sm text-gray-400">This may happen if the interview was not completed or assessment processing failed.</p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Detailed Feedback Tab */}
                            <TabsContent value="feedback" className="p-6">
                                {selectedArtifact?.ai_assessment?.feedback ? (
                                    <div className="space-y-6">
                                        <div className="mb-6">
                                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Comprehensive Feedback Report</h2>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>Industry: <span className="font-medium text-gray-800">{selectedArtifact.ai_assessment.industry_type}</span></span>
                                                <span>•</span>
                                                <span>Confidence: <span className="font-medium text-gray-800 capitalize">{selectedArtifact.ai_assessment.confidence_level}</span></span>
                                                <span>•</span>
                                                <span>Quality Score: <span className="font-medium text-gray-800">{selectedArtifact.ai_assessment.interview_quality_score}/10</span></span>
                                            </div>
                                        </div>

                                        {/* Overall Feedback for Recruiters */}
                                        {selectedArtifact.ai_assessment.feedback.overall_feedback_for_recruiters && (
                                            <Card className="border border-blue-200 bg-blue-50">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                                                        <Users className="h-5 w-5" />
                                                        Overall Assessment Summary
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-blue-900 leading-relaxed">
                                                        {selectedArtifact.ai_assessment.feedback.overall_feedback_for_recruiters}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Universal Skills Feedback */}
                                        {selectedArtifact.ai_assessment.feedback.universal_feedback_for_candidate && (
                                            <Card className="border border-green-200 bg-green-50">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                                                        <Brain className="h-5 w-5" />
                                                        Universal Skills Assessment
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-green-900 leading-relaxed">
                                                        {selectedArtifact.ai_assessment.feedback.universal_feedback_for_candidate}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Industry-Specific Feedback */}
                                        {selectedArtifact.ai_assessment.feedback.industry_specific_feedback && (
                                            <Card className="border border-purple-200 bg-purple-50">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
                                                        <Target className="h-5 w-5" />
                                                        {selectedArtifact.ai_assessment.industry_type} Domain Expertise
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {/* Technical Feedback for Candidate */}
                                                    {selectedArtifact.ai_assessment.feedback.industry_specific_feedback.technical_feedback_for_candidate && (
                                                        <div>
                                                            <h4 className="font-semibold text-purple-800 mb-2">Technical Assessment</h4>
                                                            <p className="text-purple-900 leading-relaxed mb-4">
                                                                {selectedArtifact.ai_assessment.feedback.industry_specific_feedback.technical_feedback_for_candidate}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Domain Strengths */}
                                                    {selectedArtifact.ai_assessment.feedback.industry_specific_feedback.domain_strengths && (
                                                        <div>
                                                            <h4 className="font-semibold text-purple-800 mb-2">Key Strengths</h4>
                                                            <ul className="list-disc list-inside space-y-1 text-purple-900">
                                                                {selectedArtifact.ai_assessment.feedback.industry_specific_feedback.domain_strengths.map((strength: string, index: number) => (
                                                                    <li key={index} className="leading-relaxed">{strength}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Areas for Improvement */}
                                                    {selectedArtifact.ai_assessment.feedback.industry_specific_feedback.domain_improvement_areas && selectedArtifact.ai_assessment.feedback.industry_specific_feedback.domain_improvement_areas.length > 0 && (
                                                        <div>
                                                            <h4 className="font-semibold text-purple-800 mb-2">Development Opportunities</h4>
                                                            <ul className="list-disc list-inside space-y-1 text-purple-900">
                                                                {selectedArtifact.ai_assessment.feedback.industry_specific_feedback.domain_improvement_areas.map((area: string, index: number) => (
                                                                    <li key={index} className="leading-relaxed">{area}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Technical Feedback for Recruiters */}
                                                    {selectedArtifact.ai_assessment.feedback.industry_specific_feedback.technical_feedback_for_recruiters && (
                                                        <div className="border-t border-purple-200 pt-4">
                                                            <h4 className="font-semibold text-purple-800 mb-2">Recruiter Insights</h4>
                                                            <p className="text-purple-900 leading-relaxed">
                                                                {selectedArtifact.ai_assessment.feedback.industry_specific_feedback.technical_feedback_for_recruiters}
                                                            </p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Universal Feedback for Recruiters */}
                                        {selectedArtifact.ai_assessment.feedback.universal_feedback_for_recruiters && (
                                            <Card className="border border-orange-200 bg-orange-50">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                                                        <MessageSquare className="h-5 w-5" />
                                                        Communication & Soft Skills
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-orange-900 leading-relaxed">
                                                        {selectedArtifact.ai_assessment.feedback.universal_feedback_for_recruiters}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Areas of Improvement */}
                                        {selectedArtifact.ai_assessment.feedback.areas_of_improvement_for_candidate && selectedArtifact.ai_assessment.feedback.areas_of_improvement_for_candidate.length > 0 && (
                                            <Card className="border border-yellow-200 bg-yellow-50">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
                                                        <TrendingUp className="h-5 w-5" />
                                                        Improvement Recommendations
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <ul className="list-disc list-inside space-y-2 text-yellow-900">
                                                        {selectedArtifact.ai_assessment.feedback.areas_of_improvement_for_candidate.map((area: string, index: number) => (
                                                            <li key={index} className="leading-relaxed">{area}</li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">No Detailed Feedback Available</h3>
                                        <p className="text-gray-500 mb-4">Detailed feedback data is not available for this interview.</p>
                                        <p className="text-sm text-gray-400">This may happen if the interview assessment is still processing.</p>
                                    </div>
                                )}
                            </TabsContent>

                        </Tabs>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4 justify-center mt-4">
                    <Button onClick={() => router.push('/dashboard')} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Print Results
                    </Button>
                </div>
            </main>
        </div>
    );
}
