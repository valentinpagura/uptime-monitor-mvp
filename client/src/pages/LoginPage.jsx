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
    <div style={styles.page}>
      {/* IZQUIERDA */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          {/* Logo */}
          <div style={styles.logo}>
            <div style={styles.logoIcon}>📊</div>
            <div>
              <h1 style={styles.logoTitle}>Uptime Monitor</h1>
              <p style={styles.logoSub}>Monitoreo de sitios web</p>
            </div>
          </div>

          {/* Card */}
          <div style={styles.card}>
            {/* Tabs */}
            <div style={styles.tabs}>
              <button
                onClick={() => setMode('login')}
                style={{
                  ...styles.tab,
                  ...(mode === 'login' ? styles.tabActive : styles.tabInactive),
                }}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => setMode('register')}
                style={{
                  ...styles.tab,
                  ...(mode === 'register' ? styles.tabActive : styles.tabInactive),
                }}
              >
                Registrarse
              </button>
            </div>

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} style={styles.form}>
                <div>
                  <h2 style={styles.formTitle}>Bienvenido de nuevo</h2>
                  <p style={styles.formSubtitle}>
                    ¿No tienes cuenta?{' '}
                    <span
                      onClick={() => setMode('register')}
                      style={styles.link}
                    >
                      Regístrate gratis
                    </span>
                  </p>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Correo electrónico</label>
                  <div style={styles.inputBox}>
                    <span style={styles.icon}>✉️</span>
                    <input
                      className="auth-input"
                      type="email"
                      placeholder="tu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Contraseña</label>
                  <div style={styles.inputBox}>
                    <span style={styles.icon}>🔒</span>
                    <input
                      className="auth-input"
                      type={showLoginPwd ? 'text' : 'password'}
                      placeholder="Tu contraseña"
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

                {error && <div style={styles.errorBox}>⚠️ {error}</div>}

                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión →'}
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} style={styles.form}>
                <div>
                  <h2 style={styles.formTitle}>Crear cuenta</h2>
                  <p style={styles.formSubtitle}>
                    ¿Ya tienes cuenta?{' '}
                    <span
                      onClick={() => setMode('login')}
                      style={styles.link}
                    >
                      Inicia sesión
                    </span>
                  </p>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Correo electrónico</label>
                  <div style={styles.inputBox}>
                    <span style={styles.icon}>✉️</span>
                    <input
                      className="auth-input"
                      type="email"
                      placeholder="tu@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Contraseña</label>
                  <div style={styles.inputBox}>
                    <span style={styles.icon}>🔒</span>
                    <input
                      className="auth-input"
                      type={showRegPwd ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
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
                  <label style={styles.label}>Confirmar contraseña</label>
                  <div style={styles.inputBox}>
                    <span style={styles.icon}>🔒</span>
                    <input
                      className="auth-input"
                      type={showRegPwdConfirm ? 'text' : 'password'}
                      placeholder="Repite tu contraseña"
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

                {/* Password hints */}
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

                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
                </button>
              </form>
            )}
          </div>

          <p style={styles.footer}>
            © 2026 Uptime Monitor. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* DERECHA */}
      <div style={styles.right}>
        <div style={styles.rightInner}>
          <div style={styles.rightBadge}>NUEVO</div>
          <h2 style={styles.rightTitle}>
            Monitorea tus sitios web en tiempo real
          </h2>
          <p style={styles.rightDesc}>
            Detecta caídas al instante, analiza el rendimiento y mantén tus sitios siempre en línea con estadísticas detalladas.
          </p>

          {/* Feature cards */}
          <div style={styles.featureCards}>
            {[
              { icon: '⚡', title: 'Tiempo real', desc: 'Monitoreo cada 5 minutos' },
              { icon: '📈', title: 'Estadísticas', desc: 'Gráficos de latencia y uptime' },
              { icon: '🔔', title: 'Alertas', desc: 'Notificaciones instantáneas' },
            ].map((f, i) => (
              <div key={i} style={styles.featureCard}>
                <span style={styles.featureCardIcon}>{f.icon}</span>
                <div>
                  <p style={styles.featureCardTitle}>{f.title}</p>
                  <p style={styles.featureCardDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={styles.stats}>
            {[
              { value: '99.9%', label: 'Uptime promedio' },
              { value: '<5min', label: 'Detección de caídas' },
              { value: '24/7', label: 'Monitoreo continuo' },
            ].map((s, i) => (
              <div key={i} style={styles.stat}>
                <p style={styles.statValue}>{s.value}</p>
                <p style={styles.statLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
  },

  left: {
    flex: '0 0 480px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: '40px',
    boxShadow: '2px 0 20px rgba(0,0,0,0.06)',
  },

  leftInner: {
    width: '100%',
    maxWidth: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },

  logoIcon: {
    fontSize: '36px',
    width: '52px',
    height: '52px',
    backgroundColor: '#f0f3ff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e1e2e',
    margin: '0 0 2px 0',
  },

  logoSub: {
    fontSize: '12px',
    color: '#a0aec0',
    margin: 0,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },

  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
  },

  tab: {
    flex: 1,
    padding: '16px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },

  tabActive: {
    backgroundColor: '#fff',
    color: '#667eea',
    borderBottom: '2px solid #667eea',
  },

  tabInactive: {
    backgroundColor: '#f8fafc',
    color: '#a0aec0',
    borderBottom: '2px solid transparent',
  },

  form: {
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  formTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e1e2e',
    margin: '0 0 6px 0',
  },

  formSubtitle: {
    fontSize: '13px',
    color: '#718096',
    margin: 0,
  },

  link: {
    color: '#667eea',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4a5568',
  },

  inputBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },

  icon: {
    position: 'absolute',
    left: '13px',
    fontSize: '15px',
    pointerEvents: 'none',
    zIndex: 1,
  },

  eyeBtn: {
    position: 'absolute',
    right: '13px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    padding: 0,
    zIndex: 1,
  },

  hints: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '12px 14px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },

  hint: {
    fontSize: '12px',
    transition: 'color 0.2s ease',
  },

  errorBox: {
    backgroundColor: '#fff5f5',
    border: '1px solid #feb2b2',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#c53030',
  },

  footer: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#a0aec0',
  },

  right: {
    flex: 1,
    background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 40%, #4a3d7a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
  },

  rightInner: {
    maxWidth: '480px',
    color: '#fff',
  },

  rightBadge: {
    display: 'inline-block',
    backgroundColor: 'rgba(102,126,234,0.3)',
    border: '1px solid rgba(102,126,234,0.6)',
    color: '#a5b4fc',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    padding: '5px 12px',
    borderRadius: '20px',
    marginBottom: '24px',
  },

  rightTitle: {
    fontSize: '36px',
    fontWeight: '700',
    lineHeight: '1.25',
    margin: '0 0 16px 0',
    color: '#fff',
  },

  rightDesc: {
    fontSize: '15px',
    lineHeight: '1.7',
    color: 'rgba(255,255,255,0.65)',
    margin: '0 0 40px 0',
  },

  featureCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '40px',
  },

  featureCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '16px',
    backdropFilter: 'blur(10px)',
  },

  featureCardIcon: {
    fontSize: '24px',
    width: '44px',
    height: '44px',
    backgroundColor: 'rgba(102,126,234,0.25)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  featureCardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 3px 0',
  },

  featureCardDesc: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.55)',
    margin: 0,
  },

  stats: {
    display: 'flex',
    gap: '24px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '32px',
  },

  stat: {
    flex: 1,
    textAlign: 'center',
  },

  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#a5b4fc',
    margin: '0 0 4px 0',
  },

  statLabel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};