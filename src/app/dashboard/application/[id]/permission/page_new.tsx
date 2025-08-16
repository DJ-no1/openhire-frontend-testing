"use client";

import React, { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Camera,
    Mic,
    Monitor,
    ArrowLeft,
    Check,
    AlertCircle,
    Play,
    Shield,
    Loader2,
    CheckCircle2,
    X,
    RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface DeviceTestState {
    camera: 'idle' | 'testing' | 'success' | 'error';
    microphone: 'idle' | 'testing' | 'success' | 'error';
    screen: 'idle' | 'testing' | 'success' | 'error';
}

// Simple Audio Visualizer Component
function AudioVisualizer({ stream }: { stream: MediaStream | null }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!stream || !canvasRef.current) return;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 64;
        source.connect(analyser);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function draw() {
            if (!ctx) return;
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = canvas.width / dataArray.length - 1;
            for (let i = 0; i < dataArray.length; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
                const intensity = dataArray[i] / 255;
                ctx.fillStyle = `rgba(59, 130, 246, ${0.3 + intensity * 0.7})`;
                ctx.fillRect(i * (barWidth + 1), canvas.height - barHeight, barWidth, barHeight);
            }

            animationRef.current = requestAnimationFrame(draw);
        }

        draw();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            audioContext.close();
        };
    }, [stream]);

    return (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700">
            <canvas
                ref={canvasRef}
                width={300}
                height={60}
                className="w-full h-12 rounded"
            />
            <p className="text-xs text-gray-400 text-center mt-2">
                {stream ? "🎤 Audio detected - speak to see levels" : "No audio stream"}
            </p>
        </div>
    );
}

