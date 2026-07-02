import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';

describe('useDashboardMetrics', () => {
  it('returns all zeros and null avgLatencia when sitios is empty', () => {
    const { result } = renderHook(() => useDashboardMetrics([]));
    expect(result.current.kpis).toEqual({
      passing: 0,
      warnings: 0,
      failed: 0,
      avgLatencia: null,
    });
  });

  it('returns null avgLatencia when no site has logs', () => {
    const sitios = [
      { id: 1, ultimoLog: null },
      { id: 2, ultimoLog: null },
    ];
    const { result } = renderHook(() => useDashboardMetrics(sitios));
    expect(result.current.kpis.avgLatencia).toBeNull();
    expect(result.current.kpis.passing).toBe(0);
    expect(result.current.kpis.failed).toBe(0);
    expect(result.current.kpis.warnings).toBe(0);
  });

  it('counts passing sites correctly', () => {
    const sitios = [
      { id: 1, ultimoLog: { is_online: true, latencia_ms: 100 } },
      { id: 2, ultimoLog: { is_online: true, latencia_ms: 200 } },
      { id: 3, ultimoLog: { is_online: true, latencia_ms: 50 } },
    ];
    const { result } = renderHook(() => useDashboardMetrics(sitios));
    expect(result.current.kpis.passing).toBe(3);
    expect(result.current.kpis.warnings).toBe(0);
    expect(result.current.kpis.failed).toBe(0);
  });

  it('counts warnings when latency > 400', () => {
    const sitios = [
      { id: 1, ultimoLog: { is_online: true, latencia_ms: 100 } },
      { id: 2, ultimoLog: { is_online: true, latencia_ms: 500 } },
      { id: 3, ultimoLog: { is_online: true, latencia_ms: 401 } },
    ];
    const { result } = renderHook(() => useDashboardMetrics(sitios));
    expect(result.current.kpis.passing).toBe(1);
    expect(result.current.kpis.warnings).toBe(2);
    expect(result.current.kpis.failed).toBe(0);
  });

  it('counts failed when is_online is false', () => {
    const sitios = [
      { id: 1, ultimoLog: { is_online: true, latencia_ms: 100 } },
      { id: 2, ultimoLog: { is_online: false, latencia_ms: null } },
      { id: 3, ultimoLog: { is_online: false, latencia_ms: 200 } },
    ];
    const { result } = renderHook(() => useDashboardMetrics(sitios));
    expect(result.current.kpis.passing).toBe(1);
    expect(result.current.kpis.warnings).toBe(0);
    expect(result.current.kpis.failed).toBe(2);
  });

  it('computes avgLatencia from online sites with latency', () => {
    const sitios = [
      { id: 1, ultimoLog: { is_online: true, latencia_ms: 100 } },
      { id: 2, ultimoLog: { is_online: true, latencia_ms: 200 } },
      { id: 3, ultimoLog: { is_online: true, latencia_ms: 300 } },
    ];
    const { result } = renderHook(() => useDashboardMetrics(sitios));
    expect(result.current.kpis.avgLatencia).toBe(200);
  });

  it('averages only sites with non-null latencia_ms', () => {
    const sitios = [
      { id: 1, ultimoLog: { is_online: true, latencia_ms: 100 } },
      { id: 2, ultimoLog: { is_online: true, latencia_ms: null } },
      { id: 3, ultimoLog: { is_online: true, latencia_ms: 200 } },
    ];
    const { result } = renderHook(() => useDashboardMetrics(sitios));
    expect(result.current.kpis.avgLatencia).toBe(150);
  });

  it('rounds avgLatencia to nearest integer', () => {
    const sitios = [
      { id: 1, ultimoLog: { is_online: true, latencia_ms: 100 } },
      { id: 2, ultimoLog: { is_online: true, latencia_ms: 201 } },
    ];
    const { result } = renderHook(() => useDashboardMetrics(sitios));
    expect(result.current.kpis.avgLatencia).toBe(151);
  });

  it('excludes failed sites from avgLatencia', () => {
    const sitios = [
      { id: 1, ultimoLog: { is_online: false, latencia_ms: null } },
      { id: 2, ultimoLog: { is_online: true, latencia_ms: 100 } },
    ];
    const { result } = renderHook(() => useDashboardMetrics(sitios));
    expect(result.current.kpis.failed).toBe(1);
    expect(result.current.kpis.avgLatencia).toBe(100);
  });
});
