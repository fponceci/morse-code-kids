'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { DotMascot } from '@/components/mascot/DotMascot';
import { DashMascot } from '@/components/mascot/DashMascot';
import { Card } from '@/components/ui/Card';
import { MORSE_CODE_MAP } from '@/lib/morse';

const navCards = [
  {
    href: '/translator',
    emoji: '🔤',
    title: 'Translator',
    desc: 'Turn words into Morse code!',
    color: 'bg-morse-purple',
    shadow: 'shadow-[0_6px_0_#5B21B6]',
  },
  {
    href: '/listen',
    emoji: '👂',
    title: 'Listen Mode',
    desc: 'Hear Morse & guess the letter!',
    color: 'bg-morse-teal',
    shadow: 'shadow-[0_6px_0_#0F766E]',
  },
  {
    href: '/games',
    emoji: '🎮',
    title: 'Games',
    desc: 'Play 4 fun Morse code games!',
    color: 'bg-morse-coral',
    shadow: 'shadow-[0_6px_0_#E11D48]',
  },
  {
    href: '/alphabet',
    emoji: '📖',
    title: 'Alphabet',
    desc: 'Learn all the Morse letters!',
    color: 'bg-morse-yellow',
    shadow: 'shadow-[0_6px_0_#D97706]',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-b from-morse-purple to-morse-purple/80 px-6 pt-10 pb-8 text-white text-center">
        <div className="flex justify-center items-end gap-6 mb-4">
          <DotMascot size={70} />
          <motion.h1
            className="text-4xl font-black leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Morse<br />Code<br />Kids!
          </motion.h1>
          <DashMascot size={50} />
        </div>
        <motion.p
          className="text-white/70 text-base font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Learn the secret language of dots &amp; dashes!
        </motion.p>

        {/* Morse ticker */}
        <div className="mt-4 overflow-hidden">
          <motion.div
            className="flex gap-8 whitespace-nowrap text-morse-yellow font-black text-xl"
            animate={{ x: ['100%', '-200%'] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          >
            <span>... --- ...</span>
            <span>-- --- .-. ... .</span>
            <span>.... ..</span>
            <span>.- -... -.-.</span>
          </motion.div>
        </div>
      </div>

      {/* What is Morse? */}
      <div className="px-4 py-5">
        <Card color="purple" className="mb-4">
          <h2 className="font-black text-morse-purple text-lg mb-2">🤔 What is Morse Code?</h2>
          <p className="text-morse-navy/70 font-semibold text-sm leading-relaxed">
            Morse code turns letters into short <strong>dots (·)</strong> and long <strong>dashes (—)</strong>.
            You can tap it, beep it, or flash it with a light!
          </p>
          <div className="flex gap-6 mt-3 text-center">
            {['A', 'S', 'O'].map((letter) => (
              <div key={letter} className="flex flex-col items-center gap-1">
                <span className="font-black text-2xl text-morse-purple">{letter}</span>
                <span className="font-mono text-sm text-morse-navy/60">{MORSE_CODE_MAP[letter]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Nav cards */}
        <h2 className="font-black text-morse-navy text-xl mb-3">Let&apos;s get started! 🚀</h2>
        <div className="grid grid-cols-2 gap-3">
          {navCards.map(({ href, emoji, title, desc, color, shadow }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
            >
              <Link href={href}>
                <div
                  className={`${color} ${shadow} text-white rounded-3xl p-4 h-full transition-all active:translate-y-[6px] active:shadow-none no-select`}
                >
                  <div className="text-4xl mb-2">{emoji}</div>
                  <div className="font-black text-base">{title}</div>
                  <div className="text-white/70 text-xs font-semibold mt-1">{desc}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
