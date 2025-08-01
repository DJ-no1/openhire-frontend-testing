'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { AppNavigation } from '@/components/app-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import CreateJob from '@/components/createjob';
import JobDetailsModal from '@/components/job-details-modal';
import JobEditModal from '@/components/job-edit-modal';
import { jobService, Job as JobType } from '@/lib/job-service';
import { toast } from 'sonner';
import {
    Briefcase,
    Users,
    FileText,
    PlusCircle,
    Search,
    Filter,
    Calendar,
    MapPin,
    DollarSign,
    Clock,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal,
    Loader2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
        href: '/recruiters/dashboard',
        icon: <Briefcase className="h-4 w-4" />
    },
    {
        label: 'Jobs',
        href: '/recruiters/dashboard/jobs',
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

// Mock data - will be replaced with API calls
const mockJobs: Job[] = [
    {
        id: '1',
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        location: 'Remote',
        salary: '$120,000 - $150,000',
        skills: ['React', 'TypeScript', 'Node.js'],
        status: 'active' as const,
        created_at: '2025-07-15',
        end_date: '2025-08-15',
        applications_count: 12,
        interview_duration: '45 min',
        description: 'We are looking for a Senior Software Engineer to join our growing team...'
    },
    {
        id: '2',
        title: 'Product Manager',
        company: 'StartupXYZ',
        location: 'San Francisco, CA',
        salary: '$100,000 - $130,000',
        skills: ['Product Strategy', 'Analytics', 'User Research'],
        status: 'active' as const,
        created_at: '2025-07-20',
        end_date: '2025-08-20',
        applications_count: 8,
        interview_duration: '60 min',
        description: 'Join our product team and help shape the future of our platform...'
    },
    {
        id: '3',
        title: 'Frontend Developer',
        company: 'Design Studios',
        location: 'Hybrid',
        salary: '$80,000 - $100,000',
        skills: ['Vue.js', 'CSS', 'JavaScript'],
        status: 'inactive' as const,
        created_at: '2025-07-10',
        end_date: '2025-07-30',
        applications_count: 5,
        interview_duration: '30 min',
        description: 'We need a talented frontend developer to create beautiful user interfaces...'
    }
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
}

export default function RecruiterJobsPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>(mockJobs);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>(mockJobs);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('created_at');
    const [loading, setLoading] = useState(false);

    // Modal states
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Convert API job format to local job format
    const convertApiJobToLocal = (apiJob: JobType): Job => {
        return {
            ...apiJob,
            salary: apiJob.salary || '',
            skills: apiJob.skills ? apiJob.skills.split(', ') : [],
            applications_count: apiJob.applications_count || 0
        };
    };

    // Function to fetch jobs from API
    const fetchJobs = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const fetchedJobs = await jobService.getRecruiterJobs(user.id);
            const convertedJobs = fetchedJobs.map(convertApiJobToLocal);
            setJobs(convertedJobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to load jobs. Using sample data.');
            // Use mock data as fallback
            setJobs(mockJobs);
        } finally {
            setLoading(false);
        }
    };

    // Load jobs on component mount
    useEffect(() => {
        fetchJobs();
    }, [user?.id]);

    // Callback for when a new job is created
    const handleJobCreated = () => {
        fetchJobs(); // Refresh the jobs list
    };

    // Filter and search jobs
    useEffect(() => {
        let result = jobs;

        // Search filter
        if (searchTerm) {
            result = result.filter(job =>
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
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
                    return b.applications_count - a.applications_count;
                default:
                    return 0;
            }
        });

        setFilteredJobs(result);
    }, [jobs, searchTerm, statusFilter, sortBy]);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: 'Active', className: 'bg-green-100 text-green-800 border-green-200' },
            inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800 border-gray-200' },
            expired: { label: 'Expired', className: 'bg-red-100 text-red-800 border-red-200' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
        return (
            <Badge variant="outline" className={config.className}>
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const handleJobAction = async (action: string, jobId: string) => {
        const job = jobs.find(j => j.id === jobId);

        try {
            switch (action) {
                case 'view':
                    if (job) {
                        setSelectedJob(job);
                        setIsDetailsModalOpen(true);
                    }
                    break;

                case 'edit':
                    if (job) {
                        setSelectedJob(job);
                        setIsEditModalOpen(true);
                    }
                    break;

                case 'delete':
                    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
                        await jobService.deleteJob(jobId);
                        setJobs(jobs.filter(job => job.id !== jobId));
                        toast.success('Job deleted successfully!');
                    }
                    break;

                case 'toggle-status':
                    if (job) {
                        const newStatus = job.status === 'active' ? 'inactive' : 'active';
                        await jobService.toggleJobStatus(jobId, newStatus);
                        setJobs(jobs.map(j =>
                            j.id === jobId
                                ? { ...j, status: newStatus as any }
                                : j
                        ));
                        toast.success(`Job ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
                    }
                    break;
            }
        } catch (error) {
            console.error('Job action error:', error);
            toast.error(`Failed to ${action} job: ${(error as Error).message}`);
        }
    };

    // Handle modal actions
    const handleViewJob = (jobId: string) => {
        const job = jobs.find(j => j.id === jobId);
        if (job) {
            setSelectedJob(job);
            setIsDetailsModalOpen(true);
        }
    };

    const handleEditJob = (jobId: string) => {
        const job = jobs.find(j => j.id === jobId);
        if (job) {
            setSelectedJob(job);
            setIsEditModalOpen(true);
        }
    };

    const handleToggleStatus = async (jobId: string) => {
        await handleJobAction('toggle-status', jobId);
        // Refresh selected job data if it's currently being viewed
        if (selectedJob && selectedJob.id === jobId) {
            const updatedJob = jobs.find(j => j.id === jobId);
            if (updatedJob) {
                setSelectedJob(updatedJob);
            }
        }
    };

    const closeModals = () => {
        setIsDetailsModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedJob(null);
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                <AppNavigation items={navigationItems} title="Job Management" />

                <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                    <div className="flex items-center justify-between space-y-2">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Job Management</h2>
                            <p className="text-muted-foreground">
                                Create and manage your job postings
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CreateJob onJobCreated={handleJobCreated} />
                        </div>
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
                                    All time postings
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Jobs
                                </CardTitle>
                                <PlusCircle className="h-4 w-4 text-muted-foreground" />
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
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {jobs.reduce((sum, job) => sum + job.applications_count, 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Across all jobs
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Avg. Applications
                                </CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {jobs.length ? Math.round(jobs.reduce((sum, job) => sum + job.applications_count, 0) / jobs.length) : 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Per job posting
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
                                    placeholder="Search jobs by title, company, or skills..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
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
                                    <h3 className="text-lg font-semibold mb-2">Loading jobs...</h3>
                                    <p className="text-muted-foreground">
                                        Please wait while we fetch your job postings
                                    </p>
                                </CardContent>
                            </Card>
                        ) : filteredJobs.length === 0 ? (
                            <Card className="text-center p-8">
                                <CardContent>
                                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchTerm || statusFilter !== 'all'
                                            ? 'Try adjusting your filters or search terms'
                                            : 'Get started by creating your first job posting'
                                        }
                                    </p>
                                    {!searchTerm && statusFilter === 'all' && (
                                        <CreateJob onJobCreated={handleJobCreated} />
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
                                                    <CardTitle className="text-xl">{job.title}</CardTitle>
                                                    {getStatusBadge(job.status)}
                                                </div>
                                                <CardDescription className="text-base">
                                                    {job.company}
                                                </CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleJobAction('view', job.id)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleJobAction('edit', job.id)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Job
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleJobAction('toggle-status', job.id)}>
                                                        <PlusCircle className="mr-2 h-4 w-4" />
                                                        {job.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleJobAction('delete', job.id)}
                                                        className="text-red-600"
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
                                                <Users className="h-4 w-4" />
                                                <span>{job.applications_count} applications</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>{job.interview_duration} interview</span>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {job.description}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {job.skills.slice(0, 3).map((skill) => (
                                                <Badge key={skill} variant="secondary" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {job.skills.length > 3 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{job.skills.length - 3} more
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>Created: {formatDate(job.created_at)}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>Expires: {formatDate(job.end_date)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Job Details Modal */}
                    <JobDetailsModal
                        job={selectedJob}
                        isOpen={isDetailsModalOpen}
                        onClose={closeModals}
                        onEdit={handleEditJob}
                        onToggleStatus={handleToggleStatus}
                    />

                    {/* Job Edit Modal */}
                    <JobEditModal
                        job={selectedJob}
                        isOpen={isEditModalOpen}
                        onClose={closeModals}
                        onJobUpdated={fetchJobs}
                    />
                </div>
            </div>
        </ProtectedRoute>
    );
}
