'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AppNavigation } from '@/components/app-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateJobModal } from '@/components/create-job-modal';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthLoading } from '@/hooks/useAuthLoading';
import {
    useRecruiterStats,
    useRecruiterActivity,
    useRecruiterPerformance,
    formatTimeAgo,
    getActivityIcon,
    formatActivityDescription
} from '@/hooks/useDashboardData';
import {
    RecruiterStatsSkeleton,
    RecentActivitySkeleton,
    PerformanceOverviewSkeleton,
    DashboardErrorState
} from '@/components/ui/dashboard-skeleton';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    Briefcase,
    Users,
    FileText,
    PlusCircle,
    BarChart3,
    Calendar,
    UserPlus
} from 'lucide-react';

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

export default function RecruiterDashboardPage() {
    const { user } = useAuth();
    const { isLoading: authLoading } = useAuthLoading();
    const router = useRouter();
    const [createJobModalOpen, setCreateJobModalOpen] = useState(false);

    // Fetch dynamic data
    const { data: stats, loading: statsLoading, error: statsError } = useRecruiterStats();
    const { data: activity, loading: activityLoading, error: activityError } = useRecruiterActivity(4);
    const { data: performance, loading: performanceLoading, error: performanceError } = useRecruiterPerformance();

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <AppNavigation
                    items={navigationItems}
                    title="OpenHire"
                    subtitle="Recruiter Dashboard"
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <RecruiterStatsSkeleton />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <RecentActivitySkeleton />
                        <PerformanceOverviewSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    const handleJobCreated = () => {
        // Refresh the page or update data when a job is created
        window.location.reload();
    };

    // Format stats for display
    const formatStats = (stats: any) => [
        {
            title: 'Active Jobs',
            value: stats?.active_jobs?.toString() || '0',
            description: `${stats?.new_jobs_this_week || 0} new this week`,
            icon: <Briefcase className="h-8 w-8 text-blue-600" />,
            trend: stats?.new_jobs_this_week > 0 ? '+12%' : '0%'
        },
        {
            title: 'Total Applications',
            value: stats?.total_applications?.toString() || '0',
            description: `${stats?.pending_applications || 0} pending review`,
            icon: <FileText className="h-8 w-8 text-green-600" />,
            trend: '+8%'
        },
        {
            title: 'Interviews Scheduled',
            value: stats?.interviews_scheduled?.toString() || '0',
            description: `${stats?.interviews_this_week || 0} this week`,
            icon: <Calendar className="h-8 w-8 text-purple-600" />,
            trend: '+15%'
        },
        {
            title: 'Candidates Hired',
            value: stats?.candidates_hired?.toString() || '0',
            description: `${stats?.hires_this_month || 0} this month`,
            icon: <UserPlus className="h-8 w-8 text-orange-600" />,
            trend: '+25%'
        },
    ];

    // Activity icon mapping
    const getActivityIconComponent = (type: string) => {
        switch (type) {
            case 'new_application':
                return <FileText className="h-4 w-4" />;
            case 'interview_completed':
                return <Calendar className="h-4 w-4" />;
            case 'job_posted':
                return <Briefcase className="h-4 w-4" />;
            case 'candidate_hired':
                return <UserPlus className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };
    return (
        <ProtectedRoute requiredRole="recruiter">
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <AppNavigation
                    items={navigationItems}
                    title="OpenHire"
                    subtitle="Recruiter Dashboard"
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Recruiter'}!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Here's what's happening with your recruitment today.
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8">
                        <div className="flex flex-wrap gap-4">
                            <Button
                                className="flex items-center space-x-2"
                                onClick={() => setCreateJobModalOpen(true)}
                            >
                                <PlusCircle className="h-4 w-4" />
                                <span>Post New Job</span>
                            </Button>
                            <Button variant="outline" className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span>Review Applications</span>
                            </Button>
                            <Button variant="outline" className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Schedule Interview</span>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {statsLoading ? (
                        <RecruiterStatsSkeleton />
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
                        {/* Recent Activity */}
                        {activityLoading ? (
                            <RecentActivitySkeleton />
                        ) : activityError ? (
                            <DashboardErrorState error={activityError} />
                        ) : activity && activity.length > 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>
                                        Latest updates from your recruitment process
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {activity.map((activityItem) => (
                                            <div key={activityItem.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {formatActivityDescription(activityItem)}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {activityItem.job_title}
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                        {formatTimeAgo(activityItem.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="text-gray-400 mb-4">
                                        <FileText className="h-12 w-12 mx-auto" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No recent activity
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Start posting jobs and reviewing applications to see activity here.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Performance Overview */}
                        {performanceLoading ? (
                            <PerformanceOverviewSkeleton />
                        ) : performanceError ? (
                            <DashboardErrorState error={performanceError} />
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Overview</CardTitle>
                                    <CardDescription>
                                        Your recruitment metrics this month
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600 dark:text-gray-400">Application Response Rate</span>
                                                <span className="font-medium">{performance?.application_response_rate || 0}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${performance?.application_response_rate || 0}%` }}></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600 dark:text-gray-400">Interview to Hire Rate</span>
                                                <span className="font-medium">{performance?.interview_to_hire_rate || 0}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${performance?.interview_to_hire_rate || 0}%` }}></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600 dark:text-gray-400">Time to Hire (avg)</span>
                                                <span className="font-medium">{performance?.avg_time_to_hire || 0} days</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600 dark:text-gray-400">Job Fill Rate</span>
                                                <span className="font-medium">{performance?.job_fill_rate || 0}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${performance?.job_fill_rate || 0}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
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
