# AI Interview WebSocket API - Frontend Integration Guide

## 📋 **Quick Start**

### **WebSocket Endpoint**

```
ws://localhost:8000/interview/{application_id}
```

### **Test Page**

```
http://localhost:8000/interview_test.html
```

### **Health Check**

```
GET /api/health
```

---

## 🎯 **System Overview**

The AI Interview System provides:

- **Adaptive Questioning**: 6+ questions with dynamic follow-ups and bonus questions
- **Industry-Specific Assessment**: IT, BFSI, Healthcare, Education, Sales, Government
- **Real-time Communication**: WebSocket-based with human-in-the-loop workflow
- **Comprehensive Scoring**: Universal + Industry-specific competency analysis
- **Command Support**: pause, resume, end commands during interview
- **Timer Management**: Automatic time tracking with pause/resume functionality

---

## 🔌 **WebSocket Connection**

### **1. Basic Connection Setup**

```javascript
const applicationId = "550e8400-e29b-41d4-a716-446655440000";
const wsUrl = `ws://localhost:8000/interview/${applicationId}`;

const websocket = new WebSocket(wsUrl);

websocket.onopen = () => {
  console.log("Connected to AI Interview System");
  // Start interview automatically on connection
  startInterview();
};

websocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleInterviewMessage(data);
};

websocket.onclose = (event) => {
  console.log("Interview connection closed", event.code);
};

