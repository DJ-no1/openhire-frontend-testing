// API Configuration for OpenHire Backend
export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    ENDPOINTS: {
        JOBS: '/jobs',
        REVIEW_RESUME: '/review-resume',
        REVIEW_BY_ID: (id: string) => `/review-resume/${id}`,
    },
    TIMEOUTS: {
        UPLOAD: 60000, // 60 seconds for file upload and analysis
        FETCH: 10000,  // 10 seconds for regular API calls
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
