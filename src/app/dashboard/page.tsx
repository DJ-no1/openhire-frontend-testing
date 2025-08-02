'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AppNavigation } from '@/components/app-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
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

const navigationItems = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <Briefcase className="h-4 w-4" />
    },
    {
        label: 'Browse Jobs',
        href: '/dashboard/jobs',
        icon: <Search className="h-4 w-4" />
    },
    {
        label: 'Applications',
        href: '/dashboard/application',
        icon: <FileText className="h-4 w-4" />
    },
    {
        label: 'Interviews',
        href: '/dashboard/interviews',
        icon: <Calendar className="h-4 w-4" />
    },
];

export default function CandidateDashboardPage() {
    const { user } = useAuth();

    const stats = [
        {
            title: 'Applications Sent',
            value: '8',
            description: '2 this week',
            icon: <FileText className="h-8 w-8 text-blue-600" />,
            trend: '+25%'
        },
        {
            title: 'Interview Invites',
            value: '3',
            description: '1 pending',
            icon: <Calendar className="h-8 w-8 text-green-600" />,
            trend: '+50%'
        },
        {
            title: 'Profile Views',
            value: '24',
            description: 'This month',
            icon: <Star className="h-8 w-8 text-purple-600" />,
            trend: '+12%'
        },
        {
            title: 'Jobs Saved',
            value: '12',
            description: '4 new matches',
            icon: <Briefcase className="h-8 w-8 text-orange-600" />,
            trend: '+8%'
        },
    ];

    const recentApplications = [
        {
            company: 'TechCorp Inc.',
            position: 'Senior Frontend Developer',
            status: 'Interview Scheduled',
            statusColor: 'bg-green-100 text-green-800',
            appliedDate: '2 days ago',
            icon: <Calendar className="h-4 w-4 text-green-600" />
        },
        {
            company: 'StartupXYZ',
            position: 'Full Stack Developer',
            status: 'Under Review',
            statusColor: 'bg-yellow-100 text-yellow-800',
            appliedDate: '5 days ago',
            icon: <Clock className="h-4 w-4 text-yellow-600" />
        },
        {
            company: 'Innovation Labs',
            position: 'React Developer',
            status: 'Application Sent',
            statusColor: 'bg-blue-100 text-blue-800',
            appliedDate: '1 week ago',
            icon: <CheckCircle className="h-4 w-4 text-blue-600" />
        },
        {
            company: 'Digital Solutions',
            position: 'UI/UX Developer',
            status: 'Not Selected',
            statusColor: 'bg-red-100 text-red-800',
            appliedDate: '2 weeks ago',
            icon: <XCircle className="h-4 w-4 text-red-600" />
        },
    ];

    const recommendedJobs = [
        {
            company: 'MegaCorp',
            position: 'Senior React Developer',
            location: 'Remote',
            salary: '$80k - $120k',
            posted: '2 days ago',
            match: '95%'
        },
        {
            company: 'CloudTech',
            position: 'Frontend Engineer',
            location: 'San Francisco, CA',
            salary: '$90k - $130k',
            posted: '4 days ago',
            match: '88%'
        },
        {
            company: 'WebFlow Inc.',
            position: 'JavaScript Developer',
            location: 'New York, NY',
            salary: '$70k - $100k',
            posted: '1 week ago',
            match: '82%'
        },
    ];

    return (
        <ProtectedRoute requiredRole="candidate">
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <AppNavigation
                    items={navigationItems}
                    title="OpenHire"
                    subtitle="Job Search Dashboard"
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Welcome back, {user?.name || 'Job Seeker'}!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Track your applications and discover new opportunities.
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8">
                        <div className="flex flex-wrap gap-4">
                            <Button className="flex items-center space-x-2">
                                <Search className="h-4 w-4" />
                                <span>Browse Jobs</span>
                            </Button>
                            <Button variant="outline" className="flex items-center space-x-2">
                                <Upload className="h-4 w-4" />
                                <span>Upload Resume</span>
                            </Button>
                            <Button variant="outline" className="flex items-center space-x-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>Job Alerts</span>
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
                        {/* Recent Applications */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Applications</CardTitle>
                                <CardDescription>
                                    Track the status of your job applications
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentApplications.map((application, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex-shrink-0">
                                                {application.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {application.position}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {application.company}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    Applied {application.appliedDate}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <Badge className={application.statusColor}>
                                                    {application.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <Button variant="outline" className="w-full">
                                        View All Applications
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recommended Jobs */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recommended for You</CardTitle>
                                <CardDescription>
                                    Jobs that match your skills and preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recommendedJobs.map((job, index) => (
                                        <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {job.position}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {job.company}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="text-green-600 border-green-600">
                                                    {job.match} match
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
                                                <span>{job.location}</span>
                                                <span>{job.salary}</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    Posted {job.posted}
                                                </span>
                                                <Button size="sm" variant="outline">
                                                    Apply Now
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <Button variant="outline" className="w-full">
                                        See More Jobs
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Profile Completion */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Complete Your Profile</CardTitle>
                            <CardDescription>
                                A complete profile helps you get noticed by recruiters
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">Profile Completion</span>
                                    <span className="font-medium">75%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Basic Info</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Resume Uploaded</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Skills & Experience</span>
                                    </div>
                                </div>
                                <Button className="mt-4">
                                    Complete Profile
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
