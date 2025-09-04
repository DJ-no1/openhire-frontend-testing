// components/ai_interview.tsx
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Mic, MicOff, Play, Square, Pause } from "lucide-react";
import { getInterviewWebSocketUrlWithApp } from "@/lib/api-config";

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

interface AIInterviewProps {
    applicationId: string;
    interviewId: string;
    onStatusChange: (status: InterviewStatus) => void;
    onInterviewComplete: (finalAssessment: FinalAssessment, conversation: InterviewMessage[]) => void;
}

export default function AIInterviewNew({
    applicationId,
    interviewId,
    onStatusChange,
    onInterviewComplete
}: AIInterviewProps) {
    // ALL STATE DECLARATIONS FIRST
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
    const [recognition, setRecognition] = useState<any>(null);

    // Deepgram state
    const [dgSocket, setDgSocket] = useState<WebSocket | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    // ALL REF DECLARATIONS
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // WebSocket URL using the passed applicationId
    const WS_URL = getInterviewWebSocketUrlWithApp(applicationId);

    // HELPER FUNCTIONS FOR SAFE OPERATIONS
    const safeInput = input || "";

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
                break;
            case "interview_completed":
                setConnectionStatus("completed");
                const assessment = data.final_assessment;
                setFinalAssessment(assessment);
                addMessage("system", "Interview completed! View your results below.");
                setCurrentQuestion("");

                // Pass final assessment and conversation to parent
                onInterviewComplete(assessment, messages);
                break;
            case "interview_paused":
                setConnectionStatus("paused");
                addMessage("system", "Interview has been paused");
                break;
            case "interview_resumed":
                setConnectionStatus("connected");
                addMessage("system", "Interview has been resumed");
                break;
            case "status_update":
                setProgress(data.progress || progress);
                setTimeRemaining(data.time_remaining || timeRemaining);
                addMessage("system", data.message);
                break;
            case "error":
                addMessage("error", `Error: ${data.message}`);
                break;
            case "pong":
                console.log("Received pong at", data.timestamp);
                break;
            default:
                console.log("Unknown message type:", data);
        }
    }, [addMessage, progress, timeRemaining, messages, onInterviewComplete]);

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

    const endInterview = useCallback(() => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        ws.send(JSON.stringify({
            type: "submit_answer",
            payload: { answer: "end" }
        }));

        addMessage("user", "Ending interview...");
        setInput("");
        setCurrentQuestion("");
    }, [ws, addMessage]);

    const pauseInterview = useCallback(() => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        ws.send(JSON.stringify({
            type: "pause_interview",
            payload: {}
        }));
    }, [ws]);

    const resumeInterview = useCallback(() => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        ws.send(JSON.stringify({
            type: "resume_interview",
            payload: {}
        }));
    }, [ws]);

    const toggleListening = useCallback(() => {
        if (!recognition) {
            addMessage("error", "Speech recognition not supported in this browser");
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
            setIsListening(true);
        }
    }, [recognition, isListening, addMessage]);

    // EFFECTS (after all state and callbacks)

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognitionInstance = new SpeechRecognition();

            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = "en-US";

            recognitionInstance.onresult = (event: any) => {
                const results = Array.from(event.results);
                const transcript = results
                    .map((result: any) => result[0].transcript)
                    .join("");
                setInput(transcript || "");
            };

            recognitionInstance.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };

            recognitionInstance.onend = () => {
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        }
    }, []);

    // Deepgram: Start/stop audio streaming
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

    // HELPER FUNCTIONS
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
        <Card className="w-full h-screen flex flex-col">
            {/* Header with Status and Controls */}
            <div className="flex justify-between items-center p-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold">AI Interview System</h1>
                    <p className="text-sm text-gray-600">
                        Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                    </p>
                </div>

                {/* Progress and Time */}
                {progress > 0 && (
                    <div className="text-right">
                        <div className="text-sm font-medium">{progress}%</div>
                        {timeRemaining > 0 && (
                            <div className="text-sm text-gray-600">Time: {formatTime(timeRemaining)}</div>
                        )}
                    </div>
                )}
            </div>

            {/* Interview Controls */}
            <div className="p-4 border-b">
                {connectionStatus === "disconnected" && (
                    <Button onClick={connectToInterview} className="bg-green-600 hover:bg-green-700">
                        <Play className="w-4 h-4 mr-2" />
                        Start Interview
                    </Button>
                )}

                {connectionStatus === "connected" && (
                    <>
                        <Button onClick={pauseInterview} variant="outline" className="mr-2">
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                        </Button>
                        <Button onClick={endInterview} variant="destructive">
                            <Square className="w-4 h-4 mr-2" />
                            End Interview
                        </Button>
                    </>
                )}

                {connectionStatus === "paused" && (
                    <Button onClick={resumeInterview} className="bg-blue-600 hover:bg-blue-700">
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                    </Button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-20">
                        Click "Start Interview" to begin your AI interview session
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`p-3 rounded-lg ${msg.type === "user"
                            ? "bg-blue-100 ml-12"
                            : msg.type === "question"
                                ? "bg-green-100"
                                : msg.type === "error"
                                    ? "bg-red-100"
                                    : "bg-gray-100"
                            }`}
                    >
                        {msg.type === "question" && (
                            <div className="font-semibold text-green-800 mb-1">
                                Question {msg.questionNumber} {msg.questionType && `(${msg.questionType})`}
                            </div>
                        )}
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {msg.timestamp.toLocaleTimeString()}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Current Question Display */}
            {currentQuestion && connectionStatus === "connected" && (
                <div className="p-4 bg-yellow-50 border-t border-yellow-200">
                    <div className="font-medium text-yellow-800 mb-2">Current Question:</div>
                    <div className="text-gray-700">{currentQuestion}</div>
                </div>
            )}

            {/* Input Area */}
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
                            className="flex-1 min-h-[40px] max-h-60"
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
                        <div className="text-sm text-red-600 mt-1">Listening...</div>
                    )}
                </div>
            )}

            {/* Final Assessment */}
            {finalAssessment && connectionStatus === "completed" && (
                <div className="p-6 bg-green-50 border-t">
                    <h2 className="text-xl font-bold text-green-800 mb-4">🎉 Interview Complete!</h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <div className="text-sm text-gray-600">Overall Score</div>
                            <div className="text-2xl font-bold text-green-600">{finalAssessment.overall_score}%</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Technical Score</div>
                            <div className="text-2xl font-bold text-blue-600">{finalAssessment.technical_score}%</div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="text-sm text-gray-600">Recommendation</div>
                        <div className="font-medium">{finalAssessment.final_recommendation}</div>
                    </div>

                    <div className="mb-4">
                        <div className="text-sm text-gray-600">Industry</div>
                        <div className="font-medium">{finalAssessment.industry_type}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                            <div className="text-gray-600">Duration</div>
                            <div>{finalAssessment.interview_metrics.duration}</div>
                        </div>
                        <div>
                            <div className="text-gray-600">Questions</div>
                            <div>{finalAssessment.interview_metrics.questions_answered}</div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h3 className="font-medium text-gray-800 mb-2">Feedback:</h3>
                        <p className="text-gray-700">{finalAssessment.feedback.universal_feedback_for_candidate}</p>
                    </div>

                    {finalAssessment.feedback.areas_of_improvement_for_candidate.length > 0 && (
                        <div>
                            <h3 className="font-medium text-gray-800 mb-2">Areas for Improvement:</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {finalAssessment.feedback.areas_of_improvement_for_candidate.map((area, idx) => (
                                    <li key={idx} className="text-gray-700">{area}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
