"use client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Brain,
    Loader2,
    Clock,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    TrendingUp,
    FileText
} from "lucide-react";
// Simple time formatting utility
const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
};

export interface ProgressIndicatorProps {
    progress: number; // 0-100
    status: 'pending' | 'processing' | 'completed' | 'failed';
    estimatedTime?: string;
    jobId?: string;
    createdAt?: string;
    error?: string;
    onRetry?: () => void;
    onNewAnalysis?: () => void;
}

export function ProgressIndicator({
    progress,
    status,
    estimatedTime,
    jobId,
    createdAt,
    error,
    onRetry,
    onNewAnalysis
}: ProgressIndicatorProps) {
    const getStatusIcon = () => {
        switch (status) {
            case 'pending':
                return <Clock className="h-6 w-6 text-blue-500" />;
            case 'processing':
                return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
            case 'completed':
                return <CheckCircle className="h-6 w-6 text-green-500" />;
            case 'failed':
                return <AlertCircle className="h-6 w-6 text-red-500" />;
            default:
                return <Brain className="h-6 w-6 text-gray-500" />;
        }
    };

    const getStatusMessage = () => {
        switch (status) {
            case 'pending':
                return 'Your resume analysis has been queued';
            case 'processing':
                return 'Analyzing your resume...';
            case 'completed':
                return 'Analysis completed successfully!';
            case 'failed':
                return 'Analysis failed';
            default:
                return 'Unknown status';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'pending':
                return 'border-blue-200 bg-blue-50';
            case 'processing':
                return 'border-blue-200 bg-blue-50';
            case 'completed':
                return 'border-green-200 bg-green-50';
            case 'failed':
                return 'border-red-200 bg-red-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const getProgressColor = () => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'failed':
                return 'bg-red-500';
            default:
                return 'bg-blue-500';
        }
    };

    if (status === 'completed') {
        return (
            <Card className={`${getStatusColor()} border-2`}>
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-green-800">Analysis Complete!</h3>
                            <p className="text-green-700 mt-1">Your resume analysis is ready to view.</p>
                        </div>
                        {jobId && (
                            <div className="text-xs text-green-600 font-mono bg-green-100 px-2 py-1 rounded">
                                Job ID: {jobId}
                            </div>
                        )}
                        {onNewAnalysis && (
                            <Button onClick={onNewAnalysis} className="mt-4">
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Analyze Another Resume
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (status === 'failed') {
        return (
            <Card className={`${getStatusColor()} border-2`}>
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-red-800">Analysis Failed</h3>
                            <p className="text-red-700 mt-1">
                                {error || 'Something went wrong during the analysis.'}
                            </p>
                        </div>
                        {jobId && (
                            <div className="text-xs text-red-600 font-mono bg-red-100 px-2 py-1 rounded">
                                Job ID: {jobId}
                            </div>
                        )}
                        <div className="flex gap-2 justify-center">
                            {onRetry && (
                                <Button variant="outline" onClick={onRetry}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Try Again
                                </Button>
                            )}
                            {onNewAnalysis && (
                                <Button onClick={onNewAnalysis}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    New Analysis
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`${getStatusColor()} border-2`}>
            <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500 rounded-full">
                        <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-gray-900">
                            Resume Analysis in Progress
                        </CardTitle>
                        <p className="text-gray-600 text-sm mt-1">
                            {getStatusMessage()}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <Progress value={progress} className="h-3" />
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>{progress}% complete</span>
                        {estimatedTime && (
                            <span>Est. {estimatedTime}</span>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="text-center">
                {/* Status Icon and Message */}
                <div className="flex items-center justify-center gap-3 mb-4">
                    {getStatusIcon()}
                    <span className="text-sm font-medium">
                        {status === 'pending' ? 'Waiting in queue...' : 'Processing your resume...'}
                    </span>
                </div>

                {/* Job Details */}
                {jobId && (
                    <div className="space-y-2 text-xs text-gray-600">
                        <div className="font-mono bg-gray-100 px-2 py-1 rounded">
                            Job ID: {jobId}
                        </div>
                        {createdAt && (
                            <div>
                                Started {formatTimeAgo(createdAt)}
                            </div>
                        )}
                    </div>
                )}

                {/* Status-specific content */}
                {status === 'pending' && (
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                        <p className="text-sm text-blue-800">
                            Your analysis is queued. We'll start processing it shortly.
                        </p>
                    </div>
                )}

                {status === 'processing' && (
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                        <p className="text-sm text-blue-800">
                            We're analyzing your resume against the job requirements. This usually takes 30-60 seconds.
                        </p>
                    </div>
                )}

                {/* Do not leave warning */}
                <div className="mt-6 inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-800">
                        Please keep this page open
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
