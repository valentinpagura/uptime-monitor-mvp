import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';

const gsapMock = vi.hoisted(() => ({
  set: vi.fn(),
  to: vi.fn(),
  killTweensOf: vi.fn(),
}));

vi.mock('gsap', () => ({
  gsap: gsapMock,
}));

let observerCallback;

function setupObserverMock() {
  observerCallback = undefined;
  window.IntersectionObserver = vi.fn(function MockObserver(cb) {
    observerCallback = cb;
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
    this.takeRecords = vi.fn();
  });
}

function triggerIntersecting() {
  if (observerCallback) {
    act(() => { observerCallback([{ isIntersecting: true }]); });
  }
}

function getLastObserverInstance() {
  const mock = window.IntersectionObserver;
  return mock.mock.instances[mock.mock.instances.length - 1];
}

afterEach(() => {
  vi.restoreAllMocks();
  observerCallback = undefined;
});

describe('useStaggerReveal', () => {
  it('creates an IntersectionObserver when ref has current', () => {
    setupObserverMock();
    const el = document.createElement('div');
    el.appendChild(document.createElement('p'));
    el.appendChild(document.createElement('p'));
    const ref = { current: el };
    renderHook(() => useStaggerReveal(ref));
    expect(window.IntersectionObserver).toHaveBeenCalled();
  });

  it('does nothing when ref is null', () => {
    setupObserverMock();
    const ref = { current: null };
    expect(() => {
      renderHook(() => useStaggerReveal(ref));
    }).not.toThrow();
  });

  it('does nothing when ref has no children', () => {
    setupObserverMock();
    const el = document.createElement('div');
    const ref = { current: el };
    renderHook(() => useStaggerReveal(ref));
    expect(window.IntersectionObserver).not.toHaveBeenCalled();
  });

  it('passes threshold option to IntersectionObserver', () => {
    setupObserverMock();
    const el = document.createElement('div');
    el.appendChild(document.createElement('p'));
    const ref = { current: el };
    renderHook(() => useStaggerReveal(ref, { threshold: 0.3 }));
    expect(window.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 0.3 },
    );
  });

  it('disconnects observer on unmount', () => {
    setupObserverMock();
    const el = document.createElement('div');
    el.appendChild(document.createElement('p'));
    const ref = { current: el };
    const { unmount } = renderHook(() => useStaggerReveal(ref));
    const instance = getLastObserverInstance();
    unmount();
    expect(instance.disconnect).toHaveBeenCalled();
  });

  it('sets initial opacity to 0 via gsap.set', () => {
    setupObserverMock();
    const el = document.createElement('div');
    el.appendChild(document.createElement('p'));
    const ref = { current: el };
    renderHook(() => useStaggerReveal(ref));
    expect(gsapMock.set).toHaveBeenCalledWith(
      expect.objectContaining({ length: 1 }),
      expect.objectContaining({ opacity: 0 }),
    );
  });

  it('calls gsap.to when element becomes visible', () => {
    setupObserverMock();
    const el = document.createElement('div');
    el.appendChild(document.createElement('p'));
    const ref = { current: el };
    renderHook(() => useStaggerReveal(ref, { stagger: 0.15, duration: 0.5 }));
    triggerIntersecting();
    expect(gsapMock.to).toHaveBeenCalledWith(
      expect.objectContaining({ length: 1 }),
      expect.objectContaining({ opacity: 1, y: 0, duration: 0.5, stagger: 0.15 }),
    );
  });

  it('calls killTweensOf on unmount', () => {
    setupObserverMock();
    const el = document.createElement('div');
    el.appendChild(document.createElement('p'));
    const ref = { current: el };
    const { unmount } = renderHook(() => useStaggerReveal(ref));
    unmount();
    expect(gsapMock.killTweensOf).toHaveBeenCalled();
  });
});
