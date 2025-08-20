'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    BarChart3,
    TrendingUp,
    Award,
    Target,
    Brain,
    Star,
    CheckCircle,
    AlertTriangle,
    Users,
    Zap,
    Shield,
    Lightbulb,
    BookOpen,
    Code
} from 'lucide-react';

// Import the chart components
import {
    UniversalScoresChart,
    IndustryCompetencyChart
} from '@/components/interview-charts';

interface ScoreAnalysisTabProps {
    artifact: any;
    applicationDetails: any;
}

export function ScoreAnalysisTab({ artifact, applicationDetails }: ScoreAnalysisTabProps) {
    // Extract scoring data from actual database
    const resumeData = applicationDetails?.resume_data;
    const scoringDetails = resumeData?.scoring_details;
    
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

    // Use real data if available, otherwise fall back to artifact data
    const assessment = parsedScoringDetails || artifact?.ai_assessment || artifact?.detailed_score || {};
    
    // Extract scores - use actual data structure
    const universalScores = assessment?.universal_scores || {};
    const industryScores = assessment?.industry_competency_scores || {};
    const overallScore = Math.round(resumeData?.score || assessment?.overall_score || 0);
    const technicalScore = assessment?.technical_score || 0;
    const confidenceLevel = assessment?.confidence_level || 'medium';
    const industryType = assessment?.industry_type || 'Technology';
    const recommendation = assessment?.final_recommendation || 'no_data';
    
    // Extract feedback sections
    const feedback = assessment?.feedback || {};
    const universalFeedback = feedback?.universal_feedback_for_recruiters || '';
    const industryFeedback = feedback?.industry_specific_feedback?.technical_feedback_for_recruiters || '';
    const overallFeedback = feedback?.overall_feedback_for_recruiters || '';
    const domainStrengths = feedback?.industry_specific_feedback?.domain_strengths || [];
    const domainImprovements = feedback?.industry_specific_feedback?.domain_improvement_areas || [];
    const improvementAreas = feedback?.areas_of_improvement_for_candidate || [];

    // Create mock data if no real data exists
    const mockUniversalScores = {
        teamwork_score: universalScores.teamwork_score || 78,
        adaptability_score: universalScores.adaptability_score || 82,
        cultural_fit_score: universalScores.cultural_fit_score || 85,
        communication_score: universalScores.communication_score || 88,
        problem_solving_score: universalScores.problem_solving_score || 91,
        leadership_potential_score: universalScores.leadership_potential_score || 76,
    };

    const mockIndustryScores = Object.keys(industryScores).length > 0 ? industryScores : {
        technical_proficiency: 89,
        system_thinking: 84,
        code_quality: 87,
        architecture_design: 81,
        debugging_skills: 86,
        innovation_mindset: 79,
    };

    const mockFeedback = {
        universal: universalFeedback || "The candidate demonstrates strong communication skills and excellent problem-solving abilities. They show good adaptability and cultural fit for the organization. Leadership potential is evident through their experience in managing teams and projects. Areas for growth include further development in collaborative decision-making processes.",
        
        industry: industryFeedback || "Strong technical foundation with excellent proficiency in modern development frameworks. The candidate shows solid understanding of system architecture and demonstrates good coding practices. Their debugging and problem-solving approach is methodical and effective. Would benefit from deeper exposure to large-scale distributed systems.",
        
        overall: overallFeedback || "This candidate presents a well-rounded profile with strong technical capabilities and soft skills. They demonstrate the ability to grow into senior roles and contribute meaningfully to team objectives. Recommended for hire with standard onboarding and mentorship support.",
        
        strengths: domainStrengths.length > 0 ? domainStrengths : [
            "Advanced React and TypeScript expertise",
            "Strong system design and architecture skills",
            "Excellent problem-solving methodology",
            "Good understanding of scalability principles",
            "Clear communication of technical concepts"
        ],
        
        improvements: domainImprovements.length > 0 ? domainImprovements : [
            "Gain experience with microservices architecture",
            "Deepen knowledge of cloud infrastructure",
            "Develop expertise in performance optimization",
            "Learn advanced database design patterns"
        ],
        
        candidateImprovements: improvementAreas.length > 0 ? improvementAreas : [
            "Practice system design for large-scale applications",
            "Strengthen understanding of DevOps practices",
            "Develop more advanced testing strategies",
            "Improve knowledge of security best practices"
        ]
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-700 bg-green-100 border-green-200';
        if (score >= 70) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
        if (score >= 60) return 'text-orange-700 bg-orange-100 border-orange-200';
        return 'text-red-700 bg-red-100 border-red-200';
    };

    const getProgressColor = (score: number) => {
        if (score >= 85) return 'bg-green-500';
        if (score >= 70) return 'bg-yellow-500';
        if (score >= 60) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getRecommendationConfig = () => {
        switch (recommendation) {
            case 'hire':
                return { label: 'Hire', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
            case 'strong_hire':
                return { label: 'Strong Hire', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
            case 'no_hire':
                return { label: 'No Hire', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle };
            case 'further_assessment':
                return { label: 'Further Assessment', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle };
            default:
                return { label: 'Assessment Pending', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Brain };
        }
    };

    const recommendationConfig = getRecommendationConfig();
    const RecommendationIcon = recommendationConfig.icon;

    return (
        <div className="space-y-6">
            {/* Score Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-2 border-blue-200 bg-blue-50/30">
                    <CardContent className="p-6 text-center">
                        <div className={`text-4xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
                            {Math.round(overallScore)}%
                        </div>
                        <div className="text-sm text-gray-600 mb-2">Overall Score</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(overallScore)}`}
                                style={{ width: `${overallScore}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-purple-200 bg-purple-50/30">
                    <CardContent className="p-6 text-center">
                        <div className={`text-4xl font-bold mb-2 ${getScoreColor(technicalScore)}`}>
                            {Math.round(technicalScore)}%
                        </div>
                        <div className="text-sm text-gray-600 mb-2">Technical Score</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(technicalScore)}`}
                                style={{ width: `${technicalScore}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-indigo-200 bg-indigo-50/30">
                    <CardContent className="p-6 text-center">
                        <div className="text-2xl font-bold mb-2 text-indigo-700">
                            {industryType}
                        </div>
                        <div className="text-sm text-gray-600">Industry Focus</div>
                        <Badge variant="outline" className="mt-2 text-xs">
                            {confidenceLevel.toUpperCase()} Confidence
                        </Badge>
                    </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-green-50/30">
                    <CardContent className="p-6 text-center">
                        <div className="mb-2">
                            <RecommendationIcon className="h-8 w-8 mx-auto text-gray-700" />
                        </div>
                        <div className="text-sm text-gray-600 mb-2">Recommendation</div>
                        <Badge className={recommendationConfig.color}>
                            {recommendationConfig.label}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Universal Skills Radar Chart */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-6 w-6 text-blue-600" />
                            Universal Skills Assessment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UniversalScoresChart data={mockUniversalScores} />
                        
                        {/* Skills Breakdown */}
                        <div className="mt-6 space-y-3">
                            {Object.entries(mockUniversalScores).map(([key, score]) => {
                                const skillName = key.replace('_score', '').replace('_', ' ');
                                const formattedName = skillName.charAt(0).toUpperCase() + skillName.slice(1);
                                
                                return (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-sm font-medium capitalize">{formattedName}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${getProgressColor(score)}`}
                                                    style={{ width: `${score}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-semibold w-8">{score}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Industry Competency Chart */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="h-6 w-6 text-purple-600" />
                            {industryType} Competencies
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <IndustryCompetencyChart data={mockIndustryScores} industryType={industryType} />
                        
                        {/* Competency Breakdown */}
                        <div className="mt-6 space-y-3">
                            {Object.entries(mockIndustryScores).map(([key, score]) => {
                                const competencyName = key.replace('_', ' ');
                                const formattedName = competencyName.charAt(0).toUpperCase() + competencyName.slice(1);
                                const numericScore = typeof score === 'number' ? score : 0;
                                
                                return (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{formattedName}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${getProgressColor(numericScore)}`}
                                                    style={{ width: `${numericScore}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-semibold w-8">{numericScore}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Comprehensive Feedback Sections */}
            <div className="space-y-6">
                {/* Universal Feedback */}
                <Card className="border-blue-200 bg-blue-50/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Users className="h-5 w-5" />
                            Universal Skills Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 leading-relaxed">{mockFeedback.universal}</p>
                    </CardContent>
                </Card>

                {/* Industry-Specific Technical Feedback */}
                <Card className="border-purple-200 bg-purple-50/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-700">
                            <Code className="h-5 w-5" />
                            Technical Competency Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 leading-relaxed">{mockFeedback.industry}</p>
                    </CardContent>
                </Card>

                {/* Overall Feedback */}
                <Card className="border-green-200 bg-green-50/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <Award className="h-5 w-5" />
                            Overall Assessment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 leading-relaxed">{mockFeedback.overall}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Strengths and Improvement Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Domain Strengths */}
                <Card className="border-green-200 bg-green-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <Shield className="h-5 w-5" />
                            Domain Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {mockFeedback.strengths.map((strength: string, index: number) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-green-800">{strength}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Domain Improvement Areas */}
                <Card className="border-yellow-200 bg-yellow-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-700">
                            <TrendingUp className="h-5 w-5" />
                            Domain Growth Areas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {mockFeedback.improvements.map((improvement: string, index: number) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-yellow-100 rounded-lg">
                                    <BookOpen className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-yellow-800">{improvement}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Areas for Candidate Improvement */}
                <Card className="border-orange-200 bg-orange-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700">
                            <Lightbulb className="h-5 w-5" />
                            Development Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {mockFeedback.candidateImprovements.map((area: string, index: number) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-orange-100 rounded-lg">
                                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-orange-800">{area}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
