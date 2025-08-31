import { useState, useEffect } from 'react';
import {
    CandidateDashboardStats,
    ApplicationWithDetails,
    RecommendedJob,
    RecruiterDashboardStats,
    RecentActivity,
    formatTimeAgo
} from '@/lib/dashboard-data';

// Generic hook for API calls with loading and error states
function useApiCall<T>(url: string, dependencies: any[] = []) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(url);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to fetch data');
                }

                if (isMounted) {
                    setData(result.data);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'An error occurred');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, dependencies);

    return { data, loading, error };
}

// Candidate Dashboard Hooks
export function useCandidateStats() {
    return useApiCall<CandidateDashboardStats>('/api/candidate/dashboard-stats');
}

export function useCandidateApplications(limit: number = 4) {
    return useApiCall<ApplicationWithDetails[]>(`/api/candidate/applications?limit=${limit}`, [limit]);
}

export function useRecommendedJobs(limit: number = 3) {
    return useApiCall<RecommendedJob[]>(`/api/candidate/recommended-jobs?limit=${limit}`, [limit]);
}

// Recruiter Dashboard Hooks
export function useRecruiterStats() {
    return useApiCall<RecruiterDashboardStats>('/api/recruiter/dashboard-stats');
}

export function useRecruiterActivity(limit: number = 4) {
    return useApiCall<RecentActivity[]>(`/api/recruiter/activity?limit=${limit}`, [limit]);
}

export function useRecruiterPerformance() {
    return useApiCall<{
        application_response_rate: number;
        interview_to_hire_rate: number;
        avg_time_to_hire: number;
        job_fill_rate: number;
    }>('/api/recruiter/performance');
}

// Helper hook for profile completion (candidate)
export function useProfileCompletion() {
    const [completion, setCompletion] = useState({ percentage: 75, missing_fields: ['Skills & Experience'] });

    // This could be expanded to fetch real profile completion data
    // For now, returning static data as specified in the original dashboard

    return { completion, loading: false, error: null };
}

// Utility functions for dashboard data formatting
export function formatApplicationStatus(status: string): {
    label: string;
    color: string;
    icon: string;
} {
    switch (status.toLowerCase()) {
        case 'applied':
            return {
                label: 'Application Sent',
                color: 'bg-blue-100 text-blue-800',
                icon: 'CheckCircle'
            };
        case 'reviewing':
        case 'under_review':
            return {
                label: 'Under Review',
                color: 'bg-yellow-100 text-yellow-800',
                icon: 'Clock'
            };
        case 'interview_scheduled':
            return {
                label: 'Interview Scheduled',
                color: 'bg-green-100 text-green-800',
                icon: 'Calendar'
            };
        case 'interviewed':
            return {
                label: 'Interviewed',
                color: 'bg-purple-100 text-purple-800',
                icon: 'CheckCircle'
            };
        case 'hired':
            return {
                label: 'Hired',
                color: 'bg-green-100 text-green-800',
                icon: 'CheckCircle'
            };
        case 'rejected':
        case 'not_selected':
            return {
                label: 'Not Selected',
                color: 'bg-red-100 text-red-800',
                icon: 'XCircle'
            };
        default:
            return {
                label: status,
                color: 'bg-gray-100 text-gray-800',
                icon: 'AlertCircle'
            };
    }
}

export function formatSalary(salary: string | undefined): string {
    if (!salary) return 'Salary not specified';
    return salary;
}

export function formatJobMatch(percentage: number | undefined): string {
    if (!percentage) return '85%'; // Default match percentage
    return `${percentage}%`;
}

export function getActivityIcon(type: RecentActivity['type']): string {
    switch (type) {
        case 'new_application':
            return 'FileText';
        case 'interview_completed':
            return 'CheckCircle';
        case 'job_posted':
            return 'Briefcase';
        case 'candidate_hired':
            return 'UserPlus';
        default:
            return 'AlertCircle';
    }
}

export function formatActivityDescription(activity: RecentActivity): string {
    switch (activity.type) {
        case 'new_application':
            return `New application received from ${activity.candidate_name}`;
        case 'interview_completed':
            return `Interview completed with ${activity.candidate_name}`;
        case 'job_posted':
            return `Job posted: ${activity.job_title}`;
        case 'candidate_hired':
            return `Candidate hired: ${activity.candidate_name}`;
        default:
            return activity.description;
    }
}

// Hook for refreshing dashboard data
export function useRefreshDashboard() {
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return { refreshKey, refresh };
}

// Hook for real-time updates (placeholder for future implementation)
export function useRealTimeUpdates(userId: string, userRole: 'candidate' | 'recruiter') {
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    useEffect(() => {
        // This would implement Supabase real-time subscriptions
        // For now, we'll just update every 30 seconds as a placeholder
        const interval = setInterval(() => {
            setLastUpdate(new Date());
        }, 30000);

        return () => clearInterval(interval);
    }, [userId, userRole]);

    return { lastUpdate };
}

export { formatTimeAgo };
