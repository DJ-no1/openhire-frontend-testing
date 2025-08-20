'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function LoadingSkeleton() {
    return (
        <div className="animate-pulse">
            <Card>
                <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function TabSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            {/* Header Skeleton */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-6 bg-gray-200 rounded w-full"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-6 bg-gray-200 rounded w-full"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-6 bg-gray-200 rounded w-full"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LoadingSkeleton />
                <LoadingSkeleton />
            </div>

            {/* Additional Content */}
            <Card>
                <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function ChatSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] space-y-2 ${i % 2 === 0 ? '' : 'items-end'}`}>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className={`p-3 rounded-lg ${i % 2 === 0 ? 'bg-gray-100' : 'bg-blue-100'}`}>
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-200 rounded"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                {Math.random() > 0.5 && <div className="h-3 bg-gray-200 rounded w-4/6"></div>}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ScoreSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            {/* Score Overview */}
            <Card>
                <CardHeader>
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="text-center space-y-2">
                                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
                                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 bg-gray-100 rounded"></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 bg-gray-100 rounded"></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
