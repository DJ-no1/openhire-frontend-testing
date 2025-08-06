const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Store active interview sessions
const activeInterviews = new Map();

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  // Handle candidate joining interview
  socket.on('join-interview-candidate', (data) => {
    const { interviewId, candidateId } = data;
    
    socket.join(`interview-${interviewId}`);
    
    if (!activeInterviews.has(interviewId)) {
      activeInterviews.set(interviewId, {
        candidate: null,
        recruiters: new Set(),
        status: 'waiting'
      });
    }
    
    const interview = activeInterviews.get(interviewId);
    interview.candidate = {
      socketId: socket.id,
      candidateId,
      status: 'connected'
    };
    interview.status = 'candidate-ready';
    
    // Notify recruiters
    socket.to(`interview-${interviewId}`).emit('candidate-joined', {
      candidateId,
      interviewId
    });
    
    console.log(`Candidate ${candidateId} joined interview ${interviewId}`);
  });

  // Handle recruiter joining to watch
  socket.on('join-interview-recruiter', (data) => {
    const { interviewId, recruiterId } = data;
    
    socket.join(`interview-${interviewId}`);
    
    if (!activeInterviews.has(interviewId)) {
      socket.emit('interview-not-found');
      return;
    }
    
    const interview = activeInterviews.get(interviewId);
    interview.recruiters.add({
      socketId: socket.id,
      recruiterId
    });
    
    // If candidate is present, start WebRTC
    if (interview.candidate) {
      socket.emit('candidate-available');
      socket.to(`interview-${interviewId}`).emit('recruiter-wants-to-watch', {
        recruiterId
      });
    }
    
    console.log(`Recruiter ${recruiterId} joined to watch interview ${interviewId}`);
  });

  // WebRTC Signaling
  socket.on('webrtc-offer', (data) => {
    socket.to(`interview-${data.interviewId}`).emit('webrtc-offer', data);
  });

  socket.on('webrtc-answer', (data) => {
    socket.to(`interview-${data.interviewId}`).emit('webrtc-answer', data);
  });

  socket.on('webrtc-ice-candidate', (data) => {
    socket.to(`interview-${data.interviewId}`).emit('webrtc-ice-candidate', data);
  });

  // Interview status updates
  socket.on('interview-status-update', (data) => {
    const { interviewId, status } = data;
    
    if (activeInterviews.has(interviewId)) {
      activeInterviews.get(interviewId).status = status;
      io.to(`interview-${interviewId}`).emit('interview-status-changed', {
        interviewId,
        status
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Clean up interview data
    for (const [interviewId, interview] of activeInterviews.entries()) {
      if (interview.candidate && interview.candidate.socketId === socket.id) {
        interview.candidate = null;
        interview.status = 'candidate-disconnected';
        io.to(`interview-${interviewId}`).emit('candidate-left');
        break;
      }
      
      // Remove recruiter
      interview.recruiters = new Set([...interview.recruiters].filter(
        r => r.socketId !== socket.id
      ));
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
