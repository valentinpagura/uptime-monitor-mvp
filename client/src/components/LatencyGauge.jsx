import { memo, useMemo } from 'react';

export const LatencyGauge = memo(function LatencyGauge({ latencia, maxLatencia }) {
  const hasData = latencia != null && !isNaN(latencia);
  const safeLatencia = hasData ? latencia : 0;

  const gaugeMax = useMemo(() => {
    if (maxLatencia != null && maxLatencia > 0) return Math.max(maxLatencia * 1.3, 100);
    return 500;
  }, [maxLatencia]);

  const clampedRatio = hasData ? Math.min(safeLatencia / gaugeMax, 1) : 0;
  const angle = -90 + clampedRatio * 180;

  const color = useMemo(() => {
    if (!hasData) return 'var(--db-outline-variant)';
    if (safeLatencia < 200) return '#4ade80';
    if (safeLatencia < 400) return '#e7c365';
    return '#ff6b6b';
  }, [hasData, safeLatencia]);

  const ratio = clampedRatio;
  const arcEndX = 100 - 80 * Math.cos(ratio * Math.PI);
  const arcEndY = 100 - 80 * Math.sin(ratio * Math.PI);

  const halfMark = Math.round(gaugeMax / 2);

  return (
    <div style={styles.container} className="magic-glow-card">
      <div style={styles.header}>
        <span style={styles.headerLabel}>Latencia Actual</span>
        {maxLatencia != null && (
          <span style={styles.headerMax}>Máx: {Math.round(maxLatencia)} ms</span>
        )}
      </div>
      <svg viewBox="0 0 200 120" style={styles.svg}>
        <path
          d="M 20 100 A 80 80 0 0 0 180 100"
          stroke="var(--db-surface-container-high)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M 20 100 A 80 80 0 0 0 ${arcEndX} ${arcEndY}`}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <g transform={`rotate(${angle} 100 100)`}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke={color}
            strokeWidth="3"
          />
          <circle cx="100" cy="100" r="4" fill={color} />
        </g>
        <text x="20" y="115" fontSize="12" textAnchor="middle" fill="var(--auth-on-surface-variant)">
          0
        </text>
        <text x="100" y="115" fontSize="12" textAnchor="middle" fill="var(--auth-on-surface-variant)">
          {halfMark}
        </text>
        <text x="180" y="115" fontSize="12" textAnchor="middle" fill="var(--auth-on-surface-variant)">
          {Math.round(gaugeMax)}
        </text>
      </svg>
      <div style={styles.valueBox}>
        <span style={{ ...styles.latenciaValue, color }}>
          {hasData ? safeLatencia : '\u2014'}
        </span>
        <span style={styles.latenciaUnit}>{hasData ? 'ms' : ''}</span>
      </div>
    </div>
  );
});

const styles = {
  container: {
    width: '100%',
    maxWidth: '300px',
    margin: '0 auto',
    backgroundColor: 'var(--db-bg-card)',
    border: '1px solid var(--db-border-card)',
    borderRadius: '8px',
    padding: '20px 20px 4px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  headerLabel: {
    fontSize: '11px',
    color: 'var(--auth-on-surface-variant)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  headerMax: {
    fontSize: '10px',
    color: 'var(--auth-on-surface-variant)',
    opacity: 0.7,
  },
  svg: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  valueBox: {
    textAlign: 'center',
    padding: '2px 0 14px',
  },
  latenciaValue: {
    fontSize: '32px',
    fontWeight: 'bold',
  },
  latenciaUnit: {
    fontSize: '12px',
    color: 'var(--auth-on-surface-variant)',
    fontWeight: '500',
    marginLeft: '4px',
  },
};
