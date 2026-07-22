import { memo } from 'react';

const RANGES = [
  { key: '1h', label: '1h' },
  { key: '24h', label: '24h' },
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
  { key: 'all', label: 'All' },
];

export const RangeSelector = memo(function RangeSelector({ activeRange, onRangeChange }) {
  return (
    <div style={styles.container} role="group" aria-label="Rango de tiempo">
      {RANGES.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onRangeChange(key)}
          style={{
            ...styles.btn,
            ...(activeRange === key ? styles.btnActive : {}),
          }}
          aria-pressed={activeRange === key}
        >
          {label}
        </button>
      ))}
    </div>
  );
});

const styles = {
  container: {
    display: 'flex',
    gap: '4px',
    backgroundColor: 'var(--db-surface-container-high)',
    borderRadius: '8px',
    padding: '3px',
  },
  btn: {
    padding: '6px 14px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: 'var(--auth-on-surface-variant)',
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'background-color 0.15s, color 0.15s',
  },
  btnActive: {
    backgroundColor: 'var(--auth-primary)',
    color: '#fff',
  },
};
