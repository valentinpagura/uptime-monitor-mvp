import { useState, useEffect, useCallback, useMemo, useRef, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getSitios, getLogs, createSitio, deleteSitio } from '../services/api';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { KpiCard } from '../components/KpiCard';
import { SitiosTable } from '../components/SitiosTable';
import { AddSiteForm } from '../components/AddSiteForm';
import { SitioDetailPage } from './SitioDetailPage';
import Particles from '../components/Particles';
import { useSpotlight } from '../hooks/useSpotlight';
import { useStaggerReveal } from '../hooks/useStaggerReveal';
import { useDebounce } from '../hooks/useDebounce';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';

export function DashboardPage() {
  const { user, token, logout } = useContext(AuthContext);
  const [sitios, setSitios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null);
  const urlInputRef = useRef(null);
  const contentRef = useRef(null);
  const kpiGridRef = useRef(null);

  useSpotlight(contentRef);
  useStaggerReveal(kpiGridRef);

  const loadSitios = useCallback(async () => {
    try {
      setError(null);
      const data = await getSitios(token);
      const sitiosList = data.sitios || [];

      const logsResults = await Promise.allSettled(
        sitiosList.map((s) => getLogs(s.id, token)),
      );

      const sitiosConEstado = sitiosList.map((sitio, i) => {
        const result = logsResults[i];
        const logs = result.status === 'fulfilled' ? result.value.logs : [];
        return { ...sitio, ultimoLog: logs.length > 0 ? logs[0] : null };
      });

      setSitios(sitiosConEstado);
    } catch (err) {
      console.error('Error cargando sitios:', err);
      setError('Error al cargar los sitios');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let mounted = true;

    loadSitios();

    const interval = setInterval(() => {
      if (mounted) loadSitios();
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [loadSitios]);

  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    const prevOverflow = document.body.style.overflow;
    const prevClass = document.body.className;

    document.body.style.backgroundColor = '#141218';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('db-active');

    return () => {
      document.body.style.backgroundColor = prevBg;
      document.body.style.overflow = prevOverflow;
      document.body.className = prevClass;
    };
  }, []);

  const handleRowClick = useCallback((sitioId) => {
    setSitioSeleccionado(sitioId);
  }, []);

  const handleDelete = useCallback(
    async (sitioId) => {
      try {
        await deleteSitio(sitioId, token);
        loadSitios();
      } catch (err) {
        console.error('Error eliminando sitio:', err);
      }
    },
    [token, loadSitios],
  );

  const handleRefresh = useCallback(() => {
    loadSitios();
  }, [loadSitios]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleAddSite = useCallback(
    async (url, nombre, frecuencia) => {
      await createSitio(url, nombre, frecuencia, token);
      loadSitios();
    },
    [token, loadSitios],
  );

  const handleAddProbe = useCallback(() => {
    if (urlInputRef.current) {
      urlInputRef.current.focus();
      urlInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const filteredSitios = useMemo(() => {
    if (!debouncedSearch) return sitios;

    const q = debouncedSearch.toLowerCase();
    return sitios.filter(
      (s) => (s.nombre && s.nombre.toLowerCase().includes(q)) || s.url.toLowerCase().includes(q),
    );
  }, [sitios, debouncedSearch]);

  const { kpis } = useDashboardMetrics(sitios);

  if (sitioSeleccionado) {
    return <SitioDetailPage sitioId={sitioSeleccionado} onBack={() => setSitioSeleccionado(null)} />;
  }

  return (
    <div style={styles.layout}>
      <Sidebar onAddProbe={handleAddProbe} onLogout={logout} />
      <main style={styles.main}>
        <div style={styles.particlesWrap}>
          <Particles
            particleCount={100}
            particleSpread={5}
            speed={0.05}
            particleColors={['#cfbcff', '#6750a4']}
            alphaParticles={true}
            particleBaseSize={80}
            sizeRandomness={0.5}
            cameraDistance={15}
            disableRotation={false}
            pixelRatio={1}
          />
        </div>
        <TopBar searchValue={searchQuery} onSearchChange={handleSearchChange} onRefresh={handleRefresh} />
        <div ref={contentRef} style={styles.content} className="db-content">
          <div style={styles.headerRow}>
            <p style={styles.pageSubtitle}>
              Monitoring {sitios.length} active endpoint{sitios.length !== 1 ? 's' : ''} globally.
            </p>
          </div>

          <div ref={kpiGridRef} style={styles.kpiGrid}>
            <KpiCard label="Passing Sites" value={kpis.passing.toLocaleString()} variant="primary" />
            <KpiCard label="Warnings" value={kpis.warnings.toLocaleString()} variant="warning" />
            <KpiCard label="Failed" value={kpis.failed.toLocaleString()} variant="error" />
            <KpiCard label="Global Avg Latency" value={kpis.avgLatencia} unit="ms" variant="neutral" />
          </div>

          {error && <p style={styles.errorBanner}>{error}</p>}

          <div className="db-dashboard-grid">
            <AddSiteForm onSubmit={handleAddSite} inputRef={urlInputRef} />
            <SitiosTable sitios={filteredSitios} onRowClick={handleRowClick} onDelete={handleDelete} />
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  main: {
    marginLeft: '256px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: 'var(--db-bg-main)',
    position: 'relative',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    position: 'relative',
    zIndex: 1,
  },
  headerRow: {
    marginBottom: '24px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: 'var(--auth-on-surface-variant)',
    margin: 0,
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  particlesWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 180, 171, 0.1)',
    border: '1px solid var(--auth-error)',
    color: 'var(--auth-error)',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
  },
};
