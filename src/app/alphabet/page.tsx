'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { MORSE_CODE_MAP } from '@/lib/morse';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS = '0123456789'.split('');

function renderMorse(morse: string) {
  return (
    <span className="font-mono text-xs text-morse-navy/60 tracking-widest">{morse}</span>
  );
}

export default function AlphabetPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="📖 Morse Alphabet" showBack />
      <div className="px-4 py-5 flex flex-col gap-4">
        <h2 className="font-black text-morse-navy text-lg">Letters A–Z</h2>
        <div className="grid grid-cols-3 gap-2">
          {LETTERS.map((letter) => (
            <Card key={letter} color="purple" className="p-3 text-center">
              <div className="font-black text-2xl text-morse-purple">{letter}</div>
              {renderMorse(MORSE_CODE_MAP[letter])}
            </Card>
          ))}
        </div>

        <h2 className="font-black text-morse-navy text-lg mt-2">Numbers 0–9</h2>
        <div className="grid grid-cols-3 gap-2">
          {NUMBERS.map((num) => (
            <Card key={num} color="yellow" className="p-3 text-center">
              <div className="font-black text-2xl text-morse-yellow">{num}</div>
              {renderMorse(MORSE_CODE_MAP[num])}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
