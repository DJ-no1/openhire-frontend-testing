# OpenHire AI Interview System - Frontend API Documentation

## Overview
The AI Interview System uses WebSocket connections for real-time communication between the frontend and backend. This document outlines all message formats, data structures, and integration details.

## WebSocket Connection

### Endpoint
```
ws://localhost:8000/ws/interview/{session_id}
```

### Parameters
- `session_id`: Unique identifier for the interview session (can be generated on frontend or use UUID)

---

## Message Format Structure

All messages follow this JSON structure:
```json
{
  "type": "message_type",
  "data": {
    // Message-specific data
  }
}
```

---

## 📤 OUTGOING MESSAGES (Frontend → Backend)

### 1. Start Interview
**Purpose**: Initialize an interview session with job and candidate data

```json
{
  "type": "start_interview",
  "data": {
    "job_id": "ff7f1e59-3014-4cc8-8f2e-4b3ca694ceb3",
    "candidate_id": "candidate-uuid-here",
    "resume_text": "Optional: candidate resume text",
    "preferences": {
      "max_duration": 30,
      "difficulty_level": "medium",
      "focus_areas": ["javascript", "react", "node.js"]
    }
  }
}
```

**Required Fields**:
- `job_id`: String (UUID from jobs table)
- `candidate_id`: String (UUID from users table)

**Optional Fields**:
- `resume_text`: String (if not provided, fetched from database)
- `preferences`: Object with interview settings

### 2. Candidate Response
**Purpose**: Send candidate's answer to interview questions

```json
{
  "type": "candidate_response",
  "data": {
    "response": "Yes, I have 3 years of experience with React..."
  }
}
```

