'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface LiveVideoProps {
  interviewId: string;
  role: 'candidate' | 'recruiter';
  userId: string;
  onConnectionStatusChange?: (status: string) => void;
}

const LiveVideo: React.FC<LiveVideoProps> = ({
  interviewId,
  role,
  userId,
  onConnectionStatusChange
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // WebRTC Configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const updateConnectionStatus = useCallback((status: string) => {
    setConnectionStatus(status);
    onConnectionStatusChange?.(status);
  }, [onConnectionStatusChange]);

  useEffect(() => {
    initializeConnection();
    return cleanup;
  }, [interviewId, role, userId]);

  const initializeConnection = async () => {
    try {
      socketRef.current = io('ws://localhost:3001');

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        updateConnectionStatus('connected');
        
        if (role === 'candidate') {
          socketRef.current?.emit('join-interview-candidate', {
            interviewId,
            candidateId: userId
          });
          initializeCandidateStream();
        } else {
          socketRef.current?.emit('join-interview-recruiter', {
            interviewId,
            recruiterId: userId
          });
        }
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
        updateConnectionStatus('disconnected');
      });

      // WebRTC events
      socketRef.current.on('recruiter-wants-to-watch', handleRecruiterWantsToWatch);
      socketRef.current.on('candidate-available', handleCandidateAvailable);
      socketRef.current.on('webrtc-offer', handleWebRTCOffer);
      socketRef.current.on('webrtc-answer', handleWebRTCAnswer);
      socketRef.current.on('webrtc-ice-candidate', handleWebRTCIceCandidate);
      
      socketRef.current.on('candidate-joined', () => {
        updateConnectionStatus('candidate-joined');
      });
      
      socketRef.current.on('candidate-left', () => {
        updateConnectionStatus('candidate-left');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      });

    } catch (error) {
      console.error('Error initializing connection:', error);
      setError('Failed to connect to server');
    }
  };

  const initializeCandidateStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });

      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsStreaming(true);
      updateConnectionStatus('streaming');

    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Unable to access camera or microphone');
    }
  };

  const createPeerConnection = (): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection(rtcConfig);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('webrtc-ice-candidate', {
          interviewId,
          candidate: event.candidate
        });
      }
    };

    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        updateConnectionStatus('video-connected');
      }
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'connected') {
        updateConnectionStatus('peer-connected');
      } else if (peerConnection.connectionState === 'disconnected') {
        updateConnectionStatus('peer-disconnected');
      }
    };

    return peerConnection;
  };

  const handleRecruiterWantsToWatch = async () => {
    if (role === 'candidate' && localStreamRef.current) {
      try {
        peerConnectionRef.current = createPeerConnection();
        
        localStreamRef.current.getTracks().forEach(track => {
          peerConnectionRef.current?.addTrack(track, localStreamRef.current!);
        });

        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        socketRef.current?.emit('webrtc-offer', {
          interviewId,
          offer
        });
        
        updateConnectionStatus('creating-offer');
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }
  };

  const handleCandidateAvailable = async () => {
    if (role === 'recruiter') {
      updateConnectionStatus('candidate-ready');
    }
  };

  const handleWebRTCOffer = async (data: { offer: RTCSessionDescriptionInit }) => {
    if (role === 'recruiter') {
      try {
        peerConnectionRef.current = createPeerConnection();
        
        await peerConnectionRef.current.setRemoteDescription(data.offer);
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        socketRef.current?.emit('webrtc-answer', {
          interviewId,
          answer
        });
        
        updateConnectionStatus('sending-answer');
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    }
  };

  const handleWebRTCAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {
    if (role === 'candidate' && peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.setRemoteDescription(data.answer);
        updateConnectionStatus('answer-received');
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  };

  const handleWebRTCIceCandidate = async (data: { candidate: RTCIceCandidate }) => {
    if (peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.addIceCandidate(data.candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  };

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    peerConnectionRef.current?.close();
    socketRef.current?.disconnect();
  };

  const getStatusColor = (status: string) => {
    if (status.includes('connected') || status === 'streaming') return 'text-green-500';
    if (status.includes('disconnected') || status === 'candidate-left') return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <div className="live-video-container w-full max-w-4xl mx-auto p-4">
      {/* Status Bar */}
      <div className="bg-gray-100 rounded-lg p-3 mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className={`font-medium ${getStatusColor(connectionStatus)}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          <span className="text-sm text-gray-600">
            Status: {connectionStatus.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}
          </span>
        </div>
        
        {role === 'candidate' && isStreaming && (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
            🔴 LIVE
          </span>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Video Container */}
      <div className="video-container bg-black rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
          {/* Candidate's local video */}
          {role === 'candidate' && (
            <div className="relative">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-64 md:h-80 object-cover rounded bg-gray-800"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                You (Candidate)
              </div>
              {isStreaming && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                  LIVE
                </div>
              )}
            </div>
          )}

          {/* Remote video for recruiter */}
          {role === 'recruiter' && (
            <div className="relative col-span-full">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-64 md:h-96 object-cover rounded bg-gray-800"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                Candidate
              </div>
              {connectionStatus === 'video-connected' && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                  LIVE STREAM
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Connection Messages */}
      {role === 'recruiter' && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            {connectionStatus === 'candidate-ready' 
              ? 'Candidate is ready. Video will connect automatically.' 
              : connectionStatus === 'candidate-left'
              ? 'Candidate has left the interview.'
              : 'Waiting for candidate to join...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveVideo;
