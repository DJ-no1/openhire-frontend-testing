"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Brain, BarChart3, X, CheckCircle, Loader2, TrendingUp, Clock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DatabaseService } from "@/lib/database";
import {
    API_CONFIG,
    getApiUrl,
    createResumeFormData,
    validateFile,
    type Job,
    type ReviewResponse
} from "@/lib/api";

interface ResumeUploadAnalyzerProps {
    job: Job | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    candidateId?: string;
}

type AnalysisStep = {
    id: string;
    title: string;
    completed: boolean;
    active: boolean;
};

export function ResumeUploadAnalyzer({ job, open, onOpenChange, candidateId }: ResumeUploadAnalyzerProps) {
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [applicationId, setApplicationId] = useState<string | null>(null);

    const analysisSteps: AnalysisStep[] = [
        { id: "main", title: "Getting main analysis", completed: false, active: false },
        { id: "complete", title: "Analysis completed", completed: false, active: false },
        { id: "dimension", title: "Getting dimension breakdown", completed: false, active: false },
        { id: "dimension-complete", title: "Dimension analysis completed", completed: false, active: false },
        { id: "merge", title: "Merging results", completed: false, active: false },
    ];

    const [steps, setSteps] = useState<AnalysisStep[]>(analysisSteps);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isAnalyzing && currentStepIndex < steps.length) {
            interval = setInterval(() => {
                setSteps(prevSteps => {
                    const newSteps = [...prevSteps];

                    // Mark current step as completed and next as active
                    if (currentStepIndex > 0) {
                        newSteps[currentStepIndex - 1].completed = true;
                        newSteps[currentStepIndex - 1].active = false;
                    }

                    if (currentStepIndex < newSteps.length) {
                        newSteps[currentStepIndex].active = true;
                    }

                    return newSteps;
                });

                setCurrentStepIndex(prev => prev + 1);
            }, 5000); // 5 seconds interval
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isAnalyzing, currentStepIndex, steps.length]);

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

    const resetComponent = () => {
        setSelectedFile(null);
        setIsAnalyzing(false);
        setCurrentStepIndex(0);
        setApplicationId(null);
        setSteps(analysisSteps.map(step => ({ ...step, completed: false, active: false })));
    };

    const handleClose = () => {
        resetComponent();
        onOpenChange(false);
    };

    const handleSubmit = async () => {
        if (!job || !selectedFile) {
            toast.error("Please upload a resume file");
            return;
        }

        console.log('🚀 Starting job application submission');
        console.log('📋 Job ID:', job.id);
        console.log('👤 Candidate ID:', candidateId);
        console.log('📁 Selected file:', selectedFile.name);

        setIsAnalyzing(true);
        setCurrentStepIndex(0);

        try {
            // Step 1: Create application in database
            const application = await DatabaseService.createApplication(
                job.id,
                candidateId
            );
            setApplicationId(application.id);
            console.log('✅ Application created:', application);

            // Step 2: Perform AI analysis (this happens in background while showing progress)
            const formData = createResumeFormData(job.id, selectedFile);

            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REVIEW_RESUME), {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.UPLOAD)
            });

            if (response.ok) {
                const result: ReviewResponse = await response.json();
                console.log('AI Analysis completed:', result);

                // Step 3: Save analysis results to database
                const resumeRecord = await DatabaseService.saveResumeAnalysis(
                    application.id,
                    `uploads/${selectedFile.name}`,
                    result
                );
                console.log('Resume analysis saved:', resumeRecord);

                // Wait for all steps to complete visually
                setTimeout(() => {
                    // Mark final step as completed
                    setSteps(prevSteps => {
                        const newSteps = [...prevSteps];
                        newSteps.forEach(step => {
                            step.completed = true;
                            step.active = false;
                        });
                        return newSteps;
                    });

                    // Show success and redirect
                    setTimeout(() => {
                        toast.success("Analysis completed! Redirecting to detailed results...");
                        router.push(`/dashboard/application/${application.id}/analysis`);
                        handleClose();
                    }, 1500);
                }, Math.max(0, (steps.length - currentStepIndex) * 5000));

            } else {
                const errorData = await response.json();
                console.error('AI Analysis failed:', errorData);
                toast.error(`Analysis failed: ${errorData.detail?.error || 'Unknown error'}`);
                setIsAnalyzing(false);
            }
        } catch (error) {
            console.error('Full error details:', error);
            if (error instanceof Error && error.name === 'TimeoutError') {
                toast.error("Analysis timed out - please try again");
            } else {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                toast.error(`Error processing application: ${errorMessage}`);
            }
            setIsAnalyzing(false);
        }
    };

    if (!job) return null;

    return (
        <Dialog open={open} onOpenChange={isAnalyzing ? undefined : onOpenChange}>
            <DialogContent className="sm:max-w-[60vw] max-h-[90vh] overflow-y-auto" showCloseButton={false}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Brain className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">Apply for {job.title}</DialogTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Upload your resume to get AI-powered compatibility analysis
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
                                        {job.description && (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium border border-blue-200">
                                                {job.job_type || "Position Available"}
                                            </span>
                                        )}
                                        {job.salary && (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium border border-green-200">
                                                {typeof job.salary === 'string' ? job.salary : `$${job.salary}`}
                                            </span>
                                        )}
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium border border-purple-200">
                                            AI Analysis Available
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* File Upload Section */}
                    {!isAnalyzing && (
                        <Card className="shadow-sm border-gray-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Upload className="h-5 w-5 text-blue-600" />
                                    Upload Resume
                                </CardTitle>
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
                                    disabled={!selectedFile}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                                    size="lg"
                                >
                                    <Brain className="mr-2 h-5 w-5" />
                                    Analyze Resume
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Analysis Progress Section */}
                    {isAnalyzing && (
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                            <CardHeader className="text-center pb-4">
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    <div className="p-4 bg-blue-500 rounded-full shadow-lg">
                                        <Brain className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl text-gray-900 mb-2">
                                            AI Analysis in Progress
                                        </CardTitle>
                                        <p className="text-gray-600">
                                            Please stay on this screen while we analyze your resume
                                        </p>
                                    </div>
                                </div>

                                {/* Do not leave warning */}
                                <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-md border border-blue-200">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-semibold text-gray-800">
                                        Do not leave this screen
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent className="text-center">
                                {/* Current Step Display */}
                                <div className="bg-white rounded-xl p-8 shadow-sm border border-blue-100">
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                                            </div>
                                            <div className="absolute -inset-1 bg-blue-200 rounded-full animate-ping opacity-30"></div>
                                        </div>
                                    </div>

                                    {/* Current Step Text */}
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {currentStepIndex < steps.length
                                                ? `${steps[currentStepIndex].title}...`
                                                : "Analysis Complete!"
                                            }
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Please wait while we process your resume
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
