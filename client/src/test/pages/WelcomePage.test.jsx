import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthContext } from '../../contexts/AuthContext';
import { WelcomePage } from '../../pages/WelcomePage';

vi.mock('../../components/DarkVeil', () => ({
  default: () => <div data-testid="mock-darkveil" />,
}));

function renderPage({ user = null, onLoginClick = vi.fn(), onRegisterClick = vi.fn() } = {}) {
  return render(
    <AuthContext.Provider value={{ user }}>
      <WelcomePage onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />
    </AuthContext.Provider>,
  );
}

describe('WelcomePage', () => {
  it('renders CTA content when user is null', () => {
    renderPage();
    expect(screen.getByText('Comenzar Ahora')).toBeInTheDocument();
    expect(screen.getByText('Tengo una cuenta')).toBeInTheDocument();
  });

  it('returns null when user is logged in', () => {
    const { container } = renderPage({ user: { id: 1, email: 'a@b.com' } });
    expect(container.innerHTML).toBe('');
  });

  it('renders the main title', () => {
    renderPage();
    expect(screen.getByText(/Monitorea la disponibilidad/)).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderPage();
    expect(screen.getByText(/Obtén visibilidad en tiempo real/)).toBeInTheDocument();
  });

  it('calls onRegisterClick when Comenzar Ahora is clicked', () => {
    const onRegisterClick = vi.fn();
    renderPage({ onRegisterClick });
    fireEvent.click(screen.getByText('Comenzar Ahora'));
    expect(onRegisterClick).toHaveBeenCalledTimes(1);
  });

  it('calls onLoginClick when Tengo una cuenta is clicked', () => {
    const onLoginClick = vi.fn();
    renderPage({ onLoginClick });
    fireEvent.click(screen.getByText('Tengo una cuenta'));
    expect(onLoginClick).toHaveBeenCalledTimes(1);
  });

  it('renders feature cards', () => {
    renderPage();
    expect(screen.getByText('Monitoreo en Tiempo Real')).toBeInTheDocument();
    expect(screen.getByText('Análisis Detallado')).toBeInTheDocument();
    expect(screen.getByText('Alertas Inteligentes')).toBeInTheDocument();
  });

  it('renders logo section', () => {
    renderPage();
    expect(screen.getByText('Uptime Monitor')).toBeInTheDocument();
  });

  it('renders DarkVeil background', () => {
    renderPage();
    expect(screen.getByTestId('mock-darkveil')).toBeInTheDocument();
  });

  it('renders footer with copyright', () => {
    renderPage();
    expect(screen.getByText(/2025 Uptime Monitor/)).toBeInTheDocument();
  });
});
