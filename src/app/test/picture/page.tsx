
"use client";
import React, { useRef, useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectLabel } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';


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
    const [showCamera, setShowCamera] = useState(false);
    const [showMic, setShowMic] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [micStream, setMicStream] = useState<MediaStream | null>(null);
    const [micLevel, setMicLevel] = useState(0);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [micError, setMicError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const rafRef = useRef<number | null>(null);

    // Device config state
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<string | undefined>(undefined);
    const [selectedAudio, setSelectedAudio] = useState<string | undefined>(undefined);
    const [configLoading, setConfigLoading] = useState(false);

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
            } catch (err) {
                setVideoError('Could not access camera.');
            }
        };
        getCam();
        return () => {
            if (videoStream) videoStream.getTracks().forEach(track => track.stop());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showCamera, selectedVideo]);

    // Microphone visualizer logic
    useEffect(() => {
        if (!showMic) {
            if (micStream) {
                micStream.getTracks().forEach(track => track.stop());
                setMicStream(null);
            }
            if (audioContextRef.current) {
                if (audioContextRef.current.state !== 'closed') {
                    audioContextRef.current.close();
                }
                audioContextRef.current = null;
            }
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            return;
        }
        setMicError(null);
        const getMic = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: selectedAudio ? { deviceId: { exact: selectedAudio } } : true });
                setMicStream(stream);
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioContextRef.current = audioContext;
                const source = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                analyserRef.current = analyser;
                source.connect(analyser);
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                dataArrayRef.current = dataArray;
                const update = () => {
                    if (!analyserRef.current || !dataArrayRef.current) return;
                    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
                    // Calculate RMS (root mean square) for mic level
                    let sum = 0;
                    for (let i = 0; i < dataArrayRef.current.length; i++) {
                        const val = (dataArrayRef.current[i] - 128) / 128;
                        sum += val * val;
                    }
                    setMicLevel(Math.sqrt(sum / dataArrayRef.current.length));
                    rafRef.current = requestAnimationFrame(update);
                };
                update();
            } catch (err) {
                setMicError('Could not access microphone.');
            }
        };
        getMic();
        return () => {
            if (micStream) micStream.getTracks().forEach(track => track.stop());
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
        } finally {
            setConfigLoading(false);
        }
    };

    useEffect(() => {
        if (showConfig) fetchDevices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showConfig]);

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
                </Button>
                {showCamera && (
                    <div className="w-full flex flex-col items-center mt-2 gap-2">
                        <video ref={videoRef} autoPlay playsInline muted className="w-[400px] h-[200px] rounded-lg bg-[#232326] border border-[#333]" style={{ background: '#232326' }} />
                        {videoError && <div className="text-red-400 text-xs mt-1">{videoError}</div>}
                        <FullScreenShareButton />
                    </div>
                )}
                <Button variant="secondary" className="w-full font-semibold text-base flex items-center gap-2 justify-center" onClick={() => { setShowMic(v => !v); setShowCamera(false); }}>
                    <span className="i-lucide-mic w-4 h-4" /> Check Microphone
                </Button>
                {showMic && (
                    <div className="w-full flex flex-col items-center mt-2">
                        <div className="w-[400px] h-[40px] rounded-lg bg-[#232326] border border-[#333] flex items-center px-4">
                            <div className="w-full h-3 bg-[#18191c] rounded-full overflow-hidden">
                                <div className="h-3 rounded-full transition-all duration-100" style={{ width: `${Math.min(100, Math.round(micLevel * 200))}%`, background: micLevel > 0.05 ? '#3cf6ff' : '#444' }} />
                            </div>
                        </div>
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
                                <Select value={selectedVideo} onValueChange={setSelectedVideo}>
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
                                                    <SelectItem key={device.deviceId} value={device.deviceId}>{device.label || `Camera (${device.deviceId.slice(-4)})`}</SelectItem>
                                                ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="audio-device" className="mb-1 block">Microphone</Label>
                                <Select value={selectedAudio} onValueChange={setSelectedAudio}>
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
                                                    <SelectItem key={device.deviceId} value={device.deviceId}>{device.label || `Microphone (${device.deviceId.slice(-4)})`}</SelectItem>
                                                ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Button variant="secondary" type="button" onClick={fetchDevices} className="flex-1 flex items-center gap-2"><span className="i-lucide-refresh-cw w-4 h-4" /> Refresh devices</Button>
                                <Button variant="default" type="button" className="flex-1">Apply settings</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                <Button disabled className="w-full bg-[#444] text-[#bbb] font-medium text-base opacity-70 cursor-not-allowed mt-2">Check Devices First</Button>
            </div>
        </Card>
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
