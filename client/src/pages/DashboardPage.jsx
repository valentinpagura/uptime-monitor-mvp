import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { CreateSitioForm } from '../components/Forms/CreateSitioForm';
import { SitioCard } from '../components/SitioCard';
import { getSitios, deleteSitio } from '../services/api';

export function DashboardPage() {
  const { user, token } = useContext(AuthContext);
  const [sitios, setSitios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadSitios() {
    setLoading(true);
    setError(null);
    try {
      const data = await getSitios(token);
      setSitios(data.sitios || []);
    } catch (err) {
      setError('Error cargando sitios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  loadSitios();
  
  // Auto-refresh cada 10 segundos
  const interval = setInterval(() => {
    loadSitios();
  }, 10000);  // 10 segundos
  
  return () => clearInterval(interval);  // Limpiar interval al desmontar
}, [token]);

  async function handleDelete(sitioId) {
    try {
      await deleteSitio(sitioId, token);
      loadSitios();
    } catch (err) {
      setError('Error eliminando sitio');
      console.error(err);
    }
  }

  return (
    <div style={styles.container}>
      <Navbar />

      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Dashboard de Monitoreo</h1>
          <p style={styles.subtitle}>Bienvenido, {user?.email}</p>
        </div>

        <CreateSitioForm onSitioCreated={loadSitios} />

        <div>
          <h2 style={styles.sectionTitle}>
            Sitios Monitoreados ({sitios.length})
          </h2>

          {error && <p style={styles.error}>{error}</p>}

          {loading ? (
            <p style={styles.loading}>Cargando sitios...</p>
          ) : sitios.length === 0 ? (
            <p style={styles.empty}>No tienes sitios aún. Crea uno arriba.</p>
          ) : (
            sitios.map(sitio => (
              <SitioCard 
                key={sitio.id} 
                sitio={sitio} 
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e1e2e',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e1e2e',
    marginBottom: '16px',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  loading: {
    color: '#666',
    fontSize: '14px',
  },
  empty: {
    color: '#999',
    fontSize: '14px',
    fontStyle: 'italic',
  },
};