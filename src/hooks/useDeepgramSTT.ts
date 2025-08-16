import { useEffect, useRef, useCallback } from 'react';

interface DeepgramConfig {
  model: string;
  language: string;
  punctuate: boolean;
  interimResults: boolean;
  sampleRate: number;
}

const defaultConfig: DeepgramConfig = {
  model: 'nova-2',
  language: 'en-IN',
  punctuate: true,
  interimResults: true,
  sampleRate: 16000
};

export function useDeepgramSTT(
  apiKey: string | undefined,
  isListening: boolean,
  onTranscript: (text: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  config: Partial<DeepgramConfig> = {}
) {
  const finalConfig = { ...defaultConfig, ...config };
  const dgSocket = useRef<WebSocket | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const cleanup = useCallback(() => {
    if (dgSocket.current) {
      dgSocket.current.close();
      dgSocket.current = null;
    }
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      mediaRecorder.current = null;
    }
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }
  }, []);

  const getSupportedMimeType = useCallback(() => {
    const types = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || types[0];
  }, []);

  useEffect(() => {
    if (!isListening) {
      cleanup();
      return;
    }

    if (!apiKey) {
      onError('Deepgram API key missing');
      return;
    }

    const params = new URLSearchParams({
      model: finalConfig.model,
      punctuate: finalConfig.punctuate.toString(),
      language: finalConfig.language,
      encoding: 'linear16',
      sample_rate: finalConfig.sampleRate.toString(),
      interim_results: finalConfig.interimResults.toString(),
      endpointing: '300'
    });

    const socket = new WebSocket(
      `wss://api.deepgram.com/v1/listen?${params}`,
      ['token', apiKey]
    );

    dgSocket.current = socket;

    socket.onopen = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: finalConfig.sampleRate,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        mediaStream.current = stream;
        const mimeType = getSupportedMimeType();

        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorder.current = recorder;

        recorder.ondataavailable = async (event: BlobEvent) => {
          if (event.data.size > 0 && socket.readyState === 1) {
            const arrayBuffer = await event.data.arrayBuffer();
            socket.send(arrayBuffer);
          }
        };

        recorder.start(250);
      } catch (error) {
        onError(`Microphone access error: ${(error as Error).message}`);
        socket.close();
      }
    };

    socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const result = data.channel?.alternatives?.[0];
        
        if (result?.transcript !== undefined) {
          const transcript = result.transcript.trim();
          if (transcript) {
            onTranscript(transcript, Boolean(data.is_final));
          }
        }
      } catch (error) {
        console.error('Error parsing Deepgram response:', error);
      }
    };

    socket.onerror = () => {
      onError('Deepgram connection error');
    };

    socket.onclose = () => {
      dgSocket.current = null;
    };

    return cleanup;
  }, [isListening, apiKey, onTranscript, onError, finalConfig, cleanup, getSupportedMimeType]);

  return { cleanup };
}
