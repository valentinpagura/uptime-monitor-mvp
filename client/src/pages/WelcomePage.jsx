import { useContext } from 'react';
import DarkVeil from '../components/DarkVeil';
import '../components/DarkVeil.css';
import { AuthContext } from '../contexts/AuthContext';

export function WelcomePage({ onLoginClick, onRegisterClick }) {
  const { user } = useContext(AuthContext);

  if (user) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.darkveilLayer}>
        <DarkVeil speed={1.6} />
      </div>
      <div style={styles.overlay}></div>

      <div style={styles.content}>
        <div style={styles.logoContainer}>
          <span style={styles.logo}>📊</span>
          <span style={styles.logoText}>Uptime Monitor</span>
        </div>

        <h1 style={styles.title}>Monitorea la disponibilidad de tus sitios</h1>

        <p style={styles.subtitle}>
          Obtén visibilidad en tiempo real del estado de tus servicios web.
          Detecta problemas antes que tus usuarios.
        </p>

        <div style={styles.buttonContainer}>
          <button
            onClick={onRegisterClick}
            className="welcome-btn-primary"
            style={styles.buttonPrimary}
          >
            Comenzar Ahora
          </button>
          <button
            onClick={onLoginClick}
            className="welcome-btn-secondary"
            style={styles.buttonSecondary}
          >
            Tengo una cuenta
          </button>
        </div>

        <div style={styles.features}>
          <div className="welcome-card" style={styles.featureCard}>
            <span style={styles.featureIcon}>⚡</span>
            <h3 style={styles.featureTitle}>Monitoreo en Tiempo Real</h3>
            <p style={styles.featureText}>Verifica el estado de tus URLs constantemente</p>
          </div>
          <div className="welcome-card" style={styles.featureCard}>
            <span style={styles.featureIcon}>📈</span>
            <h3 style={styles.featureTitle}>Análisis Detallado</h3>
            <p style={styles.featureText}>Gráficos e históricos de disponibilidad</p>
          </div>
          <div className="welcome-card" style={styles.featureCard}>
            <span style={styles.featureIcon}>🔔</span>
            <h3 style={styles.featureTitle}>Alertas Inteligentes</h3>
            <p style={styles.featureText}>Notificaciones cuando algo falla</p>
          </div>
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
    backgroundColor: '#0a0e17',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  darkveilLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    background: 'radial-gradient(ellipse at 50% 40%, rgba(10,14,23,0.0) 0%, rgba(10,14,23,0.12) 65%, rgba(10,14,23,0.3) 100%)',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '48px 20px 40px',
    color: '#fff',
    textAlign: 'center',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '32px',
  },
  logo: {
    fontSize: '20px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(207, 188, 255, 0.08)',
    borderRadius: '8px',
  },
  logoText: {
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '-0.2px',
    color: 'rgba(255,255,255,0.85)',
  },
  title: {
    fontSize: 'clamp(28px, 4.5vw, 52px)',
    fontWeight: '800',
    lineHeight: '1.1',
    margin: '0 0 12px 0',
    maxWidth: '720px',
    background: 'linear-gradient(135deg, #cfbcff 0%, #6750a4 50%, #e7c365 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: 'clamp(14px, 2vw, 18px)',
    fontWeight: '300',
    margin: '0 0 28px 0',
    opacity: 0.8,
    lineHeight: '1.7',
    maxWidth: '480px',
    letterSpacing: '0.2px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '44px',
  },
  buttonPrimary: {
    padding: '11px 30px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #cfbcff 0%, #6750a4 100%)',
    color: '#ffffff',
    transition: 'all 0.3s ease',
    minWidth: '170px',
    fontFamily: 'inherit',
    boxShadow: '0 4px 16px rgba(207, 188, 255, 0.2)',
    willChange: 'transform',
  },
  buttonSecondary: {
    padding: '11px 30px',
    fontSize: '14px',
    fontWeight: '600',
    border: '1.5px solid rgba(207, 188, 255, 0.3)',
    borderRadius: '9999px',
    cursor: 'pointer',
    background: 'transparent',
    color: '#cfbcff',
    transition: 'all 0.3s ease',
    minWidth: '170px',
    fontFamily: 'inherit',
    willChange: 'transform',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px',
    maxWidth: '720px',
    width: '100%',
    marginBottom: '36px',
  },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: '22px 20px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'default',
  },
  featureIcon: {
    fontSize: '24px',
    display: 'block',
    marginBottom: '10px',
  },
  featureTitle: {
    fontSize: '15px',
    fontWeight: '600',
    margin: '0 0 6px 0',
    color: 'rgba(255,255,255,0.95)',
  },
  featureText: {
    fontSize: '12px',
    margin: 0,
    opacity: 0.65,
    lineHeight: '1.5',
  },
  footer: {},
  footerText: {
    fontSize: '11px',
    margin: 0,
    opacity: 0.4,
  },
};
