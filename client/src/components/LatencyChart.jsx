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
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },

  title: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: '#1e1e2e',
    fontWeight: '600',
  },
};