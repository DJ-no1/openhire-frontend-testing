import { useState, useEffect, useRef, useCallback } from 'react';

// Extend Window interface for Speech Recognition
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

interface SpeechRecognitionEvent {
    resultIndex: number;
    results: {
        [index: number]: {
            [index: number]: {
                transcript: string;
                confidence: number;
            };
            isFinal: boolean;
        };
        length: number;
    };
}

interface SpeechRecognitionErrorEvent {
    error: string;
    message?: string;
}

export interface UseSpeechRecognitionOptions {
    continuous?: boolean;
    interimResults?: boolean;
    language?: string;
    onResult?: (transcript: string, isFinal: boolean) => void;
    onError?: (error: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);

    const {
        continuous = true,
        interimResults = true,
        language = 'en-US',
        onResult,
        onError,
        onStart,
        onEnd
    } = options;

    // Check if speech recognition is supported
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            setIsSupported(!!SpeechRecognition);

            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = continuous;
                recognition.interimResults = interimResults;
                recognition.lang = language;

                recognition.onstart = () => {
                    setIsListening(true);
                    setError(null);
                    onStart?.();
                };

                recognition.onresult = (event: SpeechRecognitionEvent) => {
                    let interimTranscript = '';
                    let finalTranscriptText = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcriptText = event.results[i][0].transcript;

                        if (event.results[i].isFinal) {
                            finalTranscriptText += transcriptText;
                        } else {
                            interimTranscript += transcriptText;
                        }
                    }

                    setTranscript(interimTranscript);

                    if (finalTranscriptText) {
                        setFinalTranscript(prev => prev + finalTranscriptText);
                        onResult?.(finalTranscriptText, true);
                    }

                    if (interimTranscript) {
                        onResult?.(interimTranscript, false);
                    }
                };

                recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                    const errorMessage = event.error || 'Speech recognition error';
                    setError(errorMessage);
                    setIsListening(false);
                    onError?.(errorMessage);
                };

                recognition.onend = () => {
                    setIsListening(false);
                    onEnd?.();
                };

                recognitionRef.current = recognition;
            }
        }
    }, [continuous, interimResults, language, onResult, onError, onStart, onEnd]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            setError(null);
            recognitionRef.current.start();
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setFinalTranscript('');
    }, []);

    const abortListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
            setIsListening(false);
        }
    }, []);

    return {
        isListening,
        transcript,
        finalTranscript,
        isSupported,
        error,
        startListening,
        stopListening,
        resetTranscript,
        abortListening
    };
}
