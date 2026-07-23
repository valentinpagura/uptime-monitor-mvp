import { useState, useEffect, useCallback, memo, useRef, useMemo } from 'react';
import { getStatus, getClassificationStatus, formatLatency, formatClassificationLatency } from '../utils/status';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'passing', label: 'Passing' },
  { key: 'warning', label: 'Warning' },
  { key: 'slow', label: 'Slow' },
  { key: 'down', label: 'Down' },
  { key: 'sin_datos', label: 'Sin datos' },
];

const SitioTableRow = memo(function SitioTableRow({ sitio, onRowClick, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const hasClassification = 'clasificacion' in sitio;

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

  const status = hasClassification
    ? getClassificationStatus(sitio.clasificacion)
    : getStatus(sitio.ultimoLog);

  const latencyLabel = hasClassification
    ? formatClassificationLatency(sitio)
    : formatLatency(sitio.ultimoLog);

  const freqLabel = sitio.frecuenciaMinutos != null
    ? `${sitio.frecuenciaMinutos}m`
    : sitio.frecuencia_minutos != null
      ? `${sitio.frecuencia_minutos}m`
      : '\u2014';

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
      <td style={{ ...styles.td, ...styles.tdMono, ...styles.tdRight, color: status.color }}>{latencyLabel}</td>
      <td style={{ ...styles.td, ...styles.tdRight, color: 'var(--auth-on-surface-variant)' }} className="db-cell-desktop">
        {freqLabel}
      </td>
      <td style={{ ...styles.td, ...styles.tdCenter }}>
        <div style={styles.menuWrapper} ref={menuRef}>
          <button className="db-row-menu-btn" onClick={handleMenuToggle} aria-label="Row actions">
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

export function SitiosTable({ sitios, onRowClick, onDelete, searchQuery }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const getSortIndicator = useCallback(
    (key) => {
      if (sortConfig.key !== key) return '';
      return sortConfig.direction === 'asc' ? ' \u25B2' : ' \u25BC';
    },
    [sortConfig],
  );

  const filtered = useMemo(() => {
    let result = [...sitios];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => (s.nombre && s.nombre.toLowerCase().includes(q)) || s.url.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== 'all') {
      const clasificacion = statusFilter;
      result = result.filter((s) => s.clasificacion === clasificacion);
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let cmp = 0;
        switch (sortConfig.key) {
          case 'name':
            cmp = (a.nombre || a.url).localeCompare(b.nombre || b.url);
            break;
          case 'status':
            cmp = (a.clasificacion || 'sin_datos').localeCompare(b.clasificacion || 'sin_datos');
            break;
          case 'latency':
            cmp = (a.avgLatencia ?? Infinity) - (b.avgLatencia ?? Infinity);
            break;
          case 'frequency':
            const fa = a.frecuenciaMinutos ?? a.frecuencia_minutos ?? Infinity;
            const fb = b.frecuenciaMinutos ?? b.frecuencia_minutos ?? Infinity;
            cmp = fa - fb;
            break;
        }
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [sitios, searchQuery, statusFilter, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginatedSitios = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handlePerPageChange = useCallback((e) => {
    setPerPage(Number(e.target.value));
    setCurrentPage(1);
  }, []);

  const countsByStatus = useMemo(() => {
    const counts = {};
    sitios.forEach((s) => {
      const key = s.clasificacion || 'sin_datos';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [sitios]);

  return (
    <div style={styles.card} className="db-grid-card magic-glow-card">
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Active Monitors</h3>
        <button style={{ ...styles.viewAllBtn, opacity: 0.2, cursor: 'default', color: 'var(--auth-on-surface-variant)' }}>
          View All
        </button>
      </div>

      {sitios.length > 0 && (
        <div style={styles.filterBar} role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => {
            const count = f.key === 'all' ? sitios.length : (countsByStatus[f.key] || 0);
            return (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                style={{
                  ...styles.filterBtn,
                  ...(statusFilter === f.key ? styles.filterBtnActive : {}),
                }}
                aria-pressed={statusFilter === f.key}
              >
                {f.label}
                <span style={styles.filterCount}>({count})</span>
              </button>
            );
          })}
        </div>
      )}

      <div style={styles.tableWrapper} className="db-table-wrapper">
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th
                style={{ ...styles.th, cursor: 'pointer' }}
                onClick={() => handleSort('status')}
                aria-sort={sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('status'); } }}
              >
                Status{getSortIndicator('status')}
              </th>
              <th
                style={{ ...styles.th, cursor: 'pointer' }}
                onClick={() => handleSort('name')}
                aria-sort={sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('name'); } }}
              >
                Name{getSortIndicator('name')}
              </th>
              <th style={{ ...styles.th }} className="db-cell-tablet">
                URL
              </th>
              <th
                style={{ ...styles.th, ...styles.thRight, cursor: 'pointer' }}
                onClick={() => handleSort('latency')}
                aria-sort={sortConfig.key === 'latency' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('latency'); } }}
              >
                Latency{getSortIndicator('latency')}
              </th>
              <th
                style={{ ...styles.th, ...styles.thRight, cursor: 'pointer' }}
                className="db-cell-desktop"
                onClick={() => handleSort('frequency')}
                aria-sort={sortConfig.key === 'frequency' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('frequency'); } }}
              >
                Freq{getSortIndicator('frequency')}
              </th>
              <th style={{ ...styles.th, ...styles.thCenter, width: '48px' }} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={styles.emptyCell}>
                  {sitios.length === 0
                    ? 'No monitored sites yet'
                    : 'No results match your filters'}
                </td>
              </tr>
            ) : (
              paginatedSitios.map((sitio) => (
                <SitioTableRow key={sitio.id} sitio={sitio} onRowClick={onRowClick} onDelete={onDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={styles.pagination}>
          <span style={styles.paginationInfo}>
            {filtered.length} monitor{filtered.length !== 1 ? 's' : ''}
          </span>
          <div style={styles.paginationControls}>
            <button
              style={{ ...styles.pageBtn, opacity: currentPage <= 1 ? 0.3 : 1 }}
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="Previous page"
            >
              {'\u276E'}
            </button>
            <span style={styles.pageIndicator}>
              {currentPage} / {totalPages}
            </span>
            <button
              style={{ ...styles.pageBtn, opacity: currentPage >= totalPages ? 0.3 : 1 }}
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              aria-label="Next page"
            >
              {'\u276F'}
            </button>
          </div>
          <select
            style={styles.perPageSelect}
            value={perPage}
            onChange={handlePerPageChange}
            aria-label="Items per page"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      )}
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
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
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
  filterBar: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
    marginBottom: '8px',
  },
  filterBtn: {
    padding: '4px 10px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: 'var(--auth-on-surface-variant)',
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'background-color 0.15s, color 0.15s',
  },
  filterBtnActive: {
    backgroundColor: 'var(--auth-primary)',
    color: '#1d1b20',
  },
  filterCount: {
    marginLeft: '3px',
    opacity: 0.7,
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
    userSelect: 'none',
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
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0 0',
    borderTop: '1px solid var(--db-border-table)',
    marginTop: '8px',
  },
  paginationInfo: {
    fontSize: '12px',
    color: 'var(--auth-on-surface-variant)',
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  pageBtn: {
    padding: '4px 10px',
    border: '1px solid var(--db-border-card)',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'var(--auth-on-surface)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '13px',
  },
  pageIndicator: {
    fontSize: '12px',
    color: 'var(--auth-on-surface-variant)',
    fontFamily: "'Courier New', Courier, monospace",
  },
  perPageSelect: {
    padding: '4px 6px',
    border: '1px solid var(--db-border-card)',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'var(--auth-on-surface-variant)',
    fontSize: '11px',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
};
