"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InterviewStatusBadge } from "@/components/ui/interview-status-badge";

export default function InterviewDashboardTestPage() {
    const [testUserId, setTestUserId] = useState("");
    const [apiResponse, setApiResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testApiEndpoint = async () => {
        if (!testUserId.trim()) {
            alert("Please enter a candidate ID");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/applications/with-interview-status?candidate_id=${testUserId}`);
            const data = await response.json();
            setApiResponse({ status: response.status, data });
        } catch (error) {
            setApiResponse({ error: (error as Error).message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Interview Dashboard API Test</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <Input
                                placeholder="Enter candidate ID for testing..."
                                value={testUserId}
                                onChange={(e) => setTestUserId(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={testApiEndpoint} disabled={loading}>
                                {loading ? "Testing..." : "Test API"}
                            </Button>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">Interview Status Badge Examples:</h3>
                            <div className="flex gap-4">
                                <InterviewStatusBadge status="eligible_for_interview" />
                                <InterviewStatusBadge status="interview_completed" />
                                <InterviewStatusBadge status="no_interview" />
                            </div>
                        </div>

                        {apiResponse && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>API Response</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                                        {JSON.stringify(apiResponse, null, 2)}
                                    </pre>
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
