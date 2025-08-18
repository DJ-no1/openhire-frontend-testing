"use client";

import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Mic, MicOff, Play, Square } from "lucide-react";

// Deepgram STT integration
const DEEPGRAM_API_KEY = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;

type InterviewMessage = {
    type: "system" | "user" | "question" | "error";
    content: string;
    timestamp: Date;
    questionNumber?: number;
    questionType?: string;
};

type InterviewStatus = "disconnected" | "connecting" | "connected" | "paused" | "completed";

type FinalAssessment = {
    overall_score: number;
    technical_score: number;
    final_recommendation: string;
    confidence_level: string;
    industry_type: string;
    universal_scores: {
        communication_score: number;
        problem_solving_score: number;
        leadership_potential_score: number;
        adaptability_score: number;
        teamwork_score: number;
        cultural_fit_score: number;
    };
    industry_competency_scores: Record<string, number>;
    feedback: {
        universal_feedback_for_candidate: string;
        areas_of_improvement_for_candidate: string[];
        industry_specific_feedback?: {
            technical_feedback_for_candidate: string;
            domain_strengths: string[];
            domain_improvement_areas: string[];
        };
    };
    interview_metrics: {
        duration: string;
        questions_answered: number;
        engagement_level: number;
        completion_status: string;
    };
};

interface VideoInterviewSystemProps {
    applicationId: string;
    interviewId: string;
    onStatusChange: (status: InterviewStatus) => void;
    onInterviewComplete: (finalAssessment: FinalAssessment, conversation: InterviewMessage[]) => void;
    onQuestionReceived?: (question: string, isAISpeaking: boolean) => void;
    onEndInterview?: () => void;
    autoStart?: boolean; // New prop to auto-start interview
    selectedAudioDevice?: string | null; // Selected microphone device ID
}

export interface VideoInterviewSystemRef {
    endInterview: () => void;
}

