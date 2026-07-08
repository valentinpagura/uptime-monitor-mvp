import { SearchDropdown } from './SearchDropdown';

export function TopBar({ searchValue, onSearchChange, onRefresh, sitios, onSearchSelect, onSearchClose }) {
  return (
    <header style={styles.header} role="banner">
      <div style={styles.left}>
        <span style={styles.searchIcon} aria-hidden="true">{'\uD83D\uDD0D'}</span>
        <div style={styles.searchWrap}>
          <input
            className="db-search-input"
            placeholder="Search systems..."
            type="text"
            value={searchValue}
            onChange={onSearchChange}
            aria-label="Search monitors"
          />
          <SearchDropdown query={searchValue} sitios={sitios} onSelect={onSearchSelect} onClose={onSearchClose} />
        </div>
      </div>

      <div style={styles.centerTitle} aria-hidden="true">System Monitor</div>

      <div style={styles.right}>
        <button className="db-topbar-btn" aria-label="Notifications" tabIndex={-1}>
          {'\uD83D\uDD14'}
        </button>
        <button className="db-topbar-btn" aria-label="Refresh" onClick={onRefresh}>
          {'\uD83D\uDD04'}
        </button>
        <button className="db-topbar-btn" aria-label="Terminal" tabIndex={-1}>
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
  searchWrap: {
    position: 'relative',
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
