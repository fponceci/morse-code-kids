'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StarBurst } from '@/components/ui/StarBurst';
import { useMorseAudio } from '@/hooks/useMorseAudio';
import { BEGINNER_LETTERS, ALL_LETTERS, MORSE_CODE_MAP, parseMorseString, pickRandom, shuffle } from '@/lib/morse';
import type { SpeedPreset } from '@/types';

type Difficulty = 'beginner' | 'letters' | 'alphanumeric';

const DIFF_LABELS: Record<Difficulty, string> = {
  beginner: '🌱 Beginner',
  letters: '🔤 Letters',
  alphanumeric: '🔢 Letters + Numbers',
};

function getPool(diff: Difficulty): string[] {
  if (diff === 'beginner') return BEGINNER_LETTERS;
  if (diff === 'letters') return ALL_LETTERS;
  return ALL_LETTERS;
}

function generateRound(diff: Difficulty) {
  const pool = getPool(diff);
  const correct = pickRandom(pool, 1)[0];
  const distractors = pickRandom(pool.filter((l) => l !== correct), 3);
  const options = shuffle([correct, ...distractors]);
  return { correct, options };
}

export default function ListenPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [round, setRound] = useState(() => generateRound('beginner'));
  const [selected, setSelected] = useState<string | null>(null);
  const [replays, setReplays] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const { playbackState, playChar } = useMorseAudio();

  const isPlaying = playbackState === 'playing';
  const maxReplays = 2;

  const playCurrentChar = useCallback(async (speed: SpeedPreset = 'slow') => {
    const char = parseMorseString(round.correct)[0];
    if (char) await playChar(char, speed);
  }, [round.correct, playChar]);

  const handlePlay = async () => {
    if (isPlaying) return;
    await playCurrentChar();
  };

  const handleReplay = async () => {
    if (isPlaying || replays >= maxReplays) return;
    setReplays((r) => r + 1);
    await playCurrentChar();
  };

  const handleSelect = (letter: string) => {
    if (selected !== null) return;
    setSelected(letter);
    setTotal((t) => t + 1);
    if (letter === round.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    const newRound = generateRound(difficulty);
    setRound(newRound);
    setSelected(null);
    setReplays(0);
  };

  const handleDiffChange = (d: Difficulty) => {
    setDifficulty(d);
    const newRound = generateRound(d);
    setRound(newRound);
    setSelected(null);
    setReplays(0);
  };

  const isCorrect = selected === round.correct;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="👂 Listen Mode" showBack />

      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Difficulty */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(DIFF_LABELS) as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => handleDiffChange(d)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                difficulty === d
                  ? 'bg-morse-purple text-white'
                  : 'bg-white text-morse-navy/50 border-2 border-morse-navy/10'
              }`}
            >
              {DIFF_LABELS[d]}
            </button>
          ))}
        </div>

        {/* Score */}
        <div className="flex justify-between items-center">
          <span className="font-black text-morse-navy/50 text-sm">
            Score: <span className="text-morse-purple">{score}/{total}</span>
          </span>
          <button
            onClick={() => { setScore(0); setTotal(0); }}
            className="text-xs font-bold text-morse-navy/30 underline"
          >
            Reset
          </button>
        </div>

        {/* Play section */}
        <Card className="text-center py-8">
          <div className="text-5xl mb-4">📻</div>
          <p className="font-black text-morse-navy mb-4">
            {selected === null ? 'Listen to the Morse code!' : (isCorrect ? 'Correct! 🎉' : `It was: ${round.correct}`)}
          </p>

          <Button
            variant="primary"
            size="xl"
            onClick={handlePlay}
            disabled={isPlaying}
            className="mb-3"
          >
            {isPlaying ? '🔊 Playing...' : '▶ Play Morse'}
          </Button>

          {selected === null && (
            <div>
              <button
                onClick={handleReplay}
                disabled={isPlaying || replays >= maxReplays}
                className="text-sm font-bold text-morse-teal disabled:opacity-30"
              >
                🔁 Replay ({maxReplays - replays} left)
              </button>
            </div>
          )}
        </Card>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {round.options.map((letter) => {
            let variant: 'primary' | 'teal' | 'coral' | 'secondary' = 'secondary';
            if (selected !== null) {
              if (letter === round.correct) variant = 'teal';
              else if (letter === selected) variant = 'coral';
            }
            return (
              <motion.div
                key={letter}
                animate={selected === letter && !isCorrect ? { x: [-8, 8, -8, 8, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Button
                  variant={variant}
                  size="xl"
                  onClick={() => handleSelect(letter)}
                  disabled={selected !== null}
                  className="w-full text-3xl font-black"
                >
                  {letter}
                  <span className="block text-xs font-semibold mt-1 opacity-60">
                    {MORSE_CODE_MAP[letter]}
                  </span>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Star burst + next */}
        <AnimatePresence>
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              {isCorrect && <StarBurst visible stars={replays === 0 ? 3 : replays === 1 ? 2 : 1} />}
              <Button variant="yellow" size="lg" onClick={handleNext} className="mt-2">
                Next Letter →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
