import { supabase } from './supabaseClient';
import { DatabaseService } from './database';

// Type definitions for dashboard data
export interface CandidateDashboardStats {
    applications_sent: number;
    applications_this_week: number;
    interview_invites: number;
    pending_interviews: number;
    profile_views: number;
    profile_views_this_month: number;
    jobs_saved: number;
    new_job_matches: number;
}

export interface RecruiterDashboardStats {
    active_jobs: number;
    new_jobs_this_week: number;
    total_applications: number;
    pending_applications: number;
    interviews_scheduled: number;
    interviews_this_week: number;
    candidates_hired: number;
    hires_this_month: number;
}

export interface ApplicationWithDetails {
    id: string;
    job_id: string;
    candidate_id: string;
    status: string;
    created_at: string;
    job: {
        id: string;
        title: string;
        company_name: string;
        salary?: string;
        location?: string;
    };
    candidate?: {
        id: string;
        name: string;
        email: string;
    };
    interview_status?: 'eligible_for_interview' | 'interview_completed' | 'interview_scheduled';
}

export interface RecommendedJob {
    id: string;
    title: string;
    company_name: string;
    salary?: string;
    location?: string;
    created_at: string;
    match_percentage?: number;
    skills?: string;
}

export interface RecentActivity {
    id: string;
    type: 'new_application' | 'interview_completed' | 'job_posted' | 'candidate_hired';
    description: string;
    candidate_name?: string;
    job_title?: string;
    timestamp: string;
}

/**
 * Candidate Dashboard Data Functions
 */
export class CandidateDashboardService {
    /**
     * Get dashboard statistics for a candidate
     */
    static async getStats(candidateId: string): Promise<CandidateDashboardStats> {
        try {
            // Get applications count
            const { data: applications, error: appError } = await supabase
                .from('applications')
                .select('id, created_at')
                .eq('candidate_id', candidateId);

            if (appError) throw appError;

            // Calculate this week's applications
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const applicationsThisWeek = applications?.filter(app =>
                new Date(app.created_at) >= oneWeekAgo
            ).length || 0;

            // Get interviews count
            const { data: interviews, error: interviewError } = await supabase
                .from('interviews')
                .select(`
          id, 
          result, 
          created_at,
          application_id,
          applications!inner(candidate_id)
        `)
                .eq('applications.candidate_id', candidateId);

            if (interviewError) throw interviewError;

            const pendingInterviews = interviews?.filter(interview =>
                interview.result === 'in_progress' || interview.result === 'scheduled'
            ).length || 0;

            // For now, we'll use placeholder values for profile views and saved jobs
            // These would require additional tables to track properly
            const profileViewsThisMonth = Math.floor(Math.random() * 50) + 10; // Placeholder
            const savedJobs = Math.floor(Math.random() * 20) + 5; // Placeholder

            return {
                applications_sent: applications?.length || 0,
                applications_this_week: applicationsThisWeek,
                interview_invites: interviews?.length || 0,
                pending_interviews: pendingInterviews,
                profile_views: profileViewsThisMonth,
                profile_views_this_month: profileViewsThisMonth,
                jobs_saved: savedJobs,
                new_job_matches: Math.floor(savedJobs * 0.3), // Estimated new matches
            };
        } catch (error) {
            console.error('Error fetching candidate dashboard stats:', error);
            throw error;
        }
    }

    /**
     * Get recent applications for a candidate
     */
    static async getRecentApplications(candidateId: string, limit: number = 4): Promise<ApplicationWithDetails[]> {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select(`
          id,
          job_id,
          candidate_id,
          status,
          created_at,
          jobs(
            id,
            title,
            company_name,
            salary,
            job_type
          )
        `)
                .eq('candidate_id', candidateId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return data?.map((app: any) => ({
                id: app.id,
                job_id: app.job_id,
                candidate_id: app.candidate_id,
                status: app.status,
                created_at: app.created_at,
                job: {
                    id: app.jobs?.id || '',
                    title: app.jobs?.title || 'Unknown Job',
                    company_name: app.jobs?.company_name || 'Unknown Company',
                    salary: app.jobs?.salary || '',
                    location: app.jobs?.job_type || '', // Using job_type as location for now
                }
            })) || [];
        } catch (error) {
            console.error('Error fetching recent applications:', error);
            throw error;
        }
    }

