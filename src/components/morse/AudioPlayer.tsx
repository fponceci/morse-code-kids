'use client';

import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import type { PlaybackState, SpeedPreset } from '@/types';

interface AudioPlayerProps {
  playbackState: PlaybackState;
  speed: SpeedPreset;
  onPlay: () => void;
  onStop: () => void;
  onSpeedChange: (speed: SpeedPreset) => void;
  disabled?: boolean;
}

const speeds: SpeedPreset[] = ['slow', 'normal', 'fast'];
const speedLabels: Record<SpeedPreset, string> = {
  slow: '🐢 Slow',
  normal: '🐇 Normal',
  fast: '🚀 Fast',
};

export function AudioPlayer({
  playbackState,
  speed,
  onPlay,
  onStop,
  onSpeedChange,
  disabled,
}: AudioPlayerProps) {
  const isPlaying = playbackState === 'playing';

  return (
    <div className="flex flex-col gap-4">
      {/* Speed selector */}
      <div className="flex gap-2 justify-center">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-sm font-bold transition-all',
              speed === s
                ? 'bg-morse-purple text-white shadow-md'
                : 'bg-white text-morse-purple border-2 border-morse-purple/20'
            )}
          >
            {speedLabels[s]}
          </button>
        ))}
      </div>

      {/* Play/Stop button */}
      <div className="flex justify-center">
        <Button
          variant={isPlaying ? 'coral' : 'primary'}
          size="xl"
          onClick={isPlaying ? onStop : onPlay}
          disabled={disabled}
          className="min-w-[160px]"
        >
          {isPlaying ? '⏹ Stop' : '▶ Play'}
        </Button>
      </div>

      {/* Playing indicator */}
      {isPlaying && (
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-morse-coral animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
