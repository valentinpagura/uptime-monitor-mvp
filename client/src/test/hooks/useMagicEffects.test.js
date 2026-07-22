import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMagicEffects } from '../../hooks/useMagicEffects';

vi.mock('../../hooks/useMobileDetection', () => ({
  useMobileDetection: vi.fn(() => false),
}));

import { useMobileDetection } from '../../hooks/useMobileDetection';

function createRefInBody() {
  const el = document.createElement('div');
  el.style.width = '400px';
  el.style.height = '300px';
  document.body.appendChild(el);
  return { current: el };
}

function cleanup(ref) {
  ref.current?.parentNode?.removeChild(ref.current);
}

describe('useMagicEffects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds ripple element to DOM on click', () => {
    const ref = createRefInBody();
    renderHook(() => useMagicEffects(ref));
    act(() => { ref.current.dispatchEvent(new MouseEvent('click', { clientX: 100, clientY: 100 })); });
    expect(ref.current.children.length).toBeGreaterThanOrEqual(1);
    cleanup(ref);
  });

  it('does not add ripple on click when clickEffect is false', () => {
    const ref = createRefInBody();
    renderHook(() => useMagicEffects(ref, { clickEffect: false }));
    act(() => { ref.current.dispatchEvent(new MouseEvent('click', { clientX: 100, clientY: 100 })); });
    expect(ref.current.children.length).toBe(0);
    cleanup(ref);
  });

  it('does nothing when isMobile is true', () => {
    vi.mocked(useMobileDetection).mockReturnValue(true);
    const ref = createRefInBody();
    renderHook(() => useMagicEffects(ref));
    act(() => { ref.current.dispatchEvent(new MouseEvent('click', { clientX: 100, clientY: 100 })); });
    expect(ref.current.children.length).toBe(0);
    cleanup(ref);
  });

  it('does nothing when ref.current is null', () => {
    expect(() => {
      renderHook(() => useMagicEffects({ current: null }));
    }).not.toThrow();
  });

  it('does not create ripple when enableStars is true but not hovered', () => {
    const ref = createRefInBody();
    renderHook(() => useMagicEffects(ref));
    expect(ref.current.children.length).toBe(0);
    cleanup(ref);
  });
});
