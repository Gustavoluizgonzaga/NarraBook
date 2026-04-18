import { useState, useEffect, useRef, useCallback } from 'react';

export interface AppVoice {
  id: string;
  name: string;
  lang: string;
  isPremium: boolean;
  webVoice?: SpeechSynthesisVoice;
}

interface SpeechOptions {
  rate: number;
  volume: number;
  voice?: AppVoice;
  onBoundary?: (event: { charIndex: number; charLength: number }) => void;
  onEnd?: () => void;
  onError?: (event: any) => void;
}

export type SpeechStatus = 'idle' | 'playing' | 'paused';

export const useSpeech = () => {
  const [voices, setVoices] = useState<AppVoice[]>([]);
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const speakTimeoutRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synth = window.speechSynthesis;

  useEffect(() => {
    return () => {
      if (speakTimeoutRef.current) window.clearTimeout(speakTimeoutRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      const webVoices: AppVoice[] = availableVoices
        .filter(v => {
          const lang = v.lang.replace('_', '-').toLowerCase();
          return ['pt-br', 'en-us', 'en-gb', 'es-es', 'es-mx'].includes(lang) || lang.startsWith('es-');
        })
        .map(v => ({
          id: v.voiceURI,
          name: v.localService ? v.name : `${v.name} (Online)`,
          lang: v.lang,
          isPremium: false,
          webVoice: v
        }))
        .sort((a, b) => {
          // Sort local voices to the top to avoid network latency/muting on mobile
          const aLocal = a.webVoice?.localService ? 1 : 0;
          const bLocal = b.webVoice?.localService ? 1 : 0;
          if (aLocal !== bLocal) {
            return bLocal - aLocal;
          }
          return a.name.localeCompare(b.name);
        });
      
      setVoices(webVoices);
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    // Fallback for mobile browsers that delay voice loading
    const t1 = setTimeout(loadVoices, 500);
    const t2 = setTimeout(loadVoices, 1500);
    const t3 = setTimeout(loadVoices, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [synth]);

  const speak = useCallback(async (text: string, options: SpeechOptions) => {
    if (synth.paused) synth.resume();
    synth.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    if (speakTimeoutRef.current) window.clearTimeout(speakTimeoutRef.current);

    // Web Speech API
    speakTimeoutRef.current = window.setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate;
      utterance.volume = options.volume;
      
      // Explicitly set the language to fix mobile browser pronunciation bugs
      utterance.lang = options.voice?.lang || 'pt-BR';
      
      if (options.voice?.webVoice) {
        utterance.voice = options.voice.webVoice;
      }

      utterance.onboundary = (event) => {
        if (options.onBoundary) options.onBoundary({ charIndex: event.charIndex, charLength: event.charLength });
      };

      utterance.onend = () => {
        setStatus('idle');
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (event) => {
        setStatus('idle');
        if (options.onError) options.onError(event);
      };

      setStatus('playing');
      synth.speak(utterance);
    }, 50);
  }, [synth]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else {
      synth.pause();
    }
    setStatus('paused');
  }, [synth]);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
    } else {
      synth.resume();
    }
    setStatus('playing');
  }, [synth]);

  const cancel = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    synth.cancel();
    setStatus('idle');
  }, [synth]);

  return {
    voices,
    status,
    speak,
    pause,
    resume,
    cancel
  };
};
