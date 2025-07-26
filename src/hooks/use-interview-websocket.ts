import { useState, useEffect, useRef, useCallback } from 'react';

// Message Types from API Documentation
export interface InterviewMessage {
    type: string;
    data: any;
}

// Outgoing Message Types
export interface StartInterviewData {
    job_id: string;
    candidate_id: string;
    resume_text?: string;
    preferences?: {
        max_duration?: number;
        difficulty_level?: 'easy' | 'medium' | 'hard';
        focus_areas?: string[];
    };
}

export interface CandidateResponseData {
    response: string;
}

export interface LiveTranscriptData {
    transcript: string;
    is_final: boolean;
}

// Incoming Message Types
export interface InterviewStartedData {
    session_id: string;
    job_title: string;
    company: string;
    initial_question: string;
    max_duration: number;
    interview_phase: string;
}

export interface AIResponseData {
    response: string;
    question: string;
    interview_phase: string;
    time_elapsed: number;
    questions_asked: number;
    completed: boolean;
    comfort_level: string;
}

export interface InterviewEndedData {
    final_feedback: string;
    completed: boolean;
    session_id: string;
}

export interface StatusUpdateData {
    session_id: string;
    candidate_id: string;
    interview_phase: string;
    time_elapsed: number;
    max_duration: number;
    questions_asked: number;
    completed: boolean;
    comfort_level: string;
    strengths_identified: string[];
    areas_to_probe: string[];
}

export interface ErrorMessageData {
    message: string;
    details?: string;
    status_code?: number;
    exception_type?: string;
}

export interface UseInterviewWebSocketOptions {
    onInterviewStarted?: (data: InterviewStartedData) => void;
    onAIResponse?: (data: AIResponseData) => void;
    onInterviewEnded?: (data: InterviewEndedData) => void;
    onStatusUpdate?: (data: StatusUpdateData) => void;
    onLiveTranscriptUpdate?: (data: LiveTranscriptData) => void;
    onError?: (data: ErrorMessageData) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onConnectionError?: (error: Event) => void;
}

export function useInterviewWebSocket(sessionId: string, options: UseInterviewWebSocketOptions = {}) {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [interviewData, setInterviewData] = useState<InterviewStartedData | null>(null);
    const [lastAIResponse, setLastAIResponse] = useState<AIResponseData | null>(null);
    const [status, setStatus] = useState<StatusUpdateData | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);

    const {
        onInterviewStarted,
        onAIResponse,
        onInterviewEnded,
        onStatusUpdate,
        onLiveTranscriptUpdate,
        onError,
        onOpen,
        onClose,
        onConnectionError
    } = options;

    const connect = useCallback(() => {
        if (!sessionId) return;

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        setConnectionState('connecting');

        try {
            const wsUrl = `ws://localhost:8000/ws/interview/${sessionId}`;
            console.log('Attempting to connect to:', wsUrl);
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('✅ WebSocket connected');
                setIsConnected(true);
                setConnectionState('connected');
                reconnectAttemptsRef.current = 0;
                onOpen?.();
            };

            ws.onmessage = (event) => {
                try {
                    const message: InterviewMessage = JSON.parse(event.data);
                    handleMessage(message);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                setConnectionState('error');
                onConnectionError?.(error);
            };

            ws.onclose = (event) => {
                console.log('🔌 WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
                setIsConnected(false);
                setConnectionState('disconnected');

                // Only call onClose if it wasn't a manual disconnect
                if (event.code !== 1000) {
                    onClose?.();
                }

                // Don't attempt to reconnect if connection was refused (code 1006)
                if (event.code === 1006 && reconnectAttemptsRef.current === 0) {
                    console.error('Connection refused - backend may not be running');
                    setConnectionState('error');
                    return;
                }

                // Attempt to reconnect (max 3 attempts)
                if (reconnectAttemptsRef.current < 3 && event.code !== 1000) {
                    reconnectAttemptsRef.current++;
                    console.log(`Attempting reconnect ${reconnectAttemptsRef.current}/3 in 3 seconds...`);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, 3000);
                }
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('WebSocket connection error:', error);
            setConnectionState('error');
        }
    }, [sessionId, onOpen, onClose, onConnectionError]);

    const handleMessage = useCallback((message: InterviewMessage) => {
        console.log('Received message:', message);

        switch (message.type) {
            case 'interview_started':
                setInterviewData(message.data);
                onInterviewStarted?.(message.data);
                break;

            case 'ai_response':
                setLastAIResponse(message.data);
                onAIResponse?.(message.data);
                break;

            case 'interview_ended':
                onInterviewEnded?.(message.data);
                break;

            case 'status_update':
                setStatus(message.data);
                onStatusUpdate?.(message.data);
                break;

            case 'live_transcript_update':
                onLiveTranscriptUpdate?.(message.data);
                break;

            case 'error':
                onError?.(message.data);
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    }, [onInterviewStarted, onAIResponse, onInterviewEnded, onStatusUpdate, onLiveTranscriptUpdate, onError]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        setIsConnected(false);
        setConnectionState('disconnected');
    }, []);

    const sendMessage = useCallback((message: InterviewMessage) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
            return true;
        }
        console.warn('WebSocket not connected');
        return false;
    }, []);

    // Specific message sending methods
    const startInterview = useCallback((data: StartInterviewData) => {
        return sendMessage({
            type: 'start_interview',
            data
        });
    }, [sendMessage]);

    const sendCandidateResponse = useCallback((response: string) => {
        return sendMessage({
            type: 'candidate_response',
            data: { response }
        });
    }, [sendMessage]);

    const sendLiveTranscript = useCallback((transcript: string, isFinal: boolean = false) => {
        return sendMessage({
            type: 'live_transcript',
            data: {
                transcript,
                is_final: isFinal
            }
        });
    }, [sendMessage]);

    const endInterview = useCallback(() => {
        return sendMessage({
            type: 'end_interview',
            data: {}
        });
    }, [sendMessage]);

    const getStatus = useCallback(() => {
        return sendMessage({
            type: 'get_status',
            data: {}
        });
    }, [sendMessage]);

    // Auto-connect when sessionId changes
    useEffect(() => {
        if (sessionId) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [sessionId, connect, disconnect]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        // Connection state
        isConnected,
        connectionState,

        // Data
        interviewData,
        lastAIResponse,
        status,

        // Methods
        connect,
        disconnect,
        sendMessage,
        startInterview,
        sendCandidateResponse,
        sendLiveTranscript,
        endInterview,
        getStatus
    };
}
