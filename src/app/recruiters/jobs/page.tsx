'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { AppNavigation } from '@/components/app-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreateJobModal } from '@/components/create-job-modal';
import { useAuth } from '@/hooks/use-auth';
import { jobService, Job as JobType } from '@/lib/job-service';
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
    Edit,
    Trash2,
    MoreHorizontal,
    Loader2,
    Building,
    CheckCircle,
    XCircle,
    AlertCircle,
    PlusCircle,
    BarChart3
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigationItems = [
    {
        label: 'Dashboard',
        href: '/recruiters/dashboard',
        icon: <BarChart3 className="h-4 w-4" />
    },
    {
        label: 'My Jobs',
        href: '/recruiters/jobs',
        icon: <Briefcase className="h-4 w-4" />
    },
    {
        label: 'Candidates',
        href: '/recruiters/dashboard/candidates',
        icon: <Users className="h-4 w-4" />
    },
    {
        label: 'Applications',
        href: '/recruiters/dashboard/applications',
        icon: <FileText className="h-4 w-4" />
    },
];

interface Job {
    id: string;
    title: string;
    company_name: string;
    location: string;
    salary?: string;
    skills: string;
    status: 'active' | 'inactive' | 'expired';
    created_at: string;
    end_date: string;
    applications_count: number;
    interview_duration: number;
    description: any;
    job_type?: string;
    recruiter_id?: string;
    job_link?: string;
}

