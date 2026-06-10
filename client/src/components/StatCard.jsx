export function StatCard({ title, value, unit, color, icon }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.icon}>{icon}</span>
        <h3 style={styles.title}>{title}</h3>
      </div>
      
      <div style={styles.value}>
        <span style={{ ...styles.number, color }}>{value}</span>
        <span style={styles.unit}>{unit}</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    minWidth: '200px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },

  icon: {
    fontSize: '20px',
  },

  title: {
    margin: 0,
    fontSize: '12px',
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  value: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '4px',
  },

  number: {
    fontSize: '28px',
    fontWeight: 'bold',
  },

  unit: {
    fontSize: '12px',
    color: '#999',
    fontWeight: '500',
  },
};