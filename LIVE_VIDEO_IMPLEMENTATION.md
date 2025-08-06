# Live Video Component Implementation

## Overview

This implementation provides a comprehensive live video streaming system with WebRTC and WebSocket technologies for real-time candidate-recruiter communication with automatic image capture capabilities.

## Features Implemented

### 🎥 Live Video Streaming

- **WebRTC Peer-to-Peer**: Direct video streaming between candidate and recruiter
- **WebSocket Signaling**: Real-time coordination server for connection establishment
- **Multi-Device Support**: Camera and microphone selection with device enumeration
- **Connection Status**: Real-time monitoring of connection states

### 📷 Automatic Image Capture

- **Periodic Capture**: Configurable intervals (30s, 1min, 2min, 3min, 5min)
- **Supabase Integration**: Automatic upload to 'pictures' storage bucket
- **Database Storage**: Metadata saved to `interview_artifacts` table
- **Progress Tracking**: Upload progress and capture count monitoring

### 🔧 Device Setup & Testing

- **Camera Testing**: Live preview with permission handling
- **Microphone Testing**: Audio level visualization and recording test
- **Setup Photo**: Automatic identity verification photo capture
- **Device Selection**: Dropdown selection for multiple cameras/microphones

### 🚀 Test Infrastructure

- **Comprehensive Test Suite**: Complete workflow from device setup to live streaming
- **Multiple Test Pages**: Individual component testing and full integration
- **Role Simulation**: Test both candidate and recruiter perspectives
- **Link Sharing**: Generate test URLs for peer-to-peer testing

## Components Created

### Core Components

1. **`LiveVideoV2`** (`/src/components/live-video-v2.tsx`)

   - Enhanced live video component with image capture
   - WebRTC connection management
   - Supabase storage integration
   - Real-time status monitoring

2. **`DeviceSetup`** (`/src/components/device-setup.tsx`)
   - Camera and microphone permission testing
   - Device enumeration and selection
   - Audio level visualization
   - Setup photo capture

### Test Pages

1. **`/test`** - Test Dashboard

   - Overview of all available test components
   - System status monitoring
   - Quick navigation to test pages

2. **`/test/comprehensive-video`** - Complete Test Suite

   - 3-step workflow: Setup → Configure → Test
   - Role configuration (candidate/recruiter)
   - Link sharing for peer testing
   - Image capture configuration

3. **`/test/live-video`** - Simple Live Video Test

   - Direct live video component testing
   - Basic configuration options
   - Quick peer connection setup

4. **`/test/device-setup`** - Device Testing Only
   - Standalone device permission testing
   - Device information display
   - Setup photo capture testing

## Database Schema

### Required Tables

```sql
-- Already exists in your schema
interview_artifacts (
  id uuid PRIMARY KEY,
  interview_id uuid REFERENCES interviews(id),
  conversation jsonb,
  image_url text,
  timestamp timestamp,
  detailed_score jsonb,
  overall_score numeric,
  overall_feedback text,
  status text
);

-- New table for watch links (see database-schemas/interview_watch_tokens.sql)
interview_watch_tokens (
  id uuid PRIMARY KEY,
  interview_id uuid REFERENCES interviews(id),
  recruiter_id uuid REFERENCES users(id),
  token uuid UNIQUE,
  expires_at timestamp,
  created_at timestamp
);
```

### Supabase Storage

```
Storage Bucket: 'pictures'
Path Structure: interview_[interviewId]_[imageId].jpg
Public Access: Configured for secure access
```

## Server Architecture

### WebSocket Server (Port 3001)

- **Location**: `/websocket-server/server.js`
- **Purpose**: WebRTC signaling and real-time coordination
- **Events**:
  - `join-interview-candidate`
  - `join-interview-recruiter`
  - `webrtc-offer/answer/ice-candidate`
  - Connection status management

### Next.js Server (Port 3000)

