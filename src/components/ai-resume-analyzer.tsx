"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, AlertTriangle, CheckCircle, TrendingUp, Brain, BarChart3 } from "lucide-react"
import { toast } from "sonner"

interface Job {
    id: string;
    title: string;
    description: string;
    recruiter_id: string;
    job_type: string;
    salary?: number;
    created_at: string;
}

interface DimensionScore {
    score: number;
    weight: number;
    evidence: string[];
}

interface AnalysisResult {
    overall_score: number;
    passed_hard_filters: boolean;
    dimension_breakdown: {
        skill_match: DimensionScore;
        experience_fit: DimensionScore;
        impact_outcomes: DimensionScore;
        role_alignment: DimensionScore;
        project_tech_depth: DimensionScore;
        career_trajectory: DimensionScore;
        communication_clarity: DimensionScore;
        certs_education: DimensionScore;
        extras: DimensionScore;
    };
    hard_filter_failures: string[];
    risk_flags: string[];
    confidence: number;
}

interface ReviewResponse {
    jd: string;
    resume: string;
    analysis: AnalysisResult;
}

interface AIResumeAnalyzerProps {
    onAnalysisComplete?: (analysis: ReviewResponse) => void;
    className?: string;
}

export function AIResumeAnalyzer({ onAnalysisComplete, className }: AIResumeAnalyzerProps) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingJobs, setLoadingJobs] = useState(true);

    // Fetch jobs on component mount
    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetch('http://localhost:8000/jobs');
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
            // Validate file type
            const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

            if (!allowedTypes.includes(fileExtension)) {
                toast.error(`Unsupported file type: ${fileExtension}. Supported types: ${allowedTypes.join(', ')}`);
                return;
            }

            setSelectedFile(file);
            toast.success(`File selected: ${file.name}`);
        }
    };

    const handleSubmit = async () => {
        if (!selectedJobId || !selectedFile) {
            toast.error("Please select both a job and upload a resume file");
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('job_id', selectedJobId);
            formData.append('file', selectedFile);

            const response = await fetch('http://localhost:8000/review-resume', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result: ReviewResponse = await response.json();
                toast.success("Resume analysis completed!");
                onAnalysisComplete?.(result);
            } else {
                const errorData = await response.json();
                toast.error(`Analysis failed: ${errorData.detail?.error || 'Unknown error'}`);
            }
        } catch (error) {
            toast.error("Error connecting to analysis service");
            console.error('Analysis error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedJob = jobs.find(job => job.id === selectedJobId);

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6" />
                    AI Resume Analysis
                </CardTitle>
                <p className="text-muted-foreground">
                    Get detailed ATS compatibility analysis with AI-powered insights
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
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">{job.title}</span>
                                        <span className="text-xs text-muted-foreground">{job.job_type}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedJob && (
                        <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                            <strong>Selected:</strong> {selectedJob.title} ({selectedJob.job_type})
                            {selectedJob.salary && <span> • ${selectedJob.salary.toLocaleString()}</span>}
                        </div>
                    )}
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Upload Resume</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors hover:border-gray-400">
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
                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                Choose File
                            </label>
                            <p className="mt-2 text-sm text-gray-500">
                                PDF, DOCX, DOC, or TXT files only
                            </p>
                            {selectedFile && (
                                <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                                    <p className="text-sm text-green-700 flex items-center justify-center gap-1">
                                        <FileText className="h-4 w-4" />
                                        {selectedFile.name}
                                        <span className="text-xs">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    </p>
                                </div>
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
    );
}
