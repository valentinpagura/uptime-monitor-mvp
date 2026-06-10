export function LatencyGauge({ latencia, max = 500 }) {
  // Calcular el ángulo de la aguja (0-180 grados)
  const angle = (latencia / max) * 180;

  // Determinar color según latencia
  let color;
  if (latencia < 200) color = '#28a745'; // Verde
  else if (latencia < 400) color = '#ffc107'; // Naranja
  else color = '#dc3545'; // Rojo

  return (
    <div style={styles.container}>
      <svg viewBox="0 0 200 120" style={styles.svg}>
        {/* Arco de fondo */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          stroke="#e0e0e0"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />

        {/* Arco de progreso (coloreado) */}
        <path
          d={`M 20 100 A 80 80 0 0 1 ${20 + 160 * (latencia / max)} ${
            100 - 80 * Math.sin((latencia / max) * Math.PI)
          }`}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />

        {/* Aguja */}
        <g transform={`rotate(${angle} 100 100)`}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke={color}
            strokeWidth="3"
          />
          <circle cx="100" cy="100" r="4" fill={color} />
        </g>

        {/* Etiquetas (0, 250, 500) */}
        <text x="20" y="115" fontSize="12" textAnchor="middle" fill="#666">
          0
        </text>
        <text x="100" y="115" fontSize="12" textAnchor="middle" fill="#666">
          {max / 2}
        </text>
        <text x="180" y="115" fontSize="12" textAnchor="middle" fill="#666">
          {max}
        </text>
      </svg>

      {/* Valor central */}
      <div style={styles.valueBox}>
        <span style={{ ...styles.latenciaValue, color }}>
          {latencia}
        </span>
        <span style={styles.latenciaUnit}>ms</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: '300px',
    margin: '0 auto',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },

  svg: {
    width: '100%',
    height: 'auto',
  },

  valueBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    zIndex: 10,
  },

  latenciaValue: {
    display: 'block',
    fontSize: '32px',
    fontWeight: 'bold',
  },

  latenciaUnit: {
    display: 'block',
    fontSize: '12px',
    color: '#999',
    fontWeight: '500',
  },
};