"use client";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ResumeUploadAnalyzer } from "@/components/resume-upload-analyzer";
import { type Job as JobType } from "@/lib/api";
import { getJobUrl } from "@/lib/job-service";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api-config";

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
                const res = await fetch(getApiUrl("/jobs"), { method: "GET" });
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

            {/* Apply Dialog using ResumeUploadAnalyzer */}
            <ResumeUploadAnalyzer
                job={applyJob as JobType | null}
                open={applyDialogOpen}
                onOpenChange={setApplyDialogOpen}
                candidateId={user?.id}
            />
        </div>
    );
}
