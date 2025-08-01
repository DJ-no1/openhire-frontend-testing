"use client";

import { InterviewSystemDocs } from "@/components/interview-system-docs";
import { SiteNavigation } from "@/components/site-navigation";

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto">
                <SiteNavigation />
                <InterviewSystemDocs />
            </div>
        </div>
    );
}
