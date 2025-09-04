"use client";
import React, { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { PdfUploader } from "./pdf_uploader";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { getAIInterviewWebSocketUrl } from "@/lib/api-config";

type Message = {
    type: string;
    [key: string]: any;
};

type Analysis = {
    overall_score: number;
    technical_score: number;
    communication_score: number;
    problem_solving_score: number;
    cultural_fit_score: number;
    strengths: string[];
    areas_for_improvement: string[];
    overall_feedback: string;
    recommendation: string;
};

export default function InterviewSession() {
    const [connected, setConnected] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [candidateId, setCandidateId] = useState("");
    const [jobId, setJobId] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    // Supabase client setup
    const supabaseUrl = process.env.SUPABASE_URL || "https://lbvqiedeajeteiasxnjw.supabase.co";
    const supabaseKey = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidnFpZWRlYWpldGVpYXN4bmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODk4NzAsImV4cCI6MjA2ODg2NTg3MH0.HX6xagdGz1KqM5fS7PDNK4yDZ22K91jCmpzUaVDdlLU";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch job description from Supabase when jobId changes
    useEffect(() => {
        const fetchJobDescription = async () => {
            if (!jobId) {
                setJobDescription("");
                return;
            }
            const { data, error } = await supabase
                .from("jobs")
                .select("description")
                .eq("id", jobId)
                .single();
            if (error || !data) {
                setJobDescription("");
            } else {
                setJobDescription(data.description || "");
            }
        };
        fetchJobDescription();
    }, [jobId]);
    const [resume, setResume] = useState("");
    const [answer, setAnswer] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [customMessage, setCustomMessage] = useState("");
    const [startDisabledReason, setStartDisabledReason] = useState("");
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        ws.current = new window.WebSocket(getAIInterviewWebSocketUrl());
        ws.current.onopen = () => setConnected(true);
        ws.current.onclose = () => setConnected(false);
        ws.current.onmessage = (event: MessageEvent) => {
            const msg: Message = JSON.parse(event.data);
            setMessages((prev) => [...prev, msg]);
            setWaiting(false);
            switch (msg.type) {
                case "connection_success":
                    setSessionId(msg.session_id);
                    break;
                case "welcome":
                    break;
                case "interview_initialized":
                    setInterviewStarted(true);
                    break;
                case "interview_completed":
                    setAnalysis(msg.analysis);
                    setInterviewStarted(false);
                    // Disconnect socket after feedback received
                    if (ws.current) {
                        ws.current.close();
                    }
                    break;
                default:
                    break;
            }
        };
        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    useEffect(() => {
        let reason = "";
        if (!connected) reason = "Not connected to backend.";
        else if (!candidateId) reason = "Candidate ID required.";
        else if (!jobId) reason = "Job ID required.";
        else if (!jobDescription) reason = "Job description not found for this Job ID.";
        else if (!resume) reason = "Resume required.";
        setStartDisabledReason(reason);
    }, [connected, candidateId, jobId, jobDescription, resume]);

    const startInterview = () => {
        if (!ws.current) return;
        setMessages((prev) => [
            ...prev,
            {
                type: "user",
                text: "Started interview",
                candidate_id: candidateId,
                job_description: jobDescription,
                resume,
            },
        ]);
        ws.current.send(
            JSON.stringify({
                type: "initialize_interview",
                data: {
                    session_id: sessionId || undefined,
                    candidate_id: candidateId,
                    job_description: jobDescription,
                    candidate_resume: resume,
                },
            })
        );
        setWaiting(true);
    };

    const sendCustomMessage = () => {
        if (!ws.current || !customMessage) return;
        setMessages((prev) => [
            ...prev,
            { type: "user", text: customMessage },
        ]);
        ws.current.send(
            JSON.stringify({
                type: "chat",
                message: customMessage,
            })
        );
        setCustomMessage("");
        setWaiting(true);
    };

    const submitAnswer = () => {
        if (!ws.current) return;
        setMessages((prev) => [
            ...prev,
            { type: "user", text: answer },
        ]);
        ws.current.send(
            JSON.stringify({
                type: "submit_answer",
                answer,
            })
        );
        setAnswer("");
        setWaiting(true);
    };

    const endInterview = () => {
        if (!ws.current) return;
        setMessages((prev) => [
            ...prev,
            { type: "user", text: "[Ended interview early]" },
        ]);
        ws.current.send(JSON.stringify({ type: "end_interview" }));
        setWaiting(true);
    };

    // Helper to render chat bubbles
    const renderChat = () => (
        <div className="flex flex-col gap-3 mb-4">
            {messages.map((msg, i) => {
                if (msg.type === "user") {
                    return (
                        <div key={i} className="self-end max-w-[80%]">
                            <Card className="bg-green-100 dark:bg-green-900 rounded-2xl ml-auto">
                                <CardContent className="py-2 px-4 whitespace-pre-wrap">{msg.text}</CardContent>
                            </Card>
                        </div>
                    );
                }
                if (msg.type === "question") {
                    return (
                        <div key={i} className="self-start max-w-[80%]">
                            <Card className="bg-muted rounded-2xl mr-auto">
                                <CardContent className="py-2 px-4 whitespace-pre-wrap">
                                    <strong>AI:</strong> {msg.question}
                                </CardContent>
                            </Card>
                        </div>
                    );
                }
                if (msg.type === "answer_received") {
                    return (
                        <div key={i} className="self-start max-w-[80%]">
                            <Card className="bg-muted rounded-2xl mr-auto">
                                <CardContent className="py-2 px-4 whitespace-pre-wrap">
                                    <strong>AI:</strong> {msg.message}
                                </CardContent>
                            </Card>
                        </div>
                    );
                }
                if (msg.type === "interview_completed") {
                    return (
                        <div key={i} className="self-start max-w-[80%]">
                            <Card className="bg-muted rounded-2xl mr-auto">
                                <CardContent className="py-2 px-4 whitespace-pre-wrap">
                                    <strong>AI:</strong> Interview completed. See analysis below.
                                </CardContent>
                            </Card>
                        </div>
                    );
                }
                if (msg.type === "error") {
                    return (
                        <div key={i} className="self-start max-w-[80%]">
                            <Card className="bg-red-100 dark:bg-red-900 rounded-2xl mr-auto">
                                <CardContent className="py-2 px-4 whitespace-pre-wrap">
                                    <strong>Error:</strong> {msg.message}
                                </CardContent>
                            </Card>
                        </div>
                    );
                }
                return (
                    <div key={i} className="self-center max-w-[80%]">
                        <Card className="bg-gray-100 dark:bg-gray-800 rounded-2xl mx-auto">
                            <CardContent className="py-2 px-4 whitespace-pre-wrap">
                                {JSON.stringify(msg, null, 2)}
                            </CardContent>
                        </Card>
                    </div>
                );
            })}
            {waiting && (
                <div className="self-start max-w-[80%]">
                    <Skeleton className="h-8 w-32" />
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <h1 className="text-2xl font-bold">AI Interview Chat</h1>
                    <div className="mb-2 font-semibold" style={{ color: connected ? "green" : "red" }}>
                        {connected ? "Connected to backend" : "Disconnected from backend"}
                    </div>
                </CardHeader>
                <CardContent>
                    {!interviewStarted && !analysis && (
                        <div className="space-y-4">
                            <Input
                                placeholder="Candidate ID"
                                value={candidateId}
                                onChange={(e) => setCandidateId(e.target.value)}
                            />
                            <Input
                                placeholder="Job ID"
                                value={jobId}
                                onChange={(e) => setJobId(e.target.value)}
                            />
                            <Textarea
                                placeholder="Job Description"
                                value={jobDescription}
                                readOnly
                                rows={3}
                            />
                            <PdfUploader
                                onUpload={(file) => {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                        setResume(e.target?.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }}
                            />
                            <Button
                                onClick={startInterview}
                                disabled={!!startDisabledReason}
                                title={startDisabledReason}
                            >
                                Start Interview
                            </Button>
                            {startDisabledReason && (
                                <div className="text-red-500 text-sm">{startDisabledReason}</div>
                            )}
                            <div className="flex gap-2 items-center mt-2">
                                <Input
                                    placeholder="Send custom message (for debugging)"
                                    value={customMessage}
                                    onChange={e => setCustomMessage(e.target.value)}
                                    disabled={!connected}
                                />
                                <Button
                                    onClick={sendCustomMessage}
                                    disabled={!customMessage || !connected}
                                >
                                    Send Message
                                </Button>
                            </div>
                        </div>
                    )}
                    {interviewStarted && (
                        <>
                            {renderChat()}
                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                    if (answer) submitAnswer();
                                }}
                                className="flex gap-2 mt-2"
                            >
                                <Textarea
                                    placeholder="Type your answer..."
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    rows={2}
                                    disabled={waiting}
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={!answer || waiting}>
                                    Send
                                </Button>
                                <Button type="button" variant="secondary" onClick={endInterview}>
                                    End
                                </Button>
                            </form>
                            <div className="flex gap-2 items-center mt-2">
                                <Input
                                    placeholder="Send custom message (for debugging)"
                                    value={customMessage}
                                    onChange={e => setCustomMessage(e.target.value)}
                                    disabled={!connected}
                                />
                                <Button
                                    onClick={sendCustomMessage}
                                    disabled={!customMessage || !connected}
                                >
                                    Send Message
                                </Button>
                            </div>
                        </>
                    )}
                    {analysis && (
                        <div className="mt-6">
                            <h2 className="text-xl font-bold mb-2">Interview Completed</h2>
                            <div className="space-y-1">
                                <div><strong>Overall Score:</strong> {analysis.overall_score}</div>
                                <div><strong>Technical Score:</strong> {analysis.technical_score}</div>
                                <div><strong>Communication Score:</strong> {analysis.communication_score}</div>
                                <div><strong>Problem Solving Score:</strong> {analysis.problem_solving_score}</div>
                                <div><strong>Cultural Fit Score:</strong> {analysis.cultural_fit_score}</div>
                                <div><strong>Strengths:</strong> {analysis.strengths?.join(", ")}</div>
                                <div><strong>Areas for Improvement:</strong> {analysis.areas_for_improvement?.join(", ")}</div>
                                <div><strong>Feedback:</strong> {analysis.overall_feedback}</div>
                                <div><strong>Recommendation:</strong> {analysis.recommendation}</div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
