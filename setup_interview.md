# AI Interview System - Setup & Implementation Plan

## Overview

This document outlines the complete plan for implementing an AI Interview System with camera capture functionality, Supabase integration, and streamlined user flow.

## Current State Analysis

- ✅ Resume analysis results available (extracted resume text)
- ✅ Job description with requirements/responsibilities
- ✅ Skills comparison and matching capability
- ✅ Application/Job ID from analysis process
- ✅ Existing AI Interview System V3 component

## Proposed System Architecture

### 1. **Simplified Interview Flow**

After resume analysis completion:

```
Resume Analysis → /dashboard/interview/[id]/setup → /dashboard/interview/[id]/live
```

**Skip the preparation/review page** - go directly to device setup after resume analysis.

### 2. **Endpoint Structure**

```
/dashboard/interview/[id]/setup    → Device Check & Setup Page
/dashboard/interview/[id]/live     → Live Interview Page
```

Where `[id]` could be:

- **Application ID** (if you have application records)
- **Job ID** (if linking directly to job)
- **Interview Session ID** (generated when starting interview process)

## Page Specifications

### **Page 1: `/dashboard/interview/[id]/setup` - Device Setup & Pre-Interview**

#### **Data Sources:**

- Use `[id]` to fetch job details from backend
- Get resume analysis results (from previous page or re-fetch)
- Load any existing application data

#### **Page Sections:**

1. **Camera Check Section:**

   - Live video preview with quality indicators
   - "Test Camera" button
   - **Image Capture**: Automatic setup photo capture once camera is working
   - Preview captured setup photo
   - Quality validation (resolution, lighting)

2. **Microphone Check Section:**

   - Audio level visualization with real-time feedback
   - Test recording and playback functionality
   - Volume level indicators

3. **System Check Section:**

   - Browser compatibility check (WebRTC support)
   - WebSocket connection test to backend
   - Backend AI service health check
   - Speech recognition capability test

4. **Interview Auto-Configuration:**

   - Auto-populate interview parameters from job/resume data
   - Duration based on job requirements
   - Difficulty level from job complexity
   - Focus areas from job skills vs resume skills

5. **Ready to Start Section:**
   - Display all green checkmarks for completed checks
   - Show setup photo preview
   - Display interview summary (duration, focus areas)
   - "Start Interview" button (enabled only after all checks pass)

#### **Navigation Flow:**

- **From Resume Analysis**: Direct redirect with data
- **To Live Interview**: Pass validated setup data

### **Page 2: `/dashboard/interview/[id]/live` - Live Interview with Monitoring**

#### **Enhanced Features:**

- Use existing AI Interview System V3 as base
- Pre-populate all setup data from previous step
- Skip manual configuration phase
- **Enhanced Image Capture**: Periodic screenshots during interview

#### **Image Capture During Interview:**

- **Periodic Screenshots**: Every 2-3 minutes automatically
- **Phase Transition Captures**: When moving between interview phases
- **AI-Triggered Captures**: When AI detects significant moments
- **Manual Captures**: Admin/recruiter can manually trigger

#### **Visual Indicators:**

- Small camera flash animation during capture
- Subtle notification: "Photo captured"
- Progress indicator showing capture history
- Image gallery sidebar (optional, for admin view)

## Image Capture & Storage System

### **Supabase Storage Structure:**

```
interview-images/
├── setup/
│   └── [sessionId]/
│       └── setup-photo.jpg
├── sessions/
│   └── [sessionId]/
│       ├── capture-001.jpg
│       ├── capture-002.jpg
│       └── capture-n.jpg
└── artifacts/
    └── [sessionId]/
        ├── final-summary.jpg
        └── key-moments/
```

### **Database Schema - AI Artifacts Table:**

```sql
interview_artifacts {
  id: uuid
  session_id: text
  candidate_id: text
  job_id: text
  artifact_type: enum ('setup_photo', 'periodic_capture', 'key_moment', 'final_summary')
  image_url: text (Supabase bucket URL)
  phase: text (setup, introduction, technical, behavioral, conclusion)
  timestamp: timestamp
  metadata: json {
    question_number?: number,
    comfort_level?: string,
    ai_analysis?: object,
    manual_capture?: boolean
  }
}
```

### **Image Capture Implementation Strategy:**

#### **Setup Phase Capture:**

- **Purpose**: Identity verification and initial candidate photo
- **When**: During camera check phase, after successful test
- **Storage**: Single "setup photo" per interview session
- **Filename**: `setup-[timestamp].jpg`
- **Path**: `interview-images/setup/[sessionId]/`

#### **Live Interview Capture:**

- **Purpose**: Interview monitoring and AI artifacts
- **Triggers**:
  - **Automatic**: Every 2-3 minutes during interview
  - **Phase Transitions**: When moving between interview phases
  - **AI Triggered**: When AI detects significant moments (comfort level changes, engagement drops)
  - **Manual**: Admin/recruiter manual capture for important moments
- **Filename Pattern**: `capture-[phase]-[timestamp].jpg`
- **Path**: `interview-images/sessions/[sessionId]/`

### **Technical Implementation:**

#### **Canvas-based Image Capture:**

```javascript
const captureImage = async (videoElement) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  context.drawImage(videoElement, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.8);
  });
};
```

#### **Supabase Upload Function:**

