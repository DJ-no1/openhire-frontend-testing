'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { AppNavigation } from '@/components/app-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { jobService, Job as JobType, getJobUrl } from '@/lib/job-service';
import { toast } from 'sonner';
import {
    Briefcase,
    Users,
    FileText,
    Search,
    Filter,
    Calendar,
    MapPin,
    DollarSign,
    Clock,
    Eye,
    MoreHorizontal,
    Loader2,
    Building,
    CheckCircle,
    XCircle,
    AlertCircle,
    Bookmark,
    BookmarkCheck
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const navigationItems = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <Briefcase className="h-4 w-4" />
    },
    {
        label: 'Jobs',
        href: '/jobs',
        icon: <Briefcase className="h-4 w-4" />
    },
    {
        label: 'Applications',
        href: '/dashboard/application',
        icon: <FileText className="h-4 w-4" />
    },
];

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary?: string;
    skills: string[];
    status: 'active' | 'inactive' | 'expired';
    created_at: string;
    end_date: string;
    applications_count: number;
    interview_duration: string;
    description: string;
    job_type?: string;
    recruiter_id?: string;
}

export default function ListJobPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [applyDialogOpen, setApplyDialogOpen] = useState(false);
    const [applyJob, setApplyJob] = useState<Job | null>(null);

    useEffect(() => {
        async function fetchJobs() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("http://localhost:8000/jobs", { method: "GET" }); // Use your actual backend URL here
                if (!res.ok) throw new Error("Failed to fetch jobs");
                const data = await res.json();
                setJobs(Array.isArray(data) ? data : []);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }
        fetchJobs();
    }, []);

    // Dummy apply handler for dialog
    const handleApply = (job: Job) => {
        setApplyJob(job);
        setApplyDialogOpen(true);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Job Listings</h1>
            {loading && <div>Loading jobs...</div>}
            {error && <div className="text-red-500">{error}</div>}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map(job => (
                    <Card key={job.id} className="p-6 flex flex-col gap-2">
                        <div className="flex justify-between items-center mb-2">
                            <a href={getJobUrl(job)} className="font-semibold text-xl hover:underline">{job.title}</a>
                            <span className={`px-2 py-1 rounded text-xs ${job.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>{job.status || job.job_type}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{job.company || job.recruiter_id} &bull; {job.location || job.job_type}</div>
                        <div className="text-sm">Salary: {job.salary}</div>
                        <div className="text-sm">Expiry: {job.end_date || job.expiry}</div>
                        <div className="mt-2 text-sm line-clamp-3">{job.description}</div>
                        <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => { setSelectedJob(job); setDialogOpen(true); }}>View Details</Button>
                            <Button size="sm" variant="default" onClick={() => handleApply(job)}>Apply</Button>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">Created: {job.created_at}</div>
                    </Card>
                ))}
            </div>

            {/* Job Details Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    {selectedJob && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedJob.title}</DialogTitle>
                            </DialogHeader>
                            <div className="mb-2 text-muted-foreground">{selectedJob.company || selectedJob.recruiter_id} &bull; {selectedJob.location || selectedJob.job_type}</div>
                            <div className="mb-2">Salary: {selectedJob.salary}</div>
                            <div className="mb-2">Expiry: {selectedJob.end_date || selectedJob.expiry}</div>
                            <div className="mb-2">Status: {selectedJob.status || selectedJob.job_type}</div>
                            <div className="mb-2">Created: {selectedJob.created_at}</div>
                            <div className="mb-4 whitespace-pre-line text-sm">{selectedJob.description}</div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Apply Dialog using JobApplicationModal */}
            <JobApplicationModal
                job={applyJob as JobType | null}
                open={applyDialogOpen}
                onOpenChange={setApplyDialogOpen}
                candidateId={user?.id}
            />
        </div>
    );
}
