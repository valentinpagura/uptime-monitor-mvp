import { memo, useRef } from 'react';
import { useMagicEffects } from '../hooks/useMagicEffects';

const DOT_COLORS = {
  primary: { border: 'rgba(207, 188, 255, 0.3)', dot: 'var(--auth-primary)' },
  warning: { border: 'rgba(231, 195, 101, 0.3)', dot: 'var(--db-tertiary)' },
  error: { border: 'rgba(255, 180, 171, 0.3)', dot: 'var(--auth-error)' },
};

export const KpiCard = memo(function KpiCard({ label, value, unit, variant = 'neutral' }) {
  const cardRef = useRef(null);
  const dotStyle = DOT_COLORS[variant];

  useMagicEffects(cardRef);

  return (
    <div ref={cardRef} style={{ ...styles.card, ...styles.cardBase }} className="db-kpi-card magic-glow-card">
      {variant !== 'neutral' && dotStyle && (
        <div style={{ ...styles.dotOuter, borderColor: dotStyle.border }}>
          <div style={{ ...styles.dotInner, backgroundColor: dotStyle.dot }} />
        </div>
      )}

      <span style={styles.label}>{label}</span>

      {variant === 'neutral' ? (
        <div style={styles.valueRow}>
          <span style={styles.value}>{value}</span>
          {unit && <span style={styles.unit}>{unit}</span>}
        </div>
      ) : (
        <span style={styles.value}>{value}</span>
      )}
    </div>
  );
});

const styles = {
  cardBase: {
    backgroundColor: 'var(--db-bg-card)',
    border: '1px solid var(--db-border-card)',
    borderRadius: '8px',
    padding: '16px',
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '112px',
  },
  dotOuter: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  label: {
    fontSize: '12px',
    color: 'var(--auth-on-surface-variant)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  value: {
    fontSize: '24px',
    fontWeight: 500,
    fontFamily: "'Courier New', Courier, monospace",
    color: 'var(--auth-on-surface)',
  },
  valueRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
  },
  unit: {
    fontSize: '12px',
    fontFamily: "'Courier New', Courier, monospace",
    color: 'var(--auth-on-surface-variant)',
    paddingBottom: '4px',
  },
};
