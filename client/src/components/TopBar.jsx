export function TopBar({ searchValue, onSearchChange, onRefresh }) {
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <span style={styles.searchIcon}>{'\uD83D\uDD0D'}</span>
        <input
          className="db-search-input"
          placeholder="Search systems..."
          type="text"
          value={searchValue}
          onChange={onSearchChange}
        />
      </div>

      <div style={styles.centerTitle}>System Monitor</div>

      <div style={styles.right}>
        <button className="db-topbar-btn" aria-label="Notifications">
          {'\uD83D\uDD14'}
        </button>
        <button className="db-topbar-btn" aria-label="Refresh" onClick={onRefresh}>
          {'\uD83D\uDD04'}
        </button>
        <button className="db-topbar-btn" aria-label="Terminal">
          {'\uD83D\uDCBB'}
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px',
    padding: '0 24px',
    borderBottom: '1px solid var(--db-outline-variant)',
    backgroundColor: 'var(--db-surface)',
    flexShrink: 0,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchIcon: {
    fontSize: '18px',
    color: 'var(--auth-primary)',
  },
  centerTitle: {
    fontSize: '20px',
    fontWeight: 900,
    color: 'var(--auth-on-surface)',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
};