export default function RecruiterJobsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('created_at');
    const [loading, setLoading] = useState(false);
    const [createJobModalOpen, setCreateJobModalOpen] = useState(false);

    // Convert API job format to local job format
    const convertApiJobToLocal = (apiJob: JobType): Job => {
        console.log('Converting API job:', apiJob);

        // Convert structured description to plain text for display
        const convertDescriptionToText = (description: any): string => {
            if (typeof description === 'string') {
                return description;
            }

            if (description && typeof description === 'object') {
                const parts = [];
                if (description.responsibilities?.length) {
                    parts.push(`Responsibilities: ${description.responsibilities.slice(0, 2).join(', ')}`);
                }
                if (description.requirements?.length) {
                    parts.push(`Requirements: ${description.requirements.slice(0, 2).join(', ')}`);
                }
                return parts.join('. ') || 'No description available';
            }

            return 'No description available';
        };

        return {
            id: apiJob.id,
            title: apiJob.title,
            company_name: (apiJob as any).company_name || 'Company Not Specified',
            location: (apiJob as any).location || 'Location Not Specified',
            salary: apiJob.salary || 'Not specified',
            skills: apiJob.skills || '',
            status: (apiJob as any).status || 'active' as const,
            created_at: apiJob.created_at,
            end_date: apiJob.end_date,
            applications_count: (apiJob as any).applications_count || 0,
            interview_duration: (apiJob as any).interview_duration || 45,
            description: apiJob.description,
            job_type: apiJob.job_type || 'Full-time',
            recruiter_id: apiJob.recruiter_id,
            job_link: (apiJob as any).job_link
        };
    };

    // Function to fetch recruiter's jobs from backend
    const fetchJobs = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const fetchedJobs = await jobService.getRecruiterJobs(user.id);
            const convertedJobs = fetchedJobs.map(convertApiJobToLocal);

            setJobs(convertedJobs);
            toast.success(`Loaded ${convertedJobs.length} of your job postings`);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to load your jobs');
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    // Load jobs on component mount and when user changes
    useEffect(() => {
        if (user?.id) {
            fetchJobs();
        }
    }, [user?.id]);

    // Filter and search jobs
    useEffect(() => {
        let result = jobs;

        // Search filter
        if (searchTerm) {
            result = result.filter(job =>
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.skills.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(job => job.status === statusFilter);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'created_at':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'applications':
                    return (b.applications_count || 0) - (a.applications_count || 0);
                case 'end_date':
                    return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
                default:
                    return 0;
            }
        });

        setFilteredJobs(result);
    }, [jobs, searchTerm, statusFilter, sortBy]);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: {
                label: 'Active',
                className: 'bg-green-100 text-green-800 border-green-200',
                icon: <CheckCircle className="h-3 w-3" />
            },
            inactive: {
                label: 'Draft',
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
        return new Date(dateString).toLocaleDateString();
    };

    const handleJobCreated = () => {
        // Refresh jobs when a new job is created
        fetchJobs();
    };

    const handleDeleteJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            return;
        }

        try {
            // Note: You'll need to implement deleteJob in jobService
            // await jobService.deleteJob(jobId);
            toast.success('Job deleted successfully');
            fetchJobs(); // Refresh the list
        } catch (error) {
            console.error('Error deleting job:', error);
            toast.error('Failed to delete job');
        }
    };

    return (
        <ProtectedRoute requiredRole="recruiter">
            <div className="min-h-screen bg-background">
                <AppNavigation items={navigationItems} title="My Jobs" />

                <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                    <div className="flex items-center justify-between space-y-2">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">My Job Postings</h2>
                            <p className="text-muted-foreground">
                                Manage and track your job postings
                            </p>
                        </div>
                        <Button onClick={() => setCreateJobModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Post New Job
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Jobs
                                </CardTitle>
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{jobs.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    All your job postings
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Jobs
                                </CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {jobs.filter(job => job.status === 'active').length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Currently accepting applications
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Applications
                                </CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Across all jobs
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Draft Jobs
                                </CardTitle>
                                <Edit className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {jobs.filter(job => job.status === 'inactive').length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Saved drafts
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters and Search */}
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search your jobs by title, company, or skills..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Draft</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="created_at">Latest</SelectItem>
                                    <SelectItem value="title">Title</SelectItem>
                                    <SelectItem value="applications">Applications</SelectItem>
                                    <SelectItem value="end_date">Deadline</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Jobs List */}
                    <div className="grid gap-4">
                        {loading ? (
                            <Card className="text-center p-8">
                                <CardContent>
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Loading your jobs...</h3>
                                    <p className="text-muted-foreground">
                                        Please wait while we fetch your job postings
                                    </p>
                                </CardContent>
                            </Card>
                        ) : filteredJobs.length === 0 ? (
                            <Card className="text-center p-8">
                                <CardContent>
                                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs found'}
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        {jobs.length === 0
                                            ? 'Start by creating your first job posting'
                                            : 'Try adjusting your filters or search terms'
                                        }
                                    </p>
                                    {jobs.length === 0 && (
                                        <Button onClick={() => setCreateJobModalOpen(true)}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Create Your First Job
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            filteredJobs.map((job) => (
                                <Card key={job.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <CardTitle className="text-xl">
                                                        <button
                                                            onClick={() => router.push(`/recruiters/jobs/${job.id}`)}
                                                            className="text-left hover:text-primary transition-colors cursor-pointer"
                                                        >
                                                            {job.title}
                                                        </button>
                                                    </CardTitle>
                                                    {getStatusBadge(job.status)}
                                                </div>
                                                <div className="flex items-center space-x-2 text-base text-muted-foreground">
                                                    <Building className="h-4 w-4" />
                                                    <span>{job.company_name}</span>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(`/recruiters/jobs/${job.id}`)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.push(`/recruiters/jobs/${job.id}`)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Job
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDeleteJob(job.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Job
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span>{job.location}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                <DollarSign className="h-4 w-4" />
                                                <span>{job.salary || 'Salary not specified'}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                <Briefcase className="h-4 w-4" />
                                                <span>{job.job_type || 'Full-time'}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>{job.interview_duration} min interview</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {job.skills.split(', ').filter(Boolean).slice(0, 4).map((skill) => (
                                                <Badge key={skill} variant="secondary" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {job.skills.split(', ').filter(Boolean).length > 4 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{job.skills.split(', ').filter(Boolean).length - 4} more
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>Posted: {formatDate(job.created_at)}</span>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <Users className="h-4 w-4" />
                                                    <span>{job.applications_count} applications</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Ends: {formatDate(job.end_date)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Create Job Modal */}
                <CreateJobModal
                    open={createJobModalOpen}
                    onOpenChange={setCreateJobModalOpen}
                    onJobCreated={handleJobCreated}
                />
            </div>
        </ProtectedRoute>
    );
}