const VideoInterviewSystem = forwardRef<VideoInterviewSystemRef, VideoInterviewSystemProps>(({
    applicationId,
    interviewId,
    onStatusChange,
    onInterviewComplete,
    onQuestionReceived,
    onEndInterview,
    autoStart = false,
    selectedAudioDevice = null
}, ref) => {
    // State declarations
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<InterviewStatus>("disconnected");
    const [messages, setMessages] = useState<InterviewMessage[]>([]);
    const [input, setInput] = useState<string>("");
    const [currentQuestion, setCurrentQuestion] = useState<string>("");
    const [questionNumber, setQuestionNumber] = useState<number>(0);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [progress, setProgress] = useState<number>(0);
    const [finalAssessment, setFinalAssessment] = useState<FinalAssessment | null>(null);
    const [isListening, setIsListening] = useState<boolean>(false);

    // TTS State for streaming AI responses
    const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
    const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
    const [isAISpeaking, setIsAISpeaking] = useState<boolean>(false);

    // Add retry state
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    // Add flag to prevent multiple end interview calls
    const [isEnding, setIsEnding] = useState<boolean>(false);

    // Deepgram state (only Deepgram, no browser STT)
    const [dgSocket, setDgSocket] = useState<WebSocket | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    // Deepgram text accumulation state
    const [currentTranscript, setCurrentTranscript] = useState<string>("");
    const [isAccumulating, setIsAccumulating] = useState<boolean>(false);

    // Handle transcript updates with proper accumulation
    const handleTranscriptUpdate = useCallback((transcript: string, isFinal: boolean) => {
        console.log('📝 Handling transcript:', transcript, 'Final:', isFinal);

        if (!transcript.trim()) return;

        if (isFinal) {
            // For final transcripts, add to accumulated text
            setCurrentTranscript(prev => {
                const newAccumulated = prev + (prev ? ' ' : '') + transcript;
                console.log('✅ Final transcript - accumulated from:', prev, 'to:', newAccumulated);
                setInput(newAccumulated);
                return newAccumulated;
            });
            setIsAccumulating(false);
        } else {
            // For interim transcripts, show preview but don't commit yet
            setCurrentTranscript(prev => {
                const previewTranscript = prev + (prev ? ' ' : '') + transcript;
                setInput(previewTranscript);
                setIsAccumulating(true);
                console.log('🔄 Interim transcript preview:', previewTranscript, 'Base:', prev);
                return prev; // Don't update accumulated text for interim results
            });
        }
    }, []);

    // Refs
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // WebSocket URL
    const WS_URL = `ws://localhost:8000/interview/${applicationId}`;
    const safeInput = input || "";

    // Initialize Speech Synthesis for TTS
    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setSpeechSynthesis(window.speechSynthesis);
        }
    }, []);

    // Update parent component when status changes
    useEffect(() => {
        onStatusChange(connectionStatus);
    }, [connectionStatus, onStatusChange]);

    // CALLBACK FUNCTIONS
    const addMessage = useCallback((type: InterviewMessage["type"], content: string, extra?: Partial<InterviewMessage>) => {
        setMessages(prev => [...prev, {
            type,
            content,
            timestamp: new Date(),
            ...extra
        }]);
    }, []);

    // TTS function for AI questions with interruption capability
    const speakAIResponse = useCallback((text: string) => {
        if (!speechSynthesis) {
            console.error('❌ Speech synthesis not available');
            return;
        }

        // Stop any current speech
        if (currentUtterance) {
            speechSynthesis.cancel();
            setCurrentUtterance(null);
        }

        console.log('🔊 Speaking AI response:', text.substring(0, 50) + '...');

        const utterance = new SpeechSynthesisUtterance(text);

        // Wait for voices to load if they haven't yet
        const speakWithVoice = () => {
            const voices = speechSynthesis.getVoices();
            console.log('🗣️ Available voices:', voices.length);

            if (voices.length > 0) {
                // Find a good English voice
                const preferredVoice = voices.find(voice =>
                    voice.name.includes('Google') ||
                    voice.name.includes('Premium') ||
                    voice.name.includes('Enhanced') ||
                    voice.name.includes('Neural')
                ) || voices.find(voice =>
                    voice.lang.startsWith('en') && voice.localService === false
                ) || voices.find(voice =>
                    voice.lang.startsWith('en')
                ) || voices[0];

                if (preferredVoice) {
                    console.log('🎤 Using voice:', preferredVoice.name, preferredVoice.lang);
                    utterance.voice = preferredVoice;
                }
            } else {
                console.warn('⚠️ No voices available, using default');
            }

            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onstart = () => {
                console.log('🔊 AI speech started');
                setIsAISpeaking(true);
                onQuestionReceived?.(text, true);
            };

            utterance.onend = () => {
                console.log('🔊 AI speech ended');
                setIsAISpeaking(false);
                onQuestionReceived?.(text, false);
                setCurrentUtterance(null);
            };

            utterance.onerror = (error) => {
                console.error('❌ Speech synthesis error:', error);
                setIsAISpeaking(false);
                onQuestionReceived?.(text, false);
                setCurrentUtterance(null);
            };

            setCurrentUtterance(utterance);
            speechSynthesis.speak(utterance);
        };

        // If voices are not loaded yet, wait for them
        if (speechSynthesis.getVoices().length === 0) {
            console.log('⏳ Waiting for voices to load...');
            speechSynthesis.addEventListener('voiceschanged', speakWithVoice, { once: true });
            // Fallback timeout
            setTimeout(speakWithVoice, 1000);
        } else {
            speakWithVoice();
        }
    }, [speechSynthesis, currentUtterance, onQuestionReceived]);

    // Manual reset function for user
    const resetConnection = useCallback(() => {
        console.log('🔄 Manual connection reset');
        setRetryCount(0);
        setIsListening(false);
        if (dgSocket) {
            dgSocket.close();
            setDgSocket(null);
        }
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
        setMediaRecorder(null);
        setMediaStream(null);
        addMessage("system", "Connection reset. Click the microphone to try again.");
    }, [dgSocket, mediaRecorder, mediaStream, addMessage]);

    // Stop AI speaking when user starts responding
    const stopAISpeaking = useCallback(() => {
        if (speechSynthesis && currentUtterance && isAISpeaking) {
            speechSynthesis.cancel();
            setIsAISpeaking(false);
            setCurrentUtterance(null);
            onQuestionReceived?.(currentQuestion, false);
        }
    }, [speechSynthesis, currentUtterance, isAISpeaking, currentQuestion, onQuestionReceived]);

    const handleMessage = useCallback((data: any) => {
        switch (data.type) {
            case "interview_started":
                addMessage("system", `Interview started for ${data.candidate_name || "candidate"}`);
                break;
            case "new_question":
                setCurrentQuestion(data.question);
                setQuestionNumber(data.question_number);
                setProgress(data.progress || 0);
                setTimeRemaining(data.time_remaining || 0);
                addMessage("question", data.question, {
                    questionNumber: data.question_number,
                    questionType: data.question_type
                });
                // Speak the AI question using TTS
                speakAIResponse(data.question);
                break;
            case "interview_completed":
                setConnectionStatus("completed");
                const assessment = data.final_assessment;
                setFinalAssessment(assessment);
                addMessage("system", "Interview completed! View your results below.");
                setCurrentQuestion("");
                // Stop any ongoing speech
                if (speechSynthesis) speechSynthesis.cancel();
                // Pass final assessment and conversation to parent
                onInterviewComplete(assessment, messages);
                break;
            case "interview_ended":
                setConnectionStatus("completed");
                addMessage("system", "Interview has been ended.");
                setCurrentQuestion("");
                // Stop any ongoing speech
                if (speechSynthesis) speechSynthesis.cancel();
                // Call parent handler to navigate away
                if (onEndInterview) {
                    onEndInterview();
                }
                break;
            case "status_update":
                setProgress(data.progress || progress);
                setTimeRemaining(data.time_remaining || timeRemaining);
                addMessage("system", data.message);
                break;
            case "error":
                addMessage("error", `Error: ${data.message}`);
                break;
            default:
                console.log("Unknown message type:", data);
        }
    }, [addMessage, progress, timeRemaining, messages, onInterviewComplete, onEndInterview, speakAIResponse, speechSynthesis]);

    const connectToInterview = useCallback(() => {
        if (connectionStatus === "connected" || connectionStatus === "connecting") return;

        setConnectionStatus("connecting");
        addMessage("system", "Connecting to AI Interview System...");

        const websocket = new WebSocket(WS_URL);

        websocket.onopen = () => {
            setConnectionStatus("connected");
            addMessage("system", "Connected! Starting interview...");
            websocket.send(JSON.stringify({
                type: "start_interview",
                payload: { interview_id: interviewId }
            }));
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleMessage(data);
        };

        websocket.onclose = (event) => {
            setConnectionStatus("disconnected");
            console.log('🔌 Interview WebSocket closed:', event.code, event.reason);

            // Show appropriate message based on close reason
            if (event.code === 1000) {
                addMessage("system", "Interview session ended normally");
            } else if (event.code === 1006) {
                addMessage("error", "Interview connection lost unexpectedly. Please refresh if needed.");
            } else {
                addMessage("system", `Interview connection closed (${event.code})`);
            }

            setWs(null);
        };

        websocket.onerror = (error) => {
            setConnectionStatus("disconnected");
            addMessage("error", "Connection error occurred");
            console.error("WebSocket error:", error);
        };

        setWs(websocket);
    }, [connectionStatus, addMessage, handleMessage, WS_URL, interviewId]);

    // Auto-start interview when component mounts
    useEffect(() => {
        if (autoStart && connectionStatus === "disconnected") {
            // Small delay to ensure component is fully mounted
            const timer = setTimeout(() => {
                connectToInterview();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [autoStart, connectionStatus, connectToInterview]);

    const submitAnswer = useCallback(() => {
        const inputValue = input || "";
        if (!inputValue.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

        ws.send(JSON.stringify({
            type: "submit_answer",
            payload: { answer: inputValue }
        }));

        addMessage("user", inputValue);
        setInput("");
        setCurrentQuestion("");
        // Clear accumulated transcript when answer is submitted
        setCurrentTranscript("");
        setIsAccumulating(false);
        console.log('✅ Answer submitted - cleared accumulated transcript');
    }, [input, ws, addMessage]);

    // End Interview Function - ONLY sends "end" message to chat and backend
    const endInterview = useCallback(() => {
        // Prevent multiple calls
        if (isEnding) {
            console.log('🛑 End interview already in progress, ignoring...');
            return;
        }

        console.log('🛑 Ending interview - sending end message');

        // Set ending flag immediately to prevent multiple calls
        setIsEnding(true);

        // Add "end" message to chat on behalf of user
        addMessage("user", "end");

        // Send "end" message to backend if WebSocket is available
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: "end_interview",
                payload: { message: "end" }
            }));
            console.log('📤 Sent end message to backend');
        }

        // That's it! Don't call parent handler to avoid loops
        console.log('✅ End message sent, component job done');
    }, [ws, addMessage, isEnding]);

    // Expose endInterview function to parent component
    useImperativeHandle(ref, () => ({
        endInterview
    }), [endInterview]);

    const toggleListening = useCallback(() => {
        if (!DEEPGRAM_API_KEY) {
            addMessage("error", "Deepgram API key missing for speech recognition");
            return;
        }

        // Stop AI speaking when user starts to respond
        if (!isListening) {
            stopAISpeaking();
            // Clear previous transcript when starting fresh
            setCurrentTranscript("");
            setIsAccumulating(false);
            console.log('🎤 Starting fresh - cleared accumulated transcript');
        }

        if (isListening) {
            setIsListening(false);
        } else {
            setIsListening(true);
        }
    }, [DEEPGRAM_API_KEY, isListening, addMessage, stopAISpeaking]);

    // Deepgram: Start/stop audio streaming (only Deepgram, no browser STT)
    useEffect(() => {
        if (!isListening) {
            if (dgSocket) dgSocket.close();
            if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
            if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
            setDgSocket(null);
            setMediaRecorder(null);
            setMediaStream(null);
            return;
        }

        if (!DEEPGRAM_API_KEY) {
            addMessage("error", "Deepgram API key missing");
            setIsListening(false);
            return;
        }

        // Start Deepgram WebSocket with better error handling
        console.log('🚀 Initializing Deepgram WebSocket...');

        if (!DEEPGRAM_API_KEY) {
            console.error('❌ Missing Deepgram API key');
            addMessage("error", "Speech recognition unavailable - missing API key");
            setIsListening(false);
            return;
        }

        // Check network connectivity
        if (!navigator.onLine) {
            console.error('❌ No network connection');
            addMessage("error", "No internet connection. Please check your network and try again.");
            setIsListening(false);
            return;
        }

        try {
            // Simple, reliable WebSocket connection to Deepgram
            const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=en-US&punctuate=true&interim_results=true`;
            console.log('🔗 Connecting to Deepgram...');

            const socket = new WebSocket(wsUrl, ['token', DEEPGRAM_API_KEY]);

            setDgSocket(socket);

            socket.onopen = async () => {
                console.log('✅ Deepgram WebSocket connected successfully');
                setRetryCount(0); // Reset retry count on successful connection
                addMessage("system", "Speech recognition connected");

                try {
                    console.log('🎤 Requesting microphone access...');

                    // Log if we have a selected audio device
                    if (selectedAudioDevice) {
                        console.log('🎯 Using selected audio device:', selectedAudioDevice);
                    }

                    const audioConstraints: MediaStreamConstraints = {
                        audio: selectedAudioDevice ? {
                            deviceId: { exact: selectedAudioDevice },
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                            sampleRate: 16000,
                            channelCount: 1
                        } : {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                            sampleRate: 16000,
                            channelCount: 1
                        }
                    };

                    console.log('🎤 Using audio constraints:', audioConstraints);
                    const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
                    setMediaStream(stream);

                    // Use the default MediaRecorder with best compatibility
                    const recorder = new MediaRecorder(stream);
                    setMediaRecorder(recorder);

                    recorder.ondataavailable = async (e: BlobEvent) => {
                        if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
                            console.log('🎵 Sending audio data, size:', e.data.size);
                            try {
                                const arrayBuffer = await e.data.arrayBuffer();
                                socket.send(arrayBuffer);
                            } catch (sendError) {
                                console.error('❌ Error sending audio data:', sendError);
                            }
                        }
                    };

                    recorder.onerror = (event) => {
                        console.error('🎤 MediaRecorder error:', event);
                        addMessage("error", "Microphone recording error");
                    };

                    recorder.onstart = () => {
                        console.log('🎤 MediaRecorder started');
                    };

                    recorder.onstop = () => {
                        console.log('🎤 MediaRecorder stopped');
                    };

                    console.log('🎤 Starting MediaRecorder...');
                    recorder.start(250); // Send data every 250ms
                } catch (error: any) {
                    console.error('❌ Error accessing microphone:', error);
                    let errorMessage = "Error accessing microphone";
                    if (error?.name === 'NotAllowedError') {
                        errorMessage = "Microphone access denied. Please allow microphone permissions.";
                    } else if (error?.name === 'NotFoundError') {
                        errorMessage = "No microphone found. Please connect a microphone.";
                    }
                    addMessage("error", errorMessage);
                    setIsListening(false);
                }
            };

            socket.onmessage = (msg) => {
                try {
                    const data = JSON.parse(msg.data);
                    console.log('🎤 Deepgram response:', data);

                    if (data.channel?.alternatives?.[0]?.transcript !== undefined) {
                        const transcript = data.channel.alternatives[0].transcript || "";
                        const isFinal = data.is_final || false;
                        handleTranscriptUpdate(transcript, isFinal);
                    }
                } catch (e) {
                    console.error("Error parsing Deepgram response:", e);
                }
            };

            socket.onerror = (e) => {
                console.error("Deepgram WebSocket error:", e);
                setIsListening(false);
                setDgSocket(null);

                if (retryCount < MAX_RETRIES) {
                    const nextRetry = retryCount + 1;
                    console.log(`🔄 Will retry Deepgram connection (${nextRetry}/${MAX_RETRIES}) - click microphone to retry`);
                    setRetryCount(nextRetry);
                    addMessage("error", `Speech recognition connection failed. Click the microphone button to retry (${nextRetry}/${MAX_RETRIES}).`);
                } else {
                    console.log("❌ Max retry attempts reached. Speech recognition disabled.");
                    addMessage("error", "Speech recognition unavailable after multiple attempts. Please type your responses in the text box below.");
                    setRetryCount(0); // Reset for future attempts
                }
            };

            socket.onclose = (event) => {
                console.log('🔌 Deepgram WebSocket closed:', event.code, event.reason);
                setDgSocket(null);
                setIsListening(false);

                // Only show reconnection message if it was an unexpected closure
                if (event.code !== 1000 && event.code !== 1005) {
                    console.log("🔌 Unexpected WebSocket closure");
                    addMessage("error", "Speech recognition connection lost. Click the microphone button to reconnect.");
                }
            };

            return () => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.close();
                }
                if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
                if (mediaStream) mediaStream.getTracks().forEach((track: any) => track.stop());
            };

        } catch (error: any) {
            console.error('❌ Failed to create Deepgram WebSocket:', error);
            addMessage("error", "Speech recognition failed. Please use the text input below to type your responses.");
            setIsListening(false);
            setRetryCount(0); // Reset retry count
        }
    }, [isListening, DEEPGRAM_API_KEY, addMessage, retryCount, handleTranscriptUpdate]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto-resize textarea when input changes (including from speech recognition)
    useEffect(() => {
        if (inputRef.current) {
            const el = inputRef.current;
            el.style.height = 'auto';
            const maxHeight = 240; // 15rem = 240px (max-h-60)
            const newHeight = Math.min(el.scrollHeight, maxHeight);
            el.style.height = newHeight + 'px';

            // Only show scrollbar if content exceeds max height
            el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
        }
    }, [input]);

    // Helper functions
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && connectionStatus === "connected" && currentQuestion) {
            e.preventDefault();
            submitAnswer();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const autoGrow = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const el = e.target;
        el.style.height = 'auto';
        const maxHeight = 240; // 15rem = 240px (max-h-60)
        const newHeight = Math.min(el.scrollHeight, maxHeight);
        el.style.height = newHeight + 'px';

        // Only show scrollbar if content exceeds max height
        el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
    };

    return (
        <div className="w-full h-full flex flex-col bg-white">
            {/* Enhanced Header with Gradient */}
            <div className="bg-gradient-to-r text-white p-4 shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex-1"></div>

                    {/* Progress and Time */}
                    {progress > 0 && (
                        <div className="text-right">
                            <div className="text-sm font-medium">{progress}%</div>
                            {timeRemaining > 0 && (
                                <div className="text-sm opacity-75">Time: {formatTime(timeRemaining)}</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {progress > 0 && (
                    <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                        <div
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                )}
            </div>

            {/* Interview Controls - Only show Start Button if auto-start is disabled */}
            {!autoStart && connectionStatus === "disconnected" && (
                <div className="p-4 bg-gray-50 border-b">
                    <Button onClick={connectToInterview} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3">
                        <Play className="w-5 h-5 mr-2" />
                        Start Interview
                    </Button>
                </div>
            )}

            {/* Auto-start loading indicator */}
            {autoStart && connectionStatus === "disconnected" && (
                <div className="p-4 bg-blue-50 border-b">
                    <div className="text-center py-4">
                        <div className="inline-flex items-center gap-3 text-blue-700">
                            <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                            <span className="font-medium">Starting interview automatically...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Connecting indicator */}
            {connectionStatus === "connecting" && (
                <div className="p-4 bg-orange-50 border-b">
                    <div className="text-center py-4">
                        <div className="inline-flex items-center gap-3 text-orange-700">
                            <div className="w-5 h-5 border-2 border-orange-700 border-t-transparent rounded-full animate-spin"></div>
                            <span className="font-medium">Connecting to AI interview system...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Speaking Indicator */}
            {isAISpeaking && (
                <div className="px-4 py-3 bg-blue-50 border-b">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-blue-900">
                                AI is speaking... Please wait to respond
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-20">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">Ready to Start</p>
                        <p className="text-sm">Click "Start Interview" to begin your AI interview session</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-[85%] p-4 rounded-lg shadow-sm ${msg.type === "user"
                            ? "bg-blue-500 text-white rounded-br-sm"
                            : msg.type === "question"
                                ? "bg-white text-gray-800 border border-green-200 rounded-bl-sm"
                                : msg.type === "error"
                                    ? "bg-red-50 text-red-800 border border-red-200"
                                    : "bg-white text-gray-800 border"
                            }`}>
                            {msg.type === "question" && (
                                <div className="flex items-center gap-2 font-semibold text-green-700 mb-2 text-sm">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Question {msg.questionNumber} {msg.questionType && `• ${msg.questionType}`}
                                </div>
                            )}
                            <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                            <div className={`text-xs mt-2 ${msg.type === "user" ? "text-blue-100" : "text-gray-500"
                                }`}>
                                {msg.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Current Question Display */}
            {currentQuestion && connectionStatus === "connected" && (
                <div className="p-4 bg-amber-50 border-t border-amber-200">
                    <div className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        Current Question:
                    </div>
                    <div className="text-gray-700 font-medium">{currentQuestion}</div>
                </div>
            )}

            {/* Enhanced Input Area */}
            {connectionStatus === "connected" && currentQuestion && (
                <div className="p-4 border-t">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            submitAnswer();
                        }}
                        className="flex gap-2"
                    >
                        <Textarea
                            ref={inputRef}
                            value={safeInput}
                            onChange={(e) => {
                                setInput(e.target.value || "");
                                autoGrow(e);
                            }}
                            onKeyDown={handleInputKeyDown}
                            placeholder="Type your answer here..."
                            className="flex-1 min-h-[40px] max-h-60 resize-none overflow-hidden"
                            rows={1}
                            autoFocus
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={toggleListening}
                            className={isListening ? "bg-red-100" : ""}
                        >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </Button>
                        <Button type="submit" disabled={!safeInput.trim()}>
                            Submit
                        </Button>
                    </form>
                    {isListening && (
                        <div className="text-sm text-red-600 mt-1 flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            {isAccumulating ? "Processing speech..." : "Listening for your response..."}
                        </div>
                    )}
                    {currentTranscript && (
                        <div className="text-xs text-gray-500 mt-1">
                            Accumulated: {currentTranscript.length} characters
                        </div>
                    )}
                </div>
            )}

            {/* Final Assessment */}
            {finalAssessment && connectionStatus === "completed" && (
                <div className="p-6 bg-green-50 border-t border-green-200">
                    <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                        🎉 Interview Complete!
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                            <div className="text-sm text-gray-600">Overall Score</div>
                            <div className="text-3xl font-bold text-green-600">{finalAssessment.overall_score}%</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                            <div className="text-sm text-gray-600">Technical Score</div>
                            <div className="text-3xl font-bold text-blue-600">{finalAssessment.technical_score}%</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                        <div className="text-sm text-gray-600 mb-1">Recommendation</div>
                        <div className="font-medium text-lg">{finalAssessment.final_recommendation}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-medium text-gray-800 mb-2">Feedback:</h3>
                        <p className="text-gray-700 leading-relaxed">{finalAssessment.feedback.universal_feedback_for_candidate}</p>
                    </div>
                </div>
            )}
        </div>
    );
});

VideoInterviewSystem.displayName = 'VideoInterviewSystem';

export default VideoInterviewSystem;
