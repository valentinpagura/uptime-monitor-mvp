import { useState, useCallback, useRef, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ToastContext } from '../contexts/ToastContext';
import { createSitio, deleteSitio } from '../services/api';
import { useDashboardData } from '../hooks/useDashboardData';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { KpiCard } from '../components/KpiCard';
import { SitiosTable } from '../components/SitiosTable';
import { AddSiteForm } from '../components/AddSiteForm';
import { ConfirmModal } from '../components/ConfirmModal';
import { RangeSelector } from '../components/RangeSelector';
import { SitioDetailPage } from './SitioDetailPage';
import Particles from '../components/Particles';
import { useSpotlight } from '../hooks/useSpotlight';
import { useStaggerReveal } from '../hooks/useStaggerReveal';

function OverviewView({ resumen, tendencias, loading, error, range, onRangeChange, sitios, searchQuery, onRowClick, onDeleteRequest, onSubmit, inputRef, kpiGridRef }) {
  return (
    <>
      <div style={styles.headerRow}>
        <div style={styles.headerLeft}>
          <p style={styles.pageSubtitle}>
            Monitoring {sitios.length} active endpoint{sitios.length !== 1 ? 's' : ''} globally.
          </p>
        </div>
        <RangeSelector activeRange={range} onRangeChange={onRangeChange} />
      </div>

      {loading && !resumen ? (
        <div ref={kpiGridRef} style={styles.kpiGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ ...styles.skeletonCard, height: '112px' }} className="db-skeleton" />
          ))}
        </div>
      ) : (
        <div ref={kpiGridRef} style={styles.kpiGrid}>
          <KpiCard label="Passing" value={resumen?.passing ?? '\u2014'} variant="primary" />
          <KpiCard label="Warning" value={resumen?.warning ?? '\u2014'} variant="warning" />
          <KpiCard label="Slow" value={resumen?.slow ?? '\u2014'} variant="error" />
          <KpiCard label="Down" value={resumen?.down ?? '\u2014'} variant="error" />
          <KpiCard label="Sin datos" value={resumen?.sinDatos ?? '\u2014'} variant="neutral" />
          <KpiCard label="Avg Latency" value={resumen?.promedioGlobal} unit="ms" variant="neutral" trend={tendencias?.promedioGlobal} />
          <KpiCard label="Uptime" value={resumen?.uptimeGlobal != null ? `${resumen.uptimeGlobal}%` : '\u2014'} variant="primary" trend={tendencias?.uptimeGlobal} />
          <KpiCard label="Total Checks" value={resumen ? (resumen.passing + resumen.warning + resumen.slow + resumen.down + resumen.sinDatos) : '\u2014'} variant="neutral" trend={tendencias?.totalChequeos} />
        </div>
      )}

      {error && <p style={styles.errorBanner}>{error}</p>}

      <div className="db-dashboard-grid">
        <AddSiteForm onSubmit={onSubmit} inputRef={inputRef} />
        <SitiosTable sitios={sitios} onRowClick={onRowClick} onDelete={onDeleteRequest} searchQuery={searchQuery} />
      </div>
    </>
  );
}

function MonitorsView({ sitios, searchQuery, onRowClick, onDeleteRequest }) {
  return (
    <div style={styles.viewContent}>
      <h2 style={styles.viewTitle}>All Monitors</h2>
      <p style={styles.pageSubtitle}>
        {sitios.length} monitor{sitios.length !== 1 ? 's' : ''} configured
      </p>
      <SitiosTable sitios={sitios} onRowClick={onRowClick} onDelete={onDeleteRequest} searchQuery={searchQuery} />
    </div>
  );
}

function AnalyticsView({ resumen, tendencias, totalSitios, totalChequeos, loading, error, range, onRangeChange }) {
  return (
    <div style={styles.viewContent}>
      <div style={styles.headerRow}>
        <h2 style={styles.viewTitle}>Analytics</h2>
        <RangeSelector activeRange={range} onRangeChange={onRangeChange} />
      </div>

      {loading && !resumen ? (
        <div style={styles.kpiGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ ...styles.skeletonCard, height: '112px' }} className="db-skeleton" />
          ))}
        </div>
      ) : resumen ? (
        <>
          <div style={styles.kpiGrid}>
            <KpiCard label="Passing" value={resumen.passing} variant="primary" />
            <KpiCard label="Warning" value={resumen.warning} variant="warning" />
            <KpiCard label="Slow" value={resumen.slow} variant="error" />
            <KpiCard label="Down" value={resumen.down} variant="error" />
            <KpiCard label="Sin datos" value={resumen.sinDatos} variant="neutral" />
            <KpiCard label="Avg Latency" value={resumen.promedioGlobal} unit="ms" variant="neutral" trend={tendencias?.promedioGlobal} />
            <KpiCard label="Uptime" value={resumen.uptimeGlobal != null ? `${resumen.uptimeGlobal}%` : '\u2014'} variant="primary" trend={tendencias?.uptimeGlobal} />
            <KpiCard label="Total Checks" value={totalChequeos} variant="neutral" trend={tendencias?.totalChequeos} />
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Min Latency</span>
              <span style={styles.statValue}>{resumen.minLatencia != null ? `${resumen.minLatencia}ms` : '\u2014'}</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Max Latency</span>
              <span style={styles.statValue}>{resumen.maxLatencia != null ? `${resumen.maxLatencia}ms` : '\u2014'}</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Sites</span>
              <span style={styles.statValue}>{totalSitios}</span>
            </div>
          </div>
        </>
      ) : (
        !loading && <p style={styles.emptyText}>No hay datos disponibles para este rango.</p>
      )}

      {error && <p style={styles.errorBanner}>{error}</p>}
    </div>
  );
}

