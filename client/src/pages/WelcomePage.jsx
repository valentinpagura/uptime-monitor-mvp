import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function WelcomePage({ onLoginClick, onRegisterClick }) {
  const { user } = useContext(AuthContext);

  if (user) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.gradient}></div>

      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <div style={styles.logo}>📊</div>
            <h1 style={styles.logoText}>Uptime Monitor</h1>
          </div>
        </div>

        <div style={styles.description}>
          <h2 style={styles.title}>Monitorea la disponibilidad de tus sitios</h2>
          <p style={styles.subtitle}>
            Obtén visibilidad en tiempo real del estado de tus servicios web. 
            Detecta problemas antes que tus usuarios.
          </p>
        </div>

        <div style={styles.features}>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>⚡</span>
            <h3 style={styles.featureTitle}>Monitoreo en Tiempo Real</h3>
            <p style={styles.featureText}>Verifica el estado de tus URLs constantemente</p>
          </div>

          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>📈</span>
            <h3 style={styles.featureTitle}>Análisis Detallado</h3>
            <p style={styles.featureText}>Gráficos e históricos de disponibilidad</p>
          </div>

          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>🔔</span>
            <h3 style={styles.featureTitle}>Alertas Inteligentes</h3>
            <p style={styles.featureText}>Notificaciones cuando algo falla</p>
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <button 
            onClick={onRegisterClick}
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Comenzar Ahora
          </button>

          <button 
            onClick={onLoginClick}
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Tengo una cuenta
          </button>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>© 2025 Uptime Monitor. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
    zIndex: 1,
  },
  content: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#fff',
    textAlign: 'center',
    padding: '20px',
  },
  header: {
    marginBottom: '40px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
  },
  logo: {
    fontSize: '48px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
  },
  logoText: {
    fontSize: '36px',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '-0.5px',
    textShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  description: {
    maxWidth: '600px',
    marginBottom: '50px',
  },
  title: {
    fontSize: '48px',
    fontWeight: '700',
    margin: '0 0 16px 0',
    lineHeight: '1.2',
    textShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  subtitle: {
    fontSize: '18px',
    fontWeight: '300',
    margin: 0,
    opacity: 0.95,
    lineHeight: '1.6',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    maxWidth: '900px',
    width: '100%',
    marginBottom: '50px',
  },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
    cursor: 'default',
  },
  featureIcon: {
    fontSize: '32px',
    display: 'block',
    marginBottom: '12px',
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  featureText: {
    fontSize: '14px',
    margin: 0,
    opacity: 0.9,
    lineHeight: '1.5',
  },
  buttonContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '60px',
  },
  button: {
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  buttonPrimary: {
    background: '#fff',
    color: '#667eea',
    minWidth: '200px',
  },
  buttonSecondary: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    border: '2px solid #fff',
    minWidth: '200px',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: '30px',
  },
  footerText: {
    fontSize: '14px',
    margin: 0,
    opacity: 0.8,
  },
};