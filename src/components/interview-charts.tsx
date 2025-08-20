"use client"

import { TrendingUp, MessageSquare, Brain, Target } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

// Universal Skills Radar Chart Component
interface UniversalScoresChartProps {
    data?: {
        teamwork_score?: number;
        adaptability_score?: number;
        cultural_fit_score?: number;
        communication_score?: number;
        problem_solving_score?: number;
        leadership_potential_score?: number;
    } | null;
}

const universalChartConfig = {
    score: {
        label: "Score",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export function UniversalScoresChart({ data }: UniversalScoresChartProps) {
    // Provide default values if data is missing
    const safeData = {
        teamwork_score: data?.teamwork_score || 0,
        adaptability_score: data?.adaptability_score || 0,
        cultural_fit_score: data?.cultural_fit_score || 0,
        communication_score: data?.communication_score || 0,
        problem_solving_score: data?.problem_solving_score || 0,
        leadership_potential_score: data?.leadership_potential_score || 0,
    };

    const chartData = [
        { skill: "Teamwork", score: safeData.teamwork_score },
        { skill: "Adaptability", score: safeData.adaptability_score },
        { skill: "Cultural Fit", score: safeData.cultural_fit_score },
        { skill: "Communication", score: safeData.communication_score },
        { skill: "Problem Solving", score: safeData.problem_solving_score },
        { skill: "Leadership", score: safeData.leadership_potential_score },
    ]

    const averageScore = Object.values(safeData).reduce((sum, score) => sum + score, 0) / Object.values(safeData).length

    // Show placeholder if no data
    if (averageScore === 0) {
        return (
            <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="items-center pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Brain className="h-4 w-4 text-blue-600" />
                        Universal Skills Assessment
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-600">
                        Core competencies evaluation
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                    <div className="flex items-center justify-center h-[180px] text-gray-500">
                        <div className="text-center">
                            <Brain className="h-8 w-8 mx-auto mb-3 opacity-50 text-gray-400" />
                            <p className="text-xs font-medium">Assessment data not available</p>
                            <p className="text-xs">Scores will appear here once assessment is complete</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="items-center pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Brain className="h-4 w-4 text-blue-600" />
                    Universal Skills Assessment
                </CardTitle>
                <CardDescription className="text-xs text-gray-600">
                    Core competencies evaluation
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
                <ChartContainer
                    config={universalChartConfig}
                    className="mx-auto aspect-square max-h-[180px]"
                >
                    <RadarChart data={chartData}>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                            labelFormatter={(label) => `${label}`}
                        />
                        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                        <PolarGrid />
                        <Radar
                            dataKey="score"
                            fill="hsl(217 91% 60%)"
                            fillOpacity={0.3}
                            stroke="hsl(217 91% 60%)"
                            strokeWidth={2}
                            dot={{
                                r: 3,
                                fillOpacity: 1,
                            }}
                        />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-1 text-xs pt-2">
                <div className="flex items-center gap-2 leading-none font-medium text-gray-700">
                    Average Score: {averageScore.toFixed(1)}/100 <Target className="h-3 w-3" />
                </div>
                <div className="text-gray-500 flex items-center gap-2 leading-none">
                    Based on AI assessment analysis
                </div>
            </CardFooter>
        </Card>
    )
}

// Industry Competency Radar Chart Component
interface IndustryCompetencyChartProps {
    data?: Record<string, number> | null;
    industryType?: string;
}

const industryChartConfig = {
    score: {
        label: "Score",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function IndustryCompetencyChart({ data, industryType = "General" }: IndustryCompetencyChartProps) {
    const chartData = data && typeof data === 'object'
        ? Object.entries(data)
            .slice(0, 5) // Always take first 5 keys
            .map(([key, score]) => ({
                skill: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                score: score || 0
            }))
        : []

    // If we have less than 5 items, pad with empty entries to maintain chart shape
    while (chartData.length < 5) {
        chartData.push({
            skill: `Skill ${chartData.length + 1}`,
            score: 0
        })
    }

    const averageScore = chartData.length > 0
        ? chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length
        : 0

    if (chartData.length === 0) {
        return (
            <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="items-center pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="h-4 w-4 text-green-600" />
                        {industryType} Competency Assessment
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-600">
                        Domain-specific skills evaluation
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                    <div className="flex items-center justify-center h-[180px] text-gray-500">
                        <div className="text-center">
                            <Target className="h-8 w-8 mx-auto mb-3 opacity-50 text-gray-400" />
                            <p className="text-xs font-medium">No domain-specific competencies assessed</p>
                            <p className="text-xs">Assessment focused on universal skills</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="items-center pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-4 w-4 text-green-600" />
                    {industryType} Competency Assessment
                </CardTitle>
                <CardDescription className="text-xs text-gray-600">
                    Domain-specific skills evaluation
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
                <ChartContainer
                    config={industryChartConfig}
                    className="mx-auto aspect-square max-h-[180px]"
                >
                    <RadarChart data={chartData}>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                            labelFormatter={(label) => `${label}`}
                        />
                        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                        <PolarGrid />
                        <Radar
                            dataKey="score"
                            fill="hsl(142 76% 36%)"
                            fillOpacity={0.3}
                            stroke="hsl(142 76% 36%)"
                            strokeWidth={2}
                            dot={{
                                r: 3,
                                fillOpacity: 1,
                            }}
                        />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-1 text-xs pt-2">
                <div className="flex items-center gap-2 leading-none font-medium text-gray-700">
                    Average Score: {averageScore.toFixed(1)}/100 <Target className="h-3 w-3" />
                </div>
                <div className="text-gray-500 flex items-center gap-2 leading-none">
                    Industry-specific competency analysis
                </div>
            </CardFooter>
        </Card>
    )
}

// Conversation Engagement Line Chart Component
interface ConversationEngagementChartProps {
    conversationLog?: any[] | null;
    overallScore?: number;
}

const engagementChartConfig = {
    engagement: {
        label: "Engagement Score",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig

export function ConversationEngagementChart({ conversationLog, overallScore = 75 }: ConversationEngagementChartProps) {
    // Generate engagement data from real conversation log with engagement scores
    const generateEngagementData = () => {
        if (!conversationLog || conversationLog.length === 0) {
            // Fallback for when no conversation data is available
            return []
        }

        return conversationLog.map((entry, index) => ({
            interaction: `Q${index + 1}`,
            engagement: entry.engagement_score ? Math.round(entry.engagement_score * 10) : 0, // Convert to 0-100 scale
            timestamp: index + 1,
            questionType: entry.question_type || 'general'
        }))
    }

    const chartData = generateEngagementData()

    // Show empty state if no data
    if (chartData.length === 0) {
        return (
            <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        Conversation Engagement
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-600">Engagement level throughout the interview</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                    <div className="flex items-center justify-center h-[180px] text-gray-500">
                        <div className="text-center">
                            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50 text-gray-400" />
                            <p className="text-xs font-medium">No conversation data available</p>
                            <p className="text-xs">Engagement metrics will appear here after interview completion</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const trend = chartData.length > 1
        ? ((chartData[chartData.length - 1].engagement - chartData[0].engagement) / Math.max(1, chartData[0].engagement)) * 100
        : 0

    const avgEngagement = chartData.reduce((sum, item) => sum + item.engagement, 0) / chartData.length

    return (
        <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    Conversation Engagement
                </CardTitle>
                <CardDescription className="text-xs text-gray-600">Real-time engagement throughout the interview</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
                <ChartContainer config={engagementChartConfig} className="h-[180px]">
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="interaction"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) => value.slice(0, 2)}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fontSize: 10 }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Line
                            dataKey="engagement"
                            type="natural"
                            stroke="hsl(262 83% 58%)"
                            strokeWidth={2}
                            dot={{ fill: "hsl(262 83% 58%)", strokeWidth: 2, r: 3 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-1 text-xs pt-2">
                <div className="flex gap-2 leading-none font-medium text-gray-700">
                    Average Engagement: {avgEngagement.toFixed(1)}/100
                    {trend >= 5 ? (
                        <>Improving <TrendingUp className="h-3 w-3" /></>
                    ) : trend <= -5 ? (
                        <>Declining</>
                    ) : (
                        <>Stable</>
                    )}
                </div>
                <div className="text-gray-500 leading-none">
                    Based on response quality and interaction patterns ({chartData.length} questions)
                </div>
            </CardFooter>
        </Card>
    )
}
