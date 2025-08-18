"use client";

import React, { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
    RefreshCw,
    Settings
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
    const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
    const [videoKey, setVideoKey] = useState(0); // Force video element re-render when needed

    // Device lists
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
    const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);

    // Selected devices
    const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
    const [selectedAudioInputDevice, setSelectedAudioInputDevice] = useState<string>('');
    const [selectedAudioOutputDevice, setSelectedAudioOutputDevice] = useState<string>('');

    const videoRef = useRef<HTMLVideoElement>(null);
    const screenVideoRef = useRef<HTMLVideoElement>(null);

    // Enumerate available devices
    const enumerateDevices = async (showToast = false) => {
        try {
            // First, get basic device list to see what's available
            let devices = await navigator.mediaDevices.enumerateDevices();

            // If devices don't have labels, request permissions to get them
            const hasLabels = devices.some(device => device.label);
            if (!hasLabels) {
                console.log('Device labels not available, requesting permissions...');
                try {
                    // Request permissions to get device labels
                    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    // Immediately stop the temp stream
                    tempStream.getTracks().forEach(track => track.stop());

                    // Now get devices with labels
                    devices = await navigator.mediaDevices.enumerateDevices();
                } catch (permError) {
                    console.warn('Could not get device labels due to permissions:', permError);
                }
            }

            const videoInputs = devices.filter(device => device.kind === 'videoinput');
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            const audioOutputs = devices.filter(device => device.kind === 'audiooutput');

            console.log('Found devices:', { videoInputs, audioInputs, audioOutputs });

            setVideoDevices(videoInputs);
            setAudioInputDevices(audioInputs);
            setAudioOutputDevices(audioOutputs);

            // Set default devices if none selected or if selected device is no longer available
            if (!selectedVideoDevice || !videoInputs.find(d => d.deviceId === selectedVideoDevice)) {
                if (videoInputs.length > 0) {
                    console.log('Setting default video device:', videoInputs[0].deviceId);
                    setSelectedVideoDevice(videoInputs[0].deviceId);
                }
            }

            if (!selectedAudioInputDevice || !audioInputs.find(d => d.deviceId === selectedAudioInputDevice)) {
                if (audioInputs.length > 0) {
                    console.log('Setting default audio input device:', audioInputs[0].deviceId);
                    setSelectedAudioInputDevice(audioInputs[0].deviceId);
                }
            }

            if (!selectedAudioOutputDevice || !audioOutputs.find(d => d.deviceId === selectedAudioOutputDevice)) {
                if (audioOutputs.length > 0) {
                    console.log('Setting default audio output device:', audioOutputs[0].deviceId);
                    setSelectedAudioOutputDevice(audioOutputs[0].deviceId);
                }
            }

            // Only show success toast on manual refresh, not automatic enumeration
            if (showToast) {
                toast.success(`Found ${videoInputs.length} camera(s), ${audioInputs.length} microphone(s)`);
            }

        } catch (error) {
            console.error('Error enumerating devices:', error);
            // Only show error toast on manual refresh
            if (showToast) {
                toast.error('Unable to access devices. Please check permissions and try refreshing.');
            }
        }
    };

    // Load devices on component mount
    useEffect(() => {
        enumerateDevices();
    }, []);

    // Test Camera
    const testCamera = async () => {
        setTestStates(prev => ({ ...prev, camera: 'testing' }));

        try {
            // Stop any existing camera stream first
            if (streams.camera) {
                streams.camera.getTracks().forEach(track => track.stop());
            }

            // Clear everything first
            setStreams(prev => ({ ...prev, camera: null }));

            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }

            // Wait a bit for state to clear
            await new Promise(resolve => setTimeout(resolve, 200));

            const constraints: MediaStreamConstraints = {
                video: {
                    deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30 }
                }
            };

            console.log('Getting user media with constraints:', constraints);
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Got media stream:', stream);

            // Set state first to trigger the video element render
            setStreams(prev => ({ ...prev, camera: stream }));

            // Wait for React to render the video element
            await new Promise(resolve => setTimeout(resolve, 50));

            // Now set the stream to the video element
            if (videoRef.current) {
                console.log('Setting stream to video element');
                videoRef.current.srcObject = stream;

                // Force immediate play
                videoRef.current.muted = true;
                videoRef.current.playsInline = true;

                try {
                    await videoRef.current.play();
                    console.log('Video started playing successfully');
                } catch (playError) {
                    // Video play errors are common and usually not critical
                    console.warn('Video autoplay failed (this is normal in some browsers):', playError);
                }
            }
            setTestStates(prev => ({ ...prev, camera: 'success' }));
            toast.success("Camera test successful!");

        } catch (error) {
            setTestStates(prev => ({ ...prev, camera: 'error' }));

            // Handle different error types with appropriate logging levels
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    console.warn('Camera access denied by user:', error);
                    toast.error("Camera access denied. Please allow camera permissions in your browser.");
                } else if (error.name === 'NotFoundError') {
                    console.warn('Camera not found:', error);
                    toast.error("No camera found. Please connect a camera device or try selecting a different camera.");
                } else if (error.name === 'NotReadableError') {
                    // This is expected when camera is in use - use warn instead of error
                    console.warn('Camera is being used by another application:', error.message);
                    const selectedDeviceName = videoDevices.find(d => d.deviceId === selectedVideoDevice)?.label || 'Selected camera';
                    toast.error(`${selectedDeviceName} is currently in use. Please close other apps using this camera or select a different camera from Configure Devices.`);
                } else if (error.name === 'OverconstrainedError') {
                    console.warn('Camera constraints not supported:', error);
                    toast.error("Camera doesn't support the requested settings. Try selecting a different camera.");
                } else {
                    console.error('Unexpected camera error:', error);
                    toast.error(`Camera error: ${error.message}`);
                }
            } else {
                console.error('Unknown camera error:', error);
                toast.error("Camera access failed. Please try again or select a different camera.");
            }
        }
    };

    // Test Microphone
    const testMicrophone = async () => {
        setTestStates(prev => ({ ...prev, microphone: 'testing' }));

        try {
            // Stop any existing microphone stream first
            if (streams.microphone) {
                streams.microphone.getTracks().forEach(track => track.stop());
            }

            setStreams(prev => ({ ...prev, microphone: null }));
            await new Promise(resolve => setTimeout(resolve, 100));

            let constraints: MediaStreamConstraints;
            let stream: MediaStream;

            if (selectedAudioInputDevice) {
                // Try exact device first, then fallback
                try {
                    constraints = {
                        audio: {
                            deviceId: { exact: selectedAudioInputDevice }
                        }
                    };
                    stream = await navigator.mediaDevices.getUserMedia(constraints);
                } catch (exactError) {
                    console.warn('Exact microphone device failed, trying ideal:', exactError);
                    constraints = {
                        audio: {
                            deviceId: { ideal: selectedAudioInputDevice }
                        }
                    };
                    stream = await navigator.mediaDevices.getUserMedia(constraints);
                }
            } else {
                constraints = { audio: true };
                stream = await navigator.mediaDevices.getUserMedia(constraints);
            }

            setStreams(prev => ({ ...prev, microphone: stream }));
            setTestStates(prev => ({ ...prev, microphone: 'success' }));
            toast.success("Microphone test successful!");

        } catch (error) {
            setTestStates(prev => ({ ...prev, microphone: 'error' }));

            // Handle different microphone error types with appropriate logging
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    console.warn('Microphone access denied by user:', error);
                    toast.error("Microphone access denied. Please allow microphone permissions.");
                } else if (error.name === 'NotFoundError') {
                    console.warn('Microphone not found:', error);
                    toast.error("No microphone found or selected microphone unavailable. Try selecting a different microphone.");
                } else if (error.name === 'NotReadableError') {
                    console.warn('Microphone is being used by another application:', error.message);
                    toast.error("Microphone is currently in use by another application. Please close other apps or select a different microphone.");
                } else {
                    console.error('Unexpected microphone error:', error);
                    toast.error(`Microphone error: ${error.message}`);
                }
            } else {
                console.error('Unknown microphone error:', error);
                toast.error("Microphone access failed. Please try again.");
            }
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
            console.warn('Screen sharing denied or failed:', error);
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

            // Prepare device configuration to pass to interview page
            const deviceConfig = new URLSearchParams();

            if (selectedVideoDevice) {
                deviceConfig.set('videoDevice', selectedVideoDevice);

                // Also pass the device label for display purposes
                const videoDevice = videoDevices.find(d => d.deviceId === selectedVideoDevice);
                if (videoDevice?.label) {
                    deviceConfig.set('videoDeviceLabel', videoDevice.label);
                }
            }

            if (selectedAudioInputDevice) {
                deviceConfig.set('audioInputDevice', selectedAudioInputDevice);

                // Also pass the device label for display purposes
                const audioDevice = audioInputDevices.find(d => d.deviceId === selectedAudioInputDevice);
                if (audioDevice?.label) {
                    deviceConfig.set('audioInputDeviceLabel', audioDevice.label);
                }
            }

            if (selectedAudioOutputDevice) {
                deviceConfig.set('audioOutputDevice', selectedAudioOutputDevice);

                // Also pass the device label for display purposes
                const outputDevice = audioOutputDevices.find(d => d.deviceId === selectedAudioOutputDevice);
                if (outputDevice?.label) {
                    deviceConfig.set('audioOutputDeviceLabel', outputDevice.label);
                }
            }

            // Navigate to interview page with device configuration
            const interviewUrl = `/dashboard/application/${id}/interview${deviceConfig.toString() ? `?${deviceConfig.toString()}` : ''}`;
            console.log('Starting interview with device config:', interviewUrl);
            router.push(interviewUrl);

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

    // Re-test devices when device selection changes
    useEffect(() => {
        // Stop current streams and reset test states if device changes
        if (streams.camera && selectedVideoDevice) {
            console.log('Video device changed, stopping current stream');
            streams.camera.getTracks().forEach(track => track.stop());
            setStreams(prev => ({ ...prev, camera: null }));
            setTestStates(prev => ({ ...prev, camera: 'idle' }));

            // Clear video element
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    }, [selectedVideoDevice]);

    useEffect(() => {
        if (streams.microphone && selectedAudioInputDevice) {
            console.log('Audio device changed, stopping current stream');
            streams.microphone.getTracks().forEach(track => track.stop());
            setStreams(prev => ({ ...prev, microphone: null }));
            setTestStates(prev => ({ ...prev, microphone: 'idle' }));
        }
    }, [selectedAudioInputDevice]);

    // Listen for device changes (when devices are plugged/unplugged)
    useEffect(() => {
        const handleDeviceChange = () => {
            console.log('Device change detected, re-enumerating...');
            enumerateDevices();
        };

        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
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

    // Helper to get device display name
    const getDeviceDisplayName = (device: MediaDeviceInfo, fallbackPrefix: string) => {
        if (device.label) {
            return device.label;
        }
        return `${fallbackPrefix} ${device.deviceId.slice(0, 8)}...`;
    };

    // Helper to check if a device is currently in use
    const isDeviceInUse = (deviceId: string, kind: 'videoinput' | 'audioinput') => {
        if (kind === 'videoinput') {
            return streams.camera &&
                streams.camera.getVideoTracks().some(track =>
                    track.getSettings().deviceId === deviceId
                );
        } else {
            return streams.microphone &&
                streams.microphone.getAudioTracks().some(track =>
                    track.getSettings().deviceId === deviceId
                );
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
                                <div className="flex items-center gap-2">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {Object.values(testStates).filter(state => state === 'success').length}/3 Complete
                                    </div>
                                    <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                Configure Devices
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <Settings className="h-5 w-5" />
                                                    Device Configuration
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-6 py-4">
                                                {/* Camera Selection */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="camera-select" className="text-sm font-medium">
                                                        Camera
                                                    </Label>
                                                    <Select value={selectedVideoDevice} onValueChange={setSelectedVideoDevice}>
                                                        <SelectTrigger id="camera-select" className="w-full">
                                                            <SelectValue placeholder="Select camera" className="truncate" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {videoDevices.length === 0 ? (
                                                                <SelectItem value="" disabled>
                                                                    No cameras found
                                                                </SelectItem>
                                                            ) : (
                                                                videoDevices.map((device) => (
                                                                    <SelectItem key={device.deviceId} value={device.deviceId}>
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <div className="truncate max-w-[250px]" title={getDeviceDisplayName(device, 'Camera')}>
                                                                                {getDeviceDisplayName(device, 'Camera')}
                                                                            </div>
                                                                            {isDeviceInUse(device.deviceId, 'videoinput') && (
                                                                                <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                                                                    ● Active
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Microphone Selection */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="mic-select" className="text-sm font-medium">
                                                        Microphone
                                                    </Label>
                                                    <Select value={selectedAudioInputDevice} onValueChange={setSelectedAudioInputDevice}>
                                                        <SelectTrigger id="mic-select" className="w-full">
                                                            <SelectValue placeholder="Select microphone" className="truncate" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {audioInputDevices.length === 0 ? (
                                                                <SelectItem value="" disabled>
                                                                    No microphones found
                                                                </SelectItem>
                                                            ) : (
                                                                audioInputDevices.map((device) => (
                                                                    <SelectItem key={device.deviceId} value={device.deviceId}>
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <div className="truncate max-w-[250px]" title={getDeviceDisplayName(device, 'Microphone')}>
                                                                                {getDeviceDisplayName(device, 'Microphone')}
                                                                            </div>
                                                                            {isDeviceInUse(device.deviceId, 'audioinput') && (
                                                                                <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                                                                    ● Active
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Speaker Selection */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="speaker-select" className="text-sm font-medium">
                                                        Speakers
                                                    </Label>
                                                    <Select value={selectedAudioOutputDevice} onValueChange={setSelectedAudioOutputDevice}>
                                                        <SelectTrigger id="speaker-select" className="w-full">
                                                            <SelectValue placeholder="Select speakers" className="truncate" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {audioOutputDevices.length === 0 ? (
                                                                <SelectItem value="" disabled>
                                                                    No speakers found
                                                                </SelectItem>
                                                            ) : (
                                                                audioOutputDevices.map((device) => (
                                                                    <SelectItem key={device.deviceId} value={device.deviceId}>
                                                                        <div className="truncate max-w-[250px]" title={getDeviceDisplayName(device, 'Speaker')}>
                                                                            {getDeviceDisplayName(device, 'Speaker')}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <Separator />

                                                <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={async () => {
                                                            toast.loading('Refreshing devices...', { id: 'refresh' });
                                                            try {
                                                                await enumerateDevices(true); // This will show its own success toast
                                                                toast.dismiss('refresh'); // Dismiss loading toast
                                                            } catch (error) {
                                                                toast.error('Failed to refresh devices. Please check permissions.', { id: 'refresh' });
                                                            }
                                                        }}
                                                        className="flex items-center gap-2 justify-center"
                                                    >
                                                        <RefreshCw className="h-4 w-4" />
                                                        Refresh Devices
                                                    </Button>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={async () => {
                                                                // Force re-test all devices with current selections
                                                                if (selectedVideoDevice && testStates.camera === 'success') {
                                                                    await testCamera();
                                                                }
                                                                if (selectedAudioInputDevice && testStates.microphone === 'success') {
                                                                    await testMicrophone();
                                                                }
                                                            }}
                                                            className="text-xs"
                                                        >
                                                            Re-test All
                                                        </Button>
                                                        <Button
                                                            onClick={() => setIsConfigDialogOpen(false)}
                                                            size="sm"
                                                            className="flex-shrink-0"
                                                        >
                                                            Done
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                                    <p>• Device changes will apply to new tests</p>
                                                    <p>• If you don't see your device, try refreshing</p>
                                                    <p>• Camera in use? Select a different one from the list</p>
                                                    <p>• Close other applications using cameras/microphones for best results</p>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
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
                                {selectedVideoDevice && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <div className="truncate">
                                            {videoDevices.find(d => d.deviceId === selectedVideoDevice) ?
                                                getDeviceDisplayName(videoDevices.find(d => d.deviceId === selectedVideoDevice)!, 'Camera') :
                                                'Selected device'
                                            }
                                        </div>
                                        {streams.camera && (
                                            <div className="text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                                Currently active
                                            </div>
                                        )}
                                        {videoDevices.length > 1 && !streams.camera && (
                                            <div className="text-blue-600 dark:text-blue-400 mt-1">
                                                {videoDevices.length - 1} other camera(s) available - use Configure Devices if this one is busy
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Button
                                        onClick={testCamera}
                                        disabled={testStates.camera === 'testing'}
                                        className="flex-1"
                                        variant={testStates.camera === 'success' ? 'default' : 'outline'}
                                    >
                                        {getTestIcon(testStates.camera)}
                                        {getTestButtonText(testStates.camera, 'Camera')}
                                    </Button>

                                    {streams.camera && testStates.camera === 'success' && (
                                        <Button
                                            onClick={() => {
                                                if (streams.camera) {
                                                    streams.camera.getTracks().forEach(track => track.stop());
                                                    setStreams(prev => ({ ...prev, camera: null }));
                                                    setTestStates(prev => ({ ...prev, camera: 'idle' }));
                                                    if (videoRef.current) {
                                                        videoRef.current.srcObject = null;
                                                    }
                                                }
                                            }}
                                            variant="outline"
                                            size="sm"
                                            className="px-3"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                {streams.camera && (
                                    <div className="space-y-2">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            controls={false}
                                            className="w-full h-32 bg-gray-900 rounded-lg border"
                                            style={{
                                                objectFit: 'cover',
                                                transform: 'scaleX(-1)' // Mirror the video like most camera apps
                                            }}
                                        />
                                        <p className="text-xs text-green-600 dark:text-green-400 text-center">
                                            ✓ Camera is working properly
                                        </p>
                                    </div>
                                )}

                                {/* {testStates.camera === 'testing' && (
                                    <div className="flex items-center justify-center h-32 bg-gray-900 rounded-lg border">
                                        <div className="flex items-center gap-2 text-white">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Initializing camera...</span>
                                        </div>
                                    </div>
                                )} */}
                            </CardContent>
                        </Card>

                        {/* Microphone Test */}
                        <Card className="h-fit">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Mic className="h-5 w-5 text-green-600" />
                                    Microphone Test
                                </CardTitle>
                                {selectedAudioInputDevice && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <div className="truncate">
                                            {audioInputDevices.find(d => d.deviceId === selectedAudioInputDevice) ?
                                                getDeviceDisplayName(audioInputDevices.find(d => d.deviceId === selectedAudioInputDevice)!, 'Microphone') :
                                                'Selected device'
                                            }
                                        </div>
                                        {audioInputDevices.length > 1 && (
                                            <div className="text-blue-600 dark:text-blue-400 mt-1">
                                                {audioInputDevices.length - 1} other microphone(s) available
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Button
                                        onClick={testMicrophone}
                                        disabled={testStates.microphone === 'testing'}
                                        className="flex-1"
                                        variant={testStates.microphone === 'success' ? 'default' : 'outline'}
                                    >
                                        {getTestIcon(testStates.microphone)}
                                        {getTestButtonText(testStates.microphone, 'Microphone')}
                                    </Button>

                                    {streams.microphone && testStates.microphone === 'success' && (
                                        <Button
                                            onClick={() => {
                                                if (streams.microphone) {
                                                    streams.microphone.getTracks().forEach(track => track.stop());
                                                    setStreams(prev => ({ ...prev, microphone: null }));
                                                    setTestStates(prev => ({ ...prev, microphone: 'idle' }));
                                                }
                                            }}
                                            variant="outline"
                                            size="sm"
                                            className="px-3"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

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
                                            ? "All device tests completed successfully! Starting interview will use your tested devices."
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
