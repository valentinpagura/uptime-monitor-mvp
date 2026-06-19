import { Sidebar } from './Sidebar';

export function Layout({ children, userEmail, onLogout, activeItem, onNavigate }) {
  return (
    <div style={styles.wrapper}>
      <Sidebar
        userEmail={userEmail}
        onLogout={onLogout}
        activeItem={activeItem}
        onNavigate={onNavigate}
      />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    marginLeft: 'var(--sidebar-width)',
    padding: 'var(--space-7) var(--space-8)',
    background: 'var(--bg-base)',
    minHeight: '100vh',
    overflowY: 'auto',
  },
};
