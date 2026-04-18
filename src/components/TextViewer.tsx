import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TextViewerProps {
  paragraphs: string[];
  currentIndex: number;
  currentWordIndex: number;
  currentWordLength: number;
  isFocusMode: boolean;
}

export const TextViewer: React.FC<TextViewerProps> = ({
  paragraphs,
  currentIndex,
  currentWordIndex,
  currentWordLength,
  isFocusMode
}) => {
  const currentParagraph = paragraphs[currentIndex] || '';
  const prevParagraph = paragraphs[currentIndex - 1] || '';
  const nextParagraph = paragraphs[currentIndex + 1] || '';

  const highlightedText = useMemo(() => {
    if (!currentParagraph) return null;
    if (currentWordIndex === -1) return currentParagraph;

    const before = currentParagraph.substring(0, currentWordIndex);
    const word = currentParagraph.substring(currentWordIndex, currentWordIndex + currentWordLength);
    const after = currentParagraph.substring(currentWordIndex + currentWordLength);

    return (
      <>
        {before}
        <span className="word-highlight">{word}</span>
        {after}
      </>
    );
  }, [currentParagraph, currentWordIndex, currentWordLength]);

  return (
    <div className={cn(
      "flex flex-col items-center justify-center transition-all duration-700",
      isFocusMode ? "max-w-4xl mx-auto" : "max-w-3xl mx-auto"
    )}>
      <div className="w-full space-y-8 md:space-y-12 py-12 md:py-24">
        {/* Previous Paragraph */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex - 1}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.2, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-lg md:text-2xl font-serif text-center italic line-clamp-2 px-4"
          >
            {prevParagraph}
          </motion.div>
        </AnimatePresence>

        {/* Current Paragraph */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "relative p-6 md:p-12 rounded-[32px] md:rounded-[40px] bg-foreground/[0.03] border border-foreground/5 shadow-2xl mx-4 md:mx-0",
            isFocusMode && "bg-transparent border-none shadow-none"
          )}
        >
          <p className="text-xl md:text-4xl font-serif leading-relaxed text-center">
            {highlightedText}
          </p>
          
          {/* Progress Indicator */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-500",
                  i === 0 ? "bg-accent w-4" : "bg-foreground/10"
                )} 
              />
            ))}
          </div>
        </motion.div>

        {/* Next Paragraph */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex + 1}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.2, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-lg md:text-2xl font-serif text-center italic line-clamp-2 px-4"
          >
            {nextParagraph}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
