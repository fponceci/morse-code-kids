'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MorseCharacter, SpeedPreset, PlaybackState } from '@/types';
import { MorseAudioEngine } from '@/lib/audio';

interface ActiveSymbol {
  charIndex: number;
  symbolIndex: number;
}

interface UseMorseAudioReturn {
  playbackState: PlaybackState;
  activeSymbol: ActiveSymbol | null;
  play: (chars: MorseCharacter[], speed: SpeedPreset) => Promise<void>;
  stop: () => void;
  playChar: (char: MorseCharacter, speed: SpeedPreset) => Promise<void>;
}

export function useMorseAudio(): UseMorseAudioReturn {
  const engineRef = useRef<MorseAudioEngine | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [activeSymbol, setActiveSymbol] = useState<ActiveSymbol | null>(null);

  useEffect(() => {
    engineRef.current = new MorseAudioEngine();
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  const play = useCallback(async (chars: MorseCharacter[], speed: SpeedPreset) => {
    const engine = engineRef.current;
    if (!engine) return;

    setPlaybackState('playing');
    setActiveSymbol(null);

    await engine.play(chars, speed, (ci, si) => {
      setActiveSymbol({ charIndex: ci, symbolIndex: si });
    });

    setPlaybackState('idle');
    setActiveSymbol(null);
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setPlaybackState('idle');
    setActiveSymbol(null);
  }, []);

  const playChar = useCallback(async (char: MorseCharacter, speed: SpeedPreset) => {
    const engine = engineRef.current;
    if (!engine) return;
    setPlaybackState('playing');
    await engine.playChar(char, speed);
    setPlaybackState('idle');
  }, []);

  return { playbackState, activeSymbol, play, stop, playChar };
}
