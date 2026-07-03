import { useEffect, useRef, useCallback } from 'react';

export function usePolling(callback, intervalMs, options = {}) {
  const { enabled = true } = options;
  const callbackRef = useRef(callback);
  const mountedRef = useRef(true);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    mountedRef.current = true;

    if (enabled) {
      callbackRef.current();
    }

    const id = setInterval(() => {
      if (mountedRef.current) {
        callbackRef.current();
      }
    }, intervalMs);

    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [enabled, intervalMs]);

  const refresh = useCallback(() => {
    if (mountedRef.current) {
      callbackRef.current();
    }
  }, []);

  return { refresh };
}
