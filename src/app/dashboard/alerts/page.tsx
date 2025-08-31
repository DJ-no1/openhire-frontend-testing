'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, BellOff, Plus, X, MapPin, Briefcase, DollarSign } from 'lucide-react';

export default function JobAlertsPage() {
    const router = useRouter();
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [pushAlerts, setPushAlerts] = useState(false);

    // Mock job alerts data
    const [jobAlerts] = useState([
        {
            id: 1,
            title: 'Frontend Developer',
            location: 'Remote',
            salary: '$80k - $120k',
            keywords: ['React', 'TypeScript', 'Next.js'],
            active: true,
            created: '2 days ago'
        },
        {
            id: 2,
            title: 'Full Stack Engineer',
            location: 'San Francisco, CA',
            salary: '$100k - $150k',
            keywords: ['Node.js', 'React', 'PostgreSQL'],
            active: true,
            created: '1 week ago'
        }
    ]);

    return (
        <ProtectedRoute requiredRole="candidate">
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            className="mb-4"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Job Alerts
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Set up alerts to get notified about new job opportunities that match your criteria.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Notification Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Bell className="h-5 w-5 mr-2" />
                                    Notification Settings
                                </CardTitle>
                                <CardDescription>
                                    Choose how you want to receive job alerts
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="email-alerts" className="text-sm font-medium">
                                            Email Alerts
                                        </Label>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Receive job alerts via email
                                        </p>
                                    </div>
                                    <Switch
                                        id="email-alerts"
                                        checked={emailAlerts}
                                        onCheckedChange={setEmailAlerts}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="push-alerts" className="text-sm font-medium">
                                            Push Notifications
                                        </Label>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Receive instant push notifications
                                        </p>
                                    </div>
                                    <Switch
                                        id="push-alerts"
                                        checked={pushAlerts}
                                        onCheckedChange={setPushAlerts}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Create New Alert */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Create New Alert
                                </CardTitle>
                                <CardDescription>
                                    Set up a new job alert based on your preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="job-title">Job Title</Label>
                                        <Input id="job-title" placeholder="e.g. Frontend Developer" />
                                    </div>
                                    <div>
                                        <Label htmlFor="location">Location</Label>
                                        <Input id="location" placeholder="e.g. San Francisco, CA" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="keywords">Keywords</Label>
                                        <Input id="keywords" placeholder="e.g. React, TypeScript, Node.js" />
                                    </div>
                                    <div>
                                        <Label htmlFor="salary-range">Salary Range</Label>
                                        <Input id="salary-range" placeholder="e.g. $80k - $120k" />
                                    </div>
                                </div>
                                <Button className="w-full">
                                    Create Alert
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Active Alerts */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center">
                                        <Bell className="h-5 w-5 mr-2" />
                                        Active Alerts
                                    </span>
                                    <Badge variant="secondary">
                                        {jobAlerts.filter(alert => alert.active).length} active
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    Manage your existing job alerts
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {jobAlerts.length > 0 ? (
                                    <div className="space-y-4">
                                        {jobAlerts.map((alert) => (
                                            <div key={alert.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                                            {alert.title}
                                                        </h3>
                                                        {alert.active ? (
                                                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Inactive</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                        <span className="flex items-center">
                                                            <MapPin className="h-4 w-4 mr-1" />
                                                            {alert.location}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <DollarSign className="h-4 w-4 mr-1" />
                                                            {alert.salary}
                                                        </span>
                                                        <span>Created {alert.created}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        {alert.keywords.map((keyword, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs">
                                                                {keyword}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="outline" size="sm">
                                                        Edit
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BellOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No job alerts yet
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                                            Create your first job alert to get notified about new opportunities
                                        </p>
                                        <Button variant="outline">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Alert
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
