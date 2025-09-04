# Backend URL Migration Summary

## Overview

Successfully updated the entire OpenHire frontend project to use environment-based backend URL configuration with fallback to localhost. The system now prioritizes the production Heroku domain (https://openhire-2764a0388beb.herokuapp.com) from environment variables and falls back to localhost:8000 for local development.

## Files Created/Modified

### 1. New Configuration File

- **src/lib/api-config.ts** - Centralized API configuration utility
  - `getApiBaseUrl()` - Returns backend base URL from env or localhost
  - `getWebSocketBaseUrl()` - Returns WebSocket base URL from env or localhost
  - `getApiUrl(endpoint)` - Builds full API URLs
  - `getWebSocketUrl(endpoint)` - Builds WebSocket URLs
  - `getInterviewWebSocketUrl(sessionId)` - Interview-specific WebSocket URLs
  - `isUsingLocalBackend()` - Helper to check if using local development

### 2. Updated Core Libraries

- **src/lib/api.ts** - Re-exported from centralized config
- **src/lib/ai-service.ts** - Updated to use `getApiBaseUrl()`

### 3. Updated Components (30+ files)

#### Interview System Components

- **ai-interview-system-v3.tsx** - Health checks and error messages now environment-aware
- **ai-interview-system-v2.tsx** - WebSocket URLs use environment config
- **ai_interview.tsx** - WebSocket URLs use environment config
- **ai_interview2.tsx** - WebSocket URLs use environment config
- **video-interview-system.tsx** - WebSocket URLs use environment config
- **video-interview-system-clean.tsx** - WebSocket URLs use environment config
- **InterviewSession.tsx** - WebSocket URLs use environment config

#### API Communication Components

- **chat_box.tsx** - API calls use environment config
- **ai-resume-analyzer.tsx** - API calls use environment config
- **pdf_upload_flow.tsx** - API calls use environment config
- **connection-debugger.tsx** - All backend tests use environment config

#### Documentation & UI Components

- **interview-system-docs.tsx** - Documentation examples updated to show environment-aware URLs

### 4. Updated Hooks

- **hooks/use-interview-websocket.ts** - WebSocket connections use environment config

### 5. Updated Test Pages

- **src/app/test/jobs/[id]/page.tsx** - API calls use environment config
- **src/app/test/ws-chat/page.tsx** - WebSocket URLs use environment config
- **src/app/test/listjob/page.tsx** - API calls use environment config
- **src/app/jobs/page-backup.tsx** - API calls use environment config

## Environment Configuration

### Current .env.local Setup

```bash
# Production (Active)
NEXT_PUBLIC_API_URL=https://openhire-2764a0388beb.herokuapp.com
NEXT_PUBLIC_WS_URL=wss://openhire-2764a0388beb.herokuapp.com/interview/{application_id}

# Development (Commented out)
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_WS_URL=ws://localhost:8000/interview/{application_id}
```

## Key Features

### 1. Automatic Environment Detection

- Production URLs used when environment variables are set
- Automatic fallback to localhost for development
- Dynamic error messages that show correct backend info

### 2. Consistent URL Building

- All API calls now use centralized configuration
- WebSocket connections standardized across components
- No more hardcoded localhost references

### 3. Development-Friendly

- `isUsingLocalBackend()` helper for conditional logic
- Error messages show appropriate backend info (localhost vs production)
- Maintains backward compatibility with local development

## Benefits

1. **Seamless Deployment** - No code changes needed when switching environments
2. **Consistent Configuration** - Single source of truth for all backend URLs
3. **Better Error Messages** - Users see relevant backend information
4. **Maintainable Code** - Centralized URL management reduces duplication
5. **Environment Flexibility** - Easy switching between development and production

## Usage Examples

```typescript
// API Calls
const response = await fetch(getApiUrl("/jobs"));

// WebSocket Connections
const ws = new WebSocket(getInterviewWebSocketUrl(sessionId));

// Environment-aware messages
const backend = isUsingLocalBackend() ? "localhost:8000" : "production server";
toast.error(`Cannot connect to ${backend}`);
```

## Testing

- All hardcoded localhost:8000 references have been replaced
- WebSocket connections now use environment configuration
- Error messages are context-aware
- Components gracefully handle both local and production environments

The migration is complete and the application now seamlessly works with both the production Heroku backend and local development environments.
