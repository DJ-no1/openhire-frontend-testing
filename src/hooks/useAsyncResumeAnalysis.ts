"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import {
    submitAsyncResumeAnalysis,
    submitAsyncResumeAnalysisWithText,
    checkAsyncJobStatus,
    API_CONFIG,
    type AsyncJobResponse,
    type AsyncJobStatus,
    type ReviewResponse
} from '@/lib/api';

export type AnalysisState = 'idle' | 'submitting' | 'polling' | 'completed' | 'failed';

export interface AsyncAnalysisState {
    status: AnalysisState;
    jobId: string | null;
    progress: number;
    result: ReviewResponse | null;
    error: string | null;
    estimatedCompletion: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface UseAsyncResumeAnalysisOptions {
    onComplete?: (result: ReviewResponse) => void;
    onError?: (error: string) => void;
    onProgress?: (progress: number) => void;
    maxPollDuration?: number;
    pollInterval?: number;
}

export const useAsyncResumeAnalysis = (options: UseAsyncResumeAnalysisOptions = {}) => {
    const {
        onComplete,
        onError,
        onProgress,
        maxPollDuration = API_CONFIG.POLLING.MAX_DURATION,
        pollInterval = API_CONFIG.POLLING.INTERVAL
    } = options;

    const [state, setState] = useState<AsyncAnalysisState>({
        status: 'idle',
        jobId: null,
        progress: 0,
        result: null,
        error: null,
        estimatedCompletion: null,
        createdAt: null,
        updatedAt: null
    });

    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollStartTimeRef = useRef<number | null>(null);
    const retryCountRef = useRef<number>(0);

    // Clear polling interval
    const stopPolling = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        pollStartTimeRef.current = null;
        retryCountRef.current = 0;
    }, []);

    // Start polling for job status
    const startPolling = useCallback((jobId: string) => {
        pollStartTimeRef.current = Date.now();
        retryCountRef.current = 0;

        const poll = async () => {
            try {
                // Check if we've exceeded max polling duration
                if (pollStartTimeRef.current && Date.now() - pollStartTimeRef.current > maxPollDuration) {
                    stopPolling();
                    setState(prev => ({
                        ...prev,
                        status: 'failed',
                        error: 'Analysis timeout - please check back later or contact support'
                    }));
                    onError?.('Analysis timeout - please check back later or contact support');
                    return;
                }

                const statusResponse = await checkAsyncJobStatus(jobId);

                setState(prev => ({
                    ...prev,
                    progress: statusResponse.progress,
                    updatedAt: statusResponse.updated_at
                }));

                onProgress?.(statusResponse.progress);
                retryCountRef.current = 0; // Reset retry count on successful request

                if (statusResponse.status === 'completed' && statusResponse.result) {
                    stopPolling();
                    setState(prev => ({
                        ...prev,
                        status: 'completed',
                        result: statusResponse.result!,
                        progress: 100
                    }));
                    onComplete?.(statusResponse.result);
                } else if (statusResponse.status === 'failed') {
                    stopPolling();
                    const errorMessage = statusResponse.error || 'Analysis failed';
                    setState(prev => ({
                        ...prev,
                        status: 'failed',
                        error: errorMessage
                    }));
                    onError?.(errorMessage);
                } else if (statusResponse.status === 'processing') {
                    setState(prev => ({
                        ...prev,
                        status: 'polling'
                    }));
                }
            } catch (error) {
                retryCountRef.current++;

                if (retryCountRef.current >= API_CONFIG.POLLING.RETRY_ATTEMPTS) {
                    stopPolling();
                    const errorMessage = error instanceof Error ? error.message : 'Failed to check analysis status';
                    setState(prev => ({
                        ...prev,
                        status: 'failed',
                        error: errorMessage
                    }));
                    onError?.(errorMessage);
                } else {
                    console.warn(`Status check retry ${retryCountRef.current}/${API_CONFIG.POLLING.RETRY_ATTEMPTS}:`, error);
                }
            }
        };

        // Initial poll
        poll();

        // Set up interval
        pollIntervalRef.current = setInterval(poll, pollInterval);
    }, [maxPollDuration, pollInterval, onComplete, onError, onProgress, stopPolling]);

    // Start analysis with file upload
    const startAnalysisWithFile = useCallback(async (jobId: string, file: File) => {
        setState(prev => ({
            ...prev,
            status: 'submitting',
            error: null,
            result: null,
            progress: 0
        }));

        try {
            const jobResponse = await submitAsyncResumeAnalysis(jobId, file);

            setState(prev => ({
                ...prev,
                status: 'polling',
                jobId: jobResponse.job_id,
                estimatedCompletion: jobResponse.estimated_completion,
                createdAt: jobResponse.created_at
            }));

            startPolling(jobResponse.job_id);
            return jobResponse;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit analysis';
            setState(prev => ({
                ...prev,
                status: 'failed',
                error: errorMessage
            }));
            onError?.(errorMessage);
            throw error;
        }
    }, [startPolling, onError]);

    // Start analysis with resume text
    const startAnalysisWithText = useCallback(async (jobId: string, resumeText: string) => {
        setState(prev => ({
            ...prev,
            status: 'submitting',
            error: null,
            result: null,
            progress: 0
        }));

        try {
            const jobResponse = await submitAsyncResumeAnalysisWithText(jobId, resumeText);

            setState(prev => ({
                ...prev,
                status: 'polling',
                jobId: jobResponse.job_id,
                estimatedCompletion: jobResponse.estimated_completion,
                createdAt: jobResponse.created_at
            }));

            startPolling(jobResponse.job_id);
            return jobResponse;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit analysis';
            setState(prev => ({
                ...prev,
                status: 'failed',
                error: errorMessage
            }));
            onError?.(errorMessage);
            throw error;
        }
    }, [startPolling, onError]);

    // Reset state to idle
    const reset = useCallback(() => {
        stopPolling();
        setState({
            status: 'idle',
            jobId: null,
            progress: 0,
            result: null,
            error: null,
            estimatedCompletion: null,
            createdAt: null,
            updatedAt: null
        });
    }, [stopPolling]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    return {
        state,
        startAnalysisWithFile,
        startAnalysisWithText,
        stopPolling,
        reset,
        isAnalyzing: state.status === 'submitting' || state.status === 'polling',
        isCompleted: state.status === 'completed',
        isFailed: state.status === 'failed',
        isIdle: state.status === 'idle'
    };
};
