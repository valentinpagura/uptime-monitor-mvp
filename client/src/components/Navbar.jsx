import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={styles.navbar}>
      <div style={styles.left}>
        <span style={styles.logo}>📊</span>
        <h1 style={styles.title}>Uptime Monitor</h1>
      </div>

      <div style={styles.right}>
        <span style={styles.email}>{user?.email}</span>
        <button onClick={logout} style={styles.logoutBtn}>
          Salir
        </button>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#1e1e2e',
    borderBottom: '1px solid #333',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    fontSize: '28px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    letterSpacing: '-0.5px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  email: {
    fontSize: '14px',
    opacity: 0.8,
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
};