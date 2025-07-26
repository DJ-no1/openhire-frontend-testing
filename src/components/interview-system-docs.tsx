"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Code,
    MessageSquare,
    Zap,
    Mic,
    Users,
    Clock,
    CheckCircle,
    ArrowRight,
    PlayCircle,
    Copy
} from "lucide-react";
import { toast } from "sonner";

export function InterviewSystemDocs() {
    const [activeTab, setActiveTab] = useState("overview");

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const websocketMessages = {
        start_interview: {
            type: "start_interview",
            data: {
                job_id: "test_job_001",
                candidate_id: "test_candidate_001",
                candidate_name: "John Doe",
                resume_text: "optional resume text",
                preferences: {
                    max_duration: 30
                }
            }
        },
        candidate_response: {
            type: "candidate_response",
            data: {
                response: "I have 5 years of experience in software development..."
            }
        },
        ai_question: {
            type: "ai_question",
            data: {
                question: "Can you tell me about your experience with React?",
                question_type: "technical",
                followup: false
            }
        },
        live_transcript: {
            type: "live_transcript",
            data: {
                transcript: "I have been working with React for...",
                is_final: false
            }
        },
        end_interview: {
            type: "end_interview",
            data: {
                feedback: "Thank you for your time. The interview has been completed.",
                summary: {
                    total_questions: 8,
                    duration: 25,
                    performance_score: 8.5
                }
            }
        }
    };

    const features = [
        {
            icon: <MessageSquare className="h-6 w-6" />,
            title: "Real-time Chat Interface",
            description: "Bidirectional communication between AI interviewer and candidate with message history"
        },
        {
            icon: <Zap className="h-6 w-6" />,
            title: "WebSocket Communication",
            description: "Low-latency real-time connection to backend interview system"
        },
        {
            icon: <Mic className="h-6 w-6" />,
            title: "Speech Recognition",
            description: "Live speech-to-text transcription with browser Speech Recognition API"
        },
        {
            icon: <Users className="h-6 w-6" />,
            title: "Interview Management",
            description: "Complete interview flow from setup to completion with progress tracking"
        },
        {
            icon: <Clock className="h-6 w-6" />,
            title: "Time Management",
            description: "Real-time timer, duration limits, and progress indicators"
        },
        {
            icon: <CheckCircle className="h-6 w-6" />,
            title: "Status Monitoring",
            description: "Connection status, recording status, and interview phase tracking"
        }
    ];

    const implementationSteps = [
        {
            step: 1,
            title: "Setup Interview Session",
            description: "Configure job ID, candidate details, and duration preferences"
        },
        {
            step: 2,
            title: "WebSocket Connection",
            description: "Establish connection to ws://localhost:8000/ws/interview/{sessionId}"
        },
        {
            step: 3,
            title: "Start Interview Flow",
            description: "Send start_interview message with candidate and job details"
        },
        {
            step: 4,
            title: "Interactive Q&A",
            description: "AI asks questions, candidate responds via text or voice"
        },
        {
            step: 5,
            title: "Real-time Processing",
            description: "Live transcript, message handling, and status updates"
        },
        {
            step: 6,
            title: "Interview Completion",
            description: "End interview and receive feedback/summary"
        }
    ];

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="h-6 w-6" />
                        AI Interview System Documentation
                    </CardTitle>
                    <p className="text-muted-foreground">
                        Complete guide to implementing and using the real-time AI interview system
                    </p>
                </CardHeader>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="websocket">WebSocket API</TabsTrigger>
                    <TabsTrigger value="implementation">Implementation</TabsTrigger>
                    <TabsTrigger value="demo">Live Demo</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map((feature, index) => (
                            <Card key={index}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="text-blue-600">{feature.icon}</div>
                                        <div>
                                            <h3 className="font-semibold text-sm">{feature.title}</h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Tech Stack */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tech Stack</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <Badge variant="outline" className="mb-2">Frontend</Badge>
                                    <div className="text-sm space-y-1">
                                        <div>React.js + TypeScript</div>
                                        <div>Tailwind CSS</div>
                                        <div>shadcn/ui</div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <Badge variant="outline" className="mb-2">Communication</Badge>
                                    <div className="text-sm space-y-1">
                                        <div>WebSocket</div>
                                        <div>Real-time messaging</div>
                                        <div>Auto-reconnection</div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <Badge variant="outline" className="mb-2">Voice</Badge>
                                    <div className="text-sm space-y-1">
                                        <div>Speech Recognition API</div>
                                        <div>Live transcription</div>
                                        <div>Voice controls</div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <Badge variant="outline" className="mb-2">State</Badge>
                                    <div className="text-sm space-y-1">
                                        <div>React Hooks</div>
                                        <div>Custom hooks</div>
                                        <div>Local state</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Implementation Flow */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Implementation Flow</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {implementationSteps.map((step, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                            {step.step}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-sm">{step.title}</h3>
                                            <p className="text-xs text-muted-foreground">{step.description}</p>
                                        </div>
                                        {index < implementationSteps.length - 1 && (
                                            <ArrowRight className="h-4 w-4 text-gray-400 mt-2" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="websocket" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>WebSocket API Reference</CardTitle>
                            <p className="text-muted-foreground">
                                Message formats for WebSocket communication with the interview backend
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {Object.entries(websocketMessages).map(([key, message]) => (
                                    <div key={key}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-sm capitalize">{key.replace('_', ' ')}</h3>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(JSON.stringify(message, null, 2))}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                            <pre>{JSON.stringify(message, null, 2)}</pre>
                                        </div>
                                        <Separator className="mt-4" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Connection Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-sm mb-2">WebSocket URL</h3>
                                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                                    ws://localhost:8000/ws/interview/{"{sessionId}"}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-sm mb-2">Message Flow</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <ArrowRight className="h-4 w-4 text-blue-600" />
                                        <span>Client → Server: start_interview, candidate_response, end_interview</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ArrowRight className="h-4 w-4 text-green-600 rotate-180" />
                                        <span>Server → Client: ai_question, live_transcript, end_interview, error</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="implementation" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Component Structure</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                <pre>{`
src/
├── components/
│   ├── ai-interview-system-v2.tsx     # Main interview component
│   └── ui/                            # shadcn components
├── hooks/
│   ├── use-websocket.ts              # WebSocket management
│   └── use-speech-recognition.ts     # Speech API wrapper
└── app/
    └── interview/
        └── page.tsx                  # Interview page
                `}</pre>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Key Features Implementation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-sm mb-2">Custom Hooks</h3>
                                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                                    <li><code>useWebSocket</code> - Manages WebSocket connection with auto-reconnection</li>
                                    <li><code>useSpeechRecognition</code> - Handles browser Speech Recognition API</li>
                                    <li>Real-time state management with React hooks</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-sm mb-2">Speech Recognition</h3>
                                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                                    <li>Cross-browser compatibility (Chrome, Edge, Safari)</li>
                                    <li>Continuous recognition with interim results</li>
                                    <li>Error handling and fallback to text input</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-sm mb-2">Real-time Features</h3>
                                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                                    <li>Live transcript display during speech</li>
                                    <li>Automatic message sending on speech completion</li>
                                    <li>Connection status monitoring and reconnection</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Example</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                <pre>{`
import { AIInterviewSystemV2 } from "@/components/ai-interview-system-v2";

export default function InterviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <AIInterviewSystemV2 />
    </div>
  );
}
                `}</pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="demo" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PlayCircle className="h-5 w-5" />
                                Try the Live Demo
                            </CardTitle>
                            <p className="text-muted-foreground">
                                Experience the AI Interview System with sample data
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center space-y-4">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
                                    <h3 className="font-semibold mb-2">Ready to Experience the Future of Interviews?</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Start a live interview session with AI-powered conversation and real-time features
                                    </p>
                                    <Button size="lg" className="mr-2">
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        Start Demo Interview
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="p-4 border rounded-lg">
                                        <div className="font-semibold mb-1">Sample Data Included</div>
                                        <div className="text-muted-foreground">Pre-filled job and candidate information</div>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="font-semibold mb-1">Voice Recognition</div>
                                        <div className="text-muted-foreground">Test speech-to-text in your browser</div>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="font-semibold mb-1">Real-time Chat</div>
                                        <div className="text-muted-foreground">Experience AI conversation flow</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Backend Requirements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                    <h3 className="font-semibold text-sm text-yellow-800 mb-2">⚠️ Backend Server Required</h3>
                                    <p className="text-sm text-yellow-700">
                                        The AI Interview System requires a WebSocket server running on <code>localhost:8000</code> to function properly.
                                    </p>
                                </div>

                                <div className="text-sm space-y-2">
                                    <h3 className="font-semibold">Expected Backend Endpoints:</h3>
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                        <li><code>ws://localhost:8000/ws/interview/{"{sessionId}"}</code> - WebSocket endpoint</li>
                                        <li>Handle message types: start_interview, candidate_response, end_interview</li>
                                        <li>Send message types: ai_question, live_transcript, end_interview, error</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
