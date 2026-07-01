import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getSitioStats } from '../services/api';
import { StatCard } from '../components/StatCard';
import { LatencyGauge } from '../components/LatencyGauge';
import { LatencyChart } from '../components/LatencyChart';
import { gsap } from 'gsap';

function SkeletonBlocks() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div className="db-skeleton" style={{ width: '80px', height: '36px', borderRadius: '9999px', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="db-skeleton" style={{ width: '60%', height: '24px', marginBottom: '8px', borderRadius: '4px' }} />
          <div className="db-skeleton" style={{ width: '40%', height: '14px', borderRadius: '4px' }} />
        </div>
        <div className="db-skeleton" style={{ width: '90px', height: '28px', borderRadius: '9999px' }} />
      </div>
      <div style={styles.cardsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={styles.skeletonCard}>
            <div className="db-skeleton" style={{ width: '40%', height: '12px', marginBottom: '12px', borderRadius: '4px' }} />
            <div className="db-skeleton" style={{ width: '60%', height: '28px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
      <div style={{ ...styles.gaugeContainer, padding: '20px' }}>
        <div className="db-skeleton" style={{ width: '200px', height: '140px', margin: '0 auto', borderRadius: '8px' }} />
      </div>
      <div style={{ ...styles.chartSkeleton, padding: '20px' }}>
        <div className="db-skeleton" style={{ width: '180px', height: '16px', marginBottom: '16px', borderRadius: '4px' }} />
        <div className="db-skeleton" style={{ width: '100%', height: '200px', borderRadius: '4px' }} />
      </div>
      <div style={styles.infoBox}>
        <div className="db-skeleton" style={{ width: '30%', height: '14px', marginBottom: '8px', borderRadius: '4px' }} />
        <div className="db-skeleton" style={{ width: '45%', height: '14px', borderRadius: '4px' }} />
      </div>
    </div>
  );
}

export function SitioDetailPage({ sitioId, onBack }) {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const sinDatos = stats && stats.totalChequeos === 0;
  const pageRef = useRef(null);

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const node = pageRef.current;
    if (!prefersReducedMotion && node) {
      gsap.fromTo(
        node,
        { opacity: 0 },
        { opacity: 1, duration: 0.15, ease: 'power2.out' },
      );
    }
    return () => {
      gsap.killTweensOf(node);
    };
  }, [prefersReducedMotion]);

  function handleBack() {
    if (prefersReducedMotion) {
      onBack();
      return;
    }
    gsap.to(pageRef.current, {
      opacity: 0,
      duration: 0.1,
      ease: 'power2.in',
      onComplete: onBack,
    });
  }

  useEffect(() => {
    const node = pageRef.current;
    let mounted = true;

    async function cargarStats() {
      try {
        const data = await getSitioStats(sitioId, token);
        if (!mounted) return;
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error cargando stats:', err);
        if (!mounted) return;
        setError('Error cargando estadísticas');
      } finally {
        if (mounted) setCargando(false);
      }
    }

    cargarStats();
    return () => {
      mounted = false;
      gsap.killTweensOf(node);
    };
  }, [sitioId, token]);

  if (cargando) {
    return <div ref={pageRef}><SkeletonBlocks /></div>;
  }

  if (error) {
    return (
      <div ref={pageRef} style={styles.container}>
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠️</span>
          <p style={styles.errorText}>{error}</p>
          <button onClick={handleBack} style={styles.backBtn}>
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  if (!stats || sinDatos) {
    return (
      <div ref={pageRef} style={styles.container}>
        <div style={styles.emptyBox}>
          <span style={styles.emptyIcon}>📊</span>
          <p style={styles.emptyTitle}>Sin datos de monitoreo</p>
          <p style={styles.emptyDesc}>
            Este sitio se agregó recientemente. Los datos aparecerán después del próximo chequeo automático.
          </p>
          <button onClick={handleBack} style={styles.backBtn}>
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const sitioNombre = stats.sitio?.nombre || stats.sitio?.url || 'Sitio';
  const sitioUrl = stats.sitio?.url || '';
  const ultimoLog = stats.ultimoLog;
  const isOnline = ultimoLog?.is_online ?? false;

  return (
    <div ref={pageRef} style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleBack} style={styles.backBtn}>
          ← Volver
        </button>
        <div style={{ minWidth: 0 }}>
          <h1 style={styles.title}>{sitioNombre}</h1>
          <p style={styles.url}>{sitioUrl}</p>
        </div>
        <div style={styles.statusBadge}>
          {isOnline ? (
            <>
              <span style={styles.statusDot} />
              <span style={styles.statusText}>ONLINE</span>
            </>
          ) : (
            <>
              <span style={{ ...styles.statusDot, backgroundColor: 'var(--auth-error)' }} />
              <span style={{ ...styles.statusText, color: 'var(--auth-error)' }}>OFFLINE</span>
            </>
          )}
        </div>
      </div>

      <div style={styles.cardsGrid}>
        <StatCard
          title="Latencia Promedio"
          value={stats.latenciaPromedio}
          unit="ms"
          color="var(--auth-primary)"
          icon="⚡"
        />
        <StatCard
          title="Latencia Mínima"
          value={stats.latenciaMin}
          unit="ms"
          color="#4ade80"
          icon="📉"
        />
        <StatCard
          title="Latencia Máxima"
          value={stats.latenciaMax}
          unit="ms"
          color="#ff6b6b"
          icon="📈"
        />
        <StatCard
          title="Uptime"
          value={stats.uptime}
          unit="%"
          color={(stats.uptime ?? 0) >= 95 ? '#4ade80' : '#e7c365'}
          icon="✅"
        />
      </div>

      <div style={styles.gaugeContainer}>
        <LatencyGauge latencia={stats.latenciaPromedio} max={500} />
      </div>

      {stats.logs && stats.logs.length > 0 && (
        <LatencyChart logs={stats.logs} />
      )}

      <div style={styles.infoBox}>
        <p style={styles.infoText}>
          <strong>Total de chequeos:</strong> {stats.totalChequeos}
        </p>
        {ultimoLog && (
          <p style={styles.infoText}>
            <strong>Último chequeo:</strong>{' '}
            {new Date(ultimoLog.created_at).toLocaleString('es-AR')}
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: 'var(--db-bg-main)',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: 'var(--db-bg-card)',
    border: '1px solid var(--db-border-card)',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  backBtn: {
    padding: '8px 20px',
    background: 'linear-gradient(135deg, var(--auth-primary) 0%, var(--auth-primary-container) 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '24px',
    color: 'var(--auth-on-surface)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  url: {
    margin: 0,
    fontSize: '14px',
    color: 'var(--auth-on-surface-variant)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginLeft: 'auto',
    flexShrink: 0,
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#4ade80',
  },
  statusText: {
    fontWeight: '600',
    color: '#4ade80',
    fontSize: '13px',
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
    backgroundColor: 'var(--db-bg-card)',
    border: '1px solid var(--db-border-card)',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '20px',
  },
  infoText: {
    margin: '8px 0',
    fontSize: '14px',
    color: 'var(--auth-on-surface-variant)',
  },
  errorBox: {
    backgroundColor: 'var(--db-bg-card)',
    border: '1px solid var(--auth-error-container)',
    borderRadius: '8px',
    padding: '40px 20px',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '32px',
    display: 'block',
    marginBottom: '12px',
  },
  errorText: {
    fontSize: '16px',
    color: 'var(--auth-error)',
    marginBottom: '20px',
  },
  emptyBox: {
    backgroundColor: 'var(--db-bg-card)',
    border: '1px solid var(--db-border-card)',
    borderRadius: '8px',
    padding: '60px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    color: 'var(--auth-on-surface)',
    fontWeight: 600,
    marginBottom: '8px',
  },
  emptyDesc: {
    fontSize: '14px',
    color: 'var(--auth-on-surface-variant)',
    maxWidth: '400px',
    margin: '0 auto 24px',
    lineHeight: 1.5,
  },
  chartSkeleton: {
    backgroundColor: 'var(--db-bg-card)',
    border: '1px solid var(--db-border-card)',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  skeletonCard: {
    backgroundColor: 'var(--db-bg-card)',
    border: '1px solid var(--db-border-card)',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
  },
};
