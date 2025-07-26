"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Mic,
    MicOff,
    Send,
    Clock,
    Users,
    MessageSquare,
    Play,
    Square,
    Volume2,
    AlertCircle,
    CheckCircle2,
    Loader2,
    User,
    Bot
} from "lucide-react";
import { toast } from "sonner";

// Extend Window interface for Speech Recognition
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

interface SpeechRecognitionEvent {
    resultIndex: number;
    results: {
        [index: number]: {
            [index: number]: {
                transcript: string;
            };
        };
        length: number;
    };
}

interface SpeechRecognitionErrorEvent {
    error: string;
}

// Types
interface InterviewMessage {
    id: string;
    type: 'ai' | 'candidate';
    content: string;
    timestamp: Date;
    isLive?: boolean;
}

interface InterviewStatus {
    phase: 'setup' | 'connecting' | 'active' | 'ended';
    timeElapsed: number;
    maxDuration: number;
    questionsAsked: number;
    currentQuestion?: string;
}

interface WebSocketMessage {
    type: 'start_interview' | 'candidate_response' | 'live_transcript' | 'end_interview' | 'ai_question' | 'error';
    data: any;
    timestamp?: string;
}

interface InterviewSetupData {
    jobId: string;
    candidateId: string;
    candidateName: string;
    resumeText?: string;
    maxDuration: number;
}

