'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { AppNavigation } from '@/components/app-navigation';
import { Card, CardContent, } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import {
    Briefcase,
    Users,
    FileText,
    BarChart3,
    ArrowLeft,
    Loader2,
    Brain,
    MessageSquare,
    Star,
    Camera,
    Settings,
    User,
    Download,
    Eye,
    Mail,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Award,
    Target,
    Shield
} from 'lucide-react';

// Import chart components
import {
    UniversalScoresChart,
    IndustryCompetencyChart,
    ConversationEngagementChart
} from '@/components/interview-charts';

import { ErrorBoundary } from '@/components/error-boundary';

// Tab Components
import {
    ResumeBreakdownTab,
    InterviewChatTab,
    ScoreAnalysisTab,
    InterviewImagesTab,
    RecruiterActionsTab
} from '@/components/tabs';

const navigationItems = [
    {
        label: 'Dashboard',
        href: '/recruiters/dashboard',
        icon: <BarChart3 className="h-4 w-4" />
    },
    {
        label: 'My Jobs',
        href: '/recruiters/jobs',
        icon: <Briefcase className="h-4 w-4" />
    },
    {
        label: 'Candidates',
        href: '/recruiters/dashboard/candidates',
        icon: <Users className="h-4 w-4" />
    },
    {
        label: 'Applications',
        href: '/recruiters/dashboard/applications',
        icon: <FileText className="h-4 w-4" />
    },
];

// Enhanced interfaces matching the database schema
interface InterviewArtifact {
    id: string;
    interview_id: string;
    timestamp: string;
    status: string;
    detailed_score: any;
    overall_score: number;
    overall_feedback: string;
    conversation: any[];
    image_url: string;
    // Computed/mapped fields for component compatibility
    ai_assessment?: any;
    conversation_log?: any[];
    created_at?: string;
    updated_at?: string;
    interview_type?: string;
    started_at?: string;
    completed_at?: string;
    duration_minutes?: number;
    total_questions?: number;
    answered_questions?: number;
    performance_metrics?: any;
}

interface ApplicationDetails {
    id: string;
    candidate_name?: string;
    candidate_email?: string;
    job_title?: string;
    status: string;
    created_at: string;
    resume_data?: any;
    job_data?: any;
}

