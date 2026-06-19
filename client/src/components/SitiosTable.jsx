import { useState } from 'react';

export function SitiosTable({ sitios, onSelect, onDelete, loadingLogs }) {
  const [deleting, setDeleting] = useState(null);

  async function handleDelete(e, sitio) {
    e.stopPropagation();
    if (!window.confirm(`Delete "${sitio.nombre || sitio.url}"?`)) return;
    setDeleting(sitio.id);
    try {
      await onDelete(sitio.id);
    } finally {
      setDeleting(null);
    }
  }

  function getStatus(sitio) {
    const log = loadingLogs[sitio.id];
    if (!log) return { label: 'Pending', color: 'var(--text-tertiary)', pulse: true };
    if (log.is_online) return { label: 'Online', color: 'var(--success)', pulse: false };
    return { label: 'Offline', color: 'var(--error)', pulse: false };
  }

  function getLatencyColor(latencia) {
    if (latencia < 200) return 'var(--success)';
    if (latencia < 400) return 'var(--warning)';
    return 'var(--error)';
  }

  if (sitios.length === 0) {
    return (
      <div style={styles.emptyWrapper}>
        <span style={styles.emptyIcon}>🌐</span>
        <p style={styles.emptyTitle}>No sites monitored yet</p>
        <p style={styles.emptyHint}>Add your first site above to start monitoring</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>URL</th>
            <th style={styles.th}>Latency</th>
            <th style={styles.th}>Interval</th>
            <th style={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {sitios.map((sitio, i) => {
            const status = getStatus(sitio);
            const log = loadingLogs[sitio.id];
            const isOdd = i % 2 === 1;
            return (
              <tr
                key={sitio.id}
                onClick={() => onSelect(sitio.id)}
                style={{
                  ...styles.tr,
                  background: isOdd ? 'var(--bg-elevated)' : 'transparent',
                }}
              >
                <td style={styles.td}>
                  <div style={styles.statusRow}>
                    <span style={{
                      ...styles.dot,
                      background: status.color,
                      animation: status.pulse ? 'pulse-ring 2s ease-out infinite' : 'none',
                    }} />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: status.color }}>
                      {status.label}
                    </span>
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={styles.name}>{sitio.nombre || sitio.url}</span>
                </td>
                <td style={{ ...styles.td, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={styles.url}>{sitio.url}</span>
                </td>
                <td style={styles.td}>
                  {log ? (
                    <span style={{
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: getLatencyColor(log.latencia_ms),
                    }}>
                      {log.latencia_ms}<span style={{ fontWeight: 400, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>ms</span>
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}>—</span>
                  )}
                </td>
                <td style={styles.td}>
                  <span style={styles.badge}>{sitio.frecuencia_minutos}m</span>
                </td>
                <td style={styles.td}>
                  <button
                    onClick={(e) => handleDelete(e, sitio)}
                    disabled={deleting === sitio.id}
                    style={styles.deleteBtn}
                    title="Delete site"
                  >
                    {deleting === sitio.id ? (
                      <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid var(--border-default)', borderTopColor: 'var(--text-tertiary)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  wrapper: {
    overflowX: 'auto',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    borderBottom: '1px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
  },
  tr: {
    cursor: 'pointer',
    transition: 'background var(--transition-fast)',
    borderBottom: '1px solid var(--border-subtle)',
  },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    color: 'var(--text-primary)',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  dot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  name: {
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  url: {
    color: 'var(--text-tertiary)',
    fontSize: '12px',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-tertiary)',
    background: 'var(--bg-elevated)',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
    opacity: 0.4,
  },
  emptyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '56px 32px',
    gap: '8px',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px dashed var(--border-default)',
  },
  emptyIcon: {
    fontSize: '36px',
    opacity: 0.3,
    marginBottom: '4px',
  },
  emptyTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  emptyHint: {
    fontSize: '12px',
    color: 'var(--text-disabled)',
    margin: 0,
  },
};
