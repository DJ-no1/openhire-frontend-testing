"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Brain, BarChart3, X, CheckCircle, Database } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ResumeAnalysisResults } from "@/components/resume-analysis-results";
import { DatabaseService } from "@/lib/database";
import {
    API_CONFIG,
    getApiUrl,
    createResumeFormData,
    validateFile,
    type Job,
    type ReviewResponse
} from "@/lib/api";

interface JobApplicationModalProps {
    job: Job | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    candidateId?: string; // Add candidate ID for database operations
}

export function JobApplicationModal({ job, open, onOpenChange, candidateId }: JobApplicationModalProps) {
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<ReviewResponse | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [applicationId, setApplicationId] = useState<string | null>(null);
    const [savedToDatabase, setSavedToDatabase] = useState(false);

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

        setIsLoading(true);

        try {
            // Step 1: Create application in database
            toast.info("Creating application...");
            const application = await DatabaseService.createApplication(
                job.id
            );
            setApplicationId(application.id);
            console.log('Application created:', application);

            // Step 2: Perform AI analysis
            toast.info("Analyzing resume with AI...");
            const formData = createResumeFormData(job.id, selectedFile);

            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REVIEW_RESUME), {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.UPLOAD)
            });

            if (response.ok) {
                const result: ReviewResponse = await response.json();
                setAnalysisResult(result);
                console.log('AI Analysis completed:', result);

                // Step 3: Save analysis results to database
                toast.info("Saving analysis results...");
                const resumeRecord = await DatabaseService.saveResumeAnalysis(
                    application.id,
                    `uploads/${selectedFile.name}`,
                    result
                );
                console.log('Resume analysis saved:', resumeRecord);

                setSavedToDatabase(true);
                setShowResults(true);
                toast.success("Application submitted and analysis completed!");

            } else {
                const errorData = await response.json();
                console.error('AI Analysis failed:', errorData);
                toast.error(`Analysis failed: ${errorData.detail?.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Full error details:', error);
            if (error instanceof Error && error.name === 'TimeoutError') {
                toast.error("Analysis timed out - please try again");
            } else {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                toast.error(`Error processing application: ${errorMessage}`);
                console.error('Application error details:', {
                    message: errorMessage,
                    jobId: job?.id,
                    fileName: selectedFile?.name,
                    error: error
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewAnalysis = () => {
        setShowResults(false);
        setAnalysisResult(null);
        setSelectedFile(null);
    };

    const handleViewFullAnalysis = () => {
        if (applicationId) {
            router.push(`/dashboard/application/${applicationId}/analysis`);
        }
    };

    const handleClose = () => {
        setShowResults(false);
        setAnalysisResult(null);
        setSelectedFile(null);
        setApplicationId(null);
        setSavedToDatabase(false);
        onOpenChange(false);
    };

    if (!job) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                {!showResults ? (
                    <>
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Brain className="h-6 w-6" />
                                        Apply for {job.title}
                                    </DialogTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Upload your resume to get AI-powered compatibility analysis
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClose}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Job Info Card */}
                            <Card className="bg-blue-50 border-blue-200">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg text-blue-900">
                                        {job.title}
                                    </CardTitle>
                                    <div className="text-sm text-blue-700">
                                        {job.job_type} • {job.salary && `$${job.salary}`}
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-sm text-blue-800 line-clamp-2">
                                        {job.description}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Upload Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Upload Resume</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors hover:border-gray-400">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <div>
                                            <Input
                                                type="file"
                                                accept=".pdf,.docx,.doc,.txt"
                                                onChange={handleFileChange}
                                                className="sr-only"
                                                id="resume-upload"
                                                disabled={isLoading}
                                            />
                                            <label
                                                htmlFor="resume-upload"
                                                className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                                            >
                                                Choose File
                                            </label>
                                            <p className="mt-2 text-sm text-gray-500">
                                                PDF, DOCX, DOC, or TXT files only
                                            </p>
                                            {selectedFile && (
                                                <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                                                    <p className="text-sm text-green-700 flex items-center justify-center gap-2">
                                                        <FileText className="h-4 w-4" />
                                                        {selectedFile.name}
                                                        <span className="text-xs">
                                                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                                        </span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!selectedFile || isLoading}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isLoading ? (
                                            <>
                                                <BarChart3 className="mr-2 h-4 w-4 animate-spin" />
                                                Analyzing Resume...
                                            </>
                                        ) : (
                                            <>
                                                <Brain className="mr-2 h-4 w-4" />
                                                Analyze Resume
                                            </>
                                        )}
                                    </Button>

                                    {isLoading && (
                                        <div className="text-center text-sm text-muted-foreground">
                                            <p>AI is analyzing your resume against the job requirements...</p>
                                            <p className="text-xs mt-1">This may take 30-60 seconds</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <DialogTitle>Analysis Results - {job.title}</DialogTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClose}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </DialogHeader>

                        {savedToDatabase && (
                            <Card className="bg-green-50 border-green-200 mb-4">
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-green-800">Application Submitted Successfully!</h4>
                                            <p className="text-sm text-green-700">
                                                Your application and analysis have been saved to your dashboard.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleViewFullAnalysis}
                                            className="text-green-700 border-green-300 hover:bg-green-100"
                                        >
                                            <Database className="h-4 w-4 mr-2" />
                                            View in Dashboard
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleNewAnalysis}
                                            className="text-green-700 border-green-300 hover:bg-green-100"
                                        >
                                            Apply to Another Job
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {analysisResult && (
                            <ResumeAnalysisResults
                                analysis={analysisResult}
                                onNewAnalysis={handleNewAnalysis}
                            />
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
