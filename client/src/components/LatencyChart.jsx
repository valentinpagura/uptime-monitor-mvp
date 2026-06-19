import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export function LatencyChart({ logs }) {
  const hasData = logs && logs.length > 0;
  const sorted = hasData ? [...logs].reverse() : [];

  const data = hasData ? {
    labels: sorted.map((log) =>
      new Date(log.created_at).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    ),
    datasets: [
      {
        label: 'Latency (ms)',
        data: sorted.map((log) => log.latencia_ms || 0),
        borderColor: 'var(--brand-primary)',
        borderWidth: 2,
        backgroundColor: (context) => {
          if (!context.chart?.ctx) return 'rgba(102, 126, 234, 0.15)';
          const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(102, 126, 234, 0.2)');
          gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.35,
        pointRadius: sorted.map((_, i) => (i === sorted.length - 1 ? 5 : 0)),
        pointHoverRadius: 7,
        pointBackgroundColor: sorted.map((_, i) =>
          i === sorted.length - 1 ? 'var(--brand-primary)' : 'transparent'
        ),
        pointBorderColor: sorted.map((_, i) =>
          i === sorted.length - 1 ? 'var(--bg-surface)' : 'transparent'
        ),
        pointBorderWidth: 2,
        pointHitRadius: 10,
      },
    ],
  } : null;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 12, family: "'JetBrains Mono', monospace" },
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 11, weight: '500' },
          maxTicksLimit: 8,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(51, 65, 85, 0.5)',
          lineWidth: 1,
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          stepSize: 100,
          callback: (value) => `${value}ms`,
        },
      },
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Latency History</h3>
        {hasData && (
          <span style={styles.count}>{logs.length} checks</span>
        )}
      </div>
      <div style={styles.chartWrapper}>
        {hasData ? (
          <Line data={data} options={options} />
        ) : (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📈</span>
            <p style={styles.emptyText}>No latency data yet</p>
            <p style={styles.emptyHint}>Data will appear after the first check completes</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-5) var(--space-6)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-5)',
  },
  title: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  count: {
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    fontWeight: '500',
  },
  chartWrapper: {
    height: '220px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '6px',
  },
  emptyIcon: {
    fontSize: '28px',
    opacity: 0.3,
    marginBottom: '4px',
  },
  emptyText: {
    fontSize: '13px',
    color: 'var(--text-tertiary)',
    fontWeight: 500,
    margin: 0,
  },
  emptyHint: {
    fontSize: '11px',
    color: 'var(--text-disabled)',
    margin: 0,
  },
};
