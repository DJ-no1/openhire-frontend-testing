import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Individual skeleton components for different dashboard sections
export function DashboardStatSkeleton() {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function ApplicationItemSkeleton() {
    return (
        <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
            <div className="flex-shrink-0">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
        </div>
    );
}

export function RecommendedJobSkeleton() {
    return (
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
            <div className="flex justify-between items-center text-xs mb-3">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
            <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
        </div>
    );
}

export function ActivityItemSkeleton() {
    return (
        <div className="flex items-start space-x-3 p-3 rounded-lg">
            <div className="flex-shrink-0 w-2 h-2 bg-gray-200 rounded-full animate-pulse mt-2"></div>
            <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
        </div>
    );
}

export function PerformanceMetricSkeleton() {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm mb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gray-300 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
        </div>
    );
}

// Complete dashboard section skeletons
export function CandidateStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
                <DashboardStatSkeleton key={i} />
            ))}
        </div>
    );
}

export function RecruiterStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
                <DashboardStatSkeleton key={i} />
            ))}
        </div>
    );
}

export function RecentApplicationsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <ApplicationItemSkeleton key={i} />
                    ))}
                </div>
                <div className="mt-4">
                    <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
                </div>
            </CardContent>
        </Card>
    );
}

export function RecommendedJobsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-56"></div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <RecommendedJobSkeleton key={i} />
                    ))}
                </div>
                <div className="mt-4">
                    <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
                </div>
            </CardContent>
        </Card>
    );
}

export function RecentActivitySkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-28 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-52"></div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <ActivityItemSkeleton key={i} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function PerformanceOverviewSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-36 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {[...Array(4)].map((_, i) => (
                        <PerformanceMetricSkeleton key={i} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function ProfileCompletionSkeleton() {
    return (
        <Card className="mt-6">
            <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-40 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between text-sm mb-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gray-300 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-2">
                                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                            </div>
                        ))}
                    </div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse w-32 mt-4"></div>
                </div>
            </CardContent>
        </Card>
    );
}

// Error state components
export function DashboardErrorState({
    error,
    onRetry
}: {
    error: string;
    onRetry?: () => void;
}) {
    return (
        <Card className="border-red-200">
            <CardContent className="p-6 text-center">
                <div className="text-red-600 mb-2">
                    <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Failed to load data
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {error}
                </p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Try Again
                    </button>
                )}
            </CardContent>
        </Card>
    );
}

// Empty state components
export function EmptyApplicationsState() {
    return (
        <Card>
            <CardContent className="p-6 text-center">
                <div className="text-gray-400 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No applications yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Start applying to jobs to see your applications here.
                </p>
            </CardContent>
        </Card>
    );
}

export function EmptyJobsState() {
    return (
        <Card>
            <CardContent className="p-6 text-center">
                <div className="text-gray-400 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 002 2h2a2 2 0 002-2V6m0 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 012 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No recommended jobs
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete your profile to get personalized job recommendations.
                </p>
            </CardContent>
        </Card>
    );
}
