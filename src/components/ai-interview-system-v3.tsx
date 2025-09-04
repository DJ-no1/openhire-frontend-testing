"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    Bot,
    Wifi,
    WifiOff,
    Settings,
    X
} from "lucide-react";
import { toast } from "sonner";
import { useInterviewWebSocket } from "@/hooks/use-interview-websocket";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { getApiUrl, isUsingLocalBackend } from "@/lib/api-config";

// Types based on API Documentation
interface ChatMessage {
    id: string;
    type: 'ai' | 'candidate';
    content: string;
    timestamp: Date;
    isLive?: boolean;
}

interface InterviewSetup {
    jobId: string;
    candidateId: string;
    candidateName: string;
    resumeText?: string;
    maxDuration: number;
    difficultyLevel: 'easy' | 'medium' | 'hard';
    focusAreas: string[];
}

type InterviewPhase = 'setup' | 'connecting' | 'introduction' | 'technical' | 'behavioral' | 'conclusion' | 'ended';

export function AIInterviewSystemV3() {
    // Core state
    const [sessionId, setSessionId] = useState('');
    const [phase, setPhase] = useState<InterviewPhase>('setup');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [textInput, setTextInput] = useState('');
    const [showSetup, setShowSetup] = useState(true);

    // Setup configuration
    const [setup, setSetup] = useState<InterviewSetup>({
        jobId: '',
        candidateId: '',
        candidateName: '',
        resumeText: '',
        maxDuration: 30,
        difficultyLevel: 'medium',
        focusAreas: []
    });

    // Interview state
    const [interviewInfo, setInterviewInfo] = useState<{
        jobTitle?: string;
        company?: string;
        timeElapsed: number;
        questionsAsked: number;
        comfortLevel?: string;
        currentPhase?: string;
    }>({
        timeElapsed: 0,
        questionsAsked: 0
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Test backend connection
    const testConnection = async () => {
        try {
            const response = await fetch(getApiUrl('/health'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                toast.success('✅ Backend is running and accessible!');
            } else {
                toast.error('❌ Backend responded but with an error');
            }
        } catch (error) {
            const backendInfo = isUsingLocalBackend() ? 'localhost:8000' : 'production backend';
            toast.error(`❌ Cannot reach backend on ${backendInfo}. Please check your backend server.`);
        }
    };

    // Generate unique session ID
    const generateSessionId = () => {
        return `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    // Initialize WebSocket connection
    const {
        isConnected,
        connectionState,
        interviewData,
        lastAIResponse,
        status,
        connect,
        disconnect,
        startInterview,
        sendCandidateResponse,
        sendLiveTranscript,
        endInterview,
        getStatus
    } = useInterviewWebSocket(sessionId, {
        onInterviewStarted: (data) => {
            console.log('Interview started:', data);
            setPhase(data.interview_phase as InterviewPhase);
            setInterviewInfo(prev => ({
                ...prev,
                jobTitle: data.job_title,
                company: data.company,
                currentPhase: data.interview_phase
            }));

            // Add initial AI message
            addMessage({
                id: `ai_${Date.now()}`,
                type: 'ai',
                content: data.initial_question,
                timestamp: new Date()
            });

            // Start timer
            startTimer();
            toast.success('Interview started successfully!');
        },

        onAIResponse: (data) => {
            console.log('AI Response:', data);
            setPhase(data.interview_phase as InterviewPhase);
            setInterviewInfo(prev => ({
                ...prev,
                timeElapsed: Math.floor(data.time_elapsed * 60),
                questionsAsked: data.questions_asked,
                comfortLevel: data.comfort_level,
                currentPhase: data.interview_phase
            }));

            // Add AI response and question
            if (data.response) {
                addMessage({
                    id: `ai_response_${Date.now()}`,
                    type: 'ai',
                    content: data.response,
                    timestamp: new Date()
                });
            }

            if (data.question && data.question !== data.response) {
                addMessage({
                    id: `ai_question_${Date.now()}`,
                    type: 'ai',
                    content: data.question,
                    timestamp: new Date()
                });
            }
        },

        onInterviewEnded: (data) => {
            console.log('Interview ended:', data);
            setPhase('ended');
            stopTimer();

            addMessage({
                id: `ai_final_${Date.now()}`,
                type: 'ai',
                content: data.final_feedback,
                timestamp: new Date()
            });

            toast.success('Interview completed!');
        },

        onStatusUpdate: (data) => {
            console.log('Status update:', data);
            setInterviewInfo(prev => ({
                ...prev,
                timeElapsed: Math.floor(data.time_elapsed * 60),
                questionsAsked: data.questions_asked,
                comfortLevel: data.comfort_level,
                currentPhase: data.interview_phase
            }));
        },

        onLiveTranscriptUpdate: (data) => {
            // Handle live transcript updates if needed
            console.log('Live transcript:', data);
        },

        onError: (error) => {
            console.error('Interview error:', error);
            toast.error(error.message || 'An error occurred during the interview');
        },

        onOpen: () => {
            console.log('WebSocket connected');
            toast.success('Connected to AI backend!');
        },

        onClose: () => {
            console.log('WebSocket disconnected');
            if (phase !== 'ended' && phase !== 'setup') {
                toast.error('Connection lost. Attempting to reconnect...');
            }
        },

        onConnectionError: () => {
            console.error('WebSocket connection error');
            const backendInfo = isUsingLocalBackend() ? 'localhost:8000' : 'production backend';
            toast.error(`Cannot connect to AI backend. Please ensure it is running on ${backendInfo}`);
            // Reset to setup if connection fails
            setTimeout(() => {
                setPhase('setup');
                setShowSetup(true);
            }, 2000);
        }
    });

    // Speech recognition
    const {
        isListening,
        transcript,
        finalTranscript,
        isSupported: speechSupported,
        startListening,
        stopListening,
        resetTranscript
    } = useSpeechRecognition({
        onResult: (transcript, isFinal) => {
            // Send live transcript
            if (isConnected) {
                sendLiveTranscript(transcript, isFinal);
            }

            // Send final response
            if (isFinal && transcript.trim()) {
                handleSendResponse(transcript.trim());
                resetTranscript();
            }
        },
        onError: (error) => {
            toast.error(`Speech recognition error: ${error}`);
        }
    });

    // Timer management
    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setInterviewInfo(prev => {
                const newTimeElapsed = prev.timeElapsed + 1;

                // Auto-end interview if time limit reached
                if (newTimeElapsed >= setup.maxDuration * 60) {
                    endInterview();
                    return prev;
                }

                return { ...prev, timeElapsed: newTimeElapsed };
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // Message management
    const addMessage = (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
    };

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Start interview process
    const handleStartInterview = () => {
        if (!setup.candidateName.trim()) {
            toast.error('Please enter candidate name');
            return;
        }

        if (!setup.jobId.trim()) {
            toast.error('Please enter Job ID');
            return;
        }

        if (!setup.candidateId.trim()) {
            toast.error('Please enter Recruiter/Candidate ID');
            return;
        }

        if (!setup.resumeText?.trim()) {
            toast.error('Please provide resume text');
            return;
        }

        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        setShowSetup(false);
        setPhase('connecting');

        // Clear any existing messages
        setMessages([]);

        // Wait for WebSocket connection and then start interview
        const waitForConnection = () => {
            const checkConnection = () => {
                if (isConnected) {
                    const success = startInterview({
                        job_id: setup.jobId,
                        candidate_id: setup.candidateId,
                        resume_text: setup.resumeText,
                        preferences: {
                            max_duration: setup.maxDuration,
                            difficulty_level: setup.difficultyLevel,
                            focus_areas: setup.focusAreas
                        }
                    });

                    if (!success) {
                        toast.error('Failed to start interview. Please check your connection.');
                    }
                } else if (connectionState === 'error') {
                    const backendInfo = isUsingLocalBackend() ? 'localhost:8000' : 'production backend';
                    toast.error(`Unable to connect to backend. Please ensure your AI backend is running on ${backendInfo}`);
                    setPhase('setup');
                    setShowSetup(true);
                } else {
                    // Still connecting, check again
                    setTimeout(checkConnection, 500);
                }
            };

            setTimeout(checkConnection, 1000);
        };

        waitForConnection();
    };

    // Send text response
    const handleSendResponse = (response: string) => {
        if (!response.trim() || !isConnected) return;

        // Add candidate message to chat
        addMessage({
            id: `candidate_${Date.now()}`,
            type: 'candidate',
            content: response,
            timestamp: new Date()
        });

        // Send to backend
        sendCandidateResponse(response);
    };

    const handleSendText = () => {
        if (!textInput.trim()) return;
        handleSendResponse(textInput);
        setTextInput('');
    };

    // Voice recording
    const toggleRecording = () => {
        if (!speechSupported) {
            toast.error('Speech recognition not supported in this browser');
            return;
        }

        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // End interview
    const handleEndInterview = () => {
        endInterview();
        stopTimer();
        setPhase('ended');
    };

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get phase display
    const getPhaseDisplay = () => {
        switch (phase) {
            case 'setup': return 'Setup';
            case 'connecting': return 'Connecting...';
            case 'introduction': return 'Introduction';
            case 'technical': return 'Technical Questions';
            case 'behavioral': return 'Behavioral Questions';
            case 'conclusion': return 'Conclusion';
            case 'ended': return 'Completed';
            default: return 'In Progress';
        }
    };

    // Get comfort level color
    const getComfortColor = (level?: string) => {
        switch (level) {
            case 'nervous': return 'bg-red-100 text-red-800';
            case 'neutral': return 'bg-yellow-100 text-yellow-800';
            case 'confident': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopTimer();
            disconnect();
        };
    }, []);

    // Setup Modal/Panel
    if (showSetup) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-6 w-6" />
                            Real AI Interview Setup
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                            Configure actual recruiter details and candidate information for live AI interview
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Candidate Information</h3>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Candidate Name *</label>
                                    <Input
                                        placeholder="Enter candidate's full name"
                                        value={setup.candidateName}
                                        onChange={(e) => setSetup(prev => ({ ...prev, candidateName: e.target.value }))}
                                        className={!setup.candidateName.trim() ? "border-red-300" : ""}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Recruiter/Candidate ID *</label>
                                    <Input
                                        placeholder="Enter actual recruiter or candidate ID"
                                        value={setup.candidateId}
                                        onChange={(e) => setSetup(prev => ({ ...prev, candidateId: e.target.value }))}
                                        className={!setup.candidateId.trim() ? "border-red-300" : ""}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Use the actual ID from your system</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Resume Text *</label>
                                    <Textarea
                                        placeholder="Paste the complete resume text here..."
                                        rows={6}
                                        value={setup.resumeText || ''}
                                        onChange={(e) => setSetup(prev => ({ ...prev, resumeText: e.target.value }))}
                                        className={!setup.resumeText?.trim() ? "border-red-300" : ""}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Required: Full resume content for AI analysis</p>
                                </div>
                            </div>

                            {/* Interview Preferences */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Interview Preferences</h3>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Job ID *</label>
                                    <Input
                                        placeholder="Enter actual job UUID from your system"
                                        value={setup.jobId}
                                        onChange={(e) => setSetup(prev => ({ ...prev, jobId: e.target.value }))}
                                        className={!setup.jobId.trim() ? "border-red-300" : ""}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Required: Job ID from your jobs database</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Max Duration (minutes)</label>
                                    <Input
                                        type="number"
                                        min="10"
                                        max="60"
                                        value={setup.maxDuration}
                                        onChange={(e) => setSetup(prev => ({ ...prev, maxDuration: parseInt(e.target.value) }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                                    <Select
                                        value={setup.difficultyLevel}
                                        onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                                            setSetup(prev => ({ ...prev, difficultyLevel: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="easy">Easy</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="hard">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Focus Areas (Optional)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['javascript', 'react', 'node.js', 'python', 'java', 'sql', 'problem-solving', 'system-design', 'databases', 'leadership', 'communication'].map((skill) => (
                                            <Badge
                                                key={skill}
                                                variant={setup.focusAreas.includes(skill) ? "default" : "outline"}
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setSetup(prev => ({
                                                        ...prev,
                                                        focusAreas: prev.focusAreas.includes(skill)
                                                            ? prev.focusAreas.filter(s => s !== skill)
                                                            : [...prev.focusAreas, skill]
                                                    }));
                                                }}
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Select skills to focus on during the interview</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                            <div className="space-y-1">
                                {speechSupported ? (
                                    <span className="flex items-center gap-2 text-green-600 text-sm">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Speech recognition ready
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-orange-600 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        Speech recognition not supported
                                    </span>
                                )}
                                <p className="text-xs text-gray-500">
                                    ⚠️ Make sure your backend AI agent is running on {isUsingLocalBackend() ? 'localhost:8000' : 'the production server'}
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={testConnection}
                                    className="mt-2"
                                >
                                    Test Backend Connection
                                </Button>
                            </div>

                            <Button
                                onClick={handleStartInterview}
                                disabled={!setup.candidateName.trim() || !setup.jobId.trim() || !setup.candidateId.trim() || !setup.resumeText?.trim()}
                                className="min-w-32"
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Start AI Interview
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Main Interview Interface
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-6 w-6" />
                            AI Interview System
                            {isConnected ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    <Wifi className="h-3 w-3 mr-1" />
                                    Connected
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-red-100 text-red-800">
                                    <WifiOff className="h-3 w-3 mr-1" />
                                    Disconnected
                                </Badge>
                            )}
                        </CardTitle>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSetup(true)}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Setup
                            </Button>

                            {phase !== 'ended' && phase !== 'setup' && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleEndInterview}
                                >
                                    <Square className="h-4 w-4 mr-2" />
                                    End Interview
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Status Panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium">Time Elapsed</p>
                                <p className="text-2xl font-bold">{formatTime(interviewInfo.timeElapsed)}</p>
                                <p className="text-xs text-gray-500">
                                    / {formatTime(setup.maxDuration * 60)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-green-600" />
                            <div>
                                <p className="text-sm font-medium">Questions</p>
                                <p className="text-2xl font-bold">{interviewInfo.questionsAsked}</p>
                                <p className="text-xs text-gray-500">Asked so far</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium">Phase</p>
                                <p className="text-lg font-bold">{getPhaseDisplay()}</p>
                                {interviewInfo.company && (
                                    <p className="text-xs text-gray-500">{interviewInfo.company}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-orange-600" />
                            <div>
                                <p className="text-sm font-medium">Comfort Level</p>
                                {interviewInfo.comfortLevel ? (
                                    <Badge className={getComfortColor(interviewInfo.comfortLevel)}>
                                        {interviewInfo.comfortLevel}
                                    </Badge>
                                ) : (
                                    <p className="text-sm text-gray-500">Not determined</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Interview Progress</span>
                        <span className="text-sm text-gray-500">
                            {Math.round((interviewInfo.timeElapsed / (setup.maxDuration * 60)) * 100)}%
                        </span>
                    </div>
                    <Progress
                        value={(interviewInfo.timeElapsed / (setup.maxDuration * 60)) * 100}
                        className="w-full"
                    />
                </CardContent>
            </Card>

            {/* Chat Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Messages */}
                <div className="lg:col-span-2">
                    <Card className="h-[500px] flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg">Interview Conversation</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <ScrollArea className="flex-1 pr-4">
                                <div className="space-y-4">
                                    {messages.length === 0 && phase === 'connecting' && (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="text-center space-y-4">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                                <p className="text-gray-500">Connecting to AI backend...</p>
                                                <p className="text-xs text-gray-400">
                                                    {connectionState === 'error' ? (
                                                        <span className="text-red-500">
                                                            ❌ Connection failed. Check if backend is running on {isUsingLocalBackend() ? 'localhost:8000' : 'the production server'}
                                                        </span>
                                                    ) : (
                                                        `Status: ${connectionState}`
                                                    )}
                                                </p>
                                                {connectionState === 'error' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setPhase('setup');
                                                            setShowSetup(true);
                                                        }}
                                                    >
                                                        Back to Setup
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex items-start gap-3 ${message.type === 'candidate' ? 'flex-row-reverse' : ''
                                                }`}
                                        >
                                            <Avatar className="w-8 h-8">
                                                {message.type === 'ai' ? (
                                                    <Bot className="h-4 w-4" />
                                                ) : (
                                                    <User className="h-4 w-4" />
                                                )}
                                            </Avatar>
                                            <div
                                                className={`max-w-[80%] rounded-lg p-3 ${message.type === 'ai'
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'bg-blue-600 text-white'
                                                    }`}
                                            >
                                                <p className="text-sm">{message.content}</p>
                                                <p
                                                    className={`text-xs mt-1 ${message.type === 'ai' ? 'text-gray-500' : 'text-blue-200'
                                                        }`}
                                                >
                                                    {message.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Live transcript display */}
                                    {transcript && (
                                        <div className="flex items-start gap-3 flex-row-reverse">
                                            <Avatar className="w-8 h-8">
                                                <User className="h-4 w-4" />
                                            </Avatar>
                                            <div className="max-w-[80%] rounded-lg p-3 bg-blue-200 text-blue-900 border-2 border-blue-300">
                                                <p className="text-sm italic">{transcript}</p>
                                                <p className="text-xs mt-1 text-blue-600">Speaking...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div ref={messagesEndRef} />
                            </ScrollArea>

                            {/* Input Area */}
                            {phase !== 'ended' && phase !== 'setup' && isConnected && (
                                <>
                                    <Separator className="my-4" />
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Type your response..."
                                                value={textInput}
                                                onChange={(e) => setTextInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                                                disabled={isListening}
                                            />
                                            <Button
                                                onClick={handleSendText}
                                                disabled={!textInput.trim() || isListening}
                                                size="sm"
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {speechSupported && (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant={isListening ? "destructive" : "outline"}
                                                    size="sm"
                                                    onClick={toggleRecording}
                                                    className="flex items-center gap-2"
                                                >
                                                    {isListening ? (
                                                        <>
                                                            <MicOff className="h-4 w-4" />
                                                            Stop Recording
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Mic className="h-4 w-4" />
                                                            Start Recording
                                                        </>
                                                    )}
                                                </Button>

                                                {isListening && (
                                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                                                        Recording...
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Interview Info Panel */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Interview Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium">Position</p>
                                <p className="text-sm text-gray-600">
                                    {interviewInfo.jobTitle || 'Loading...'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium">Company</p>
                                <p className="text-sm text-gray-600">
                                    {interviewInfo.company || 'Loading...'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium">Candidate</p>
                                <p className="text-sm text-gray-600">{setup.candidateName}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium">Session ID</p>
                                <p className="text-xs text-gray-500 font-mono">{sessionId}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Focus Areas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {setup.focusAreas.map((area) => (
                                    <Badge key={area} variant="outline">
                                        {area}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Connection Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">WebSocket</span>
                                <Badge variant={isConnected ? "default" : "destructive"}>
                                    {connectionState}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm">Speech Recognition</span>
                                <Badge variant={speechSupported ? "default" : "secondary"}>
                                    {speechSupported ? "Supported" : "Not supported"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
