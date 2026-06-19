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
      <h2 style={styles.title}>Add Site</h2>

      <div style={styles.row}>
        <div style={{ flex: 2 }}>
          <label style={styles.label}>URL *</label>
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Name</label>
          <input
            type="text"
            placeholder="My site"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={{ width: '120px' }}>
          <label style={styles.label}>Interval</label>
          <input
            type="number"
            min="1"
            value={frecuencia}
            onChange={(e) => setFrecuencia(parseInt(e.target.value))}
            style={styles.input}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Adding...' : 'Add Site'}
          </button>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}
    </form>
  );
}

const styles = {
  form: {
    padding: 'var(--space-5) var(--space-6)',
  },
  title: {
    margin: '0 0 var(--space-4) 0',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  row: {
    display: 'flex',
    gap: 'var(--space-3)',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    boxSizing: 'border-box',
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
  },
  error: {
    color: 'var(--error)',
    fontSize: '12px',
    marginTop: 'var(--space-3)',
  },
  button: {
    padding: '9px 20px',
    background: 'var(--brand-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background var(--transition-fast)',
  },
};