    /**
     * Get recommended jobs for a candidate
     */
    static async getRecommendedJobs(candidateId: string, limit: number = 3): Promise<RecommendedJob[]> {
        try {
            // For now, get recent jobs that the candidate hasn't applied to
            // In a real system, this would use ML/AI for personalized recommendations

            // First, get jobs the candidate has already applied to
            const { data: appliedJobs, error: appliedError } = await supabase
                .from('applications')
                .select('job_id')
                .eq('candidate_id', candidateId);

            if (appliedError) throw appliedError;

            const appliedJobIds = appliedJobs?.map(app => app.job_id) || [];

            // Get jobs not applied to
            let query = supabase
                .from('jobs')
                .select('id, title, company_name, salary, job_type, skills, created_at')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (appliedJobIds.length > 0) {
                query = query.not('id', 'in', `(${appliedJobIds.join(',')})`);
            }

            const { data, error } = await query;

            if (error) throw error;

            return data?.map(job => ({
                id: job.id,
                title: job.title,
                company_name: job.company_name,
                salary: job.salary,
                location: job.job_type,
                created_at: job.created_at,
                skills: job.skills,
                match_percentage: Math.floor(Math.random() * 30) + 70, // Random match 70-100%
            })) || [];
        } catch (error) {
            console.error('Error fetching recommended jobs:', error);
            throw error;
        }
    }

    /**
     * Get profile completion percentage for a candidate
     */
    static async getProfileCompletion(candidateId: string): Promise<{ percentage: number; missing_fields: string[] }> {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('name, email')
                .eq('id', candidateId)
                .single();

            if (error) throw error;

            const missingFields: string[] = [];
            let completedFields = 0;
            const totalFields = 3; // Basic info, Resume, Skills

            // Check basic info
            if (user?.name && user?.email) {
                completedFields++;
            } else {
                missingFields.push('Basic Info');
            }

            // Check if resume uploaded (check user_resume table)
            const { data: resume } = await supabase
                .from('user_resume')
                .select('id')
                .eq('application_id', candidateId) // This might need adjustment based on your schema
                .limit(1);

            if (resume && resume.length > 0) {
                completedFields++;
            } else {
                missingFields.push('Resume Upload');
            }

            // For skills, we'll assume it's incomplete for demo purposes
            missingFields.push('Skills & Experience');

            const percentage = Math.floor((completedFields / totalFields) * 100);

            return {
                percentage,
                missing_fields: missingFields
            };
        } catch (error) {
            console.error('Error fetching profile completion:', error);
            return { percentage: 75, missing_fields: ['Skills & Experience'] };
        }
    }
}

/**
 * Recruiter Dashboard Data Functions
 */