function SettingsView() {
  return (
    <div style={styles.viewContent}>
      <h2 style={styles.viewTitle}>Settings</h2>
      <div style={styles.comingSoon}>
        <span style={styles.comingSoonIcon}>{'\u2699\uFE0F'}</span>
        <p style={styles.comingSoonText}>Coming Soon</p>
        <p style={styles.comingSoonSub}>Configuration options will be available in a future update.</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { token, logout } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const urlInputRef = useRef(null);
  const contentRef = useRef(null);
  const kpiGridRef = useRef(null);

  const dashboardData = useDashboardData(token);
  const { data, loading, error, refresh, range, setRange, resumen, tendencias, sitios, totalSitios, totalChequeos } = dashboardData;

  useSpotlight(contentRef);
  useStaggerReveal(kpiGridRef);

  const handleRowClick = useCallback((sitioId) => {
    setSitioSeleccionado(sitioId);
  }, []);

  const handleDeleteRequest = useCallback((sitioId) => {
    setDeleteTarget(sitioId);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteSitio(deleteTarget, token);
      addToast('Monitor deleted successfully', 'success');
      refresh();
    } catch (err) {
      addToast('Failed to delete monitor', 'error');
      console.error('Error eliminando sitio:', err);
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, token, refresh, addToast]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleAddSite = useCallback(
    async (url, nombre, frecuencia) => {
      await createSitio(url, nombre, frecuencia, token);
      addToast('Monitor created successfully', 'success');
      refresh();
    },
    [token, refresh, addToast],
  );

  const handleAddProbe = useCallback(() => {
    if (urlInputRef.current) {
      urlInputRef.current.focus();
      urlInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleSearchSelect = useCallback((sitioId) => {
    setSearchQuery('');
    setSitioSeleccionado(sitioId);
  }, []);

  const handleSearchClose = useCallback(() => {
    setSearchQuery('');
  }, []);

  if (sitioSeleccionado) {
    return <SitioDetailPage sitioId={sitioSeleccionado} onBack={() => setSitioSeleccionado(null)} />;
  }

  return (
    <div style={styles.layout}>
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} onAddProbe={handleAddProbe} onLogout={logout} />
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
        <TopBar
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          onRefresh={handleRefresh}
          sitios={sitios}
          onSearchSelect={handleSearchSelect}
          onSearchClose={handleSearchClose}
        />
        <div ref={contentRef} style={styles.content} className="db-content">
          {activeSection === 'overview' && (
            <OverviewView
              resumen={resumen}
              tendencias={tendencias}
              loading={loading}
              error={error}
              range={range}
              onRangeChange={setRange}
              sitios={sitios}
              searchQuery={searchQuery}
              onRowClick={handleRowClick}
              onDeleteRequest={handleDeleteRequest}
              onSubmit={handleAddSite}
              inputRef={urlInputRef}
              kpiGridRef={kpiGridRef}
            />
          )}
          {activeSection === 'monitors' && (
            <MonitorsView
              sitios={sitios}
              searchQuery={searchQuery}
              onRowClick={handleRowClick}
              onDeleteRequest={handleDeleteRequest}
            />
          )}
          {activeSection === 'analytics' && (
            <AnalyticsView
              resumen={resumen}
              tendencias={tendencias}
              totalSitios={totalSitios}
              totalChequeos={totalChequeos}
              loading={loading}
              error={error}
              range={range}
              onRangeChange={setRange}
            />
          )}
          {activeSection === 'settings' && <SettingsView />}
        </div>
      </main>
      <ConfirmModal
        isOpen={deleteTarget != null}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Monitor"
        description="Are you sure you want to delete this monitor? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
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
  viewContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  viewTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--auth-on-surface)',
    margin: 0,
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: 'var(--auth-on-surface-variant)',
    margin: 0,
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  skeletonCard: {
    borderRadius: '8px',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    marginTop: '8px',
  },
  statBox: {
    backgroundColor: 'var(--db-bg-card)',
    border: '1px solid var(--db-border-card)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--auth-on-surface-variant)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 500,
    fontFamily: "'Courier New', Courier, monospace",
    color: 'var(--auth-on-surface)',
  },
  emptyText: {
    textAlign: 'center',
    color: 'var(--auth-on-surface-variant)',
    fontSize: '14px',
    padding: '40px 0',
    fontStyle: 'italic',
  },
  comingSoon: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
  },
  comingSoonIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  comingSoonText: {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--auth-on-surface)',
    margin: '0 0 8px',
  },
  comingSoonSub: {
    fontSize: '14px',
    color: 'var(--auth-on-surface-variant)',
    margin: 0,
  },
};
