import { useState, useEffect, useContext, useRef } from 'react';
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
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    cargarStats();
    const interval = setInterval(cargarStats, 10000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [sitioId, token]);

  async function cargarStats() {
    try {
      const data = await getSitioStats(sitioId, token);
      if (mountedRef.current) {
        setStats(data);
        setError(null);
        setCargando(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Error loading stats');
        setCargando(false);
      }
    }
  }

  if (cargando) {
    return (
      <div style={styles.container}>
        <div style={styles.centerState}>
          <div style={styles.spinner} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.centerState}>
          <p style={{ color: 'var(--error)', fontSize: '15px' }}>❌ {error}</p>
          <button onClick={onBack} style={styles.backBtn}>← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const noData = !stats?.ultimoLog;

  const statusColor = noData ? 'var(--text-tertiary)' : stats.ultimoLog?.is_online ? 'var(--success)' : 'var(--error)';
  const statusLabel = noData ? 'Pending' : stats.ultimoLog?.is_online ? 'Online' : 'Offline';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={styles.title}>{stats?.sitio?.nombre || stats?.sitio?.url || 'Site'}</h1>
          <p style={styles.url}>{stats?.sitio?.url}</p>
        </div>
        <div style={{ ...styles.statusBadge, background: `${statusColor}15`, color: statusColor }}>
          <span style={{ ...styles.statusDot, background: statusColor }} />
          {statusLabel}
        </div>
      </div>

      <section style={styles.section} aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" style={styles.sectionTitle}>Key Metrics</h2>
        <div style={styles.cardsGrid}>
          <StatCard title="Avg Latency" value={stats.latenciaPromedio} unit="ms" color="var(--brand-primary)" icon="⚡" />
          <StatCard title="Min Latency" value={stats.latenciaMin} unit="ms" color="var(--success)" icon="📉" />
          <StatCard title="Max Latency" value={stats.latenciaMax} unit="ms" color="var(--error)" icon="📈" />
          <StatCard
            title="Uptime"
            value={stats.uptime}
            unit="%"
            color={stats.uptime >= 95 ? 'var(--success)' : 'var(--warning)'}
            icon="✓"
          />
        </div>
      </section>

      <div style={styles.twoCol}>
        <section style={styles.section} aria-labelledby="gauge-heading">
          <h2 id="gauge-heading" style={styles.sectionTitle}>Current Latency</h2>
          <div style={styles.gaugeCard}>
            <LatencyGauge latencia={stats.latenciaPromedio} max={500} noData={noData} />
          </div>
        </section>

        <section style={{ ...styles.section, flex: 1 }} aria-labelledby="info-heading">
          <h2 id="info-heading" style={styles.sectionTitle}>Details</h2>
          <div style={styles.infoBox}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Total checks</span>
              <span style={styles.infoValue}>{stats.totalChequeos}</span>
            </div>
            {stats.ultimoLog && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Last check</span>
                <span style={styles.infoValue}>{new Date(stats.ultimoLog.created_at).toLocaleString()}</span>
              </div>
            )}
            {stats.ultimoLog && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Status</span>
                <span style={{ ...styles.infoValue, color: statusColor }}>{statusLabel}</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {stats.logs?.length > 0 && (
        <section style={styles.section} aria-labelledby="history-heading">
          <h2 id="history-heading" style={styles.sectionTitle}>Latency History</h2>
          <LatencyChart logs={stats.logs} />
        </section>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 'var(--space-7) var(--space-8)',
    background: 'var(--bg-base)',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    background: 'var(--bg-surface)',
    padding: 'var(--space-5) var(--space-6)',
    borderRadius: 'var(--radius-lg)',
    marginBottom: 'var(--space-6)',
    border: '1px solid var(--border-subtle)',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    transition: 'all var(--transition-fast)',
  },
  title: {
    margin: '0 0 2px 0',
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  url: {
    margin: 0,
    fontSize: '13px',
    color: 'var(--text-tertiary)',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '12px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  section: {
    marginBottom: 'var(--space-6)',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 'var(--space-4)',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: 'var(--space-4)',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '360px 1fr',
    gap: 'var(--space-6)',
    marginBottom: 'var(--space-6)',
  },
  gaugeCard: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-5)',
  },
  infoBox: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-5) var(--space-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 'var(--space-3)',
    borderBottom: '1px solid var(--border-subtle)',
  },
  infoLabel: {
    fontSize: '13px',
    color: 'var(--text-tertiary)',
    fontWeight: 500,
  },
  infoValue: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
  centerState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
    gap: 'var(--space-4)',
  },
  spinner: {
    width: '22px',
    height: '22px',
    border: '2px solid var(--border-default)',
    borderTopColor: 'var(--brand-primary)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
};
