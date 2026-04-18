import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : -5 }}
            className={`absolute z-[100] px-3 py-1.5 bg-background border border-foreground/10 rounded-lg text-xs font-medium text-foreground whitespace-nowrap shadow-xl pointer-events-none ${positionClasses[position]}`}
          >
            {content}
            <div className={`absolute w-2 h-2 bg-background border-foreground/10 rotate-45 ${
              position === 'top' ? 'top-full -mt-1 left-1/2 -translate-x-1/2 border-b border-r' :
              position === 'bottom' ? 'bottom-full -mb-1 left-1/2 -translate-x-1/2 border-t border-l' :
              position === 'left' ? 'left-full -ml-1 top-1/2 -translate-y-1/2 border-t border-r' :
              'right-full -mr-1 top-1/2 -translate-y-1/2 border-b border-l'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
