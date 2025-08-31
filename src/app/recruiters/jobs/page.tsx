'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { AppNavigation } from '@/components/app-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CreateJobModal } from '@/components/create-job-modal';
import { useAuth } from '@/contexts/AuthContext';
import { jobService, Job as JobType, getJobUrl } from '@/lib/job-service';
import { DatabaseService } from '@/lib/database';
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
    BarChart3,
    RefreshCw
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
    const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState<string | null>(null);

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

            // Get live application counts for all jobs
            const jobIds = convertedJobs.map(job => job.id);
            const applicationCounts = await DatabaseService.getApplicationCountsForJobs(jobIds);

            // Update jobs with live application counts
            const jobsWithLiveCounts = convertedJobs.map(job => ({
                ...job,
                applications_count: applicationCounts[job.id] || 0
            }));

            setJobs(jobsWithLiveCounts);
            toast.success(`Loaded ${jobsWithLiveCounts.length} job postings with live application data`);
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

    // Auto-refresh application counts every 30 seconds for live updates
    useEffect(() => {
        if (!user?.id) return;

        const refreshInterval = setInterval(() => {
            // Only refresh application counts, not the entire job list
            const refreshApplicationCounts = async () => {
                try {
                    const jobIds = jobs.map(job => job.id);
                    if (jobIds.length === 0) return;

                    const applicationCounts = await DatabaseService.getApplicationCountsForJobs(jobIds);

                    setJobs(prevJobs =>
                        prevJobs.map(job => ({
                            ...job,
                            applications_count: applicationCounts[job.id] || 0
                        }))
                    );
                } catch (error) {
                    console.error('Error refreshing application counts:', error);
                }
            };

            refreshApplicationCounts();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(refreshInterval);
    }, [user?.id, jobs.length]); // Only depend on user and jobs length

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
        // Refresh jobs with updated application counts when a new job is created
        fetchJobs();
    };

    const handleDeleteJob = async (jobId: string) => {
        setJobToDelete(jobId);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteJob = async () => {
        if (!jobToDelete) return;

        setDeletingJobId(jobToDelete);
        try {
            // Actually delete from database
            await jobService.deleteJob(jobToDelete);

            // Remove from local state only after successful deletion
            setJobs(prevJobs => prevJobs.filter(job => job.id !== jobToDelete));

            toast.success('Job deleted successfully');
        } catch (error) {
            console.error('Error deleting job:', error);
            toast.error('Failed to delete job');
        } finally {
            setDeletingJobId(null);
            setDeleteDialogOpen(false);
            setJobToDelete(null);
        }
    };

    return (
        <ProtectedRoute requiredRole="recruiter">
            <div className="min-h-screen bg-gray-50">
                <AppNavigation items={navigationItems} title="My Jobs" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
                            <p className="text-gray-600 mt-2">
                                Manage and track your job postings
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                variant="outline"
                                onClick={fetchJobs}
                                disabled={loading}
                                className="flex items-center space-x-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </Button>
                            <Button onClick={() => setCreateJobModalOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Post New Job
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Total Jobs
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {jobs.length}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            All your job postings
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <Briefcase className="h-8 w-8 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Active Jobs
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {jobs.filter(job => job.status === 'active').length}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Currently accepting applications
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Total Applications
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0)}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Across all jobs
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <FileText className="h-8 w-8 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Draft Jobs
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {jobs.filter(job => job.status === 'inactive').length}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Saved drafts
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <Edit className="h-8 w-8 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters and Search */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Search and Filter Jobs
                            </CardTitle>
                            <CardDescription>
                                Search your jobs by title, company, or skills, and filter by status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search Jobs
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Search your jobs by title, company, or skills..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Draft</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sort By
                                    </label>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger>
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
                        </CardContent>
                    </Card>

                    {/* Jobs List */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Your Job Postings</CardTitle>
                                    <CardDescription>
                                        {filteredJobs.length} job posting(s) found
                                    </CardDescription>
                                </div>
                                {filteredJobs.length > 0 && (
                                    <Badge variant="secondary">
                                        {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                    <span className="ml-3 text-gray-600">Loading your jobs...</span>
                                </div>
                            ) : filteredJobs.length === 0 ? (
                                <div className="text-center py-12">
                                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs found'}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
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
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {filteredJobs.map((job) => (
                                        <Card key={job.id} className="hover:shadow-lg transition-shadow border border-gray-200 relative">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-2 flex-1 pr-16">
                                                        <div className="flex items-center space-x-2">
                                                            <CardTitle className="text-lg font-semibold text-gray-900">
                                                                {job.title}
                                                            </CardTitle>
                                                            {getStatusBadge(job.status)}
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                            <Building className="h-4 w-4" />
                                                            <span>{job.company_name}</span>
                                                        </div>
                                                    </div>

                                                    {/* Top right area with application count and delete button */}
                                                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                                                        <Badge
                                                            variant={job.applications_count > 0 ? "default" : "secondary"}
                                                            className={`${job.applications_count > 0
                                                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                                                : 'bg-gray-100 text-gray-600 border-gray-200'
                                                                } font-semibold`}
                                                        >
                                                            {job.applications_count} {job.applications_count === 1 ? 'application' : 'applications'}
                                                        </Badge>

                                                        {/* Small delete button */}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteJob(job.id)}
                                                            disabled={deletingJobId === job.id}
                                                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            {deletingJobId === job.id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="pt-0">
                                                {/* Job details grid */}
                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <MapPin className="h-4 w-4" />
                                                        <span className="truncate">{job.location}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <DollarSign className="h-4 w-4" />
                                                        <span className="truncate">{job.salary || 'Not specified'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <Briefcase className="h-4 w-4" />
                                                        <span className="truncate">{job.job_type || 'Full-time'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <Clock className="h-4 w-4" />
                                                        <span className="truncate">{job.interview_duration} min interview</span>
                                                    </div>
                                                </div>

                                                {/* Skills badges */}
                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {job.skills.split(', ').filter(Boolean).slice(0, 3).map((skill) => (
                                                        <Badge key={skill} variant="secondary" className="text-xs">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                    {job.skills.split(', ').filter(Boolean).length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{job.skills.split(', ').filter(Boolean).length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Action buttons */}
                                                <div className="flex flex-col space-y-2 pt-3 border-t border-gray-100">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {/* View Job Button */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.push(getJobUrl(job))}
                                                            className="flex items-center justify-center space-x-2"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            <span>View</span>
                                                        </Button>

                                                        {/* Edit Job Button */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.push(`/recruiters/jobs/${job.id}`)}
                                                            className="flex items-center justify-center space-x-2"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            <span>Edit</span>
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-2">
                                                        {/* View Applications Button - now full width and light green */}
                                                        <Button
                                                            variant={job.applications_count > 0 ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => {
                                                                if (job.applications_count > 0) {
                                                                    router.push(`/recruiters/dashboard/applications?selectedJobId=${job.id}`);
                                                                } else {
                                                                    toast.info('No applications yet for this job');
                                                                }
                                                            }}
                                                            disabled={job.applications_count === 0}
                                                            className={`flex items-center justify-center space-x-2 ${job.applications_count > 0
                                                                    ? 'bg-green-500 hover:bg-green-600 text-white border-green-500'
                                                                    : 'text-gray-500'
                                                                }`}
                                                        >
                                                            <Users className="h-4 w-4" />
                                                            <span>Applications</span>
                                                        </Button>
                                                    </div>

                                                    {/* Dates row */}
                                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                                                        <div className="flex items-center space-x-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>Posted: {formatDate(job.created_at)}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>Ends: {formatDate(job.end_date)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Create Job Modal */}
                <CreateJobModal
                    open={createJobModalOpen}
                    onOpenChange={setCreateJobModalOpen}
                    onJobCreated={handleJobCreated}
                />

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Job</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this job? This action cannot be undone and will permanently remove the job listing and all associated applications.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setJobToDelete(null);
                                }}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDeleteJob}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                disabled={deletingJobId !== null}
                            >
                                {deletingJobId ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Job'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </ProtectedRoute>
    );
}
