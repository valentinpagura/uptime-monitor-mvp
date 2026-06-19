export function LatencyGauge({ latencia, max = 500, noData }) {
  const fraction = noData ? 0 : Math.min(Math.max(latencia / max, 0), 1);

  const activeColor = latencia < 200 ? 'var(--success)' : latencia < 400 ? 'var(--warning)' : 'var(--error)';
  const color = noData ? 'var(--text-disabled)' : activeColor;

  const theta = Math.PI - fraction * Math.PI;
  const arcX = 100 + 80 * Math.cos(theta);
  const arcY = 100 - 80 * Math.sin(theta);
  const largeArc = fraction > 0.5 ? 1 : 0;

  return (
    <div style={styles.card}>
      <div style={styles.gaugeWrapper}>
        <svg viewBox="0 0 200 120" style={styles.svg}>
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            stroke="var(--border-default)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />

          {!noData && (
            <path
              d={`M 20 100 A 80 80 0 ${largeArc} 1 ${arcX.toFixed(1)} ${arcY.toFixed(1)}`}
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              style={{ transition: 'stroke 0.6s ease' }}
            />
          )}

          <text x="20" y="117" fontSize="11" textAnchor="middle" fill="var(--text-disabled)" fontFamily="var(--font-mono)">0</text>
          <text x="100" y="117" fontSize="11" textAnchor="middle" fill="var(--text-disabled)" fontFamily="var(--font-mono)">{max / 2}</text>
          <text x="180" y="117" fontSize="11" textAnchor="middle" fill="var(--text-disabled)" fontFamily="var(--font-mono)">{max}</text>
        </svg>

        <div style={styles.valueBox}>
          {noData ? (
            <>
              <span style={{ ...styles.value, color: 'var(--text-disabled)' }}>—</span>
              <span style={styles.unit}>No data</span>
            </>
          ) : (
            <>
              <span style={{ ...styles.value, color }}>{latencia}</span>
              <span style={styles.unit}>ms</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'transparent',
  },
  gaugeWrapper: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '160px',
  },
  svg: {
    width: '100%',
    maxWidth: '280px',
    height: 'auto',
    display: 'block',
  },
  valueBox: {
    position: 'absolute',
    top: '52%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    pointerEvents: 'none',
    zIndex: 10,
  },
  value: {
    display: 'block',
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: 1,
    letterSpacing: '-0.5px',
    fontFamily: 'var(--font-mono)',
  },
  unit: {
    display: 'block',
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    fontWeight: '500',
    marginTop: '4px',
  },
};
