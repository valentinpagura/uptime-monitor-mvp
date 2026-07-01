import { useRef } from 'react';
import { useMagicEffects } from '../hooks/useMagicEffects';

export function StatCard({ title, value, unit, color, icon }) {
  const cardRef = useRef(null);
  useMagicEffects(cardRef);

  return (
    <div ref={cardRef} style={styles.card} className="db-kpi-card magic-glow-card">
      <div style={styles.header}>
        <span style={styles.icon}>{icon}</span>
        <h3 style={styles.title}>{title}</h3>
      </div>
      <div style={styles.value}>
        <span style={{ ...styles.number, color }}>{value != null ? value : '—'}</span>
        <span style={styles.unit}>{unit}</span>
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
    minWidth: '200px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  icon: {
    fontSize: '20px',
  },
  title: {
    margin: 0,
    fontSize: '12px',
    color: 'var(--auth-on-surface-variant)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '4px',
  },
  number: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  unit: {
    fontSize: '12px',
    color: 'var(--auth-on-surface-variant)',
    fontWeight: '500',
  },
};
