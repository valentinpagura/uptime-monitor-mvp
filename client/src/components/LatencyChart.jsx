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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function LatencyChart({ logs }) {
  const data = {
    labels: logs
      .slice()
      .reverse()
      .map((log) =>
        new Date(log.created_at).toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      ),
    datasets: [
      {
        label: 'Latencia (ms)',
        data: logs.slice().reverse().map((log) => log.latencia_ms || 0),
        borderColor: '#cfbcff',
        backgroundColor: 'rgba(207, 188, 255, 0.1)',
        tension: 0.1,
        pointBackgroundColor: '#cfbcff',
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#cbc4d2',
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#1d1b20',
        titleColor: '#e6e0e9',
        bodyColor: '#cbc4d2',
        borderColor: '#494551',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
        ticks: { color: '#cbc4d2', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
        ticks: { color: '#cbc4d2', font: { size: 11 } },
      },
    },
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Histórico de Latencia</h3>
      <Line data={data} options={options} />
    </div>
  );
}

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
};
