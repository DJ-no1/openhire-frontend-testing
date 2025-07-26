# AI Interview System - React Frontend

A modern React.js frontend for conducting AI-powered interviews with real-time WebSocket communication, speech recognition, and comprehensive analysis.

## 🚀 Features

- **Real-time Chat Interface**: Bidirectional AI-powered conversation with live message handling
- **WebSocket Communication**: Low-latency real-time connection with auto-reconnection
- **Speech Recognition**: Browser-based speech-to-text with live transcription
- **Interview Management**: Complete interview flow from setup to completion
- **Progress Tracking**: Real-time timer, duration limits, and progress indicators
- **Modern UI**: Professional interface built with shadcn/ui and Tailwind CSS

## 🛠 Tech Stack

- **Frontend**: React.js 19, TypeScript, Next.js 15
- **Styling**: Tailwind CSS, shadcn/ui components, Lucide icons
- **Communication**: WebSocket API, Speech Recognition API
- **State Management**: React Hooks, Custom hooks

## 📁 Project Structure

```
src/
├── app/
│   ├── interview/page.tsx          # AI Interview System page
│   ├── docs/page.tsx               # Documentation page
│   └── page.tsx                    # Homepage
├── components/
│   ├── ai-interview-system-v2.tsx  # Main interview component
│   ├── interview-system-docs.tsx   # Documentation component
│   ├── site-navigation.tsx         # Navigation component
│   └── ui/                         # shadcn/ui components
└── hooks/
    ├── use-websocket.ts            # WebSocket management hook
    └── use-speech-recognition.ts   # Speech API wrapper hook
```

## 🎯 Quick Start

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Start development server**:

   ```bash
   pnpm dev
   ```

3. **Navigate to pages**:
   - Homepage: `http://localhost:3000`
   - AI Interview: `http://localhost:3000/interview`
   - Documentation: `http://localhost:3000/docs`

## 🔌 WebSocket Integration

The system connects to a WebSocket server for real-time communication:

### Connection URL

```
ws://localhost:8000/ws/interview/{sessionId}
```

### Message Types

**Client → Server:**

- `start_interview` - Initialize interview session
- `candidate_response` - Send candidate's response
- `end_interview` - Terminate interview

**Server → Client:**

- `ai_question` - AI interviewer question
- `live_transcript` - Real-time speech transcript
- `end_interview` - Interview completion with feedback
- `error` - Error notifications

### Sample Messages

```json
// Start Interview
{
  "type": "start_interview",
  "data": {
    "job_id": "test_job_001",
    "candidate_id": "test_candidate_001",
    "candidate_name": "John Doe",
    "resume_text": "optional resume text",
    "preferences": {
      "max_duration": 30
    }
  }
}

// Candidate Response
{
  "type": "candidate_response",
  "data": {
    "response": "I have 5 years of experience in software development..."
  }
}
```

## 🎤 Speech Recognition

The system uses the browser's Speech Recognition API:

- **Supported Browsers**: Chrome, Edge, Safari
- **Features**: Continuous recognition, interim results, error handling
- **Fallback**: Text input when speech recognition is unavailable

## 🔧 Key Components

### AIInterviewSystemV2

Main interview component handling:

- WebSocket connections
- Speech recognition
- Interview flow management
- Real-time state updates

### Custom Hooks

#### useWebSocket

- Manages WebSocket connections
- Auto-reconnection functionality
- Message handling and state management

#### useSpeechRecognition

- Wraps browser Speech Recognition API
- Provides continuous speech-to-text
- Error handling and browser compatibility

## 🎨 UI Components

Built with shadcn/ui for consistent, accessible design:

- **Cards**: Interview panels and status displays
- **Buttons**: Interactive controls and navigation
- **Badges**: Status indicators and labels
- **Progress**: Interview time tracking
- **Tabs**: Documentation organization

## 📱 Interview Flow

1. **Setup**: Configure job details, candidate info, and duration
2. **Connection**: Establish WebSocket connection
3. **Start**: Send interview initialization message
4. **Interactive Q&A**: AI asks questions, candidate responds
5. **Real-time Processing**: Live transcript and message handling
6. **Completion**: End interview and receive feedback

## 🔄 State Management

The application uses React's built-in state management:

- `useState` for component state
- `useEffect` for side effects and lifecycle
- `useRef` for DOM references and persistent values
- Custom hooks for complex logic separation

## 🚦 Connection Status

Real-time monitoring of:

- WebSocket connection state
- Speech recognition status
- Interview phase tracking
- Error handling and user feedback

## ⚠️ Backend Requirements

The frontend requires a WebSocket server running on `localhost:8000` with:

- WebSocket endpoint: `/ws/interview/{sessionId}`
- Message type handling for interview flow
- Real-time AI question generation
- Interview completion and feedback

## 🌐 Browser Compatibility

- **WebSocket**: All modern browsers
- **Speech Recognition**: Chrome, Edge, Safari (with webkit prefix)
- **TypeScript**: Full type safety
- **Responsive Design**: Mobile and desktop optimized

## 📄 Documentation

Visit `/docs` for comprehensive documentation including:

- API reference
- Implementation details
- Message format specifications
- Live demo instructions

## 🚀 Deployment

Built with Next.js for easy deployment to:

- Vercel (recommended)
- Netlify
- AWS Amplify
- Docker containers

---

**Built with ❤️ using React.js, TypeScript, and modern web technologies**
