import { useCallback, useEffect, useRef } from "react";

export function useRafThrottle<T extends unknown[]>(fn: (...args: T) => void) {
  const frameRef = useRef<number | null>(null);
  const lastArgs = useRef<T | null>(null);

  const cb = useCallback(
    (...args: T) => {
      lastArgs.current = args;
      if (frameRef.current == null) {
        frameRef.current = requestAnimationFrame(() => {
          frameRef.current = null;
          if (lastArgs.current) fn(...lastArgs.current);
        });
      }
    },
    [fn]
  );

  useEffect(
    () => () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    },
    []
  );

  return cb;
}
