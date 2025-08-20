"use client";

import React from "react";
import { UniversalScoresChart } from "@/components/interview-charts";

export default function ChartTestPage() {
    // Test data from our database query
    const testUniversalScores = {
        teamwork_score: 50,
        adaptability_score: 50,
        cultural_fit_score: 45,
        communication_score: 55,
        problem_solving_score: 45,
        leadership_potential_score: 40
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Chart Component Test</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Test with real data */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">With Real Data</h2>
                        <UniversalScoresChart data={testUniversalScores} />
                    </div>

                    {/* Test with null data */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">With Null Data</h2>
                        <UniversalScoresChart data={null} />
                    </div>
                </div>

                {/* Debug info */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Debug Info</h3>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                        {JSON.stringify(testUniversalScores, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
