'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { StarBurst } from '@/components/ui/StarBurst';
import { useMorseAudio } from '@/hooks/useMorseAudio';
import { useGameScore } from '@/hooks/useGameScore';
import { useAppStore } from '@/store/appStore';
import { BEGINNER_LETTERS, MORSE_CODE_MAP, parseMorseString, pickRandom, shuffle } from '@/lib/morse';

const TOTAL_ROUNDS = 10;
const MAX_REPLAYS = 2;

function generateRound() {
  const correct = pickRandom(BEGINNER_LETTERS, 1)[0];
  const distractors = pickRandom(BEGINNER_LETTERS.filter((l) => l !== correct), 3);
  return { correct, options: shuffle([correct, ...distractors]) };
}

export default function ListenAndGuessPage() {
  const [round, setRound] = useState(() => generateRound());
  const [roundNum, setRoundNum] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [replays, setReplays] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const { score, lives, addPoint, loseLife, resetGame, calcStars } = useGameScore(3);
  const { playbackState, playChar } = useMorseAudio();
  const updateGameScore = useAppStore((s) => s.updateGameScore);
  const speed = useAppStore((s) => s.speed);

  const isPlaying = playbackState === 'playing';

  const playRound = useCallback(async (correct: string) => {
    const char = parseMorseString(correct)[0];
    if (char) await playChar(char, 'slow');
  }, [playChar]);

  // Auto-play when round changes
  useEffect(() => {
    const t = setTimeout(() => { playRound(round.correct); }, 600);
    return () => clearTimeout(t);
  }, [round.correct]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (letter: string) => {
    if (selected !== null || isPlaying) return;
    setSelected(letter);
    if (letter === round.correct) {
      addPoint();
    } else {
      loseLife();
    }
  };

  const handleNext = () => {
    const newRoundNum = roundNum + 1;
    if (newRoundNum > TOTAL_ROUNDS || lives <= 1 && selected !== round.correct) {
      const finalScore = score + (selected === round.correct ? 1 : 0);
      updateGameScore('listenAndGuess', calcStars(TOTAL_ROUNDS), finalScore);
      setGameOver(true);
      return;
    }
    setRoundNum(newRoundNum);
    setSelected(null);
    setReplays(0);
    setRound(generateRound());
  };

  const handleReplay = async () => {
    if (isPlaying || replays >= MAX_REPLAYS) return;
    setReplays((r) => r + 1);
    await playRound(round.correct);
  };

  const handleReset = () => {
    resetGame(3);
    setRoundNum(1);
    setGameOver(false);
    setSelected(null);
    setReplays(0);
    setRound(generateRound());
  };

  const isCorrect = selected === round.correct;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="Listen & Guess" showBack />

      <div className="px-4 py-5 flex flex-col gap-4">
        {/* Status bar */}
        <div className="flex justify-between items-center">
          <span className="font-black text-morse-navy/50 text-sm">
            Round {roundNum}/{TOTAL_ROUNDS}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="text-xl">{i < lives ? '❤️' : '🖤'}</span>
            ))}
          </div>
          <span className="font-black text-morse-purple text-sm">⭐ {score}</span>
        </div>

        {/* Audio section */}
        <Card className="text-center py-6">
          <motion.div
            className="text-6xl mb-3"
            animate={isPlaying ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
          >
            📻
          </motion.div>
          {isPlaying ? (
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-morse-purple"
                  animate={{ scaleY: [1, 2.5, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          ) : (
            <p className="text-morse-navy/50 font-semibold text-sm mb-4">
              {selected === null ? 'Listen carefully!' : (isCorrect ? '🎉 Correct!' : `❌ It was: ${round.correct}`)}
            </p>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => playRound(round.correct)}
              disabled={isPlaying || selected !== null}
            >
              {isPlaying ? '🔊 Playing...' : '▶ Play Again'}
            </Button>
            {selected === null && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleReplay}
                disabled={isPlaying || replays >= MAX_REPLAYS}
              >
                🔁 Hint ({MAX_REPLAYS - replays})
              </Button>
            )}
          </div>
        </Card>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {round.options.map((letter) => {
            let variant: 'secondary' | 'teal' | 'coral' = 'secondary';
            if (selected !== null) {
              if (letter === round.correct) variant = 'teal';
              else if (letter === selected) variant = 'coral';
            }
            return (
              <motion.div
                key={`${roundNum}-${letter}`}
                animate={selected === letter && !isCorrect ? { x: [-6, 6, -6, 6, 0] } : {}}
                transition={{ duration: 0.35 }}
              >
                <Button
                  variant={variant}
                  size="xl"
                  onClick={() => handleSelect(letter)}
                  disabled={selected !== null || isPlaying}
                  className="w-full"
                >
                  <span className="text-3xl font-black">{letter}</span>
                  <span className="block text-xs font-semibold opacity-50 mt-1">
                    {MORSE_CODE_MAP[letter]}
                  </span>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Next */}
        <AnimatePresence>
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              {isCorrect && <StarBurst visible stars={replays === 0 ? 3 : 2} />}
              <Button variant="yellow" size="lg" onClick={handleNext} className="mt-2 w-full">
                {roundNum < TOTAL_ROUNDS ? 'Next →' : 'Finish!'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Modal
        open={gameOver}
        emoji={calcStars(TOTAL_ROUNDS) >= 2 ? '🎉' : '💪'}
        title={calcStars(TOTAL_ROUNDS) >= 2 ? 'Well Done!' : 'Keep Listening!'}
        description={`You got ${score} out of ${TOTAL_ROUNDS} correct!`}
        primaryLabel="Play Again"
        onPrimary={handleReset}
      />
    </div>
  );
}
