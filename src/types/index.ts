// Morse code types
export interface MorseCharacter {
  original: string;
  morse: string;
  symbols: Array<'.' | '-'>;
}

export type SpeedPreset = 'slow' | 'normal' | 'fast';

export const SPEED_WPM: Record<SpeedPreset, number> = {
  slow: 5,
  normal: 13,
  fast: 25,
};

// Game types
export type GameId = 'tapTheCode' | 'listenAndGuess' | 'matchThePair' | 'speedChallenge';

export interface GameScore {
  stars: number; // 0-3
  bestScore: number;
}

export type GameScores = Record<GameId, GameScore>;

// Audio types
export type PlaybackState = 'idle' | 'playing' | 'paused';

// App store shape
export interface AppSettings {
  volume: number;       // 0-1
  speed: SpeedPreset;
}
