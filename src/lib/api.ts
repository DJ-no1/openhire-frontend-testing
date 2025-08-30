// API Configuration for OpenHire Backend
export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    ENDPOINTS: {
        JOBS: '/jobs',
        REVIEW_RESUME: '/review-resume',
        REVIEW_RESUME_ASYNC: '/review-resume-async',
        REVIEW_RESUME_STATUS: (jobId: string) => `/review-resume-async/status/${jobId}`,
        REVIEW_RESUME_STATS: '/review-resume-async/stats',
        REVIEW_BY_ID: (id: string) => `/review-resume/${id}`,
    },
    TIMEOUTS: {
        UPLOAD: 60000, // 60 seconds for file upload and analysis
        FETCH: 10000,  // 10 seconds for regular API calls
        ASYNC_SUBMIT: 10000, // 10 seconds for async job submission
        STATUS_CHECK: 5000,  // 5 seconds for status checks
    },
    POLLING: {
        INTERVAL: 4000, // 4 seconds between status checks
        MAX_DURATION: 300000, // 5 minutes maximum polling
        RETRY_ATTEMPTS: 3, // Retry failed status checks
    },
    FILE_TYPES: {
        ALLOWED: ['.pdf', '.docx', '.doc', '.txt'],
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
    }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to create FormData for resume upload
export const createResumeFormData = (jobId: string, file: File) => {
    const formData = new FormData();
    formData.append('job_id', jobId);
    formData.append('file', file);
    return formData;
};

// Helper function to validate file
export const validateFile = (file: File) => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!API_CONFIG.FILE_TYPES.ALLOWED.includes(fileExtension)) {
        throw new Error(`Unsupported file type: ${fileExtension}. Supported types: ${API_CONFIG.FILE_TYPES.ALLOWED.join(', ')}`);
    }

    if (file.size > API_CONFIG.FILE_TYPES.MAX_SIZE) {
        throw new Error(`File size too large. Maximum size: ${API_CONFIG.FILE_TYPES.MAX_SIZE / 1024 / 1024}MB`);
    }

    return true;
};

// API response types for TypeScript
export interface Job {
    id: string;
    title: string;
    description: string;
    recruiter_id: string;
    job_type: string;
    salary?: number;
    created_at: string;
}

export interface DimensionScore {
    score: number;
    weight: number;
    evidence: string[];
}

export interface AnalysisResult {
    overall_score: number;
    passed_hard_filters: boolean;
    dimension_breakdown: {
        skill_match: DimensionScore;
        experience_fit: DimensionScore;
        impact_outcomes: DimensionScore;
        role_alignment: DimensionScore;
        project_tech_depth: DimensionScore;
        career_trajectory: DimensionScore;
        communication_clarity: DimensionScore;
        certs_education: DimensionScore;
        extras: DimensionScore;
    };
    hard_filter_failures: string[];
    risk_flags: string[];
    confidence: number;
}

export interface ReviewResponse {
    jd: string;
    resume: string;
    analysis: AnalysisResult;
}

export interface ApiError {
    detail: {
        error: string;
    };
}

// Async job response interfaces
export interface AsyncJobResponse {
    job_id: string;
    status: 'pending';
    message: string;
    estimated_completion: string;
    created_at: string;
}

export interface AsyncJobStatus {
    job_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number; // 0-100 percentage
    result?: ReviewResponse; // Only present when status is 'completed'
    error?: string; // Only present when status is 'failed'
    created_at: string;
    updated_at: string;
}

export interface AsyncJobStats {
    total_jobs: number;
    by_status: {
        [key: string]: number;
    };
    processor_stats: {
        [key: string]: any;
    };
}

// Helper function to submit async resume analysis
export const submitAsyncResumeAnalysis = async (jobId: string, file: File): Promise<AsyncJobResponse> => {
    const formData = createResumeFormData(jobId, file);

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REVIEW_RESUME_ASYNC), {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.ASYNC_SUBMIT)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.error || 'Failed to submit analysis');
    }

    return response.json();
};

// Helper function to submit async resume analysis with text
export const submitAsyncResumeAnalysisWithText = async (jobId: string, resumeText: string): Promise<AsyncJobResponse> => {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REVIEW_RESUME_ASYNC), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            job_id: jobId,
            resume: resumeText
        }),
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.ASYNC_SUBMIT)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.error || 'Failed to submit analysis');
    }

    return response.json();
};

// Helper function to check async job status
export const checkAsyncJobStatus = async (jobId: string): Promise<AsyncJobStatus> => {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REVIEW_RESUME_STATUS(jobId)), {
        method: 'GET',
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.STATUS_CHECK)
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Job not found');
        }
        throw new Error('Failed to check job status');
    }

    return response.json();
};

// Helper function to get async job stats
export const getAsyncJobStats = async (): Promise<AsyncJobStats> => {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REVIEW_RESUME_STATS), {
        method: 'GET',
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.FETCH)
    });

    if (!response.ok) {
        throw new Error('Failed to get job stats');
    }

    return response.json();
};
