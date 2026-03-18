'use client';

import { motion } from 'framer-motion';
import type { MorseCharacter } from '@/types';
import { MorseSymbol } from './MorseSymbol';

interface ActiveSymbol {
  charIndex: number;
  symbolIndex: number;
}

interface MorseDisplayProps {
  chars: MorseCharacter[];
  activeSymbol?: ActiveSymbol | null;
  size?: 'sm' | 'md' | 'lg';
  showLetters?: boolean;
}

export function MorseDisplay({
  chars,
  activeSymbol,
  size = 'md',
  showLetters = false,
}: MorseDisplayProps) {
  if (chars.length === 0) {
    return (
      <div className="flex items-center justify-center h-16 text-morse-navy/30 font-bold text-lg">
        Type something to see the Morse code!
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      {chars.map((char, ci) => {
        if (char.original === ' ') {
          return <div key={ci} className="w-4" />;
        }
        return (
          <motion.div
            key={ci}
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.05 }}
          >
            <div className="flex items-center gap-1">
              {char.symbols.map((sym, si) => (
                <MorseSymbol
                  key={si}
                  symbol={sym}
                  size={size}
                  active={
                    activeSymbol?.charIndex === ci && activeSymbol?.symbolIndex === si
                  }
                />
              ))}
            </div>
            {showLetters && (
              <span className="text-xs font-black text-morse-navy/50 uppercase">
                {char.original}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
