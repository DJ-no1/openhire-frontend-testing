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
    selectedVideoDevice?: string | null; // Selected camera device ID
    selectedAudioDevice?: string | null; // Selected audio device ID (for future use)
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
    aiSpeakingState = false,
    selectedVideoDevice = null,
    selectedAudioDevice = null
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

    // Fetch interview data (backend should create it)
    const fetchInterviewData = useCallback(async () => {
        try {
            console.log('🔍 Waiting for backend to create interview for application:', applicationId);

            // Simply wait for backend to create interview - don't create it ourselves
            let { data: interviewData, error: interviewError } = await supabase
                .from('interviews')
                .select('id')
                .eq('application_id', applicationId)
                .eq('status', 'in_progress')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (interviewError && interviewError.code !== 'PGRST116') {
                console.error('❌ Error fetching interview data:', interviewError);
                // Don't show error immediately - backend might be creating it
                console.log('⏳ Retrying in a moment...');
                return;
            }

            if (interviewData?.id) {
                setInterviewArtifactId(interviewData.id);
                console.log('✅ Found interview ID:', interviewData.id);
                setError(''); // Clear any previous errors
            } else {
                console.log('⏳ No interview found yet, backend may still be creating it...');
                // Don't set error - this is expected while backend processes
            }
        } catch (err) {
            console.error('❌ Exception fetching interview data:', err);
            console.log('⏳ Will retry fetching interview data...');
        }
    }, [applicationId]);

    // Initialize camera with better error handling
    const initializeCamera = useCallback(async () => {
        console.log('🎥 Initializing camera...');

        // Log if we have a selected video device
        if (selectedVideoDevice) {
            console.log('🎯 Using selected video device:', selectedVideoDevice);
        }

        try {
            // Check if getUserMedia is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia is not supported in this browser');
            }

            const constraints: MediaStreamConstraints = {
                video: selectedVideoDevice ? {
                    deviceId: { exact: selectedVideoDevice },
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 }
                } : {
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 },
                    facingMode: 'user'
                },
                audio: false // We'll handle audio separately in the interview component
            };

            console.log('🎥 Requesting camera access with constraints:', constraints);
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

            console.log('🎥 Camera access granted, setting up video element');
            setStream(mediaStream);
            setError(''); // Clear any previous errors

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;

                // Add multiple event handlers for better reliability
                videoRef.current.onloadedmetadata = () => {
                    console.log('✅ Video metadata loaded');
                    setIsVideoReady(true);
                    onVideoReady?.(true);
                };

                videoRef.current.oncanplay = () => {
                    console.log('✅ Video can start playing');
                };

                videoRef.current.onerror = (e) => {
                    console.error('❌ Video element error:', e);
                    setError('Video playback error');
                    onVideoReady?.(false);
                };

                // Auto-play the video
                try {
                    await videoRef.current.play();
                    console.log('✅ Video started playing');
                } catch (playError) {
                    console.error('❌ Video play error:', playError);
                    // Video might still work for capture even if autoplay fails
                }
            } else {
                console.error('❌ Video ref is null');
                setError('Video element not available');
                onVideoReady?.(false);
            }
        } catch (err: any) {
            console.error('❌ Error initializing camera:', err);

            let errorMessage = 'Failed to access camera';
            if (err.name === 'NotAllowedError') {
                errorMessage = 'Camera access denied. Please allow camera permissions and refresh.';
            } else if (err.name === 'NotFoundError') {
                errorMessage = 'No camera found. Please connect a camera and refresh.';
            } else if (err.name === 'NotSupportedError') {
                errorMessage = 'Camera not supported by this browser.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            onVideoReady?.(false);
        }
    }, [onVideoReady, selectedVideoDevice]);

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

        const video = videoRef.current;

        // Check if video is actually playing
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.warn('⚠️ Video not ready for capture (no dimensions)');
            return;
        }

        setIsCapturing(true);

        try {
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

    // Initialize camera and setup auto-capture with retry for interview data
    useEffect(() => {
        const initializeWithRetry = async () => {
            // Try to fetch interview data with retry
            const maxRetries = 10; // Try for ~20 seconds
            let retryCount = 0;

            const tryFetchInterview = async () => {
                await fetchInterviewData();

                // If we still don't have an interview ID, retry
                if (!interviewArtifactId && retryCount < maxRetries) {
                    retryCount++;
                    console.log(`🔄 Retrying to fetch interview data (${retryCount}/${maxRetries})`);
                    setTimeout(tryFetchInterview, 2000); // Retry every 2 seconds
                } else if (!interviewArtifactId) {
                    console.warn('⚠️ Could not find interview data after retries - backend may still be processing');
                }
            };

            await tryFetchInterview();
        };

        initializeWithRetry();
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
    }, [isInterviewActive, isVideoReady, interviewArtifactId]);

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
