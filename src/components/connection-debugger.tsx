"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2, Wifi, Database, Code } from "lucide-react";
import { toast } from "sonner";
import { DatabaseService } from "@/lib/database";
import { supabase } from "@/lib/supabaseClient";
import { getApiUrl, getWebSocketUrl, isUsingLocalBackend } from "@/lib/api-config";

export function ConnectionDebugger() {
    const [testing, setTesting] = useState(false);
    const [results, setResults] = useState<{
        http: 'pending' | 'success' | 'error';
        websocket: 'pending' | 'success' | 'error';
        database: 'pending' | 'success' | 'error';
        details: string[];
    }>({
        http: 'pending',
        websocket: 'pending',
        database: 'pending',
        details: []
    });

    const testBackend = async () => {
        setTesting(true);
        setResults({ http: 'pending', websocket: 'pending', database: 'pending', details: [] });

        const details: string[] = [];

        // Test Database connection first
        try {
            details.push('🔄 Testing Supabase database connection...');

            const { data, error } = await supabase.from('users').select('id').limit(1);
            if (error) {
                details.push(`❌ Database error: ${error.message}`);
                setResults(prev => ({ ...prev, database: 'error', details: [...details] }));
            } else {
                details.push('✅ Database connection successful');
                setResults(prev => ({ ...prev, database: 'success', details: [...details] }));
            }
        } catch (error) {
            details.push(`❌ Database connection failed: ${error}`);
            setResults(prev => ({ ...prev, database: 'error', details: [...details] }));
        }

        // Test HTTP connection
        try {
            const backendInfo = isUsingLocalBackend() ? 'localhost:8000' : 'production backend';
            details.push(`🔄 Testing HTTP connection to ${backendInfo}...`);

            // Try the root endpoint first to get backend info
            const rootResponse = await fetch(getApiUrl('/'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (rootResponse.ok) {
                const rootData = await rootResponse.json();
                details.push('✅ Backend is running and responsive');
                details.push(`📋 Backend: ${rootData.message || 'OpenHire Backend'}`);

                // Test jobs endpoint
                const jobsResponse = await fetch(getApiUrl('/jobs'));
                if (jobsResponse.ok) {
                    const jobs = await jobsResponse.json();
                    details.push(`✅ Jobs endpoint working (${jobs.length} jobs available)`);
                } else {
                    details.push(`⚠️ Jobs endpoint issue: ${jobsResponse.status}`);
                }

                setResults(prev => ({ ...prev, http: 'success', details: [...details] }));
            } else {
                details.push(`❌ Backend responded with error: ${rootResponse.status}`);
                setResults(prev => ({ ...prev, http: 'error', details: [...details] }));
            }
        } catch (error) {
            details.push(`❌ HTTP connection failed: ${error}`);
            setResults(prev => ({ ...prev, http: 'error', details: [...details] }));
        }

        // Test WebSocket connection
        try {
            details.push('🔄 Testing WebSocket connection...');

            const testSessionId = `debug_${Date.now()}`;
            const ws = new WebSocket(getWebSocketUrl(`/ws/interview/${testSessionId}`));

            ws.onopen = () => {
                details.push('✅ WebSocket connection successful');
                setResults(prev => ({ ...prev, websocket: 'success', details: [...details] }));
                ws.close();
                setTesting(false);
            };

            ws.onerror = (error) => {
                details.push(`❌ WebSocket error: ${error}`);
                setResults(prev => ({ ...prev, websocket: 'error', details: [...details] }));
                setTesting(false);
            };

            ws.onclose = (event) => {
                if (event.code !== 1000) {
                    details.push(`❌ WebSocket closed unexpectedly: Code ${event.code} - ${event.reason}`);
                    setResults(prev => ({ ...prev, websocket: 'error', details: [...details] }));
                }
                setTesting(false);
            };

            // Timeout after 5 seconds
            setTimeout(() => {
                if (ws.readyState === WebSocket.CONNECTING) {
                    details.push('❌ WebSocket connection timeout');
                    setResults(prev => ({ ...prev, websocket: 'error', details: [...details] }));
                    ws.close();
                    setTesting(false);
                }
            }, 5000);

        } catch (error) {
            details.push(`❌ WebSocket test failed: ${error}`);
            setResults(prev => ({ ...prev, websocket: 'error', details: [...details] }));
            setTesting(false);
        }
    };

    const testDatabaseOperations = async () => {
        setTesting(true);
        const details: string[] = [];

        try {
            details.push('🔄 Testing database operations...');

            // Test if we can fetch jobs
            const { data: jobs, error: jobError } = await supabase.from('jobs').select('*').limit(1);
            if (jobError) {
                details.push(`❌ Failed to fetch jobs: ${jobError.message}`);
                setResults(prev => ({ ...prev, details: [...prev.details, ...details] }));
                setTesting(false);
                return;
            }

            if (!jobs || jobs.length === 0) {
                details.push('⚠️ No jobs found in database - need to add some jobs first');
                setResults(prev => ({ ...prev, details: [...prev.details, ...details] }));
                setTesting(false);
                return;
            }

            details.push(`✅ Found ${jobs.length} job(s) in database`);

            // Test creating an application
            const testJobId = jobs[0].id;
            const testCandidateId = crypto.randomUUID();

            details.push('🔄 Creating test application...');
            const application = await DatabaseService.createApplication(testJobId, testCandidateId);
            details.push(`✅ Application created with ID: ${application.id}`);

            // Test saving resume analysis (mock data)
            details.push('🔄 Testing resume analysis save...');
            const mockAnalysis = {
                jd: "Test job description",
                resume: "Test resume content",
                analysis: {
                    overall_score: 85,
                    passed_hard_filters: true,
                    confidence: 0.9,
                    dimension_breakdown: {
                        skill_match: { score: 90, weight: 0.2, evidence: ["Test evidence"] },
                        experience_fit: { score: 80, weight: 0.15, evidence: ["Test evidence"] },
                        impact_outcomes: { score: 85, weight: 0.1, evidence: ["Test evidence"] },
                        role_alignment: { score: 88, weight: 0.15, evidence: ["Test evidence"] },
                        project_tech_depth: { score: 82, weight: 0.1, evidence: ["Test evidence"] },
                        career_trajectory: { score: 86, weight: 0.1, evidence: ["Test evidence"] },
                        communication_clarity: { score: 84, weight: 0.1, evidence: ["Test evidence"] },
                        certs_education: { score: 80, weight: 0.05, evidence: ["Test evidence"] },
                        extras: { score: 85, weight: 0.05, evidence: ["Test evidence"] }
                    },
                    hard_filter_failures: [],
                    risk_flags: []
                }
            };

            const resumeRecord = await DatabaseService.saveResumeAnalysis(
                application.id,
                'test-resume.pdf',
                mockAnalysis
            );
            details.push(`✅ Resume analysis saved with ID: ${resumeRecord.id}`);

            details.push('🎉 All database operations successful!');
            setResults(prev => ({ ...prev, details: [...prev.details, ...details] }));
            toast.success("Database operations test completed successfully!");

        } catch (error) {
            details.push(`❌ Database operation failed: ${error}`);
            setResults(prev => ({ ...prev, details: [...prev.details, ...details] }));
            toast.error("Database operations test failed");
        } finally {
            setTesting(false);
        }
    };

    const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
        switch (status) {
            case 'pending': return <Loader2 className="h-4 w-4 animate-spin" />;
            case 'success': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
            case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
        }
    };

    const getStatusBadge = (status: 'pending' | 'success' | 'error') => {
        switch (status) {
            case 'pending': return <Badge variant="secondary">Testing...</Badge>;
            case 'success': return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
            case 'error': return <Badge variant="destructive">Failed</Badge>;
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wifi className="h-6 w-6" />
                        Backend Connection Debugger
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                        Test your AI backend connection before starting interviews
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Button
                        onClick={testBackend}
                        disabled={testing}
                        className="w-full"
                    >
                        {testing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Testing Connection...
                            </>
                        ) : (
                            'Test Backend Connection'
                        )}
                    </Button>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(results.database)}
                                <span className="font-medium">Database Connection</span>
                            </div>
                            {getStatusBadge(results.database)}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(results.http)}
                                <span className="font-medium">HTTP Connection</span>
                            </div>
                            {getStatusBadge(results.http)}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(results.websocket)}
                                <span className="font-medium">WebSocket Connection</span>
                            </div>
                            {getStatusBadge(results.websocket)}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={testDatabaseOperations}
                            disabled={testing}
                            variant="outline"
                            className="flex-1"
                        >
                            {testing ? (
                                <>
                                    <Database className="h-4 w-4 mr-2" />
                                    Testing DB...
                                </>
                            ) : (
                                <>
                                    <Database className="h-4 w-4 mr-2" />
                                    Test Database
                                </>
                            )}
                        </Button>
                    </div>

                    {results.details.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium mb-2">Test Details:</h4>
                            <div className="space-y-1 text-sm font-mono">
                                {results.details.map((detail, index) => (
                                    <div key={index}>{detail}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Backend Requirements:</h4>
                        <ul className="text-sm space-y-1">
                            <li>• Backend server running on <code>{isUsingLocalBackend() ? 'localhost:8000' : 'production server'}</code></li>
                            <li>• Health endpoint available at <code>/health</code></li>
                            <li>• WebSocket endpoint at <code>/ws/interview/&#123;session_id&#125;</code></li>
                            <li>• CORS properly configured for {isUsingLocalBackend() ? 'localhost:3000' : 'production frontend'}</li>
                        </ul>
                    </div>

                    {results.http === 'error' && results.websocket === 'error' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-medium text-red-800 mb-2">Troubleshooting:</h4>
                            <ul className="text-sm text-red-700 space-y-1">
                                <li>1. Make sure your AI backend server is running</li>
                                <li>2. Check if port {isUsingLocalBackend() ? '8000' : 'HTTPS'} is not blocked by firewall</li>
                                <li>3. Verify the backend is listening on {isUsingLocalBackend() ? 'localhost:8000' : 'the production server'}</li>
                                <li>4. Check backend logs for any startup errors</li>
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
