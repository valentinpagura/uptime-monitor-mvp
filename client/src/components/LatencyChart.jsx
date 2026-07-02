import { memo, useMemo } from 'react';
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

const referenceLinePlugin = {
  id: 'referenceLines',
  afterDraw(chart) {
    const {
      ctx,
      chartArea: { top, bottom, left, right },
      scales: { y },
    } = chart;
    if (!y) return;

    function drawLine(yValue, color, label) {
      const yPos = y.getPixelForValue(yValue);
      if (yPos < top || yPos > bottom) return;

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.moveTo(left, yPos);
      ctx.lineTo(right, yPos);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = color;
      ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(label, right - 4, yPos - 2);
      ctx.restore();
    }

    drawLine(200, 'rgba(74, 222, 128, 0.4)', '200ms');
    drawLine(400, 'rgba(255, 107, 107, 0.4)', '400ms');
  },
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  referenceLinePlugin
);

export const LatencyChart = memo(function LatencyChart({ logs }) {
  const sorted = useMemo(() => logs.slice().reverse(), [logs]);

  const data = {
    labels: sorted.map((log) =>
      new Date(log.created_at).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    ),
    datasets: [
      {
        label: 'Latencia (ms)',
        data: sorted.map((log) => log.latencia_ms ?? null),
        borderColor: '#cfbcff',
        backgroundColor: 'rgba(207, 188, 255, 0.08)',
        tension: 0.15,
        pointBackgroundColor: '#cfbcff',
        pointRadius: (ctx) => (ctx.parsed.y != null ? 3 : 0),
        pointHoverRadius: 5,
        spanGaps: false,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1d1b20',
        titleColor: '#e6e0e9',
        bodyColor: '#cbc4d2',
        borderColor: '#494551',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title(items) {
            if (!items.length) return '';
            const idx = items[0].dataIndex;
            const log = sorted[idx];
            return log ? new Date(log.created_at).toLocaleString('es-AR') : '';
          },
          label(item) {
            if (item.parsed.y == null) return 'Offline \u2014 Sin respuesta';
            return `Online \u00B7 ${item.parsed.y} ms`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: { color: '#cbc4d2', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: { color: '#cbc4d2', font: { size: 11 }, callback: (v) => `${v} ms` },
      },
    },
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Histórico de Latencia</h3>
      <div style={styles.chartWrapper}>
        <Line data={data} options={options} />
      </div>
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
  title: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: 'var(--auth-on-surface)',
    fontWeight: '600',
  },
  chartWrapper: {
    position: 'relative',
    height: '220px',
  },
};
