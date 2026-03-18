'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCountdownReturn {
  remaining: number;
  isRunning: boolean;
  start: (seconds: number) => void;
  stop: () => void;
  reset: () => void;
}

export function useCountdown(onExpire?: () => void): UseCountdownReturn {
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
  }, []);

  const start = useCallback((seconds: number) => {
    stop();
    setRemaining(seconds);
    setIsRunning(true);
    const end = Date.now() + seconds * 1000;
    intervalRef.current = setInterval(() => {
      const left = (end - Date.now()) / 1000;
      if (left <= 0) {
        setRemaining(0);
        stop();
        onExpireRef.current?.();
      } else {
        setRemaining(left);
      }
    }, 100);
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setRemaining(0);
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return { remaining, isRunning, start, stop, reset };
}
