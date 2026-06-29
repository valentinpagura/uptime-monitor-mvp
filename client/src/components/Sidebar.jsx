import { useCallback } from 'react';

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',  icon: '\uD83D\uDCCA', active: true },
  { id: 'monitors',  label: 'Monitors',  icon: '\uD83E\uDEBA', inert: true },
  { id: 'incidents', label: 'Incidents', icon: '\u26A0\uFE0F', inert: true },
  { id: 'analytics', label: 'Analytics', icon: '\uD83D\uDCC8', inert: true },
  { id: 'settings',  label: 'Settings',  icon: '\u2699\uFE0F', inert: true },
];

const BOTTOM_ITEMS = [
  { id: 'help',    label: 'Help',     icon: '\u2753', inert: true },
  { id: 'signout', label: 'Sign Out', icon: '\uD83D\uDEAA' },
];

export function Sidebar({ onAddProbe, onLogout }) {
  const handleAddProbe = useCallback(() => {
    onAddProbe?.();
  }, [onAddProbe]);

  const handleSignOut = useCallback(() => {
    onLogout?.();
  }, [onLogout]);

  return (
    <nav style={styles.nav}>
      <div style={styles.logoSection}>
        <div style={styles.logoIcon}>
          <span style={styles.logoEmoji}>{'\uD83D\uDCBB'}</span>
        </div>
        <div>
          <h1 style={styles.logoTitle}>NOC-UPTIME</h1>
          <p style={styles.logoVersion}>V 2.4.0-Stable</p>
        </div>
      </div>

      <button onClick={handleAddProbe} style={styles.addBtn}>
        <span style={styles.addBtnIcon}>{'\u2795'}</span>
        Deploy Probe
      </button>

      <ul style={styles.navList}>
        {NAV_ITEMS.map((item) => (
          <li
            key={item.id}
            className={
              item.active
                ? 'sidebar-nav-item sidebar-nav-item--active'
                : item.inert
                  ? 'sidebar-nav-item sidebar-nav-item--inert'
                  : 'sidebar-nav-item'
            }
            style={styles.navItem}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

      <ul style={styles.bottomList}>
        {BOTTOM_ITEMS.map((item) => (
          <li
            key={item.id}
            className={
              item.inert
                ? 'sidebar-nav-item sidebar-nav-item--inert'
                : 'sidebar-nav-item'
            }
            style={styles.navItem}
            onClick={item.id === 'signout' ? handleSignOut : undefined}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: 'var(--db-surface-container-low)',
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100%',
    width: '256px',
    borderRight: '1px solid var(--db-outline-variant)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 12px',
    zIndex: 50,
    flexShrink: 0,
    overflowY: 'auto',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
    padding: '0 12px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--db-surface-container-high)',
    border: '1px solid var(--db-outline-variant)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoEmoji: {
    fontSize: '18px',
  },
  logoTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--auth-primary)',
    letterSpacing: '-0.05em',
    margin: 0,
  },
  logoVersion: {
    fontSize: '12px',
    color: 'var(--auth-on-surface-variant)',
    margin: 0,
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px 16px',
    borderRadius: '9999px',
    backgroundColor: 'var(--auth-primary)',
    color: '#1d1b20',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    marginBottom: '24px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'opacity 0.2s',
  },
  addBtnIcon: {
    fontSize: '16px',
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    padding: 0,
    margin: 0,
  },
  bottomList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px 0 0 0',
    margin: 'auto 0 0 0',
    borderTop: '1px solid var(--db-outline-variant)',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: 'var(--auth-on-surface-variant)',
    fontSize: '14px',
  },
  navIcon: {
    fontSize: '20px',
    width: '24px',
    textAlign: 'center',
  },
};
