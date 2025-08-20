'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    FileText,
    Download,
    Eye,
    User,
    Award,
    TrendingUp,
    Target,
    Star,
    BookOpen,
    Code,
    Lightbulb,
    Shield,
    CheckCircle,
    AlertTriangle,
    Briefcase
} from 'lucide-react';

interface ResumeBreakdownTabProps {
    artifact: any;
    applicationDetails: any;
}

export function ResumeBreakdownTab({ artifact, applicationDetails }: ResumeBreakdownTabProps) {
    // Check if we have any data to work with
    if (!applicationDetails && !artifact) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Resume Data Available
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Resume analysis data is not available for this application.
                            This could be because the resume has not been uploaded or processed yet.
                        </p>
                        <Badge variant="secondary" className="text-sm">
                            Resume Status: Not Available
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Extract resume analysis data from the actual database
    const dbResumeData = applicationDetails?.resume_data;
    const resumeScore = dbResumeData?.score || artifact?.overall_score || 0;
    const scoringDetails = dbResumeData?.scoring_details;

    // Parse scoring details if available
    let parsedScoringDetails = null;
    if (scoringDetails) {
        try {
            parsedScoringDetails = typeof scoringDetails === 'string'
                ? JSON.parse(scoringDetails)
                : scoringDetails;
        } catch (error) {
            console.warn('Could not parse scoring details:', error);
        }
    }

    // Use real data if available, otherwise fall back to mock data
    const analysisData = parsedScoringDetails || {};
    const dimensionBreakdown = analysisData.dimension_breakdown || {};

    const resumeData = {
        overallScore: Math.round(resumeScore),
        confidence: analysisData.confidence || 75,
        skillMatch: dimensionBreakdown.skill_match?.score || 85,
        experienceLevel: dimensionBreakdown.experience_fit?.score || 78,
        educationFit: dimensionBreakdown.certs_education?.score || 88,
        certificationScore: dimensionBreakdown.certs_education?.score || 72,
        keySkills: analysisData.skills_analysis?.skills || [
            { name: "Frontend Development", score: 92, relevant: true },
            { name: "React.js", score: 90, relevant: true },
            { name: "TypeScript", score: 85, relevant: true },
            { name: "Node.js", score: 78, relevant: true },
            { name: "Python", score: 72, relevant: false },
        ],
        experience: {
            totalYears: analysisData.experience_years || 5,
            relevantYears: analysisData.relevant_experience || 3,
            roles: analysisData.experience_breakdown || [
                {
                    title: "Senior Frontend Developer",
                    company: "Tech Solutions Inc.",
                    duration: "2 years",
                    relevance: "high"
                },
                {
                    title: "Full Stack Developer",
                    company: "StartupCorp",
                    duration: "1.5 years",
                    relevance: "medium"
                },
                {
                    title: "Junior Developer",
                    company: "WebDev Agency",
                    duration: "1.5 years",
                    relevance: "high"
                }
            ]
        },
        education: analysisData.education || [
            {
                degree: "Bachelor of Science in Computer Science",
                institution: "University of Technology",
                year: "2018",
                relevance: "high"
            }
        ],
        certifications: analysisData.certifications || [
            { name: "AWS Certified Developer", year: "2023", relevance: "high" },
            { name: "React Professional Certification", year: "2022", relevance: "high" }
        ],
        strengths: analysisData.strengths || [
            "Strong technical background in modern web technologies",
            "Proven experience in full-stack development",
            "Good progression in career responsibilities",
            "Relevant educational background"
        ],
        concerns: analysisData.concerns || [
            "Limited experience with specific technologies mentioned in job description",
            "Short tenure at some previous positions"
        ]
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            {/* Resume Overview */}
            <Card className="border-2 border-blue-100">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-6 w-6 text-blue-600" />
                        Resume Analysis Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className={`text-4xl font-bold p-4 rounded-lg ${getScoreColor(resumeData.overallScore)}`}>
                                {Math.round(resumeData.overallScore)}%
                            </div>
                            <p className="text-sm text-gray-600 mt-2">Overall Score</p>
                        </div>
                        <div className="text-center">
                            <div className={`text-4xl font-bold p-4 rounded-lg ${getScoreColor(resumeData.confidence)}`}>
                                {resumeData.confidence}%
                            </div>
                            <p className="text-sm text-gray-600 mt-2">AI Confidence</p>
                        </div>
                        <div className="text-center">
                            <div className={`text-4xl font-bold p-4 rounded-lg ${getScoreColor(resumeData.skillMatch)}`}>
                                {resumeData.skillMatch}%
                            </div>
                            <p className="text-sm text-gray-600 mt-2">Skill Match</p>
                        </div>
                        <div className="text-center">
                            <div className={`text-4xl font-bold p-4 rounded-lg ${getScoreColor(resumeData.experienceLevel)}`}>
                                {resumeData.experienceLevel}%
                            </div>
                            <p className="text-sm text-gray-600 mt-2">Experience Fit</p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center gap-4">
                        <Button variant="outline" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Download Resume
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Original
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skills Analysis */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="h-5 w-5 text-purple-600" />
                            Skills Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {resumeData.keySkills.map((skill: any, index: number) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium flex items-center gap-2">
                                            {skill.skill}
                                            {skill.required && (
                                                <Badge variant="outline" className="text-xs">Required</Badge>
                                            )}
                                        </span>
                                        <span className="text-sm font-semibold">{skill.level}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(skill.level)}`}
                                            style={{ width: `${skill.level}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Experience Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-orange-600" />
                            Experience Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Total Experience</p>
                                    <p className="text-xl font-bold text-gray-900">{resumeData.experience.totalYears} years</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Relevant Experience</p>
                                    <p className="text-xl font-bold text-green-600">{resumeData.experience.relevantYears} years</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-2">Career History</p>
                                <div className="space-y-2">
                                    {resumeData.experience.roles.map((role: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div>
                                                <p className="font-medium text-sm">{role.title}</p>
                                                <p className="text-xs text-gray-600">{role.company}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{role.years} years</p>
                                                {role.relevant && (
                                                    <CheckCircle className="h-3 w-3 text-green-500 inline" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Education and Certifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                            Education
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {resumeData.education.map((edu: any, index: number) => (
                                <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{edu.degree}</p>
                                            <p className="text-sm text-gray-600">{edu.school}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{edu.year}</p>
                                            {edu.relevant && (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-green-600" />
                            Certifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {resumeData.certifications.map((cert: any, index: number) => (
                                <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{cert.name}</p>
                                            <p className="text-sm text-gray-600">{cert.issuer}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{cert.year}</p>
                                            {cert.relevant && (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Strengths and Concerns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-green-200 bg-green-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <Shield className="h-5 w-5" />
                            Key Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {resumeData.strengths.map((strength: any, index: number) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-green-800">{strength}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-700">
                            <AlertTriangle className="h-5 w-5" />
                            Areas for Consideration
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {resumeData.concerns.map((concern: any, index: number) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-yellow-100 rounded-lg">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-yellow-800">{concern}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
