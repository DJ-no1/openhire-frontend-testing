'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Briefcase,
    Users,
    BarChart3,
    PlusCircle,
    FileText,
    Calendar,
    UserPlus
} from 'lucide-react';

interface RecruiterOnboardingProps {
    onCreateJob: () => void;
}

export function RecruiterOnboarding({ onCreateJob }: RecruiterOnboardingProps) {
    return (
        <>
            {/* Main Onboarding Card */}
            <div className="mb-8">
                <Card className="border-2 border-dashed border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-700">
                    <CardContent className="p-8 text-center">
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                                <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Ready to find your next great hire?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                Post your first job to start connecting with talented candidates and building your team.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={onCreateJob}
                        >
                            <PlusCircle className="h-5 w-5 mr-2" />
                            Post Your First Job
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Onboarding Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <span>Getting Started</span>
                        </CardTitle>
                        <CardDescription>
                            Tips to help you succeed with OpenHire
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">1</div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">Create your first job posting</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Write a clear job description with requirements and responsibilities</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">2</div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">Review applications</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Candidates will start applying once your job is live</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">3</div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">Schedule interviews</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Use our AI-powered interview system to evaluate candidates</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <BarChart3 className="h-5 w-5 text-green-600" />
                            <span>Your Dashboard Preview</span>
                        </CardTitle>
                        <CardDescription>
                            Here's what you'll see once you start recruiting
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                    <Briefcase className="h-4 w-4 text-blue-600" />
                                    <h4 className="font-medium text-gray-900 dark:text-white">Active Jobs</h4>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Track your live job postings and application counts</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                    <FileText className="h-4 w-4 text-green-600" />
                                    <h4 className="font-medium text-gray-900 dark:text-white">Recent Activity</h4>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">See new applications and interview updates in real-time</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                    <BarChart3 className="h-4 w-4 text-purple-600" />
                                    <h4 className="font-medium text-gray-900 dark:text-white">Performance Metrics</h4>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Monitor your hiring success rates and response times</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export function RecruiterOnboardingStatsCard({ onCreateJob }: RecruiterOnboardingProps) {
    return (
        <div className="mb-8">
            <Card className="border-2 border-dashed border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-700">
                <CardContent className="p-8 text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                            <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Ready to find your next great hire?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                            Post your first job to start connecting with talented candidates and building your team.
                        </p>
                    </div>
                    <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={onCreateJob}
                    >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Post Your First Job
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
