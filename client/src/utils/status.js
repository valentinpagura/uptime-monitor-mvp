export function getStatus(log) {
  if (!log) return { label: 'PENDING', color: 'var(--db-outline-variant)', dotColor: 'var(--db-outline-variant)' };
  if (!log.is_online) return { label: 'DOWN', color: 'var(--auth-error)', dotColor: 'var(--auth-error)' };
  if (log.latencia_ms != null && log.latencia_ms >= 400) return { label: 'SLOW', color: 'var(--auth-error)', dotColor: 'var(--auth-error)' };
  if (log.latencia_ms != null && log.latencia_ms >= 200) return { label: 'WARN', color: 'var(--db-tertiary)', dotColor: 'var(--db-tertiary)' };
  return { label: 'UP', color: 'var(--auth-primary)', dotColor: 'var(--auth-primary)' };
}
