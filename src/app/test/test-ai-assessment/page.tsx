"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Brain,
    User,
    Star,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Award,
    Clock,
    MessageSquare,
    Target,
    TrendingUp as TrendingUpIcon,
    Download,
    Share,
    BarChart3,
    Activity
} from "lucide-react";
import { mockInterviewAssessment, mockConversationLog } from '@/lib/mockData';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function TestAIAssessmentPage() {
    const selectedAssessment = mockInterviewAssessment;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Assessment - Enhanced Layout</h1>

                <div className="space-y-6">
                    {/* Universal Feedback Section */}
                    {selectedAssessment.feedback?.universal_feedback_for_candidate && (
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-900 flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Universal Feedback for Candidate
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-blue-800 leading-relaxed">
                                    {selectedAssessment.feedback.universal_feedback_for_candidate}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Industry-Specific Feedback Section */}
                    {selectedAssessment.feedback?.industry_specific_feedback?.technical_feedback_for_candidate && (
                        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                            <CardHeader>
                                <CardTitle className="text-green-900 flex items-center gap-2">
                                    <Brain className="w-5 h-5" />
                                    Technical Assessment ({selectedAssessment.industry_type || 'Industry-Specific'})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-green-800 leading-relaxed">
                                    {selectedAssessment.feedback.industry_specific_feedback.technical_feedback_for_candidate}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Your Strengths Section */}
                    {selectedAssessment.feedback?.industry_specific_feedback?.domain_strengths &&
                        selectedAssessment.feedback.industry_specific_feedback.domain_strengths.length > 0 && (
                            <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
                                <CardHeader>
                                    <CardTitle className="text-green-900 flex items-center gap-2">
                                        <Star className="w-5 h-5" />
                                        Your Strengths
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3">
                                        {selectedAssessment.feedback.industry_specific_feedback.domain_strengths.map((strength: string, index: number) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <p className="text-green-800 text-sm leading-relaxed">{strength}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                    {/* Areas for Improvement Section */}
                    {((selectedAssessment.feedback?.areas_of_improvement_for_candidate &&
                        selectedAssessment.feedback.areas_of_improvement_for_candidate.length > 0) ||
                        (selectedAssessment.feedback?.industry_specific_feedback?.domain_improvement_areas &&
                            selectedAssessment.feedback.industry_specific_feedback.domain_improvement_areas.length > 0)) && (
                            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                                <CardHeader>
                                    <CardTitle className="text-yellow-900 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        Areas for Improvement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3">
                                        {/* General improvement areas */}
                                        {selectedAssessment.feedback?.areas_of_improvement_for_candidate?.map((area: string, index: number) => (
                                            <div key={`general-${index}`} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-100">
                                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                <p className="text-yellow-800 text-sm leading-relaxed">{area}</p>
                                            </div>
                                        ))}
                                        {/* Domain-specific improvement areas */}
                                        {selectedAssessment.feedback?.industry_specific_feedback?.domain_improvement_areas?.map((area: string, index: number) => (
                                            <div key={`domain-${index}`} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-100">
                                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                <p className="text-yellow-800 text-sm leading-relaxed">{area}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                    {/* Assessment Summary */}
                    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                        <CardHeader>
                            <CardTitle className="text-purple-900 flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Assessment Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-purple-600">Overall Score</p>
                                    <p className="text-2xl font-bold text-purple-900">
                                        {selectedAssessment.overall_score || 0}/100
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-purple-600">Technical Score</p>
                                    <p className="text-2xl font-bold text-purple-900">
                                        {selectedAssessment.technical_score || 0}/100
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-purple-600">Confidence Level</p>
                                    <Badge
                                        variant={
                                            selectedAssessment.confidence_level === 'high' ? 'default' :
                                                selectedAssessment.confidence_level === 'moderate' ? 'secondary' :
                                                    'outline'
                                        }
                                        className="text-sm capitalize"
                                    >
                                        {selectedAssessment.confidence_level || 'N/A'}
                                    </Badge>
                                </div>
                            </div>
                            {selectedAssessment.final_recommendation && (
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-purple-600 mb-2">Final Recommendation</p>
                                    <Badge
                                        variant={
                                            selectedAssessment.final_recommendation === 'strong_hire' ? 'default' :
                                                selectedAssessment.final_recommendation === 'hire' ? 'secondary' :
                                                    'outline'
                                        }
                                        className="text-sm capitalize px-4 py-1"
                                    >
                                        {selectedAssessment.final_recommendation.replace('_', ' ')}
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Display Additional Metadata */}
                    <Card className="bg-gray-50 border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-gray-900">Assessment Metadata</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-gray-600">Assessment Type</p>
                                    <p className="text-gray-900 capitalize">{selectedAssessment.assessment_type?.replace('_', ' ') || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-600">Interview Version</p>
                                    <p className="text-gray-900">{selectedAssessment.interview_version || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-600">Quality Score</p>
                                    <p className="text-gray-900">{selectedAssessment.interview_quality_score || 'N/A'}/10</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-600">Industry</p>
                                    <p className="text-gray-900">{selectedAssessment.industry_type || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
