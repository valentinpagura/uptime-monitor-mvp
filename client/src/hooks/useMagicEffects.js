import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useMobileDetection } from './useMobileDetection';
import {
  createParticleElement,
  DEFAULT_PARTICLE_COUNT,
  DEFAULT_GLOW_COLOR,
} from '../utils/glow';

export function useMagicEffects(ref, options = {}) {
  const {
    enableStars = true,
    enableTilt = true,
    enableMagnetism = true,
    clickEffect = true,
    particleCount = DEFAULT_PARTICLE_COUNT,
    glowColor = DEFAULT_GLOW_COLOR,
  } = options;

  const isMobile = useMobileDetection();
  const s = useRef({
    isHovered: false,
    particles: [],
    timeouts: [],
    memoizedParticles: [],
    particlesInitialized: false,
    magnetismTween: null,
  }).current;

  useEffect(() => {
    if (isMobile || !ref.current) return;
    const el = ref.current;

    function clearParticles() {
      s.timeouts.forEach(clearTimeout);
      s.timeouts = [];
      s.magnetismTween?.kill();
      s.particles.forEach((p) => {
        gsap.to(p, {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'back.in(1.7)',
          onComplete: () => p.parentNode?.removeChild(p),
        });
      });
      s.particles = [];
    }

    function initParticles() {
      if (s.particlesInitialized || !enableStars) return;
      const { width, height } = el.getBoundingClientRect();
      s.memoizedParticles = Array.from({ length: particleCount }, () =>
        createParticleElement(Math.random() * width, Math.random() * height, glowColor),
      );
      s.particlesInitialized = true;
    }

    function animateParticles() {
      if (!enableStars) return;
      if (!s.particlesInitialized) initParticles();
      s.memoizedParticles.forEach((particle, i) => {
        const tid = setTimeout(() => {
          if (!s.isHovered) return;
          const clone = particle.cloneNode(true);
          el.appendChild(clone);
          s.particles.push(clone);
          gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
          gsap.to(clone, {
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
            rotation: Math.random() * 360,
            duration: 2 + Math.random() * 2,
            ease: 'none',
            repeat: -1,
            yoyo: true,
          });
          gsap.to(clone, {
            opacity: 0.3,
            duration: 1.5,
            ease: 'power2.inOut',
            repeat: -1,
            yoyo: true,
          });
        }, i * 100);
        s.timeouts.push(tid);
      });
    }

    function onEnter() {
      s.isHovered = true;
      animateParticles();
      if (enableTilt) {
        gsap.to(el, { rotateX: 3, rotateY: 3, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 });
      }
    }

    function onLeave() {
      s.isHovered = false;
      clearParticles();
      if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
      if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
    }

    function onMove(e) {
      if (!enableTilt && !enableMagnetism) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      if (enableTilt) {
        gsap.to(el, {
          rotateX: ((y - cy) / cy) * -6,
          rotateY: ((x - cx) / cx) * 6,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000,
        });
      }
      if (enableMagnetism) {
        s.magnetismTween = gsap.to(el, {
          x: (x - cx) * 0.05,
          y: (y - cy) * 0.05,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    }

    function onClick(e) {
      if (!clickEffect) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDist = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height),
      );
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDist * 2}px;
        height: ${maxDist * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDist}px;
        top: ${y - maxDist}px;
        pointer-events: none;
        z-index: 1000;
      `;
      el.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove(),
        },
      );
    }

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('click', onClick);

    return () => {
      s.isHovered = false;
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('click', onClick);
      clearParticles();
    };
  }, [isMobile, enableStars, enableTilt, enableMagnetism, clickEffect, particleCount, glowColor, ref, s]);
}
