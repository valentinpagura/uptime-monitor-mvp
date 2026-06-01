import { useState } from 'react';

export function SitioCard({ sitio, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (window.confirm(`¿Eliminar "${sitio.nombre || sitio.url}"?`)) {
      setDeleting(true);
      try {
        await onDelete(sitio.id);
      } finally {
        setDeleting(false);
      }
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.nombre}>{sitio.nombre || sitio.url}</h3>
          <p style={styles.url}>{sitio.url}</p>
        </div>
        <button 
          onClick={handleDelete} 
          disabled={deleting}
          style={styles.deleteBtn}
        >
          {deleting ? '⏳' : '🗑️'}
        </button>
      </div>

      <div style={styles.footer}>
        <span style={styles.badge}>Cada {sitio.frecuencia_minutos} min</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nombre: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e1e2e',
  },
  url: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 8px',
    transition: 'all 0.2s ease',
  },
  footer: {
    marginTop: '12px',
    display: 'flex',
    gap: '8px',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#f0f0f0',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#666',
  },
};