export function AIInterviewSystem() {
    // State management
    const [status, setStatus] = useState<InterviewStatus>({
        phase: 'setup',
        timeElapsed: 0,
        maxDuration: 30,
        questionsAsked: 0
    });

    const [messages, setMessages] = useState<InterviewMessage[]>([]);
    const [setupData, setSetupData] = useState<InterviewSetupData>({
        jobId: '',
        candidateId: '',
        candidateName: '',
        maxDuration: 30
    });

    const [isRecording, setIsRecording] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [textInput, setTextInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId, setSessionId] = useState('');

    // Refs
    const wsRef = useRef<WebSocket | null>(null);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Generate session ID
    const generateSessionId = () => {
        return `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    // Setup Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                setLiveTranscript(transcript);
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);
                toast.error('Speech recognition error. Please try again.');
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Timer for interview duration
    useEffect(() => {
        if (status.phase === 'active') {
            timerRef.current = setInterval(() => {
                setStatus(prev => {
                    const newTimeElapsed = prev.timeElapsed + 1;
                    if (newTimeElapsed >= prev.maxDuration * 60) {
                        endInterview();
                        return prev;
                    }
                    return { ...prev, timeElapsed: newTimeElapsed };
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [status.phase]);

    // WebSocket connection
    const connectWebSocket = useCallback((sessionId: string) => {
        try {
            const ws = new WebSocket(`ws://localhost:8000/ws/interview/${sessionId}`);

            ws.onopen = () => {
                setIsConnected(true);
                setStatus(prev => ({ ...prev, phase: 'connecting' }));
                toast.success('Connected to interview system');
            };

            ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    handleWebSocketMessage(message);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            ws.onclose = () => {
                setIsConnected(false);
                toast.error('Connection lost');
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                toast.error('Connection error');
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Failed to connect:', error);
            toast.error('Failed to connect to interview system');
        }
    }, []);

    // Handle WebSocket messages
    const handleWebSocketMessage = (message: WebSocketMessage) => {
        switch (message.type) {
            case 'ai_question':
                addMessage({
                    id: `ai_${Date.now()}`,
                    type: 'ai',
                    content: message.data.question,
                    timestamp: new Date()
                });
                setStatus(prev => ({
                    ...prev,
                    phase: 'active',
                    questionsAsked: prev.questionsAsked + 1,
                    currentQuestion: message.data.question
                }));
                break;

            case 'live_transcript':
                setLiveTranscript(message.data.transcript);
                break;

            case 'end_interview':
                addMessage({
                    id: `ai_final_${Date.now()}`,
                    type: 'ai',
                    content: message.data.feedback || 'Thank you for your time. The interview has been completed.',
                    timestamp: new Date()
                });
                setStatus(prev => ({ ...prev, phase: 'ended' }));
                break;

            case 'error':
                toast.error(message.data.message || 'An error occurred');
                break;
        }
    };

    // Send message via WebSocket
    const sendWebSocketMessage = (type: string, data: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, data }));
        }
    };

    // Start interview
    const startInterview = () => {
        if (!setupData.jobId || !setupData.candidateId || !setupData.candidateName) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        connectWebSocket(newSessionId);

        // Send start interview message
        setTimeout(() => {
            sendWebSocketMessage('start_interview', {
                job_id: setupData.jobId,
                candidate_id: setupData.candidateId,
                candidate_name: setupData.candidateName,
                resume_text: setupData.resumeText || '',
                preferences: {
                    max_duration: setupData.maxDuration
                }
            });
        }, 1000);
    };

    // End interview
    const endInterview = () => {
        sendWebSocketMessage('end_interview', {});
        setStatus(prev => ({ ...prev, phase: 'ended' }));
        if (wsRef.current) {
            wsRef.current.close();
        }
    };

    // Add message to chat
    const addMessage = (message: InterviewMessage) => {
        setMessages(prev => [...prev, message]);
    };

    // Handle text input send
    const handleSendText = () => {
        if (!textInput.trim()) return;

        const message: InterviewMessage = {
            id: `candidate_${Date.now()}`,
            type: 'candidate',
            content: textInput,
            timestamp: new Date()
        };

        addMessage(message);
        sendWebSocketMessage('candidate_response', { response: textInput });
        setTextInput('');
    };

    // Handle voice recording
    const toggleRecording = () => {
        if (!recognitionRef.current) {
            toast.error('Speech recognition not supported in this browser');
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            if (liveTranscript.trim()) {
                const message: InterviewMessage = {
                    id: `candidate_voice_${Date.now()}`,
                    type: 'candidate',
                    content: liveTranscript,
                    timestamp: new Date()
                };
                addMessage(message);
                sendWebSocketMessage('candidate_response', { response: liveTranscript });
                setLiveTranscript('');
            }
        } else {
            setLiveTranscript('');
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (recognitionRef.current && isRecording) {
                recognitionRef.current.stop();
            }
        };
    }, [isRecording]);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-6 w-6" />
                        AI Interview System
                    </CardTitle>
                    <div className="flex items-center gap-4">
                        <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
                            {isConnected ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </Badge>
                        <Badge variant="outline">{status.phase.charAt(0).toUpperCase() + status.phase.slice(1)}</Badge>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Interview Area */}
                <div className="lg:col-span-2 space-y-6">
                    {status.phase === 'setup' && (
                        <InterviewSetup
                            setupData={setupData}
                            setSetupData={setSetupData}
                            onStart={startInterview}
                        />
                    )}

                    {status.phase !== 'setup' && (
                        <ChatInterface
                            messages={messages}
                            liveTranscript={liveTranscript}
                            isRecording={isRecording}
                            textInput={textInput}
                            setTextInput={setTextInput}
                            onSendText={handleSendText}
                            onToggleRecording={toggleRecording}
                            messagesEndRef={messagesEndRef}
                            status={status}
                        />
                    )}
                </div>

                {/* Status Panel */}
                <div className="space-y-6">
                    <StatusPanel
                        status={status}
                        formatTime={formatTime}
                        setupData={setupData}
                        onEndInterview={endInterview}
                    />

                    {status.phase === 'active' && (
                        <VoiceControls
                            isRecording={isRecording}
                            liveTranscript={liveTranscript}
                            onToggleRecording={toggleRecording}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// Interview Setup Component
interface InterviewSetupProps {
    setupData: InterviewSetupData;
    setSetupData: (data: InterviewSetupData) => void;
    onStart: () => void;
}

function InterviewSetup({ setupData, setSetupData, onStart }: InterviewSetupProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Interview Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Job ID *</label>
                        <Input
                            placeholder="e.g., test_job_001"
                            value={setupData.jobId}
                            onChange={(e) => setSetupData({ ...setupData, jobId: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Candidate ID *</label>
                        <Input
                            placeholder="e.g., test_candidate_001"
                            value={setupData.candidateId}
                            onChange={(e) => setSetupData({ ...setupData, candidateId: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Candidate Name *</label>
                    <Input
                        placeholder="Enter candidate's full name"
                        value={setupData.candidateName}
                        onChange={(e) => setSetupData({ ...setupData, candidateName: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Max Duration (minutes)</label>
                    <Input
                        type="number"
                        min="5"
                        max="120"
                        value={setupData.maxDuration}
                        onChange={(e) => setSetupData({ ...setupData, maxDuration: parseInt(e.target.value) || 30 })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Resume Text (Optional)</label>
                    <textarea
                        className="w-full p-3 border rounded-md resize-vertical min-h-[100px]"
                        placeholder="Paste resume content here for personalized questions..."
                        value={setupData.resumeText}
                        onChange={(e) => setSetupData({ ...setupData, resumeText: e.target.value })}
                    />
                </div>

                <Button onClick={onStart} className="w-full" size="lg">
                    <Play className="mr-2 h-4 w-4" />
                    Start Interview
                </Button>
            </CardContent>
        </Card>
    );
}

// Chat Interface Component
interface ChatInterfaceProps {
    messages: InterviewMessage[];
    liveTranscript: string;
    isRecording: boolean;
    textInput: string;
    setTextInput: (text: string) => void;
    onSendText: () => void;
    onToggleRecording: () => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    status: InterviewStatus;
}

function ChatInterface({
    messages,
    liveTranscript,
    isRecording,
    textInput,
    setTextInput,
    onSendText,
    onToggleRecording,
    messagesEndRef,
    status
}: ChatInterfaceProps) {
    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Interview Conversation
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
                {/* Messages Area */}
                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex items-start gap-3 ${message.type === 'candidate' ? 'flex-row-reverse' : ''
                                    }`}
                            >
                                <Avatar className="h-8 w-8">
                                    {message.type === 'ai' ? (
                                        <Bot className="h-5 w-5" />
                                    ) : (
                                        <User className="h-5 w-5" />
                                    )}
                                </Avatar>

                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${message.type === 'ai'
                                            ? 'bg-blue-50 text-blue-900'
                                            : 'bg-green-50 text-green-900'
                                        }`}
                                >
                                    <p className="text-sm">{message.content}</p>
                                    <span className="text-xs opacity-70">
                                        {message.timestamp.toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Live Transcript Display */}
                        {isRecording && liveTranscript && (
                            <div className="flex items-start gap-3 flex-row-reverse">
                                <Avatar className="h-8 w-8">
                                    <User className="h-5 w-5" />
                                </Avatar>
                                <div className="max-w-[80%] p-3 rounded-lg bg-yellow-50 text-yellow-900 border border-yellow-200">
                                    <p className="text-sm">{liveTranscript}</p>
                                    <span className="text-xs opacity-70 flex items-center gap-1">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Live transcript...
                                    </span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Input Area */}
                {status.phase === 'active' && (
                    <>
                        <Separator className="my-4" />
                        <div className="flex gap-2">
                            <Input
                                placeholder="Type your response..."
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && onSendText()}
                                className="flex-1"
                            />
                            <Button onClick={onSendText} disabled={!textInput.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={isRecording ? "destructive" : "outline"}
                                onClick={onToggleRecording}
                            >
                                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// Status Panel Component
interface StatusPanelProps {
    status: InterviewStatus;
    formatTime: (seconds: number) => string;
    setupData: InterviewSetupData;
    onEndInterview: () => void;
}

function StatusPanel({ status, formatTime, setupData, onEndInterview }: StatusPanelProps) {
    const progressPercentage = (status.timeElapsed / (status.maxDuration * 60)) * 100;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Interview Status
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Candidate Info */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{setupData.candidateName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Job ID: {setupData.jobId}
                    </div>
                </div>

                <Separator />

                {/* Time Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Time Elapsed</span>
                        <span className="font-mono">
                            {formatTime(status.timeElapsed)} / {formatTime(status.maxDuration * 60)}
                        </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                </div>

                {/* Interview Metrics */}
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{status.questionsAsked}</div>
                        <div className="text-xs text-blue-600">Questions</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {status.phase === 'active' ? 'Live' : status.phase}
                        </div>
                        <div className="text-xs text-green-600">Status</div>
                    </div>
                </div>

                {/* End Interview Button */}
                {status.phase === 'active' && (
                    <Button variant="destructive" onClick={onEndInterview} className="w-full">
                        <Square className="mr-2 h-4 w-4" />
                        End Interview
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

// Voice Controls Component
interface VoiceControlsProps {
    isRecording: boolean;
    liveTranscript: string;
    onToggleRecording: () => void;
}

function VoiceControls({ isRecording, liveTranscript, onToggleRecording }: VoiceControlsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Voice Controls
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <Button
                    variant={isRecording ? "destructive" : "default"}
                    onClick={onToggleRecording}
                    className="w-full"
                    size="lg"
                >
                    {isRecording ? (
                        <>
                            <MicOff className="mr-2 h-5 w-5" />
                            Stop Recording
                        </>
                    ) : (
                        <>
                            <Mic className="mr-2 h-5 w-5" />
                            Start Recording
                        </>
                    )}
                </Button>

                {isRecording && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            Recording...
                        </div>
                        {liveTranscript && (
                            <p className="text-sm text-gray-700">{liveTranscript}</p>
                        )}
                    </div>
                )}

                <div className="text-xs text-muted-foreground">
                    <p>💡 Tips:</p>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                        <li>Speak clearly and at normal pace</li>
                        <li>Use the microphone button or text input</li>
                        <li>Your responses are sent automatically</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
