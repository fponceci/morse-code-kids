'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { useMorseAudio } from '@/hooks/useMorseAudio';
import {
  MORSE_CODE_MAP,
  ALL_LETTERS,
  ALL_SYMBOLS,
  EMERGENCY_CODES,
  parseMorseString,
} from '@/lib/morse';
import type { SpeedPreset } from '@/types';

type Category = 'letters' | 'numbers' | 'symbols' | 'emergency';

const CATEGORY_TABS: { id: Category; label: string; emoji: string }[] = [
  { id: 'letters',   label: 'A–Z',      emoji: '🔤' },
  { id: 'numbers',   label: '0–9',      emoji: '🔢' },
  { id: 'symbols',   label: 'Symbols',  emoji: '#️⃣' },
  { id: 'emergency', label: 'Emergency',emoji: '🆘' },
];

const SPEED_OPTIONS: { preset: SpeedPreset; label: string; emoji: string }[] = [
  { preset: 'slow',   label: 'Slow',   emoji: '🐢' },
  { preset: 'normal', label: 'Normal', emoji: '🐇' },
  { preset: 'fast',   label: 'Fast',   emoji: '🚀' },
];

const ALL_NUMBERS = ['0','1','2','3','4','5','6','7','8','9'];

/** Tiny morse display — dots and dashes as colored pills */
function MorseCode({ code, mini = false }: { code: string; mini?: boolean }) {
  return (
    <div className="flex items-center gap-0.5 flex-wrap justify-center">
      {code.split('').map((sym, i) =>
        sym === '.' ? (
          <span
            key={i}
            className={`rounded-full bg-morse-purple inline-block ${
              mini ? 'w-1.5 h-1.5' : 'w-2 h-2'
            }`}
          />
        ) : (
          <span
            key={i}
            className={`rounded bg-morse-purple inline-block ${
              mini ? 'h-1.5 w-4' : 'h-2 w-5'
            }`}
          />
        )
      )}
    </div>
  );
}

