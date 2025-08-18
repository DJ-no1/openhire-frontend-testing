"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
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
    onEndInterview?: () => void; // New prop for end interview
}

export default function VideoInterviewSystem({
    applicationId,
    interviewId,
    onStatusChange,
    onInterviewComplete,
    onQuestionReceived,
    onEndInterview
}: VideoInterviewSystemProps) {
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

    // Deepgram state (only Deepgram, no browser STT)
    const [dgSocket, setDgSocket] = useState<WebSocket | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

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
        if (!speechSynthesis) return;

        // Stop any current speech
        if (currentUtterance) {
            speechSynthesis.cancel();
            setCurrentUtterance(null);
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Configure high-quality voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice =>
            voice.name.includes('Google') ||
            voice.name.includes('Premium') ||
            voice.name.includes('Enhanced') ||
            voice.name.includes('Neural')
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
            setIsAISpeaking(true);
            onQuestionReceived?.(text, true);
        };

        utterance.onend = () => {
            setIsAISpeaking(false);
            onQuestionReceived?.(text, false);
            setCurrentUtterance(null);
        };

        utterance.onerror = () => {
            setIsAISpeaking(false);
            onQuestionReceived?.(text, false);
            setCurrentUtterance(null);
        };

        setCurrentUtterance(utterance);
        speechSynthesis.speak(utterance);
    }, [speechSynthesis, currentUtterance, onQuestionReceived]);

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
    }, [addMessage, progress, timeRemaining, messages, onInterviewComplete, speakAIResponse, speechSynthesis]);

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
            addMessage("system", `Interview connection closed (${event.code})`);
            setWs(null);
        };

        websocket.onerror = (error) => {
            setConnectionStatus("disconnected");
            addMessage("error", "Connection error occurred");
            console.error("WebSocket error:", error);
        };

        setWs(websocket);
    }, [connectionStatus, addMessage, handleMessage, WS_URL, interviewId]);

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
    }, [input, ws, addMessage]);

    const toggleListening = useCallback(() => {
        if (!DEEPGRAM_API_KEY) {
            addMessage("error", "Deepgram API key missing for speech recognition");
            return;
        }

        // Stop AI speaking when user starts to respond
        if (!isListening) {
            stopAISpeaking();
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

        // Start Deepgram WebSocket
        const socket = new WebSocket(
            `wss://api.deepgram.com/v1/listen?model=nova-2&punctuate=true&language=en-US&encoding=linear16&sample_rate=16000`,
            ["token", DEEPGRAM_API_KEY]
        );

        setDgSocket(socket);

        socket.onopen = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setMediaStream(stream);

                const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
                setMediaRecorder(recorder);

                recorder.ondataavailable = async (e: BlobEvent) => {
                    if (e.data.size > 0 && socket.readyState === 1) {
                        const arrayBuffer = await e.data.arrayBuffer();
                        socket.send(arrayBuffer);
                    }
                };

                recorder.start(250);
            } catch (error) {
                console.error("Error accessing microphone:", error);
                addMessage("error", "Error accessing microphone");
                setIsListening(false);
            }
        };

        socket.onmessage = (msg) => {
            try {
                const data = JSON.parse(msg.data);
                if (data.channel?.alternatives?.[0]?.transcript !== undefined) {
                    const transcript = data.channel.alternatives.transcript || "";
                    if (transcript.trim()) {
                        setInput(transcript);
                    }
                }
            } catch (e) {
                console.error("Error parsing Deepgram response:", e);
            }
        };

        socket.onerror = (e) => {
            console.error("Deepgram WebSocket error:", e);
            addMessage("error", "Deepgram connection error");
            setIsListening(false);
        };

        socket.onclose = () => {
            setDgSocket(null);
        };

        return () => {
            socket.close();
            if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
            if (mediaStream) mediaStream.getTracks().forEach((track: any) => track.stop());
        };
    }, [isListening, DEEPGRAM_API_KEY, addMessage]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
        el.style.height = el.scrollHeight + 'px';
    };

    return (
        <div className="w-full h-full flex flex-col bg-white">
            {/* Enhanced Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">AI Interview</h1>
                        <p className="text-sm opacity-90">
                            Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                        </p>
                    </div>

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

            {/* Interview Controls - Only Start Button */}
            {connectionStatus === "disconnected" && (
                <div className="p-4 bg-gray-50 border-b">
                    <Button onClick={connectToInterview} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3">
                        <Play className="w-5 h-5 mr-2" />
                        Start Interview
                    </Button>
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
                <div className="p-4 border-t bg-white">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            submitAnswer();
                        }}
                        className="flex gap-3"
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
                            className="flex-1 min-h-[50px] max-h-60 resize-none border-2 focus:border-blue-500 rounded-xl px-4 py-3"
                            rows={1}
                            autoFocus
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={toggleListening}
                            className={`w-12 h-12 rounded-xl transition-all ${isListening
                                    ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                    : "bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                }`}
                        >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!safeInput.trim()}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-medium"
                        >
                            Submit
                        </Button>
                    </form>
                    {isListening && (
                        <div className="text-sm text-red-600 mt-2 flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            Listening for your response...
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
}
