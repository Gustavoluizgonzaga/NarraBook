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
  const mockIntervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synth = window.speechSynthesis;

  useEffect(() => {
    return () => {
      if (speakTimeoutRef.current) window.clearTimeout(speakTimeoutRef.current);
      if (mockIntervalRef.current) window.clearInterval(mockIntervalRef.current);
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
          return lang.startsWith('pt-') || lang.startsWith('en-') || lang.startsWith('es-');
        })
        .map(v => {
          let name = v.localService ? v.name : `${v.name} (Online)`;
          
          // Identify known male and female voices for better UX
          const nameLower = name.toLowerCase();
          if (/(antonio|tiago|thiago|daniel|cristiano|carlos|pedro|joao|jorge|julio|maciel)/i.test(nameLower)) {
            name = `${name} 👨`;
          } else if (/(francisca|luciana|maria|raquel|vitoria|leticia|helena|ana|fernanda|camila)/i.test(nameLower)) {
            name = `${name} 👩`;
          }
          
          // Google generic labels correction
          if (nameLower.includes('google') && nameLower.includes('português')) {
             if (name.includes('pt-br-x-afb')) name = `${name} (Masculina) 👨`;
             else if (name.includes('pt-br-x-afs')) name = `${name} (Masculina) 👨`;
             else if (name.includes('pt-br-x-afc')) name = `${name} (Feminina) 👩`;
             else if (name.includes('pt-br-x-afa')) name = `${name} (Feminina) 👩`;
          }

          return {
            id: v.voiceURI,
            name,
            lang: v.lang,
            isPremium: false,
            webVoice: v
          };
        })
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
    if (mockIntervalRef.current) window.clearInterval(mockIntervalRef.current);

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

      // Silent Highlighting Sync Fallback (for mobile native TTS lacking onboundary)
      let hasNativeBoundaries = false;
      let mockStartTime = 0;
      let totalPausedMs = 0;
      let pauseStart = 0;
      let currentWordIdx = 0;
      
      const words: {charIndex: number, charLength: number}[] = [];
      const regex = /\S+/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
          words.push({ charIndex: match.index, charLength: match[0].length });
      }

      utterance.onstart = () => {
         mockStartTime = Date.now();
         setTimeout(() => {
            if (!hasNativeBoundaries && words.length > 0) {
               mockIntervalRef.current = window.setInterval(() => {
                  if (synth.paused) {
                     if (pauseStart === 0) pauseStart = Date.now();
                     return;
                  } else if (pauseStart > 0) {
                     totalPausedMs += (Date.now() - pauseStart);
                     pauseStart = 0;
                  }
                  
                  const runningMs = Date.now() - mockStartTime - totalPausedMs;
                  // ~13 chars per second at 1x rate is a good estimate for PT-BR reading
                  const charsShouldBeRead = (runningMs / 1000) * (13 * options.rate);
                  
                  while (currentWordIdx < words.length && words[currentWordIdx].charIndex <= charsShouldBeRead) {
                      if (options.onBoundary) {
                          options.onBoundary(words[currentWordIdx]);
                      }
                      currentWordIdx++;
                  }
                  if (currentWordIdx >= words.length && mockIntervalRef.current) {
                      clearInterval(mockIntervalRef.current);
                  }
               }, 50);
            }
         }, 300);
      };

      utterance.onboundary = (event) => {
        hasNativeBoundaries = true;
        if (mockIntervalRef.current) {
           window.clearInterval(mockIntervalRef.current);
           mockIntervalRef.current = null;
        }
        if (options.onBoundary) options.onBoundary({ charIndex: event.charIndex, charLength: event.charLength });
      };

      utterance.onend = () => {
        if (mockIntervalRef.current) window.clearInterval(mockIntervalRef.current);
        setStatus('idle');
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (event) => {
        if (mockIntervalRef.current) window.clearInterval(mockIntervalRef.current);
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
    if (mockIntervalRef.current) window.clearInterval(mockIntervalRef.current);
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
