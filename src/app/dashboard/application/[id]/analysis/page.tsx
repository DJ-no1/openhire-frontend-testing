"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResumeAnalysisResults } from "@/components/resume-analysis-results";
import {
    DatabaseService,
    getApplicationStatusColor,
    getScoreBadgeColor,
    type DatabaseApplication,
    type DatabaseUserResume
} from "@/lib/database";
import {
    ArrowLeft,
    Calendar,
    Building,
    TrendingUp,
    FileText,
    MapPin,
    DollarSign,
    Clock,
    User,
    Briefcase,
    AlertCircle,
    Loader2,
    Download,
    Share,
    RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { type ReviewResponse } from "@/lib/api";

export default function ApplicationAnalysisPage() {
    const { id } = useParams();
    const [application, setApplication] = useState<(DatabaseApplication & { user_resume: DatabaseUserResume[] }) | null>(null);
    const [analysisData, setAnalysisData] = useState<ReviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchApplicationData(id as string);
        }
    }, [id]);

    const fetchApplicationData = async (applicationId: string) => {
        setLoading(true);
        setError(null);
        try {
            // Fetch application details
            const appData = await DatabaseService.getApplicationWithDetails(applicationId);
            setApplication(appData);

            // Get the resume analysis data
            const resume = appData.user_resume?.[0];
            if (resume?.scoring_details) {
                // Extract the stored analysis data
                const analysisResult: ReviewResponse = {
                    jd: resume.scoring_details.jd || appData.job?.description || "",
                    resume: resume.scoring_details.resume || "",
                    analysis: resume.scoring_details.analysis
                };
                setAnalysisData(analysisResult);
            }

            toast.success("Application data loaded successfully");
        } catch (err) {
            const errorMessage = (err as Error).message;
            setError(errorMessage);
            toast.error(`Failed to load application: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (id) {
            fetchApplicationData(id as string);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (!application) return;

        try {
            await DatabaseService.updateApplicationStatus(application.id, newStatus);
            setApplication(prev => prev ? { ...prev, status: newStatus } : null);
            toast.success(`Application status updated to ${newStatus}`);
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not specified";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
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
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                            <div>
                                <h3 className="text-lg font-medium">Loading Application Analysis</h3>
                                <p className="text-muted-foreground">Retrieving your application and AI analysis data...</p>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    if (error || !application) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <div className="flex items-center justify-center min-h-screen">
                        <Card className="max-w-lg w-full border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-800">
                                    <AlertCircle className="h-6 w-6" />
                                    Error Loading Application
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-red-700">
                                    {error || "Application not found or you don't have permission to view it."}
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleRefresh}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Try Again
                                    </Button>
                                    <Link href="/dashboard/application">
                                        <Button>
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back to Applications
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    const resume = application.user_resume?.[0];

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/">
                                        OpenHire
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard/application">
                                        Applications
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Analysis Details</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
                    {/* Header Actions */}
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard/application">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Applications
                            </Button>
                        </Link>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleRefresh}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </Button>
                            <Button variant="outline" size="sm">
                                <Share className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Application Overview */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl text-gray-900">
                                        {application.job?.title || "Unknown Position"}
                                    </CardTitle>
                                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Building className="h-4 w-4" />
                                            <span>{application.job?.job_type || "Not specified"}</span>
                                        </div>
                                        {application.job?.salary && (
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                <span>{formatSalary(application.job.salary)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge
                                        variant="outline"
                                        className={getApplicationStatusColor(application.status)}
                                    >
                                        {application.status}
                                    </Badge>
                                    {resume?.score && (
                                        <Badge
                                            variant="outline"
                                            className={`text-lg px-3 py-1 ${getScoreBadgeColor(resume.score)}`}
                                        >
                                            <TrendingUp className="h-4 w-4 mr-1" />
                                            {resume.score}% Match
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <div>
                                        <p className="font-medium">Applied Date</p>
                                        <p className="text-muted-foreground">{formatDate(application.created_at)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4 text-green-600" />
                                    <div>
                                        <p className="font-medium">Resume Analyzed</p>
                                        <p className="text-muted-foreground">{formatDate(resume?.created_at)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-purple-600" />
                                    <div>
                                        <p className="font-medium">Application ID</p>
                                        <p className="text-muted-foreground font-mono">{application.id.slice(0, 8)}...</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Briefcase className="h-4 w-4 text-orange-600" />
                                    <div>
                                        <p className="font-medium">Job ID</p>
                                        <p className="text-muted-foreground font-mono">{application.job_id.slice(0, 8)}...</p>
                                    </div>
                                </div>
                            </div>

                            {application.job?.description && (
                                <div className="mt-6 pt-6 border-t">
                                    <h4 className="font-semibold mb-2">Job Description</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {application.job.description}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Status Update Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Update Application Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {["applied", "reviewing", "interviewed", "accepted", "rejected"].map((status) => (
                                    <Button
                                        key={status}
                                        variant={application.status === status ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleUpdateStatus(status)}
                                        disabled={application.status === status}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Analysis Results */}
                    {analysisData ? (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">AI Resume Analysis</h2>
                            <ResumeAnalysisResults
                                analysis={analysisData}
                                onNewAnalysis={() => {
                                    // Could trigger re-analysis or navigate to new analysis
                                    toast.info("Re-analysis feature coming soon!");
                                }}
                            />
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center text-muted-foreground">
                                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <h3 className="font-semibold mb-2">No Analysis Data Available</h3>
                                    <p className="text-sm">
                                        This application doesn't have AI analysis data yet.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
