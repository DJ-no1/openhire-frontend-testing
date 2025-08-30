"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Clock, ArrowRight, CheckCircle, AlertTriangle, X } from "lucide-react";
import { AsyncResumeAnalyzer } from "@/components/async-resume-analyzer";
import { ResumeUploadAnalyzer } from "@/components/resume-upload-analyzer";
import { type Job } from "@/lib/api";

interface AnalysisModeSelectionProps {
    job: Job | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    candidateId?: string;
}

export function AnalysisModeSelection({
    job,
    open,
    onOpenChange,
    candidateId
}: AnalysisModeSelectionProps) {
    const [selectedMode, setSelectedMode] = useState<'async' | 'sync' | null>(null);

    const handleModeSelect = (mode: 'async' | 'sync') => {
        setSelectedMode(mode);
    };

    const handleBack = () => {
        setSelectedMode(null);
    };

    const handleClose = () => {
        setSelectedMode(null);
        onOpenChange(false);
    };

    if (selectedMode === 'async') {
        return (
            <AsyncResumeAnalyzer
                job={job}
                open={open}
                onOpenChange={onOpenChange}
            />
        );
    }

    if (selectedMode === 'sync') {
        return (
            <ResumeUploadAnalyzer
                job={job}
                open={open}
                onOpenChange={onOpenChange}
                candidateId={candidateId}
            />
        );
    }

    if (!job) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]" showCloseButton={false}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Zap className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">Choose Analysis Mode</DialogTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Select your preferred analysis experience for {job.title}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Recommended Async Mode */}
                    <Card
                        className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:border-green-300 cursor-pointer transition-all duration-200"
                        onClick={() => handleModeSelect('async')}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500 rounded-full">
                                        <Zap className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-green-900">
                                            Async Analysis
                                            <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full font-medium">
                                                RECOMMENDED
                                            </span>
                                        </CardTitle>
                                        <p className="text-green-700 text-sm">
                                            Fast, reliable, and modern analysis experience
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-green-900 text-sm">✨ Benefits</h4>
                                    <ul className="text-xs text-green-800 space-y-1">
                                        <li className="flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            Fast response (&lt;2 seconds)
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            Real-time progress updates
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            No timeouts or errors
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            Background processing
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-green-900 text-sm">🚀 How it works</h4>
                                    <ol className="text-xs text-green-800 space-y-1">
                                        <li>1. Upload starts immediately</li>
                                        <li>2. Get job ID instantly</li>
                                        <li>3. Track progress in real-time</li>
                                        <li>4. Results appear automatically</li>
                                    </ol>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Legacy Sync Mode */}
                    <Card
                        className="border-gray-200 hover:border-gray-300 cursor-pointer transition-all duration-200"
                        onClick={() => handleModeSelect('sync')}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-500 rounded-full">
                                        <Clock className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-gray-900">
                                            Legacy Analysis
                                            <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">
                                                LEGACY
                                            </span>
                                        </CardTitle>
                                        <p className="text-gray-600 text-sm">
                                            Traditional synchronous analysis (slower)
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-gray-900 text-sm">⚠️ Limitations</h4>
                                    <ul className="text-xs text-gray-700 space-y-1">
                                        <li className="flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                            Slower response (30-60s)
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                            May timeout on slow connections
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                            Blocks other requests
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                            No progress feedback
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-gray-900 text-sm">🔄 How it works</h4>
                                    <ol className="text-xs text-gray-700 space-y-1">
                                        <li>1. Upload and wait</li>
                                        <li>2. Analysis runs synchronously</li>
                                        <li>3. Page waits for completion</li>
                                        <li>4. Results show when done</li>
                                    </ol>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Comparison */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                            📊 Performance Comparison
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-xs text-blue-700 font-medium">Response Time</div>
                                <div className="text-green-600 font-bold">&lt;2s</div>
                                <div className="text-xs text-gray-500">vs 30-60s</div>
                            </div>
                            <div>
                                <div className="text-xs text-blue-700 font-medium">Reliability</div>
                                <div className="text-green-600 font-bold">99.9%</div>
                                <div className="text-xs text-gray-500">vs ~85%</div>
                            </div>
                            <div>
                                <div className="text-xs text-blue-700 font-medium">User Experience</div>
                                <div className="text-green-600 font-bold">Excellent</div>
                                <div className="text-xs text-gray-500">vs Poor</div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
