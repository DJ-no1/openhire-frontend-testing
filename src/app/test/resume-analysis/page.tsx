'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResumeBreakdownTab } from '@/components/tabs/resume-breakdown-tab';
import { testAnalysisParsing } from '@/utils/test-analysis-parsing';

export default function ResumeAnalysisTestPage() {
    const [showComponent, setShowComponent] = useState(false);
    const [testApplicationId, setTestApplicationId] = useState('');

    // Sample data structure for testing
    const sampleApplicationDetails = {
        id: 'test-app-123',
        status: 'under_review',
        created_at: '2024-01-15T10:30:00Z',
        candidate_name: 'Test Candidate',
        candidate_email: 'test@example.com',
        job_title: 'Senior Software Engineer',
        job_data: {
            title: 'Senior Software Engineer',
            skills: ['React', 'Node.js', 'TypeScript'],
            company_name: 'Test Company'
        },
        resume_data: {
            id: 'resume-123',
            file_path: '/test/resume.pdf',
            score: 85,
            scoring_details: {
                jd: "Software Engineer position...",
                resume: "Candidate resume...",
                analysis: {
                    dimension_breakdown: {
                        skill_match: {
                            score: 85,
                            weight: 0.25,
                            evidence: ["React experience", "Node.js skills", "TypeScript proficiency"]
                        },
                        experience_fit: {
                            score: 78,
                            weight: 0.20,
                            evidence: ["3 years frontend development", "Startup experience"]
                        },
                        impact_outcomes: {
                            score: 72,
                            weight: 0.15,
                            evidence: ["Improved app performance by 40%", "Led team of 3 developers"]
                        },
                        role_alignment: {
                            score: 80,
                            weight: 0.15,
                            evidence: ["Previous senior role", "Team leadership experience"]
                        },
                        project_tech_depth: {
                            score: 75,
                            weight: 0.10,
                            evidence: ["Complex React applications", "Microservices architecture"]
                        },
                        career_trajectory: {
                            score: 68,
                            weight: 0.10,
                            evidence: ["Steady progression", "Diverse technology stack"]
                        }
                    },
                    risk_flags: ["Limited backend experience", "Short tenure at last job"],
                    hard_filter_failures: []
                }
            },
            created_at: '2024-01-15T10:30:00Z'
        },
        analysis: {
            dimension_breakdown: {
                skill_match: {
                    score: 85,
                    weight: 0.25,
                    evidence: ["React experience", "Node.js skills", "TypeScript proficiency"]
                },
                experience_fit: {
                    score: 78,
                    weight: 0.20,
                    evidence: ["3 years frontend development", "Startup experience"]
                },
                impact_outcomes: {
                    score: 72,
                    weight: 0.15,
                    evidence: ["Improved app performance by 40%", "Led team of 3 developers"]
                },
                role_alignment: {
                    score: 80,
                    weight: 0.15,
                    evidence: ["Previous senior role", "Team leadership experience"]
                },
                project_tech_depth: {
                    score: 75,
                    weight: 0.10,
                    evidence: ["Complex React applications", "Microservices architecture"]
                },
                career_trajectory: {
                    score: 68,
                    weight: 0.10,
                    evidence: ["Steady progression", "Diverse technology stack"]
                }
            },
            risk_flags: ["Limited backend experience", "Short tenure at last job"],
            hard_filter_failures: []
        }
    };

    const runParsingTest = () => {
        console.log('🧪 Running analysis parsing test...');
        const result = testAnalysisParsing();
        console.log('Test result:', result);
        alert(`Analysis parsing test ${result.success ? 'PASSED' : 'FAILED'}. Check console for details.`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Resume Analysis Test Page</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Test the resume breakdown component with sample data
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Test Controls */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-4">
                                <Button
                                    onClick={runParsingTest}
                                    variant="outline"
                                >
                                    Run Analysis Parsing Test
                                </Button>

                                <Button
                                    onClick={() => setShowComponent(!showComponent)}
                                    variant={showComponent ? "destructive" : "default"}
                                >
                                    {showComponent ? 'Hide Component' : 'Show Component with Sample Data'}
                                </Button>
                            </div>

                            <div className="flex items-center gap-4">
                                <label htmlFor="appId" className="text-sm font-medium">
                                    Test with Real Application ID:
                                </label>
                                <input
                                    id="appId"
                                    type="text"
                                    value={testApplicationId}
                                    onChange={(e) => setTestApplicationId(e.target.value)}
                                    placeholder="Enter application ID"
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <Button
                                    onClick={() => setShowComponent(true)}
                                    disabled={!testApplicationId}
                                    size="sm"
                                >
                                    Test with Real Data
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Component Display */}
                    {showComponent && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Resume Breakdown Component</CardTitle>
                                    <p className="text-sm text-gray-600">
                                        {testApplicationId ? `Testing with application ID: ${testApplicationId}` : 'Testing with sample data'}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <ResumeBreakdownTab
                                        artifact={null}
                                        applicationDetails={testApplicationId ? null : sampleApplicationDetails}
                                        applicationId={testApplicationId || undefined}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Debug Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Debug Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Sample Data Structure:</h4>
                                    <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-96">
                                        {JSON.stringify(sampleApplicationDetails, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
