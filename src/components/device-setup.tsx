'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, Monitor, Check, X, RefreshCw, Play, Square } from 'lucide-react';

interface DeviceSetupProps {
    onSetupComplete?: (setupData: {
        cameraPermission: boolean;
        micPermission: boolean;
        setupPhoto?: string;
        deviceList: MediaDeviceInfo[];
    }) => void;
    autoCapture?: boolean;
}

const DeviceSetup: React.FC<DeviceSetupProps> = ({
    onSetupComplete,
    autoCapture = true
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
    const [micPermission, setMicPermission] = useState<boolean | null>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [micStream, setMicStream] = useState<MediaStream | null>(null);
    const [setupPhoto, setSetupPhoto] = useState<string | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const [selectedMic, setSelectedMic] = useState<string>('');
    const [isRecording, setIsRecording] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | undefined>(undefined);

    // Get available devices
    const getDevices = async () => {
        try {
            const deviceList = await navigator.mediaDevices.enumerateDevices();
            setDevices(deviceList);

            const videoDevices = deviceList.filter(d => d.kind === 'videoinput');
            const audioDevices = deviceList.filter(d => d.kind === 'audioinput');

            if (videoDevices.length > 0 && !selectedCamera) {
                setSelectedCamera(videoDevices[0].deviceId);
            }
            if (audioDevices.length > 0 && !selectedMic) {
                setSelectedMic(audioDevices[0].deviceId);
            }
        } catch (error) {
            console.error('Error getting devices:', error);
        }
    };

    // Test camera
    const testCamera = async () => {
        setIsLoading(true);
        try {
            // Stop existing stream
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }

            const constraints: MediaStreamConstraints = {
                video: selectedCamera
                    ? { deviceId: { exact: selectedCamera }, width: 640, height: 480 }
                    : { width: 640, height: 480 }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setCameraStream(stream);
            setCameraPermission(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            // Auto-capture setup photo after 2 seconds
            if (autoCapture) {
                setTimeout(() => {
                    captureSetupPhoto();
                }, 2000);
            }

        } catch (error) {
            console.error('Camera error:', error);
            setCameraPermission(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Test microphone
    const testMicrophone = async () => {
        setIsLoading(true);
        try {
            // Stop existing stream
            if (micStream) {
                micStream.getTracks().forEach(track => track.stop());
            }

            const constraints: MediaStreamConstraints = {
                audio: selectedMic
                    ? { deviceId: { exact: selectedMic } }
                    : true
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setMicStream(stream);
            setMicPermission(true);

            // Setup audio level monitoring
            setupAudioLevelMonitoring(stream);

        } catch (error) {
            console.error('Microphone error:', error);
            setMicPermission(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Setup audio level monitoring
    const setupAudioLevelMonitoring = (stream: MediaStream) => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);

            source.connect(analyser);
            analyser.fftSize = 256;

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateLevel = () => {
                if (analyserRef.current) {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                    setAudioLevel(average);
                    animationRef.current = requestAnimationFrame(updateLevel);
                }
            };

            updateLevel();
        } catch (error) {
            console.error('Audio monitoring error:', error);
        }
    };

    // Capture setup photo
    const captureSetupPhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setSetupPhoto(photoDataUrl);
    };

    // Test recording
    const testRecording = async () => {
        if (isRecording) {
            setIsRecording(false);
            return;
        }

        if (!micStream) {
            await testMicrophone();
            return;
        }

        setIsRecording(true);

        // Simulate recording for 3 seconds
        setTimeout(() => {
            setIsRecording(false);
        }, 3000);
    };

    // Complete setup
    const completeSetup = () => {
        if (onSetupComplete) {
            onSetupComplete({
                cameraPermission: cameraPermission === true,
                micPermission: micPermission === true,
                setupPhoto: setupPhoto || undefined,
                deviceList: devices
            });
        }
    };

    // Cleanup
    useEffect(() => {
        getDevices();

        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
            if (micStream) {
                micStream.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    const isSetupComplete = cameraPermission === true && micPermission === true && setupPhoto;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Device Setup</h2>
                <p className="text-gray-600">
                    Let's test your camera and microphone before starting the interview
                </p>
            </div>

            {/* Camera Setup */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                    <Camera className="w-6 h-6 mr-3 text-blue-600" />
                    <h3 className="text-lg font-semibold">Camera Test</h3>
                    {cameraPermission === true && <Check className="w-5 h-5 ml-auto text-green-500" />}
                    {cameraPermission === false && <X className="w-5 h-5 ml-auto text-red-500" />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Camera
                            </label>
                            <select
                                value={selectedCamera}
                                onChange={(e) => setSelectedCamera(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                disabled={isLoading}
                            >
                                {devices
                                    .filter(d => d.kind === 'videoinput')
                                    .map(device => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <button
                            onClick={testCamera}
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Camera className="w-4 h-4 mr-2" />
                            )}
                            Test Camera
                        </button>

                        {setupPhoto && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Setup Photo Captured</p>
                                <img
                                    src={setupPhoto}
                                    alt="Setup photo"
                                    className="w-full h-24 object-cover rounded border"
                                />
                            </div>
                        )}
                    </div>

                    <div className="bg-black rounded-lg overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-48 object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Microphone Setup */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                    <Mic className="w-6 h-6 mr-3 text-green-600" />
                    <h3 className="text-lg font-semibold">Microphone Test</h3>
                    {micPermission === true && <Check className="w-5 h-5 ml-auto text-green-500" />}
                    {micPermission === false && <X className="w-5 h-5 ml-auto text-red-500" />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Microphone
                            </label>
                            <select
                                value={selectedMic}
                                onChange={(e) => setSelectedMic(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                disabled={isLoading}
                            >
                                {devices
                                    .filter(d => d.kind === 'audioinput')
                                    .map(device => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={testMicrophone}
                                disabled={isLoading}
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Mic className="w-4 h-4 mr-2" />
                                )}
                                Test Microphone
                            </button>

                            <button
                                onClick={testRecording}
                                disabled={!micPermission}
                                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center"
                            >
                                {isRecording ? (
                                    <>
                                        <Square className="w-4 h-4 mr-2" />
                                        Stop Recording ({Math.floor((Date.now() % 3000) / 1000) + 1}s)
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Test Recording
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="text-center">
                            <div className="mb-2">
                                <span className="text-sm text-gray-600">Audio Level</span>
                            </div>
                            <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-400 to-red-500 transition-all duration-100"
                                    style={{ width: `${Math.min(audioLevel, 100)}%` }}
                                />
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                {audioLevel > 20 ? 'Good' : audioLevel > 5 ? 'Low' : 'Silent'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Setup Complete */}
            {isSetupComplete && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <Check className="w-6 h-6 mr-3 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-900">Setup Complete!</h3>
                    </div>
                    <p className="text-green-800 mb-4">
                        Your camera and microphone are working properly. You're ready to start the interview.
                    </p>
                    <button
                        onClick={completeSetup}
                        className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-medium"
                    >
                        Proceed to Interview
                    </button>
                </div>
            )}

            {/* System Info */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                    <Monitor className="w-5 h-5 mr-2 text-gray-600" />
                    <h4 className="font-medium text-gray-900">System Information</h4>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                    <p>Camera devices: {devices.filter(d => d.kind === 'videoinput').length}</p>
                    <p>Audio devices: {devices.filter(d => d.kind === 'audioinput').length}</p>
                    <p>WebRTC supported: {!!navigator.mediaDevices ? 'Yes' : 'No'}</p>
                </div>
            </div>

            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default DeviceSetup;
