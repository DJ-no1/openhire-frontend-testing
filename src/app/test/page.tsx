'use client';

import React from 'react';
import Link from 'next/link';

const TestDashboard = () => {
    const testPages = [
        {
            title: 'Async Resume Analysis',
            description: 'NEW: Fast, reliable async resume analysis with real-time progress tracking',
            href: '/test/async-resume-review',
            status: 'Featured'
        },
        {
            title: 'Resume Analysis Comparison',
            description: 'Compare async vs legacy resume analysis performance',
            href: '/test/resume-review',
            status: 'Active'
        },
        {
            title: 'Comprehensive Video Test',
            description: 'Complete workflow: Device setup → Configuration → Live video streaming with image capture',
            href: '/test/comprehensive-video',
            status: 'Available'
        },
        {
            title: 'Live Video Component',
            description: 'Test WebRTC video streaming with peer-to-peer connections',
            href: '/test/live-video',
            status: 'Active'
        },
        {
            title: 'Device Setup Component',
            description: 'Test camera/microphone permissions and device configuration',
            href: '/test/device-setup',
            status: 'New'
        },
        {
            title: 'Interview System',
            description: 'Complete AI interview system with STT/TTS',
            href: '/test/interview',
            status: 'Available'
        },
        {
            title: 'WebSocket Chat',
            description: 'WebSocket communication testing',
            href: '/test/ws-chat',
            status: 'Available'
        },
        {
            title: 'Picture/Camera Test',
            description: 'Camera access and image capture testing',
            href: '/test/picture',
            status: 'Available'
        },
        {
            title: 'Resume Upload',
            description: 'Test resume upload and analysis',
            href: '/test/resume-upload',
            status: 'Available'
        },
        {
            title: 'Connection Debug',
            description: 'Debug WebSocket and WebRTC connections',
            href: '/test/debug',
            status: 'Available'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">OpenHire Test Dashboard</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Test all components and features of the OpenHire platform
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testPages.map((page, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {page.title}
                                    </h3>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${page.status === 'Featured'
                                        ? 'bg-purple-100 text-purple-800'
                                        : page.status === 'Active'
                                            ? 'bg-green-100 text-green-800'
                                            : page.status === 'New'
                                                ? 'bg-orange-100 text-orange-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {page.status}
                                    </span>
                                </div>

                                <p className="text-gray-600 mb-4">
                                    {page.description}
                                </p>

                                <Link
                                    href={page.href}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    Test Component
                                    <svg
                                        className="ml-2 -mr-1 w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">System Status</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">WebSocket Server</span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Running on :3001
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Next.js Frontend</span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Running on :3000
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Supabase Backend</span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Connected
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        🚀 Getting Started
                    </h3>
                    <p className="text-blue-800 mb-4">
                        To test the live video functionality:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-blue-800">
                        <li>Start with <strong>Live Video Component</strong> to test WebRTC connections</li>
                        <li>Open two browser windows/tabs to simulate candidate and recruiter</li>
                        <li>Test device permissions and video streaming</li>
                        <li>Verify real-time communication through WebSockets</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default TestDashboard;
