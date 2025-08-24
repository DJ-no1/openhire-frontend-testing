"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    DollarSign,
    Clock,
    Building,
    Users,
    CheckCircle,
    Star,
    Bookmark,
    BookmarkCheck,
    Send,
    Share2,
    ExternalLink
} from "lucide-react";
import { jobService, Job } from "@/lib/job-service";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import { ResumeUploadAnalyzer } from "@/components/resume-upload-analyzer";
import { toast } from "sonner";

export default function CandidateDashboardJobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

    useEffect(() => {
        if (params.id && typeof params.id === 'string') {
            fetchJob(params.id);
        }
    }, [params.id]);

    const fetchJob = async (jobId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const jobData = await jobService.getJobById(jobId);

            // Check if job is active (candidates should only see active jobs)
            if ((jobData as any).status !== 'active') {
                setError("This job is no longer accepting applications.");
                return;
            }

            setJob(jobData);

            // TODO: Check if user has bookmarked this job
            // TODO: Check if user has already applied to this job

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch job details");
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleApply = () => {
        if (!user) {
            toast.error("Please sign in to apply for jobs");
            router.push('/auth/signin');
            return;
        }
        setIsApplicationModalOpen(true);
    };

    const toggleBookmark = () => {
        if (!user) {
            toast.error("Please sign in to bookmark jobs");
            router.push('/auth/signin');
            return;
        }

        setIsBookmarked(!isBookmarked);
        toast.success(isBookmarked ? 'Job removed from bookmarks' : 'Job bookmarked!');
        // TODO: Implement actual bookmark functionality
    };

    const shareJob = () => {
        if (navigator.share) {
            navigator.share({
                title: job?.title,
                text: `Check out this job opportunity: ${job?.title} at ${job?.company_name}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Job link copied to clipboard!');
        }
    };

    const getJobTypeColor = (jobType: string) => {
        switch (jobType?.toLowerCase()) {
            case 'full-time':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'part-time':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'contract':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'internship':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'freelance':
                return 'bg-pink-100 text-pink-800 border-pink-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-muted-foreground">Loading job details...</div>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="text-lg text-destructive">{error || "Job not found"}</div>
                    <Button onClick={() => router.push('/dashboard/jobs')} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Jobs
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/dashboard/jobs')}
                        className="p-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{job.title}</h1>
                        <p className="text-muted-foreground text-lg">{job.company_name}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={shareJob}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                    <Button variant="outline" onClick={toggleBookmark}>
                        {isBookmarked ? (
                            <BookmarkCheck className="h-4 w-4 mr-2 text-blue-600" />
                        ) : (
                            <Bookmark className="h-4 w-4 mr-2" />
                        )}
                        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                    <Button onClick={handleApply} disabled={hasApplied}>
                        <Send className="h-4 w-4 mr-2" />
                        {hasApplied ? 'Already Applied' : 'Apply Now'}
                    </Button>
                </div>
            </div>

            {/* Job Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Building className="h-5 w-5 mr-2" />
                        Job Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{job.location}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Apply by: {formatDate(job.end_date)}</span>
                        </div>

                        {job.salary && (
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="text-green-700 font-medium">{job.salary}</span>
                            </div>
                        )}

                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{job.interview_duration} min interview</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="font-medium">Type:</span>
                            <Badge variant="outline" className={getJobTypeColor(job.job_type)}>
                                {job.job_type}
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{job.applications_count || 0} applicants</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Posted: {formatDate(job.created_at)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Skills Required */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Star className="h-5 w-5 mr-2" />
                        Skills Required
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {job.skills.split(',').map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                                {skill.trim()}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Job Description Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Requirements */}
                {job.description.requirements?.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Requirements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {job.description.requirements.map((req, index) => (
                                    <li key={index} className="flex items-start space-x-3">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown>{req}</ReactMarkdown>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Responsibilities */}
                {job.description.responsibilities?.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Responsibilities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {job.description.responsibilities.map((resp, index) => (
                                    <li key={index} className="flex items-start space-x-3">
                                        <span className="text-blue-500 font-bold mt-1">•</span>
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown>{resp}</ReactMarkdown>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Benefits */}
            {job.description.benefits?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Benefits & Perks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {job.description.benefits.map((benefit, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown>{benefit}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Experience Level */}
            {job.description.experience && (
                <Card>
                    <CardHeader>
                        <CardTitle>Experience Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{job.description.experience}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Apply Section */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <h3 className="text-xl font-semibold">Ready to Apply?</h3>
                        <p className="text-muted-foreground">
                            Join {job.applications_count || 0} other candidates who have already applied for this position.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Button onClick={toggleBookmark} variant="outline">
                                {isBookmarked ? (
                                    <BookmarkCheck className="h-4 w-4 mr-2 text-blue-600" />
                                ) : (
                                    <Bookmark className="h-4 w-4 mr-2" />
                                )}
                                {isBookmarked ? 'Bookmarked' : 'Save for Later'}
                            </Button>
                            <Button onClick={handleApply} disabled={hasApplied} size="lg">
                                <Send className="h-4 w-4 mr-2" />
                                {hasApplied ? 'Already Applied' : 'Apply Now'}
                            </Button>
                        </div>
                        {job.job_link && (
                            <div className="pt-2">
                                <Button variant="link" asChild>
                                    <a href={job.job_link} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Original Posting
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Job Application Modal */}
            <ResumeUploadAnalyzer
                job={job as any}
                open={isApplicationModalOpen}
                onOpenChange={(open: boolean) => {
                    setIsApplicationModalOpen(open);
                    if (!open) {
                        // Assume successful application if modal was closed
                        // You can implement a more sophisticated check here
                        setHasApplied(true);
                    }
                }}
                candidateId={user?.id}
            />
        </div>
    );
}