/** A single character card with play button */
function CharCard({
  char,
  code,
  isPlaying,
  onPlay,
}: {
  char: string;
  code: string;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className={`relative rounded-2xl border-2 p-3 flex flex-col items-center gap-1.5 cursor-pointer select-none transition-all ${
        isPlaying
          ? 'border-morse-yellow bg-morse-yellow/20 shadow-md'
          : 'border-morse-purple/20 bg-white hover:border-morse-purple/50'
      }`}
      onClick={onPlay}
    >
      {/* Character */}
      <span className="text-2xl font-black text-morse-navy leading-none">{char}</span>
      {/* Morse code visual */}
      <MorseCode code={code} mini />
      {/* Code text */}
      <span className="text-[10px] font-mono font-bold text-morse-navy/40 tracking-widest">
        {code}
      </span>
      {/* Play indicator */}
      {isPlaying && (
        <motion.div
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-morse-yellow rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          <span className="text-[8px]">♪</span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function LearnPage() {
  const [category, setCategory] = useState<Category>('letters');
  const [speed, setSpeed] = useState<SpeedPreset>('slow');
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const { playbackState, playChar } = useMorseAudio();

  const isPlaying = playbackState === 'playing';

  const handlePlay = useCallback(
    async (text: string) => {
      if (isPlaying) return;
      setPlayingKey(text);
      const chars = parseMorseString(text);
      // play each char of the text
      const { MorseAudioEngine } = await import('@/lib/audio');
      const engine = new MorseAudioEngine();
      await engine.play(chars, speed);
      setPlayingKey(null);
    },
    [isPlaying, speed]
  );

  const handlePlayChar = useCallback(
    async (char: string) => {
      if (isPlaying) return;
      setPlayingKey(char);
      const parsed = parseMorseString(char);
      if (parsed[0]) await playChar(parsed[0], speed);
      setPlayingKey(null);
    },
    [isPlaying, speed, playChar]
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="📖 Learn Morse" showBack />

      <div className="px-4 py-4 flex flex-col gap-4">

        {/* Speed selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-morse-navy/40 uppercase tracking-wide">Speed:</span>
          <div className="flex gap-1.5">
            {SPEED_OPTIONS.map(({ preset, label, emoji }) => (
              <button
                key={preset}
                onClick={() => setSpeed(preset)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  speed === preset
                    ? 'bg-morse-purple text-white shadow'
                    : 'bg-white text-morse-navy/50 border border-morse-navy/10'
                }`}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {CATEGORY_TABS.map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-black transition-all flex-shrink-0 ${
                category === id
                  ? 'bg-morse-purple text-white shadow-md'
                  : 'bg-white text-morse-navy/50 border-2 border-morse-navy/10'
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* ── Letters ── */}
        <AnimatePresence mode="wait">
          {category === 'letters' && (
            <motion.div
              key="letters"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <p className="text-xs font-bold text-morse-navy/40 mb-3 uppercase tracking-wide">
                Tap any letter to hear its Morse code 🔊
              </p>
              <div className="grid grid-cols-4 gap-2">
                {ALL_LETTERS.map((char) => (
                  <CharCard
                    key={char}
                    char={char}
                    code={MORSE_CODE_MAP[char]}
                    isPlaying={playingKey === char}
                    onPlay={() => handlePlayChar(char)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Numbers ── */}
          {category === 'numbers' && (
            <motion.div
              key="numbers"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <p className="text-xs font-bold text-morse-navy/40 mb-3 uppercase tracking-wide">
                Tap any number to hear it 🔊
              </p>
              <div className="grid grid-cols-4 gap-2">
                {ALL_NUMBERS.map((char) => (
                  <CharCard
                    key={char}
                    char={char}
                    code={MORSE_CODE_MAP[char]}
                    isPlaying={playingKey === char}
                    onPlay={() => handlePlayChar(char)}
                  />
                ))}
              </div>

              {/* Fun fact */}
              <div className="mt-4 bg-morse-teal/10 rounded-2xl p-4 border border-morse-teal/30">
                <p className="text-sm font-bold text-morse-navy">
                  💡 Did you know?
                </p>
                <p className="text-xs text-morse-navy/60 mt-1">
                  Numbers in Morse always have exactly 5 symbols! Notice the pattern —
                  1 is .---- and 9 is ----. They mirror each other! 🤯
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Symbols ── */}
          {category === 'symbols' && (
            <motion.div
              key="symbols"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <p className="text-xs font-bold text-morse-navy/40 mb-3 uppercase tracking-wide">
                Punctuation & Special characters 🔊
              </p>
              <div className="grid grid-cols-4 gap-2">
                {ALL_SYMBOLS.map((char) => (
                  <CharCard
                    key={char}
                    char={char}
                    code={MORSE_CODE_MAP[char]}
                    isPlaying={playingKey === char}
                    onPlay={() => handlePlayChar(char)}
                  />
                ))}
              </div>

              <div className="mt-4 bg-morse-yellow/20 rounded-2xl p-4 border border-morse-yellow/50">
                <p className="text-sm font-bold text-morse-navy">
                  💡 Fun fact
                </p>
                <p className="text-xs text-morse-navy/60 mt-1">
                  The @ symbol was added to Morse code in 2004 — just for email addresses!
                  It&apos;s one of the newest additions. 📧
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Emergency ── */}
          {category === 'emergency' && (
            <motion.div
              key="emergency"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col gap-3"
            >
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                <p className="text-sm font-black text-red-700">
                  🌊 Real-life Morse codes used in emergencies!
                </p>
                <p className="text-xs text-red-600/70 mt-1">
                  Ships, pilots, and explorers still use these today.
                  Tap any card to hear it. 🔊
                </p>
              </div>

              {EMERGENCY_CODES.map((ec) => {
                const code = parseMorseString(ec.text)
                  .map((c) => c.morse)
                  .join(' ');
                const isThisPlaying = playingKey === ec.key;

                return (
                  <motion.div
                    key={ec.key}
                    whileTap={{ scale: 0.98 }}
                    className={`rounded-2xl border-2 p-4 cursor-pointer transition-all ${ec.colorClass} ${
                      isThisPlaying ? 'shadow-lg scale-[1.01]' : ''
                    }`}
                    onClick={() => !isPlaying && handlePlay(ec.text)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{ec.emoji}</span>
                          <span className="text-xl font-black">{ec.label}</span>
                          {isThisPlaying && (
                            <motion.span
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ repeat: Infinity, duration: 0.6 }}
                              className="text-xs font-bold"
                            >
                              🔊 Playing...
                            </motion.span>
                          )}
                        </div>
                        <p className="text-xs font-semibold opacity-80">{ec.meaning}</p>
                      </div>

                      {/* Play icon */}
                      <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-lg">{isThisPlaying ? '⏸' : '▶'}</span>
                      </div>
                    </div>

                    {/* Morse code visual */}
                    <div className="mt-3 pt-3 border-t border-current/20">
                      <div className="flex items-center gap-1 flex-wrap">
                        {parseMorseString(ec.text).map((char, ci) => (
                          <span key={ci} className="flex items-center gap-1">
                            {char.symbols.map((sym, si) =>
                              sym === '.' ? (
                                <span
                                  key={si}
                                  className="w-2 h-2 rounded-full bg-current inline-block opacity-70"
                                />
                              ) : (
                                <span
                                  key={si}
                                  className="w-5 h-2 rounded bg-current inline-block opacity-70"
                                />
                              )
                            )}
                            <span className="w-2" />
                          </span>
                        ))}
                      </div>
                      <p className="text-xs font-mono mt-1.5 opacity-50 tracking-widest">{code}</p>
                    </div>
                  </motion.div>
                );
              })}

              {/* SOS tip */}
              <div className="bg-morse-navy/5 rounded-2xl p-4 border border-morse-navy/10">
                <p className="text-sm font-black text-morse-navy">⚡ SOS Trick to Remember</p>
                <p className="text-xs text-morse-navy/60 mt-1">
                  SOS is <strong>... --- ...</strong> — three dots, three dashes, three dots.
                  You can tap it, flash it, or knock it on any surface in an emergency!
                </p>
                <p className="text-xs font-bold text-morse-purple mt-2">
                  👉 Try the Flashlight page to signal SOS with your phone camera!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
