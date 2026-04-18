/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LandingPage } from './components/LandingPage';
import { UploadScreen } from './components/UploadScreen';
import { PlayerScreen } from './components/PlayerScreen';
import { LibraryScreen } from './components/LibraryScreen';
import { useFileParser } from './hooks/useFileParser';
import { BookData, PlaybackSettings, LibraryEntry } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

const STORAGE_KEY_LIBRARY = 'narrabook_library';
const STORAGE_KEY_CURRENT_ID = 'narrabook_current_id';
const STORAGE_KEY_THEME = 'narrabook_theme';

export default function App() {
  const [view, setView] = useState<'landing' | 'upload' | 'player' | 'library'>('landing');
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const { parseFile } = useFileParser();

  const currentEntry = library.find(e => e.id === currentBookId);

  // Load from localStorage on mount
  useEffect(() => {
    const savedLibrary = localStorage.getItem(STORAGE_KEY_LIBRARY);
    const savedCurrentId = localStorage.getItem(STORAGE_KEY_CURRENT_ID);
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as 'dark' | 'light';

    if (savedLibrary) {
      try {
        setLibrary(JSON.parse(savedLibrary));
      } catch (e) {
        console.error('Failed to load library', e);
      }
    }
    if (savedCurrentId) {
      setCurrentBookId(savedCurrentId);
    }
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Save library to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(library));
  }, [library]);

  // Save current ID to localStorage
  useEffect(() => {
    if (currentBookId) {
      localStorage.setItem(STORAGE_KEY_CURRENT_ID, currentBookId);
    }
  }, [currentBookId]);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsParsing(true);
    setError(undefined);
    try {
      const bookData = await parseFile(file);
      const id = crypto.randomUUID();
      const newEntry: LibraryEntry = {
        id,
        book: bookData,
        settings: {
          rate: 1,
          volume: 1,
          paragraphIndex: 0
        },
        lastRead: Date.now()
      };
      
      setLibrary(prev => [...prev, newEntry]);
      setCurrentBookId(id);
      setView('player');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo');
    } finally {
      setIsParsing(false);
    }
  }, [parseFile]);

  const handleSettingsChange = useCallback((newSettings: PlaybackSettings) => {
    setLibrary(prev => prev.map(entry => 
      entry.id === currentBookId 
        ? { ...entry, settings: newSettings, lastRead: Date.now() } 
        : entry
    ));
  }, [currentBookId]);

  const handleSelectBook = useCallback((entry: LibraryEntry) => {
    setCurrentBookId(entry.id);
    setView('player');
  }, []);

  const handleRemoveBook = useCallback((id: string) => {
    setLibrary(prev => prev.filter(e => e.id !== id));
    setCurrentBookId(prev => prev === id ? null : prev);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-background transition-colors duration-300">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage 
              onStart={() => setView('upload')} 
              onViewLibrary={() => setView('library')}
            />
            
            {/* Continue Reading Banner */}
            {currentEntry && (
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6"
              >
                <div className="bg-background/80 backdrop-blur-xl border border-foreground/10 p-4 rounded-3xl flex items-center justify-between gap-4 shadow-2xl">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent shrink-0">
                      📚
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-foreground/40 uppercase tracking-widest">Continuar lendo</p>
                      <p className="text-sm font-bold truncate">{currentEntry.book.metadata.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setView('player')}
                    className="px-4 py-2 bg-accent text-background text-xs font-bold rounded-full hover:scale-105 transition-transform shrink-0"
                  >
                    Abrir
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {view === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <LibraryScreen
              library={library}
              onSelectBook={handleSelectBook}
              onRemoveBook={handleRemoveBook}
              onBack={() => setView('landing')}
            />
          </motion.div>
        )}

        {view === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <UploadScreen 
              onFileSelect={handleFileSelect} 
              isParsing={isParsing} 
              error={error} 
            />
            <button 
              onClick={() => setView('landing')}
              className="fixed top-4 left-6 p-3 rounded-2xl bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-colors text-sm font-medium"
            >
              ← Voltar
            </button>
          </motion.div>
        )}

        {view === 'player' && currentEntry && (
          <motion.div
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PlayerScreen
              book={currentEntry.book}
              initialSettings={currentEntry.settings}
              onSettingsChange={handleSettingsChange}
              onClose={() => setView('library')}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
