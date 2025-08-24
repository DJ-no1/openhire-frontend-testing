'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { AppNavigation } from '@/components/app-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
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

    // Convert API job format to local job format
    const convertApiJobToLocal = (apiJob: JobType): Job => {
        return {
            ...apiJob,
            salary: apiJob.salary || '',
            skills: apiJob.skills ? apiJob.skills.split(', ') : [],
            applications_count: apiJob.applications_count || 0,
            company: 'Company Name', // Default since not in API response
            location: 'Remote', // Default since not in API response
            job_type: apiJob.job_type || 'Full-time'
        };
    };

    // Function to fetch all active jobs
    const fetchJobs = async () => {
        setLoading(true);
        try {
            // For now, we'll use mock data since we need to implement a public jobs endpoint
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
                    description: 'We are looking for a Senior Software Engineer to join our growing team...',
                    job_type: 'Full-time',
                    job_link: '/j/kLkO5h5u'
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
                    description: 'Join our product team and help shape the future of our platform...',
                    job_type: 'Full-time',
                    job_link: '/j/XrHktm64'
                },
                {
                    id: '3',
                    title: 'Frontend Developer',
                    company: 'Design Studios',
                    location: 'Hybrid',
                    salary: '$80,000 - $100,000',
                    skills: ['Vue.js', 'CSS', 'JavaScript'],
                    status: 'active' as const,
                    created_at: '2025-07-10',
                    end_date: '2025-07-30',
                    applications_count: 5,
                    interview_duration: '30 min',
                    description: 'We need a talented frontend developer to create beautiful user interfaces...',
                    job_type: 'Contract',
                    job_link: '/j/RR-6Ko_v'
                },
                {
                    id: '4',
                    title: 'Data Scientist',
                    company: 'AI Innovations',
                    location: 'New York, NY',
                    salary: '$110,000 - $140,000',
                    skills: ['Python', 'Machine Learning', 'SQL'],
                    status: 'active' as const,
                    created_at: '2025-07-25',
                    end_date: '2025-08-25',
                    applications_count: 15,
                    interview_duration: '45 min',
                    description: 'Help us build the next generation of AI-powered products...',
                    job_type: 'Full-time',
                    job_link: '/j/DESIGN99'
                }
            ];

            setJobs(mockJobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to load jobs');
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
        <ProtectedRoute>
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
        </ProtectedRoute>
    );
}
