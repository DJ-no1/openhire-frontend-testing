"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2, Wifi } from "lucide-react";
import { toast } from "sonner";

export function ConnectionDebugger() {
    const [testing, setTesting] = useState(false);
    const [results, setResults] = useState<{
        http: 'pending' | 'success' | 'error';
        websocket: 'pending' | 'success' | 'error';
        details: string[];
    }>({
        http: 'pending',
        websocket: 'pending',
        details: []
    });

    const testBackend = async () => {
        setTesting(true);
        setResults({ http: 'pending', websocket: 'pending', details: [] });

        const details: string[] = [];

        // Test HTTP connection
        try {
            details.push('🔄 Testing HTTP connection to localhost:8000...');

            const response = await fetch('http://localhost:8000/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                details.push('✅ HTTP connection successful');
                setResults(prev => ({ ...prev, http: 'success', details: [...details] }));
            } else {
                details.push(`❌ HTTP error: ${response.status} ${response.statusText}`);
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
            const ws = new WebSocket(`ws://localhost:8000/ws/interview/${testSessionId}`);

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
                            <li>• Backend server running on <code>localhost:8000</code></li>
                            <li>• Health endpoint available at <code>/health</code></li>
                            <li>• WebSocket endpoint at <code>/ws/interview/&#123;session_id&#125;</code></li>
                            <li>• CORS properly configured for localhost:3000</li>
                        </ul>
                    </div>

                    {results.http === 'error' && results.websocket === 'error' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-medium text-red-800 mb-2">Troubleshooting:</h4>
                            <ul className="text-sm text-red-700 space-y-1">
                                <li>1. Make sure your AI backend server is running</li>
                                <li>2. Check if port 8000 is not blocked by firewall</li>
                                <li>3. Verify the backend is listening on localhost:8000</li>
                                <li>4. Check backend logs for any startup errors</li>
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
