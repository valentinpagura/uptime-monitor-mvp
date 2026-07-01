import { useState } from 'react';

export function AddSiteForm({ onSubmit, inputRef }) {
  const [url, setUrl] = useState('');
  const [nombre, setNombre] = useState('');
  const [frecuencia, setFrecuencia] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(url, nombre || null, frecuencia);
      setUrl('');
      setNombre('');
      setFrecuencia(5);
    } catch (err) {
      setError(err?.message || 'Error creating site');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.card} className="db-grid-card magic-glow-card">
      <h3 style={styles.cardTitle}>Add New Site</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div>
          <label style={styles.label}>Target URL</label>
          <input
            ref={inputRef}
            type="url"
            className="db-input db-input-mono"
            placeholder="https://"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={styles.label}>Display Name</label>
          <input
            type="text"
            className="db-input"
            placeholder="e.g. EU Prod API"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={styles.label}>Check Frequency</label>
          <select
            className="db-select"
            value={frecuencia}
            onChange={(e) => setFrecuencia(parseInt(e.target.value))}
          >
            <option value={1}>Every 1 minute</option>
            <option value={5}>Every 5 minutes</option>
            <option value={15}>Every 15 minutes</option>
          </select>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" className="db-submit-btn" disabled={loading} style={{ marginTop: 'auto' }}>
          {loading ? 'Adding...' : 'Add Monitor'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--db-bg-card)',
    border: '1px solid var(--db-border-card)',
    borderRadius: '8px',
    padding: '16px',
  },
  cardTitle: {
    margin: '0 0 16px 0',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--db-border-card)',
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--auth-on-surface)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: 'var(--auth-on-surface-variant)',
    marginBottom: '4px',
  },
  error: {
    color: 'var(--auth-error)',
    fontSize: '13px',
    margin: 0,
  },
};
