export function StatCard({ title, value, unit, color, icon }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={{ ...styles.iconWrap, color }}>{icon}</span>
        <h3 style={styles.title}>{title}</h3>
      </div>
      <div style={styles.valueRow}>
        <span style={{ ...styles.number, color }}>{value}</span>
        <span style={styles.unit}>{unit}</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-5)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-4)',
  },
  iconWrap: {
    fontSize: '16px',
    width: '20px',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  number: {
    fontSize: '26px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    fontFamily: 'var(--font-mono)',
    lineHeight: 1.2,
  },
  unit: {
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    fontWeight: '500',
  },
};
