import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../../services/api', () => ({
  getDashboardSummary: vi.fn(),
}));

import { useDashboardData } from '../../hooks/useDashboardData';
import { getDashboardSummary } from '../../services/api';

const mockSummaryData = {
  range: '24h',
  totalSitios: 3,
  totalChequeos: 150,
  resumen: {
    passing: 2,
    warning: 1,
    slow: 0,
    down: 0,
    sinDatos: 0,
    promedioGlobal: 150,
    uptimeGlobal: 97,
    minLatencia: 10,
    maxLatencia: 500,
  },
  tendencias: {
    promedioGlobal: { direccion: 'up', porcentaje: 10 },
    uptimeGlobal: { direccion: 'down', porcentaje: 2 },
    totalChequeos: { direccion: 'up', porcentaje: 5 },
  },
  sitios: [
    { id: 1, url: 'https://a.com', nombre: 'A', avgLatencia: 100, uptime: 100, totalChequeos: 50, clasificacion: 'passing' },
    { id: 2, url: 'https://b.com', nombre: 'B', avgLatencia: 200, uptime: 100, totalChequeos: 50, clasificacion: 'warning' },
    { id: 3, url: 'https://c.com', nombre: 'C', avgLatencia: 150, uptime: 90, totalChequeos: 50, clasificacion: 'down' },
  ],
};

describe('useDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    getDashboardSummary.mockResolvedValue(mockSummaryData);

    const { result } = renderHook(() => useDashboardData('token'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('fetches dashboard data on mount and sets data', async () => {
    getDashboardSummary.mockResolvedValue(mockSummaryData);

    const { result } = renderHook(() => useDashboardData('token'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getDashboardSummary).toHaveBeenCalledWith('token', '24h');
    expect(result.current.data).toEqual(mockSummaryData);
    expect(result.current.resumen).toEqual(mockSummaryData.resumen);
    expect(result.current.sitios).toHaveLength(3);
    expect(result.current.totalSitios).toBe(3);
    expect(result.current.totalChequeos).toBe(150);
  });

  it('uses custom default range', async () => {
    getDashboardSummary.mockResolvedValue(mockSummaryData);

    renderHook(() => useDashboardData('token', { defaultRange: '7d' }));

    await waitFor(() => {
      expect(getDashboardSummary).toHaveBeenCalledWith('token', '7d');
    });
  });

  it('sets error when fetch fails', async () => {
    getDashboardSummary.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useDashboardData('token'));

    await waitFor(() => {
      expect(result.current.error).toBe('API Error');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('changeRange updates range and refetches', async () => {
    getDashboardSummary.mockResolvedValue(mockSummaryData);

    const { result } = renderHook(() => useDashboardData('token'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newData = { ...mockSummaryData, range: '7d', totalSitios: 5 };
    getDashboardSummary.mockResolvedValue(newData);

    act(() => {
      result.current.setRange('7d');
    });

    expect(result.current.range).toBe('7d');

    await waitFor(() => {
      expect(getDashboardSummary).toHaveBeenCalledWith('token', '7d');
    });
  });

  it('refresh triggers refetch with current range', async () => {
    getDashboardSummary.mockResolvedValue(mockSummaryData);

    const { result } = renderHook(() => useDashboardData('token'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    getDashboardSummary.mockResolvedValue({ ...mockSummaryData, totalSitios: 10 });

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(getDashboardSummary).toHaveBeenCalledTimes(2);
    });
  });

  it('returns empty arrays and defaults when data is null', () => {
    getDashboardSummary.mockResolvedValue(null);

    const { result } = renderHook(() => useDashboardData('token'));

    expect(result.current.sitios).toEqual([]);
    expect(result.current.resumen).toBeNull();
    expect(result.current.tendencias).toBeNull();
    expect(result.current.totalSitios).toBe(0);
    expect(result.current.totalChequeos).toBe(0);
  });

  it('exposes tendencias from data', async () => {
    getDashboardSummary.mockResolvedValue(mockSummaryData);

    const { result } = renderHook(() => useDashboardData('token'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tendencias).toEqual(mockSummaryData.tendencias);
    expect(result.current.tendencias.promedioGlobal.direccion).toBe('up');
  });
});
