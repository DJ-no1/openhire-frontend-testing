"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, CameraOff, Settings, Maximize2 } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from '@/lib/supabaseClient';

interface VideoFeedProps {
    applicationId: string;
    isInterviewActive: boolean;
    onVideoReady?: (isReady: boolean) => void;
    onScreenshotCaptured?: (imageUrl: string) => void;
    aiSpeakingState?: boolean; // For overlay animations
}

interface ApplicationData {
    id: string;
    interview_artifact_id: string;
}

const VideoFeed = ({
    applicationId,
    isInterviewActive,
    onVideoReady,
    onScreenshotCaptured,
    aiSpeakingState = false
}: VideoFeedProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // State
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [captureInterval, setCaptureInterval] = useState<NodeJS.Timeout | null>(null);
    const [screenshotCount, setScreenshotCount] = useState(0);
    const [interviewArtifactId, setInterviewArtifactId] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch interview ID from applications table, then get interview artifacts
    const fetchInterviewData = useCallback(async () => {
        try {
            console.log('🔍 Fetching interview data for application:', applicationId);

            // First, look up the interview from the interviews table using application_id
            const { data: interviewData, error: interviewError } = await supabase
                .from('interviews')
                .select('id')
                .eq('application_id', applicationId)
                .single();

            if (interviewError) {
                console.error('❌ Error fetching interview data:', interviewError);
                setError('Failed to fetch interview data');
                return;
            }

            if (interviewData?.id) {
                setInterviewArtifactId(interviewData.id);
                console.log('✅ Found interview ID:', interviewData.id);
            } else {
                console.warn('⚠️ No interview found for application');
                setError('No interview found for this application');
            }
        } catch (err) {
            console.error('❌ Exception fetching interview data:', err);
            setError('Failed to fetch interview data');
        }
    }, [applicationId]);

    // Initialize camera
    const initializeCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false // We'll handle audio separately in the interview component
            });

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    setIsVideoReady(true);
                    onVideoReady?.(true);
                    console.log('✅ Video feed initialized');
                };
            }
        } catch (err) {
            console.error('❌ Error initializing camera:', err);
            setError('Failed to access camera');
            onVideoReady?.(false);
        }
    }, [onVideoReady]);

    // Capture screenshot and save to Supabase
    const captureScreenshot = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || !interviewArtifactId || isCapturing) {
            console.warn('⚠️ Cannot capture screenshot:', {
                hasVideo: !!videoRef.current,
                hasCanvas: !!canvasRef.current,
                hasArtifactId: !!interviewArtifactId,
                isCapturing
            });
            return;
        }

        setIsCapturing(true);

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (!context) {
                console.error('❌ Cannot get canvas context');
                return;
            }

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw current video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas to blob
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    console.error('❌ Failed to create blob from canvas');
                    return;
                }

                try {
                    // Generate unique filename using interview artifact ID
                    const timestamp = Date.now();
                    const filename = `interview-${interviewArtifactId}-${timestamp}.jpg`;
                    const filePath = `interviews/${interviewArtifactId}/${filename}`;

                    console.log('📤 Uploading screenshot:', filePath);

                    // Upload to Supabase storage
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('pictures')
                        .upload(filePath, blob, {
                            contentType: 'image/jpeg',
                            upsert: false
                        });

                    if (uploadError) {
                        console.error('❌ Upload error:', uploadError);
                        return;
                    }

                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('pictures')
                        .getPublicUrl(filePath);

                    console.log('✅ Screenshot uploaded successfully:', publicUrl);

                    setScreenshotCount(prev => prev + 1);
                    onScreenshotCaptured?.(publicUrl);

                } catch (uploadErr) {
                    console.error('❌ Error during upload:', uploadErr);
                }
            }, 'image/jpeg', 0.9);

        } catch (err) {
            console.error('❌ Error capturing screenshot:', err);
        } finally {
            setIsCapturing(false);
        }
    }, [interviewArtifactId, isCapturing, onScreenshotCaptured]);

    // Initialize camera and setup auto-capture
    useEffect(() => {
        fetchInterviewData();
        initializeCamera();

        return () => {
            // Cleanup
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (captureInterval) {
                clearInterval(captureInterval);
            }
        };
    }, []);

    // Setup auto-capture when interview is active
    useEffect(() => {
        if (isInterviewActive && isVideoReady && interviewArtifactId) {
            console.log('🎬 Setting up auto-capture every 10 seconds');

            // Clear any existing interval
            if (captureInterval) {
                clearInterval(captureInterval);
            }

            // Start auto-capture every 10 seconds
            const interval = setInterval(() => {
                console.log('📸 Auto-capturing screenshot...');
                captureScreenshot();
            }, 10000); // 10 seconds

            setCaptureInterval(interval);

            return () => {
                if (interval) {
                    clearInterval(interval);
                }
            };
        } else {
            // Stop auto-capture when interview is not active
            if (captureInterval) {
                console.log('🛑 Stopping auto-capture');
                clearInterval(captureInterval);
                setCaptureInterval(null);
            }
        }
    }, [isInterviewActive, isVideoReady, interviewArtifactId, captureInterval, captureScreenshot]);

    // Manual screenshot capture
    const handleManualCapture = () => {
        captureScreenshot();
    };

    return (
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            {/* Video Element */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
            />

            {/* Hidden canvas for screenshots */}
            <canvas ref={canvasRef} className="hidden" />

            {/* AI Speaking Overlay */}
            {aiSpeakingState && (
                <div className="absolute top-4 left-4 z-10">
                    <div className="bg-blue-500/90 text-white px-3 py-2 rounded-lg flex items-center gap-2 animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-sm font-medium">AI Speaking...</span>
                    </div>
                </div>
            )}

            {/* Status Overlay */}
            <div className="absolute top-4 right-4 z-10">
                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${isInterviewActive
                    ? "bg-red-500/90 text-white"
                    : "bg-gray-500/90 text-white"
                    }`}>
                    {isInterviewActive ? (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                Interview Recording
                            </div>
                        </>
                    ) : (
                        "Interview Ready"
                    )}
                </div>
            </div>

            {/* Auto-capture indicator */}
            {isInterviewActive && screenshotCount > 0 && (
                <div className="absolute bottom-4 right-4 z-10">
                    <div className="bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
                        📷 {screenshotCount} screenshots
                    </div>
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                    <div className="bg-red-500/90 text-white p-6 rounded-lg max-w-md text-center">
                        <CameraOff className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-lg font-bold mb-2">Camera Error</h3>
                        <p className="text-sm mb-4">{error}</p>
                        <Button
                            onClick={() => {
                                setError(null);
                                initializeCamera();
                            }}
                            variant="secondary"
                            size="sm"
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleManualCapture}
                    disabled={!isVideoReady || isCapturing}
                    className="bg-black/50 hover:bg-black/70 text-white border-0"
                >
                    <Camera className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export default VideoFeed;
