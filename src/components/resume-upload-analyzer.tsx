"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Brain, BarChart3, X, CheckCircle, Loader2, TrendingUp, Clock, Briefcase } from "lucide-react";
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

export function ResumeUploadAnalyzer({ job, open, onOpenChange, candidateId }: ResumeUploadAnalyzerProps) {
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [applicationId, setApplicationId] = useState<string | null>(null);

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
        setApplicationId(null);
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

        try {
            // Step 1: Create application in database
            const application = await DatabaseService.createApplication(
                job.id,
                candidateId
            );
            setApplicationId(application.id);
            console.log('✅ Application created:', application);

            // Step 2: Perform AI analysis
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

                // NEW LOGIC: Redirect immediately upon successful response
                toast.success("Analysis completed! Redirecting to results...");
                router.push(`/dashboard/application/${application.id}/analysis`);
                handleClose();

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
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden" showCloseButton={false}>
                <DialogHeader className="space-y-0 pb-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-semibold text-gray-900">
                                Apply for {job.title}
                            </DialogTitle>
                            <p className="text-sm text-gray-500">
                                Get instant AI-powered compatibility analysis
                            </p>
                        </div>
                        {!isAnalyzing && (
                            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Compact Job Info */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Briefcase className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{job.title}</h3>
                                <p className="text-sm text-gray-500">
                                    {job.job_type} • {job.salary || "Competitive salary"}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                    <Brain className="h-3 w-3" />
                                    AI Analysis
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* File Upload Section */}
                    {!isAnalyzing ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf,.docx,.doc,.txt"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    id="resume-upload"
                                />
                                {!selectedFile ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors duration-200">
                                                <Upload className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 mb-1">
                                                    Drop your resume here or click to browse
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    PDF, DOCX, DOC, or TXT • Max 10MB
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-green-900">{selectedFile.name}</p>
                                                <p className="text-sm text-green-600">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedFile(null)}
                                                className="text-green-600 hover:text-green-700 hover:bg-green-100 h-8 px-3"
                                            >
                                                Change
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={!selectedFile}
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Brain className="mr-2 h-5 w-5" />
                                Start AI Analysis
                            </Button>
                        </div>
                    ) : (
                        /* Loading State */
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                                    </div>
                                    <div className="absolute -inset-2 bg-blue-200 rounded-full animate-ping opacity-20"></div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Analyzing your resume
                                    </h3>
                                    <p className="text-sm text-gray-600 max-w-sm mx-auto">
                                        Our AI is reviewing your qualifications and matching them against the job requirements. This will take just a moment.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-blue-600 bg-white px-3 py-2 rounded-full">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    Please don't close this window
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
