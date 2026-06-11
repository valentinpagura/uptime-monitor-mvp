import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export function RegisterForm() {
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
      setValidationError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setValidationError(null);
    await register(email, password);
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
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
            placeholder="Mínimo 6 caracteres"
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

      {/* Confirm Password */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Confirmar contraseña</label>
        <div style={styles.inputWrapper}>
          <span style={styles.inputIcon}>🔒</span>
          <input
            type={showPasswordConfirm ? 'text' : 'password'}
            placeholder="Repite tu contraseña"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            style={styles.input}
          />
          <button
            type="button"
            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            style={styles.eyeBtn}
          >
            {showPasswordConfirm ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      {/* Password hints */}
      <div style={styles.hintBox}>
        <p style={styles.hintTitle}>La contraseña debe:</p>
        <p style={{
          ...styles.hint,
          color: password.length >= 6 ? '#28a745' : '#999'
        }}>
          {password.length >= 6 ? '✓' : '○'} Tener al menos 6 caracteres
        </p>
        <p style={{
          ...styles.hint,
          color: password === passwordConfirm && passwordConfirm.length > 0 ? '#28a745' : '#999'
        }}>
          {password === passwordConfirm && passwordConfirm.length > 0 ? '✓' : '○'} Las contraseñas coinciden
        </p>
      </div>

      {/* Errors */}
      {validationError && (
        <div style={styles.errorBox}>⚠️ {validationError}</div>
      )}
      {error && (
        <div style={styles.errorBox}>⚠️ {error}</div>
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
        {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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

  hintBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    padding: '12px 16px',
    border: '1px solid #e0e0e0',
  },

  hintTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    margin: '0 0 8px 0',
  },

  hint: {
    fontSize: '12px',
    margin: '4px 0',
    transition: 'color 0.2s ease',
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
    marginTop: '8px',
  },
};