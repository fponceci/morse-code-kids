'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { StarBurst } from '@/components/ui/StarBurst';
import { MorseSymbol } from '@/components/morse/MorseSymbol';
import { useGameScore } from '@/hooks/useGameScore';
import { useAppStore } from '@/store/appStore';
import { BEGINNER_LETTERS, MORSE_CODE_MAP, pickRandom } from '@/lib/morse';

const TOTAL_ROUNDS = 10;

function nextLetter(usedLetters: string[]): string {
  const pool = BEGINNER_LETTERS.filter((l) => !usedLetters.includes(l));
  const src = pool.length > 0 ? pool : BEGINNER_LETTERS;
  return pickRandom(src, 1)[0];
}

export default function TapTheCodePage() {
  const [letter, setLetter] = useState(() => BEGINNER_LETTERS[0]);
  const [input, setInput] = useState<Array<'.' | '-'>>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [usedLetters, setUsedLetters] = useState<string[]>([]);
  const { score, lives, addPoint, loseLife, resetGame, calcStars } = useGameScore(3);
  const updateGameScore = useAppStore((s) => s.updateGameScore);

  const correct = MORSE_CODE_MAP[letter];

  const handleTap = (sym: '.' | '-') => {
    if (feedback || input.length >= correct.length + 2) return;
    setInput((prev) => [...prev, sym]);
  };

  const handleSubmit = useCallback(() => {
    if (input.length === 0) return;
    const attempt = input.join('');
    if (attempt === correct) {
      setFeedback('correct');
      addPoint();
    } else {
      setFeedback('wrong');
      loseLife();
    }
    setTimeout(() => {
      setFeedback(null);
      setInput([]);
      const newRound = round + 1;
      if (newRound > TOTAL_ROUNDS || lives <= 1 && attempt !== correct) {
        setGameOver(true);
        updateGameScore('tapTheCode', calcStars(TOTAL_ROUNDS), score + (attempt === correct ? 1 : 0));
      } else {
        setRound(newRound);
        const next = nextLetter([...usedLetters, letter]);
        setUsedLetters((prev) => [...prev, letter]);
        setLetter(next);
      }
    }, 1200);
  }, [input, correct, addPoint, loseLife, round, lives, usedLetters, letter, updateGameScore, calcStars, score]);

  const handleReset = () => {
    resetGame(3);
    setRound(1);
    setGameOver(false);
    setInput([]);
    setFeedback(null);
    setUsedLetters([]);
    setLetter(BEGINNER_LETTERS[0]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="Tap the Code" showBack />

      <div className="px-4 py-5 flex flex-col gap-4 items-center">
        {/* Status bar */}
        <div className="flex justify-between w-full">
          <span className="font-black text-morse-navy/50 text-sm">
            Round {round}/{TOTAL_ROUNDS}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="text-2xl">{i < lives ? '❤️' : '🖤'}</span>
            ))}
          </div>
          <span className="font-black text-morse-purple text-sm">⭐ {score}</span>
        </div>

        {/* Letter display */}
        <motion.div
          key={letter}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-36 h-36 rounded-4xl bg-morse-purple flex items-center justify-center shadow-[0_8px_0_#5B21B6]"
        >
          <span className="text-7xl font-black text-white">{letter}</span>
        </motion.div>

        <p className="text-morse-navy/50 font-semibold text-sm">
          Tap the correct Morse code for this letter!
        </p>

        {/* Current input display */}
        <Card color="purple" className="w-full min-h-[64px] flex items-center justify-center">
          {input.length === 0 ? (
            <span className="text-morse-navy/30 font-bold">Tap dots and dashes below...</span>
          ) : (
            <div className="flex gap-2 items-center flex-wrap justify-center">
              {input.map((sym, i) => (
                <MorseSymbol key={i} symbol={sym} size="lg" />
              ))}
            </div>
          )}
        </Card>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`text-2xl font-black ${feedback === 'correct' ? 'text-morse-teal' : 'text-morse-coral'}`}
            >
              {feedback === 'correct' ? '✅ Correct!' : `❌ It was: ${correct}`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tap buttons */}
        <div className="flex gap-4 w-full">
          <button
            onClick={() => handleTap('.')}
            className="flex-1 h-20 rounded-3xl bg-morse-purple text-white font-black text-xl shadow-[0_6px_0_#5B21B6] active:translate-y-[6px] active:shadow-none transition-all no-select flex items-center justify-center gap-2"
          >
            <div className="w-4 h-4 rounded-full bg-white" />
            DOT
          </button>
          <button
            onClick={() => handleTap('-')}
            className="flex-[2] h-20 rounded-3xl bg-morse-teal text-white font-black text-xl shadow-[0_6px_0_#0F766E] active:translate-y-[6px] active:shadow-none transition-all no-select flex items-center justify-center gap-2"
          >
            <div className="w-10 h-4 rounded-lg bg-white" />
            DASH
          </button>
        </div>

        {/* Control buttons */}
        <div className="flex gap-3 w-full">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setInput((p) => p.slice(0, -1))}
            disabled={input.length === 0 || !!feedback}
            className="flex-1"
          >
            ⌫ Undo
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={input.length === 0 || !!feedback}
            className="flex-1"
          >
            Check ✓
          </Button>
        </div>
      </div>

      {/* Game over modal */}
      <Modal
        open={gameOver}
        emoji={calcStars(TOTAL_ROUNDS) >= 2 ? '🎉' : '💪'}
        title={calcStars(TOTAL_ROUNDS) >= 2 ? 'Great Job!' : 'Keep Practicing!'}
        description={`You got ${score} out of ${TOTAL_ROUNDS} correct!`}
        primaryLabel="Play Again"
        onPrimary={handleReset}
      />
    </div>
  );
}
