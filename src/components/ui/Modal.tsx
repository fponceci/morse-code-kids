'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  emoji?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export function Modal({
  open,
  title,
  description,
  emoji,
  primaryLabel = 'OK',
  secondaryLabel,
  onPrimary,
  onSecondary,
}: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-morse-navy/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-morse-cream rounded-4xl p-8 max-w-sm w-full shadow-2xl text-center"
            initial={{ scale: 0.7, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {emoji && <div className="text-6xl mb-3">{emoji}</div>}
            <h2 className="text-2xl font-black text-morse-navy mb-2">{title}</h2>
            {description && (
              <p className="text-morse-navy/70 mb-6 font-semibold">{description}</p>
            )}
            <div className="flex flex-col gap-3">
              {onPrimary && (
                <Button variant="primary" size="lg" onClick={onPrimary} className="w-full">
                  {primaryLabel}
                </Button>
              )}
              {secondaryLabel && onSecondary && (
                <Button variant="ghost" size="md" onClick={onSecondary} className="w-full">
                  {secondaryLabel}
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
