// Job Management API Service
import { API_CONFIG } from './api';

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
}

export interface UpdateJobData extends Partial<CreateJobData> {
    id: string;
}

class JobService {
    private baseUrl = API_CONFIG.BASE_URL;

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

    // Get a specific job by ID
    async getJobById(jobId: string): Promise<Job> {
        const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch job');
        }

        return response.json();
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
