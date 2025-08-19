"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deepgramTTS, type DeepgramVoice } from '@/lib/deepgram-tts';
import { Play, Square, Volume2 } from 'lucide-react';

export default function DeepgramTTSTest() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<DeepgramVoice | null>(null);
    const [voices, setVoices] = useState<DeepgramVoice[]>([]);

    useEffect(() => {
        // Load available voices
        const availableVoices = deepgramTTS.getAvailableVoices();
        setVoices(availableVoices);

        // Select best voice for interview
        const bestVoice = deepgramTTS.getBestVoice('feminine', 'interview');
        setSelectedVoice(bestVoice);

        console.log('🎤 Available voices:', availableVoices.length);
        console.log('🎯 Selected voice:', bestVoice?.name);
    }, []);

    const testSamples = [
        "Hello! Welcome to your AI-powered interview. I'm excited to get to know you better today.",
        "Can you tell me about your experience with React and TypeScript?",
        "That's a great answer! Let me ask you about a challenging project you've worked on recently.",
        "Thank you for sharing that. Now, let's discuss your problem-solving approach.",
        "Excellent! We're making great progress. Let's move on to the next topic."
    ];

    const handlePlaySample = async (text: string, index: number) => {
        try {
            setIsPlaying(true);
            console.log(`🔊 Testing sample ${index + 1}:`, text);

            await deepgramTTS.speak(text, {
                voice: selectedVoice || undefined
            });

            console.log('✅ Sample completed successfully');
        } catch (error) {
            console.error('❌ TTS test error:', error);
            alert(`TTS Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsPlaying(false);
        }
    };

    const handleStop = () => {
        deepgramTTS.stop();
        setIsPlaying(false);
        console.log('🛑 TTS stopped by user');
    };

    const handleVoiceChange = (voiceId: string) => {
        const voice = voices.find(v => v.id === voiceId);
        setSelectedVoice(voice || null);
        console.log('🎵 Voice changed to:', voice?.name);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5" />
                        Deepgram TTS Integration Test
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Voice Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Selected Voice: {selectedVoice?.name || 'None'}
                            </label>
                            <select
                                value={selectedVoice?.id || ''}
                                onChange={(e) => handleVoiceChange(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                disabled={isPlaying}
                            >
                                {voices.map(voice => (
                                    <option key={voice.id} value={voice.id}>
                                        {voice.name} ({voice.gender}, {voice.accent})
                                    </option>
                                ))}
                            </select>
                            {selectedVoice && (
                                <p className="text-sm text-gray-600 mt-1">
                                    <strong>Characteristics:</strong> {selectedVoice.characteristics.join(', ')}
                                    <br />
                                    <strong>Use Cases:</strong> {selectedVoice.use_cases.join(', ')}
                                </p>
                            )}
                        </div>

                        {/* Global Controls */}
                        <div className="flex gap-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleStop}
                                disabled={!isPlaying}
                            >
                                <Square className="w-4 h-4 mr-1" />
                                Stop All
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Test Samples */}
            <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Interview Question Samples</h3>
                {testSamples.map((sample, index) => (
                    <Card key={index}>
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePlaySample(sample, index)}
                                    disabled={isPlaying || !selectedVoice}
                                >
                                    <Play className="w-4 h-4" />
                                </Button>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-1">Sample {index + 1}</p>
                                    <p className="text-sm">{sample}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Status Indicator */}
            {isPlaying && (
                <Card className="mt-6 border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-sm text-blue-700">
                                Playing with {selectedVoice?.name}...
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Debug Info */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-sm">Debug Information</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="text-xs space-y-1 font-mono">
                        <p><strong>TTS System:</strong> Deepgram Aura</p>
                        <p><strong>Available Voices:</strong> {voices.length}</p>
                        <p><strong>Selected Voice ID:</strong> {selectedVoice?.id || 'None'}</p>
                        <p><strong>API Key Length:</strong> {process.env.NEXT_PUBLIC_DEEPGRAM_TTS_API_KEY?.length || 0}</p>
                        <p><strong>Is Playing:</strong> {isPlaying ? 'Yes' : 'No'}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
