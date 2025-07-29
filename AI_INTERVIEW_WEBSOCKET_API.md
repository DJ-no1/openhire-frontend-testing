# AI Interview WebSocket API Documentation

## Overview

This WebSocket API enables real-time, AI-powered job interviews. The client (frontend) connects, initializes an interview session, submits answers, and receives questions and feedback from the AI interviewer.

## WebSocket Endpoint

```
ws://localhost:8000/ws/ai-interview
```

### Query Parameters (optional)

- `session_id`: (string) Unique session identifier. If not provided, the server generates one.
- `candidate_id`: (string) Candidate identifier for tracking.

---

## Message Formats

### Client → Server

#### 1. Initialize Interview

Start the interview by sending job and candidate details.

```json
{
  "type": "initialize_interview",
  "data": {
    "session_id": "optional_session_id",
    "candidate_id": "candidate_123",
    "job_description": "Full job description text...",
    "candidate_resume": "Full resume text..."
    // Optionally, you can add "num_questions": 7 for dynamic question count (if supported)
  }
}
```

#### 2. Submit Answer

Send the candidate's answer to the current question.

```json
{
  "type": "submit_answer",
  "answer": "Candidate's response to the question..."
}
```

#### 3. End Interview

End the interview early.

```json
{
  "type": "end_interview"
}
```

#### 4. Ping

Check connection health.

```json
{
  "type": "ping"
}
```

---

### Server → Client

#### 1. Connection Success

Sent after a successful connection.

```json
{
  "type": "connection_success",
  "message": "Successfully connected to AI Interview",
  "session_id": "session_123",
  "timestamp": "2025-01-28T10:30:00"
}
```

#### 2. Welcome

Instructions for starting the interview.

```json
{
  "type": "welcome",
  "message": "Welcome to AI Interview! Please send an 'initialize_interview' message with job description and resume to begin.",
  "session_id": "session_123",
  "instructions": {
    "step_1": "...",
    "step_2": "...",
    "step_3": "...",
    "note": "..."
  },
  "timestamp": "..."
}
```

#### 3. Interview Initialized

Confirmation of interview setup.

```json
{
  "type": "interview_initialized",
  "session_id": "session_123",
  "message": "Interview session initialized successfully",
  "total_questions": 5,
  "timestamp": "..."
}
```

#### 4. Question

AI-generated interview question.

```json
{
  "type": "question",
  "question": "Tell me about your background and what interests you about this role?",
  "question_number": 1,
  "total_questions": 5,
  "session_id": "session_123",
  "timestamp": "..."
}
```

#### 5. Answer Received

Acknowledgment of answer submission.

```json
{
  "type": "answer_received",
  "message": "Answer received successfully",
  "session_id": "session_123",
  "timestamp": "..."
}
```

#### 6. Interview Completed

Final analysis and feedback after all questions.

```json
{
  "type": "interview_completed",
  "analysis": {
    "overall_score": 8.5,
    "technical_score": 8.0,
    "communication_score": 9.0,
    "problem_solving_score": 8.0,
    "cultural_fit_score": 9.0,
    "strengths": ["Strong communication", "Relevant experience"],
    "areas_for_improvement": ["Technical depth", "System design"],
    "overall_feedback": "Strong candidate with good potential...",
    "recommendation": "hire"
  },
  "session_id": "session_123",
  "message": "Interview analysis completed",
  "timestamp": "..."
}
```

#### 7. Error

Error messages for invalid input or server issues.

```json
{
  "type": "error",
  "message": "Error description",
  "timestamp": "..."
}
```

#### 8. Pong

Response to ping.

```json
{
  "type": "pong",
  "timestamp": "..."
}
```

---

## Interview Flow

1. Connect to the WebSocket endpoint.
2. Wait for `connection_success` and `welcome` messages.
3. Send `initialize_interview` with job and resume data.
4. Receive `interview_initialized` and the first `question`.
5. For each question, send `submit_answer` and receive the next `question`.
6. After all questions, receive `interview_completed` with analysis.
7. Optionally, send `end_interview` to finish early.

---

## Notes

- All messages are JSON objects.
- The number of questions is currently fixed at 5 unless dynamic support is added.
- Error handling: Always check for messages of type `error`.
- Each message includes a `timestamp` for tracking.

---

If you need more details or want to support dynamic question counts, let me know!
