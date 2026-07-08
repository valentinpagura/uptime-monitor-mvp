import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePolling } from '../../hooks/usePolling';

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls callback immediately when enabled', () => {
    const callback = vi.fn();
    renderHook(() => usePolling(callback, 10000));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls callback at the specified interval', () => {
    const callback = vi.fn();
    renderHook(() => usePolling(callback, 5000));

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('does not call immediately when enabled is false', () => {
    const callback = vi.fn();
    renderHook(() => usePolling(callback, 5000, { enabled: false }));
    expect(callback).not.toHaveBeenCalled();
  });

  it('does not call at interval when enabled is false', () => {
    const callback = vi.fn();
    renderHook(() => usePolling(callback, 5000, { enabled: false }));

    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('clears interval on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => usePolling(callback, 5000));

    expect(callback).toHaveBeenCalledTimes(1);
    unmount();

    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('returns a refresh function that calls the callback', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => usePolling(callback, 5000));

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.refresh();
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('uses latest callback reference', () => {
    const callback1 = vi.fn();
    const { rerender } = renderHook(
      ({ cb }) => usePolling(cb, 5000),
      { initialProps: { cb: callback1 } },
    );

    expect(callback1).toHaveBeenCalledTimes(1);

    const callback2 = vi.fn();
    rerender({ cb: callback2 });

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledTimes(1);
  });
});