```javascript
const uploadInterviewImage = async (sessionId, imageBlob, type, metadata) => {
  const filename = `${type}-${Date.now()}.jpg`;
  const filePath = `interview-images/${
    type === "setup" ? "setup" : "sessions"
  }/${sessionId}/${filename}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("interview-images")
    .upload(filePath, imageBlob);

  if (!error) {
    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("interview-images").getPublicUrl(filePath);

    // Save to AI artifacts table
    await saveToArtifacts(sessionId, publicUrl, type, metadata);
    return publicUrl;
  }
};
```

## Data Flow Strategy

### **Option A: URL + Session Storage**

```
/setup?jobId=123&resumeId=456
→ Store interview config in sessionStorage
→ /live (read from sessionStorage)
```

### **Option B: Database + Session ID**

```
/setup/[applicationId]
→ Save interview config to DB with sessionId
→ /live/[sessionId] (fetch from DB)
```

### **Option C: URL Parameters (Simplest)**

```
/setup/[jobId]?resumeData=encoded
→ /live/[sessionId]?preconfig=encoded
```

## AI Artifacts Integration

### **Real-time Analysis:**

- Link captured images with AI interview analysis
- Store comfort level, engagement metrics with each image
- Create visual timeline of interview progression

### **Post-Interview Artifacts:**

- Generate interview summary with key moment images
- Create candidate behavior analysis report
- Provide recruiter with visual interview highlights

### **AI Enhancement Features:**

- **Engagement Tracking**: Use images to analyze candidate engagement
- **Comfort Level Analysis**: Visual cues for nervousness, confidence
- **Attention Monitoring**: Track if candidate is looking at camera
- **Professional Behavior**: Assess professional demeanor

## Privacy & Compliance

### **User Consent:**

- Clear notification about image capture during setup
- Option to disable periodic capture (keep only setup photo)
- Transparent about data usage and storage
- Explicit consent for AI analysis of images

### **Data Security:**

- Supabase RLS (Row Level Security) policies
- Time-based image deletion (auto-delete after 90 days)
- Encrypted storage and secure URL access
- Access logging for audit trails

### **Compliance Features:**

- GDPR-compliant data handling
- Option for candidates to request image deletion
- Audit trail of all image captures
- Data retention policy enforcement

## Benefits of This Approach

1. **Streamlined UX**: Skip unnecessary review page, direct flow
2. **Visual Documentation**: Complete visual record of interview process
3. **AI Enhancement**: Better context for AI analysis with visual data
4. **Recruiter Tools**: Visual aids for candidate evaluation
5. **Verification**: Identity and engagement verification capabilities
6. **Analytics**: Visual data for interview process improvement
7. **Quality Assurance**: Monitor interview quality and candidate experience

## Implementation Phases

### **Phase 1: Basic Setup Page**

- Create `/dashboard/interview/[id]/setup` route
- Implement device checks (camera, microphone, system)
- Add basic image capture during setup
- Auto-configure interview parameters

### **Phase 2: Enhanced Image Capture**

- Implement Supabase storage integration
- Add periodic capture during live interview
- Create AI artifacts database table
- Build image management system

### **Phase 3: AI Integration**

- Link image captures with AI interview analysis
- Implement comfort level and engagement tracking
- Add manual capture capabilities
- Build post-interview visual reports

### **Phase 4: Advanced Features**

- Add real-time AI image analysis
- Implement behavior monitoring
- Create advanced analytics dashboard
- Add mobile device support

## Technical Questions to Consider

### **Capture Strategy:**

1. **Capture Frequency**: How often should we capture during interview?
   - Recommendation: Every 2-3 minutes + phase transitions
2. **Storage Limits**: What's the maximum storage per interview session?
   - Recommendation: 50MB limit per session (≈30-40 images)
3. **Image Quality**: What resolution/compression for optimal balance?
   - Recommendation: 1280x720, JPEG 80% quality

### **User Experience:**

4. **Privacy Settings**: Should candidates control capture frequency?
   - Recommendation: Basic on/off toggle, not frequency control
5. **Mobile Support**: How does this work on mobile devices?
   - Recommendation: Responsive design, same functionality
6. **Offline Handling**: What if image upload fails during interview?
   - Recommendation: Queue uploads, retry on reconnection

### **Technical Implementation:**

7. **Browser Compatibility**: Which browsers support all features?
   - Recommendation: Chrome/Edge/Firefox latest versions
8. **Performance Impact**: How does periodic capture affect interview performance?
   - Recommendation: Optimize capture size, background processing
9. **Error Recovery**: How to handle capture failures gracefully?
   - Recommendation: Continue interview, log errors, retry later

### **Data Management:**

10. **Data Retention**: How long should images be stored?
    - Recommendation: 90 days default, configurable per organization
11. **Access Control**: Who can view captured images?
    - Recommendation: Candidate, assigned recruiters, admins only
12. **Audit Trail**: How to track image access and modifications?
    - Recommendation: Log all access with user ID and timestamp

## Future Enhancements

### **Advanced AI Features:**

- Real-time emotion detection from captured images
- Attention tracking (eye contact with camera)
- Professional dress code analysis
- Background environment assessment

### **Integration Possibilities:**

- Integration with ATS (Applicant Tracking Systems)
- Video interview recording with synchronized images
- Candidate feedback system with visual elements
- Recruiter collaboration tools with shared image access

### **Analytics & Reporting:**

- Interview quality metrics based on visual data
- Candidate engagement scoring
- Recruiter decision support with visual evidence
- Process improvement insights from visual analytics

## Next Steps

1. **Create setup page route**: `/dashboard/interview/[id]/setup`
2. **Implement device checking functionality**
3. **Add basic camera image capture**
4. **Set up Supabase storage bucket and policies**
5. **Create AI artifacts database table**
6. **Integrate with existing AI Interview System V3**
7. **Test complete flow from resume analysis to live interview**

---

_This document serves as the master plan for implementing the AI Interview System with enhanced visual capabilities. All implementation should refer back to this document for consistency and completeness._