websocket.onerror = (error) => {
  console.error("WebSocket error:", error);
};
```

---

## 📤 **Messages TO Send (Client → Server)**

### **1. Start Interview**

```javascript
const startMessage = {
  type: "start_interview",
  payload: {},
};
websocket.send(JSON.stringify(startMessage));
```

### **2. Submit Answer (Including Commands)**

```javascript
const answerMessage = {
  type: "submit_answer",
  payload: {
    answer:
      "I have 5 years of experience in Python development and I'm passionate about creating scalable applications...",
  },
};
websocket.send(JSON.stringify(answerMessage));
```

**Special Commands You Can Send as Answers:**

- `"end"`, `"quit"`, `"exit"` - Immediately end interview and trigger final assessment
- `"pause"` - Pause the interview timer (time stops counting)
- Regular answers - Continue normal interview flow

**Note**: After pausing, any regular answer will automatically resume the interview.

### **3. Pause Interview**

```javascript
const pauseMessage = {
  type: "pause_interview",
  payload: {},
};
websocket.send(JSON.stringify(pauseMessage));
```

### **4. Resume Interview**

```javascript
const resumeMessage = {
  type: "resume_interview",
  payload: {},
};
websocket.send(JSON.stringify(resumeMessage));
```

### **5. Get Status**

```javascript
const statusMessage = {
  type: "get_status",
  payload: {},
};
websocket.send(JSON.stringify(statusMessage));
```

### **6. Health Check (Ping)**

```javascript
const pingMessage = {
  type: "ping",
  payload: {},
};
websocket.send(JSON.stringify(pingMessage));
```

---

## 📥 **Messages TO Expect (Server → Client)**

### **1. Interview Started**

```javascript
{
    "type": "interview_started",
    "session_id": "interview_20250814_143022",
    "candidate_name": "John Doe",
    "job_title": "Software Engineer",
    "duration": 20,
    "status": "initialized"
}
```

### **2. New Question**

```javascript
{
    "type": "new_question",
    "question": "Tell me about yourself and what interests you in this role.",
    "question_number": 1,
    "question_type": "icebreaker",  // Types: icebreaker, resume, scenario, bonus, clarification
    "is_followup": false,
    "is_clarification": false,
    "time_remaining": 1200,
    "progress": 10,
    "question_context": {
        "type": "icebreaker",
        "question_number": 1,
        "is_followup": false,
        "time_remaining": 1200
    }
}
```

**Question Types:**

- `icebreaker` - Opening rapport-building questions
- `resume` - Experience and background questions
- `scenario` - Situational and behavioral questions
- `bonus` - Additional questions if time permits (max 4)
- `clarification` - Follow-up for vague/unclear answers

### **3. Interview Completed**

```javascript
{
    "type": "interview_completed",
    "message": "Interview completed successfully",
    "final_assessment": {
        "overall_score": 85,
        "technical_score": 78,
        "universal_scores": {
            "communication_score": 88,
            "problem_solving_score": 82,
            "leadership_potential_score": 75,
            "adaptability_score": 90,
            "teamwork_score": 85,
            "cultural_fit_score": 87
        },
        "industry_competency_scores": {
            "technical_proficiency": 80,
            "system_thinking": 75,
            "analytical_skills": 85,
            "project_understanding": 78,
            "learning_ability": 88
        },
        "industry_type": "IT",
        "final_recommendation": "hire",  // Values: strong_hire, hire, further_assessment, no_hire
        "confidence_level": "high",     // Values: high, medium, low
        "interview_quality_score": 92,
        "feedback": {
            "universal_feedback_for_recruiters": "Strong candidate with excellent communication skills and solid technical knowledge. Demonstrates good problem-solving abilities and cultural alignment.",
            "universal_feedback_for_candidate": "Great job on demonstrating your technical skills and communication abilities. Consider expanding on leadership examples in future interviews.",
            "industry_specific_feedback": {
                "technical_feedback_for_recruiters": "Shows strong technical proficiency in Python and system design. Good understanding of software development lifecycle.",
                "technical_feedback_for_candidate": "Your technical knowledge is solid. Consider diving deeper into distributed systems and architecture patterns.",
                "domain_strengths": ["Python expertise", "Problem-solving approach", "SDLC knowledge"],
                "domain_improvement_areas": ["System design depth", "Cloud architecture", "Performance optimization"]
            },
            "areas_of_improvement_for_candidate": ["Leadership examples", "System design depth", "Strategic thinking"],
            "overall_feedback_for_recruiters": "Recommended for hire - strong technical foundation with good cultural fit."
        },
        "interview_metrics": {
            "duration": "18:45",
            "questions_answered": 8,
            "engagement_level": 8.2,
            "completion_status": "completed"
        }
    },
    "session_id": "interview_20250814_143022"
}
```

**Industry Types Supported:**

- `IT` - Information Technology
- `BFSI` - Banking, Financial Services, Insurance
- `HEALTHCARE` - Healthcare, Pharma, MedTech
- `EDUCATION` - Education & EdTech
- `SALES` - Sales & Marketing
- `GOVERNMENT` - Government & Public Sector

### **4. Status Update**

```javascript
{
    "type": "status_update",
    "status": "processing",
    "message": "Processing your answer...",
    "progress": 45,
    "time_remaining": 900
}
```

### **5. Interview Paused**

```javascript
{
    "type": "interview_paused",
    "message": "Interview has been paused",
    "session_id": "interview_20250814_143022",
    "time_remaining": 850
}
```

### **6. Interview Resumed**

```javascript
{
    "type": "interview_resumed",
    "message": "Interview has been resumed",
    "session_id": "interview_20250814_143022"
}
```

### **7. Error Messages**

```javascript
{
    "type": "error",
    "error_code": "SESSION_NOT_FOUND",
    "message": "Session not found or expired",
    "recoverable": false,
    "details": {
        "suggestion": "Please start a new interview session"
    }
}
```

### **8. Ping Response**

```javascript
{
    "type": "pong",
    "timestamp": "2025-08-14T14:30:22.123Z"
}
```

---

## � **Interview Flow & Process**

### **1. Interview Structure**

```
📋 Setup (Auto) → 🎯 Main Questions (6+) → 🎁 Bonus Questions (0-4) →  Final Assessment
```

### **2. Question Flow**

- **Main Questions**: 6+ planned questions based on time allocation
  - Ice breakers (1-2 questions)
  - Resume/Experience (2-3 questions)
  - Scenarios/Behavioral (2-4 questions)
- **Follow-ups**: Dynamic based on answer quality
- **Clarifications**: Max 2 per question if answers are vague/unclear
- **Bonus Questions**: Up to 4 additional questions if time permits

### **3. Time Management**

- **Dynamic Limits**: Base questions + 5 bonus allowance
- **Auto-pause**: Timer pauses during processing
- **Commands**: Use "pause" command to manually pause timer
- **Completion**: Auto-completes at time limit or max questions

### **4. Assessment Generation**

- **Triggered When**: Time up, max questions reached, or "end" command
- **Industry Analysis**: Automatic industry detection and scoring
- **Single Save**: Only saves once at completion (no intermediate saves)
- **Comprehensive**: Universal + Industry-specific + Detailed feedback

---

## �🎯 **Complete React/Next.js Example**

```javascript
import { useState, useEffect, useRef } from "react";

