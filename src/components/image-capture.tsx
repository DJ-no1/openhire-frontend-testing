// components/image-capture.tsx
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { supabase } from '@/lib/supabaseClient';

interface ImageCaptureProps {
    interviewId: string;
    isActive: boolean; // Whether interview is active and we should capture
    onImageCaptured?: (imageUrl: string) => void;
}

const ImageCapture = ({ interviewId, isActive, onImageCaptured }: ImageCaptureProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [captureInterval, setCaptureInterval] = useState<NodeJS.Timeout | null>(null);
    const [captureCount, setCaptureCount] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImageUrls, setCapturedImageUrls] = useState<string[]>([]); // Store URLs locally

    // Capture image from video stream
    const captureImage = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || !isActive) {
            return; // Silent skip - no logging for routine checks
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
            console.error('❌ Could not get 2D context from canvas');
            return;
        }

        // Check if video is ready
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            return; // Silent skip - video not ready yet
        }

        console.log(`� Capturing image... (${video.videoWidth}x${video.videoHeight})`);

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
                // Generate unique filename
                const timestamp = Date.now();
                const filename = `interview-${interviewId}-${timestamp}.jpg`;
                const filePath = `interviews/${interviewId}/${filename}`;

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
                const { data: urlData } = supabase.storage
                    .from('pictures')
                    .getPublicUrl(filePath);

                const imageUrl = urlData.publicUrl;

                // Store image URL locally - don't update database during interview
                setCapturedImageUrls(prev => [...prev, imageUrl]);

                // Notify parent component
                console.log('🔔 Notifying parent component with image URL:', imageUrl);
                onImageCaptured?.(imageUrl);

                setCaptureCount(prev => prev + 1);
                console.log(`✅ Image captured and stored locally: #${captureCount + 1}`);

            } catch (error) {
                console.error('❌ Error capturing/uploading image:', error);
            }
        }, 'image/jpeg', 0.8);
    }, [interviewId, isActive, onImageCaptured]);

    // Start/stop capture interval based on isActive
    useEffect(() => {
        if (isActive && !captureInterval) {
            setIsCapturing(true);
            const interval = setInterval(() => {
                captureImage();
            }, 10000); // Capture every 10 seconds
            setCaptureInterval(interval);
        } else if (!isActive && captureInterval) {
            setIsCapturing(false);
            clearInterval(captureInterval);
            setCaptureInterval(null);
        }

        return () => {
            if (captureInterval) {
                clearInterval(captureInterval);
            }
        };
    }, [isActive, captureInterval]); // Removed captureImage from dependencies

    // Initialize webcam when component mounts - ONLY ONCE
    useEffect(() => {
        let mounted = true;

        const initWebcam = async () => {
            try {
                console.log('📹 Starting webcam (one-time initialization)...');
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user'
                    }
                });

                if (mounted) {
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                        console.log('✅ Webcam stream attached to video element');
                    }
                }
            } catch (error) {
                console.error('❌ Error accessing webcam:', error);
                alert('Could not access camera. Please ensure camera permissions are granted.');
            }
        };

        initWebcam();

        return () => {
            mounted = false;
            // Cleanup when component unmounts
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []); // Empty dependency array - only run once on mount

    return (
        <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden relative">
            {/* Video element for webcam stream */}
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                onLoadedMetadata={() => {
                    console.log('📹 Video stream loaded, dimensions:',
                        videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
                }}
            />

            {/* Hidden canvas for image capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Capture indicator */}
            {isCapturing && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                    Recording • {captureCount}
                </div>
            )}

            {/* Stream status */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {stream ? '🟢 Live' : '🔴 No Stream'} • Interview Monitor
            </div>

            {/* Debug info */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {videoRef.current?.videoWidth ? `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}` : 'Loading...'}
            </div>
        </div>
    );
}

export default ImageCapture;
