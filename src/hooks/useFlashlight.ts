'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MorseCharacter, SpeedPreset } from '@/types';
import { SPEED_WPM } from '@/types';
import { MorseAudioEngine } from '@/lib/audio';

interface UseFlashlightReturn {
  isAvailable: boolean;
  isNative: boolean;
  isFlashing: boolean;
  isOn: boolean; // true while a symbol is actively flashing (for UI sync)
  flashMorse: (chars: MorseCharacter[], speed: SpeedPreset, withAudio?: boolean) => Promise<void>;
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
  const [isOn, setIsOn]               = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const abortRef  = useRef<AbortController | null>(null);
  const audioRef  = useRef<MorseAudioEngine | null>(null);

  // Init audio engine
  useEffect(() => {
    audioRef.current = new MorseAudioEngine();
  }, []);

  // Check torch availability on mount
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
      } catch { /* plugin not available */ }
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

  /** Toggle torch on/off */
  const setTorch = useCallback(async (on: boolean) => {
    setIsOn(on);
    try {
      const { Torch } = await import('@capawesome/capacitor-torch');
      if (isNativePlatform()) {
        on ? await Torch.enable() : await Torch.disable();
      } else {
        const stream = await getStream();
        if (!stream) return;
        on ? await Torch.enable({ stream }) : await Torch.disable({ stream });
      }
    } catch { /* silently ignore */ }
  }, [getStream]);

  /** Flash a MorseCharacter sequence — optionally with synced audio */
  const flashMorse = useCallback(async (
    chars: MorseCharacter[],
    speed: SpeedPreset,
    withAudio = false,
  ) => {
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    const dot = 1200 / SPEED_WPM[speed];

    // Resume audio context inside the user-gesture call stack
    if (withAudio && audioRef.current) {
      await audioRef.current.resume();
    }

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

        if (char.original === ' ') {
          await sleep(dot * 7);
          continue;
        }

        for (let si = 0; si < char.symbols.length; si++) {
          if (abort.signal.aborted) break;
          const dur = char.symbols[si] === '.' ? dot : dot * 3;

          // Fire audio immediately (non-blocking) and turn torch on — perfectly synced
          if (withAudio && audioRef.current) {
            audioRef.current.beepMs(dur).catch(() => {});
          }
          await setTorch(true);
          await sleep(dur);
          await setTorch(false);

          // Inter-symbol gap
          if (si < char.symbols.length - 1) await sleep(dot);
        }

        // Inter-letter gap (3 dots − 1 already waited)
        await sleep(dot * 2);
      }
    } catch { /* AbortError — clean stop */ }

    await setTorch(false);
    setIsFlashing(false);
  }, [setTorch]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsFlashing(false);
    setIsOn(false);
    setTorch(false);
    audioRef.current?.stop();
  }, [setTorch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      audioRef.current?.stop();
    };
  }, []);

  return { isAvailable, isNative, isFlashing, isOn, flashMorse, stop };
}
