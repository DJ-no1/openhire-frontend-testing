"use client"
import React from "react";
import CreateJob from "@/components/createjob";
import { Button } from "@/components/ui/button";

export default function JobsPage() {
    return (
        <div className="flex flex-col items-center justify-center  bg-background">
            <h1 className="text-3xl font-bold mb-6">Jobs</h1>
            {/* The CreateJob component includes its own button to open the dialog */}
            <CreateJob />
        </div>
    );
}
