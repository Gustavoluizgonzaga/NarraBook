import React from 'react';
import { BookData, Chapter } from '../types';
import { cn } from '../lib/utils';
import { List, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  book: BookData;
  currentParagraphIndex: number;
  onChapterSelect: (index: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  book,
  currentParagraphIndex,
  onChapterSelect,
  isOpen,
  onToggle
}) => {
  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <div className={cn(
        "fixed left-0 top-0 bottom-0 z-40 bg-background/95 backdrop-blur-2xl border-r border-foreground/10 transition-transform duration-500 overflow-hidden w-[85vw] sm:w-80",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="w-full h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                <List className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-display">Capítulos</h2>
            </div>
            <button 
              onClick={onToggle}
              className="lg:hidden p-2 rounded-xl bg-foreground/5 text-foreground/60 hover:bg-foreground/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto space-y-2 pr-2">
            {book.chapters.map((chapter, i) => {
              const isActive = i === book.chapters.length - 1 
                ? currentParagraphIndex >= chapter.startIndex
                : currentParagraphIndex >= chapter.startIndex && currentParagraphIndex < book.chapters[i+1].startIndex;

              return (
                <button
                  key={chapter.id}
                  onClick={() => onChapterSelect(chapter.startIndex)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl transition-all group flex items-center justify-between",
                    isActive ? "bg-accent text-background font-bold shadow-lg shadow-accent/10" : "hover:bg-foreground/5 text-foreground/60"
                  )}
                >
                  <span className="truncate text-sm">{chapter.title}</span>
                  <ChevronRight className={cn("w-4 h-4 transition-transform", isActive ? "translate-x-0" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1")} />
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-foreground/10">
            <div className="flex items-center gap-4">
              {book.metadata.cover ? (
                <img src={book.metadata.cover} alt="Cover" className="w-12 h-16 object-cover rounded shadow-lg" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-12 h-16 bg-accent/10 rounded flex items-center justify-center text-accent font-bold">
                  {book.metadata.title[0]}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{book.metadata.title}</p>
                <p className="text-xs text-foreground/40 truncate">{book.metadata.author || 'Autor desconhecido'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
