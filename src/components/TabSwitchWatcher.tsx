"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TabData {
    value: string;
    label: string;
    content: React.ReactNode;
    badge?: string | number;
}

interface AdvancedTabSwitchWatcherProps {
    maxSwitches?: number;
    redirectUrl?: string;
    tabs?: TabData[];
    warningMessage?: string;
    finalMessage?: string;
    showCounter?: boolean;
    toastDuration?: number;
    defaultTab?: string;
    onTabChange?: (value: string) => void;
    onSwitchDetected?: (count: number) => void;
    className?: string;
    children?: React.ReactNode;
}

const AdvancedTabSwitchWatcher: React.FC<AdvancedTabSwitchWatcherProps> = ({
    maxSwitches = 3,
    redirectUrl = "/warning-page",
    tabs = [],
    warningMessage = "Please stay focused on this page",
    finalMessage = "Too many tab switches! Redirecting...",
    showCounter = true,
    toastDuration = 3000,
    defaultTab,
    onTabChange,
    onSwitchDetected,
    className = "",
    children,
}) => {
    const [switchCount, setSwitchCount] = useState(0);
    const [currentTab, setCurrentTab] = useState(defaultTab || tabs[0]?.value || "");
    const lastVisibility = useRef(document.visibilityState);
    const router = useRouter();

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (
                lastVisibility.current === "visible" &&
                document.visibilityState === "hidden"
            ) {
                const newCount = switchCount + 1;
                setSwitchCount(newCount);

                // Call callback if provided
                onSwitchDetected?.(newCount);

                if (newCount >= maxSwitches) {
                    toast.error(finalMessage, {
                        duration: 2000,
                        action: {
                            label: "Cancel Redirect",
                            onClick: () => {
                                setSwitchCount(maxSwitches - 1);
                                toast.info("Redirect cancelled. One more chance!");
                            },
                        },
                    });
                    setTimeout(() => router.push(redirectUrl), 3000);
                } else {
                    const remainingAttempts = maxSwitches - newCount;
                    toast.warning(warningMessage, {
                        duration: toastDuration,
                        description: `${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining`,
                        action: {
                            label: "Got it",
                            onClick: () => toast.dismiss(),
                        },
                    });
                }
            }
            lastVisibility.current = document.visibilityState;
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [switchCount, maxSwitches, redirectUrl, warningMessage, finalMessage, toastDuration, router, onSwitchDetected]);

    const handleTabChange = (value: string) => {
        setCurrentTab(value);
        onTabChange?.(value);
    };

    const resetCounter = () => {
        setSwitchCount(0);
        toast.success("Counter reset successfully!");
    };

    const getCounterVariant = () => {
        if (switchCount >= maxSwitches) return "destructive";
        if (switchCount >= maxSwitches - 1) return "secondary";
        return "default";
    };

    return (
        <div className={`w-full space-y-4 ${className}`}>
            {showCounter && (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Tab Switch Monitor:</span>
                        <Badge variant={getCounterVariant()}>
                            {switchCount}/{maxSwitches}
                        </Badge>
                        {switchCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {maxSwitches - switchCount} remaining
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetCounter}
                            disabled={switchCount === 0}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info("Stay focused on your current task!")}
                        >
                            Help
                        </Button>
                    </div>
                </div>
            )}

            {tabs.length > 0 ? (
                <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
                        {tabs.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value} className="relative">
                                {tab.label}
                                {tab.badge && (
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                        {tab.badge}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {tabs.map((tab) => (
                        <TabsContent key={tab.value} value={tab.value} className="mt-4">
                            {tab.content}
                        </TabsContent>
                    ))}
                </Tabs>
            ) : (
                children
            )}
        </div>
    );
};

export { AdvancedTabSwitchWatcher };
