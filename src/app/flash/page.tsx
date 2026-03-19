'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { useFlashlight } from '@/hooks/useFlashlight';
import { parseMorseString } from '@/lib/morse';
import type { SpeedPreset } from '@/types';

const QUICK_MESSAGES = [
  { label: '🆘 SOS',   text: 'SOS',   color: 'bg-red-500 text-white',       desc: 'Distress signal' },
  { label: '✅ OK',    text: 'OK',    color: 'bg-green-500 text-white',     desc: 'I am safe' },
  { label: '👋 HI',   text: 'HI',    color: 'bg-blue-500 text-white',      desc: 'Hello!' },
  { label: '❤️ 73',   text: '73',    color: 'bg-purple-500 text-white',    desc: 'Best wishes' },
  { label: '📡 CQ',   text: 'CQ',    color: 'bg-teal-500 text-white',      desc: 'Anyone there?' },
  { label: '🚨 HELP', text: 'HELP',  color: 'bg-orange-500 text-white',    desc: 'I need help' },
];

const SPEED_OPTIONS: { preset: SpeedPreset; label: string; emoji: string; desc: string }[] = [
  { preset: 'slow',   label: 'Slow',   emoji: '🐢', desc: '5 WPM' },
  { preset: 'normal', label: 'Normal', emoji: '🐇', desc: '13 WPM' },
  { preset: 'fast',   label: 'Fast',   emoji: '🚀', desc: '25 WPM' },
];

/** Visual screen-flash effect so desktop users can see it working */
function ScreenFlash({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 bg-white z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ repeat: Infinity, duration: 0.3 }}
        />
      )}
    </AnimatePresence>
  );
}

export default function FlashPage() {
  const [text, setText] = useState('SOS');
  const [speed, setSpeed] = useState<SpeedPreset>('slow');
  const { isAvailable, isNative, isFlashing, flashMorse, stop } = useFlashlight();

  // Compute current morse preview
  const morsePreview = parseMorseString(text)
    .map((c) => c.morse)
    .join('  ');

  const handleFlash = useCallback(async () => {
    if (isFlashing) { stop(); return; }
    if (!text.trim()) return;
    const chars = parseMorseString(text);
    if (!chars.length) return;
    await flashMorse(chars, speed);
  }, [isFlashing, text, speed, flashMorse, stop]);

  const handleQuickSelect = (msg: string) => {
    if (isFlashing) stop();
    setText(msg);
  };

  return (
    <>
      {/* Screen flash effect for visual feedback */}
      <ScreenFlash active={isFlashing} />

      <div className="flex flex-col min-h-screen bg-morse-navy">
        <Navbar title="🔦 Flashlight Signal" showBack darkMode />

        <div className="px-4 py-4 flex flex-col gap-5">

          {/* Hero torch display */}
          <div className="text-center py-6">
            <motion.div
              animate={isFlashing ? {
                scale: [1, 1.15, 1],
                filter: ['brightness(1)', 'brightness(2)', 'brightness(1)'],
              } : { scale: 1 }}
              transition={{ repeat: isFlashing ? Infinity : 0, duration: 0.4 }}
              className="text-8xl mb-2 select-none"
            >
              🔦
            </motion.div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest">
              {isFlashing
              ? '⚡ Flashing...'
              : isNative
                ? '📱 Native Torch Ready'
                : isAvailable
                  ? '✅ Camera Torch Ready'
                  : '💻 Screen Mode Only'}
            </p>
          </div>

          {/* Device support badge */}
          {!isAvailable && (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-3 flex gap-3 items-start">
              <span className="text-xl mt-0.5">📱</span>
              <div>
                <p className="text-white text-sm font-bold">Screen flash only on this device</p>
                <p className="text-white/50 text-xs mt-0.5">
                  Install the app on Android or iPhone for real flashlight support.
                  On desktop the screen will flash as a preview.
                </p>
              </div>
            </div>
          )}
          {isAvailable && !isNative && (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-3 flex gap-3 items-start">
              <span className="text-xl mt-0.5">📷</span>
              <div>
                <p className="text-white text-sm font-bold">Camera torch detected</p>
                <p className="text-white/50 text-xs mt-0.5">
                  Tap FLASH — your browser will request camera permission and use the
                  rear flashlight.
                </p>
              </div>
            </div>
          )}
          {isNative && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-3 flex gap-3 items-start">
              <span className="text-xl mt-0.5">✅</span>
              <div>
                <p className="text-green-300 text-sm font-bold">Native torch active</p>
                <p className="text-green-300/70 text-xs mt-0.5">
                  Running as a native app — full torch control on Android and iOS.
                </p>
              </div>
            </div>
          )}

          {/* Quick messages */}
          <div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
              Quick codes
            </p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_MESSAGES.map((qm) => (
                <button
                  key={qm.text}
                  onClick={() => handleQuickSelect(qm.text)}
                  className={`rounded-xl py-2.5 px-2 font-black text-sm transition-all ${qm.color} ${
                    text === qm.text ? 'ring-2 ring-white ring-offset-2 ring-offset-morse-navy scale-105' : 'opacity-80'
                  }`}
                >
                  {qm.label}
                  <span className="block text-[10px] font-normal opacity-80">{qm.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom text input */}
          <div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
              Or type your own message
            </p>
            <input
              type="text"
              value={text}
              onChange={(e) => {
                if (isFlashing) stop();
                setText(e.target.value.toUpperCase());
              }}
              placeholder="Type a message..."
              maxLength={30}
              className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white font-bold text-lg placeholder:text-white/30 focus:outline-none focus:border-morse-yellow/60 tracking-wider"
            />
          </div>

          {/* Morse code preview */}
          {morsePreview && (
            <div className="bg-white/5 rounded-xl px-4 py-3">
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Morse code</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {parseMorseString(text).map((char, ci) => (
                  <span key={ci} className="flex items-center gap-0.5">
                    {char.symbols.map((sym, si) =>
                      sym === '.' ? (
                        <span key={si} className="w-2 h-2 rounded-full bg-morse-yellow inline-block" />
                      ) : (
                        <span key={si} className="w-5 h-2 rounded bg-morse-yellow inline-block" />
                      )
                    )}
                    <span className="w-2" />
                  </span>
                ))}
              </div>
              <p className="text-white/40 text-xs font-mono mt-1.5 tracking-widest break-all">{morsePreview}</p>
            </div>
          )}

          {/* Speed selector */}
          <div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">Speed</p>
            <div className="flex gap-2">
              {SPEED_OPTIONS.map(({ preset, label, emoji, desc }) => (
                <button
                  key={preset}
                  onClick={() => setSpeed(preset)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    speed === preset
                      ? 'bg-morse-yellow text-morse-navy shadow-lg'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {emoji} {label}
                  <span className="block text-[10px] opacity-60">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main FLASH button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleFlash}
            disabled={!text.trim()}
            className={`w-full py-5 rounded-2xl font-black text-xl transition-all disabled:opacity-30 ${
              isFlashing
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-morse-yellow text-morse-navy shadow-xl shadow-morse-yellow/30'
            }`}
          >
            {isFlashing ? (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                ⏹ STOP
              </motion.span>
            ) : (
              '⚡ FLASH IT'
            )}
          </motion.button>

          {/* Emergency info */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <p className="text-red-300 text-sm font-black">🆘 In a real emergency</p>
            <p className="text-red-300/70 text-xs mt-1">
              SOS (<strong>· · · — — — · · ·</strong>) is the universal distress signal.
              You can also flash it with a mirror, a torch, or any light source —
              3 short, 3 long, 3 short. Someone will recognize it!
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
