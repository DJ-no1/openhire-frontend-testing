'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    BookmarkCheck,
    LogIn,
    UserPlus
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
    job_link?: string;
}

export default function JobsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('active');
    const [locationFilter, setLocationFilter] = useState<string>('all');
    const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('created_at');
    const [loading, setLoading] = useState(false);
    const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());

    // Convert API job format to local job format - REAL DATA ONLY
    const convertApiJobToLocal = (apiJob: JobType): Job => {
        console.log('Converting API job (real data only):', apiJob);

        // Generate a short job link if one doesn't exist
        const generateJobLink = (jobId: string): string => {
            // Create a short hash from the job ID
            const hash = jobId.slice(0, 8); // Take first 8 characters
            return `/j/${hash}`;
        };

        return {
            id: apiJob.id,
            title: apiJob.title,
            description: apiJob.description || 'No description available',
            salary: apiJob.salary || 'Not specified',
            skills: apiJob.skills ? apiJob.skills.split(', ') : [],
            job_type: apiJob.job_type || 'Full-time',
            created_at: apiJob.created_at,
            end_date: apiJob.end_date,
            recruiter_id: apiJob.recruiter_id,
            job_link: (apiJob as any).job_link || generateJobLink(apiJob.id), // Use existing job_link or generate one
            // Only use real data from API, no auto-generation
            company: (apiJob as any).company || 'Company Not Specified',
            location: (apiJob as any).location || 'Location Not Specified',
            interview_duration: (apiJob as any).interview_duration || 'Not specified',
            applications_count: (apiJob as any).applications_count || 0,
            status: (apiJob as any).status || 'active' as const
        };
    };

    // Function to fetch all active jobs from backend
    const fetchJobs = async () => {
        setLoading(true);
        try {
            const fetchedJobs = await jobService.getAllJobs();
            const convertedJobs = fetchedJobs.map(convertApiJobToLocal);

            setJobs(convertedJobs);
            toast.success(`Loaded ${convertedJobs.length} job positions`);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to load jobs from backend. Using fallback data.');

            // Fallback to some sample data for testing
            const fallbackJobs: Job[] = [
                {
                    id: 'fallback-1',
                    title: 'Software Engineer (Fallback)',
                    company: 'Tech Company',
                    location: 'Remote',
                    salary: '$80,000 - $120,000',
                    skills: ['React', 'TypeScript', 'Node.js'],
                    status: 'active' as const,
                    created_at: '2025-08-01',
                    end_date: '2025-08-31',
                    applications_count: 0,
                    interview_duration: '45 min',
                    description: 'Fallback job description',
                    job_type: 'Full-time'
                }
            ];
            setJobs(fallbackJobs);
        } finally {
            setLoading(false);
        }
    };

    // Load jobs on component mount
    useEffect(() => {
        fetchJobs();
    }, []);

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

        // Location filter
        if (locationFilter !== 'all') {
            result = result.filter(job =>
                job.location.toLowerCase().includes(locationFilter.toLowerCase())
            );
        }

        // Job type filter
        if (jobTypeFilter !== 'all') {
            result = result.filter(job => job.job_type === jobTypeFilter);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'created_at':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'company':
                    return a.company.localeCompare(b.company);
                case 'salary':
                    // Simple salary comparison (extract first number)
                    const salaryA = parseInt(a.salary?.replace(/[^0-9]/g, '') || '0');
                    const salaryB = parseInt(b.salary?.replace(/[^0-9]/g, '') || '0');
                    return salaryB - salaryA;
                default:
                    return 0;
            }
        });

        setFilteredJobs(result);
    }, [jobs, searchTerm, statusFilter, locationFilter, jobTypeFilter, sortBy]);

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
        return new Date(dateString).toLocaleDateString();
    };

    const handleViewJob = (job: any) => {
        router.push(getJobUrl(job));
    };

    const handleBookmark = (jobId: string) => {
        if (!user) {
            toast.error('Please sign in to bookmark jobs');
            router.push('/auth/signin');
            return;
        }
        const newBookmarked = new Set(bookmarkedJobs);
        if (newBookmarked.has(jobId)) {
            newBookmarked.delete(jobId);
            toast.success('Job removed from bookmarks');
        } else {
            newBookmarked.add(jobId);
            toast.success('Job bookmarked');
        }
        setBookmarkedJobs(newBookmarked);
    };

    const getUniqueLocations = () => {
        const locations = jobs.map(job => job.location);
        return [...new Set(locations)];
    };

    const getUniqueJobTypes = () => {
        const jobTypes = jobs.map(job => job.job_type).filter(Boolean);
        return [...new Set(jobTypes)];
    };

    return (
        <div className="min-h-screen bg-background">
            <AppNavigation items={navigationItems} title="Browse Jobs" />

            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Browse Jobs</h2>
                        <p className="text-muted-foreground">
                            Discover your next career opportunity
                        </p>
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
                                Available positions
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
                                Companies
                            </CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Set(jobs.map(job => job.company)).size}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Hiring companies
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Bookmarked
                            </CardTitle>
                            <Bookmark className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{bookmarkedJobs.size}</div>
                            <p className="text-xs text-muted-foreground">
                                Jobs saved
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Authentication Banner for Unauthenticated Users */}
                {!user && (
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LogIn className="h-5 w-5" />
                                Ready to Apply?
                            </CardTitle>
                            <CardDescription>
                                Sign in to apply for jobs and save your favorites
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button onClick={() => router.push('/auth/signin')} className="flex-1 sm:flex-none">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Sign in as Candidate
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/recruiters/auth/signin')}
                                    className="flex-1 sm:flex-none"
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Sign in as Recruiter
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Locations</SelectItem>
                                {getUniqueLocations().map(location => (
                                    <SelectItem key={location} value={location.toLowerCase()}>
                                        {location}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Job Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {getUniqueJobTypes().map(jobType => (
                                    <SelectItem key={jobType} value={jobType || ''}>
                                        {jobType}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="created_at">Latest</SelectItem>
                                <SelectItem value="title">Title</SelectItem>
                                <SelectItem value="company">Company</SelectItem>
                                <SelectItem value="salary">Salary</SelectItem>
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
                                    Please wait while we fetch available positions
                                </p>
                            </CardContent>
                        </Card>
                    ) : filteredJobs.length === 0 ? (
                        <Card className="text-center p-8">
                            <CardContent>
                                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchTerm || statusFilter !== 'active' || locationFilter !== 'all' || jobTypeFilter !== 'all'
                                        ? 'Try adjusting your filters or search terms'
                                        : 'Check back later for new opportunities'
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredJobs.map((job) => (
                            <Card key={job.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center space-x-2">
                                                <CardTitle
                                                    className="text-xl cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => handleViewJob(job)}
                                                >
                                                    {job.title}
                                                </CardTitle>
                                                {getStatusBadge(job.status)}
                                            </div>
                                            <div className="flex items-center space-x-2 text-base text-muted-foreground">
                                                <Building className="h-4 w-4" />
                                                <span>{job.company}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleBookmark(job.id)}
                                                className={bookmarkedJobs.has(job.id) ? 'text-primary' : ''}
                                            >
                                                {bookmarkedJobs.has(job.id) ?
                                                    <BookmarkCheck className="h-4 w-4" /> :
                                                    <Bookmark className="h-4 w-4" />
                                                }
                                            </Button>
                                            <Button onClick={() => handleViewJob(job)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </Button>
                                        </div>
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
                                            <span>{job.interview_duration} interview</span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {job.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {job.skills.slice(0, 4).map((skill) => (
                                            <Badge key={skill} variant="secondary" className="text-xs">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {job.skills.length > 4 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{job.skills.length - 4} more
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Posted: {formatDate(job.created_at)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4" />
                                            <span>{job.applications_count} applications</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
