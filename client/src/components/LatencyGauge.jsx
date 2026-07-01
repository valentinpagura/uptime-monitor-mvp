export function LatencyGauge({ latencia, max = 500 }) {
  const safeLatencia = latencia ?? 0;
  const angle = (safeLatencia / max) * 180;
  const clampedAngle = Math.min(angle, 180);

  let color;
  if (safeLatencia < 200) color = '#4ade80';
  else if (safeLatencia < 400) color = '#e7c365';
  else color = '#ff6b6b';

  const arcEndX = 20 + 160 * (safeLatencia / max);
  const arcEndY = 100 - 80 * Math.sin((safeLatencia / max) * Math.PI);

  return (
    <div style={styles.container} className="magic-glow-card">
      <svg viewBox="0 0 200 120" style={styles.svg}>
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          stroke="var(--db-surface-container-high)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M 20 100 A 80 80 0 0 1 ${arcEndX} ${arcEndY}`}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <g transform={`rotate(${clampedAngle} 100 100)`}>
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
          {Math.round(max / 2)}
        </text>
        <text x="180" y="115" fontSize="12" textAnchor="middle" fill="var(--auth-on-surface-variant)">
          {max}
        </text>
      </svg>
      <div style={styles.valueBox}>
        <span style={{ ...styles.latenciaValue, color }}>
          {latencia != null ? safeLatencia : '—'}
        </span>
        <span style={styles.latenciaUnit}>{latencia != null ? 'ms' : ''}</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: '300px',
    margin: '0 auto',
    backgroundColor: 'var(--db-bg-card)',
    border: '1px solid var(--db-border-card)',
    borderRadius: '8px',
    padding: '20px',
    overflow: 'hidden',
  },
  svg: {
    width: '100%',
    height: 'auto',
  },
  valueBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    zIndex: 10,
  },
  latenciaValue: {
    display: 'block',
    fontSize: '32px',
    fontWeight: 'bold',
  },
  latenciaUnit: {
    display: 'block',
    fontSize: '12px',
    color: 'var(--auth-on-surface-variant)',
    fontWeight: '500',
  },
};
