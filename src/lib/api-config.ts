// API Configuration utility for OpenHire Backend
// Handles both production Heroku domain and local development fallback

/**
 * Get the base API URL from environment variables with fallback
 * Priority: NEXT_PUBLIC_API_URL -> localhost:8000
 */
export const getApiBaseUrl = (): string => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

/**
 * Get the WebSocket URL from environment variables with fallback
 * Priority: NEXT_PUBLIC_WS_URL -> localhost:8000 WebSocket
 * Note: For production, WebSocket might not be available on Heroku
 */
export const getWebSocketBaseUrl = (): string => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (wsUrl) {
        // Remove the placeholder from the env variable if it exists
        return wsUrl.replace('/{application_id}', '').replace('{application_id}', '');
    }
    return 'ws://localhost:8000';
};

/**
 * Get WebSocket URL with automatic fallback to localhost if production fails
 * This is useful for development when production WebSocket isn't available
 */
export const getWebSocketUrlWithFallback = (endpoint: string): string => {
    const isProduction = !isUsingLocalBackend();

    if (isProduction) {
        // In production, we might need to fall back to localhost for WebSocket
        // since many deployment platforms don't support WebSocket out of the box
        console.warn('Production WebSocket might not be available. Consider using localhost for WebSocket connections during development.');
        return `ws://localhost:8000${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    }

    return getWebSocketUrl(endpoint);
};

/**
 * Get full API endpoint URL
 */
export const getApiUrl = (endpoint: string): string => {
    const baseUrl = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Get WebSocket URL for specific endpoint
 */
export const getWebSocketUrl = (endpoint: string): string => {
    const baseUrl = getWebSocketBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Get WebSocket URL for interview sessions
 */
export const getInterviewWebSocketUrl = (sessionId: string): string => {
    return getWebSocketUrl(`/ws/interview/${sessionId}`);
};

/**
 * Get WebSocket URL for AI interview sessions
 */
export const getAIInterviewWebSocketUrl = (): string => {
    return getWebSocketUrl('/ws/ai-interview');
};

/**
 * Get WebSocket URL for interview with application ID
 */
export const getInterviewWebSocketUrlWithApp = (applicationId: string): string => {
    return getWebSocketUrl(`/interview/${applicationId}`);
};

/**
 * API Configuration object for backward compatibility
 */
export const API_CONFIG = {
    BASE_URL: getApiBaseUrl(),
    WS_BASE_URL: getWebSocketBaseUrl(),
    ENDPOINTS: {
        JOBS: '/jobs',
        REVIEW_RESUME: '/review-resume',
        REVIEW_BY_ID: (id: string) => `/review-resume/${id}`,
        HEALTH: '/health',
        CHAT: '/chat',
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

/**
 * Helper function to check if we're in development mode
 */
export const isDevelopment = (): boolean => {
    return process.env.NODE_ENV === 'development';
};

/**
 * Helper function to check if using local backend
 */
export const isUsingLocalBackend = (): boolean => {
    const apiUrl = getApiBaseUrl();
    return apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');
};
