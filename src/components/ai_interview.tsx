"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Mic, MicOff, Play, Square, Pause } from "lucide-react";

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

const APPLICATION_ID = "7558f27f-8f01-4128-a3f8-b4279eeb0048";
const WS_URL = `ws://localhost:8000/interview/${APPLICATION_ID}`;

export default function AIInterview() {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<InterviewStatus>("disconnected");
    const [messages, setMessages] = useState<InterviewMessage[]>([]);
    const [input, setInput] = useState("");
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [questionNumber, setQuestionNumber] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [progress, setProgress] = useState(0);
    const [finalAssessment, setFinalAssessment] = useState<FinalAssessment | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any | null>(null);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

                setInput(transcript);
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

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const addMessage = useCallback((type: InterviewMessage["type"], content: string, extra?: Partial<InterviewMessage>) => {
        setMessages(prev => [...prev, {
            type,
            content,
            timestamp: new Date(),
            ...extra
        }]);
    }, []);

    const connectToInterview = useCallback(() => {
        if (connectionStatus === "connected" || connectionStatus === "connecting") return;

        setConnectionStatus("connecting");
        addMessage("system", "Connecting to AI Interview System...");

        const websocket = new WebSocket(WS_URL);

        websocket.onopen = () => {
            setConnectionStatus("connected");
            addMessage("system", "Connected! Starting interview...");

            // Start interview automatically
            websocket.send(JSON.stringify({
                type: "start_interview",
                payload: {}
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
    }, [connectionStatus, addMessage]);

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
                setFinalAssessment(data.final_assessment);
                addMessage("system", "Interview completed! View your results below.");
                setCurrentQuestion("");
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
    }, [addMessage, progress, timeRemaining]);

    const submitAnswer = useCallback(() => {
        if (!input.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

        ws.send(JSON.stringify({
            type: "submit_answer",
            payload: { answer: input }
        }));

        addMessage("user", input);
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

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && connectionStatus === "connected" && currentQuestion) {
            submitAnswer();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <Card className="w-full max-w-4xl mx-auto flex flex-col h-[700px] border shadow-lg">
            {/* Header with Status and Controls */}
            <div className="p-4 border-b bg-background">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">AI Interview System</h2>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${connectionStatus === "connected" ? "bg-green-100 text-green-800" :
                            connectionStatus === "connecting" ? "bg-yellow-100 text-yellow-800" :
                                connectionStatus === "paused" ? "bg-orange-100 text-orange-800" :
                                    connectionStatus === "completed" ? "bg-blue-100 text-blue-800" :
                                        "bg-gray-100 text-gray-800"
                        }`}>
                        {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                    </div>
                </div>

                {/* Progress and Time */}
                {progress > 0 && (
                    <div className="flex items-center gap-4 mb-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-sm text-gray-600">{progress}%</span>
                        {timeRemaining > 0 && (
                            <span className="text-sm text-gray-600">
                                Time: {formatTime(timeRemaining)}
                            </span>
                        )}
                    </div>
                )}

                {/* Interview Controls */}
                <div className="flex gap-2">
                    {connectionStatus === "disconnected" && (
                        <Button onClick={connectToInterview} className="bg-green-600 hover:bg-green-700">
                            <Play className="w-4 h-4 mr-2" />
                            Start Interview
                        </Button>
                    )}

                    {connectionStatus === "connected" && (
                        <>
                            <Button onClick={pauseInterview} variant="outline" size="sm">
                                <Pause className="w-4 h-4 mr-1" />
                                Pause
                            </Button>
                            <Button onClick={endInterview} variant="destructive" size="sm">
                                <Square className="w-4 h-4 mr-1" />
                                End Interview
                            </Button>
                        </>
                    )}

                    {connectionStatus === "paused" && (
                        <Button onClick={resumeInterview} variant="outline" size="sm">
                            <Play className="w-4 h-4 mr-1" />
                            Resume
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground">
                        Click "Start Interview" to begin your AI interview session
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`rounded-lg px-4 py-3 max-w-[85%] shadow-sm ${msg.type === "user" ? "bg-blue-600 text-white" :
                                msg.type === "question" ? "bg-white text-gray-900 border-l-4 border-blue-500" :
                                    msg.type === "error" ? "bg-red-100 text-red-800 border border-red-200" :
                                        "bg-white text-gray-700 border"
                            }`}>
                            {msg.type === "question" && (
                                <div className="text-xs text-gray-500 mb-1">
                                    Question {msg.questionNumber} {msg.questionType && `(${msg.questionType})`}
                                </div>
                            )}
                            <div className="whitespace-pre-line text-sm">{msg.content}</div>
                            <div className="text-xs opacity-70 mt-1">
                                {msg.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Current Question Display */}
            {currentQuestion && connectionStatus === "connected" && (
                <div className="p-4 bg-blue-50 border-t border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-1">Current Question:</div>
                    <div className="text-blue-900">{currentQuestion}</div>
                </div>
            )}

            {/* Input Area */}
            {connectionStatus === "connected" && currentQuestion && (
                <div className="p-4 border-t bg-background">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            submitAnswer();
                        }}
                        className="flex gap-2"
                    >
                        <Input
                            placeholder="Type your answer or use the microphone..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            className="flex-1"
                            autoFocus
                        />
                        <Button
                            type="button"
                            onClick={toggleListening}
                            variant={isListening ? "destructive" : "outline"}
                            size="icon"
                        >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </Button>
                        <Button type="submit" disabled={!input.trim()}>
                            Submit
                        </Button>
                    </form>
                    {isListening && (
                        <div className="text-sm text-red-600 mt-1 flex items-center">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2" />
                            Listening...
                        </div>
                    )}
                </div>
            )}

            {/* Final Assessment */}
            {finalAssessment && connectionStatus === "completed" && (
                <div className="p-4 border-t bg-background max-h-80 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-green-600 mb-3">🎉 Interview Complete!</h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                            <div className="text-sm">
                                <span className="font-medium">Overall Score:</span> {finalAssessment.overall_score}%
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">Technical Score:</span> {finalAssessment.technical_score}%
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">Recommendation:</span> {finalAssessment.final_recommendation}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm">
                                <span className="font-medium">Industry:</span> {finalAssessment.industry_type}
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">Duration:</span> {finalAssessment.interview_metrics.duration}
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">Questions:</span> {finalAssessment.interview_metrics.questions_answered}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <h4 className="font-medium text-sm mb-1">Feedback:</h4>
                            <p className="text-sm text-gray-700">{finalAssessment.feedback.universal_feedback_for_candidate}</p>
                        </div>

                        {finalAssessment.feedback.areas_of_improvement_for_candidate.length > 0 && (
                            <div>
                                <h4 className="font-medium text-sm mb-1">Areas for Improvement:</h4>
                                <ul className="text-sm text-gray-700 list-disc list-inside">
                                    {finalAssessment.feedback.areas_of_improvement_for_candidate.map((area, idx) => (
                                        <li key={idx}>{area}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
}
