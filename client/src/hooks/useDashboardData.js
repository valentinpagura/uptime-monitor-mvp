import { useState, useCallback, useEffect, useRef } from 'react';
import { getDashboardSummary } from '../services/api';
import { usePolling } from './usePolling';

export function useDashboardData(token, options = {}) {
  const { defaultRange = '24h', pollingInterval = 10000 } = options;
  const [range, setRange] = useState(defaultRange);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const initialMountRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const result = await getDashboardSummary(token, range);
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Error al cargar datos del dashboard');
      }
      console.error('Error fetching dashboard data:', err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [token, range]);

  usePolling(fetchData, pollingInterval);

  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return;
    }
    setLoading(true);
    fetchData();
  }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const changeRange = useCallback((newRange) => {
    setRange(newRange);
  }, []);

  return {
    data,
    loading,
    error,
    refresh,
    range,
    setRange: changeRange,
    resumen: data?.resumen ?? null,
    tendencias: data?.tendencias ?? null,
    sitios: data?.sitios ?? [],
    totalSitios: data?.totalSitios ?? 0,
    totalChequeos: data?.totalChequeos ?? 0,
  };
}
