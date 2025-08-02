"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Brain,
    Target,
    Award,
    Users,
    Code,
    BookOpen,
    MessageSquare,
    GraduationCap,
    Star,
    RotateCcw
} from "lucide-react"

interface DimensionScore {
    score: number;
    weight: number;
    evidence: string[];
}

interface AnalysisResult {
    overall_score: number;
    passed_hard_filters: boolean;
    dimension_breakdown: {
        skill_match: DimensionScore;
        experience_fit: DimensionScore;
        impact_outcomes: DimensionScore;
        role_alignment: DimensionScore;
        project_tech_depth: DimensionScore;
        career_trajectory: DimensionScore;
        communication_clarity: DimensionScore;
        certs_education: DimensionScore;
        extras: DimensionScore;
    };
    hard_filter_failures: string[];
    risk_flags: string[];
    confidence: number;
}

interface ReviewResponse {
    jd: string | any; // Allow both string and object formats
    resume: string | any; // Allow both string and object formats
    analysis: AnalysisResult;
}

interface ResumeAnalysisResultsProps {
    analysis: ReviewResponse;
    onNewAnalysis: () => void;
}

const dimensionIcons: Record<string, any> = {
    skill_match: Target,
    experience_fit: Users,
    impact_outcomes: Award,
    role_alignment: CheckCircle,
    project_tech_depth: Code,
    career_trajectory: TrendingUp,
    communication_clarity: MessageSquare,
    certs_education: GraduationCap,
    extras: Star,
};

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

