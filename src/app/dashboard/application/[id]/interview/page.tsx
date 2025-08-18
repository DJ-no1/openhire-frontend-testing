"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Video, VideoOff, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import VideoFeed from "@/components/video-feed";
import VideoInterviewSystem, { VideoInterviewSystemRef } from "@/components/video-interview-system";
import { supabase } from "@/lib/supabaseClient";

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
    const searchParams = useSearchParams();

    // Extract device configuration from URL parameters
    const selectedVideoDevice = searchParams.get('videoDevice');
    const selectedAudioInputDevice = searchParams.get('audioInputDevice');
    const selectedAudioOutputDevice = searchParams.get('audioOutputDevice');
    const videoDeviceLabel = searchParams.get('videoDeviceLabel');
    const audioInputDeviceLabel = searchParams.get('audioInputDeviceLabel');
    const audioOutputDeviceLabel = searchParams.get('audioOutputDeviceLabel');

    // Log the received device configuration
    useEffect(() => {
        if (selectedVideoDevice || selectedAudioInputDevice) {
            console.log('📹 Interview starting with selected devices:', {
                video: { id: selectedVideoDevice, label: videoDeviceLabel },
                audioInput: { id: selectedAudioInputDevice, label: audioInputDeviceLabel },
                audioOutput: { id: selectedAudioOutputDevice, label: audioOutputDeviceLabel }
            });

            // Show toast with selected devices
            const deviceMessages = [];
            if (videoDeviceLabel) deviceMessages.push(`📹 ${videoDeviceLabel}`);
            if (audioInputDeviceLabel) deviceMessages.push(`🎤 ${audioInputDeviceLabel}`);

            if (deviceMessages.length > 0) {
                toast.success(`Using selected devices: ${deviceMessages.join(', ')}`);
            }
        }
    }, [selectedVideoDevice, selectedAudioInputDevice, videoDeviceLabel, audioInputDeviceLabel]);

    // Create ref for VideoInterviewSystem
    const videoInterviewRef = useRef<VideoInterviewSystemRef>(null);

    const [interviewStatus, setInterviewStatus] = useState<InterviewStatus>("disconnected");
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [redirectTimer, setRedirectTimer] = useState<number | null>(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [aiSpeakingState, setAiSpeakingState] = useState(false);
    const [isEndingIntentionally, setIsEndingIntentionally] = useState<boolean>(false);
    const [isEndingInProgress, setIsEndingInProgress] = useState<boolean>(false);

    // Use application ID as interview ID
    const applicationId = id as string;

    // Handle status changes from AIInterview component
    const handleStatusChange = async (status: InterviewStatus) => {
        setInterviewStatus(status);
        console.log('📊 Interview status changed to:', status);
    };

    // Handle end interview action - ONLY handles navigation and cleanup
    const handleEndInterview = async () => {
        // Prevent multiple calls
        if (isEndingInProgress) {
            console.log('🛑 End interview already in progress, ignoring...');
            return;
        }

        console.log('🛑 Parent handling end interview - navigation and cleanup only');

        // Set flags to prevent multiple calls and beforeunload popup
        setIsEndingInProgress(true);
        setIsEndingIntentionally(true);

        // Mark interview as ended
        setInterviewStatus("completed");
        toast.info("Interview ended by user");

        // Store captured images after ending
        setTimeout(() => {
            storeInterviewImages();
        }, 1000);

        // Navigate to interview results page after a short delay
        setTimeout(() => {
            router.push(`/dashboard/application/${id}/interview-result`);
        }, 2000);
    };

    // Button click handler - calls component first, then parent
    const handleEndInterviewClick = async () => {
        // First, call the component to send "end" message
        if (videoInterviewRef.current) {
            videoInterviewRef.current.endInterview();
        }

        // Then handle navigation and cleanup
        await handleEndInterview();
    };

    // Handle interview completion
    const handleInterviewComplete = async (finalAssessment: FinalAssessment, conversation: any[]) => {
        console.log('🎉 Interview completed! Backend should handle data persistence.');
        console.log('📊 Final Assessment:', finalAssessment);
        console.log('💬 Conversation:', conversation.length, 'messages');

        // Mark interview as completed
        setInterviewStatus("completed");
        toast.success("Interview completed successfully!");

        // Store captured images in interview artifacts - with polling for backend processing
        setTimeout(() => {
            storeInterviewImages();
        }, 2000); // Give backend more time to create and update interview artifacts

        // Start countdown timer for redirect
        let countdown = 10; // Extended time for backend processing
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

    // Handle video ready state
    const handleVideoReady = (isReady: boolean) => {
        setIsVideoReady(isReady);
        console.log('📹 Video feed ready:', isReady);
    };

    // Handle AI question received for video overlay
    const handleQuestionReceived = (question: string, isAISpeaking: boolean) => {
        setAiSpeakingState(isAISpeaking);
        console.log('🎤 AI speaking state:', isAISpeaking);
    };

    // Store interview images (simplified - let backend handle complex logic)
    const storeInterviewImages = async () => {
        if (capturedImages.length === 0) {
            console.log('📷 No images to store');
            return;
        }

        try {
            console.log(`📤 Attempting to store ${capturedImages.length} interview images for application: ${applicationId}`);

            // Simply try to store images in a basic interview_images table
            // The backend should handle the complex interview artifact logic
            const imageData = capturedImages.map((imageUrl, index) => ({
                application_id: applicationId,
                image_url: imageUrl,
                captured_at: new Date().toISOString(),
                image_sequence: index + 1
            }));

            const { error: insertError } = await supabase
                .from('interview_images')
                .insert(imageData);

            if (insertError) {
                console.error('❌ Error storing interview images:', insertError);
                // Don't show error to user - backend should handle this
                console.log('⏳ Backend will process interview data');
            } else {
                console.log('✅ Interview images stored successfully');
            }

        } catch (error) {
            console.error('❌ Exception storing interview images:', error);
            // Don't show error to user - this is not critical for the interview flow
        }
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
            if ((interviewStatus === "connected" || interviewStatus === "connecting") && !isEndingIntentionally) {
                e.preventDefault();
                e.returnValue = "Are you sure you want to leave the interview? Your progress will be lost.";
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [interviewStatus, isEndingIntentionally]);

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white shadow-sm border-b flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                    </div>
                </div>
            </header>

            {/* Main Interview Interface */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
                {/* Left side - Video Feed */}
                <div className="flex-1 bg-black p-4 relative">
                    <VideoFeed
                        applicationId={applicationId}
                        isInterviewActive={interviewStatus === "connected"}
                        onVideoReady={handleVideoReady}
                        onScreenshotCaptured={handleImageCaptured}
                        aiSpeakingState={aiSpeakingState}
                        selectedVideoDevice={selectedVideoDevice}
                        selectedAudioDevice={selectedAudioInputDevice}
                    />

                    {/* End Interview Button Overlay */}
                    {(interviewStatus === "connected" || interviewStatus === "connecting") && !isEndingInProgress && (
                        <div className="absolute top-8 left-8 z-50">
                            <Button
                                onClick={handleEndInterviewClick}
                                disabled={isEndingInProgress}
                                variant="destructive"
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white shadow-lg backdrop-blur-sm bg-opacity-90 border-0 disabled:opacity-50"
                            >
                                <Square className="w-4 h-4 mr-2" />
                                {isEndingInProgress ? "Ending..." : "End Interview"}
                            </Button>
                        </div>
                    )}

                    {/* Processing indicator when interview is completed */}
                    {interviewStatus === "completed" && redirectTimer !== null && redirectTimer > 5 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                            <div className="bg-white p-6 rounded-lg shadow-xl border max-w-md">
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <h3 className="text-lg font-semibold mb-2">Processing Interview Data</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Backend is creating interview artifacts and processing your responses.
                                        Please wait while we finalize your interview data.
                                    </p>
                                    <div className="text-blue-600 font-medium">
                                        Redirecting in {redirectTimer}s
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side - AI Interview Chat */}
                <div className="w-125 border-l border-gray-200 bg-white flex flex-col min-h-0">
                    <VideoInterviewSystem
                        ref={videoInterviewRef}
                        applicationId={applicationId}
                        interviewId={applicationId}
                        onStatusChange={handleStatusChange}
                        onInterviewComplete={handleInterviewComplete}
                        onQuestionReceived={handleQuestionReceived}
                        onEndInterview={handleEndInterview}
                        autoStart={true}
                        selectedAudioDevice={selectedAudioInputDevice}
                    />
                </div>
            </div>

            {/* Footer - Professional Status Bar */}
            <footer className="bg-gray-900 text-white p-3 flex-shrink-0">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            <span>Video: {isVideoReady ? "Ready" : "Loading..."}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${interviewStatus === "connected" ? "bg-green-400 animate-pulse" :
                                interviewStatus === "connecting" ? "bg-yellow-400 animate-pulse" :
                                    interviewStatus === "completed" ? "bg-blue-400" : "bg-gray-400"
                                }`} />
                            <span>Status: {interviewStatus}</span>
                        </div>
                        {capturedImages.length > 0 && (
                            <div className="text-gray-300">
                                📷 {capturedImages.length} screenshots saved
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        {interviewStatus === "connected" && (
                            <span className="text-red-400 font-medium animate-pulse">
                                🔴 LIVE INTERVIEW
                            </span>
                        )}
                        {interviewStatus === "completed" && (
                            <div className="flex items-center gap-2">
                                <span className="text-green-400">✅ Interview Complete</span>
                                {redirectTimer !== null && (
                                    <span className="text-gray-300">
                                        Redirecting in {redirectTimer}s
                                    </span>
                                )}
                            </div>
                        )}
                        <div className="text-gray-400">
                            Application: {applicationId.slice(0, 8)}...
                        </div>
                    </div>
                </div>

                {/* Interview Completion Overlay */}
                {interviewStatus === "completed" && redirectTimer !== null && (
                    <div className="mt-2 p-3 bg-green-800/50 rounded border border-green-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-green-100 font-medium mb-1">🎉 Interview Completed Successfully!</h3>
                                <p className="text-green-200 text-sm">
                                    Thank you for your time. Your responses have been recorded and will be reviewed.
                                </p>
                            </div>
                            <Button
                                onClick={() => router.push(`/dashboard/application/${applicationId}/interview-result`)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                size="sm"
                            >
                                View Results Now
                            </Button>
                        </div>
                    </div>
                )}
            </footer>
        </div>
    );
}
