export const STATUS_THRESHOLDS = {
  UP_LATENCY: 200,
  WARN_LATENCY: 200,
  SLOW_LATENCY: 400,
  DOWN_UPTIME: 0.99,
};

export function getStatus(log) {
  if (!log) return { label: 'PENDING', color: 'var(--db-outline-variant)', dotColor: 'var(--db-outline-variant)' };
  if (!log.is_online) return { label: 'DOWN', color: 'var(--auth-error)', dotColor: 'var(--auth-error)' };
  if (log.latencia_ms != null && log.latencia_ms >= STATUS_THRESHOLDS.SLOW_LATENCY) return { label: 'SLOW', color: 'var(--auth-error)', dotColor: 'var(--auth-error)' };
  if (log.latencia_ms != null && log.latencia_ms >= STATUS_THRESHOLDS.WARN_LATENCY) return { label: 'WARN', color: 'var(--db-tertiary)', dotColor: 'var(--db-tertiary)' };
  return { label: 'UP', color: 'var(--auth-primary)', dotColor: 'var(--auth-primary)' };
}

export function formatLatency(log) {
  if (!log) return '\u2014';
  if (!log.is_online) return 'Timeout';
  if (log.latencia_ms != null) return `${log.latencia_ms}ms`;
  return '\u2014';
}

export function getLatencyVariant(log) {
  if (!log) return 'neutral';
  if (!log.is_online) return 'error';
  if (log.latencia_ms != null && log.latencia_ms >= STATUS_THRESHOLDS.SLOW_LATENCY) return 'error';
  if (log.latencia_ms != null && log.latencia_ms >= STATUS_THRESHOLDS.WARN_LATENCY) return 'warning';
  return 'primary';
}

export function getTrend(current, previous) {
  if (current == null || previous == null || previous === 0) return null;
  const diff = current - previous;
  const pct = Math.round((diff / previous) * 100);
  return {
    direccion: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
    porcentaje: Math.abs(pct),
    valor: current,
    anterior: previous,
  };
}

export function getTrendColor(trend) {
  if (!trend) return 'var(--auth-on-surface-variant)';
  if (trend.direccion === 'up') return 'var(--auth-error)';
  if (trend.direccion === 'down') return 'var(--auth-primary)';
  return 'var(--auth-on-surface-variant)';
}

export function getTrendIcon(trend) {
  if (!trend || trend.direccion === 'stable') return '\u2192';
  if (trend.direccion === 'up') return '\u2191';
  return '\u2193';
}

export function formatTrend(trend) {
  if (!trend) return '\u2014';
  if (trend.direccion === 'stable') return `${getTrendIcon(trend)} 0%`;
  return `${getTrendIcon(trend)} ${trend.porcentaje}%`;
}

const CLASSIFICATION_MAP = {
  passing: { label: 'UP', color: 'var(--auth-primary)', dotColor: 'var(--auth-primary)' },
  warning: { label: 'WARN', color: 'var(--db-tertiary)', dotColor: 'var(--db-tertiary)' },
  slow: { label: 'SLOW', color: 'var(--auth-error)', dotColor: 'var(--auth-error)' },
  down: { label: 'DOWN', color: 'var(--auth-error)', dotColor: 'var(--auth-error)' },
  sin_datos: { label: 'PENDING', color: 'var(--db-outline-variant)', dotColor: 'var(--db-outline-variant)' },
};

export function getClassificationStatus(clasificacion) {
  return CLASSIFICATION_MAP[clasificacion] || CLASSIFICATION_MAP.sin_datos;
}

export function formatClassificationLatency(sitio) {
  if (!sitio || sitio.clasificacion === 'sin_datos' || sitio.totalChequeos === 0) return '\u2014';
  if (sitio.avgLatencia != null) return `${sitio.avgLatencia}ms`;
  return '\u2014';
}
