import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getSitioStats } from '../services/api';
import { StatCard } from '../components/StatCard';
import { LatencyGauge } from '../components/LatencyGauge';
import { LatencyChart } from '../components/LatencyChart';

export function SitioDetailPage({ sitioId, onBack }) {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar estadísticas al montar
  useEffect(() => {
    async function cargarStats() {
      try {
        const data = await getSitioStats(sitioId, token);
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error cargando stats:', err);
        setError('Error cargando estadísticas');
      } finally {
        setCargando(false);
      }
    }

    cargarStats();
  }, [sitioId, token]);

  if (cargando) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>❌ {error}</p>
        <button onClick={onBack} style={styles.backBtn}>
          ← Volver
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>Sin datos</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>
          ← Volver
        </button>
        <div>
          <h1 style={styles.title}>{stats.sitio.nombre || stats.sitio.url}</h1>
          <p style={styles.url}>{stats.sitio.url}</p>
        </div>
        <div style={styles.statusBadge}>
          {stats.ultimoLog?.is_online ? (
            <>
              <span style={styles.statusDot} />
              <span style={styles.statusText}>ONLINE</span>
            </>
          ) : (
            <>
              <span style={{ ...styles.statusDot, backgroundColor: '#dc3545' }} />
              <span style={styles.statusText}>OFFLINE</span>
            </>
          )}
        </div>
      </div>

      {/* Cards de estadísticas */}
      <div style={styles.cardsGrid}>
        <StatCard
          title="Latencia Promedio"
          value={stats.latenciaPromedio}
          unit="ms"
          color="#667eea"
          icon="⚡"
        />
        <StatCard
          title="Latencia Mínima"
          value={stats.latenciaMin}
          unit="ms"
          color="#28a745"
          icon="📉"
        />
        <StatCard
          title="Latencia Máxima"
          value={stats.latenciaMax}
          unit="ms"
          color="#dc3545"
          icon="📈"
        />
        <StatCard
          title="Uptime"
          value={stats.uptime}
          unit="%"
          color={stats.uptime >= 95 ? '#28a745' : '#ffc107'}
          icon="✅"
        />
      </div>

      {/* Gauge de latencia */}
      <div style={styles.gaugeContainer}>
        <LatencyGauge latencia={stats.latenciaPromedio} max={500} />
      </div>

      {/* Gráfico histórico */}
      {stats.logs && stats.logs.length > 0 && (
        <LatencyChart logs={stats.logs} />
      )}

      {/* Info adicional */}
      <div style={styles.infoBox}>
        <p style={styles.infoText}>
          <strong>Total de chequeos:</strong> {stats.totalChequeos}
        </p>
        {stats.ultimoLog && (
          <p style={styles.infoText}>
            <strong>Último chequeo:</strong>{' '}
            {new Date(stats.ultimoLog.created_at).toLocaleString('es-AR')}
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },

  backBtn: {
    padding: '8px 16px',
    backgroundColor: '#667eea',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },

  title: {
    margin: '0 0 4px 0',
    fontSize: '24px',
    color: '#1e1e2e',
  },

  url: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },

  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginLeft: 'auto',
  },

  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#28a745',
  },

  statusText: {
    fontWeight: '600',
    color: '#28a745',
  },

  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },

  gaugeContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },

  infoBox: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },

  infoText: {
    margin: '8px 0',
    fontSize: '14px',
    color: '#666',
  },

  loading: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#666',
    padding: '40px 0',
  },

  error: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#dc3545',
    padding: '40px 0',
  },
};