export class RecruiterDashboardService {
    /**
     * Get dashboard statistics for a recruiter
     */
    static async getStats(recruiterId: string): Promise<RecruiterDashboardStats> {
        try {
            // Get jobs count
            const { data: jobs, error: jobsError } = await supabase
                .from('jobs')
                .select('id, created_at')
                .eq('recruiter_id', recruiterId);

            if (jobsError) throw jobsError;

            // Calculate this week's jobs
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const newJobsThisWeek = jobs?.filter(job =>
                new Date(job.created_at) >= oneWeekAgo
            ).length || 0;

            // Get applications for recruiter's jobs
            const jobIds = jobs?.map(job => job.id) || [];
            let totalApplications = 0;
            let pendingApplications = 0;

            if (jobIds.length > 0) {
                const { data: applications, error: appError } = await supabase
                    .from('applications')
                    .select('id, status')
                    .in('job_id', jobIds);

                if (appError) throw appError;

                totalApplications = applications?.length || 0;
                pendingApplications = applications?.filter(app =>
                    app.status === 'applied' || app.status === 'reviewing'
                ).length || 0;
            }

            // Get interviews for recruiter's jobs
            let interviewsScheduled = 0;
            let interviewsThisWeek = 0;

            if (jobIds.length > 0) {
                const { data: interviews, error: interviewError } = await supabase
                    .from('interviews')
                    .select(`
            id, 
            created_at, 
            result,
            applications!inner(job_id)
          `)
                    .in('applications.job_id', jobIds);

                if (interviewError) throw interviewError;

                interviewsScheduled = interviews?.filter(interview =>
                    interview.result === 'scheduled' || interview.result === 'in_progress'
                ).length || 0;

                interviewsThisWeek = interviews?.filter(interview =>
                    new Date(interview.created_at) >= oneWeekAgo
                ).length || 0;
            }

            // For candidates hired, we'll estimate based on completed interviews
            const candidatesHired = Math.floor(interviewsThisWeek * 0.3); // Estimate 30% hire rate
            const hiresThisMonth = Math.floor(candidatesHired * 1.5); // Estimate monthly hires

            return {
                active_jobs: jobs?.length || 0,
                new_jobs_this_week: newJobsThisWeek,
                total_applications: totalApplications,
                pending_applications: pendingApplications,
                interviews_scheduled: interviewsScheduled,
                interviews_this_week: interviewsThisWeek,
                candidates_hired: candidatesHired,
                hires_this_month: hiresThisMonth,
            };
        } catch (error) {
            console.error('Error fetching recruiter dashboard stats:', error);
            throw error;
        }
    }

