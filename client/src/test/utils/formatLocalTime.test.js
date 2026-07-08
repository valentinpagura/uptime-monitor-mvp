import { describe, it, expect } from 'vitest';
import { toDate, formatLocalTime, formatLocalDate, formatLocalDateTime, formatLocalChartTime } from '../../utils/formatLocalTime';

const REFERENCE_DATE = '2025-01-15T14:30:00Z';

describe('toDate', () => {
  it('returns null for null input', () => {
    expect(toDate(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(toDate(undefined)).toBeNull();
  });

  it('returns null for empty string input', () => {
    expect(toDate('')).toBeNull();
  });

  it('parses UTC timestamp ending with Z', () => {
    const d = toDate(REFERENCE_DATE);
    expect(d).toBeInstanceOf(Date);
    expect(d.getTime()).toBeGreaterThan(0);
  });

  it('parses timestamp with positive timezone offset', () => {
    const d = toDate('2025-01-15T14:30:00+03:00');
    expect(d).toBeInstanceOf(Date);
    expect(d.toISOString()).toBe('2025-01-15T11:30:00.000Z');
  });

  it('parses timestamp with negative timezone offset', () => {
    const d = toDate('2025-01-15T14:30:00-03:00');
    expect(d).toBeInstanceOf(Date);
    expect(d.toISOString()).toBe('2025-01-15T17:30:00.000Z');
  });

  it('parses timestamp without timezone by appending Z', () => {
    const d = toDate('2025-01-15T14:30:00');
    expect(d).toBeInstanceOf(Date);
    expect(d.toISOString()).toBe('2025-01-15T14:30:00.000Z');
  });

  it('parses space-separated datetime by replacing space with T', () => {
    const d = toDate('2025-01-15 14:30:00');
    expect(d).toBeInstanceOf(Date);
    expect(d.toISOString()).toBe('2025-01-15T14:30:00.000Z');
  });

  it('parses timestamp with milliseconds and Z', () => {
    const d = toDate('2025-01-15T14:30:00.123Z');
    expect(d).toBeInstanceOf(Date);
    expect(d.getMilliseconds()).toBe(123);
  });

  it('parses timestamp with milliseconds and offset', () => {
    const d = toDate('2025-01-15T14:30:00.456+01:00');
    expect(d).toBeInstanceOf(Date);
    expect(d.toISOString()).toBe('2025-01-15T13:30:00.456Z');
  });
});

describe('formatLocalTime', () => {
  it('returns empty string for null input', () => {
    expect(formatLocalTime(null)).toBe('');
  });

  it('returns empty string for undefined input', () => {
    expect(formatLocalTime(undefined)).toBe('');
  });

  it('returns formatted time string for valid date', () => {
    const result = formatLocalTime(REFERENCE_DATE);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('merges custom options with defaults', () => {
    const result = formatLocalTime(REFERENCE_DATE, { second: '2-digit' });
    expect(result).toBeTruthy();
    expect(result.split(':').length).toBeGreaterThanOrEqual(3);
  });

  it('formats time as es-AR locale', () => {
    const result = formatLocalTime(REFERENCE_DATE);
    expect(result).toMatch(/\d{2}:/);
  });
});

describe('formatLocalDate', () => {
  it('returns empty string for null input', () => {
    expect(formatLocalDate(null)).toBe('');
  });

  it('returns empty string for undefined input', () => {
    expect(formatLocalDate(undefined)).toBe('');
  });

  it('returns formatted date string for valid date', () => {
    const result = formatLocalDate(REFERENCE_DATE);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('returns date with numeric year, month, and day', () => {
    const result = formatLocalDate(REFERENCE_DATE);
    expect(result).toMatch(/\d{4}/);
    expect(result).toMatch(/\d{2}/);
  });
});

describe('formatLocalDateTime', () => {
  it('returns empty string for null input', () => {
    expect(formatLocalDateTime(null)).toBe('');
  });

  it('returns empty string for undefined input', () => {
    expect(formatLocalDateTime(undefined)).toBe('');
  });

  it('returns formatted date-time string for valid date', () => {
    const result = formatLocalDateTime(REFERENCE_DATE);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('includes year, month, day, hour, minute, and second', () => {
    const result = formatLocalDateTime(REFERENCE_DATE);
    expect(result).toMatch(/\d{4}/);
    expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
  });
});

describe('formatLocalChartTime', () => {
  it('returns empty string for null input', () => {
    expect(formatLocalChartTime(null)).toBe('');
  });

  it('returns empty string for undefined input', () => {
    expect(formatLocalChartTime(undefined)).toBe('');
  });

  it('returns formatted time string for valid date', () => {
    const result = formatLocalChartTime(REFERENCE_DATE);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('returns time with hours and minutes', () => {
    const result = formatLocalChartTime(REFERENCE_DATE);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});
