"use client";
import { useEffect, useState } from "react";
import { AppNavigation } from "@/components/app-navigation";
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    Search,
    Filter,
    Eye,
    BarChart3,
    Clock,
    MapPin,
    Briefcase
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const navigationItems = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <Briefcase className="h-4 w-4" />
    },
    {
        label: 'Browse Jobs',
        href: '/dashboard/jobs',
        icon: <Search className="h-4 w-4" />
    },
    {
        label: 'Applications',
        href: '/dashboard/application',
        icon: <FileText className="h-4 w-4" />
    },
    {
        label: 'Interviews',
        href: '/dashboard/interviews',
        icon: <Calendar className="h-4 w-4" />
    },
];

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<(DatabaseApplication & { user_resume: DatabaseUserResume[] })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [scoreFilter, setScoreFilter] = useState<string>("all");

    // For demo purposes, using a dummy candidate ID
    // In real app, this would come from auth context
    const candidateId = "temp-candidate-id";

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await DatabaseService.getApplicationsForCandidate(candidateId);
            setApplications(data);
            toast.success(`Loaded ${data.length} applications`);
        } catch (err) {
            const errorMessage = (err as Error).message;
            setError(errorMessage);
            toast.error(`Failed to load applications: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const filteredApplications = applications.filter(app => {
        // Search filter
        const searchMatch = searchTerm === "" ||
            app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.job?.job_type?.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const statusMatch = statusFilter === "all" || app.status === statusFilter;

        // Score filter
        const resume = app.user_resume?.[0];
        let scoreMatch = true;
        if (scoreFilter !== "all" && resume?.score) {
            switch (scoreFilter) {
                case "high":
                    scoreMatch = resume.score >= 80;
                    break;
                case "medium":
                    scoreMatch = resume.score >= 60 && resume.score < 80;
                    break;
                case "low":
                    scoreMatch = resume.score < 60;
                    break;
            }
        }

        return searchMatch && statusMatch && scoreMatch;
    });

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not specified";
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    const getScoreDisplay = (score?: number) => {
        if (!score) return "Not analyzed";
        return `${score}%`;
    };

    if (loading) {
        return (
            <ProtectedRoute requiredRole="candidate">
                <AppNavigation
                    items={navigationItems}
                    title="OpenHire"
                    subtitle="Job Search Dashboard"
                />
                <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-muted-foreground">Loading your applications...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredRole="candidate">
            <AppNavigation
                items={navigationItems}
                title="OpenHire"
                subtitle="Job Search Dashboard"
            />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Applications</h1>
                            <p className="text-muted-foreground mt-1">
                                Track and manage your job applications with AI analysis insights
                            </p>
                        </div>
                        <Badge variant="outline" className="text-sm">
                            {applications.length} total applications
                        </Badge>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filter Applications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search by job title or type..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="applied">Applied</SelectItem>
                                        <SelectItem value="reviewing">Under Review</SelectItem>
                                        <SelectItem value="interviewed">Interviewed</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={scoreFilter} onValueChange={setScoreFilter}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="Filter by score" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Scores</SelectItem>
                                        <SelectItem value="high">High (80%+)</SelectItem>
                                        <SelectItem value="medium">Medium (60-79%)</SelectItem>
                                        <SelectItem value="low">Low (&lt;60%)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {error && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-6">
                                <div className="text-center text-red-800">
                                    <h3 className="font-semibold mb-2">Unable to Load Applications</h3>
                                    <p className="text-sm">{error}</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                        onClick={fetchApplications}
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!loading && !error && filteredApplications.length === 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <h3 className="font-semibold mb-2">
                                        {applications.length === 0 ? "No Applications Yet" : "No Applications Match Filters"}
                                    </h3>
                                    <p className="text-sm">
                                        {applications.length === 0
                                            ? "Start applying to jobs to see your applications here."
                                            : "Try adjusting your filters to see more results."
                                        }
                                    </p>
                                    {applications.length === 0 && (
                                        <Link href="/dashboard/jobs">
                                            <Button className="mt-4">
                                                Browse Jobs
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!loading && !error && filteredApplications.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {filteredApplications.map((application) => {
                                const resume = application.user_resume?.[0];
                                return (
                                    <Card key={application.id} className="group hover:shadow-lg transition-all duration-200">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {application.job?.title || "Unknown Position"}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                        <Building className="h-4 w-4" />
                                                        <span>{application.job?.job_type || "Not specified"}</span>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${getApplicationStatusColor(application.status)}`}
                                                >
                                                    {application.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-blue-600" />
                                                    <span className="font-medium">Applied:</span>
                                                    <span>{formatDate(application.created_at)}</span>
                                                </div>

                                                {resume && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                                        <span className="font-medium">AI Score:</span>
                                                        <Badge
                                                            variant="outline"
                                                            className={getScoreBadgeColor(resume.score || 0)}
                                                        >
                                                            {getScoreDisplay(resume.score)}
                                                        </Badge>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Updated:</span>
                                                    <span>{formatDate(resume?.created_at)}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Link
                                                    href={`/dashboard/application/${application.id}/analysis`}
                                                    className="flex-1"
                                                >
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <BarChart3 className="h-4 w-4 mr-2" />
                                                        View Analysis
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
