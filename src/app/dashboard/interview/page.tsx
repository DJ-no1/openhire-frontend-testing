"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InterviewStatusBadge, InterviewStatus } from "@/components/ui/interview-status-badge";
import { useAuth } from "@/contexts/AuthContext";
import {
    Calendar,
    FileText,
    Building,
    Search,
    Filter,
    Eye,
    Clock,
    MapPin,
    Briefcase,
    Loader2,
    AlertCircle,
    Play,
    CheckCircle,
    Users,
    Star,
    TrendingUp
} from "lucide-react";
import { toast } from "sonner";

// Application interface with interview data
interface ApplicationWithInterviewData {
    id: string;
    job_id: string;
    candidate_id: string;
    resume_url?: string;
    status: string;
    created_at?: string;
    interview_artifact_id?: string | null;
    interview_status?: InterviewStatus;
    latest_artifact_id?: string | null;
    user_resume: Array<{
        id: string;
        application_id: string;
        file_path?: string;
        score?: number;
        scoring_details?: any;
        created_at?: string;
    }>;
    job?: {
        id: string;
        recruiter_id: string;
        title: string;
        company_name?: string;
        job_type?: string;
        salary?: string;
        description?: string;
        skills?: string;
        created_at?: string;
        end_date?: string;
        job_link?: string;
    };
    candidate?: {
        id: string;
        email: string;
        role: 'recruiter' | 'candidate';
        name?: string;
        created_at?: string;
    };
}

export default function InterviewDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [applications, setApplications] = useState<ApplicationWithInterviewData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [interviewStatusFilter, setInterviewStatusFilter] = useState<string>("all");

    useEffect(() => {
        if (user?.id) {
            fetchApplications();
        }
    }, [user]);

    const fetchApplications = async () => {
        setLoading(true);
        setError(null);
        try {
            // Use our specialized API endpoint that includes interview status
            const response = await fetch(`/api/applications/with-interview-status?candidate_id=${user!.id}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.details || result.error || 'Failed to fetch applications');
            }

            setApplications(result.data);
            toast.success(`Loaded ${result.data.length} applications`);
        } catch (err) {
            const errorMessage = (err as Error).message;
            setError(errorMessage);
            toast.error(`Failed to load applications: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const getActionButton = (application: ApplicationWithInterviewData) => {
        const interviewStatus = application.interview_status || 'no_interview';

        switch (interviewStatus) {
            case 'eligible_for_interview':
                return (
                    <Link href={`/dashboard/application/${application.id}/permission`}>
                        <Button size="sm">
                            <Play className="mr-2 h-4 w-4" />
                            Start Interview
                        </Button>
                    </Link>
                );
            case 'interview_completed':
                return (
                    <Link href={`/dashboard/application/${application.id}/interview-result`}>
                        <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Results
                        </Button>
                    </Link>
                );
            default:
                return null;
        }
    };

    const filteredApplications = applications.filter(app => {
        // Search filter
        const searchMatch = searchTerm === "" ||
            app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.job?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.job?.job_type?.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const statusMatch = statusFilter === "all" || app.status === statusFilter;

        // Interview status filter
        let interviewStatusMatch = true;
        if (interviewStatusFilter !== "all") {
            interviewStatusMatch = app.interview_status === interviewStatusFilter;
        }

        return searchMatch && statusMatch && interviewStatusMatch;
    });

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

    const getApplicationStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'applied':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'reviewing':
            case 'under_review':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'interviewed':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'accepted':
            case 'hired':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Statistics for the dashboard
    const stats = {
        total: applications.length,
        eligibleForInterview: applications.filter(app => app.interview_status === 'eligible_for_interview').length,
        completed: applications.filter(app => app.interview_status === 'interview_completed').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                    <div>
                        <h3 className="text-lg font-medium">Loading Interview Dashboard</h3>
                        <p className="text-muted-foreground">Retrieving your application interview status...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-lg w-full border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="h-6 w-6" />
                            Error Loading Interview Dashboard
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-red-700">{error}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={fetchApplications}>
                                Try Again
                            </Button>
                            <Link href="/dashboard">
                                <Button>
                                    Back to Dashboard
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Interview Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage your job application interviews and view results
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                            {filteredApplications.length} {filteredApplications.length === 1 ? 'Application' : 'Applications'}
                        </Badge>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">
                                        {stats.total}
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">Total Applications</p>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">
                                        {stats.eligibleForInterview}
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">Ready for Interview</p>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">
                                        {stats.completed}
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">Interviews Completed</p>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="shadow-lg mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter Applications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search by job title, company..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Application Status</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="reviewed">Reviewed</SelectItem>
                                        <SelectItem value="interview">Interview</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Interview Status</label>
                                <Select value={interviewStatusFilter} onValueChange={setInterviewStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Interview Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Interview Statuses</SelectItem>
                                        <SelectItem value="eligible_for_interview">Ready for Interview</SelectItem>
                                        <SelectItem value="interview_completed">Interview Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Applications Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredApplications.map((application) => (
                        <Card key={application.id} className="shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Building className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg mb-1">
                                                {application.job?.title || "Unknown Position"}
                                            </CardTitle>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    Applied {formatDate(application.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`${getApplicationStatusColor(application.status)}`}
                                    >
                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        <span>{application.job?.job_type || "Full-time"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>Remote</span>
                                    </div>
                                    {application.job?.salary && (
                                        <div className="flex items-center gap-2">
                                            <span>💰</span>
                                            <span>{formatSalary(application.job.salary)}</span>
                                        </div>
                                    )}
                                    {application.job?.company_name && (
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            <span>{application.job.company_name}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Interview Status Section */}
                                <div className="border-t pt-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <InterviewStatusBadge
                                                status={application.interview_status || 'no_interview'}
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {getActionButton(application)}

                                            <Link href={`/dashboard/application/${application.id}/analysis`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredApplications.length === 0 && (
                    <Card className="shadow-lg">
                        <CardContent className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                            <p className="text-gray-600 mb-4">
                                {applications.length === 0
                                    ? "You haven't submitted any applications yet."
                                    : "No applications match your current filters. Try adjusting your search criteria."
                                }
                            </p>
                            {applications.length === 0 && (
                                <Link href="/jobs">
                                    <Button>
                                        <Search className="mr-2 h-4 w-4" />
                                        Browse Jobs
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}