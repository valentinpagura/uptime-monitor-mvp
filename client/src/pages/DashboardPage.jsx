import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getSitios } from '../services/api';
import { CreateSitioForm } from '../components/Forms/CreateSitioForm';
import { Navbar } from '../components/Navbar';
import { SitioDetailPage } from './SitioDetailPage';

export function DashboardPage() {
  const { user, token } = useContext(AuthContext);
  const [sitios, setSitios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null);

  // Auto-refresh cada 10 segundos
  useEffect(() => {
    loadSitios();

    const interval = setInterval(() => {
      loadSitios();
    }, 10000);

    return () => clearInterval(interval);
  }, [token]);

  async function loadSitios() {
    try {
      const data = await getSitios(token);
      setSitios(data.sitios || []);
    } catch (err) {
      console.error('Error cargando sitios:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(sitioId) {
    // Eliminar sitio
    try {
      await fetch(`http://localhost:5000/sitios/${sitioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      loadSitios();
    } catch (err) {
      console.error('Error eliminando sitio:', err);
    }
  }

  // Si hay un sitio seleccionado, mostrar detalle
  if (sitioSeleccionado) {
    return (
      <SitioDetailPage
        sitioId={sitioSeleccionado}
        onBack={() => setSitioSeleccionado(null)}
      />
    );
  }

  // Lista de sitios
  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.title}>Dashboard de Monitoreo</h1>
        <p style={styles.subtitle}>Bienvenido, {user?.email}</p>

        {/* Formulario para agregar sitio */}
        <div style={styles.formSection}>
          <CreateSitioForm onSitioCreated={loadSitios} />
        </div>

        {/* Tabla de sitios */}
        <div style={styles.tableSection}>
          <h2 style={styles.sectionTitle}>
            Sitios Monitoreados ({sitios.length})
          </h2>

          {loading ? (
            <p style={styles.loading}>Cargando sitios...</p>
          ) : sitios.length === 0 ? (
            <p style={styles.empty}>
              📭 No hay sitios. Ingresa una URL arriba para comenzar.
            </p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={styles.th}>Sitio</th>
                    <th style={styles.th}>URL</th>
                    <th style={styles.th}>Frecuencia</th>
                    <th style={styles.th}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {sitios.map((sitio) => (
                    <tr
                      key={sitio.id}
                      style={styles.row}
                      onClick={() => setSitioSeleccionado(sitio.id)}
                    >
                      <td style={styles.td}>
                        <strong>{sitio.nombre || sitio.url}</strong>
                      </td>
                      <td style={styles.td}>{sitio.url}</td>
                      <td style={styles.td}>{sitio.frecuencia_minutos} min</td>
                      <td style={styles.td}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('¿Eliminar sitio?')) {
                              handleDelete(sitio.id);
                            }
                          }}
                          style={styles.deleteBtn}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },

  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '30px 20px',
  },

  title: {
    fontSize: '28px',
    color: '#1e1e2e',
    margin: '0 0 8px 0',
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 30px 0',
  },

  formSection: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },

  tableSection: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },

  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    color: '#1e1e2e',
    fontWeight: '600',
  },

  loading: {
    textAlign: 'center',
    color: '#666',
    padding: '20px 0',
  },

  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '20px 0',
    fontStyle: 'italic',
  },

  tableWrapper: {
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  headerRow: {
    backgroundColor: '#f5f5f5',
  },

  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    borderBottom: '1px solid #e0e0e0',
  },

  row: {
    borderBottom: '1px solid #e0e0e0',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },

  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#1e1e2e',
  },

  deleteBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
};