import { describe, it, expect } from 'vitest';
import { getStatus } from '../../utils/status';

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
