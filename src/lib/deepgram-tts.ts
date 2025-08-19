/**
 * Deepgram Text-to-Speech System
 * Uses Deepgram's Aura TTS API for high-quality voice synthesis
 */

export interface DeepgramVoice {
    id: string;
    name: string;
    lang: string;
    accent: string;
    gender: 'masculine' | 'feminine';
    age_group: 'Young Adult' | 'Adult' | 'Mature';
    characteristics: string[];
    use_cases: string[];
}

export interface DeepgramTTSConfig {
    rate?: number; // Speed multiplier (0.5 to 2.0)
    pitch?: number; // Pitch multiplier (0.5 to 2.0)  
    volume?: number; // Volume (0.0 to 1.0)
    voice?: DeepgramVoice;
    encoding?: 'linear16' | 'mulaw' | 'alaw' | 'mp3' | 'flac' | 'opus' | 'pcm';
    sample_rate?: number; // Sample rate (8000, 16000, 22050, 24000, 44100, 48000) - NOT supported with MP3
}

export class DeepgramTTSSystem {
    private readonly apiKey: string;
    private readonly baseUrl = 'https://api.deepgram.com/v1/speak';
    private currentAudio: HTMLAudioElement | null = null;
    private isInitialized = false;
    private isPlaying = false;
    private playPromise: Promise<void> | null = null;

    // Featured Aura-2 voices for interview scenarios
    private readonly featuredVoices: DeepgramVoice[] = [
        {
            id: 'aura-2-thalia-en',
            name: 'Thalia',
            lang: 'en-US',
            accent: 'American',
            gender: 'feminine',
            age_group: 'Adult',
            characteristics: ['Clear', 'Confident', 'Energetic', 'Enthusiastic'],
            use_cases: ['Casual chat', 'Customer service', 'IVR']
        },
        {
            id: 'aura-2-helena-en',
            name: 'Helena',
            lang: 'en-US',
            accent: 'American',
            gender: 'feminine',
            age_group: 'Adult',
            characteristics: ['Caring', 'Natural', 'Positive', 'Friendly', 'Raspy'],
            use_cases: ['IVR', 'Casual chat']
        },
        {
            id: 'aura-2-delia-en',
            name: 'Delia',
            lang: 'en-US',
            accent: 'American',
            gender: 'feminine',
            age_group: 'Young Adult',
            characteristics: ['Casual', 'Friendly', 'Cheerful', 'Breathy'],
            use_cases: ['Interview']
        },
        {
            id: 'aura-2-vesta-en',
            name: 'Vesta',
            lang: 'en-US',
            accent: 'American',
            gender: 'feminine',
            age_group: 'Adult',
            characteristics: ['Natural', 'Expressive', 'Patient', 'Empathetic'],
            use_cases: ['Customer service', 'Interview', 'Storytelling']
        },
        {
            id: 'aura-2-apollo-en',
            name: 'Apollo',
            lang: 'en-US',
            accent: 'American',
            gender: 'masculine',
            age_group: 'Adult',
            characteristics: ['Confident', 'Comfortable', 'Casual'],
            use_cases: ['Casual chat']
        },
        {
            id: 'aura-2-arcas-en',
            name: 'Arcas',
            lang: 'en-US',
            accent: 'American',
            gender: 'masculine',
            age_group: 'Adult',
            characteristics: ['Natural', 'Smooth', 'Clear', 'Comfortable'],
            use_cases: ['Customer service', 'Casual chat']
        }
    ];

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.NEXT_PUBLIC_DEEPGRAM_TTS_API_KEY || '';

