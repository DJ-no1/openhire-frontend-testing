"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Download,
    Share,
    RefreshCw,
    Loader2,
    AlertCircle,
    TrendingUp,
    Building,
    MapPin,
    Briefcase,
    Calendar,
    FileText,
    User,
    Brain,
    Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DatabaseService, type DatabaseApplication, type DatabaseUserResume } from "@/lib/database";
import { ResumeAnalysisResults } from "@/components/resume-analysis-results";
import { CandidateApplicationsList } from "@/components/candidate-applications-list";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthLoading } from '@/hooks/useAuthLoading';
import { ApplicationSkeleton } from '@/components/ui/page-skeleton';

interface ReviewResponse {
    jd: string;
    resume: string;
    analysis: any;
}

export default function ApplicationAnalysisPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { isLoading: authLoading } = useAuthLoading();
    const [application, setApplication] = useState<(DatabaseApplication & { user_resume: DatabaseUserResume[] }) | null>(null);
    const [analysisData, setAnalysisData] = useState<ReviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [checkingInterview, setCheckingInterview] = useState(false);

    if (authLoading) {
        return <ApplicationSkeleton />;
    }

    useEffect(() => {
        if (id) {
            fetchApplicationData(id as string);
        }
    }, [id]);

    const fetchApplicationData = async (applicationId: string) => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 200)); // Prevent flashing

            const appData = await DatabaseService.getApplicationWithDetails(applicationId);
            if (!appData) {
                throw new Error('Application not found');
            }

            setApplication(appData);

            const resume = appData.user_resume?.[0];
            if (resume?.scoring_details) {
                const jobDescription = extractJobDescription(resume.scoring_details.jd, appData.job?.description);
                const analysisResult: ReviewResponse = {
                    jd: jobDescription,
                    resume: resume.scoring_details.resume || "",
                    analysis: resume.scoring_details.analysis
                };
                setAnalysisData(analysisResult);
            }
        } catch (err) {
            const errorMessage = (err as Error).message;
            let userFriendlyMessage = errorMessage;
            if (errorMessage.includes('relationship')) {
                userFriendlyMessage = 'Database relationship error. Please try refreshing or contact support.';
            } else if (errorMessage.includes('not found')) {
                userFriendlyMessage = 'Application not found. It may have been deleted or you may not have permission to view it.';
            }
            setError(userFriendlyMessage);
            toast.error(`Failed to load application: ${userFriendlyMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const extractJobDescription = (jdFromScoring: any, jdFromJob: any): string => {
        if (typeof jdFromScoring === 'string') return jdFromScoring;
        if (typeof jdFromJob === 'string') return jdFromJob;

        if (typeof jdFromScoring === 'object' && jdFromScoring) {
            const jdObj = jdFromScoring;
            let structuredText = "";
            if (jdObj.intro) structuredText += `INTRODUCTION:\n${jdObj.intro}\n\n`;
            if (jdObj.requirements) {
                structuredText += `REQUIREMENTS:\n${Array.isArray(jdObj.requirements) ? jdObj.requirements.map((req: any) => `• ${req}`).join('\n') : jdObj.requirements}\n\n`;
            }
            if (jdObj.responsibilities) {
                structuredText += `RESPONSIBILITIES:\n${Array.isArray(jdObj.responsibilities) ? jdObj.responsibilities.map((resp: any) => `• ${resp}`).join('\n') : jdObj.responsibilities}\n\n`;
            }
            if (jdObj.benefits) {
                structuredText += `BENEFITS:\n${Array.isArray(jdObj.benefits) ? jdObj.benefits.map((benefit: any) => `• ${benefit}`).join('\n') : jdObj.benefits}\n\n`;
            }
            if (jdObj.experience) structuredText += `EXPERIENCE REQUIRED:\n${jdObj.experience}\n\n`;
            return structuredText || JSON.stringify(jdFromScoring, null, 2);
        }

        return "No job description available";
    };

    const handleRefresh = () => {
        if (id) {
            setApplication(null);
            setAnalysisData(null);
            setError(null);
            fetchApplicationData(id as string);
        }
    };

    const handleStartInterview = async () => {
        if (!application) return;
        setCheckingInterview(true);

        try {
            const { data: appData, error: appError } = await supabase
                .from('applications')
                .select('interview_artifact_id')
                .eq('id', application.id)
                .single();

            if (appError || !appData?.interview_artifact_id) {
                router.push(`/dashboard/application/${application.id}/permission`);
                return;
            }

            const interviewArtifactIds = appData.interview_artifact_id.split(',').map((id: string) => id.trim());
            const interviewArtifactId = interviewArtifactIds[interviewArtifactIds.length - 1];

            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(interviewArtifactId)) {
                toast.error(`Invalid interview data format. Starting new interview...`);
                router.push(`/dashboard/application/${application.id}/permission`);
                return;
            }

            const { data: artifact, error: artifactError } = await supabase
                .from('interview_artifacts')
                .select('id, status')
                .eq('id', interviewArtifactId)
                .single();

            if (artifactError || !artifact) {
                const proceed = window.confirm('Issue with interview data. Start new interview?');
                if (proceed) {
                    router.push(`/dashboard/application/${application.id}/permission`);
                }
                return;
            }

            if (artifact.status === 'completed') {
                toast.info('Interview completed. Redirecting to results...');
                router.push(`/dashboard/application/${application.id}/interview-result`);
                return;
            }

            if (artifact.status === 'in_progress') {
                const resumeInterview = window.confirm('Resume interview? Cancel to view results.');
                router.push(`/dashboard/application/${application.id}/${resumeInterview ? 'interview' : 'interview-result'}`);
                return;
            }

            router.push(`/dashboard/application/${application.id}/permission`);
        } catch (error) {
            toast.error('Error checking interview status. Please try again.');
        } finally {
            setCheckingInterview(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not specified";
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

    const getApplicationStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'interview': return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'accepted': return 'bg-green-100 text-green-800 border-green-300';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                    <div>
                        <h3 className="text-lg font-medium">Loading Application Analysis</h3>
                        <p className="text-muted-foreground">Retrieving your application and AI analysis data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="max-w-lg w-full border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="h-6 w-6" />
                            Error Loading Application
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-red-700">
                            {error || "Application not found or you don't have permission to view it."}
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleRefresh}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                            <Link href="/dashboard">
                                <Button variant="outline">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const resume = application.user_resume?.[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Resume Analysis Report</h1>
                                <p className="text-sm text-gray-600">{application.job?.title || "Unknown Position"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleRefresh}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </Button>
                            <Button variant="outline" size="sm">
                                <Share className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Resume Analysis</h2>
                        <p className="text-lg text-gray-600 mb-6">Comprehensive compatibility assessment for {application.job?.title || "Unknown Position"}</p>
                        {resume?.score && (
                            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full px-8 py-4 border border-blue-200">
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                                <div className="text-left">
                                    <div className="text-3xl font-bold text-gray-900">{resume.score}%</div>
                                    <div className="text-sm text-gray-600">Overall Match Score</div>
                                </div>
                            </div>
                        )}
                        <div className="mt-8">
                            <Button
                                onClick={handleStartInterview}
                                size="lg"
                                className="px-8 py-3 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
                                disabled={checkingInterview}
                            >
                                {checkingInterview ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <User className="w-5 h-5 mr-2" />
                                        Start Interview
                                    </>
                                )}
                            </Button>
                            <p className="text-sm text-gray-500 mt-2">Begin the AI-powered interview process for this candidate</p>
                        </div>
                    </div>
                </div>

                <Card className="shadow-lg mb-8">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-2xl text-gray-900 mb-3">{application.job?.title || "Unknown Position"}</CardTitle>
                                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium">{application.job?.job_type || "Full-time"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-green-600" />
                                        <span>Remote</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-purple-600" />
                                        <span>{application.job?.job_type || "Not specified"}</span>
                                    </div>
                                </div>
                            </div>
                            <Badge variant="outline" className={`text-sm px-3 py-1 ${getApplicationStatusColor(application.status)}`}>
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Applied Date</p>
                                    <p className="text-sm text-gray-600">{formatDate(application.created_at)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <FileText className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Resume Status</p>
                                    <p className="text-sm text-gray-600">Analyzed</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                                <div className="p-2 bg-purple-100 rounded-full">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Match Score</p>
                                    <p className="text-sm text-gray-600">{resume?.score || 0}%</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-l-4 border-l-blue-500 mb-8">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Brain className="h-6 w-6 text-blue-600" />
                            AI Interview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Ready for AI Interview</h3>
                                <p className="text-sm text-gray-600 mb-3">Start a comprehensive AI-powered interview to evaluate this candidate's skills and fit.</p>
                            </div>
                            <Button
                                onClick={handleStartInterview}
                                disabled={checkingInterview}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                            >
                                {checkingInterview ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <Brain className="h-4 w-4 mr-2" />
                                        Start Interview
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {analysisData ? (
                    <div className="space-y-8">
                        <ResumeAnalysisResults
                            analysis={analysisData}
                            onNewAnalysis={() => toast.info("Re-analysis feature coming soon!")}
                        />
                        {application.candidate_id && (
                            <CandidateApplicationsList
                                candidateId={application.candidate_id}
                                excludeApplicationId={application.id}
                            />
                        )}
                    </div>
                ) : (
                    <Card className="shadow-lg">
                        <CardContent className="text-center py-12">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Data Available</h3>
                            <p className="text-gray-600">The resume analysis data is not available for this application.</p>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
