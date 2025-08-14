"use client";

import AIInterview from "@/components/ai_interview";

export default function AIInterviewTestPage() {
    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 min-h-screen flex items-start">
            <div className="w-full flex items-start justify-end">
                <div className="max-w-xl w-full">
                    <AIInterview />
                </div>
            </div>
        </div>
    );
}
