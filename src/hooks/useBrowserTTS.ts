import { useCallback, useRef, useEffect } from 'react';

export function useBrowserTTS() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeaking = useRef(false);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis || !text.trim()) return;

    // Stop any current speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      isSpeaking.current = true;
    };

    utterance.onend = () => {
      isSpeaking.current = false;
    };

    utterance.onerror = () => {
      isSpeaking.current = false;
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      isSpeaking.current = false;
    }
  }, []);

  const isCurrentlySpeaking = useCallback(() => {
    return speechSynthesis.speaking || isSpeaking.current;
  }, []);

  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  return { speak, stop, isCurrentlySpeaking };
}
