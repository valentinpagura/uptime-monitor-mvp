import { useState, useEffect, useContext, useRef, useCallback, lazy, Suspense } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getSitioDashboard } from '../services/api';
import { StatCard } from '../components/StatCard';
import { LatencyGauge } from '../components/LatencyGauge';
import { RangeSelector } from '../components/RangeSelector';
import { getStatus } from '../utils/status';
import { formatLocalDateTime } from '../utils/formatLocalTime';
import { usePolling } from '../hooks/usePolling';
import { gsap } from 'gsap';

const LatencyChart = lazy(() =>
  import('../components/LatencyChart').then((m) => ({ default: m.LatencyChart }))
);

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
  const [dashboard, setDashboard] = useState(null);
  const [range, setRange] = useState('24h');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
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

  const cargarDashboard = useCallback(async () => {
    try {
      const data = await getSitioDashboard(sitioId, token, range);
      setDashboard(data);
      setError(null);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError('Error cargando dashboard');
    } finally {
      setCargando(false);
    }
  }, [sitioId, token, range]);

  const { refresh } = usePolling(cargarDashboard, 10000);

  const handleRangeChange = useCallback((newRange) => {
    setRange(newRange);
    setCargando(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [range]);

  if (cargando) {
    return <div ref={pageRef}><SkeletonBlocks /></div>;
  }

  if (error) {
    return (
      <div ref={pageRef} style={styles.container}>
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>{'\u26A0\uFE0F'}</span>
          <p style={styles.errorText}>{error}</p>
          <button onClick={handleBack} style={styles.backBtn}>
            {'\u2190'} Volver
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard || !dashboard.resumen) {
    return (
      <div ref={pageRef} style={styles.container}>
        <div style={styles.emptyBox}>
          <span style={styles.emptyIcon}>{'\uD83D\uDCCA'}</span>
          <p style={styles.emptyTitle}>Sin datos de monitoreo</p>
          <p style={styles.emptyDesc}>
            Este sitio se agregó recientemente. Los datos aparecerán después del próximo chequeo automático.
          </p>
          <button onClick={handleBack} style={styles.backBtn}>
            {'\u2190'} Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalGlobal = dashboard.totalGlobal ?? 0;
  const totalChequeos = dashboard.resumen.totalChequeos ?? 0;
  const isTrulyEmpty = totalChequeos === 0 && totalGlobal === 0;
  const isRangeEmpty = totalChequeos === 0 && totalGlobal > 0;

  if (isTrulyEmpty) {
    return (
      <div ref={pageRef} style={styles.container}>
        <div style={styles.emptyBox}>
          <span style={styles.emptyIcon}>{'\uD83D\uDCCA'}</span>
          <p style={styles.emptyTitle}>Sin datos de monitoreo</p>
          <p style={styles.emptyDesc}>
            Este sitio se agregó recientemente. Los datos aparecerán después del próximo chequeo automático.
          </p>
          <button onClick={handleBack} style={styles.backBtn}>
            {'\u2190'} Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isRangeEmpty) {
    return (
      <div ref={pageRef} style={styles.container}>
        <div style={styles.header}>
          <button onClick={handleBack} style={styles.backBtn}>
            {'\u2190'} Volver
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 style={styles.title}>{dashboard.sitio?.nombre || dashboard.sitio?.url || 'Sitio'}</h1>
            <p style={styles.url}>{dashboard.sitio?.url || ''}</p>
          </div>
        </div>
        <div style={styles.rangeRow}>
          <RangeSelector activeRange={dashboard.range || range} onRangeChange={handleRangeChange} />
        </div>
        <div style={styles.emptyBox}>
          <span style={styles.emptyIcon}>{'\uD83D\uDCCD'}</span>
          <p style={styles.emptyTitle}>Sin datos en este rango</p>
          <p style={styles.emptyDesc}>
            Este sitio tiene {totalGlobal} chequeos registrados, pero ninguno en el rango {dashboard.range || range}. Probá con un rango mayor.
          </p>
        </div>
      </div>
    );
  }

  const sitioNombre = dashboard.sitio?.nombre || dashboard.sitio?.url || 'Sitio';
  const sitioUrl = dashboard.sitio?.url || '';
  const resumen = dashboard.resumen;
  const timeline = dashboard.timeline || [];
  const rangeInfo = dashboard.range || range;

  const ultimoLog = timeline.length > 0
    ? {
        latencia_ms: timeline[timeline.length - 1].latencia_promedio,
        is_online: timeline[timeline.length - 1].was_online,
        created_at: timeline[timeline.length - 1].bucket,
      }
    : null;
  const status = getStatus(ultimoLog);

  const ultimoLogTime = timeline.length > 0 ? timeline[timeline.length - 1].bucket : null;

  return (
    <div ref={pageRef} style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleBack} style={styles.backBtn}>
          {'\u2190'} Volver
        </button>
        <div style={{ minWidth: 0 }}>
          <h1 style={styles.title}>{sitioNombre}</h1>
          <p style={styles.url}>{sitioUrl}</p>
        </div>
        <div style={styles.statusBadge}>
          <span style={{ ...styles.statusDot, backgroundColor: status.dotColor }} />
          <span style={{ ...styles.statusText, color: status.color }}>{status.label}</span>
        </div>
      </div>

      <div style={styles.rangeRow}>
        <RangeSelector activeRange={rangeInfo} onRangeChange={handleRangeChange} />
      </div>

      <div style={styles.cardsGrid}>
        <StatCard
          title="Current Latency"
          value={ultimoLog?.latencia_ms ?? null}
          unit="ms"
          color={
            ultimoLog?.latencia_ms == null
              ? 'var(--db-outline-variant)'
              : ultimoLog.latencia_ms < 200
                ? '#4ade80'
                : ultimoLog.latencia_ms < 400
                  ? '#e7c365'
                  : '#ff6b6b'
          }
          icon={'\u26A1'}
        />
        <StatCard
          title="Historical Average"
          value={resumen.latenciaPromedio}
          unit="ms"
          color="var(--auth-primary)"
          icon={'\uD83D\uDCCA'}
        />
        <StatCard
          title="Latencia M\u00EDnima"
          value={resumen.latenciaMin}
          unit="ms"
          color="#4ade80"
          icon={'\uD83D\uDCC9'}
        />
        <StatCard
          title="Latencia M\u00E1xima"
          value={resumen.latenciaMax}
          unit="ms"
          color="#ff6b6b"
          icon={'\uD83D\uDCC8'}
        />
        <StatCard
          title="Uptime"
          value={resumen.uptime}
          unit="%"
          color={(resumen.uptime ?? 0) >= 95 ? '#4ade80' : '#e7c365'}
          icon={'\u2705'}
        />
      </div>

      <div style={styles.gaugeContainer}>
        <LatencyGauge
          latencia={ultimoLog?.latencia_ms ?? null}
          maxLatencia={resumen.latenciaMax}
        />
      </div>

      <Suspense fallback={<div className="db-skeleton" style={{ ...styles.chartSkeleton, height: '260px', padding: '20px' }} />}>
        {timeline.length > 0 && (
          <LatencyChart timeline={timeline} range={rangeInfo} />
        )}
      </Suspense>

      <div style={styles.infoBox}>
        <p style={styles.infoText}>
          <strong>Total de chequeos:</strong> {resumen.totalChequeos}
        </p>
        <p style={styles.infoText}>
          <strong>Rango:</strong> {rangeInfo}
        </p>
        {ultimoLogTime && (
          <p style={styles.infoText}>
            <strong>\u00DAltimo chequeo:</strong>{' '}
            {formatLocalDateTime(ultimoLogTime)}
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
    marginBottom: '12px',
  },
  rangeRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '16px',
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
