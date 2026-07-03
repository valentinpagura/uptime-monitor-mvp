import { Component } from 'react';
import { logError } from '../utils/logger';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logError(error, { componentStack: errorInfo?.componentStack });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <span style={styles.icon}>{'\u26A0\uFE0F'}</span>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.message}>
              An unexpected error occurred. You can try reloading or return to
              the dashboard.
            </p>
            <div style={styles.actions}>
              <button onClick={this.handleReset} style={styles.primaryBtn}>
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={styles.secondaryBtn}
              >
                Reload Page
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.detailsSummary}>Error details</summary>
                <pre style={styles.detailsPre}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0a0e17',
    padding: '20px',
  },
  card: {
    backgroundColor: '#131825',
    border: '1px solid #232b3e',
    borderRadius: '12px',
    padding: '48px 32px',
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
  },
  icon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '16px',
  },
  title: {
    margin: '0 0 12px',
    fontSize: '24px',
    fontWeight: 700,
    color: '#e6e0e9',
  },
  message: {
    margin: '0 0 32px',
    fontSize: '15px',
    color: '#cbc4d2',
    lineHeight: 1.6,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    padding: '12px 28px',
    borderRadius: '9999px',
    border: 'none',
    background: 'linear-gradient(135deg, #cfbcff 0%, #6750a4 100%)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity 0.2s',
  },
  secondaryBtn: {
    padding: '12px 28px',
    borderRadius: '9999px',
    border: '1px solid #494551',
    background: 'transparent',
    color: '#e6e0e9',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background-color 0.2s',
  },
  details: {
    marginTop: '24px',
    textAlign: 'left',
  },
  detailsSummary: {
    color: '#cbc4d2',
    fontSize: '13px',
    cursor: 'pointer',
    marginBottom: '8px',
  },
  detailsPre: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#ff6b6b',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
  },
};
