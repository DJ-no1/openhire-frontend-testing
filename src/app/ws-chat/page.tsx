"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface ChatMessage {
    type: "system" | "human" | "ai";
    content: string;
}

interface WSResponse {
    event: string;
    message?: string;
    response?: string;
    sentiment?: string;
    messages?: ChatMessage[];
    error?: string;
}

export default function WebSocketChatPage() {
    const wsUrl = "ws://localhost:8000/test/ws/test-chat"; // Change to your backend domain if needed
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    // This state is always set from the backend response only
    const [serverMessages, setServerMessages] = useState<ChatMessage[]>([
        { type: "system", content: "You are a helpful AI assistant." },
    ]);
    const [input, setInput] = useState("");
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("");

    // Manual connect handler
    const connectWebSocket = useCallback(() => {
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            setStatus("Already connected or connecting.");
            return;
        }
        setConnecting(true);
        setStatus("Connecting to AI chat server...");
        setError(null);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            setConnecting(false);
            setStatus("Connected to AI chat server.");
        };

        ws.onmessage = (event) => {
            try {
                const data: WSResponse = JSON.parse(event.data);
                if (data.event === "connected") {
                    setStatus(data.message || "Connected.");
                    setError(null);
                } else if (data.event === "message") {
                    // If backend returns an array, always replace local state with backend's version
                    if (Array.isArray(data.messages)) {
                        setServerMessages([
                            { type: "system", content: "You are a helpful AI assistant." },
                            ...data.messages.filter(m => m.type !== "system")
                        ]);
                    } else if (data.response) {
                        setServerMessages(prev => [
                            ...prev,
                            { type: "ai", content: data.response || "" }
                        ]);
                    }
                    setAiResponse(data.response || null);
                    setStatus("AI responded.");
                } else if (data.event === "error") {
                    setError(data.error || "Unknown error");
                    setStatus("Error from server.");
                } else if (data.event === "disconnected") {
                    setConnected(false);
                    setStatus("Disconnected from server.");
                }
            } catch (e) {
                setError("Invalid JSON from server");
                setStatus("Parse error.");
            }
        };

        ws.onerror = () => {
            setError("WebSocket error");
            setStatus("WebSocket error.");
            setConnecting(false);
        };
        ws.onclose = () => {
            setConnected(false);
            setStatus("Connection closed.");
            setConnecting(false);
        };
    }, [wsUrl]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    const sendMessage = useCallback(
        (e?: React.FormEvent) => {
            if (e) e.preventDefault();
            if (!input.trim()) return;
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                // Always use the last serverMessages as the source of truth
                const historyToSend: ChatMessage[] = [
                    ...serverMessages,
                    { type: "human", content: input },
                ];
                wsRef.current.send(
                    JSON.stringify({
                        user_input: input,
                        messages: historyToSend,
                    })
                );
                setInput("");
                setStatus("Message sent.");
            }
        },
        [input, serverMessages]
    );

    let connectionColor = connected ? "green" : connecting ? "orange" : "red";
    let connectionText = connected
        ? "Connected"
        : connecting
            ? "Connecting..."
            : "Disconnected";

    return (
        <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
            <h2>AI WebSocket Chat</h2>
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: connectionColor, display: "inline-block" }} />
                <span>{connectionText}</span>
                <button onClick={connectWebSocket} disabled={connected || connecting} style={{ marginLeft: 16, padding: "4px 12px" }}>
                    Connect
                </button>
            </div>
            <div style={{ marginBottom: 8, color: connected ? "green" : "red" }}>{status}</div>
            <div style={{ minHeight: 200, background: "#fafafa", padding: 12, borderRadius: 4, marginBottom: 12 }}>
                {serverMessages.map((msg, i) => (
                    <div key={i} style={{ margin: "8px 0" }}>
                        <b style={{ color: msg.type === "ai" ? "#0070f3" : msg.type === "human" ? "#333" : "#888" }}>
                            {msg.type === "ai" ? "AI" : msg.type === "human" ? "You" : "System"}:
                        </b> {msg.content}
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type your message..."
                    style={{ flex: 1, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
                    disabled={!connected}
                />
                <button type="submit" disabled={!connected || !input.trim()} style={{ padding: "8px 16px" }}>
                    Send
                </button>
            </form>
            {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
        </div>
    );
}
