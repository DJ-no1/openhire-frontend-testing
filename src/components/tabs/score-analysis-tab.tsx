"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Code,
} from "lucide-react";

// Import the chart components
import {
  UniversalScoresChart,
  IndustryCompetencyChart,
} from "@/components/interview-charts";

interface ScoreAnalysisTabProps {
  artifact: any;
  applicationDetails: any;
}

export function ScoreAnalysisTab({
  artifact,
  applicationDetails,
}: ScoreAnalysisTabProps) {
  // Extract scoring data from actual database - prioritize interview artifacts
  const interviewAssessment =
    artifact?.ai_assessment || artifact?.detailed_score;
  const resumeData = applicationDetails?.resume_data;
  const scoringDetails = resumeData?.scoring_details;

  // Parse scoring details if available
  let parsedScoringDetails = null;
  if (scoringDetails) {
    try {
      // Handle nested structure: scoring_details.analysis contains the actual data
      const parsed =
        typeof scoringDetails === "string"
          ? JSON.parse(scoringDetails)
          : scoringDetails;

      // Extract analysis from nested structure
      parsedScoringDetails = parsed?.analysis || parsed;
    } catch (error) {
      console.warn("Could not parse scoring details:", error);
    }
  }

  // Use interview data first, then resume data, then artifact data
  const assessment = interviewAssessment || parsedScoringDetails || {};

  console.log("📊 Score Analysis - Assessment data:", assessment);

  // Extract scores - use actual data structure
  const universalScores = assessment?.universal_scores || {};
  const industryScores = assessment?.industry_competency_scores || {};
  const overallScore = Math.round(
    artifact?.overall_score ||
      resumeData?.score ||
      assessment?.overall_score ||
      0
  );
  const technicalScore = assessment?.technical_score || overallScore;
  const confidenceLevel =
    assessment?.confidence_level ||
    (assessment?.confidence
      ? assessment.confidence >= 0.85
        ? "high"
        : assessment.confidence >= 0.7
        ? "medium"
        : "low"
      : "medium");
  const industryType = assessment?.industry_type || "Technology";
  const recommendation = assessment?.final_recommendation || "no_data";

  // Extract feedback sections
  const feedback = assessment?.feedback || {};
  const universalFeedback = feedback?.universal_feedback_for_recruiters || "";
  const industryFeedback =
    feedback?.industry_specific_feedback?.technical_feedback_for_recruiters ||
    "";
  const overallFeedback =
    feedback?.overall_feedback_for_recruiters ||
    artifact?.overall_feedback ||
    "";
  const domainStrengths =
    feedback?.industry_specific_feedback?.domain_strengths || [];
  const domainImprovements =
    feedback?.industry_specific_feedback?.domain_improvement_areas || [];
  const improvementAreas = feedback?.areas_of_improvement_for_candidate || [];

  // Use real data - no mock data fallback
  const actualUniversalScores = {
    teamwork_score: universalScores.teamwork_score || 0,
    adaptability_score: universalScores.adaptability_score || 0,
    cultural_fit_score: universalScores.cultural_fit_score || 0,
    communication_score: universalScores.communication_score || 0,
    problem_solving_score: universalScores.problem_solving_score || 0,
    leadership_potential_score: universalScores.leadership_potential_score || 0,
  };

  const actualIndustryScores = industryScores;

  const actualFeedback = {
    universal: universalFeedback,
    industry: industryFeedback,
    overall: overallFeedback,
    strengths: domainStrengths,
    improvements: domainImprovements,
    candidateImprovements: improvementAreas,
  };

  // Check if we have any real data
  const hasUniversalScores = Object.values(actualUniversalScores).some(
    (score) => score > 0
  );
  const hasIndustryScores = Object.keys(actualIndustryScores).length > 0;
  const hasFeedback =
    actualFeedback.universal ||
    actualFeedback.industry ||
    actualFeedback.overall;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-700 bg-green-100 border-green-200";
    if (score >= 70) return "text-yellow-700 bg-yellow-100 border-yellow-200";
    if (score >= 60) return "text-orange-700 bg-orange-100 border-orange-200";
    return "text-red-700 bg-red-100 border-red-200";
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    if (score >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  const getRecommendationConfig = () => {
    switch (recommendation) {
      case "hire":
        return {
          label: "Hire",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
        };
      case "strong_hire":
        return {
          label: "Strong Hire",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
        };
      case "no_hire":
        return {
          label: "No Hire",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: AlertTriangle,
        };
      case "further_assessment":
        return {
          label: "Further Assessment",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: AlertTriangle,
        };
      default:
        return {
          label: "Assessment Pending",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Brain,
        };
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
            <div
              className={`text-4xl font-bold mb-2 ${getScoreColor(
                overallScore
              )}`}
            >
              {Math.round(overallScore)}%
            </div>
            <div className="text-sm text-gray-600 mb-2">Overall Score</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(
                  overallScore
                )}`}
                style={{ width: `${overallScore}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50/30">
          <CardContent className="p-6 text-center">
            <div
              className={`text-4xl font-bold mb-2 ${getScoreColor(
                technicalScore
              )}`}
            >
              {Math.round(technicalScore)}%
            </div>
            <div className="text-sm text-gray-600 mb-2">Technical Score</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(
                  technicalScore
                )}`}
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
            {hasUniversalScores ? (
              <>
                <UniversalScoresChart data={actualUniversalScores} />

                {/* Skills Breakdown */}
                <div className="mt-6 space-y-3">
                  {Object.entries(actualUniversalScores).map(([key, score]) => {
                    const skillName = key
                      .replace("_score", "")
                      .replace("_", " ");
                    const formattedName =
                      skillName.charAt(0).toUpperCase() + skillName.slice(1);

                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium capitalize">
                          {formattedName}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(
                                score
                              )}`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold w-8">
                            {score}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No universal skills data available</p>
              </div>
            )}
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
            {hasIndustryScores ? (
              <>
                <IndustryCompetencyChart
                  data={actualIndustryScores}
                  industryType={industryType}
                />

                {/* Competency Breakdown */}
                <div className="mt-6 space-y-3">
                  {Object.entries(actualIndustryScores).map(([key, score]) => {
                    const competencyName = key.replace("_", " ");
                    const formattedName =
                      competencyName.charAt(0).toUpperCase() +
                      competencyName.slice(1);
                    const numericScore = typeof score === "number" ? score : 0;

                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">
                          {formattedName}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(
                                numericScore
                              )}`}
                              style={{ width: `${numericScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold w-8">
                            {numericScore}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Code className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No industry competency data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Feedback Sections */}
      {hasFeedback && (
        <div className="space-y-6">
          {/* Universal Feedback */}
          {actualFeedback.universal && (
            <Card className="border-blue-200 bg-blue-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Users className="h-5 w-5" />
                  Universal Skills Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {actualFeedback.universal}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Industry-Specific Technical Feedback */}
          {actualFeedback.industry && (
            <Card className="border-purple-200 bg-purple-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Code className="h-5 w-5" />
                  Technical Competency Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {actualFeedback.industry}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Overall Feedback */}
          {actualFeedback.overall && (
            <Card className="border-green-200 bg-green-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Award className="h-5 w-5" />
                  Overall Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {actualFeedback.overall}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Strengths and Improvement Areas */}
      {(actualFeedback.strengths.length > 0 ||
        actualFeedback.improvements.length > 0 ||
        actualFeedback.candidateImprovements.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Domain Strengths */}
          {actualFeedback.strengths.length > 0 && (
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Shield className="h-5 w-5" />
                  Domain Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {actualFeedback.strengths.map(
                    (strength: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 bg-green-100 rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-800">{strength}</p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Domain Improvement Areas */}
          {actualFeedback.improvements.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <TrendingUp className="h-5 w-5" />
                  Domain Growth Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {actualFeedback.improvements.map(
                    (improvement: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 bg-yellow-100 rounded-lg"
                      >
                        <BookOpen className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-800">{improvement}</p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Areas for Candidate Improvement */}
          {actualFeedback.candidateImprovements.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Lightbulb className="h-5 w-5" />
                  Development Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {actualFeedback.candidateImprovements.map(
                    (area: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 bg-orange-100 rounded-lg"
                      >
                        <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-orange-800">{area}</p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
