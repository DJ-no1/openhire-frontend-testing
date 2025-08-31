"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, CameraOff, Settings, Maximize2 } from "lucide-react";
import { Button } from "./ui/button";

interface VideoFeedProps {
    applicationId: string;
    isInterviewActive: boolean;
    onVideoReady?: (isReady: boolean) => void;
    onImageCaptured?: (imageBlob: Blob) => void; // Changed to return Blob instead of URL
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
    onImageCaptured, // Changed prop name
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
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

                // Auto-play the video with proper promise handling
                try {
                    // Wait a moment for the element to fully initialize
                    await new Promise(resolve => setTimeout(resolve, 50));

                    // Ensure video is ready before playing
                    if (videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or higher
                        const playPromise = videoRef.current.play();
                        if (playPromise !== undefined) {
                            await playPromise;
                            console.log('✅ Video started playing');
                        }
                    } else {
                        // Wait for video to be ready, then play
                        const onCanPlay = () => {
                            if (videoRef.current) {
                                const playPromise = videoRef.current.play();
                                if (playPromise !== undefined) {
                                    playPromise.then(() => {
                                        console.log('✅ Video started playing (delayed)');
                                    }).catch((playError) => {
                                        console.warn('⚠️ Video autoplay failed (expected in some browsers):', playError.message);
                                    });
                                }
                                videoRef.current.removeEventListener('canplay', onCanPlay);
                            }
                        };
                        videoRef.current.addEventListener('canplay', onCanPlay);
                    }
                } catch (playError: any) {
                    console.warn('⚠️ Video autoplay failed (expected in some browsers):', playError.message);
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

    // Capture screenshot and return blob to parent - parent handles storage
    const captureScreenshot = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || isCapturing) {
            console.warn('⚠️ Cannot capture screenshot:', {
                hasVideo: !!videoRef.current,
                hasCanvas: !!canvasRef.current,
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

            // Convert canvas to blob and send to parent
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    console.error('❌ Failed to create blob from canvas');
                    return;
                }

                console.log('📸 Image captured, sending blob to parent (size:', blob.size, 'bytes)');

                setScreenshotCount(prev => prev + 1);
                onImageCaptured?.(blob); // Send blob to parent

            }, 'image/jpeg', 0.9);

        } catch (err) {
            console.error('❌ Error capturing screenshot:', err);
        } finally {
            setIsCapturing(false);
        }
    }, [isCapturing, onImageCaptured]);

    // Initialize camera and start capturing - simplified without database dependency
    useEffect(() => {
        console.log('🎥 Initializing video feed for application:', applicationId);

        // Small delay to prevent multiple components from initializing media simultaneously
        const initTimer = setTimeout(() => {
            initializeCamera();
        }, 150); // 150ms delay to let VideoInterviewSystem initialize first

        return () => {
            clearTimeout(initTimer);
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
        console.log('🎬 Auto-capture useEffect triggered:', {
            isInterviewActive,
            isVideoReady,
            hasExistingInterval: !!captureInterval
        });

        if (isInterviewActive && isVideoReady) {
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
                console.log('🧹 Cleaning up auto-capture interval');
                if (interval) {
                    clearInterval(interval);
                }
            };
        } else {
            // Stop auto-capture when interview is not active
            if (captureInterval) {
                console.log('🛑 Stopping auto-capture - conditions not met:', {
                    isInterviewActive,
                    isVideoReady
                });
                clearInterval(captureInterval);
                setCaptureInterval(null);
            }
        }
    }, [isInterviewActive, isVideoReady, captureScreenshot]); // Add captureScreenshot to dependencies

    // Manual screenshot capture
    const handleManualCapture = () => {
        captureScreenshot();
    };

    return (
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            {/* Video Element */}
            <video
                ref={videoRef}
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
