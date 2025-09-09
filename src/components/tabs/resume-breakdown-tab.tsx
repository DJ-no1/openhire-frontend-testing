'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useResumeData } from '@/hooks/use-resume-data';
import {
    FileText,
    Download,
    Eye,
    Award,
    TrendingUp,
    Target,
    Star,
    Code,
    CheckCircle,
    AlertTriangle,
    Briefcase,
    ChevronDown,
    ChevronUp,
    Brain,
    MessageSquare,
    GraduationCap,
    XCircle,
    Loader2,
    RefreshCw,
    BarChart3
} from 'lucide-react';

interface ResumeBreakdownTabProps {
    artifact: any;
    applicationDetails: any;
    applicationId?: string;
}

// Type definitions
interface DimensionScore {
    score: number;
    weight: number;
    evidence: string[];
}

interface ScoringDetails {
    overall_score: number;
    confidence: number;
    risk_flags: string[];
    hard_filter_failures: string[];
    dimension_breakdown: {
        skill_match?: DimensionScore;
        experience_fit?: DimensionScore;
        impact_outcomes?: DimensionScore;
        role_alignment?: DimensionScore;
        project_tech_depth?: DimensionScore;
        career_trajectory?: DimensionScore;
        communication_clarity?: DimensionScore;
        certs_education?: DimensionScore;
        extras?: DimensionScore;
    };
}

// Icon mapping
const dimensionIcons: Record<string, any> = {
    skill_match: Target,
    experience_fit: Briefcase,
    impact_outcomes: Award,
    role_alignment: CheckCircle,
    project_tech_depth: Code,
    career_trajectory: TrendingUp,
    communication_clarity: MessageSquare,
    certs_education: GraduationCap,
    extras: Star,
};

// Descriptions
const dimensionDescriptions: Record<string, string> = {
    skill_match: "Technical skills alignment with job requirements",
    experience_fit: "Years and relevance of professional experience",
    impact_outcomes: "Quantifiable achievements and measurable results",
    role_alignment: "Job responsibilities and duties compatibility",
    project_tech_depth: "Technical project complexity and depth",
    career_trajectory: "Career progression and growth pattern",
    communication_clarity: "Resume presentation and clarity",
    certs_education: "Education background and certifications",
    extras: "Additional qualifications and unique strengths",
};

