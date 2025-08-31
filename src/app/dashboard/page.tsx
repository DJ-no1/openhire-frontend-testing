'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthLoading } from '@/hooks/useAuthLoading';
import {
    useCandidateStats,
    useCandidateApplications,
    useRecommendedJobs,
    useProfileCompletion,
    formatApplicationStatus,
    formatTimeAgo,
    formatJobMatch
} from '@/hooks/useDashboardData';
import {
    CandidateStatsSkeleton,
    RecentApplicationsSkeleton,
    RecommendedJobsSkeleton,
    ProfileCompletionSkeleton,
    DashboardErrorState,
    EmptyApplicationsState,
    EmptyJobsState
} from '@/components/ui/dashboard-skeleton';
import {
    Search,
    FileText,
    Calendar,
    Briefcase,
    Upload,
    Star,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

export default function CandidateDashboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { isLoading: authLoading } = useAuthLoading();

    // Fetch dynamic data
    const { data: stats, loading: statsLoading, error: statsError } = useCandidateStats();
    const { data: applications, loading: applicationsLoading, error: applicationsError } = useCandidateApplications(4);
    const { data: recommendedJobs, loading: jobsLoading, error: jobsError } = useRecommendedJobs(3);
    const { completion } = useProfileCompletion();

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <CandidateStatsSkeleton />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <RecentApplicationsSkeleton />
                        <RecommendedJobsSkeleton />
                    </div>
                    <ProfileCompletionSkeleton />
                </div>
            </div>
        );
    }

    // Format stats for display
    const formatStats = (stats: any) => [
        {
            title: 'Applications Sent',
            value: stats?.applications_sent?.toString() || '0',
            description: `${stats?.applications_this_week || 0} this week`,
            icon: <FileText className="h-8 w-8 text-blue-600" />,
            trend: stats?.applications_this_week > 0 ? '+25%' : '0%'
        },
        {
            title: 'Interview Invites',
            value: stats?.interview_invites?.toString() || '0',
            description: `${stats?.pending_interviews || 0} pending`,
            icon: <Calendar className="h-8 w-8 text-green-600" />,
            trend: stats?.interview_invites > 0 ? '+50%' : '0%'
        },
        {
            title: 'Profile Views',
            value: stats?.profile_views?.toString() || '0',
            description: 'This month',
            icon: <Star className="h-8 w-8 text-purple-600" />,
            trend: '+12%'
        },
        {
            title: 'Jobs Saved',
            value: stats?.jobs_saved?.toString() || '0',
            description: `${stats?.new_job_matches || 0} new matches`,
            icon: <Briefcase className="h-8 w-8 text-orange-600" />,
            trend: '+8%'
        },
    ];

    // Icon mapping function
    const getStatusIcon = (status: string) => {
        const statusConfig = formatApplicationStatus(status);
        switch (statusConfig.icon) {
            case 'Calendar':
                return <Calendar className="h-4 w-4 text-green-600" />;
            case 'Clock':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'CheckCircle':
                return <CheckCircle className="h-4 w-4 text-blue-600" />;
            case 'XCircle':
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-600" />;
        }
    };
    return (
        <ProtectedRoute requiredRole="candidate">
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Job Seeker'}!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Track your applications and discover new opportunities.
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8">
                        <div className="flex flex-wrap gap-4">
                            <Button
                                className="flex items-center space-x-2"
                                onClick={() => router.push('/dashboard/jobs')}
                            >
                                <Search className="h-4 w-4" />
                                <span>Browse Jobs</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center space-x-2"
                                onClick={() => router.push('/dashboard/resume')}
                            >
                                <Upload className="h-4 w-4" />
                                <span>Upload Resume</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center space-x-2"
                                onClick={() => router.push('/dashboard/alerts')}
                            >
                                <AlertCircle className="h-4 w-4" />
                                <span>Job Alerts</span>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {statsLoading ? (
                        <CandidateStatsSkeleton />
                    ) : statsError ? (
                        <DashboardErrorState error={statsError} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {formatStats(stats).map((stat, index) => (
                                <Card key={index}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    {stat.title}
                                                </p>
                                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                                    {stat.value}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {stat.description}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {stat.icon}
                                                <span className="text-sm font-medium text-green-600 mt-2">
                                                    {stat.trend}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Applications */}
                        {applicationsLoading ? (
                            <RecentApplicationsSkeleton />
                        ) : applicationsError ? (
                            <DashboardErrorState error={applicationsError} />
                        ) : applications && applications.length > 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Applications</CardTitle>
                                    <CardDescription>
                                        Track the status of your job applications
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {applications.map((application) => {
                                            const statusConfig = formatApplicationStatus(application.status);
                                            return (
                                                <div key={application.id} className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <div className="flex-shrink-0">
                                                        {getStatusIcon(application.status)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {application.job.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {application.job.company_name}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                            Applied {formatTimeAgo(application.created_at)}
                                                        </p>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <Badge className={statusConfig.color}>
                                                            {statusConfig.label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => router.push(`/dashboard/application/candidate/${user?.id}`)}
                                        >
                                            View All Applications
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <EmptyApplicationsState />
                        )}

                        {/* Recommended Jobs */}
                        {jobsLoading ? (
                            <RecommendedJobsSkeleton />
                        ) : jobsError ? (
                            <DashboardErrorState error={jobsError} />
                        ) : recommendedJobs && recommendedJobs.length > 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recommended for You</CardTitle>
                                    <CardDescription>
                                        Jobs that match your skills and preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recommendedJobs.map((job) => (
                                            <div key={job.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {job.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {job.company_name}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                                        {formatJobMatch(job.match_percentage)} match
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
                                                    <span>{job.location || 'Location not specified'}</span>
                                                    <span>{job.salary || 'Salary not specified'}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-3">
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                        Posted {formatTimeAgo(job.created_at)}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => router.push(`/jobs/${job.id}`)}
                                                    >
                                                        Apply Now
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => router.push('/dashboard/jobs')}
                                        >
                                            See More Jobs
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <EmptyJobsState />
                        )}
                    </div>

                    {/* Profile Completion */}

                </div>
            </div>
        </ProtectedRoute>
    );
}
