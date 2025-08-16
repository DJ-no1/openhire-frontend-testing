# AI Interview Flow Implementation

This document describes the complete AI interview flow implementation that has been created based on the requirements.

## Overview

The implementation includes a complete interview flow with three main pages:

1. **Permission/Device Setup Page** - Device testing and permissions
2. **Interview Page** - Live AI interview with monitoring
3. **Interview Results Page** - Post-interview analysis and artifacts

## Flow Architecture

### 1. Interview Initiation (`/dashboard/application/[id]/analysis`)

- **Updated**: Added "Start Interview" button to the analysis page
- **Location**: After resume analysis results
- **Action**: Redirects to permission setup page

### 2. Permission Setup Page (`/dashboard/application/[id]/permission`)

- **Component**: Complete device permission and testing interface
- **Features**:
  - Camera permission and preview testing
  - Microphone permission with audio visualization
  - Screen sharing capability testing
  - Device configuration (select specific camera/microphone)
  - Permission status indicators
  - Interview tips and instructions

#### Key Features:

- **AudioVisualizer Component**: Real-time audio level visualization using Canvas API and Web Audio API
- **Camera Preview**: Live camera feed for testing
- **Screen Share Test**: Tests screen sharing permissions (required for interview monitoring)
- **Device Configuration**: Dialog to select specific audio/video devices
- **Validation**: All three permissions must be granted before proceeding

### 3. Interview Page (`/dashboard/application/[id]/interview`)

- **Component**: Live interview interface with monitoring
- **Layout**: Split view with video monitoring (2/3) and AI chat (1/3)
- **Features**:
  - Real-time image capture every 10 seconds during interview
  - Interview status monitoring
  - AI conversation interface (using existing AIInterviewNew component)
  - Progress tracking and statistics
  - Interview completion handling with automatic redirect

#### Key Features:

- **ImageCapture Integration**: Uses existing ImageCapture component for monitoring
- **Status Management**: Tracks interview status (disconnected, connecting, connected, paused, completed)
- **Image Management**: Collects and stores captured images during interview
- **Auto-redirect**: After interview completion, waits 5 seconds then redirects to results
- **Navigation Protection**: Prevents accidental page refresh during active interview

### 4. Interview Results Page (`/dashboard/application/[id]/interview-result`)

- **Component**: Comprehensive interview results and artifact viewing
- **Features**:
  - Interview statistics and metrics
  - Tabbed interface for different data views
  - Conversation log display
  - AI assessment results
  - Captured images gallery
  - Export and sharing options

#### Key Features:

- **Statistics Dashboard**: Questions answered, duration, completion rate, images captured
- **Tabbed Interface**: Overview, Conversation, AI Assessment, Artifacts
- **Image Gallery**: View all captured images during interview
- **Data Export**: Options to download or share results
- **Navigation**: Back to analysis or dashboard

## Technical Implementation

### Components Created/Modified

1. **Permission Page** (`src/app/dashboard/application/[id]/permission/page.tsx`)

   - Full device setup interface
   - Audio visualization component
   - Screen sharing test
   - Device configuration dialog

2. **Interview Page** (`src/app/dashboard/application/[id]/interview/page.tsx`)

   - Split-screen interview interface
   - Integration with existing AI interview system
   - Image capture and monitoring
   - Status management and navigation

3. **Interview Results Page** (`src/app/dashboard/application/[id]/interview-result/page.tsx`)

   - Results display with tabbed interface
   - Integration with Supabase for artifact retrieval
   - Statistics calculation and visualization

4. **Analysis Page Update** (`src/app/dashboard/application/[id]/analysis/page.tsx`)
   - Added "Start Interview" button
   - Links to permission setup page

### Database Schema

**Updated `interview_artifacts` table** (see `database-schemas/interview_artifacts_updated.sql`):

- `application_id`: Direct reference to application
- `interview_type`: Type of interview (ai_interview)
- `status`: Current status (in_progress, completed, failed)
- `started_at`, `completed_at`: Timestamps
- `duration_minutes`: Interview duration
- `total_questions`, `answered_questions`: Question tracking
- `ai_assessment`: AI-generated assessment (JSON)
- `conversation_log`: Full conversation (JSON array)
- `image_url`: Comma-separated image URLs
- `audio_url`, `video_url`: Media file URLs
- `performance_metrics`: Additional metrics (JSON)

### Key Dependencies

- **Existing Components Used**:

  - `AIInterviewNew` from `components/ai_interview2.tsx`
  - `ImageCapture` from `components/image-capture.tsx`
  - UI components from `components/ui/`
  - Supabase client for data persistence

- **New Features Added**:
  - Audio visualization using Web Audio API
  - Screen sharing permission testing
  - Device configuration with MediaDevices API
  - Real-time interview monitoring
  - Comprehensive results dashboard

### Integration Points

1. **With Existing AI System**: Uses `AIInterviewNew` component and maintains compatibility with existing interview logic
2. **With Image Capture**: Integrates `ImageCapture` component for monitoring
3. **With Database**: Reads/writes to `interview_artifacts` table via Supabase
4. **With Navigation**: Proper routing between analysis → permission → interview → results

## Usage Flow

1. **Recruiter reviews resume analysis** → Clicks "Start Interview"
2. **Device setup and permissions** → Tests camera, microphone, screen sharing
3. **Live AI interview** → Monitored session with image capture
4. **Results and artifacts** → View conversation, assessment, captured images

## Security & Monitoring

- **Screen sharing required** for interview integrity
- **Image capture every 10 seconds** during interview
- **Full conversation logging** for review
- **Permission validation** before interview start
- **Navigation protection** during active sessions

## Future Enhancements

- Audio/video recording during interview
- Advanced proctoring features
- Real-time AI analysis during interview
- Integration with external proctoring services
- Enhanced security measures

## Notes

- All permissions are validated before interview starts
- Images are automatically saved to Supabase storage
- Interview artifacts are linked via application ID
- Results page handles cases where no data is available
- Responsive design works on desktop and tablet sizes
- Error handling for network issues and permission denials
