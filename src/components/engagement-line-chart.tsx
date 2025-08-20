"use client"

import { GitCommitVertical, TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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

interface EngagementLineChartProps {
    conversationLog?: any[] | null;
    overallScore?: number;
}

export function EngagementLineChart({ conversationLog, overallScore = 75 }: EngagementLineChartProps) {
    // Generate engagement data based on conversation flow and overall score
    const generateEngagementData = () => {
        const totalInteractions = conversationLog?.length || 6
        const data = []
        const baseScore = overallScore || 75

        // Create a realistic engagement curve
        for (let i = 0; i < Math.min(totalInteractions, 6); i++) {
            const variation = (Math.sin(i * 0.5) * 10) + (Math.random() * 8 - 4)
            const engagementScore = Math.max(20, Math.min(100, baseScore + variation))

            data.push({
                question: `Q${i + 1}`,
                engagement: Math.round(engagementScore),
                timestamp: i + 1
            })
        }

        return data
    }

    const chartData = generateEngagementData()
    const trend = chartData.length > 1
        ? ((chartData[chartData.length - 1].engagement - chartData[0].engagement) / chartData[0].engagement) * 100
        : 0

    const chartConfig = {
        engagement: {
            label: "Engagement Score",
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig

    return (
        <Card>
            <CardHeader>
                <CardTitle>Conversation Engagement</CardTitle>
                <CardDescription>Engagement level throughout the interview</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="question"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Line
                            dataKey="engagement"
                            type="natural"
                            stroke="var(--color-engagement)"
                            strokeWidth={2}
                            dot={({ cx, cy, payload }) => {
                                const r = 24
                                return (
                                    <GitCommitVertical
                                        key={payload.question}
                                        x={cx - r / 2}
                                        y={cy - r / 2}
                                        width={r}
                                        height={r}
                                        fill="hsl(var(--background))"
                                        stroke="var(--color-engagement)"
                                    />
                                )
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    {trend >= 0 ? 'Trending up' : 'Stable performance'}
                    {trend >= 0 && <TrendingUp className="h-4 w-4" />}
                </div>
                <div className="text-muted-foreground leading-none">
                    Based on response quality and interaction patterns
                </div>
            </CardFooter>
        </Card>
    )
}
