"use client";

import { ConnectionDebugger } from "@/components/connection-debugger";

export default function DebugPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <ConnectionDebugger />
        </div>
    );
}
