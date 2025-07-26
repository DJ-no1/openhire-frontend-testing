"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteNavigation } from "@/components/site-navigation";
import Link from "next/link";
import {
  MessageSquare,
  Zap,
  Mic,
  Code,
  Play,
  ExternalLink,
  Terminal,
  CheckCircle2
} from "lucide-react"; export default function HomePage() {
  const features = [
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Real-time Chat Interface",
      description: "Bidirectional AI-powered conversation with live message handling and history"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "WebSocket Communication",
      description: "Low-latency real-time connection with auto-reconnection and error handling"
    },
    {
      icon: <Mic className="h-8 w-8" />,
      title: "Speech Recognition",
      description: "Browser-based speech-to-text with live transcription and voice controls"
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Modern Tech Stack",
      description: "React.js, TypeScript, Tailwind CSS, shadcn/ui, and custom hooks"
    }
  ];

  const quickStart = [
    {
      step: 1,
      title: "Start Development Server",
      command: "pnpm dev",
      description: "Launch the Next.js development server"
    },
    {
      step: 2,
      title: "Navigate to Interview",
      command: "/interview",
      description: "Access the AI Interview System interface"
    },
    {
      step: 3,
      title: "Setup Backend (Optional)",
      command: "ws://localhost:8000",
      description: "WebSocket server for full functionality"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto">
        <SiteNavigation />

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI Interview System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A modern React.js frontend for conducting AI-powered interviews with real-time
            WebSocket communication, speech recognition, and comprehensive analysis.
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              TypeScript Ready
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              Real-time WebSocket
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
              Speech Recognition
            </Badge>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/demo">
              <Button size="lg" className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Try Demo (No Backend)
              </Button>
            </Link>
            <Link href="/interview">
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Full Interview System
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                View Documentation
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="text-blue-600 mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Start */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-6 w-6" />
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickStart.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm mb-2">
                    {item.command}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Architecture Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>System Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Frontend Components</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <code>AIInterviewSystemV2</code> - Main interview component
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <code>useWebSocket</code> - Custom WebSocket hook
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <code>useSpeechRecognition</code> - Speech API wrapper
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <code>InterviewSetup</code> - Configuration form
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <code>ChatInterface</code> - Message display
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <code>VoiceControls</code> - Audio recording
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Key Features</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    Real-time bidirectional communication
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    Live speech-to-text transcription
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    Interview progress tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    Connection status monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    Professional UI with animations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    Cross-browser compatibility
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <Badge variant="outline" className="mb-3 w-full">Frontend</Badge>
                <div className="space-y-1 text-sm">
                  <div>React.js 19</div>
                  <div>TypeScript</div>
                  <div>Next.js 15</div>
                </div>
              </div>
              <div>
                <Badge variant="outline" className="mb-3 w-full">Styling</Badge>
                <div className="space-y-1 text-sm">
                  <div>Tailwind CSS</div>
                  <div>shadcn/ui</div>
                  <div>Lucide Icons</div>
                </div>
              </div>
              <div>
                <Badge variant="outline" className="mb-3 w-full">Communication</Badge>
                <div className="space-y-1 text-sm">
                  <div>WebSocket API</div>
                  <div>Speech Recognition</div>
                  <div>Real-time messaging</div>
                </div>
              </div>
              <div>
                <Badge variant="outline" className="mb-3 w-full">State Management</Badge>
                <div className="space-y-1 text-sm">
                  <div>React Hooks</div>
                  <div>Custom Hooks</div>
                  <div>Local State</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
