'use client';

import { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { MorseDisplay } from '@/components/morse/MorseDisplay';
import { AudioPlayer } from '@/components/morse/AudioPlayer';
import { Card } from '@/components/ui/Card';
import { useMorseAudio } from '@/hooks/useMorseAudio';
import { parseMorseString } from '@/lib/morse';
import type { SpeedPreset } from '@/types';

export default function TranslatorPage() {
  const [text, setText] = useState('');
  const [speed, setSpeed] = useState<SpeedPreset>('normal');
  const { playbackState, activeSymbol, play, stop } = useMorseAudio();

  const chars = useMemo(() => parseMorseString(text), [text]);

  const handlePlay = async () => {
    if (chars.length === 0) return;
    await play(chars, speed);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="🔤 Translator" showBack />

      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Input */}
        <Card>
          <label className="block font-black text-morse-navy mb-2 text-sm">
            Type your message:
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              stop();
              setText(e.target.value);
            }}
            placeholder="Hello world..."
            rows={3}
            maxLength={80}
            className="w-full resize-none rounded-2xl border-3 border-morse-purple/20 bg-morse-cream p-3 font-bold text-lg text-morse-navy placeholder:text-morse-navy/30 focus:outline-none focus:border-morse-purple transition-colors"
          />
          <div className="text-right text-xs text-morse-navy/40 font-semibold mt-1">
            {text.length}/80
          </div>
        </Card>

        {/* Morse display */}
        <Card color="purple" className="min-h-[100px] flex items-center">
          <MorseDisplay
            chars={chars}
            activeSymbol={activeSymbol}
            size="md"
            showLetters
          />
        </Card>

        {/* Audio controls */}
        <Card>
          <AudioPlayer
            playbackState={playbackState}
            speed={speed}
            onPlay={handlePlay}
            onStop={stop}
            onSpeedChange={setSpeed}
            disabled={chars.length === 0}
          />
        </Card>

        {/* Info tip */}
        <Card color="teal">
          <h3 className="font-black text-morse-teal mb-1 text-sm">💡 Did you know?</h3>
          <p className="text-morse-navy/60 text-xs font-semibold">
            SOS (... --- ...) is the universal distress signal in Morse code.
            It was chosen because it&apos;s easy to remember and send!
          </p>
        </Card>
      </div>
    </div>
  );
}
