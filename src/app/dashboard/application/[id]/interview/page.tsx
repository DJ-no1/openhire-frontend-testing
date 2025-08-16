"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ImageCapture from "@/components/image-capture";
import AIInterviewNew from "@/components/ai_interview2";

type InterviewStatus = "disconnected" | "connecting" | "connected" | "paused" | "completed";

interface FinalAssessment {
    overall_score: number;
    technical_score: number;
    final_recommendation: string;
    confidence_level: string;
    industry_type: string;
    universal_scores: {
        communication_score: number;
        problem_solving_score: number;
        leadership_potential_score: number;
        adaptability_score: number;
        teamwork_score: number;
        cultural_fit_score: number;
    };
    industry_competency_scores: Record<string, number>;
    feedback: {
        universal_feedback_for_candidate: string;
        areas_of_improvement_for_candidate: string[];
        industry_specific_feedback?: {
            technical_feedback_for_candidate: string;
            domain_strengths: string[];
            domain_improvement_areas: string[];
        };
    };
    interview_metrics: {
        duration: string;
        questions_answered: number;
        engagement_level: number;
        completion_status: string;
    };
}

export default function InterviewPage() {
    const { id } = useParams();
    const router = useRouter();

    const [interviewStatus, setInterviewStatus] = useState<InterviewStatus>("disconnected");
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [redirectTimer, setRedirectTimer] = useState<number | null>(null);

    // Use application ID as interview ID
    const applicationId = id as string;

    // Handle status changes from AIInterview component
    const handleStatusChange = async (status: InterviewStatus) => {
        setInterviewStatus(status);
        console.log('📊 Interview status changed to:', status);
    };

    // Handle interview completion
    const handleInterviewComplete = async (finalAssessment: FinalAssessment, conversation: any[]) => {
        console.log('🎉 Interview completed! Backend should handle data persistence.');
        console.log('📊 Final Assessment:', finalAssessment);
        console.log('💬 Conversation:', conversation.length, 'messages');

        // Mark interview as completed
        setInterviewStatus("completed");
        toast.success("Interview completed successfully!");

        // Start countdown timer for redirect
        let countdown = 5;
        setRedirectTimer(countdown);

        const timer = setInterval(() => {
            countdown -= 1;
            setRedirectTimer(countdown);

            if (countdown <= 0) {
                clearInterval(timer);
                // Redirect to interview results page
                router.push(`/dashboard/application/${applicationId}/interview-result`);
            }
        }, 1000);

        // Clean up timer if component unmounts
        return () => clearInterval(timer);
    };

    // Handle image capture
    const handleImageCaptured = (imageUrl: string) => {
        console.log('📸 Image captured:', imageUrl);
        setCapturedImages(prev => {
            const newImages = [...prev, imageUrl];
            console.log('📷 Updated captured images array:', newImages);
            return newImages;
        });
    };

    // Handle manual navigation back
    const handleGoBack = () => {
        if (interviewStatus === "connected" || interviewStatus === "connecting") {
            const confirmLeave = window.confirm("Are you sure you want to leave the interview? Your progress will be lost.");
            if (!confirmLeave) return;
        }

        router.back();
    };

    // Prevent page refresh/navigation during interview
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (interviewStatus === "connected" || interviewStatus === "connecting") {
                e.preventDefault();
                e.returnValue = "Are you sure you want to leave the interview? Your progress will be lost.";
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [interviewStatus]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleGoBack}
                                className="mr-4"
                                disabled={interviewStatus === "connecting" || interviewStatus === "connected"}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {interviewStatus === "connecting" || interviewStatus === "connected" ? "Interview Active" : "Back"}
                            </Button>
                            <div>
                                <h1 className="text-lg font-semibold">AI Interview Session</h1>
                                <p className="text-sm text-gray-600">Application ID: {applicationId}</p>
                            </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${interviewStatus === "connected"
                                    ? "bg-green-100 text-green-800"
                                    : interviewStatus === "connecting"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : interviewStatus === "completed"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-800"
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${interviewStatus === "connected"
                                        ? "bg-green-500 animate-pulse"
                                        : interviewStatus === "connecting"
                                            ? "bg-yellow-500 animate-pulse"
                                            : interviewStatus === "completed"
                                                ? "bg-blue-500"
                                                : "bg-gray-500"
                                    }`} />
                                {interviewStatus === "connected" && "Live"}
                                {interviewStatus === "connecting" && "Connecting"}
                                {interviewStatus === "completed" && "Completed"}
                                {interviewStatus === "disconnected" && "Ready"}
                                {interviewStatus === "paused" && "Paused"}
                            </div>

                            {capturedImages.length > 0 && (
                                <div className="text-sm text-gray-600">
                                    📷 {capturedImages.length} images captured
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Interview Interface */}
            <div className="flex-1 flex">
                {/* Left side - Video Feed and Monitoring */}
                <div className="flex-1 w-2/3 bg-white shadow-lg p-6 flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Interview Monitor</h2>

                    {/* Image Capture Component */}
                    <div className="flex-1">
                        <ImageCapture
                            interviewId={applicationId}
                            isActive={interviewStatus === "connected"}
                            onImageCaptured={handleImageCaptured}
                        />
                    </div>

                    {/* Monitoring Info */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Interview Monitoring</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Status:</span>
                                <span className="ml-2 capitalize">{interviewStatus}</span>
                            </div>
                            <div>
                                <span className="font-medium">Images Captured:</span>
                                <span className="ml-2">{capturedImages.length}</span>
                            </div>
                            <div>
                                <span className="font-medium">Application ID:</span>
                                <span className="ml-2 font-mono text-xs">{applicationId}</span>
                            </div>
                            <div>
                                <span className="font-medium">Recording:</span>
                                <span className="ml-2">
                                    {interviewStatus === "connected" ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Interview Completion Message */}
                    {interviewStatus === "completed" && redirectTimer !== null && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h3 className="text-green-800 font-medium mb-2">🎉 Interview Completed!</h3>
                            <p className="text-green-700 text-sm">
                                Thank you for completing the interview. You will be redirected to view your results in {redirectTimer} seconds.
                            </p>
                            <div className="mt-3">
                                <Button
                                    onClick={() => router.push(`/dashboard/application/${applicationId}/interview-result`)}
                                    className="bg-green-600 hover:bg-green-700"
                                    size="sm"
                                >
                                    View Results Now
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Recent captures preview */}
                    {capturedImages.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Captures</h3>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {capturedImages.slice(-3).map((imageUrl, index) => (
                                    <img
                                        key={index}
                                        src={imageUrl}
                                        alt={`Capture ${index + 1}`}
                                        className="w-16 h-12 object-cover rounded border border-gray-300 flex-shrink-0"
                                    />
                                ))}
                                {capturedImages.length > 3 && (
                                    <div className="w-16 h-12 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                                        +{capturedImages.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side - AI Interview Chat */}
                <div className="w-1/3 min-w-96 border-l border-gray-200">
                    <AIInterviewNew
                        applicationId={applicationId}
                        interviewId={applicationId}
                        onStatusChange={handleStatusChange}
                        onInterviewComplete={handleInterviewComplete}
                    />
                </div>
            </div>

            {/* Footer - Help and Support */}
            <footer className="bg-white border-t p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Having technical issues? Contact support for assistance.
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        {interviewStatus === "connected" && (
                            <span className="text-green-600 font-medium">
                                🔴 Interview in progress - Please do not refresh the page
                            </span>
                        )}
                        {interviewStatus === "completed" && (
                            <span className="text-blue-600 font-medium">
                                ✅ Interview completed successfully
                            </span>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}
