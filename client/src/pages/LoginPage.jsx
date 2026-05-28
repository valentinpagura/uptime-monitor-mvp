import { useState } from 'react';
import { LoginForm } from '../components/Forms/LoginForm';
import { RegisterForm } from '../components/Forms/RegisterForm';

export function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' o 'register'

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Uptime Monitor</h1>

      {/* Toggle entre Login y Registro */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setMode('login')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: mode === 'login' ? '#007bff' : '#ccc',
            color: mode === 'login' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          Ingresar
        </button>

        <button
          onClick={() => setMode('register')}
          style={{
            padding: '10px 20px',
            backgroundColor: mode === 'register' ? '#007bff' : '#ccc',
            color: mode === 'register' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          Registrarse
        </button>
      </div>

      {/* Mostrar el formulario que corresponde */}
      {mode === 'login' ? (
        <div>
          <h2>Ingresar</h2>
          <LoginForm />
        </div>
      ) : (
        <div>
          <h2>Crear cuenta</h2>
          <RegisterForm />
        </div>
      )}
    </div>
  );
}
