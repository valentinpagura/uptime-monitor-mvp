export const DEFAULT_GLOW_COLOR = '207, 188, 255';
export const DEFAULT_SPOTLIGHT_RADIUS = 300;
export const DEFAULT_PARTICLE_COUNT = 12;
export const MOBILE_BREAKPOINT = 768;

export function calculateSpotlightValues(radius) {
  return {
    proximity: radius * 0.5,
    fadeDistance: radius * 0.75,
  };
}

export function updateCardGlowProperties(card, mouseX, mouseY, glow, radius) {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
}

export function createParticleElement(x, y, color = DEFAULT_GLOW_COLOR) {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
}
