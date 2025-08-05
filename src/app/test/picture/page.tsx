"use client";


// Dynamically import the audio-recorder web component only on the client
import * as React from "react";
import { useRef, useState, useEffect } from "react";



import { useRouter } from 'next/navigation';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectLabel } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';




// FullScreenShareButton component
function FullScreenShareButton() {
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [screenError, setScreenError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleShareScreen = async () => {
        setScreenError(null);
        try {
            // Only allow full screen selection
            // Note: Most browsers do not allow restricting to only full screen, but we can hint with preferCurrentTab: false
            // and by instructing the user
            const stream = await (navigator.mediaDevices as any).getDisplayMedia({
                video: {
                    displaySurface: 'monitor', // hint for full screen
                },
                audio: false
            });
            setScreenStream(stream);
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            setScreenError('Could not start full screen sharing.');
        }
    };

    return (
        <div className="w-full flex flex-col items-center gap-2 mt-2">
            <Button variant="secondary" className="w-full font-semibold text-base flex items-center gap-2 justify-center" onClick={handleShareScreen}>
                <span className="i-lucide-monitor w-4 h-4" /> Share Full Screen
            </Button>
            {screenStream && (
                <video ref={videoRef} autoPlay playsInline muted className="w-[400px] h-[200px] rounded-lg bg-[#232326] border border-[#333] mt-2" style={{ background: '#232326' }} />
            )}
            {screenError && <div className="text-red-400 text-xs mt-1">{screenError}</div>}
            <div className="text-xs text-[#b0b3c6] mt-1">Only full screen sharing is allowed. Please select your entire screen in the browser dialog.</div>
        </div>
    );
}

function InterviewTips() {
    return (
        <Card className="mt-6 max-w-lg mx-auto bg-[#232326] text-white">
            <CardHeader>
                <CardTitle className="text-white text-base font-semibold">Interview Tips</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Find a quiet place with good lighting and minimal background noise</li>
                    <li>Dress professionally as you would for an in-person interview</li>
                    <li>Speak clearly and take your time to answer thoughtfully</li>
                    <li>Have your resume and relevant documents nearby for reference</li>
                    <li>The interview will take approximately 15-20 minutes to complete</li>
                </ul>
            </CardContent>
        </Card>
    );
}

function DeviceCheckPanel() {
    // All state and refs at the top
    const [cameraChecked, setCameraChecked] = useState(false);
    const [micChecked, setMicChecked] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const router = useRouter();
    const [showCamera, setShowCamera] = useState(false);
    const [showMic, setShowMic] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [micStream, setMicStream] = useState<MediaStream | null>(null);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [micError, setMicError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const waveformContainerRef = useRef<HTMLDivElement>(null);
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<string | undefined>(undefined);
    const [selectedAudio, setSelectedAudio] = useState<string | undefined>(undefined);
    const [pendingVideo, setPendingVideo] = useState<string | undefined>(undefined);
    const [pendingAudio, setPendingAudio] = useState<string | undefined>(undefined);
    const [configLoading, setConfigLoading] = useState(false);

    // No imperative rendering needed, use <audio-recorder> directly

    // Camera preview logic
    useEffect(() => {
        if (!showCamera) {
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
                setVideoStream(null);
            }
            return;
        }
        setVideoError(null);
        const getCam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: selectedVideo ? { deviceId: { exact: selectedVideo } } : true });
                setVideoStream(stream);
                if (videoRef.current) videoRef.current.srcObject = stream;
                setCameraChecked(true);
            } catch (err) {
                setVideoError('Could not access camera.');
                setCameraChecked(false);
            }
        };
        getCam();
        return () => {
            if (videoStream) videoStream.getTracks().forEach(track => track.stop());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showCamera, selectedVideo]);


    // Microphone logic: just get stream for visualizer
    useEffect(() => {
        if (!showMic) {
            if (micStream) {
                micStream.getTracks().forEach(track => track.stop());
                setMicStream(null);
            }
            return;
        }
        setMicError(null);
        const getMic = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: selectedAudio ? { deviceId: { exact: selectedAudio } } : true });
                setMicStream(stream);
                setMicChecked(true);
            } catch (err) {
                setMicError('Could not access microphone.');
                setMicChecked(false);
            }
        };
        getMic();
        return () => {
            if (micStream) micStream.getTracks().forEach(track => track.stop());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showMic, selectedAudio]);


    // Device config dialog logic
    const fetchDevices = async () => {
        setConfigLoading(true);
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            setVideoDevices(devices.filter(d => d.kind === 'videoinput'));
            setAudioDevices(devices.filter(d => d.kind === 'audioinput'));
            if (!selectedVideo) setSelectedVideo(devices.find(d => d.kind === 'videoinput')?.deviceId);
            if (!selectedAudio) setSelectedAudio(devices.find(d => d.kind === 'audioinput')?.deviceId);
            setPendingVideo(selectedVideo ?? devices.find(d => d.kind === 'videoinput')?.deviceId);
            setPendingAudio(selectedAudio ?? devices.find(d => d.kind === 'audioinput')?.deviceId);
        } finally {
            setConfigLoading(false);
        }
    };

    // When dialog opens, fetch devices and set pending
    useEffect(() => {
        if (showConfig) {
            fetchDevices();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showConfig]);

    // Apply settings handler
    const handleApplySettings = () => {
        setSelectedVideo(pendingVideo);
        setSelectedAudio(pendingAudio);
        setShowConfig(false);
    };


    return (
        <Card className="bg-[#232326] text-white flex flex-col items-center mb-6 p-8">
            <div className="mb-6">
                <div className="w-[70px] h-[70px] rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: 'radial-gradient(circle, #2d2e4a 60%, #1a1a2a 100%)', boxShadow: '0 0 16px #3cf6ff44' }}>
                    <span className="text-4xl" style={{ color: '#3cf6ff' }}>🤖</span>
                </div>
            </div>
            <CardTitle className="text-center text-2xl font-bold mb-2">Ready to begin your interview?</CardTitle>
            <CardDescription className="text-center text-[#b0b3c6] text-base mb-6 max-w-md">
                Our AI-powered system will guide you through a series of questions to assess your skills and experience for this position. Please ensure your camera and microphone are working properly.
            </CardDescription>
            <div className="flex flex-col w-full gap-3 items-center">
                <Button variant="secondary" className="w-full font-semibold text-base flex items-center gap-2 justify-center" onClick={() => { setShowCamera(v => !v); setShowMic(false); }}>
                    <span className="i-lucide-video w-4 h-4" /> Check Camera
                    {cameraChecked && <span className="ml-2 text-green-400">✔</span>}
                </Button>
                {showCamera && (
                    <div className="w-full flex flex-col items-center mt-2 gap-2">
                        <video ref={videoRef} autoPlay playsInline muted className="w-[400px] h-[200px] rounded-lg bg-[#232326] border border-[#333]" style={{ background: '#232326' }} />
                        {videoError && <div className="text-red-400 text-xs mt-1">{videoError}</div>}
                    </div>
                )}
                {/* Move FullScreenShareButton here, always visible below camera, above mic */}
                <FullScreenShareButton />
                <Button variant="secondary" className="w-full font-semibold text-base flex items-center gap-2 justify-center" onClick={() => { setShowMic(v => !v); setShowCamera(false); }}>
                    <span className="i-lucide-mic w-4 h-4" /> Check Microphone
                    {micChecked && <span className="ml-2 text-green-400">✔</span>}
                </Button>
                {showMic && (
                    <div className="w-full flex flex-col items-center mt-2 gap-2">
                        <AudioVisualizer stream={micStream} />
                        {micError && <div className="text-red-400 text-xs mt-1">{micError}</div>}
                    </div>
                )}
                <Dialog open={showConfig} onOpenChange={setShowConfig}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full font-semibold text-base flex items-center gap-2" onClick={() => setShowConfig(true)}>
                            <span className="text-lg">⚙️</span> Configure Devices
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-[#18191c] text-white">
                        <DialogTitle className="flex items-center gap-2 text-lg font-semibold mb-2"><span className="text-xl">⚙️</span> Media Device Settings</DialogTitle>
                        <DialogDescription className="text-[#b0b3c6] mb-4">Select your preferred camera and microphone.</DialogDescription>
                        <div className="flex flex-col gap-4">
                            <div>
                                <Label htmlFor="video-device" className="mb-1 block">Camera</Label>
                                <Select value={pendingVideo} onValueChange={setPendingVideo}>
                                    <SelectTrigger id="video-device" className="w-full mt-1">
                                        <SelectValue placeholder="Select camera device" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {videoDevices.length === 0 ? (
                                            <SelectItem value="no-camera" disabled>No camera found</SelectItem>
                                        ) : (
                                            videoDevices
                                                .filter(device => device.deviceId && device.deviceId !== "")
                                                .map(device => (
                                                    <SelectItem key={device.deviceId} value={device.deviceId}>
                                                        <span style={{
                                                            display: 'block',
                                                            maxWidth: '320px',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}>{device.label || `Camera (${device.deviceId.slice(-4)})`}</span>
                                                    </SelectItem>
                                                ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="audio-device" className="mb-1 block">Microphone</Label>
                                <Select value={pendingAudio} onValueChange={setPendingAudio}>
                                    <SelectTrigger id="audio-device" className="w-full mt-1">
                                        <SelectValue placeholder="Select microphone device" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {audioDevices.length === 0 ? (
                                            <SelectItem value="no-mic" disabled>No microphone found</SelectItem>
                                        ) : (
                                            audioDevices
                                                .filter(device => device.deviceId && device.deviceId !== "")
                                                .map(device => (
                                                    <SelectItem key={device.deviceId} value={device.deviceId}>
                                                        <span style={{
                                                            display: 'block',
                                                            maxWidth: '320px',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}>{device.label || `Microphone (${device.deviceId.slice(-4)})`}</span>
                                                    </SelectItem>
                                                ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Button variant="secondary" type="button" onClick={fetchDevices} className="flex-1 flex items-center gap-2"><span className="i-lucide-refresh-cw w-4 h-4" /> Refresh devices</Button>
                                <Button variant="default" type="button" className="flex-1" onClick={handleApplySettings}>Apply settings</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                <Button
                    className={`w-full font-medium text-base mt-2 ${cameraChecked && micChecked ? 'bg-[#3cf6ff] text-black hover:bg-[#2ad4e0]' : 'bg-[#444] text-[#bbb] opacity-70 cursor-not-allowed'}`}
                    disabled={!(cameraChecked && micChecked) || redirecting}
                    onClick={() => {
                        if (cameraChecked && micChecked) {
                            setRedirecting(true);
                            router.push('/test/picture/board');
                        }
                    }}
                >
                    Go for Interview
                </Button>
            </div>
        </Card >
    );
}


const InterviewStartPage = () => {
    return (
        <div className="min-h-screen bg-[#111214] flex flex-col items-center justify-center p-6">
            <Card className="max-w-xl w-full mx-auto bg-[#18191c] rounded-2xl shadow-lg p-8">
                <CardHeader>
                    <CardTitle className="text-white text-2xl font-bold mb-1">Full Stack Developer - AI Interview</CardTitle>
                    <CardDescription className="text-[#b0b3c6] text-base mb-6">Virtual interview for Doogle</CardDescription>
                </CardHeader>
                <CardContent>
                    <DeviceCheckPanel />
                    <InterviewTips />
                </CardContent>
            </Card>
        </div>
    );
};


export default InterviewStartPage;


// AudioVisualizer: Standalone audio visualization component
function AudioVisualizer({ stream }: { stream: MediaStream | null }) {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const animationRef = React.useRef<number | undefined>(undefined);
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const analyserRef = React.useRef<AnalyserNode | null>(null);
    const sourceRef = React.useRef<MediaStreamAudioSourceNode | null>(null);

    React.useEffect(() => {
        if (!stream || !canvasRef.current) return;
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        sourceRef.current = source;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            if (!ctx || !analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength) - 2;
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
                ctx.fillStyle = '#3cf6ff';
                ctx.fillRect(i * (barWidth + 2), canvas.height - barHeight, barWidth, barHeight);
            }
            animationRef.current = requestAnimationFrame(draw);
        }
        draw();
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, [stream]);

    return (
        <div style={{ width: '100%', maxWidth: 500, overflow: 'hidden', marginTop: 8, borderRadius: 12, background: '#18191c', border: '1px solid #333' }}>
            <canvas
                ref={canvasRef}
                width={400}
                height={60}
                style={{ width: '100%', height: 60, display: 'block', background: 'transparent', borderRadius: 12 }}
            />
        </div>
    );
}
