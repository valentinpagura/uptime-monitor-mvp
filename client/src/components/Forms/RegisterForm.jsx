import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [validationError, setValidationError] = useState(null);

  const { register, loading, error } = useContext(AuthContext);

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validación local: las passwords deben coincidir
    if (password !== passwordConfirm) {
      setValidationError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setValidationError(null); // Limpia errores de validación si todo es ok

    await register(email, password);
    
    // Limpia el form después de intentar registro
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Contraseña:</label>
        <input
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Confirmar Contraseña:</label>
        <input
          type="password"
          placeholder="Repite tu contraseña"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />
      </div>

      {validationError && <p style={{ color: 'red' }}>{validationError}</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Cargando...' : 'Crear Cuenta'}
      </button>
    </form>
  );
}
