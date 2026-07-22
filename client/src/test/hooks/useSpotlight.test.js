import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpotlight } from '../../hooks/useSpotlight';

vi.mock('../../hooks/useMobileDetection', () => ({
  useMobileDetection: vi.fn(() => false),
}));

import { useMobileDetection } from '../../hooks/useMobileDetection';

function createContainerRef() {
  const container = document.createElement('div');
  container.style.width = '1000px';
  container.style.height = '800px';
  container.style.position = 'absolute';
  container.style.left = '0';
  container.style.top = '0';
  const card = document.createElement('div');
  card.className = 'magic-glow-card';
  card.style.width = '200px';
  card.style.height = '100px';
  card.style.position = 'absolute';
  card.style.left = '100px';
  card.style.top = '100px';
  container.appendChild(card);
  document.body.appendChild(container);
  return { current: container };
}

function cleanup(ref) {
  if (ref?.current?.parentNode) {
    ref.current.parentNode.removeChild(ref.current);
  }
}

describe('useSpotlight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.querySelectorAll('.global-spotlight').forEach((el) => el.remove());
  });

  it('creates spotlight element and appends to body', () => {
    const ref = createContainerRef();
    renderHook(() => useSpotlight(ref));
    const spotlight = document.body.querySelector('.global-spotlight');
    expect(spotlight).not.toBeNull();
    expect(spotlight.style.position).toBe('fixed');
    cleanup(ref);
  });

  it('removes spotlight element from DOM on cleanup', () => {
    const ref = createContainerRef();
    const { unmount } = renderHook(() => useSpotlight(ref));
    unmount();
    expect(document.body.querySelector('.global-spotlight')).toBeNull();
    cleanup(ref);
  });

  it('does nothing when isMobile is true', () => {
    vi.mocked(useMobileDetection).mockReturnValue(true);
    const ref = createContainerRef();
    renderHook(() => useSpotlight(ref));
    expect(document.body.querySelector('.global-spotlight')).toBeNull();
    cleanup(ref);
  });

  it('does nothing when containerRef.current is null', () => {
    renderHook(() => useSpotlight({ current: null }));
    expect(document.body.querySelector('.global-spotlight')).toBeNull();
  });

  it('does nothing when enabled is false', () => {
    const ref = createContainerRef();
    renderHook(() => useSpotlight(ref, { enabled: false }));
    expect(document.body.querySelector('.global-spotlight')).toBeNull();
    cleanup(ref);
  });

  it('dispatches events without errors', () => {
    const ref = createContainerRef();
    renderHook(() => useSpotlight(ref));
    expect(() => {
      act(() => {
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 150 }));
        document.dispatchEvent(new MouseEvent('mouseleave'));
      });
    }).not.toThrow();
    cleanup(ref);
  });
});
