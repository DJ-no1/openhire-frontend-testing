"use client";
import { AppSidebar } from "@/components/app-sidebar"
import { useState, useEffect } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Brain, TrendingUp, Zap, Clock } from "lucide-react"
import { toast } from "sonner"
import { useAsyncResumeAnalysis } from "@/hooks/useAsyncResumeAnalysis"
import { ProgressIndicator } from "@/components/progress-indicator"
import { ResumeAnalysisResults } from "@/components/resume-analysis-results"
import {
    API_CONFIG,
    getApiUrl,
    validateFile,
    type Job,
    type ReviewResponse
} from "@/lib/api"

export default function AsyncResumeReviewPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [showResults, setShowResults] = useState(false);
    const [analysisMode, setAnalysisMode] = useState<'sync' | 'async'>('async');

    const {
        state: asyncState,
        startAnalysisWithFile,
        reset: resetAsync,
        isAnalyzing,
        isCompleted
    } = useAsyncResumeAnalysis({
        onComplete: (result) => {
            toast.success("Resume analysis completed!");
            setShowResults(true);
        },
        onError: (error) => {
            toast.error(`Analysis failed: ${error}`);
        }
    });

    // Traditional sync analysis state
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncAnalysis, setSyncAnalysis] = useState<ReviewResponse | null>(null);

    // Fetch jobs on component mount
    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.JOBS), {
                signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.FETCH)
            });
            if (response.ok) {
                const jobsData = await response.json();
                setJobs(jobsData);
            } else {
                toast.error("Failed to fetch jobs");
            }
        } catch (error) {
            toast.error("Error connecting to backend");
            console.error('Error fetching jobs:', error);
        } finally {
            setLoadingJobs(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                validateFile(file);
                setSelectedFile(file);
                toast.success(`File selected: ${file.name}`);
            } catch (error) {
                toast.error((error as Error).message);
            }
        }
    };

    const handleAsyncSubmit = async () => {
        if (!selectedJobId || !selectedFile) {
            toast.error("Please select both a job and upload a resume file");
            return;
        }

        try {
            await startAnalysisWithFile(selectedJobId, selectedFile);
            toast.success("Async analysis started! You can track progress below.");
        } catch (error) {
            // Error already handled by the hook
        }
    };

    const handleSyncSubmit = async () => {
        if (!selectedJobId || !selectedFile) {
            toast.error("Please select both a job and upload a resume file");
            return;
        }

        setSyncLoading(true);

        try {
            const formData = new FormData();
            formData.append('job_id', selectedJobId);
            formData.append('file', selectedFile);

            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REVIEW_RESUME), {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.UPLOAD)
            });

            if (response.ok) {
                const result: ReviewResponse = await response.json();
                setSyncAnalysis(result);
                toast.success("Resume analysis completed!");
            } else {
                const errorData = await response.json();
                toast.error(`Analysis failed: ${errorData.detail?.error || 'Unknown error'}`);
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'TimeoutError') {
                toast.error("Analysis timeout - the request is taking longer than expected");
            } else {
                toast.error("Error connecting to analysis service");
            }
            console.error('Analysis error:', error);
        } finally {
            setSyncLoading(false);
        }
    };

    const handleNewAnalysis = () => {
        setSelectedFile(null);
        setSelectedJobId("");
        setShowResults(false);
        setSyncAnalysis(null);
        resetAsync();
    };

    const getAnalysisResult = () => {
        if (analysisMode === 'async') {
            return asyncState.result;
        }
        return syncAnalysis;
    };

    const isCurrentlyAnalyzing = analysisMode === 'async' ? isAnalyzing : syncLoading;
    const hasResults = analysisMode === 'async' ? (showResults && asyncState.result) : !!syncAnalysis;

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/">
                                        OpenHire
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>AI Resume Analysis</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Mode Selection Banner */}
                    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <Zap className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-green-900">New: Async Analysis Available!</h3>
                                        <p className="text-green-700 text-sm">
                                            Fast, reliable analysis with real-time progress tracking
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={analysisMode === 'async' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setAnalysisMode('async')}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Zap className="mr-2 h-4 w-4" />
                                        Async Mode
                                    </Button>
                                    <Button
                                        variant={analysisMode === 'sync' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setAnalysisMode('sync')}
                                    >
                                        <Clock className="mr-2 h-4 w-4" />
                                        Legacy Mode
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {!hasResults ? (
                        // Upload Form
                        <div className="max-w-2xl mx-auto w-full">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Brain className="h-6 w-6" />
                                        AI-Powered Resume Analysis
                                        {analysisMode === 'async' && (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                                ASYNC
                                            </span>
                                        )}
                                    </CardTitle>
                                    <p className="text-muted-foreground">
                                        {analysisMode === 'async'
                                            ? "Upload a resume and select a job for fast, async analysis with real-time progress"
                                            : "Upload a resume and select a job for traditional synchronous analysis"
                                        }
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Analysis Mode Info */}
                                    {analysisMode === 'async' ? (
                                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                                                <Zap className="h-4 w-4" />
                                                Async Mode Benefits
                                            </h4>
                                            <ul className="text-sm text-green-800 space-y-1">
                                                <li>• ⚡ Fast response (under 2 seconds to start)</li>
                                                <li>• 📊 Real-time progress updates</li>
                                                <li>• 🛡️ No timeouts or connection issues</li>
                                                <li>• 🔄 Analysis continues in background</li>
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                            <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Legacy Mode
                                            </h4>
                                            <p className="text-sm text-yellow-800">
                                                Traditional synchronous analysis. May take 30-60 seconds and could timeout on slow connections.
                                            </p>
                                        </div>
                                    )}

                                    {/* Job Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Select Job Position</label>
                                        <Select value={selectedJobId} onValueChange={setSelectedJobId} disabled={loadingJobs}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={loadingJobs ? "Loading jobs..." : "Choose a job position"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {jobs.map((job) => (
                                                    <SelectItem key={job.id} value={job.id}>
                                                        {job.title} - {job.job_type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* File Upload */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Upload Resume</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="mt-4">
                                                <input
                                                    type="file"
                                                    accept=".pdf,.docx,.doc,.txt"
                                                    onChange={handleFileChange}
                                                    className="sr-only"
                                                    id="resume-upload"
                                                />
                                                <label
                                                    htmlFor="resume-upload"
                                                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Choose File
                                                </label>
                                                <p className="mt-2 text-sm text-gray-500">
                                                    PDF, DOCX, DOC, or TXT files only
                                                </p>
                                                {selectedFile && (
                                                    <p className="mt-2 text-sm text-green-600 flex items-center justify-center gap-1">
                                                        <FileText className="h-4 w-4" />
                                                        {selectedFile.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        onClick={analysisMode === 'async' ? handleAsyncSubmit : handleSyncSubmit}
                                        disabled={!selectedJobId || !selectedFile || isCurrentlyAnalyzing}
                                        className={`w-full ${analysisMode === 'async' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                        size="lg"
                                    >
                                        {isCurrentlyAnalyzing ? (
                                            analysisMode === 'async' ? "Starting Analysis..." : "Analyzing Resume..."
                                        ) : (
                                            <>
                                                {analysisMode === 'async' ? <Zap className="mr-2 h-4 w-4" /> : <Brain className="mr-2 h-4 w-4" />}
                                                {analysisMode === 'async' ? 'Start Async Analysis' : 'Analyze Resume'}
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Progress Indicator for Async Mode */}
                            {analysisMode === 'async' && isAnalyzing && (
                                <div className="mt-6">
                                    <ProgressIndicator
                                        progress={asyncState.progress}
                                        status={asyncState.status === 'submitting' ? 'pending' :
                                            asyncState.status === 'polling' ? 'processing' :
                                                asyncState.status === 'completed' ? 'completed' : 'failed'}
                                        estimatedTime={asyncState.estimatedCompletion || undefined}
                                        jobId={asyncState.jobId || undefined}
                                        createdAt={asyncState.createdAt || undefined}
                                        error={asyncState.error || undefined}
                                        onRetry={handleNewAnalysis}
                                        onNewAnalysis={handleNewAnalysis}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        // Analysis Results
                        <div className="max-w-4xl mx-auto w-full">
                            <div className="mb-6 flex justify-between items-center">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <TrendingUp className="h-6 w-6" />
                                    Analysis Results
                                    {analysisMode === 'async' && (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                            ASYNC
                                        </span>
                                    )}
                                </h2>
                                <Button onClick={handleNewAnalysis} variant="outline">
                                    New Analysis
                                </Button>
                            </div>

                            {getAnalysisResult() && (
                                <ResumeAnalysisResults
                                    analysis={getAnalysisResult()!}
                                    onNewAnalysis={handleNewAnalysis}
                                />
                            )}
                        </div>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
