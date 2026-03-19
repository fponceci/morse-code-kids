'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MorseCharacter, SpeedPreset } from '@/types';
import { SPEED_WPM } from '@/types';

interface UseFlashlightReturn {
  isAvailable: boolean;
  isNative: boolean;
  isFlashing: boolean;
  flashMorse: (chars: MorseCharacter[], speed: SpeedPreset) => Promise<void>;
  stop: () => void;
}

/** Detect if running inside a real Capacitor native app (Android/iOS) */
function isNativePlatform(): boolean {
  return typeof window !== 'undefined' &&
    !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
      .Capacitor?.isNativePlatform?.();
}

export function useFlashlight(): UseFlashlightReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isNative, setIsNative]       = useState(false);
  const [isFlashing, setIsFlashing]   = useState(false);

  // Web-only: camera stream reference
  const streamRef  = useRef<MediaStream | null>(null);
  const abortRef   = useRef<AbortController | null>(null);

  // Check availability on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { Torch } = await import('@capawesome/capacitor-torch');
        const { available } = await Torch.isAvailable();
        if (!cancelled) {
          setIsAvailable(available);
          setIsNative(isNativePlatform());
        }
      } catch {
        // Plugin not available in this environment
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /** Get (or reuse) camera stream — web only */
  const getStream = useCallback(async (): Promise<MediaStream | null> => {
    if (streamRef.current) return streamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      return stream;
    } catch {
      return null;
    }
  }, []);

  /** Toggle torch on/off using the plugin */
  const setTorch = useCallback(async (on: boolean) => {
    try {
      const { Torch } = await import('@capawesome/capacitor-torch');
      if (isNativePlatform()) {
        // Native Android / iOS — no stream needed
        on ? await Torch.enable() : await Torch.disable();
      } else {
        // Web (Chrome on Android) — needs MediaStream
        const stream = await getStream();
        if (!stream) return;
        on
          ? await Torch.enable({ stream })
          : await Torch.disable({ stream });
      }
    } catch { /* silently ignore mid-flash errors */ }
  }, [getStream]);

  /** Flash a MorseCharacter sequence using the torch */
  const flashMorse = useCallback(async (
    chars: MorseCharacter[],
    speed: SpeedPreset,
  ) => {
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    const dotMs = 1200 / SPEED_WPM[speed];

    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, ms);
        abort.signal.addEventListener('abort', () => {
          clearTimeout(t);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });

    setIsFlashing(true);
    try {
      for (const char of chars) {
        if (abort.signal.aborted) break;

        // Word gap (space character)
        if (char.original === ' ') {
          await sleep(dotMs * 7);
          continue;
        }

        for (let si = 0; si < char.symbols.length; si++) {
          if (abort.signal.aborted) break;
          const sym = char.symbols[si];

          await setTorch(true);
          await sleep(sym === '.' ? dotMs : dotMs * 3); // dit or dah
          await setTorch(false);

          // Inter-symbol gap (skip after last symbol of a character)
          if (si < char.symbols.length - 1) await sleep(dotMs);
        }

        // Inter-letter gap (3 dots − the 1 already waited)
        await sleep(dotMs * 2);
      }
    } catch {
      // AbortError — clean stop requested
    }

    await setTorch(false);
    setIsFlashing(false);
  }, [setTorch]);

  /** Stop mid-flash */
  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsFlashing(false);
    setTorch(false);
  }, [setTorch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  return { isAvailable, isNative, isFlashing, flashMorse, stop };
}
