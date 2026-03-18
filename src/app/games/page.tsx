'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { useAppStore } from '@/store/appStore';
import type { GameId } from '@/types';

interface GameCard {
  id: GameId;
  href: string;
  emoji: string;
  title: string;
  desc: string;
  color: string;
  shadow: string;
}

const GAME_CARDS: GameCard[] = [
  {
    id: 'tapTheCode',
    href: '/games/tap-the-code',
    emoji: '👆',
    title: 'Tap the Code',
    desc: 'Tap dots & dashes for each letter!',
    color: 'bg-morse-purple',
    shadow: 'shadow-[0_6px_0_#5B21B6]',
  },
  {
    id: 'listenAndGuess',
    href: '/games/listen-and-guess',
    emoji: '🎧',
    title: 'Listen & Guess',
    desc: 'Hear Morse and pick the right letter!',
    color: 'bg-morse-teal',
    shadow: 'shadow-[0_6px_0_#0F766E]',
  },
  {
    id: 'matchThePair',
    href: '/games/match-the-pair',
    emoji: '🃏',
    title: 'Match the Pair',
    desc: 'Flip cards and match letters to Morse!',
    color: 'bg-morse-coral',
    shadow: 'shadow-[0_6px_0_#E11D48]',
  },
  {
    id: 'speedChallenge',
    href: '/games/speed-challenge',
    emoji: '⚡',
    title: 'Speed Challenge',
    desc: 'Race the clock to name the letter!',
    color: 'bg-morse-yellow',
    shadow: 'shadow-[0_6px_0_#D97706]',
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <span key={i} className={`text-lg ${i <= count ? 'opacity-100' : 'opacity-25'}`}>⭐</span>
      ))}
    </div>
  );
}

export default function GamesPage() {
  const gameScores = useAppStore((s) => s.gameScores);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="🎮 Games" showBack />

      <div className="px-4 py-5">
        <p className="text-morse-navy/50 font-semibold text-center mb-5">
          Pick a game and earn stars! ⭐⭐⭐
        </p>

        <div className="flex flex-col gap-4">
          {GAME_CARDS.map(({ id, href, emoji, title, desc, color, shadow }, i) => {
            const { stars } = gameScores[id];
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={href}>
                  <div
                    className={`${color} ${shadow} text-white rounded-3xl p-5 flex items-center gap-4 active:translate-y-[6px] active:shadow-none transition-all no-select`}
                  >
                    <div className="text-5xl">{emoji}</div>
                    <div className="flex-1">
                      <div className="font-black text-lg">{title}</div>
                      <div className="text-white/70 text-sm font-semibold">{desc}</div>
                      <div className="mt-1">
                        <Stars count={stars} />
                      </div>
                    </div>
                    <div className="text-white/50 text-2xl">→</div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
