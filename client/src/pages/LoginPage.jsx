import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function LoginPage() {
  const [mode, setMode] = useState('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // Register state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [showRegPwdConfirm, setShowRegPwdConfirm] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const { login, register, loading, error } = useContext(AuthContext);

  async function handleLogin(e) {
    e.preventDefault();
    await login(loginEmail, loginPassword);
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (regPassword !== regPasswordConfirm) {
      setValidationError('Las contraseñas no coinciden');
      return;
    }
    if (regPassword.length < 6) {
      setValidationError('Mínimo 6 caracteres');
      return;
    }
    setValidationError(null);
    await register(regEmail, regPassword);
  }

  return (
    <main style={styles.page}>
      {/* LEFT — Auth Panel */}
      <section style={styles.leftPanel}>
        <div style={styles.leftInner}>
          <header style={styles.header}>
            <h1 style={styles.logo}>
              <span style={styles.logoIcon}>💜</span> UPTIME MONITOR
            </h1>
            <p style={styles.subtitle}>Enter your credentials to access the NOC dashboard.</p>
          </header>

          <div style={styles.card}>
            {/* Tabs */}
            <nav style={styles.tabs}>
              <button
                onClick={() => setMode('login')}
                style={{
                  ...styles.tab,
                  ...(mode === 'login' ? styles.tabActive : {}),
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('register')}
                style={{
                  ...styles.tab,
                  ...(mode === 'register' ? styles.tabActive : {}),
                }}
              >
                Register
              </button>
            </nav>

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Email Address</label>
                  <div className="auth-field-wrap">
                    <span style={styles.fieldIcon}>✉️</span>
                    <input
                      className="auth-field-input"
                      type="email"
                      placeholder="operator@domain.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <div style={styles.labelRow}>
                    <label style={styles.label}>Password</label>
                    <span style={styles.forgotLink}>Forgot?</span>
                  </div>
                  <div className="auth-field-wrap">
                    <span style={styles.fieldIcon}>🔒</span>
                    <input
                      className="auth-field-input"
                      type={showLoginPwd ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPwd(!showLoginPwd)}
                      style={styles.eyeBtn}
                    >
                      {showLoginPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div style={styles.rememberRow}>
                  <label style={styles.rememberLabel}>
                    <input type="checkbox" style={styles.checkbox} />
                    <span>Remember device</span>
                  </label>
                </div>

                {error && <div style={styles.errorBox}>⚠️ {error}</div>}

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? 'Initializing...' : 'Initialize Session'}
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Email Address</label>
                  <div className="auth-field-wrap">
                    <span style={styles.fieldIcon}>✉️</span>
                    <input
                      className="auth-field-input"
                      type="email"
                      placeholder="operator@domain.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Password</label>
                  <div className="auth-field-wrap">
                    <span style={styles.fieldIcon}>🔒</span>
                    <input
                      className="auth-field-input"
                      type={showRegPwd ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPwd(!showRegPwd)}
                      style={styles.eyeBtn}
                    >
                      {showRegPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Confirm Password</label>
                  <div className="auth-field-wrap">
                    <span style={styles.fieldIcon}>🔒</span>
                    <input
                      className="auth-field-input"
                      type={showRegPwdConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPwdConfirm(!showRegPwdConfirm)}
                      style={styles.eyeBtn}
                    >
                      {showRegPwdConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div style={styles.hints}>
                  <span style={{
                    ...styles.hint,
                    color: regPassword.length >= 6 ? '#38a169' : '#a0aec0'
                  }}>
                    {regPassword.length >= 6 ? '✓' : '○'} Mínimo 6 caracteres
                  </span>
                  <span style={{
                    ...styles.hint,
                    color: regPassword === regPasswordConfirm && regPasswordConfirm.length > 0
                      ? '#38a169' : '#a0aec0'
                  }}>
                    {regPassword === regPasswordConfirm && regPasswordConfirm.length > 0
                      ? '✓' : '○'} Las contraseñas coinciden
                  </span>
                </div>

                {validationError && (
                  <div style={styles.errorBox}>⚠️ {validationError}</div>
                )}
                {error && <div style={styles.errorBox}>⚠️ {error}</div>}

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? 'Initializing...' : 'Initialize Session'}
                </button>
              </form>
            )}
          </div>

          <footer style={styles.footer}>
            © 2024 UPTIME MONITOR. <span style={styles.footerLink}>Terms</span> • <span style={styles.footerLink}>Privacy</span>
          </footer>
        </div>
      </section>

      {/* RIGHT — Decorative Panel */}
      <section style={styles.rightPanel}>
        <div style={styles.rightInner}>
          <h2 style={styles.rightTitle}>
            Enterprise-Grade <br /><span style={styles.rightAccent}>Infrastructure Visibility.</span>
          </h2>
          <p style={styles.rightDesc}>
            Real-time network telemetry, instant incident detection, and comprehensive global service monitoring for modern engineering teams.
          </p>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Global Uptime Avg</span>
              <span style={styles.statValue}>99.999%</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Avg Detection Time</span>
              <span style={{ ...styles.statValue, color: 'var(--auth-error)' }}>~45ms</span>
            </div>
            <div style={{ ...styles.statCard, gridColumn: '1 / -1' }}>
              <span style={styles.statLabel}>Active Probes Globally</span>
              <span style={{ ...styles.statValue, color: 'var(--auth-on-surface)' }}>1,024,592</span>
            </div>
          </div>

          <ul style={styles.featureList}>
            {[
              { icon: '🌐', title: 'Multi-Protocol Monitoring', desc: 'Support for HTTP/S, TCP, UDP, ICMP, and custom gRPC health checks.' },
              { icon: '🔔', title: 'Intelligent Alerting', desc: 'Multi-channel incident routing with automatic escalation policies.' },
              { icon: '🌍', title: 'Distributed Tracing', desc: 'Monitor endpoint performance from 150+ global edge locations.' },
            ].map((f, i) => (
              <li key={i} style={styles.featureItem}>
                <div style={styles.featureIconWrap}><span>{f.icon}</span></div>
                <div>
                  <h3 style={styles.featureTitle}>{f.title}</h3>
                  <p style={styles.featureDesc}>{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    display: 'flex',
    width: '100%',
    minHeight: '100vh',
    backgroundColor: 'var(--auth-bg)',
    color: 'var(--auth-on-surface)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  leftPanel: {
    flex: '0 0 50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '32px 48px',
    position: 'relative',
    zIndex: 10,
  },

  leftInner: {
    width: '100%',
    maxWidth: '440px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '48px',
  },

  header: {
    marginBottom: 0,
  },

  logo: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--auth-primary)',
    letterSpacing: '-0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 0 8px 0',
  },

  logoIcon: {
    fontSize: '24px',
  },

  subtitle: {
    color: 'var(--auth-on-surface-variant)',
    margin: 0,
    fontSize: '14px',
  },

  card: {
    backgroundColor: 'var(--auth-panel-bg)',
    border: '1px solid var(--auth-border)',
    borderRadius: '8px',
    overflow: 'hidden',
    width: '100%',
  },

  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--auth-border)',
  },

  tab: {
    flex: 1,
    padding: '12px 0',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    background: 'transparent',
    color: 'var(--auth-on-surface-variant)',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s ease',
  },

  tabActive: {
    color: 'var(--auth-primary)',
    borderBottom: '2px solid var(--auth-primary)',
    fontWeight: '700',
  },

  form: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  label: {
    color: 'var(--auth-on-surface-variant)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontSize: '11px',
    fontWeight: '600',
  },

  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  forgotLink: {
    color: 'var(--auth-primary)',
    fontSize: '12px',
    cursor: 'default',
  },

  fieldIcon: {
    color: 'var(--auth-on-surface-variant)',
    marginRight: '12px',
    fontSize: '16px',
    flexShrink: 0,
  },

  eyeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--auth-on-surface-variant)',
    fontSize: '16px',
    padding: '4px',
    marginLeft: '4px',
    flexShrink: 0,
  },

  rememberRow: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: '4px',
  },

  rememberLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--auth-on-surface-variant)',
    fontSize: '14px',
    cursor: 'pointer',
  },

  checkbox: {
    accentColor: 'var(--auth-primary)',
  },

  hints: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '12px 14px',
    backgroundColor: 'var(--auth-bg)',
    borderRadius: '8px',
    border: '1px solid var(--auth-border)',
  },

  hint: {
    fontSize: '12px',
    transition: 'color 0.2s ease',
  },

  errorBox: {
    backgroundColor: 'rgba(var(--auth-error-container-rgb), 0.3)',
    border: '1px solid var(--auth-error-container)',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '13px',
    color: 'var(--auth-error)',
  },

  footer: {
    textAlign: 'center',
    color: 'var(--auth-on-surface-variant)',
    fontSize: '12px',
  },

  footerLink: {
    color: 'var(--auth-primary)',
    cursor: 'default',
  },

  rightPanel: {
    flex: '0 0 50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '48px 64px',
    borderLeft: '1px solid var(--auth-border)',
    background: 'radial-gradient(circle at 80% 20%, rgba(var(--auth-primary-container-rgb), 0.15) 0%, rgba(var(--auth-bg-rgb), 1) 50%)',
  },

  rightInner: {
    maxWidth: '520px',
  },

  rightTitle: {
    fontSize: '40px',
    fontWeight: '700',
    lineHeight: '1.2',
    margin: '0 0 24px 0',
    color: 'var(--auth-on-surface)',
  },

  rightAccent: {
    color: 'var(--auth-primary)',
  },

  rightDesc: {
    color: 'var(--auth-on-surface-variant)',
    fontSize: '16px',
    lineHeight: '1.7',
    margin: '0 0 40px 0',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '40px',
  },

  statCard: {
    backgroundColor: 'var(--auth-panel-bg)',
    border: '1px solid var(--auth-border)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  statLabel: {
    color: 'var(--auth-on-surface-variant)',
    textTransform: 'uppercase',
    fontSize: '11px',
    letterSpacing: '0.05em',
  },

  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--auth-primary)',
  },

  featureList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: 0,
    margin: 0,
  },

  featureItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },

  featureIconWrap: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(var(--auth-primary-container-rgb), 0.2)',
    border: '1px solid rgba(var(--auth-primary-rgb), 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  },

  featureTitle: {
    fontWeight: '700',
    color: 'var(--auth-on-surface)',
    margin: '0 0 4px 0',
    fontSize: '15px',
  },

  featureDesc: {
    color: 'var(--auth-on-surface-variant)',
    margin: 0,
    fontSize: '13px',
    lineHeight: '1.5',
  },
};
