import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function RegisterPage({ onLoginClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const { register, loading, error } = useContext(AuthContext);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setValidationError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    setValidationError(null);
    await register(email, password);
  }

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <span style={styles.logoText}>uptimemonitor</span>
          </div>

          <h1 style={styles.welcome}>Create account</h1>
          <p style={styles.subtitle}>Start monitoring your websites for free</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <div style={styles.inputBox}>
                <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-10 7L2 7" />
                </svg>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputBox}>
                <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Confirm password</label>
              <div style={styles.inputBox}>
                <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                <input
                  className="auth-input"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  style={{ paddingLeft: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  style={styles.eyeBtn}
                >
                  {showPasswordConfirm ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div style={styles.hints}>
              <span style={{ ...styles.hint, color: password.length >= 6 ? '#16a34a' : '#9ca3af' }}>
                {password.length >= 6 ? '✓' : '○'} At least 6 characters
              </span>
              <span style={{ ...styles.hint, color: password === passwordConfirm && passwordConfirm.length > 0 ? '#16a34a' : '#9ca3af' }}>
                {password === passwordConfirm && passwordConfirm.length > 0 ? '✓' : '○'} Passwords match
              </span>
            </div>

            {(validationError || error) && (
              <div style={styles.errorBox}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <span>{validationError || error}</span>
              </div>
            )}

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p style={styles.footer}>
            Already have an account?{' '}
            <span onClick={onLoginClick} style={styles.link}>Sign in</span>
          </p>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.shapes}>
          <div style={{ ...styles.shape, ...styles.shape1 }} />
          <div style={{ ...styles.shape, ...styles.shape2 }} />
          <div style={{ ...styles.shape, ...styles.shape3 }} />
          <div style={{ ...styles.shape, ...styles.shape4 }} />
        </div>

        <div style={styles.rightContent}>
          <div style={styles.badge}>FREE</div>
          <h2 style={styles.rightTitle}>Start monitoring in seconds</h2>
          <p style={styles.rightDesc}>
            Add your first website, set the check frequency, and get instant alerts when something goes wrong. No credit card required.
          </p>

          <div style={styles.statGrid}>
            <div style={styles.statItem}>
              <span style={styles.statValue}>100%</span>
              <span style={styles.statLabel}>Free</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statValue}>5min</span>
              <span style={styles.statLabel}>Check interval</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statValue}>SSL</span>
              <span style={styles.statLabel}>Encrypted</span>
            </div>
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
    background: '#fff',
  },
  left: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    background: '#fff',
  },
  leftInner: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '48px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    letterSpacing: '-0.3px',
  },
  welcome: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#6b7280',
    margin: '0 0 36px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  inputBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
    zIndex: 1,
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    zIndex: 1,
  },
  hints: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '12px 14px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  hint: {
    fontSize: '12px',
    transition: 'color 0.2s',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 14px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#dc2626',
  },
  footer: {
    marginTop: '28px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b7280',
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  right: {
    flex: '1',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #7c3aed 100%)',
  },
  shapes: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
  },
  shape: {
    position: 'absolute',
    borderRadius: '50%',
    opacity: 0.1,
  },
  shape1: {
    width: '500px',
    height: '500px',
    top: '-100px',
    right: '-150px',
    background: '#fff',
    animation: 'float 8s ease-in-out infinite',
  },
  shape2: {
    width: '300px',
    height: '300px',
    bottom: '-50px',
    left: '-80px',
    background: '#fff',
    animation: 'float 10s ease-in-out infinite reverse',
  },
  shape3: {
    width: '200px',
    height: '200px',
    top: '30%',
    left: '15%',
    background: 'rgba(255,255,255,0.08)',
    animation: 'float 12s ease-in-out infinite',
  },
  shape4: {
    width: '150px',
    height: '150px',
    bottom: '20%',
    right: '20%',
    background: 'rgba(255,255,255,0.06)',
    animation: 'pulse-slow 4s ease-in-out infinite',
  },
  rightContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '420px',
    color: '#fff',
    padding: '40px',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    background: 'rgba(34,197,94,0.2)',
    border: '1px solid rgba(34,197,94,0.3)',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px',
    color: '#86efac',
    marginBottom: '20px',
  },
  rightTitle: {
    fontSize: '34px',
    fontWeight: '700',
    lineHeight: '1.2',
    margin: '0 0 16px 0',
    letterSpacing: '-0.5px',
  },
  rightDesc: {
    fontSize: '15px',
    lineHeight: '1.7',
    opacity: 0.75,
    margin: '0 0 48px 0',
  },
  statGrid: {
    display: 'flex',
    gap: '32px',
    paddingTop: '32px',
    borderTop: '1px solid rgba(255,255,255,0.12)',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#86efac',
  },
  statLabel: {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    opacity: 0.5,
  },
};
