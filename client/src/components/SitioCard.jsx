import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getLogs } from '../services/api';

export function SitioCard({ sitio, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [ultimoLog, setUltimoLog] = useState(null);
  const [cargando, setCargando] = useState(true);
  const { token } = useContext(AuthContext);

  // Cuando el componente monta, traer los logs
  useEffect(() => {
    async function cargarLogs() {
      try {
        const data = await getLogs(sitio.id, token);
        if (data.logs && data.logs.length > 0) {
          setUltimoLog(data.logs[0]);  // El más reciente
        }
      } catch (err) {
        console.error('Error cargando logs:', err);
      } finally {
        setCargando(false);
      }
    }

    cargarLogs();
  }, [sitio.id, token]);

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
      {/* Header */}
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

      {/* Status y Latencia */}
      <div style={styles.statusBar}>
        {cargando ? (
          <p style={styles.cargando}>Cargando estado...</p>
        ) : ultimoLog ? (
          <>
            <span style={{
              ...styles.status,
              backgroundColor: ultimoLog.is_online ? '#28a745' : '#dc3545'
            }}>
              {ultimoLog.is_online ? '✅ ONLINE' : '❌ OFFLINE'}
            </span>
            <span style={styles.latencia}>
              ⚡ {ultimoLog.latencia_ms}ms
            </span>
          </>
        ) : (
          <p style={styles.sinDatos}>Sin datos de monitoreo</p>
        )}
      </div>

      {/* Footer */}
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
    marginBottom: '12px',
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

  statusBar: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '12px',
  },

  status: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#fff',
    fontWeight: '600',
  },

  latencia: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '500',
  },

  cargando: {
    fontSize: '12px',
    color: '#999',
    margin: 0,
  },

  sinDatos: {
    fontSize: '12px',
    color: '#999',
    margin: 0,
    fontStyle: 'italic',
  },

  footer: {
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