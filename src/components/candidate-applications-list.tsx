"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DatabaseService,
    getApplicationStatusColor,
    getScoreBadgeColor,
    type DatabaseApplication,
    type DatabaseUserResume
} from "@/lib/database";
import {
    Calendar,
    FileText,
    Building,
    TrendingUp,
    Eye,
    MapPin,
    Briefcase,
    DollarSign,
    User,
    Loader2
} from "lucide-react";
import { toast } from "sonner";

interface CandidateApplicationsListProps {
    candidateId: string;
    excludeApplicationId?: string; // To exclude current application from the list
    title?: string;
}

export function CandidateApplicationsList({
    candidateId,
    excludeApplicationId,
    title = "Other Applications by This Candidate"
}: CandidateApplicationsListProps) {
    const [applications, setApplications] = useState<(DatabaseApplication & { user_resume: DatabaseUserResume[] })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, [candidateId]);

    const fetchApplications = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await DatabaseService.getApplicationsForCandidate(candidateId);

            // Filter out the current application if excludeApplicationId is provided
            const filteredData = excludeApplicationId
                ? data.filter(app => app.id !== excludeApplicationId)
                : data;

            setApplications(filteredData);
        } catch (err) {
            const errorMessage = (err as Error).message;
            setError(errorMessage);
            console.error('Error fetching candidate applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not specified";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
        } catch {
            return dateString;
        }
    };

    const formatSalary = (salary?: string) => {
        if (!salary) return "Not specified";
        return salary.includes("$") ? salary : `$${salary}`;
    };

    if (loading) {
        return (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Loading applications...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-red-600">Error loading applications: {error}</p>
                        <Button
                            variant="outline"
                            onClick={fetchApplications}
                            className="mt-2"
                        >
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (applications.length === 0) {
        return (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No other applications found for this candidate.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {title}
                    <Badge variant="secondary" className="ml-2">
                        {applications.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {applications.map((application) => {
                        const resume = application.user_resume?.[0];

                        return (
                            <div
                                key={application.id}
                                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Building className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {application.job?.title || "Unknown Position"}
                                                </h4>
                                                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Applied {formatDate(application.created_at)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Briefcase className="h-3 w-3" />
                                                        {application.job?.job_type || "Full-time"}
                                                    </div>
                                                    {application.job?.salary && (
                                                        <div className="flex items-center gap-1">
                                                            <DollarSign className="h-3 w-3" />
                                                            {formatSalary(application.job.salary)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${getApplicationStatusColor(application.status)}`}
                                                    >
                                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                    </Badge>
                                                    {resume?.score && (
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${getScoreBadgeColor(resume.score)}`}
                                                        >
                                                            <TrendingUp className="h-3 w-3 mr-1" />
                                                            {resume.score}% Match
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Link href={`/dashboard/application/${application.id}/analysis`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="mr-1 h-3 w-3" />
                                                View Analysis
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