export default function PermissionPage() {
    const { id } = useParams();
    const router = useRouter();

    const [testStates, setTestStates] = useState<DeviceTestState>({
        camera: 'idle',
        microphone: 'idle',
        screen: 'idle'
    });

    const [streams, setStreams] = useState<{
        camera: MediaStream | null;
        microphone: MediaStream | null;
        screen: MediaStream | null;
    }>({
        camera: null,
        microphone: null,
        screen: null
    });

    const [isStartingInterview, setIsStartingInterview] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const screenVideoRef = useRef<HTMLVideoElement>(null);

    // Test Camera
    const testCamera = async () => {
        setTestStates(prev => ({ ...prev, camera: 'testing' }));

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setStreams(prev => ({ ...prev, camera: stream }));
            setTestStates(prev => ({ ...prev, camera: 'success' }));
            toast.success("Camera test successful!");

        } catch (error) {
            setTestStates(prev => ({ ...prev, camera: 'error' }));
            toast.error("Camera access denied. Please allow camera permissions.");
        }
    };

    // Test Microphone
    const testMicrophone = async () => {
        setTestStates(prev => ({ ...prev, microphone: 'testing' }));

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            setStreams(prev => ({ ...prev, microphone: stream }));
            setTestStates(prev => ({ ...prev, microphone: 'success' }));
            toast.success("Microphone test successful!");

        } catch (error) {
            setTestStates(prev => ({ ...prev, microphone: 'error' }));
            toast.error("Microphone access denied. Please allow microphone permissions.");
        }
    };

    // Test Screen Share
    const testScreenShare = async () => {
        setTestStates(prev => ({ ...prev, screen: 'testing' }));

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false
            });

            if (screenVideoRef.current) {
                screenVideoRef.current.srcObject = stream;
            }

            setStreams(prev => ({ ...prev, screen: stream }));
            setTestStates(prev => ({ ...prev, screen: 'success' }));
            toast.success("Screen share test successful!");

            // Auto-stop after 3 seconds for testing
            setTimeout(() => {
                stream.getTracks().forEach(track => track.stop());
                setStreams(prev => ({ ...prev, screen: null }));
                if (screenVideoRef.current) {
                    screenVideoRef.current.srcObject = null;
                }
            }, 3000);

        } catch (error) {
            setTestStates(prev => ({ ...prev, screen: 'error' }));
            toast.error("Screen sharing denied. Please allow screen sharing permissions.");
        }
    };

    // Stop all streams
    const stopAllStreams = () => {
        Object.values(streams).forEach(stream => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        });
        setStreams({ camera: null, microphone: null, screen: null });
    };

    // Check if all tests are successful
    const allTestsPassed = Object.values(testStates).every(state => state === 'success');

    // Start Interview
    const startInterview = async () => {
        if (!allTestsPassed) {
            toast.error("Please complete all device tests before starting the interview.");
            return;
        }

        setIsStartingInterview(true);

        try {
            // Stop test streams
            stopAllStreams();

            // Navigate to interview page
            router.push(`/dashboard/application/${id}/interview`);
        } catch (error) {
            console.error("Error starting interview:", error);
            toast.error("Failed to start interview. Please try again.");
            setIsStartingInterview(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAllStreams();
        };
    }, []);

    const getTestIcon = (state: 'idle' | 'testing' | 'success' | 'error') => {
        switch (state) {
            case 'testing':
                return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
            case 'success':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'error':
                return <X className="h-5 w-5 text-red-500" />;
            default:
                return <Play className="h-4 w-4" />;
        }
    };

    const getTestButtonText = (state: 'idle' | 'testing' | 'success' | 'error', device: string) => {
        switch (state) {
            case 'testing':
                return `Testing ${device}...`;
            case 'success':
                return `${device} Ready ✓`;
            case 'error':
                return `Retry ${device}`;
            default:
                return `Test ${device}`;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Device Setup
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Test your devices before starting the interview
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Progress Overview */}
                    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                                Setup Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-4">
                                    <Badge variant={testStates.camera === 'success' ? 'default' : 'secondary'}>
                                        Camera {testStates.camera === 'success' && '✓'}
                                    </Badge>
                                    <Badge variant={testStates.microphone === 'success' ? 'default' : 'secondary'}>
                                        Microphone {testStates.microphone === 'success' && '✓'}
                                    </Badge>
                                    <Badge variant={testStates.screen === 'success' ? 'default' : 'secondary'}>
                                        Screen Share {testStates.screen === 'success' && '✓'}
                                    </Badge>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {Object.values(testStates).filter(state => state === 'success').length}/3 Complete
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Camera Test */}
                        <Card className="h-fit">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Camera className="h-5 w-5 text-blue-600" />
                                    Camera Test
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    onClick={testCamera}
                                    disabled={testStates.camera === 'testing'}
                                    className="w-full"
                                    variant={testStates.camera === 'success' ? 'default' : 'outline'}
                                >
                                    {getTestIcon(testStates.camera)}
                                    {getTestButtonText(testStates.camera, 'Camera')}
                                </Button>

                                {streams.camera && (
                                    <div className="space-y-2">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-32 bg-gray-900 rounded-lg border"
                                        />
                                        <p className="text-xs text-green-600 dark:text-green-400 text-center">
                                            ✓ Camera is working properly
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Microphone Test */}
                        <Card className="h-fit">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Mic className="h-5 w-5 text-green-600" />
                                    Microphone Test
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    onClick={testMicrophone}
                                    disabled={testStates.microphone === 'testing'}
                                    className="w-full"
                                    variant={testStates.microphone === 'success' ? 'default' : 'outline'}
                                >
                                    {getTestIcon(testStates.microphone)}
                                    {getTestButtonText(testStates.microphone, 'Microphone')}
                                </Button>

                                {streams.microphone && (
                                    <div className="space-y-2">
                                        <AudioVisualizer stream={streams.microphone} />
                                        <p className="text-xs text-green-600 dark:text-green-400 text-center">
                                            ✓ Microphone is capturing audio
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Screen Share Test */}
                        <Card className="h-fit md:col-span-2 lg:col-span-1">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Monitor className="h-5 w-5 text-purple-600" />
                                    Screen Share Test
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    onClick={testScreenShare}
                                    disabled={testStates.screen === 'testing'}
                                    className="w-full"
                                    variant={testStates.screen === 'success' ? 'default' : 'outline'}
                                >
                                    {getTestIcon(testStates.screen)}
                                    {getTestButtonText(testStates.screen, 'Screen Share')}
                                </Button>

                                {streams.screen && (
                                    <div className="space-y-2">
                                        <video
                                            ref={screenVideoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-32 bg-gray-900 rounded-lg border"
                                        />
                                        <p className="text-xs text-green-600 dark:text-green-400 text-center">
                                            ✓ Screen sharing is working (will stop automatically)
                                        </p>
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Required for interview monitoring
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Start Interview Button */}
                    <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Ready to Start Interview?
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {allTestsPassed
                                            ? "All device tests completed successfully!"
                                            : "Please complete all device tests above before proceeding."
                                        }
                                    </p>
                                </div>

                                <Button
                                    onClick={startInterview}
                                    disabled={!allTestsPassed || isStartingInterview}
                                    size="lg"
                                    className="px-8 py-3 text-lg"
                                >
                                    {isStartingInterview ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Starting Interview...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-5 w-5 mr-2" />
                                            Start AI Interview
                                        </>
                                    )}
                                </Button>

                                {!allTestsPassed && (
                                    <p className="text-sm text-amber-600 dark:text-amber-400">
                                        <AlertCircle className="h-4 w-4 inline mr-1" />
                                        Complete all tests to proceed
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Important Notes */}
                    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                                <AlertCircle className="h-5 w-5" />
                                Important Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                            <p>• Ensure you're in a quiet environment with good lighting</p>
                            <p>• Keep your camera and microphone enabled during the interview</p>
                            <p>• Screen sharing will be required for monitoring purposes</p>
                            <p>• The interview will be recorded for evaluation</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
