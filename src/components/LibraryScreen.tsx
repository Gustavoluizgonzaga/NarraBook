import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LibraryEntry } from '../types';
import { Trash2, Play, Clock, BookOpen, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface LibraryScreenProps {
  library: LibraryEntry[];
  onSelectBook: (entry: LibraryEntry) => void;
  onRemoveBook: (id: string) => void;
  onBack: () => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  library,
  onSelectBook,
  onRemoveBook,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="p-3 rounded-2xl bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-display font-bold">Sua Biblioteca</h1>
              <p className="text-foreground/40 mt-1">
                {library.length} {library.length === 1 ? 'livro salvo' : 'livros salvos'}
              </p>
            </div>
          </div>
        </header>

        {library.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-24 h-24 bg-foreground/5 rounded-[40px] flex items-center justify-center mb-6 text-foreground/20">
              <BookOpen className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-display font-medium mb-2">Sua biblioteca está vazia</h2>
            <p className="text-foreground/40 max-w-xs">
              Carregue um arquivo para começar a construir sua coleção de audiobooks.
            </p>
            <button
              onClick={onBack}
              className="mt-8 px-8 py-4 bg-accent text-background font-bold rounded-2xl hover:scale-105 transition-transform"
            >
              Começar agora
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {library.sort((a, b) => b.lastRead - a.lastRead).map((entry) => {
                const progress = Math.round((entry.settings.paragraphIndex / entry.book.paragraphs.length) * 100);
                
                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative bg-background border border-foreground/10 rounded-[40px] p-6 hover:bg-background/80 transition-all duration-500 hover:border-accent/30"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-500">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <button
                        onClick={() => onRemoveBook(entry.id)}
                        className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-xl font-display font-bold mb-1 line-clamp-1">{entry.book.metadata.title}</h3>
                      <p className="text-sm text-foreground/40 line-clamp-1">
                        {entry.book.metadata.author || 'Autor desconhecido'}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-foreground/40">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>Progresso</span>
                        </div>
                        <span>{progress}%</span>
                      </div>
                      
                      <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-accent"
                        />
                      </div>

                      <button
                        onClick={() => onSelectBook(entry)}
                        className="w-full mt-4 py-4 bg-foreground/5 border border-foreground/10 rounded-2xl flex items-center justify-center gap-3 font-bold group-hover:bg-accent group-hover:text-background group-hover:border-accent transition-all duration-500"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        Retomar Leitura
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
