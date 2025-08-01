"use client";
import { useEffect, useState } from "react";
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
import { JobApplicationModal } from "@/components/job-application-modal";
import {
    MapPin,
    Calendar,
    DollarSign,
    Building,
    Clock,
    Briefcase,
    Eye,
    Send
} from "lucide-react";
import { toast } from "sonner";
import { type Job as JobType } from "@/lib/api";

type Job = {
    id: string;
    recruiter_id?: string;
    title: string;
    description?: string;
    salary?: string;
    skills?: string;
    job_type?: string;
    created_at?: string;
    end_date?: string;
    job_link?: string;
    company?: string;
    location?: string;
    status?: string;
    expiry?: string;
};

export default function JobsListPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [applyModalOpen, setApplyModalOpen] = useState(false);

    useEffect(() => {
        async function fetchJobs() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("http://localhost:8000/jobs", {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch jobs");
                const data = await res.json();
                setJobs(Array.isArray(data) ? data : []);
                toast.success(`Loaded ${data.length} job positions`);
            } catch (err) {
                const errorMessage = (err as Error).message;
                setError(errorMessage);
                toast.error(`Failed to load jobs: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        }
        fetchJobs();
    }, []);

    const handleApply = (job: Job) => {
        setSelectedJob(job);
        setApplyModalOpen(true);
    };

    const getStatusColor = (status?: string, jobType?: string) => {
        const statusText = status || jobType || 'Unknown';
        switch (statusText.toLowerCase()) {
            case 'active':
            case 'open':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'closed':
            case 'filled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const formatSalary = (salary?: string) => {
        if (!salary) return 'Not specified';
        return salary.includes('$') ? salary : `$${salary}`;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not specified';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

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
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Available Jobs</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
                            <p className="text-muted-foreground mt-1">
                                Discover opportunities that match your skills and apply with AI-powered resume analysis
                            </p>
                        </div>
                        <Badge variant="outline" className="text-sm">
                            {jobs.length} positions available
                        </Badge>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center space-y-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-muted-foreground">Loading job opportunities...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-6">
                                <div className="text-center text-red-800">
                                    <h3 className="font-semibold mb-2">Unable to Load Jobs</h3>
                                    <p className="text-sm">{error}</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                        onClick={() => window.location.reload()}
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!loading && !error && jobs.length === 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center text-muted-foreground">
                                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <h3 className="font-semibold mb-2">No Jobs Available</h3>
                                    <p className="text-sm">Check back later for new opportunities.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!loading && !error && jobs.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {jobs.map((job) => (
                                <Card key={job.id} className="group hover:shadow-lg transition-all duration-200 hover:border-blue-200">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {job.title}
                                                </CardTitle>
                                                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                    <Building className="h-4 w-4" />
                                                    <span>{job.company || job.recruiter_id}</span>
                                                    {job.location && (
                                                        <>
                                                            <span>•</span>
                                                            <MapPin className="h-4 w-4" />
                                                            <span>{job.location}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${getStatusColor(job.status, job.job_type)}`}
                                            >
                                                {job.status || job.job_type || 'Open'}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                                <span className="font-medium">Salary:</span>
                                                <span className="text-green-700">{formatSalary(job.salary)}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>Expires:</span>
                                                <span>{formatDate(job.end_date || job.expiry)}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>Posted:</span>
                                                <span>{formatDate(job.created_at)}</span>
                                            </div>
                                        </div>

                                        {job.description && (
                                            <div className="border-t pt-3">
                                                <p className="text-sm text-gray-600 line-clamp-3">
                                                    {job.description}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => {
                                                    // Could open job details modal or navigate to job page
                                                    toast.info("Job details view coming soon!");
                                                }}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                onClick={() => handleApply(job)}
                                            >
                                                <Send className="h-4 w-4 mr-2" />
                                                Apply Now
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </SidebarInset>

            {/* Job Application Modal */}
            <JobApplicationModal
                job={selectedJob as JobType | null}
                open={applyModalOpen}
                onOpenChange={setApplyModalOpen}
            />
        </SidebarProvider>
    );
}