**Required Fields**:
- `response`: String (candidate's answer)

### 3. Live Transcript
**Purpose**: Send real-time speech-to-text data

```json
{
  "type": "live_transcript",
  "data": {
    "transcript": "I think the best approach would be...",
    "is_final": false
  }
}
```

**Fields**:
- `transcript`: String (current speech recognition text)
- `is_final`: Boolean (true when speech recognition is complete)

### 4. End Interview
**Purpose**: Manually terminate interview session

```json
{
  "type": "end_interview",
  "data": {}
}
```

### 5. Get Status
**Purpose**: Request current interview session status

```json
{
  "type": "get_status",
  "data": {}
}
```

---

## 📥 INCOMING MESSAGES (Backend → Frontend)

### 1. Interview Started
**Purpose**: Confirmation that interview has been initialized successfully

```json
{
  "type": "interview_started",
  "data": {
    "session_id": "actual-session-uuid",
    "job_title": "Senior Frontend Developer",
    "company": "TechCorp Inc.",
    "initial_question": "Tell me about your experience with React and modern frontend development.",
    "max_duration": 30,
    "interview_phase": "introduction"
  }
}
```

**Response Data**:
- `session_id`: String (actual session ID created by system)
- `job_title`: String (position being interviewed for)
- `company`: String (company name)
- `initial_question`: String (first interview question)
- `max_duration`: Number (interview duration in minutes)
- `interview_phase`: String (current phase: "introduction", "technical", "behavioral", "conclusion")

### 2. AI Response
**Purpose**: AI interviewer's response to candidate input

```json
{
  "type": "ai_response",
  "data": {
    "response": "That's great experience. Can you walk me through a challenging project you worked on?",
    "question": "Describe a challenging React project and how you solved technical obstacles.",
    "interview_phase": "technical",
    "time_elapsed": 5.2,
    "questions_asked": 3,
    "completed": false,
    "comfort_level": "confident"
  }
}
```

**Response Data**:
- `response`: String (AI's conversational response)
- `question`: String (next interview question)
- `interview_phase`: String (current interview phase)
- `time_elapsed`: Number (minutes elapsed)
- `questions_asked`: Number (total questions asked so far)
- `completed`: Boolean (whether interview is complete)
- `comfort_level`: String (candidate's comfort: "nervous", "neutral", "confident")

### 3. Live Transcript Update
**Purpose**: Echo back live speech recognition for real-time display

```json
{
  "type": "live_transcript_update",
  "data": {
    "transcript": "I think the best approach would be to use...",
    "is_final": false
  }
}
```

### 4. Interview Ended
**Purpose**: Interview completion notification with final feedback

```json
{
  "type": "interview_ended",
  "data": {
    "final_feedback": "Thank you for the interview. You demonstrated strong technical skills...",
    "completed": true,
    "session_id": "session-uuid"
  }
}
```

### 5. Status Update
**Purpose**: Current interview session status information

```json
{
  "type": "status_update",
  "data": {
    "session_id": "session-uuid",
    "candidate_id": "candidate-uuid",
    "interview_phase": "technical",
    "time_elapsed": 12.5,
    "max_duration": 30,
    "questions_asked": 8,
    "completed": false,
    "comfort_level": "confident",
    "strengths_identified": ["react", "problem-solving"],
    "areas_to_probe": ["backend experience", "system design"]
  }
}
```

### 6. Error Messages
**Purpose**: Error notifications and debugging information

```json
{
  "type": "error",
  "message": "Job with ID xyz not found",
  "details": "Additional error context for debugging",
  "status_code": 404,
  "exception_type": "HTTPException"
}
```

**Error Fields**:
- `message`: String (user-friendly error message)
- `details`: String (additional debugging info)
- `status_code`: Number (HTTP status code if applicable)
- `exception_type`: String (exception type for debugging)

---

## 🔧 Integration Examples

### React/JavaScript WebSocket Client

```javascript
class InterviewWebSocket {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.ws = new WebSocket(`ws://localhost:8000/ws/interview/${sessionId}`);
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.ws.onopen = () => {
      console.log('✅ WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
    };
  }

  handleMessage(message) {
    switch(message.type) {
      case 'interview_started':
        this.onInterviewStarted(message.data);
        break;
      case 'ai_response':
        this.onAIResponse(message.data);
        break;
      case 'error':
        this.onError(message);
        break;
      // Handle other message types...
    }
  }

  startInterview(jobId, candidateId, preferences = {}) {
    this.send({
      type: 'start_interview',
      data: {
        job_id: jobId,
        candidate_id: candidateId,
        preferences: {
          max_duration: 30,
          difficulty_level: 'medium',
          ...preferences
        }
      }
    });
  }

  sendResponse(responseText) {
    this.send({
      type: 'candidate_response',
      data: {
        response: responseText
      }
    });
  }

  sendLiveTranscript(transcript, isFinal = false) {
    this.send({
      type: 'live_transcript',
      data: {
        transcript: transcript,
        is_final: isFinal
      }
    });
  }

  endInterview() {
    this.send({
      type: 'end_interview',
      data: {}
    });
  }

  send(message) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

// Usage Example
const interview = new InterviewWebSocket('unique-session-id');

// Start interview
interview.startInterview(
  'ff7f1e59-3014-4cc8-8f2e-4b3ca694ceb3', 
  'candidate-uuid-here',
  { max_duration: 45, difficulty_level: 'hard' }
);

// Send candidate response
interview.sendResponse('I have 5 years of experience with React...');
```

### Speech Recognition Integration

```javascript
class SpeechRecognitionHandler {
  constructor(interviewWS) {
    this.interviewWS = interviewWS;
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.setupRecognition();
  }

  setupRecognition() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Send live transcript
      if (interimTranscript) {
        this.interviewWS.sendLiveTranscript(interimTranscript, false);
      }

      // Send final transcript
      if (finalTranscript) {
        this.interviewWS.sendLiveTranscript(finalTranscript, true);
      }
    };
  }

  start() {
    this.recognition.start();
  }

  stop() {
    this.recognition.stop();
  }
}
```

---

## 📊 Data Models

### Job Details (from database)
```typescript
interface JobDetails {
  id: string;
  title: string;
  description: string;
  requirements: string;
  company: string;
  location: string;
  salary_range: string;
  experience_level: string;
  skills_required: string[];
  created_at: string;
}
```

### Candidate Details (from database)
```typescript
interface CandidateDetails {
  id: string;
  name: string;
  email: string;
  resume_text: string;
  resume_url: string;
  skills: string[];
  experience: string;
  education: string;
  created_at: string;
}
```

### Interview Preferences
```typescript
interface InterviewPreferences {
  max_duration: number;        // Minutes (default: 30)
  difficulty_level: 'easy' | 'medium' | 'hard';
  focus_areas: string[];       // Skills to focus on
}
```

---

## 🚨 Error Handling

### Common Error Types
1. **Missing Required Fields**: `job_id and candidate_id are required`
2. **Not Found**: `Job with ID xyz not found` / `Candidate with ID xyz not found`
3. **No Resume**: `No resume found for candidate`
4. **Database Errors**: `Database error: connection failed`
5. **Session Errors**: `Interview session not found`

### Error Response Structure
```json
{
  "type": "error",
  "message": "Human-readable error message",
  "details": "Technical details for debugging",
  "status_code": 404,
  "exception_type": "HTTPException"
}
```

---

## 🔄 Interview Flow

1. **Connection**: Frontend establishes WebSocket connection
2. **Start**: Send `start_interview` with job and candidate IDs
3. **Confirmation**: Receive `interview_started` with initial question
4. **Conversation Loop**:
   - Candidate speaks/types response
   - Send `candidate_response` or `live_transcript`
   - Receive `ai_response` with next question
   - Repeat until interview complete
5. **Completion**: Receive `interview_ended` with final feedback

---

## 🧪 Testing

### Test Job ID
Use this existing job ID for testing: `ff7f1e59-3014-4cc8-8f2e-4b3ca694ceb3`

### Test WebSocket Connection
```bash
# Test with wscat
wscat -c ws://localhost:8000/ws/interview/test-session-123

# Send test message
{"type": "start_interview", "data": {"job_id": "ff7f1e59-3014-4cc8-8f2e-4b3ca694ceb3", "candidate_id": "test-candidate"}}
```

---

## 📝 Notes

- All timestamps are in ISO format
- Session IDs are UUIDs generated by the system
- WebSocket connections are persistent during interview
- Live transcript is optional but recommended for better UX
- Interview phases: `introduction` → `technical` → `behavioral` → `conclusion`
- Comfort levels: `nervous`, `neutral`, `confident`

---

This documentation covers all the essential data structures and message formats needed for frontend integration with the AI Interview System.
