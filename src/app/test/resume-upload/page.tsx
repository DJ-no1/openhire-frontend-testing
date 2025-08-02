"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeUploadAnalyzer } from "@/components/resume-upload-analyzer";
import { Brain, FileText, Upload } from "lucide-react";

// Mock job data for testing
const mockJob = {
    id: "test-job-123",
    title: "Senior Backend Engineer",
    description: "We are looking for an experienced backend engineer to join our team...",
    recruiter_id: "recruiter-123",
    job_type: "Full-time",
    salary: 100000,
    created_at: new Date().toISOString()
};

export default function ResumeUploadTestPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Resume Upload & Analysis Demo
                    </h1>
                    <p className="text-lg text-gray-600">
                        Test the new resume upload component with AI-powered analysis progress
                    </p>
                </div>

                {/* Demo Job Card */}
                <Card className="mb-8 bg-white shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-2xl text-gray-900">{mockJob.title}</CardTitle>
                                <p className="text-gray-600 mt-2">
                                    {mockJob.job_type} • ${mockJob.salary?.toLocaleString()}/year
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    {mockJob.description}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <Button
                                size="lg"
                                onClick={openModal}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                <Upload className="mr-2 h-5 w-5" />
                                Apply Now - Test Resume Upload
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-white">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                                    <Upload className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Easy Upload</h3>
                                <p className="text-sm text-gray-600">
                                    Drag & drop or click to upload PDF, DOCX, DOC, or TXT files
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                                    <Brain className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
                                <p className="text-sm text-gray-600">
                                    Advanced AI analyzes your resume against job requirements
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                                    <FileText className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
                                <p className="text-sm text-gray-600">
                                    Real-time progress updates every 5 seconds during analysis
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Instructions */}
                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle>What to Expect</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Analysis Steps (5 seconds each):</h4>
                                <ol className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                                        Getting main analysis...
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                                        Analysis completed...
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                                        Getting dimension breakdown...
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                                        Dimension analysis completed...
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">5</span>
                                        Merging results...
                                    </li>
                                </ol>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Features:</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>• 60% screen width modal dialog</li>
                                    <li>• Persistent screen (cannot leave during analysis)</li>
                                    <li>• Animated progress indicators</li>
                                    <li>• Real-time step completion</li>
                                    <li>• Auto-redirect to detailed results</li>
                                    <li>• Professional UI with gradients</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Resume Upload Analyzer Modal */}
                <ResumeUploadAnalyzer
                    job={mockJob}
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    candidateId="demo-candidate-123"
                />
            </div>
        </div>
    );
}
