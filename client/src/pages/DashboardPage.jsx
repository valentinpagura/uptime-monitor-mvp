import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getSitios, deleteSitio, getLogs } from '../services/api';
import { CreateSitioForm } from '../components/Forms/CreateSitioForm';
import { Layout } from '../components/Layout';
import { KpiCard } from '../components/KpiCard';
import { SitiosTable } from '../components/SitiosTable';
import { LatencyChart } from '../components/LatencyChart';
import { SitioDetailPage } from './SitioDetailPage';

export function DashboardPage() {
  const { token, user, logout } = useContext(AuthContext);
  const [sitios, setSitios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [loadingLogs, setLoadingLogs] = useState({});
  const [logsHistory, setLogsHistory] = useState([]);
  const [deleteError, setDeleteError] = useState(null);
  const tableRef = useRef(null);

  useEffect(() => {
    loadSitios();
    const interval = setInterval(loadSitios, 10000);
    return () => clearInterval(interval);
  }, [token]);

  async function loadSitios() {
    try {
      const data = await getSitios(token);
      const list = data.sitios || [];
      setSitios(list);
      list.forEach((s) => fetchUltimoLog(s.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUltimoLog(sitioId) {
    try {
      const data = await getLogs(sitioId, token);
      if (data.logs?.length) {
        setLoadingLogs((prev) => ({ ...prev, [sitioId]: data.logs[0] }));
        const incoming = data.logs.slice(0, 10);
        setLogsHistory((prev) => {
          const unique = incoming.filter((l) => !prev.some((p) => p.id === l.id));
          if (unique.length === 0) return prev;
          const combined = [...prev, ...unique];
          return combined.slice(-150);
        });
      }
    } catch {}
  }

  async function handleDelete(sitioId) {
    setDeleteError(null);
    try {
      await deleteSitio(sitioId, token);
      loadSitios();
    } catch (err) {
      setDeleteError(err.message);
    }
  }

  function handleNavigate(view) {
    setActiveView(view);
  }

  const onlineCount = sitios.filter((s) => loadingLogs[s.id]?.is_online).length;
  const offlineCount = sitios.filter((s) => loadingLogs[s.id] && !loadingLogs[s.id].is_online).length;
  const sinDatos = sitios.length - onlineCount - offlineCount;

  const latencias = sitios.map((s) => loadingLogs[s.id]?.latencia_ms).filter(Boolean);
  const latenciaPromedio = latencias.length
    ? Math.round(latencias.reduce((a, b) => a + b, 0) / latencias.length)
    : 0;

  if (sitioSeleccionado) {
    return <SitioDetailPage sitioId={sitioSeleccionado} onBack={() => setSitioSeleccionado(null)} />;
  }

  const kpis = [
    { title: 'Passing', value: onlineCount, icon: '✓', status: 'stable' },
    { title: 'Warning', value: sinDatos, icon: '!', status: sinDatos > 0 ? 'warning' : 'stable' },
    { title: 'Failed', value: offlineCount, icon: '✕', status: offlineCount > 0 ? 'down' : 'stable' },
    {
      title: 'Avg Latency',
      value: `${latenciaPromedio}ms`,
      icon: '⚡',
      status: latenciaPromedio < 200 ? 'stable' : latenciaPromedio < 400 ? 'warning' : 'down',
    },
  ];

  const dashboardViews = {
    dashboard: (
      <>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.subtitle}>
              {sitios.length} site{sitios.length !== 1 ? 's' : ''} monitored
            </p>
          </div>
        </div>

        <div style={styles.kpiRow}>
          {kpis.map((k, i) => (
            <KpiCard key={i} title={k.title} value={k.value} icon={k.icon} status={k.status} />
          ))}
        </div>

        <div style={styles.chartSection}>
          <LatencyChart logs={logsHistory} />
        </div>

        <div style={styles.sectionCard}>
          <CreateSitioForm onSitioCreated={loadSitios} />
        </div>

        <div ref={tableRef} style={{ marginTop: 'var(--space-6)' }}>
          <SitiosTable sitios={sitios} onSelect={setSitioSeleccionado} onDelete={handleDelete} loadingLogs={loadingLogs} />
        </div>

        {deleteError && (
          <div style={styles.errorBanner}>⚠️ {deleteError}</div>
        )}
      </>
    ),

    sitios: (
      <>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>All Sites</h1>
            <p style={styles.subtitle}>Manage your monitored websites</p>
          </div>
        </div>

        <div style={styles.sectionCard}>
          <CreateSitioForm onSitioCreated={loadSitios} />
        </div>

        {deleteError && <div style={styles.errorBanner}>⚠️ {deleteError}</div>}

        <div style={{ marginTop: 'var(--space-6)' }}>
          <SitiosTable sitios={sitios} onSelect={setSitioSeleccionado} onDelete={handleDelete} loadingLogs={loadingLogs} />
        </div>
      </>
    ),

    historial: (
      <>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Activity</h1>
            <p style={styles.subtitle}>Recent checks across all sites</p>
          </div>
        </div>

        <div style={styles.activityCard}>
          <LatencyChart logs={logsHistory} />
        </div>
      </>
    ),
  };

  return (
    <Layout
      userEmail={user?.email}
      onLogout={logout}
      activeItem={activeView}
      onNavigate={handleNavigate}
    >
      <div style={styles.content}>
        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
            <span>Loading...</span>
          </div>
        ) : (
          dashboardViews[activeView]
        )}
      </div>
    </Layout>
  );
}

const styles = {
  content: {},
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 'var(--space-6)',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 2px 0',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-tertiary)',
    margin: 0,
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-5)',
  },
  chartSection: {
    marginBottom: 'var(--space-6)',
  },
  sectionCard: {
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-subtle)',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'var(--error-bg)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    color: 'var(--error)',
    marginTop: 'var(--space-4)',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
    gap: 'var(--space-4)',
    color: 'var(--text-tertiary)',
    fontSize: '14px',
  },
  spinner: {
    width: '22px',
    height: '22px',
    border: '2px solid var(--border-default)',
    borderTopColor: 'var(--brand-primary)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  activityCard: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
  },
};
