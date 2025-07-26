# Real AI Interview System - Usage Guide

## 🎯 Production Ready Interview System

This system is designed to work with **real recruiter IDs**, **actual job postings**, and **complete resume text** to conduct live AI interviews.

## 📋 Required Information

### Before Starting an Interview, You Need:

1. **Job ID** (UUID from your jobs database)

   - Example: `ff7f1e59-3014-4cc8-8f2e-4b3ca694ceb3`
   - This should be an actual job posting ID from your system

2. **Recruiter/Candidate ID** (from your user database)

   - Example: `recruiter_12345` or `candidate_67890`
   - Use the actual ID from your authentication system

3. **Candidate Name**

   - Full name of the person being interviewed
   - Example: `John Smith`

4. **Complete Resume Text**
   - The entire resume content in text format
   - This is critical for the AI to understand the candidate's background
   - Should include experience, education, skills, etc.

## 🔧 Backend Requirements

Make sure your backend AI interview system is running on:

```
ws://localhost:8000/ws/interview/{session_id}
```

The system will automatically:

- Generate unique session IDs
- Send proper message formats according to your API documentation
- Handle real-time conversation with the AI agent

## 🎮 How to Use

1. **Open**: `http://localhost:3000/interview`
2. **Fill in all required fields** (marked with \*)
3. **Set interview preferences** (duration, difficulty, focus areas)
4. **Click "Start AI Interview"**
5. **Talk to the AI agent** using text or voice input

## 📡 Message Flow

The system will automatically handle:

- WebSocket connection to your backend
- Sending `start_interview` with all candidate data
- Real-time `candidate_response` messages
- Live transcript for speech recognition
- Proper interview completion

## ⚠️ Important Notes

- **No test data** - all fields must be filled with real information
- **Resume text is mandatory** - the AI needs this for proper interview questions
- **Backend must be running** - ensure your AI agent is active on port 8000
- **All IDs must exist** - use actual IDs from your database

## 🔍 Troubleshooting

1. **Connection failed**: Check if backend is running on localhost:8000
2. **Interview not starting**: Verify all required fields are filled
3. **No AI responses**: Check backend logs for errors
4. **Speech not working**: Enable microphone permissions in browser

## 💡 Example Setup

```javascript
// Example configuration
{
  jobId: "ff7f1e59-3014-4cc8-8f2e-4b3ca694ceb3",
  candidateId: "recruiter_001",
  candidateName: "Sarah Johnson",
  resumeText: "SARAH JOHNSON\nSoftware Engineer\n\nEXPERIENCE:\n- 5 years at Google as Senior Frontend Developer\n- Built React applications serving 10M+ users...",
  maxDuration: 45,
  difficultyLevel: "medium",
  focusAreas: ["javascript", "react", "system-design"]
}
```

This will create a real interview session with your AI backend! 🚀
