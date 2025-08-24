import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar skeleton */}
            <div className="w-64 border-r bg-card">
                <div className="p-6">
                    <Skeleton className="h-8 w-32 mb-6" />
                    <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main content skeleton */}
            <div className="flex-1 flex flex-col">
                {/* Header skeleton */}
                <div className="border-b bg-card p-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>

                {/* Content skeleton */}
                <div className="flex-1 p-6">
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-64" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="border rounded-lg p-6 space-y-4">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-8 w-24" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function PageSkeleton() {
    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="border rounded-lg p-6 space-y-4">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function JobListSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                    </div>
                    <div className="flex gap-2">
                        {Array.from({ length: 3 }).map((_, j) => (
                            <Skeleton key={j} className="h-6 w-16" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export function ApplicationSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-12" />
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                            <Skeleton className="h-8 w-24" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function InterviewSkeleton() {
    return (
        <div className="space-y-6">
            <div className="text-center space-y-4">
                <Skeleton className="h-12 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Skeleton className="h-64 w-full rounded-lg" />
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-10 rounded-full" />
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
