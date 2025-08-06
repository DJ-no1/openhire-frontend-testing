'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DeviceSetup from '@/components/device-setup';

interface SetupData {
    cameraPermission: boolean;
    micPermission: boolean;
    setupPhoto?: string;
    deviceList: MediaDeviceInfo[];
}

const DeviceSetupTestPage = () => {
    const router = useRouter();
    const [setupComplete, setSetupComplete] = useState(false);
    const [setupData, setSetupData] = useState<SetupData | null>(null);

    const handleSetupComplete = (data: SetupData) => {
        setSetupData(data);
        setSetupComplete(true);
    };

    const handleReset = () => {
        setSetupComplete(false);
        setSetupData(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Device Setup Test</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Test camera and microphone permissions and device configuration
                    </p>
                    <button
                        onClick={() => router.push('/test')}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        ← Back to Test Dashboard
                    </button>
                </div>

                {!setupComplete ? (
                    <DeviceSetup onSetupComplete={handleSetupComplete} />
                ) : (
                    <div className="space-y-6">
                        {/* Success Message */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-green-900 mb-4">
                                ✅ Device Setup Completed Successfully!
                            </h2>

                            {/* Setup Results */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-green-800">Setup Results</h3>

                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <span className="font-medium">Camera Permission:</span>
                                            <span className={`ml-2 ${setupData?.cameraPermission ? 'text-green-600' : 'text-red-600'}`}>
                                                {setupData?.cameraPermission ? '✓ Granted' : '✗ Denied'}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="font-medium">Microphone Permission:</span>
                                            <span className={`ml-2 ${setupData?.micPermission ? 'text-green-600' : 'text-red-600'}`}>
                                                {setupData?.micPermission ? '✓ Granted' : '✗ Denied'}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="font-medium">Setup Photo:</span>
                                            <span className={`ml-2 ${setupData?.setupPhoto ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {setupData?.setupPhoto ? '✓ Captured' : '⚠ Not Captured'}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="font-medium">Total Devices:</span>
                                            <span className="ml-2 text-gray-600">
                                                {setupData?.deviceList.length || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Setup Photo Preview */}
                                {setupData?.setupPhoto && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-green-800 mb-3">Setup Photo</h3>
                                        <img
                                            src={setupData.setupPhoto}
                                            alt="Setup photo"
                                            className="w-full max-w-sm h-48 object-cover rounded-lg border shadow-md"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Device Information */}
                        {setupData?.deviceList && setupData.deviceList.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Devices</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Video Input Devices</h4>
                                        <div className="space-y-2">
                                            {setupData.deviceList
                                                .filter(device => device.kind === 'videoinput')
                                                .map((device, index) => (
                                                    <div key={device.deviceId} className="p-2 bg-gray-50 rounded text-sm">
                                                        <div className="font-medium">
                                                            {device.label || `Camera ${index + 1}`}
                                                        </div>
                                                        <div className="text-gray-500 text-xs">
                                                            ID: {device.deviceId.slice(0, 20)}...
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Audio Input Devices</h4>
                                        <div className="space-y-2">
                                            {setupData.deviceList
                                                .filter(device => device.kind === 'audioinput')
                                                .map((device, index) => (
                                                    <div key={device.deviceId} className="p-2 bg-gray-50 rounded text-sm">
                                                        <div className="font-medium">
                                                            {device.label || `Microphone ${index + 1}`}
                                                        </div>
                                                        <div className="text-gray-500 text-xs">
                                                            ID: {device.deviceId.slice(0, 20)}...
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-4">
                            <button
                                onClick={handleReset}
                                className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 font-medium"
                            >
                                Test Again
                            </button>

                            <button
                                onClick={() => router.push('/test/comprehensive-video')}
                                className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-medium"
                            >
                                Continue to Video Testing
                            </button>

                            <button
                                onClick={() => router.push('/test/live-video')}
                                className="bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 font-medium"
                            >
                                Skip to Live Video
                            </button>
                        </div>
                    </div>
                )}

                {/* Information Panel */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                        💡 Device Setup Information
                    </h3>
                    <div className="space-y-2 text-blue-800">
                        <p><strong>Purpose:</strong> Verify camera and microphone permissions before starting video calls</p>
                        <p><strong>Setup Photo:</strong> Automatically captured when camera test passes (used for identity verification)</p>
                        <p><strong>Device Detection:</strong> Lists all available video and audio input devices</p>
                        <p><strong>Audio Level:</strong> Real-time microphone input level monitoring</p>
                    </div>

                    <div className="mt-4 p-4 bg-white rounded border">
                        <h4 className="font-semibold text-blue-900 mb-2">🔧 Features Tested:</h4>
                        <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                            <li>Camera permission request and access</li>
                            <li>Microphone permission request and access</li>
                            <li>Device enumeration and selection</li>
                            <li>Live video preview with quality indicators</li>
                            <li>Real-time audio level visualization</li>
                            <li>Automatic setup photo capture</li>
                            <li>Test recording functionality</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeviceSetupTestPage;
