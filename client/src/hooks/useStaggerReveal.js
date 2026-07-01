import { useEffect } from 'react';
import { gsap } from 'gsap';

export function useStaggerReveal(ref, options = {}) {
  const {
    stagger = 0.08,
    duration = 0.4,
    fromY = 16,
    threshold = 0.1,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const children = el.children;
    if (children.length === 0) return;

    gsap.set(children, { opacity: 0, y: fromY });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(children, {
            opacity: 1,
            y: 0,
            duration,
            stagger,
            ease: 'power2.out',
            overwrite: 'auto',
          });
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      gsap.killTweensOf(children);
    };
  }, [ref, stagger, duration, fromY, threshold]);
}