const AIInterviewComponent = ({ applicationId }) => {
  const [ws, setWs] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [finalAssessment, setFinalAssessment] = useState(null);

  const addMessage = (type, content) => {
    setMessages((prev) => [...prev, { type, content, timestamp: new Date() }]);
  };

  const connectToInterview = () => {
    if (!applicationId) {
      alert("Application ID is required");
      return;
    }

    setConnectionStatus("connecting");
    const wsUrl = `ws://localhost:8000/interview/${applicationId}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setConnectionStatus("connected");
      addMessage("system", "Connected to AI Interview System");

      // Start interview automatically
      websocket.send(
        JSON.stringify({
          type: "start_interview",
          payload: {},
        })
      );
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleMessage(data);
    };

    websocket.onclose = () => {
      setConnectionStatus("disconnected");
      addMessage("system", "Disconnected from interview");
    };

    websocket.onerror = (error) => {
      setConnectionStatus("error");
      addMessage("error", "Connection error occurred");
    };

    setWs(websocket);
  };

  const handleMessage = (data) => {
    switch (data.type) {
      case "interview_started":
        addMessage("system", `Interview started for ${data.candidate_name}`);
        break;

      case "new_question":
        setCurrentQuestion(data.question);
        setQuestionNumber(data.question_number);
        setProgress(data.progress || 0);
        setTimeRemaining(data.time_remaining || 0);
        addMessage("question", `Q${data.question_number}: ${data.question}`);
        break;

      case "interview_completed":
        setInterviewCompleted(true);
        setFinalAssessment(data.final_assessment);
        addMessage("system", "Interview completed!");
        break;

      case "status_update":
        setProgress(data.progress || progress);
        setTimeRemaining(data.time_remaining || timeRemaining);
        addMessage("system", data.message);
        break;

      case "error":
        addMessage("error", `Error: ${data.message}`);
        break;

      default:
        console.log("Unknown message type:", data);
    }
  };

  const submitAnswer = () => {
    if (!userAnswer.trim()) {
      alert("Please enter an answer");
      return;
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "submit_answer",
          payload: { answer: userAnswer },
        })
      );

      addMessage("user", `Your answer: ${userAnswer}`);
      setUserAnswer("");
      setCurrentQuestion("");
    }
  };

  const pauseInterview = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "pause_interview",
          payload: {},
        })
      );
    }
  };

  const resumeInterview = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "resume_interview",
          payload: {},
        })
      );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="ai-interview-container">
      {/* Connection Status */}
      <div className={`status ${connectionStatus}`}>
        Status: {connectionStatus}
        {connectionStatus === "disconnected" && (
          <button onClick={connectToInterview}>Start Interview</button>
        )}
      </div>

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      )}

      {/* Interview Metadata */}
      {questionNumber > 0 && (
        <div className="interview-info">
          <span>Question {questionNumber}</span>
          <span>Time: {formatTime(timeRemaining)}</span>
          <button onClick={pauseInterview}>Pause</button>
          <button onClick={resumeInterview}>Resume</button>
        </div>
      )}

      {/* Current Question */}
      {currentQuestion && !interviewCompleted && (
        <div className="question-section">
          <h3>Current Question:</h3>
          <p>{currentQuestion}</p>

          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows="4"
          />

          <button onClick={submitAnswer}>Submit Answer</button>
        </div>
      )}

      {/* Final Assessment */}
      {interviewCompleted && finalAssessment && (
        <div className="assessment-section">
          <h2>Interview Complete! 🎉</h2>
          <div className="scores">
            <p>
              <strong>Overall Score:</strong> {finalAssessment.overall_score}%
            </p>
            <p>
              <strong>Technical Score:</strong>{" "}
              {finalAssessment.technical_score}%
            </p>
            <p>
              <strong>Recommendation:</strong>{" "}
              {finalAssessment.final_recommendation}
            </p>
            <p>
              <strong>Confidence:</strong> {finalAssessment.confidence_level}
            </p>
          </div>

          {finalAssessment.industry_competency_scores && (
            <div className="industry-scores">
              <h4>Industry Skills ({finalAssessment.industry_type}):</h4>
              <ul>
                {Object.entries(finalAssessment.industry_competency_scores).map(
                  ([skill, score]) => (
                    <li key={skill}>
                      {skill
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      : {score}%
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {finalAssessment.interview_metrics && (
            <div className="interview-metrics">
              <h4>Interview Metrics:</h4>
              <p>
                <strong>Duration:</strong>{" "}
                {finalAssessment.interview_metrics.duration}
              </p>
              <p>
                <strong>Questions Answered:</strong>{" "}
                {finalAssessment.interview_metrics.questions_answered}
              </p>
              <p>
                <strong>Engagement Level:</strong>{" "}
                {finalAssessment.interview_metrics.engagement_level}/10
              </p>
            </div>
          )}

          {finalAssessment.universal_scores && (
            <div className="universal-scores">
              <h4>Universal Skills:</h4>
              <ul>
                <li>
                  Communication:{" "}
                  {finalAssessment.universal_scores.communication_score}%
                </li>
                <li>
                  Problem Solving:{" "}
                  {finalAssessment.universal_scores.problem_solving_score}%
                </li>
                <li>
                  Leadership:{" "}
                  {finalAssessment.universal_scores.leadership_potential_score}%
                </li>
                <li>
                  Adaptability:{" "}
                  {finalAssessment.universal_scores.adaptability_score}%
                </li>
                <li>
                  Teamwork: {finalAssessment.universal_scores.teamwork_score}%
                </li>
                <li>
                  Cultural Fit:{" "}
                  {finalAssessment.universal_scores.cultural_fit_score}%
                </li>
              </ul>
            </div>
          )}

          {finalAssessment.feedback && (
            <div className="feedback">
              <h4>Feedback for Candidate:</h4>
              <p>{finalAssessment.feedback.universal_feedback_for_candidate}</p>

              {finalAssessment.feedback.industry_specific_feedback && (
                <div className="industry-feedback">
                  <h5>Technical Feedback:</h5>
                  <p>
                    {
                      finalAssessment.feedback.industry_specific_feedback
                        .technical_feedback_for_candidate
                    }
                  </p>

                  {finalAssessment.feedback.industry_specific_feedback
                    .domain_strengths?.length > 0 && (
                    <div>
                      <strong>Strengths:</strong>
                      <ul>
                        {finalAssessment.feedback.industry_specific_feedback.domain_strengths.map(
                          (strength, idx) => (
                            <li key={idx}>{strength}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {finalAssessment.feedback.areas_of_improvement_for_candidate
                ?.length > 0 && (
                <div>
                  <strong>Areas for Improvement:</strong>
                  <ul>
                    {finalAssessment.feedback.areas_of_improvement_for_candidate.map(
                      (area, idx) => (
                        <li key={idx}>{area}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Message Log */}
      <div className="messages">
        <h4>Interview Log:</h4>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <span className="timestamp">
              {msg.timestamp.toLocaleTimeString()}
            </span>
            <span className="content">{msg.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInterviewComponent;
```

---

## ⚡ **Key Implementation Tips**

### **1. Connection Management**

- Always validate `application_id` format (UUID)
- Handle connection failures gracefully
- Implement auto-reconnection for network issues
- **Port Changed**: Use port 8000 (not 8000)

### **2. Message Handling**

- Parse all incoming JSON messages
- Handle unknown message types gracefully
- Log all messages for debugging
- **New**: Handle `final_assessment` field (not `assessment`)
- **Commands**: Support "end", "quit", "exit", "pause" as answers

### **3. User Experience**

- Show connection status clearly
- Display progress bar during interview
- Provide real-time feedback
- Handle long answers (textarea vs input)
- **Show Question Types**: Display icebreaker, resume, scenario, bonus, clarification
- **Industry Display**: Show detected industry type
- **Enhanced Metrics**: Display duration, engagement, question count

### **4. Error Handling**

- Display user-friendly error messages
- Provide recovery options
- Log technical errors for debugging
- **Single Save**: Data only saves once at completion

### **5. State Management**

- Track interview progress
- Store message history
- Handle pause/resume functionality
- Manage connection states
- **Command Support**: Integrate pause/end commands in UI

---

## **Testing & Debugging**

### **Sample Application IDs for Testing:**

```
550e8400-e29b-41d4-a716-446655440000
6ba7b810-9dad-11d1-80b4-00c04fd430c8
d7ff5ebf-2bdc-4a50-8da9-b63b9f698861
```

### **Test Page:**

Visit `http://localhost:8000/interview_test.html` for a complete working example.

### **Health Check:**

```bash
curl http://localhost:8000/api/health
```

### **WebSocket Testing Tools:**

- Browser DevTools → Network → WS
- Use the provided HTML test page
- WebSocket client tools like wscat

---

## 🚨 **Common Issues & Solutions**

### **1. Connection Refused**

- Check if server is running on port 8000 (not 8000)
- Verify WebSocket URL format
- Check CORS settings

### **2. Invalid Application ID**

- Must be valid UUID format
- Use sample IDs for testing
- Validate format before connecting

### **3. Message Format Errors**

- Always use JSON.stringify() for sending
- Validate message structure
- Handle JSON parsing errors
- Use `final_assessment` not `assessment` field

### **4. Session Timeouts**

- Monitor time_remaining field
- Handle session expiry gracefully
- Implement heartbeat/ping mechanism
- **Commands**: Use "end" to force completion

### **5. Assessment Not Generated**

- Interview must reach completion (time up, max questions, or "end" command)
- Check for `final_assessment` field in completion message
- Single save occurs only at the end
- Bonus questions (up to 4) may extend interview

---

## 📚 **Additional Resources**

- **Test Page:** `/interview_test.html`
- **Health Check:** `/api/health`
- **Metrics:** `/api/interview/metrics`
- **API Docs:** `/docs` (FastAPI auto-generated)
- **Server Port:** 8000 (updated from 8000)

## 🎯 **Interview Commands Reference**

| Command        | Usage          | Effect                                           |
| -------------- | -------------- | ------------------------------------------------ |
| `"end"`        | Send as answer | Immediately end interview and trigger assessment |
| `"quit"`       | Send as answer | Same as "end"                                    |
| `"exit"`       | Send as answer | Same as "end"                                    |
| `"pause"`      | Send as answer | Pause interview timer                            |
| Regular answer | After pause    | Automatically resume interview                   |

**The AI Interview System supports 6+ industries with adaptive questioning, real-time assessment, and comprehensive scoring! **
