'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppNavigation } from '@/components/app-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { jobService, Job as JobType } from '@/lib/job-service';
import { toast } from 'sonner';
import { JobApplicationModal } from '@/components/job-application-modal';
import {
    ArrowLeft,
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    Calendar,
    Users,
    Building,
    Edit,
    FileText,
    CheckCircle,
    XCircle,
    Eye,
    Share2,
    Bookmark,
    BookmarkCheck,
    AlertCircle,
    Loader2
} from 'lucide-react';

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary?: string;
    skills: string[] | string;
    status: 'active' | 'inactive' | 'expired';
    created_at: string;
    end_date: string;
    applications_count: number;
    interview_duration: string;
    description: string;
    requirements?: string;
    benefits?: string;
    job_type?: string;
    experience_level?: string;
    recruiter_id?: string;
}

const navigationItems = [
    {
        label: 'Home',
        href: '/',
        icon: <Briefcase className="h-4 w-4" />
    },
    {
        label: 'Browse Jobs',
        href: '/jobs',
        icon: <Briefcase className="h-4 w-4" />
    },
];

const recruiterNavigationItems = [
    {
        label: 'Dashboard',
        href: '/recruiters/dashboard',
        icon: <Briefcase className="h-4 w-4" />
    },
    {
        label: 'Jobs',
        href: '/recruiters/dashboard/jobs',
        icon: <Briefcase className="h-4 w-4" />
    },
];