export function ResumeAnalysisResults({ analysis, onNewAnalysis }: ResumeAnalysisResultsProps) {
    // Debug logging
    console.log('ResumeAnalysisResults received analysis:', analysis);
    console.log('Analysis JD type:', typeof analysis.jd);
    console.log('Analysis JD value:', analysis.jd);

    // Safety check for analysis data
    if (!analysis || !analysis.analysis) {
        console.error('Invalid analysis data:', analysis);
        return (
            <div className="text-center p-8">
                <p className="text-red-600">Invalid analysis data received</p>
            </div>
        );
    }

    // Ensure dimension_breakdown exists and is an object
    if (!analysis.analysis.dimension_breakdown || typeof analysis.analysis.dimension_breakdown !== 'object') {
        console.error('Invalid dimension_breakdown:', analysis.analysis.dimension_breakdown);
        return (
            <div className="text-center p-8">
                <p className="text-red-600">Analysis dimension data is missing or corrupted</p>
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return "bg-green-100 border-green-200";
        if (score >= 60) return "bg-yellow-100 border-yellow-200";
        return "bg-red-100 border-red-200";
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return "bg-green-500";
        if (score >= 60) return "bg-yellow-500";
        return "bg-red-500";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return "Excellent";
        if (score >= 80) return "Good";
        if (score >= 70) return "Fair";
        if (score >= 60) return "Below Average";
        return "Poor";
    };

    return (
        <div className="max-w-6xl mx-auto w-full space-y-6">
            {/* Header with Overall Score */}
            <Card className={`${getScoreBgColor(analysis.analysis.overall_score)} border-2`}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/50">
                                <Brain className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">AI Resume Analysis Results</CardTitle>
                                <p className="text-muted-foreground">Comprehensive ATS compatibility assessment</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={onNewAnalysis}
                            className="flex items-center gap-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                            New Analysis
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Overall Score */}
                        <div className="text-center">
                            <div className={`text-6xl font-bold ${getScoreColor(analysis.analysis.overall_score || 0)} mb-2`}>
                                {Math.round(analysis.analysis.overall_score || 0)}
                            </div>
                            <div className="text-lg font-medium mb-1">Overall Score</div>
                            <Badge variant="secondary" className="text-xs">
                                {getScoreLabel(analysis.analysis.overall_score || 0)}
                            </Badge>
                        </div>

                        {/* Status Indicators */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                {(analysis.analysis.passed_hard_filters ?? true) ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                <span className={`font-medium ${(analysis.analysis.passed_hard_filters ?? true) ? 'text-green-600' : 'text-red-600'}`}>
                                    {(analysis.analysis.passed_hard_filters ?? true) ? 'Passed Hard Filters' : 'Failed Hard Filters'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">
                                    AI Confidence: {Math.round((analysis.analysis.confidence || 0) * 100)}%
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {(analysis.analysis.risk_flags && analysis.analysis.risk_flags.length === 0) ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                )}
                                <span className="font-medium">
                                    {analysis.analysis.risk_flags?.length || 0} Risk Flag{(analysis.analysis.risk_flags?.length || 0) !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {/* Score Progress */}
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Score Distribution</div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Poor (0-59)</span>
                                    <span>Excellent (90-100)</span>
                                </div>
                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-1000 rounded-full"
                                        style={{
                                            width: `${analysis.analysis.overall_score}%`,
                                            background: `linear-gradient(to right, 
                        #ef4444 0%, #ef4444 20%, 
                        #f59e0b 20%, #f59e0b 40%, 
                        #eab308 40%, #eab308 60%, 
                        #84cc16 60%, #84cc16 80%, 
                        #22c55e 80%, #22c55e 100%)`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dimension Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-6 w-6" />
                        Detailed Score Breakdown
                    </CardTitle>
                    <p className="text-muted-foreground">
                        Analysis across 9 key dimensions with AI-powered evidence and weighted scoring
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {analysis.analysis.dimension_breakdown && Object.entries(analysis.analysis.dimension_breakdown).map(([key, dimension]) => {
                            // Safety check for dimension object
                            if (!dimension || typeof dimension !== 'object') {
                                return null;
                            }

                            const Icon = dimensionIcons[key] || Target;
                            return (
                                <Card key={key} className="border-2 hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-5 w-5 text-blue-600" />
                                                <h4 className="font-medium text-sm capitalize">
                                                    {key.replace(/_/g, ' ')}
                                                </h4>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-2xl font-bold ${getScoreColor(dimension.score || 0)}`}>
                                                    {Math.round(dimension.score || 0)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Weight: {Math.round((dimension.weight || 0) * 100)}%
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0 space-y-3">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(dimension.score || 0)}`}
                                                style={{ width: `${dimension.score || 0}%` }}
                                            />
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            {dimensionDescriptions[key] || 'No description available'}
                                        </p>

                                        {(dimension.evidence && dimension.evidence.length > 0) && (
                                            <div className="space-y-1">
                                                <div className="text-xs font-medium text-green-700">Evidence:</div>
                                                <ul className="text-xs space-y-1 text-muted-foreground">
                                                    {dimension.evidence.slice(0, 3).map((evidence, idx) => (
                                                        <li key={idx} className="flex items-start gap-1">
                                                            <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                                                            <span className="leading-tight">{evidence}</span>
                                                        </li>
                                                    ))}
                                                    {dimension.evidence.length > 3 && (
                                                        <li className="text-xs text-muted-foreground italic">
                                                            +{dimension.evidence.length - 3} more insights...
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
                </CardContent>
            </Card>

            {/* Alerts Section */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Risk Flags */}
                {(analysis.analysis.risk_flags && analysis.analysis.risk_flags.length > 0) && (
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-yellow-800">
                                <AlertTriangle className="h-5 w-5" />
                                Risk Flags ({analysis.analysis.risk_flags.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {analysis.analysis.risk_flags.map((flag, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-yellow-800 text-sm">
                                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        {flag}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Hard Filter Failures */}
                {(analysis.analysis.hard_filter_failures && analysis.analysis.hard_filter_failures.length > 0) && (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-800">
                                <XCircle className="h-5 w-5" />
                                Hard Filter Failures ({analysis.analysis.hard_filter_failures.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {analysis.analysis.hard_filter_failures.map((failure, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-red-800 text-sm">
                                        <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        {failure}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Success Message if no issues */}
                {(!analysis.analysis.risk_flags || analysis.analysis.risk_flags.length === 0) &&
                    (!analysis.analysis.hard_filter_failures || analysis.analysis.hard_filter_failures.length === 0) && (
                        <Card className="border-green-200 bg-green-50 md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-800">
                                    <CheckCircle className="h-5 w-5" />
                                    All Checks Passed!
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-green-800 text-sm">
                                    Great news! This resume passed all hard filters and has no significant risk flags.
                                    The candidate appears to be a strong match for the position.
                                </p>
                            </CardContent>
                        </Card>
                    )}
            </div>

            {/* Resume and Job Description */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Extracted Resume Text
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-y-auto bg-muted p-4 rounded text-sm whitespace-pre-wrap font-mono">
                            {typeof analysis.resume === 'string' ? analysis.resume : JSON.stringify(analysis.resume, null, 2)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Job Description
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-y-auto bg-muted p-4 rounded text-sm whitespace-pre-wrap">
                            {(() => {
                                // Handle both string and object formats
                                try {
                                    if (typeof analysis.jd === 'string') {
                                        return analysis.jd;
                                    } else if (typeof analysis.jd === 'object' && analysis.jd) {
                                        // If it's an object, render it in a structured way
                                        const jdObj = analysis.jd as any;
                                        return (
                                            <div className="space-y-4">
                                                {jdObj.requirements && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Requirements:</h4>
                                                        <p>{Array.isArray(jdObj.requirements) ? jdObj.requirements.join('\n') : String(jdObj.requirements)}</p>
                                                    </div>
                                                )}
                                                {jdObj.responsibilities && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Responsibilities:</h4>
                                                        <p>{Array.isArray(jdObj.responsibilities) ? jdObj.responsibilities.join('\n') : String(jdObj.responsibilities)}</p>
                                                    </div>
                                                )}
                                                {jdObj.benefits && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Benefits:</h4>
                                                        <p>{Array.isArray(jdObj.benefits) ? jdObj.benefits.join('\n') : String(jdObj.benefits)}</p>
                                                    </div>
                                                )}
                                                {jdObj.experience && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Experience:</h4>
                                                        <p>{String(jdObj.experience)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    } else {
                                        return "No job description available";
                                    }
                                } catch (error) {
                                    console.error('Error rendering job description:', error);
                                    return "Error displaying job description";
                                }
                            })()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* AI Analysis Summary */}
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Brain className="h-5 w-5" />
                        AI Analysis Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <div className="font-medium text-blue-800 mb-1">Overall Assessment</div>
                            <p className="text-blue-700">
                                {analysis.analysis.overall_score >= 80 ?
                                    "Strong candidate with excellent alignment to job requirements." :
                                    analysis.analysis.overall_score >= 60 ?
                                        "Good candidate with moderate alignment to job requirements." :
                                        "Candidate shows some gaps in key requirements."
                                }
                            </p>
                        </div>
                        <div>
                            <div className="font-medium text-blue-800 mb-1">Key Strengths</div>
                            <p className="text-blue-700">
                                {Object.entries(analysis.analysis.dimension_breakdown)
                                    .sort((a, b) => b[1].score - a[1].score)
                                    .slice(0, 2)
                                    .map(([key]) => key.replace(/_/g, ' '))
                                    .join(', ')}
                            </p>
                        </div>
                        <div>
                            <div className="font-medium text-blue-800 mb-1">Improvement Areas</div>
                            <p className="text-blue-700">
                                {Object.entries(analysis.analysis.dimension_breakdown)
                                    .sort((a, b) => a[1].score - b[1].score)
                                    .slice(0, 2)
                                    .map(([key]) => key.replace(/_/g, ' '))
                                    .join(', ')}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
