'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DeviceSetup from '@/components/device-setup';
import LiveVideoV2 from '@/components/live-video-v2';
import { Video, Settings, Users, Camera } from 'lucide-react';

interface SetupData {
    cameraPermission: boolean;
    micPermission: boolean;
    setupPhoto?: string;
    deviceList: MediaDeviceInfo[];
}

const ComprehensiveVideoTestPage = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<'setup' | 'configure' | 'testing'>('setup');
    const [setupData, setSetupData] = useState<SetupData | null>(null);
    const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
    const [interviewId, setInterviewId] = useState('comprehensive-test-001');
    const [userId, setUserId] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('');
    const [captureEnabled, setCaptureEnabled] = useState(true);
    const [captureInterval, setCaptureInterval] = useState(2);

    // Generate random user ID on component mount
    useEffect(() => {
        const randomUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
        setUserId(randomUserId);
    }, []);

    const handleSetupComplete = (data: SetupData) => {
        setSetupData(data);
        setCurrentStep('configure');
    };

    const handleStartTesting = () => {
        setCurrentStep('testing');
    };

    const handleBackToSetup = () => {
        setCurrentStep('setup');
        setSetupData(null);
    };

    const handleBackToConfigure = () => {
        setCurrentStep('configure');
    };

    const copyTestLink = () => {
        const currentUrl = window.location.href;
        const params = new URLSearchParams({
            step: 'testing',
            role: role === 'candidate' ? 'recruiter' : 'candidate',
            interviewId,
            userId: `user_${Math.random().toString(36).substr(2, 9)}`,
            capture: captureEnabled.toString(),
            interval: captureInterval.toString()
        });
        const shareUrl = `${currentUrl.split('?')[0]}?${params.toString()}`;

        navigator.clipboard.writeText(shareUrl).then(() => {
            alert(`Link copied! Open this in another tab/window to test the ${role === 'candidate' ? 'recruiter' : 'candidate'} view:\n\n${shareUrl}`);
        });
    };

    // Parse URL parameters on page load
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlStep = urlParams.get('step') as 'setup' | 'configure' | 'testing';
        const urlRole = urlParams.get('role') as 'candidate' | 'recruiter';
        const urlInterviewId = urlParams.get('interviewId');
        const urlUserId = urlParams.get('userId');
        const urlCapture = urlParams.get('capture');
        const urlInterval = urlParams.get('interval');

        if (urlStep) setCurrentStep(urlStep);
        if (urlRole) setRole(urlRole);
        if (urlInterviewId) setInterviewId(urlInterviewId);
        if (urlUserId) setUserId(urlUserId);
        if (urlCapture) setCaptureEnabled(urlCapture === 'true');
        if (urlInterval) setCaptureInterval(Number(urlInterval));

        // If coming from URL with testing step, simulate setup completion
        if (urlStep === 'testing' || urlStep === 'configure') {
            setSetupData({
                cameraPermission: true,
                micPermission: true,
                deviceList: []
            });
        }
    }, []);

    const steps = [
        { id: 'setup', name: 'Device Setup', icon: Camera, current: currentStep === 'setup' },
        { id: 'configure', name: 'Configuration', icon: Settings, current: currentStep === 'configure' },
        { id: 'testing', name: 'Live Testing', icon: Video, current: currentStep === 'testing' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Comprehensive Video Test Suite</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Complete device setup and WebRTC video streaming test
                    </p>
                    <button
                        onClick={() => router.push('/test')}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        ← Back to Test Dashboard
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <nav aria-label="Progress">
                        <ol className="flex items-center justify-center space-x-5">
                            {steps.map((step, index) => (
                                <li key={step.id} className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step.current
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : index < steps.findIndex(s => s.current)
                                                ? 'border-green-600 bg-green-600 text-white'
                                                : 'border-gray-300 bg-white text-gray-500'
                                        }`}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`ml-3 text-sm font-medium ${step.current ? 'text-blue-600' : 'text-gray-500'
                                        }`}>
                                        {step.name}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <div className="ml-5 w-8 h-0.5 bg-gray-300" />
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>

                {/* Step Content */}
                {currentStep === 'setup' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <DeviceSetup
                            onSetupComplete={handleSetupComplete}
                            autoCapture={true}
                        />
                    </div>
                )}

                {currentStep === 'configure' && setupData && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Configuration</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Test Role
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as 'candidate' | 'recruiter')}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="candidate">Candidate (Stream Video + Capture Images)</option>
                                    <option value="recruiter">Recruiter (Watch Video)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Interview Session ID
                                </label>
                                <input
                                    type="text"
                                    value={interviewId}
                                    onChange={(e) => setInterviewId(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter unique interview ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    User ID
                                </label>
                                <input
                                    type="text"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="User identifier"
                                />
                            </div>

                            {role === 'candidate' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image Capture Interval
                                    </label>
                                    <select
                                        value={captureInterval}
                                        onChange={(e) => setCaptureInterval(Number(e.target.value))}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value={0.5}>30 seconds</option>
                                        <option value={1}>1 minute</option>
                                        <option value={2}>2 minutes</option>
                                        <option value={3}>3 minutes</option>
                                        <option value={5}>5 minutes</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {role === 'candidate' && (
                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={captureEnabled}
                                        onChange={(e) => setCaptureEnabled(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-3 text-sm text-gray-700">
                                        Enable automatic image capture during video streaming
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Setup Summary */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <h3 className="text-lg font-semibold text-green-900 mb-3">Setup Summary</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Camera:</span>
                                    <span className={`ml-2 ${setupData.cameraPermission ? 'text-green-600' : 'text-red-600'}`}>
                                        {setupData.cameraPermission ? '✓ Working' : '✗ Not Working'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium">Microphone:</span>
                                    <span className={`ml-2 ${setupData.micPermission ? 'text-green-600' : 'text-red-600'}`}>
                                        {setupData.micPermission ? '✓ Working' : '✗ Not Working'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium">Setup Photo:</span>
                                    <span className={`ml-2 ${setupData.setupPhoto ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {setupData.setupPhoto ? '✓ Captured' : '⚠ Not Captured'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium">Devices Found:</span>
                                    <span className="ml-2 text-gray-600">
                                        {setupData.deviceList.length} total
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={handleBackToSetup}
                                className="bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 font-medium"
                            >
                                Back to Setup
                            </button>

                            <button
                                onClick={handleStartTesting}
                                disabled={!setupData.cameraPermission || !setupData.micPermission}
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                            >
                                Start Live Video Testing
                            </button>

                            <button
                                onClick={copyTestLink}
                                className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-medium flex items-center"
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Share {role === 'candidate' ? 'Recruiter' : 'Candidate'} Link
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 'testing' && (
                    <div>
                        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        Live Video Testing - {role === 'candidate' ? 'Candidate View' : 'Recruiter View'}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Session: {interviewId} | User: {userId}
                                    </p>
                                    {connectionStatus && (
                                        <p className="text-sm text-blue-600 mt-1">
                                            Status: {connectionStatus}
                                        </p>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleBackToConfigure}
                                        className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 font-medium"
                                    >
                                        Configure
                                    </button>
                                    <button
                                        onClick={copyTestLink}
                                        className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium"
                                    >
                                        Share Link
                                    </button>
                                </div>
                            </div>
                        </div>

                        <LiveVideoV2
                            interviewId={interviewId}
                            role={role}
                            userId={userId}
                            onConnectionStatusChange={setConnectionStatus}
                            captureImages={captureEnabled}
                            captureInterval={captureInterval}
                        />
                    </div>
                )}

                {/* Testing Instructions */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                        📋 Testing Workflow
                    </h3>
                    <div className="space-y-3 text-blue-800">
                        <div className="flex items-start">
                            <span className="font-bold mr-2">1.</span>
                            <span>Complete device setup with camera and microphone permissions</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-bold mr-2">2.</span>
                            <span>Configure test parameters (role, session ID, capture settings)</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-bold mr-2">3.</span>
                            <span>Share the generated link to test peer-to-peer video connection</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-bold mr-2">4.</span>
                            <span>Verify real-time video streaming and automatic image capture</span>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-white rounded border">
                        <h4 className="font-semibold text-blue-900 mb-2">🔧 Technical Features:</h4>
                        <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                            <li>WebRTC peer-to-peer video streaming</li>
                            <li>WebSocket signaling server coordination</li>
                            <li>Automatic periodic image capture and upload</li>
                            <li>Real-time connection status monitoring</li>
                            <li>Device permission handling and testing</li>
                            <li>Supabase storage integration for captured images</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComprehensiveVideoTestPage;
