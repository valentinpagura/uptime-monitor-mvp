import { memo, useMemo, useRef, useEffect } from 'react';
import { getStatus } from '../utils/status';

export const SearchDropdown = memo(function SearchDropdown({ query, sitios, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!query) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [query, onClose]);

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return sitios.filter(
      (s) => (s.nombre && s.nombre.toLowerCase().includes(q)) || s.url.toLowerCase().includes(q)
    );
  }, [sitios, query]);

  if (!query || results.length === 0) return null;

  return (
    <div ref={ref} style={styles.dropdown}>
      {results.map((sitio) => {
        const log = sitio.ultimoLog;
        const status = getStatus(log);
        const latencyLabel = !log ? '\u2014' : !log.is_online ? 'Timeout' : log.latencia_ms != null ? `${log.latencia_ms}ms` : '\u2014';
        return (
          <div key={sitio.id} className="db-search-dropdown-item" style={styles.item} onClick={() => onSelect(sitio.id)}>
            <div style={styles.itemLeft}>
              <div style={{ ...styles.dot, backgroundColor: status.dotColor }} />
              <div>
                <div style={styles.itemName}>{sitio.nombre || sitio.url}</div>
                <div style={styles.itemUrl}>{sitio.url}</div>
              </div>
            </div>
            <span style={{ ...styles.itemLatency, color: status.color }}>{latencyLabel}</span>
          </div>
        );
      })}
    </div>
  );
});

const styles = {
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'var(--db-surface-container-low)',
    border: '1px solid var(--db-outline-variant)',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    zIndex: 1000,
    maxHeight: '300px',
    overflowY: 'auto',
    marginTop: '4px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  itemName: {
    fontSize: '14px',
    color: '#e6e0e9',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemUrl: {
    fontSize: '11px',
    color: 'var(--auth-on-surface-variant)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemLatency: {
    fontSize: '13px',
    fontWeight: 500,
    flexShrink: 0,
    marginLeft: '12px',
  },
};
