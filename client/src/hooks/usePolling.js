import { useEffect, useRef, useCallback } from 'react';

function safeExecute(fn, pendingRef) {
  if (pendingRef.current) return;
  pendingRef.current = true;
  const result = fn();
  if (result && typeof result.then === 'function') {
    result.finally(() => { pendingRef.current = false; });
  } else {
    pendingRef.current = false;
  }
}

export function usePolling(callback, intervalMs, options = {}) {
  const { enabled = true } = options;
  const callbackRef = useRef(callback);
  const mountedRef = useRef(true);
  const pendingRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    mountedRef.current = true;

    if (enabled) {
      safeExecute(callbackRef.current, pendingRef);
    }

    const id = setInterval(() => {
      if (mountedRef.current && enabled) {
        safeExecute(callbackRef.current, pendingRef);
      }
    }, intervalMs);

    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [enabled, intervalMs]);

  const refresh = useCallback(() => {
    if (mountedRef.current) {
      safeExecute(callbackRef.current, pendingRef);
    }
  }, []);

  return { refresh };
}
