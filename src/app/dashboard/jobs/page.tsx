'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResumeUploadAnalyzer } from '@/components/resume-upload-analyzer';
import { AppNavigation } from '@/components/app-navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/use-auth';
import { jobService, Job as JobType, getJobUrl } from '@/lib/job-service';
import { toast } from 'sonner';
import {
    Briefcase,
    Search,
    Filter,
    Calendar,
    MapPin,
    DollarSign,
    Clock,
    Eye,
    Send,
    Loader2,
    Building,
    CheckCircle,
    XCircle,
    AlertCircle,
    Bookmark,
    BookmarkCheck,
    Star,
    FileText,
    TrendingUp
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
    applications_count?: number;
    interview_duration?: number;
    description: any;
    job_type?: string;
    recruiter_id?: string;
    job_link?: string;
}



export default function CandidateDashboardJobsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState<string>('all');
    const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('created_at');
    const [loading, setLoading] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [applyModalOpen, setApplyModalOpen] = useState(false);
    const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());

    // Convert API job format to local job format
    const convertApiJobToLocal = (apiJob: JobType): Job => {
        return {
            id: apiJob.id,
            title: apiJob.title,
            company_name: (apiJob as any).company_name || 'Company Not Specified',
            location: (apiJob as any).location || 'Location Not Specified',
            salary: apiJob.salary || undefined,
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

    // Function to fetch all active jobs
    const fetchJobs = async () => {
        setLoading(true);
        try {
            const fetchedJobs = await jobService.getAllJobs();
            // Filter only active jobs for candidates
            const activeJobs = fetchedJobs.filter(job => (job as any).status === 'active');
            const convertedJobs = activeJobs.map(convertApiJobToLocal);

            setJobs(convertedJobs);
            toast.success(`Found ${convertedJobs.length} available positions`);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to load available jobs');
            setJobs([]);
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
                job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.skills.toLowerCase().includes(searchTerm.toLowerCase())
            );
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
                    return a.company_name.localeCompare(b.company_name);
                case 'end_date':
                    return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
                default:
                    return 0;
            }
        });

        setFilteredJobs(result);
    }, [jobs, searchTerm, locationFilter, jobTypeFilter, sortBy]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const handleApply = (job: Job) => {
        // Convert job to match ResumeUploadAnalyzer expected format
        const jobForModal = {
            ...job,
            description: typeof job.description === 'string' ? job.description : JSON.stringify(job.description)
        } as any;
        setSelectedJob(jobForModal);
        setApplyModalOpen(true);
    };

    const toggleBookmark = (jobId: string) => {
        const newBookmarked = new Set(bookmarkedJobs);
        if (newBookmarked.has(jobId)) {
            newBookmarked.delete(jobId);
            toast.success('Job removed from bookmarks');
        } else {
            newBookmarked.add(jobId);
            toast.success('Job bookmarked!');
        }
        setBookmarkedJobs(newBookmarked);
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

    // Get unique locations and job types for filters
    const uniqueLocations = [...new Set(jobs.map(job => job.location))].filter(Boolean);
    const uniqueJobTypes = [...new Set(jobs.map(job => job.job_type))].filter(Boolean);

    return (
        <ProtectedRoute requiredRole="candidate">


            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between space-y-2 mb-6">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Find Your Next Opportunity</h2>
                            <p className="text-muted-foreground">
                                Discover amazing job opportunities and apply with AI-powered matching
                            </p>
                        </div>
                        <Badge variant="outline" className="text-sm">
                            {jobs.length} open positions
                        </Badge>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Available Jobs
                                </CardTitle>
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{jobs.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Active job postings
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Companies Hiring
                                </CardTitle>
                                <Building className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {new Set(jobs.map(job => job.company_name)).size}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Unique employers
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Remote Jobs
                                </CardTitle>
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {jobs.filter(job => job.location.toLowerCase().includes('remote')).length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Work from anywhere
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
                                    Saved for later
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
                            <Select value={locationFilter} onValueChange={setLocationFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Location" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Locations</SelectItem>
                                    {uniqueLocations.map(location => (
                                        <SelectItem key={location} value={location}>
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
                                    {uniqueJobTypes.filter(type => type).map(type => (
                                        <SelectItem key={type} value={type!}>
                                            {type}
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
                                    <SelectItem value="end_date">Deadline</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Jobs Grid */}
                    <div className="grid gap-4">
                        {loading ? (
                            <Card className="text-center p-8">
                                <CardContent>
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Finding great opportunities...</h3>
                                    <p className="text-muted-foreground">
                                        Please wait while we load available jobs
                                    </p>
                                </CardContent>
                            </Card>
                        ) : filteredJobs.length === 0 ? (
                            <Card className="text-center p-8">
                                <CardContent>
                                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        {jobs.length === 0 ? 'No jobs available right now' : 'No jobs match your criteria'}
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        {jobs.length === 0
                                            ? 'Check back later for new opportunities'
                                            : 'Try adjusting your filters or search terms'
                                        }
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {filteredJobs.map((job) => (
                                    <Card key={job.id} className="group hover:shadow-lg transition-all duration-200 hover:border-blue-200">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle
                                                        className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2"
                                                        onClick={() => router.push(getJobUrl(job))}
                                                    >
                                                        {job.title}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                        <Building className="h-4 w-4" />
                                                        <span>{job.company_name}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleBookmark(job.id)}
                                                    className="p-2"
                                                >
                                                    {bookmarkedJobs.has(job.id) ? (
                                                        <BookmarkCheck className="h-4 w-4 text-blue-600" />
                                                    ) : (
                                                        <Bookmark className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span>{job.location}</span>
                                                </div>

                                                {job.salary && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <DollarSign className="h-4 w-4 text-green-600" />
                                                        <span className="text-green-700 font-medium">{job.salary}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Apply by: {formatDate(job.end_date)}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Posted: {formatDate(job.created_at)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${getJobTypeColor(job.job_type || '')}`}
                                                >
                                                    {job.job_type || 'Full-time'}
                                                </Badge>
                                                {job.interview_duration && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {job.interview_duration}min interview
                                                    </Badge>
                                                )}
                                            </div>

                                            {job.skills && (
                                                <div className="flex flex-wrap gap-1">
                                                    {job.skills.split(',').slice(0, 3).map((skill, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {skill.trim()}
                                                        </Badge>
                                                    ))}
                                                    {job.skills.split(',').length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{job.skills.split(',').length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => router.push(getJobUrl(job))}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="flex-1 bg-black hover:bg-gray-500"
                                                    onClick={() => handleApply(job)}
                                                >
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Apply Now
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Job Application Modal */}
                    <ResumeUploadAnalyzer
                        job={selectedJob as any}
                        open={applyModalOpen}
                        onOpenChange={setApplyModalOpen}
                        candidateId={user?.id}
                    />
                </div>
            </div>
        </ProtectedRoute>
    );
}
