'use client';

import { useState, useCallback } from 'react';

interface UseGameScoreReturn {
  score: number;
  lives: number;
  streak: number;
  addPoint: () => void;
  loseLife: () => void;
  resetGame: (initialLives?: number) => void;
  calcStars: (outOf: number) => number;
}

export function useGameScore(initialLives = 3): UseGameScoreReturn {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [streak, setStreak] = useState(0);

  const addPoint = useCallback(() => {
    setScore((s) => s + 1);
    setStreak((s) => s + 1);
  }, []);

  const loseLife = useCallback(() => {
    setLives((l) => Math.max(0, l - 1));
    setStreak(0);
  }, []);

  const resetGame = useCallback((il = 3) => {
    setScore(0);
    setLives(il);
    setStreak(0);
  }, []);

  const calcStars = useCallback((outOf: number): number => {
    const pct = score / outOf;
    if (pct >= 0.9) return 3;
    if (pct >= 0.6) return 2;
    if (pct > 0) return 1;
    return 0;
  }, [score]);

  return { score, lives, streak, addPoint, loseLife, resetGame, calcStars };
}