export default function JobDetailPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

    const isRecruiter = user?.role === 'recruiter';
    const isJobOwner = job?.recruiter_id === user?.id;

    const convertApiJobToLocal = (apiJob: JobType): Job => {
        console.log('Converting API job for details (real data only):', apiJob);

        // Helper function to safely extract string from description object or string
        const extractStringFromDescription = (desc: any): string => {
            if (typeof desc === 'string') return desc;
            if (typeof desc === 'object' && desc !== null) {
                // If it's a structured description object, create a readable string
                const parts = [];
                if (desc.responsibilities?.length) {
                    parts.push(`**Responsibilities:**\n${desc.responsibilities.join('\n• ')}`);
                }
                if (desc.requirements?.length) {
                    parts.push(`**Requirements:**\n${desc.requirements.join('\n• ')}`);
                }
                if (desc.benefits?.length) {
                    parts.push(`**Benefits:**\n${desc.benefits.join('\n• ')}`);
                }
                if (desc.experience) {
                    parts.push(`**Experience:**\n${desc.experience}`);
                }
                return parts.join('\n\n') || 'No description available';
            }
            return 'No description available';
        };

        const extractArrayField = (desc: any, field: string): string => {
            if (typeof desc === 'object' && desc !== null && Array.isArray(desc[field])) {
                return desc[field].join('\n• ');
            }
            return `${field.charAt(0).toUpperCase() + field.slice(1)} not specified`;
        };

        return {
            ...apiJob,
            salary: apiJob.salary || 'Not specified',
            skills: apiJob.skills ? apiJob.skills.split(', ') : [],
            applications_count: (apiJob as any).applications_count || 0,
            job_type: apiJob.job_type || 'Full-time',
            experience_level: 'Not specified',
            // Only use real data from API, no auto-generation
            company: (apiJob as any).company || (apiJob as any).company_name || 'Company Not Specified',
            location: (apiJob as any).location || 'Location Not Specified',
            interview_duration: (apiJob as any).interview_duration || 'Not specified',
            status: (apiJob as any).status || 'active' as const,
            description: extractStringFromDescription(apiJob.description),
            requirements: extractArrayField(apiJob.description, 'requirements'),
            benefits: extractArrayField(apiJob.description, 'benefits')
        };
    };

    const fetchJobDetails = async () => {
        setLoading(true);
        try {
            // Treat the jobId as a job link (e.g., "kLkO5h5u" from "/j/kLkO5h5u")
            // The jobId here is already the clean link part without "/j/"
            const jobData = await jobService.getJobByLink(jobId);
            if (jobData) {
                setJob(convertApiJobToLocal(jobData));
            } else {
                toast.error('Job not found');
                router.push('/jobs');
            }
        } catch (error) {
            console.error('Error fetching job details:', error);
            toast.error('Failed to load job details');
            router.push('/jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (jobId) {
            fetchJobDetails();
        }
    }, [jobId]);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: {
                label: 'Active',
                className: 'bg-green-100 text-green-800 border-green-200',
                icon: <CheckCircle className="h-3 w-3" />
            },
            inactive: {
                label: 'Inactive',
                className: 'bg-gray-100 text-gray-800 border-gray-200',
                icon: <XCircle className="h-3 w-3" />
            },
            expired: {
                label: 'Expired',
                className: 'bg-red-100 text-red-800 border-red-200',
                icon: <AlertCircle className="h-3 w-3" />
            }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
        return (
            <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
                {config.icon}
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleEditJob = () => {
        router.push(`/recruiters/dashboard/jobs?edit=${jobId}`);
    };

    const handleApply = () => {
        if (!user) {
            toast.error('Please sign in to apply for this job');
            router.push('/auth/signin');
            return;
        }
        setIsApplicationModalOpen(true);
    };

    const handleBookmark = () => {
        if (!user) {
            toast.error('Please sign in to bookmark jobs');
            router.push('/auth/signin');
            return;
        }
        setIsBookmarked(!isBookmarked);
        toast.success(isBookmarked ? 'Job removed from bookmarks' : 'Job bookmarked');
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: job?.title,
                    text: `Check out this job opportunity: ${job?.title} at ${job?.company}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Job link copied to clipboard');
        }
    };

    const handleApplicationSubmitted = () => {
        setHasApplied(true);
        setIsApplicationModalOpen(false);
        toast.success('Application submitted successfully!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <AppNavigation
                    items={isRecruiter ? recruiterNavigationItems : navigationItems}
                    title="Job Details"
                />
                <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Loading job details...</h3>
                            <p className="text-muted-foreground">
                                Please wait while we fetch the job information
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-background">
                <AppNavigation
                    items={isRecruiter ? recruiterNavigationItems : navigationItems}
                    title="Job Details"
                />
                <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Job not found</h3>
                            <p className="text-muted-foreground mb-4">
                                The job you're looking for doesn't exist or has been removed.
                            </p>
                            <Button onClick={() => router.push('/jobs')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Jobs
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <AppNavigation
                items={isRecruiter ? recruiterNavigationItems : navigationItems}
                title="Job Details"
            />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex items-center"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex-1" />
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={handleShare}>
                            <Share2 className="h-4 w-4" />
                        </Button>
                        {!isRecruiter && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBookmark}
                                className={isBookmarked ? 'bg-primary/10' : ''}
                            >
                                {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                            </Button>
                        )}
                        {isRecruiter && isJobOwner && (
                            <Button onClick={handleEditJob}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Job
                            </Button>
                        )}
                    </div>
                </div>

                {/* Job Header */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center space-x-3">
                                        <CardTitle className="text-3xl">{job.title}</CardTitle>
                                        {getStatusBadge(job.status)}
                                    </div>
                                    <div className="flex items-center space-x-2 text-lg text-muted-foreground">
                                        <Building className="h-5 w-5" />
                                        <span>{job.company}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Key Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex items-center space-x-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{job.location}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{job.salary || 'Salary not specified'}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{job.interview_duration} interview</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{job.applications_count} applications</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {!isRecruiter && job.status === 'active' && (
                                <div className="flex space-x-3 pt-4">
                                    <Button
                                        size="lg"
                                        onClick={handleApply}
                                        disabled={hasApplied}
                                        className="flex-1 md:flex-none"
                                    >
                                        {hasApplied ? (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Applied
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="mr-2 h-4 w-4" />
                                                Apply Now
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                </Card>

                {/* Job Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Job Description</CardTitle>
                            </CardHeader>
                            <CardContent className="prose prose-sm max-w-none">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {job.description}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Requirements */}
                        {job.requirements && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Requirements</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {job.requirements}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Benefits */}
                        {job.benefits && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Benefits</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {job.benefits}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Job Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Job Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Job Type</div>
                                    <div className="text-sm font-semibold">{job.job_type || 'Full-time'}</div>
                                </div>
                                <Separator />
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Experience Level</div>
                                    <div className="text-sm font-semibold">{job.experience_level || 'Mid-level'}</div>
                                </div>
                                <Separator />
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Posted</div>
                                    <div className="text-sm font-semibold">{formatDate(job.created_at)}</div>
                                </div>
                                <Separator />
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Application Deadline</div>
                                    <div className="text-sm font-semibold">{formatDate(job.end_date)}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills Required */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Skills Required</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(job.skills)
                                        ? job.skills.map((skill: string) => (
                                            <Badge key={skill} variant="secondary">
                                                {skill}
                                            </Badge>
                                        ))
                                        : typeof job.skills === 'string'
                                            ? job.skills.split(',').map((skill: string) => (
                                                <Badge key={skill.trim()} variant="secondary">
                                                    {skill.trim()}
                                                </Badge>
                                            ))
                                            : []
                                    }
                                </div>
                            </CardContent>
                        </Card>

                        {/* Application Stats (for recruiters) */}
                        {isRecruiter && isJobOwner && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Application Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Total Applications</span>
                                        <span className="text-sm font-semibold">{job.applications_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Views</span>
                                        <span className="text-sm font-semibold">--</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Response Rate</span>
                                        <span className="text-sm font-semibold">--</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Application Modal */}
                <JobApplicationModal
                    job={job ? {
                        id: job.id,
                        title: job.title,
                        description: job.description,
                        recruiter_id: job.recruiter_id || '',
                        job_type: job.job_type || 'Full-time',
                        salary: job.salary ? parseInt(job.salary.replace(/[^0-9]/g, '')) : undefined,
                        created_at: job.created_at
                    } : null}
                    open={isApplicationModalOpen}
                    onOpenChange={setIsApplicationModalOpen}
                    candidateId={user?.id}
                />
            </div>
        </div>

    );
}
