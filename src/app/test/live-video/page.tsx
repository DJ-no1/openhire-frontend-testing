'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LiveVideoV2 from '@/components/live-video-v2';

const LiveVideoTestPage = () => {
    const router = useRouter();
    const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
    const [interviewId, setInterviewId] = useState('test-interview-001');
    const [userId, setUserId] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('');
    const [isReady, setIsReady] = useState(false);
    const [captureEnabled, setCaptureEnabled] = useState(true);
    const [captureInterval, setCaptureInterval] = useState(2);

    // Generate random user ID on component mount
    useEffect(() => {
        const randomUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
        setUserId(randomUserId);
    }, []);

    const handleStart = () => {
        if (interviewId && userId) {
            setIsReady(true);
        }
    };

    const handleStop = () => {
        setIsReady(false);
        setConnectionStatus('');
    };

    const copyLink = () => {
        const currentUrl = window.location.href;
        const params = new URLSearchParams({
            role: role === 'candidate' ? 'recruiter' : 'candidate',
            interviewId,
            userId: `user_${Math.random().toString(36).substr(2, 9)}`
        });
        const shareUrl = `${currentUrl.split('?')[0]}?${params.toString()}`;

        navigator.clipboard.writeText(shareUrl).then(() => {
            alert(`Link copied! Open this in another tab/window to test the ${role === 'candidate' ? 'recruiter' : 'candidate'} view:\n\n${shareUrl}`);
        });
    };

    // Parse URL parameters on page load
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlRole = urlParams.get('role') as 'candidate' | 'recruiter';
        const urlInterviewId = urlParams.get('interviewId');
        const urlUserId = urlParams.get('userId');

        if (urlRole) setRole(urlRole);
        if (urlInterviewId) setInterviewId(urlInterviewId);
        if (urlUserId) setUserId(urlUserId);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Live Video Component Test</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Test WebRTC video streaming with automatic image capture
                    </p>
                    <button
                        onClick={() => router.push('/test')}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        ← Back to Test Dashboard
                    </button>
                </div>

                {!isReady ? (
                    /* Configuration Panel */
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Configuration</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as 'candidate' | 'recruiter')}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="candidate">Candidate (Stream Video)</option>
                                    <option value="recruiter">Recruiter (Watch Video)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Interview ID
                                </label>
                                <input
                                    type="text"
                                    value={interviewId}
                                    onChange={(e) => setInterviewId(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter interview ID"
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
                                    placeholder="Auto-generated user ID"
                                />
                            </div>

                            {role === 'candidate' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image Capture Interval (minutes)
                                    </label>
                                    <select
                                        value={captureInterval}
                                        onChange={(e) => setCaptureInterval(Number(e.target.value))}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value={1}>1 minute</option>
                                        <option value={2}>2 minutes</option>
                                        <option value={3}>3 minutes</option>
                                        <option value={5}>5 minutes</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {role === 'candidate' && (
                            <div className="mt-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={captureEnabled}
                                        onChange={(e) => setCaptureEnabled(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        Enable automatic image capture for behavioral analysis
                                    </span>
                                </label>
                            </div>
                        )}

                        <div className="mt-6 flex space-x-4">
                            <button
                                onClick={handleStart}
                                disabled={!interviewId || !userId}
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                            >
                                Start {role === 'candidate' ? 'Video Stream' : 'Watching Session'}
                            </button>

                            <button
                                onClick={copyLink}
                                className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-medium"
                            >
                                Copy {role === 'candidate' ? 'Recruiter' : 'Candidate'} Link
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Live Video Component */
                    <div>
                        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        {role === 'candidate' ? 'Candidate View' : 'Recruiter View'}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Interview: {interviewId} | User: {userId}
                                    </p>
                                    {connectionStatus && (
                                        <p className="text-sm text-blue-600 mt-1">
                                            Status: {connectionStatus}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={handleStop}
                                    className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 font-medium"
                                >
                                    Stop Session
                                </button>
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

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                        🔧 Testing Instructions
                    </h3>
                    <div className="space-y-2 text-blue-800">
                        <p><strong>Step 1:</strong> Configure your role (Candidate or Recruiter)</p>
                        <p><strong>Step 2:</strong> Use the same Interview ID for both parties</p>
                        <p><strong>Step 3:</strong> Click "Copy Link" to get the URL for the other role</p>
                        <p><strong>Step 4:</strong> Open the copied link in another browser tab/window</p>
                        <p><strong>Step 5:</strong> Start both sessions and test the video connection</p>
                    </div>

                    <div className="mt-4 p-4 bg-white rounded border">
                        <h4 className="font-semibold text-blue-900 mb-2">Features to Test:</h4>
                        <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                            <li>Real-time video streaming between candidate and recruiter</li>
                            <li>Automatic image capture every 2-3 minutes (candidate side)</li>
                            <li>WebSocket connection status monitoring</li>
                            <li>Image upload to Supabase storage</li>
                            <li>Connection recovery and error handling</li>
                        </ul>
                    </div>
                </div>

                {/* System Requirements */}
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                        ⚙️ System Requirements
                    </h3>
                    <div className="text-yellow-800 text-sm space-y-1">
                        <p>• WebSocket server running on localhost:3001</p>
                        <p>• Camera and microphone permissions granted</p>
                        <p>• Modern browser with WebRTC support</p>
                        <p>• Supabase project configured with 'pictures' storage bucket</p>
                        <p>• STUN servers accessible for peer-to-peer connection</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveVideoTestPage;
