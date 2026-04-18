import React, { useState, useMemo } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX, FastForward, Rewind,
  Settings, Moon, Sun, EyeOff, Eye,
  Zap, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { SpeechStatus, AppVoice } from '../hooks/useSpeech';
import { Tooltip } from './Tooltip';

interface PlayerControlsProps {
  status: SpeechStatus;
  onPlayPause: () => void;
  onSkip: (seconds: number) => void;
  onPrevParagraph: () => void;
  onNextParagraph: () => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  rate: number;
  onRateChange: (val: number) => void;
  voices: AppVoice[];
  selectedVoiceURI?: string;
  onVoiceChange: (uri: string) => void;
  onToggleFullscreen: () => void;
  isFocusMode: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  sleepTimer: number | null;
  onSleepTimerChange: (minutes: number | null) => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  status,
  onPlayPause,
  onSkip,
  onPrevParagraph,
  onNextParagraph,
  volume,
  onVolumeChange,
  rate,
  onRateChange,
  voices,
  selectedVoiceURI,
  onVoiceChange,
  onToggleFullscreen,
  isFocusMode,
  theme,
  onToggleTheme,
  sleepTimer,
  onSleepTimerChange
}) => {
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);

  const filteredVoices = useMemo(() => {
    const targetLocales = ['en-US', 'en-GB', 'en-IE', 'pt-BR', 'es-ES', 'es-MX'];
    
    // Gender heuristics based on common voice names
    const femaleNames = ['maria', 'luciana', 'helena', 'samantha', 'victoria', 'hazel', 'susan', 'female', 'woman', 'zira', 'linda', 'heather', 'alice', 'elsa'];
    const maleNames = ['daniel', 'ricardo', 'felipe', 'david', 'james', 'george', 'male', 'man', 'mark', 'richard', 'steven', 'paul', 'guy'];

    const getGender = (name: string) => {
      const lowerName = (name || '').toLowerCase();
      if (femaleNames.some(n => lowerName.includes(n))) return 'female';
      if (maleNames.some(n => lowerName.includes(n))) return 'male';
      return 'unknown';
    };

    const grouped: Record<string, { male: AppVoice[], female: AppVoice[], unknown: AppVoice[] }> = {};
    
    targetLocales.forEach(locale => {
      grouped[locale] = { male: [], female: [], unknown: [] };
    });

    voices.forEach(voice => {
      if (!voice || !voice.lang) return;
      
      const voiceLang = voice.lang.toLowerCase().replace('_', '-');

      const locale = targetLocales.find(l => {
        const targetLocale = l.toLowerCase();
        return voiceLang === targetLocale || voiceLang.startsWith(targetLocale + '-') || targetLocale.startsWith(voiceLang + '-');
      });

      if (locale) {
        const gender = getGender(voice.name);
        grouped[locale][gender].push(voice);
      }
    });

    const result: AppVoice[] = [];
    targetLocales.forEach(locale => {
      const group = grouped[locale];
      
      // Take up to 3 female
      result.push(...group.female.slice(0, 3));
      
      // Take up to 3 male
      result.push(...group.male.slice(0, 3));
      
      // If we don't have enough, fill with unknown to reach at least some variety
      const currentCount = group.female.slice(0, 3).length + group.male.slice(0, 3).length;
      if (currentCount < 6) {
        result.push(...group.unknown.slice(0, 6 - currentCount));
      }
    });

    // Fallback: if no voices matched our strict locales, show some voices
    if (result.length === 0 && voices.length > 0) {
      return voices.filter(v => v && v.lang).slice(0, 15);
    }

    return result;
  }, [voices]);

  const isPlaying = status === 'playing';

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 px-4 lg:px-6 pb-6 lg:pb-8 pt-4 bg-gradient-to-t from-background via-background to-transparent transition-all duration-500",
      isFocusMode ? "opacity-0 translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
    )}>
      <div className="max-w-6xl mx-auto bg-background/90 backdrop-blur-xl border border-foreground/10 rounded-[24px] lg:rounded-[32px] p-3 lg:p-4 flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8 shadow-2xl">
        
        {/* Left: Speed & Voice (Compact on mobile/tablet) */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-center lg:justify-start border-b lg:border-none border-foreground/5 pb-3 lg:pb-0">
          <div className="relative">
            <Tooltip content="Velocidade de leitura">
              <button 
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowVoiceMenu(false);
                }}
                className="px-4 py-2 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-accent" />
                {rate}x
              </button>
            </Tooltip>
            <AnimatePresence>
              {showSpeedMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full mb-4 left-0 bg-background border border-foreground/10 rounded-2xl p-2 min-w-[120px] shadow-2xl z-[110]"
                >
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3].map(val => (
                    <button
                      key={val}
                      onClick={() => { onRateChange(val); setShowSpeedMenu(false); }}
                      className={cn(
                        "w-full text-left px-4 py-2 rounded-xl text-sm transition-colors",
                        rate === val ? "bg-accent text-background font-bold" : "hover:bg-foreground/5"
                      )}
                    >
                      {val}x
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <Tooltip content="Escolher narrador">
              <button 
                onClick={() => {
                  setShowVoiceMenu(!showVoiceMenu);
                  setShowSpeedMenu(false);
                }}
                className="px-4 py-2 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors text-sm font-medium flex items-center gap-2 max-w-[150px] truncate"
              >
                <Settings className="w-4 h-4 text-accent" />
                {voices.find(v => v.id === selectedVoiceURI)?.name || 'Voz'}
              </button>
            </Tooltip>
            <AnimatePresence>
              {showVoiceMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full mb-4 left-0 bg-background border border-foreground/10 rounded-2xl p-2 min-w-[240px] max-h-[400px] overflow-y-auto shadow-2xl custom-scrollbar z-[110]"
                >
                  <div className="space-y-1">
                    {filteredVoices.map(voice => (
                      <button
                        key={voice.id}
                        onClick={() => { onVoiceChange(voice.id); setShowVoiceMenu(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2 rounded-xl text-sm transition-colors flex flex-col",
                          selectedVoiceURI === voice.id ? "bg-accent text-background font-bold" : "hover:bg-foreground/5"
                        )}
                      >
                        <span className="truncate flex items-center gap-2">
                          {voice.name}
                        </span>
                        <span className={cn(
                          "text-[10px] uppercase tracking-wider opacity-60", 
                          selectedVoiceURI === voice.id ? "text-background" : "text-foreground"
                        )}>
                          {voice.lang}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative">
            <Tooltip content="Sleep Timer">
              <button 
                onClick={() => {
                  setShowSleepMenu(!showSleepMenu);
                  setShowSpeedMenu(false);
                  setShowVoiceMenu(false);
                }}
                className={cn(
                  "px-4 py-2 rounded-full transition-colors text-sm font-medium flex items-center gap-2",
                  sleepTimer ? "bg-accent/20 text-accent" : "bg-foreground/5 hover:bg-foreground/10"
                )}
              >
                <Clock className="w-4 h-4" />
                {sleepTimer ? `${Math.ceil(sleepTimer / 60)}m` : 'Sleep'}
              </button>
            </Tooltip>
            <AnimatePresence>
              {showSleepMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full mb-4 left-0 bg-background border border-foreground/10 rounded-2xl p-2 min-w-[140px] shadow-2xl z-[110]"
                >
                  <p className="px-4 py-2 text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Desligar em:</p>
                  {[5, 15, 30, 45, 60].map(mins => (
                    <button
                      key={mins}
                      onClick={() => { onSleepTimerChange(mins); setShowSleepMenu(false); }}
                      className={cn(
                        "w-full text-left px-4 py-2 rounded-xl text-sm transition-colors",
                        sleepTimer === mins * 60 ? "bg-accent text-background font-bold" : "hover:bg-foreground/5"
                      )}
                    >
                      {mins} minutos
                    </button>
                  ))}
                  {sleepTimer && (
                    <button
                      onClick={() => { onSleepTimerChange(null); setShowSleepMenu(false); }}
                      className="w-full text-left px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-colors mt-1 border-t border-foreground/5 pt-3"
                    >
                      Cancelar Timer
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Main Controls */}
        <div className="flex items-center gap-6 lg:gap-6">
          <Tooltip content="Parágrafo anterior">
            <button onClick={onPrevParagraph} className="p-2 text-foreground/60 hover:text-accent transition-colors">
              <SkipBack className="w-6 h-6" />
            </button>
          </Tooltip>
          <Tooltip content="Retroceder 10s">
            <button onClick={() => onSkip(-10)} className="p-2 text-foreground/60 hover:text-accent transition-colors">
              <Rewind className="w-6 h-6" />
            </button>
          </Tooltip>
          
          <Tooltip content={isPlaying ? "Pausar" : "Reproduzir"}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onPlayPause}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-300 shadow-lg",
                isPlaying 
                  ? "bg-[rgba(74,124,111,0.25)] border-[#4A7C6F] shadow-[0_0_0_4px_rgba(74,124,111,0.12)]" 
                  : "bg-foreground border-transparent text-background pulse-animation"
              )}
              style={isPlaying ? { color: '#7BC4B5' } : {}}
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </motion.button>
          </Tooltip>

          <Tooltip content="Avançar 10s">
            <button onClick={() => onSkip(10)} className="p-2 text-foreground/60 hover:text-accent transition-colors">
              <FastForward className="w-6 h-6" />
            </button>
          </Tooltip>
          <Tooltip content="Próximo parágrafo">
            <button onClick={onNextParagraph} className="p-2 text-foreground/60 hover:text-accent transition-colors">
              <SkipForward className="w-6 h-6" />
            </button>
          </Tooltip>
        </div>

        {/* Right: Volume & Extra */}
        <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto justify-center lg:justify-end border-t lg:border-none border-foreground/5 pt-3 lg:pt-0">
          <div className="flex items-center gap-3 group">
            <Tooltip content={volume === 0 ? "Ativar áudio" : "Mudo"}>
              <button onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}>
                {volume === 0 ? <VolumeX className="w-5 h-5 text-foreground/40" /> : <Volume2 className="w-5 h-5 text-accent" />}
              </button>
            </Tooltip>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="hidden lg:block w-24 h-1.5 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-accent"
            />
          </div>
          
          <div className="flex items-center gap-2 border-l border-foreground/10 pl-4 lg:pl-6">
            <Tooltip content={isFocusMode ? "Mostrar controles" : "Modo Foco (ocultar player)"}>
              <button onClick={onToggleFullscreen} className="p-2 text-foreground/40 hover:text-accent transition-colors">
                {isFocusMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </Tooltip>
            <Tooltip content={theme === 'dark' ? "Modo dia" : "Modo noite"}>
              <button 
                onClick={onToggleTheme}
                className="p-2 text-foreground/40 hover:text-accent transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};
