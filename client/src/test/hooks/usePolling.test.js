import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePolling } from '../../hooks/usePolling';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('usePolling', () => {
  it('calls the callback immediately on mount', () => {
    const fn = vi.fn();
    renderHook(() => usePolling(fn, 5000));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls the callback at the specified interval', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    renderHook(() => usePolling(fn, 2000));
    expect(fn).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(fn).toHaveBeenCalledTimes(2);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(fn).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });

  it('does not start polling when enabled is false', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    renderHook(() => usePolling(fn, 2000, { enabled: false }));
    expect(fn).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(10000); });
    expect(fn).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('stops calling callback after unmount', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const { unmount } = renderHook(() => usePolling(fn, 2000));
    expect(fn).toHaveBeenCalledTimes(1);
    unmount();
    act(() => { vi.advanceTimersByTime(10000); });
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('refreshes callback when enabled changes from false to true', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }) => usePolling(fn, 5000, { enabled }),
      { initialProps: { enabled: false } },
    );
    expect(fn).not.toHaveBeenCalled();
    rerender({ enabled: true });
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('does not run concurrent callbacks when a previous async call is pending', async () => {
    vi.useFakeTimers();
    let resolvePromise;
    const fn = vi.fn().mockImplementation(() => new Promise((resolve) => { resolvePromise = resolve; }));
    renderHook(() => usePolling(fn, 2000));
    expect(fn).toHaveBeenCalledTimes(1);

    act(() => { vi.advanceTimersByTime(2000); });
    expect(fn).toHaveBeenCalledTimes(1);

    await act(async () => { resolvePromise(); });

    act(() => { vi.advanceTimersByTime(2000); });
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('does not call callback on interval after unmount while async is pending', () => {
    vi.useFakeTimers();
    const fn = vi.fn().mockImplementation(() => new Promise(() => {}));
    const { unmount } = renderHook(() => usePolling(fn, 2000));
    expect(fn).toHaveBeenCalledTimes(1);
    unmount();
    act(() => { vi.advanceTimersByTime(10000); });
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('refresh function calls the callback', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => usePolling(fn, 5000));
    expect(fn).toHaveBeenCalledTimes(1);
    act(() => { result.current.refresh(); });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('refresh does not call callback if unmounted', () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => usePolling(fn, 5000));
    unmount();
    act(() => { result.current.refresh(); });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('updates callbackRef when callback changes', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const { rerender } = renderHook(
      ({ cb }) => usePolling(cb, 5000),
      { initialProps: { cb: fn1 } },
    );
    expect(fn1).toHaveBeenCalledTimes(1);
    rerender({ cb: fn2 });
    expect(fn2).toHaveBeenCalledTimes(0);
  });

  it('handles synchronous callbacks without pendingRef deadlock', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    renderHook(() => usePolling(fn, 2000));
    expect(fn).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
