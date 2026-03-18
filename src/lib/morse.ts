import type { MorseCharacter } from '@/types';

export const MORSE_CODE_MAP: Record<string, string> = {
  // Letters
  A: '.-',    B: '-...',  C: '-.-.',  D: '-..',
  E: '.',     F: '..-.',  G: '--.',   H: '....',
  I: '..',    J: '.---',  K: '-.-',   L: '.-..',
  M: '--',    N: '-.',    O: '---',   P: '.--.',
  Q: '--.-',  R: '.-.',   S: '...',   T: '-',
  U: '..-',   V: '...-',  W: '.--',   X: '-..-',
  Y: '-.--',  Z: '--..',
  // Numbers
  '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..',  '9': '----.',
  // Word separator — used as sentinel in output only
  ' ': '/',
};

export const REVERSE_MORSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_CODE_MAP).map(([k, v]) => [v, k])
);

/** Convert a text string into a MorseCharacter array (one per non-space char). */
export function parseMorseString(text: string): MorseCharacter[] {
  return text
    .toUpperCase()
    .split('')
    .filter((ch) => ch in MORSE_CODE_MAP)
    .map((ch) => ({
      original: ch,
      morse: MORSE_CODE_MAP[ch],
      symbols: MORSE_CODE_MAP[ch].split('') as Array<'.' | '-'>,
    }));
}

/** Full encode — returns a human-readable Morse string (e.g. ".- -...") */
export function encodeText(text: string): string {
  return text
    .toUpperCase()
    .split('')
    .map((ch) => MORSE_CODE_MAP[ch] ?? '')
    .filter(Boolean)
    .join(' ');
}

// Difficulty subsets for games
export const BEGINNER_LETTERS = ['E', 'T', 'A', 'I', 'N', 'M', 'S', 'O'];
export const ALL_LETTERS = Object.keys(MORSE_CODE_MAP).filter((k) => /[A-Z]/.test(k));
export const ALL_ALPHANUMERIC = Object.keys(MORSE_CODE_MAP).filter((k) => k !== ' ');

/** Pick N random unique items from an array. */
export function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/** Shuffle an array (Fisher-Yates). */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
