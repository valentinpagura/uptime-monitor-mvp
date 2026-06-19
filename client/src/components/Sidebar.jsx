const navItems = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'sitios', icon: '🌐', label: 'Sites' },
  { id: 'historial', icon: '📋', label: 'Activity' },
];

export function Sidebar({ userEmail, onLogout, activeItem, onNavigate }) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoBlock}>
        <div style={styles.logoIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <span style={styles.logoText}>Uptime Monitor</span>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="sidebar-nav-item"
              style={{
                ...styles.navItem,
                background: isActive ? 'var(--sidebar-hover-bg)' : 'transparent',
                color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
              }}
            >
              {isActive && <div style={styles.activeBar} />}
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={styles.spacer} />

      <div style={styles.userBlock}>
        <div style={styles.avatar}>
          {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userEmail}>{userEmail || 'User'}</span>
        </div>
      </div>

      <button onClick={onLogout} className="sidebar-logout-btn" style={styles.logoutBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>Sign out</span>
      </button>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    minWidth: 'var(--sidebar-width)',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    background: 'var(--bg-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    padding: 'var(--space-6) var(--space-4)',
    zIndex: 100,
    borderRight: '1px solid var(--border-subtle)',
  },
  logoBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: '0 var(--space-2)',
    marginBottom: 'var(--space-7)',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    background: 'var(--info-bg)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    textAlign: 'left',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: '4px',
    bottom: '4px',
    width: '3px',
    background: 'var(--sidebar-active-border)',
    borderRadius: '0 2px 2px 0',
  },
  navIcon: {
    fontSize: '16px',
    width: '20px',
    textAlign: 'center',
    flexShrink: 0,
  },
  spacer: {
    flex: 1,
  },
  userBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-2)',
    borderTop: '1px solid var(--border-subtle)',
    marginBottom: 'var(--space-2)',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'var(--brand-primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
    lineHeight: 1,
  },
  userInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  userEmail: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-tertiary)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    textAlign: 'left',
    width: '100%',
  },
};
