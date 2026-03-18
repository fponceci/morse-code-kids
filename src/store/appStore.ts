import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameId, GameScore, GameScores, AppSettings, SpeedPreset } from '@/types';

interface AppStore extends AppSettings {
  gameScores: GameScores;
  setVolume: (v: number) => void;
  setSpeed: (s: SpeedPreset) => void;
  updateGameScore: (game: GameId, stars: number, score: number) => void;
  resetScores: () => void;
}

const defaultScores: GameScores = {
  tapTheCode:      { stars: 0, bestScore: 0 },
  listenAndGuess:  { stars: 0, bestScore: 0 },
  matchThePair:    { stars: 0, bestScore: 0 },
  speedChallenge:  { stars: 0, bestScore: 0 },
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      volume: 0.7,
      speed: 'normal',
      gameScores: { ...defaultScores },

      setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
      setSpeed: (speed) => set({ speed }),
      updateGameScore: (game, stars, score) =>
        set((state) => {
          const prev = state.gameScores[game];
          return {
            gameScores: {
              ...state.gameScores,
              [game]: {
                stars: Math.max(prev.stars, stars),
                bestScore: Math.max(prev.bestScore, score),
              },
            },
          };
        }),
      resetScores: () => set({ gameScores: { ...defaultScores } }),
    }),
    { name: 'morse-kids-store' }
  )
);