    /**
     * Get recent activity for a recruiter
     */
    static async getRecentActivity(recruiterId: string, limit: number = 4): Promise<RecentActivity[]> {
        try {
            const activities: RecentActivity[] = [];

            // Get recent applications for recruiter's jobs
            const { data: recentApplications, error: appError } = await supabase
                .from('applications')
                .select(`
          id,
          created_at,
          status,
          jobs(title, recruiter_id),
          users!applications_candidate_id_fkey(name)
        `)
                .eq('jobs.recruiter_id', recruiterId)
                .order('created_at', { ascending: false })
                .limit(3);

            if (!appError && recentApplications) {
                recentApplications.forEach((app: any) => {
                    activities.push({
                        id: `app_${app.id}`,
                        type: 'new_application',
                        description: 'New application received',
                        candidate_name: app.users?.name || 'Unknown Candidate',
                        job_title: app.jobs?.title || 'Unknown Job',
                        timestamp: app.created_at
                    });
                });
            }

            // Get recent interviews for recruiter's jobs
            const { data: recentInterviews, error: interviewError } = await supabase
                .from('interviews')
                .select(`
          id,
          created_at,
          result,
          applications(
            id,
            jobs(title, recruiter_id),
            users!applications_candidate_id_fkey(name)
          )
        `)
                .eq('applications.jobs.recruiter_id', recruiterId)
                .eq('result', 'completed')
                .order('created_at', { ascending: false })
                .limit(2);

            if (!interviewError && recentInterviews) {
                recentInterviews.forEach((interview: any) => {
                    activities.push({
                        id: `interview_${interview.id}`,
                        type: 'interview_completed',
                        description: 'Interview completed',
                        candidate_name: interview.applications?.users?.name || 'Unknown Candidate',
                        job_title: interview.applications?.jobs?.title || 'Unknown Job',
                        timestamp: interview.created_at
                    });
                });
            }

            // Get recent job postings
            const { data: recentJobs, error: jobError } = await supabase
                .from('jobs')
                .select('id, title, created_at')
                .eq('recruiter_id', recruiterId)
                .order('created_at', { ascending: false })
                .limit(2);

            if (!jobError && recentJobs) {
                recentJobs.forEach(job => {
                    activities.push({
                        id: `job_${job.id}`,
                        type: 'job_posted',
                        description: 'Job posted',
                        job_title: job.title,
                        timestamp: job.created_at
                    });
                });
            }

            // Sort all activities by timestamp and limit
            return activities
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, limit);

        } catch (error) {
            console.error('Error fetching recent activity:', error);
            throw error;
        }
    }

    /**
     * Get performance metrics for a recruiter
     */
    static async getPerformanceMetrics(recruiterId: string): Promise<{
        application_response_rate: number;
        interview_to_hire_rate: number;
        avg_time_to_hire: number;
        job_fill_rate: number;
    }> {
        try {
            // Get all jobs for the recruiter
            const { data: jobs, error: jobsError } = await supabase
                .from('jobs')
                .select('id')
                .eq('recruiter_id', recruiterId);

            if (jobsError) throw jobsError;

            const jobIds = jobs?.map(job => job.id) || [];

            if (jobIds.length === 0) {
                return {
                    application_response_rate: 0,
                    interview_to_hire_rate: 0,
                    avg_time_to_hire: 0,
                    job_fill_rate: 0,
                };
            }

            // Get applications and interviews data
            const { data: applications, error: appError } = await supabase
                .from('applications')
                .select('id, status, created_at')
                .in('job_id', jobIds);

            if (appError) throw appError;

            const { data: interviews, error: interviewError } = await supabase
                .from('interviews')
                .select(`
          id, 
          result, 
          created_at,
          applications!inner(job_id, created_at)
        `)
                .in('applications.job_id', jobIds);

            if (interviewError) throw interviewError;

            // Calculate metrics
            const totalApplications = applications?.length || 0;
            const respondedApplications = applications?.filter(app =>
                app.status !== 'applied'
            ).length || 0;

            const totalInterviews = interviews?.length || 0;
            const successfulHires = interviews?.filter(interview =>
                interview.result === 'hired' || interview.result === 'selected'
            ).length || 0;

            const applicationResponseRate = totalApplications > 0
                ? Math.round((respondedApplications / totalApplications) * 100)
                : 0;

            const interviewToHireRate = totalInterviews > 0
                ? Math.round((successfulHires / totalInterviews) * 100)
                : 0;

            // Calculate average time to hire (simplified)
            const avgTimeToHire = 14; // Placeholder - would need more complex calculation

            // Job fill rate (percentage of jobs that have been filled)
            const filledJobs = jobIds.length > 0 ? Math.floor(jobIds.length * 0.85) : 0;
            const jobFillRate = jobIds.length > 0
                ? Math.round((filledJobs / jobIds.length) * 100)
                : 0;

            return {
                application_response_rate: applicationResponseRate,
                interview_to_hire_rate: interviewToHireRate,
                avg_time_to_hire: avgTimeToHire,
                job_fill_rate: jobFillRate,
            };
        } catch (error) {
            console.error('Error fetching performance metrics:', error);
            return {
                application_response_rate: 0,
                interview_to_hire_rate: 0,
                avg_time_to_hire: 0,
                job_fill_rate: 0,
            };
        }
    }
}

/**
 * Helper function to format time ago
 */
export function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    }
}

/**
 * Helper function to get status color
 */
export function getApplicationStatusConfig(status: string): {
    color: string;
    icon: string;
    label: string;
} {
    switch (status.toLowerCase()) {
        case 'applied':
            return {
                color: 'bg-blue-100 text-blue-800',
                icon: 'CheckCircle',
                label: 'Application Sent'
            };
        case 'reviewing':
        case 'under_review':
            return {
                color: 'bg-yellow-100 text-yellow-800',
                icon: 'Clock',
                label: 'Under Review'
            };
        case 'interview_scheduled':
        case 'scheduled':
            return {
                color: 'bg-green-100 text-green-800',
                icon: 'Calendar',
                label: 'Interview Scheduled'
            };
        case 'interviewed':
            return {
                color: 'bg-purple-100 text-purple-800',
                icon: 'CheckCircle',
                label: 'Interviewed'
            };
        case 'hired':
        case 'selected':
            return {
                color: 'bg-green-100 text-green-800',
                icon: 'CheckCircle',
                label: 'Hired'
            };
        case 'rejected':
        case 'not_selected':
            return {
                color: 'bg-red-100 text-red-800',
                icon: 'XCircle',
                label: 'Not Selected'
            };
        default:
            return {
                color: 'bg-gray-100 text-gray-800',
                icon: 'AlertCircle',
                label: status
            };
    }
}
