'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { MorseDisplay } from '@/components/morse/MorseDisplay';
import { useCountdown } from '@/hooks/useCountdown';
import { useGameScore } from '@/hooks/useGameScore';
import { useAppStore } from '@/store/appStore';
import { useMorseAudio } from '@/hooks/useMorseAudio';
import { BEGINNER_LETTERS, MORSE_CODE_MAP, parseMorseString, pickRandom } from '@/lib/morse';

const TOTAL_ROUNDS = 10;
const BASE_TIME = 10;

function getTimerDuration(roundNum: number): number {
  // Shrinks from 10s to 5s over 10 rounds
  return Math.max(5, BASE_TIME - (roundNum - 1) * 0.6);
}

export default function SpeedChallengePage() {
  const [started, setStarted] = useState(false);
  const [letter, setLetter] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [roundNum, setRoundNum] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const { score, lives, addPoint, loseLife, resetGame, calcStars } = useGameScore(3);
  const { playbackState, playChar, activeSymbol } = useMorseAudio();
  const updateGameScore = useAppStore((s) => s.updateGameScore);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTimeout = useCallback(() => {
    if (feedback) return;
    setFeedback('timeout');
    loseLife();
  }, [feedback, loseLife]);

  const { remaining, isRunning, start: startTimer, stop: stopTimer } = useCountdown(handleTimeout);

  const timerDuration = getTimerDuration(roundNum);

  const startRound = useCallback(async (roundN: number) => {
    const next = pickRandom(BEGINNER_LETTERS, 1)[0];
    setLetter(next);
    setAnswer('');
    setFeedback(null);
    const char = parseMorseString(next)[0];
    if (char) {
      startTimer(getTimerDuration(roundN));
      await playChar(char, 'slow');
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [playChar, startTimer]);

  const handleStart = () => {
    setStarted(true);
    resetGame(3);
    setRoundNum(1);
    setGameOver(false);
    startRound(1);
  };

  const handleSubmit = () => {
    if (!feedback && answer.toUpperCase() === letter) {
      stopTimer();
      setFeedback('correct');
      addPoint();
    } else if (!feedback) {
      stopTimer();
      setFeedback('wrong');
      loseLife();
    }
  };

  // After feedback, advance round
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => {
      const newLives = lives - (feedback === 'correct' ? 0 : 1);
      const newRound = roundNum + 1;
      if (newRound > TOTAL_ROUNDS || newLives <= 0) {
        const finalScore = score + (feedback === 'correct' ? 1 : 0);
        updateGameScore('speedChallenge', calcStars(TOTAL_ROUNDS), finalScore);
        setGameOver(true);
        return;
      }
      setRoundNum(newRound);
      startRound(newRound);
    }, 1500);
    return () => clearTimeout(t);
  }, [feedback]); // eslint-disable-line react-hooks/exhaustive-deps

  const morseChars = letter ? parseMorseString(letter) : [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="Speed Challenge" showBack />

      <div className="px-4 py-5 flex flex-col gap-5 items-center">
        {!started ? (
          <Card className="text-center py-10 w-full">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="font-black text-morse-navy text-2xl mb-2">Speed Challenge!</h2>
            <p className="text-morse-navy/60 font-semibold mb-6">
              Hear the Morse code and type the letter before time runs out!
              The timer gets faster each round!
            </p>
            <Button variant="coral" size="xl" onClick={handleStart}>
              Start! 🚀
            </Button>
          </Card>
        ) : (
          <>
            {/* Status bar */}
            <div className="flex justify-between items-center w-full">
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

            {/* Timer */}
            <CountdownTimer total={timerDuration} remaining={remaining} size={100} />

            {/* Morse display */}
            <Card color="purple" className="w-full min-h-20 flex items-center justify-center">
              {morseChars.length > 0 ? (
                <MorseDisplay chars={morseChars} activeSymbol={activeSymbol} size="lg" />
              ) : (
                <span className="text-morse-navy/30 font-bold">Loading...</span>
              )}
            </Card>

            {/* Feedback banner */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`text-2xl font-black ${
                    feedback === 'correct' ? 'text-morse-teal' : 'text-morse-coral'
                  }`}
                >
                  {feedback === 'correct' ? '✅ Correct!' : `❌ It was: ${letter}`}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Answer input */}
            <div className="flex gap-3 w-full">
              <input
                ref={inputRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value.slice(-1))}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                maxLength={1}
                placeholder="Type the letter..."
                className="flex-1 rounded-2xl border-3 border-morse-purple/20 bg-white px-4 py-3 text-3xl font-black text-center text-morse-purple focus:outline-none focus:border-morse-purple uppercase"
                disabled={!!feedback || !isRunning}
              />
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={!answer || !!feedback || !isRunning}
              >
                ✓
              </Button>
            </div>

            {/* Re-play button */}
            {isRunning && !feedback && (
              <button
                onClick={() => {
                  const char = parseMorseString(letter)[0];
                  if (char) playChar(char, 'slow');
                }}
                disabled={playbackState === 'playing'}
                className="text-sm font-bold text-morse-teal disabled:opacity-40"
              >
                🔊 Hear it again
              </button>
            )}
          </>
        )}
      </div>

      <Modal
        open={gameOver}
        emoji={calcStars(TOTAL_ROUNDS) >= 2 ? '🏆' : '💪'}
        title={calcStars(TOTAL_ROUNDS) >= 2 ? 'Lightning Fast!' : 'Good Try!'}
        description={`You got ${score} out of ${TOTAL_ROUNDS} correct!`}
        primaryLabel="Play Again"
        onPrimary={handleStart}
      />
    </div>
  );
}
