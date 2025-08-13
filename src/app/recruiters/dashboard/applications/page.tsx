'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { AppNavigation } from '@/components/app-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { DatabaseService, type DatabaseApplication, type DatabaseUserResume, type DatabaseJob, type DatabaseUser } from '@/lib/database';
import { jobService } from '@/lib/job-service';
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
    BarChart3,
    ArrowRight,
    User
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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

interface ApplicationWithDetails extends DatabaseApplication {
    user_resume: DatabaseUserResume[];
    job?: DatabaseJob;
    candidate?: DatabaseUser;
}

interface JobOption {
    id: string;
    title: string;
    company_name?: string;
}

export default function ApplicationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
    const [filteredApplications, setFilteredApplications] = useState<ApplicationWithDetails[]>([]);
    const [jobs, setJobs] = useState<JobOption[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJobId, setSelectedJobId] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [loadingJobs, setLoadingJobs] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchJobs();
            fetchAllApplications(); // Fetch all applications by default
        }
    }, [user]);

    useEffect(() => {
        fetchApplications();
    }, [selectedJobId]);

    useEffect(() => {
        filterApplications();
    }, [applications, searchTerm, statusFilter]);

    const fetchJobs = async () => {
        if (!user?.id) return;

        setLoadingJobs(true);
        try {
            const jobsData = await jobService.getRecruiterJobs(user.id);
            setJobs(jobsData.map((job: any) => ({
                id: job.id,
                title: job.title,
                company_name: job.company_name
            })));
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to load jobs');
        } finally {
            setLoadingJobs(false);
        }
    };

    const fetchAllApplications = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const applicationsData = await DatabaseService.getApplicationsForRecruiter(user.id);
            setApplications(applicationsData);
        } catch (error) {
            console.error('Error fetching all applications:', error);
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            if (selectedJobId && selectedJobId !== 'all') {
                // Fetch applications for specific job
                const applicationsData = await DatabaseService.getApplicationsForJob(selectedJobId);
                setApplications(applicationsData);
            } else {
                // Fetch all applications for the recruiter
                const applicationsData = await DatabaseService.getApplicationsForRecruiter(user.id);
                setApplications(applicationsData);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    }; const filterApplications = () => {
        let filtered = applications;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(app =>
                app.candidate?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.candidate?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter);
        }

        setFilteredApplications(filtered);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
            reviewed: { label: 'Reviewed', variant: 'default' as const, icon: CheckCircle },
            'in-progress': { label: 'In Progress', variant: 'default' as const, icon: AlertCircle },
            rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
            accepted: { label: 'Accepted', variant: 'default' as const, icon: CheckCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || {
            label: status,
            variant: 'secondary' as const,
            icon: AlertCircle
        };

        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getInterviewStatusBadge = (application: ApplicationWithDetails) => {
        // This is a placeholder for interview status
        // You can implement actual interview status logic based on your interview table
        const hasInterview = Math.random() > 0.5; // Random for demo

        if (hasInterview) {
            return (
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                    In Progress
                </Badge>
            );
        } else {
            return (
                <Badge variant="secondary">
                    Not Started
                </Badge>
            );
        }
    };

    const getMatchScore = (application: ApplicationWithDetails) => {
        const resume = application.user_resume?.[0];
        if (resume?.score) {
            return `${resume.score}%`;
        }
        return `${Math.floor(Math.random() * 40 + 40)}%`; // Random score for demo
    };

    const getScoreColor = (score: string) => {
        const numScore = parseInt(score);
        if (numScore >= 70) return 'text-green-600 bg-green-100';
        if (numScore >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleViewDetails = (applicationId: string) => {
        // Navigate to application details page
        router.push(`/recruiters/dashboard/applications/${applicationId}`);
    };

    const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
        try {
            await DatabaseService.updateApplicationStatus(applicationId, newStatus);
            toast.success('Application status updated');
            fetchApplications(); // Refresh data
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update application status');
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <AppNavigation items={navigationItems} title="Job Applications" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
                        <p className="text-gray-600 mt-2">Manage and review submitted applications</p>
                    </div>

                    {/* Filter Applications Section */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filter Applications
                            </CardTitle>
                            <CardDescription>
                                Filter applications by job or view all applications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Job
                                    </label>
                                    <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Applications" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Applications</SelectItem>
                                            {loadingJobs ? (
                                                <SelectItem value="loading" disabled>
                                                    Loading jobs...
                                                </SelectItem>
                                            ) : jobs.length === 0 ? (
                                                <SelectItem value="no-jobs" disabled>
                                                    No jobs found
                                                </SelectItem>
                                            ) : (
                                                jobs.map((job) => (
                                                    <SelectItem key={job.id} value={job.id}>
                                                        {job.title} {job.company_name && `- ${job.company_name}`}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Search applications..."
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
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="reviewed">Reviewed</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                            <SelectItem value="accepted">Accepted</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Applications Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Applications</CardTitle>
                                    <CardDescription>
                                        {selectedJobId && selectedJobId !== 'all' ? (
                                            `${filteredApplications.length} application(s) for selected job`
                                        ) : (
                                            `${filteredApplications.length} total application(s)`
                                        )}
                                    </CardDescription>
                                </div>
                                {filteredApplications.length > 0 && (
                                    <Badge variant="secondary">
                                        Page 1 of 1
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                    <span className="ml-3 text-gray-600">Loading applications...</span>
                                </div>
                            ) : filteredApplications.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                                    <p className="text-gray-600">
                                        {selectedJobId && selectedJobId !== 'all'
                                            ? "No applications have been submitted for this job yet."
                                            : "No applications have been submitted yet."
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Job Position</TableHead>
                                                <TableHead>Candidate</TableHead>
                                                <TableHead>Match Score</TableHead>
                                                <TableHead>Interview Status</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Applied Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredApplications.map((application) => (
                                                <TableRow key={application.id} className="hover:bg-gray-50">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                                <Briefcase className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {application.job?.title || 'Senior AI engineer'}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {application.job?.company_name || 'Unknown Company'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                            <span className="text-gray-900">
                                                                {application.candidate?.name || 'Anonymous'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={`${getScoreColor(getMatchScore(application))}`}>
                                                            {getMatchScore(application)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getInterviewStatusBadge(application)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(application.status)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-gray-600">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(application.created_at)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center gap-2 justify-end">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleViewDetails(application.id)}
                                                                className="flex items-center gap-1"
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                                View Details
                                                                <ArrowRight className="h-3 w-3" />
                                                            </Button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, 'reviewed')}>
                                                                        Mark as Reviewed
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, 'in-progress')}>
                                                                        Move to In Progress
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, 'accepted')}>
                                                                        Accept Application
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, 'rejected')}>
                                                                        Reject Application
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination Info */}
                                    <div className="flex items-center justify-center mt-6 text-sm text-gray-600">
                                        <span>Page 1 of 1</span>
                                        <Badge variant="outline" className="ml-2">
                                            {filteredApplications.length}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
