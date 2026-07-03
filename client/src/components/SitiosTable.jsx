import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { getStatus } from '../utils/status';

const SitioTableRow = memo(function SitioTableRow({ sitio, onRowClick, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const log = sitio.ultimoLog;

  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleRowClick = useCallback(() => {
    onRowClick(sitio.id);
  }, [onRowClick, sitio.id]);

  const handleMenuToggle = useCallback((e) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  }, []);

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation();
      onDelete(sitio.id);
      setMenuOpen(false);
    },
    [sitio, onDelete],
  );

  const status = getStatus(log);
  const latencyLabel =
    !log
      ? '\u2014'
      : !log.is_online
        ? 'Timeout'
        : log.latencia_ms != null
          ? `${log.latencia_ms}ms`
          : '\u2014';

  const latencyColor = status.color;

  const freqLabel = sitio.frecuencia_minutos != null ? `${sitio.frecuencia_minutos}m` : '\u2014';

  return (
    <tr className="db-table-row" onClick={handleRowClick} style={styles.row}>
      <td style={styles.td}>
        <div style={styles.statusCell}>
          <div style={{ ...styles.statusDot, backgroundColor: status.dotColor }} />
          <span style={{ color: status.color }}>{status.label}</span>
        </div>
      </td>
      <td style={{ ...styles.td, color: status.color, fontWeight: 500 }}>{sitio.nombre || sitio.url}</td>
      <td
        style={{ ...styles.td, ...styles.tdMono, color: 'var(--auth-on-surface-variant)' }}
        className="db-cell-tablet"
      >
        {sitio.url}
      </td>
      <td style={{ ...styles.td, ...styles.tdMono, ...styles.tdRight, color: latencyColor }}>{latencyLabel}</td>
      <td style={{ ...styles.td, ...styles.tdRight, color: 'var(--auth-on-surface-variant)' }} className="db-cell-desktop">
        {freqLabel}
      </td>
      <td style={{ ...styles.td, ...styles.tdCenter }}>
        <div style={styles.menuWrapper} ref={menuRef}>
          <button className="db-row-menu-btn" onClick={handleMenuToggle}>
            {'\u22EE'}
          </button>
          {menuOpen && (
            <div className="db-context-menu">
              <button className="db-context-menu-item" onClick={handleDelete}>
                {'\uD83D\uDDD1\uFE0F'} Eliminar
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
});

export function SitiosTable({ sitios, onRowClick, onDelete }) {
  return (
    <div style={styles.card} className="db-grid-card magic-glow-card">
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Active Monitors</h3>
        <button style={{ ...styles.viewAllBtn, opacity: 0.2, cursor: 'default', color: 'var(--auth-on-surface-variant)' }}>
          View All
        </button>
      </div>

      <div style={styles.tableWrapper} className="db-table-wrapper">
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Name</th>
              <th style={{ ...styles.th }} className="db-cell-tablet">
                URL
              </th>
              <th style={{ ...styles.th, ...styles.thRight }}>Latency</th>
              <th style={{ ...styles.th, ...styles.thRight }} className="db-cell-desktop">
                Freq
              </th>
              <th style={{ ...styles.th, ...styles.thCenter, width: '48px' }} />
            </tr>
          </thead>
          <tbody>
            {sitios.length === 0 ? (
              <tr>
                <td colSpan={6} style={styles.emptyCell}>
                  No monitored sites yet
                </td>
              </tr>
            ) : (
              sitios.map((sitio) => (
                <SitioTableRow key={sitio.id} sitio={sitio} onRowClick={onRowClick} onDelete={onDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--db-bg-card)',
    border: '1px solid var(--db-border-card)',
    borderRadius: '8px',
    padding: '16px',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--db-border-card)',
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--auth-on-surface)',
  },
  viewAllBtn: {
    background: 'none',
    border: 'none',
    fontFamily: 'inherit',
    fontSize: '14px',
  },
  tableWrapper: {
    flex: 1,
    overflow: 'auto',
    margin: '0 -16px',
    padding: '0 16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  headerRow: {
    borderBottom: '1px solid var(--db-border-table)',
  },
  th: {
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 400,
    color: 'var(--auth-on-surface-variant)',
    textTransform: 'uppercase',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  thRight: {
    textAlign: 'right',
  },
  thCenter: {
    textAlign: 'center',
  },
  row: {
    cursor: 'pointer',
  },
  td: {
    padding: '12px',
    color: 'var(--auth-on-surface)',
    whiteSpace: 'nowrap',
  },
  tdRight: {
    textAlign: 'right',
  },
  tdCenter: {
    textAlign: 'center',
  },
  tdMono: {
    fontFamily: "'Courier New', Courier, monospace",
  },
  statusCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  menuWrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  emptyCell: {
    padding: '32px 12px',
    textAlign: 'center',
    color: 'var(--auth-on-surface-variant)',
    fontStyle: 'italic',
  },
};
