// Job Management API Service
import { API_CONFIG } from './api';
import { DEMO_JOBS, simulateApiDelay } from './demo-data';

export interface CreateJobData {
    recruiter_id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    salary?: string;
    skills: string;
    job_type: string;
    end_date: string;
    interview_duration: string;
    status: 'active' | 'inactive';
}

export interface Job {
    id: string;
    recruiter_id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    salary?: string;
    skills: string;
    job_type: string;
    end_date: string;
    interview_duration: string;
    status: 'active' | 'inactive' | 'expired';
    created_at: string;
    updated_at: string;
    applications_count?: number;
    job_link?: string;
}

export interface UpdateJobData extends Partial<CreateJobData> {
    id: string;
}

class JobService {
    private baseUrl = API_CONFIG.BASE_URL;
    private useDemoData = false; // Always try API first

    // Helper method to check if API is available
    private async isApiAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000), // 3 second timeout
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    // Create a new job
    async createJob(jobData: CreateJobData): Promise<Job> {
        const response = await fetch(`${this.baseUrl}/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jobData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to create job');
        }

        return response.json();
    }

    // Get all jobs for a recruiter
    async getRecruiterJobs(recruiterId: string): Promise<Job[]> {
        const response = await fetch(`${this.baseUrl}/jobs?recruiter_id=${recruiterId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch jobs');
        }

        return response.json();
    }

    // Get all public jobs (for candidates and public browsing)
    async getAllJobs(): Promise<Job[]> {
        // Always try API first
        try {
            console.log('Trying to fetch jobs from API...');
            const response = await fetch(`${this.baseUrl}/jobs`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const jobs = await response.json();
                console.log('Successfully fetched jobs from API:', jobs);
                console.log('Number of jobs:', jobs.length);
                console.log('First job structure:', jobs[0]);
                return jobs;
            } else {
                console.log('API response not OK, status:', response.status);
                throw new Error(`API responded with status ${response.status}`);
            }
        } catch (error) {
            console.log('API error, falling back to demo data:', error);
            await simulateApiDelay(800);
            return DEMO_JOBS as Job[];
        }
    }

    // Get a specific job by ID
    async getJobById(jobId: string): Promise<Job> {
        // Always try API first
        try {
            console.log('Trying to fetch job from API:', jobId);
            const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const job = await response.json();
                console.log('Successfully fetched job from API:', job);
                console.log('Job structure:', JSON.stringify(job, null, 2));
                return job;
            } else {
                console.log('API response not OK, status:', response.status);
                console.log('Trying to get individual job from list...');

                // Fallback: get all jobs and find the specific one
                const allJobsResponse = await fetch(`${this.baseUrl}/jobs`);
                if (allJobsResponse.ok) {
                    const allJobs = await allJobsResponse.json();
                    const specificJob = allJobs.find((job: any) => job.id === jobId);
                    if (specificJob) {
                        console.log('Found job in list:', specificJob);
                        return specificJob;
                    }
                }
                throw new Error(`API responded with status ${response.status}`);
            }
        } catch (error) {
            console.log('API error, falling back to demo data:', error);
            await simulateApiDelay(500);
            const demoJob = DEMO_JOBS.find(job => job.id === jobId);
            if (demoJob) {
                return demoJob as Job;
            }
            throw new Error('Job not found');
        }
    }

    // Get a specific job by job link (better solution)
    async getJobByLink(jobLink: string): Promise<Job> {
        // Extract the actual link from /j/... format
        const actualLink = jobLink.startsWith('/j/') ? jobLink.substring(3) : jobLink;

        try {
            console.log('Trying to fetch job by link from API:', actualLink);

            // Get all jobs and find the one with matching job_link
            const allJobsResponse = await fetch(`${this.baseUrl}/jobs`);
            if (allJobsResponse.ok) {
                const allJobs = await allJobsResponse.json();
                console.log('Found jobs in list:', allJobs.length);

                const specificJob = allJobs.find((job: any) => {
                    // Check if job_link matches (with or without /j/ prefix)
                    const jobLinkToCheck = job.job_link;
                    if (jobLinkToCheck) {
                        const cleanJobLink = jobLinkToCheck.startsWith('/j/') ?
                            jobLinkToCheck.substring(3) : jobLinkToCheck;
                        if (cleanJobLink === actualLink) return true;
                    }

                    // Also check if the link matches the first 8 characters of job ID
                    // (for backwards compatibility with generated links)
                    if (job.id && job.id.slice(0, 8) === actualLink) {
                        return true;
                    }

                    return false;
                });

                if (specificJob) {
                    console.log('Found job by link:', specificJob);
                    return specificJob;
                }
            }

            throw new Error('Job not found with the provided link');
        } catch (error) {
            console.log('API error, falling back to demo data:', error);
            await simulateApiDelay(500);

            // Try to find in demo data by link
            const demoJob = DEMO_JOBS.find(job => {
                const demoJobLink = (job as any).job_link;
                if (!demoJobLink) return false;
                const cleanDemoLink = demoJobLink.startsWith('/j/') ?
                    demoJobLink.substring(3) : demoJobLink;
                return cleanDemoLink === actualLink;
            });

            if (demoJob) {
                return demoJob as Job;
            }
            throw new Error('Job not found');
        }
    }

    // Update a job
    async updateJob(jobData: UpdateJobData): Promise<Job> {
        const { id, ...updateData } = jobData;
        const response = await fetch(`${this.baseUrl}/jobs/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to update job');
        }

        return response.json();
    }

    // Delete a job
    async deleteJob(jobId: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to delete job');
        }
    }

    // Toggle job status
    async toggleJobStatus(jobId: string, status: 'active' | 'inactive'): Promise<Job> {
        const response = await fetch(`${this.baseUrl}/jobs/${jobId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to update job status');
        }

        return response.json();
    }

    // Get job analytics/statistics
    async getJobStats(recruiterId: string): Promise<{
        total_jobs: number;
        active_jobs: number;
        total_applications: number;
        avg_applications_per_job: number;
    }> {
        const response = await fetch(`${this.baseUrl}/jobs/stats?recruiter_id=${recruiterId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch job statistics');
        }

        return response.json();
    }
}

// Export a singleton instance
export const jobService = new JobService();

// Utility function to get the correct job URL link
export const getJobUrl = (job: any): string => {
    if (job.job_link) {
        // Remove /j/ prefix if it exists
        const cleanLink = job.job_link.startsWith('/j/') ? job.job_link.substring(3) : job.job_link;
        return `/jobs/${cleanLink}`;
    }
    // Fallback to ID if no job_link
    return `/jobs/${job.id}`;
};

// Utility function to extract job link identifier from full job_link
export const extractJobLinkId = (jobLink: string): string => {
    return jobLink.startsWith('/j/') ? jobLink.substring(3) : jobLink;
};

// Export utility functions
export const validateJobData = (jobData: Partial<CreateJobData>): string[] => {
    const errors: string[] = [];

    if (!jobData.title?.trim()) {
        errors.push('Job title is required');
    }

    if (!jobData.company?.trim()) {
        errors.push('Company name is required');
    }

    if (!jobData.location?.trim()) {
        errors.push('Location is required');
    }

    if (!jobData.description?.trim()) {
        errors.push('Job description is required');
    }

    if (!jobData.end_date) {
        errors.push('End date is required');
    } else {
        const endDate = new Date(jobData.end_date);
        const today = new Date();
        if (endDate <= today) {
            errors.push('End date must be in the future');
        }
    }

    if (!jobData.interview_duration?.trim()) {
        errors.push('Interview duration is required');
    }

    if (!jobData.skills?.trim()) {
        errors.push('At least one skill is required');
    }

    return errors;
};

export const formatJobData = (formData: any, skills: string[], userId: string): CreateJobData => {
    return {
        recruiter_id: userId,
        title: formData.title,
        company: formData.company,
        location: formData.location,
        description: formData.description,
        salary: formData.salary || '',
        skills: skills.join(', '),
        job_type: 'full-time', // Default value
        end_date: formData.expiry,
        interview_duration: formData.duration,
        status: 'active' // Default to active
    };
};
