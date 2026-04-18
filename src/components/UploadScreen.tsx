import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, Book, File as FileIcon, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface UploadScreenProps {
  onFileSelect: (file: File) => void;
  isParsing: boolean;
  error?: string;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onFileSelect, isParsing, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-display mb-4">Bem-vindo à sua <span className="text-accent italic">biblioteca</span></h1>
          <p className="text-foreground/60">Arraste seu ebook para começar a experiência auditiva.</p>
        </motion.div>

        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative aspect-video rounded-[40px] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center gap-6 cursor-pointer overflow-hidden",
            isDragging ? "border-accent bg-accent/5 scale-[1.02] shadow-[0_0_50px_rgba(201,169,110,0.1)]" : "border-foreground/10 bg-foreground/[0.02] hover:border-foreground/30",
            isParsing && "pointer-events-none"
          )}
          onClick={() => !isParsing && document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".txt,.epub,.pdf"
            className="hidden"
            onChange={handleFileInput}
          />

          <AnimatePresence mode="wait">
            {isParsing ? (
              <motion.div
                key="parsing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <Loader2 className="w-16 h-16 text-accent animate-spin" />
                <p className="text-accent font-medium animate-pulse">Extraindo texto e metadados...</p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Book className="w-20 h-20 text-accent/50" />
                  </motion.div>
                  <div className="absolute -bottom-2 -right-2 bg-accent text-background p-2 rounded-full">
                    <Upload className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xl font-medium mb-1">Clique ou arraste seu arquivo</p>
                  <p className="text-foreground/40 text-sm">Suporta EPUB, PDF e TXT</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-accent/20 rounded-tl-[40px]" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-accent/20 rounded-tr-[40px]" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-accent/20 rounded-bl-[40px]" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-accent/20 rounded-br-[40px]" />
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 grid grid-cols-3 gap-4">
          {[
            { icon: <FileText />, label: "EPUB", color: "text-blue-400" },
            { icon: <FileIcon />, label: "PDF", color: "text-red-400" },
            { icon: <FileText />, label: "TXT", color: "text-green-400" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/5">
              <div className={cn("w-10 h-10 flex items-center justify-center rounded-xl bg-foreground/5", item.color)}>
                {item.icon}
              </div>
              <span className="text-xs font-medium opacity-40">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
