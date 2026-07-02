import { useMemo } from 'react';

function computeSiteMetrics(sitios) {
  let passing = 0;
  let warnings = 0;
  let failed = 0;
  let totalLatencia = 0;
  let latenciaCount = 0;

  for (let i = 0; i < sitios.length; i++) {
    const log = sitios[i].ultimoLog;
    if (!log) continue;

    if (!log.is_online) {
      failed++;
    } else if (log.latencia_ms != null && log.latencia_ms > 400) {
      warnings++;
    } else {
      passing++;
    }

    if (log.latencia_ms != null) {
      totalLatencia += log.latencia_ms;
      latenciaCount++;
    }
  }

  return {
    passing,
    warnings,
    failed,
    avgLatencia: latenciaCount > 0 ? Math.round(totalLatencia / latenciaCount) : null,
  };
}

export function useDashboardMetrics(sitios) {
  const kpis = useMemo(() => computeSiteMetrics(sitios), [sitios]);
  return { kpis };
}
