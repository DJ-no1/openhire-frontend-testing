"use client";
import { useEffect, useState, useRef } from "react";
import { ProgressIndicator } from "@/components/progress-indicator";
import { checkAsyncJobStatus, API_CONFIG, type ReviewResponse } from "@/lib/api";

export interface JobStatusTrackerProps {
    jobId: string;
    onComplete: (result: ReviewResponse) => void;
    onError: (error: string) => void;
    onProgress?: (progress: number) => void;
    estimatedCompletion?: string;
    createdAt?: string;
    className?: string;
}

export function JobStatusTracker({
    jobId,
    onComplete,
    onError,
    onProgress,
    estimatedCompletion,
    createdAt,
    className
}: JobStatusTrackerProps) {
    const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef<number>(0);
    const startTimeRef = useRef<number>(Date.now());

    const stopPolling = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    };

    const startPolling = () => {
        const poll = async () => {
            try {
                // Check if we've exceeded max polling duration
                if (Date.now() - startTimeRef.current > API_CONFIG.POLLING.MAX_DURATION) {
                    stopPolling();
                    setStatus('failed');
                    setError('Analysis timeout - please check back later');
                    onError('Analysis timeout - please check back later');
                    return;
                }

                const statusResponse = await checkAsyncJobStatus(jobId);

                setProgress(statusResponse.progress);
                onProgress?.(statusResponse.progress);
                retryCountRef.current = 0; // Reset retry count on successful request

                if (statusResponse.status === 'completed' && statusResponse.result) {
                    stopPolling();
                    setStatus('completed');
                    setProgress(100);
                    onComplete(statusResponse.result);
                } else if (statusResponse.status === 'failed') {
                    stopPolling();
                    const errorMessage = statusResponse.error || 'Analysis failed';
                    setStatus('failed');
                    setError(errorMessage);
                    onError(errorMessage);
                } else if (statusResponse.status === 'processing') {
                    setStatus('processing');
                } else {
                    setStatus('pending');
                }
            } catch (error) {
                retryCountRef.current++;

                if (retryCountRef.current >= API_CONFIG.POLLING.RETRY_ATTEMPTS) {
                    stopPolling();
                    const errorMessage = error instanceof Error ? error.message : 'Failed to check analysis status';
                    setStatus('failed');
                    setError(errorMessage);
                    onError(errorMessage);
                } else {
                    console.warn(`Status check retry ${retryCountRef.current}/${API_CONFIG.POLLING.RETRY_ATTEMPTS}:`, error);
                }
            }
        };

        // Initial poll
        poll();

        // Set up interval
        pollIntervalRef.current = setInterval(poll, API_CONFIG.POLLING.INTERVAL);
    };

    // Start polling when component mounts
    useEffect(() => {
        startPolling();

        return () => {
            stopPolling();
        };
    }, [jobId]);

    const handleRetry = () => {
        setStatus('pending');
        setProgress(0);
        setError(null);
        retryCountRef.current = 0;
        startTimeRef.current = Date.now();
        startPolling();
    };

    const handleNewAnalysis = () => {
        stopPolling();
        // This should trigger parent component to reset
        window.location.reload();
    };

    return (
        <div className={className}>
            <ProgressIndicator
                progress={progress}
                status={status}
                estimatedTime={estimatedCompletion}
                jobId={jobId}
                createdAt={createdAt}
                error={error || undefined}
                onRetry={handleRetry}
                onNewAnalysis={handleNewAnalysis}
            />
        </div>
    );
}