export function ResumeBreakdownTab({ artifact, applicationDetails, applicationId }: ResumeBreakdownTabProps) {
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
    const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

    // Use the custom hook to fetch data directly from Supabase
    const { data: fetchedData, loading: dataLoading, error: dataError, refetch } = useResumeData(applicationId || null);

    // Use fetched data if available, otherwise fall back to props
    const actualApplicationDetails = fetchedData || applicationDetails;
    const loading = dataLoading;
    const error = dataError;

    // Helper functions for styling
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return "Excellent";
        if (score >= 80) return "Good";
        if (score >= 70) return "Fair";
        if (score >= 60) return "Below Average";
        return "Poor";
    };

    // Show loading state
    if (loading) {
        return (
            <Card className="border border-gray-200 bg-white">
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <Loader2 className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Resume Analysis</h3>
                        <p className="text-gray-500 mb-4">Fetching candidate resume data and AI analysis...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show error state
    if (error) {
        return (
            <Card className="border border-red-200 bg-red-50">
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Resume Data</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button variant="outline" onClick={refetch}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Check if we have data
    if (!actualApplicationDetails) {
        return (
            <Card className="border border-gray-200 bg-white">
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Resume Data Available</h3>
                        <p className="text-gray-500 mb-4">Resume analysis data is not available for this application.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Extract data
    const dbResumeData = actualApplicationDetails?.resume_data;
    const resumeScore = dbResumeData?.score || artifact?.overall_score || 0;
    const processedAnalysis = actualApplicationDetails?.analysis;

    // If no analysis data
    if (!dbResumeData || !processedAnalysis) {
        return (
            <Card className="border border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <FileText className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-amber-800 mb-2">Resume Analysis Pending</h3>
                        <p className="text-amber-700 mb-4">Resume data found but AI analysis is not yet available</p>
                        <Button variant="outline" onClick={refetch}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Check for Updates
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Prepare analysis data
    const analysisData: ScoringDetails = {
        overall_score: resumeScore,
        confidence: 0.8,
        risk_flags: processedAnalysis?.risk_flags || [],
        hard_filter_failures: processedAnalysis?.hard_filter_failures || [],
        dimension_breakdown: processedAnalysis?.dimension_breakdown || {}
    };

    const dimensionBreakdown = analysisData.dimension_breakdown || {};
    const riskFlags = analysisData.risk_flags || [];
    const hardFilterFailures = analysisData.hard_filter_failures || [];

    return (
        <div className="space-y-6">
            {/* Overall Analysis Header - Minimal Design */}
            <Card className="border border-gray-200 bg-white shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <Brain className="h-8 w-8 text-gray-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl text-gray-900">Resume Analysis Summary</CardTitle>
                                <p className="text-gray-500">AI-powered candidate evaluation for recruiters</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-4xl font-bold ${getScoreColor(analysisData.overall_score || resumeScore)}`}>
                                {Math.round(analysisData.overall_score || resumeScore)}%
                            </div>
                            <Badge variant="outline" className="text-sm mt-1 border-gray-300">
                                {getScoreLabel(analysisData.overall_score || resumeScore)}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-gray-600" />
                            <span className="text-sm text-gray-700">
                                AI Confidence: <span className="font-semibold">{Math.round((analysisData.confidence || 0.75) * 100)}%</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {(hardFilterFailures.length === 0) ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span className="text-sm text-gray-700">
                                {hardFilterFailures.length === 0 ? 'Passed Hard Filters' : `${hardFilterFailures.length} Hard Filter Failures`}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {riskFlags.length === 0 ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                            )}
                            <span className="text-sm text-gray-700">
                                {riskFlags.length} Risk Flag{riskFlags.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Analysis Cards Grid - Minimal Design */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skill Analysis Card */}
                <Card className="border border-gray-200 hover:shadow-md transition-all duration-200 bg-white">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Target className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-gray-900">Skill Analysis</CardTitle>
                                    <p className="text-sm text-gray-500">{dimensionDescriptions.skill_match}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-3xl font-bold ${getScoreColor(dimensionBreakdown.skill_match?.score || 0)}`}>
                                    {Math.round(dimensionBreakdown.skill_match?.score || 0)}%
                                </div>
                                <Badge variant="outline" className="text-xs mt-1 border-gray-300">
                                    {getScoreLabel(dimensionBreakdown.skill_match?.score || 0)}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {dimensionBreakdown.skill_match?.evidence ? (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-700 mb-2">Evidence:</div>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    {dimensionBreakdown.skill_match.evidence.slice(0, 4).map((evidence: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-gray-400 mt-1">•</span>
                                            <span>{evidence}</span>
                                        </li>
                                    ))}
                                    {dimensionBreakdown.skill_match.evidence.length > 4 && (
                                        <li className="text-xs text-gray-400 italic ml-3">
                                            +{dimensionBreakdown.skill_match.evidence.length - 4} more insights...
                                        </li>
                                    )}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No detailed evidence available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Experience Analysis Card */}
                <Card className="border border-gray-200 hover:shadow-md transition-all duration-200 bg-white">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Briefcase className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-gray-900">Experience Analysis</CardTitle>
                                    <p className="text-sm text-gray-500">{dimensionDescriptions.experience_fit}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-3xl font-bold ${getScoreColor(dimensionBreakdown.experience_fit?.score || 0)}`}>
                                    {Math.round(dimensionBreakdown.experience_fit?.score || 0)}%
                                </div>
                                <Badge variant="outline" className="text-xs mt-1 border-gray-300">
                                    {getScoreLabel(dimensionBreakdown.experience_fit?.score || 0)}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {dimensionBreakdown.experience_fit?.evidence ? (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-700 mb-2">Evidence:</div>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    {dimensionBreakdown.experience_fit.evidence.slice(0, 4).map((evidence: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-gray-400 mt-1">•</span>
                                            <span>{evidence}</span>
                                        </li>
                                    ))}
                                    {dimensionBreakdown.experience_fit.evidence.length > 4 && (
                                        <li className="text-xs text-gray-400 italic ml-3">
                                            +{dimensionBreakdown.experience_fit.evidence.length - 4} more insights...
                                        </li>
                                    )}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No detailed evidence available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Education Card */}
                <Card className="border border-gray-200 hover:shadow-md transition-all duration-200 bg-white">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <GraduationCap className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-gray-900">Education</CardTitle>
                                    <p className="text-sm text-gray-500">{dimensionDescriptions.certs_education}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-3xl font-bold ${getScoreColor(dimensionBreakdown.certs_education?.score || 0)}`}>
                                    {Math.round(dimensionBreakdown.certs_education?.score || 0)}%
                                </div>
                                <Badge variant="outline" className="text-xs mt-1 border-gray-300">
                                    {getScoreLabel(dimensionBreakdown.certs_education?.score || 0)}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {dimensionBreakdown.certs_education?.evidence ? (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-700 mb-2">Evidence:</div>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    {dimensionBreakdown.certs_education.evidence.slice(0, 4).map((evidence: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-gray-400 mt-1">•</span>
                                            <span>{evidence}</span>
                                        </li>
                                    ))}
                                    {dimensionBreakdown.certs_education.evidence.length > 4 && (
                                        <li className="text-xs text-gray-400 italic ml-3">
                                            +{dimensionBreakdown.certs_education.evidence.length - 4} more insights...
                                        </li>
                                    )}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No detailed evidence available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Certificates & Extras */}
                <Card className="border border-gray-200 hover:shadow-md transition-all duration-200 bg-white">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Star className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-gray-900">Certificates & Extras</CardTitle>
                                    <p className="text-sm text-gray-500">{dimensionDescriptions.extras}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-3xl font-bold ${getScoreColor(dimensionBreakdown.extras?.score || 0)}`}>
                                    {Math.round(dimensionBreakdown.extras?.score || 0)}%
                                </div>
                                <Badge variant="outline" className="text-xs mt-1 border-gray-300">
                                    {getScoreLabel(dimensionBreakdown.extras?.score || 0)}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {dimensionBreakdown.extras?.evidence ? (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-700 mb-2">Evidence:</div>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    {dimensionBreakdown.extras.evidence.slice(0, 4).map((evidence: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-gray-400 mt-1">•</span>
                                            <span>{evidence}</span>
                                        </li>
                                    ))}
                                    {dimensionBreakdown.extras.evidence.length > 4 && (
                                        <li className="text-xs text-gray-400 italic ml-3">
                                            +{dimensionBreakdown.extras.evidence.length - 4} more insights...
                                        </li>
                                    )}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No detailed evidence available</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Risk Flags and Hard Filter Failures Cards - Minimal Design */}
            {(riskFlags.length > 0 || hardFilterFailures.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Risk Flags Card */}
                    {riskFlags.length > 0 && (
                        <Card className="border border-amber-200 hover:shadow-md transition-all duration-200 bg-white">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 rounded-lg">
                                        <AlertTriangle className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-gray-900">Risk Flags</CardTitle>
                                        <p className="text-sm text-gray-500">Areas that may require attention or clarification</p>
                                    </div>
                                    <Badge variant="outline" className="ml-auto border-amber-300 text-amber-600">
                                        {riskFlags.length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {riskFlags.map((flag, idx) => (
                                        <li key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-700 leading-relaxed">{flag}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Hard Filter Failures Card */}
                    {hardFilterFailures.length > 0 && (
                        <Card className="border border-red-200 hover:shadow-md transition-all duration-200 bg-white">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        <XCircle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-gray-900">Hard Filter Failures</CardTitle>
                                        <p className="text-sm text-gray-500">Critical requirements that are not met</p>
                                    </div>
                                    <Badge variant="outline" className="ml-auto border-red-300 text-red-600">
                                        {hardFilterFailures.length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {hardFilterFailures.map((failure, idx) => (
                                        <li key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                            <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-700 leading-relaxed">{failure}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Detailed Analysis Dropdown - Minimal Design */}
            <Card className="border border-gray-200 bg-white">
                <CardHeader>
                    <Collapsible open={showDetailedAnalysis} onOpenChange={setShowDetailedAnalysis}>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between p-0 h-auto text-gray-700 hover:text-gray-900">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <BarChart3 className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-semibold text-gray-900">Detailed Analysis</h3>
                                        <p className="text-sm text-gray-500">Comprehensive breakdown of all evaluation dimensions</p>
                                    </div>
                                </div>
                                {showDetailedAnalysis ? (
                                    <ChevronUp className="h-6 w-6" />
                                ) : (
                                    <ChevronDown className="h-6 w-6" />
                                )}
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-6">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {Object.entries(dimensionBreakdown).map(([key, dimension]) => {
                                    if (!dimension || typeof dimension !== 'object') return null;

                                    const Icon = dimensionIcons[key] || Target;
                                    const dimScore = dimension as DimensionScore;

                                    return (
                                        <Card key={key} className="border border-gray-200 hover:shadow-sm transition-shadow bg-white">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="h-5 w-5 text-gray-600" />
                                                        <h4 className="font-medium text-sm capitalize text-gray-900">
                                                            {key.replace(/_/g, ' ')}
                                                        </h4>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-2xl font-bold ${getScoreColor(dimScore.score || 0)}`}>
                                                            {Math.round(dimScore.score || 0)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Weight: {Math.round((dimScore.weight || 0) * 100)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-0 space-y-3">
                                                <p className="text-xs text-gray-500">
                                                    {dimensionDescriptions[key] || 'No description available'}
                                                </p>

                                                {dimScore.evidence && dimScore.evidence.length > 0 && (
                                                    <div className="space-y-1">
                                                        <div className="text-xs font-medium text-gray-700">Evidence:</div>
                                                        <ul className="text-xs space-y-1 text-gray-600">
                                                            {dimScore.evidence.slice(0, 3).map((evidence, idx) => (
                                                                <li key={idx} className="flex items-start gap-1">
                                                                    <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
                                                                    <span className="leading-tight">{evidence}</span>
                                                                </li>
                                                            ))}
                                                            {dimScore.evidence.length > 3 && (
                                                                <li className="text-xs text-gray-400 italic">
                                                                    +{dimScore.evidence.length - 3} more insights...
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Risk Flags and Hard Filter Failures in Detailed View */}
                            {(riskFlags.length > 0 || hardFilterFailures.length > 0) && (
                                <div className="mt-6 grid gap-4 md:grid-cols-2">
                                    {riskFlags.length > 0 && (
                                        <Card className="border border-amber-200 bg-amber-50">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center gap-2 text-amber-800">
                                                    <AlertTriangle className="h-5 w-5" />
                                                    Risk Flags ({riskFlags.length})
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-1 text-sm text-amber-700">
                                                    {riskFlags.map((flag, idx) => (
                                                        <li key={idx} className="flex items-start gap-2">
                                                            <span className="text-amber-500 mt-1">⚠</span>
                                                            <span>{flag}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {hardFilterFailures.length > 0 && (
                                        <Card className="border border-red-200 bg-red-50">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center gap-2 text-red-800">
                                                    <XCircle className="h-5 w-5" />
                                                    Hard Filter Failures ({hardFilterFailures.length})
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-1 text-sm text-red-700">
                                                    {hardFilterFailures.map((failure, idx) => (
                                                        <li key={idx} className="flex items-start gap-2">
                                                            <span className="text-red-500 mt-1">✗</span>
                                                            <span>{failure}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                </CardHeader>
            </Card>

            {/* Action Buttons - Minimal Design */}
            <div className="flex gap-3 justify-center">
                <Button variant="outline" className="flex items-center gap-2 border-gray-300">
                    <Download className="h-4 w-4" />
                    Download Resume
                </Button>
                <Button variant="outline" className="flex items-center gap-2 border-gray-300">
                    <Eye className="h-4 w-4" />
                    View Full Resume
                </Button>
                <Button variant="outline" onClick={refetch} className="flex items-center gap-2 border-gray-300">
                    <RefreshCw className="h-4 w-4" />
                    Refresh Analysis
                </Button>
            </div>
        </div>
    );
}
