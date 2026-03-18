'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface MorseSymbolProps {
  symbol: '.' | '-';
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const dotSizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-6 h-6' };
const dashSizes = { sm: 'w-7 h-3', md: 'w-10 h-4', lg: 'w-14 h-6' };

export function MorseSymbol({ symbol, active = false, size = 'md', color }: MorseSymbolProps) {
  const isDot = symbol === '.';
  const baseColor = color ?? (active ? 'bg-morse-yellow' : 'bg-morse-purple');

  return (
    <motion.div
      className={clsx(
        'rounded-full inline-block',
        isDot ? dotSizes[size] : dashSizes[size],
        !isDot && 'rounded-lg',
        baseColor
      )}
      animate={active ? { scale: [1, 1.25, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
}
