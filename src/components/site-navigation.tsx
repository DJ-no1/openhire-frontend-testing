"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Home,
    MessageSquare,
    FileText,
    Brain,
    Users,
    BarChart3,
    Book,
    Play
} from "lucide-react";

export function SiteNavigation() {
    const pathname = usePathname();

    const navItems = [
        {
            href: "/",
            label: "Home",
            icon: <Home className="h-4 w-4" />,
            description: "Dashboard overview"
        },
        {
            href: "/interview",
            label: "AI Interview",
            icon: <MessageSquare className="h-4 w-4" />,
            description: "Live interview system",
            badge: "WebSocket"
        },
        {
            href: "/demo",
            label: "Demo",
            icon: <Play className="h-4 w-4" />,
            description: "Try without backend",
            badge: "New"
        },
        {
            href: "/docs",
            label: "Documentation",
            icon: <Book className="h-4 w-4" />,
            description: "System documentation"
        },
        {
            href: "/resume-review",
            label: "Resume Review",
            icon: <Brain className="h-4 w-4" />,
            description: "AI resume analysis"
        },
        {
            href: "/jobs",
            label: "Jobs",
            icon: <Users className="h-4 w-4" />,
            description: "Job listings"
        },
        {
            href: "/dashboard",
            label: "Dashboard",
            icon: <BarChart3 className="h-4 w-4" />,
            description: "Analytics dashboard"
        }
    ];

    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={pathname === item.href ? "default" : "ghost"}
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                {item.icon}
                                {item.label}
                                {item.badge && (
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                        {item.badge}
                                    </Badge>
                                )}
                            </Button>
                        </Link>
                    ))}
                </div>

                <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span>OpenHire AI Platform</span>
                            <Badge variant="outline">v2.0</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs">Real-time AI Interview System</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
