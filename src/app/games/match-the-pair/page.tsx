'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StarBurst } from '@/components/ui/StarBurst';
import { useAppStore } from '@/store/appStore';
import { BEGINNER_LETTERS, MORSE_CODE_MAP, shuffle } from '@/lib/morse';

// 8 pairs = 16 cards
const GAME_LETTERS = BEGINNER_LETTERS.slice(0, 8);

interface CardItem {
  id: string;
  content: string;   // letter or morse
  type: 'letter' | 'morse';
  pairId: string;    // letter key
  matched: boolean;
  flipped: boolean;
}

function buildDeck(): CardItem[] {
  const cards: CardItem[] = [];
  GAME_LETTERS.forEach((letter) => {
    cards.push({
      id: `letter-${letter}`,
      content: letter,
      type: 'letter',
      pairId: letter,
      matched: false,
      flipped: false,
    });
    cards.push({
      id: `morse-${letter}`,
      content: MORSE_CODE_MAP[letter],
      type: 'morse',
      pairId: letter,
      matched: false,
      flipped: false,
    });
  });
  return shuffle(cards);
}

export default function MatchThePairPage() {
  const [deck, setDeck] = useState<CardItem[]>(buildDeck);
  const [selected, setSelected] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const updateGameScore = useAppStore((s) => s.updateGameScore);

  const calcStars = (m: number): number => {
    if (m <= 12) return 3;
    if (m <= 18) return 2;
    return 1;
  };

  const handleFlip = useCallback((cardId: string) => {
    if (locked) return;
    setDeck((prev) => {
      const card = prev.find((c) => c.id === cardId);
      if (!card || card.matched || card.flipped) return prev;
      return prev.map((c) => c.id === cardId ? { ...c, flipped: true } : c);
    });

    setSelected((prev) => {
      const next = [...prev, cardId];
      if (next.length === 2) {
        setMoves((m) => m + 1);
        setLocked(true);

        setTimeout(() => {
          setDeck((d) => {
            const [a, b] = [d.find((c) => c.id === next[0])!, d.find((c) => c.id === next[1])!];
            const isMatch = a && b && a.pairId === b.pairId && a.id !== b.id;
            const updated = d.map((c) => {
              if (c.id === next[0] || c.id === next[1]) {
                return isMatch ? { ...c, matched: true } : { ...c, flipped: false };
              }
              return c;
            });
            // Check win
            if (updated.every((c) => c.matched)) {
              const finalMoves = moves + 1;
              updateGameScore('matchThePair', calcStars(finalMoves), finalMoves);
              setGameOver(true);
            }
            return updated;
          });
          setSelected([]);
          setLocked(false);
        }, 900);
        return next;
      }
      return next;
    });
  }, [locked, moves, updateGameScore]);

  const handleReset = () => {
    setDeck(buildDeck());
    setSelected([]);
    setMoves(0);
    setLocked(false);
    setGameOver(false);
  };

  const matched = deck.filter((c) => c.matched).length / 2;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="Match the Pair" showBack />

      <div className="px-4 py-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="font-black text-morse-navy/50 text-sm">
            ✅ {matched}/{GAME_LETTERS.length} matched
          </span>
          <span className="font-black text-morse-purple text-sm">
            Moves: {moves}
          </span>
        </div>

        <p className="text-center text-morse-navy/50 font-semibold text-sm">
          Match each letter with its Morse code!
        </p>

        {/* Card grid */}
        <div className="grid grid-cols-4 gap-2">
          {deck.map((card) => {
            const isFlipped = card.flipped || card.matched;
            return (
              <div
                key={card.id}
                className="relative h-16 cursor-pointer no-select"
                style={{ perspective: '600px' }}
                onClick={() => !card.matched && !card.flipped && handleFlip(card.id)}
              >
                <motion.div
                  className="relative w-full h-full preserve-3d"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {/* Back face */}
                  <div className="absolute inset-0 backface-hidden rounded-2xl bg-morse-purple flex items-center justify-center shadow-[0_4px_0_#5B21B6]">
                    <span className="text-white text-2xl font-black">?</span>
                  </div>
                  {/* Front face */}
                  <div
                    className={`absolute inset-0 backface-hidden rounded-2xl flex items-center justify-center p-1 shadow-md ${
                      card.matched
                        ? 'bg-morse-teal/20 border-2 border-morse-teal'
                        : card.type === 'letter'
                          ? 'bg-morse-purple/10 border-2 border-morse-purple'
                          : 'bg-morse-yellow/20 border-2 border-morse-yellow'
                    }`}
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    <span
                      className={`font-black text-center leading-tight ${
                        card.type === 'letter'
                          ? 'text-2xl text-morse-purple'
                          : 'text-xs text-morse-navy font-mono tracking-widest'
                      }`}
                    >
                      {card.content}
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        <Button variant="ghost" size="sm" onClick={handleReset} className="self-center">
          🔄 New Game
        </Button>
      </div>

      <Modal
        open={gameOver}
        emoji={calcStars(moves) === 3 ? '🏆' : '🎉'}
        title={calcStars(moves) === 3 ? 'Perfect Memory!' : 'You Did It!'}
        description={`All matched in ${moves} moves!`}
        primaryLabel="Play Again"
        onPrimary={handleReset}
      />
    </div>
  );
}
