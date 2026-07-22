const TZ_OFFSET_RE = /[+-]\d{2}:\d{2}$/;

export function toDate(dateString) {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  if (dateString.endsWith('Z') || TZ_OFFSET_RE.test(dateString)) {
    return new Date(dateString);
  }
  return new Date(dateString.replace(' ', 'T') + 'Z');
}

export function formatLocalTime(dateString, options = {}) {
  const d = toDate(dateString);
  if (!d) return '';
  return d.toLocaleString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

export function formatLocalDate(dateString) {
  const d = toDate(dateString);
  if (!d) return '';
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatLocalDateTime(dateString) {
  const d = toDate(dateString);
  if (!d) return '';
  return d.toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatLocalChartTime(dateString) {
  const d = toDate(dateString);
  if (!d) return '';
  return d.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
