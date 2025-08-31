"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Video, VideoOff, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import VideoFeed from "@/components/video-feed";
import VideoInterviewSystem, { VideoInterviewSystemRef } from "@/components/video-interview-system";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from '@/contexts/AuthContext';
import { useAuthLoading } from '@/hooks/useAuthLoading';
import { InterviewSkeleton } from '@/components/ui/page-skeleton';

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
    const { user } = useAuth();
    const { isLoading: authLoading } = useAuthLoading();

    if (authLoading) {
        return <InterviewSkeleton />;
    }

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

    // Monitor captured images state changes for debugging
    useEffect(() => {
        // Only log in development mode or when specifically debugging
        if (process.env.NODE_ENV === 'development') {
            console.log('Captured images count:', capturedImages.length);
        }
    }, [capturedImages]);

    // Periodic state monitor during interview (development only)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development' && interviewStatus === "connected") {
            const monitor = setInterval(() => {
                console.log('Interview status check - images count:', capturedImages.length);
            }, 30000); // Every 30 seconds, less frequent

            return () => clearInterval(monitor);
        }
    }, [interviewStatus, capturedImages]);

    // Debug function for testing image storage (development only)
    

    // Handle status changes from AIInterview component
    const handleStatusChange = async (status: InterviewStatus) => {
        setInterviewStatus(status);
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
            console.log('Interview status changed to:', status);
        }
    };

    // Handle end interview action - ONLY handles navigation and cleanup
    const handleEndInterview = async () => {
        // Prevent multiple calls
        if (isEndingInProgress) {
            if (process.env.NODE_ENV === 'development') {
                console.log('End interview already in progress, ignoring...');
            }
            return;
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('Parent handling end interview - navigation and cleanup only');
        }

        // Set flags to prevent multiple calls and beforeunload popup
        setIsEndingInProgress(true);
        setIsEndingIntentionally(true);

        // Mark interview as ended
        setInterviewStatus("completed");
        toast.info("Interview ended by user");

        // Store captured images after ending
        setTimeout(() => {
            setCapturedImages(currentImages => {
                if (process.env.NODE_ENV === 'development') {
                    console.log('Storing images on user end:', currentImages.length);
                }
                storeImagesInInterviewArtifact(currentImages);
                return currentImages;
            });
        }, 1000);

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
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
            console.log('Interview completed! Backend should handle data persistence.');
            console.log('Final Assessment received');
            console.log('Conversation messages:', conversation.length);
            console.log('Captured images count:', capturedImages.length);
        }

        // Mark interview as completed
        setInterviewStatus("completed");
        toast.success("Interview completed successfully!");

        // Wait a moment to ensure all images are captured and backend processes interview
        console.log('⏳ Waiting for backend to create interview artifacts and final image captures...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Give backend time to create artifacts

        // Get the most current state by using a callback
        setCapturedImages(currentImages => {
            if (process.env.NODE_ENV === 'development') {
                console.log('Final captured images count after wait:', currentImages.length);
            }

            // Store captured images using the simplified approach
            storeImagesInInterviewArtifact(currentImages);

            return currentImages; // Don't change the state
        });

        // Start countdown timer for redirect
        let countdown = 5; // Reduced since images are stored immediately
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

    // Handle image capture - receives blob from VideoFeed and handles all storage
    const handleImageCaptured = useCallback(async (imageBlob: Blob) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Image blob received, size:', imageBlob.size, 'bytes');
        }

        try {
            // Generate unique filename
            const timestamp = Date.now();
            const filename = `interview-${applicationId}-${timestamp}.jpg`;
            const filePath = `interviews/${applicationId}/${filename}`;

            // Upload to Supabase storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('pictures')
                .upload(filePath, imageBlob, {
                    contentType: 'image/jpeg',
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                return;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('pictures')
                .getPublicUrl(filePath);

            if (process.env.NODE_ENV === 'development') {
                console.log('Image uploaded successfully:', publicUrl);
            }

            // Add to captured images state
            setCapturedImages(prev => {
                const newImages = [...prev, publicUrl];
                if (process.env.NODE_ENV === 'development') {
                    console.log('Updated captured images count:', newImages.length);
                }
                return newImages;
            });

        } catch (error) {
            console.error('Error handling image capture:', error);
        }
    }, []); // Empty dependencies to prevent re-creation

    // Handle video ready state
    const handleVideoReady = (isReady: boolean) => {
        setIsVideoReady(isReady);
        if (process.env.NODE_ENV === 'development') {
            console.log('Video feed ready:', isReady);
        }
    };

    // Handle AI question received for video overlay
    const handleQuestionReceived = (question: string, isAISpeaking: boolean) => {
        setAiSpeakingState(isAISpeaking);
        // Only log in development mode if needed for debugging
        if (process.env.NODE_ENV === 'development' && isAISpeaking !== aiSpeakingState) {
            console.log('AI speaking state changed:', isAISpeaking);
        }
    };

    // Simplified approach: Store images directly in interview_artifacts table
    const storeImagesInInterviewArtifact = async (imagesToStore: string[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`SIMPLIFIED APPROACH: Called with ${imagesToStore.length} images`);
        }

        if (imagesToStore.length === 0) {
            if (process.env.NODE_ENV === 'development') {
                console.log('No images to store - array is empty');
            }
            return;
        }

        try {
            if (process.env.NODE_ENV === 'development') {
                console.log('Step 1: Getting interview_artifact_id from applications table...');
                console.log('Application ID:', applicationId);
            }

            // Step 1: Get interview_artifact_id from applications table (backend puts it there after interview)
            const { data: applicationData, error: applicationError } = await supabase
                .from('applications')
                .select('interview_artifact_id')
                .eq('id', applicationId)
                .single();

            if (process.env.NODE_ENV === 'development') {
                console.log('Applications query result:', { data: applicationData, error: applicationError });
            }

            if (applicationError) {
                console.error('Database error fetching application:', applicationError);
                if (process.env.NODE_ENV === 'development') {
                    console.log('Backend might still be processing, trying again in 5 seconds...');
                }

                // Try once more after a delay (give backend more time)
                setTimeout(() => {
                    storeImagesInInterviewArtifact(imagesToStore);
                }, 5000);
                return;
            }

            if (!applicationData?.interview_artifact_id) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('interview_artifact_id not found yet, backend still processing...');
                    console.log('Retrying in 5 seconds...');
                }

                setTimeout(() => {
                    storeImagesInInterviewArtifact(imagesToStore);
                }, 5000);
                return;
            }

            // Parse the comma-separated artifact IDs and get the latest one
            const artifactIdsString = applicationData.interview_artifact_id.trim();
            if (process.env.NODE_ENV === 'development') {
                console.log('Raw interview_artifact_id string:', artifactIdsString);
            }

            const artifactIds = artifactIdsString.split(',').map((id: string) => id.trim());
            const latestArtifactId = artifactIds[artifactIds.length - 1]; // Get the last/latest one

            if (process.env.NODE_ENV === 'development') {
                console.log('All artifact IDs:', artifactIds);
                console.log('Using latest artifact ID:', latestArtifactId);
            }

            // Step 2: Update interview_artifacts table with image URLs
            const imageUrls = imagesToStore.join(',');
            if (process.env.NODE_ENV === 'development') {
                console.log('Step 2: Updating interview_artifacts with image URLs');
            }

            const { data: updateData, error: updateError } = await supabase
                .from('interview_artifacts')
                .update({ image_url: imageUrls })
                .eq('id', latestArtifactId)
                .select();

            if (updateError) {
                console.error('Error updating interview_artifacts with images:', updateError);
            } else {
                if (process.env.NODE_ENV === 'development') {
                    console.log('SUCCESS: Images stored in interview_artifacts!', updateData);
                }
                toast.success(`${imagesToStore.length} images saved to interview record!`);
            }

        } catch (error) {
            console.error('Exception in storeImagesInInterviewArtifact:', error);
        }
    };

    // Store interview images with proper artifact ID lookup (proper trigger)
    const storeInterviewImagesWithProperArtifactId = async (imagesToStore?: string[]) => {
        // Use passed images or current state, but get fresh state if none passed
        const imageList = imagesToStore || capturedImages;

        if (process.env.NODE_ENV === 'development') {
            console.log('storeInterviewImagesWithProperArtifactId called with:', {
                passedImages: imagesToStore ? imagesToStore.length : 'none',
                currentStateImages: capturedImages.length,
                imageListToUse: imageList.length
            });
        }

        if (imageList.length === 0) {
            if (process.env.NODE_ENV === 'development') {
                console.log('No images to store');
            }
            return;
        }

        try {
            if (process.env.NODE_ENV === 'development') {
                console.log(`Storing ${imageList.length} interview images with proper artifact ID lookup`);
            }

            // Follow correct DB relationship: applications → interviews → interview_artifacts
            // Step 1: Get the latest interview for this application
            const { data: interviews, error: interviewError } = await supabase
                .from('interviews')
                .select('id')
                .eq('application_id', applicationId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (interviewError) {
                console.error('Error fetching interview:', interviewError);
                await storeInterviewImages(imageList);
                return;
            }

            if (!interviews?.id) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('No interview found for application, using fallback storage');
                }
                await storeInterviewImages(imageList);
                return;
            }

            // Step 2: Get the latest interview artifact for this interview
            const { data: interviewArtifacts, error: fetchError } = await supabase
                .from('interview_artifacts')
                .select('id')
                .eq('interview_id', interviews.id)
                .order('timestamp', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (fetchError) {
                console.error('Error fetching interview artifact:', fetchError);
                await storeInterviewImages(imageList);
                return;
            }

            if (!interviewArtifacts?.id) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('No interview artifact found, using fallback storage');
                }
                await storeInterviewImages(imageList);
                return;
            }

            const artifactId = interviewArtifacts.id;
            if (process.env.NODE_ENV === 'development') {
                console.log('Found interview artifact ID:', artifactId);
            }

            // Store images with proper artifact relationship
            const imageData = imageList.map((imageUrl, index) => ({
                interview_artifact_id: artifactId,
                application_id: applicationId,
                image_url: imageUrl,
                captured_at: new Date().toISOString(),
                image_sequence: index + 1,
                image_type: 'interview_capture'
            }));

            const { error: insertError } = await supabase
                .from('interview_images')
                .insert(imageData);

            if (insertError) {
                console.error('Error storing interview images with artifact ID:', insertError);
                // Try fallback
                await storeInterviewImages(imageList);
            } else {
                if (process.env.NODE_ENV === 'development') {
                    console.log('Interview images stored successfully with artifact ID');
                }

                // Update interview_artifacts table with image URLs
                const imageUrls = imageList.join(',');
                if (process.env.NODE_ENV === 'development') {
                    console.log('Updating interview_artifacts with image URLs');
                }

                const { data: updateData, error: updateError } = await supabase
                    .from('interview_artifacts')
                    .update({
                        image_url: imageUrls,
                        timestamp: new Date().toISOString()
                    })
                    .eq('id', artifactId)
                    .select();

                if (updateError) {
                    console.error('Error updating interview_artifacts with image URLs:', updateError);
                } else if (process.env.NODE_ENV === 'development') {
                    console.log('Interview artifact updated with image URLs:', updateData);
                }
            }

        } catch (error) {
            console.error('Exception storing interview images with artifact ID:', error);
            // Fallback to basic storage
            await storeInterviewImages(imageList);
        }
    };

    // Store interview images (fallback - simplified)
    const storeInterviewImages = async (imagesToStore?: string[]) => {
        // Use passed images or current state
        const imageList = imagesToStore || capturedImages;

        if (imageList.length === 0) {
            if (process.env.NODE_ENV === 'development') {
                console.log('No images to store');
            }
            return;
        }

        try {
            if (process.env.NODE_ENV === 'development') {
                console.log(`Attempting to store ${imageList.length} interview images for application: ${applicationId}`);
            }

            // Simply try to store images in a basic interview_images table
            // The backend should handle the complex interview artifact logic
            const imageData = imageList.map((imageUrl, index) => ({
                application_id: applicationId,
                image_url: imageUrl,
                captured_at: new Date().toISOString(),
                image_sequence: index + 1
            }));

            const { error: insertError } = await supabase
                .from('interview_images')
                .insert(imageData);

            if (insertError) {
                console.error('Error storing interview images:', insertError);
                // Don't show error to user - backend should handle this
                if (process.env.NODE_ENV === 'development') {
                    console.log('Backend will process interview data');
                }
            } else if (process.env.NODE_ENV === 'development') {
                console.log('Interview images stored successfully');
            }

        } catch (error) {
            console.error('Exception storing interview images:', error);
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
                        onImageCaptured={handleImageCaptured}
                        aiSpeakingState={aiSpeakingState}
                        selectedVideoDevice={selectedVideoDevice}
                        selectedAudioDevice={selectedAudioInputDevice}
                    />

                    {/* End Interview Button Overlay */}
                    {(interviewStatus === "connected" || interviewStatus === "connecting") && !isEndingInProgress && (
                        <div className="absolute bottom-8 left-19 z-50 flex gap-2">
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
