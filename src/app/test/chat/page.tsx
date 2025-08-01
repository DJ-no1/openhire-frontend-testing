
"use client";
import ChatBox from "@/components/chat_box";

export default function ChatPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-6">OpenHire Chat</h1>
            <ChatBox />
        </div>
    );
}
