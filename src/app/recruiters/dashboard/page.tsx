'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AppNavigation } from '@/components/app-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateJobModal } from '@/components/create-job-modal';
import { useAuth } from '@/hooks/use-auth';
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
    const router = useRouter();
    const [createJobModalOpen, setCreateJobModalOpen] = useState(false);

    const handleJobCreated = () => {
        // Refresh the page or update data when a job is created
        window.location.reload();
    };

    const stats = [
        {
            title: 'Active Jobs',
            value: '12',
            description: '3 new this week',
            icon: <Briefcase className="h-8 w-8 text-blue-600" />,
            trend: '+12%'
        },
        {
            title: 'Total Applications',
            value: '142',
            description: '18 pending review',
            icon: <FileText className="h-8 w-8 text-green-600" />,
            trend: '+8%'
        },
        {
            title: 'Interviews Scheduled',
            value: '24',
            description: '5 this week',
            icon: <Calendar className="h-8 w-8 text-purple-600" />,
            trend: '+15%'
        },
        {
            title: 'Candidates Hired',
            value: '8',
            description: '2 this month',
            icon: <UserPlus className="h-8 w-8 text-orange-600" />,
            trend: '+25%'
        },
    ];

    const recentActivity = [
        {
            action: 'New application received',
            candidate: 'John Doe',
            job: 'Senior Frontend Developer',
            time: '2 hours ago'
        },
        {
            action: 'Interview completed',
            candidate: 'Jane Smith',
            job: 'UX Designer',
            time: '4 hours ago'
        },
        {
            action: 'Job posted',
            candidate: '',
            job: 'Full Stack Developer',
            time: '1 day ago'
        },
        {
            action: 'Candidate hired',
            candidate: 'Mike Johnson',
            job: 'Backend Developer',
            time: '2 days ago'
        },
    ];

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
                            Welcome back, {user?.name || 'Recruiter'}!
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => (
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

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    Latest updates from your recruitment process
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentActivity.map((activity, index) => (
                                        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {activity.action}
                                                    {activity.candidate && (
                                                        <span className="text-blue-600 dark:text-blue-400">
                                                            {' '}for {activity.candidate}
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {activity.job}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
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
                                            <span className="font-medium">78%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">Interview to Hire Rate</span>
                                            <span className="font-medium">32%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div className="bg-green-600 h-2 rounded-full" style={{ width: '32%' }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">Time to Hire (avg)</span>
                                            <span className="font-medium">14 days</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">Job Fill Rate</span>
                                            <span className="font-medium">85%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
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