        if (!this.apiKey) {
            console.error('❌ Deepgram TTS API key not provided');
        } else {
            console.log('✅ Deepgram TTS System initialized');
            this.isInitialized = true;
        }
    }

    public getAvailableVoices(): DeepgramVoice[] {
        return this.featuredVoices;
    }

    public getBestVoice(gender: 'masculine' | 'feminine' = 'feminine', useCase: string = 'interview'): DeepgramVoice | null {
        // Filter voices by gender and use case
        const suitableVoices = this.featuredVoices.filter(voice =>
            voice.gender === gender &&
            voice.use_cases.some(uc => uc.toLowerCase().includes(useCase.toLowerCase()))
        );

        if (suitableVoices.length > 0) {
            return suitableVoices[0];
        }

        // Fallback to gender-specific voice
        const genderVoices = this.featuredVoices.filter(voice => voice.gender === gender);
        return genderVoices.length > 0 ? genderVoices[0] : this.featuredVoices[0];
    }

    public async speak(text: string, config: Partial<DeepgramTTSConfig> = {}): Promise<void> {
        if (!this.isInitialized) {
            throw new Error('Deepgram TTS system not initialized - API key missing');
        }

        if (!text.trim()) {
            console.warn('⚠️ Empty text provided to Deepgram TTS');
            return;
        }

        // Check text length (Aura-2 has 1000 character limit)
        if (text.length > 1000) {
            console.warn('⚠️ Text length exceeds 1000 characters, truncating for Aura-2 model');
            text = text.substring(0, 1000);
        }

        // Default configuration optimized for interviews
        const finalConfig: DeepgramTTSConfig = {
            encoding: 'mp3', // MP3 encoding doesn't support custom sample_rate
            ...config
        };

        // Select voice if not specified
        if (!finalConfig.voice) {
            const selectedVoice = this.getBestVoice('feminine', 'interview');
            if (!selectedVoice) {
                throw new Error('No suitable voice found');
            }
            finalConfig.voice = selectedVoice;
        }

        console.log('🔊 Speaking with Deepgram TTS:', {
            voice: finalConfig.voice.name,
            voiceId: finalConfig.voice.id,
            textLength: text.length,
            encoding: finalConfig.encoding
        });

        // Stop any current speech and wait for it to complete
        await this.stop();

        try {
            const audioData = await this.synthesizeSpeech(text, finalConfig);
            await this.playAudio(audioData);
        } catch (error) {
            console.error('❌ Deepgram TTS error:', error);
            throw error;
        }
    }

    private async synthesizeSpeech(text: string, config: DeepgramTTSConfig): Promise<ArrayBuffer> {
        const url = new URL(this.baseUrl);

        // Add model parameter (required)
        url.searchParams.set('model', config.voice!.id);

        // Add encoding if specified and supported
        if (config.encoding && ['linear16', 'mulaw', 'alaw', 'mp3', 'flac', 'opus'].includes(config.encoding)) {
            url.searchParams.set('encoding', config.encoding);
        }

        // Add sample rate only for encodings that support it (not MP3)
        if (config.sample_rate && config.encoding !== 'mp3' && [8000, 16000, 22050, 24000, 44100, 48000].includes(config.sample_rate)) {
            url.searchParams.set('sample_rate', config.sample_rate.toString());
        }

        // Note: container parameter is not needed for Deepgram API
        // It automatically determines container based on encoding

        const requestBody = {
            text: text.trim()
        };

        console.log('🌐 Deepgram TTS Request:', {
            url: url.toString(),
            model: config.voice!.id,
            encoding: config.encoding,
            textLength: text.length
        });

        try {
            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${this.apiKey}`,
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔴 Deepgram TTS API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });

                // Try to parse error as JSON for better error messages
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(`Deepgram TTS API error (${response.status}): ${errorJson.err_msg || errorJson.message || errorText}`);
                } catch {
                    throw new Error(`Deepgram TTS API error (${response.status}): ${errorText || response.statusText}`);
                }
            }

            // Get response headers for debugging
            const contentType = response.headers.get('content-type');
            const modelName = response.headers.get('dg-model-name');
            const charCount = response.headers.get('dg-char-count');

            console.log('✅ Deepgram TTS response:', {
                contentType,
                modelName,
                charCount: charCount ? parseInt(charCount) : 'unknown',
                size: response.headers.get('content-length')
            });

            return await response.arrayBuffer();

        } catch (error: any) {
            // Handle network errors specifically
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to Deepgram TTS API. Please check your internet connection.');
            }

            // Handle CORS errors
            if (error.message.includes('CORS')) {
                throw new Error('CORS error: Unable to access Deepgram TTS API from browser. This may require server-side proxy.');
            }

            // Re-throw other errors as-is
            throw error;
        }
    }

    private async playAudio(audioData: ArrayBuffer): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Create blob from audio data
                const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
                const audioUrl = URL.createObjectURL(audioBlob);

                // Create and configure audio element
                this.currentAudio = new Audio();
                this.currentAudio.src = audioUrl;
                this.currentAudio.preload = 'auto';

                // Set up event listeners
                this.currentAudio.onloadeddata = () => {
                    console.log('🎵 Deepgram TTS audio loaded');
                };

                this.currentAudio.onplay = () => {
                    console.log('▶️ Deepgram TTS playback started');
                    this.isPlaying = true;
                };

                this.currentAudio.onended = () => {
                    console.log('⏹️ Deepgram TTS playback ended');
                    this.isPlaying = false;
                    this.playPromise = null;
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    resolve();
                };

                this.currentAudio.onerror = (error) => {
                    console.error('❌ Deepgram TTS playback error:', error);
                    this.isPlaying = false;
                    this.playPromise = null;
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    reject(new Error('Audio playback failed'));
                };

                this.currentAudio.onpause = () => {
                    this.isPlaying = false;
                };

                // Start playback with proper promise handling
                this.playPromise = this.currentAudio.play().catch(error => {
                    console.error('❌ Failed to start Deepgram TTS playback:', error);
                    this.isPlaying = false;
                    this.playPromise = null;
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;

                    // Handle specific browser autoplay errors
                    if (error.name === 'NotAllowedError') {
                        reject(new Error('Audio playback blocked by browser. User interaction required.'));
                    } else {
                        reject(error);
                    }
                });

            } catch (error) {
                console.error('❌ Error setting up Deepgram TTS audio:', error);
                this.isPlaying = false;
                this.playPromise = null;
                reject(error);
            }
        });
    }

    public async stop(): Promise<void> {
        // If there's a pending play promise, wait for it to resolve/reject first
        if (this.playPromise) {
            try {
                await this.playPromise;
            } catch (error) {
                // Ignore play promise errors when stopping
                console.log('🛑 Stopping during play promise error (expected)');
            }
        }

        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
            this.isPlaying = false;
            this.playPromise = null;
            console.log('🛑 Deepgram TTS stopped');
        }
    }

    public pause(): void {
        if (this.currentAudio && !this.currentAudio.paused) {
            this.currentAudio.pause();
            this.isPlaying = false;
            console.log('⏸️ Deepgram TTS paused');
        }
    }

    public resume(): void {
        if (this.currentAudio && this.currentAudio.paused) {
            this.playPromise = this.currentAudio.play().catch(error => {
                console.error('❌ Failed to resume Deepgram TTS:', error);
                this.isPlaying = false;
            });
            console.log('▶️ Deepgram TTS resumed');
        }
    }

    public isSpeaking(): boolean {
        return this.isPlaying && !!this.currentAudio && !this.currentAudio.paused;
    }

    public isPaused(): boolean {
        return this.currentAudio ? this.currentAudio.paused : false;
    }

    public setVolume(volume: number): void {
        if (this.currentAudio) {
            this.currentAudio.volume = Math.max(0, Math.min(1, volume));
        }
    }

    public getVolume(): number {
        return this.currentAudio ? this.currentAudio.volume : 1.0;
    }
}

// Singleton instance
export const deepgramTTS = new DeepgramTTSSystem();
