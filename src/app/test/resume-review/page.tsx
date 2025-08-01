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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, AlertTriangle, CheckCircle, TrendingUp, Brain } from "lucide-react"
import { toast } from "sonner"
import {
    API_CONFIG,
    getApiUrl,
    createResumeFormData,
    validateFile,
    type Job,
    type ReviewResponse
} from "@/lib/api"

export default function ResumeReviewPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<ReviewResponse | null>(null);
    const [loadingJobs, setLoadingJobs] = useState(true);

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

    const handleSubmit = async () => {
        if (!selectedJobId || !selectedFile) {
            toast.error("Please select both a job and upload a resume file");
            return;
        }

        setIsLoading(true);

        try {
            const formData = createResumeFormData(selectedJobId, selectedFile);

            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REVIEW_RESUME), {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.UPLOAD)
            });

            if (response.ok) {
                const result: ReviewResponse = await response.json();
                setAnalysis(result);
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
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return "bg-green-100 border-green-200";
        if (score >= 60) return "bg-yellow-100 border-yellow-200";
        return "bg-red-100 border-red-200";
    };

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
                    {!analysis ? (
                        // Upload Form
                        <div className="max-w-2xl mx-auto w-full">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Brain className="h-6 w-6" />
                                        AI-Powered Resume Analysis
                                    </CardTitle>
                                    <p className="text-muted-foreground">
                                        Upload a resume and select a job to get detailed ATS compatibility analysis
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-6">
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
                                                <Input
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
                                        onClick={handleSubmit}
                                        disabled={!selectedJobId || !selectedFile || isLoading}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isLoading ? "Analyzing Resume..." : "Analyze Resume"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        // Analysis Results
                        <div className="max-w-4xl mx-auto w-full space-y-6">
                            {/* Header with Overall Score */}
                            <Card className={`${getScoreBgColor(analysis.analysis.overall_score)} border-2`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <TrendingUp className="h-6 w-6" />
                                            Overall ATS Score
                                        </span>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setAnalysis(null);
                                                setSelectedFile(null);
                                                setSelectedJobId("");
                                            }}
                                        >
                                            Analyze Another Resume
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-6xl font-bold ${getScoreColor(analysis.analysis.overall_score)}`}>
                                            {Math.round(analysis.analysis.overall_score)}
                                        </span>
                                        <div className="flex-1">
                                            <div className="text-sm text-muted-foreground mb-2">Score out of 100</div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${analysis.analysis.overall_score}%` }}
                                                />
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 text-sm">
                                                <span className={`font-medium ${analysis.analysis.passed_hard_filters ? 'text-green-600' : 'text-red-600'}`}>
                                                    {analysis.analysis.passed_hard_filters ? (
                                                        <>
                                                            <CheckCircle className="inline h-4 w-4 mr-1" />
                                                            Passed Hard Filters
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertTriangle className="inline h-4 w-4 mr-1" />
                                                            Failed Hard Filters
                                                        </>
                                                    )}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    • Confidence: {Math.round(analysis.analysis.confidence * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dimension Breakdown */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detailed Score Breakdown</CardTitle>
                                    <p className="text-muted-foreground">
                                        Analysis across 9 key dimensions with weighted scoring
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {Object.entries(analysis.analysis.dimension_breakdown).map(([key, dimension]) => (
                                            <div key={key} className="p-4 border rounded-lg space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium capitalize">
                                                        {key.replace(/_/g, ' ')}
                                                    </h4>
                                                    <span className={`text-lg font-bold ${getScoreColor(dimension.score)}`}>
                                                        {Math.round(dimension.score)}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${dimension.score >= 80 ? 'bg-green-500' :
                                                                dimension.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${dimension.score}%` }}
                                                    />
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Weight: {Math.round(dimension.weight * 100)}%
                                                </div>
                                                {dimension.evidence.length > 0 && (
                                                    <ul className="text-xs space-y-1 text-muted-foreground">
                                                        {dimension.evidence.slice(0, 2).map((evidence, idx) => (
                                                            <li key={idx} className="flex items-start gap-1">
                                                                <span className="text-green-500 mt-0.5">•</span>
                                                                {evidence}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Risk Flags */}
                            {analysis.analysis.risk_flags.length > 0 && (
                                <Card className="border-yellow-200 bg-yellow-50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-yellow-800">
                                            <AlertTriangle className="h-5 w-5" />
                                            Risk Flags
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {analysis.analysis.risk_flags.map((flag, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-yellow-800">
                                                    <span className="text-yellow-600 mt-1">⚠</span>
                                                    {flag}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Hard Filter Failures */}
                            {analysis.analysis.hard_filter_failures.length > 0 && (
                                <Card className="border-red-200 bg-red-50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-red-800">
                                            <AlertTriangle className="h-5 w-5" />
                                            Hard Filter Failures
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {analysis.analysis.hard_filter_failures.map((failure, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-red-800">
                                                    <span className="text-red-600 mt-1">✗</span>
                                                    {failure}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Resume and Job Description */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Extracted Resume Text</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="max-h-96 overflow-y-auto bg-muted p-4 rounded text-sm whitespace-pre-wrap">
                                            {analysis.resume}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Job Description</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="max-h-96 overflow-y-auto bg-muted p-4 rounded text-sm whitespace-pre-wrap">
                                            {analysis.jd}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
