"use client";

import { AIInterviewSystemV3 } from "@/components/ai-interview-system-v3";
import { SiteNavigation } from "@/components/site-navigation";

export default function InterviewPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
            <div className="container mx-auto">
                <SiteNavigation />

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        AI Interview System
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Experience next-generation interviews with real-time AI conversation,
                        speech recognition, and comprehensive analysis.
                    </p>
                    <div className="flex justify-center gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Real-time WebSocket Communication
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Speech-to-Text Recognition
                        </div>
                        <div className="flex items-center gap-2 text-sm text-purple-600">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            AI-Powered Analysis
                        </div>
                    </div>
                </div>

                <AIInterviewSystemV3 />
            </div>
        </div>
    );
}