- **Location**: Main application server
- **APIs**: Watch link generation (`/api/interviews/[id]/watch-link`)
- **Pages**: Test dashboard and component testing

## Usage Instructions

### 1. Testing Device Setup

```bash
# Navigate to device setup test
http://localhost:3000/test/device-setup

# Test camera and microphone permissions
# Verify device detection and selection
# Capture setup photo automatically
```

### 2. Testing Live Video (Simple)

```bash
# Navigate to live video test
http://localhost:3000/test/live-video

# Configure role (candidate/recruiter)
# Set interview ID and user ID
# Copy link for peer testing
# Start video streaming
```

### 3. Comprehensive Testing

```bash
# Navigate to comprehensive test suite
http://localhost:3000/test/comprehensive-video

# Step 1: Complete device setup
# Step 2: Configure test parameters
# Step 3: Start live video with image capture
# Share link for peer-to-peer testing
```

### 4. Peer Testing Workflow

1. **Candidate Setup**:

   - Complete device setup
   - Configure as 'candidate' role
   - Start video streaming
   - Images captured automatically

2. **Recruiter Setup**:
   - Use shared link or configure manually
   - Set role as 'recruiter'
   - Same interview ID as candidate
   - Watch live video stream

## Technical Features

### WebRTC Configuration

- **STUN Servers**: Multiple Google STUN servers for NAT traversal
- **ICE Candidates**: Automatic exchange for connection establishment
- **Media Constraints**: HD video (1280x720), echo cancellation, noise suppression

### Error Handling

- **Connection Recovery**: Automatic reconnection attempts
- **Permission Errors**: Clear error messages for denied permissions
- **Upload Failures**: Retry logic for image uploads
- **Network Issues**: Connection state monitoring and recovery

### Performance Optimizations

- **Image Compression**: JPEG compression at 80% quality
- **Canvas Optimization**: Hidden canvas for efficient image capture
- **Memory Management**: Proper cleanup of streams and connections
- **Background Processing**: Non-blocking image upload

## Security Features

### Watch Link System

- **Secure Tokens**: UUID-based access tokens
- **Time Expiration**: 24-hour token expiry
- **Permission Validation**: Recruiter ownership verification
- **Database Tracking**: Full audit trail of watch link usage

### Privacy Protection

- **Permission Requests**: Explicit user consent for camera/microphone
- **Data Encryption**: Secure WebRTC connections
- **Storage Security**: Supabase RLS policies
- **Local Processing**: Image capture happens client-side

## Next Steps

### Integration with Existing System

1. **Connect to AI Interview**: Integrate with existing interview system
2. **Resume Integration**: Link with resume analysis results
3. **Job Matching**: Connect with job application workflow
4. **Recruiter Dashboard**: Add live monitoring to recruiter views

### Production Deployment

1. **Environment Variables**: Configure Supabase keys
2. **TURN Servers**: Add TURN servers for complex networks
3. **CDN Integration**: Optimize for global deployment
4. **Monitoring**: Add analytics and error tracking

## Files Modified/Created

### New Components

- `/src/components/live-video-v2.tsx`
- `/src/components/device-setup.tsx`

### New Test Pages

- `/src/app/test/page.tsx` (updated)
- `/src/app/test/comprehensive-video/page.tsx`
- `/src/app/test/live-video/page.tsx`
- `/src/app/test/device-setup/page.tsx`

### Database Schema

- `/database-schemas/interview_watch_tokens.sql`

### Server Configuration

- `/websocket-server/server.js` (already exists, running on port 3001)

## System Status

✅ WebSocket Server: Running on localhost:3001
✅ Next.js Server: Running on localhost:3000
✅ Device Setup: Fully functional with auto-capture
✅ Live Video: WebRTC peer-to-peer connections working
✅ Image Capture: Automatic upload to Supabase storage
✅ Test Infrastructure: Complete test suite available

---

**Ready for Testing**: Navigate to `http://localhost:3000/test` to start testing all components!
