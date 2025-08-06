'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { createClient } from '@supabase/supabase-js';

interface LiveVideoProps {
    interviewId: string;
    role: 'candidate' | 'recruiter';
    userId: string;
    onConnectionStatusChange?: (status: string) => void;
    captureImages?: boolean;
    captureInterval?: number; // in minutes
}

interface CapturedImage {
    id: string;
    timestamp: string;
    dataUrl: string;
    uploaded: boolean;
}

const LiveVideoV2: React.FC<LiveVideoProps> = ({
    interviewId,
    role,
    userId,
    onConnectionStatusChange,
    captureImages = true,
    captureInterval = 2
}) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const captureCanvasRef = useRef<HTMLCanvasElement>(null);
    const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [isConnected, setIsConnected] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
    const [error, setError] = useState<string | null>(null);
    const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
    const [imageCount, setImageCount] = useState(0);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // WebRTC Configuration with multiple STUN servers
    const rtcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun.relay.metered.ca:80' }
        ]
    };

    const updateConnectionStatus = useCallback((status: string) => {
        setConnectionStatus(status);
        onConnectionStatusChange?.(status);
        console.log(`Connection status updated: ${status}`);
    }, [onConnectionStatusChange]);

    // Image capture functionality
    const captureImage = useCallback(async () => {
        if (!localVideoRef.current || !captureCanvasRef.current || role !== 'candidate') return;

        const video = localVideoRef.current;
        const canvas = captureCanvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Draw current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        const capturedImage: CapturedImage = {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            dataUrl,
            uploaded: false
        };

        setCapturedImages(prev => [...prev, capturedImage]);
        setImageCount(prev => prev + 1);

        // Upload to Supabase Storage
        try {
            const blob = await fetch(dataUrl).then(r => r.blob());
            const fileName = `interview_${interviewId}_${capturedImage.id}.jpg`;

            setUploadProgress(prev => ({ ...prev, [capturedImage.id]: 0 }));

            const { data, error } = await supabase.storage
                .from('pictures')
                .upload(fileName, blob, {
                    contentType: 'image/jpeg',
                    cacheControl: '3600',
                });

            if (error) {
                console.error('Error uploading image:', error);
                return;
            }

            setUploadProgress(prev => ({ ...prev, [capturedImage.id]: 100 }));

            // Update image status
            setCapturedImages(prev =>
                prev.map(img =>
                    img.id === capturedImage.id
                        ? { ...img, uploaded: true }
                        : img
                )
            );

            // Save metadata to database
            await supabase.from('interview_artifacts').insert({
                interview_id: interviewId,
                image_url: data.path,
                timestamp: capturedImage.timestamp,
                status: 'captured'
            });

            console.log('Image captured and uploaded successfully:', fileName);

        } catch (uploadError) {
            console.error('Error during image upload:', uploadError);
        }
    }, [interviewId, role, supabase]);

    // Start automatic image capture
    const startImageCapture = useCallback(() => {
        if (role !== 'candidate' || !captureImages) return;

        if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current);
        }

        captureIntervalRef.current = setInterval(() => {
            captureImage();
        }, captureInterval * 60 * 1000); // Convert minutes to milliseconds

        console.log(`Image capture started: every ${captureInterval} minutes`);
    }, [captureImage, captureImages, captureInterval, role]);

    // Stop automatic image capture
    const stopImageCapture = useCallback(() => {
        if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current);
            captureIntervalRef.current = null;
        }
        console.log('Image capture stopped');
    }, []);

    useEffect(() => {
        initializeConnection();
        return cleanup;
    }, [interviewId, role, userId]);

    const initializeConnection = async () => {
        try {
            socketRef.current = io('ws://localhost:3001', {
                transports: ['websocket'],
                autoConnect: true
            });

            socketRef.current.on('connect', () => {
                setIsConnected(true);
                updateConnectionStatus('connected');

                if (role === 'candidate') {
                    socketRef.current?.emit('join-interview-candidate', {
                        interviewId,
                        candidateId: userId
                    });
                    initializeCandidateStream();
                } else {
                    socketRef.current?.emit('join-interview-recruiter', {
                        interviewId,
                        recruiterId: userId
                    });
                }
            });

            socketRef.current.on('disconnect', () => {
                setIsConnected(false);
                updateConnectionStatus('disconnected');
                stopImageCapture();
            });

            // WebRTC signaling events
            socketRef.current.on('recruiter-wants-to-watch', handleRecruiterWantsToWatch);
            socketRef.current.on('candidate-available', handleCandidateAvailable);
            socketRef.current.on('webrtc-offer', handleWebRTCOffer);
            socketRef.current.on('webrtc-answer', handleWebRTCAnswer);
            socketRef.current.on('webrtc-ice-candidate', handleWebRTCIceCandidate);

            socketRef.current.on('candidate-joined', () => {
                updateConnectionStatus('candidate-joined');
            });

            socketRef.current.on('candidate-left', () => {
                updateConnectionStatus('candidate-left');
                stopImageCapture();
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = null;
                }
            });

            socketRef.current.on('interview-not-found', () => {
                setError('Interview session not found');
                updateConnectionStatus('error');
            });

        } catch (error) {
            console.error('Error initializing connection:', error);
            setError('Failed to connect to server');
        }
    };

    const initializeCandidateStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            localStreamRef.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            setIsStreaming(true);
            updateConnectionStatus('streaming');

            // Start image capture once streaming begins
            startImageCapture();

        } catch (error) {
            console.error('Error accessing camera:', error);
            setError('Unable to access camera or microphone. Please check permissions.');
        }
    };

    const createPeerConnection = (): RTCPeerConnection => {
        const peerConnection = new RTCPeerConnection(rtcConfig);

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current?.emit('webrtc-ice-candidate', {
                    interviewId,
                    candidate: event.candidate
                });
            }
        };

        peerConnection.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
                updateConnectionStatus('video-connected');
            }
        };

        peerConnection.onconnectionstatechange = () => {
            console.log('Peer connection state:', peerConnection.connectionState);
            if (peerConnection.connectionState === 'connected') {
                updateConnectionStatus('peer-connected');
            } else if (peerConnection.connectionState === 'disconnected') {
                updateConnectionStatus('peer-disconnected');
                stopImageCapture();
            } else if (peerConnection.connectionState === 'failed') {
                updateConnectionStatus('connection-failed');
                setError('Connection failed. Please try refreshing the page.');
            }
        };

        peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', peerConnection.iceConnectionState);
        };

        return peerConnection;
    };

    const handleRecruiterWantsToWatch = async () => {
        if (role === 'candidate' && localStreamRef.current) {
            try {
                peerConnectionRef.current = createPeerConnection();

                localStreamRef.current.getTracks().forEach(track => {
                    peerConnectionRef.current?.addTrack(track, localStreamRef.current!);
                });

                const offer = await peerConnectionRef.current.createOffer();
                await peerConnectionRef.current.setLocalDescription(offer);

                socketRef.current?.emit('webrtc-offer', {
                    interviewId,
                    offer
                });

                updateConnectionStatus('creating-offer');
            } catch (error) {
                console.error('Error creating offer:', error);
                setError('Failed to establish video connection');
            }
        }
    };

    const handleCandidateAvailable = async () => {
        if (role === 'recruiter') {
            updateConnectionStatus('candidate-ready');
        }
    };

    const handleWebRTCOffer = async (data: { offer: RTCSessionDescriptionInit }) => {
        if (role === 'recruiter') {
            try {
                peerConnectionRef.current = createPeerConnection();

                await peerConnectionRef.current.setRemoteDescription(data.offer);
                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);

                socketRef.current?.emit('webrtc-answer', {
                    interviewId,
                    answer
                });

                updateConnectionStatus('sending-answer');
            } catch (error) {
                console.error('Error handling offer:', error);
                setError('Failed to process video connection');
            }
        }
    };

    const handleWebRTCAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {
        if (role === 'candidate' && peerConnectionRef.current) {
            try {
                await peerConnectionRef.current.setRemoteDescription(data.answer);
                updateConnectionStatus('answer-received');
            } catch (error) {
                console.error('Error handling answer:', error);
            }
        }
    };

    const handleWebRTCIceCandidate = async (data: { candidate: RTCIceCandidate }) => {
        if (peerConnectionRef.current) {
            try {
                await peerConnectionRef.current.addIceCandidate(data.candidate);
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        }
    };

    const cleanup = () => {
        stopImageCapture();
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        peerConnectionRef.current?.close();
        socketRef.current?.disconnect();
    };

    const getStatusColor = (status: string) => {
        if (status.includes('connected') || status === 'streaming') return 'text-green-500';
        if (status.includes('disconnected') || status === 'candidate-left') return 'text-red-500';
        if (status.includes('error') || status.includes('failed')) return 'text-red-600';
        return 'text-yellow-500';
    };

    const downloadCapturedImages = () => {
        capturedImages.forEach((image, index) => {
            const link = document.createElement('a');
            link.download = `interview_${interviewId}_image_${index + 1}.jpg`;
            link.href = image.dataUrl;
            link.click();
        });
    };

    const clearCapturedImages = () => {
        setCapturedImages([]);
        setImageCount(0);
        setUploadProgress({});
    };

    return (
        <div className="live-video-container w-full max-w-6xl mx-auto p-4">
            {/* Status Bar */}
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                        <span className={`font-medium ${getStatusColor(connectionStatus)}`}>
                            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                        </span>
                        <span className="text-sm text-gray-600">
                            Status: {connectionStatus.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}
                        </span>
                    </div>

                    {role === 'candidate' && isStreaming && (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                            🔴 LIVE
                        </span>
                    )}
                </div>

                {/* Image Capture Status */}
                {role === 'candidate' && captureImages && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                            Images captured: {imageCount} | Interval: {captureInterval} min
                        </span>
                        <div className="flex space-x-2">
                            <button
                                onClick={captureImage}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                                Capture Now
                            </button>
                            {imageCount > 0 && (
                                <>
                                    <button
                                        onClick={downloadCapturedImages}
                                        className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                    >
                                        Download All
                                    </button>
                                    <button
                                        onClick={clearCapturedImages}
                                        className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                    >
                                        Clear
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <div className="flex items-center">
                        <span className="mr-2">⚠️</span>
                        {error}
                    </div>
                </div>
            )}

            {/* Video Container */}
            <div className="video-container bg-black rounded-lg overflow-hidden mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                    {/* Candidate's local video */}
                    {role === 'candidate' && (
                        <div className="relative">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-64 md:h-80 object-cover rounded bg-gray-800"
                            />
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                                You (Candidate)
                            </div>
                            {isStreaming && (
                                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs animate-pulse">
                                    LIVE
                                </div>
                            )}
                            {captureImages && (
                                <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                                    📸 Auto-capture ON
                                </div>
                            )}
                        </div>
                    )}

                    {/* Remote video for recruiter */}
                    {role === 'recruiter' && (
                        <div className="relative col-span-full">
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-64 md:h-96 object-cover rounded bg-gray-800"
                            />
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                                Candidate
                            </div>
                            {connectionStatus === 'video-connected' && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                                    LIVE STREAM
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Captured Images Preview (Candidate only) */}
            {role === 'candidate' && capturedImages.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-lg font-semibold mb-3">Captured Images ({capturedImages.length})</h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                        {capturedImages.slice(-12).map((image) => (
                            <div key={image.id} className="relative group">
                                <img
                                    src={image.dataUrl}
                                    alt={`Captured at ${image.timestamp}`}
                                    className="w-full h-16 object-cover rounded border"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded flex items-center justify-center">
                                    <span className="text-white text-xs opacity-0 group-hover:opacity-100">
                                        {image.uploaded ? '✓' : uploadProgress[image.id] !== undefined ? `${uploadProgress[image.id]}%` : '⏳'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Connection Messages */}
            {role === 'recruiter' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">
                        {connectionStatus === 'candidate-ready'
                            ? 'Candidate is ready. Video will connect automatically.'
                            : connectionStatus === 'candidate-left'
                                ? 'Candidate has left the interview.'
                                : connectionStatus === 'video-connected'
                                    ? 'Live video connection established. You are watching the candidate in real-time.'
                                    : 'Waiting for candidate to join...'}
                    </p>
                </div>
            )}

            {/* Hidden canvas for image capture */}
            <canvas
                ref={captureCanvasRef}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default LiveVideoV2;
