'use client';

import { motion } from 'framer-motion';

interface DotMascotProps {
  size?: number;
  className?: string;
}

export function DotMascot({ size = 80, className }: DotMascotProps) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        {/* Body */}
        <circle cx="40" cy="40" r="36" fill="#7C3AED" />
        <circle cx="40" cy="40" r="30" fill="#A78BFA" />
        {/* Eyes */}
        <circle cx="30" cy="34" r="6" fill="white" />
        <circle cx="50" cy="34" r="6" fill="white" />
        <circle cx="32" cy="35" r="3" fill="#1E1B4B" />
        <circle cx="52" cy="35" r="3" fill="#1E1B4B" />
        {/* Eye sparkle */}
        <circle cx="33.5" cy="33.5" r="1.2" fill="white" />
        <circle cx="53.5" cy="33.5" r="1.2" fill="white" />
        {/* Smile */}
        <path d="M 28 48 Q 40 58 52 48" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Cheeks */}
        <circle cx="24" cy="46" r="5" fill="#F43F5E" opacity="0.5" />
        <circle cx="56" cy="46" r="5" fill="#F43F5E" opacity="0.5" />
      </svg>
    </motion.div>
  );
}
