"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Brain, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAsyncResumeAnalysis } from "@/hooks/useAsyncResumeAnalysis";
import { ProgressIndicator } from "@/components/progress-indicator";
import { ResumeAnalysisResults } from "@/components/resume-analysis-results";
import { validateFile, type Job, type ReviewResponse } from "@/lib/api";

interface AsyncResumeAnalyzerProps {
    job: Job | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAnalysisComplete?: (result: ReviewResponse) => void;
}

export function AsyncResumeAnalyzer({
    job,
    open,
    onOpenChange,
    onAnalysisComplete
}: AsyncResumeAnalyzerProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showResults, setShowResults] = useState(false);

    const {
        state,
        startAnalysisWithFile,
        reset,
        isAnalyzing,
        isCompleted,
        isFailed
    } = useAsyncResumeAnalysis({
        onComplete: (result) => {
            toast.success("Resume analysis completed!");
            onAnalysisComplete?.(result);
            setShowResults(true);
        },
        onError: (error) => {
            toast.error(`Analysis failed: ${error}`);
        },
        onProgress: (progress) => {
            // Optional: could show a toast for major progress milestones
            if (progress === 50) {
                toast.info("Analysis is 50% complete");
            }
        }
    });

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
        if (!job || !selectedFile) {
            toast.error("Please upload a resume file");
            return;
        }

        try {
            await startAnalysisWithFile(job.id, selectedFile);
            toast.success("Analysis started! You can track progress below.");
        } catch (error) {
            // Error already handled by the hook
        }
    };

    const handleClose = () => {
        if (isAnalyzing) {
            toast.warning("Analysis is in progress. Closing this dialog won't stop the analysis.");
        }
        resetComponent();
        onOpenChange(false);
    };

    const resetComponent = () => {
        setSelectedFile(null);
        setShowResults(false);
        reset();
    };

    const handleNewAnalysis = () => {
        resetComponent();
    };

    if (!job) return null;

    return (
        <Dialog open={open} onOpenChange={isAnalyzing ? undefined : onOpenChange}>
            <DialogContent className="sm:max-w-[70vw] max-h-[90vh] overflow-y-auto" showCloseButton={false}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Brain className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">Apply for {job.title}</DialogTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Upload your resume for AI-powered compatibility analysis
                                </p>
                            </div>
                        </div>
                        {!isAnalyzing && (
                            <Button variant="ghost" size="sm" onClick={handleClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Job Summary Card */}
                    <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-100">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl text-gray-900 mb-1">{job.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {job.job_type} • {job.salary || "Competitive salary"}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium border border-blue-200">
                                            {job.job_type || "Position Available"}
                                        </span>
                                        {job.salary && (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium border border-green-200">
                                                {typeof job.salary === 'string' ? job.salary : `$${job.salary}`}
                                            </span>
                                        )}
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium border border-purple-200">
                                            Async AI Analysis
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Show Results */}
                    {showResults && state.result && (
                        <ResumeAnalysisResults
                            analysis={state.result}
                            onNewAnalysis={handleNewAnalysis}
                        />
                    )}

                    {/* Progress Indicator */}
                    {isAnalyzing && (
                        <ProgressIndicator
                            progress={state.progress}
                            status={state.status === 'submitting' ? 'pending' :
                                state.status === 'polling' ? 'processing' :
                                    state.status === 'completed' ? 'completed' : 'failed'}
                            estimatedTime={state.estimatedCompletion || undefined}
                            jobId={state.jobId || undefined}
                            createdAt={state.createdAt || undefined}
                            error={state.error || undefined}
                            onRetry={handleNewAnalysis}
                            onNewAnalysis={handleNewAnalysis}
                        />
                    )}

                    {/* File Upload Section */}
                    {!isAnalyzing && !showResults && (
                        <Card className="shadow-sm border-gray-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Upload className="h-5 w-5 text-blue-600" />
                                    Upload Resume
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Your analysis will run in the background. You can track progress in real-time.
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".pdf,.docx,.doc,.txt"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        id="resume-upload"
                                    />
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                                                <Upload className="h-8 w-8 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold text-gray-900 mb-1">
                                                    Click anywhere to choose your resume file
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    PDF, DOCX, DOC, or TXT files only
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedFile && (
                                    <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm">
                                        <div className="p-3 bg-green-100 rounded-full">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FileText className="h-5 w-5 text-green-600" />
                                                <p className="font-bold text-green-800 text-lg">File Uploaded Successfully!</p>
                                            </div>
                                            <p className="font-semibold text-green-700">{selectedFile.name}</p>
                                            <p className="text-sm text-green-600">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedFile(null)}
                                            className="text-green-600 hover:text-green-700 hover:bg-green-100"
                                        >
                                            Change File
                                        </Button>
                                    </div>
                                )}

                                <Button
                                    onClick={handleSubmit}
                                    disabled={!selectedFile || isAnalyzing}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                                    size="lg"
                                >
                                    <Brain className="mr-2 h-5 w-5" />
                                    Start Async Analysis
                                </Button>

                                {/* Benefits of Async Analysis */}
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-medium text-blue-900 mb-2">✨ Improved Experience</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Fast response times (under 2 seconds to start)</li>
                                        <li>• Real-time progress updates</li>
                                        <li>• No timeouts or connection issues</li>
                                        <li>• Analysis continues in background</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Failure State with Options */}
                    {isFailed && !isAnalyzing && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-6 text-center">
                                <p className="text-red-800 mb-4">
                                    {state.error || "Analysis failed. Please try again."}
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <Button variant="outline" onClick={handleNewAnalysis}>
                                        Try Again
                                    </Button>
                                    <Button onClick={() => window.location.href = '/test/resume-review'}>
                                        Use Simple Analysis
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
