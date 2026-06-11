import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useContext(AuthContext);

  async function handleSubmit(e) {
    e.preventDefault();
    await login(email, password);
    setEmail('');
    setPassword('');
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* Email */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Correo electrónico</label>
        <div style={styles.inputWrapper}>
          <span style={styles.inputIcon}>✉️</span>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>
      </div>

      {/* Password */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Contraseña</label>
        <div style={styles.inputWrapper}>
          <span style={styles.inputIcon}>🔒</span>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          ⚠️ {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          ...styles.submitBtn,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión →'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
  },

  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e1e2e',
    letterSpacing: '0.3px',
  },

  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },

  inputIcon: {
    position: 'absolute',
    left: '14px',
    fontSize: '16px',
    pointerEvents: 'none',
  },

  input: {
    width: '100%',
    padding: '14px 14px 14px 44px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e1e2e',
    backgroundColor: '#fafafa',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  },

  eyeBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: 0,
  },

  errorBox: {
    backgroundColor: '#fff5f5',
    border: '1px solid #ffcccc',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#dc3545',
  },

  submitBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#667eea',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '8px',
  },
};