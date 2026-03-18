'use client';

import { motion } from 'framer-motion';

interface DashMascotProps {
  size?: number;
  className?: string;
}

export function DashMascot({ size = 80, className }: DashMascotProps) {
  const w = size * 2;
  const h = size;

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
    >
      <svg width={w} height={h} viewBox="0 0 160 80" fill="none">
        {/* Body — pill/dash shape */}
        <rect x="4" y="12" width="152" height="56" rx="28" fill="#0D9488" />
        <rect x="10" y="18" width="140" height="44" rx="22" fill="#5EEAD4" />
        {/* Eyes */}
        <circle cx="56" cy="38" r="6" fill="white" />
        <circle cx="104" cy="38" r="6" fill="white" />
        <circle cx="58" cy="39" r="3" fill="#1E1B4B" />
        <circle cx="106" cy="39" r="3" fill="#1E1B4B" />
        {/* Eye sparkle */}
        <circle cx="59.5" cy="37.5" r="1.2" fill="white" />
        <circle cx="107.5" cy="37.5" r="1.2" fill="white" />
        {/* Smile */}
        <path d="M 64 52 Q 80 62 96 52" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Cheeks */}
        <circle cx="44" cy="50" r="5" fill="#F43F5E" opacity="0.5" />
        <circle cx="116" cy="50" r="5" fill="#F43F5E" opacity="0.5" />
      </svg>
    </motion.div>
  );
}
