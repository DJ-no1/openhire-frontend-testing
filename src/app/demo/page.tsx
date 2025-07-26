"use client";

import { AIInterviewDemo } from "@/components/ai-interview-demo";
import { SiteNavigation } from "@/components/site-navigation";

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
            <div className="container mx-auto">
                <SiteNavigation />

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        AI Interview Demo
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Experience the full AI interview system without needing a backend server.
                        Perfect for testing speech recognition and interview flow!
                    </p>
                    <div className="flex justify-center gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Mock AI Responses
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Full Speech Recognition
                        </div>
                        <div className="flex items-center gap-2 text-sm text-purple-600">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            No Backend Required
                        </div>
                    </div>
                </div>

                <AIInterviewDemo />
            </div>
        </div>
    );
}
