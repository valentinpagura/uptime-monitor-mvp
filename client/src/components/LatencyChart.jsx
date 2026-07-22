import { memo, useMemo, useRef, useCallback, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { formatLocalDateTime } from '../utils/formatLocalTime';
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  zoomPlugin,
);

function downsample(points, maxPoints) {
  if (points.length <= maxPoints) return points;
  const step = points.length / maxPoints;
  return points.filter((_, i) => Math.floor(i % step) === 0);
}

export const LatencyChart = memo(function LatencyChart({ timeline, range }) {
  const chartRef = useRef(null);
  const prefersReducedMotion = useMemo(
    () => (typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false),
    [],
  );

  const resetZoom = useCallback(() => {
    if (chartRef.current) chartRef.current.resetZoom();
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && chartRef.current) chartRef.current.resetZoom();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { data, options } = useMemo(() => {
    if (!timeline || timeline.length === 0) {
      return { data: { datasets: [] }, options: {} };
    }

    const downsampled = downsample(timeline, 300);

    const data = {
      datasets: [
        {
          label: 'Latencia (ms)',
          data: downsampled.map((point) => {
            const date = point.bucket ? new Date(point.bucket) : null;
            return {
              x: date && !isNaN(date.getTime()) ? date : null,
              y: point.was_online ? point.latencia_promedio : null,
            };
          }).filter((p) => p.x !== null),
          borderColor: '#cfbcff',
          backgroundColor: 'rgba(207, 188, 255, 0.08)',
          borderWidth: 1.5,
          tension: 0.15,
          spanGaps: false,
          fill: true,
          pointRadius: downsampled.length > 100 ? 0 : 2,
          pointHoverRadius: 5,
          pointBackgroundColor: '#cfbcff',
          pointBorderColor: 'transparent',
        },
      ],
    };

    const isShortRange = ['1h', '24h'].includes(range);

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: prefersReducedMotion ? false : { duration: 200 },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1d1b20',
          titleColor: '#e6e0e9',
          bodyColor: '#cbc4d2',
          borderColor: '#494551',
          borderWidth: 1,
          padding: 14,
          cornerRadius: 8,
          bodyFont: { family: "'JetBrains Mono', 'Fira Code', monospace" },
          callbacks: {
            title(items) {
              if (!items.length) return '';
              const raw = items[0].raw;
              if (raw && raw.x) {
                return formatLocalDateTime(raw.x);
              }
              return '';
            },
            label(item) {
              const raw = item.raw;
              if (!raw) return '';
              if (raw.y == null) return 'Offline  \u2014  Sin respuesta';
              const ms = raw.y;
              if (ms >= 400) return `Online  \u00B7  ${ms} ms  \u2014  Lento`;
              if (ms >= 200) return `Online  \u00B7  ${ms} ms  \u2014  Advertencia`;
              return `Online  \u00B7  ${ms} ms  \u2014  Normal`;
            },
          },
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x',
            modifierKey: 'shift',
          },
          zoom: {
            wheel: { enabled: true, speed: 0.05, modifierKey: 'shift' },
            pinch: { enabled: true },
            drag: { enabled: true, backgroundColor: 'rgba(207, 188, 255, 0.08)', borderColor: '#cfbcff', borderWidth: 1 },
            mode: 'x',
          },
        },
      },
      scales: {
        x: {
          type: 'time',
          grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          ticks: {
            color: '#cbc4d2',
            font: { size: 11 },
            maxTicksLimit: isShortRange ? 12 : 8,
            autoSkip: true,
          },
          time: {
            unit: isShortRange ? 'minute' : 'day',
            displayFormats: {
              minute: 'HH:mm',
              hour: 'HH:mm',
              day: 'MMM d',
              month: 'MMM yyyy',
            },
            tooltipFormat: isShortRange ? 'HH:mm' : 'MMM d, HH:mm',
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          ticks: {
            color: '#cbc4d2',
            font: { size: 11 },
            callback: (v) => `${v} ms`,
          },
        },
      },
    };

    return { data, options };
  }, [timeline, range, prefersReducedMotion]);

  if (!timeline || timeline.length === 0) return null;

  if (timeline.length === 1) {
    const singlePoint = timeline[0];
    const firstValidLatency = singlePoint.was_online ? singlePoint.latencia_promedio : null;
    return (
      <div style={styles.container} className="magic-glow-card">
        <h3 style={styles.title}>Histórico de Latencia</h3>
        <div style={styles.firstDataBox}>
          <span style={styles.firstDataIcon}>{'\uD83D\uDCC8'}</span>
          <p style={styles.firstDataText}>Esperando más datos para mostrar el gráfico.</p>
          <p style={styles.firstDataValue}>
            {firstValidLatency != null ? `${firstValidLatency} ms` : 'Sin respuesta'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="magic-glow-card">
      <div style={styles.header}>
        <h3 style={styles.title}>Histórico de Latencia</h3>
        <button onClick={resetZoom} style={styles.resetBtn} aria-label="Reset zoom" title="Reset zoom (Esc)">
          Reset Zoom
        </button>
      </div>
      <div style={styles.chartWrapper}>
        <Line ref={chartRef} data={data} options={options} />
      </div>
      {range && (
        <div style={styles.rangeHint}>
          Rango: {range}  ·  {timeline.length} buckets  ·  Shift+rueda para zoom, Shift+arrastrar para pan
        </div>
      )}
    </div>
  );
});

const styles = {
  container: {
    backgroundColor: 'var(--db-bg-card)',
    border: '1px solid var(--db-border-card)',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    color: 'var(--auth-on-surface)',
    fontWeight: '600',
  },
  resetBtn: {
    padding: '4px 12px',
    backgroundColor: 'var(--db-surface-container-high)',
    border: '1px solid var(--db-border-card)',
    borderRadius: '6px',
    color: 'var(--auth-on-surface-variant)',
    fontSize: '11px',
    fontWeight: '600',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  chartWrapper: {
    position: 'relative',
    height: '240px',
  },
  rangeHint: {
    marginTop: '10px',
    fontSize: '11px',
    color: 'var(--auth-on-surface-variant)',
    textAlign: 'center',
    opacity: 0.7,
  },
  firstDataBox: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  firstDataIcon: {
    fontSize: '32px',
    display: 'block',
    marginBottom: '12px',
  },
  firstDataText: {
    fontSize: '14px',
    color: 'var(--auth-on-surface-variant)',
    margin: '0 0 16px 0',
  },
  firstDataValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'var(--auth-on-surface)',
    margin: 0,
  },
};
