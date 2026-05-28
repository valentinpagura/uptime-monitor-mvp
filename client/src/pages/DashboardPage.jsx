import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function DashboardPage() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Dashboard de Monitoreo</h1>
        <button
          onClick={logout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          Salir
        </button>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h2>¡Bienvenido, {user?.email}!</h2>
        <p>Aquí irá la lista de sitios a monitorear.</p>
        <p>(Próximas tareas: SitioCard, CreateSitioForm, etc.)</p>
      </div>
    </div>
  );
}
