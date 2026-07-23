import { describe, it, expect } from 'vitest';
import { getStatus, formatLatency, getLatencyVariant, getTrend, getTrendColor, getTrendIcon, formatTrend } from '../../utils/status';

describe('getStatus', () => {
  it('returns PENDING when log is null', () => {
    const result = getStatus(null);
    expect(result).toEqual({
      label: 'PENDING',
      color: 'var(--db-outline-variant)',
      dotColor: 'var(--db-outline-variant)',
    });
  });

  it('returns PENDING when log is undefined', () => {
    const result = getStatus(undefined);
    expect(result.label).toBe('PENDING');
  });

  it('returns DOWN when log.is_online is false', () => {
    const log = { is_online: false, latencia_ms: null };
    const result = getStatus(log);
    expect(result).toEqual({
      label: 'DOWN',
      color: 'var(--auth-error)',
      dotColor: 'var(--auth-error)',
    });
  });

  it('returns SLOW when latencia_ms >= 400 and online', () => {
    const log = { is_online: true, latencia_ms: 450 };
    const result = getStatus(log);
    expect(result).toEqual({
      label: 'SLOW',
      color: 'var(--auth-error)',
      dotColor: 'var(--auth-error)',
    });
  });

  it('returns SLOW when latencia_ms is exactly 400 and online', () => {
    const log = { is_online: true, latencia_ms: 400 };
    const result = getStatus(log);
    expect(result.label).toBe('SLOW');
  });

  it('returns WARN when latencia_ms is between 200 and 399 and online', () => {
    const log = { is_online: true, latencia_ms: 250 };
    const result = getStatus(log);
    expect(result).toEqual({
      label: 'WARN',
      color: 'var(--db-tertiary)',
      dotColor: 'var(--db-tertiary)',
    });
  });

  it('returns WARN when latencia_ms is exactly 200 and online', () => {
    const log = { is_online: true, latencia_ms: 200 };
    const result = getStatus(log);
    expect(result.label).toBe('WARN');
  });

  it('returns UP when latencia_ms is 0 and online', () => {
    const log = { is_online: true, latencia_ms: 0 };
    const result = getStatus(log);
    expect(result.label).toBe('UP');
  });

  it('returns UP when latencia_ms is null but is_online is true', () => {
    const log = { is_online: true, latencia_ms: null };
    const result = getStatus(log);
    expect(result.label).toBe('UP');
  });

  it('returns UP when latencia_ms is very low and online', () => {
    const log = { is_online: true, latencia_ms: 15 };
    const result = getStatus(log);
    expect(result.label).toBe('UP');
  });

  it('returns DOWN when is_online is false even with low latency', () => {
    const log = { is_online: false, latencia_ms: 50 };
    const result = getStatus(log);
    expect(result.label).toBe('DOWN');
  });
});

describe('formatLatency', () => {
  it('returns em dash for null log', () => {
    expect(formatLatency(null)).toBe('\u2014');
  });

  it('returns em dash for undefined log', () => {
    expect(formatLatency(undefined)).toBe('\u2014');
  });

  it('returns Timeout for offline site', () => {
    expect(formatLatency({ is_online: false, latencia_ms: null })).toBe('Timeout');
  });

  it('returns latency in ms for online site with latency', () => {
    expect(formatLatency({ is_online: true, latencia_ms: 120 })).toBe('120ms');
  });

  it('returns em dash for online site with null latency', () => {
    expect(formatLatency({ is_online: true, latencia_ms: null })).toBe('\u2014');
  });

  it('returns 0ms for zero latency', () => {
    expect(formatLatency({ is_online: true, latencia_ms: 0 })).toBe('0ms');
  });
});

describe('getLatencyVariant', () => {
  it('returns neutral for null log', () => {
    expect(getLatencyVariant(null)).toBe('neutral');
  });

  it('returns error for offline site', () => {
    expect(getLatencyVariant({ is_online: false, latencia_ms: null })).toBe('error');
  });

  it('returns error for slow site (>= 400ms)', () => {
    expect(getLatencyVariant({ is_online: true, latencia_ms: 500 })).toBe('error');
  });

  it('returns warning for warn site (200-399ms)', () => {
    expect(getLatencyVariant({ is_online: true, latencia_ms: 250 })).toBe('warning');
  });

  it('returns primary for fast site (< 200ms)', () => {
    expect(getLatencyVariant({ is_online: true, latencia_ms: 50 })).toBe('primary');
  });

  it('returns primary for online site with null latency', () => {
    expect(getLatencyVariant({ is_online: true, latencia_ms: null })).toBe('primary');
  });
});

describe('getTrend', () => {
  it('returns null when current is null', () => {
    expect(getTrend(null, 100)).toBeNull();
  });

  it('returns null when previous is null', () => {
    expect(getTrend(100, null)).toBeNull();
  });

  it('returns null when previous is 0', () => {
    expect(getTrend(100, 0)).toBeNull();
  });

  it('returns up when current > previous', () => {
    const trend = getTrend(150, 100);
    expect(trend.direccion).toBe('up');
    expect(trend.porcentaje).toBe(50);
    expect(trend.valor).toBe(150);
    expect(trend.anterior).toBe(100);
  });

  it('returns down when current < previous', () => {
    const trend = getTrend(80, 100);
    expect(trend.direccion).toBe('down');
    expect(trend.porcentaje).toBe(20);
  });

  it('returns stable when current equals previous', () => {
    const trend = getTrend(100, 100);
    expect(trend.direccion).toBe('stable');
    expect(trend.porcentaje).toBe(0);
  });

  it('rounds percentage correctly', () => {
    const trend = getTrend(33, 100);
    expect(trend.porcentaje).toBe(67);
  });
});

describe('getTrendColor', () => {
  it('returns error color for up trend', () => {
    expect(getTrendColor({ direccion: 'up' })).toBe('var(--auth-error)');
  });

  it('returns primary color for down trend', () => {
    expect(getTrendColor({ direccion: 'down' })).toBe('var(--auth-primary)');
  });

  it('returns muted color for stable trend', () => {
    expect(getTrendColor({ direccion: 'stable' })).toBe('var(--auth-on-surface-variant)');
  });

  it('returns muted color for null trend', () => {
    expect(getTrendColor(null)).toBe('var(--auth-on-surface-variant)');
  });
});

describe('getTrendIcon', () => {
  it('returns up arrow for up direction', () => {
    expect(getTrendIcon({ direccion: 'up' })).toBe('\u2191');
  });

  it('returns down arrow for down direction', () => {
    expect(getTrendIcon({ direccion: 'down' })).toBe('\u2193');
  });

  it('returns right arrow for stable direction', () => {
    expect(getTrendIcon({ direccion: 'stable' })).toBe('\u2192');
  });

  it('returns right arrow for null trend', () => {
    expect(getTrendIcon(null)).toBe('\u2192');
  });
});

describe('formatTrend', () => {
  it('returns em dash for null trend', () => {
    expect(formatTrend(null)).toBe('\u2014');
  });

  it('formats up trend with arrow and percentage', () => {
    const trend = { direccion: 'up', porcentaje: 15 };
    expect(formatTrend(trend)).toBe('\u2191 15%');
  });

  it('formats down trend with arrow and percentage', () => {
    const trend = { direccion: 'down', porcentaje: 8 };
    expect(formatTrend(trend)).toBe('\u2193 8%');
  });

  it('formats stable trend', () => {
    const trend = { direccion: 'stable', porcentaje: 0 };
    expect(formatTrend(trend)).toBe('\u2192 0%');
  });
});
