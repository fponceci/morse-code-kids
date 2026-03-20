import type { MorseCharacter, SpeedPreset } from '@/types';
import { SPEED_WPM } from '@/types';

/** Compute dot duration in ms from WPM (International Morse Standard: dot_ms = 1200 / wpm) */
export function dotMs(wpm: number): number {
  return 1200 / wpm;
}

export function dotMsFromPreset(speed: SpeedPreset): number {
  return dotMs(SPEED_WPM[speed]);
}

type SymbolCallback = (charIndex: number, symbolIndex: number) => void;

export class MorseAudioEngine {
  private ctx: AudioContext | null = null;
  private abortController: AbortController | null = null;
  // Classic CW radio / ship telegraph frequency
  private frequency = 650; // Hz — lower than modern tones, authentic vintage feel
  private volume = 0.7;

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  /** Must be called inside a user gesture handler to resume on Android WebView */
  async resume(): Promise<void> {
    const ctx = this.getCtx();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
  }

  /**
   * Classic telegraph/radio CW tone:
   *  - Square wave oscillator (buzzy, vintage character)
   *  - Low-pass filter at ~1800 Hz (rounds off harsh edges → warm radio sound)
   *  - Very sharp attack (1.5 ms) — the "key-down" click feel
   *  - Short release (8 ms) — clean "key-up" without pop
   */
  private beep(ctx: AudioContext, durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      const dur = durationMs / 1000;

      // Square wave — the raw buzz of a telegraph key
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(this.frequency, ctx.currentTime);

      // Low-pass filter softens the square into a warm CW tone
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, ctx.currentTime);
      filter.Q.setValueAtTime(0.8, ctx.currentTime);

      // Master gain with tight envelope
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      // Sharp key-down (1.5 ms)
      gain.gain.linearRampToValueAtTime(this.volume * 0.6, ctx.currentTime + 0.0015);
      // Slight sustain dip (vintage tube warmth)
      gain.gain.linearRampToValueAtTime(this.volume * 0.55, ctx.currentTime + 0.008);
      // Hold flat through the symbol
      gain.gain.setValueAtTime(this.volume * 0.55, ctx.currentTime + Math.max(dur - 0.008, 0.008));
      // Key-up (8 ms release — clean, no pop)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur + 0.01);
      osc.onended = () => resolve();
    });
  }

  private silence(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Play a full sequence of MorseCharacters.
   * @param chars    - parsed Morse characters
   * @param speed    - speed preset
   * @param onSymbol - callback fired when a symbol starts playing (for UI highlighting)
   * @returns        - resolves when playback completes or is stopped
   */
  async play(
    chars: MorseCharacter[],
    speed: SpeedPreset,
    onSymbol?: SymbolCallback
  ): Promise<void> {
    this.stop(); // cancel any existing playback
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    await this.resume();
    const ctx = this.getCtx();
    const dot = dotMsFromPreset(speed);

    for (let ci = 0; ci < chars.length; ci++) {
      if (signal.aborted) return;
      const { original, symbols } = chars[ci];

      if (original === ' ') {
        await this.silence(dot * 7);
        continue;
      }

      for (let si = 0; si < symbols.length; si++) {
        if (signal.aborted) return;
        onSymbol?.(ci, si);
        const dur = symbols[si] === '.' ? dot : dot * 3;
        await this.beep(ctx, dur);
        if (si < symbols.length - 1 && !signal.aborted) {
          await this.silence(dot); // intra-letter gap
        }
      }

      if (ci < chars.length - 1 && !signal.aborted) {
        await this.silence(dot * 3); // inter-letter gap
      }
    }
  }

  /** Play a single character (for games / listen mode) */
  async playChar(char: MorseCharacter, speed: SpeedPreset): Promise<void> {
    return this.play([char], speed);
  }

  /** Play a single beep of a given duration — used by the flashlight hook for sync */
  async beepMs(durationMs: number): Promise<void> {
    await this.resume();
    const ctx = this.getCtx();
    await this.beep(ctx, durationMs);
  }

  stop() {
    this.abortController?.abort();
    this.abortController = null;
  }

  get isPlaying(): boolean {
    return !!this.abortController && !this.abortController.signal.aborted;
  }
}

// Singleton engine — shared across the app
export const morseEngine = typeof window !== 'undefined' ? new MorseAudioEngine() : null;
