import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookData, PlaybackSettings } from '../types';
import { Sidebar } from './Sidebar';
import { TextViewer } from './TextViewer';
import { PlayerControls } from './PlayerControls';
import { useSpeech } from '../hooks/useSpeech';
import { Menu, X, HelpCircle, Info, Eye, Smartphone, Keyboard as KeyboardIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Tooltip } from './Tooltip';

interface PlayerScreenProps {
  book: BookData;
  initialSettings: PlaybackSettings;
  onSettingsChange: (settings: PlaybackSettings) => void;
  onClose: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const PlayerScreen: React.FC<PlayerScreenProps> = ({
  book,
  initialSettings,
  onSettingsChange,
  onClose,
  theme,
  onToggleTheme
}) => {
  const [settings, setSettings] = useState<PlaybackSettings>(initialSettings);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWordLength, setCurrentWordLength] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null); // in seconds

  const currentPosRef = useRef(0);
  const playbackOffsetRef = useRef(0);

  const { voices, status, speak, pause, resume, cancel } = useSpeech();

  const currentVoice = voices.find(v => v.id === settings.voiceURI) || voices[0];

  const handleNextParagraph = useCallback(() => {
    setSettings(prev => {
      if (prev.paragraphIndex < book.paragraphs.length - 1) {
        const newIndex = prev.paragraphIndex + 1;
        currentPosRef.current = 0;
        playbackOffsetRef.current = 0;
        setCurrentWordIndex(0);
        return { ...prev, paragraphIndex: newIndex };
      }
      return prev;
    });
  }, [book.paragraphs.length]);

  const handlePrevParagraph = useCallback(() => {
    setSettings(prev => {
      if (prev.paragraphIndex > 0) {
        const newIndex = prev.paragraphIndex - 1;
        currentPosRef.current = 0;
        playbackOffsetRef.current = 0;
        setCurrentWordIndex(0);
        return { ...prev, paragraphIndex: newIndex };
      }
      return prev;
    });
  }, []);

  const handleSkip = useCallback((seconds: number) => {
    // Average reading speed: 15 chars per second
    const charJump = seconds * 15;
    const targetCharIndex = currentPosRef.current + charJump;
    const currentText = book.paragraphs[settings.paragraphIndex];

    if (targetCharIndex < 0) {
      handlePrevParagraph();
    } else if (targetCharIndex >= currentText.length) {
      handleNextParagraph();
    } else {
      currentPosRef.current = targetCharIndex;
      playbackOffsetRef.current = targetCharIndex;
      setCurrentWordIndex(targetCharIndex);
      
      if (shouldPlay) {
        const slicedText = currentText.slice(targetCharIndex);
        
        speak(slicedText, {
          rate: settings.rate,
          volume: settings.volume,
          voice: currentVoice,
          onBoundary: (event) => {
            const absoluteIndex = playbackOffsetRef.current + event.charIndex;
            currentPosRef.current = absoluteIndex;
            setCurrentWordIndex(absoluteIndex);
            setCurrentWordLength(event.charLength);
          },
          onEnd: handleNextParagraph
        });
      }
    }
  }, [settings.paragraphIndex, book.paragraphs, shouldPlay, speak, settings.rate, settings.volume, currentVoice, handleNextParagraph, handlePrevParagraph]);

  // Sync settings with parent
  useEffect(() => {
    // Only sync if settings have actually changed from initial or previous sync
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  const handlePlayPause = useCallback(() => {
    if (status === 'playing') {
      setShouldPlay(false);
      cancel(); // Use cancel instead of pause for more reliable state
    } else {
      setShouldPlay(true);
      // The useEffect will trigger the speak() call
    }
  }, [status, cancel]);

  // Auto-play when paragraph changes or settings change (debounced for volume/rate)
  useEffect(() => {
    if (!shouldPlay) return;

    const timer = setTimeout(() => {
      const startPos = currentPosRef.current;
      playbackOffsetRef.current = startPos;
      
      const textToSpeak = book.paragraphs[settings.paragraphIndex].slice(startPos);
      
      speak(textToSpeak, {
        rate: settings.rate,
        volume: settings.volume,
        voice: currentVoice,
        onBoundary: (event) => {
          const absoluteIndex = playbackOffsetRef.current + event.charIndex;
          currentPosRef.current = absoluteIndex;
          setCurrentWordIndex(absoluteIndex);
          setCurrentWordLength(event.charLength);
        },
        onEnd: handleNextParagraph
      });
    }, 150);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.paragraphIndex, settings.rate, settings.volume, currentVoice, shouldPlay]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowLeft') {
        handlePrevParagraph();
      } else if (e.code === 'ArrowRight') {
        handleNextParagraph();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setSettings(prev => ({ ...prev, rate: Math.min(prev.rate + 0.25, 3) }));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setSettings(prev => ({ ...prev, rate: Math.max(prev.rate - 0.25, 0.5) }));
      } else if (e.key.toLowerCase() === 'm') {
        setSettings(prev => ({ ...prev, volume: prev.volume === 0 ? 1 : 0 }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handlePrevParagraph, handleNextParagraph]);

  // Sleep Timer logic
  useEffect(() => {
    if (sleepTimer === null || sleepTimer <= 0) {
      if (sleepTimer === 0) {
        setShouldPlay(false);
        cancel();
        setSleepTimer(null);
      }
      return;
    }

    const interval = setInterval(() => {
      setSleepTimer(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimer, cancel]);

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      <Sidebar
        book={book}
        currentParagraphIndex={settings.paragraphIndex}
        onChapterSelect={(index) => {
          setSettings(prev => ({ ...prev, paragraphIndex: index }));
          onSettingsChange({ ...settings, paragraphIndex: index });
          if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
          }
        }}
        isOpen={isSidebarOpen && !isFocusMode}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className={cn(
        "flex-grow relative transition-all duration-500 flex flex-col",
        isSidebarOpen && !isFocusMode ? "lg:ml-80" : "ml-0"
      )}>
        {/* Header */}
        <header className={cn(
          "absolute top-0 left-0 right-0 z-30 p-4 md:p-6 flex items-center justify-between transition-all duration-500 pointer-events-none",
          isFocusMode ? "opacity-0 -translate-y-full" : "opacity-100 translate-y-0"
        )}>
          <div className="flex items-center gap-3 md:gap-4 pointer-events-auto">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 rounded-2xl bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm md:text-lg font-display truncate max-w-[120px] sm:max-w-[200px] md:max-w-md">{book.metadata.title}</h1>
              <p className="text-[10px] md:text-xs text-foreground/40 uppercase tracking-widest">
                {settings.paragraphIndex + 1} / {book.paragraphs.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <Tooltip content="Melhorar Vozes">
              <button 
                onClick={() => setShowVoiceHelp(true)}
                className="p-2 md:p-3 rounded-2xl bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-colors"
              >
                <Smartphone className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </Tooltip>
            <Tooltip content="Atalhos de teclado">
              <button 
                onClick={() => setShowShortcuts(true)}
                className="p-2 md:p-3 rounded-2xl bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-colors"
              >
                <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </Tooltip>
            <Tooltip content="Sair do player">
              <button 
                onClick={onClose}
                className="p-2 md:p-3 rounded-2xl bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-colors text-red-400 text-xs md:text-sm"
              >
                Sair
              </button>
            </Tooltip>
          </div>
        </header>

        {/* Content */}
        <div className="flex-grow overflow-y-auto px-6">
          <TextViewer
            paragraphs={book.paragraphs}
            currentIndex={settings.paragraphIndex}
            currentWordIndex={currentWordIndex}
            currentWordLength={currentWordLength}
            isFocusMode={isFocusMode}
          />
        </div>

        {/* Controls */}
        <PlayerControls
          status={status}
          onPlayPause={handlePlayPause}
          onSkip={handleSkip}
          onPrevParagraph={handlePrevParagraph}
          onNextParagraph={handleNextParagraph}
          volume={settings.volume}
          onVolumeChange={(v) => {
            setSettings(prev => ({ ...prev, volume: v }));
          }}
          rate={settings.rate}
          onRateChange={(r) => {
            setSettings(prev => ({ ...prev, rate: r }));
          }}
          voices={voices}
          selectedVoiceURI={settings.voiceURI}
          onVoiceChange={(uri) => {
            setSettings(prev => ({ ...prev, voiceURI: uri }));
          }}
          onToggleFullscreen={() => setIsFocusMode(!isFocusMode)}
          isFocusMode={isFocusMode}
          theme={theme}
          onToggleTheme={onToggleTheme}
          sleepTimer={sleepTimer}
          onSleepTimerChange={(mins) => {
            setSleepTimer(mins ? mins * 60 : null);
          }}
        />

        {/* Exit Focus Mode Button */}
        <AnimatePresence>
          {isFocusMode && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsFocusMode(false)}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 p-4 rounded-full bg-background/80 backdrop-blur-xl border border-foreground/10 shadow-2xl hover:bg-background transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Eye className="w-5 h-5 text-accent" />
              Mostrar controles
            </motion.button>
          )}
        </AnimatePresence>
      </main>

      {/* Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-background border border-foreground/10 rounded-[40px] p-8 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                  <Keyboard className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-display">Atalhos</h2>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'Espaço', action: 'Play / Pause' },
                  { key: '←', action: 'Parágrafo anterior' },
                  { key: '→', action: 'Próximo parágrafo' },
                  { key: '↑', action: 'Aumentar velocidade' },
                  { key: '↓', action: 'Diminuir velocidade' },
                  { key: 'M', action: 'Mute / Unmute' }
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-foreground/5">
                    <span className="text-foreground/60">{s.action}</span>
                    <kbd className="px-3 py-1 rounded-lg bg-foreground/10 border border-foreground/10 text-xs font-mono">{s.key}</kbd>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowShortcuts(false)}
                className="w-full mt-8 py-4 bg-accent text-background font-bold rounded-2xl hover:bg-accent/90 transition-colors"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Help Modal */}
      <AnimatePresence>
        {showVoiceHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
            onClick={() => setShowVoiceHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-background border border-foreground/10 rounded-[32px] p-8 md:p-12 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowVoiceHelp(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-display">Vozes Premium Gratuitas</h2>
                  <p className="text-foreground/60 text-sm">Aprenda a habilitar a mais alta qualidade no seu celular.</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Android Steps */}
                <div className="bg-foreground/[0.03] border border-foreground/5 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-green-500">🤖</span> Android <span className="text-sm font-normal text-foreground/50">(Ex. Samsung, Motorola)</span>
                  </h3>
                  <ol className="space-y-3 text-sm md:text-base text-foreground/80 list-decimal list-inside marker:text-accent font-medium">
                    <li>Vá nas <strong>Configurações</strong> do seu celular.</li>
                    <li>Pesquise por <em>"Texto para voz"</em> ou <em>"Conversão de texto em voz"</em> (costuma ficar em Acessibilidade ou Idioma).</li>
                    <li>No <strong>Mecanismo Preferido</strong> (geralmente "Serviços de fala do Google" ou "Samsung TTS"), clique na <strong>engrenagem ⚙️</strong> ao lado.</li>
                    <li>Vá em <strong>"Instalar dados de voz"</strong> {'>'} Selecione <strong>"Português (Brasil)"</strong>.</li>
                    <li>Baixe as vozes de alta qualidade (ou exclua e baixe novamente o pacote para recarregar as versões mais modernas femininas e masculinas).</li>
                  </ol>
                </div>

                {/* iOS Steps */}
                <div className="bg-foreground/[0.03] border border-foreground/5 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-gray-300">🍎</span> iPhone <span className="text-sm font-normal text-foreground/50">(iOS)</span>
                  </h3>
                  <ol className="space-y-3 text-sm md:text-base text-foreground/80 list-decimal list-inside marker:text-accent font-medium">
                    <li>Vá em <strong>Ajustes</strong> {'>'} <strong>Acessibilidade</strong> {'>'} <strong>Conteúdo Falado</strong> {'>'} <strong>Vozes</strong>.</li>
                    <li>Entre em <strong>Português (Brasil)</strong>.</li>
                    <li>Você verá nomes como "Luciana" e "Felipe". Baixe a versão com <strong>"Aprimorada" (Enhanced)</strong> ou <strong>"Premium"</strong> do lado.</li>
                    <p className="text-sm text-foreground/60 mt-3 ml-6">Elas são gratuitas, incrivelmente reais e, quando baixadas (pesam cerca de 200MB), aparecerão no NarraBook para leitura infinita e instantânea!</p>
                  </ol>
                </div>
              </div>

              <button 
                onClick={() => setShowVoiceHelp(false)}
                className="w-full mt-10 py-4 bg-accent text-background font-bold rounded-2xl hover:bg-accent/90 transition-colors text-lg"
              >
                Entendido!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper for Keyboard icon
function Keyboard(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" ry="2" />
      <path d="M6 8h.01" />
      <path d="M10 8h.01" />
      <path d="M14 8h.01" />
      <path d="M18 8h.01" />
      <path d="M6 12h.01" />
      <path d="M10 12h.01" />
      <path d="M14 12h.01" />
      <path d="M18 12h.01" />
      <path d="M7 16h10" />
    </svg>
  );
}