export default function InterviewAnalysisPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const applicationId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [interviewArtifacts, setInterviewArtifacts] = useState<InterviewArtifact[]>([]);
    const [selectedArtifact, setSelectedArtifact] = useState<InterviewArtifact | null>(null);
    const [applicationDetails, setApplicationDetails] = useState<ApplicationDetails | null>(null);
    const [activeTab, setActiveTab] = useState('resume');

    useEffect(() => {
        if (applicationId) {
            fetchInterviewData();
        }
    }, [applicationId]);

    const fetchInterviewData = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('🔍 Fetching interview data for application:', applicationId);

            // Step 1: Always fetch application details first (essential data)
            let applicationData = null;
            try {
                const { data: appData, error: appError } = await supabase
                    .from('applications')
                    .select(`
                        id,
                        status,
                        created_at,
                        candidate_id,
                        job_id,
                        resume_url,
                        users!applications_candidate_id_fkey (
                            name,
                            email
                        ),
                        jobs (
                            title,
                            skills,
                            salary,
                            company_name,
                            location
                        ),
                        user_resume!applications_resume_url_fkey (
                            id,
                            file_path,
                            score,
                            scoring_details,
                            created_at
                        )
                    `)
                    .eq('id', applicationId)
                    .single();

                if (!appError && appData) {
                    applicationData = {
                        id: appData.id,
                        candidate_name: (appData.users as any)?.name,
                        candidate_email: (appData.users as any)?.email,
                        job_title: (appData.jobs as any)?.title,
                        status: appData.status,
                        created_at: appData.created_at,
                        // Add resume and job data for components
                        resume_data: appData.user_resume,
                        job_data: appData.jobs,
                    };
                    setApplicationDetails(applicationData);
                    console.log('✅ Application details loaded successfully');
                } else {
                    console.error('❌ Error fetching application details:', appError);
                    throw new Error(`Failed to fetch application details: ${appError?.message}`);
                }
            } catch (appErr) {
                console.error('💥 Critical error: Cannot fetch application details:', appErr);
                throw appErr; // This is critical - we need application details
            }

            // Step 2: Try to find interviews for this application
            const { data: interviews, error: interviewsError } = await supabase
                .from('interviews')
                .select('id')
                .eq('application_id', applicationId);

            if (interviewsError) {
                console.error('❌ Error fetching interviews:', interviewsError);
                // Don't throw - we can still show resume data
                setError('Could not fetch interview data, but showing available candidate information.');
                return;
            }

            if (!interviews || interviews.length === 0) {
                console.log('📭 No interviews found - candidate has not performed interview yet');
                setError('Candidate has not performed the interview yet.');
                setInterviewArtifacts([]);
                setSelectedArtifact(null);
                return; // Still show the page with resume data
            }

            console.log(`✅ Found ${interviews.length} interviews`);

            // Step 3: Try to fetch interview artifacts
            const interviewIds = interviews.map(interview => interview.id);
            const { data: artifacts, error: artifactsError } = await supabase
                .from('interview_artifacts')
                .select('*')
                .in('interview_id', interviewIds)
                .order('timestamp', { ascending: false });

            if (artifactsError) {
                console.error('❌ Error fetching interview artifacts:', artifactsError);
                setError('Interview was started but analysis data is incomplete. Showing available candidate information.');
                setInterviewArtifacts([]);
                setSelectedArtifact(null);
                return; // Still show the page with resume data
            }

            if (!artifacts || artifacts.length === 0) {
                console.log('📭 No interview artifacts found - interview may be in progress or incomplete');
                setError('Interview was started but not completed yet. Showing available candidate information.');
                setInterviewArtifacts([]);
                setSelectedArtifact(null);
                return; // Still show the page with resume data
            }

            console.log(`✅ Found ${artifacts.length} interview artifacts`);

            // Step 4: Process artifacts to ensure data compatibility
            const processedArtifacts = artifacts.map(artifact => {
                // Ensure we have the expected structure
                return {
                    ...artifact,
                    // Map database fields to expected component fields
                    ai_assessment: artifact.detailed_score || {},
                    conversation_log: artifact.conversation || [],
                    created_at: artifact.timestamp,
                    updated_at: artifact.timestamp,
                    // Add missing fields with defaults
                    interview_type: 'ai_interview',
                    started_at: artifact.timestamp,
                    completed_at: artifact.timestamp,
                    duration_minutes: 30, // Default value
                    total_questions: Array.isArray(artifact.conversation) ?
                        artifact.conversation.filter((msg: any) => msg.type === 'question' || msg.sender === 'ai').length : 0,
                    answered_questions: Array.isArray(artifact.conversation) ?
                        artifact.conversation.filter((msg: any) => msg.type === 'answer' || msg.sender === 'human').length : 0,
                    performance_metrics: {}
                };
            });

            setInterviewArtifacts(processedArtifacts);
            setSelectedArtifact(processedArtifacts[0]); // Select most recent
            console.log('✅ Interview analysis data loaded successfully');

        } catch (error) {
            console.error('💥 Critical error fetching data:', error);
            setError(error instanceof Error ? error.message : 'Failed to load candidate information');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getOverallScore = (artifact: InterviewArtifact) => {
        const assessment = artifact.ai_assessment || artifact.detailed_score;
        return assessment?.overall_score || 0;
    };

    const getRecommendationBadge = (artifact: InterviewArtifact) => {
        const assessment = artifact.ai_assessment || artifact.detailed_score;
        const recommendation = assessment?.final_recommendation || 'no_data';

        const badgeConfig = {
            'hire': { label: 'Hire', variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' },
            'strong_hire': { label: 'Strong Hire', variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' },
            'no_hire': { label: 'No Hire', variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' },
            'further_assessment': { label: 'Further Assessment', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            'no_data': { label: 'Assessment Pending', variant: 'outline' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' },
        };

        const config = badgeConfig[recommendation as keyof typeof badgeConfig] || badgeConfig.no_data;

        return (
            <Badge variant={config.variant} className={config.className}>
                {config.label}
            </Badge>
        );
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                    <AppNavigation items={navigationItems} title="Interview Analysis" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-gray-600">Loading candidate analysis...</span>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    // Only show error page if we couldn't load essential application data
    if (error && !applicationDetails) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                    <AppNavigation items={navigationItems} title="Candidate Analysis" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center py-12">
                            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Application Data</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <div className="flex gap-4 justify-center">
                                <Button onClick={() => router.back()} variant="outline">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Go Back
                                </Button>
                                <Button onClick={fetchInterviewData}>
                                    Retry
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    // Continue showing the page even if interview data is missing - show available data

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <AppNavigation items={navigationItems} title="Interview Analysis" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <Button
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Application
                            </Button>
                        </div>

                        {/* Enhanced Header Card */}
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-100 rounded-full">
                                            <Brain className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                                Candidate Analysis
                                            </h1>
                                            <p className="text-lg text-gray-600 mb-2">
                                                Candidate: <span className="font-semibold text-gray-800">
                                                    {applicationDetails?.candidate_name || 'Unknown Candidate'}
                                                </span>
                                            </p>
                                            <p className="text-gray-600 mb-4">
                                                Position: <span className="font-semibold text-gray-800">
                                                    {applicationDetails?.job_title || 'Unknown Position'}
                                                </span>
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    {applicationDetails?.candidate_email || 'Email not available'}
                                                </div>
                                                {selectedArtifact ? (
                                                    <>
                                                        <div className="flex items-center gap-1">
                                                            <MessageSquare className="h-4 w-4" />
                                                            {selectedArtifact.answered_questions || 0} / {selectedArtifact.total_questions || 0} Questions
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle className="h-4 w-4" />
                                                            {formatDate(selectedArtifact.completed_at)}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-amber-600">
                                                        <AlertCircle className="h-4 w-4" />
                                                        Interview not completed
                                                    </div>
                                                )}
                                            </div>

                                            {/* Data Availability Indicators */}
                                            <div className="flex items-center gap-2 mt-4">
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-2 h-2 rounded-full ${applicationDetails?.resume_data ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                    <span className="text-xs text-gray-600">Resume</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-2 h-2 rounded-full ${selectedArtifact ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                    <span className="text-xs text-gray-600">Interview</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-2 h-2 rounded-full ${selectedArtifact?.detailed_score ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                    <span className="text-xs text-gray-600">Scoring</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-2 h-2 rounded-full ${selectedArtifact?.image_url ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                    <span className="text-xs text-gray-600">Images</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {selectedArtifact ? (
                                            <>
                                                <Badge className="text-lg px-4 py-2 bg-indigo-100 text-indigo-800">
                                                    <Star className="h-4 w-4 mr-1" />
                                                    {getOverallScore(selectedArtifact)}% Overall
                                                </Badge>
                                                {getRecommendationBadge(selectedArtifact)}
                                            </>
                                        ) : (
                                            <Badge className="text-lg px-4 py-2 bg-amber-100 text-amber-800">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                No Interview Data
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Interview Status Alert */}
                                {error && (
                                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="text-amber-800 font-medium">Interview Status</h3>
                                                <p className="text-amber-700 text-sm mt-1">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Tabbed Interface */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="resume" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Resume
                            </TabsTrigger>
                            <TabsTrigger value="chat" className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Interview Chat
                            </TabsTrigger>
                            <TabsTrigger value="score" className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Score Analysis
                            </TabsTrigger>
                            <TabsTrigger value="image" className="flex items-center gap-2">
                                <Camera className="h-4 w-4" />
                                Images
                            </TabsTrigger>
                            <TabsTrigger value="action" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Actions
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="resume">
                            <ErrorBoundary
                                fallbackMessage="Unable to load resume analysis. The resume data may be corrupted or unavailable."
                                onRetry={fetchInterviewData}
                            >
                                <ResumeBreakdownTab
                                    artifact={selectedArtifact}
                                    applicationDetails={applicationDetails}
                                />
                            </ErrorBoundary>
                        </TabsContent>

                        <TabsContent value="chat">
                            {selectedArtifact ? (
                                <ErrorBoundary
                                    fallbackMessage="Unable to load interview chat. The conversation data may be corrupted."
                                    onRetry={fetchInterviewData}
                                >
                                    <InterviewChatTab
                                        artifact={selectedArtifact}
                                        applicationDetails={applicationDetails}
                                    />
                                </ErrorBoundary>
                            ) : (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center py-12">
                                            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                No Interview Chat Available
                                            </h3>
                                            <p className="text-gray-600 mb-4">
                                                The candidate has not completed the interview yet.
                                                Interview chat will be available once the candidate finishes the interview process.
                                            </p>
                                            <Badge variant="secondary" className="text-sm">
                                                Interview Status: Pending
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="score">
                            {selectedArtifact ? (
                                <ErrorBoundary
                                    fallbackMessage="Unable to load score analysis. The scoring data may be incomplete."
                                    onRetry={fetchInterviewData}
                                >
                                    <ScoreAnalysisTab
                                        artifact={selectedArtifact}
                                        applicationDetails={applicationDetails}
                                    />
                                </ErrorBoundary>
                            ) : (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center py-12">
                                            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                No Interview Scores Available
                                            </h3>
                                            <p className="text-gray-600 mb-4">
                                                Interview scoring will be available once the candidate completes the interview.
                                                You can still view the resume analysis in the Resume tab.
                                            </p>
                                            <Badge variant="secondary" className="text-sm">
                                                Interview Status: Pending
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="image">
                            {selectedArtifact ? (
                                <ErrorBoundary
                                    fallbackMessage="Unable to load interview images. The image data may be corrupted or unavailable."
                                    onRetry={fetchInterviewData}
                                >
                                    <InterviewImagesTab
                                        artifact={selectedArtifact}
                                        applicationDetails={applicationDetails}
                                    />
                                </ErrorBoundary>
                            ) : (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center py-12">
                                            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                No Interview Images Available
                                            </h3>
                                            <p className="text-gray-600 mb-4">
                                                Interview images and captures will appear here once the candidate
                                                completes their video interview session.
                                            </p>
                                            <Badge variant="secondary" className="text-sm">
                                                Interview Status: Pending
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="action">
                            <ErrorBoundary
                                fallbackMessage="Unable to load recruiter actions. Some functionality may be limited."
                                onRetry={fetchInterviewData}
                            >
                                <RecruiterActionsTab
                                    artifact={selectedArtifact}
                                    applicationDetails={applicationDetails}
                                    applicationId={applicationId}
                                />
                            </ErrorBoundary>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </ProtectedRoute>
    );
}
