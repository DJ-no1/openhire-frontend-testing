
"use client";
import React, { useRef, useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

type Message = {
    type: "system" | "human" | "ai";
    content: string;
};

const API_URL = "http://127.0.0.1:8000/chat";

export default function ChatBox() {
    // Initial system prompt
    const SYSTEM_PROMPT: Message = {
        type: "system",
        content: "You are a helpful AI assistant. Answer the user's questions clearly and concisely.",
    };
    const [messages, setMessages] = useState<Message[]>([SYSTEM_PROMPT]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage: Message = { type: "human", content: input };
        // Optimistic UI: show user message immediately
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);
        try {
            const payload = {
                user_input: input,
                messages: [...messages, userMessage],
            };
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                throw new Error(`Backend error: ${res.status}`);
            }
            const data = await res.json();
            console.log("Backend response:", data);
            // If backend returns full conversation, replace all messages (except system prompt)
            if (Array.isArray(data)) {
                setMessages([SYSTEM_PROMPT, ...data.filter(m => m.type !== "system")]);
            } else if (data && (data.response || data.content)) {
                // If backend returns only latest AI message, append it (use 'response' field)
                setMessages(prev => [
                    ...prev,
                    { type: "ai", content: data.response || data.content },
                ]);
            }
        } catch (e) {
            setMessages(prev => [
                ...prev,
                { type: "ai", content: "Sorry, there was an error connecting to the backend." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !loading) {
            sendMessage();
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto flex flex-col h-[500px] border shadow-lg">
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted">
                {messages.filter(m => m.type !== "system").length === 0 && (
                    <div className="text-center text-muted-foreground">Start the conversation…</div>
                )}
                {messages.filter(m => m.type !== "system").map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.type === "human" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-line text-sm shadow-sm ${msg.type === "human"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-white text-gray-900 border"
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form
                className="flex gap-2 p-3 border-t bg-background"
                onSubmit={e => {
                    e.preventDefault();
                    if (!loading) sendMessage();
                }}
            >
                <Input
                    placeholder="Type your message…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    disabled={loading}
                    className="flex-1"
                    autoFocus
                />
                <Button type="submit" disabled={loading || !input.trim()}>
                    {loading ? "…" : "Send"}
                </Button>
            </form>
        </Card>
    );
}
