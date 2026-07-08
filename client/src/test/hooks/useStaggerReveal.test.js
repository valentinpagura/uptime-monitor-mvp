import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';

afterEach(() => {
  vi.restoreAllMocks();
});

function setupMockObserver() {
  return vi.fn().mockImplementation(
    class {
      constructor() {
        this.observe = vi.fn();
        this.disconnect = vi.fn();
        this.unobserve = vi.fn();
        this.takeRecords = vi.fn();
        this.root = null;
        this.rootMargin = '';
        this.thresholds = [];
      }
    },
  );
}

describe('useStaggerReveal', () => {
  it('creates an IntersectionObserver when ref has current', () => {
    const Observer = setupMockObserver();
    window.IntersectionObserver = Observer;

    const el = document.createElement('div');
    el.appendChild(document.createElement('p'));
    el.appendChild(document.createElement('p'));

    const ref = { current: el };
    renderHook(() => useStaggerReveal(ref));

    expect(Observer).toHaveBeenCalled();
  });

  it('does nothing when ref is null', () => {
    const ref = { current: null };
    expect(() => {
      renderHook(() => useStaggerReveal(ref));
    }).not.toThrow();
  });

  it('does nothing when ref has no children', () => {
    const Observer = setupMockObserver();
    window.IntersectionObserver = Observer;

    const el = document.createElement('div');
    const ref = { current: el };
    renderHook(() => useStaggerReveal(ref));

    expect(Observer).not.toHaveBeenCalled();
  });

  it('passes threshold option to IntersectionObserver', () => {
    const Observer = setupMockObserver();
    window.IntersectionObserver = Observer;

    const el = document.createElement('div');
    el.appendChild(document.createElement('p'));

    const ref = { current: el };
    renderHook(() =>
      useStaggerReveal(ref, { stagger: 0.2, duration: 0.6, fromY: 32, threshold: 0.3 }),
    );

    expect(Observer).toHaveBeenCalledWith(expect.any(Function), {
      threshold: 0.3,
    });
  });

  it('disconnects observer on unmount', () => {
    const disconnectMock = vi.fn();
    const Observer = vi.fn().mockImplementation(
      class {
        constructor() {
          this.observe = vi.fn();
          this.disconnect = disconnectMock;
          this.unobserve = vi.fn();
          this.takeRecords = vi.fn();
          this.root = null;
          this.rootMargin = '';
          this.thresholds = [];
        }
      },
    );
    window.IntersectionObserver = Observer;

    const el = document.createElement('div');
    el.appendChild(document.createElement('p'));
    const ref = { current: el };

    const { unmount } = renderHook(() => useStaggerReveal(ref));
    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });
});
