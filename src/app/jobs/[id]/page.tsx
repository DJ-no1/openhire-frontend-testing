"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function JobDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchJob() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:8000/jobs/${id}`);
                if (!res.ok) throw new Error("Failed to fetch job");
                const data = await res.json();
                setJob(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchJob();
    }, [id]);

    const handleApply = () => {
        alert(`Applied to job: ${job?.title}`);
    };

    if (loading) return <div className="p-8">Loading job...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!job) return <div className="p-8">Job not found.</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">&larr; Back to jobs</Button>
            <h1 className="text-4xl font-bold mb-2">{job.title}</h1>
            <div className="text-lg text-muted-foreground mb-4">{job.company || job.recruiter_id}</div>
            <Card className="p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4">Job Description</h2>
                <div className="whitespace-pre-line text-base mb-4">{job.description}</div>
                <div className="mb-2"><strong>Location:</strong> {job.location || job.job_type}</div>
                <div className="mb-2"><strong>Salary:</strong> {job.salary}</div>
                <div className="mb-2"><strong>Posted:</strong> {job.created_at}</div>
                <div className="mb-2"><strong>Expires:</strong> {job.end_date || job.expiry}</div>
                <div className="mb-2"><strong>Status:</strong> {job.status || job.job_type}</div>
                <div className="mb-2"><strong>Required Skills:</strong> {job.skills}</div>
                <Button className="mt-4" onClick={handleApply}>Apply</Button>
            </Card>
        </div>
    );
}
