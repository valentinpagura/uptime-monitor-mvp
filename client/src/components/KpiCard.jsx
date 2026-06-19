export function KpiCard({ title, value, icon, status }) {
  const semanticColor =
    status === 'down' ? 'var(--error)' :
    status === 'warning' ? 'var(--warning)' :
    'var(--success)';

  const iconBg =
    status === 'down' ? 'var(--error-bg)' :
    status === 'warning' ? 'var(--warning-bg)' :
    'var(--success-bg)';

  const showAlertValue = 
    (status === 'down' && value !== 0 && value !== '0ms') ||
    (status === 'warning' && value !== 0 && value !== '0ms');

  return (
    <div style={styles.card}>
      <div style={{ ...styles.leftBorder, background: semanticColor }} />
      <div style={styles.body}>
        <div style={styles.top}>
          <span style={{ ...styles.iconWrap, background: iconBg, color: semanticColor }}>
            {icon}
          </span>
        </div>
        <div style={styles.bottom}>
          <span style={styles.label}>{title}</span>
          <span style={{
            ...styles.value,
            color: showAlertValue ? semanticColor : 'var(--text-primary)',
          }}>
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    overflow: 'hidden',
    transition: 'all var(--transition-fast)',
    cursor: 'default',
  },
  leftBorder: {
    width: '3px',
    flexShrink: 0,
    background: 'transparent',
  },
  body: {
    flex: 1,
    padding: 'var(--space-5) var(--space-5) var(--space-5) var(--space-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrap: {
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },
  bottom: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    color: 'var(--text-tertiary)',
  },
  value: {
    fontSize: '28px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    fontFamily: 'var(--font-mono)',
    lineHeight: 1.2,
  },
};
