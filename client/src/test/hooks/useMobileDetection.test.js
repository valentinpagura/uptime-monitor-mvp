import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMobileDetection } from '../../hooks/useMobileDetection';

describe('useMobileDetection', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
  });

  it('returns false when viewport is larger than mobile breakpoint', () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useMobileDetection());
    expect(result.current).toBe(false);
  });

  it('returns true when viewport is at or below mobile breakpoint', () => {
    window.innerWidth = 768;
    const { result } = renderHook(() => useMobileDetection());
    expect(result.current).toBe(true);
  });

  it('returns true for small viewport', () => {
    window.innerWidth = 375;
    const { result } = renderHook(() => useMobileDetection());
    expect(result.current).toBe(true);
  });

  it('updates when window is resized below breakpoint', () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useMobileDetection());
    expect(result.current).toBe(false);

    act(() => {
      window.innerWidth = 600;
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(true);
  });

  it('updates when window is resized above breakpoint', () => {
    window.innerWidth = 600;
    const { result } = renderHook(() => useMobileDetection());
    expect(result.current).toBe(true);

    act(() => {
      window.innerWidth = 1200;
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(false);
  });

  it('removes resize listener on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useMobileDetection());
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
