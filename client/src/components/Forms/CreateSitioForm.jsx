import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { createSitio } from '../../services/api';

export function CreateSitioForm({ onSitioCreated }) {
  const [url, setUrl] = useState('');
  const [nombre, setNombre] = useState('');
  const [frecuencia, setFrecuencia] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createSitio(url, nombre || null, frecuencia, token);
      setUrl('');
      setNombre('');
      setFrecuencia(5);
      onSitioCreated();
    } catch (err) {
      setError(err.message || 'Error creando sitio');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Agregar Sitio</h2>

      <div style={styles.group}>
        <label style={styles.label}>URL *</label>
        <input
          type="url"
          placeholder="https://ejemplo.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={styles.input}
        />
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Nombre (opcional)</label>
        <input
          type="text"
          placeholder="Mi sitio"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Frecuencia (minutos)</label>
        <input
          type="number"
          min="1"
          value={frecuencia}
          onChange={(e) => setFrecuencia(parseInt(e.target.value))}
          style={styles.input}
        />
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Creando...' : 'Crear Sitio'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    marginBottom: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e1e2e',
  },
  group: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  error: {
    color: '#dc3545',
    fontSize: '14px',
    marginBottom: '12px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};